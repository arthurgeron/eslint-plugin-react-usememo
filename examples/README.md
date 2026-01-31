# ESLint Plugin React UseMemo Examples

This directory contains example React projects demonstrating how to use the `@arthurgeron/eslint-plugin-react-usememo` plugin with different ESLint configurations.

## Examples

1. **[v8-traditional](./v8-traditional/)** - Demonstrates the plugin with ESLint v8 using traditional configuration format (`.eslintrc.json`)

2. **[v9-flat](./v9-flat/)** - Demonstrates the plugin with ESLint v9 using the new flat configuration format (`eslint.config.js`)

## Testing Results

### ESLint v8 Traditional Config

The v8 traditional config example has been successfully tested. The plugin correctly identifies and reports issues when:
- Objects aren't wrapped in `useMemo()`
- Functions aren't wrapped in `useCallback()`
- Components aren't wrapped in `React.memo()`

You can run the linter in this example with:
```
cd v8-traditional
yarn install
yarn lint
```

### ESLint v9 Flat Config

The v9 flat config example is expected to report rule violations (the example intentionally includes cases that should be flagged).

You can run the linter in this example with:
```
cd v9-flat
yarn install
yarn lint
```

## Key Differences

### ESLint v8 (Traditional Config)

In the traditional config (`v8-traditional` example), the plugin is configured in `.eslintrc.json` like this:

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

### ESLint v9 (Flat Config)

In the flat config (`v9-flat` example), the plugin is configured in `eslint.config.js` like this:

```js
import { flatConfig } from '@arthurgeron/eslint-plugin-react-usememo';

export default [
  {
    // ...
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

Alternatively, you can use the plugin's recommended configuration:

```js
import { flatConfig } from '@arthurgeron/eslint-plugin-react-usememo';

export default [
  // Other configs...
  flatConfig.configs.recommended,
];
```

## Functionality

Both examples demonstrate proper usage of:
- `useMemo` for complex objects
- `useCallback` for function references
- `React.memo` for component memoization

The examples show how the ESLint plugin enforces these patterns to improve React application performance. 