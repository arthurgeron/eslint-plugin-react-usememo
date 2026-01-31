import type { Scope } from "eslint";
import {
	CompatibleNode,
	getCompatibleScope,
	type CompatibleContext,
} from "../utils/compatibility";

/**
 * Get a variable in the current scope by name
 * This is a wrapper around the scope manager lookup
 */
export default function getVariableInScope(
	context: CompatibleContext,
	node: CompatibleNode,
	name: string,
): Scope.Variable | undefined {
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