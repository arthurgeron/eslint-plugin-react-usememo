import { Rule } from "eslint";
import { TSESTree } from "@typescript-eslint/types";
import { Messages, ValidExpressions } from './constants';
import {
  getExpressionMemoStatus,
  isComplexComponent,
  MemoStatus,
} from "./common";

type ExpressionTypes = TSESTree.ArrowFunctionExpression | TSESTree.JSXExpressionContainer | TSESTree.Expression | TSESTree.ObjectExpression | TSESTree.ArrayExpression | TSESTree.Identifier | TSESTree.LogicalExpression | TSESTree.JSXEmptyExpression;

type NodeType = TSESTree.MethodDefinitionComputedName;

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

const rule: {meta: Rule.RuleModule['meta'], create: (context: Rule.RuleContext) => void } = {
  meta: {
    type: 'problem',
    messages: Messages,
    docs: {
      description: 'Detects shallow comparison fails in React',
      recommended: true,
    },
    schema: [
      {
        type: "object",
        properties: { strict: { type: "boolean" } },
        additionalProperties: false,
      },
    ],
  },
  create: (context: Rule.RuleContext) => {
    function report(node: NodeType, messageId: keyof typeof Messages) {
      context.report({ node: node as unknown as Rule.Node, messageId: messageId as string });
    }

    function process(node: NodeType, _expression?: ExpressionTypes) {

      const expression = _expression ?? (node.value && Object.prototype.hasOwnProperty.call(node.value, 'expression') ? (node.value as unknown as TSESTree.JSXExpressionContainer).expression : node.value ) ;

      switch(expression?.type) {
        case 'JSXEmptyExpression':
          process(node, (expression as TSESTree.JSXEmptyExpression));
          return;
        case 'LogicalExpression':
          !expression.left ? true :  process(node, (expression as TSESTree.LogicalExpression).left);
          !expression.right ? true :  process(node, (expression as TSESTree.LogicalExpression).right);
          return;
        case 'JSXEmptyExpression':
          return;
        default:
          switch (getExpressionMemoStatus(context, expression as TSESTree.Expression)) {
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
      JSXAttribute: (node: NodeType) => {
        const { parent, value } = node;
        if (value === null) return;
        if (parent && !isComplexComponent(parent as TSESTree.JSXIdentifier)) return;
        if ((value.type as string) === "JSXExpressionContainer") {
          process(node);
        }
      },

      CallExpression: (node: TSESTree.CallExpression & TSESTree.JSXExpressionContainer &
        Rule.NodeParentExtension) => {
        const { callee } = node;
        if (!isHook(callee)) return;

        const [, dependencies] = (node as TSESTree.CallExpression).arguments;

        if (
          dependencies !== undefined &&
          dependencies.type === "ArrayExpression"
        ) {
          for (const dep of dependencies.elements) {
            if (dep !== null && ValidExpressions[dep.type]) {
              switch (getExpressionMemoStatus(context, dep as TSESTree.Expression)) {
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