import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link2, Loader2, Music2, ExternalLink } from "lucide-react";

export const parseSpotify = (input) => {
  const text = (input || "").trim();
  const url = text.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(track|album|playlist|artist)\/([A-Za-z0-9]+)/i);
  if (url) return { type: url[1].toLowerCase(), id: url[2] };
  const uri = text.match(/^spotify:(track|album|playlist|artist):([A-Za-z0-9]+)$/i);
  if (uri) return { type: uri[1].toLowerCase(), id: uri[2] };
  return null;
};

export const spotifyEmbed = (type, id) =>
  `https://open.spotify.com/embed/${type || "track"}/${id}?utm_source=generator&theme=0`;

export default function SpotifyImport({ onImported, user }) {
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [last, setLast] = useState(null);

  const add = async () => {
    const hit = parseSpotify(link);
    if (!hit) { setErr("Paste a Spotify song, album or playlist link."); return; }
    setBusy(true); setErr("");
    let meta = null;
    try {
      const r = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(`https://open.spotify.com/${hit.type}/${hit.id}`)}`);
      if (r.ok) meta = await r.json();
    } catch (e) {}
    try {
      const handle = user?.username || user?.email?.split("@")[0] || "you";
      const saved = await base44.entities.Track.create({
        title: meta?.title || `Spotify ${hit.type}`,
        artist_name: meta?.author_name || "Spotify",
        artist_handle: handle,
        genre: "Spotify",
        artwork: meta?.thumbnail_url || "",
        duration: 0,
        source: "spotify",
        spotify_id: hit.id,
        spotify_type: hit.type,
        uploaded_by_id: user?.id || "",
        uploaded_by_name: user?.full_name || "You",
        uploaded_by_handle: handle,
      });
      setLast({ ...saved, spotify_type: hit.type });
      setLink("");
      onImported?.();
    } catch (e) {
      setErr("Couldn't save that link. Try again.");
    }
    setBusy(false);
  };

  return (
    <div className="p-3 space-y-4">
      <div className="rounded-xl bg-white/5 border border-white/10 p-3">
        <h2 className="text-lg font-bold flex items-center gap-2"><Link2 className="w-4 h-4 text-emerald-400" /> Add from Spotify</h2>
        <p className="text-xs text-white/55 mt-0.5">Paste a song, album or playlist link — it plays full inside Walza with the official Spotify player.</p>
        <div className="flex gap-2 mt-3">
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://open.spotify.com/track/…"
            className="flex-1 bg-black/40 border border-white/10 rounded-full px-3 py-2 text-sm outline-none focus:border-white/30"
          />
          <button onClick={add} disabled={busy || !link.trim()} className="px-4 py-2 rounded-full bg-white text-black text-sm font-bold disabled:opacity-40 flex items-center gap-1.5">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Add
          </button>
        </div>
        {err && <p className="text-xs text-rose-300 mt-2">{err}</p>}
        {last && (
          <div className="mt-3 rounded-lg bg-black/30 border border-white/10 p-2">
            <p className="text-xs text-white/70 flex items-center gap-1.5"><Music2 className="w-3.5 h-3.5 text-emerald-400" /> Added {last.title}</p>
            <iframe
              title="spotify-preview"
              src={spotifyEmbed(last.spotify_type || "track", last.spotify_id)}
              width="100%"
              height={last.spotify_type === "track" ? 152 : 352}
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="mt-2 rounded-lg"
            />
          </div>
        )}
      </div>
      <a href="https://open.spotify.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-white/55 hover:text-white">
        Open Spotify to copy a link <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}