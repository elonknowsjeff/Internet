import React from "react";
import { X, Star, ShoppingCart, Play, Cpu } from "lucide-react";
import { priceOf } from "./gameData";

export default function GameDetail({ game, owned, onClose, onAdd, onPlay }) {
  const { now, base, off } = priceOf(game);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-[#1b2838] border border-white/15">
        <div className="relative h-52 sm:h-64 overflow-hidden">
          <img src={game.cover} alt={game.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1b2838] via-[#1b2838]/40 to-transparent" />
          <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black flex items-center justify-center"><X className="w-4 h-4" /></button>
          <div className="absolute bottom-3 left-4 right-4">
            <h2 className="text-2xl sm:text-3xl font-black leading-none">{game.title}</h2>
            <p className="text-xs text-[#8f98a0] mt-1">{game.developer} · {game.genre} · {game.dimension} {game.perspective}</p>
          </div>
        </div>
        <div className="p-4 grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-3">
            {game.ai_generated && (
              <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-black bg-gradient-to-r from-fuchsia-400 to-cyan-300 px-2 py-1 rounded"><Cpu className="w-3.5 h-3.5" /> AI generated game</p>
            )}
            <p className="text-sm text-[#c6d4df] leading-relaxed">{game.description || "No description yet."}</p>
            <div className="flex flex-wrap gap-1.5">
              {(game.tags || "").split(",").filter(Boolean).map((t) => (
                <span key={t} className="px-2 py-0.5 rounded bg-white/10 text-[11px] text-[#c6d4df]">{t.trim()}</span>
              ))}
            </div>
            <div className="flex items-center gap-4 text-xs text-[#8f98a0]">
              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {Number(game.rating || 0).toFixed(1)}</span>
              <span>{(game.plays || 0).toLocaleString()} plays</span>
              <span>{Number(game.hours_played || 0).toLocaleString()}h played worldwide</span>
            </div>
          </div>
          <div className="rounded-lg bg-black/30 border border-white/10 p-3 h-fit">
            {owned ? (
              <>
                <p className="text-xs text-[#8f98a0] mb-2">In your library</p>
                <button onClick={() => onPlay(game)} className="w-full py-2.5 rounded bg-[#4c6b22] text-[#beee11] font-bold text-sm flex items-center justify-center gap-1.5"><Play className="w-4 h-4" /> Play now</button>
              </>
            ) : (
              <>
                <div className="flex items-end gap-2 mb-2">
                  {off > 0 && <span className="px-1.5 py-0.5 rounded bg-[#4c6b22] text-[#beee11] text-[10px] font-bold">-{off}%</span>}
                  {off > 0 && <span className="text-xs text-[#738895] line-through">${base.toFixed(2)}</span>}
                  <span className="text-lg font-bold text-white">{now === 0 ? "Free" : `$${now.toFixed(2)}`}</span>
                </div>
                <button onClick={() => onAdd(game)} className="w-full py-2.5 rounded bg-[#4c6b22] text-[#beee11] font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-[#5a7d29]"><ShoppingCart className="w-4 h-4" /> {now === 0 ? "Add to library" : "Add to cart"}</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}