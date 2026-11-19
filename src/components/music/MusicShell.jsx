import React, { useMemo, useState } from "react";
import {
  Play, Pause, Search, Upload, Home, Disc3, Radio, Sparkles, Store, Sliders,
  ChevronRight, Music2, Heart, Headphones, Apple,
} from "lucide-react";
import StreamingServices from "@/components/music/StreamingServices";
import MusicSidebar from "@/components/music/MusicSidebar";

const fmt = (n) => {
  const v = Number(n || 0);
  return v >= 1000 ? `${(v / 1000).toFixed(1).replace(/\.0$/, "")}K` : `${v}`;
};

const NAV = [
  { key: "home", label: "Listen Now", icon: Home },
  { key: "catalog", label: "Browse", icon: Disc3 },
  { key: "charts", label: "Radio", icon: Radio },
  { key: "streaming", label: "Spotify · Apple", icon: Apple },
  { key: "create", label: "Create", icon: Sparkles },
  { key: "library", label: "Library", icon: Music2 },
  { key: "market", label: "Market", icon: Store },
  { key: "studio", label: "Studio", icon: Sliders },
];

function Section({ title, action, children }) {
  return (
    <section className="mt-6">
      <div className="mb-2.5 flex items-end justify-between gap-3 px-1">
        <h2 className="font-display text-[19px] font-semibold tracking-[-0.02em]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function MusicShell({
  tracks = [], playlists = [], onPlay, currentKey, playing, onUpload, onClassic,
  libraryView = null, marketView = null, studioView = null, createView = null, spotifyView = null,
}) {
  const [view, setView] = useState("home");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return tracks;
    return tracks.filter((t) => `${t.title} ${t.artist_name} ${t.genre || ""}`.toLowerCase().includes(term));
  }, [query, tracks]);

  const trending = useMemo(() => [...filtered].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 6), [filtered]);
  const fresh = filtered.slice(0, 10);

  const nowPlaying = useMemo(() => tracks.find((t) => `cat:${t.id}` === currentKey) || null, [tracks, currentKey]);
  const now = nowPlaying
    ? { title: nowPlaying.title, subtitle: nowPlaying.artist_name, art: nowPlaying.artwork }
    : null;

  const isPlaying = (t) => currentKey === `cat:${t.id}` && playing;

  const Row = ({ t, rank }) => (
    <div className="group flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/[0.055]">
      <button onClick={() => onPlay(t)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <span className="w-4 text-center text-[11px] tabular-nums text-white/30">
          {currentKey === `cat:${t.id}` && playing ? <Pause className="inline h-3 w-3" /> : rank}
        </span>
        <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-white/[0.06]">
          {t.artwork && <img src={t.artwork} alt="" className="h-full w-full object-cover" />}
          <span className={`absolute inset-0 grid place-items-center bg-black/45 transition-opacity ${currentKey === `cat:${t.id}` ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
            {isPlaying(t) ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white" />}
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-medium leading-snug" style={isPlaying(t) ? { color: "var(--brand)" } : undefined}>{t.title}</span>
          <span className="block truncate text-[11.5px] text-white/40">{t.artist_name}{t.album_name ? ` · ${t.album_name}` : t.genre ? ` · ${t.genre}` : ""}</span>
        </span>
      </button>
      <span className="hidden items-center gap-3 pr-1 text-[11px] text-white/30 sm:flex">
        <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{fmt(t.likes)}</span>
        <span className="flex items-center gap-1"><Headphones className="h-3.5 w-3.5" />{fmt(t.plays)}</span>
      </span>
    </div>
  );

  const Tile = ({ t }) => (
    <button onClick={() => onPlay(t)} className="group flex items-center gap-3 overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.045] p-2 text-left transition-colors hover:bg-white/[0.09]">
      <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white/[0.06]">
        {t.artwork && <img src={t.artwork} alt="" className="h-full w-full object-cover" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12.5px] font-semibold">{t.title}</span>
        <span className="block truncate text-[11px] text-white/40">{t.artist_name}</span>
      </span>
      <span className="mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-full brand-grad text-black opacity-0 transition-opacity group-hover:opacity-100">
        {isPlaying(t) ? <Pause className="h-3 w-3 fill-black" /> : <Play className="h-3 w-3 fill-black" />}
      </span>
    </button>
  );

  const Card = ({ t }) => (
    <button onClick={() => onPlay(t)} className="group w-full text-left">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.05] shadow-[0_28px_50px_-34px_rgba(0,0,0,0.95)]">
        {t.artwork && <img src={t.artwork} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
        <span className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent opacity-70" />
        <span className="absolute bottom-2 right-2 grid h-9 w-9 place-items-center rounded-full brand-grad text-black opacity-0 shadow-lg transition-all group-hover:opacity-100">
          {isPlaying(t) ? <Pause className="h-4 w-4 fill-black" /> : <Play className="h-4 w-4 fill-black" />}
        </span>
      </div>
      <p className="mt-2 truncate text-[12.5px] font-semibold leading-snug">{t.title}</p>
      <p className="truncate text-[11px] text-white/40">{t.artist_name}</p>
    </button>
  );

  return (
    <div className="flex items-start gap-3 pt-3">
      <MusicSidebar
        nav={NAV}
        view={view}
        onView={(k) => { setView(k); setQuery(""); }}
        playlists={playlists}
        onUpload={onUpload}
        onClassic={onClassic}
        current={now}
        playing={playing}
        onToggle={() => nowPlaying && onPlay(nowPlaying)}
      />

      <main className="min-w-0 flex-1">
        <header className="sticky top-2 z-20 flex items-center gap-2 rounded-2xl border border-white/[0.1] bg-[#0b0818]/72 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-2xl">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.055] px-3.5 py-1.5 focus-within:border-white/30">
            <Search className="h-4 w-4 shrink-0 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your music"
              className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder-white/35"
            />
          </div>
          <button onClick={() => setView("create")} className="hidden shrink-0 items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.06] px-3 py-1.5 text-[12px] font-semibold hover:bg-white/[0.12] sm:flex">
            <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--brand)" }} /> Create
          </button>
          <button onClick={onUpload} className="flex shrink-0 items-center gap-1.5 rounded-full brand-grad px-3.5 py-1.5 text-[12px] font-bold text-black">
            <Upload className="h-3.5 w-3.5" /> Upload
          </button>
        </header>

        <div className="flex gap-1.5 overflow-x-auto py-2 scrollbar-none md:hidden">
          {NAV.map((n) => (
            <button key={n.key} onClick={() => setView(n.key)} className={`shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition-colors ${view === n.key ? "bg-white/[0.14] text-white" : "bg-white/[0.05] text-white/60"}`}>{n.label}</button>
          ))}
        </div>

        {view === "home" ? (
          <div className="pb-6">
            <section className="relative mt-2 overflow-hidden rounded-3xl border border-white/[0.1] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_40px_80px_-56px_rgba(0,0,0,1)] sm:p-7">
              <div className="absolute inset-0 brand-grad opacity-25" />
              <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(0,0,0,0.55),transparent_65%)]" />
              <div className="relative">
                <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-white/60">Listen now</p>
                <h1 className="mt-2 max-w-md font-display text-[26px] font-semibold leading-tight tracking-[-0.025em] sm:text-[34px]">
                  {tracks.length ? "Your sound, all in one place" : "Start your library"}
                </h1>
                <p className="mt-2 max-w-sm text-[12.5px] leading-relaxed text-white/60">
                  {tracks.length
                    ? `${tracks.length} uploaded tracks, ${playlists.length} playlist${playlists.length === 1 ? "" : "s"} — artist uploads only, played straight from your library.`
                    : "Upload a track and it appears here instantly, ready to play, add to a playlist, or sell in the market."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => (tracks[0] ? onPlay(tracks[0]) : onUpload())}
                    className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12.5px] font-bold text-black hover:brightness-95"
                  >
                    <Play className="h-3.5 w-3.5 fill-black" /> {tracks.length ? "Play library" : "Upload a track"}
                  </button>
                  <button onClick={() => setView("create")} className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[12.5px] font-semibold hover:bg-white/20">
                    <Sparkles className="h-3.5 w-3.5" /> Make a song
                  </button>
                </div>
              </div>
            </section>

            {filtered.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-white/[0.14] p-10 text-center">
                <Music2 className="mx-auto mb-2 h-7 w-7 text-white/25" />
                <p className="text-[13px] text-white/50">{query ? "No tracks match that search." : "Nothing uploaded yet — your first track starts the library."}</p>
                {!query && <button onClick={onUpload} className="mt-3 rounded-full brand-grad px-4 py-2 text-[12px] font-bold text-black">Upload a track</button>}
              </div>
            ) : (
              <>
                <Section title="Spotify & Apple Music">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button onClick={() => setView("streaming")} className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3 text-left transition-colors hover:border-white/25">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-black"><Apple className="h-5 w-5" /></span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-semibold">Apple Music</span>
                        <span className="block text-[11px] text-white/40">Playlists of songs out right now</span>
                      </span>
                      <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-white/30" />
                    </button>
                    <button onClick={() => setView("streaming")} className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3 text-left transition-colors hover:border-white/25">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#1DB954] text-black"><Music2 className="h-5 w-5" /></span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-semibold">Spotify</span>
                        <span className="block text-[11px] text-white/40">Your saved Spotify playlists</span>
                      </span>
                      <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-white/30" />
                    </button>
                  </div>
                </Section>

                <Section title={query ? `Results for “${query.trim()}”` : "Jump back in"}>
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.slice(0, 6).map((t) => <Tile key={t.id} t={t} />)}
                  </div>
                </Section>

                {!query && (
                  <Section
                    title="Trending uploads"
                    action={<button onClick={() => setView("charts")} className="flex items-center gap-0.5 text-[11px] font-semibold text-white/40 hover:text-white">Top chart <ChevronRight className="h-3 w-3" /></button>}
                  >
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-1.5">
                      {trending.map((t, i) => <Row key={t.id} t={t} rank={i + 1} />)}
                    </div>
                  </Section>
                )}

                {!query && fresh.length > 0 && (
                  <Section title="Fresh from creators">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                      {fresh.map((t) => <Card key={t.id} t={t} />)}
                    </div>
                  </Section>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="pb-6 pt-3">
            <h1 className="mb-3 px-1 font-display text-[19px] font-semibold tracking-[-0.02em]">
              {NAV.find((n) => n.key === view)?.label || "Music"}
            </h1>
            {view === "library" ? libraryView
              : view === "streaming" ? <StreamingServices onOpenImport={() => setView("spotify")} />
              : view === "spotify" ? spotifyView
              : view === "market" ? marketView
              : view === "studio" ? studioView
              : view === "create" ? createView
              : view === "charts" ? (
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-1.5">
                  {trending.length ? trending.map((t, i) => <Row key={t.id} t={t} rank={i + 1} />) : <p className="p-6 text-center text-[12.5px] text-white/40">No chart data yet.</p>}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                  {fresh.length ? fresh.map((t) => <Card key={t.id} t={t} />) : <p className="col-span-full p-6 text-center text-[12.5px] text-white/40">Browse fills up as creators upload.</p>}
                </div>
              )}
          </div>
        )}
      </main>
    </div>
  );
}