# ESLint v9 Migration Guide

Starting from version 3.0.0, `@arthurgeron/eslint-plugin-react-usememo` targets ESLint v9 using the flat config format. This guide shows how to configure ESLint v9 with the plugin.

## Prerequisites

1. Install ESLint v9:
   ```bash
   npm install eslint@^9.0.0 --save-dev
   ```

2. Ensure your `@arthurgeron/eslint-plugin-react-usememo` version is at least 3.0.0:
   ```bash
   npm install @arthurgeron/eslint-plugin-react-usememo@^2.5.0 --save-dev
   ```

## Migration Steps

### 1. Create a New Configuration File

Create a new `eslint.config.js` file in your project root:

```js
// eslint.config.js
import { flatConfig } from '@arthurgeron/eslint-plugin-react-usememo';
import js from '@eslint/js';
// Import other plugins as needed
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    plugins: {
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@arthurgeron/react-usememo': flatConfig
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      // React rules
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // React useMemo plugin rules
      '@arthurgeron/react-usememo/require-usememo': 'error',
      '@arthurgeron/react-usememo/require-memo': 'error',
      '@arthurgeron/react-usememo/require-usememo-children': 'error'
    }
  }
];
```

### 2. Using the Recommended Configuration

If you prefer to use the recommended configuration, you can simplify your config:

```js
// eslint.config.js
import { flatConfig } from '@arthurgeron/eslint-plugin-react-usememo';
import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';

export default [
  js.configs.recommended,
  // Your other configs...
  flatConfig.configs.recommended
];
```

### 3. CommonJS Support

If you're using CommonJS modules:

```js
// eslint.config.js
const { flatConfig } = require('@arthurgeron/eslint-plugin-react-usememo');
const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  // Your other configs...
  {
    plugins: {
      '@arthurgeron/react-usememo': flatConfig
    },
    rules: {
      '@arthurgeron/react-usememo/require-usememo': 'error',
      '@arthurgeron/react-usememo/require-memo': 'error',
      '@arthurgeron/react-usememo/require-usememo-children': 'error'
    }
  }
];
```

### 4. Remove the Old Configuration

After confirming that the new configuration works correctly, you can remove the old `.eslintrc.*` file.

## Key Differences

### Traditional Config (v8)

```json
{
  "plugins": ["@arthurgeron/react-usememo"],
  "rules": {
    "@arthurgeron/react-usememo/require-usememo": "error",
    "@arthurgeron/react-usememo/require-memo": "error",
    "@arthurgeron/react-usememo/require-usememo-children": "error"
  }
}
```

### Flat Config (v9)

```js
import { flatConfig } from '@arthurgeron/eslint-plugin-react-usememo';

export default [
  {
    plugins: {
      '@arthurgeron/react-usememo': flatConfig
    },
    rules: {
      '@arthurgeron/react-usememo/require-usememo': 'error',
      '@arthurgeron/react-usememo/require-memo': 'error',
      '@arthurgeron/react-usememo/require-usememo-children': 'error'
    }
  }
];
```

## Example Projects

For complete working examples of both configurations, check out the example projects in the [examples directory](https://github.com/arthurgeron/eslint-plugin-react-usememo/tree/main/examples):

1. **v8-traditional** - Example with ESLint v8 traditional config
2. **v9-flat** - Example with ESLint v9 flat config structure

## Additional Resources

- [ESLint v9 Flat Config Documentation](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [ESLint v9 Migration Guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0) 