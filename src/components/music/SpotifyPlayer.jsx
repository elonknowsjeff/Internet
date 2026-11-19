import React from "react";
import { X, Music2 } from "lucide-react";
import { spotifyEmbed } from "@/components/music/SpotifyImport";

export default function SpotifyPlayer({ spotify, onClose }) {
  if (!spotify) return null;
  const type = spotify.type || "track";
  return (
    <div className="fixed bottom-16 right-2 z-[60] w-[min(94vw,420px)] rounded-xl overflow-hidden bg-[#121212] border border-white/15 shadow-2xl">
      <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white/5">
        <Music2 className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-[11px] text-white/70 truncate flex-1">{spotify.title || "Spotify player"}</span>
        <button onClick={onClose} className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center"><X className="w-3.5 h-3.5" /></button>
      </div>
      <iframe
        title="spotify-player"
        src={spotifyEmbed(type, spotify.id)}
        width="100%"
        height={type === "track" ? 152 : 380}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </div>
  );
}