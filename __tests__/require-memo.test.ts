import { Rule, RuleTester } from "eslint";
import rule from "src/require-memo";

const ruleTester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    ecmaFeatures: { jsx: true },
  },
});

describe('Rule - Require-memo', () =>  {
  ruleTester.run("memo", rule as Rule.RuleModule , {
    valid: [
      {
        code: `export const TestMap = {};`,
      },
      {
        code: `const TestMap = {}; export default TestMap;`,
      },
      {
        code: `export default {};`,
      },
      {
        code: `export const SomethingWeird = func()();`,
      },
      {
        code: `export const Component = useRef(() => <div />)`,
      },
      { // By the way, never do this
        code: `export const Component = useRef(function() { return <div />; })`,
      },
      {
        code: `export const variable = func()();`,
      },
      {
        code: `export const Component = React.memo(() => <div />)`,
      },
      {
        code: `export const Component = memo(() => <div />)`,
      },
      {
        code: `const Component = memo(() => <div />); export default Component;`,
      },
      {
        code: `export default memo(function Component() { return <div />; })`,
      },
      {
        code: `export const Component = memo(useRef(() => <div />))`,
      },
      { // We do not validate hanging/dynamic declarations, only exports
        code: `const Component = React.useRef(React.memo(() => <div />))`,
      },
      { // Is not a component
        code: `export const myFunction = () => <div />`,
      },
      {// Is not a component
        code: `export const myFunction = wrapper(() => <div />)`,
      },
      {
        code: `export const Component = React.memo(function() { return <div />; });`,
      },
      {
        code: `export const Component = memo(function Component() { return <div />; });`,
      },
      { // Is not a component
        code: `export const myFunction = () => <div />`,
      },
      { // Is not a component
        code: `export const myFunction = wrapper(() => <div />)`,
      },
      { // Is not a component
        code: `function myFunction() { return <div />; }`,
      },
      { // Is not a component
        code: `const myFunction = wrapper(function() { return <div /> })`,
      },
      { // Is not a component
        filename: "dir/myFunction.js",
        parserOptions: { ecmaVersion: 6, sourceType: "module" },
        code: `export default function() { return <div /> };`,
      },
      {
        code: `const Component = () => <div />; export default memo(Component);`,
      },
      {
        code: `const Component = memo(() => <div />); export default Component;`,
      },
      {
        code: `export const Component = () => <div />`,
        options: [{
          ignoredComponents: {
            'Component': true,
          }
        }]
      },
    ],
    invalid: [
      {
        code: `export const Component = () => <div />`,
        errors: [{ messageId: "memo-required" }],
      },
      {
        code: `export const ListItem = () => <div />`,
        errors: [{ messageId: "memo-required" }],
        options: [{
          ignoredComponents: {
            '*Item': false,
            '*': true
          }
        }]
      },
      {
        code: `const Component = () => <div />; export default Component;`,
        errors: [{ messageId: "memo-required" }],
      },
      {
        code: `export const Component = function Component() { return <div />; }`,
        errors: [{ messageId: "memo-required" }],
      },
      {
        code: `export function Component() { return <div />; }`,
        errors: [{ messageId: "memo-required" }],
      },
      {
        code: `export default function Component() { return <div />; }`,
        errors: [{ messageId: "memo-required" }],
      },
      {
        code: `const Component = () => <div />; export default Component;`,
         errors: [{ messageId: "memo-required" }],
      },
    ],
  });
});
