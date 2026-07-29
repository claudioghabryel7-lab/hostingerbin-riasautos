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
  clearSession,
  listenAuth,
  loadIsCollaborator,
  loadProfile,
  loginAccount,
  logoutAccount,
  registerCollaborator,
  registerCustomer as registerCustomerAccount,
  updateAccountProfile,
  type SessionUser,
} from "@/lib/db-auth";
import type { UserProfile } from "@/types";

interface AuthValue {
  user: SessionUser | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ isAdmin: boolean }>;
  registerCustomer: (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    address: string;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clearSession();
    return listenAuth(async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      const [p, admin] = await Promise.all([
        loadProfile(fbUser.uid),
        loadIsCollaborator(fbUser.uid),
      ]);
      setUser({
        uid: fbUser.uid,
        email: fbUser.email || p?.email || "",
        displayName: fbUser.displayName || p?.name || null,
      });
      setProfile(p);
      setIsAdmin(admin);
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginAccount(email, password);
    setUser({
      uid: res.user.uid,
      email: res.user.email || "",
      displayName: res.user.displayName,
    });
    setProfile(res.profile);
    setIsAdmin(res.isAdmin);
    return { isAdmin: res.isAdmin };
  }, []);

  const registerCustomer = useCallback(
    async (data: {
      email: string;
      password: string;
      name: string;
      phone: string;
      address: string;
    }) => {
      const res = await registerCustomerAccount(data);
      setUser({
        uid: res.user.uid,
        email: res.user.email || data.email,
        displayName: data.name,
      });
      setProfile(res.profile);
      setIsAdmin(false);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("frysushi_welcome_coupon", "10");
      }
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
      const res = await registerCollaborator(data);
      setUser({
        uid: res.user.uid,
        email: res.user.email || data.email,
        displayName: data.name || "Colaborador",
      });
      setIsAdmin(true);
      const p = await loadProfile(res.user.uid);
      setProfile(p);
    },
    []
  );

  const updateCustomerProfile = useCallback(
    async (data: Partial<UserProfile>) => {
      if (!user) throw new Error("Faça login primeiro");
      const next = await updateAccountProfile(user.uid, data);
      setProfile(next);
    },
    [user]
  );

  const logout = useCallback(async () => {
    await logoutAccount();
    clearSession();
    setUser(null);
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
        throw new Error("Esta conta não é de colaborador.");
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
