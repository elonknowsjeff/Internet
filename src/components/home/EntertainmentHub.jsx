import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Music2, Film, Gamepad2, Tv, Sparkles, Loader2 } from "lucide-react";

const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);

const KIND = {
  music: { label: "Music", icon: Music2, to: "/music", color: "#a855f7" },
  movie: { label: "Movie", icon: Film, to: "/movies", color: "#f43f5e" },
  tv: { label: "TV", icon: Tv, to: "/cable", color: "#22d3ee" },
  game: { label: "Game", icon: Gamepad2, to: "/?cat=gaming", color: "#34d399" },
};

export default function EntertainmentHub() {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [movies, setMovies] = useState([]);
  const [games, setGames] = useState([]);
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [t, m, g, s] = await Promise.all([
          base44.entities.Track.list("-plays", 30).catch(() => []),
          base44.entities.Movie.list("-created_date", 30).catch(() => []),
          base44.entities.Game.list("-plays", 30).catch(() => []),
          base44.entities.LiveStream.list("-viewers", 30).catch(() => []),
        ]);
        setTracks(asItems(t));
        setMovies(asItems(m));
        setGames(asItems(g));
        setStreams(asItems(s));
      } catch {}
      setLoading(false);
    })();
  }, []);

  const items = useMemo(() => {
    const make = (kind, arr, map) => arr.map((x) => ({ kind, ...map(x) }));
    const lists = [
      make("music", tracks, (t) => ({ id: t.id, title: t.title, sub: t.artist_name, img: t.artwork })),
      make("movie", movies, (m) => ({ id: m.id, title: m.title, sub: m.genre, img: m.poster })),
      make("tv", streams, (s) => ({ id: s.id, title: s.title, sub: s.host_name, img: s.thumbnail })),
      make("game", games, (g) => ({ id: g.id, title: g.title, sub: g.genre, img: g.cover })),
    ];
    const merged = [];
    const max = Math.max(...lists.map((l) => l.length));
    for (let i = 0; i < max; i++) lists.forEach((l) => { if (l[i]) merged.push(l[i]); });
    return merged;
  }, [tracks, movies, games, streams]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-white/50" /></div>;

  return (
    <div className="pb-28 px-3 sm:px-4 pt-4">
      <button
        onClick={() => navigate("/assistant")}
        className="group relative mb-4 flex w-full items-center gap-3 overflow-hidden rounded-3xl ig-grad p-4 text-white"
        style={{ boxShadow: "0 10px 30px -12px var(--accent)" }}
      >
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20"><Sparkles className="h-6 w-6" /></span>
        <span className="flex-1 text-left">
          <span className="block text-[16px] font-bold">Internet X AI</span>
          <span className="block text-[12px] text-white/80">Chat, search & create images</span>
        </span>
        <span className="rounded-full bg-white/25 px-3 py-1 text-[11px] font-bold uppercase">Open</span>
      </button>

      <h2 className="mb-3 flex items-center gap-2 text-[15px] font-bold">
        <span className="h-5 w-1.5 rounded-full brand-grad" /> Entertainment — all in one
      </h2>

      {items.length === 0 ? (
        <div className="py-20 text-center text-sm ig-muted">No entertainment yet — add music, movies, games or go live.</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((it) => {
            const k = KIND[it.kind];
            const Icon = k.icon;
            return (
              <button
                key={it.kind + it.id}
                onClick={() => navigate(k.to)}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left transition-transform active:scale-[0.98]"
              >
                <div className="relative aspect-square overflow-hidden bg-black/30">
                  {it.img ? (
                    <img src={it.img} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="grid h-full w-full place-items-center"><Icon className="h-7 w-7 text-white/30" /></div>
                  )}
                  <span
                    className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide backdrop-blur"
                    style={{ color: k.color }}
                  >
                    <Icon className="h-3 w-3" /> {k.label}
                  </span>
                </div>
                <div className="p-2.5">
                  <p className="line-clamp-1 text-[13px] font-semibold">{it.title}</p>
                  <p className="line-clamp-1 text-[11px] ig-muted">{it.sub}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}