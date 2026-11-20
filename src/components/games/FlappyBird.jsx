import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Gamepad2 } from "lucide-react";

const W = 300, H = 420, GRAV = 0.42, FLAP = -7, GAP = 120, PIPE_W = 54, SPEED = 2.1, BIRD_X = 78;

export default function FlappyBird({ onClose }) {
  const canvasRef = useRef(null);
  const raf = useRef(null);
  const state = useRef({ y: H / 2, v: 0, pipes: [], frame: 0, score: 0, running: false, over: false });
  const [hud, setHud] = useState({ score: 0, running: false, over: false });

  const reset = useCallback(() => {
    state.current = { y: H / 2, v: 0, pipes: [], frame: 0, score: 0, running: false, over: false };
    setHud({ score: 0, running: false, over: false });
  }, []);

  const flap = useCallback(() => {
    const s = state.current;
    if (s.over) { reset(); return; }
    s.v = FLAP; s.running = true;
  }, [reset]);

  const loop = useCallback(() => {
    const s = state.current; const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      if (s.running && !s.over) {
        s.v += GRAV; s.y += s.v;
        s.frame++;
        if (s.frame % 95 === 0) {
          const top = 40 + Math.random() * (H - GAP - 80);
          s.pipes.push({ x: W, top, scored: false });
        }
        s.pipes.forEach((p) => (p.x -= SPEED));
        s.pipes = s.pipes.filter((p) => p.x > -PIPE_W);
        if (s.y < 0 || s.y > H) s.over = true;
        for (const p of s.pipes) {
          if (BIRD_X + 12 > p.x && BIRD_X - 12 < p.x + PIPE_W) {
            if (s.y - 12 < p.top || s.y + 12 > p.top + GAP) s.over = true;
          }
          if (!p.scored && p.x + PIPE_W < BIRD_X - 12) { p.scored = true; s.score++; }
        }
      }
      ctx.fillStyle = "#0a1024"; ctx.fillRect(0, 0, W, H);
      s.pipes.forEach((p) => {
        ctx.fillStyle = "#4dd2ff";
        ctx.fillRect(p.x, 0, PIPE_W, p.top);
        ctx.fillRect(p.x, p.top + GAP, PIPE_W, H - p.top - GAP);
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.fillRect(p.x, 0, 3, p.top);
        ctx.fillRect(p.x, p.top + GAP, 3, H - p.top - GAP);
      });
      ctx.fillStyle = "#fde047"; ctx.beginPath(); ctx.arc(BIRD_X, s.y, 12, 0, 7); ctx.fill();
      ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(BIRD_X + 6, s.y - 3, 2.5, 0, 7); ctx.fill();
      ctx.fillStyle = "#f97316"; ctx.beginPath(); ctx.moveTo(BIRD_X + 12, s.y - 2); ctx.lineTo(BIRD_X + 20, s.y); ctx.lineTo(BIRD_X + 12, s.y + 2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "bold 28px ui-sans-serif, system-ui"; ctx.textAlign = "center";
      ctx.fillText(String(s.score), W / 2, 44);
      setHud({ score: s.score, running: s.running, over: s.over });
    }
    raf.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    raf.current = requestAnimationFrame(loop);
    const onKey = (e) => { if (e.code === "Space" || e.key === " ") { e.preventDefault(); flap(); } };
    window.addEventListener("keydown", onKey);
    const c = canvasRef.current;
    const tap = (e) => { e.preventDefault(); flap(); };
    c?.addEventListener("mousedown", tap); c?.addEventListener("touchstart", tap, { passive: false });
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("keydown", onKey); c?.removeEventListener("mousedown", tap); c?.removeEventListener("touchstart", tap); };
  }, [loop, flap]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="flex items-center justify-between w-full max-w-sm mb-3">
        <h2 className="text-lg font-bold font-display flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-yellow-400" /> Flappy</h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 grid place-items-center"><X className="w-4 h-4" /></button>
      </div>
      <canvas ref={canvasRef} width={W} height={H} className="rounded-xl border border-white/10 touch-none cursor-pointer" />
      <p className="text-xs text-neutral-500 mt-3 text-center">Tap / click / space to flap through the gaps.</p>
      {hud.over && <button onClick={reset} className="mt-3 px-5 py-2 rounded-full bg-yellow-400 text-black font-semibold text-sm">Play again</button>}
      {!hud.running && !hud.over && <p className="mt-3 text-yellow-400 font-semibold animate-pulse">Tap to start</p>}
    </div>
  );
}