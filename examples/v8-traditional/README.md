# ESLint Plugin React UseMemo - v8 Traditional Config Example

This example project demonstrates how to use the `@arthurgeron/eslint-plugin-react-usememo` plugin with ESLint v8 using the traditional configuration format.

## Setup Details

This project uses:
- React 18
- ESLint v8
- Traditional ESLint configuration (`.eslintrc.json`)

## Key Files

- `.eslintrc.json`: Contains the ESLint configuration that enables the react-usememo plugin rules
- `src/App.js`: Demonstrates proper usage of `useMemo`, `useCallback`, and `React.memo`

## How to Use

1. Install dependencies:
   ```
   npm install
   ```

2. Run the linter:
   ```
   npm run lint
   ```

3. Start the development server:
   ```
   npm start
   ```

## ESLint Plugin Configuration

The plugin is configured in `.eslintrc.json` with the following rules enabled:

```json
{
  "@arthurgeron/react-usememo/require-usememo": "error",
  "@arthurgeron/react-usememo/require-memo": "error",
  "@arthurgeron/react-usememo/require-usememo-children": "error"
}
```

This configuration ensures that:
1. Complex values (objects, arrays, functions) passed as props are wrapped in `useMemo`/`useCallback`
2. Function components are wrapped in `React.memo()`
3. Complex values passed as children are wrapped in `useMemo`/`useCallback` 