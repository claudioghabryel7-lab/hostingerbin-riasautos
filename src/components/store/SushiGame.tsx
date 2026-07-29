"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

const TILES = ["🍣", "🍙", "🍤", "🍥", "🍱", "🦀"] as const;
const SIZE = 6;
type Cell = (typeof TILES)[number];
type Board = Cell[][];
type Pos = { r: number; c: number };

function randTile(): Cell {
  return TILES[Math.floor(Math.random() * TILES.length)]!;
}

function createBoard(): Board {
  const board: Board = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => randTile())
  );
  for (let guard = 0; guard < 40; guard++) {
    const matches = findMatches(board);
    if (matches.length === 0) break;
    for (const { r, c } of matches) board[r]![c] = randTile();
  }
  return board;
}

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

function findMatches(board: Board): Pos[] {
  const matched = new Set<string>();
  const key = (r: number, c: number) => `${r},${c}`;

  for (let r = 0; r < SIZE; r++) {
    let run = 1;
    for (let c = 1; c <= SIZE; c++) {
      if (c < SIZE && board[r]![c] === board[r]![c - 1]) run += 1;
      else {
        if (run >= 3) {
          for (let k = c - run; k < c; k++) matched.add(key(r, k));
        }
        run = 1;
      }
    }
  }

  for (let c = 0; c < SIZE; c++) {
    let run = 1;
    for (let r = 1; r <= SIZE; r++) {
      if (r < SIZE && board[r]![c] === board[r - 1]![c]) run += 1;
      else {
        if (run >= 3) {
          for (let k = r - run; k < r; k++) matched.add(key(k, c));
        }
        run = 1;
      }
    }
  }

  return [...matched].map((s) => {
    const [r, c] = s.split(",").map(Number);
    return { r: r!, c: c! };
  });
}

function areAdjacent(a: Pos, b: Pos) {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
}

function swapCells(board: Board, a: Pos, b: Pos): Board {
  const next = cloneBoard(board);
  const tmp = next[a.r]![a.c]!;
  next[a.r]![a.c] = next[b.r]![b.c]!;
  next[b.r]![b.c] = tmp;
  return next;
}

function clearAndDrop(board: Board, matches: Pos[]): Board {
  const next = cloneBoard(board);
  for (const { r, c } of matches) {
    next[r]![c] = "" as Cell;
  }
  for (let c = 0; c < SIZE; c++) {
    const stack: Cell[] = [];
    for (let r = SIZE - 1; r >= 0; r--) {
      const v = next[r]![c];
      if (v) stack.push(v);
    }
    for (let r = SIZE - 1; r >= 0; r--) {
      next[r]![c] = stack.length ? stack.shift()! : randTile();
    }
  }
  return next;
}

function SushiCrushBoard({ subtitle }: { subtitle?: string }) {
  const [board, setBoard] = useState<Board>(() => createBoard());
  const [selected, setSelected] = useState<Pos | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [busy, setBusy] = useState(false);
  const [burst, setBurst] = useState<Pos[]>([]);
  const [hint, setHint] = useState("Troque sushis vizinhos e forme 3 iguais");

  const resolveBoard = useCallback(async (start: Board) => {
    setBusy(true);
    let current = start;
    let totalGain = 0;
    let chains = 0;

    for (let i = 0; i < 12; i++) {
      const matches = findMatches(current);
      if (matches.length === 0) break;
      chains += 1;
      setBurst(matches);
      setHint(chains > 1 ? `Combo x${chains}!` : "Boa combinação!");
      await new Promise((r) => setTimeout(r, 260));

      current = clearAndDrop(current, matches);
      const gain = matches.length * 10 * chains;
      totalGain += gain;
      setBoard(current);
      setBurst([]);
      await new Promise((r) => setTimeout(r, 140));
    }

    if (totalGain > 0) {
      setScore((s) => s + totalGain);
      if (chains > 1) setCombo((c) => c + 1);
      setHint(`+${totalGain} pontos! Continue jogando`);
    } else {
      setHint("Troque sushis vizinhos e forme 3 iguais");
    }
    setBusy(false);
  }, []);

  useEffect(() => {
    if (busy) return;
    if (findMatches(board).length === 0) return;
    const t = setTimeout(() => {
      void resolveBoard(board);
    }, 180);
    return () => clearTimeout(t);
  }, [board, busy, resolveBoard]);

  const onTap = async (r: number, c: number) => {
    if (busy) return;
    const pos = { r, c };

    if (!selected) {
      setSelected(pos);
      setHint("Agora toque em um sushi vizinho");
      return;
    }

    if (selected.r === r && selected.c === c) {
      setSelected(null);
      setHint("Troque sushis vizinhos e forme 3 iguais");
      return;
    }

    if (!areAdjacent(selected, pos)) {
      setSelected(pos);
      setHint("Escolha um vizinho (cima, baixo, esquerda ou direita)");
      return;
    }

    const before = board;
    const swapped = swapCells(board, selected, pos);
    setSelected(null);
    setBoard(swapped);

    if (findMatches(swapped).length === 0) {
      setHint("Sem combinação — tente outra troca");
      await new Promise((r) => setTimeout(r, 200));
      setBoard(before);
      return;
    }

    await resolveBoard(swapped);
  };

  const reset = () => {
    if (busy) return;
    setBoard(createBoard());
    setSelected(null);
    setScore(0);
    setCombo(0);
    setHint("Novo tabuleiro! Forme 3 iguais");
  };

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div>
          <p className="font-display text-lg">Sushi Crush</p>
          <p className="text-xs text-[var(--rice-dim)]">
            {subtitle ||
              "Estilo Candy Crush: combine 3 sushis enquanto aguarda o pedido."}
          </p>
          <p className="mt-1 text-[11px] text-[var(--salmon)]">{hint}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="rounded-full bg-[var(--salmon)]/20 px-3 py-1 text-sm text-[var(--salmon)]">
            {score} pts
          </div>
          {combo > 0 && (
            <span className="text-[10px] text-emerald-300">{combo} combos</span>
          )}
          <button
            type="button"
            onClick={reset}
            className="text-[11px] text-[var(--rice-dim)] underline"
          >
            Reiniciar
          </button>
        </div>
      </div>

      <div className="px-3 pb-4">
        <div
          className="mx-auto grid aspect-square w-full max-w-[340px] gap-1.5 rounded-2xl bg-[#120e0c] p-2"
          style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isSel = selected?.r === r && selected?.c === c;
              const isBurst = burst.some((b) => b.r === r && b.c === c);
              return (
                <motion.button
                  key={`${r}-${c}`}
                  type="button"
                  disabled={busy}
                  onClick={() => onTap(r, c)}
                  whileTap={{ scale: 0.9 }}
                  animate={{
                    scale: isBurst ? 0.15 : isSel ? 1.08 : 1,
                    opacity: isBurst ? 0 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 420, damping: 24 }}
                  className={`flex aspect-square items-center justify-center rounded-xl text-[clamp(1.1rem,5vw,1.65rem)] shadow-sm ${
                    isSel
                      ? "bg-[var(--salmon)]/35 ring-2 ring-[var(--salmon)]"
                      : "bg-[#1f1814]"
                  }`}
                  aria-label={`Peça ${cell}`}
                >
                  {cell}
                </motion.button>
              );
            })
          )}
        </div>
        <p className="mt-3 text-center text-[11px] text-[var(--rice-dim)]">
          Toque em um sushi e depois no vizinho para trocar · 3 iguais somem
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
  return <SushiCrushBoard subtitle={subtitle} />;
}
