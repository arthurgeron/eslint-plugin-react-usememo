import type { Rule } from "eslint";
import { findVariable, isComponentName } from '../utils';
import { checkVariableDeclaration, checkFunction} from './utils';
import type { MemoFunctionDeclaration, MemoFunctionExpression } from './types';
import type { TSESTree } from "@typescript-eslint/types";

const rule: Rule.RuleModule = {
  meta: {
    messages: {
      "memo-required": "Component definition not wrapped in React.memo()",
    },
    schema: [
      {
        type: "object",
        properties: { ignoredComponents: {type: "object"} },
        additionalProperties: false,
      },
    ],
  },
  create: (context) => {
    // ESLint V9 compatibility - get scope from context.sourceCode if available
    const getScope = (node: TSESTree.Node) => {
      if (typeof context.getScope === 'function') {
        return context.getScope();
      }
      if (context.sourceCode && typeof context.sourceCode.getScope === 'function') {
        // Pass the node to getScope, required in ESLint V9
        return context.sourceCode.getScope(node);
      }
      // Fallback for ESLint V9
      return { variables: [] };
    };

    return {
      ExportNamedDeclaration(node) {
        // Check if the node has declaration and is a function
        if (node.declaration && node.declaration.type === 'VariableDeclaration') {
          const declarations = node.declaration.declarations;
          for (const declaration of declarations) { 
            if (isComponentName((declaration?.id as TSESTree.Identifier)?.name)) {
              checkVariableDeclaration(context, declaration as TSESTree.VariableDeclarator)
            }
          }
          return
        }
        if (node?.declaration?.type === 'FunctionDeclaration') {
          checkFunction(context, node.declaration as MemoFunctionDeclaration);
        }
      },
      ExportDefaultDeclaration(node) {
        // It was exported in one place but declared elsewhere
        if (node.declaration.type === 'Identifier') {
          const variable = findVariable(getScope(node), node.declaration);
          
          if (variable?.defs[0]?.type === 'Variable') {
            const variableNode = variable.defs[0].node;

            if (isComponentName((variableNode.id as TSESTree.Identifier).name)) {
              checkVariableDeclaration(context, variableNode as TSESTree.VariableDeclarator);
            }
          }
          return
        } 
        if (node.declaration.type === 'FunctionDeclaration') {
          checkFunction(context, node.declaration as MemoFunctionDeclaration);
        }
      }
    };
  },
};

export default rule;

