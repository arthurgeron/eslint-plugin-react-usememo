import type { Rule, Scope, SourceCode } from "eslint";
import type { TSESTree } from "@typescript-eslint/types";

export type CompatibleNode = Rule.Node | TSESTree.Node;
export type CompatibleContext = Rule.RuleContext;
export type CompatibleScope = Scope.Scope;
export type CompatibleSourceCode = SourceCode;

export function getCompatibleScope(
	context: CompatibleContext,
	node: CompatibleNode,
): CompatibleScope {
	const sourceCode = getCompatibleSourceCode(context);
	if (typeof sourceCode.getScope === "function") {
		return sourceCode.getScope(node as Rule.Node);
	}

	const scope =
		sourceCode.scopeManager.acquire(node as Rule.Node, true) ??
		sourceCode.scopeManager.globalScope;
	if (!scope) {
		throw new Error("Failed to fetch scope");
	}
	return scope;
}

export function getCompatibleFilename(
	context: CompatibleContext,
): string {
	if ("getFilename" in context && typeof context.getFilename === "function") {
		return context.getFilename();
	}

	return "filename" in context && context.filename ? context.filename : "<input>";
}

export function getCompatibleSourceCode(
	context: CompatibleContext,
): CompatibleSourceCode {
	if ("getSourceCode" in context && typeof context.getSourceCode === "function") {
		return context.getSourceCode();
	}

	if ("sourceCode" in context && context.sourceCode) {
		return context.sourceCode as CompatibleSourceCode;
	}

	throw new Error("Failed to fetch source code");
}

export type CompatibleRuleModule = Rule.RuleModule;
