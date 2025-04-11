/**
 * ESLint V8 Rule Tester Configuration
 * Use this for testing rules with ESLint v8
 */
import { RuleTester } from "eslint";

export const ruleTester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
});
