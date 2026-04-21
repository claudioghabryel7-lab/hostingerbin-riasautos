import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNaYrUnXPiWN07XRro49t43sua3f_ZysE",
  authDomain: "gestorfinanceiro-1bfd0.firebaseapp.com",
  databaseURL: "https://gestorfinanceiro-1bfd0-default-rtdb.firebaseio.com",
  projectId: "gestorfinanceiro-1bfd0",
  storageBucket: "gestorfinanceiro-1bfd0.firebasestorage.app",
  messagingSenderId: "228477080775",
  appId: "1:228477080775:web:e6893d9dc9a1bd632ddae2",
  measurementId: "G-Z8RR391TQK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export default app;
