# eslint-plugin-react-usememo

Enforce that functions or complex objects that can generate unecessary renders or side-effects are wrapped in `useMemo` or `useCallback`, allow for devs to enforce that functional components be wrapped in `memo` programatically, and that all props and deps are wrapped in `useMemo`/`useCallback`; The intended outcome is that component's tree and/or expensive lifecycles (e.g. React Native's FlatLists, useEffect, useMemo, etc) only re-calculate or render again when really necessary, controlling expensive expressions and bringing out the best scalability and performance that your application can get.

## Rationale
React Native's own [docs](https://reactnative.dev/docs/0.61/optimizing-flatlist-configuration#avoid-anonymous-function-on-renderitem) state how it's important to use static or memoized as props for complex children (FlatList on that case), that applies even more broadly when we are talking about custom components (the Components you've created), it might not seem necessary at first but you'll be making a bet that the component in question will never grow to use `memo` or those props in hooks (i.e. useEffect, useMemo, useCallback), you'll only notice once your solution starts freezing and dropping frames, that's why using the `require-usememo` rule is recommended.


# Installation

```
yarn add @arthurgeron/eslint-plugin-react-usememo --dev
```   
or   
```
npm install @arthurgeron/eslint-plugin-react-usememo --save-dev
```


# Usage

To enable the plugin add the following to the `plugin` property  your `eslintrc` file:
```json
"plugins": ["@arthurgeron/react-usememo"],
```

Then enable any rules as you like, example:
```json
"rules": {
    "@arthurgeron/react-usememo/require-usememo": [2],
},
```
# Rules   

## `require-usememo` **Recommended**

Requires complex values (objects, arrays, functions, and JSX) that get passed props or referenced as a hook dependency to be wrapped in `React.useMemo()` or `React.useCallback()`.

Options:

- `{strict: true}`: Fails even in cases where it is difficult to determine if the value in question is a primitive (string or number) or a complex value (object, array, etc.);

- `{checkHookReturnObject: true}`: Will require Object Expressions passed in return statements (e.g. `return {someFunc}`) to also be memoised (e.g. `return useMemo(() => ({someFunc}), [someFunc])`); **Disabled** by default;

- `{checkHookCalls: true}`: Will require objects/data passed to a non-native/Custom hook to be memoized (e.g. in this code `const data = useParse(unparsedData)` it will check `unparsedData` for memo status), this check can be ignored by a hook/name basis, check next item for details; **Enabled** by default;

- `{ignoredHookCallsNames: Record<string, boolean>}`: You can add specific hooks names here, individually disabling or enabling them to be checked when used, e.g. if you have a custom hook named `useX` and it should be called with unmemoized parameters you can set `{ ignoredHookCallsNames: { useX: false } }` and then have somethning like `const data = {}; const x = useX(data);` not generate any errors.

### Function Components
#### **Incorrect**
```JavaScript
  function Component() {

    const [data, setData] = useState([]);
    
    
    // This will be redeclared each render
    function renderItem({ item }) {
      return (<Text>item.name</Text>);
    }

    // Data isn't redeclared each ender but `[]` is
    return (<FlatList renderItem={renderItem} data={data ?? []} />);
  }
```
#### **Correct**
```JavaScript
  // Has no dynamic dependencies therefore should be static, will be declared only once.
  function renderItem({ item }) {
    return <Text>item.name</Text>;
  }

  const EMPTY_ARRAY = [];

  function Component() {

    const [data, setData] = useState(EMPTY_ARRAY);
    
    // Will only render again if data changes
    return (<FlatList renderItem={renderItem} data={data ?? EMPTY_ARRAY} />);
  }
```
### Class Components
#### **Incorrect**
```JavaScript
  class Component() {

    constructor(props) {
      super(props);
      this.state = {
        data: undefined,
        propDrivenData: props.,
      };
    }
    
    
    // This will NOT be redeclared each render
    getItemName(item) {
      return item.name;
    }

    render() {
      // This function will be redeclared each render
      function renderItem({ item }) {
        return (<Text>{this.getItemName(item)}</Text>);
      }

      // Data isn't redeclared each ender but [] is
      // Extradata has a exponential complexity (will iterate the entire array for each render, could render once or several times in a second)
      // Outcome will be that any new render on this component will cause the entire FlatList to render again, including children components, even if the data hasn't changed.
      return (<FlatList
        renderItem={renderItem}
        data={data ?? []} 
        extraData={dataArray.filter(id => !!id)}
      />);
    }
  }
```
In the previous example there are two issues, a function and a object that will be dynamically redeclared each time the component renders, which will cause FlatList to keep re-rendering even when the input data hasn't changed.

#### **Correct**
```JavaScript

  // Static therefore is only declared once
  const EMPTY_ARRAY = [];

  class Component() {
    constructor(props) {
      super(props);
      this.state = {
        data: undefined,
        propDrivenData: props.dataArray.filter(id => !!id),
      };
    }
    
    // Properly regenerate state driven data only when props change instead of during each render
    static getDerivedStateFromProps(props) {
      if (props.propDrivenData !== this.props.propDrivenData) {
        return {
          propDrivenData: props.dataArray.filter(id => !!id),
        };
      }
      return null;
    }

    // Will be declared only once.
    getItemName({item}) {
      const { data } = this.state;
      const dataLength = data ? data.length : 0;
      return (<Text>{item.name} {dataLength}</Text>);
    }

    render() {
      const { data } = this.state;
      // Will only cause a new render if data changes
      return (<FlatList renderItem={this.renderItem} data={data ?? EMPTY_ARRAY} />);
    }
  }
```
#### **Correct**
```JavaScript
  const EMPTY_ARRAY = [];

  function Component() {
    const [data, setData] = useState(EMPTY_ARRAY);
    const [isEditing, setIsEditing] = useState(false);

    // Has dynamic dependencies but will only be re-declared when isEditing or the input data changes
    const renderItem = useCallback(({ item }) => {
      return (<Text>{isEditing ? 'item.name' : 'Editing'}</Text>);
    }, [isEditing]);

    return (<FlatList renderItem={renderItem} data={data ?? EMPTY_ARRAY} />);
  }
```
### Hooks
Hooks return statements follow the same motto, they can and usually are used inside other hooks.

#### **Incorrect**
```JavaScript
  function useData() {

    let otherData = {};
    function getData() {}
    
    return { getData, otherData};
  }
```
#### **Incorrect** (checkHookReturnObject: true)
```JavaScript
  function getData() {}

  function useData() {
    
    return { getData };
  }
```

#### **Incorrect** Calling a custom hook
```JavaScript
  function doSomething() {}

  function useStateManagement(someFlag) {
    useEffect(() => {
      doSomething(someFlag);
    }, [someFlag]);
  }

  function useData() {
    const someFlag = {};
    // Some flag is memoized, so not unwanted side effects are generated in the other hook
    const data = useStateManagement(someFlag);
  }
```

#### **Correct**
```JavaScript
  const otherData = {}; // Or declare inside hook with useMemo

  function useData() {
    const getData = useCallback(() => { // Or declare statically
    }, []);
    return {getData, otherData};
  }
```

#### **Correct** (checkHookReturnObject: true)
```JavaScript
  function getData() {
    // Doing something
  }
  function useData() {
    
    return useMemo(() => ({ getData }), []);
  }
```
#### **Correct** Passing a dependency to a hook
```JavaScript
  function getData() {}

  function useData() {
    
    return useMemo(() => ({ getData }), []);
  }
```
#### **Correct** Calling a custom hook
```JavaScript
  function doSomething() {}

  function useStateManagement(someFlag) {
    useEffect(() => {
      doSomething(someFlag);
    }, [someFlag]);
  }

  function useData() {
    const someFlag = useMemo(() => ({}), []);
    // Some flag is memoized, so not unwanted side effects are generated in the other hook
    const data = useStateManagement(someFlag);
  }
```
#### **"Correct"** Calling a custom hook (checkHookCalls: true) or (ignoredHookCallsNames: { useStateManagement: false })
```JavaScript
  function doSomething() {
  }
  function useStateManagement(someFlag) {
    useEffect(() => {
      doSomething(someFlag);
    }, [someFlag]);
  }

  function useData() {
    const someFlag = useMemo(() => ({}), []);
    // Some flag is regenerated each render, hence useEffect in "useStateManagement" will execute a new cycle each render
    // Either way this will not generate a error/warning because of the options passed
    const data = useStateManagement(someFlag);
  }
```



## `require-memo`

Requires all function components to be wrapped in `React.memo()`.   
May be useful when used with overrides in your eslint config, I do not recommend enabling this globally, while there's great advantaje in memoing a complex tree of components some smaller/basic components with no children might not need to be memoized. 

## **Incorrect**
```JavaScript
  export default function Component() {
    return (<Text>This is a component</Text>);
  }
```

## **Correct**
```JavaScript
  export default memo(function Component() {
    return (<Text>This is a component</Text>);
  });
```

## `require-usememo-children` **Advanced**

Requires complex values (objects, arrays, functions, and JSX) that get passed as children to be wrapped in `React.useMemo()` or `React.useCallback()`.

Options:

- `{strict: true}`: Fails even in cases where it is difficult to determine if the value in question is a primitive (string or number) or a complex value (object, array, etc.).

## **Incorrect**
```JavaScript
  function Component() {

    return (<View>
      <>
      <OtherComponent />
      </>
    </View>);
  }
```
   
## **Correct**
```JavaScript
  function Component() {
    const children = useMemo(() => (<OtherComponent />), []);
    
    return (<View>
      {children}
    </View>);
  }
```
