'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useRouter } from 'next/navigation';
import { AlertCircle, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const { user, login, signup, loading } = useFirebaseAuth();
  const router = useRouter();

  // Redirecionar automaticamente quando o usuário estiver logado
  useEffect(() => {
    if (user) {
      console.log('Usuário logado detectado, redirecionando para dashboard...');
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    console.log('Formulário submetido com:', { email, password, isLogin });
    
    if (!email || !password) {
      setError('E-mail e senha são obrigatórios');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    try {
      console.log('Iniciando processo de ' + (isLogin ? 'login' : 'cadastro'));
      if (isLogin) {
        await login(email, password);
        console.log('Login concluído com sucesso - aguardando redirecionamento...');
      } else {
        await signup(email, password);
        console.log('Cadastro concluído com sucesso - aguardando redirecionamento...');
      }
    } catch (err: any) {
      console.error('Erro capturado no handleSubmit:', err);
      setError(err.message || 'Erro ao processar solicitação');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-dark border-white/10 text-white">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                {isLogin ? <LogIn className="h-8 w-8 text-white" /> : <UserPlus className="h-8 w-8 text-white" />}
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Hotinger Gestor OB
              </CardTitle>
              <p className="text-white/60 text-sm">
                {isLogin ? 'Faça login para acessar sua conta' : 'Crie sua conta gratuitamente'}
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                  >
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="glass-dark border-white/10 text-white bg-white/5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/80">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={isLogin ? "Sua senha" : "Crie uma senha (mín. 6 caracteres)"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="glass-dark border-white/10 text-white bg-white/5 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-white/60 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {isLogin ? 'Entrando...' : 'Cadastrando...'}
                    </div>
                  ) : (
                    isLogin ? 'Entrar' : 'Criar Conta'
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-center text-white/60 text-sm">
                  {isLogin ? 'Ainda não tem conta?' : 'Já tem uma conta?'}{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    {isLogin ? 'Crie sua conta' : 'Faça login'}
                  </button>
                </p>
              </div>

              {!isLogin && (
                <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-blue-400 text-sm">
                    <p className="font-semibold mb-1">Ao criar sua conta você recebe:</p>
                    <ul className="text-xs space-y-1">
                      <li>30 dias de teste gratuito</li>
                      <li>Acesso completo ao dashboard</li>
                      <li>Transações ilimitadas</li>
                      <li>Relatórios detalhados</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
