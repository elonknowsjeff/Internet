import React, { useState, useMemo } from "react";
import { Gamepad2, X, Crosshair, Zap, Grid3x3, Hash, Bird, Circle, Sparkles, Box, Layers } from "lucide-react";
import SnakeGame from "@/components/SnakeGame";
import MemoryGame from "@/components/games/MemoryGame";
import TicTacToe from "@/components/games/TicTacToe";
import ReactionGame from "@/components/games/ReactionGame";
import AIAdventure from "@/components/games/AIAdventure";
import PacMan from "@/components/games/PacMan";
import Breakout from "@/components/games/Breakout";
import Shooter3D from "@/components/games/Shooter3D";
import StreetFighter from "@/components/games/StreetFighter";
import Game2048 from "@/components/games/Game2048";
import FlappyBird from "@/components/games/FlappyBird";
import Pong from "@/components/games/Pong";

// kind: 2d | 3d — drives the category filters and the badge colour.
const GAMES = [
  { key: "shooter", title: "Nebula Strike 3D", desc: "First-person shooter", icon: Crosshair, grad: "from-fuchsia-500 to-violet-700", Comp: Shooter3D, kind: "3d", tag: "3D" },
  { key: "racer3d", title: "Neon Racer 3D", desc: "3D arcade racer", icon: Box, grad: "from-cyan-400 to-blue-600", Comp: Shooter3D, kind: "3d", tag: "3D" },
  { key: "fighter", title: "Street Brawl", desc: "2D arcade fighter", icon: Crosshair, grad: "from-rose-500 to-amber-500", Comp: StreetFighter, kind: "2d", tag: "2D" },
  { key: "pacman", title: "Pac-Man", desc: "Chomp the dots", icon: Gamepad2, grad: "from-amber-400 to-yellow-600", Comp: PacMan, kind: "2d", tag: "2D" },
  { key: "breakout", title: "Breakout", desc: "Break every brick", icon: Zap, grad: "from-cyan-500 to-blue-600", Comp: Breakout, kind: "2d", tag: "2D" },
  { key: "snake", title: "Snake", desc: "Classic arcade", icon: Gamepad2, grad: "from-fuchsia-500 to-purple-600", Comp: SnakeGame, kind: "2d", tag: "2D" },
  { key: "memory", title: "Memory Match", desc: "Find the pairs", icon: Grid3x3, grad: "from-cyan-500 to-blue-600", Comp: MemoryGame, kind: "2d", tag: "2D" },
  { key: "ttt", title: "Tic-Tac-Toe", desc: "Play vs the AI", icon: Grid3x3, grad: "from-emerald-500 to-teal-600", Comp: TicTacToe, kind: "2d", tag: "2D" },
  { key: "reaction", title: "Reaction Test", desc: "How fast are you?", icon: Zap, grad: "from-amber-500 to-orange-600", Comp: ReactionGame, kind: "2d", tag: "Arcade" },
  { key: "2048", title: "2048", desc: "Slide & merge to 2048", icon: Hash, grad: "from-amber-400 to-orange-600", Comp: Game2048, kind: "2d", tag: "Puzzle" },
  { key: "flappy", title: "Flappy", desc: "Tap to fly through gaps", icon: Bird, grad: "from-yellow-400 to-amber-500", Comp: FlappyBird, kind: "2d", tag: "Arcade" },
  { key: "pong", title: "Pong", desc: "Beat the AI paddle", icon: Circle, grad: "from-cyan-400 to-blue-600", Comp: Pong, kind: "2d", tag: "Arcade" },
  { key: "ai", title: "AI Adventure", desc: "Generate a story game", icon: Sparkles, grad: "from-cyan-400 to-fuchsia-500", Comp: AIAdventure, kind: "2d", tag: "AI" },
];

const FILTERS = [
  { key: "all", label: "All", icon: Layers },
  { key: "3d", label: "3D Games", icon: Box },
  { key: "2d", label: "2D Games", icon: Grid3x3 },
];

export default function ArcadeHub() {
  const [active, setActive] = useState(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const Comp = GAMES.find((g) => g.key === active)?.Comp;

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GAMES.filter((g) => (filter === "all" || g.kind === filter) && (!q || g.title.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q)));
  }, [filter, query]);

  const featured = GAMES.find((g) => g.key === "shooter");

  if (Comp) {
    const g = GAMES.find((x) => x.key === active);
    return (
      <div className="pb-28">
        <div className="flex items-center gap-2 px-1 pt-3 pb-2">
          <button onClick={() => setActive(null)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
          <h1 className="text-[18px] font-extrabold tracking-tight">{g.title}</h1>
          <span className="ml-auto rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-black" style={{ background: "var(--brand)" }}>{g.tag}</span>
        </div>
        <Comp onClose={() => setActive(null)} />
      </div>
    );
  }

  return (
    <div className="pb-28">
      {/* Hero */}
      <section className="relative mt-3 overflow-hidden rounded-[22px] border border-white/[0.08]">
        <div className={`absolute inset-0 bg-gradient-to-br ${featured.grad} opacity-40`} />
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(0,0,0,0.55),transparent_60%)]" />
        <div className="relative flex flex-col justify-end p-5 sm:p-7 min-h-[150px] sm:min-h-[190px]">
          <span className="w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black" style={{ background: "var(--brand)" }}>
            <Sparkles className="mr-1 inline h-3 w-3" /> Featured 3D
          </span>
          <h1 className="mt-2 font-display text-[26px] font-extrabold leading-tight sm:text-[34px]">Nebula Strike 3D</h1>
          <p className="mt-1 max-w-sm text-[12.5px] text-white/70">A fast first-person shooter that runs right in your browser. No download, no install.</p>
          <button
            onClick={() => setActive("shooter")}
            className="mt-3 w-fit rounded-full px-5 py-2.5 text-[13px] font-bold text-black"
            style={{ background: "var(--brand)" }}
          >
            Play now
          </button>
        </div>
      </section>

      {/* Controls */}
      <div className="sticky top-14 z-20 mt-3 flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-[var(--bg-base)]/80 px-2.5 py-2 backdrop-blur-xl">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
          <Gamepad2 className="h-4 w-4 shrink-0 text-white/40" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search games…" className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder-white/40" />
          {query && <button onClick={() => setQuery("")}><X className="h-4 w-4 text-white/40" /></button>}
        </div>
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {FILTERS.map((f) => {
            const on = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors ${on ? "text-black" : "border border-white/10 text-white/60 hover:text-white"}`}
                style={on ? { background: "var(--brand)" } : undefined}
              >
                <f.icon className="h-3.5 w-3.5" /> {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {list.map((g) => (
          <button
            key={g.key}
            onClick={() => setActive(g.key)}
            className="group flex flex-col overflow-hidden rounded-[18px] border border-white/[0.08] bg-white/[0.03] text-left transition-all hover:-translate-y-0.5 hover:border-white/20"
          >
            <div className={`relative grid h-24 place-items-center bg-gradient-to-br ${g.grad} sm:h-28`}>
              <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
              <g.icon className="relative h-9 w-9 text-white drop-shadow" />
              <span className="absolute right-2 top-2 rounded-full bg-black/45 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white/90 backdrop-blur">{g.tag}</span>
            </div>
            <div className="p-2.5">
              <p className="truncate text-[13.5px] font-bold leading-tight">{g.title}</p>
              <p className="mt-0.5 truncate text-[11.5px] text-white/55">{g.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {!list.length && (
        <div className="mt-10 rounded-2xl border border-dashed border-white/14 p-10 text-center text-[13px] text-white/45">
          No games match "{query}".
        </div>
      )}
    </div>
  );
}