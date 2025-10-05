// === Firebase Config and Initialization ===
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCnBFM8C-8Kd_iBNUaAGNDTfaFjImy6Mjk",
  authDomain: "practical11-5a1a2.firebaseapp.com",
  projectId: "practical11-5a1a2",
  storageBucket: "practical11-5a1a2.firebasestorage.app",
  messagingSenderId: "299728561370",
  appId: "1:299728561370:web:3897e126d3c06ce90fb1e3",
  measurementId: "G-CL6QGRB33P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };