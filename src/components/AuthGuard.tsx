'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading, isAdmin, canAccessFeatures } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (!canAccessFeatures && !isAdmin) {
      router.push('/plans');
      return;
    }
  }, [user, userProfile, loading, isAdmin, canAccessFeatures, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <Card className="glass-dark border-white/10 text-white max-w-md">
          <CardContent className="p-6 text-center">
            <Lock className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Acesso Restrito</h3>
            <p className="text-white/60 mb-4">Faça login para acessar o sistema</p>
            <Link href="/login">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                Fazer Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canAccessFeatures && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <Card className="glass-dark border-white/10 text-white max-w-md">
          <CardContent className="p-6 text-center">
            <Crown className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Plano Necessário</h3>
            <p className="text-white/60 mb-4">
              {userProfile?.trialEndsAt && new Date() < userProfile.trialEndsAt 
                ? `Seu teste gratuito termina em ${Math.ceil((userProfile.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias`
                : 'Assine um plano para continuar usando o sistema'
              }
            </p>
            <Link href="/plans">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                Ver Planos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
