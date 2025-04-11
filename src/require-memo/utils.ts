import type { Rule } from "eslint";
import type { Rule as RuleV9 } from "eslint-v9";
import type * as ESTree from "estree";
import { isComponentName, shouldIgnoreNode } from "../utils";
import * as path from "node:path";
import { getCompatibleScope, getCompatibleFilename } from "../utils/compatibility";

import type { MemoFunctionExpression, MemoVariableIdentifier } from "./types";
import type { ESNode } from "src/types";

function isMemoCallExpression(node: Rule.Node) {
	if (node.type !== "CallExpression") return false;
	if (node.callee?.type === "MemberExpression") {
		const {
			callee: { object, property },
		} = node;
		if (
			object.type === "Identifier" &&
			property.type === "Identifier" &&
			object.name === "React" &&
			property.name === "memo"
		) {
			return true;
		}
	} else if (
		node.callee?.type === "Identifier" &&
		node.callee?.name === "memo"
	) {
		return true;
	}

	return false;
}

export function checkFunction(
	context: Rule.RuleContext | RuleV9.RuleContext,
	node: (
		| ESTree.ArrowFunctionExpression
		| ESTree.FunctionExpression
		| ESTree.FunctionDeclaration
		| ESTree.Identifier
	) &
		(Rule.NodeParentExtension | RuleV9.NodeParentExtension),
) {
	const ignoredNames = context.options?.[0]?.ignoredComponents;
	let currentNode = node.type === "FunctionDeclaration" ? node : node.parent;
	while (currentNode.type === "CallExpression") {
		if (isMemoCallExpression(currentNode)) {
			return;
		}

		currentNode = currentNode.parent;
	}

	if (
		currentNode.type === "VariableDeclarator" ||
		currentNode.type === "FunctionDeclaration"
	) {
		const { id } = currentNode;
		if (id?.type === "Identifier") {
			if (
				isComponentName(id?.name) &&
				(!ignoredNames ||
					!shouldIgnoreNode(id as unknown as ESNode, ignoredNames))
			) {
				context.report({ node, messageId: "memo-required" });
			}
		}
	} else if (
		node.type === "FunctionDeclaration" &&
		currentNode.type === "Program"
	) {
		if (
			ignoredNames &&
			!shouldIgnoreNode(node as unknown as ESNode, ignoredNames)
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
	context: Rule.RuleContext | RuleV9.RuleContext,
	declaration: any, // Using any to bypass type incompatibilities between ESLint v8 and v9
) {
	if (declaration.init) {
		if (declaration.init.type === "CallExpression") {
			const declarationProperties = (
				(declaration.init.callee as MemoVariableIdentifier).name
					? declaration.init.callee
					: (declaration.init.callee as ESTree.MemberExpression).property
			) as MemoVariableIdentifier;
			if (declarationProperties?.name === "memo") {
				checkFunction(
					context,
					declaration.init.arguments[0] as MemoVariableIdentifier,
				);
				return;
			}
		} else if (
			declaration.init.type === "ArrowFunctionExpression" ||
			declaration.init.type === "FunctionExpression"
		) {
			checkFunction(context, declaration.init as MemoFunctionExpression);
			return;
		}
	}
}


