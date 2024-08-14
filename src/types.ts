import type { Rule } from "eslint";
import type { TSESTree } from "@typescript-eslint/types";

export type MemoStatusToReport = {
  node?: Rule.RuleContext | TSESTree.Node,
  status: MemoStatus
} | undefined;

export enum MemoStatus {
  Memoized,
  UnmemoizedObject,
  UnmemoizedArray,
  UnmemoizedNew,
  UnmemoizedFunction,
  UnmemoizedFunctionCall,
  UnmemoizedJSX,
  UnmemoizedOther,
  UnsafeLet,
  ErrorInvalidContext = 'error-in-invalid-context'
}

export type ESNode = TSESTree.CallExpression & Rule.NodeParentExtension