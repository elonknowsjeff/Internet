import React, { useState } from "react";
import { Gem, Search, ShoppingCart } from "lucide-react";
import { rarityColor } from "./gameData";

const RARITIES = ["All", "Consumer", "Industrial", "Mil-Spec", "Restricted", "Classified", "Covert", "Contraband"];

export default function SkinsMarket({ items, ownedIds, onBuy }) {
  const [rarity, setRarity] = useState("All");
  const [q, setQ] = useState("");

  const list = items.filter((i) => (rarity === "All" || i.rarity === rarity) &&
    (!q.trim() || `${i.name} ${i.game}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="px-3 sm:px-4 py-4">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <h2 className="font-bold flex items-center gap-2 text-lg"><Gem className="w-4 h-4 text-[#66c0f4]" /> Community market · skins</h2>
        <div className="ml-auto flex items-center gap-2 bg-black/40 border border-white/15 rounded px-2.5 py-1.5">
          <Search className="w-3.5 h-3.5 text-[#8f98a0]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search skins, games…" className="bg-transparent outline-none text-xs w-40 sm:w-56" />
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {RARITIES.map((r) => (
          <button key={r} onClick={() => setRarity(r)} className={`px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap border ${rarity === r ? "bg-[#66c0f4] text-black border-[#66c0f4]" : "border-white/15 text-[#8f98a0] hover:text-white"}`}>{r}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
        {list.map((it) => {
          const owned = ownedIds.has(it.id);
          return (
            <div key={it.id} className={`rounded-lg bg-gradient-to-b from-[#202f3f] to-[#16202d] border p-2 ${rarityColor[it.rarity] || "border-white/15"}`}>
              <div className="aspect-[4/3] rounded overflow-hidden bg-black/40 mb-2">
                <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
              </div>
              <p className="text-[10px] uppercase tracking-wide font-bold opacity-80">{it.rarity}</p>
              <p className="text-xs font-semibold leading-tight line-clamp-2 text-white">{it.name}</p>
              <p className="text-[10px] text-[#8f98a0] truncate">{it.game} · {it.wear}</p>
              {it.stattrak && <p className="text-[9px] font-bold text-orange-300">★ StatTrak™</p>}
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs font-bold text-[#beee11]">${Number(it.price).toFixed(2)}</span>
                <button
                  disabled={owned}
                  onClick={() => onBuy(it)}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-[#4c6b22] text-[#beee11] text-[10px] font-bold disabled:opacity-50"
                >
                  <ShoppingCart className="w-3 h-3" /> {owned ? "Owned" : "Buy"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {list.length === 0 && <p className="text-center text-sm text-[#8f98a0] py-10">No skins match that filter.</p>}
    </div>
  );
}