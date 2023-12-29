
import type { Rule } from "eslint";
import type * as ESTree from "estree";
import { isComponentName } from '../utils';
import * as path from "path";

import type { MemoFunctionExpression, MemoVariableIdentifier} from './types';

function isMemoCallExpression(node: Rule.Node) {
  if (node.type !== "CallExpression") return false;
  if (node.callee?.type === "MemberExpression") {
    const {
      callee: { object, property },
    } = node;
    if (
      object.type === "Identifier" &&
      property.type === "Identifier" &&
      object.name === "React" &&
      property.name === "memo"
    ) {
      return true;
    }
  } else if (node.callee?.type === "Identifier" && node.callee?.name === "memo") {
    return true;
  }

  return false;
}

export function checkFunction(
  context: Rule.RuleContext,
  node: (
    | ESTree.ArrowFunctionExpression
    | ESTree.FunctionExpression
    | ESTree.FunctionDeclaration
    | ESTree.Identifier
  ) &
    Rule.NodeParentExtension
) {
  let currentNode = node.type === 'FunctionDeclaration' ? node : node.parent;
  while (currentNode.type === "CallExpression") {
    if (isMemoCallExpression(currentNode)) {
      return;
    }

    currentNode = currentNode.parent;
  }

  if (currentNode.type === "VariableDeclarator" || currentNode.type === 'FunctionDeclaration') {
    const { id } = currentNode;
    if (id?.type === "Identifier") {
      if (isComponentName(id?.name)) {
        context.report({ node, messageId: "memo-required" });
      }
    }
  } else if (
    node.type === "FunctionDeclaration" &&
    currentNode.type === "Program"
  ) {
    if (node.id !== null &&isComponentName(node.id?.name)) {
      context.report({ node, messageId: "memo-required" });
    } else {
      if (context.getFilename() === "<input>") return;
      const filename = path.basename(context.getFilename());
      if (isComponentName(filename)) {
        context.report({ node, messageId: "memo-required" });
      }
    }
  }
}



export function checkVariableDeclaration(context: Rule.RuleContext, declaration: ESTree.VariableDeclarator ) {
  if (declaration.init) {
    if (declaration.init.type === 'CallExpression') {
      const declarationProperties = ((declaration.init.callee as MemoVariableIdentifier).name ? declaration.init.callee : (declaration.init.callee as ESTree.MemberExpression).property) as MemoVariableIdentifier;
      if (declarationProperties.name === 'memo') {
        checkFunction(context, (declaration.init.arguments[0]) as MemoVariableIdentifier);
        return;
      }
    } else if (declaration.init.type === 'ArrowFunctionExpression' || declaration.init.type === 'FunctionExpression') {
      checkFunction(context, declaration.init as MemoFunctionExpression);
      return;
    }
  } 
  checkFunction(context, declaration.id as MemoVariableIdentifier);
}