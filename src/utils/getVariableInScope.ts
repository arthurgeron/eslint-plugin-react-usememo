import type { Rule } from "eslint";

export default function getVariableInScope(context: Rule.RuleContext, name: string) {
  return context.getScope().variables.find((variable) => variable.name === name);
}