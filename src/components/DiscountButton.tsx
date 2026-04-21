'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Gift, Sparkles } from 'lucide-react';

interface DiscountButtonProps {
  onDiscountApplied: (percentage: number) => void;
}

export function DiscountButton({ onDiscountApplied }: DiscountButtonProps) {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [discount, setDiscount] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [clicked, setClicked] = useState(false);

  // Movimento aleatório do botão
  useEffect(() => {
    if (clicked) return; // Para de mover depois de clicar

    const moveInterval = setInterval(() => {
      setPosition({
        x: Math.random() * 80 + 10, // 10% a 90% da largura
        y: Math.random() * 80 + 10  // 10% a 90% da altura
      });
    }, 3000 + Math.random() * 2000); // 3-5 segundos

    return () => clearInterval(moveInterval);
  }, [clicked]);

  const handleClick = () => {
    if (clicked) return;

    // Gerar desconto aleatório de 10% a 50%
    const randomDiscount = Math.floor(Math.random() * 41) + 10;
    setDiscount(randomDiscount);
    setClicked(true);
    setShowModal(true);
    onDiscountApplied(randomDiscount);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      {/* Botão Flutuante */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ 
          scale: clicked ? 0 : 1,
          x: `${position.x}%`,
          y: `${position.y}%`
        }}
        transition={{ 
          scale: { duration: 0.3 },
          x: { duration: 2, ease: "easeInOut" },
          y: { duration: 2, ease: "easeInOut" }
        }}
        className="fixed z-50 -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${position.x}%`, top: `${position.y}%` }}
      >
        <Button
          onClick={handleClick}
          size="sm"
          className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold shadow-lg animate-pulse"
        >
          <Gift className="h-4 w-4 mr-1" />
          Desconto!
        </Button>
      </motion.div>

      {/* Modal de Desconto */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 rounded-lg p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Parabéns! Você Ganhou!
              </h3>
              <div className="text-4xl font-bold text-yellow-400 mb-4">
                {discount}% OFF
              </div>
              <p className="text-white/80 mb-6">
                Desconto aplicado em todos os planos! Aproveite agora mesmo.
              </p>
              <Button
                onClick={closeModal}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold"
              >
                Entendi!
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
