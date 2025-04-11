import React, { useState, useMemo, useCallback } from 'react';
import { Custom } from './Custom';

// This component demonstrates a component that would benefit from useMemo and memo
function CountDisplay({ count, label, onClick }) {
  console.log(`Rendering CountDisplay with count: ${count}`);
  
  // This complex object should be memoized to prevent unnecessary re-renders
  const styles = useMemo(() => ({
    container: {
      padding: '20px',
      margin: '10px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      backgroundColor: count % 2 === 0 ? '#f0f0f0' : '#e0e0e0'
    },
    text: {
      color: count > 5 ? 'red' : 'blue',
      fontWeight: 'bold'
    }
  }), [count]);
   // This should trigger a lint error without useMemo because it creates a new object each render
   const data = {
    name: 'John',
    age: 30
  };
  
  return (
    <div style={styles.container}>
      <p style={styles.text}>{label}: {count}</p>
      <Custom data={data} />
      <button type="button" onClick={onClick}>Increment</button>
    </div>
  );
}

// Wrap with React.memo to prevent re-renders when props don't change
const MemoizedCountDisplay = React.memo(CountDisplay);

// This component is not wrapped in React.memo, which should trigger the require-memo rule
export function UnmemoizedComponent({ value }) {
  // Add some complexity to make sure it triggers the require-memo rule
  const formattedValue = `Value: ${value}`;
  const styles = {
    container: {
      padding: '10px',
      margin: '5px',
      border: '1px solid #ddd',
      borderRadius: '3px'
    }
  };
  
  return (
    <div style={styles.container}>
      <p>{formattedValue}</p>
      <span>This component should be memoized</span>
    </div>
  );
}

// Won't trigger ESLint errors because it's in ignoredComponents
export function Header({ title }) {
  return (
    <header style={{ backgroundColor: '#f8f9fa', padding: '1rem' }}>
      <h1>{title}</h1>
    </header>
  );
}

// Won't trigger ESLint errors because it's in ignoredComponents
export function Footer() {
  return (
    <footer style={{ backgroundColor: '#f8f9fa', padding: '1rem', marginTop: '2rem' }}>
      <p>© 2023 My Application</p>
    </footer>
  );
}

// Won't trigger ESLint errors because it's in ignoredComponents
export function SimpleText({ text }) {
  return <p>{text}</p>;
}

// A component with complex children that should trigger the require-usememo-children rule
function ComplexChildContainer({ children }) {
  return (
    <div className="container">
      {children}
    </div>
  );
}

function App() {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  
  // Using useCallback to memoize function references
  const incrementCount1 = useCallback(() => {
    setCount1(prevCount => prevCount + 1);
  }, []);
  
  const incrementCount2 = useCallback(() => {
    setCount2(prevCount => prevCount + 1);
  }, []);
  
  // Example of a complex calculation that should be memoized
  const total = useMemo(() => {
    console.log('Calculating total...');
    // Simulating expensive calculation
    return count1 + count2;
  }, [count1, count2]);
  
  // This could trigger a lint error without useMemo because it creates a new object each render
  const userData = useMemo(() => ({
    counts: {
      first: count1,
      second: count2,
      total
    },
    lastUpdated: new Date().toISOString()
  }), [count1, count2, total]);
  
  // These objects would normally require useMemo, but won't throw errors because their props are in ignoredPropNames
  const customStyle = { color: 'blue', fontWeight: 'bold' };
  const customClassName = { primary: true, secondary: false };
  
  // Calling a hook that would normally require its arguments to be memoized
  const useStateManagementResult = useStateManagement({ count1, count2 });
  
  // This complex JSX structure should be memoized when used as children
  const complexChildren = (
    <div>
      <h2>Complex Children</h2>
      <p>These children should be memoized with useMemo</p>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
    </div>
  );
  
  // This function should use useCallback
  const handleClick = () => {
    console.log('Clicked!');
  };
  
  return (
    <div className="App">
      <h1>ESLint React useMemo Plugin Example (v8)</h1>
      <Header title="Custom Header Component" />
      <p>Total: {total}</p>
      <p>Last Updated: {userData.lastUpdated}</p>
      
      <MemoizedCountDisplay 
        count={count1} 
        label="Counter 1" 
        onClick={incrementCount1} 
      />
      
      <MemoizedCountDisplay 
        count={count2} 
        label="Counter 2" 
        onClick={incrementCount2} 
      />
      
      <UnmemoizedComponent value={count1} />
      
      <div style={customStyle}>
        This div has a style prop that would normally require useMemo
      </div>
      
      <div className={customClassName}>
        This div has a className prop that would normally require useMemo
      </div>
      
      <SimpleText text="This component doesn't need memo" />
      
      <div>{useStateManagementResult}</div>
      
      <ComplexChildContainer>
        {complexChildren}
      </ComplexChildContainer>
      
      <button type="button" onClick={handleClick}>Click me</button>
      
      <Footer />
    </div>
  );
}

// Mock hook for demonstration
function useStateManagement(state) {
  return JSON.stringify(state);
}

export { MemoizedCountDisplay, ComplexChildContainer };
export default App; 