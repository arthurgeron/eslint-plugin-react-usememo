# Rule: require-usememo-children

This rule enforces the use of `useMemo()` around children in render methods. 

## Rationale 

The React `useMemo` hook is used to memorize expensive computations, but it can also be beneficial when passing complex objects or large arrays as props to child components.

By wrapping such data with useMemo, you ensure that the child component will not re-render unless the data has changed. It compares the previous result with the new one and if they're the same, it avoids the re-render.

```jsx
function ParentComponent({ list }) {
  const memoizedList = React.useMemo(() => list, [list]);

  return <ChildComponent data={memoizedList} />;
}
```
This rule applies to any type of component (functional or class-based) as long as it involves passing complex children (objects, arrays) to another component.

## Rule Details
This rule will enforce that all complex children are wrapped in `useMemo()`.

## Incorrect Code Examples

Here are examples of incorrect code:

```js
// Not using useMemo for complex children
function ComponentA(props) {
  const list = getComplexData(); // Assume this returns an array
  return <OtherComponent data={list} />
}

export default ComponentA;
```

## Correct Code Examples

Here is an example of correct code pattern:

```js
// Using useMemo for complex children
function ComponentB(props) {
  const list = getComplexData(); // Assume this returns an array
  
  const memoizedList = React.useMemo(() => list, [list]);

  return <OtherComponent data={memoizedList} />
}

export default ComponentB;
```

## Options 

No options available for this rule.

## When Not To Use It

If the child elements are simple types (strings, numbers) or the parent doesn't often re-render, then using `useMemo()` might be overkill and could even lead to worse performance. Therefore, it's better to turn off this rule in such cases.

> For more examples and detailed explanation, refer to the eslint-plugin-react-memo-children [readme](https://github.com/myorg/eslint-plugin-react-memo-children).