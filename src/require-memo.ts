import { Rule } from "eslint";
import { isComponentName } from './utils';
import * as ESTree from "estree";
import * as path from "path";

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

function checkFunction(
  context: Rule.RuleContext,
  node: (
    | ESTree.ArrowFunctionExpression
    | ESTree.FunctionExpression
    | ESTree.FunctionDeclaration
  ) &
    Rule.NodeParentExtension
) {
  let currentNode = node.parent;
  while (currentNode.type === "CallExpression") {
    if (isMemoCallExpression(currentNode)) {
      return;
    }

    currentNode = currentNode.parent;
  }

  if (currentNode.type === "VariableDeclarator") {
    const { id } = currentNode;
    if (id.type === "Identifier") {
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

const rule: Rule.RuleModule = {
  meta: {
    messages: {
      "memo-required": "Component definition not wrapped in React.memo()",
    },
  },
  create: (context) => ({
    ArrowFunctionExpression(node) {
      checkFunction(context, node);
    },
    FunctionDeclaration(node) {
      checkFunction(context, node);
    },
    FunctionExpression(node) {
      checkFunction(context, node);
    },
  }),
};

export default rule;
