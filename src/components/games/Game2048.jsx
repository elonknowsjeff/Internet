import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Gamepad2, RotateCcw } from "lucide-react";

const SIZE = 4;
const empty = () => Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

const spawn = (g) => {
  const cells = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (g[r][c] === 0) cells.push([r, c]);
  if (!cells.length) return g;
  const [r, c] = cells[Math.floor(Math.random() * cells.length)];
  g[r][c] = Math.random() < 0.9 ? 2 : 4;
  return g;
};

const rotateCW = (g) => {
  const n = empty();
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) n[c][SIZE - 1 - r] = g[r][c];
  return n;
};

// slide one row left, merging; returns { row, gain }
const slide = (row) => {
  const arr = row.filter((v) => v);
  const out = [];
  let gain = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === arr[i + 1]) { const v = arr[i] * 2; out.push(v); gain += v; i++; }
    else out.push(arr[i]);
  }
  while (out.length < SIZE) out.push(0);
  return { row: out, gain };
};

const move = (g, dir) => {
  let rot = dir === "up" ? 1 : dir === "right" ? 2 : dir === "down" ? 3 : 0;
  let cur = g;
  for (let i = 0; i < rot; i++) cur = rotateCW(cur);
  let moved = false, gain = 0;
  const next = cur.map((row) => {
    const res = slide(row);
    if (res.row.join() !== row.join()) moved = true;
    gain += res.gain;
    return res.row;
  });
  let back = next;
  for (let i = 0; i < (4 - rot) % 4; i++) back = rotateCW(back);
  return { grid: back, moved, gain };
};

const canMove = (g) => {
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    if (g[r][c] === 0) return true;
    if (c < SIZE - 1 && g[r][c] === g[r][c + 1]) return true;
    if (r < SIZE - 1 && g[r][c] === g[r + 1][c]) return true;
  }
  return false;
};

const tileStyle = (v) => {
  if (v === 0) return "bg-white/[0.04] text-transparent";
  const map = {
    2: "bg-neutral-200 text-neutral-800", 4: "bg-neutral-300 text-neutral-800",
    8: "bg-amber-300 text-neutral-900", 16: "bg-orange-400 text-white", 32: "bg-orange-500 text-white",
    64: "bg-rose-500 text-white", 128: "bg-yellow-400 text-neutral-900", 256: "bg-yellow-500 text-neutral-900",
    512: "bg-lime-500 text-white", 1024: "bg-cyan-500 text-white", 2048: "bg-fuchsia-500 text-white",
  };
  return map[v] || "bg-fuchsia-700 text-white";
};

export default function Game2048({ onClose }) {
  const [grid, setGrid] = useState(() => spawn(spawn(empty())));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem("vazolex_2048_best") || 0));
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);
  const gridRef = useRef(grid);
  const scoreRef = useRef(0);
  gridRef.current = grid;
  scoreRef.current = score;

  const reset = () => {
    const g = spawn(spawn(empty()));
    setGrid(g); gridRef.current = g; setScore(0); scoreRef.current = 0; setOver(false); setWon(false);
  };

  const doMove = useCallback((dir) => {
    if (over) return;
    const { grid: ng, moved, gain } = move(gridRef.current, dir);
    if (!moved) return;
    const spawned = spawn(ng);
    gridRef.current = spawned;
    const ns = scoreRef.current + gain;
    setGrid(spawned);
    setScore(ns);
    if (ns > best) { setBest(ns); localStorage.setItem("vazolex_2048_best", String(ns)); }
    if (!won && spawned.some((r) => r.includes(2048))) setWon(true);
    if (!canMove(spawned)) setOver(true);
  }, [over, won, best]);

  useEffect(() => {
    const onKey = (e) => {
      const map = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down", a: "left", d: "right", w: "up", s: "down" };
      const dir = map[e.key];
      if (dir) { e.preventDefault(); doMove(dir); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doMove]);

  // touch swipe
  const touch = useRef(null);
  const onTouchStart = (e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchEnd = (e) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
    doMove(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
    touch.current = null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="flex items-center justify-between w-full max-w-xs mb-3">
        <h2 className="text-lg font-bold font-display flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-amber-400" /> 2048</h2>
        <div className="flex gap-2 text-[12px]">
          <span className="px-2.5 py-1 rounded-md bg-white/[0.06]"><span className="text-white/40">Score</span> <b>{score}</b></span>
          <span className="px-2.5 py-1 rounded-md bg-white/[0.06]"><span className="text-white/40">Best</span> <b>{best}</b></span>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 grid place-items-center"><X className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="relative" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="grid grid-cols-4 gap-2 p-2 rounded-2xl bg-white/[0.04] border border-white/10">
          {grid.flatMap((row, r) => row.map((v, c) => (
            <div key={`${r}-${c}`} className={`w-[68px] h-[68px] sm:w-[76px] sm:h-[76px] rounded-xl flex items-center justify-center text-2xl font-extrabold ${tileStyle(v)}`}>
              {v || ""}
            </div>
          )))}
        </div>
        {(over || won) && (
          <div className="absolute inset-0 grid place-items-center rounded-2xl bg-black/70 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-2xl font-black mb-1">{won && !over ? "🎉 2048!" : "Game over"}</p>
              <p className="text-white/60 text-sm mb-3">Score {score}</p>
              <button onClick={reset} className="px-5 py-2 rounded-full brand-grad text-black font-semibold text-sm">Play again</button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button onClick={reset} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.06] border border-white/10 text-sm hover:bg-white/[0.12]"><RotateCcw className="w-3.5 h-3.5" /> New game</button>
      </div>
      <p className="text-xs text-neutral-500 mt-3 text-center">Arrow keys / WASD or swipe to slide · merge to 2048.</p>
    </div>
  );
}