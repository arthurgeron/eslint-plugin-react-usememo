/**
 * Shared test cases for ESLint plugin rules
 * This file contains test cases that can be used by both ESLint v8 and v9 test configurations
 */

// Helper to create a standard set of test cases for require-usememo
export const createRequireUseMemoTestCases = () => {
  const validTestCases = [
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
      code: `
        function userTest() {
          const y = (data) => {};
          return y;
        }`,
    },
    {
      code: `
        function hi() {
          const y = (data) => {};
          return y;
        }`,
    },
    {
      code: `const Component = () => {
        const myArray = useMemo(() => new Object(), []);
        return <Child prop={myArray} />;
        }`
    },
    {
      code: `
        const labels = ['data']
      const Content = <Text labels={labels} />
        const Component = () => {
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
            return use(x);
          }`,
    },
    {
      code: `
          function useTesty() {
            const x = {};
            return useDataManager(x);
          }`,
      options: [{ checkHookReturnObject: true, ignoredHookCallsNames: {"!useDate*": true} }],
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
          // @ts-ignore
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
    // ignoredPropNames
    {
      code: `const Component = () => {
          const myObject = {};
          return <Child ignoreProp={myObject} />;
        }`,
      options: [{ ignoredPropNames: ["ignoreProp"] }],
    },
    {
      code: `const Component = () => {
          const myCallback = () => {};
          return <button onClick={myCallback}>Click me</button>;
        }`,
      options: [{ ignoredPropNames: ["onClick"] }],
    },
    {
      code: `const Component = () => {
          return <div style={{ width: '200px' }} />;
        }`,
      options: [{ ignoredPropNames: ["style"] }],
    },
    {
      code: `const Component = () => {
          return <button onClick={() => {}}>Click me</button>;
        }`,
      options: [{ ignoredPropNames: ["onClick"] }],
    },
    {
      code: `
        const ComponentA = ({ comp }) => {
          return <div>{comp}</div>;
        };

        const ComponentB = () => {
          return <div>ComponentB</div>;
        };

        export const MyServerComponent = async () => {
          return (
            <div>
              <ComponentA comp={<ComponentB />} />
            </div>
          );
        };`,
    },
  ];

  const invalidTestCases = [
    {
      code: `
          import React, { useMemo } from 'react';
          const MyComponent = () => {
            const items = [1, 2];
            return (
              <div>
                {items.map(item => <ChildComponent key={item} prop={{}} />)}
                {items.forEach(item => <ChildComponent key={item} prop={{}} />)}
                {items.reduce((acc, item) => <ChildComponent key={item} prop={{}} />)}
                {items.some((acc, item) => <ChildComponent key={item} prop={{}} />)}
                {items.every((acc, item) => <ChildComponent key={item} prop={{}} />)}
                {items.find((acc, item) => <ChildComponent key={item} prop={{}} />)}
                {items.findIndex((acc, item) => <ChildComponent key={item} prop={{}} />)}
              </div>
            );
          };
        `,
      errors: [
        { messageId: "error-in-invalid-context" },
        { messageId: "error-in-invalid-context" },
        { messageId: "error-in-invalid-context" },
        { messageId: "error-in-invalid-context" },
        { messageId: "error-in-invalid-context" },
        { messageId: "error-in-invalid-context" }, 
        { messageId: "error-in-invalid-context" }
      ],
    },
    {
      code: `
          import React, { useMemo } from 'react';
          const MyComponent = () => {
            const itemsJSX = useMemo(() => <ChildComponent key={item} prop={{}} />, []);
            const itemsParsed = useMemo(() => items.map(item => <ChildComponent key={item} prop={{}} />), []);

            return null;
          };
        `,
      errors: [
        { messageId: "error-in-invalid-context" },
        { messageId: "error-in-invalid-context" }
      ],
    },
    {
      code: `
          import React, { useMemo } from 'react';
          const Component = ({ tabs, prop1 }) => {
            const tabList = useMemo(
              () => (
                <TabList
                  prop1={prop1}
                  onClick={(next) => next}
                >
                  {tabs.map(({ id, text }) => (
                    <Tab key={id} id={id}>
                      {text}
                    </Tab>
                  ))}
                </TabList>
              ),
              [tabs, prop1]
            );
            return tabList;
          };
        `,
      errors: [{ messageId: "error-in-invalid-context" }],
    },
    {
      code: `
          import React, { useCallback } from 'react';
          const MyComponent = () => {
            const handleClick = useCallback(() => {
              return <ChildComponent prop={{}} />;
            }, []);
            return <div onClick={handleClick}>Click me</div>;
          };
        `,
      errors: [{ messageId: "error-in-invalid-context" }],
    },
    {
      code: `
        export function useBookDetails() {
          const bookDetails = { title: 'Example', author: 'Author' };
          const dataLoaded = true;

          return {
            ...bookDetails,
            dataLoaded,
          };
        }`,
      output: `import { useMemo } from 'react';

        export function useBookDetails() {
          const bookDetails = useMemo(() => ({ title: 'Example', author: 'Author' }), []);
          const dataLoaded = true;

          return {
            ...bookDetails,
            dataLoaded,
          };
        }`,
      options: [{ strict: false, checkHookCalls: false }],
      errors: [{ messageId: "object-usememo-hook" }],
    },
    {
      code: `
        const Component = ({ props }) => {
          return <MyComponent data={props?.data || {}} />;
        }`,
      errors: [{ messageId: "error-in-invalid-context" }],
    },
    {
      code: `
        const Component = ({ condition }) => {
          return <Child prop1={condition ? {} : {}} />;
        }`,
      errors: [{ messageId: "error-in-invalid-context" }],
    },
    {
      code: `
        const Component = ({ condition }) => {
          if (condition) {
            return <Child>1</Child>;
          }
          return <Child prop1={{}} />;
        }`,
      errors: [{ messageId: "error-in-invalid-context" }],
    },
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
      code: `import { useMemo } from 'react';
        function useTesty() {
          const x = {};
          return useDataManager(x);
        }`,
      options: [{ checkHookReturnObject: true, ignoredHookCallsNames: {"useData*": false} }],
      output: `import { useMemo } from 'react';
        function useTesty() {
          const x = useMemo(() => ({}), []);
          return useDataManager(x);
        }`,
      errors: [{ messageId: "object-usememo-deps" }],
    },
    {
      code: `
        const useTest = () => {
          // @ts-ignore
          const x: boolean | undefined = false;
          function y() {}
          return {x, y};
        }`,
      output: `import { useCallback } from 'react';

        const useTest = () => {
          // @ts-ignore
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
    {
      code: `import type { ComponentProps } from 'react';
        import React from 'react';

        const Component = () => {
          const myArray = [];
          return <Child prop={myArray} />;
        }`,
      output: `import type { ComponentProps } from 'react';
        import React, { useMemo } from 'react';

        const Component = () => {
          const myArray = useMemo(() => [], []);
          return <Child prop={myArray} />;
        }`,
      errors: [{ messageId: "array-usememo-props" }],
    },
    {
      code: `import type { ComponentProps } from 'react';

        const Component = () => {
          const myArray = [];
          return <Child prop={myArray} />;
        }`,
      output: `import { useMemo } from 'react';
import type { ComponentProps } from 'react';

        const Component = () => {
          const myArray = useMemo(() => [], []);
          return <Child prop={myArray} />;
        }`,
      errors: [{ messageId: "array-usememo-props" }],
    },
    {
      code: `import type { ComponentProps } from 'react';
        import React, { useRef } from 'react';

        const Component = () => {
          const myRef = useRef();
          const myArray = [];
          return <Child ref={myRef} prop={myArray} />;
        }`,
      output: `import type { ComponentProps } from 'react';
        import React, { useRef, useMemo } from 'react';

        const Component = () => {
          const myRef = useRef();
          const myArray = useMemo(() => [], []);
          return <Child ref={myRef} prop={myArray} />;
        }`,
      errors: [{ messageId: "array-usememo-props" }],
    },
    {
      code: `
        function useTest() {
          return { x: 1 };
        }`,
      output: `import { useMemo } from 'react';

        function useTest() {
          return useMemo(() => ({ x: 1 }), []);
        }`,
      errors: [{ messageId: "object-usememo-hook" }],
      options: [{ checkHookReturnObject: true, strict: true }],
    },
    {
      code: `
        function useTest() {
          return (data) => {};
        }`,
      output: `import { useCallback } from 'react';

        function useTest() {
          return useCallback((data) => {}, []);
        }`,
      errors: [{ messageId: "function-usecallback-hook" }],
      options: [{ checkHookReturnObject: true, strict: true }],
    },
    {
      code: `
        function useTest() {
          const y = { x: 1 };
          return y;
        }`,
      output: `import { useMemo } from 'react';

        function useTest() {
          const y = useMemo(() => ({ x: 1 }), []);
          return y;
        }`,
      errors: [{ messageId: "object-usememo-hook" }],
      options: [{ checkHookReturnObject: true, strict: true }],
    },
    {
      code: `
        function useTest() {
          const y = (data) => {};
          return y;
        }`,
      output: `import { useCallback } from 'react';

        function useTest() {
          const y = useCallback((data) => {}, []);
          return y;
        }`,
      errors: [{ messageId: "function-usecallback-hook" }],
      options: [{ checkHookReturnObject: true, strict: true }],
    },
    {
      code: `import { anything } from 'react'

        const useMyHook = () => {
          useAnotherHook(
            () => {},
            []
          );
        };`,
      output: `import { anything, useCallback } from 'react'

        const useMyHook = () => {
          useAnotherHook(
            useCallback(() => {}, []),
            []
          );
        };`,
      errors: [{ messageId: "function-usecallback-deps" }, { messageId: "array-usememo-deps" }],
    },
  ];

  return { validTestCases, invalidTestCases };
};
