/**
 * ESLint v9 tests for require-memo rule
 *
 * To run these tests with ESLint v9:
 * 1. Temporarily update package.json to use eslint v9
 * 2. Run: yarn install
 * 3. Run: yarn test __tests__/require-memo-v9.test.ts
 */
import { createRequireMemoTestCases } from "../testCases";
import { createRuleTesterV9 } from "./ruleTester";
import rule from "../../src/require-memo";
import type { Rule } from "eslint-v9";

const ruleTesterV9 = createRuleTesterV9();

const { validTestCases, invalidTestCases } = createRequireMemoTestCases();

// Use type assertion to handle incompatibility between v8 and v9 rule formats
ruleTesterV9.run("Require-memo (ESLint v9)", rule as unknown as Rule.RuleModule, {
	valid: validTestCases,
	invalid: invalidTestCases,
});
