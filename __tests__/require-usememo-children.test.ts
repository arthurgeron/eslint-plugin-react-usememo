import { RuleTester } from "eslint";
import rule from "src/require-usememo-children";

const ruleTester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    ecmaFeatures: { jsx: true },
  },
});
describe('Rule - Require-usememo-children', () =>  {
  ruleTester.run("useMemo children", rule, {
    valid: [
      {
        code: `const Component = () => {
        const children = React.useMemo(() => <div><Grandchild /></div>, []);
        return <Child>{children}</Child>;
      }`,
      },
      {
        code: `const Component = () => {
        return <div><Child /></div>;
      }`,
      },
      {
        code: `const Component = () => {
        const renderFn = React.useCallback(() => <div><Grandchild /></div>, []);
        return <Child>{renderFn}</Child>;
      }`,
      },
    ],
    invalid: [
      {
        code: `const Component = () => {
        const children = React.useMemo(() => <div><Grandchild /></div>, []);
        return <Child>
          <>
            {children}
          </>
        </Child>;
      }`,
        errors: [{ messageId: "jsx-usememo-children" }],
      },
      {
        code: `const Component = () => {
        const children = <div />;
        return <Child>{children}</Child>
      }`,
        errors: [{ messageId: "jsx-usememo-children" }],
      },
      {
        code: `const Component = () => {
        const children = [<div />, <Child1 />, <Child2 />];
        return <Child>{children}</Child>
      }`,
        errors: [{ messageId: "array-usememo-children" }],
      },
      {
        code: `const Component = () => {
        return <Child>
          {() => <div />}
        </Child>
      }`,
        errors: [{ messageId: "function-usecallback-children" }],
      },
    ],
  });
});
