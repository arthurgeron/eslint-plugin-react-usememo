import type { Rule } from "eslint";
import type { TSESTree } from "@typescript-eslint/types";
import { isComponentName, isReactCallExpression, shouldIgnoreNode } from "../utils";
import * as path from "node:path";
import { getCompatibleFilename } from "../utils/compatibility";

import type { MemoFunctionExpression, MemoVariableIdentifier } from "./types";

type ParentNode = TSESTree.Node & Rule.NodeParentExtension;
type VariableDeclaratorLike = {
	type: "VariableDeclarator";
	id: { type?: string; name?: string } | null;
	init?: TSESTree.Expression | null;
};

function isMemoCallExpression(node: TSESTree.Node) {
	if (node.type !== "CallExpression") return false;
	return isReactCallExpression(node, "memo");
}

export function checkFunction(
	context: Rule.RuleContext,
	node: (
		| TSESTree.ArrowFunctionExpression
		| TSESTree.FunctionExpression
		| TSESTree.FunctionDeclaration
		| TSESTree.Identifier
	) &
		Rule.NodeParentExtension,
) {
	const ignoredNames = context.options?.[0]?.ignoredComponents;
	let currentNode: ParentNode | null | undefined =
		node.type === "FunctionDeclaration"
			? (node as ParentNode)
			: (node.parent as ParentNode | null | undefined);
	while (currentNode?.type === "CallExpression") {
		if (isMemoCallExpression(currentNode)) {
			return;
		}

		currentNode = currentNode.parent as ParentNode | null | undefined;
	}

	if (
		currentNode?.type === "VariableDeclarator" ||
		currentNode?.type === "FunctionDeclaration"
	) {
		const { id } = currentNode;
		if (id?.type === "Identifier") {
			if (
				isComponentName(id?.name) &&
				(!ignoredNames ||
					!shouldIgnoreNode(id, ignoredNames))
			) {
				context.report({ node: node as Rule.Node, messageId: "memo-required" });
			}
		}
	} else if (
		node.type === "FunctionDeclaration" &&
		(currentNode as TSESTree.Program | null | undefined)?.type === "Program"
	) {
		if (
			ignoredNames &&
			!shouldIgnoreNode(node, ignoredNames)
		) {
			return;
		}
		if (node.id !== null && isComponentName(node.id?.name)) {
			context.report({ node, messageId: "memo-required" });
		} else {
			if (getCompatibleFilename(context) === "<input>") return;
			const filename = path.basename(getCompatibleFilename(context));
			if (isComponentName(filename)) {
				context.report({ node, messageId: "memo-required" });
			}
		}
	}
}

export function checkVariableDeclaration(
	context: Rule.RuleContext,
	declaration: unknown,
) {
	if (!declaration || typeof declaration !== "object") {
		return;
	}

	if ((declaration as { type?: string }).type !== "VariableDeclarator") {
		return;
	}

	const variableDeclaration = declaration as VariableDeclaratorLike;
	if (variableDeclaration.init) {
		if (variableDeclaration.init.type === "CallExpression") {
			const declarationProperties = (
				(variableDeclaration.init.callee as MemoVariableIdentifier).name
					? variableDeclaration.init.callee
					: (variableDeclaration.init.callee as TSESTree.MemberExpression)
							.property
			) as MemoVariableIdentifier;
			if (declarationProperties?.name === "memo") {
				checkFunction(
					context,
					variableDeclaration.init.arguments[0] as MemoVariableIdentifier,
				);
				return;
			}
		} else if (
			variableDeclaration.init.type === "ArrowFunctionExpression" ||
			variableDeclaration.init.type === "FunctionExpression"
		) {
			checkFunction(
				context,
				variableDeclaration.init as MemoFunctionExpression,
			);
			return;
		}
	}
}


