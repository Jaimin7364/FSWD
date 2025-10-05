import './App.css';
import React, { useState, useEffect } from 'react';

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentDate = currentTime.toLocaleDateString();
  const time = currentTime.toLocaleTimeString();

  return (
    <>
    <div className="App">
      <h1>Welcome To Charusat!</h1>
    </div>  
    <div className="time-container">
      <h2>Current Date and Time</h2>
      <p><b>Date:</b> {currentDate}</p>
      <p><b>Time:</b> {time}</p>
    </div>
    </>
  );
}

export default App;