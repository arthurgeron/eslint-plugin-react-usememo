import { MemoStatus } from 'src/types';
import type { ExpressionData, MemoErrorHookDictionary } from './types';

export const defaultImportRangeStart = `import { `;
export const nameGeneratorUUID = 'b32a4d70-4f64-11eb-89d5-33e6ce8a6c99';
export const jsxEmptyExpressionClassData: ExpressionData = {
  [MemoStatus.UnmemoizedObject.toString()]: "object-class-memo-props",
  [MemoStatus.UnmemoizedArray.toString()]: "array-class-memo-props",
  [MemoStatus.UnmemoizedNew.toString()]: "instance-class-memo-props",
  [MemoStatus.UnmemoizedFunction.toString()]: 'instance-class-memo-props',
  [MemoStatus.UnmemoizedFunctionCall.toString()]: "unknown-class-memo-props",
  [MemoStatus.UnmemoizedOther.toString()]: "unknown-class-memo-props",
  [MemoStatus.UnsafeLet.toString()]: "usememo-const",
}

export const jsxEmptyExpressionData: ExpressionData = {
  [MemoStatus.UnmemoizedObject.toString()]: "object-usememo-props",
  [MemoStatus.UnmemoizedArray.toString()]: "array-usememo-props",
  [MemoStatus.UnmemoizedNew.toString()]: "instance-usememo-props",
  [MemoStatus.UnmemoizedFunction.toString()]: "function-usecallback-props",
  [MemoStatus.UnmemoizedFunctionCall.toString()]: "unknown-usememo-props",
  [MemoStatus.UnmemoizedOther.toString()]: "unknown-usememo-props",
  [MemoStatus.UnmemoizedJSX.toString()]: "jsx-usememo-props",
  [MemoStatus.UnsafeLet.toString()]: "usememo-const",
}

export const hookReturnExpressionData: ExpressionData = {
  [MemoStatus.UnmemoizedObject.toString()]: "object-usememo-hook",
  [MemoStatus.UnmemoizedArray.toString()]: "array-usememo-hook",
  [MemoStatus.UnmemoizedNew.toString()]: "instance-usememo-hook",
  [MemoStatus.UnmemoizedFunction.toString()]: "function-usecallback-hook",
  [MemoStatus.UnmemoizedFunctionCall.toString()]: "unknown-usememo-hook",
  [MemoStatus.UnmemoizedOther.toString()]: "unknown-usememo-hook",
  [MemoStatus.UnmemoizedJSX.toString()]: "jsx-usememo-hook",
  [MemoStatus.UnsafeLet.toString()]: "usememo-const",
}

export const callExpressionData: ExpressionData = {
  [MemoStatus.UnmemoizedObject.toString()]: "object-usememo-deps",
  [MemoStatus.UnmemoizedArray.toString()]: "array-usememo-deps",
  [MemoStatus.UnmemoizedNew.toString()]: "instance-usememo-deps",
  [MemoStatus.UnmemoizedFunction.toString()]:  "function-usecallback-deps",
  [MemoStatus.UnmemoizedFunctionCall.toString()]: "unknown-usememo-deps",
  [MemoStatus.UnmemoizedOther.toString()]: "unknown-usememo-deps",
  [MemoStatus.UnmemoizedJSX.toString()]: "jsx-usememo-deps",
  [MemoStatus.UnsafeLet.toString()]: "usememo-const",
}

export const defaultReactHookNames: Record<string, boolean | undefined> = {
  "useContext": true,
  "useState": true,
  "useReducer": true,
  "useRef": true,
  "useLayoutEffect": true,
  "useEffect": true,
  "useImperativeHandle": true,
  "useCallback": true,
  "useMemo": true,
  "useDebugValue": true,
  "useDeferredValue": true,
  "useTransition": true,
  "useId": true,
  "useInsertionEffect": true,
  "useSyncExternalStore": true,
  "useQuery": true,
  "useMutation": true,
  "useQueryClient": true,
  "useInfiniteQuery": true,
}

export const messageIdToHookDict: MemoErrorHookDictionary = {
  'function-usecallback-props': 'useCallback',
  'function-usecallback-hook': 'useCallback',
  'function-usecallback-deps': 'useCallback',
  'object-usememo-props': 'useMemo',
  'usememo-const': 'useMemo',
};
