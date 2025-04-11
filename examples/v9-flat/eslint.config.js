import { flatConfig } from '@arthurgeron/eslint-plugin-react-usememo';
import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  // React configuration
  {
    files: ['**/*.js', '**/*.jsx'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Common browser globals
        document: 'readonly',
        window: 'readonly',
        console: 'readonly'
      },
      // Parser options for JSX
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      // React rules
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  },
  // The plugin's flat config recommended settings
  {
    files: ['**/*.js', '**/*.jsx'],
    plugins: {
      '@arthurgeron/react-usememo': flatConfig
    },
    rules: {
      // require-usememo rule with custom options
      '@arthurgeron/react-usememo/require-usememo': ['error', {
        strict: true,
        checkHookReturnObject: true,
        fix: { addImports: true },
        checkHookCalls: true,
        ignoredHookCallsNames: { 'useStateManagement': true },
        ignoredPropNames: ['style', 'className']
      }],
      
      // require-memo rule with custom options
      '@arthurgeron/react-usememo/require-memo': ['warn', {
        ignoredComponents: {
          'Header': true,
          'Footer': true,
          'SimpleText': true
        }
      }],
      
      // require-usememo-children rule with custom options
      '@arthurgeron/react-usememo/require-usememo-children': ['warn', {
        strict: true
      }]
    }
  }
];