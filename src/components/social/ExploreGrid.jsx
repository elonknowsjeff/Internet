import React, { useMemo } from "react";
import { Heart, MessageCircle, PlayCircle, ImageOff } from "lucide-react";

const FALLBACK = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400";

export default function ExploreGrid({ posts = [], onOpenAuthor }) {
  const media = useMemo(
    () => posts.filter((p) => p.media_url && p.media_type !== "video"),
    [posts]
  );
  const videos = useMemo(
    () => posts.filter((p) => p.media_url && p.media_type === "video"),
    [posts]
  );

  if (media.length === 0 && videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-white/45">
        <ImageOff className="mb-2 h-7 w-7" />
        <p className="text-[13px] font-semibold">No media to explore yet</p>
        <p className="mt-1 text-[12px] text-white/35">Posts with photos show up here in a grid.</p>
      </div>
    );
  }

  const Tile = ({ p }) => (
    <button
      onClick={() => onOpenAuthor?.(p.author_handle)}
      className="group relative aspect-square overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04]"
    >
      {p.media_type === "video" ? (
        <>
          <video src={p.media_url} muted className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]" />
          <PlayCircle className="absolute right-2 top-2 h-5 w-5 text-white/90 drop-shadow" />
        </>
      ) : (
        <img
          src={p.media_url}
          alt={p.content || p.author_name}
          onError={(e) => { e.currentTarget.src = FALLBACK; }}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
        />
      )}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/0 to-black/0 p-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <p className="truncate text-[12px] font-bold text-white">{p.author_name}</p>
        <div className="mt-0.5 flex items-center gap-3 text-[11px] text-white/80">
          <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {p.likes || 0}</span>
          <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {p.comments || 0}</span>
        </div>
      </div>
    </button>
  );

  return (
    <div className="px-3 py-3">
      {videos.length > 0 && (
        <>
          <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Reels & clips</p>
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {videos.slice(0, 6).map((p) => <Tile key={p.id} p={p} />)}
          </div>
        </>
      )}
      <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Photos</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {media.map((p) => <Tile key={p.id} p={p} />)}
      </div>
    </div>
  );
}