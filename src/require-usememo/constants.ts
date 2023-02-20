import type { ExpressionData} from './types';
import {
  MemoStatus,
} from "../common";


export const ValidExpressions: Record<string, boolean> = {
  'ArrowFunctionExpression': true,
  'ObjectExpression': true,
  'ArrayExpression': true,
  'LogicalExpression': true,
  'Identifier': true,
  'JSXEmptyExpression' : false,
}


export const jsxEmptyExpressionClassData: ExpressionData = {
  [MemoStatus.UnmemoizedObject.toString()]: "object-class-memo-props",
  [MemoStatus.UnmemoizedArray.toString()]: "array-class-memo-props",
  [MemoStatus.UnmemoizedNew.toString()]: "instance-class-memo-props",
  [MemoStatus.UnmemoizedFunction.toString()]: 'instance-class-memo-props',
  [MemoStatus.UnmemoizedFunctionCall.toString()]: "unknown-class-memo-props",
  [MemoStatus.UnmemoizedOther.toString()]: "unknown-class-memo-props",
}

export const jsxEmptyExpressionData: ExpressionData = {
  [MemoStatus.UnmemoizedObject.toString()]: "object-usememo-props",
  [MemoStatus.UnmemoizedArray.toString()]: "array-usememo-props",
  [MemoStatus.UnmemoizedNew.toString()]: "instance-usememo-props",
  [MemoStatus.UnmemoizedFunction.toString()]: "function-usecallback-props",
  [MemoStatus.UnmemoizedFunctionCall.toString()]: "unknown-usememo-props",
  [MemoStatus.UnmemoizedOther.toString()]: "unknown-usememo-props",
  [MemoStatus.UnmemoizedJSX.toString()]: "jsx-usememo-props",
}

export const callExpressionData: ExpressionData = {
  [MemoStatus.UnmemoizedObject.toString()]: "object-usememo-deps",
  [MemoStatus.UnmemoizedArray.toString()]: "array-usememo-deps",
  [MemoStatus.UnmemoizedNew.toString()]: "instance-usememo-deps",
  [MemoStatus.UnmemoizedFunction.toString()]:  "function-usecallback-deps",
  [MemoStatus.UnmemoizedFunctionCall.toString()]: "unknown-usememo-deps",
  [MemoStatus.UnmemoizedOther.toString()]: "unknown-usememo-deps",
  [MemoStatus.UnmemoizedJSX.toString()]: "jsx-usememo-deps",
}