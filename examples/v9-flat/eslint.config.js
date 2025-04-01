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
      '@arthurgeron/react-usememo/require-usememo': 'error',
      '@arthurgeron/react-usememo/require-memo': 'warn',
      '@arthurgeron/react-usememo/require-usememo-children': 'warn'
    }
  }
];