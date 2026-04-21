'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, CreditCard, TrendingUp, Settings, LogOut, Menu, X, ChevronRight, Shield, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, userProfile, logout } = useFirebaseAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuário';
  };

  const menuItems = [
    {
      icon: User,
      label: 'Perfil',
      description: 'Ver e editar perfil',
      action: () => console.log('Perfil'),
      badge: null
    },
    {
      icon: CreditCard,
      label: 'Assinatura',
      description: userProfile?.plan || 'Free',
      action: () => console.log('Assinatura'),
      badge: userProfile?.plan === 'free' ? 'Free' : null
    },
    {
      icon: TrendingUp,
      label: 'Estatísticas',
      description: 'Ver estatísticas detalhadas',
      action: () => console.log('Estatísticas'),
      badge: null
    },
    {
      icon: Settings,
      label: 'Configurações',
      description: 'Gerenciar configurações',
      action: () => window.location.href = '/settings',
      badge: null
    },
    {
      icon: Shield,
      label: 'Segurança',
      description: 'Configurar segurança',
      action: () => console.log('Segurança'),
      badge: null
    },
    {
      icon: HelpCircle,
      label: 'Ajuda',
      description: 'Central de ajuda',
      action: () => console.log('Ajuda'),
      badge: null
    },
    {
      icon: LogOut,
      label: 'Sair',
      description: 'Sair da conta',
      action: logout,
      badge: null,
      isDestructive: true
    }
  ];

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* Botão Hamburguer/Mobile */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden text-white hover:bg-white/10"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Botão Desktop com Avatar Simples */}
        <Button
          variant="ghost"
          className="hidden lg:flex items-center gap-2 text-white hover:bg-white/10 px-3"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
            {getUserInitials()}
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-white">
              {getUserDisplayName()}
            </div>
            <div className="text-xs text-white/60">
              {userProfile?.plan === 'free' ? 'Plano Free' : 'Plano Premium'}
            </div>
          </div>
          <Menu className="h-4 w-4 text-white/60" />
        </Button>

        {/* Menu Dropdown Desktop */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="hidden lg:block absolute right-0 top-full mt-2 w-80 bg-black border border-white/10 rounded-lg shadow-xl z-50"
            >
              {/* Header do Menu Desktop */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    {getUserInitials()}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">
                      {getUserDisplayName()}
                    </div>
                    <div className="text-white/60 text-sm">
                      {user?.email}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 text-xs">
                        {userProfile?.plan === 'free' ? 'Free' : 'Premium'}
                      </Badge>
                      {userProfile?.isAdmin && (
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 text-xs">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items Desktop */}
              <div className="py-2 max-h-[60vh] overflow-y-auto">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      item.action();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                      <item.icon className="h-5 w-5 text-white/80 group-hover:text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="bg-white/10 text-white/80 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <div className="text-white/60 text-sm">{item.description}</div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Footer do Menu Desktop */}
              <div className="border-t border-white/10 p-4">
                <Button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
                >
                  <LogOut className="h-4 w-4" />
                  Sair da Conta
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Menu Mobile Fullscreen */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu Mobile */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed right-0 top-0 h-full w-80 bg-black border-l border-white/10 z-50"
            >
              {/* Header Mobile */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    {getUserInitials()}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">
                      {getUserDisplayName()}
                    </div>
                    <div className="text-white/60 text-xs">
                      {userProfile?.plan === 'free' ? 'Free' : 'Premium'}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Menu Items Mobile */}
              <div className="py-2 overflow-y-auto h-full pb-20">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      item.action();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                      <item.icon className="h-5 w-5 text-white/80 group-hover:text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="bg-white/10 text-white/80 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <div className="text-white/60 text-sm">{item.description}</div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Footer Mobile */}
              <div className="lg:hidden absolute bottom-0 left-0 right-0 border-t border-white/10 p-4">
                <Button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
                >
                  <LogOut className="h-4 w-4" />
                  Sair da Conta
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
