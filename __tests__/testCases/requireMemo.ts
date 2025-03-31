/**
 * Shared test cases for ESLint plugin rules
 * This file contains test cases that can be used by both ESLint v8 and v9 test configurations
 */

// Helper to create a standard set of test cases for require-memo
export const createRequireMemoTestCases = () => {
  const validTestCases = [
    // Valid case: Component wrapped in memo
    {
      code: `
        import React, { memo } from 'react';
        const Component = memo(() => <div />);
        export default Component;
      `,
    },
    // Valid case: Default export wrapped in memo
    {
      code: `
        import React, { memo } from 'react';
        export default memo(() => <div />);
      `,
    },
    // Valid case: Named export wrapped in memo 
    {
      code: `
        import React, { memo } from 'react';
        export const Component = memo(() => <div />);
      `,
    },
    // Valid case: Expression wrapped in memo
    {
      code: `
        import React, { memo } from 'react';
        const Component = memo(() => {
          return <div />;
        });
        export default Component;
      `,
    },
    // Valid case: Alternative memo import
    {
      code: `
        import { memo } from 'react';
        export default memo(() => <div />);
      `,
    },
    // Valid case: Full React import with memo
    {
      code: `
        import React from 'react';
        export default React.memo(() => <div />);
      `,
    },
    // Additional cases from require-memo.test.ts
    { code: "export const TestMap = {};" },
    { code: "const TestMap = {}; export default TestMap;" },
    { code: "export default {};" },
    { code: "export const SomethingWeird = func()();" },
    { code: "export const Component = useRef(() => <div />)" },
    { code: "export const Component = useRef(function() { return <div />; })" },
    { code: "export const variable = func()();" },
    { code: "export const Component = React.memo(() => <div />)" },
    { code: "export const Component = memo(() => <div />)" },
    { code: "const Component = memo(() => <div />); export default Component;" },
    { code: "export default memo(function Component() { return <div />; })" },
    { code: "export const Component = memo(useRef(() => <div />))" },
    { code: "const Component = React.useRef(React.memo(() => <div />))" },
    { code: "export const myFunction = () => <div />" },
    { code: "export const myFunction = wrapper(() => <div />)" },
    { code: "export const Component = React.memo(function() { return <div />; });" },
    { code: "export const Component = memo(function Component() { return <div />; });" },
    { code: "function myFunction() { return <div />; }" },
    { code: "const myFunction = wrapper(function() { return <div /> })" },
    { 
      code: "export default function() { return <div /> };",
      filename: "dir/myFunction.js",
      parserOptions: {
        ecmaVersion: 6,
        sourceType: "module"
      }
    },
    { code: "const Component = () => <div />; export default memo(Component);" },
    {
      code: "export const Component = () => <div />",
      options: [{
        ignoredComponents: {
          'Component': true,
        }
      }]
    },
  ];

  const invalidTestCases = [
    // Invalid case: Component not wrapped in memo
    {
      code: `
        import React from 'react';
        const Component = () => <div />;
        export default Component;
      `,
      errors: [{ messageId: 'memo-required' }],
    },
    // Invalid case: Default export not wrapped in memo
    {
      code: `
        import React from 'react';
        export default () => <div />;
      `,
      errors: [{ messageId: 'memo-required' }],
    },
    // Invalid case: Named export not wrapped in memo
    {
      code: `
        import React from 'react';
        export const Component = () => <div />;
      `,
      errors: [{ messageId: 'memo-required' }],
    },
    // Invalid case: Component with expression not wrapped in memo
    {
      code: `
        import React from 'react';
        const Component = () => {
          return <div />;
        };
        export default Component;
      `,
      errors: [{ messageId: 'memo-required' }],
    },
    // Additional cases from require-memo.test.ts
    {
      code: "export const Component = () => <div />",
      errors: [{ messageId: "memo-required" }],
    },
    {
      code: "export const ListItem = () => <div />",
      errors: [{ messageId: "memo-required" }],
      options: [{
        ignoredComponents: {
          '*Item': false,
          '*': true
        }
      }]
    },
    {
      code: "const Component = () => <div />; export default Component;",
      errors: [{ messageId: "memo-required" }],
    },
    {
      code: "export const Component = function Component() { return <div />; }",
      errors: [{ messageId: "memo-required" }],
    },
    {
      code: "export function Component() { return <div />; }",
      errors: [{ messageId: "memo-required" }],
    },
    {
      code: "export default function Component() { return <div />; }",
      errors: [{ messageId: "memo-required" }],
    },
  ];

  return { validTestCases, invalidTestCases };
};

