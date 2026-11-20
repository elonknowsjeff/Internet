import React, { useMemo, useState } from "react";
import {
  Play, Pause, Search, Upload, Heart, MessageCircle, Repeat2, TrendingUp,
  Store, Home, ListMusic, Cloud, Sliders, Headphones, ArrowLeft, Radio,
} from "lucide-react";
import Waveform from "@/components/music/Waveform";

const ORANGE = "#FF5500";

const fmt = (s) => {
  const n = Number(s || 0);
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : `${n}`;
};

const VIEWS = [
  { key: "home", label: "Home", icon: Home },
  { key: "library", label: "Library", icon: ListMusic },
  { key: "market", label: "Market", icon: Store },
  { key: "studio", label: "Studio", icon: Sliders },
];

export default function SoundCloudShell({
  tracks = [], playlists = [], onPlay, currentKey, playing,
  onUpload, onModern, libraryView = null, marketView = null, studioView = null,
}) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState("home");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return tracks;
    return tracks.filter((t) =>
      `${t.title} ${t.artist_name} ${t.genre || ""}`.toLowerCase().includes(term)
    );
  }, [query, tracks]);

  const trending = useMemo(
    () => [...filtered].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 5),
    [filtered]
  );
  const fresh = filtered.slice(0, 12);

  const TrackRow = ({ t, rank }) => {
    const isCur = currentKey === `cat:${t.id}`;
    return (
      <div className="group flex items-center gap-3 rounded-lg bg-[#121216] border border-white/[0.06] hover:border-white/20 p-2.5 transition-colors">
        <button
          onClick={() => onPlay(t)}
          aria-label={isCur && playing ? "Pause" : "Play"}
          className="w-10 h-10 rounded-full shrink-0 grid place-items-center shadow-[0_6px_18px_-6px_rgba(255,85,0,0.9)]"
          style={{ backgroundColor: ORANGE }}
        >
          {isCur && playing ? <Pause className="w-4 h-4 fill-black text-black" /> : <Play className="w-4 h-4 fill-black text-black ml-0.5" />}
        </button>

        <div className="w-12 h-12 rounded-md overflow-hidden shrink-0 bg-white/10">
          {t.artwork ? <img src={t.artwork} alt="" className="w-full h-full object-cover" /> : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {rank ? <span className="text-[11px] font-bold text-white/30 tabular-nums">{rank}</span> : null}
            <p className={`truncate text-[13.5px] font-semibold ${isCur ? "text-[#FF5500]" : ""}`}>{t.title}</p>
          </div>
          <p className="truncate text-[11.5px] text-white/50">
            {t.artist_name}{t.artist_handle ? ` · @${t.artist_handle}` : ""}{t.genre ? ` · ${t.genre}` : ""}
          </p>
          <div className="hidden sm:block mt-1">
            <Waveform seed={t.id || t.title} active={isCur && playing} className="w-full max-w-[420px] h-5 opacity-70" />
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3 text-[11px] text-white/40 shrink-0">
          <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{fmt(t.likes)}</span>
          <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{fmt(t.comments)}</span>
          <span className="flex items-center gap-1"><Repeat2 className="w-3.5 h-3.5" />{fmt(t.reposts)}</span>
          <span className="flex items-center gap-1"><Headphones className="w-3.5 h-3.5" />{fmt(t.plays)}</span>
        </div>
      </div>
    );
  };

  const Rail = () => (
    <aside className="hidden lg:block space-y-3">
      <div className="rounded-xl bg-[#121216] border border-white/[0.06] p-3">
        <h3 className="text-[13px] font-bold flex items-center gap-1.5"><TrendingUp className="w-4 h-4" style={{ color: ORANGE }} /> Charts</h3>
        <div className="mt-2 space-y-1">
          {trending.slice(0, 4).map((t, i) => (
            <button key={t.id} onClick={() => onPlay(t)} className="w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-white/[0.06] text-left">
              <span className="w-4 text-[11px] text-white/35 tabular-nums">{i + 1}</span>
              <span className="w-8 h-8 rounded overflow-hidden bg-white/10 shrink-0">
                {t.artwork ? <img src={t.artwork} alt="" className="w-full h-full object-cover" /> : null}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-medium">{t.title}</span>
                <span className="block truncate text-[10.5px] text-white/45">{t.artist_name}</span>
              </span>
            </button>
          ))}
          {trending.length === 0 && <p className="text-[11px] text-white/35 py-2">Nothing charting yet.</p>}
        </div>
      </div>

      <button onClick={() => setView("market")} className="w-full text-left rounded-xl border border-white/[0.08] p-3 bg-gradient-to-br from-[#FF5500]/25 to-transparent hover:brightness-110">
        <p className="text-[13px] font-bold flex items-center gap-1.5"><Store className="w-4 h-4" style={{ color: ORANGE }} /> SoundCloud Market</p>
        <p className="text-[11px] text-white/55 mt-0.5">Buy and sell beats, loops and full tracks.</p>
      </button>

      <button onClick={() => setView("studio")} className="w-full text-left rounded-xl border border-white/[0.08] p-3 bg-white/[0.04] hover:bg-white/[0.08]">
        <p className="text-[13px] font-bold flex items-center gap-1.5"><Sliders className="w-4 h-4 text-cyan-300" /> Beat studio</p>
        <p className="text-[11px] text-white/55 mt-0.5">Step sequencer with MIDI keyboard support.</p>
      </button>

      {playlists.length > 0 && (
        <div className="rounded-xl bg-[#121216] border border-white/[0.06] p-3">
          <button onClick={() => setView("library")} className="w-full flex items-center justify-between">
            <h3 className="text-[13px] font-bold flex items-center gap-1.5"><ListMusic className="w-4 h-4" style={{ color: ORANGE }} /> Your playlists</h3>
            <ArrowLeft className="w-4 h-4 text-white/35 rotate-180" />
          </button>
          <div className="mt-2 space-y-1">
            {playlists.slice(0, 4).map((p) => (
              <button key={p.id} onClick={() => setView("library")} className="w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-white/[0.06] text-left">
                <span className="w-8 h-8 rounded overflow-hidden bg-white/10 shrink-0">
                  {p.cover ? <img src={p.cover} alt="" className="w-full h-full object-cover" /> : null}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-medium">{p.name}</span>
                  <span className="block text-[10.5px] text-white/45">{(p.track_ids || []).length} tracks</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="px-2 text-[10.5px] leading-relaxed text-white/25">
        Valo Sound · community audio. Legal · Privacy · Cookies · Imprint
      </p>
    </aside>
  );

  return (
    <div className="text-white">
      <header className="sticky top-0 z-20 -mx-2 sm:-mx-4 px-3 sm:px-4 h-14 flex items-center gap-3 bg-[#0b0b0d]/95 backdrop-blur-xl border-b border-white/[0.08]">
        <button onClick={() => setView("home")} className="flex items-center gap-2 shrink-0" title="Valo Sound">
          <span className="w-8 h-8 rounded-lg grid place-items-center" style={{ backgroundColor: ORANGE }}>
            <Cloud className="w-4 h-4 text-black" />
          </span>
          <span className="hidden sm:block font-black tracking-tight text-[15px]">
            Valo <span style={{ color: ORANGE }}>Sound</span>
          </span>
        </button>

        <nav className="hidden xl:flex items-center gap-1 ml-2">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12.5px] font-semibold transition-colors ${view === v.key ? "bg-white/[0.09] text-white" : "text-white/50 hover:text-white hover:bg-white/[0.05]"}`}
            >
              <v.icon className="w-4 h-4" /> {v.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 min-w-0 flex items-center gap-2 bg-[#18181c] border border-white/10 rounded-full px-3 py-1.5 max-w-md focus-within:border-white/35">
          <Search className="w-4 h-4 text-white/40 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search uploaded sounds, artists, genres"
            className="flex-1 min-w-0 bg-transparent outline-none text-[13px] placeholder-white/35"
          />
        </div>

        {onModern && (
          <button onClick={onModern} className="hidden shrink-0 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[11.5px] font-semibold text-white/65 hover:bg-white/[0.12] hover:text-white sm:flex">
            Modern look
          </button>
        )}
        <button onClick={onUpload} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold text-black hover:brightness-110" style={{ backgroundColor: ORANGE }}>
          <Upload className="w-3.5 h-3.5" /> Upload
        </button>
      </header>

      <div className="xl:hidden flex gap-1.5 overflow-x-auto scrollbar-none pt-3">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-semibold border ${view === v.key ? "bg-white text-black border-white" : "bg-white/[0.06] border-white/10 text-white/65"}`}
          >
            <v.icon className="w-3.5 h-3.5" /> {v.label}
          </button>
        ))}
      </div>

      {view === "home" ? (
        <div className="grid lg:grid-cols-[1fr_312px] gap-5 pt-4">
          <main className="min-w-0 space-y-5">
            <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] p-5 sm:p-6 bg-[#141418]">
              <div className="absolute inset-0 opacity-90" style={{ background: "radial-gradient(120% 140% at 0% 0%, rgba(255,85,0,0.42), transparent 60%)" }} />
              <div className="relative">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">The world's audio community</p>
                <h1 className="mt-1.5 text-2xl sm:text-[30px] font-black tracking-tight leading-tight max-w-lg">
                  Hear what's trending right now
                </h1>
                <p className="mt-1 text-[12.5px] text-white/60 max-w-md">
                  Upload a track, get heard, and sell your sound in the market. Only artist uploads — no imported catalog songs.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={onUpload} className="px-4 py-2 rounded-full text-[12px] font-bold text-black hover:brightness-110" style={{ backgroundColor: ORANGE }}>
                    Start uploading
                  </button>
                  <button onClick={() => setView("studio")} className="px-4 py-2 rounded-full text-[12px] font-bold bg-white/10 border border-white/20 hover:bg-white/20">
                    Open beat studio
                  </button>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[17px] font-bold tracking-tight">Hear what's trending</h2>
                <span className="text-[11px] text-white/35">{filtered.length} sounds</span>
              </div>
              {trending.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/15 p-8 text-center">
                  <p className="text-sm text-white/50">{query ? "No sounds match that search." : "Nothing here yet."}</p>
                  {!query && (
                    <button onClick={onUpload} className="mt-2 px-4 py-2 rounded-full text-[12px] font-bold text-black" style={{ backgroundColor: ORANGE }}>
                      Upload the first sound
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {trending.map((t, i) => <TrackRow key={t.id} t={t} rank={i + 1} />)}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-[17px] font-bold tracking-tight mb-2">Fresh from the community</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {fresh.map((t) => {
                  const isCur = currentKey === `cat:${t.id}`;
                  return (
                    <button key={t.id} onClick={() => onPlay(t)} className="group text-left rounded-xl overflow-hidden bg-[#121216] border border-white/[0.06] hover:border-white/20">
                      <div className="relative aspect-square bg-white/10">
                        {t.artwork ? <img src={t.artwork} alt="" className="w-full h-full object-cover" /> : null}
                        <span className="absolute bottom-2 right-2 w-8 h-8 rounded-full grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: ORANGE }}>
                          {isCur && playing ? <Pause className="w-3.5 h-3.5 fill-black text-black" /> : <Play className="w-3.5 h-3.5 fill-black text-black ml-0.5" />}
                        </span>
                      </div>
                      <div className="p-2.5">
                        <p className={`truncate text-[12.5px] font-semibold ${isCur ? "text-[#FF5500]" : ""}`}>{t.title}</p>
                        <p className="truncate text-[11px] text-white/45">{t.artist_name}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </main>

          <Rail />
        </div>
      ) : (
        <div className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setView("home")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-[11.5px] font-semibold hover:bg-white/15">
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </button>
            <h1 className="text-[17px] font-black tracking-tight flex items-center gap-1.5">
              {view === "library" ? <ListMusic className="w-4 h-4" style={{ color: ORANGE }} /> : view === "market" ? <Store className="w-4 h-4" style={{ color: ORANGE }} /> : <Sliders className="w-4 h-4 text-cyan-300" />}
              {view === "library" ? "Your library" : view === "market" ? "SoundCloud market" : "Beat studio"}
            </h1>
          </div>
          {view === "library" ? libraryView : view === "market" ? marketView : studioView}
        </div>
      )}
    </div>
  );
}