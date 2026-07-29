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
  loginAccount,
  registerAccount,
  restoreSession,
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

function toProfile(account: {
  uid?: string;
  id?: string;
  email: string;
  name: string;
  phone: string;
  address?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  createdAt: number;
  updatedAt?: number;
}): UserProfile {
  return {
    uid: account.uid || account.id || "",
    email: account.email,
    name: account.name,
    phone: account.phone,
    address: account.address,
    complement: account.complement,
    neighborhood: account.neighborhood,
    city: account.city || "Goiânia",
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const restored = await restoreSession();
        if (!alive) return;
        if (!restored) {
          setLoading(false);
          return;
        }
        const p = toProfile(restored.account);
        setUser({
          uid: p.uid,
          email: p.email,
          displayName: p.name,
        });
        setProfile(p);
        setIsAdmin(restored.account.role === "collaborator");
      } catch {
        clearSession();
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { account, session } = await loginAccount(email, password);
    const p = toProfile(account);
    const admin = session.role === "collaborator";
    setUser({ uid: p.uid, email: p.email, displayName: p.name });
    setProfile(p);
    setIsAdmin(admin);
    return { isAdmin: admin };
  }, []);

  const registerCustomer = useCallback(
    async (data: {
      email: string;
      password: string;
      name: string;
      phone: string;
    }) => {
      const { account } = await registerAccount({
        ...data,
        role: "customer",
      });
      const p = toProfile(account);
      setUser({ uid: p.uid, email: p.email, displayName: p.name });
      setProfile(p);
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
      const { account } = await registerAccount({
        email: data.email,
        password: data.password,
        name: data.name || "Colaborador Fry Sushi",
        phone: "(62) 99504-5038",
        role: "collaborator",
        inviteCode: data.inviteCode,
      });
      const p = toProfile(account);
      setUser({ uid: p.uid, email: p.email, displayName: p.name });
      setProfile(p);
      setIsAdmin(true);
    },
    []
  );

  const updateCustomerProfile = useCallback(
    async (data: Partial<UserProfile>) => {
      if (!user) throw new Error("Faça login primeiro");
      const next = await updateAccountProfile(user.uid, data);
      if (next) setProfile(toProfile(next));
    },
    [user]
  );

  const logout = useCallback(async () => {
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
