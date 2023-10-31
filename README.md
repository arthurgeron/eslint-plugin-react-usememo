# ESLint-Plugin-React-UseMemo

This plugin enforces the wrapping of complex objects or functions (which might generate unnecessary renders or side-effects) in `useMemo` or `useCallback`. It also allows you to programmatically enforce the wrapping of functional components in `memo`, and that all props and dependencies are wrapped in `useMemo`/`useCallback`.

## Purpose
The objective is to ensure that your application's component tree and/or expensive lifecycles (such as React Native's FlatLists, useEffect, useMemo, etc.) only re-calculate or render again when absolutely necessary. By controlling expensive expressions, you can achieve optimal scalability and performance for your application.

_**Note:**_ Use of memoization everywhere is not advised, as everything comes with a cost. Overusing memoization might slow down your application instead of speeding it up.

## Guidelines for Memoization 
> For more details, please refer to React's [documentation](https://react.dev/reference/react/useMemo) on hooks, re-rendering and memoization.
### There are two primary rules for situations where dynamic objects should be memoed:

1. Variables or expressions that return non-primitive objects or functions passed as props to other components.  

    ***Incorrect***
    ```js
    function Component({incomingData}) {
      const complexData = {
        ...incomingData,
        checked: true
      }; // generated each render, breaks hooks shallow comparison

      return <SomeComponent data={complexData} />
    }
    ```
    ***Correct***
    ```js
    function Component({incomingData}) {
      const complexData = useMemo(() => ({
        ...incomingData,
        checked: true
      }), [incomingData]); // generated only when incomingData changes

      return <SomeComponent data={complexData} />
    }
    ```

2. Variables or expressions that return non-primitive objects returned from custom hooks.   

    ***Incorrect***
    ```js
    function useMyData({incomingData}) {
      const parsedData = parseData(incomingData); // generated each render

      return parsedData; // Will result in loops passed as a dependency in other hooks(e.g. useMemo, useCallback, useEffect).
    }
    ```
    ***Correct***
    ```js
    function useMyData({incomingData}) {
      const parsedData = parseData(incomingData); // generated only when incomingData changes

      return parsedData; // Won't generate loops if used as a dependency in hooks.
    }
    ```

### It is not recommended to use memoization in the following cases:

- When the resulting value (expression or variable) is primitive (string, number, boolean).

  ***Incorrect***
  ```js
  function Component() {
    const width = useMemo(() => someValue * 10, []); // results in integer, wouldn't break hooks' shallow comparison; Memoizing this would only reduce performance

    return <SomeComponent width={width} />
  }
  ```
  ***Correct***
  ```js
  function Component() {
    const width = someValue * 10;

    return <SomeComponent width={width} />
  }
  ```

- If you're passing props to a native component of the framework (e.g. Div, Touchable, etc), except in some instances in react-native (e.g. FlatList).   

  ***Incorrect***
  ```js
  function Component() {
    const onClick = useCallback(() => {}, []);

    return <div onClick={onClick} />
  }
  ```
  ***Correct***
  ```js
  function Component() {
    const onClick = () => {};

    return <div onClick={onClick} />
  }
  ```

- Values that can be a global/context outside the react Context.
  ***Incorrect***
  ```js
  function Component() {
    const breakpoints = [100];

    return <Modal breakpoints={breakpoints}>
  }
  ```

  ***Correct***
  ```js
  const breakpoints = [100];

  function Component() {
    return <Modal breakpoints={breakpoints}>
  }
  ```




## Installation

Install it with yarn:

```
yarn add @arthurgeron/eslint-plugin-react-usememo --dev
```

or npm:

```
npm install @arthurgeron/eslint-plugin-react-usememo --save-dev
```

## Usage

Add the plugin to your `eslintrc` file:
```json
"plugins": ["@arthurgeron/react-usememo"],
```

Then enable any rules as you like:

```json
"rules": {
    "@arthurgeron/react-usememo/require-usememo": [2],
},
```
In this guide, we will cover three rules - `require-usememo`, `require-memo`, and `require-usememo-children`.

## Rule #1: `require-usememo` ***(recommended)***
This rule requires complex values (objects, arrays, functions, and JSX) that get passed props or referenced as a hook dependency to be wrapped in useMemo() or useCallback().

One of the great features of this rule is its amazing autofix functionality. It intelligently wraps necessary components with useMemo() or useCallback(), making your code more efficient and saving you valuable time.

For detailed examples, options available for this rule, and information about the autofix functionality, please refer to our [rules documentation](https://github.com/arthurgeron/eslint-plugin-react-usememo/blob/main/docs/rules/require-usememo.md).

## Rule #2: `require-memo`
This rule requires all function components to be wrapped in `React.memo()`. 

For detailed examples and usage of this rule, please refer to our [rules documentation](https://github.com/arthurgeron/eslint-plugin-react-usememo/blob/main/docs/rules/require-memo.md)

## Rule #3: `require-usememo-children`
This rule requires complex values (objects, arrays, functions, and JSX) that get passed as children to be wrapped in `useMemo()` or `useCallback()`.

For detailed examples and options available for this rule, please refer to our [rules documentation](https://github.com/arthurgeron/eslint-plugin-react-usememo/blob/main/docs/rules/require-usememo-children.md).

## Conclusion
By efficiently using `useMemo`, `useCallback`, and `React.memo()`, we can optimize our React and React Native applications. It allows us to control the re-calculation and re-rendering of components, offering better scalability and performance.
