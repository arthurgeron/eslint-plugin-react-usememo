import type { Rule } from "eslint-v9";
import type { Rule as RuleV8 } from "eslint";
import type { TSESTree } from "@typescript-eslint/types";
import { defaultReactHookNames, jsxEmptyExpressionClassData, jsxEmptyExpressionData, callExpressionData, hookReturnExpressionData  } from './constants';
import { MessagesRequireUseMemo  } from '../constants/messages';
import {
  getExpressionMemoStatus,
  isComplexComponent,
  shouldIgnoreNode,
} from "../utils";
import type {ExpressionTypes, NodeType, ExpressionData, ReactImportInformation, ImportNode} from './types';
import { checkForErrors, fixBasedOnMessageId, getIsHook, type CompatibleContext } from './utils';
import { type ESNode, MemoStatus } from "src/types";
import { getCompatibleScope, type CompatibleNode } from "../utils/compatibility";
import type { CompatibleRuleModule } from "../utils/compatibility";

const rule: CompatibleRuleModule = {
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
        }, ignoredPropNames: { type: "array" } },
        additionalProperties: false,
      },
    ],
  },
  create: (context: CompatibleContext) => {
    let isClass = false;
    const importData: ReactImportInformation = {
      reactImported: false,
      useMemoImported: false,
      useCallbackImported: false,
    }

    function report<T extends Rule.NodeParentExtension | TSESTree.MethodDefinitionComputedName>(node: T, messageId: keyof typeof MessagesRequireUseMemo) {
        context.report({
          node: node as unknown as Rule.Node, 
          messageId, 
          fix(fixer) {
            const disableFixer = isClass || messageId === MemoStatus.ErrorInvalidContext;
            return disableFixer ? null : fixBasedOnMessageId(node as Rule.Node, messageId, fixer, context, importData);
          }
        });
    }

    function process(node: NodeType, _expression?: ExpressionTypes, expressionData?: ExpressionData, checkContext = false) {
      const isGlobalScope = getCompatibleScope(context, node)?.block.type === 'Program';
      
      if (checkContext && isGlobalScope) {
        return;
      }

      const expression = _expression ?? (node.value && Object.prototype.hasOwnProperty.call(node.value, 'expression') ? (node.value as unknown as TSESTree.JSXExpressionContainer).expression : node.value) ;
      switch(expression?.type) {
        case 'LogicalExpression':
          !expression.left ? true : process(node, (expression as TSESTree.LogicalExpression).left);
          !expression.right ? true : process(node, (expression as TSESTree.LogicalExpression).right);
          return;
        case 'JSXEmptyExpression':
          return;
        default:
          checkForErrors(
            expressionData || (isClass ? jsxEmptyExpressionClassData : jsxEmptyExpressionData), 
            getExpressionMemoStatus(context as Rule.RuleContext, expression as TSESTree.Expression, checkContext),
            context, 
            node, 
            report
          );
          return;
      } 
    }

    function JSXAttribute(node: CompatibleNode) {
      const ignoredPropNames = context.options?.[0]?.ignoredPropNames ?? [];
      const tsNode = node as unknown as TSESTree.JSXAttribute;

      const { parent, value } = tsNode;
      if (value === null) return null;
      if (parent && !isComplexComponent(parent as TSESTree.JSXIdentifier)) return null;
      if ((value.type as string) === "JSXExpressionContainer") {
        if (ignoredPropNames.includes(tsNode.name?.name)) {
          return null;
        }
        process(node as unknown as NodeType, undefined, undefined, true);
      }
      return null;
    }

    return {
      JSXAttribute,

      ClassDeclaration: () => {
        isClass = true;
      },

      ImportDeclaration(node: CompatibleNode) {
        const tsNode = node as TSESTree.ImportDeclaration;
        if (tsNode.source.value === 'react' && tsNode.importKind !== 'type') {
          importData.reactImported = true;
          const specifiers = Array.isArray(tsNode.specifiers) ? tsNode.specifiers.slice() : tsNode.specifiers;
          importData.importDeclaration = Object.assign({}, tsNode, {specifiers}) as TSESTree.ImportDeclaration;
          importData.useMemoImported = specifiers.some(specifier => specifier.local.name === 'useMemo');
          importData.useCallbackImported = specifiers.some(specifier => specifier.local.name === 'useCallback');
        }
      },

      ReturnStatement(node: CompatibleNode) {
        const tsNode = node as TSESTree.ReturnStatement;
        const functionDeclarationNode = tsNode.parent?.parent?.type === 'FunctionDeclaration' && tsNode?.parent?.parent?.id;
        const anonFuncVariableDeclarationNode = tsNode.parent?.parent?.type === 'ArrowFunctionExpression' && tsNode?.parent?.parent?.parent?.type === 'VariableDeclarator' && tsNode?.parent?.parent?.parent?.id;
        const validNode = functionDeclarationNode || anonFuncVariableDeclarationNode;
        
        if (validNode && getIsHook(validNode as TSESTree.Identifier) && tsNode.argument) {
          if (tsNode.argument.type === 'ObjectExpression') {
            if (context.options?.[0]?.checkHookReturnObject) {
              report(node as unknown as Rule.NodeParentExtension, "object-usememo-hook");
              return;
            }
            const objExp = (tsNode.argument as TSESTree.ObjectExpression);
            
            // Replace forEach with for...of to fix linting error
            for (const _node of objExp.properties) {
              process(
                _node as unknown as NodeType, 
                (_node as TSESTree.Property).value as unknown as ExpressionTypes, 
                hookReturnExpressionData
              );
            }
            return; 
          }
          process(
            node as unknown as NodeType, 
            tsNode.argument as unknown as ExpressionTypes, 
            hookReturnExpressionData
          );
        }
      },

      CallExpression: (node: CompatibleNode) => {
        const tsNode = node as TSESTree.CallExpression;
        const { callee } = tsNode;
        const ignoredNames = context.options?.[0]?.ignoredHookCallsNames ?? {};
        
        if (
          context.options?.[0]?.checkHookCalls === false
          || !getIsHook(callee as ESNode)
        ) {
          return;
        }

        if(!shouldIgnoreNode(node as ESNode, {...defaultReactHookNames, ...ignoredNames})) {
          for (const argument of tsNode.arguments) {
            if (argument.type !== 'SpreadElement') {
              checkForErrors(
                callExpressionData, 
                getExpressionMemoStatus(context as Rule.RuleContext, (argument as TSESTree.Expression)), 
                context, 
                node as Rule.Node, 
                report
              );
            }
          }
        }
      },
    };
  },
};

export default rule;