import type { Rule, Scope } from "eslint";
import type { Rule as RuleV9 } from "eslint-v9";
import type { TSESTree } from "@typescript-eslint/types";
import type * as ESTree from "estree";
import { type ESNode, MemoStatus, type MemoStatusToReport } from "src/types";
import { getIsHook, isImpossibleToFix } from "src/require-usememo/utils";
import getVariableInScope from "src/utils/getVariableInScope";
import { Minimatch } from "minimatch";
import type { CompatibleContext } from "src/require-usememo/utils";

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

function isCallExpression(
	node: TSESTree.CallExpression,
	name: "useMemo" | "useCallback",
) {
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
		return;
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
	const impossibleFix = isImpossibleToFix(
		expression as Rule.NodeParentExtension,
		context,
	);
	if (impossibleFix?.result) {
		return { node: impossibleFix.node, status: MemoStatus.ErrorInvalidContext };
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
					node: expression,
					status: MemoStatus.UnmemoizedObject,
				}
			);
		case "ArrayExpression":
			return (
				(checkContext && getInvalidContextReport(context, expression)) || {
					node: expression,
					status: MemoStatus.UnmemoizedArray,
				}
			);
		case "NewExpression":
			return (
				(checkContext && getInvalidContextReport(context, expression)) || {
					node: expression,
					status: MemoStatus.UnmemoizedNew,
				}
			);
		case "FunctionExpression":
		case "ArrowFunctionExpression": {
			return (
				(checkContext && getInvalidContextReport(context, expression)) || {
					node: expression,
					status: MemoStatus.UnmemoizedFunction,
				}
			);
		}
		case "JSXElement":
			return (
				(checkContext && getInvalidContextReport(context, expression)) || {
					node: expression,
					status: MemoStatus.UnmemoizedJSX,
				}
			);
		case "CallExpression": {
			const validCallExpression =
				isCallExpression(expression, "useMemo") ||
				isCallExpression(expression, "useCallback");

			return (
				(validCallExpression &&
					checkContext &&
					getInvalidContextReport(context, expression)) || {
					node: expression,
					status: validCallExpression
						? MemoStatus.Memoized
						: MemoStatus.UnmemoizedFunctionCall,
				}
			);
		}
		case "Identifier":
			return getIdentifierMemoStatus(context, expression);
		case "BinaryExpression":
			return { node: expression, status: MemoStatus.Memoized };
		default:
			return { node: expression, status: MemoStatus.UnmemoizedOther };
	}
}

export function findVariable(
	scope: Scope.Scope,
	node: ESTree.Identifier,
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
	node: ESNode,
	ignoredNames: Record<string, boolean | undefined>,
) {
	const nodeName = (node as TSESTree.Node as TSESTree.Identifier)?.name;
	const nodeCalleeName = (node?.callee as TSESTree.Identifier)?.name;
	const nodeCalleePropertyName = (
		(node?.callee as TSESTree.MemberExpression)?.property as TSESTree.Identifier
	)?.name;
	const nameToCheck = nodeName || nodeCalleeName || nodeCalleePropertyName;

	const matchedValue = ignoredNames[nameToCheck];

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
