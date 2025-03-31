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
  
  // This should trigger a lint error - a function that should use useCallback
  const handleClick = () => {
    console.log('Clicked!', count);
    onClick();
  };
  
  // This should trigger a lint error - an array that should use useMemo
  const items = ['item1', 'item2', 'item3'];
  
  return (
    <div style={styles.container}>
      <p style={styles.text}>{label}: {count}</p>
      <Custom data={data} />
      <button type="button" onClick={handleClick}>Increment</button>
      <ul>
        {items.map(item => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

// Wrap with React.memo to prevent re-renders when props don't change
const MemoizedCountDisplay = React.memo(CountDisplay);

// This component should trigger errors because it's not wrapped in React.memo
function UnmemoizedComponent({ value }) {
  return <div>{value}</div>;
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
  
  return (
    <div className="App">
      <h1>ESLint React useMemo Plugin Example (v9 Flat Config)</h1>
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
    </div>
  );
}

export default App; 