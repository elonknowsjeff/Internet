import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Film, Music2, Gamepad2, Play, Loader2, ChevronRight } from "lucide-react";

export default function EntertainmentHub() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [m, t, g] = await Promise.all([
          base44.entities.Movie.list("-created_date", 14).catch(() => []),
          base44.entities.Track.list("-plays", 14).catch(() => []),
          base44.entities.Game.list("-plays", 14).catch(() => []),
        ]);
        setMovies(Array.isArray(m) ? m : m?.items || []);
        setTracks(Array.isArray(t) ? t : t?.items || []);
        setGames(Array.isArray(g) ? g : g?.items || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const featured = movies[0];

  const Shelf = ({ icon: Icon, title, to, items, render }) => {
    if (!items?.length) return null;
    return (
      <section className="mt-6 px-3 sm:px-4">
        <div className="mb-3 flex items-center gap-2">
          <Icon className="h-4 w-4" style={{ color: "var(--brand)" }} />
          <h2 className="text-[15px] font-bold">{title}</h2>
          <button onClick={() => navigate(to)} className="ml-auto flex items-center gap-0.5 text-[12px] ig-muted hover:opacity-80">See all <ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
          {items.map(render)}
        </div>
      </section>
    );
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-white/50" /></div>;

  return (
    <div className="pb-28">
      {featured && (
        <section className="px-3 pt-4 sm:px-4">
          <div className="relative overflow-hidden rounded-3xl border border-white/10">
            <div className="aspect-[16/8] sm:aspect-[16/6]">
              {featured.poster ? <img src={featured.poster} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-white/5" />}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.2em] backdrop-blur">Featured film</span>
              <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{featured.title}</h1>
              <p className="mt-0.5 text-[12px] text-white/60">{featured.genre}{featured.language ? ` · ${featured.language}` : ""}</p>
              <button onClick={() => navigate("/movies")} className="mt-3 inline-flex items-center gap-1.5 rounded-full brand-grad px-4 py-2 text-[12.5px] font-bold text-black"><Play className="h-3.5 w-3.5 fill-black" /> Watch now</button>
            </div>
          </div>
        </section>
      )}

      <Shelf
        icon={Film}
        title="Movies"
        to="/movies"
        items={movies}
        render={(mv) => (
          <button key={mv.id} onClick={() => navigate("/movies")} className="group w-[120] shrink-0 text-left sm:w-[140px]">
            <div className="aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              {mv.poster ? <img src={mv.poster} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="grid h-full w-full place-items-center"><Film className="h-6 w-6 text-white/30" /></div>}
            </div>
            <p className="mt-1.5 line-clamp-1 text-[12px] font-semibold">{mv.title}</p>
            <p className="text-[10px] ig-muted">{mv.genre}</p>
          </button>
        )}
      />

      <Shelf
        icon={Music2}
        title="Music"
        to="/music"
        items={tracks}
        render={(tr) => (
          <button key={tr.id} onClick={() => navigate("/music")} className="group w-[136px] shrink-0 text-left sm:w-[156px]">
            <div className="aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              {tr.artwork ? <img src={tr.artwork} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="grid h-full w-full place-items-center"><Music2 className="h-6 w-6 text-white/30" /></div>}
            </div>
            <p className="mt-1.5 line-clamp-1 text-[12px] font-semibold">{tr.title}</p>
            <p className="text-[10px] ig-muted">{tr.artist_name}</p>
          </button>
        )}
      />

      <Shelf
        icon={Gamepad2}
        title="Arcade"
        to="/?cat=gaming"
        items={games}
        render={(gm) => (
          <button key={gm.id} onClick={() => navigate("/?cat=gaming")} className="group w-[150px] shrink-0 text-left sm:w-[170px]">
            <div className="aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              {gm.cover ? <img src={gm.cover} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="grid h-full w-full place-items-center"><Gamepad2 className="h-6 w-6 text-white/30" /></div>}
            </div>
            <p className="mt-1.5 line-clamp-1 text-[12px] font-semibold">{gm.title}</p>
            <p className="text-[10px] ig-muted">{gm.genre}</p>
          </button>
        )}
      />

      {!loading && !movies.length && !tracks.length && !games.length && (
        <div className="py-20 text-center text-sm ig-muted">No entertainment yet — add movies, tracks or games and they'll show here.</div>
      )}
    </div>
  );
}