'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Crown, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Plan {
  id: 'monthly' | 'annual';
  name: string;
  price: number;
  originalPrice?: number;
  period: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
}

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual' | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    // Carregar dados do usuário do localStorage
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile);
        if (profile.trialEndsAt) {
          profile.trialEndsAt = new Date(profile.trialEndsAt);
        }
        setUserProfile(profile);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
    }
  }, []);

  const plans: Plan[] = [
    {
      id: 'monthly',
      name: 'Plano Mensal',
      price: 59.99,
      period: '/mês',
      features: [
        'Acesso completo ao dashboard',
        'Transações ilimitadas',
        'Relatórios detalhados',
        'Calculadora de Soros',
        'Suporte por e-mail',
        'Cancelamento a qualquer momento'
      ],
      icon: <Star className="h-6 w-6" />
    },
    {
      id: 'annual',
      name: 'Plano Anual',
      price: 599.99,
      originalPrice: 719.88,
      period: '/ano',
      popular: true,
      features: [
        'Todos os recursos do plano mensal',
        'Economia de R$ 119,89 (17% de desconto)',
        'Prioridade no suporte',
        'Recursos exclusivos futuros',
        'Acesso vitalício a novas ferramentas',
        'Suporte prioritário 24/7'
      ],
      icon: <Crown className="h-6 w-6" />
    }
  ];

  const handlePlanSelect = (planId: 'monthly' | 'annual') => {
    setSelectedPlan(planId);
    
    // Atualizar perfil do usuário
    if (userProfile) {
      const updatedProfile = {
        ...userProfile,
        plan: planId,
        subscriptionEndsAt: new Date(Date.now() + (planId === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString()
      };
      
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setUserProfile(updatedProfile);
      
      // Redirecionar para dashboard
      window.location.href = '/';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link href="/login">
              <Button variant="outline" className="glass-dark border-white/10 text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Escolha seu Plano
              </h1>
              <p className="text-white/60 text-sm sm:text-base">
                Desbloqueie todo o potencial do Hotinger Gestor OB
              </p>
            </div>
          </div>
        </motion.div>

        {/* Trial Banner */}
        {userProfile?.plan === 'free' && userProfile.trialEndsAt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8 p-6 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30"
          >
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">
                Teste Grátis Ativo
              </h3>
              <p className="text-white/80">
                Seu teste gratuito termina em{' '}
                <span className="font-bold text-blue-400">
                  {Math.ceil((userProfile.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias
                </span>
              </p>
            </div>
          </motion.div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`glass-dark border-white/10 text-white h-full ${
                plan.popular ? 'border-blue-500/50 ring-2 ring-blue-500/30' : ''
              }`}>
                <CardHeader className="text-center pb-4">
                  {plan.popular && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 mb-4">
                      Mais Popular
                    </div>
                  )}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </CardTitle>
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-white">
                        {formatPrice(plan.price)}
                      </span>
                      <span className="text-white/60">{plan.period}</span>
                    </div>
                    {plan.originalPrice && (
                      <div className="text-white/40 line-through text-sm">
                        {formatPrice(plan.originalPrice)} {plan.period}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: featureIndex * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-white/80 text-sm">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`w-full font-medium ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                        : 'bg-white/10 hover:bg-white/20'
                    } text-white`}
                    size="lg"
                  >
                    {selectedPlan === plan.id ? 'Plano Selecionado' : `Assinar ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
