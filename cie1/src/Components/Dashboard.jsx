import React, { useState, useEffect } from "react";
import "./Dashboard.css";

const Dashboard = () => {
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [votes, setVotes] = useState({
    Excellent: 0,
    Good: 0,
    Average: 0,
    Poor: 0,
  });
  const [userVoteCount, setUserVoteCount] = useState(0);

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  useEffect(() => {
    const categories = ["Excellent", "Good", "Average", "Poor"];
    const interval = setInterval(() => {
      const random = categories[Math.floor(Math.random() * categories.length)];
      setVotes((prev) => ({ ...prev, [random]: prev[random] + 1 }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleVote = (type) => {
    setVotes((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    setUserVoteCount((prev) => prev + 1);
  };

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const formatDate = (date) =>
    date.toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="dashboard-container">
      <div className="greeting">
        <h2>Enter Your Name</h2>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Surname"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
        />
        {firstName && surname && (
          <h1 className="welcome-message">➤ Welcome, {firstName} {surname}!</h1>
        )}
      </div>

      <div className="clock">
        📅 {formatDate(currentTime)} | ⏰ {formatTime(currentTime)}
      </div>

      <div className="feedback-section">
        <h2>Rate the Session:</h2>
        <div className="feedback-buttons">
          {["Excellent", "Good", "Average", "Poor"].map((label) => (
            <button key={label} onClick={() => handleVote(label)}>
              {label}
            </button>
          ))}
        </div>
        <div className="vote-grid">
          {Object.entries(votes).map(([key, count]) => (
            <div key={key} className="vote-card">
              <h3>{key}</h3>
              <p>{count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="counter-panel">
        <h2>Your Feedback Count:</h2>
        <p className="vote-count">{userVoteCount}</p>
        <div className="counter-buttons">
          <button onClick={() => setUserVoteCount((c) => c + 1)}>Increment</button>
          <button onClick={() => setUserVoteCount((c) => (c > 0 ? c - 1 : 0))}>Decrement</button>
          <button onClick={() => setUserVoteCount(0)}>Reset</button>
          <button onClick={() => setUserVoteCount((c) => c + 5)}>+5</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
