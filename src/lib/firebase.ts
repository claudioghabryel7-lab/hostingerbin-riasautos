import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Projeto Firebase: gestorfinan-88c9c (Auth + Firestore)
const firebaseConfig = {
  apiKey: "AIzaSyAiKEREYXMNgEyDptOb8Ct-9_OYYsn4-fo",
  authDomain: "gestorfinan-88c9c.firebaseapp.com",
  projectId: "gestorfinan-88c9c",
  storageBucket: "gestorfinan-88c9c.firebasestorage.app",
  messagingSenderId: "131476996203",
  appId: "1:131476996203:web:da10dc1e2b1f171962712e",
  measurementId: "G-YLDJKY2801",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, firebaseConfig };
export default app;
