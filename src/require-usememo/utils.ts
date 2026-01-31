import type { Rule } from "eslint";
import type { TSESTree } from "@typescript-eslint/types";
import type { MessagesRequireUseMemo } from "../constants/messages";
import type { ExpressionData, ReactImportInformation } from "./types";
import { MemoStatus, type MemoStatusToReport } from "src/types";
import {
	messageIdToHookDict,
	nameGeneratorUUID,
	defaultImportRangeStart,
} from "./constants";
import { findParentType } from "src/utils";
import getVariableInScope from "src/utils/getVariableInScope";
import { v5 as uuidV5 } from "uuid";
import {
	getCompatibleSourceCode,
	type CompatibleContext,
	type CompatibleNode,
} from "../utils/compatibility";

export function checkForErrors<Y extends CompatibleNode>(
	data: ExpressionData,
	statusData: MemoStatusToReport,
	context: CompatibleContext,
	node: Y | undefined,
	report: (
		node: Y,
		error: keyof typeof MessagesRequireUseMemo,
		data?: Record<string, string>,
	) => void,
) {
	if (!statusData) {
		return;
	}
	if (statusData.status === MemoStatus.ErrorInvalidContext) {
		const invalidContext = statusData.invalidContext;
		const contextLabel =
			invalidContext?.kind === "hook"
				? `${invalidContext.name}() callback`
				: invalidContext?.kind === "iteration"
					? `Array.${invalidContext.name}() iteration`
					: "a hook callback or array iteration";
		report((statusData.node ?? node) as Y, MemoStatus.ErrorInvalidContext, {
			context: contextLabel,
		});
	}
	const errorName = data?.[statusData.status.toString()];
	if (errorName) {
		const strict = errorName.includes("unknown");
		if (!strict || (strict && context.options?.[0]?.strict)) {
			report((statusData.node ?? node) as Y, errorName);
		}
	}
}

function addReactImports(
	context: CompatibleContext,
	kind: "useMemo" | "useCallback",
	reactImportData: ReactImportInformation,
	fixer: Rule.RuleFixer,
) {
	const importsDisabled = context.options?.[0]?.fix?.addImports === false;
	let specifier: TSESTree.ImportClause | undefined = undefined;

	if (importsDisabled) {
		return;
	}

	if (!reactImportData[`${kind}Imported`]) {
		// Create a new ImportSpecifier for useMemo/useCallback hook.
		specifier = {
			type: "ImportSpecifier",
			imported: { type: "Identifier", name: kind },
			local: { type: "Identifier", name: kind },
		} as TSESTree.ImportSpecifier;

		if (reactImportData.importDeclaration?.specifiers) {
			const specifiers = reactImportData.importDeclaration.specifiers;
			const hasDefaultExport =
				specifiers?.[0]?.type === "ImportDefaultSpecifier";
			const isEmpty = !specifiers.length;
			// Default export counts as a specifier too
			const shouldCreateSpecifiersBracket =
				specifiers.length <= 1 && hasDefaultExport;
			const hasCurrentSpecifier =
				!isEmpty &&
				!shouldCreateSpecifiersBracket &&
				specifiers.find((x) => x.local.name === kind);

			if (shouldCreateSpecifiersBracket) {
				specifiers.push(specifier);
				return fixer.insertTextAfter(specifiers[0], `, { ${kind} }`);
			}

			if (isEmpty) {
				const importDeclaration =
					reactImportData.importDeclaration as TSESTree.ImportDeclaration;
				const fixRange =
					importDeclaration.range[0] + defaultImportRangeStart.length - 1;

				return fixer.insertTextAfterRange([fixRange, fixRange], ` ${kind} `);
			}

			if (!hasCurrentSpecifier) {
				specifiers.push(specifier);
				const insertPosition = specifiers.find(
					(specifier) =>
						!!specifier.range &&
						(!hasDefaultExport || specifier.type !== "ImportDefaultSpecifier"),
				);

				if (insertPosition) {
					return fixer.insertTextAfter(insertPosition, `, ${kind}`);
				}
				return;
			}
		}
	}

	// If React is not imported, create a new ImportDeclaration for it.
	if (!reactImportData.reactImported && !reactImportData.importDeclaration) {
		reactImportData.importDeclaration = {
			type: "ImportDeclaration",
			specifiers: [
				{
					...specifier,
					range: [
						defaultImportRangeStart.length,
						defaultImportRangeStart.length + kind.length,
					],
				},
			],
			source: { type: "Literal", value: "react" },
		} as TSESTree.ImportDeclaration;
		reactImportData.reactImported = true;
		reactImportData[`${kind}Imported`] = true;

		// Add an extra new line before const component and use indentSpace for proper spacing.
		return fixer.insertTextBeforeRange(
			[0, 0],
			`${defaultImportRangeStart}${kind} } from 'react';\n`,
		);
	}
	return;
}

function fixFunction(
	node:
		| TSESTree.FunctionDeclaration
		| TSESTree.FunctionExpression
		| TSESTree.ArrowFunctionExpression,
	context: CompatibleContext,
	shouldSetName?: boolean,
) {
	const sourceCode = getCompatibleSourceCode(context);
	const { body, params = [] } = node;
	const funcBody = sourceCode.getText(body as Rule.Node);
	const funcParams = (params as Array<Rule.Node>).map((node) =>
		sourceCode.getText(node),
	);
	let fixedCode = `useCallback(${node.async ? "async " : ""}(${funcParams.join(", ")}) => ${funcBody}, [])${shouldSetName ? ";" : ""}`;
	if (shouldSetName && node?.id?.name) {
		const name = node?.id?.name;
		fixedCode = `const ${name} = ${fixedCode}`;
	}
	return fixedCode;
}

function getSafeVariableName(
	context: CompatibleContext,
	node: CompatibleNode | undefined,
	name: string,
	attempts = 0,
): string {
	const tempVarPlaceholder = "renameMe";

	if (node && !getVariableInScope(context, node, name)) {
		return name;
	}
	if (attempts >= 5) {
		const nameExtensionIfExists =
			node && getVariableInScope(context, node, tempVarPlaceholder)
				? uuidV5(name, nameGeneratorUUID).split("-")[0]
				: "";
		return `${tempVarPlaceholder}${nameExtensionIfExists ? `_${nameExtensionIfExists}` : ""}`;
	}
	return getSafeVariableName(context, node, `_${name}`, ++attempts);
}

// Eslint Auto-fix logic, functional components/hooks only
export function fixBasedOnMessageId(
	node: CompatibleNode,
	messageId: keyof typeof MessagesRequireUseMemo,
	fixer: Rule.RuleFixer,
	context: CompatibleContext,
	reactImportData: ReactImportInformation,
) {
	// Get source code in a way that works with both v8 and v9
	const sourceCode = getCompatibleSourceCode(context);

	const hook = messageIdToHookDict[messageId] || "useMemo";
	const isObjExpression = node.type === "ObjectExpression";
	const isJSXElement = node.type === "JSXElement";
	const isArrowFunctionExpression = node.type === "ArrowFunctionExpression";
	const isFunctionExpression = node.type === "FunctionExpression";
	const isCorrectableFunctionExpression =
		isFunctionExpression || isArrowFunctionExpression;
	const fixes: Array<Rule.Fix> = [];

	// Determine what type of behavior to follow according to the error message
	switch (messageId) {
		case "function-usecallback-hook":
			if (
				node.type === "FunctionExpression" ||
				node.type === "ArrowFunctionExpression"
			) {
				const functionNode =
					node as TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression;
				const importStatementFixes = addReactImports(
					context,
					"useCallback",
					reactImportData,
					fixer,
				);
				const fixed = fixFunction(functionNode, context);
				importStatementFixes && fixes.push(importStatementFixes);
				fixes.push(fixer.replaceText(node as Rule.Node, fixed));
				return fixes;
			}
			break;
		case "object-usememo-hook": {
			const _returnNode = node as TSESTree.ReturnStatement;
			// An undefined node.argument means returned value is not an expression, but most probably a variable which should not be handled here, which falls under default, simpler fix logic.
			if (_returnNode.argument) {
				const importStatementFixes = addReactImports(
					context,
					"useMemo",
					reactImportData,
					fixer,
				);
				const fixed = `useMemo(() => (${sourceCode.getText(_returnNode.argument as Rule.Node)}), [])`;
				importStatementFixes && fixes.push(importStatementFixes);
				fixes.push(
					fixer.replaceText(
						_returnNode.argument as Rule.Node,
						fixed,
					),
				);
				return fixes;
			}
			break;
		}
		case "function-usecallback-props":
		case "object-usememo-props":
		case "jsx-usememo-props":
		case "usememo-const": {
			const variableDeclaration =
				node.type === "VariableDeclaration"
					? (node as TSESTree.VariableDeclaration)
					: (findParentType(
							node,
							"VariableDeclaration",
						) as TSESTree.VariableDeclaration | undefined);

			// Check if it is a hook being stored in let/var, change to const if so
			if (variableDeclaration && variableDeclaration.kind !== "const") {
				const tokens = sourceCode.getTokens(
					variableDeclaration as Rule.Node,
				);
				const letKeywordToken = tokens?.[0];
				if (letKeywordToken?.value !== "const") {
					fixes.push(fixer.replaceTextRange(letKeywordToken.range, "const"));
				}
			}
			// If it's an dynamic object - Add useMemo/Callback
			if (isObjExpression || isJSXElement || isCorrectableFunctionExpression) {
				const importStatementFixes = addReactImports(
					context,
					isCorrectableFunctionExpression ? "useCallback" : "useMemo",
					reactImportData,
					fixer,
				);
				importStatementFixes && fixes.push(importStatementFixes);
				const fixed = isCorrectableFunctionExpression
					? fixFunction(
							node as
								| TSESTree.FunctionExpression
								| TSESTree.ArrowFunctionExpression,
							context,
						)
					: `useMemo(() => (${sourceCode.getText(node as Rule.Node)}), [])`;
				const parent = (node as Rule.NodeParentExtension).parent as
					| CompatibleNode
					| undefined;
				// Means we have a object expression declared directly in jsx
				if (parent?.type === "JSXExpressionContainer") {
					const parentAttribute =
						parent.parent as TSESTree.JSXAttribute | undefined;
					const parentPropName =
						parentAttribute?.name.type === "JSXIdentifier"
							? parentAttribute.name.name
							: "value";
					const newVarName = getSafeVariableName(
						context,
						parent.parent as CompatibleNode,
						parentPropName,
					);
					const returnStatement = findParentType(node, "ReturnStatement");

					if (
						returnStatement?.type === "ReturnStatement" &&
						returnStatement.range &&
						returnStatement.loc
					) {
						const indentationLevel =
							sourceCode.lines[
								returnStatement.loc.start.line - 1
							].search(/\S/);
						const indentation = " ".repeat(indentationLevel);
						// Creates a declaration for the variable and inserts it before the return statement
						fixes.push(
							fixer.insertTextBeforeRange(
								returnStatement.range,
								`const ${newVarName} = ${fixed};\n${indentation}`,
							),
						);
						// Replaces the old inline object expression with the variable name
						fixes.push(fixer.replaceText(node as Rule.Node, newVarName));
					}
				} else {
					fixes.push(fixer.replaceText(node as Rule.Node, fixed));
				}
			}

			return !fixes.length ? null : fixes;
		}
		// Unknown cases are usually complex issues or false positives, so we ignore them
		case "unknown-class-memo-props":
		case "unknown-usememo-hook":
		case "unknown-usememo-deps":
		case "unknown-usememo-props":
		case "error-in-invalid-context":
			return null;
	}

	// Simpler cases bellow, all of them are just adding useMemo/Callback
	const functionPrefix = isArrowFunctionExpression ? "" : "() => ";
	const expressionPrefix = isObjExpression || isJSXElement ? "(" : "";
	const coreExpression = sourceCode.getText(node as Rule.Node);
	const expressionSuffix = isObjExpression ? ")" : "";

	let fixed = `${hook}(${functionPrefix}${expressionPrefix}${coreExpression}${expressionSuffix}, [])`;
	const importStatementFixes = addReactImports(
		context,
		hook,
		reactImportData,
		fixer,
	);
	importStatementFixes && fixes.push(importStatementFixes);

	if (node.type === "FunctionDeclaration") {
		const _node = node as TSESTree.FunctionDeclaration;
		if (_node && _node?.id?.type === "Identifier") {
			fixed = fixFunction(_node, context, true);
		}
	}

	if ("computed" in node) {
		const computed = (node as { computed?: unknown }).computed;
		if (
			computed &&
			typeof computed === "object" &&
			"type" in computed &&
			(computed as TSESTree.Node).type === "ArrowFunctionExpression"
		) {
			fixes.push(
				fixer.replaceText(computed as Rule.Node, fixed),
			);
			return fixes;
		}
	}
	fixes.push(fixer.replaceText(node as Rule.Node, fixed));
	return fixes;
}
