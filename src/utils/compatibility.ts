import type { Rule } from "eslint";
import type { Rule as RuleV9 } from "eslint-v9";
import type { TSESTree } from "@typescript-eslint/types";

// Type that represents a node from either ESLint v8 or v9
export type CompatibleNode = Rule.Node | RuleV9.Node | TSESTree.Node;

/**
 * Utility to safely get scope in both ESLint v8 and v9
 */
export function getCompatibleScope(
	context: Rule.RuleContext | RuleV9.RuleContext,
	node?: CompatibleNode,
) {
	if (typeof context.getScope === "function") {
		// ESLint v8 approach
		return context.getScope();
	}

	const v9Context = context as unknown as RuleV9.RuleContext;
	if (
		v9Context.sourceCode &&
		typeof v9Context.sourceCode.getScope === "function"
	) {
		// ESLint v9 approach

		if (!node) {
			throw new Error("Node is required for ESLint v9");
		}
		return v9Context.sourceCode.getScope(node as RuleV9.Node);
	}

	throw new Error("Failed to fetch scope method");
}

/**
 * Safely get the filename in a way that works with both ESLint v8 and v9
 */
export function getCompatibleFilename(
	context: Rule.RuleContext | RuleV9.RuleContext,
): string {
	if (typeof context.getFilename === "function") {
		// ESLint v8 approach
		return context.getFilename();
	}

	const v9Context = context as RuleV9.RuleContext;
	return v9Context.filename || "<input>";
}

/**
 * Create a type that works for both ESLint v8 and v9 rule modules
 * This relaxes the typing to allow both versions to work together
 */
export type CompatibleRuleModule = {
	meta: {
		messages?: Record<string, string>;
		type?: string;
		docs?: {
			description?: string;
			category?: string;
			recommended?: boolean;
			url?: string;
		};
		fixable?: "code" | "whitespace";
		schema?: unknown[];
	};
	create: (
		context: Rule.RuleContext | RuleV9.RuleContext,
	) => Record<string, (node: CompatibleNode) => unknown>;
};
