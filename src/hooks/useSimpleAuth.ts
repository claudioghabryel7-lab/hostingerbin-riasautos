'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

export interface UserProfile {
  uid: string;
  email: string;
  isAdmin: boolean;
  plan: 'free' | 'monthly' | 'annual';
  trialEndsAt?: Date;
  subscriptionEndsAt?: Date;
  createdAt: Date;
}

interface AuthContextType {
  user: { uid: string; email: string } | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  hasAccess: boolean;
  canAccessFeatures: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ uid: string; email: string } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAIL = 'claudioghabryel.cg@gmail.com';

  useEffect(() => {
    // Verificar se há usuário no localStorage
    const storedUser = localStorage.getItem('user');
    const storedProfile = localStorage.getItem('userProfile');

    if (storedUser && storedProfile) {
      try {
        const userData = JSON.parse(storedUser);
        const profileData = JSON.parse(storedProfile);
        
        // Converter datas
        if (profileData.trialEndsAt) {
          profileData.trialEndsAt = new Date(profileData.trialEndsAt);
        }
        if (profileData.subscriptionEndsAt) {
          profileData.subscriptionEndsAt = new Date(profileData.subscriptionEndsAt);
        }
        if (profileData.createdAt) {
          profileData.createdAt = new Date(profileData.createdAt);
        }
        
        setUser(userData);
        setUserProfile(profileData);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('userProfile');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Simulação de login - na implementação real, usaria Firebase
      if (email && password) {
        const userData = {
          uid: Math.random().toString(36).substr(2, 9),
          email
        };

        const profileData: UserProfile = {
          uid: userData.uid,
          email: userData.email,
          isAdmin: userData.email === ADMIN_EMAIL,
          plan: 'free',
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
          createdAt: new Date()
        };

        // Salvar no localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userProfile', JSON.stringify(profileData));

        setUser(userData);
        setUserProfile(profileData);
      } else {
        throw new Error('Email e senha são obrigatórios');
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('userProfile');
      setUser(null);
      setUserProfile(null);
    } catch (error: any) {
      console.error('Erro no logout:', error);
      throw error;
    }
  };

  const isAdmin = userProfile?.isAdmin || false;
  const hasAccess = isAdmin || userProfile?.plan !== 'free';
  const canAccessFeatures = isAdmin || 
    (userProfile?.plan === 'free' && userProfile.trialEndsAt && new Date() < userProfile.trialEndsAt) ||
    (userProfile?.plan !== 'free' && userProfile.subscriptionEndsAt && new Date() < userProfile.subscriptionEndsAt);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    login,
    logout,
    isAdmin,
    hasAccess,
    canAccessFeatures
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSimpleAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
}
