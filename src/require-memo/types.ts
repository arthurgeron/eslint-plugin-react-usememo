import type { Rule } from "eslint";
import type { TSESTree } from "@typescript-eslint/types";

export type MemoVariableIdentifier = TSESTree.Identifier & Rule.NodeParentExtension;
export type MemoFunctionExpression =
	| (TSESTree.FunctionExpression & Rule.NodeParentExtension)
	| (TSESTree.ArrowFunctionExpression & Rule.NodeParentExtension);
export type MemoFunctionDeclaration =
	TSESTree.FunctionDeclaration & Rule.NodeParentExtension;