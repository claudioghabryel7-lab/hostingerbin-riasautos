'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

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
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  hasAccess: boolean;
  canAccessFeatures: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAIL = 'claudioghabryel.cg@gmail.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const profile = userDoc.data() as UserProfile;
            if (profile.trialEndsAt) {
              profile.trialEndsAt = new Date(profile.trialEndsAt);
            }
            if (profile.subscriptionEndsAt) {
              profile.subscriptionEndsAt = new Date(profile.subscriptionEndsAt);
            }
            if (profile.createdAt) {
              profile.createdAt = new Date(profile.createdAt);
            }
            setUserProfile(profile);
          } else {
            const profile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              isAdmin: firebaseUser.email === ADMIN_EMAIL,
              plan: 'free',
              trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              createdAt: new Date()
            };
            
            await setDoc(doc(db, 'users', firebaseUser.uid), profile);
            setUserProfile(profile);
          }
        } catch (error) {
          console.error('Erro ao carregar perfil do usuário:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    console.log('Iniciando login para:', email);
    try {
      console.log('Tentando signInWithEmailAndPassword...');
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login Firebase bem-sucedido:', result.user.uid);
      
      // Verificar se usuário existe no Firestore
      console.log('Verificando se usuário existe no Firestore...');
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        console.log('Usuário não encontrado no Firestore, fazendo logout...');
        await signOut(auth);
        throw new Error('Usuário não encontrado. Por favor, faça seu cadastro primeiro.');
      }
      
      console.log('Usuário validado com sucesso no Firestore');
    } catch (error: any) {
      console.error('Erro no login:', error);
      console.error('Código do erro:', error.code);
      console.error('Mensagem do erro:', error.message);
      
      if (error.code === 'auth/user-not-found') {
        throw new Error('Usuário não encontrado. Faça seu cadastro primeiro.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Senha incorreta.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('E-mail inválido.');
      } else if (error.code === 'auth/configuration-not-found') {
        throw new Error('Configuração do Firebase não encontrada. Verifique as credenciais.');
      } else if (error.code === 'auth/project-not-found') {
        throw new Error('Projeto Firebase não encontrado. Verifique o projectId.');
      } else if (error.message === 'Usuário não encontrado. Por favor, faça seu cadastro primeiro.') {
        throw new Error('Usuário não encontrado. Por favor, faça seu cadastro primeiro.');
      } else {
        throw new Error('Erro ao fazer login: ' + error.message);
      }
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('E-mail já cadastrado. Faça login.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Senha muito fraca. Use pelo menos 6 caracteres.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('E-mail inválido.');
      } else {
        throw new Error('Erro ao criar conta. Tente novamente.');
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Erro no logout:', error);
      throw new Error('Erro ao sair. Tente novamente.');
    }
  };

  const isAdmin = userProfile?.isAdmin || false;
  const hasAccess = isAdmin || userProfile?.plan !== 'free';
  
  const canAccessFeatures = Boolean(
    isAdmin || 
    (userProfile?.plan === 'free' && userProfile?.trialEndsAt && new Date() < userProfile.trialEndsAt) ||
    (userProfile?.plan !== 'free' && userProfile?.subscriptionEndsAt && new Date() < userProfile.subscriptionEndsAt)
  );

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    login,
    signup,
    logout,
    isAdmin,
    hasAccess,
    canAccessFeatures
  };

  return React.createElement(
    AuthContext.Provider,
    { value },
    children
  );
}

export function useFirebaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
}
