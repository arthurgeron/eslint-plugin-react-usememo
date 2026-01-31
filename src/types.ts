import type { CompatibleNode } from "./utils/compatibility";

export type MemoStatusToReport = {
	node?: CompatibleNode;
	status: MemoStatus;
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
 