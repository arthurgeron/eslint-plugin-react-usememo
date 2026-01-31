import type { TSESTree } from "@typescript-eslint/types";
import type { MessagesRequireUseMemo } from "../constants/messages";

export type ExpressionTypes =
	| TSESTree.Expression
	| TSESTree.JSXEmptyExpression;
export type ExpressionData = Record<string | number | symbol, keyof typeof MessagesRequireUseMemo>;
type OptionalRecord<K extends string | number | symbol, T> = {
	[P in K]?: T;
};
type PartialKeyOfMessages = keyof typeof MessagesRequireUseMemo;
export type MemoErrorHookDictionary = OptionalRecord<
	PartialKeyOfMessages,
	"useCallback" | "useMemo"
>;
export type ReactImportInformation = {
	reactImported: boolean;
	useMemoImported: boolean;
	useCallbackImported: boolean;
	importDeclaration?: TSESTree.ImportDeclaration;
};