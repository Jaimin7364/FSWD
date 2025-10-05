import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './Home';
import About from './About';
import Contact from './Contact';
import './App.css';

function Sidebar({ toggleSidebar }) {
  const navigate = useNavigate();

  return (
    <div className="sidebar open">
      <button className="nav-button" onClick={() => { navigate('/home'); toggleSidebar(); }}>Home</button>
      <button className="nav-button" onClick={() => { navigate('/about'); toggleSidebar(); }}>About</button>
      <button className="nav-button" onClick={() => { navigate('/contact'); toggleSidebar(); }}>Contact</button>
    </div>
  );
}

function MainApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="app">
      <div className="hamburger" onClick={toggleSidebar}>
        <div></div>
        <div></div>
        <div></div>
      </div>

      {sidebarOpen && <Sidebar toggleSidebar={toggleSidebar} />}

      <Routes>
        <Route
          path="/"
          element={
            <div className="content">
              <h1>Welcome to the Website</h1>
              <p>Click the ☰ icon to open the sidebar.</p>
            </div>
          }
        />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}
