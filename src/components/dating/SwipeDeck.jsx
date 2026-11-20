import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, MapPin, X } from "lucide-react";
import HeartbeatMonitor from "@/components/dating/HeartbeatMonitor";
import ProfileSong from "@/components/dating/ProfileSong";

const picsOf = (p) => [p?.photo, ...(p?.photos || [])].filter(Boolean);

function CardFace({ profile }) {
  const pics = picsOf(profile);
  const tags = (profile.interests || "").split(",").map((t) => t.trim()).filter(Boolean).slice(0, 3);
  return (
    <div className="absolute inset-0 rounded-3xl overflow-hidden border border-white/12 bg-neutral-900 neon-edge">
      {pics[0] ? (
        <img src={pics[0]} alt={profile.display_name} className="w-full h-full object-cover" draggable={false} />
      ) : (
        <div className="w-full h-full grid place-items-center text-6xl font-black text-white/20">{(profile.display_name || "?")[0].toUpperCase()}</div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/94 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 space-y-2 p-3.5">
        <p className="text-lg font-extrabold leading-tight truncate">
          {profile.display_name}
          {profile.age ? <span className="font-normal text-neutral-200">, {profile.age}</span> : null}
        </p>
        {profile.location ? (
          <p className="text-[11.5px] text-neutral-300 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {profile.location}
            {profile.distance_km ? <span className="text-neutral-400">· {profile.distance_km} km</span> : null}
          </p>
        ) : null}
        {profile.bio ? <p className="text-[11.5px] text-neutral-300 line-clamp-2">{profile.bio}</p> : null}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-full bg-white/15 backdrop-blur text-[10px] text-white/90">{t}</span>
            ))}
          </div>
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
      <div className="relative aspect-[3/4] select-none">
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