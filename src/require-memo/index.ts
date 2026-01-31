import { findVariable, isComponentName } from "../utils";
import { checkVariableDeclaration, checkFunction } from "./utils";
import type { MemoFunctionDeclaration, MemoFunctionExpression } from "./types";
import type { TSESTree } from "@typescript-eslint/types";
import type { Rule } from "eslint";
import {
	getCompatibleScope,
	type CompatibleContext,
	type CompatibleNode,
	type CompatibleRuleModule,
} from "../utils/compatibility";

const rule: CompatibleRuleModule = {
	meta: {
		messages: {
			"memo-required": "Component definition not wrapped in React.memo()",
		},
		schema: [
			{
				type: "object",
				properties: { ignoredComponents: { type: "object" } },
				additionalProperties: false,
			},
		],
	},
	create: (context: CompatibleContext) => {
		return {
			ExportNamedDeclaration(node: CompatibleNode) {
				// Use type assertions to help TypeScript understand the node structure
				const tsNode = node as TSESTree.ExportNamedDeclaration;
				// Check if the node has declaration and is a function
				if (
					tsNode.declaration &&
					tsNode.declaration.type === "VariableDeclaration"
				) {
					const declarations = tsNode.declaration.declarations;
					for (const declaration of declarations) {
						if (
							isComponentName((declaration?.id as TSESTree.Identifier)?.name)
						) {
							checkVariableDeclaration(
								context,
								declaration,
							);
						}
					}
					return;
				}
				if (tsNode.declaration?.type === "FunctionDeclaration") {
					checkFunction(context, tsNode.declaration as MemoFunctionDeclaration);
				}
			},
			ExportDefaultDeclaration(node: CompatibleNode) {
				// Use type assertions to help TypeScript understand the node structure
				const tsNode = node as TSESTree.ExportDefaultDeclaration;
				
				// Handle default export of arrow functions and function expressions directly
				if (
					tsNode.declaration.type === "ArrowFunctionExpression" ||
					tsNode.declaration.type === "FunctionExpression"
				) {
					// Direct export default of a function should use memo
					context.report({
						node: tsNode.declaration as Rule.Node,
						messageId: "memo-required",
					});
					return;
				}

				// It was exported in one place but declared elsewhere
				if (tsNode.declaration.type === "Identifier") {
					const scope = getCompatibleScope(context, node);
					if (scope) {
						const variable = findVariable(scope, tsNode.declaration);

					if (variable?.defs[0]?.type === "Variable") {
						const variableNode = variable.defs[0].node;

						if (
							isComponentName((variableNode.id as TSESTree.Identifier).name)
						) {
							checkVariableDeclaration(
								context,
								variableNode,
							);
						}
					}
					}
					return;
				}
				if (tsNode.declaration.type === "FunctionDeclaration") {
					checkFunction(context, tsNode.declaration as MemoFunctionDeclaration);
				}
			},
		};
	},
};

export default rule;
