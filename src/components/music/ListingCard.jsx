import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Play, Pause, Tag, Music2, BadgeCheck, Loader2 } from "lucide-react";

export default function ListingCard({ listing, isPlaying, isCurrent, onPreview, onBuy }) {
  const [busy, setBusy] = useState(false);

  const preview = async () => {
    setBusy(true);
    try { await onPreview(listing); } finally { setBusy(false); }
  };

  return (
    <article className="group rounded-2xl overflow-hidden border border-white/10 bg-neutral-950/60 hover:border-orange-500/50 transition-colors">
      <div className="relative aspect-square overflow-hidden">
        <img src={listing.artwork} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <button
          onClick={preview}
          className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-orange-500 text-black flex items-center justify-center shadow-lg shadow-orange-500/30 active:scale-95 transition"
          title="Preview"
        >
          {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : isCurrent && isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur text-[10px] font-semibold uppercase tracking-wide text-orange-300 border border-white/10">
          {listing.license_type || "Basic Lease"}
        </span>
        <div className="absolute bottom-3 left-3 right-16">
          <p className="text-sm font-bold leading-tight line-clamp-2">{listing.title}</p>
          <p className="text-[11px] text-neutral-300 truncate">@{listing.seller_handle} {listing.featured && <BadgeCheck className="w-3 h-3 inline text-orange-400" />}</p>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 flex-wrap">
          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 flex items-center gap-1"><Tag className="w-2.5 h-2.5" />{listing.genre}</span>
          {listing.bpm ? <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">{listing.bpm} BPM</span> : null}
          {listing.musical_key ? <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">{listing.musical_key}</span> : null}
        </div>
        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-lg font-black font-display leading-none">${Number(listing.price || 0).toFixed(2)}</p>
            <p className="text-[10px] text-neutral-500 mt-1 flex items-center gap-2">
              <span>{listing.sold || 0} sold</span>
              <span className="flex items-center gap-0.5"><Music2 className="w-2.5 h-2.5" />{listing.plays || 0}</span>
            </p>
          </div>
          <button onClick={() => onBuy(listing)} className="px-3.5 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-orange-400 transition">
            Buy
          </button>
        </div>
      </div>
    </article>
  );
}