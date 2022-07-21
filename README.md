# eslint-plugin-react-usememo

Enforce that all function components are wrapped in `React.memo`, and that all props and deps are wrapped in `useMemo`/`useCallback` so they don’t break memo.

Rationale: [Why we memo all the things](https://attardi.org/why-we-memo-all-the-things/).


## Installation

```
yarn add @arthurgeron/eslint-plugin-react-usememo --dev
```   
or   
```
npm install @arthurgeron/eslint-plugin-react-usememo --save-dev
```


## Usage

To enable the plugin add the following to the `plugin` property  your `eslintrc` file:
```json
plugins: ["@arthurgeron/react-usememo"],
```

Then enable any rules as you like, example:
```json
rules: {
    "@arthurgeron/react-usememo/require-usememo": [2],
},
```
## Rules

### `require-memo`

Requires all function components to be wrapped in `React.memo()`.   
May be useful when used with overrides in your eslint config, I do not recommend enabling this globally. 

### `require-usememo` **Recommended**

Requires complex values (objects, arrays, functions, and JSX) that get passed props or referenced as a hook dependency to be wrapped in `React.useMemo()` or `React.useCallback()`.

Options:

- `{strict: true}`: Fails even in cases where it is difficult to determine if the value in question is a primitive (string or number) or a complex value (object, array, etc.).

### `require-usememo-children` **Advanced**

Requires complex values (objects, arrays, functions, and JSX) that get passed as children to be wrapped in `React.useMemo()` or `React.useCallback()`.

Options:

- `{strict: true}`: Fails even in cases where it is difficult to determine if the value in question is a primitive (string or number) or a complex value (object, array, etc.).
