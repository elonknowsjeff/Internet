import React from "react";
import { Play, Pause, Loader2, TrendingUp } from "lucide-react";

export default function ChartsPanel({ tracks, currentKey, playing, onPlay, billboard, bbLoading, onPlayBillboard }) {
  const ranked = [...tracks].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 20);

  return (
    <div className="space-y-6 p-3">
      <section>
        <div className="flex items-end justify-between mb-2">
          <h2 className="text-xl font-bold flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-400" /> Walza charts</h2>
          <span className="text-[11px] text-white/45">Ranked by plays</span>
        </div>
        {ranked.length === 0 ? (
          <p className="text-sm text-white/50 py-4">No plays yet — add music and the charts will fill up.</p>
        ) : (
          <div className="space-y-0.5">
            {ranked.map((t, i) => {
              const isCur = currentKey === `cat:${t.id}`;
              return (
                <button key={t.id} onClick={() => onPlay(t)} className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/10 text-left">
                  <span className="w-5 text-center text-sm text-white/45 tabular-nums">{i + 1}</span>
                  <span className="w-10 h-10 rounded bg-white/10 overflow-hidden shrink-0">
                    {t.artwork ? <img src={t.artwork} alt="" className="w-full h-full object-cover" /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium truncate">{t.title}</span>
                    <span className="block text-xs text-white/50 truncate">{t.artist_name}</span>
                  </span>
                  <span className="text-[11px] text-white/45 tabular-nums">{(t.plays || 0).toLocaleString()} plays</span>
                  <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                    {isCur && playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-end justify-between mb-2">
          <h3 className="text-lg font-bold">Billboard Hot 100</h3>
          <span className="text-[11px] text-white/45">Live chart · tap for a preview</span>
        </div>
        {bbLoading ? (
          <div className="flex items-center gap-2 text-white/50 text-sm py-3"><Loader2 className="w-4 h-4 animate-spin" /> Loading the live chart…</div>
        ) : billboard.length === 0 ? (
          <p className="text-sm text-white/50 py-2">Couldn't load the live chart right now.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-x-4">
            {billboard.map((e) => (
              <button key={e.rank} onClick={() => onPlayBillboard(e)} className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/10 text-left">
                <span className="w-5 text-center text-sm text-white/45 tabular-nums">{e.rank}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium truncate">{e.title}</span>
                  <span className="block text-xs text-white/50 truncate">{e.artist}</span>
                </span>
                <Play className="w-3.5 h-3.5 text-white/60" />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}