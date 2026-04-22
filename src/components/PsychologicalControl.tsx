'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Heart, Zap, Target, Shield, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface GameState {
  score: number;
  level: number;
  streak: number;
  emotions: string[];
  currentChallenge: Challenge | null;
  gameStatus: 'idle' | 'playing' | 'completed' | 'failed';
  feedback: string;
}

interface Challenge {
  id: number;
  type: 'breathing' | 'focus' | 'patience' | 'discipline' | 'confidence';
  title: string;
  description: string;
  instruction: string;
  duration: number;
  points: number;
  icon: React.ReactNode;
  color: string;
}

const challenges: Challenge[] = [
  {
    id: 1,
    type: 'breathing',
    title: 'Respiração Controlada',
    description: 'Controle sua respiração para acalmar a mente',
    instruction: 'Inspire por 4 segundos, segure por 4, expire por 4 segundos. Repita por 30 segundos.',
    duration: 30,
    points: 10,
    icon: <Heart className="h-5 w-5" />,
    color: 'text-red-400'
  },
  {
    id: 2,
    type: 'focus',
    title: 'Foco Concentrado',
    description: 'Mantenha o foco em um ponto específico',
    instruction: 'Fixe seu olhar no centro da tela sem piscar por 20 segundos.',
    duration: 20,
    points: 15,
    icon: <Target className="h-5 w-5" />,
    color: 'text-blue-400'
  },
  {
    id: 3,
    type: 'patience',
    title: 'Paciência Estratégica',
    description: 'Aguarde o momento certo para agir',
    instruction: 'Aguarde 25 segundos sem fazer nada. Apenas observe e aguarde.',
    duration: 25,
    points: 20,
    icon: <Shield className="h-5 w-5" />,
    color: 'text-green-400'
  },
  {
    id: 4,
    type: 'discipline',
    title: 'Disciplina Emocional',
    description: 'Mantenha o controle emocional sob pressão',
    instruction: 'Mantenha-se calmo enquanto números aleatórios aparecem na tela por 15 segundos.',
    duration: 15,
    points: 25,
    icon: <Brain className="h-5 w-5" />,
    color: 'text-purple-400'
  },
  {
    id: 5,
    type: 'confidence',
    title: 'Confiança Trading',
    description: 'Fortaleça sua confiança para operações',
    instruction: 'Repita mentalmente "Eu sou um trader disciplinado" por 30 segundos.',
    duration: 30,
    points: 30,
    icon: <TrendingUp className="h-5 w-5" />,
    color: 'text-orange-400'
  }
];

const psychologicalTips = [
  "Mantenha a calma mesmo sob pressão",
  "Siga seu plano sem emoções",
  "Aceite perdas como parte do processo",
  "Celebre pequenas vitórias",
  "Mantenha disciplina rigorosa",
  "Aprenda com cada operação",
  "Não deixe o medo controlar suas decisões",
  "Paciência é uma virtude no trading"
];

export function PsychologicalControl() {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    streak: 0,
    emotions: [],
    currentChallenge: null,
    gameStatus: 'idle',
    feedback: ''
  });

  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [randomNumbers, setRandomNumbers] = useState<number[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      completeChallenge();
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  useEffect(() => {
    if (gameState.currentChallenge?.type === 'discipline' && isTimerActive) {
      const interval = setInterval(() => {
        setRandomNumbers(prev => [...prev, Math.floor(Math.random() * 100)]);
        if (randomNumbers.length > 5) {
          setRandomNumbers(prev => prev.slice(1));
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [gameState.currentChallenge?.type, isTimerActive, randomNumbers.length]);

  const startGame = () => {
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    setGameState({
      ...gameState,
      currentChallenge: randomChallenge,
      gameStatus: 'playing',
      feedback: ''
    });
    setTimeLeft(randomChallenge.duration);
    setIsTimerActive(true);
    setRandomNumbers([]);
  };

  const completeChallenge = () => {
    setIsTimerActive(false);
    const points = gameState.currentChallenge?.points || 0;
    const newScore = gameState.score + points;
    const newStreak = gameState.streak + 1;
    
    setGameState({
      ...gameState,
      score: newScore,
      streak: newStreak,
      level: Math.floor(newScore / 50) + 1,
      gameStatus: 'completed',
      feedback: `Excelente! Você ganhou ${points} pontos!`,
      currentChallenge: null
    });
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const failChallenge = () => {
    setIsTimerActive(false);
    setGameState({
      ...gameState,
      streak: 0,
      gameStatus: 'failed',
      feedback: 'Não desista! Tente novamente.',
      currentChallenge: null
    });
  };

  const resetGame = () => {
    setGameState({
      score: 0,
      level: 1,
      streak: 0,
      emotions: [],
      currentChallenge: null,
      gameStatus: 'idle',
      feedback: ''
    });
    setTimeLeft(0);
    setIsTimerActive(false);
    setRandomNumbers([]);
  };

  const getMotivationalMessage = () => {
    if (gameState.streak >= 5) return "Incrível! Você está no caminho certo!";
    if (gameState.streak >= 3) return "Ótimo trabalho! Continue assim!";
    if (gameState.streak >= 1) return "Bom começo! Mantenha o foco!";
    return "Vamos começar! Você consegue!";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Controle Psicológico</h2>
        <p className="text-white/60">Treine sua mente para o trading de sucesso</p>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="glass-dark border-white/10">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{gameState.score}</div>
            <div className="text-xs text-white/60">Pontos</div>
          </CardContent>
        </Card>
        <Card className="glass-dark border-white/10">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{gameState.level}</div>
            <div className="text-xs text-white/60">Nível</div>
          </CardContent>
        </Card>
        <Card className="glass-dark border-white/10">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{gameState.streak}</div>
            <div className="text-xs text-white/60">Sequência</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Game Area */}
      <Card className="glass-dark border-white/10">
        <CardContent className="p-6">
          {gameState.gameStatus === 'idle' && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <Brain className="h-16 w-16 text-purple-400 mx-auto" />
                <h3 className="text-xl font-semibold text-white">
                  Pronto para treinar sua mente?
                </h3>
                <p className="text-white/60 max-w-md mx-auto">
                  Complete desafios psicológicos para melhorar seu controle emocional no trading.
                </p>
              </div>
              
              <Button
                onClick={startGame}
                className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3"
              >
                <Zap className="h-4 w-4 mr-2" />
                Iniciar Treinamento
              </Button>

              {/* Tips */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-white mb-2">Dicas Psicológicas:</h4>
                <div className="space-y-1">
                  {psychologicalTips.slice(0, 3).map((tip, index) => (
                    <div key={index} className="text-xs text-white/60 flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {gameState.gameStatus === 'playing' && gameState.currentChallenge && (
            <div className="space-y-6">
              {/* Challenge Header */}
              <div className="text-center space-y-4">
                <div className={`inline-flex p-3 rounded-full bg-white/10 ${gameState.currentChallenge.color}`}>
                  {gameState.currentChallenge.icon}
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {gameState.currentChallenge.title}
                </h3>
                <p className="text-white/60">{gameState.currentChallenge.description}</p>
              </div>

              {/* Timer */}
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{timeLeft}s</div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <motion.div
                    className="bg-purple-500 h-2 rounded-full"
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeLeft / gameState.currentChallenge.duration) * 100}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>

              {/* Challenge Content */}
              <div className="text-center space-y-4">
                <p className="text-white/80">{gameState.currentChallenge.instruction}</p>
                
                {gameState.currentChallenge.type === 'discipline' && (
                  <div className="flex justify-center gap-2 flex-wrap">
                    {randomNumbers.map((num, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-2xl font-bold text-red-400"
                      >
                        {num}
                      </motion.div>
                    ))}
                  </div>
                )}

                {gameState.currentChallenge.type === 'focus' && (
                  <div className="flex justify-center">
                    <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse" />
                  </div>
                )}

                {gameState.currentChallenge.type === 'breathing' && (
                  <div className="flex justify-center">
                    <motion.div
                      className="w-16 h-16 border-4 border-red-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={completeChallenge}
                  variant="outline"
                  className="border-green-500 text-green-400 hover:bg-green-500/10"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Concluído
                </Button>
                <Button
                  onClick={failChallenge}
                  variant="outline"
                  className="border-red-500 text-red-400 hover:bg-red-500/10"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Desistir
                </Button>
              </div>
            </div>
          )}

          {gameState.gameStatus === 'completed' && (
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex p-4 rounded-full bg-green-500/20"
              >
                <CheckCircle className="h-8 w-8 text-green-400" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white">Desafio Concluído!</h3>
              <p className="text-white/60">{gameState.feedback}</p>
              <p className="text-lg text-green-400">{getMotivationalMessage()}</p>
              
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={startGame}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  Próximo Desafio
                </Button>
                <Button
                  onClick={resetGame}
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/10"
                >
                  Reiniciar
                </Button>
              </div>
            </div>
          )}

          {gameState.gameStatus === 'failed' && (
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex p-4 rounded-full bg-red-500/20"
              >
                <AlertCircle className="h-8 w-8 text-red-400" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white">Tente Novamente</h3>
              <p className="text-white/60">{gameState.feedback}</p>
              
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={startGame}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  Tentar Novamente
                </Button>
                <Button
                  onClick={resetGame}
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/10"
                >
                  Reiniciar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <span>Desafio concluído com sucesso!</span>
          </div>
        </motion.div>
      )}

      {/* All Tips */}
      <Card className="glass-dark border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Guia de Controle Psicológico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {psychologicalTips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-white/80">{tip}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
