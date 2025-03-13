// ESLint V9 Flat Config
import { flatConfig } from './dist/index.js';

export default [
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@arthurgeron/react-usememo': flatConfig,
    },
    rules: {
      '@arthurgeron/react-usememo/require-usememo': 'error',
      '@arthurgeron/react-usememo/require-memo': 'error',
      '@arthurgeron/react-usememo/require-usememo-children': 'error',
    },
  },
]; 