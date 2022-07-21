export const ValidExpressions: Record<string, boolean> = {
  'ArrowFunctionExpression': true,
  'ObjectExpression': true,
  'ArrayExpression': true,
  'LogicalExpression': true,
  'Identifier': true,
  'JSXEmptyExpression' : false,
}


export const Messages = {
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
    "Function definition should be wrapped in useMemo() or be static when used as a prop",
  "function-usecallback-deps":
    "Function definition should be wrapped in useMemo() or be static when used as a hook dependency",
  "unknown-usememo-props":
    "Unknown value may need to be wrapped in useMemo() when used as a prop",
  "unknown-usememo-deps":
    "Unknown value may need to be wrapped in useMemo() when used as a hook dependency",
  "usememo-const":
    "useMemo/useCallback return value should be assigned to a const to prevent reassignment",
};
