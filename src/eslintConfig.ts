import requireMemoRule from "./require-memo";
import requireUseMemoRule from "./require-usememo";
import requireUseMemoChildrenRule from "./require-usememo-children";

// Traditional rule exports
export const rules = {
  "require-memo": requireMemoRule,
  "require-usememo": requireUseMemoRule,
  "require-usememo-children": requireUseMemoChildrenRule,
};

// Flat config export
export const configs = {
  flat: {
    meta: {
      name: "@arthurgeron/eslint-plugin-react-usememo",
      version: "2.5.0"
    },
    plugins: ["@arthurgeron/react-usememo"],
    rules: {
      "@arthurgeron/react-usememo/require-usememo": "error",
    },
  },
};
