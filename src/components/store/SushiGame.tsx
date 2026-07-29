"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type Piece = {
  id: number;
  x: number;
  y: number;
  speed: number;
  emoji: string;
};

const EMOJIS = ["🍣", "🍙", "🍤", "🍥", "🍱"];

function SushiGameBoard({ subtitle }: { subtitle?: string }) {
  const [score, setScore] = useState(0);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const nextId = useRef(1);
  const areaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const spawn = setInterval(() => {
      setPieces((prev) => {
        const width = areaRef.current?.clientWidth || 320;
        const piece: Piece = {
          id: nextId.current++,
          x: Math.random() * Math.max(40, width - 48),
          y: -40,
          speed: 1.4 + Math.random() * 2.2,
          emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)]!,
        };
        return [...prev.slice(-14), piece];
      });
    }, 700);

    const tick = setInterval(() => {
      setPieces((prev) =>
        prev
          .map((p) => ({ ...p, y: p.y + p.speed * 4 }))
          .filter((p) => p.y < 280)
      );
    }, 32);

    return () => {
      clearInterval(spawn);
      clearInterval(tick);
    };
  }, []);

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="font-display text-lg">Sushi Catch</p>
          <p className="text-xs text-[var(--rice-dim)]">
            {subtitle ||
              "Toque nos sushis enquanto aguarda. Divirta-se até confirmar a entrega!"}
          </p>
        </div>
        <div className="rounded-full bg-[var(--salmon)]/20 px-3 py-1 text-sm text-[var(--salmon)]">
          {score} pts
        </div>
      </div>
      <div
        ref={areaRef}
        className="relative h-64 touch-none select-none overflow-hidden bg-gradient-to-b from-[#1a1512] to-[#0f0c0a]"
      >
        {pieces.map((p) => (
          <motion.button
            key={p.id}
            type="button"
            aria-label="Pegar sushi"
            className="absolute text-3xl"
            style={{ left: p.x, top: p.y }}
            whileTap={{ scale: 1.3 }}
            onClick={() => {
              setScore((s) => s + 1);
              setPieces((prev) => prev.filter((x) => x.id !== p.id));
            }}
          >
            {p.emoji}
          </motion.button>
        ))}
        <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-[11px] text-[var(--rice-dim)]">
          Toque rápido nos sushis que caem
        </p>
      </div>
    </div>
  );
}

export function SushiGame({
  active,
  subtitle,
}: {
  active: boolean;
  subtitle?: string;
}) {
  if (!active) return null;
  return <SushiGameBoard subtitle={subtitle} />;
}
