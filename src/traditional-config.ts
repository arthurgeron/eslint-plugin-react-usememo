import requireMemoRule from "./require-memo";
import requireUseMemoRule from "./require-usememo";
import requireUseMemoChildrenRule from "./require-usememo-children";
import type { Rule } from "eslint";
import type { CompatibleRuleModule } from "./utils/compatibility";

// Define plugin metadata for ESLint v8 compatibility
const meta = {
  name: "@arthurgeron/eslint-plugin-react-usememo",
  version: "2.5.0"
};

// Traditional rule exports with proper typing (ESLint v8)
// Use a more flexible typing that works for both v8 and v9
export const rules: Record<string, Rule.RuleModule | CompatibleRuleModule> = {
  "require-memo": requireMemoRule,
  "require-usememo": requireUseMemoRule,
  "require-usememo-children": requireUseMemoChildrenRule,
};

// Legacy configs export (for ESLint v8 and below)
export const configs = {
  recommended: {
    plugins: ["@arthurgeron/react-usememo"],
    rules: {
      "@arthurgeron/react-usememo/require-usememo": "error",
      "@arthurgeron/react-usememo/require-memo": "error",
      "@arthurgeron/react-usememo/require-usememo-children": "error",
    },
  },
};

// Add meta information to each rule
for (const ruleName of Object.keys(rules)) {
  const rule = rules[ruleName] as CompatibleRuleModule;
  rule.meta = {
    ...rule.meta,
    docs: {
      ...rule.meta.docs,
      url: `https://github.com/arthurgeron/eslint-plugin-react-usememo/blob/main/docs/rules/${ruleName}.md`
    }
  };
} 