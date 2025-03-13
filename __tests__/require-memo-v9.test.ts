/**
 * ESLint v9 tests for require-memo rule
 * 
 * To run these tests with ESLint v9:
 * 1. Temporarily update package.json to use eslint v9
 * 2. Run: yarn install
 * 3. Run: yarn test __tests__/require-memo-v9.test.ts
 */
import { createRequireMemoTestCases } from './testCases';
import { createRuleTesterV9 } from './ruleTesterV9';
import rule from '../src/require-memo';

if (process.env.TEST_ESLINT_V9 === 'true') {
  const ruleTesterV9 = createRuleTesterV9();
  
  const { validTestCases, invalidTestCases } = createRequireMemoTestCases();

  ruleTesterV9.run('Require-memo (ESLint v9)', rule, {
    valid: validTestCases,
    invalid: invalidTestCases,
  });
} else {
  describe('ESLint v9 Tests - require-memo', () => {
    test('Skipped in ESLint v8 environment', () => {
      console.log('Skipping ESLint v9 tests in v8 environment. Set TEST_ESLINT_V9=true to run.');
    });
  });
} 