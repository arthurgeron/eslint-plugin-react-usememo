import { Rule } from "eslint";
import { TSESTree } from "@typescript-eslint/types";
import { MessagesRequireUseMemo } from '../constants';
import {
  MemoStatus,
} from "../common";
import type { ESNode, ExpressionData } from "./types";


export function shouldIgnoreNode(node: ESNode, ignoredNames: Record<string,boolean | undefined> ) {
  return !!ignoredNames[(node as TSESTree.Node as TSESTree.Identifier)?.name]
          || !!ignoredNames[(node.callee as TSESTree.Identifier).name]
          || !!ignoredNames[((node?.callee as TSESTree.MemberExpression)?.property as TSESTree.Identifier)?.name]
}

export function checkForErrors<T,Y extends Rule.NodeParentExtension | TSESTree.MethodDefinitionComputedName>(data: ExpressionData, expressionType: MemoStatus, context: Rule.RuleContext, node: Y | undefined, report: (node: Y, error: keyof typeof MessagesRequireUseMemo) => void) {
  const errorName = data?.[expressionType.toString()];
  if (errorName) {
    const strict = errorName.includes('unknown');
    if (!strict || (strict && context.options?.[0]?.strict)) {
      report(node as Y, errorName);
    }

  }
}

export function getIsHook(node: TSESTree.Node | TSESTree.Identifier) {
  if (node.type === "Identifier") {
    return node.name[0] === 'u' && node.name[1] === 's' && node.name[2] === 'e';
  } else if (
    node.type === "MemberExpression" &&
    !node.computed &&
    getIsHook(node.property)
  ) {
    const obj = node.object;
    return obj.type === "Identifier" && obj.name === "React";
  } else {
    return false;
  }
}