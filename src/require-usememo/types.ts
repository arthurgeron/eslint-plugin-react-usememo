import type { Rule } from "eslint";
import type { TSESTree } from "@typescript-eslint/types";
import type { MessagesRequireUseMemo} from '../constants';

export type ExpressionTypes = TSESTree.ArrowFunctionExpression | TSESTree.JSXExpressionContainer | TSESTree.Expression | TSESTree.ObjectExpression | TSESTree.ArrayExpression | TSESTree.Identifier | TSESTree.LogicalExpression | TSESTree.JSXEmptyExpression;

export type NodeType = TSESTree.MethodDefinitionComputedName;
export type ExpressionData = Record<string | number | symbol, keyof typeof MessagesRequireUseMemo>;
type OptionalRecord<K extends keyof any, T> = {
  [P in K]?: T;
};
type PartialKeyOfMessages = keyof typeof MessagesRequireUseMemo;
export type MemoErrorHookDictionary = OptionalRecord<PartialKeyOfMessages, 'useCallback' | 'useMemo'>;
export type ImportNode = TSESTree.ImportDeclaration & Rule.NodeParentExtension;
export type ReactImportInformation = {
  reactImported: boolean;
  useMemoImported: boolean;
  useCallbackImported: boolean;
  importDeclaration?: TSESTree.ImportDeclaration;
};