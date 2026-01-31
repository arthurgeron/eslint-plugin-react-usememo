import type { Rule, Scope } from "eslint";
import type { TSESTree } from "@typescript-eslint/types";
import { MemoStatus, type MemoStatusToReport } from "src/types";
import { type CompatibleContext, type CompatibleNode } from "src/utils/compatibility";
import getVariableInScope from "src/utils/getVariableInScope";
import { Minimatch } from "minimatch";

export function isComplexComponent(
	node: TSESTree.JSXOpeningElement | TSESTree.JSXIdentifier,
) {
	if (node?.type !== "JSXOpeningElement") return false;
	if (node?.name?.type !== "JSXIdentifier") return false;
	const firstCharacterLowerCase = node?.name?.name?.[0]?.toLowerCase();
	return (
		!!firstCharacterLowerCase &&
		firstCharacterLowerCase !== node?.name?.name?.[0]
	);
}

export function isComponentName(name: string | undefined) {
	return (
		typeof name === "string" && !!name && name?.[0] === name?.[0]?.toUpperCase()
	);
}

export function getIsHook(node: TSESTree.Node | TSESTree.Identifier) {
	if (node.type === "Identifier") {
		const { name } = node;
		return (
			name === "use" ||
			((name?.length ?? 0) >= 4 &&
				name[0] === "u" &&
				name[1] === "s" &&
				name[2] === "e" &&
				name[3] === name[3]?.toUpperCase?.())
		);
	}

	if (
		node.type === "MemberExpression" &&
		!node.computed &&
		getIsHook(node.property)
	) {
		const { object: obj } = node;
		return obj.type === "Identifier" && obj.name === "React";
	}

	return false;
}

export function isImpossibleToFix(node: CompatibleNode) {
	let current = node as (TSESTree.Node & Rule.NodeParentExtension) | undefined;

	while (current) {
		if (current.type === "CallExpression") {
			const callee = current.callee as TSESTree.CallExpression["callee"];
			const isInsideIteration =
				callee.type === "MemberExpression" &&
				callee.property.type === "Identifier" &&
				callee.property.name in Array.prototype;
			const isInsideOtherHook =
				callee.type === "Identifier" &&
				(callee.name === "useMemo" || callee.name === "useCallback");
			return { result: isInsideIteration || isInsideOtherHook, node: callee };
		}
		current = current.parent as
			| (TSESTree.Node & Rule.NodeParentExtension)
			| undefined;
	}

	return { result: false };
}

export function isReactCallExpression(
	node: TSESTree.CallExpression,
	name: string,
): boolean {
	if (node?.callee?.type === "MemberExpression") {
		const {
			callee: { object, property },
		} = node;
		if (
			object.type === "Identifier" &&
			property.type === "Identifier" &&
			object.name === "React" &&
			property.name === name
		) {
			return true;
		}
	} else if (node?.callee?.type === "Identifier" && node.callee.name === name) {
		return true;
	}

	return false;
}

function getIdentifierMemoStatus(
	context: CompatibleContext,
	identifierNode: TSESTree.Identifier,
): MemoStatusToReport {
	const { name } = identifierNode;
	const variableInScope = getVariableInScope(context, identifierNode, name);
	if (variableInScope === undefined) return { status: MemoStatus.Memoized };
	const [{ node }] = variableInScope.defs;
	const isProps =
		node?.id?.type === "Identifier" &&
		(isComponentName(node.id.name) || getIsHook(node.id));
	if (isProps) {
		return undefined;
	}

	const isFunctionParameter = node?.id?.name !== name;
	if (node.type === "FunctionDeclaration")
		return {
			node: node,
			status: isFunctionParameter
				? MemoStatus.Memoized
				: MemoStatus.UnmemoizedFunction,
		};
	if (node.type !== "VariableDeclarator")
		return { node: node, status: MemoStatus.Memoized };
	if (
		node?.parent?.kind === "let" &&
		node?.init?.type === "CallExpression" &&
		getIsHook(node?.init?.callee)
	) {
		return { node: node.parent, status: MemoStatus.UnsafeLet };
	}
	return getExpressionMemoStatus(context, node.init);
}

function getInvalidContextReport(
	context: CompatibleContext,
	expression: TSESTree.Expression,
) {
	const impossibleFix = isImpossibleToFix(expression);
	if (impossibleFix?.result) {
		return {
			node: impossibleFix.node as CompatibleNode,
			status: MemoStatus.ErrorInvalidContext,
		};
	}
	return false;
}

export function getExpressionMemoStatus(
	context: CompatibleContext,
	expression: TSESTree.Expression,
	checkContext = false,
): MemoStatusToReport {
	switch (expression?.type) {
		case undefined:
		case "ObjectExpression":
			return (
				(checkContext && getInvalidContextReport(context, expression)) || {
					node: expression as CompatibleNode,
					status: MemoStatus.UnmemoizedObject,
				}
			);
		case "ArrayExpression":
			return (
				(checkContext && getInvalidContextReport(context, expression)) || {
					node: expression as CompatibleNode,
					status: MemoStatus.UnmemoizedArray,
				}
			);
		case "NewExpression":
			return (
				(checkContext && getInvalidContextReport(context, expression)) || {
					node: expression as CompatibleNode,
					status: MemoStatus.UnmemoizedNew,
				}
			);
		case "FunctionExpression":
		case "ArrowFunctionExpression": {
			return (
				(checkContext && getInvalidContextReport(context, expression)) || {
					node: expression as CompatibleNode,
					status: MemoStatus.UnmemoizedFunction,
				}
			);
		}
		case "JSXElement":
			return (
				(checkContext && getInvalidContextReport(context, expression)) || {
					node: expression as CompatibleNode,
					status: MemoStatus.UnmemoizedJSX,
				}
			);
		case "CallExpression": {
			const validCallExpression =
				isReactCallExpression(expression, "useMemo") ||
				isReactCallExpression(expression, "useCallback");

			return (
				(validCallExpression &&
					checkContext &&
					getInvalidContextReport(context, expression)) || {
					node: expression as CompatibleNode,
					status: validCallExpression
						? MemoStatus.Memoized
						: MemoStatus.UnmemoizedFunctionCall,
				}
			);
		}
		case "Identifier":
			return getIdentifierMemoStatus(context, expression);
		case "BinaryExpression":
			return { node: expression as CompatibleNode, status: MemoStatus.Memoized };
		default:
			return {
				node: expression as CompatibleNode,
				status: MemoStatus.UnmemoizedOther,
			};
	}
}

export function findVariable(
	scope: Scope.Scope,
	node: TSESTree.Identifier,
): Scope.Variable | undefined {
	if (scope.variables.some((variable) => variable.name === node.name)) {
		return scope.variables.find((variable) => variable.name === node.name);
	}

	if (scope.upper) {
		return findVariable(scope.upper, node);
	}

	return undefined;
}

export function shouldIgnoreNode(
	node: CompatibleNode,
	ignoredNames: Record<string, boolean | undefined>,
) {
	const nodeName = node.type === "Identifier" ? node.name : undefined;
	const nodeCalleeName =
		node.type === "CallExpression" && node.callee.type === "Identifier"
			? node.callee.name
			: undefined;
	const nodeCalleePropertyName =
		node.type === "CallExpression" &&
		node.callee.type === "MemberExpression" &&
		node.callee.property.type === "Identifier"
			? node.callee.property.name
			: undefined;
	const nameToCheck = nodeName || nodeCalleeName || nodeCalleePropertyName;

	const matchedValue = nameToCheck ? ignoredNames[nameToCheck] : undefined;

	if (matchedValue !== undefined) {
		return matchedValue;
	}

	if (nameToCheck === "use") {
		return true;
	}

	let shouldIgnore: boolean | undefined;

	Object.keys(ignoredNames).find((key) => {
		const value = ignoredNames[key];
		const miniMatch = new Minimatch(key);
		if (miniMatch.hasMagic()) {
			const isMatch = nameToCheck && miniMatch.match(nameToCheck);
			if (isMatch) {
				shouldIgnore = !!value;
				return true;
			}
		}
		return false;
	});

	return !!shouldIgnore;
}

type ParentNode = Rule.NodeParentExtension;

export function findParentType(
	node: CompatibleNode | null | undefined,
	type: string,
): CompatibleNode | undefined {
	let current = node as ParentNode | null | undefined;
	let parent = current?.parent as ParentNode | null | undefined;

	while (parent) {
		const parentNode = parent as CompatibleNode | undefined;
		if (parentNode?.type === type) {
			return parentNode;
		}
		parent = parent.parent as ParentNode | null | undefined;
	}

	return undefined;
}
