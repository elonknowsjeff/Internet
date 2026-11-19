import React, { useState } from "react";
import { X, Gamepad2, Grid3x3, Zap, Sparkles, Crosshair } from "lucide-react";
import SnakeGame from "@/components/SnakeGame";
import MemoryGame from "@/components/games/MemoryGame";
import TicTacToe from "@/components/games/TicTacToe";
import ReactionGame from "@/components/games/ReactionGame";
import AIAdventure from "@/components/games/AIAdventure";
import PacMan from "@/components/games/PacMan";
import Breakout from "@/components/games/Breakout";
import Shooter3D from "@/components/games/Shooter3D";

const GAMES = [
  { key: "shooter", title: "Nebula Strike 3D", desc: "3D first-person shooter", icon: Crosshair, color: "from-fuchsia-500 to-violet-700", Comp: Shooter3D, tag: "3D" },
  { key: "pacman", title: "Pac-Man", desc: "Chomp the dots", icon: Gamepad2, color: "from-amber-400 to-yellow-600", Comp: PacMan, tag: "2D" },
  { key: "breakout", title: "Breakout", desc: "Break every brick", icon: Zap, color: "from-cyan-500 to-blue-600", Comp: Breakout, tag: "2D" },
  { key: "snake", title: "Snake", desc: "Classic arcade", icon: Gamepad2, color: "from-fuchsia-500 to-purple-600", Comp: SnakeGame, tag: "2D" },
  { key: "memory", title: "Memory Match", desc: "Find the pairs", icon: Grid3x3, color: "from-cyan-500 to-blue-600", Comp: MemoryGame, tag: "2D" },
  { key: "ttt", title: "Tic-Tac-Toe", desc: "Play vs the AI", icon: Grid3x3, color: "from-emerald-500 to-teal-600", Comp: TicTacToe, tag: "2D" },
  { key: "reaction", title: "Reaction Test", desc: "How fast are you?", icon: Zap, color: "from-amber-500 to-orange-600", Comp: ReactionGame, tag: "Arcade" },
  { key: "ai", title: "AI Adventure", desc: "Generate a story game", icon: Sparkles, color: "from-cyan-400 to-fuchsia-500", Comp: AIAdventure, tag: "AI" },
];

export default function GameArcade({ onClose }) {
  const [active, setActive] = useState(null);
  const Comp = GAMES.find((g) => g.key === active)?.Comp;
  if (Comp) return <Comp onClose={() => setActive(null)} />;
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-neutral-950 border border-white/10 rounded-2xl p-5 w-full max-w-3xl max-h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold font-display flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-fuchsia-400" /> Arcade</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Every game runs right here in your browser.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {GAMES.map((g) => (
            <button key={g.key} onClick={() => setActive(g.key)} className="rounded-2xl border border-white/10 p-4 text-left hover:border-fuchsia-400 transition-colors relative">
              <span className="absolute top-2.5 right-2.5 text-[9px] font-bold uppercase tracking-wider text-white/50">{g.tag}</span>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${g.color} flex items-center justify-center mb-2`}><g.icon className="w-5 h-5 text-white" /></div>
              <p className="font-semibold text-sm">{g.title}</p>
              <p className="text-xs text-neutral-400">{g.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}