/**
 * ESLint V8 Rule Tester Configuration
 * Use this for testing rules with ESLint v8
 */
import { RuleTester } from "eslint";

export const ruleTesterV8 = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
});

// Add a dummy test to prevent Jest errors
// This is only for the file itself and won't be used by rule tests
if (process.env.NODE_ENV === 'test') {
  describe('ESLint V8 RuleTester', () => {
    test('exports a valid RuleTester', () => {
      expect(ruleTesterV8).toBeDefined();
    });
  });
} 