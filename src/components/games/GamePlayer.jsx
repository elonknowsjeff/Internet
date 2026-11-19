import React, { useEffect } from "react";
import { X, Gamepad2 } from "lucide-react";
import SnakeGame from "@/components/SnakeGame";
import MemoryGame from "@/components/games/MemoryGame";
import TicTacToe from "@/components/games/TicTacToe";
import AIAdventure from "@/components/games/AIAdventure";
import PacMan from "@/components/games/PacMan";
import Breakout from "@/components/games/Breakout";
import Shooter3D from "@/components/games/Shooter3D";
import Racer3D from "@/components/games/Racer3D";

const RECENT_KEY = "walza_recent_games";
const HOURS_KEY = "walza_game_hours";

// Every game in the store resolves to a real, playable engine.
export function engineFor(game = {}) {
  const text = `${game.title || ""} ${game.genre || ""} ${game.tags || ""}`.toLowerCase();
  if (/shooter|fps|tactical|sniper|protocol|wolf|strike/.test(text)) return { label: "3D shooter", Comp: Shooter3D };
  if (/rac|drift|speed|kart/.test(text)) return { label: "3D racer", Comp: Racer3D };
  if (/puzzle|zen|match|card|garden/.test(text)) return { label: "2D puzzle", Comp: MemoryGame };
  if (/strategy|conquest|empire|tactics|galaxy/.test(text)) return { label: "2D strategy", Comp: TicTacToe };
  if (/adventure|rpg|dungeon|quest|vale|wing|mystic|embers/.test(text)) return { label: "2D adventure", Comp: PacMan };
  if (/action|brawl|fight|sport|goal|football|racing/.test(text)) return { label: "2D arcade action", Comp: Breakout };
  if (game.ai_generated) return { label: "AI story mode", Comp: AIAdventure };
  if (game.dimension === "3D") return { label: "3D shooter", Comp: Shooter3D };
  return { label: "2D arcade", Comp: SnakeGame };
}

export default function GamePlayer({ game, onClose }) {
  const { label, Comp } = engineFor(game);

  useEffect(() => {
    const start = Date.now();
    try {
      const recent = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]").filter((g) => g.id !== game.id);
      localStorage.setItem(RECENT_KEY, JSON.stringify([{ id: game.id, title: game.title, cover: game.cover }, ...recent].slice(0, 12)));
    } catch (e) {}
    return () => {
      try {
        const hours = JSON.parse(localStorage.getItem(HOURS_KEY) || "{}");
        const played = Math.max(1, Math.round((Date.now() - start) / 60000)) / 60;
        hours[game.id] = Number(((hours[game.id] || 0) + played).toFixed(3));
        localStorage.setItem(HOURS_KEY, JSON.stringify(hours));
      } catch (e) {}
    };
  }, [game.id, game.title, game.cover]);

  return (
    <div className="fixed inset-0 z-[70] bg-black/92 backdrop-blur-md flex items-center justify-center p-2 sm:p-5">
      <div className="w-full max-w-5xl">
        <div className="flex items-center gap-2 px-1 pb-2">
          <Gamepad2 className="w-4 h-4 text-[#66c0f4] shrink-0" />
          <p className="text-sm font-semibold truncate">{game.title}</p>
          <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-white/60">{label}</span>
          <button onClick={onClose} className="ml-auto w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center" title="Close game">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="rounded-2xl overflow-hidden border border-white/15 bg-neutral-950 max-h-[86vh] overflow-y-auto">
          <Comp onClose={onClose} />
        </div>
      </div>
    </div>
  );
}