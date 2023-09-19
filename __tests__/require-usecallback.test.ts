import { Rule, RuleTester } from "eslint";
import rule from "src/require-usememo";

const ruleTester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    ecmaFeatures: { jsx: true },
  },
});
describe('Rule - Require-usecallback', () =>  {
  ruleTester.run("useCallback", rule as Rule.RuleModule , {
    valid: [
      {
        code: `const Component = () => {
        const myFn = React.useCallback(function() {}, []);
        return <Child prop={myFn} />;
      }`,
      },
      {
        code: `const Component = () => {
        const myFn = useCallback(() => {}, []);
        return <Child prop={myFn} />;
      }`,
      },
      {
        code: `const Component = () => {
          const myFn = function() {};
          return <div prop={myFn} />;
        }`,
      },
      {
        code: `class Component {
          render() {
            const myFn = function() {};
            return <div prop={myFn} />;
          }
        }`,
      },
      {
        code: `
        const myFn = function() {};
        const Component = () => {
          return <Child prop={myFn} />;
        }`,
      },
      {
        code: `
        const myFn = function() {};
        class Component {
          render() {
            return <Child prop={myFn} />;
          }
        }`,
      },
      {
        code: `const Component = () => {
          const myFn = () => {};
          return <div prop={myFn} />;
        }`,
      },
      {
        code: `
        const myFn = () => {};
        const Component = () => {
          return <div prop={myFn} />;
        }`,
      },
      {
        code: `const Component = () => {
        const myFn1 = useCallback(() => [], []);
        const myFn2 = React.useCallback(() => myFn1, [myFn1]);
        return <Child prop={myFn2} />;
        }`,
      },
      {
        code: `
        class Component {
          myFn() {}
          render() {
            return <Child prop={this.myFn} />;
          }
        }`,
      },
      {
        code: `const Component = () => {
          const myFn = memoize(() => {});
          return <Child prop={myFn} />;
        }`,
      },
      {
        code: `const Component = () => {
          const myFn = lodash.memoize(() => []);
          return <Child prop={myFn} />;
        }`,
      },
      {
        code:`const Component = () => {
          const myFn1 = () => [];
          const myFn2 = React.useCallback(() => myFn1, [myFn1]);
          return <Child prop={myFn2} />;
        }`,
      },
      {
        code: `const Component = () => {
          const myFn = React.useMemo(() => function() {}, []);
          return <Child prop={myFn} />;
        }`,
      },
    ],
    invalid: [
      {
        code: `const Component = () => {
          const myFn = function myFn() {};
          return <Child prop={myFn} />;
        }`,
        output: `const Component = () => {
          const myFn = React.useCallback(() => {}, []);
          return <Child prop={myFn} />;
        }`,
        errors: [{ messageId: "function-usecallback-props" }],
      },
      {
        code: `const Component = () => {
          const myFn = () => {};
          return <Child prop={myFn} />;
        }`,
        output: `const Component = () => {
          const myFn = React.useCallback(() => {}, []);
          return <Child prop={myFn} />;
        }`,
        errors: [{ messageId: "function-usecallback-props" }],
      },
      {
        code: `const Component = () => {
          let myFn = useCallback(() => ({}));
          myFn = () => ({});
          return <Child prop={myFn} />;
        }`,
        // Variable reassignment is not safe to fix, hence it's expected that the generated code will required further fixing
        output: `const Component = () => {
          const myFn = useCallback(() => ({}));
          myFn = () => ({});
          return <Child prop={myFn} />;
        }`,
        errors: [{ messageId: "usememo-const" }],
      },
      {
        code: `const Component = () => {
          return <Child prop={() => {}} />;
        }`,
        errors: [{ messageId: "function-usecallback-props" }],
      },
      {
        code: `const Component = () => {
          return <Child prop={() => []} />;
        }`,
        errors: [{ messageId: "function-usecallback-props" }],
      },
      {
        code: `class Component {
          return () {
            return <Child prop={() => []} />;
          }
        }`,
        errors: [{ messageId: "instance-class-memo-props" }],
      },
      {
        code: `const Component = () => {
          const myFn1 = () => [];
          const myFn2 = React.useCallback(() => [], []);
          return <Child prop={myFn2 || myFn1} />;
        }`,
        output: `const Component = () => {
          const myFn1 = React.useCallback(() => [], []);
          const myFn2 = React.useCallback(() => [], []);
          return <Child prop={myFn2 || myFn1} />;
        }`,
        errors: [{ messageId: "function-usecallback-props" }],
      },
      {
        code: `const Component = () => {
          const myFn = memoize(() => {});
          return <Child prop={myFn} />;
        }`,
        options: [{ strict: true }],
        errors: [{ messageId: "unknown-usememo-props" }],
      },
      {
        code: `const Component = () => {
          const myFn = lodash.memoize(() => []);
          return <Child prop={myFn} />;
        }`,
        options: [{ strict: true }],
        errors: [{ messageId: "unknown-usememo-props" }],
      },
      {
        code: `class Component {
          render() {
            const myFn = lodash.memoize(() => []);
            return <Child prop={myFn} />;
          }
        }`,
        options: [{ strict: true }],
        errors: [{ messageId: "unknown-class-memo-props" }],
      },
      {
        code: `const Component = () => {
          const myFn = function test() {};
          return <Child prop={myFn} />;
        }`,
        output: `const Component = () => {
          const myFn = React.useCallback(() => {}, []);
          return <Child prop={myFn} />;
        }`,
        errors: [{ messageId: "function-usecallback-props" }],
      },
      {
        code: `const Component = () => {
          const myFn = () => [];
          return <Child prop={myFn} />;
        }`,
        output: `const Component = () => {
          const myFn = React.useCallback(() => [], []);
          return <Child prop={myFn} />;
        }`,
        errors: [{ messageId: "function-usecallback-props" }],
      },
    ],
  });
});
