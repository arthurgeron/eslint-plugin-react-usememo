# Rule: require-memo

This rule enforces the use of `memo()` on function components. The objective is to optimize your component re-renders and avoid unnecessary render cycles when your component's props do not change.

## Rationale 

React’s rendering behavior ensures that whenever the parent component renders, the child component instances are re-rendered as well. When dealing with expensive computations or components, this could lead to performance issues. `memo()` is a higher order component which tells React to skip rendering the component if its props have not changed.

When `memo()` wraps an exported component, then it will only re-render if the current and next props are not shallowly equal.

```jsx
function MyComponent(props) {  /* ... */  }

export default memo(MyComponent);
```

This rule applies to function components, not class-based components as they should extend `React.PureComponent` or must implement `shouldComponentUpdate` lifecycle method for similar optimization.

## Rule Details
This rule will enforce that all function components are wrapped in `memo()`.  
Only exported components are validated.

## Incorrect Code Examples

Here are examples of incorrect code:

```js
// Not using memo on function component
function ComponentA(props) {
  return <div>{props.name}</div>;
}

export default ComponentA;
```

## Correct Code Examples

Here is an example of correct code pattern:

```js
// Using memo on function component
function ComponentB(props) {
  return <div>{props.name}</div>;
}

export default memo(ComponentB);
```
## Options 

The rule takes an optional object:

```json
"rules": {
    "@arthurgeron/react-usememo/require-memo": [2, {
      "ignoredComponents": {
        "IgnoreMe": true,
        "DontIgnoreMe": false,
        "!IgnoreEverythingButMe": true,
      }
    }]
}
```
- `{ignoredComponents: Record<string, boolean>}`: This allows you to add specific Component Names, thereby individually disabling or enabling them to be checked when used. Matching names with a `true` value will cause the checks to be ignored.   
You can use strict 1:1 comparisons (e.g., `"ComponentName"`) or employ Minimatch's Glob Pattern (e.g., `"*Item"`).   
  > For more information on Minimatch, refer to its README [here](https://www.npmjs.com/package/minimatch). You may also find this [cheatsheet](https://github.com/motemen/minimatch-cheat-sheet) useful.


## When Not To Use It

If the component always re-renders with different props or is not expensive in terms of performance, there is no real benefit to using `memo()`. In fact, using `memo()` for a large number of simple components could negatively impact performance as memoizing small components may cost more than re-rendering them.

> For more examples and detailed explanation, refer to the eslint-plugin-react-memo [readme](https://github.com/myorg/eslint-plugin-react-memo).