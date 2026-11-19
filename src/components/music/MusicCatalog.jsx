import React, { useEffect, useState } from "react";
import { Play, Pause, Loader2, Disc3, Radio, Headphones } from "lucide-react";

const SHELVES = [
  { key: "top", title: "Top songs right now", term: "top hits" },
  { key: "pop", title: "Pop", term: "pop hits" },
  { key: "hiphop", title: "Hip-hop", term: "hip hop" },
  { key: "rnb", title: "R&B and soul", term: "r&b soul" },
  { key: "afro", title: "Afrobeats", term: "afrobeats" },
  { key: "latin", title: "Latin", term: "latin" },
  { key: "rock", title: "Rock", term: "rock anthems" },
  { key: "electronic", title: "Electronic", term: "electronic dance" },
  { key: "country", title: "Country", term: "country" },
  { key: "chill", title: "Chill and jazz", term: "jazz chill" },
];

const fetchSongs = async (term, limit = 12) => {
  const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=${limit}`);
  const json = await res.json();
  return (json.results || []).filter((r) => r.previewUrl);
};

export default function MusicCatalog({ onPlay, currentKey, playing }) {
  const [shelves, setShelves] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const entries = await Promise.all(
        SHELVES.map(async (s) => [s.key, await fetchSongs(s.term).catch(() => [])])
      );
      if (!alive) return;
      setShelves(Object.fromEntries(entries));
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="pb-8 space-y-6">
      <div className="mx-1 rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/25 via-violet-600/15 to-transparent p-4 sm:p-5">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">
          <Disc3 className="w-4 h-4" /> Full catalog
        </div>
        <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight">Every song, one tap away</h2>
        <p className="mt-1 text-sm text-white/60 max-w-xl">
          Browse the whole music catalog and press play. No links to paste, no account to connect — every track streams instantly here.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-white/60">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15"><Radio className="w-3 h-3 text-emerald-300" /> Instant streaming</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15"><Headphones className="w-3 h-3 text-emerald-300" /> 30-second previews</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-white/50">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading the catalog…
        </div>
      ) : (
        SHELVES.map((s) => {
          const songs = shelves[s.key] || [];
          if (!songs.length) return null;
          return (
            <section key={s.key}>
              <h3 className="px-1 mb-2 text-lg font-bold tracking-tight">{s.title}</h3>
              <div className="flex gap-3 overflow-x-auto thin-scrollbar pb-2 px-1">
                {songs.map((r) => {
                  const isCur = currentKey === `it:${r.trackId}`;
                  return (
                    <button
                      key={r.trackId}
                      onClick={() => onPlay(r)}
                      className="group w-[140px] sm:w-[156px] shrink-0 text-left"
                    >
                      <span className="relative block aspect-square rounded-xl overflow-hidden bg-white/10 border border-white/10">
                        <img src={r.artworkUrl100?.replace("100x100", "300x300")} alt="" className="w-full h-full object-cover" loading="lazy" />
                        <span className={`absolute inset-0 flex items-center justify-center bg-black/45 transition-opacity ${isCur ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                          <span className="w-10 h-10 rounded-full bg-emerald-400 text-black flex items-center justify-center shadow-lg">
                            {isCur && playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </span>
                        </span>
                      </span>
                      <span className="block mt-1.5 text-[13px] font-semibold truncate">{r.trackName}</span>
                      <span className="block text-[11px] text-white/50 truncate">{r.artistName}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}