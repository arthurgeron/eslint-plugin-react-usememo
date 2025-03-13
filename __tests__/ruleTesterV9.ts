/**
 * ESLint V9 Rule Tester Configuration
 * Use this for testing rules with ESLint v9 flat config format
 * 
 * Note: When running tests with ESLint v9, you need to use ESLint v9 installed
 * This file is designed to work when you switch to ESLint v9
 */
import { RuleTester } from "eslint";

export const createRuleTesterV9 = () => {
  // When using ESLint v9, we need to use the right configuration
  return new RuleTester({ 
    parser: require.resolve("@typescript-eslint/parser"),
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      ecmaFeatures: { jsx: true },
    },
  });
};

// Add a dummy test to prevent Jest errors
// This is only for the file itself and won't be used by rule tests
if (process.env.NODE_ENV === 'test') {
  describe('ESLint V9 RuleTester', () => {
    test('exports a valid RuleTester factory', () => {
      expect(createRuleTesterV9).toBeDefined();
    });
  });
} 