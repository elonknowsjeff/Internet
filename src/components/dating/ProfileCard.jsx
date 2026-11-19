import React, { useState } from "react";
import { Heart, X, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

export default function ProfileCard({ profile, onLike, onPass }) {
  const tags = (profile.interests || "").split(",").map((t) => t.trim()).filter(Boolean).slice(0, 4);
  const pics = [profile.photo, ...(profile.photos || [])].filter(Boolean);
  const [i, setI] = useState(0);
  const step = (d) => setI((v) => (v + d + pics.length) % pics.length);

  return (
    <article className="rounded-3xl overflow-hidden gloss-strong">
      <div className="relative aspect-[4/5] bg-neutral-900">
        {pics.length > 0 ? (
          <img src={pics[i]} alt={profile.display_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl font-black text-white/20">
            {(profile.display_name || "?")[0].toUpperCase()}
          </div>
        )}

        {pics.length > 1 && (
          <>
            <button onClick={() => step(-1)} aria-label="Previous photo" className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/55 backdrop-blur flex items-center justify-center hover:bg-black/75">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => step(1)} aria-label="Next photo" className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/55 backdrop-blur flex items-center justify-center hover:bg-black/75">
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute top-2 left-0 right-0 flex justify-center gap-1">
              {pics.map((p, n) => (
                <span key={p + n} className={`h-1 rounded-full transition-all ${n === i ? "w-4 bg-white" : "w-1.5 bg-white/40"}`} />
              ))}
            </div>
          </>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="font-bold leading-tight truncate">
            {profile.display_name}
            {profile.age ? <span className="font-normal text-neutral-300">, {profile.age}</span> : null}
          </p>
          {profile.location ? (
            <p className="text-[11px] text-neutral-300 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {profile.location}</p>
          ) : null}
          {profile.bio ? <p className="text-[11px] text-neutral-300 mt-1 line-clamp-2">{profile.bio}</p> : null}
        </div>
      </div>
      <div className="p-3 space-y-2">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-neutral-300">{t}</span>
            ))}
          </div>
        )}
        {profile.looking_for ? <p className="text-[10px] text-neutral-500">Looking for {profile.looking_for}</p> : null}
        <div className="flex gap-2">
          <button onClick={() => onPass(profile)} className="flex-1 py-2 rounded-full border border-white/15 text-xs font-semibold text-neutral-300 hover:bg-white/10 flex items-center justify-center gap-1">
            <X className="w-3.5 h-3.5" /> Pass
          </button>
          <button onClick={() => onLike(profile)} className="flex-1 py-2 rounded-full brand-grad text-black text-xs font-bold flex items-center justify-center gap-1">
            <Heart className="w-3.5 h-3.5" /> Like
          </button>
        </div>
      </div>
    </article>
  );
}