import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGAv-nVca02Ih8A291e6M6BX4l6c-xN34",
  authDomain: "obinarias-68350.firebaseapp.com",
  projectId: "obinarias-68350",
  storageBucket: "obinarias-68350.firebasestorage.app",
  messagingSenderId: "553693849316",
  appId: "1:553693849316:web:a65ac79d56b90ddc86aef1",
  measurementId: "G-E1LHPB2FYS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export default app;
