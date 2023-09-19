# Rule: require-usememo

This rule requires complex values (objects, arrays, functions, and JSX) that get passed as props or referenced as a hook dependency to be wrapped in `React.useMemo()` or `useCallback()`.

Not only does this rule enforce performance optimization practices, but it also comes with an **amazing autofix functionality**. It intelligently wraps necessary components with `useMemo()` or `useCallback()`, which results in a more efficient code and saves developers valuable time.

This rule aims to ensure that calculations are not performed more often than necessary and a component's tree only recalculates or renders again when absolutely required. This controls expensive expressions and enhances your application's scalability and performance.

## Options 

The rule takes an optional object:

```json
"rules": {
    "@arthurgeron/react-usememo/require-usememo": [2, {
      "strict": true,
      "checkHookReturnObject": true,
      "checkHookCalls": true,
      "ignoredHookCallsNames": {"useStateManagement": false},
    }],
}
```

Here is what each option means:

1. `{strict: true}` Fails even in cases where it is difficult to determine if the value in question is a primitive (string or number) or a complex value (object, array, etc.).

2. `{checkHookReturnObject: true}` Requires Object Expressions passed in return statements. 

3. `{checkHookCalls: true}` Requires objects/data passed to a non-native/Custom hook to be memoized.

4. `{ignoredHookCallsNames: Record<string, boolean>}` Enable you to add specific hooks names here, individually disabling or enabling them to be checked when used.

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
const Component = () => {
  const userData = React.useCallback(() => ({}), []);
  return <Child userData={userData} />;
}
```

> If an expression is unnamed, it adopts the name of the property. Plus, it scans the scope to make sure the naming doesn't conflict with any existing variables. You can find more examples in our [tests](https://github.com/arthurgeron/eslint-plugin-react-usememo/__tests__/require-usememo.test.ts).

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
const Component = () => {
  const myObject = React.useMemo(() => ({}), []);
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
const Component = () => {
  const myArray = React.useMemo(() => [], []);
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
const Component = () => {
  const myInstance = React.useMemo(() => new Object(), []);
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

Below, all the potentially mutable objects are wrapped with `React.useMemo`, so they aren't re-created on each render.

```js
function MyComponent() {
  const myObject = React.useMemo(() => ({}), []);
  const myArray = React.useMemo(() => [], []);

  return <ChildComponent prop1={myObject} prop2={myArray} />;
}
```

### Hooks 

Below, all the potentially mutable objects are wrapped with `React.useMemo`, so they aren't re-created on each render.

```js
function useData() {
  const myObject = React.useMemo(() => ({}), []);
  const myArray = React.useMemo(() => [], []);
  
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


> For more examples and detailed explanation, refer to the eslint-plugin-react-usememo [readme](https://github.com/arthurgeron/eslint-plugin-react-usememo).