import type { Rule } from "eslint-v9";
import { findVariable, isComponentName } from "../utils";
import { checkVariableDeclaration, checkFunction, safeGetScope } from "./utils";
import type { MemoFunctionDeclaration, MemoFunctionExpression } from "./types";
import type { TSESTree } from "@typescript-eslint/types";

const rule: Rule.RuleModule = {
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
	create: (context) => {
		return {
			ExportNamedDeclaration(node) {
				// Check if the node has declaration and is a function
				if (
					node.declaration &&
					node.declaration.type === "VariableDeclaration"
				) {
					const declarations = node.declaration.declarations;
					for (const declaration of declarations) {
						if (
							isComponentName((declaration?.id as TSESTree.Identifier)?.name)
						) {
							checkVariableDeclaration(
								context,
								declaration as TSESTree.VariableDeclarator,
							);
						}
					}
					return;
				}
				if (node?.declaration?.type === "FunctionDeclaration") {
					checkFunction(context, node.declaration as MemoFunctionDeclaration);
				}
			},
			ExportDefaultDeclaration(node) {
				// Handle default export of arrow functions and function expressions directly
				if (
					node.declaration.type === "ArrowFunctionExpression" ||
					node.declaration.type === "FunctionExpression"
				) {
					// Direct export default of a function should use memo
					context.report({
						node: node.declaration,
						messageId: "memo-required",
					});
					return;
				}

				// It was exported in one place but declared elsewhere
				if (node.declaration.type === "Identifier") {
					const variable = findVariable(
						safeGetScope(context)?.(node),
						node.declaration,
					);

					if (variable?.defs[0]?.type === "Variable") {
						const variableNode = variable.defs[0].node;

						if (
							isComponentName((variableNode.id as TSESTree.Identifier).name)
						) {
							checkVariableDeclaration(
								context,
								variableNode as TSESTree.VariableDeclarator,
							);
						}
					}
					return;
				}
				if (node.declaration.type === "FunctionDeclaration") {
					checkFunction(context, node.declaration as MemoFunctionDeclaration);
				}
			},
		};
	},
};

export default rule;
