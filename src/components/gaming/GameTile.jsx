import React from "react";
import { Star, Check, Play } from "lucide-react";
import { priceOf } from "./gameData";

export default function GameTile({ game, owned, onOpen, onAdd, compact }) {
  const { now, base, off } = priceOf(game);
  return (
    <div className={`group relative rounded-lg overflow-hidden bg-[#1b2838] border border-black/40 hover:border-[#66c0f4]/70 transition-colors ${compact ? "" : "w-full"}`}>
      <button onClick={() => onOpen(game)} className="block w-full text-left">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#16202d]">
          <img src={game.cover} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-90" />
          {game.ai_generated && (
            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-black text-[9px] font-black uppercase tracking-wide">AI Game</span>
          )}
          {off > 0 && (
            <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-[#4c6b22] text-[#beee11] text-[10px] font-bold">-{off}%</span>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-1.5">
            <p className="text-xs font-semibold leading-tight truncate">{game.title}</p>
            <p className="text-[10px] text-[#8f98a0] truncate">{game.genre} · {game.perspective}</p>
          </div>
        </div>
      </button>
      <div className="px-1.5 py-1.5 flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 text-[10px] text-[#8f98a0]">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          {Number(game.rating || 0).toFixed(1)}
        </div>
        {owned ? (
          <button onClick={() => onOpen(game)} className="flex items-center gap-1 px-2 py-1 rounded bg-[#2a475e] text-[#66c0f4] text-[10px] font-bold hover:bg-[#31576f]"><Play className="w-3 h-3" /> Owned</button>
        ) : now === 0 ? (
          <button onClick={() => onAdd(game)} className="flex items-center gap-1 px-2 py-1 rounded bg-[#4c6b22] text-[#beee11] text-[10px] font-bold hover:bg-[#5a7d29]"><Check className="w-3 h-3" /> Free</button>
        ) : (
          <div className="flex items-center gap-1.5">
            {off > 0 && <span className="text-[10px] text-[#738895] line-through">${base.toFixed(2)}</span>}
            <button onClick={() => onAdd(game)} className="px-2 py-1 rounded bg-[#4c6b22] text-[#beee11] text-[10px] font-bold hover:bg-[#5a7d29]">${now.toFixed(2)}</button>
          </div>
        )}
      </div>
    </div>
  );
}