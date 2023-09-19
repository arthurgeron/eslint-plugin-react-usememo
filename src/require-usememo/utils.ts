import { Rule, SourceCode } from "eslint";
import { TSESTree } from "@typescript-eslint/types";
import type * as ESTree from "estree";
import { MessagesRequireUseMemo } from '../constants';
import type { ESNode, ExpressionData, NodeType } from "./types";
import { MemoStatusToReport } from "src/types";
import { messageIdToHookDict } from "./constants";
import { getVariableInScope } from "src/common";


export function shouldIgnoreNode(node: ESNode, ignoredNames: Record<string,boolean | undefined> ) {
  return !!ignoredNames[(node as TSESTree.Node as TSESTree.Identifier)?.name]
          || !!ignoredNames[(node.callee as TSESTree.Identifier).name]
          || !!ignoredNames[((node?.callee as TSESTree.MemberExpression)?.property as TSESTree.Identifier)?.name]
}

export function checkForErrors<T,Y extends Rule.NodeParentExtension | TSESTree.MethodDefinitionComputedName>(data: ExpressionData, statusData: MemoStatusToReport, context: Rule.RuleContext, node: Y | undefined, report: (node: Y, error: keyof typeof MessagesRequireUseMemo) => void) {
  if (!statusData) {
    return;
  }
  const errorName = data?.[statusData.status.toString()];
  if (errorName) {
    const strict = errorName.includes('unknown');
    if (!strict || (strict && context.options?.[0]?.strict)) {
      report((statusData.node ?? node) as Y, errorName);
    }

  }
}

export function getIsHook(node: TSESTree.Node | TSESTree.Identifier) {
  if (node.type === "Identifier") {
    const { name } = node;
    return name[0] === 'u' && name[1] === 's' && name[2] === 'e';
  } else if (
    node.type === "MemberExpression" &&
    !node.computed &&
    getIsHook(node.property)
  ) {
    const { object: obj } = node; // Utilizing Object destructuring
    return obj.type === "Identifier" && obj.name === "React";
  } else {
    return false;
  }
}

// Helper function to find parent of a specified type. 
export function findParentType(node: Rule.Node, type: string): Rule.Node | undefined {
  let parent = node.parent;

  while (parent) {
    if (parent.type === type)
      return parent;

    parent = parent.parent;
  }

  return undefined;
}

function fixFunction(node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression, context: Rule.RuleContext, shouldSetName?: boolean) {
  const sourceCode = context.getSourceCode();
  const {body , params = []} = node;
  const funcBody = sourceCode.getText(body as ESTree.Node);
  const funcParams = (params as Array<ESTree.Node>).map(node => sourceCode.getText(node));
  let fixedCode = `React.useCallback((${funcParams.join(', ')}) => ${funcBody}, [])${shouldSetName ? ';' : ''}`
  if (shouldSetName && node?.id?.name) {
    const name = node?.id?.name;
    fixedCode = `const ${name} = ${fixedCode}`;
  }
  return fixedCode;
}

function getSafeVariableName(context: Rule.RuleContext, name: string) {
  const tempVarPlaceholder = 'renameMe';
  if (!getVariableInScope(context, name)) {
    return name;
  }
  if (!getVariableInScope(context, `_${name}`)) {
    return `_${name}`;
  }
  return tempVarPlaceholder;
}

// Eslint Auto-fix logic, functional components/hooks only
export function fixBasedOnMessageId(node: Rule.Node, messageId: keyof typeof MessagesRequireUseMemo, fixer: Rule.RuleFixer, context: Rule.RuleContext) {
  const sourceCode = context.getSourceCode();
  let hook = messageIdToHookDict[messageId] || 'useMemo';
  const isObjExpression = node.type === 'ObjectExpression';
  const parentIsVariableDeclarator = node.parent.type === 'VariableDeclarator';
  const isArrowFunctionExpression = node.type === 'ArrowFunctionExpression';
  const isFunctionExpression = node.type === 'FunctionExpression';
  const isCorrectableFunctionExpression = isFunctionExpression || (isArrowFunctionExpression && parentIsVariableDeclarator);

  // Determine what type of behavior to follow according to the error message
  switch(messageId) {
    case 'function-usecallback-props':
    case 'object-usememo-props':
    case 'usememo-const': {
      let sourceCode = context.getSourceCode();
      let variableDeclaration = node.type === 'VariableDeclaration' ? node : findParentType(node, 'VariableDeclaration') as TSESTree.VariableDeclaration;
      const fixes: Array<Rule.Fix> = [];

      // Check if it is a hook being stored in let/var, change to const if so
      if (variableDeclaration?.kind !== 'const') {
        const tokens = sourceCode.getTokens(variableDeclaration as ESTree.Node);
        const letKeywordToken = tokens?.[0];
        if (letKeywordToken?.value !== 'const') {
          fixes.push(fixer.replaceTextRange(
            letKeywordToken.range,
              'const'
            ));
        }
      }
      // If it's an dynamic object - Add useMemo/Callback
      if ((isObjExpression || isCorrectableFunctionExpression) ) {

        const fixed = isCorrectableFunctionExpression ? fixFunction(node as TSESTree.FunctionExpression, context) : `React.useMemo(() => (${sourceCode.getText(node)}), [])`;
        const parent = node.parent as unknown as TSESTree.JSXExpressionContainer;
        // Means we have a object expression declared directly in jsx
        if (parent.type === 'JSXExpressionContainer') {
          const parentPropName = (parent?.parent as TSESTree.JSXAttribute)?.name?.name.toString();
          const newVarName = getSafeVariableName(context, parentPropName);
          const returnStatement = findParentType(node, 'ReturnStatement') as TSESTree.ReturnStatement;
    
          if (returnStatement) {
            const indentationLevel = sourceCode.lines[returnStatement.loc.start.line - 1].search(/\S/);
            const indentation = ' '.repeat(indentationLevel);
            // Creates a declaration for the variable and inserts it before the return statement
            fixes.push(fixer.insertTextBeforeRange(returnStatement.range,`const ${newVarName} = ${fixed};\n${indentation}`));
            // Replaces the old inline object expression with the variable name
            fixes.push(fixer.replaceText(node, newVarName));
          }
        } else {
          fixes.push(fixer.replaceText(node, fixed));
        }
  
      }
      
      return !fixes.length ? null : fixes;
    }
    // Unknown cases are usually complex issues or false positives, so we ignore them
    case 'unknown-class-memo-props':
    case 'unknown-usememo-hook':
    case 'unknown-usememo-deps':
    case 'unknown-usememo-props':
      return null;
  } 
  
  // Simpler cases bellow, all of them are just adding useMemo/Callback
  let fixed = `React.${hook}(() => ${isObjExpression ? "(" : ''}${sourceCode.getText(node as unknown as ESTree.Node)}${isObjExpression ? ")" : ''}, [])`;

  if (node.type === 'FunctionDeclaration') {
    const _node = node as TSESTree.FunctionDeclaration;
    if(_node && _node?.id?.type === "Identifier") {
      fixed = fixFunction(_node, context, true);
    }
  }

  if ('computed' in node && (node as any)?.computed?.type === 'ArrowFunctionExpression') {
    return fixer.replaceText((node as any).computed, fixed) as Rule.Fix;
  } else {
    return fixer.replaceText(node, fixed) as Rule.Fix;
  }
}
