import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAudio } from "@/components/AudioProvider";
import { useSpotify } from "@/components/SpotifyProvider";
import { Apple, Music2, Play, Pause, Loader2, ExternalLink, ListMusic } from "lucide-react";

const APPLE_PLAYLISTS = [
  { key: "today", name: "Today's Hits", term: "top hits 2026" },
  { key: "chill", name: "Chill Vibes", term: "chill acoustic" },
  { key: "hiphop", name: "Hip-Hop Essentials", term: "hip hop hits" },
  { key: "throwback", name: "Throwbacks", term: "2000s hits" },
];

const fetchSongs = async (term, limit = 10) => {
  const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=${limit}`);
  const json = await res.json();
  return (json.results || []).filter((r) => r.previewUrl);
};

export default function StreamingServices({ onOpenImport }) {
  const audio = useAudio();
  const spotify = useSpotify();
  const [apple, setApple] = useState({});
  const [spotifyTracks, setSpotifyTracks] = useState([]);
  const [openPlaylist, setOpenPlaylist] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [shelves, saved] = await Promise.all([
        Promise.all(APPLE_PLAYLISTS.map(async (p) => [p.key, await fetchSongs(p.term).catch(() => [])])),
        base44.entities.Track.filter({ source: "spotify" }, { sort: "-created_date", limit: 40 }).catch(() => []),
      ]);
      if (!alive) return;
      setApple(Object.fromEntries(shelves));
      setSpotifyTracks(saved?.items || saved || []);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const current = audio?.current;
  const playing = audio?.playing;

  const playPreview = (r) => {
    if (current?.key === `it:${r.trackId}`) { audio.toggle(); return; }
    audio.play({
      key: `it:${r.trackId}`,
      src: r.previewUrl,
      title: r.trackName,
      subtitle: `${r.artistName} · 30s preview`,
      art: r.artworkUrl100?.replace("100x100", "300x300"),
      duration: 30,
    });
  };

  const playSpotify = (t) => spotify.open({ type: t.spotify_type || "track", id: t.spotify_id, title: t.title });

  const PlaylistCard = ({ playlist, cover, count, active }) => (
    <button
      onClick={() => setOpenPlaylist(active ? "" : playlist.key)}
      className={`group w-[148px] shrink-0 text-left ${active ? "opacity-100" : ""}`}
    >
      <span className="relative block overflow-hidden rounded-xl border border-white/[0.09] bg-white/[0.05] aspect-square">
        {cover ? <img src={cover} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <span className="grid h-full place-items-center"><ListMusic className="h-7 w-7 text-white/25" /></span>}
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <span className="block truncate text-[11.5px] font-semibold text-white">{playlist.name}</span>
          <span className="block text-[10px] text-white/50">{count} songs</span>
        </span>
      </span>
    </button>
  );

  return (
    <div className="space-y-4">
      <section className="panel p-3.5">
        <h2 className="flex items-center gap-2 font-display text-[15px] font-semibold tracking-[-0.01em]">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-white text-black"><Apple className="h-3.5 w-3.5" /></span>
          Apple Music
        </h2>
        <p className="mt-0.5 text-[11px] text-white/40">Playlists of songs that are out right now — tap a playlist, then a song.</p>

        {loading ? (
          <div className="flex items-center gap-2 py-6 text-[12px] text-white/40"><Loader2 className="h-4 w-4 animate-spin" /> Loading playlists…</div>
        ) : (
          <>
            <div className="mt-2.5 flex gap-2.5 overflow-x-auto pb-1 thin-scrollbar">
              {APPLE_PLAYLISTS.map((p) => (
                <PlaylistCard
                  key={p.key}
                  playlist={p}
                  cover={apple[p.key]?.[0]?.artworkUrl100?.replace("100x100", "300x300")}
                  count={apple[p.key]?.length || 0}
                  active={openPlaylist === p.key}
                />
              ))}
            </div>

            {openPlaylist && apple[openPlaylist]?.length > 0 && (
              <div className="mt-2 rounded-xl border border-white/[0.07] bg-white/[0.025] p-1.5">
                {apple[openPlaylist].map((r) => {
                  const isCur = current?.key === `it:${r.trackId}`;
                  return (
                    <button key={r.trackId} onClick={() => playPreview(r)} className="group flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left hover:bg-white/[0.06]">
                      <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-white/[0.06]">
                        <img src={r.artworkUrl100} alt="" className="h-full w-full object-cover" />
                        <span className={`absolute inset-0 grid place-items-center bg-black/45 ${isCur ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                          {isCur && playing ? <Pause className="h-3.5 w-3.5 fill-white" /> : <Play className="h-3.5 w-3.5 fill-white" />}
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] font-medium" style={isCur ? { color: "var(--brand)" } : undefined}>{r.trackName}</span>
                        <span className="block truncate text-[11px] text-white/40">{r.artistName}{r.collectionName ? ` · ${r.collectionName}` : ""}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      <section className="panel p-3.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-display text-[15px] font-semibold tracking-[-0.01em]">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-[#1DB954] text-black"><Music2 className="h-3.5 w-3.5" /></span>
            Spotify
          </h2>
          {onOpenImport && (
            <button onClick={onOpenImport} className="flex items-center gap-1 rounded-full border border-white/[0.12] bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold hover:bg-white/[0.12]">
              Import <ExternalLink className="h-3 w-3" />
            </button>
          )}
        </div>
        <p className="mt-0.5 text-[11px] text-white/40">Playlists you saved from Spotify — they open in the Spotify player.</p>

        {spotifyTracks.length === 0 ? (
          <p className="py-5 text-center text-[12px] text-white/40">No Spotify songs saved yet — import a playlist to fill this shelf.</p>
        ) : (
          <div className="mt-2 rounded-xl border border-white/[0.07] bg-white/[0.025] p-1.5">
            {spotifyTracks.map((t) => (
              <button key={t.id} onClick={() => playSpotify(t)} className="group flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left hover:bg-white/[0.06]">
                <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-[#1DB954]/20">
                  {t.artwork ? <img src={t.artwork} alt="" className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center"><Music2 className="h-3.5 w-3.5 text-[#1DB954]" /></span>}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-medium">{t.title}</span>
                  <span className="block truncate text-[11px] text-white/40">{t.artist_name}</span>
                </span>
                <Play className="h-3.5 w-3.5 text-white/30 group-hover:text-white" />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}