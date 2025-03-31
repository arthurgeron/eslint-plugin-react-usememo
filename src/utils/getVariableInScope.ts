import type { Rule } from "eslint-v9";
import { safeGetScope } from "../require-memo/utils";

/**
 * Get a variable in the current scope by name
 * This is a wrapper around context.getScope().variables.find()
 * that uses safeGetScope to handle both ESLint v8 and v9
 */
export default function getVariableInScope(context: Rule.RuleContext, name: string) {
  const scopeMethod = safeGetScope(context); 
  try {
    // @ts-expect-error TypeScript doesn't know if this works with different ESLint versions
    return scopeMethod().variables.find((variable) => variable.name === name);
  } catch (error) {
    // Fallback for ESLint v9 where a node parameter may be required
    // @ts-expect-error Different ESLint versions have different type requirements
    return scopeMethod(null).variables.find((variable) => variable.name === name);
  }
}