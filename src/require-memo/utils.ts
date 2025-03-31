import type { Rule } from "eslint";
import type { Rule as RuleV9 } from "eslint-v9";
import type * as ESTree from "estree";
import { isComponentName, shouldIgnoreNode } from '../utils';
import * as path from "path";

import type { MemoFunctionExpression, MemoVariableIdentifier} from './types';
import { ESNode } from "src/types";

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
  const ignoredNames = context.options?.[0]?.ignoredComponents;
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
      if (isComponentName(id?.name) && (!ignoredNames || !shouldIgnoreNode(id as unknown as ESNode, ignoredNames))) {
        context.report({ node, messageId: "memo-required" });
      }
    }
  } else if (
    node.type === "FunctionDeclaration" &&
    currentNode.type === "Program"
  ) {
    if(ignoredNames && !shouldIgnoreNode(node as unknown as ESNode, ignoredNames)) {
      return;
    }
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
      if (declarationProperties?.name === 'memo') {
        checkFunction(context, (declaration.init.arguments[0]) as MemoVariableIdentifier);
        return;
      }
    } else if (declaration.init.type === 'ArrowFunctionExpression' || declaration.init.type === 'FunctionExpression') {
      checkFunction(context, declaration.init as MemoFunctionExpression);
      return;
    }
  } 
}

export function safeGetScope(context: Rule.RuleContext | RuleV9.RuleContext) {
	if (typeof context.getScope === "function") {
		return context.getScope;
	}
	const v9Context = context as unknown as RuleV9.RuleContext;
	if (
		v9Context.sourceCode &&
		typeof v9Context.sourceCode.getScope === "function"
	) {
		return (node: Rule.Node | undefined | null) => {
			if (!node) {
				return v9Context.sourceCode.scopeManager.globalScope;
			}
			return v9Context.sourceCode.getScope(node as RuleV9.Node);
		};
	}
	throw new Error("Failed to fetch scope method");
}
