import React from "react";
import { Radio, Users, Plus } from "lucide-react";

export default function LiveSection({ streams, onOpen, onGoLive }) {
  const live = streams.filter((s) => s.is_live !== false);

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-bold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 animate-glow-pulse" /> Live now</h2>
        <span className="text-[11px] text-neutral-500">{live.length} streaming</span>
        <button onClick={onGoLive} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-xs font-semibold">
          <Plus className="w-3.5 h-3.5" /> Go live
        </button>
      </div>

      {live.length === 0 ? (
        <div className="py-16 flex flex-col items-center text-center">
          <span className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mb-3"><Radio className="w-6 h-6 text-red-400" /></span>
          <h3 className="font-bold">Nobody is live yet</h3>
          <p className="text-sm text-neutral-400 mt-1 max-w-xs">Start a stream and your channel goes live on Valo instantly.</p>
          <button onClick={onGoLive} className="mt-4 px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-sm font-semibold">Start streaming</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-6">
          {live.map((s) => (
            <button key={s.id} onClick={() => onOpen(s)} className="text-left group">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-900">
                {s.thumbnail || s.stream_id ? (
                  <img src={s.thumbnail || `https://img.youtube.com/vi/${s.stream_id}/hqdefault.jpg`} alt={s.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-700/50 to-fuchsia-800/40" />
                )}
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-red-600 text-[10px] font-bold tracking-wide">LIVE</span>
                <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/85 text-[10px] flex items-center gap-1">
                  <Users className="w-3 h-3" /> {s.viewers >= 1000 ? `${(s.viewers / 1000).toFixed(1)}K` : s.viewers || 0}
                </span>
              </div>
              <div className="flex gap-2.5 mt-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-fuchsia-600 flex items-center justify-center text-xs font-bold overflow-hidden shrink-0">
                  {s.host_avatar ? <img src={s.host_avatar} alt="" className="w-full h-full object-cover" /> : (s.host_name || "H")[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-snug line-clamp-2">{s.title}</p>
                  <p className="text-xs text-neutral-400 mt-0.5 truncate">{s.host_name}</p>
                  <p className="text-xs text-red-400">{s.category || "Live"}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}