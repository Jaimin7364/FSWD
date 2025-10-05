import { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
// After
import { auth, db } from "../firebase.js";
const Auth = () => {
  const [isSignup, setIsSignup] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const ensureUserDoc = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName || 'Anonymous',
        email: user.email,
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
      });
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignup) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const displayName = name.trim() || email.split('@')[0];
        const photoURL = `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(displayName)}`;
        await updateProfile(cred.user, { displayName, photoURL });
        await ensureUserDoc({ ...cred.user, displayName, photoURL });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await ensureUserDoc(result.user);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="auth card">
      <div className="logo" style={{ marginBottom: '12px' }}>
        <span className="dot"></span> <span>Chatter</span>
      </div>
      <h2>{isSignup ? 'Create account' : 'Welcome back'}</h2>
      <form onSubmit={handleAuthSubmit}>
        {isSignup && (
          <div className="group">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" />
          </div>
        )}
        <div className="group">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="ada@chatter.app" />
        </div>
        <div className="group">
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" />
        </div>
        <div className="group">
          <button type="submit" className="btn primary full">{isSignup ? 'Sign up' : 'Sign in'}</button>
        </div>
      </form>
      <div className="group">
        <button className="btn full" onClick={handleGoogleSignIn}>Continue with Google</button>
      </div>
      <div className="switch">
        {isSignup ? 'Already have an account? ' : "Don't have an account? "}
        <a href="#" onClick={(e) => { e.preventDefault(); setIsSignup(!isSignup); }}>
          {isSignup ? 'Sign in' : 'Create one'}
        </a>
      </div>
    </div>
  );
};

export default Auth;