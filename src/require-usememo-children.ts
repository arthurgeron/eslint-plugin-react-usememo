import type { Rule } from "eslint";
import type { Rule as RuleV9 } from "eslint-v9";
import type * as ESTree from "estree";
import type { TSESTree } from "@typescript-eslint/types";
import {
  getExpressionMemoStatus,
  isComplexComponent,
} from "./utils";
import { MessagesRequireUseMemoChildren } from "./constants/messages";
import { MemoStatus } from "src/types";
import type { CompatibleContext } from "./require-usememo/utils";
import type { CompatibleNode, CompatibleRuleModule } from "./utils/compatibility";

const rule: CompatibleRuleModule = {
  meta: {
    messages: MessagesRequireUseMemoChildren,
    schema: [
      {
        type: "object",
        properties: { strict: { type: "boolean" } },
        additionalProperties: false,
      },
    ],
  },
  create: (context: CompatibleContext) => {
    let isClass = false;
    function report(node: CompatibleNode, messageId: keyof typeof MessagesRequireUseMemoChildren) {
      context.report({ node: node as any, messageId: messageId as string });
    }

    return {
      ClassDeclaration: () => {
        isClass = true;
      },

      JSXElement: (node: CompatibleNode) => {
        const tsNode = node as unknown as TSESTree.JSXElement;
        const {
          children,
          openingElement,
        } = tsNode;
        if (isClass || !isComplexComponent(openingElement)) return;

        for (const child of children) {
          if (child.type === "JSXElement" || child.type === "JSXFragment") {
            report(node, "jsx-usememo-children");
            return;
          }
          if (child.type === "JSXExpressionContainer") {
            const { expression } = child;
            if (expression.type !== "JSXEmptyExpression") {
              const statusData = getExpressionMemoStatus(context, expression);
              switch (statusData?.status) {
                case MemoStatus.UnmemoizedObject:
                  report(node, "object-usememo-children");
                  break;
                case MemoStatus.UnmemoizedArray:
                  report(node, "array-usememo-children");
                  break;
                case MemoStatus.UnmemoizedNew:
                  report(node, "instance-usememo-children");
                  break;
                case MemoStatus.UnmemoizedFunction:
                  report(node, "function-usecallback-children");
                  break;
                case MemoStatus.UnmemoizedFunctionCall:
                case MemoStatus.UnmemoizedOther:
                  if (context.options?.[0]?.strict) {
                    report(node, "unknown-usememo-children");
                  }
                  break;
                case MemoStatus.UnmemoizedJSX:
                  report(node, "jsx-usememo-children");
                  break;
              }
            }
          }
        }
      },
    };
  },
};

export default rule;
