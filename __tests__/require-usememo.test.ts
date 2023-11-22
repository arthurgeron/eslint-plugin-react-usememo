import { Rule, RuleTester } from "eslint";
import rule from "src/require-usememo";
import { findParentType } from "src/require-usememo/utils";

const ruleTester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    ecmaFeatures: { jsx: true },
  },
});

describe('Rule - Require-usememo', () =>  {
  ruleTester.run("useMemo", rule as Rule.RuleModule, {
    valid: [
      {
        code: `function renderItem({
          field,
          fieldState,
        }) {
          return (
            <Child 
            onBlur={field.onBlur}
            inputRef={field.ref}
            state={fieldState}
            />);
        }`,
      },
      {
        code: `function Component() {
        let myObject = 'hi';
        return <Child prop={myObject} />;
      }`,
      },
      {
        code: `function Component({index = 0}) {
        const isNotFirst = index > 0;
        return <Child isNotFirst={isNotFirst} />;
      }`,
      },
      {
        code: `function Component() {
          return <Child>{/* Empty Expression Should Not Error :) */}</Child>;
        }`,
      },
      {
        code: `const Component = () => {
        const myObject = useMemo(() => ({}), []);
        return <Child prop={myObject} />;
      }`,
      },
      {
        code: `const Component = () => {
        const myArray = useMemo(() => [], []);
        return <Child prop={myArray} />;
        }`
      },
      {
        code: `
        function Component({data}) {
        return <Child prop={data} />;
      }`,
      },
      {
        code: `
        function x() {}
        function Component() {
        return <Child prop={x} />;
      }`,
      },
      {
        code: `const Component = () => {
        const myArray = useMemo(() => new Object(), []);
        return <Child prop={myArray} />;
        }`
      },
      {
        code: `function Component() {
        const myArray = useMemo(() => new Object(), []);
        return <Child prop={myArray} />;
        }`
      },
      {
        code: `
        const myArray = new Object();
        class Component {
          render() {
            return <Child prop={myArray} />;
          }
        }`,
      },
      {
        code: `
        const myArray = new Object();
        function Component() {
          return <Child prop={myArray} />;
        }`,
      },
      {
        code: `class Component {
          constructor(props){
            super(props);
            this.state = {
              myData: new Object(),
            };
          }
          render() {
            const {myData} = this.state;
            return <Child prop={myData} />;
          }
        }`,
      },
      {
        code: `class Component {
          constructor(props){
            super(props);
            this.state = {
              myArray: [],
            };
          }
          render() {
            const {myArray} = this.state;
            return <Child prop={myArray} />;
          }
        }`,
      },
      {
        code: `
        const myArray = [];
        class Component {
          render() {
            return <Child prop={myArray} />;
          }
        }`,
      },
      {
        code: `
        function test() {}
        class Component {
          render() {
            return <Child prop={test} />;
          }
        }`,
      },
      {
        code: `const Component = () => {
          const myObject = {};
          return <div prop={myObject} />;
        }`,
      },
      {
        code: `const Component = () => {
          const myArray = [];
          return <div prop={myArray} />;
        }`,
      },
      {
        code: `class Component {
          render() {
            const myArray = [];
            return <div prop={myArray} />;
          }
        }`,
      },
      {
        code: `const Component = () => {
          const myNumber1 = 123;
          const myNumber2 = 123 + 456;
          const myString1 = 'abc';
          const myString2 = \`abc\`;
          return <div n1={myNumber} n2={myNumber2} s1={myString1} s2={myString2} />;
        }`,
      },
      {
        code: `const Component = () => {
          const myObject = memoize({});
          return <Child prop={myObject} />;
        }`,
      },
      {
        code: `
        function test() {}
        const Component = () => {
          return <Child prop={test} />;
        }`,
      },
      {
        code: `
        function test() {}
        function Component() {
          return <Child prop={test} />;
        }`,
      },
      {
        code: `const Component = () => {
          const myArray = lodash.memoize([]);
          return <Child prop={myArray} />;
        }`,
      },
      {
        code: `const Component = () => {
          const myBool = false;
          return <Child prop={myArray} />;
        }`,
      },
      {
        code: `const Component = () => {
          const myString = 'test';
          return <Child prop={myArray} />;
        }`,
      },
      {
        code: `const Component = () => {
          const myComplexString = css\`color: red;\`;
          return <Child prop={myComplexString} />;
        }`,
      },
      {
        code: `function useTest() {
          const myBool = false;
          return myBool;
        }`,
      },
      {
        code: `
        const x = {};
        function useTest() {
          return {x};
        }`,
      },
      {
        code: `function useTesty() {
          const myString = '';
          return myString;
        }`,
      },
      {
        code: `function useTesty() {
          const myBool = useMemo(() => !!{}, []);
          return myBool;
        }`,
      },
      {
        code: `function useTesty() {
          const x = {};
          const myBool = useMemo(() => x, [x]);
          return myBool;
        }`,
      },
      {
          code: `
          function useTesty() {
            const x = {};
            return useData(x);
          }`,
          options: [{ checkHookReturnObject: true, checkHookCalls: false }],
        },
      {
          code: `
          function useTesty() {
            const x = {};
            return useData(x);
          }`,
          options: [{ checkHookReturnObject: true, ignoredHookCallsNames: {"useData": true} }],
        },
      {
        code: `const Component = () => {
          const myArray1 = [];
          const myArray2 = useMemo(() => myArray1, [myArray1]);
          return <Child prop={myArray2} />;
        }`,
      },
      {
        code: `function useTest() {
          const y: boolean | undefined = false;
          const x = useMemo(() => x, [y]);
          return {x};
        }`,
      },
      {
        code: `function useTest({data}: {data: boolean | undefined}) {
          const x = useMemo(() => !data, [data]);
          return {x};
        }`,
      },
      {
        code: `function useTest() {
          let y = '';
          const x = useMemo(() => '', []);
          return {x, y};
        }`,
      },
    ],
    invalid: [
      {
        code: `
        const Component = () => {
          return <Child prop={<SomeComponent />} />;
        }`,
        errors: [{ messageId: "jsx-usememo-props" }],
        output: `import { useMemo } from 'react';

        const Component = () => {
          const prop = useMemo(() => (<SomeComponent />), []);
          return <Child prop={prop} />;
        }`,
      },
      {
        code: `
        const Component = () => {
          const myObject = {};
          return <Child prop={myObject} />;
        }`,
        errors: [{ messageId: "object-usememo-props" }],
        output: `import { useMemo } from 'react';

        const Component = () => {
          const myObject = useMemo(() => ({}), []);
          return <Child prop={myObject} />;
        }`,
      },
      {
        code: `
        const Component = () => {
          const myArray = [];
          return <Child prop={myArray} />;
        }`,
        output: `import { useMemo } from 'react';

        const Component = () => {
          const myArray = useMemo(() => [], []);
          return <Child prop={myArray} />;
        }`,
        errors: [{ messageId: "array-usememo-props" }],
      },
      {
        code: `
        const Component = () => {
          const myArray = [];
          return <Child prop={myArray} />;
        }`,
        output: `
        const Component = () => {
          const myArray = useMemo(() => [], []);
          return <Child prop={myArray} />;
        }`,
        options: [{ fix: { addImports: false } }],
        errors: [{ messageId: "array-usememo-props" }],
      },
      {
        code: `
        const Component = () => {
          const myInstance = new Object();
          return <Child prop={myInstance} />;
        }`,
        output: `import { useMemo } from 'react';

        const Component = () => {
          const myInstance = useMemo(() => new Object(), []);
          return <Child prop={myInstance} />;
        }`,
        errors: [{ messageId: "instance-usememo-props" }],
      },
      {
        code: `class Component {
          render() {
            const myInstance = new Object();
            return <Child prop={myInstance} />;
          }
        }`,
        output: `class Component {
          render() {
            const myInstance = new Object();
            return <Child prop={myInstance} />;
          }
        }`,
        errors: [{ messageId: "instance-class-memo-props" }],
      },
      {
        code: `import { useCallback } from 'react';

        const Component = () => {
          const firstInstance = useMemo(() => new Object(), []);
          const second = new Object();
          return <Child prop={firstInstance || second} />;
        }`,
        output: `import { useCallback, useMemo } from 'react';

        const Component = () => {
          const firstInstance = useMemo(() => new Object(), []);
          const second = useMemo(() => new Object(), []);
          return <Child prop={firstInstance || second} />;
        }`,
        errors: [{ messageId: "instance-usememo-props" }],
      },
      {
        code: `
        const Component = () => {
          const firstInstance = useMemo(() => new Object(), []);
          const second = new Object();
          return <Child prop={firstInstance || second} />;
        }`,
        output: `import { useMemo } from 'react';

        const Component = () => {
          const firstInstance = useMemo(() => new Object(), []);
          const second = useMemo(() => new Object(), []);
          return <Child prop={firstInstance || second} />;
        }`,
        errors: [{ messageId: "instance-usememo-props" }],
      },
      {
        code: `
        const Component = () => {
          let myObject = useMemo(() => ({}), []);
          myObject = {a: 'b'};
          return <Child prop={myObject} />;
        }`,
        output: `
        const Component = () => {
          const myObject = useMemo(() => ({}), []);
          myObject = {a: 'b'};
          return <Child prop={myObject} />;
        }`,
        errors: [{ messageId: "usememo-const" }],
      },
      {
        code: `
        import { useCallback } from 'react';

        const Component = () => {
          return <Child userData={{}} />;
        }`,
        output: `
        import { useCallback, useMemo } from 'react';

        const Component = () => {
          const userData = useMemo(() => ({}), []);
          return <Child userData={userData} />;
        }`,
        errors: [{ messageId: "object-usememo-props" }],
      },
      {
        code: `
        const Component = () => {
          const userData = undefined;
          return <Child userData={{}} />;
        }`,
        output: `import { useMemo } from 'react';

        const Component = () => {
          const userData = undefined;
          const _userData = useMemo(() => ({}), []);
          return <Child userData={_userData} />;
        }`,
        errors: [{ messageId: "object-usememo-props" }],
      },
      {
        code: `
        const Component = () => {
          const userData = undefined;
          return <Child userData={{}} />;
        }`,
        output: `import { useMemo } from 'react';

        const Component = () => {
          const userData = undefined;
          const _userData = useMemo(() => ({}), []);
          return <Child userData={_userData} />;
        }`,
        errors: [{ messageId: "object-usememo-props" }],
      },
      {
        code: `
        const Component = () => {
          const userData = undefined;
          const _userData = undefined;
          return <Child userData={{}} />;
        }`,
        output: `import { useMemo } from 'react';

        const Component = () => {
          const userData = undefined;
          const _userData = undefined;
          const __userData = useMemo(() => ({}), []);
          return <Child userData={__userData} />;
        }`,
        errors: [{ messageId: "object-usememo-props" }],
      },
      {
        code: `
        const Component = () => {
          const userData = undefined;
          const _userData = undefined;
          const __userData = undefined;
          const ___userData = undefined;
          const ____userData = undefined;
          const _____userData = undefined;
          return <Child userData={{}} />;
        }`,
        output: `import { useMemo } from 'react';

        const Component = () => {
          const userData = undefined;
          const _userData = undefined;
          const __userData = undefined;
          const ___userData = undefined;
          const ____userData = undefined;
          const _____userData = undefined;
          const renameMe = useMemo(() => ({}), []);
          return <Child userData={renameMe} />;
        }`,
        errors: [{ messageId: "object-usememo-props" }],
      },
      {
        code: `
        const Component = () => {
          const userData = undefined;
          const _userData = undefined;
          const __userData = undefined;
          const ___userData = undefined;
          const ____userData = undefined;
          const _____userData = undefined;
          const renameMe = undefined;
          return <Child userData={{}} />;
        }`,
        output: `import { useMemo } from 'react';

        const Component = () => {
          const userData = undefined;
          const _userData = undefined;
          const __userData = undefined;
          const ___userData = undefined;
          const ____userData = undefined;
          const _____userData = undefined;
          const renameMe = undefined;
          const renameMe_99c32a94 = useMemo(() => ({}), []);
          return <Child userData={renameMe_99c32a94} />;
        }`,
        errors: [{ messageId: "object-usememo-props" }],
      },
      {
        code: `
        const Component = () => {
          let x = {};
          return <Child prop={x} />;
        }`,
        output: `import { useMemo } from 'react';

        const Component = () => {
          const x = useMemo(() => ({}), []);
          return <Child prop={x} />;
        }`,
        errors: [{ messageId: "object-usememo-props" }],
      },
      
      {
        code: `
        const useTest = () => {
          const x: boolean | undefined = false;
          function y() {}
          return {x, y};
        }`,
        output: `import { useCallback } from 'react';

        const useTest = () => {
          const x: boolean | undefined = false;
          const y = useCallback(() => {}, []);
          return {x, y};
        }`,
        errors: [{ messageId: "function-usecallback-hook" }],
      },
      {
        code: `
        function Component() {
          const component = <OtherChild />;
          return <Child component={component} />;
        }`,
      errors: [{messageId: "jsx-usememo-props"}],
      output: `import { useMemo } from 'react';

        function Component() {
          const component = useMemo(() => (<OtherChild />), []);
          return <Child component={component} />;
        }`
      },
      {
        code: `
        import {} from 'react';
        function useTesty() {
          const user = {};
          const x = {
            renderCell: (user) => <RoleIndicator roles={['role']} user={user} />,
          };
          return useData(x);
        }`,
        output:  `
        import { useMemo } from 'react';
        function useTesty() {
          const user = {};
          const x = {
            renderCell: (user) => <RoleIndicator roles={useMemo(() => ['role'], [])} user={user} />,
          };
          return useData(x);
        }`,
        errors: [{ messageId: "object-usememo-deps" }, { messageId: "array-usememo-props" }, { messageId: "unknown-usememo-hook" }],
        options: [{ strict: true,
          checkHookReturnObject: true,
          fix: { addImports: true },
          checkHookCalls: true,
          ignoredHookCallsNames: {},
         }],
      },
    ],
  });
});

describe('require-usememo utils', () => {
  it("should return undefined if can't find parent",() => {
    expect(findParentType({ } as any, 'nothing')).toBeUndefined();
  })
});