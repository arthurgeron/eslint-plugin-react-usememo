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
        code: `const Component = React.memo(() => <div />)`,
      },
      {
        code: `const Component = memo(() => <div />)`,
      },
      {
        code: `const Component = memo(useRef(() => <div />))`,
      },
      {
        code: `const Component = React.useRef(React.memo(() => <div />))`,
      },
      {
        code: `const myFunction = () => <div />`,
      },
      {
        code: `const myFunction = wrapper(() => <div />)`,
      },
      {
        code: `const Component = React.memo(function() { return <div />; });`,
      },
      {
        code: `const Component = memo(function Component() { return <div />; });`,
      },
      {
        code: `const myFunction = () => <div />`,
      },
      {
        code: `const myFunction = wrapper(() => <div />)`,
      },
      {
        code: `function myFunction() { return <div />; }`,
      },
      {
        code: `const myFunction = wrapper(function() { return <div /> })`,
      },
      {
        filename: "dir/myFunction.js",
        parserOptions: { ecmaVersion: 6, sourceType: "module" },
        code: `export default function() { return <div /> };`,
      },
    ],
    invalid: [
      {
        code: `const Component = () => <div />`,
        errors: [{ messageId: "memo-required" }],
      },
      {
        code: `const Component = useRef(() => <div />)`,
        errors: [{ messageId: "memo-required" }],
      },
      {
        code: `const Component = function Component() { return <div />; }`,
        errors: [{ messageId: "memo-required" }],
      },
      {
        code: `const Component = useRef(function() { return <div />; })`,
        errors: [{ messageId: "memo-required" }],
      },
      {
        code: `function Component() { return <div />; }`,
        errors: [{ messageId: "memo-required" }],
      },
    ],
  });
});
