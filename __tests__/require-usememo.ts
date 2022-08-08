import { Rule, RuleTester } from "eslint";
import rule from "src/require-usememo";

const ruleTester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    ecmaFeatures: { jsx: true },
  },
});

ruleTester.run("useMemo", rule as Rule.RuleModule, {
  valid: [
    {
      code: `const Component = () => {
      const myObject = React.useMemo(() => ({}), []);
      return <Child prop={myObject} />;
    }`,
    },
    {
      code: `const Component = () => {
      const myArray = useMemo(() => [], []);
      return <Child prop={myArray} />;
    }`,
    },
    {
      code: `const Component = () => {
      const myArray = React.useMemo(() => new Object(), []);
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
      code: `const Component = () => {
        const myArray = lodash.memoize([]);
        return <Child prop={myArray} />;
      }`,
    },
    {
      code: `const Component = () => {
        const myComplexString = css\`color: red;\`;
        return <Child prop={myComplexString} />;
      }`,
    },
  ],
  invalid: [
    {
      code: `const Component = () => {
        const myObject = {};
        return <Child prop={myObject} />;
      }`,
      errors: [{ messageId: "object-usememo-props" }],
    },
    {
      code: `const Component = () => {
        const myArray = [];
        return <Child prop={myArray} />;
      }`,
      errors: [{ messageId: "array-usememo-props" }],
    },
    {
      code: `const Component = () => {
        const myInstance = new Object();
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
      code: `const Component = () => {
        const firstInstance = React.useMemo(() => new Object(), []);
        const second = new Object();
        return <Child prop={firstInstance || second} />;
      }`,
      errors: [{ messageId: "instance-usememo-props" }],
    },
    {
      code: `const Component = () => {
        let myObject = useMemo({});
        myObject = {a: 'b'};
        return <Child prop={myObject} />;
      }`,
      errors: [{ messageId: "usememo-const" }],
    },
    {
      code: `const Component = () => {
        return <Child prop={{}} />;
      }`,
      errors: [{ messageId: "object-usememo-props" }],
    },
    {
      code: `class Component {
        render() {
          return <Child prop={{}} />;
        }
      }`,
      errors: [{ messageId: "object-class-memo-props" }],
    },
    {
      code: `const Component = () => {
        return <Child prop={[]} />;
      }`,
      errors: [{ messageId: "array-usememo-props" }],
    },
    {
      code: `class Component {
        render() {
          return <Child prop={[]} />;
        }
      }`,
      errors: [{ messageId: "array-class-memo-props" }],
    },
    {
      code: `const Component = () => {
        const myObject = memoize({});
        return <Child prop={myObject} />;
      }`,
      options: [{ strict: true }],
      errors: [{ messageId: "unknown-usememo-props" }],
    },
    {
      code: `const Component = () => {
        const myArray = lodash.memoize([]);
        return <Child prop={myArray} />;
      }`,
      options: [{ strict: true }],
      errors: [{ messageId: "unknown-usememo-props" }],
    },
    {
      code: `class Component {
        render() {
          const myArray = lodash.memoize([]);
          return <Child prop={myArray} />;
        }
      }`,
      options: [{ strict: true }],
      errors: [{ messageId: "unknown-class-memo-props" }],
    },
    {
      code: `const Component = () => {
        const myArray1 = [];
        const myArray2 = React.useMemo(() => myArray1, [myArray1]);
        return <Child prop={myArray2} />;
      }`,
      errors: [{ messageId: "array-usememo-deps" }],
    },
    {
      code: `const Component = () => {
        const myComplexString = css\`color: red;\`;
        return <Child prop={myComplexString} />;
      }`,
      options: [{ strict: true }],
      errors: [{ messageId: "unknown-usememo-props" }],
    },
    {
      code: `const Component = () => {
        let myObject;
        myObject = {};
        return <Child prop={myObject} />;
      }`,
      errors: [{ messageId: "usememo-const" }],
    },
  ],
});
