import React, { useMemo, useState } from "react";
import { Camera, X, Heart } from "lucide-react";

export default function PhotoRail({ posts = [] }) {
  const [open, setOpen] = useState(null);

  const photos = useMemo(
    () => posts.filter((p) => p.media_url && p.media_type !== "video").slice(0, 14),
    [posts]
  );

  if (photos.length === 0) return null;

  return (
    <section className="border-b border-white/[0.06] py-3">
      <div className="flex items-center justify-between px-4 mb-2.5">
        <h2 className="text-[16px] font-extrabold flex items-center gap-2">
          <Camera className="w-4 h-4" style={{ color: "var(--brand)" }} /> Moments
        </h2>
        <span className="text-[11.5px] text-white/40">{photos.length} new photos</span>
      </div>
      <div className="flex gap-2.5 overflow-x-auto scrollbar-none px-4 snap-x snap-mandatory">
        {photos.map((p) => (
          <button
            key={p.id}
            onClick={() => setOpen(p)}
            className="group relative shrink-0 w-[168px] h-[230px] snap-start rounded-2xl overflow-hidden border border-white/10 transition-transform duration-300 hover:-translate-y-0.5"
          >
            <img
              src={p.media_url}
              alt=""
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
            />
            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/85 to-transparent text-left">
              <p className="text-[11px] font-semibold truncate">@{p.author_handle}</p>
            </div>
          </button>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-xl grid place-items-center p-4 animate-fade-in"
          onClick={() => setOpen(null)}
        >
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={open.author_avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-white/15"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{open.author_name}</p>
                  <p className="text-[11.5px] text-white/50 truncate">@{open.author_handle}</p>
                </div>
              </div>
              <button onClick={() => setOpen(null)} className="w-9 h-9 rounded-full bg-white/10 grid place-items-center hover:bg-white/20">
                <X className="w-4 h-4" />
              </button>
            </div>
            <img src={open.media_url} alt="" className="w-full max-h-[72vh] object-contain rounded-2xl bg-black" />
            {open.content && <p className="mt-3 text-[14.5px] text-white/85 leading-relaxed">{open.content}</p>}
            <p className="mt-2 text-[12px] text-white/45 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" /> {open.likes || 0} likes
            </p>
          </div>
        </div>
      )}
    </section>
  );
}