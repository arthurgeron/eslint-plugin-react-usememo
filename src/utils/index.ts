import type { Rule, Scope } from "eslint";
import type { TSESTree } from "@typescript-eslint/types";
import {
	MemoStatus,
	type MemoStatusToReport,
	type InvalidContextInfo,
} from "src/types";
import type { CompatibleContext, CompatibleNode } from "src/utils/compatibility";
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

type FunctionNode =
	| TSESTree.FunctionDeclaration
	| TSESTree.FunctionExpression
	| TSESTree.ArrowFunctionExpression;

function isFunctionNode(node: TSESTree.Node): node is FunctionNode {
	return (
		node.type === "FunctionDeclaration" ||
		node.type === "FunctionExpression" ||
		node.type === "ArrowFunctionExpression"
	);
}

function getChildNodes(node: TSESTree.Node): TSESTree.Node[] {
	const children: TSESTree.Node[] = [];
	for (const [key, value] of Object.entries(node)) {
		if (key === "parent" || !value) {
			continue;
		}
		if (Array.isArray(value)) {
			for (const item of value) {
				if (item && typeof item === "object" && "type" in item) {
					children.push(item as TSESTree.Node);
				}
			}
			continue;
		}
		if (typeof value === "object" && "type" in value) {
			children.push(value as TSESTree.Node);
		}
	}
	return children;
}

function containsReturnStatement(node: TSESTree.Node): boolean {
	if (isFunctionNode(node)) {
		return false;
	}
	const stack = [node];
	while (stack.length) {
		const current = stack.pop();
		if (!current) {
			continue;
		}
		if (current.type === "ReturnStatement") {
			return true;
		}
		if (isFunctionNode(current)) {
			continue;
		}
		stack.push(...getChildNodes(current));
	}
	return false;
}

function containsNode(root: TSESTree.Node, target: TSESTree.Node): boolean {
	if (root === target) {
		return true;
	}
	if (isFunctionNode(root)) {
		return false;
	}
	const stack = [root];
	while (stack.length) {
		const current = stack.pop();
		if (!current) {
			continue;
		}
		if (current === target) {
			return true;
		}
		if (isFunctionNode(current)) {
			continue;
		}
		stack.push(...getChildNodes(current));
	}
	return false;
}

function findParentFunction(
	node: TSESTree.Node & Rule.NodeParentExtension,
): FunctionNode | undefined {
	let current = node.parent as (TSESTree.Node & Rule.NodeParentExtension) | null;
	while (current) {
		if (isFunctionNode(current)) {
			return current;
		}
		current = current.parent as (TSESTree.Node & Rule.NodeParentExtension) | null;
	}
	return undefined;
}

function hasPriorReturnInFunction(
	returnStatement: TSESTree.ReturnStatement,
): boolean {
	const functionNode = findParentFunction(returnStatement);
	if (!functionNode || functionNode.body.type !== "BlockStatement") {
		return false;
	}
	for (const statement of functionNode.body.body) {
		if (containsNode(statement, returnStatement)) {
			return false;
		}
		if (containsReturnStatement(statement)) {
			return true;
		}
	}
	return false;
}

function getConditionalContext(
	node: TSESTree.Node,
): InvalidContextInfo | undefined {
	switch (node.type) {
		case "IfStatement":
			return { kind: "conditional", name: "an if/else branch" };
		case "ConditionalExpression":
			return { kind: "conditional", name: "a conditional (ternary) expression" };
		case "LogicalExpression":
			return { kind: "conditional", name: "a logical expression" };
		case "SwitchCase":
			return { kind: "conditional", name: "a switch case" };
		case "SwitchStatement":
			return { kind: "conditional", name: "a switch statement" };
		case "ForStatement":
		case "ForInStatement":
		case "ForOfStatement":
		case "WhileStatement":
		case "DoWhileStatement":
			return { kind: "loop", name: "a loop body" };
		default:
			return undefined;
	}
}

export function isImpossibleToFix(
	node: CompatibleNode,
): { result: false } | { result: true; node: CompatibleNode; invalidContext: InvalidContextInfo } {
	let current = node as (TSESTree.Node & Rule.NodeParentExtension) | undefined;
	let returnStatement: TSESTree.ReturnStatement | undefined;

	while (current) {
		if (current.type === "ReturnStatement" && !returnStatement) {
			returnStatement = current;
		}
		if (current.type === "CallExpression") {
			const callee = current.callee as TSESTree.CallExpression["callee"];
			const iterationName =
				callee.type === "MemberExpression" &&
				callee.property.type === "Identifier"
					? callee.property.name
					: undefined;
			const isInsideIteration =
				!!iterationName && iterationName in Array.prototype;
			const isInsideOtherHook =
				callee.type === "Identifier" &&
				(callee.name === "useMemo" || callee.name === "useCallback");
			if (isInsideIteration && iterationName) {
				return {
					result: true,
					node: callee,
					invalidContext: {
						kind: "iteration",
						name: iterationName,
					},
				};
			}
			if (isInsideOtherHook) {
				return {
					result: true,
					node: callee,
					invalidContext: {
						kind: "hook",
						name: callee.name,
					},
				};
			}
			return { result: false };
		}
		const conditionalContext = getConditionalContext(current);
		if (conditionalContext) {
			return {
				result: true,
				node: current as CompatibleNode,
				invalidContext: conditionalContext,
			};
		}
		current = current.parent as
			| (TSESTree.Node & Rule.NodeParentExtension)
			| undefined;
	}

	if (returnStatement && hasPriorReturnInFunction(returnStatement)) {
		return {
			result: true,
			node: returnStatement as CompatibleNode,
			invalidContext: {
				kind: "early-return",
				name: "after a conditional return",
			},
		};
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

function getInvalidContextReport(expression: TSESTree.Expression) {
	const impossibleFix = isImpossibleToFix(expression);
	if (impossibleFix?.result) {
		return {
			node: impossibleFix.node as CompatibleNode,
			status: MemoStatus.ErrorInvalidContext,
			invalidContext: impossibleFix.invalidContext,
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
				(checkContext && getInvalidContextReport(expression)) || {
					node: expression as CompatibleNode,
					status: MemoStatus.UnmemoizedObject,
				}
			);
		case "ArrayExpression":
			return (
				(checkContext && getInvalidContextReport(expression)) || {
					node: expression as CompatibleNode,
					status: MemoStatus.UnmemoizedArray,
				}
			);
		case "NewExpression":
			return (
				(checkContext && getInvalidContextReport(expression)) || {
					node: expression as CompatibleNode,
					status: MemoStatus.UnmemoizedNew,
				}
			);
		case "FunctionExpression":
		case "ArrowFunctionExpression": {
			return (
				(checkContext && getInvalidContextReport(expression)) || {
					node: expression as CompatibleNode,
					status: MemoStatus.UnmemoizedFunction,
				}
			);
		}
		case "JSXElement":
			return (
				(checkContext && getInvalidContextReport(expression)) || {
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
					getInvalidContextReport(expression)) || {
					node: expression as CompatibleNode,
					status: validCallExpression
						? MemoStatus.Memoized
						: MemoStatus.UnmemoizedFunctionCall,
				}
			);
		}
		case "ConditionalExpression":
			return (
				(checkContext && getInvalidContextReport(expression)) || {
					node: expression as CompatibleNode,
					status: MemoStatus.UnmemoizedOther,
				}
			);
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
	const current = node as ParentNode | null | undefined;
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
