import { Rule, Scope } from "eslint";
import { TSESTree } from "@typescript-eslint/types";
import * as ESTree from "estree";
import { ESNode, MemoStatus, MemoStatusToReport } from "src/types";
import { getIsHook } from "src/require-usememo/utils";
import getVariableInScope from "src/utils/getVariableInScope";
import {Minimatch} from 'minimatch'

const componentNameRegex = /^[^a-z]/;

export function isComplexComponent(node: TSESTree.JSXOpeningElement | TSESTree.JSXIdentifier ) {
  if (node?.type !== "JSXOpeningElement") return false;
  if (node?.name?.type !== "JSXIdentifier") return false;
  return componentNameRegex.test(node?.name?.name);
}


export function isComponentName(name: string | undefined) {
  // All components are PascalCased, thoroughly checking for this only adds processing time and opens more chance to bugs/issues.
  return typeof name === 'string' && !!name && name?.[0] === name?.[0]?.toUpperCase()
}

function isCallExpression(
  node: TSESTree.CallExpression,
  name: "useMemo" | "useCallback"
) {
  if (node?.callee?.type === "MemberExpression") {
    const {
      callee: { object, property },
    } = node;
    if (
      object.type === "Identifier" &&
      property.type === "Identifier" &&
      object.name === "React" &&
      property.name === name
    ) {
      return true;
    }
  } else if (node?.callee?.type === "Identifier" && node.callee.name === name) {
    return true;
  }

  return false;
}



function getIdentifierMemoStatus(
  context: Rule.RuleContext,
  { name }: TSESTree.Identifier
): MemoStatusToReport {
  const variableInScope = getVariableInScope(context, name);
  if (variableInScope === undefined) return {status: MemoStatus.Memoized};
  const [{ node }] = variableInScope.defs;
  const isProps = node?.id?.type === 'Identifier' && (isComponentName(node.id.name) || getIsHook(node.id));
  // Avoid assuming a Hook or Component's props to be unmemoized
  if (isProps) {
    return;
  }

  const isFunctionParameter = node?.id?.name !== name;
  if (node.type === "FunctionDeclaration") return {node: node, status: isFunctionParameter ? MemoStatus.Memoized : MemoStatus.UnmemoizedFunction};
  if (node.type !== "VariableDeclarator") return {node: node, status: MemoStatus.Memoized};
  if (node?.parent?.kind === "let" && node?.init?.type === 'CallExpression' && getIsHook(node?.init?.callee)) {
    return {node: node.parent, status: MemoStatus.UnsafeLet};
  }
  return getExpressionMemoStatus(context, node.init);
}

export function getExpressionMemoStatus(
  context: Rule.RuleContext,
  expression: TSESTree.Expression
): MemoStatusToReport {
  switch (expression?.type) {
    case undefined:
    case "ObjectExpression":
      return {node: expression, status: MemoStatus.UnmemoizedObject};
    case "ArrayExpression":
      return {node: expression, status: MemoStatus.UnmemoizedArray};
    case "NewExpression":
      return {node: expression, status: MemoStatus.UnmemoizedNew};
    case "FunctionExpression":
    case "ArrowFunctionExpression":
      return {node: expression, status: MemoStatus.UnmemoizedFunction};
    case "JSXElement":
      return {node: expression, status: MemoStatus.UnmemoizedJSX};
    case "CallExpression": {
      const validCallExpression = isCallExpression(expression, "useMemo") ||
      isCallExpression(expression, "useCallback");

      return {node: expression, status: validCallExpression ? MemoStatus.Memoized : MemoStatus.UnmemoizedFunctionCall};
    }
    case "Identifier":
      return getIdentifierMemoStatus(context, expression);
    case "BinaryExpression":
      return {node: expression, status: MemoStatus.Memoized};
    default:
      return {node: expression, status: MemoStatus.UnmemoizedOther};
  }
}

export function findVariable(scope: Scope.Scope, node: ESTree.Identifier): Scope.Variable | undefined {
  if (scope.variables.some(variable => variable.name === node.name)) {
    return scope.variables.find(variable => variable.name === node.name);
  }

  if (scope.upper) {
    return findVariable(scope.upper, node);
  }

  return undefined;
}


export function shouldIgnoreNode(node: ESNode, ignoredNames: Record<string, boolean | undefined>) {
  const nodeName = (node as TSESTree.Node as TSESTree.Identifier)?.name;
  const nodeCalleeName = (node?.callee as TSESTree.Identifier)?.name;
  const nodeCalleePropertyName = ((node?.callee as TSESTree.MemberExpression)?.property as TSESTree.Identifier)?.name;
  const nameToCheck = nodeName || nodeCalleeName || nodeCalleePropertyName;

  const matchedValue = ignoredNames[nameToCheck];

    // Checking for 1:1 matches
    if (matchedValue != undefined) {
      return matchedValue;
    }

    // This rule ignores React's "use" hook by default, more info in the rule's README
    if (nameToCheck === 'use') {
      return true;
    }

    // Checking via patterns
    let shouldIgnore;
    
    Object.keys(ignoredNames).find(key => {
      const value = ignoredNames[key];
      const miniMatch = new Minimatch(key);
      if (miniMatch.hasMagic()) {
         const isMatch = (nameToCheck && miniMatch.match(nameToCheck));
          if (isMatch) {
            shouldIgnore = !!value;
            return true;
          }
      }
      return false;
    });

    return !!shouldIgnore;
}