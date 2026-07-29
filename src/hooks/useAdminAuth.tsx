"use client";

import {
  createContext,
  useCallback,
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
  updateProfile,
  type User,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { UserProfile } from "@/types";

interface AuthValue {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ isAdmin: boolean }>;
  registerCustomer: (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }) => Promise<void>;
  registerAdmin: (data: {
    email: string;
    password: string;
    name?: string;
    inviteCode?: string;
  }) => Promise<void>;
  updateCustomerProfile: (data: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

async function loadProfile(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

async function loadIsAdmin(uid: string) {
  const snap = await getDoc(doc(db, "admins", uid));
  return snap.exists();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      const [p, admin] = await Promise.all([
        loadProfile(u.uid),
        loadIsAdmin(u.uid),
      ]);
      setProfile(p);
      setIsAdmin(admin);
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const admin = await loadIsAdmin(cred.user.uid);
    const p = await loadProfile(cred.user.uid);
    setIsAdmin(admin);
    setProfile(p);
    return { isAdmin: admin };
  }, []);

  const registerCustomer = useCallback(
    async (data: {
      email: string;
      password: string;
      name: string;
      phone: string;
    }) => {
      const cred = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      await updateProfile(cred.user, { displayName: data.name });
      const profileData: UserProfile = {
        uid: cred.user.uid,
        email: data.email,
        name: data.name,
        phone: data.phone,
        city: "Goiânia",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await setDoc(doc(db, "users", cred.user.uid), profileData);
      setProfile(profileData);
      setIsAdmin(false);
    },
    []
  );

  const registerAdmin = useCallback(
    async (data: {
      email: string;
      password: string;
      name?: string;
      inviteCode?: string;
    }) => {
      const adminsSnap = await getDocs(
        query(collection(db, "admins"), limit(1))
      );
      const expected = process.env.NEXT_PUBLIC_ADMIN_INVITE || "frysushi-admin";
      const canCreate =
        adminsSnap.empty || data.inviteCode === expected;

      if (!canCreate) {
        throw new Error(
          "Código de convite inválido. Peça o código ao dono da loja."
        );
      }

      const cred = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const name = data.name || "Admin Fry Sushi";
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, "admins", cred.user.uid), {
        email: data.email,
        name,
        createdAt: Date.now(),
      });
      await setDoc(
        doc(db, "users", cred.user.uid),
        {
          uid: cred.user.uid,
          email: data.email,
          name,
          phone: "(62) 99504-5038",
          city: "Goiânia",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } satisfies UserProfile,
        { merge: true }
      );
      setIsAdmin(true);
    },
    []
  );

  const updateCustomerProfile = useCallback(
    async (data: Partial<UserProfile>) => {
      if (!auth.currentUser) throw new Error("Faça login primeiro");
      const uid = auth.currentUser.uid;
      const payload = { ...data, updatedAt: Date.now() };
      await setDoc(doc(db, "users", uid), payload, { merge: true });
      const next = await loadProfile(uid);
      setProfile(next);
    },
    []
  );

  const logout = useCallback(async () => {
    await signOut(auth);
    setProfile(null);
    setIsAdmin(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      isAdmin,
      loading,
      login,
      registerCustomer,
      registerAdmin,
      updateCustomerProfile,
      logout,
    }),
    [
      user,
      profile,
      isAdmin,
      loading,
      login,
      registerCustomer,
      registerAdmin,
      updateCustomerProfile,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** @deprecated use useAuth */
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth fora do provider");
  return ctx;
}

export function useAdminAuth() {
  const authValue = useAuth();
  return {
    user: authValue.user,
    isAdmin: authValue.isAdmin,
    loading: authValue.loading,
    login: async (email: string, password: string) => {
      const res = await authValue.login(email, password);
      if (!res.isAdmin) {
        await authValue.logout();
        throw new Error("Esta conta não é de administrador.");
      }
    },
    register: async (
      email: string,
      password: string,
      name?: string,
      inviteCode?: string
    ) => {
      await authValue.registerAdmin({ email, password, name, inviteCode });
    },
    logout: authValue.logout,
  };
}
