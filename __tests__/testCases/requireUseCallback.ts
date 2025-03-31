/**
 * Shared test cases for ESLint plugin rules
 * This file contains test cases that can be used by both ESLint v8 and v9 test configurations
 */

// Helper to create a standard set of test cases for require-usecallback
export const createRequireUseCallbackTestCases = () => {
  const validTestCases = [
    {
      code: `const Component = () => {
        const myFn = useCallback(function() {}, []);
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
        const myFn2 = useCallback(() => myFn1, [myFn1]);
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
          const myFn2 = useCallback(() => myFn1, [myFn1]);
          return <Child prop={myFn2} />;
        }`,
    },
    {
      code: `const Component = () => {
          const myFn = useMemo(() => function() {}, []);
          return <Child prop={myFn} />;
        }`,
    }
  ];

  const invalidTestCases = [
    {
      code: `
        const Component = () => {
          const myFn = function myFn() {};
          return <Child prop={myFn} />;
        }`,
      output: `import { useCallback } from 'react';

        const Component = () => {
          const myFn = useCallback(() => {}, []);
          return <Child prop={myFn} />;
        }`,
      errors: [{ messageId: "function-usecallback-props" }],
    },
    {
      code: `
        const Component = () => {
          const myFn = () => {};
          return <Child prop={myFn} />;
        }`,
      output: `import { useCallback } from 'react';

        const Component = () => {
          const myFn = useCallback(() => {}, []);
          return <Child prop={myFn} />;
        }`,
      errors: [{ messageId: "function-usecallback-props" }],
    },
    {
      code: `
        const Component = () => {
          let myFn = useCallback(() => ({}));
          myFn = () => ({});
          return <Child prop={myFn} />;
        }`,
      output: `
        const Component = () => {
          const myFn = useCallback(() => ({}));
          myFn = () => ({});
          return <Child prop={myFn} />;
        }`,
      errors: [{ messageId: "usememo-const" }],
    },
    {
      code: `
        const Component = () => {
          return <Child prop={() => {}} />;
        }`,
      errors: [{ messageId: "function-usecallback-props" }],
      output: `import { useCallback } from 'react';

        const Component = () => {
          const prop = useCallback(() => {}, []);
          return <Child prop={prop} />;
        }`,
    },
    {
      code: `
        const Component = () => {
          return <Child prop={() => []} />;
        }`,
      errors: [{ messageId: "function-usecallback-props" }],
      output: `import { useCallback } from 'react';

        const Component = () => {
          const prop = useCallback(() => [], []);
          return <Child prop={prop} />;
        }`,
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
      code: `
        const Component = () => {
          const myFn1 = () => [];
          const myFn2 = useCallback(() => [], []);
          return <Child prop={myFn2 || myFn1} />;
        }`,
      output: `import { useCallback } from 'react';

        const Component = () => {
          const myFn1 = useCallback(() => [], []);
          const myFn2 = useCallback(() => [], []);
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
      code: `
        const Component = () => {
          const myFn = function test() {};
          return <Child prop={myFn} />;
        }`,
      output: `import { useCallback } from 'react';

        const Component = () => {
          const myFn = useCallback(() => {}, []);
          return <Child prop={myFn} />;
        }`,
      errors: [{ messageId: "function-usecallback-props" }],
    },
    {
      code: `
        const Component = () => {
          const myFn = () => [];
          return <Child prop={myFn} />;
        }`,
      output: `import { useCallback } from 'react';

        const Component = () => {
          const myFn = useCallback(() => [], []);
          return <Child prop={myFn} />;
        }`,
      errors: [{ messageId: "function-usecallback-props" }],
    },
    {
      code: `import { useMemo } from 'react';

        const Component = () => {
          const myFn = () => [];
          const myFn2 = () => [];
          return <Child prop={myFn} props2={myFn2} />;
        }`,
      output: `import { useMemo, useCallback } from 'react';

        const Component = () => {
          const myFn = useCallback(() => [], []);
          const myFn2 = useCallback(() => [], []);
          return <Child prop={myFn} props2={myFn2} />;
        }`,
      errors: [{ messageId: "function-usecallback-props" }, { messageId: "function-usecallback-props" }],
    },
    {
      code: `
        const Component = () => {
          const myFn = async function test() {};
          return <Child prop={myFn} />;
        }`,
      output: `import { useCallback } from 'react';

        const Component = () => {
          const myFn = useCallback(async () => {}, []);
          return <Child prop={myFn} />;
        }`,
      errors: [{ messageId: "function-usecallback-props" }],
    },
    {
      code: `
        const Component = () => {
          const myFn = async () => [];
          return <Child prop={myFn} />;
        }`,
      output: `import { useCallback } from 'react';

        const Component = () => {
          const myFn = useCallback(async () => [], []);
          return <Child prop={myFn} />;
        }`,
      errors: [{ messageId: "function-usecallback-props" }],
    },
    {
      code: `
        const Component = () => {
          return <Child prop={async () => []} />;
        }`,
      output: `import { useCallback } from 'react';

        const Component = () => {
          const prop = useCallback(async () => [], []);
          return <Child prop={prop} />;
        }`,
      errors: [{ messageId: "function-usecallback-props" }],
    }
  ];

  return { validTestCases, invalidTestCases };
};

// Add a dummy test to prevent Jest errors
if (process.env.NODE_ENV === 'test') {
  describe('Test Cases Utility', () => {
    test('exports test case generator functions', () => {
      expect(createRequireUseCallbackTestCases).toBeDefined();
      const testCases = createRequireUseCallbackTestCases();
      expect(testCases.validTestCases.length).toBeGreaterThan(0);
      expect(testCases.invalidTestCases.length).toBeGreaterThan(0);
    });
  });
} 