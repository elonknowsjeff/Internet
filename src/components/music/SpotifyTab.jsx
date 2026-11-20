import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useSpotify } from "@/components/SpotifyProvider";
import SpotifyImport, { spotifyEmbed } from "@/components/music/SpotifyImport";
import { Play, Pause, Loader2, Music2, Trash2, Link2 } from "lucide-react";

const GREEN = "#1DB954";

export default function SpotifyTab({ user }) {
  const spotify = useSpotify();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);

  const load = async () => {
    try {
      const all = await base44.entities.Track.list("-created_date", 100);
      setItems(all.filter((t) => t.source === "spotify"));
    } catch (e) { setItems([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const play = (t) => {
    spotify.open({ type: t.spotify_type || "track", id: t.spotify_id, title: t.title });
  };

  const remove = async (t) => {
    if (!confirm(`Remove "${t.title}" from your Spotify collection?`)) return;
    try { await base44.entities.Track.delete(t.id); load(); } catch (e) {}
  };

  return (
    <div className="p-3 sm:p-4 space-y-4">
      {/* header band */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] p-5 bg-gradient-to-br from-[#1DB954]/25 via-[#0b0b0d] to-[#0b0b0d]">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl" style={{ background: GREEN }}>
            <Music2 className="h-6 w-6 text-black" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[20px] font-black tracking-tight">Spotify</h2>
            <p className="text-[12px] text-white/55">Your saved Spotify tracks, albums and playlists — full playback inside Valo.</p>
          </div>
          <button
            onClick={() => setShowImport((s) => !s)}
            className="flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-bold text-black"
            style={{ background: GREEN }}
          >
            <Link2 className="h-3.5 w-3.5" /> Add link
          </button>
        </div>
      </div>

      {showImport && (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03]">
          <SpotifyImport user={user} onImported={() => { load(); setShowImport(false); }} />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-white/40 text-sm">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading your Spotify collection…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
          <Music2 className="mx-auto mb-2 h-8 w-8 text-white/25" />
          <p className="text-[13px] text-white/50">No Spotify links saved yet.</p>
          <button onClick={() => setShowImport(true)} className="mt-3 rounded-full px-4 py-2 text-[12.5px] font-bold text-black" style={{ background: GREEN }}>
            Add your first link
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((t) => (
            <div key={t.id} className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
              <div className="relative">
                <iframe
                  title={`spotify-${t.id}`}
                  src={spotifyEmbed(t.spotify_type || "track", t.spotify_id)}
                  width="100%"
                  height={t.spotify_type === "track" ? 152 : 352}
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="block"
                />
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5">
                <button onClick={() => play(t)} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-black" style={{ background: GREEN }}>
                  <Play className="h-4 w-4 fill-black" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{t.title}</p>
                  <p className="truncate text-[11px] text-white/45">{t.artist_name} · {t.spotify_type}</p>
                </div>
                <button onClick={() => remove(t)} className="rounded-full p-1.5 text-white/30 opacity-0 transition-opacity hover:text-rose-300 group-hover:opacity-100">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}