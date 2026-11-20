import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Gamepad2 } from "lucide-react";

const W = 440, H = 260, PADDLE_H = 56, PADDLE_W = 8, BALL = 7, P_X = 12, A_X = W - 20;

export default function Pong({ onClose }) {
  const canvasRef = useRef(null);
  const raf = useRef(null);
  const state = useRef({ py: H / 2, ay: H / 2, bx: W / 2, by: H / 2, dx: 3, dy: 2, p: 0, a: 0 });
  const [hud, setHud] = useState({ p: 0, a: 0 });

  const serve = (toRight) => {
    const s = state.current;
    s.bx = W / 2; s.by = H / 2;
    s.dx = (toRight ? 1 : -1) * 3.2;
    s.dy = (Math.random() * 2 - 1) * 2.6;
  };

  const loop = useCallback(() => {
    const s = state.current; const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      s.bx += s.dx; s.by += s.dy;
      if (s.by < BALL / 2 || s.by > H - BALL / 2) s.dy = -s.dy;
      if (s.bx - BALL / 2 < P_X + PADDLE_W && s.by > s.py - PADDLE_H / 2 && s.by < s.py + PADDLE_H / 2) {
        s.dx = Math.abs(s.dx); s.dy = ((s.by - s.py) / (PADDLE_H / 2)) * 3.6;
      }
      if (s.bx + BALL / 2 > A_X && s.by > s.ay - PADDLE_H / 2 && s.by < s.ay + PADDLE_H / 2) {
        s.dx = -Math.abs(s.dx); s.dy = ((s.by - s.ay) / (PADDLE_H / 2)) * 3.2;
      }
      s.ay += Math.max(-3.4, Math.min(3.4, (s.by - s.ay) * 0.11));
      s.ay = Math.max(PADDLE_H / 2, Math.min(H - PADDLE_H / 2, s.ay));
      if (s.bx < 0) { s.a++; serve(false); setHud({ p: s.p, a: s.a }); }
      if (s.bx > W) { s.p++; serve(true); setHud({ p: s.p, a: s.a }); }

      ctx.fillStyle = "#05050f"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.setLineDash([6, 8]);
      ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#4dd2ff"; ctx.fillRect(P_X, s.py - PADDLE_H / 2, PADDLE_W, PADDLE_H);
      ctx.fillStyle = "#f472b6"; ctx.fillRect(A_X, s.ay - PADDLE_H / 2, PADDLE_W, PADDLE_H);
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(s.bx, s.by, BALL / 2, 0, 7); ctx.fill();
    }
    raf.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    raf.current = requestAnimationFrame(loop);
    const onKey = (e) => {
      const s = state.current;
      if (e.key === "ArrowUp" || e.key === "w") s.py = Math.max(PADDLE_H / 2, s.py - 24);
      if (e.key === "ArrowDown" || e.key === "s") s.py = Math.min(H - PADDLE_H / 2, s.py + 24);
    };
    const onMove = (e) => {
      const rect = canvasRef.current?.getBoundingClientRect(); if (!rect) return;
      const y = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;
      state.current.py = Math.max(PADDLE_H / 2, Math.min(H - PADDLE_H / 2, y * (H / rect.height)));
    };
    window.addEventListener("keydown", onKey);
    const c = canvasRef.current;
    c?.addEventListener("mousemove", onMove); c?.addEventListener("touchmove", onMove, { passive: true });
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("keydown", onKey); c?.removeEventListener("mousemove", onMove); c?.removeEventListener("touchmove", onMove); };
  }, [loop]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="flex items-center justify-between w-full max-w-md mb-3">
        <h2 className="text-lg font-bold font-display flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-cyan-400" /> Pong</h2>
        <span className="font-mono text-lg"><span className="text-cyan-400">{hud.p}</span><span className="text-white/30 mx-2">:</span><span className="text-pink-400">{hud.a}</span></span>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 grid place-items-center"><X className="w-4 h-4" /></button>
      </div>
      <canvas ref={canvasRef} width={W} height={H} className="rounded-lg border border-white/10 touch-none" />
      <p className="text-xs text-neutral-500 mt-3 text-center">↑ / ↓ or move the mouse · you are blue, the AI is pink.</p>
    </div>
  );
}