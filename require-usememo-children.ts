import { Rule } from "eslint";
import * as ESTree from "estree";
import { TSESTree } from "@typescript-eslint/types";
import {
  getExpressionMemoStatus,
  isComplexComponent,
  MemoStatus,
} from "./common";
import { MessagesRequireUseMemoChildren } from "./constants";

const componentNameRegex = /^[^a-z]/;
const hookNameRegex = /^use[A-Z0-9].*$/;

const rule: Rule.RuleModule = {
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
  create: (context) => {
    function report(node: Rule.Node, messageId: keyof typeof MessagesRequireUseMemoChildren) {
      context.report({ node, messageId: messageId as string });
    }

    return {
      JSXElement: (node: ESTree.Node & Rule.NodeParentExtension) => {
        const {
          children,
          openingElement,
        } = (node as unknown) as TSESTree.JSXElement & Rule.NodeParentExtension;
        if (!isComplexComponent(openingElement)) return;

        for (const child of children) {
          if (child.type === "JSXElement" || child.type === "JSXFragment") {
            report(node, "jsx-usememo-children");
            return;
          }
          if (child.type === "JSXExpressionContainer") {
            const { expression } = child;
            if (expression.type !== "JSXEmptyExpression") {
              switch (getExpressionMemoStatus(context, expression)) {
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
