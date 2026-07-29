"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AdminAuthValue {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      const snap = await getDoc(doc(db, "admins", u.uid));
      setIsAdmin(snap.exists());
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "admins", cred.user.uid));
    if (!snap.exists()) {
      await setDoc(doc(db, "admins", cred.user.uid), {
        email,
        createdAt: Date.now(),
      });
    }
    setIsAdmin(true);
  };

  const register = async (email: string, password: string, name?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "admins", cred.user.uid), {
      email,
      name: name || "Admin Frysuroll",
      createdAt: Date.now(),
    });
    setIsAdmin(true);
  };

  const logout = async () => {
    await signOut(auth);
    setIsAdmin(false);
  };

  const value = useMemo(
    () => ({ user, isAdmin, loading, login, register, logout }),
    [user, isAdmin, loading]
  );

  return (
    <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth fora do provider");
  return ctx;
}
