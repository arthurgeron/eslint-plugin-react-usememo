# Rule: require-memo

This rule enforces the use of `React.memo()` on function components. The objective is to optimize your component re-renders and avoid unnecessary render cycles when your component's props do not change.

## Rationale 

React’s rendering behavior ensures that whenever the parent component renders, the child component instances are re-rendered as well. When dealing with expensive computations or components, this could lead to performance issues. `React.memo()` is a higher order component which tells React to skip rendering the component if its props have not changed.

When `React.memo()` wraps an exported component, then it will only re-render if the current and next props are not shallowly equal.

```jsx
function MyComponent(props) {  /* ... */  }

export default React.memo(MyComponent);
```

This rule applies to function components, not class-based components as they should extend `React.PureComponent` or must implement `shouldComponentUpdate` lifecycle method for similar optimization.

## Rule Details
This rule will enforce that all function components are wrapped in `React.memo()`.  
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

export default React.memo(ComponentB);
```
## Options 

The rule takes an optional object:

```json
"rules": {
    "@myorg/react-memo/require-memo": [2, {
      "ignoreComponents": ["IgnoreMe"]
    }]
}
```
- `ignoreComponents`: An array of component names to ignore when checking for `React.memo()` usage.

## When Not To Use It

If the component always re-renders with different props or is not expensive in terms of performance, there is no real benefit to using `React.memo()`. In fact, using `React.memo()` for a large number of simple components could negatively impact performance as memoizing small components may cost more than re-rendering them. So this rule should be disabled in such scenarios.

> For more examples and detailed explanation, refer to the eslint-plugin-react-memo [readme](https://github.com/myorg/eslint-plugin-react-memo).