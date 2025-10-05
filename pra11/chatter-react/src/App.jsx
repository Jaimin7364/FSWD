import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
// After
import { auth } from "./firebase.js";

import ChatApp from './components/ChatApp';
import Auth from './components/Auth';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This listener handles auth state persistence across page refreshes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading-screen">Loading...</div>; // Or a proper spinner component
  }

  return user ? <ChatApp user={user} /> : <Auth />;
}

export default App;