import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAudio } from "@/components/AudioProvider";
import {
  Play, Pause, Upload, X, Search, Loader2, Home, Plus, Store, Disc3, ListMusic,
  Link2, Trash2, Music2, Sparkles, Drum, ChevronRight, ChevronLeft, Cloud, Sliders,
} from "lucide-react";
import BeatStudio from "@/components/BeatStudio";
import MusicUpload from "@/components/music/MusicUpload";
import MusicMarketplace from "@/components/music/MusicMarketplace";
import ChartsPanel from "@/components/music/ChartsPanel";
import PlaylistsPanel, { PlaylistCard } from "@/components/music/PlaylistsPanel";
import SpotifyImport from "@/components/music/SpotifyImport";
import { useSpotify } from "@/components/SpotifyProvider";
import AiSongStudio from "@/components/music/AiSongStudio";
import MusicHome from "@/components/music/MusicHome";
import MusicCatalog from "@/components/music/MusicCatalog";
import { PRESET_BEATS } from "@/lib/songEngine";
import Waveform from "@/components/music/Waveform";
import SoundCloudShell from "@/components/music/SoundCloudShell";
import MidiStudio from "@/components/music/MidiStudio";
import MusicCommandBar from "@/components/music/MusicCommandBar";
import MusicShell from "@/components/music/MusicShell";

const EMPTY_ART = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300";

const NAV = [
  { key: "discover", label: "Listen Now", icon: Home },
  { key: "catalog", label: "Browse", icon: Disc3 },
  { key: "charts", label: "Radio", icon: Music2 },
  { key: "create", label: "Create", icon: Sparkles },
  { key: "playlists", label: "Library", icon: ListMusic },
  { key: "spotify", label: "Spotify", icon: Link2 },
  { key: "marketplace", label: "SoundCloud store", icon: Store },
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
  const [billboard] = useState([]);
  const [bbLoading] = useState(false);
  const searchTimer = useRef(null);
  const [layout, setLayout] = useState("app");
  const switchLayout = (l) => { setLayout(l); localStorage.setItem("si_music_layout", l); };

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
  const spotifyTracks = tracks.filter((t) => t.source === "spotify");
  const ownedTracks = tracks.filter((t) => t.source !== "spotify");

  const TrackRow = ({ t, index }) => {
    const isCur = current?.key === `cat:${t.id}`;
    return (
      <div className="group flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-white/[0.08]">
        <button onClick={() => play(t)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
          <span className="w-4 text-xs text-white/40 tabular-nums text-center">{isCur && playing ? <Pause className="w-3 h-3" /> : index}</span>
          <span className="relative w-10 h-10 rounded overflow-hidden shrink-0 bg-white/10">
            {t.artwork ? <img src={t.artwork} alt="" className="w-full h-full object-cover" /> : null}
            <span className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity ${isCur ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
              {isCur && playing ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            </span>
          </span>
          <span className="min-w-0 flex-1">
            <span className={`block text-[13.5px] font-medium truncate ${isCur ? "text-[#FA2D48]" : ""}`}>{t.title}</span>
            <span className="block text-[11.5px] text-white/50 truncate">{t.artist_name}{t.genre ? ` · ${t.genre}` : ""}</span>
          </span>
        </button>
        <Waveform seed={t.id || t.title} active={isCur && playing} className="hidden md:flex w-24 xl:w-40 opacity-60" />
        {owns(t) && (
          <button onClick={() => remove(t)} title="Remove" className="w-8 h-8 rounded-full hover:bg-rose-500/25 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  };

  const createView = (
    <div className="space-y-3">
      <div className="panel overflow-hidden">
        <AiSongStudio />
      </div>
      <div className="panel p-4">
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

  return (
    <div className="mx-auto max-w-[1280px] px-2 sm:px-4 pb-28">
      {layout === "app" ? (
        <MusicShell
          tracks={tracks}
          playlists={playlists}
          onPlay={play}
          currentKey={current?.key}
          playing={playing}
          onUpload={() => setUploadOpen(true)}
          onClassic={() => switchLayout("soundcloud")}
          libraryView={<PlaylistsPanel playlists={playlists} tracks={tracks} onChanged={load} onPlay={play} currentKey={current?.key} playing={playing} />}
          marketView={<MusicMarketplace user={user} audio={audio} current={current} playing={playing} />}
          studioView={<MidiStudio />}
          createView={createView}
          spotifyView={<SpotifyImport user={user} onImported={load} />}
        />
      ) : layout === "soundcloud" ? (
        <SoundCloudShell
          tracks={tracks}
          playlists={playlists}
          onPlay={play}
          currentKey={current?.key}
          playing={playing}
          onUpload={() => setUploadOpen(true)}
          onModern={() => switchLayout("app")}
          libraryView={<PlaylistsPanel playlists={playlists} tracks={tracks} onChanged={load} onPlay={play} currentKey={current?.key} playing={playing} />}
          marketView={<MusicMarketplace user={user} audio={audio} current={current} playing={playing} />}
          studioView={<MidiStudio />}
        />
      ) : (
      <div className="flex gap-3 pt-3">
        <aside className="hidden lg:flex flex-col gap-2 w-[248px] shrink-0 self-start sticky top-3">
          <div className="rounded-2xl bg-[#0f0f14] border border-white/[0.06] p-3">
            <div className="flex items-center gap-2 px-1 pb-3">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FA2D48] to-[#B0103A] flex items-center justify-center shadow-[0_4px_14px_-2px_rgba(250,45,72,0.55)]"><Music2 className="w-4 h-4 text-white" /></span>
              <span className="font-black tracking-tight text-[15px]">XSI <span className="text-[#FA2D48]">Music</span></span>
            </div>
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-black/40 p-1 mb-2">
              <span className="py-1.5 rounded-md text-[11px] font-bold text-center bg-white text-black">Apple Music</span>
              <button onClick={() => switchLayout("soundcloud")} className="py-1.5 rounded-md text-[11px] font-bold text-white/60 hover:text-white">SoundCloud</button>
            </div>
            <nav className="space-y-0.5">
              {NAV.map((n) => (
                <button key={n.key} onClick={() => { setTab(n.key); setQuery(""); }} className={`relative w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13.5px] font-semibold transition-all ${tab === n.key ? "text-white bg-gradient-to-r from-[#FA2D48]/20 via-white/[0.05] to-transparent shadow-[inset_0_0_0_1px_rgba(250,45,72,0.25)]" : "text-white/55 hover:text-white hover:bg-white/[0.04]"}`}>
                  {tab === n.key && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-[#FA2D48] shadow-[0_0_10px_rgba(250,45,72,0.9)]" />}
                  <n.icon className={`w-[17px] h-[17px] ${tab === n.key ? "text-[#FA2D48]" : ""}`} /> {n.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="rounded-2xl bg-[#0f0f14] border border-white/[0.06] p-2">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-[13px] font-bold flex items-center gap-2 text-white/80"><ListMusic className="w-4 h-4 text-[#FA2D48]" /> Your Library</span>
              <button onClick={() => setUploadOpen(true)} title="Add music" className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center"><Plus className="w-4 h-4" /></button>
            </div>
            {playlists.length === 0 ? (
              <p className="px-2 pb-2 text-[11px] text-white/35">Your playlists land here.</p>
            ) : (
              playlists.map((p) => (
                <button key={p.id} onClick={() => setTab("playlists")} className="w-full flex items-center gap-2 px-1.5 py-1.5 rounded-md text-[13px] text-white/70 hover:bg-white/10">
                  <span className="w-9 h-9 rounded overflow-hidden bg-white/10 shrink-0 flex items-center justify-center">
                    {p.cover ? <img src={p.cover} alt="" className="w-full h-full object-cover" /> : <ListMusic className="w-4 h-4 text-white/45" />}
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block truncate font-medium">{p.name}</span>
                    <span className="block text-[10px] text-white/40">Playlist · {(p.track_ids || []).length} songs</span>
                  </span>
                </button>
              ))
            )}
          </div>

          <button onClick={() => setStudioOpen(true)} className="rounded-xl bg-gradient-to-br from-[#FA2D48]/25 to-transparent border border-white/10 p-3 text-left hover:brightness-125">
            <p className="text-[13px] font-bold flex items-center gap-1.5"><Drum className="w-4 h-4 text-[#FA2D48]" /> Beat maker</p>
            <p className="text-[11px] text-white/55 mt-0.5">Build a loop in seconds.</p>
          </button>
        </aside>

        <main className="flex-1 min-w-0">
          <MusicCommandBar
            query={query}
            setQuery={setQuery}
            searching={searching}
            onBack={() => setTab("discover")}
            onForward={() => setTab("charts")}
            layout={layout}
            onLayout={(key) => {
              if (key === "spotify") { switchLayout("apple"); setTab("spotify"); return; }
              switchLayout(key);
            }}
            onCreate={() => { setTab("create"); setQuery(""); }}
            onUpload={() => setUploadOpen(true)}
            onBeat={() => setStudioOpen(true)}
          />

          <div className="flex gap-1.5 overflow-x-auto scrollbar-none py-2 lg:hidden">
            {NAV.map((n) => (
              <button key={n.key} onClick={() => setTab(n.key)} className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap font-semibold ${tab === n.key ? "bg-white text-black" : "bg-white/10 border border-white/15 text-white/70"}`}>{n.label}</button>
            ))}
            <button onClick={() => switchLayout("soundcloud")} className="px-3 py-1.5 rounded-full text-xs whitespace-nowrap font-bold bg-[#FF5500] text-black">SoundCloud look</button>
          </div>

          {query.trim() ? (
            <div className="p-1">
              <h3 className="text-sm font-semibold text-white/60 mb-2 px-1">Every song · plays right here</h3>
              {searchErr && <p className="text-sm text-white/50 py-2">{searchErr}</p>}
              {results.map((r, i) => (
                <div key={r.trackId} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/10">
                  <button onClick={() => playPreview(r)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <span className="w-4 text-xs text-white/40 tabular-nums">{i + 1}</span>
                    <span className="w-11 h-11 rounded overflow-hidden shrink-0 bg-white/10"><img src={r.artworkUrl100} alt="" className="w-full h-full object-cover" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm truncate">{r.trackName}</span>
                      <span className="block text-xs text-white/50 truncate">{r.artistName} · {r.collectionName}</span>
                    </span>
                    {current?.key === `it:${r.trackId}` && playing ? <Pause className="w-4 h-4 text-[#FA2D48]" /> : <Play className="w-4 h-4 text-white/60" />}
                  </button>
                  <Waveform seed={r.trackId || r.trackName} active={current?.key === `it:${r.trackId}` && playing} className="hidden md:flex w-24 xl:w-40 opacity-60" />
                </div>
              ))}
            </div>
          ) : tab === "catalog" ? (
            <div className="p-1">
              <MusicCatalog onPlay={playPreview} currentKey={current?.key} playing={playing} />
            </div>
          ) : tab === "create" ? (
            createView
          ) : tab === "charts" ? (
            <ChartsPanel tracks={tracks} currentKey={current?.key} playing={playing} onPlay={play} billboard={billboard} bbLoading={bbLoading} onPlayBillboard={playBillboard} />
          ) : tab === "playlists" ? (
            <PlaylistsPanel playlists={playlists} tracks={tracks} onChanged={load} onPlay={play} currentKey={current?.key} playing={playing} />
          ) : tab === "spotify" ? (
            <SpotifyImport user={user} onImported={load} />
          ) : tab === "marketplace" ? (
            <div className="p-3"><MusicMarketplace user={user} audio={audio} current={current} playing={playing} /></div>
          ) : tab === "studio" ? (
            <div className="p-3"><MidiStudio /></div>
          ) : (
            <MusicHome
              tracks={tracks}
              playlists={playlists}
              billboard={billboard}
              onPlay={play}
              onPlayBillboard={playBillboard}
              onTab={setTab}
              playing={playing}
              currentKey={current?.key}
            />
          )}
        </main>
      </div>
      )}

      {studioOpen && <BeatStudio onClose={() => setStudioOpen(false)} />}
      {uploadOpen && <MusicUpload user={user} onClose={() => setUploadOpen(false)} onDone={load} />}
    </div>
  );
}

function PlaylistShelf({ playlists, onOpen, onCreate }) {
  return (
    <section className="px-1">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold">Your playlists</h3>
        <button onClick={onOpen} className="text-[11px] text-white/50 hover:text-white flex items-center gap-0.5">See all <ChevronRight className="w-3 h-3" /></button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button onClick={onCreate} className="rounded-xl border border-dashed border-white/25 aspect-square flex flex-col items-center justify-center gap-1.5 hover:border-white/50 hover:bg-white/5">
          <Plus className="w-6 h-6 text-white/60" />
          <span className="text-[11px] text-white/60 font-semibold">New playlist</span>
        </button>
        {playlists.slice(0, 4).map((p) => (
          <PlaylistCard key={p.id} playlist={p} count={(p.track_ids || []).length} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}

function SongChartsTeaser({ tracks, onOpen, onPlay }) {
  const top = [...tracks].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 5);
  if (top.length === 0) return null;
  return (
    <section className="px-1">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold">Trending in your library</h3>
        <button onClick={onOpen} className="text-[11px] text-white/50 hover:text-white">See full chart →</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {top.map((t) => (
          <button key={t.id} onClick={() => onPlay(t)} className="text-left rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:bg-white/10">
            <div className="aspect-square bg-white/10">
              {t.artwork ? <img src={t.artwork} alt="" className="w-full h-full object-cover" /> : null}
            </div>
            <div className="p-2.5">
              <p className="text-xs font-semibold truncate">{t.title}</p>
              <p className="text-[10px] text-white/45 truncate">{t.artist_name}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}