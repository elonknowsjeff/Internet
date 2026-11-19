import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Gamepad2 } from "lucide-react";

const W = 320, H = 420, PADDLE_W = 64, PADDLE_H = 10, BALL = 8;
const ROWS = 5, COLS = 8, BRICK_W = W / COLS, BRICK_H = 16, BRICK_TOP = 40;
const COLORS = ["#ff4d6d", "#ff8a4d", "#ffe066", "#4dd2ff", "#9b6dff"];

function makeBricks() {
  const arr = []; for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) arr.push({ r, c, alive: true, color: COLORS[r] });
  return arr;
}

export default function Breakout({ onClose }) {
  const canvasRef = useRef(null);
  const state = useRef({ px: W / 2, bx: W / 2, by: H - 40, dx: 2.4, dy: -2.4, bricks: makeBricks(), lives: 3, score: 0, running: false, over: false, won: false });
  const [hud, setHud] = useState({ score: 0, lives: 3, status: "ready" });

  const draw = useCallback(() => {
    const s = state.current; const ctx = canvasRef.current?.getContext("2d"); if (!ctx) return;
    ctx.fillStyle = "#05050f"; ctx.fillRect(0, 0, W, H);
    s.bricks.forEach((b) => { if (!b.alive) return; ctx.fillStyle = b.color; ctx.fillRect(b.c * BRICK_W + 1, BRICK_TOP + b.r * BRICK_H + 1, BRICK_W - 2, BRICK_H - 2); });
    ctx.fillStyle = "#4dd2ff"; ctx.fillRect(s.px - PADDLE_W / 2, H - 18, PADDLE_W, PADDLE_H);
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(s.bx, s.by, BALL / 2, 0, 7); ctx.fill();
  }, []);

  const loop = useCallback(() => {
    const s = state.current;
    if (s.running && !s.over && !s.won) {
      s.bx += s.dx; s.by += s.dy;
      if (s.bx < BALL / 2 || s.bx > W - BALL / 2) s.dx = -s.dx;
      if (s.by < BALL / 2) s.dy = -s.dy;
      if (s.by > H - 22 - BALL / 2 && s.by < H - 8 && s.bx > s.px - PADDLE_W / 2 && s.bx < s.px + PADDLE_W / 2) {
        s.dy = -Math.abs(s.dy); const off = (s.bx - s.px) / (PADDLE_W / 2); s.dx = off * 3;
      }
      if (s.by > H) { s.lives--; if (s.lives <= 0) { s.over = true; } else { s.bx = W / 2; s.by = H - 40; s.dx = 2.4 * (Math.random() > 0.5 ? 1 : -1); s.dy = -2.4; } }
      s.bricks.forEach((b) => {
        if (!b.alive) return;
        const bx = b.c * BRICK_W, by = BRICK_TOP + b.r * BRICK_H;
        if (s.bx > bx && s.bx < bx + BRICK_W && s.by > by && s.by < by + BRICK_H) {
          b.alive = false; s.score += 10; s.dy = -s.dy;
        }
      });
      if (s.bricks.every((b) => !b.alive)) s.won = true;
    }
    draw();
    setHud({ score: s.score, lives: s.lives, status: s.over ? "over" : s.won ? "won" : s.running ? "playing" : "ready" });
    raf.current = requestAnimationFrame(loop);
  }, [draw]);

  const raf = useRef(null);
  useEffect(() => {
    raf.current = requestAnimationFrame(loop);
    const onKey = (e) => { const s = state.current; if (e.key === "ArrowLeft") s.px = Math.max(PADDLE_W / 2, s.px - 22); if (e.key === "ArrowRight") s.px = Math.min(W - PADDLE_W / 2, s.px + 22); if (!s.running && !s.over && !s.won) s.running = true; };
    const onMove = (e) => { const rect = canvasRef.current?.getBoundingClientRect(); if (!rect) return; const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left; state.current.px = Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, x * (W / rect.width))); if (!state.current.running && !state.current.over && !state.current.won) state.current.running = true; };
    window.addEventListener("keydown", onKey);
    const c = canvasRef.current; c?.addEventListener("mousemove", onMove); c?.addEventListener("touchmove", onMove, { passive: true });
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("keydown", onKey); c?.removeEventListener("mousemove", onMove); c?.removeEventListener("touchmove", onMove); };
  }, [loop]);

  const reset = () => { state.current = { px: W / 2, bx: W / 2, by: H - 40, dx: 2.4, dy: -2.4, bricks: makeBricks(), lives: 3, score: 0, running: false, over: false, won: false }; setHud({ score: 0, lives: 3, status: "ready" }); };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="flex items-center justify-between w-full max-w-sm mb-3">
        <h2 className="text-lg font-bold font-display flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-cyan-400" /> Breakout</h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex gap-4 text-sm mb-2"><span className="text-cyan-400">Score: {hud.score}</span><span className="text-rose-400">Lives: {"❤".repeat(hud.lives)}</span></div>
      <canvas ref={canvasRef} width={W} height={H} className="rounded-lg border border-white/10 touch-none" />
      <p className="text-xs text-neutral-500 mt-3 text-center">← → keys or move mouse/finger · break every brick.</p>
      {(hud.status === "over" || hud.status === "won") && (
        <div className="mt-3 text-center">
          <p className="font-bold text-lg mb-2">{hud.status === "won" ? "🎉 Cleared!" : "Game Over"}</p>
          <button onClick={reset} className="px-5 py-2 rounded-full bg-cyan-500 text-black font-semibold text-sm">Play again</button>
        </div>
      )}
      {hud.status === "ready" && <p className="mt-3 text-cyan-400 font-semibold animate-pulse">Move to launch the ball</p>}
    </div>
  );
}