import { Rule } from "eslint";
import { TSESTree } from "@typescript-eslint/types";
import { MessagesRequireUseMemo } from '../constants';
import {
  MemoStatus,
} from "../common";
import { ExpressionData } from "./types";

export function checkForErrors<T,Y extends Rule.NodeParentExtension | TSESTree.MethodDefinitionComputedName>(data: ExpressionData, expressionType: MemoStatus, context: Rule.RuleContext, node: Y, report: (node: Y, error: keyof typeof MessagesRequireUseMemo) => void) {
  const errorName = data?.[expressionType.toString()];
  if (errorName) {
    const strict = errorName.includes('unknown');
    if (!strict || (strict && context.options?.[0]?.strict)) {
      report(node as Y, errorName);
    }

  }
}