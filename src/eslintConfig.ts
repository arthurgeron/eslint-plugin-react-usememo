import requireMemoRule from "./require-memo";
import requireUseMemoRule from "./require-usememo";
import requireUseMemoChildrenRule from "./require-usememo-children";
import type { Rule } from "eslint";

// Define plugin metadata for ESLint v9 compatibility
const meta = {
  name: "@arthurgeron/eslint-plugin-react-usememo",
  version: "2.5.0"
};

// Traditional rule exports with proper typing
export const rules: Record<string, Rule.RuleModule> = {
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
  rules[ruleName].meta = {
    ...rules[ruleName].meta,
    docs: {
      ...rules[ruleName].meta?.docs,
      url: `https://github.com/arthurgeron/eslint-plugin-react-usememo/blob/main/docs/rules/${ruleName}.md`
    }
  };
}
