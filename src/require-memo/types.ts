import type * as ESTree from "estree";
import type { Rule } from "eslint";

export type MemoVariableIdentifier = ESTree.Identifier & Rule.NodeParentExtension;
export type MemoFunctionExpression = (ESTree.FunctionExpression | ESTree.ArrowFunctionExpression) & Rule.NodeParentExtension;
export type MemoFunctionDeclaration = ESTree.FunctionDeclaration & Rule.NodeParentExtension;