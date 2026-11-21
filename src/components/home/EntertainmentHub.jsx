import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Music2, Gamepad2, Loader2, ChevronRight } from "lucide-react";

export default function EntertainmentHub() {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [t, g] = await Promise.all([
          base44.entities.Track.list("-plays", 14).catch(() => []),
          base44.entities.Game.list("-plays", 14).catch(() => []),
        ]);
        setTracks(Array.isArray(t) ? t : t?.items || []);
        setGames(Array.isArray(g) ? g : g?.items || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

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

      {!loading && !tracks.length && !games.length && (
        <div className="py-20 text-center text-sm ig-muted">No entertainment yet — add tracks or games and they'll show here.</div>
      )}
    </div>
  );
}