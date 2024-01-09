import { Rule } from "eslint";
import { findVariable, isComponentName } from '../utils';
import { checkVariableDeclaration, checkFunction} from './utils';
import type { MemoFunctionDeclaration, MemoFunctionExpression } from './types';
import { TSESTree } from "@typescript-eslint/types";

const rule: Rule.RuleModule = {
  meta: {
    messages: {
      "memo-required": "Component definition not wrapped in React.memo()",
    },
  },
  create: (context) => ({
     ExportNamedDeclaration(node) {
      // Check if the node has declaration and is a function
      if (node.declaration && node.declaration.type === 'VariableDeclaration') {
        const declarations = node.declaration.declarations;
        declarations.forEach(declaration => { 
          if (isComponentName((declaration?.id as TSESTree.Identifier)?.name)) {
            checkVariableDeclaration(context, declaration)
          }
        });
        return
      }
      if (node?.declaration?.type === 'FunctionDeclaration') {
        checkFunction(context, node.declaration as MemoFunctionDeclaration);
      }
    },
    ExportDefaultDeclaration(node) {
      // It was exported in one place but declared elsewhere
      if (node.declaration.type === 'Identifier') {
        const variable = findVariable(context.getScope(), node.declaration);
        
        if (variable && variable.defs[0] && variable.defs[0].type === 'Variable') {
          const variableNode = variable.defs[0].node;

          if (isComponentName((variableNode.id as TSESTree.Identifier).name)) {
            checkVariableDeclaration(context, variableNode);
          }
        }
        return
      } 
      if (node.declaration.type === 'FunctionDeclaration') {
        checkFunction(context, node.declaration as MemoFunctionDeclaration);
      }
    }
  }),
};

  export default rule;

