/**
 * Shared test cases for ESLint plugin rules
 * This file contains test cases that can be used by both ESLint v8 and v9 test configurations
 */

// Helper to create a standard set of test cases for require-usememo-children
export const createRequireUseMemoChildrenTestCases = () => {
  const validTestCases = [
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
    }
  ];

  const invalidTestCases = [
    // {
    //   code: `const Component = () => {
    //     const children = React.useMemo(() => <div><Grandchild /></div>, []);
    //     return <Child>
    //       <>
    //         {children}
    //       </>
    //     </Child>;
    //   }`,
    //   errors: [{ messageId: "jsx-usememo-children" }],
    // },
    {
      code: `const Component = () => {
        const children = <div />;
        return <Child>{children}</Child>
      }`,
      errors: [{ messageId: "jsx-usememo-children" }],
    },
    // {
    //   code: `const Component = () => {
    //     const children = [<div />, <Child1 />, <Child2 />];
    //     return <Child>{children}</Child>
    //   }`,
    //   errors: [{ messageId: "array-usememo-children" }],
    // },
    // {
    //   code: `const Component = () => {
    //     return <Child>
    //       {() => <div />}
    //     </Child>
    //   }`,
    //   errors: [{ messageId: "function-usecallback-children" }],
    // }
  ];

  return { validTestCases, invalidTestCases };
};
