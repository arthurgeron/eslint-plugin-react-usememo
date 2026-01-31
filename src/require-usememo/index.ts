import type { Rule } from "eslint";
import type { TSESTree } from "@typescript-eslint/types";
import { defaultReactHookNames, jsxEmptyExpressionClassData, jsxEmptyExpressionData, callExpressionData, hookReturnExpressionData  } from './constants';
import { MessagesRequireUseMemo  } from '../constants/messages';
import {
  getExpressionMemoStatus,
  getIsHook,
  isComplexComponent,
  shouldIgnoreNode,
} from "../utils";
import type { ExpressionTypes, ExpressionData, ReactImportInformation } from './types';
import { checkForErrors, fixBasedOnMessageId } from './utils';
import { MemoStatus } from "src/types";
import {
	getCompatibleScope,
	type CompatibleContext,
	type CompatibleNode,
	type CompatibleRuleModule,
} from "../utils/compatibility";

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

    function report(
      node: CompatibleNode,
      messageId: keyof typeof MessagesRequireUseMemo,
      data?: Record<string, string>,
    ) {
      context.report({
        node: node as Rule.Node,
        messageId,
        data,
        fix(fixer) {
          const disableFixer = isClass || messageId === MemoStatus.ErrorInvalidContext;
          return disableFixer
            ? null
            : fixBasedOnMessageId(node, messageId, fixer, context, importData);
        }
      });
    }

    function getNodeExpression(
      node: CompatibleNode,
      fallback?: ExpressionTypes,
    ): ExpressionTypes | undefined {
      if (fallback) return fallback;
      if (node.type === "JSXAttribute") {
        const value = node.value;
        if (!value) return undefined;
        if (value.type === "JSXExpressionContainer") {
          return value.expression as ExpressionTypes;
        }
        return value as ExpressionTypes;
      }
      if (node.type === "ReturnStatement") {
        return (node.argument ?? undefined) as ExpressionTypes | undefined;
      }
      if (node.type === "Property") {
        return node.value as ExpressionTypes;
      }
      return undefined;
    }

    function process(node: CompatibleNode, _expression?: ExpressionTypes, expressionData?: ExpressionData, checkContext = false) {
      const isGlobalScope = getCompatibleScope(context, node)?.block.type === 'Program';
      
      if (checkContext && isGlobalScope) {
        return;
      }

      const expression = getNodeExpression(node, _expression);
      if (!expression || expression.type === "JSXEmptyExpression") {
        return;
      }
      if (expression.type === "LogicalExpression") {
        !expression.left
          ? true
          : process(node, expression.left as ExpressionTypes, expressionData, checkContext);
        !expression.right
          ? true
          : process(node, expression.right as ExpressionTypes, expressionData, checkContext);
        return;
      }
      checkForErrors(
        expressionData || (isClass ? jsxEmptyExpressionClassData : jsxEmptyExpressionData), 
        getExpressionMemoStatus(context, expression as TSESTree.Expression, checkContext),
        context, 
        node, 
        report
      );
    }

    function JSXAttribute(node: CompatibleNode) {
      const ignoredPropNames = context.options?.[0]?.ignoredPropNames ?? [];
      const tsNode = node as TSESTree.JSXAttribute;

      const { parent, value } = tsNode;
      if (value === null) return null;
      if (!parent || parent.type !== "JSXOpeningElement") return null;
      if (!isComplexComponent(parent)) return null;
      if ((value.type as string) === "JSXExpressionContainer") {
        if (ignoredPropNames.includes(tsNode.name?.name)) {
          return null;
        }
        process(node, undefined, undefined, true);
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
              report(node, "object-usememo-hook");
              return;
            }
            const objExp = (tsNode.argument as TSESTree.ObjectExpression);
            
            // Replace forEach with for...of to fix linting error
            for (const property of objExp.properties) {
              if (property.type === "Property") {
                process(
                  property, 
                  property.value as ExpressionTypes, 
                  hookReturnExpressionData
                );
              }
            }
            return; 
          }
          process(
            node, 
            tsNode.argument as ExpressionTypes, 
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
          || !getIsHook(callee as TSESTree.Node)
        ) {
          return;
        }

        if(!shouldIgnoreNode(node, {...defaultReactHookNames, ...ignoredNames})) {
          for (const argument of tsNode.arguments) {
            if (argument.type !== 'SpreadElement') {
              checkForErrors(
                callExpressionData, 
                getExpressionMemoStatus(context, (argument as TSESTree.Expression)), 
                context, 
                node, 
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