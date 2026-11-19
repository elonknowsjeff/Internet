import React from "react";
import { Star, Bike } from "lucide-react";

export function StoreRow({ store, onOpen }) {
  return (
    <button onClick={() => onOpen(store)} className="flex items-center gap-3 w-full text-left px-1 py-2.5 border-b border-white/10 last:border-0 hover:bg-white/5 rounded-lg">
      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-white/10">
        <img src={store.image} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="font-semibold truncate flex-1">{store.name}</p>
          <span className="flex items-center gap-1 text-xs text-white/70 shrink-0"><Star className="w-3 h-3 fill-amber-300 text-amber-300" />{store.rating}</span>
        </div>
        <p className="text-[11px] text-white/50 truncate">{store.cuisine}</p>
        <p className="text-[11px] text-white/60 mt-0.5 flex items-center gap-1.5">
          <Bike className="w-3.5 h-3.5 text-emerald-300" />
          {store.eta} · ${store.fee.toFixed(2)} delivery
        </p>
      </div>
    </button>
  );
}

export function FeaturedStore({ store, onOpen }) {
  return (
    <button onClick={() => onOpen(store)} className="group relative rounded-2xl overflow-hidden text-left border border-white/10 bg-white/5">
      <div className="aspect-[16/10] bg-white/10 overflow-hidden">
        <img src={store.image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur text-[10px] font-semibold text-emerald-300">${store.fee.toFixed(2)} delivery</span>
      <div className="p-3">
        <p className="font-semibold truncate">{store.name}</p>
        <p className="text-[11px] text-white/50 truncate">{store.cuisine}</p>
        <p className="text-[11px] text-white/70 mt-1 flex items-center gap-1"><Star className="w-3 h-3 fill-amber-300 text-amber-300" />{store.rating} · {store.eta}</p>
      </div>
    </button>
  );
}