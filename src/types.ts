import { Rule } from "eslint";
import { TSESTree } from "@typescript-eslint/types";

export type MemoStatusToReport = {
  node?: Rule.RuleContext | TSESTree.Node,
  status: MemoStatus
}

export enum MemoStatus {
  Memoized,
  UnmemoizedObject,
  UnmemoizedArray,
  UnmemoizedNew,
  UnmemoizedFunction,
  UnmemoizedFunctionCall,
  UnmemoizedJSX,
  UnmemoizedOther,
  UnsafeLet
}