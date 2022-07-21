export const ValidExpressions: Record<string, boolean> = {
  'ArrowFunctionExpression': true,
  'ObjectExpression': true,
  'ArrayExpression': true,
  'LogicalExpression': true,
  'Identifier': true,
  'JSXEmptyExpression' : false,
}


export const MessagesRequireUseMemo = {
  "object-usememo-props":
    "Object literal should be wrapped in useMemo() or be static when used as a prop",
  "object-usememo-deps":
    "Object literal should be wrapped in useMemo() or be static when used as a hook dependency",
  "array-usememo-props":
    "Array literal should be wrapped in useMemo() or be static when used as a prop",
  "array-usememo-deps":
    "Array literal should be wrapped in useMemo() or be static when used as a hook dependency",
  "instance-usememo-props":
    "Object instantiation should be wrapped in useMemo() or be static when used as a prop",
  "instance-usememo-deps":
    "Object instantiation should be wrapped in useMemo() or be static when used as a hook dependency",
  "jsx-usememo-props":
    "JSX should be wrapped in useMemo() when used as a prop",
  "jsx-usememo-deps":
    "JSX should be wrapped in useMemo() when used as a hook dependency",
  "function-usecallback-props":
    "Function definition should be wrapped in useCallback() or be static when used as a prop",
  "function-usecallback-deps":
    "Function definition should be wrapped in useCallback() or be static when used as a hook dependency",
  "unknown-usememo-props":
    "Unknown value may need to be wrapped in useMemo() when used as a prop",
  "unknown-usememo-deps":
    "Unknown value may need to be wrapped in useMemo() when used as a hook dependency",
  "usememo-const":
    "useMemo/useCallback return value should be assigned to a const to prevent reassignment",
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
    "useMemo/useCallback return value should be assigned to a const to prevent reassignment",
};