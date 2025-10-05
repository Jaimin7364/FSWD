import React, { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(0);
  const incrementFive = () => setCount(count + 5);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Count: {count}</h1>
        
        <div className="button-container">
          <button onClick={reset}>Reset</button>
          <button onClick={increment}>Increment</button>
          <button onClick={decrement}>Decrement</button>
          <button onClick={incrementFive}>Increment 5</button>
        </div>
        
        <div className="welcome-section">
          <h2>Welcome to CHARUSAT!!!</h2>
          
          <div className="input-container">
            <div className="input-group">
              <label htmlFor="firstName">First Name: </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="lastName">Last Name: </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
              />
            </div>
          </div>
          
          <div className="display-names">
            <p>First Name: {firstName}</p>
            <p>Last Name: {lastName}</p>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
