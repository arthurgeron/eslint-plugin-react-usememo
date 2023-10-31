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

## Incorrect
```JavaScript
function Component() {

  <View>
    <>
    <OtherComponent />
    </>
  </View>
}
```
   
## Correct
```JavaScript
function Component() {

  const children = useMemo(() => (<OtherComponent />), []);
  <View>
    {children}
  </View>
}
```

## Options 

- `{strict: true}`: Fails even in cases where it is difficult to determine if the value in question is a primitive (string or number) or a complex value (object, array, etc.).

## When Not To Use It

If the child elements are simple types (strings, numbers) or the parent doesn't often re-render, then using `useMemo()` might be overkill and could even lead to worse performance. Therefore, it's better to turn off this rule in such cases.

> For more examples and detailed explanation, refer to the eslint-plugin-react-memo-children [readme](https://github.com/myorg/eslint-plugin-react-memo-children).