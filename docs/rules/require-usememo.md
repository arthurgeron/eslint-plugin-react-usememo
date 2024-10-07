# Rule: require-usememo

This rule requires complex values (objects, arrays, functions, and JSX) that get passed as props or referenced as a hook dependency to be wrapped in `useMemo()` or `useCallback()`.

Not only does this rule enforce performance optimization practices, but it also comes with an **amazing autofix functionality**. It intelligently wraps necessary components with `useMemo()` or `useCallback()`, which results in a more efficient code and saves developers valuable time.

This rule aims to ensure that calculations are not performed more often than necessary and a component's tree only recalculates or renders again when absolutely required. This controls expensive expressions and enhances your application's scalability and performance.

## Options 

The rule takes an optional object:

```json
"rules": {
    "@arthurgeron/react-usememo/require-usememo": [2, {
      "strict": true,
      "checkHookReturnObject": true,
      "fix": { "addImports": true },
      "checkHookCalls": true,
      "ignoredHookCallsNames": { "useStateManagement": false },
      "ignoredPropNames": ["style"]
    }],
}
```

Here is what each option means:

- `{strict: true}`: Fails even in cases where it is difficult to determine if the value in question is a primitive (string or number) or a complex value (object, array, etc.).

- `{checkHookReturnObject: true}`: Requires Object Expressions passed in return statements. 

- `{checkHookCalls: true}`: Requires objects/data passed to a non-native/Custom hook to be memoized.

- `{ignoredHookCallsNames: Record<string, boolean>}`: This allows you to add specific hook names, thereby individually disabling or enabling them to be checked when used. Matching names with a `true` value will cause the checks to be ignored.   
You can use strict 1:1 comparisons (e.g., `"useCustomHook"`) or employ Minimatch's Glob Pattern (e.g., `"useState*"`).
  > React's [use](https://react.dev/reference/react/use) hook is ignored here by default, while triggering async calls dinamically losely within a component's render cycle is bad, it does not affect the overall "performance" or behavior of the hook itself. This can be disabled with a `"use": true` entry.   
  
  > For more information on Minimatch, refer to its README [here](https://www.npmjs.com/package/minimatch). You may also find this [cheatsheet](https://github.com/motemen/minimatch-cheat-sheet) useful.

  > If no strict names match and you have entries with Glob syntax, the algorithm will stop at the first match.


- `fix`: Contains rules that only apply during eslint's fix routine.

  - `addImports`: Creates imports for useMemo and useCallback when one or both are added by this rule. Will increment to a existing import declaration or create a new one. Setting this to false disables it, defaults to true.

- `ignoredPropNames`: This allows you to add specific prop name, thereby disabling them to be checked when used.

## Autofix Examples (Function Components & Hooks only)

To illustrate the autofix feature in action, below are some examples with input code and the corresponding fixed output:

#### Example 1
Input:
```jsx
const Component = () => {
  return <Child userData={() => {}} />;
}
```
Fixed output:
```jsx
import { useCallback } from 'react';

const Component = () => {
  const userData = useCallback(() => ({}), []);
  return <Child userData={userData} />;
}
```

> If an expression is unnamed, it adopts the name of the property. Plus, it scans the scope to make sure the naming doesn't conflict with any existing variables. You can find more examples in our [tests](https://github.com/arthurgeron/eslint-plugin-react-usememo/__tests__/require-usememo.test.ts).   

> Imports for useMemo and useCallback are created, if necessary. Can be disabled with option `{ fix: { addImports: false } }`

#### Example 2
Input:
```jsx
const Component = () => {
  const myObject = {};
  return <Child prop={myObject} />;
}
```
Fixed output:
```jsx
import { useMemo } from 'react';

const Component = () => {
  const myObject = useMemo(() => ({}), []);
  return <Child prop={myObject} />;
}
```

#### Example 3
Input:
```jsx
const Component = () => {
  const myArray = [];
  return <Child prop={myArray} />;
}
```
Fixed output:
```jsx
import { useMemo } from 'react';

const Component = () => {
  const myArray = useMemo(() => [], []);
  return <Child prop={myArray} />;
}
```

#### Example 4
Input:
```jsx
const Component = () => {
  const myInstance = new Object();
  return <Child prop={myInstance} />;
}
```
Fixed output:
```jsx
import { useMemo } from 'react';

const Component = () => {
  const myInstance = useMemo(() => new Object(), []);
  return <Child prop={myInstance} />;
}
```

> For all the example scenarios provided above, please check [`this guide`](https://github.com/arthurgeron/eslint-plugin-react-usememo/blob/main/docs/rules/require-usememo.md).
 

Absolutely! Here are examples illustrating incorrect and correct application of the `require-usememo` rule.

## Incorrect Code Examples

### Function Components 

The function defined within a component is re-declared on each render which can lead to undesirable side effects or unnecessary render cycles.

```js
function MyComponent() {
  const myObject = {}; // This object is re-created on each render
  const myArray = []; // This array is re-created on each render
  
  return <ChildComponent prop1={myObject} prop2={myArray} />;
}
```

### Hooks 

Objects defined within a hook will be re-declared on each render, which will cause undesirable side effects for other hooks and components using these objects.

```js
function useData() {
  const myObject = {}; // This object is re-created on each render
  const myArray = []; // This array is re-created on each render
  
  return return {myObject, myArray};
}
```

### Class Components

Each time `render()` is called, a new object (or array or class instance) is created. A better approach would be to have this object created once and reused.

```js
class MyClassComponent extends React.Component {
  render() {
    const myObject = {}; // This object is re-created on each render
    return <ChildComponent prop={myObject} />;
  }
}
```

## Correct Code Examples

### Function Components

Below, all the potentially mutable objects are wrapped with `useMemo`, so they aren't re-created on each render.

```js
import { useMemo } from 'react';

function MyComponent() {
  const myObject = useMemo(() => ({}), []);
  const myArray = useMemo(() => [], []);

  return <ChildComponent prop1={myObject} prop2={myArray} />;
}
```

### Hooks 

Below, all the potentially mutable objects are wrapped with `useMemo`, so they aren't re-created on each render.

```js
function useData() {
  const myObject = useMemo(() => ({}), []);
  const myArray = useMemo(() => [], []);
  
  return return {myObject, myArray};
}
```

### Class Components

Here, we're storing our object in the component's state. This ensures the new object isn't re-created every time the component is rendered.

```js
class MyClassComponent extends React.Component {
  constructor() {
    this.state = {
      myObject: {}
    }
  }
  render() {
    return <ChildComponent prop={this.state.myObject} />;
  }
}
```

Another example showing how to properly modify a incoming prop only when the reference changes, instead of changing it every render.

```js
function getUserIdsInfo (users) {
  return users.reduce((acc, userData, index) => {
    const id = userData.id;
    const isFirstPosition = !index;
    acc.ids.push(id);
    acc.joinedKeys += isFirstPosition ? id : `,${id}`;
    return acc;
  }, { joinedKeys: '', ids: [] });
}

class MyClassComponent extends React.Component {
  constructor(props) {
    super(props);
    const { joinedKeys, ids: userIds } = getUserIdsInfo(props.users);

    this.state = {
      userIds,
      joinedKeys,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {

    // Not optimal to do reduce every prop/state change
    // Optimally there'd be an "if" statement here to check if the prop we care about has changed, avoiding the reduce.
    // This is only an example
      const { joinedKeys, ids: userIds } = getUserIdsInfo(nextProps.users);

      if (joinedKeys !== prevState.joinedKeys) {
        return {
          userIds,
          joinedKeys,
        };
      }
    // Return null to indicate no change to state
    return null;
  }

  render() {
    // Reference to object wont change between renders, will only update when incoming prop 'users' changes.
    const { userIds } = this.state;
    return <ChildComponent prop={this.state.userIds} />;
  }
}
```

> For more examples and detailed explanation, refer to the eslint-plugin-react-usememo [readme](https://github.com/arthurgeron/eslint-plugin-react-usememo).