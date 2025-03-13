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
  ];

  const invalidTestCases = [
    // Invalid case: Component not wrapped in memo
    {
      code: `
        import React from 'react';
        const Component = () => <div />;
        export default Component;
      `,
      errors: [{ messageId: 'wrapWithMemo' }],
    },
    // Invalid case: Default export not wrapped in memo
    {
      code: `
        import React from 'react';
        export default () => <div />;
      `,
      errors: [{ messageId: 'wrapWithMemo' }],
    },
    // Invalid case: Named export not wrapped in memo
    {
      code: `
        import React from 'react';
        export const Component = () => <div />;
      `,
      errors: [{ messageId: 'wrapWithMemo' }],
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
      errors: [{ messageId: 'wrapWithMemo' }],
    },
  ];

  return { validTestCases, invalidTestCases };
};

// Add more shared test case functions for other rules as needed

// Add a dummy test to prevent Jest errors
if (process.env.NODE_ENV === 'test') {
  describe('Test Cases Utility', () => {
    test('exports test case generator functions', () => {
      expect(createRequireMemoTestCases).toBeDefined();
      const testCases = createRequireMemoTestCases();
      expect(testCases.validTestCases.length).toBeGreaterThan(0);
      expect(testCases.invalidTestCases.length).toBeGreaterThan(0);
    });
  });
} 