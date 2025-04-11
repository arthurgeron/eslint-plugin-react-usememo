import React from 'react';

export const Custom = React.memo(({ data }) => {
  return (
    <div>
      <h4>Custom Component</h4>
      <p>Name: {data.name}</p>
      <p>Age: {data.age}</p>
    </div>
  );
});
