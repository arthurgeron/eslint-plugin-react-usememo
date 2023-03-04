export const MessagesRequireUseMemo = {
  "object-usememo-props":
    "Object literal should be wrapped in useMemo() or be static when used as a prop",
  "object-class-memo-props":
    "Object literal should com from state or be static when used as a prop",
  "object-usememo-hook":
    "Object literal should com from state or be static when returned from a hook",
  "object-usememo-deps":
    "Object literal should be wrapped in useMemo() or be static when used as a hook dependency",
  "array-usememo-props":
    "Array literal should be wrapped in useMemo() or be static when used as a prop",
  "array-usememo-hook":
    "Array literal should be wrapped in useMemo() or be static when returned from a hook",
  "array-class-memo-props":
    "Array literal should be from state and declared in state, constructor, getDerivedStateFromProps or statically when used as a prop",
  "array-usememo-deps":
    "Array literal should be wrapped in useMemo() or be static when used as a hook dependency",
  "instance-usememo-props":
    "Object instantiation should be wrapped in useMemo() or be static when used as a prop",
  "instance-usememo-hook":
    "Object instantiation should be wrapped in useMemo() or be static when returned from a hook",
  "instance-class-memo-props":
    "Object instantiation should be done in state, constructor, getDerivedStateFromProps or statically when used as a prop",
  "instance-usememo-deps":
    "Object instantiation should be wrapped in useMemo() or be static when used as a hook dependency",
  "jsx-usememo-props":
    "JSX should be wrapped in useMemo() when used as a prop",
  "jsx-usememo-hook":
    "JSX should be wrapped in useMemo() when returned from a hook",
  "jsx-usememo-deps":
    "JSX should be wrapped in useMemo() when used as a hook dependency",
  "function-usecallback-props":
    "Function definition should be wrapped in useCallback() or be static when used as a prop",
  "function-usecallback-hook":
    "Function definition should be wrapped in useCallback() or be static when returned from a hook",
  "function-class-props":
    "Function definition should declared as a class property or statically when used as a prop",
  "function-usecallback-deps":
    "Function definition should be wrapped in useCallback() or be static when used as a hook dependency",
  "unknown-usememo-props":
    "Unknown value may need to be wrapped in useMemo() when used as a prop",
  "unknown-usememo-hook":
    "Unknown value may need to be wrapped in useMemo() when returned from a hook",
  "unknown-class-memo-props":
    "Unknown value should be declared in state, constructor, getDerivedStateFromProps or statically when used as a prop",
  "unknown-usememo-deps":
    "Unknown value may need to be wrapped in useMemo() when used as a hook dependency",
  "usememo-const":
    "useMemo/useCallback return value should be assigned to a `const` to prevent reassignment",
};

export const MessagesRequireUseMemoChildren = {
  "object-usememo-children":
    "Object literal should be wrapped in React.useMemo() when used as children",
  "array-usememo-children":
    "Array literal should be wrapped in React.useMemo() when used as children",
  "instance-usememo-children":
    "Object instantiation should be wrapped in React.useMemo() when used as children",
  "jsx-usememo-children":
    "JSX should be wrapped in React.useMemo() when used as children",
  "function-usecallback-children":
    "Function definition should be wrapped in React.useCallback() when used as children",
  "unknown-usememo-children":
    "Unknown value may need to be wrapped in React.useMemo() when used as children",
  "usememo-const":
    "useMemo/useCallback return value should be assigned to a `const` to prevent reassignment",
};

