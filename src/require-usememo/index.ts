import { Rule } from "eslint";
import { TSESTree } from "@typescript-eslint/types";
import { ValidExpressions, jsxEmptyExpressionClassData, jsxEmptyExpressionData, callExpressionData, hookReturnExpressionData  } from './constants';
import { MessagesRequireUseMemo  } from '../constants';
import {
  getExpressionMemoStatus,
  isComplexComponent,
} from "../common";
import type {ExpressionTypes, NodeType, Node, ExpressionData} from './types';
import { checkForErrors, getIsHook } from './utils';

const rule: Rule.RuleModule  = {
  meta: {
    type: 'problem',
    messages: MessagesRequireUseMemo,
    docs: {
      description: 'Detects shallow comparison fails in React',
      recommended: true,
    },
    schema: [
      {
        type: "object",
        properties: { strict: { type: "boolean" }, checkHookReturnObject: { type: "boolean" } },
        additionalProperties: false,
      },
    ],
  },
  create: (context: Rule.RuleContext): Rule.RuleListener => {
    let isClass = false;
    function report<T extends Rule.NodeParentExtension | TSESTree.MethodDefinitionComputedName>(node: T, messageId: keyof typeof MessagesRequireUseMemo) {
      context.report({ node: node as unknown as Rule.Node, messageId: messageId as string });
    }

    function process(node: NodeType, _expression?: ExpressionTypes, expressionData?: ExpressionData) {

      const expression = _expression ?? (node.value && Object.prototype.hasOwnProperty.call(node.value, 'expression') ? (node.value as unknown as TSESTree.JSXExpressionContainer).expression : node.value ) ;
      switch(expression?.type) {
        case 'LogicalExpression':
          !expression.left ? true :  process(node, (expression as TSESTree.LogicalExpression).left);
          !expression.right ? true :  process(node, (expression as TSESTree.LogicalExpression).right);
          return;
        case 'JSXEmptyExpression':
          return;
        default:
          checkForErrors(expressionData || (isClass ? jsxEmptyExpressionClassData : jsxEmptyExpressionData), getExpressionMemoStatus(context, expression as TSESTree.Expression),context, node, report);
          return;
      } 
    }

    function JSXAttribute<T extends Rule.Node | TSESTree.MethodDefinitionComputedName>(node: T) {
      const { parent, value } = node as TSESTree.MethodDefinitionComputedName;
      if (value === null) return null;
      if (parent && !isComplexComponent(parent as TSESTree.JSXIdentifier)) return null;
      if ((value.type as string) === "JSXExpressionContainer") {
        process(node as TSESTree.MethodDefinitionComputedName);
      }
      return null;
    }

    return {
      JSXAttribute: JSXAttribute,

      ClassDeclaration: () => {
        isClass = true;
      },

      ReturnStatement(node) {
        const functionDeclarationNode = node.parent?.parent?.type === 'FunctionDeclaration' && node?.parent?.parent?.id;
        const anonFuncVariableDeclarationNode = node.parent?.parent?.type === 'ArrowFunctionExpression' && node?.parent?.parent?.parent?.type === 'VariableDeclarator' && node?.parent?.parent?.parent?.id;
        const validNode = functionDeclarationNode || anonFuncVariableDeclarationNode;
        if (validNode && getIsHook(validNode as TSESTree.Identifier) && node.argument) {
            if (node.argument.type === 'ObjectExpression' ) {
              if (context.options?.[0]?.checkHookReturnObject) {
                context.report({ node, messageId: "object-usememo-hook" });
                return;
              }
              const objExp = (node.argument as TSESTree.ObjectExpression);
              objExp?.properties.forEach((_node) => 
                process(_node as unknown as TSESTree.MethodDefinitionComputedName, (_node as TSESTree.Property).value as any , hookReturnExpressionData))
              return; 
            }
          process(node as unknown as TSESTree.MethodDefinitionComputedName, node.argument as ExpressionTypes, hookReturnExpressionData);
        }
      },


      CallExpression: (node) => {
        const { callee } = node;
        if (!getIsHook(callee as TSESTree.Node)) return;
        const [, dependencies] = (node as TSESTree.CallExpression).arguments;

        if (
          dependencies !== undefined &&
          dependencies.type === "ArrayExpression"
        ) {
          for (const dep of dependencies.elements) {
            if (dep !== null && ValidExpressions[dep.type]) {
              checkForErrors(callExpressionData, getExpressionMemoStatus(context, dep as TSESTree.Expression), context, node, report);
            }
          }
        }
      },
    };
  },
};

export default rule;