import React from "react";
import { Star, Clock, Bike } from "lucide-react";

export default function StoreCard({ store, onOpen }) {
  const label = store.category === "grocery" ? "Grocery" : store.category === "animals" ? "Animals" : "Restaurant";
  return (
    <button
      onClick={() => onOpen(store)}
      className="group w-full text-left rounded-2xl overflow-hidden bg-white/[.05] border border-white/10 hover:border-white/30 transition-colors"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={store.image}
          alt={store.name}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
        />
        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-[10px] font-semibold uppercase tracking-wide text-white">{label}</span>
        {store.logo && (
          <span className="absolute bottom-2.5 left-2.5 w-8 h-8 rounded-lg bg-white overflow-hidden flex items-center justify-center shadow-lg">
            <img src={store.logo} alt="" className="w-5 h-5 object-contain" />
          </span>
        )}
      </div>
      <div className="px-3 pt-2.5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold leading-tight truncate">{store.name}</p>
          <span className="shrink-0 flex items-center gap-1 text-xs text-amber-300">
            <Star className="w-3 h-3 fill-amber-300 text-amber-300" /> {store.rating}
          </span>
        </div>
        <p className="text-xs text-white/55 truncate mt-0.5">{store.cuisine}</p>
        <div className="flex items-center gap-3 mt-2 text-[11px] text-white/60">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {store.eta}</span>
          <span className="flex items-center gap-1"><Bike className="w-3 h-3" /> ${store.fee.toFixed(2)}</span>
          <span className="ml-auto text-white font-semibold group-hover:text-fuchsia-200">Order →</span>
        </div>
      </div>
    </button>
  );
}