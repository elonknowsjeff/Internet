import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, MapPin, X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import HeartbeatMonitor from "@/components/dating/HeartbeatMonitor";
import ProfileSong from "@/components/dating/ProfileSong";

const picsOf = (p) => [p?.photo, ...(p?.photos || [])].filter(Boolean);

function CardFace({ profile }) {
  const pics = picsOf(profile);
  const [i, setI] = useState(0);
  const tags = (profile.interests || "").split(",").map((t) => t.trim()).filter(Boolean);
  const step = (d) => setI((v) => (v + d + pics.length) % pics.length);

  return (
    <div className="absolute inset-0 flex flex-col rounded-3xl overflow-hidden border border-white/12 bg-neutral-900 neon-edge">
      {/* photo stage */}
      <div className="relative flex-1 min-h-0 bg-neutral-950">
        {pics.length > 0 ? (
          <img src={pics[i] ?? pics[0]} alt={profile.display_name} className="w-full h-full object-cover" draggable={false} />
        ) : (
          <div className="w-full h-full grid place-items-center text-6xl font-black text-white/20">{(profile.display_name || "?")[0].toUpperCase()}</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
        {pics.length > 1 && (
          <>
            <button onClick={() => step(-1)} aria-label="Previous photo" className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/55 backdrop-blur grid place-items-center hover:bg-black/75">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => step(1)} aria-label="Next photo" className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/55 backdrop-blur grid place-items-center hover:bg-black/75">
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute top-2 left-0 right-0 flex justify-center gap-1">
              {pics.map((p, n) => (
                <span key={p + n} className={`h-1 rounded-full transition-all ${n === i ? "w-5 bg-white" : "w-1.5 bg-white/40"}`} />
              ))}
            </div>
          </>
        )}
        <div className="absolute left-3 bottom-3 right-3">
          <p className="text-lg font-extrabold leading-tight truncate">
            {profile.display_name}
            {profile.age ? <span className="font-normal text-neutral-200">, {profile.age}</span> : null}
          </p>
          {profile.location ? (
            <p className="text-[11.5px] text-neutral-300 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {profile.location}
              {profile.distance_km ? <span className="text-neutral-400">· {profile.distance_km} km</span> : null}
            </p>
          ) : null}
        </div>
      </div>

      {/* clear bio + interests section */}
      <div className="shrink-0 bg-neutral-900/95 backdrop-blur p-3.5 space-y-2.5">
        {profile.bio ? (
          <p className="text-[12px] leading-relaxed text-neutral-200 line-clamp-4">{profile.bio}</p>
        ) : (
          <p className="text-[11px] text-neutral-500 italic">No bio yet.</p>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 6).map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-full bg-white/8 border border-white/10 text-[10px] text-neutral-200 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" style={{ color: "var(--brand)" }} /> {t}
              </span>
            ))}
          </div>
        )}
        {profile.looking_for && (
          <p className="text-[10.5px] text-neutral-400">Looking for <span className="text-neutral-200 font-medium">{profile.looking_for}</span></p>
        )}
        <HeartbeatMonitor profile={profile} />
        {profile.song_url && <ProfileSong url={profile.song_url} title={profile.song_title} artist={profile.song_artist} />}
      </div>
    </div>
  );
}

export default function SwipeDeck({ profiles, onLike, onPass }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);

  const card = profiles[index];
  const next = profiles[index + 1];

  const choose = (kind) => {
    if (!card) return;
    setDir(kind === "like" ? 1 : -1);
    if (kind === "like") onLike(card);
    else onPass(card);
    setIndex((i) => i + 1);
  };

  if (!card) {
    return (
      <div className="rounded-3xl gloss-strong p-8 text-center">
        <p className="text-sm font-semibold">You're all caught up</p>
        <p className="text-[11.5px] text-neutral-400 mt-1">Widen your filters or check back later for new people.</p>
        <button onClick={() => setIndex(0)} className="mt-3 px-4 py-1.5 rounded-full border border-white/15 text-[12px] font-semibold text-white/70 hover:bg-white/10">
          Start over
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[340px]">
      <div className="relative h-[540px] select-none">
        {next && (
          <div className="absolute inset-0 scale-[0.94] translate-y-2 opacity-60 rounded-3xl overflow-hidden">
            <CardFace profile={next} />
          </div>
        )}

        <AnimatePresence initial={false}>
          <motion.div
            key={card.id}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={(e, info) => {
              if (info.offset.x > 110) choose("like");
              else if (info.offset.x < -110) choose("pass");
            }}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ x: dir * 420, rotate: dir * 14, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <CardFace profile={card} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-4 mt-4">
        <button onClick={() => choose("pass")} className="w-12 h-12 rounded-full border border-white/20 grid place-items-center text-neutral-300 hover:bg-white/10 hover:text-white transition" aria-label="Pass">
          <X className="w-5 h-5" />
        </button>
        <button onClick={() => choose("like")} className="w-14 h-14 rounded-full neon-btn grid place-items-center" aria-label="Like">
          <Heart className="w-6 h-6" />
        </button>
      </div>
      <p className="text-center text-[10.5px] text-neutral-500 mt-2">Swipe right to like · left to pass</p>
    </div>
  );
}