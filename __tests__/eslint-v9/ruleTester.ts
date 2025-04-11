/**
 * ESLint V9 Rule Tester Configuration
 * Use this for testing rules with ESLint v9 flat config format
 * 
 * Note: When running tests with ESLint v9, you need to use ESLint v9 installed
 * This file is designed to work when you switch to ESLint v9
 */
import { RuleTester } from "eslint-v9";

export const createRuleTesterV9 = () => {
  // For ESLint v9, we need to use the flat config format with jsx support
  return new RuleTester({
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    }
  });
};

