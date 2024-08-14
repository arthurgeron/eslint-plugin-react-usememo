import { Rule } from "eslint";
import { TSESTree } from "@typescript-eslint/types";
import { defaultReactHookNames, jsxEmptyExpressionClassData, jsxEmptyExpressionData, callExpressionData, hookReturnExpressionData  } from './constants';
import { MessagesRequireUseMemo  } from '../constants';
import {
  getExpressionMemoStatus,
  isComplexComponent,
  shouldIgnoreNode,
} from "../utils";
import type {ExpressionTypes, NodeType, ExpressionData, ReactImportInformation, ImportNode} from './types';
import { checkForErrors, fixBasedOnMessageId, getIsHook } from './utils';
import { ESNode, MemoStatus } from "src/types";

const rule: Rule.RuleModule  = {
  meta: {
    type: 'problem',
    messages: MessagesRequireUseMemo,
    docs: {
      description: 'Detects shallow comparison fails in React',
      recommended: true,
    },
    fixable: 'code',
    schema: [
      {
        type: "object",
        properties: { strict: { type: "boolean" }, checkHookReturnObject: { type: "boolean" }, checkHookCalls: { type: "boolean"}, ignoredHookCallsNames: {type: "object"}, fix: {
          addImports: "boolean",
        } },
        additionalProperties: false,
      },
    ],
  },
  create: (context: Rule.RuleContext): Rule.RuleListener => {
    let isClass = false;
    let importData: ReactImportInformation = {
      reactImported: false,
      useMemoImported: false,
      useCallbackImported: false,
    }

    function report<T extends Rule.NodeParentExtension | TSESTree.MethodDefinitionComputedName>(node: T, messageId: keyof typeof MessagesRequireUseMemo) {
        context.report( {node: node as Rule.Node, messageId , fix(fixer) {
          const disableFixer = isClass || messageId === MemoStatus.ErrorInvalidContext;
          return disableFixer ? null : fixBasedOnMessageId(node as Rule.Node, messageId, fixer, context, importData);
        }} );
    }

    function process(node: NodeType, _expression?: ExpressionTypes, expressionData?: ExpressionData, checkContext = false) {

      const isGlobalScope = context.getScope().block.type === 'Program';
      if (checkContext && isGlobalScope) {
        return;
      }

      const expression = _expression ?? (node.value && Object.prototype.hasOwnProperty.call(node.value, 'expression') ? (node.value as unknown as TSESTree.JSXExpressionContainer).expression : node.value ) ;
      switch(expression?.type) {
        case 'LogicalExpression':
          !expression.left ? true :  process(node, (expression as TSESTree.LogicalExpression).left);
          !expression.right ? true :  process(node, (expression as TSESTree.LogicalExpression).right);
          return;
        case 'JSXEmptyExpression':
          return;
        default:
          checkForErrors(expressionData || (isClass ? jsxEmptyExpressionClassData : jsxEmptyExpressionData), getExpressionMemoStatus(context, expression as TSESTree.Expression, checkContext),context, node, report);
          return;
      } 
    }

    function JSXAttribute<T extends Rule.Node | TSESTree.MethodDefinitionComputedName>(node: T) {
      const { parent, value } = node as TSESTree.MethodDefinitionComputedName;
      if (value === null) return null;
      if (parent && !isComplexComponent(parent as TSESTree.JSXIdentifier)) return null;
      if ((value.type as string) === "JSXExpressionContainer") {
        process(node as TSESTree.MethodDefinitionComputedName, undefined, undefined, true);
      }
      return null;
    }

    return {
      JSXAttribute: JSXAttribute,

      ClassDeclaration: () => {
        isClass = true;
      },

      ImportDeclaration(node) {
        if (node.source.value === 'react' && (node as TSESTree.ImportDeclaration).importKind !== 'type') {
          importData.reactImported = true;
          const specifiers = Array.isArray(node.specifiers) ? node.specifiers.slice() : node.specifiers;
          importData.importDeclaration = Object.assign({}, node, {specifiers}) as TSESTree.ImportDeclaration;
          importData.useMemoImported = specifiers.some(specifier => specifier.local.name === 'useMemo');
          importData.useCallbackImported = specifiers.some(specifier => specifier.local.name === 'useCallback');
        }
      },

      ReturnStatement(node) {
        const functionDeclarationNode = node.parent?.parent?.type === 'FunctionDeclaration' && node?.parent?.parent?.id;
        const anonFuncVariableDeclarationNode = node.parent?.parent?.type === 'ArrowFunctionExpression' && node?.parent?.parent?.parent?.type === 'VariableDeclarator' && node?.parent?.parent?.parent?.id;
        const validNode = functionDeclarationNode || anonFuncVariableDeclarationNode;
        if (validNode && getIsHook(validNode as TSESTree.Identifier) && node.argument) {
            if (node.argument.type === 'ObjectExpression' ) {
              if (context.options?.[0]?.checkHookReturnObject) {
                report(node, "object-usememo-hook" );
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
        const ignoredNames = context.options?.[0]?.ignoredHookCallsNames ?? {};
        if (
          context.options?.[0]?.checkHookCalls === false
          || !getIsHook(callee as ESNode)
        ) {
          return;
        }

        if(!shouldIgnoreNode(node as ESNode, {...defaultReactHookNames, ...ignoredNames})) {
          for (const argument of node.arguments) {
            if (argument.type !== 'SpreadElement') {
              checkForErrors(callExpressionData, getExpressionMemoStatus(context, (argument as TSESTree.Expression)), context, node, report);
            }
          }
        }
      },
    };
  },
};

export default rule;