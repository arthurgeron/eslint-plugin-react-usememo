import { Rule } from "eslint";
import * as ESTree from "estree";
import { TSESTree } from "@typescript-eslint/types";
import {
  getExpressionMemoStatus,
  isComplexComponent,
  MemoStatus,
} from "./common";
import { ValidExpressions } from "./constants";

type NodeType = TSESTree.JSXAttribute &
Rule.NodeParentExtension;

function isHook(node: TSESTree.Node) {
  if (node.type === "Identifier") {
    return node.name[0] === 'u' && node.name[1] === 's' && node.name[2] === 'e';
  } else if (
    node.type === "MemberExpression" &&
    !node.computed &&
    isHook(node.property)
  ) {
    const obj = node.object;
    return obj.type === "Identifier" && obj.name === "React";
  } else {
    return false;
  }
}

const messages = {
  "object-usememo-props":
    "Object literal should be wrapped in React.useMemo() when used as a prop",
  "object-usememo-deps":
    "Object literal should be wrapped in React.useMemo() when used as a hook dependency",
  "array-usememo-props":
    "Array literal should be wrapped in React.useMemo() when used as a prop",
  "array-usememo-deps":
    "Array literal should be wrapped in React.useMemo() when used as a hook dependency",
  "instance-usememo-props":
    "Object instantiation should be wrapped in React.useMemo() when used as a prop",
  "instance-usememo-deps":
    "Object instantiation should be wrapped in React.useMemo() when used as a hook dependency",
  "jsx-usememo-props":
    "JSX should be wrapped in React.useMemo() when used as a prop",
  "jsx-usememo-deps":
    "JSX should be wrapped in React.useMemo() when used as a hook dependency",
  "function-usecallback-props":
    "Function definition should be wrapped in React.useCallback() when used as a prop",
  "function-usecallback-deps":
    "Function definition should be wrapped in React.useCallback() when used as a hook dependency",
  "unknown-usememo-props":
    "Unknown value may need to be wrapped in React.useMemo() when used as a prop",
  "unknown-usememo-deps":
    "Unknown value may need to be wrapped in React.useMemo() when used as a hook dependency",
  "usememo-const":
    "useMemo/useCallback return value should be assigned to a const to prevent reassignment",
};

const rule: Rule.RuleModule = {
  meta: {
    messages,
    schema: [
      {
        type: "object",
        properties: { strict: { type: "boolean" } },
        additionalProperties: false,
      },
    ],
  },
  create: (context) => {
    function report(node: Rule.Node, messageId: keyof typeof messages) {
      context.report({ node, messageId: messageId as string });
    }

    function process(node: NodeType, expression: NodeType['value']['expression']) {
      switch(expression.type) {
        case 'JSXEmptyExpression':
          process(node, expression.expression);
          return;
        case 'LogicalExpression':
          !expression.left ? true :  process(node, expression.left);
          !expression.right ? true :  process(node, expression.right);
          return;
        case 'JSXEmptyExpression':
          return;
        default:
          switch (getExpressionMemoStatus(context, expression)) {
            case MemoStatus.UnmemoizedObject:
              report(node, "object-usememo-props");
              return;
            case MemoStatus.UnmemoizedArray:
              report(node, "array-usememo-props");
              return;
            case MemoStatus.UnmemoizedNew:
              report(node, "instance-usememo-props");
              return;
            case MemoStatus.UnmemoizedFunction:
              report(node, "function-usecallback-props");
              return;
            case MemoStatus.UnmemoizedFunctionCall:
            case MemoStatus.UnmemoizedOther:
              if (context.options?.[0]?.strict) {
                report(node, "unknown-usememo-props");
              }
              return;
            case MemoStatus.UnmemoizedJSX:
              report(node, "jsx-usememo-props");
              return;
          }
          return;
      } 
    }

    return {
      JSXAttribute: (node: ESTree.Node & Rule.NodeParentExtension) => {
        const { parent, value } = (node as unknown) as NodeType;
        if (value === null) return;
        if (!isComplexComponent(parent)) return;
        if (value.type === "JSXExpressionContainer") {
          const { expression } = value;
          process(node, expression);
        }
      },

      CallExpression: (node: TSESTree.CallExpression &
        Rule.NodeParentExtension) => {
        const { callee } = (node as unknown) as TSESTree.CallExpression &
          Rule.NodeParentExtension;
        if (!isHook(callee)) return;
        const {
          arguments: [, dependencies],
        } = (node as unknown) as TSESTree.CallExpression &
          Rule.NodeParentExtension;
        if (
          dependencies !== undefined &&
          dependencies.type === "ArrayExpression"
        ) {
          for (const dep of dependencies.elements) {
            if (dep !== null && ValidExpressions[dep.type]) {
              switch (getExpressionMemoStatus(context, dep)) {
                case MemoStatus.UnmemoizedObject:
                  report(node, "object-usememo-deps");
                  break;
                case MemoStatus.UnmemoizedArray:
                  report(node, "array-usememo-deps");
                  break;
                case MemoStatus.UnmemoizedNew:
                  report(node, "instance-usememo-deps");
                  break;
                case MemoStatus.UnmemoizedFunction:
                  report(node, "function-usecallback-deps");
                  break;
                case MemoStatus.UnmemoizedFunctionCall:
                case MemoStatus.UnmemoizedOther:
                  if (context.options?.[0]?.strict) {
                    report(node, "unknown-usememo-deps");
                  }
                  break;
                case MemoStatus.UnmemoizedJSX:
                  report(node, "jsx-usememo-deps");
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