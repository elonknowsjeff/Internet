import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAudio } from "@/components/AudioProvider";
import {
  Play, Pause, Upload, X, Search, Loader2, Home, Plus, Store, Disc3, ListMusic,
  Link2, Trash2, Music2, Sparkles, Drum, ChevronRight, Radio, Sliders, Heart, Headphones,
} from "lucide-react";
import BeatStudio from "@/components/BeatStudio";
import MusicUpload from "@/components/music/MusicUpload";
import MusicMarketplace from "@/components/music/MusicMarketplace";
import ChartsPanel from "@/components/music/ChartsPanel";
import PlaylistsPanel from "@/components/music/PlaylistsPanel";
import SpotifyImport from "@/components/music/SpotifyImport";
import SpotifyTab from "@/components/music/SpotifyTab";
import { useSpotify } from "@/components/SpotifyProvider";
import AiSongStudio from "@/components/music/AiSongStudio";
import MusicHome from "@/components/music/MusicHome";
import MusicCatalog from "@/components/music/MusicCatalog";
import { PRESET_BEATS } from "@/lib/songEngine";
import Waveform from "@/components/music/Waveform";
import MidiStudio from "@/components/music/MidiStudio";

const EMPTY_ART = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300";

const NAV = [
  { key: "discover", label: "Listen Now", icon: Home },
  { key: "catalog", label: "Browse", icon: Disc3 },
  { key: "charts", label: "Radio", icon: Radio },
  { key: "spotify", label: "Spotify", icon: Link2 },
  { key: "create", label: "Create", icon: Sparkles },
  { key: "playlists", label: "Library", icon: ListMusic },
  { key: "marketplace", label: "Market", icon: Store },
  { key: "studio", label: "Studio", icon: Sliders },
];

export default function Music() {
  const audio = useAudio();
  const [tracks, setTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("discover");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const spotify = useSpotify();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState("");
  const [billboard, setBillboard] = useState([]);
  const [bbLoading, setBbLoading] = useState(false);
  const searchTimer = useRef(null);
  const [style, setStyle] = useState(() => localStorage.getItem("si_music_style") || "apple");
  const switchStyle = (s) => { setStyle(s); localStorage.setItem("si_music_style", s); };

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const load = async () => {
    try {
      const [tr, pl] = await Promise.all([
        base44.entities.Track.list("-created_date", 200),
        base44.entities.Playlist.list("-created_date", 100).catch(() => []),
      ]);
      setTracks(tr.filter((t) => t.file_uri && t.source !== "spotify"));
      setPlaylists(pl);
    } catch (e) {
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBbLoading(true);
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          model: "gemini_3_flash",
          prompt: "Return the current Billboard Hot 100 top 10 songs as JSON. Each item: rank (number 1-10), title, artist. Use the most recent official Billboard Hot 100 chart.",
          add_context_from_internet: true,
          response_json_schema: { type: "object", properties: { chart: { type: "array", items: { type: "object", properties: { rank: { type: "number" }, title: { type: "string" }, artist: { type: "string" } } } } } },
        });
        if (!cancelled) setBillboard((res?.chart || []).filter((e) => e && e.title).slice(0, 10));
      } catch (e) {}
      if (!cancelled) setBbLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const current = audio?.current || null;
  const playing = audio?.playing || false;

  const trackNeighbours = (t, pool) => {
    const list = (pool || []).filter((x) => x.source !== "spotify" && x.file_uri);
    const i = list.findIndex((x) => x.id === t.id);
    if (i < 0 || list.length < 2) return {};
    return {
      onNext: () => play(list[(i + 1) % list.length], list),
      onPrev: () => play(list[(i - 1 + list.length) % list.length], list),
    };
  };

  const play = async (t, pool) => {
    base44.entities.Track.update(t.id, { plays: (t.plays || 0) + 1 }).catch(() => {});
    if (t.source === "spotify") {
      spotify.open({ type: t.spotify_type || "track", id: t.spotify_id, title: t.title });
      return;
    }
    if (current?.key === `cat:${t.id}`) { audio.toggle(); return; }
    try {
      const r = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: t.file_uri });
      audio.play({ key: `cat:${t.id}`, src: r.signed_url, title: t.title, subtitle: t.artist_name, art: t.artwork || EMPTY_ART, duration: t.duration || 0, ...trackNeighbours(t, pool || tracks) });
    } catch (e) {}
  };

  const remove = async (t) => {
    try { await base44.entities.Track.delete(t.id); load(); } catch (e) {}
  };

  const playPreview = (r) => {
    if (current?.key === `it:${r.trackId}`) { audio.toggle(); return; }
    audio.play({ key: `it:${r.trackId}`, src: r.previewUrl, title: r.trackName, subtitle: `${r.artistName} · 30s preview`, art: r.artworkUrl100, duration: 30 });
  };

  const playBillboard = async (entry) => {
    setSearchErr("");
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(entry.title + " " + entry.artist)}&media=music&limit=1`);
      const j = await res.json();
      if (j.results && j.results[0]) playPreview(j.results[0]);
      else setSearchErr("No preview found for that track.");
    } catch (e) { setSearchErr("Search unavailable right now."); }
  };

  const doSearch = async (q) => {
    if (!q.trim()) { setResults([]); setSearchErr(""); return; }
    setSearching(true); setSearchErr("");
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&limit=25`);
      const j = await res.json();
      setResults(j.results || []);
      if (!j.results?.length) setSearchErr("No songs found.");
    } catch (e) { setSearchErr("Search unavailable right now."); }
    finally { setSearching(false); }
  };
  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (!query.trim()) { setResults([]); setSearchErr(""); return; }
    searchTimer.current = setTimeout(() => doSearch(query), 450);
    return () => clearTimeout(searchTimer.current);
  }, [query]);

  const owns = (t) => user && t.created_by_id === user.id;
  const trending = [...tracks].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 5);
  const nowPlaying = tracks.find((t) => `cat:${t.id}` === current?.key) || null;

  const createView = (
    <div className="space-y-3 p-3">
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]"><AiSongStudio /></div>
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
        <h3 className="flex items-center gap-2 text-[13.5px] font-semibold"><Drum className="h-4 w-4 text-amber-300" /> Beat maker</h3>
        <p className="mt-1 text-[11.5px] text-white/45">Pick a preset beat, then edit every drum, bass and chord step. Export a WAV when it knocks.</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {PRESET_BEATS.map((p) => (
            <span key={p.id} className="rounded-full border border-white/[0.1] bg-white/[0.06] px-2.5 py-1 text-[11px] text-white/70">{p.name} · {p.bpm} BPM</span>
          ))}
        </div>
        <button onClick={() => setStudioOpen(true)} className="mt-3 rounded-full brand-grad px-4 py-2 text-[12.5px] font-bold text-black">Open beat maker</button>
      </div>
    </div>
  );

  const accent = style === "soundcloud" ? "#FF5500" : "var(--brand)";

  return (
    <div className="mx-auto w-full max-w-[1100px] px-3 sm:px-4 pb-28" style={{ "--brand": accent }}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_300px]">

        {/* ---------- left sidebar ---------- */}
        <aside className="hidden lg:block">
          <div className="sticky top-3 space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="grid h-8 w-8 place-items-center rounded-xl" style={{ background: accent }}><Music2 className="h-4 w-4 text-black" /></span>
              <h1 className="text-[20px] font-extrabold tracking-[-0.02em]">Valo <span className="text-white/40 font-bold">Music</span></h1>
            </div>

            <div className="grid grid-cols-2 gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
              <button onClick={() => switchStyle("apple")} className={`rounded-lg py-1.5 text-[11px] font-bold ${style === "apple" ? "text-black" : "text-white/55"}`} style={style === "apple" ? { background: accent } : {}}>Apple</button>
              <button onClick={() => switchStyle("soundcloud")} className={`rounded-lg py-1.5 text-[11px] font-bold ${style === "soundcloud" ? "text-black" : "text-white/55"}`} style={style === "soundcloud" ? { background: accent } : {}}>SoundCloud</button>
            </div>

            <nav className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
              {NAV.map((n) => {
                const Icon = n.icon;
                const on = tab === n.key;
                return (
                  <button key={n.key} onClick={() => { setTab(n.key); setQuery(""); }} className={`flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors ${on ? "bg-white/[0.08]" : "hover:bg-white/[0.05]"}`}>
                    <Icon className={`h-4 w-4 ${on ? "" : "text-white/55"}`} style={on ? { color: accent } : undefined} />
                    <span className={`text-[13px] font-semibold ${on ? "text-white" : "text-white/65"}`}>{n.label}</span>
                    {on && <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: accent }} />}
                  </button>
                );
              })}
            </nav>

            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-2">
              <div className="flex items-center justify-between px-1.5 py-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">Library</span>
                <button onClick={() => setUploadOpen(true)} title="Add music" className="grid h-6 w-6 place-items-center rounded-full hover:bg-white/10"><Plus className="h-3.5 w-3.5 text-white/55" /></button>
              </div>
              {playlists.length === 0 ? (
                <p className="px-1.5 pb-1.5 text-[11px] text-white/35">Your playlists land here.</p>
              ) : (
                <div className="max-h-[36vh] space-y-0.5 overflow-y-auto thin-scrollbar">
                  {playlists.map((p) => (
                    <button key={p.id} onClick={() => setTab("playlists")} className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-left hover:bg-white/[0.06]">
                      <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-md border border-white/[0.08] bg-white/[0.05]">
                        {p.cover ? <img src={p.cover} alt="" className="h-full w-full object-cover" /> : <ListMusic className="h-4 w-4 text-white/40" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] font-medium">{p.name}</span>
                        <span className="block text-[10px] text-white/35">{(p.track_ids || []).length} songs</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => setStudioOpen(true)} className="flex w-full items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 text-left hover:bg-white/[0.06]">
              <Drum className="h-4 w-4" style={{ color: accent }} />
              <span><span className="block text-[12px] font-bold">Beat maker</span><span className="block text-[10px] text-white/45">Build a loop in seconds</span></span>
            </button>
          </div>
        </aside>

        {/* ---------- center ---------- */}
        <div className="min-w-0">
          <header className="sticky top-0 z-30 mb-2 border-b border-white/[0.08] bg-[#06060a]/85 backdrop-blur-2xl">
            <div className="flex items-center gap-2 px-4 py-3">
              <span className="grid h-7 w-7 place-items-center rounded-[9px] lg:hidden" style={{ background: accent }}><Music2 className="h-4 w-4 text-black" /></span>
              <h1 className="text-[16px] font-bold tracking-[-0.01em] lg:hidden">Music</h1>
              <div className="hidden flex-1 items-center gap-2 lg:flex">
                <span className="text-[15px] font-bold">{query.trim() ? `Results for “${query.trim()}”` : NAV.find((n) => n.key === tab).label}</span>
              </div>
              <div className="flex flex-1 items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.05] px-3.5 py-1.5 focus-within:border-white/25 lg:flex-none">
                <Search className="h-4 w-4 shrink-0 text-white/40" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your music" className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder-white/35" />
                {query && <button onClick={() => setQuery("")}><X className="h-4 w-4 text-white/40" /></button>}
              </div>
              <button onClick={() => setUploadOpen(true)} className="flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-bold text-black" style={{ background: accent }}>
                <Upload className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Upload</span>
              </button>
            </div>
            {/* mobile tab pills */}
            <div className="flex gap-1 overflow-x-auto scrollbar-none px-3 pb-2 lg:hidden">
              {NAV.map((n) => (
                <button key={n.key} onClick={() => { setTab(n.key); setQuery(""); }} className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold" style={tab === n.key ? { background: accent, color: "#000" } : {}}>
                  <n.icon className="h-3.5 w-3.5" /> {n.label}
                </button>
              ))}
            </div>
          </header>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-white/40 text-sm"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading your music…</div>
          ) : query.trim() ? (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-2">
              {searchErr && <p className="px-2 py-2 text-[12px] text-white/50">{searchErr}</p>}
              {results.map((r, i) => (
                <div key={r.trackId} className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/[0.05]">
                  <button onClick={() => playPreview(r)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <span className="w-4 text-xs text-white/40 tabular-nums">{i + 1}</span>
                    <span className="h-11 w-11 shrink-0 overflow-hidden rounded bg-white/10"><img src={r.artworkUrl100} alt="" className="h-full w-full object-cover" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-medium">{r.trackName}</span>
                      <span className="block truncate text-[11px] text-white/45">{r.artistName} · {r.collectionName}</span>
                    </span>
                    {current?.key === `it:${r.trackId}` && playing ? <Pause className="h-4 w-4" style={{ color: accent }} /> : <Play className="h-4 w-4 text-white/55" />}
                  </button>
                  <Waveform seed={r.trackId || r.trackName} active={current?.key === `it:${r.trackId}` && playing} className="hidden w-24 opacity-60 md:flex xl:w-40" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
              {tab === "discover" && (
                <MusicHome tracks={tracks} playlists={playlists} billboard={billboard} onPlay={play} onPlayBillboard={playBillboard} onTab={setTab} playing={playing} currentKey={current?.key} />
              )}
              {tab === "catalog" && <div className="p-3"><MusicCatalog onPlay={playPreview} currentKey={current?.key} playing={playing} /></div>}
              {tab === "charts" && <ChartsPanel tracks={tracks} currentKey={current?.key} playing={playing} onPlay={play} billboard={billboard} bbLoading={bbLoading} onPlayBillboard={playBillboard} />}
              {tab === "create" && createView}
              {tab === "playlists" && <PlaylistsPanel playlists={playlists} tracks={tracks} onChanged={load} onPlay={play} currentKey={current?.key} playing={playing} />}
              {tab === "spotify" && <SpotifyTab user={user} />}
              {tab === "marketplace" && <div className="p-3"><MusicMarketplace user={user} audio={audio} current={current} playing={playing} /></div>}
              {tab === "studio" && <div className="p-3"><MidiStudio /></div>}
            </div>
          )}
        </div>

        {/* ---------- right rail ---------- */}
        <aside className="hidden xl:block">
          <div className="sticky top-3 space-y-3">
            {nowPlaying && (
              <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
                <div className="relative aspect-square bg-white/[0.05]">
                  {nowPlaying.artwork && <img src={nowPlaying.artwork} alt="" className="h-full w-full object-cover" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <button onClick={() => play(nowPlaying)} className="absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full text-black shadow-lg" style={{ background: accent }}>
                    {playing ? <Pause className="h-5 w-5 fill-black" /> : <Play className="h-5 w-5 fill-black" />}
                  </button>
                </div>
                <div className="p-3">
                  <p className="truncate text-[14px] font-bold">{nowPlaying.title}</p>
                  <p className="truncate text-[12px] text-white/50">{nowPlaying.artist_name}</p>
                </div>
              </section>
            )}

            {trending.length > 0 && (
              <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
                <h3 className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2.5 text-[13px] font-bold"><Sparkles className="h-3.5 w-3.5" style={{ color: accent }} /> Trending</h3>
                <ul>
                  {trending.map((t, i) => (
                    <li key={t.id}>
                      <button onClick={() => play(t)} className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-white/[0.05]">
                        <span className="w-4 text-center text-[11px] text-white/35">{i + 1}</span>
                        <span className="h-9 w-9 shrink-0 overflow-hidden rounded bg-white/[0.06]">{t.artwork && <img src={t.artwork} alt="" className="h-full w-full object-cover" />}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] font-medium">{t.title}</span>
                          <span className="block truncate text-[10px] text-white/40">{t.artist_name}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {tracks.length > 0 && (
              <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
                <h3 className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2.5 text-[13px] font-bold"><Headphones className="h-3.5 w-3.5" style={{ color: accent }} /> Recent</h3>
                <ul>
                  {tracks.slice(0, 4).map((t) => (
                    <li key={t.id}>
                      <button onClick={() => play(t)} className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-white/[0.05]">
                        <span className="h-9 w-9 shrink-0 overflow-hidden rounded bg-white/[0.06]">{t.artwork && <img src={t.artwork} alt="" className="h-full w-full object-cover" />}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] font-medium">{t.title}</span>
                          <span className="block truncate text-[10px] text-white/40">{t.artist_name}</span>
                        </span>
                        {owns(t) && <button onClick={(e) => { e.stopPropagation(); remove(t); }} className="text-white/30 hover:text-rose-300"><Trash2 className="h-3.5 w-3.5" /></button>}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </aside>
      </div>

      {studioOpen && <BeatStudio onClose={() => setStudioOpen(false)} />}
      {uploadOpen && <MusicUpload user={user} onClose={() => setUploadOpen(false)} onDone={load} />}
    </div>
  );
}