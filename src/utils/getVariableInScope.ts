import type { Rule } from "eslint-v9";
import type { Rule as RuleV8 } from "eslint";
import { CompatibleNode, getCompatibleScope } from "../utils/compatibility";
import type { CompatibleContext } from "../require-usememo/utils";

/**
 * Get a variable in the current scope by name
 * This is a wrapper around context.getScope().variables.find()
 * that uses getCompatibleScope to handle both ESLint v8 and v9
 */
export default function getVariableInScope(context: CompatibleContext, node: CompatibleNode, name: string) {
  try {
    // Try to get scope without a node parameter (ESLint v8 style)
    return getCompatibleScope(context, node)?.variables.find((variable) => {
      return variable.name === name;
    });
  } catch (error) {
    // If that fails, we might not be able to get a global scope directly
    return undefined;
  }
}