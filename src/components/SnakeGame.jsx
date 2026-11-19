import React, { useRef, useEffect, useState } from "react";
import { X } from "lucide-react";

export default function SnakeGame({ onClose }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ snake: [{ x: 10, y: 10 }], dir: { x: 1, y: 0 }, food: { x: 5, y: 5 }, running: true });
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const GRID = 20;

  const setDir = (dx, dy) => {
    const s = stateRef.current;
    if (dx !== 0 && s.dir.x === 0) s.dir = { x: dx, y: 0 };
    if (dy !== 0 && s.dir.y === 0) s.dir = { x: 0, y: dy };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const SIZE = canvas.width / GRID;

    const placeFood = () => {
      stateRef.current.food = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    };

    const draw = () => {
      ctx.fillStyle = "#050511";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const f = stateRef.current.food;
      ctx.fillStyle = "#22d3ee";
      ctx.beginPath();
      ctx.arc(f.x * SIZE + SIZE / 2, f.y * SIZE + SIZE / 2, SIZE / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#a855f7";
      stateRef.current.snake.forEach((s) => ctx.fillRect(s.x * SIZE + 1, s.y * SIZE + 1, SIZE - 2, SIZE - 2));
    };

    const step = () => {
      const s = stateRef.current;
      if (!s.running) return;
      const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };
      if (head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID || s.snake.some((p) => p.x === head.x && p.y === head.y)) {
        s.running = false;
        setOver(true);
        return;
      }
      s.snake.unshift(head);
      if (head.x === s.food.x && head.y === s.food.y) { setScore((v) => v + 1); placeFood(); }
      else s.snake.pop();
      draw();
    };

    const onKey = (e) => {
      if (e.key === "ArrowUp") setDir(0, -1);
      else if (e.key === "ArrowDown") setDir(0, 1);
      else if (e.key === "ArrowLeft") setDir(-1, 0);
      else if (e.key === "ArrowRight") setDir(1, 0);
    };
    window.addEventListener("keydown", onKey);
    const interval = setInterval(step, 120);
    draw();
    return () => { clearInterval(interval); window.removeEventListener("keydown", onKey); };
  }, []);

  const restart = () => {
    stateRef.current = { snake: [{ x: 10, y: 10 }], dir: { x: 1, y: 0 }, food: { x: 5, y: 5 }, running: true };
    setScore(0); setOver(false);
  };

  const Btn = ({ dx, dy, children, className }) => (
    <button onClick={() => setDir(dx, dy)} className={`w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center ${className}`}>{children}</button>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-neutral-950 border border-white/10 rounded-2xl p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold font-display">Snake</h2>
          <span className="text-sm text-cyan-400">Score: {score}</span>
          <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <canvas ref={canvasRef} width={320} height={320} className="rounded-xl bg-black mx-auto block" />
        <p className="text-xs text-neutral-500 mt-2 text-center">Arrow keys or the pad to move</p>
        <div className="flex flex-col items-center gap-1 mt-3 sm:hidden">
          <Btn dx={0} dy={-1}>▲</Btn>
          <div className="flex gap-1">
            <Btn dx={-1} dy={0}>◀</Btn>
            <Btn dx={0} dy={1}>▼</Btn>
            <Btn dx={1} dy={0}>▶</Btn>
          </div>
        </div>
        {over && <p className="text-center text-rose-400 mt-2 text-sm">Game over — score {score}</p>}
        <button onClick={restart} className="mt-3 w-full py-2 rounded-full bg-fuchsia-500 text-black text-sm font-semibold">Restart</button>
      </div>
    </div>
  );
}