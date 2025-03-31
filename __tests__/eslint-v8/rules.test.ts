import { createRequireMemoTestCases } from "../testcases/requireMemo";
import { createRequireUseCallbackTestCases } from "../testcases/requireUseCallback";
import { createRequireUseMemoTestCases } from "../testcases/requireUseMemo";
import { createRequireUseMemoChildrenTestCases } from "../testcases/requireUseMemoChildren";
import { ruleTester } from "./ruleTester";
import requireMemo from "../../src/require-memo";
import requireUseCallback from "../../src/require-usememo";
import requireUseMemo from "../../src/require-usememo";
import requireUseMemoChildren from "../../src/require-usememo-children";
import type { Rule } from "eslint";

const {
	validTestCases: validMemoTestCases,
	invalidTestCases: invalidMemoTestCases,
} = createRequireMemoTestCases();

const {
	validTestCases: validUseCallbackTestCases,
	invalidTestCases: invalidUseCallbackTestCases,
} = createRequireUseCallbackTestCases();

const {
	validTestCases: validUseMemoTestCases,
	invalidTestCases: invalidUseMemoTestCases,
} = createRequireUseMemoTestCases();

const {
	validTestCases: validUseMemoChildrenTestCases,
	invalidTestCases: invalidUseMemoChildrenTestCases,
} = createRequireUseMemoChildrenTestCases();

describe("ESLint v8", () => {
	describe("Require-memo", () => {
		ruleTester.run("Require-memo", requireMemo as unknown as Rule.RuleModule, {
			valid: validMemoTestCases as any,
			invalid: invalidMemoTestCases as any,
		});
	});

	describe("Require-usecallback", () => {
		ruleTester.run("useCallback", requireUseCallback as unknown as Rule.RuleModule, {
			valid: validUseCallbackTestCases as any,
			invalid: invalidUseCallbackTestCases as any,
		});
	});

	describe("Require-usememo", () => {
		ruleTester.run("useMemo", requireUseMemo as unknown as Rule.RuleModule, {
			valid: validUseMemoTestCases as any,
			invalid: invalidUseMemoTestCases as any,
		});
	});

	describe("Require-usememo-children", () => {
		ruleTester.run("useMemo children", requireUseMemoChildren as unknown as Rule.RuleModule, {
			valid: validUseMemoChildrenTestCases as any,
			invalid: invalidUseMemoChildrenTestCases as any,
		});
	});
});
