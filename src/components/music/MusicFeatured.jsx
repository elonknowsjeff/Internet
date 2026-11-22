import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, Play, Sparkles, Youtube, Link2 } from "lucide-react";
import { useSpotify } from "@/components/SpotifyProvider";
import SpotifyTab from "@/components/music/SpotifyTab";

const EMPTY_ART = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300";

const SPOTIFY_FEATURED = [
  { id: "37i9dQZF1DXcBWIGoYBM5M", title: "Today's Top Hits", art: "https://mosaic.scdn.co/640/ab6761610000e5ebd2b2b...0", owner: "Spotify", tracks: 50 },
  { id: "37i9dQZF1DX0XUsuxWHRQd", title: "RapCaviar", art: "https://i.scdn.co/image/ab6761610000e5eb5b2b2b...", owner: "Spotify", tracks: 50 },
  { id: "37i9dQZF1DWXRqgorJjAuU", title: "Rock Classics", art: "https://i.scdn.co/image/ab6761610000e5eb...", owner: "Spotify", tracks: 50 },
  { id: "37i9dQZF1DX10zKzsJQjvX", title: "Chill Hits", art: "https://i.scdn.co/image/ab6761610000e5...", owner: "Spotify", tracks: 60 },
  { id: "37i9dQZF1DX4sWSpk8J9am", title: "Pop Rising", art: "https://i.scdn.co/image/ab6761610000e5...", owner: "Spotify", tracks: 45 },
  { id: "37i9dQZF1DX0vHZ8elq0Hx", title: "Hot Country", art: "https://i.scdn.co/image/ab6761610000e5...", owner: "Spotify", tracks: 50 },
];

const YT_FEATURED = [
  { id: "VLZ2Q7w8VfI" },
  { id: "RjmR2T9RfIE" },
  { id: "y6120b8p..." },
];

export default function MusicFeatured({ user }) {
  const spotify = useSpotify();
  const [bb, setBb] = useState([]);
  const [bbLoading, setBbLoading] = useState(true);
  const [spotifyOpen, setSpotifyOpen] = useState(false);
  const [ytPicks, setYtPicks] = useState([]);
  const [ytPlay, setYtPlay] = useState(null);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          model: "gemini_3_flash",
          add_context_from_internet: true,
          prompt: "Return the current Billboard Hot 100 top 8 songs as JSON. Each item: rank (number), title, artist. Use the most recent official chart.",
          response_json_schema: { type: "object", properties: { chart: { type: "array", items: { type: "object", properties: { rank: { type: "number" }, title: { type: "string" }, artist: { type: "string" } } } } } },
        });
        if (!c) setBb((res?.chart || []).filter((e) => e && e.title).slice(0, 8));
      } catch {}
      if (!c) setBbLoading(false);
    })();
    return () => { c = true; };
  }, []);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          model: "gemini_3_flash",
          add_context_from_internet: true,
          prompt: "Return 8 of the most popular official music videos on YouTube right now as JSON. Each item: video_id (the 11-char YouTube ID only), title, channel. Use real current trending music videos.",
          response_json_schema: { type: "object", properties: { videos: { type: "array", items: { type: "object", properties: { video_id: { type: "string" }, title: { type: "string" }, channel: { type: "string" } } } } } },
        });
        if (!c) setYtPicks((res?.videos || []).filter((v) => v.video_id && /^[A-Za-z0-9_-]{11}$/.test(v.video_id)).slice(0, 8));
      } catch {}
      if (!c) setYtPicks([]);
    })();
    return () => { c = true; };
  }, []);

  const playBillboard = async (entry) => {
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(entry.title + " " + entry.artist)}&media=music&limit=1`);
      const j = await res.json();
      if (j.results?.[0]?.previewUrl) {
        const r = j.results[0];
        spotify?.audio?.play?.({ key: `it:${r.trackId}`, src: r.previewUrl, title: r.trackName, subtitle: `${r.artistName} · 30s`, art: r.artworkUrl100, duration: 30 });
      }
    } catch {}
  };

  const openPlaylist = (p) => spotify?.open?.({ type: "playlist", id: p.id, title: p.title });

  return (
    <div className="space-y-5">
      {/* Spotify-style featured section */}
      <section>
        <div className="mb-2.5 flex items-center gap-2 px-1">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/20"><Link2 className="h-4 w-4 text-emerald-400" /></span>
          <h2 className="text-[16px] font-extrabold">Spotify</h2>
          <span className="text-[11px] text-white/40">· Featured playlists</span>
          <button onClick={() => setSpotifyOpen(true)} className="ml-auto text-[12px] font-semibold text-emerald-300 hover:text-emerald-200">Open Spotify →</button>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {SPOTIFY_FEATURED.map((p) => (
            <button key={p.id} onClick={() => openPlaylist(p)} className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-emerald-900/40 to-[#0b0b0d] p-3 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-400/40">
              <div className="aspect-square w-full rounded-lg bg-gradient-to-br from-emerald-500/30 to-emerald-900/40 grid place-items-center mb-2 overflow-hidden">
                <span className="text-2xl">🎵</span>
              </div>
              <p className="text-[12.5px] font-bold truncate">{p.title}</p>
              <p className="text-[10.5px] text-white/45 truncate">By {p.owner} · {p.tracks} songs</p>
              <span className="absolute right-2.5 bottom-2.5 grid h-9 w-9 place-items-center rounded-full bg-emerald-400 text-black opacity-0 shadow-lg transition-all group-hover:opacity-100"><Play className="h-4 w-4 fill-black" /></span>
            </button>
          ))}
        </div>
      </section>

      {/* Billboard charts */}
      <section>
        <div className="mb-2.5 flex items-center gap-2 px-1">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-500/20"><Sparkles className="h-4 w-4 text-orange-400" /></span>
          <h2 className="text-[16px] font-extrabold">Trending Now</h2>
          <span className="text-[11px] text-white/40">· Billboard Hot 100</span>
        </div>
        {bbLoading ? (
          <div className="flex items-center gap-2 py-6 text-white/40"><Loader2 className="h-4 w-4 animate-spin" /> Loading the chart…</div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {bb.map((e) => (
              <button key={e.rank} onClick={() => playBillboard(e)} className="group flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-center hover:border-orange-400/40 hover:bg-white/[0.06]">
                <span className="text-[20px] font-extrabold text-orange-400/80">#{e.rank}</span>
                <span className="text-[11px] font-semibold leading-tight line-clamp-2">{e.title}</span>
                <span className="text-[10px] text-white/40 leading-tight line-clamp-1">{e.artist}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* YouTube Music — real video grid, plays inline */}
      <section>
        <div className="mb-2.5 flex items-center gap-2 px-1">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-red-500/20"><Youtube className="h-4 w-4 text-red-500" /></span>
          <h2 className="text-[16px] font-extrabold">YouTube</h2>
          <span className="text-[11px] text-white/40">· Trending music videos</span>
          <Link to="/video" className="ml-auto text-[12px] font-semibold text-red-400 hover:text-red-300">More video →</Link>
        </div>
        {ytPicks.length === 0 ? (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-video rounded-xl bg-white/[0.04] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ytPicks.map((v) => (
              <button key={v.video_id} onClick={() => setYtPlay(v)} className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] text-left hover:border-red-500/40">
                <div className="relative aspect-video bg-black overflow-hidden">
                  <img src={`https://i.ytimg.com/vi/${v.video_id}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute inset-0 grid place-items-center bg-black/20 transition-colors group-hover:bg-black/10">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-red-600 text-white shadow-lg group-hover:scale-110 transition-transform"><Play className="h-5 w-5 fill-white" /></span>
                  </span>
                  <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white/90">HD</span>
                </div>
                <div className="p-2.5">
                  <p className="text-[12.5px] font-semibold leading-tight line-clamp-2">{v.title}</p>
                  <p className="text-[10.5px] text-white/40 truncate mt-0.5">{v.channel}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {ytPlay && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setYtPlay(null)}>
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-[14px] font-bold truncate">{ytPlay.title}</p>
                <p className="text-[11.5px] text-white/45 truncate">{ytPlay.channel}</p>
              </div>
              <button onClick={() => setYtPlay(null)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10 shrink-0">✕</button>
            </div>
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${ytPlay.video_id}?autoplay=1&rel=0`}
                title={ytPlay.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        </div>
      )}

      {spotifyOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSpotifyOpen(false)}>
          <div className="mt-6 w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0b0b0d] shadow-2xl max-h-[85vh] overflow-y-auto thin-scrollbar" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0b0b0d]/95 px-4 py-3 backdrop-blur">
              <h3 className="text-[14px] font-bold">Spotify</h3>
              <button onClick={() => setSpotifyOpen(false)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10">✕</button>
            </div>
            <div className="p-3"><SpotifyTab user={user} /></div>
          </div>
        </div>
      )}
    </div>
  );
}