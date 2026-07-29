import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuração do Firebase (dados do banco preservados)
const firebaseConfig = {
  apiKey: "AIzaSyCGAv-nVca02Ih8A291e6M6BX4l6c-xN34",
  authDomain: "obinarias-68350.firebaseapp.com",
  projectId: "obinarias-68350",
  storageBucket: "obinarias-68350.firebasestorage.app",
  messagingSenderId: "553693849316",
  appId: "1:553693849316:web:a65ac79d56b90ddc86aef1",
  measurementId: "G-E1LHPB2FYS",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, firebaseConfig };
export default app;
