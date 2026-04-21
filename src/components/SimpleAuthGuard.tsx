'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown } from 'lucide-react';
import Link from 'next/link';

interface SimpleAuthGuardProps {
  children: React.ReactNode;
}

export function SimpleAuthGuard({ children }: SimpleAuthGuardProps) {
  const router = useRouter();

  useEffect(() => {
    // Verificar se usuário está "logado" via localStorage
    const user = localStorage.getItem('user');
    
    if (!user) {
      router.push('/login');
      return;
    }
  }, [router]);

  // Verificar no lado do cliente também
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
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
  }

  return <>{children}</>;
}
