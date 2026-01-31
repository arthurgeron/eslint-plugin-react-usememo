# ESLint Plugin React UseMemo - v9 Flat Config Example

This example project demonstrates how to use the `@arthurgeron/eslint-plugin-react-usememo` plugin with ESLint v9 using the new flat configuration format.

## Setup Details

This project uses:
- React 18
- ESLint v9
- Flat ESLint configuration (`eslint.config.js`)

## Key Files

- `eslint.config.js`: Contains the ESLint flat configuration that enables the react-usememo plugin rules
- `src/App.js`: Demonstrates proper usage of `useMemo`, `useCallback`, and `React.memo`

## How to Use

1. Install dependencies:
   ```
   yarn install
   ```

2. Run the linter (expected to report rule violations in this example):
   ```
   yarn lint
   ```

3. Start the development server:
   ```
   yarn start
   ```

## ESLint Plugin Configuration

The plugin is configured in `eslint.config.js` using the flat configuration format:

```js
import { flatConfig } from '@arthurgeron/eslint-plugin-react-usememo';

export default [
  // Other configs...
  {
    // ...
    plugins: {
      '@arthurgeron/react-usememo': flatConfig
    },
    rules: {
      '@arthurgeron/react-usememo/require-usememo': 'error',
      '@arthurgeron/react-usememo/require-memo': 'error',
      '@arthurgeron/react-usememo/require-usememo-children': 'error',
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

These configurations ensure that:
1. Complex values (objects, arrays, functions) passed as props are wrapped in `useMemo`/`useCallback`
2. Function components are wrapped in `React.memo()`
3. Complex values passed as children are wrapped in `useMemo`/`useCallback` 