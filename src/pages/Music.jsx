import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAudio } from "@/components/AudioProvider";
import { Loader2, BarChart3, Sparkles, Link2, Upload, X } from "lucide-react";
import SoundCloudShell from "@/components/music/SoundCloudShell";
import ChartsPanel from "@/components/music/ChartsPanel";
import SpotifyTab from "@/components/music/SpotifyTab";
import AiSongStudio from "@/components/music/AiSongStudio";
import MusicUpload from "@/components/music/MusicUpload";
import MusicMarketplace from "@/components/music/MusicMarketplace";
import PlaylistsPanel from "@/components/music/PlaylistsPanel";
import MidiStudio from "@/components/music/MidiStudio";
import MusicFeatured from "@/components/music/MusicFeatured";
import { useSpotify } from "@/components/SpotifyProvider";

const EMPTY_ART = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300";

function Overlay({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="mt-6 w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0b0b0d] shadow-2xl max-h-[85vh] overflow-y-auto thin-scrollbar" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0b0b0d]/95 px-4 py-3 backdrop-blur">
          <h3 className="text-[14px] font-bold">{title}</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-3">{children}</div>
      </div>
    </div>
  );
}

export default function Music() {
  const audio = useAudio();
  const spotify = useSpotify();
  const [tracks, setTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [extra, setExtra] = useState(null);
  const [billboard, setBillboard] = useState([]);
  const [bbLoading, setBbLoading] = useState(false);
  const [searchErr, setSearchErr] = useState("");

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const load = async () => {
    try {
      const [tr, pl] = await Promise.all([
        base44.entities.Track.list("-created_date", 200),
        base44.entities.Playlist.list("-created_date", 100).catch(() => []),
      ]);
      setTracks(tr.filter((t) => t.file_uri && t.source !== "spotify"));
      setPlaylists(pl);
    } catch { setTracks([]); }
    finally { setLoading(false); }
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
      } catch {}
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
    if (t.source === "spotify") { spotify.open({ type: t.spotify_type || "track", id: t.spotify_id, title: t.title }); return; }
    if (current?.key === `cat:${t.id}`) { audio.toggle(); return; }
    try {
      const r = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: t.file_uri });
      audio.play({ key: `cat:${t.id}`, src: r.signed_url, title: t.title, subtitle: t.artist_name, art: t.artwork || EMPTY_ART, duration: t.duration || 0, ...trackNeighbours(t, pool || tracks) });
    } catch {}
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
      if (j.results && j.results[0]) playPreview(j.results[0]); else setSearchErr("No preview found for that track.");
    } catch { setSearchErr("Search unavailable right now."); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-white/40"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading your music…</div>;
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] px-3 sm:px-4 pb-28">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-3">
        <button onClick={() => setExtra("charts")} className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-[12px] font-semibold hover:bg-white/[0.12]"><BarChart3 className="h-3.5 w-3.5" style={{ color: "#FF5500" }} /> Charts</button>
        <button onClick={() => setExtra("spotify")} className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-[12px] font-semibold hover:bg-white/[0.12]"><Link2 className="h-3.5 w-3.5 text-emerald-400" /> Spotify</button>
        <button onClick={() => setExtra("create")} className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-[12px] font-semibold hover:bg-white/[0.12]"><Sparkles className="h-3.5 w-3.5" style={{ color: "#FF5500" }} /> AI Create</button>
        <button onClick={() => setUploadOpen(true)} className="flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-bold text-black" style={{ backgroundColor: "#FF5500" }}><Upload className="h-3.5 w-3.5" /> Upload</button>
      </div>

      <SoundCloudShell
        tracks={tracks}
        playlists={playlists}
        onPlay={(t) => play(t, tracks)}
        currentKey={current?.key}
        playing={playing}
        onUpload={() => setUploadOpen(true)}
        libraryView={<div className="p-1"><PlaylistsPanel playlists={playlists} tracks={tracks} onChanged={load} onPlay={(t) => play(t, tracks)} currentKey={current?.key} playing={playing} /></div>}
        marketView={<div className="p-1"><MusicMarketplace user={user} audio={audio} current={current} playing={playing} /></div>}
        studioView={<div className="p-1"><MidiStudio /></div>}
      />

      <div className="mt-5">
        <MusicFeatured user={user} />
      </div>

      {extra === "charts" && (
        <Overlay title="Charts · Billboard Hot 100" onClose={() => setExtra(null)}>
          {searchErr && <p className="px-2 py-2 text-[12px] text-white/50">{searchErr}</p>}
          <ChartsPanel tracks={tracks} currentKey={current?.key} playing={playing} onPlay={(t) => play(t, tracks)} billboard={billboard} bbLoading={bbLoading} onPlayBillboard={playBillboard} />
        </Overlay>
      )}
      {extra === "spotify" && (
        <Overlay title="Spotify" onClose={() => setExtra(null)}>
          <SpotifyTab user={user} />
        </Overlay>
      )}
      {extra === "create" && (
        <Overlay title="AI Song Studio" onClose={() => setExtra(null)}>
          <AiSongStudio />
        </Overlay>
      )}

      {uploadOpen && <MusicUpload user={user} onClose={() => setUploadOpen(false)} onDone={load} />}
    </div>
  );
}