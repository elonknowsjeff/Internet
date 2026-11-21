import React from "react";
import { useNavigate } from "react-router-dom";
import { Gamepad2 } from "lucide-react";

const FEATURED = ["Snake", "2048", "Flappy", "Pong", "Breakout", "Pac-Man", "Memory", "Tic-Tac-Toe", "Street Fighter", "Reaction", "Shooter 3D", "AI Adventure"];

export default function GamingPanel() {
  const navigate = useNavigate();
  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 py-4">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-indigo-500/10 p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-cyan-400/25 blur-3xl" />
        <div className="relative mb-5 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-[0_12px_30px_-12px_cyan-500]">
            <Gamepad2 className="w-6 h-6" />
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="text-[18px] font-extrabold tracking-tight">Arcade</h3>
            <p className="mt-0.5 text-[13px] text-white/55">Jump into the arcade — retro classics, puzzles and AI adventures.</p>
          </div>
          <button onClick={() => navigate("/?cat=gaming")} className="rounded-full neon-btn px-5 py-2.5 text-[13px] font-bold">
            Open arcade
          </button>
        </div>
        <div className="relative flex flex-wrap gap-2">
          {FEATURED.map((g) => (
            <button key={g} onClick={() => navigate("/?cat=gaming")} className="rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-[12px] font-medium text-white/80 transition-colors hover:bg-white/[0.12]">
              {g}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}