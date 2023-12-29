import { Rule } from "eslint";
import { TSESTree } from "@typescript-eslint/types";
import type * as ESTree from "estree";
import { MessagesRequireUseMemo } from '../constants';
import type { ESNode, ExpressionData, ReactImportInformation } from "./types";
import { MemoStatusToReport } from "src/types";
import { messageIdToHookDict, nameGeneratorUUID, defaultImportRangeStart, defaultReactHookNames } from "./constants";
import getVariableInScope from "src/utils/getVariableInScope";
import { v5 as uuidV5 } from 'uuid';
import {Minimatch} from 'minimatch'

export function shouldIgnoreNode(node: ESNode, ignoredNames: Record<string, boolean | undefined>) {
  const nodeName = (node as TSESTree.Node as TSESTree.Identifier)?.name;
  const nodeCalleeName = (node?.callee as TSESTree.Identifier)?.name;
  const nodeCalleePropertyName = ((node?.callee as TSESTree.MemberExpression)?.property as TSESTree.Identifier)?.name;
  const nameToCheck = nodeName || nodeCalleeName || nodeCalleePropertyName;

  const matchedValue = {...ignoredNames, ...defaultReactHookNames}[nameToCheck];

    if (matchedValue != undefined) {
      return matchedValue;
    }

    const shouldIgnore = Object.keys(ignoredNames).find(key => {
      const value = ignoredNames[key];
      const miniMatch = new Minimatch(key);
      if (miniMatch.hasMagic()) {
         const isMatch = (nameToCheck && miniMatch.match(nameToCheck));
          if (isMatch) {
            return !!value;
          }
      }
      return false;
    });

    return shouldIgnore != undefined ? shouldIgnore : false;
}

export function checkForErrors<T, Y extends Rule.NodeParentExtension | TSESTree.MethodDefinitionComputedName>(data: ExpressionData, statusData: MemoStatusToReport, context: Rule.RuleContext, node: Y | undefined, report: (node: Y, error: keyof typeof MessagesRequireUseMemo) => void) {
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

function addReactImports(context: Rule.RuleContext, kind: 'useMemo' | 'useCallback', reactImportData: ReactImportInformation, fixer: Rule.RuleFixer) {
  const importsDisabled = context.options?.[0]?.fix?.addImports === false;
  let specifier: TSESTree.ImportClause | undefined = undefined;

  if (importsDisabled) {
    return;
  }

  if (!reactImportData[`${kind}Imported`]) {
    // Create a new ImportSpecifier for useMemo/useCallback hook.
    specifier = {
      type: 'ImportSpecifier',
      imported: { type: 'Identifier', name: kind },
      local: { type: 'Identifier', name: kind }
    } as TSESTree.ImportSpecifier;

    if (reactImportData.importDeclaration?.specifiers) {
      const specifiers = reactImportData.importDeclaration.specifiers;
      const hasDefaultExport = specifiers?.[0]?.type === 'ImportDefaultSpecifier';
      const isEmpty = !specifiers.length;
      // Default export counts as a specifier too
      const shouldCreateSpecifiersBracket = specifiers.length <= 1 && hasDefaultExport;
      const hasCurrentSpecifier = !isEmpty && !shouldCreateSpecifiersBracket && specifiers.find(x => x.local.name === kind);
      
      if (shouldCreateSpecifiersBracket) {
        specifiers.push(specifier);
        return fixer.insertTextAfter(specifiers[0], `, { ${kind} }`);
      }

      if (isEmpty) {
        const importDeclaration = reactImportData.importDeclaration as TSESTree.ImportDeclaration;
        const fixRange = importDeclaration.range[0] + defaultImportRangeStart.length - 1;

        return fixer.insertTextAfterRange([fixRange, fixRange], ` ${kind} `);
      }

      if (!hasCurrentSpecifier) {
        specifiers.push(specifier);
        const insertPosition = specifiers[specifiers.length - 2];

        return fixer.insertTextAfter(insertPosition, `, ${kind}`);
      }
    }
  }

  // If React is not imported, create a new ImportDeclaration for it.
  if (!reactImportData.reactImported && !reactImportData.importDeclaration) {
    reactImportData.importDeclaration = {
      type: 'ImportDeclaration',
      specifiers: [
        {
          ...specifier,
          range: [
            defaultImportRangeStart.length,
            defaultImportRangeStart.length + kind.length]
        }],
      source: { type: 'Literal', value: 'react' }
    } as TSESTree.ImportDeclaration;
    reactImportData.reactImported = true;
    reactImportData[`${kind}Imported`] = true;

    // Add an extra new line before const component and use indentSpace for proper spacing.
    return fixer.insertTextBeforeRange([0, 0], `${defaultImportRangeStart}${kind} } from 'react';\n`);
  }
  return;
}

export function getIsHook(node: TSESTree.Node | TSESTree.Identifier) {
  if (node.type === "Identifier") {
    const { name } = node;
    return (name?.length ?? 0) >= 4 && name[0] === 'u' && name[1] === 's' && name[2] === 'e' && name[3] === name[3].toUpperCase();
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
  const { body, params = [] } = node;
  const funcBody = sourceCode.getText(body as ESTree.Node);
  const funcParams = (params as Array<ESTree.Node>).map(node => sourceCode.getText(node));
  let fixedCode = `useCallback((${funcParams.join(', ')}) => ${funcBody}, [])${shouldSetName ? ';' : ''}`
  if (shouldSetName && node?.id?.name) {
    const name = node?.id?.name;
    fixedCode = `const ${name} = ${fixedCode}`;
  }
  return fixedCode;
}

function getSafeVariableName(context: Rule.RuleContext, name: string, attempts = 0): string {
  const tempVarPlaceholder = 'renameMe';

  if (!getVariableInScope(context, name)) {
    return name;
  }
  if (attempts >= 5) {
    const nameExtensionIfExists = getVariableInScope(context, tempVarPlaceholder) ? uuidV5(name, nameGeneratorUUID).split('-')[0] : '';
    return `${tempVarPlaceholder}${nameExtensionIfExists ? `_${nameExtensionIfExists}` : ''}`;
  }
  return getSafeVariableName(context, `_${name}`, ++attempts);

}

// Eslint Auto-fix logic, functional components/hooks only
export function fixBasedOnMessageId(node: Rule.Node, messageId: keyof typeof MessagesRequireUseMemo, fixer: Rule.RuleFixer, context: Rule.RuleContext, reactImportData: ReactImportInformation) {
  const sourceCode = context.getSourceCode();
  let hook = messageIdToHookDict[messageId] || 'useMemo';
  const isObjExpression = node.type === 'ObjectExpression';
  const isJSXElement = (node as unknown as TSESTree.JSXElement).type === 'JSXElement';
  const parentIsVariableDeclarator = (node as Rule.Node).parent.type === 'VariableDeclarator';
  const isArrowFunctionExpression = node.type === 'ArrowFunctionExpression';
  const isFunctionExpression = node.type === 'FunctionExpression';
  const isCorrectableFunctionExpression = isFunctionExpression || (isArrowFunctionExpression && parentIsVariableDeclarator);
  const fixes: Array<Rule.Fix> = [];

  // Determine what type of behavior to follow according to the error message
  switch (messageId) {
    case 'function-usecallback-hook':
      if (node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
        const importStatementFixes = addReactImports(context, 'useCallback', reactImportData, fixer);
        const fixed = fixFunction(node as TSESTree.FunctionExpression, context);
        importStatementFixes && fixes.push(importStatementFixes);
        fixes.push(fixer.replaceText(node as Rule.Node, fixed));
        return fixes;
      }
      break;
    case 'object-usememo-hook':
      const _returnNode = node as TSESTree.ReturnStatement;
      // An undefined node.argument means returned value is not an expression, but most probably a variable which should not be handled here, which falls under default, simpler fix logic.
      if(_returnNode.argument) {
        const importStatementFixes = addReactImports(context, 'useMemo', reactImportData, fixer);
        const fixed = `useMemo(() => (${sourceCode.getText(_returnNode.argument as Rule.Node)}), [])`;
        importStatementFixes && fixes.push(importStatementFixes);
        fixes.push(fixer.replaceText(_returnNode.argument as Rule.Node, fixed));
        return fixes;
      } 
      break;
    case 'function-usecallback-props':
    case 'object-usememo-props':
    case 'jsx-usememo-props':
    case 'usememo-const': {
      let variableDeclaration = node.type === 'VariableDeclaration' ? node : findParentType(node as Rule.Node, 'VariableDeclaration') as TSESTree.VariableDeclaration;

      // Check if it is a hook being stored in let/var, change to const if so
      if (variableDeclaration && variableDeclaration.kind !== 'const') {
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
      if ((isObjExpression || isJSXElement || isCorrectableFunctionExpression)) {

        const importStatementFixes = addReactImports(context, isCorrectableFunctionExpression ? 'useCallback' : 'useMemo', reactImportData, fixer);
        importStatementFixes && fixes.push(importStatementFixes);
        const fixed = isCorrectableFunctionExpression ? fixFunction(node as TSESTree.FunctionExpression, context) : `useMemo(() => (${sourceCode.getText(node as Rule.Node)}), [])`;
        const parent = node.parent as unknown as TSESTree.JSXExpressionContainer;
        // Means we have a object expression declared directly in jsx
        if (parent.type === 'JSXExpressionContainer') {
          const parentPropName = (parent?.parent as TSESTree.JSXAttribute)?.name?.name.toString();
          const newVarName = getSafeVariableName(context, parentPropName);
          const returnStatement = findParentType(node as Rule.Node, 'ReturnStatement') as TSESTree.ReturnStatement;

          if (returnStatement) {
            const indentationLevel = sourceCode.lines[returnStatement.loc.start.line - 1].search(/\S/);
            const indentation = ' '.repeat(indentationLevel);
            // Creates a declaration for the variable and inserts it before the return statement
            fixes.push(fixer.insertTextBeforeRange(returnStatement.range, `const ${newVarName} = ${fixed};\n${indentation}`));
            // Replaces the old inline object expression with the variable name
            fixes.push(fixer.replaceText(node as Rule.Node, newVarName));
          }
        } else {
          fixes.push(fixer.replaceText(node as Rule.Node, fixed));
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
  let fixed = `${hook}(() => ${isObjExpression || isJSXElement ? "(" : ''}${sourceCode.getText(node as unknown as ESTree.Node)}${isObjExpression ? ")" : ''}, [])`;
  const importStatementFixes = addReactImports(context, hook, reactImportData, fixer);
  importStatementFixes && fixes.push(importStatementFixes);

  if (node.type === 'FunctionDeclaration') {
    const _node = node as TSESTree.FunctionDeclaration;
    if (_node && _node?.id?.type === "Identifier") {
      fixed = fixFunction(_node, context, true);
    }
  }

  if ('computed' in node && (node as any)?.computed?.type === 'ArrowFunctionExpression') {
    fixes.push(fixer.replaceText((node as any).computed, fixed) as Rule.Fix);
  } else {
    fixes.push(fixer.replaceText(node as Rule.Node, fixed) as Rule.Fix);
  }
  return fixes;
}
