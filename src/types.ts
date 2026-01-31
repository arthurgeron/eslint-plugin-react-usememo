import type { CompatibleNode } from "./utils/compatibility";

export type InvalidContextInfo = {
	kind: "hook" | "iteration";
	name: string;
};

export type MemoStatusToReport = {
	node?: CompatibleNode;
	status: MemoStatus;
	invalidContext?: InvalidContextInfo;
} | undefined;

export enum MemoStatus {
	Memoized,
	UnmemoizedObject,
	UnmemoizedArray,
	UnmemoizedNew,
	UnmemoizedFunction,
	UnmemoizedFunctionCall,
	UnmemoizedJSX,
	UnmemoizedOther,
	UnsafeLet,
	ErrorInvalidContext = "error-in-invalid-context",
}
 