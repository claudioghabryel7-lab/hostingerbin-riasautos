'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Heart, Zap, Target, Shield, TrendingUp, AlertCircle, CheckCircle, Clock, MousePointer, Eye, Activity, BarChart3, Timer, Gauge, Crosshair, Sparkles, Waves, Mountain, Flame, Wind } from 'lucide-react';

interface GameState {
  score: number;
  level: number;
  streak: number;
  emotions: string[];
  currentGame: Game | null;
  gameStatus: 'idle' | 'playing' | 'completed' | 'failed';
  feedback: string;
  reactionTimes: number[];
  accuracy: number;
  heartRate: number;
  focusLevel: number;
  targetsHit: number;
  targetsMissed: number;
  currentTargets: Array<{ x: number; y: number; color: string; id: number }>;
  timingTarget: { x: number; y: number; inTarget: boolean } | null;
  candles: Array<{ time: number; open: number; high: number; low: number; close: number }>;
}

interface Game {
  id: number;
  type: string;
  title: string;
  description: string;
  instruction: string;
  duration: number;
  points: number;
  icon: React.ReactNode;
  color: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'breathing' | 'focus' | 'patience' | 'discipline' | 'timing' | 'memory' | 'coordination';
  scientificBasis: string;
}

const games: Game[] = [
  // Respiração e Relaxamento
  {
    id: 1,
    type: 'breathing',
    title: 'Respiração 4-7-8',
    description: 'Técnica de respiração para reduzir ansiedade',
    instruction: 'Inspire por 4s, segure por 7s, expire por 8s. Siga o guia visual.',
    duration: 60,
    points: 15,
    icon: <Heart className="h-5 w-5" />,
    color: 'text-red-400',
    difficulty: 'easy',
    category: 'breathing',
    scientificBasis: 'Técnica de relaxamento comprovada que ativa o sistema nervoso parassimpático'
  },
  {
    id: 2,
    type: 'breathing',
    title: 'Caixa Respiratória',
    description: 'Respiração quadrada para equilíbrio',
    instruction: 'Inspire 4s, segure 4s, expire 4s, segure 4s. Siga o quadrado visual.',
    duration: 45,
    points: 12,
    icon: <Waves className="h-5 w-5" />,
    color: 'text-blue-400',
    difficulty: 'easy',
    category: 'breathing',
    scientificBasis: 'Reduz cortisol e melhora foco através da respiração rítmica'
  },
  
  // Foco e Concentração
  {
    id: 3,
    type: 'focus',
    title: 'Foco Central',
    description: 'Mantenha o foco em um ponto específico',
    instruction: 'Fixe o olhar no centro sem piscar por 20s. Mantenha a concentração.',
    duration: 20,
    points: 18,
    icon: <Target className="h-5 w-5" />,
    color: 'text-purple-400',
    difficulty: 'medium',
    category: 'focus',
    scientificBasis: 'Treina atenção sustentada e reduz distrações'
  },
  {
    id: 4,
    type: 'focus',
    title: 'Varredura Visual',
    description: 'Encontre e siga objetos em movimento',
    instruction: 'Clique nos círculos que aparecem. Quanto mais rápido, melhor.',
    duration: 30,
    points: 25,
    icon: <Eye className="h-5 w-5" />,
    color: 'text-indigo-400',
    difficulty: 'hard',
    category: 'focus',
    scientificBasis: 'Melhora tempo de reação e atenção seletiva'
  },
  {
    id: 5,
    type: 'focus',
    title: 'Meditação Guiada',
    description: 'Foco em sensações corporais',
    instruction: 'Concentre-se na respiração e sensações do corpo. Siga as instruções.',
    duration: 90,
    points: 20,
    icon: <Brain className="h-5 w-5" />,
    color: 'text-teal-400',
    difficulty: 'medium',
    category: 'focus',
    scientificBasis: 'Aumenta consciência plena e reduz estresse'
  },
  
  // Timing e Coordenação
  {
    id: 6,
    type: 'timing',
    title: 'Timing Perfeito',
    description: 'Clique no momento exato',
    instruction: 'Clique quando o círculo atingir o centro. Precisão máxima necessária.',
    duration: 40,
    points: 30,
    icon: <Timer className="h-5 w-5" />,
    color: 'text-orange-400',
    difficulty: 'hard',
    category: 'timing',
    scientificBasis: 'Melhora coordenação motora fina e percepção temporal'
  },
  {
    id: 7,
    type: 'timing',
    title: 'Ritmo Constante',
    description: 'Mantenha um ritmo constante',
    instruction: 'Clique seguindo o ritmo mostrado. Consistência é a chave.',
    duration: 35,
    points: 22,
    icon: <Activity className="h-5 w-5" />,
    color: 'text-pink-400',
    difficulty: 'medium',
    category: 'timing',
    scientificBasis: 'Desenvolve senso de ritmo e timing motor'
  },
  {
    id: 8,
    type: 'timing',
    title: 'Reflexo Rápido',
    description: 'Reaja a estímulos aleatórios',
    instruction: 'Clique assim que o alvo aparecer. Teste seus reflexos.',
    duration: 25,
    points: 28,
    icon: <Zap className="h-5 w-5" />,
    color: 'text-yellow-400',
    difficulty: 'hard',
    category: 'timing',
    scientificBasis: 'Melhora tempo de reação e processamento visual'
  },
  
  // Paciência e Disciplina
  {
    id: 9,
    type: 'patience',
    title: 'Paciência Estratégica',
    description: 'Aguarde o momento ideal',
    instruction: 'Aguarde 30s sem clicar. Apenas observe e controle o impulso.',
    duration: 30,
    points: 20,
    icon: <Shield className="h-5 w-5" />,
    color: 'text-green-400',
    difficulty: 'medium',
    category: 'patience',
    scientificBasis: 'Treina controle de impulsos e paciência'
  },
  {
    id: 10,
    type: 'patience',
    title: 'Controle de Impulsos',
    description: 'Resista à tentação de clicar',
    instruction: 'Apenas clique nos alvos verdes. Ignore todos os outros.',
    duration: 45,
    points: 35,
    icon: <Crosshair className="h-5 w-5" />,
    color: 'text-emerald-400',
    difficulty: 'hard',
    category: 'patience',
    scientificBasis: 'Fortalece córtex pré-frontal e controle inibitório'
  },
  {
    id: 11,
    type: 'discipline',
    title: 'Disciplina Emocional',
    description: 'Mantenha a calma sob pressão',
    instruction: 'Mantenha-se calmo enquanto números aleatórios aparecem.',
    duration: 30,
    points: 25,
    icon: <Mountain className="h-5 w-5" />,
    color: 'text-gray-400',
    difficulty: 'hard',
    category: 'discipline',
    scientificBasis: 'Treina regulação emocional sob estresse'
  },
  
  // Memória e Cognição
  {
    id: 12,
    type: 'memory',
    title: 'Memória de Sequência',
    description: 'Lembre-se e reproduza sequências',
    instruction: 'Observe a sequência de cores e repita exatamente.',
    duration: 40,
    points: 30,
    icon: <Sparkles className="h-5 w-5" />,
    color: 'text-cyan-400',
    difficulty: 'medium',
    category: 'memory',
    scientificBasis: 'Melhora memória de trabalho e função executiva'
  },
  {
    id: 13,
    type: 'memory',
    title: 'Atenção Dividida',
    description: 'Monitore múltiplos estímulos',
    instruction: 'Conte os círculos azuis enquanto ignora os vermelhos.',
    duration: 35,
    points: 32,
    icon: <Gauge className="h-5 w-5" />,
    color: 'text-violet-400',
    difficulty: 'hard',
    category: 'memory',
    scientificBasis: 'Desenvolve capacidade de processamento paralelo'
  },
  {
    id: 14,
    type: 'memory',
    title: 'Memória Visual',
    description: 'Lembre-se de posições',
    instruction: 'Memorize a posição dos objetos e identifique as mudanças.',
    duration: 50,
    points: 28,
    icon: <BarChart3 className="h-5 w-5" />,
    color: 'text-amber-400',
    difficulty: 'medium',
    category: 'memory',
    scientificBasis: 'Fortalece memória espacial e visual'
  },
  
  // Coordenação e Habilidades Motoras
  {
    id: 15,
    type: 'coordination',
    title: 'Coordenação Mão-Olho',
    description: 'Siga padrões com precisão',
    instruction: 'Trace os caminhos mostrados com o mouse. Precisão necessária.',
    duration: 30,
    points: 26,
    icon: <MousePointer className="h-5 w-5" />,
    color: 'text-lime-400',
    difficulty: 'medium',
    category: 'coordination',
    scientificBasis: 'Melhora coordenação motora fina'
  },
  {
    id: 16,
    type: 'coordination',
    title: 'Equilíbrio Visual',
    description: 'Mantenha o centro em movimento',
    instruction: 'Mantenha o ponto no centro enquanto ele se move.',
    duration: 25,
    points: 24,
    icon: <Wind className="h-5 w-5" />,
    color: 'text-sky-400',
    difficulty: 'hard',
    category: 'coordination',
    scientificBasis: 'Treina estabilização visual e concentração'
  },
  
  // Controle Emocional Avançado
  {
    id: 17,
    type: 'discipline',
    title: 'Resiliência Pressão',
    description: 'Mantenha o desempenho sob estresse',
    instruction: 'Complete tarefas enquanto o tempo acelera e distrações aparecem.',
    duration: 40,
    points: 40,
    icon: <Flame className="h-5 w-5" />,
    color: 'text-red-500',
    difficulty: 'hard',
    category: 'discipline',
    scientificBasis: 'Desenvolve resiliência e performance sob pressão'
  },
  {
    id: 18,
    type: 'discipline',
    title: 'Autocontrole Emocional',
    description: 'Reconheça e controle emoções',
    instruction: 'Identifique emoções e escolha respostas calmas.',
    duration: 45,
    points: 35,
    icon: <Heart className="h-5 w-5" />,
    color: 'text-rose-400',
    difficulty: 'medium',
    category: 'discipline',
    scientificBasis: 'Melhora inteligência emocional e autoconsciência'
  },
  {
    id: 19,
    type: 'focus',
    title: 'Fluxo Mental',
    description: 'Atinja estado de flow',
    instruction: 'Mantenha foco total em uma tarefa desafiadora.',
    duration: 60,
    points: 45,
    icon: <TrendingUp className="h-5 w-5" />,
    color: 'text-green-500',
    difficulty: 'hard',
    category: 'focus',
    scientificBasis: 'Treina capacidade de atingir estado de flow'
  },
  {
    id: 20,
    type: 'patience',
    title: 'Maestria da Paciência',
    description: 'Controle avançado de impulsos',
    instruction: 'Aguarde períodos crescentes antes de agir. Teste máximo de paciência.',
    duration: 90,
    points: 50,
    icon: <Clock className="h-5 w-5" />,
    color: 'text-blue-500',
    difficulty: 'hard',
    category: 'patience',
    scientificBasis: 'Desenvolve paciência e controle de impulsos avançado'
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
  "Paciência é uma virtude no trading",
  "Respire fundo antes de decisões importantes",
  "Mantenha foco no longo prazo",
  "Controle impulsos emocionais",
  "Pratique mindfulness diariamente"
];

export function PsychologicalControl() {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    streak: 0,
    emotions: [],
    currentGame: null,
    gameStatus: 'idle',
    feedback: '',
    reactionTimes: [],
    accuracy: 0,
    heartRate: 65,
    focusLevel: 50,
    targetsHit: 0,
    targetsMissed: 0,
    currentTargets: [],
    timingTarget: null,
    candles: []
  });

  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [randomNumbers, setRandomNumbers] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [gameStats, setGameStats] = useState<Record<string, { played: number; completed: number; bestScore: number }>>({});

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const clickPositions = useRef<{ x: number; y: number; time: number }[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      completeGame();
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  useEffect(() => {
    if (gameState.currentGame?.type === 'focus' && isTimerActive) {
      const interval = setInterval(() => {
        // Adicionar novos alvos aleatórios
        if (gameState.currentTargets.length < 5) {
          const newTarget = {
            x: Math.random() * 260 + 20,
            y: Math.random() * 260 + 20,
            color: Math.random() > 0.7 ? '#10b981' : '#ef4444',
            id: Date.now()
          };
          
          setGameState(prev => ({
            ...prev,
            currentTargets: [...prev.currentTargets, newTarget]
          }));
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [gameState.currentGame?.type, isTimerActive, gameState.currentTargets.length]);

  useEffect(() => {
    if (gameState.currentGame?.type === 'timing' && isTimerActive) {
      const interval = setInterval(() => {
        // Atualizar posição do alvo de timing
        const angle = (Date.now() / 1000) * Math.PI * 2;
        const centerX = 150;
        const centerY = 150;
        const radius = 80;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        setGameState(prev => ({
          ...prev,
          timingTarget: { x, y, inTarget: false }
        }));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [gameState.currentGame?.type, isTimerActive]);

  useEffect(() => {
    if (gameState.currentGame?.type === 'patience' && isTimerActive) {
      // Gerar alvos verdes e vermelhos para controle de impulsos
      const interval = setInterval(() => {
        const isGreen = Math.random() > 0.6;
        const newTarget = {
          x: Math.random() * 260 + 20,
          y: Math.random() * 260 + 20,
          color: isGreen ? '#10b981' : '#ef4444',
          id: Date.now()
        };
        
        setGameState(prev => ({
          ...prev,
          currentTargets: [...prev.currentTargets.slice(-3), newTarget]
        }));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [gameState.currentGame?.type, isTimerActive]);

  useEffect(() => {
    if (gameState.currentGame?.type === 'memory' && isTimerActive) {
      // Gerar sequência de cores para memória
      const colors = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'];
      const sequence = Array.from({ length: 4 }, () => colors[Math.floor(Math.random() * colors.length)]);
      
      setGameState(prev => ({
        ...prev,
        currentTargets: sequence.map((color, index) => ({
          x: 50 + (index % 2) * 100,
          y: 50 + Math.floor(index / 2) * 100,
          color,
          id: index
        }))
      }));
    }
  }, [gameState.currentGame?.type, isTimerActive]);

  useEffect(() => {
    if (gameState.currentGame?.type === 'coordination' && isTimerActive) {
      // Gerar gráfico de candles para coordenação
      const interval = setInterval(() => {
        const newCandle = {
          time: Date.now(),
          open: 100 + Math.random() * 20,
          high: 120 + Math.random() * 10,
          low: 90 + Math.random() * 10,
          close: 95 + Math.random() * 20
        };
        
        setGameState(prev => ({
          ...prev,
          candles: [...prev.candles.slice(-10), newCandle]
        }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState.currentGame?.type, isTimerActive]);

  useEffect(() => {
    if (gameState.currentGame?.type === 'discipline' && isTimerActive) {
      const interval = setInterval(() => {
        setRandomNumbers(prev => [...prev, Math.floor(Math.random() * 100)]);
        if (randomNumbers.length > 5) {
          setRandomNumbers(prev => prev.slice(1));
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [gameState.currentGame?.type, isTimerActive, randomNumbers.length]);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!gameState.currentGame || !isTimerActive) return;
    
    // Renderizar baseado no tipo de jogo
    if (gameState.currentGame.type === 'timing') {
      // Jogo de timing - círculo em movimento
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 80;
      
      // Área de alvo central
      ctx.beginPath();
      ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Círculo em movimento
      if (gameState.timingTarget) {
        ctx.beginPath();
        ctx.arc(gameState.timingTarget.x, gameState.timingTarget.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.fill();
      }
    } else if (gameState.currentGame.type === 'focus') {
      // Jogo de foco - alvos aleatórios
      gameState.currentTargets.forEach(target => {
        ctx.beginPath();
        ctx.arc(target.x, target.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = target.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    } else if (gameState.currentGame.type === 'patience') {
      // Jogo de paciência - apenas alvos verdes e vermelhos
      gameState.currentTargets.forEach(target => {
        ctx.beginPath();
        ctx.arc(target.x, target.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = target.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Adicionar texto para indicar qual clicar
        if (target.color === '#10b981') {
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('CLIQUE', target.x, target.y + 5);
        }
      });
    } else if (gameState.currentGame.type === 'memory') {
      // Jogo de memória - sequência de cores
      gameState.currentTargets.forEach((target, index) => {
        ctx.fillStyle = target.color;
        ctx.fillRect(target.x - 25, target.y - 25, 50, 50);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(target.x - 25, target.y - 25, 50, 50);
        
        // Número da sequência
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText((index + 1).toString(), target.x, target.y + 5);
      });
    } else if (gameState.currentGame.type === 'coordination') {
      // Jogo de coordenação - gráfico de candles
      if (gameState.candles.length > 0) {
        const candleWidth = 20;
        const chartHeight = 200;
        const chartTop = 50;
        const chartBottom = chartTop + chartHeight;
        
        // Desenhar grade
        ctx.strokeStyle = '#ffffff20';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
          const y = chartTop + (chartHeight / 5) * i;
          ctx.beginPath();
          ctx.moveTo(30, y);
          ctx.lineTo(270, y);
          ctx.stroke();
        }
        
        // Desenhar candles
        gameState.candles.forEach((candle, index) => {
          const x = 40 + index * candleWidth;
          const maxPrice = Math.max(candle.high, candle.open, candle.close);
          const minPrice = Math.min(candle.low, candle.open, candle.close);
          
          const highY = chartTop + ((120 - maxPrice) / 60) * chartHeight;
          const lowY = chartTop + ((120 - minPrice) / 60) * chartHeight;
          const openY = chartTop + ((120 - candle.open) / 60) * chartHeight;
          const closeY = chartTop + ((120 - candle.close) / 60) * chartHeight;
          
          // Wick
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x + candleWidth / 2, highY);
          ctx.lineTo(x + candleWidth / 2, lowY);
          ctx.stroke();
          
          // Body
          ctx.fillStyle = candle.close >= candle.open ? '#10b981' : '#ef4444';
          const bodyTop = Math.min(openY, closeY);
          const bodyHeight = Math.abs(closeY - openY) || 1;
          ctx.fillRect(x + 2, bodyTop, candleWidth - 4, bodyHeight);
        });
        
        // Título
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Gráfico de Candles - Clique nos candles', canvas.width / 2, 30);
      }
    }
  }, [gameState.currentGame?.type, isTimerActive, gameState.currentTargets, gameState.timingTarget, gameState.candles]);

  const startGame = (game: Game) => {
    setGameState({
      ...gameState,
      currentGame: game,
      gameStatus: 'playing',
      feedback: '',
      reactionTimes: [],
      targetsHit: 0,
      targetsMissed: 0,
      currentTargets: [],
      timingTarget: null,
      candles: []
    });
    setTimeLeft(game.duration);
    setIsTimerActive(true);
    setRandomNumbers([]);
    clickPositions.current = [];
    
    // Inicializar estatísticas do jogo
    if (!gameStats[game.type]) {
      setGameStats(prev => ({
        ...prev,
        [game.type]: { played: 0, completed: 0, bestScore: 0 }
      }));
    }
    
    setGameStats(prev => ({
      ...prev,
      [game.type]: { ...prev[game.type], played: prev[game.type]?.played + 1 || 1 }
    }));
  };

  const completeGame = () => {
    setIsTimerActive(false);
    
    if (gameState.currentGame) {
      const points = gameState.currentGame.points;
      const newScore = gameState.score + points;
      const newStreak = gameState.streak + 1;
      
      setGameState(prev => ({
        ...prev,
        score: newScore,
        streak: newStreak,
        level: Math.floor(newScore / 100) + 1,
        gameStatus: 'completed',
        feedback: `Excelente! Você ganhou ${points} pontos!`,
        currentGame: null
      }));
      
      // Atualizar estatísticas
      setGameStats(prev => ({
        ...prev,
        [gameState.currentGame.type]: {
          ...prev[gameState.currentGame.type],
          completed: prev[gameState.currentGame.type]?.completed + 1 || 1,
          bestScore: Math.max(prev[gameState.currentGame.type]?.bestScore || 0, points)
        }
      }));
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const failGame = () => {
    setIsTimerActive(false);
    setGameState({
      ...gameState,
      streak: 0,
      gameStatus: 'failed',
      feedback: 'Não desista! Tente novamente.',
      currentGame: null
    });
  };

  const resetGame = () => {
    setGameState({
      score: 0,
      level: 1,
      streak: 0,
      emotions: [],
      currentGame: null,
      gameStatus: 'idle',
      feedback: '',
      reactionTimes: [],
      accuracy: 0,
      heartRate: 65,
      focusLevel: 50,
      targetsHit: 0,
      targetsMissed: 0,
      currentTargets: [],
      timingTarget: null,
      candles: []
    });
    setTimeLeft(0);
    setIsTimerActive(false);
    setRandomNumbers([]);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !gameState.currentGame) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    clickPositions.current.push({ x, y, time: Date.now() });
    
    // Lógica específica para cada tipo de jogo
    if (gameState.currentGame.type === 'timing') {
      checkTimingAccuracy(x, y);
    } else if (gameState.currentGame.type === 'focus') {
      checkTargetHit(x, y);
    } else if (gameState.currentGame.type === 'patience') {
      checkPatienceTarget(x, y);
    } else if (gameState.currentGame.type === 'memory') {
      checkMemoryTarget(x, y);
    } else if (gameState.currentGame.type === 'coordination') {
      checkCoordinationTarget(x, y);
    }
  };

  const checkTimingAccuracy = (x: number, y: number) => {
    if (!gameState.timingTarget) return;
    
    const distance = Math.sqrt(
      Math.pow(x - gameState.timingTarget.x, 2) + 
      Math.pow(y - gameState.timingTarget.y, 2)
    );
    
    if (distance <= 20) {
      // Acerto perfeito
      const bonus = 10;
      setGameState(prev => ({ ...prev, score: prev.score + bonus }));
    }
  };

  const checkTargetHit = (x: number, y: number) => {
    // Verificar se clicou em algum alvo
    const hitTarget = gameState.currentTargets.find(target => {
      const distance = Math.sqrt(
        Math.pow(x - target.x, 2) + 
        Math.pow(y - target.y, 2)
      );
      return distance <= 15;
    });
    
    if (hitTarget) {
      setGameState(prev => ({
        ...prev,
        score: prev.score + (hitTarget.color === '#10b981' ? 5 : -2),
        targetsHit: prev.targetsHit + 1,
        currentTargets: prev.currentTargets.filter(t => t.id !== hitTarget.id)
      }));
    }
  };

  const checkPatienceTarget = (x: number, y: number) => {
    // Apenas clicar em alvos verdes
    const hitTarget = gameState.currentTargets.find(target => {
      const distance = Math.sqrt(
        Math.pow(x - target.x, 2) + 
        Math.pow(y - target.y, 2)
      );
      return distance <= 15;
    });
    
    if (hitTarget) {
      if (hitTarget.color === '#10b981') {
        // Certo - clicou no verde
        setGameState(prev => ({
          ...prev,
          score: prev.score + 10,
          targetsHit: prev.targetsHit + 1,
          currentTargets: prev.currentTargets.filter(t => t.id !== hitTarget.id)
        }));
      } else {
        // Errado - clicou no vermelho
        setGameState(prev => ({
          ...prev,
          score: Math.max(0, prev.score - 5),
          targetsMissed: prev.targetsMissed + 1
        }));
      }
    }
  };

  const checkMemoryTarget = (x: number, y: number) => {
    // Lógica para jogo de memória
    const hitTarget = gameState.currentTargets.find(target => {
      const distance = Math.sqrt(
        Math.pow(x - target.x, 2) + 
        Math.pow(y - target.y, 2)
      );
      return distance <= 15;
    });
    
    if (hitTarget) {
      setGameState(prev => ({
        ...prev,
        score: prev.score + 5,
        targetsHit: prev.targetsHit + 1
      }));
    }
  };

  const checkCoordinationTarget = (x: number, y: number) => {
    // Verificar precisão da coordenação
    setGameState(prev => ({
      ...prev,
      score: prev.score + 2
    }));
  };

  const getMotivationalMessage = () => {
    if (gameState.streak >= 10) return "Incrível! Você está no caminho certo!";
    if (gameState.streak >= 5) return "Ótimo trabalho! Continue assim!";
    if (gameState.streak >= 3) return "Bom começo! Mantenha o foco!";
    if (gameState.streak >= 1) return "Vamos começar! Você consegue!";
    return "Pronto para treinar sua mente?";
  };

  const filteredGames = selectedCategory === 'all' 
    ? games 
    : games.filter(game => game.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'Todos', icon: <Brain className="h-4 w-4" /> },
    { id: 'breathing', name: 'Respiração', icon: <Heart className="h-4 w-4" /> },
    { id: 'focus', name: 'Foco', icon: <Target className="h-4 w-4" /> },
    { id: 'timing', name: 'Timing', icon: <Timer className="h-4 w-4" /> },
    { id: 'patience', name: 'Paciência', icon: <Shield className="h-4 w-4" /> },
    { id: 'discipline', name: 'Disciplina', icon: <Mountain className="h-4 w-4" /> },
    { id: 'memory', name: 'Memória', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'coordination', name: 'Coordenação', icon: <MousePointer className="h-4 w-4" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Controle Psicológico Avançado</h2>
        <p className="text-white/60">20 jogos cientificamente comprovados para dominar sua mente</p>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="glass-dark border-white/10">
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-yellow-400">{gameState.score}</div>
            <div className="text-xs text-white/60">Pontos</div>
          </CardContent>
        </Card>
        <Card className="glass-dark border-white/10">
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-blue-400">{gameState.level}</div>
            <div className="text-xs text-white/60">Nível</div>
          </CardContent>
        </Card>
        <Card className="glass-dark border-white/10">
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-green-400">{gameState.streak}</div>
            <div className="text-xs text-white/60">Sequência</div>
          </CardContent>
        </Card>
        <Card className="glass-dark border-white/10">
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-purple-400">{gameState.accuracy}%</div>
            <div className="text-xs text-white/60">Precisão</div>
          </CardContent>
        </Card>
        <Card className="glass-dark border-white/10">
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-red-400">{gameState.heartRate}</div>
            <div className="text-xs text-white/60">BPM</div>
          </CardContent>
        </Card>
        <Card className="glass-dark border-white/10">
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-orange-400">{gameState.focusLevel}%</div>
            <div className="text-xs text-white/60">Foco</div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center gap-2 ${
              selectedCategory === category.id 
                ? 'bg-purple-500 text-white' 
                : 'border-white/20 text-white/60 hover:text-white'
            }`}
          >
            {category.icon}
            {category.name}
          </Button>
        ))}
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
                  Escolha entre 20 jogos cientificamente comprovados para melhorar seu controle 
                  emocional, foco e disciplina no trading.
                </p>
              </div>
              
              {/* Games Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredGames.map((game, index) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card 
                      className={`glass-dark border-white/10 cursor-pointer hover:border-white/20 transition-all h-full ${
                        game.difficulty === 'hard' ? 'border-red-500/30' : 
                        game.difficulty === 'medium' ? 'border-yellow-500/30' : 
                        'border-green-500/30'
                      }`}
                      onClick={() => startGame(game)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg bg-white/10 ${game.color}`}>
                            {game.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-semibold text-sm">{game.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={`text-xs ${
                                game.difficulty === 'hard' ? 'border-red-500 text-red-400' :
                                game.difficulty === 'medium' ? 'border-yellow-500 text-yellow-400' :
                                'border-green-500 text-green-400'
                              }`}>
                                {game.difficulty === 'hard' ? 'Difícil' : 
                                 game.difficulty === 'medium' ? 'Médio' : 'Fácil'}
                              </Badge>
                              <span className="text-xs text-white/40">{game.points} pts</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-white/60 mb-2">{game.description}</p>
                        <div className="text-xs text-blue-400 italic">{game.scientificBasis}</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Tips */}
              <div className="bg-white/5 rounded-lg p-4 max-w-2xl mx-auto">
                <h4 className="text-sm font-semibold text-white mb-3">Dicas Psicológicas:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {psychologicalTips.slice(0, 6).map((tip, index) => (
                    <div key={index} className="text-xs text-white/60 flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {gameState.gameStatus === 'playing' && gameState.currentGame && (
            <div className="space-y-6">
              {/* Game Header */}
              <div className="text-center space-y-4">
                <div className={`inline-flex p-3 rounded-full bg-white/10 ${gameState.currentGame.color}`}>
                  {gameState.currentGame.icon}
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {gameState.currentGame.title}
                </h3>
                <p className="text-white/60">{gameState.currentGame.instruction}</p>
                <div className="text-xs text-blue-400 italic max-w-md mx-auto">
                  {gameState.currentGame.scientificBasis}
                </div>
              </div>

              {/* Timer */}
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{timeLeft}s</div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <motion.div
                    className="bg-purple-500 h-2 rounded-full"
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeLeft / gameState.currentGame.duration) * 100}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>

              {/* Game Content */}
              <div className="text-center space-y-4">
                {/* Canvas para jogos visuais */}
                {(gameState.currentGame.type === 'timing' || 
                  gameState.currentGame.type === 'focus' || 
                  gameState.currentGame.type === 'coordination') && (
                  <div className="flex justify-center">
                    <canvas
                      ref={canvasRef}
                      width={300}
                      height={300}
                      onClick={handleCanvasClick}
                      className="border border-white/20 rounded-lg bg-white/5 cursor-pointer"
                    />
                  </div>
                )}

                {/* Breathing exercises */}
                {gameState.currentGame.type === 'breathing' && (
                  <div className="flex justify-center">
                    <motion.div
                      className="w-32 h-32 border-4 border-red-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                  </div>
                )}

                {/* Discipline games with random numbers */}
                {gameState.currentGame.type === 'discipline' && (
                  <div className="flex justify-center gap-2 flex-wrap">
                    {randomNumbers.map((num, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-2xl font-bold text-red-400 p-2 bg-white/10 rounded"
                      >
                        {num}
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Memory games placeholder */}
                {gameState.currentGame.type === 'memory' && (
                  <div className="flex justify-center">
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="w-12 h-12 bg-purple-500/20 rounded-lg" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Patience games */}
                {gameState.currentGame.type === 'patience' && (
                  <div className="flex justify-center">
                    <div className="text-lg text-white/60">
                      Mantenha a calma... {timeLeft}s restantes
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={completeGame}
                  variant="outline"
                  className="border-green-500 text-green-400 hover:bg-green-500/10"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Concluído
                </Button>
                <Button
                  onClick={failGame}
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
                  onClick={() => {
                    const randomGame = games[Math.floor(Math.random() * games.length)];
                    startGame(randomGame);
                  }}
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
                  onClick={() => {
                    if (gameState.currentGame) {
                      startGame(gameState.currentGame);
                    }
                  }}
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

      {/* Game Statistics */}
      {Object.keys(gameStats).length > 0 && (
        <Card className="glass-dark border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Estatísticas dos Jogos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(gameStats).map(([gameType, stats]) => {
                const game = games.find(g => g.type === gameType);
                if (!game) return null;
                
                return (
                  <div key={gameType} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1 rounded ${game.color}`}>
                        {game.icon}
                      </div>
                      <span className="text-sm font-medium text-white">{game.title}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-white/60">Jogados</div>
                        <div className="text-white font-semibold">{stats.played}</div>
                      </div>
                      <div>
                        <div className="text-white/60">Concluídos</div>
                        <div className="text-green-400 font-semibold">{stats.completed}</div>
                      </div>
                      <div>
                        <div className="text-white/60">Melhor</div>
                        <div className="text-yellow-400 font-semibold">{stats.bestScore}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
            Guia Completo de Controle Psicológico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {psychologicalTips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-white/80">{tip}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-400 mb-2">Base Científica:</h4>
            <div className="text-xs text-blue-300 space-y-1">
              <p>Estudos mostram que treinamento cognitivo regular melhora significativamente o desempenho em situações de pressão.</p>
              <p>Exercícios de respiração ativam o sistema nervoso parassimpático, reduzindo cortisol e melhorando decisões.</p>
              <p>Treinamento de tempo de reação e foco aumenta a capacidade de processamento de informações em alta velocidade.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
