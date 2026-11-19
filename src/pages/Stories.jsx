import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Plus, Loader2, ChevronLeft, Clock3, Sparkles } from "lucide-react";
import StoryViewer from "@/components/StoryViewer";
import StoryComposer from "@/components/stories/StoryComposer";

const RING = "bg-gradient-to-tr from-amber-300 via-fuchsia-400 to-violet-400";
const initials = (name) => (name || "U")[0]?.toUpperCase();

const ago = (iso) => {
  if (!iso) return "now";
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${Math.max(1, m)}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

export default function Stories() {
  const [user, setUser] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openGroup, setOpenGroup] = useState(null);
  const [composer, setComposer] = useState(false);

  const load = () =>
    base44.entities.Story.list("-created_date", 200)
      .then((res) => setStories(Array.isArray(res) ? res : res?.items || []))
      .catch(() => setStories([]))
      .finally(() => setLoading(false));

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
    load();
  }, []);

  const myHandle = user?.username || (user?.email ? user.email.split("@")[0] : "you");
  const authorName = user?.display_name || user?.full_name || "You";
  const authorAvatar = user?.avatar || "";

  const groups = useMemo(() => {
    const out = [];
    const seen = new Map();
    for (const s of [...stories].reverse()) {
      const key = s.author_handle || "user";
      if (!seen.has(key)) {
        const g = { handle: key, name: s.author_name || key, avatar: s.author_avatar || "", latest: s, items: [] };
        seen.set(key, g);
        out.push(g);
      }
      seen.get(key).items.push({
        id: s.id,
        handle: key,
        name: s.author_name || key,
        avatar: s.author_avatar || "",
        image: s.image_url,
        text: s.caption,
        music_url: s.music_url,
        music_title: s.music_title,
        music_artist: s.music_artist,
      });
    }
    return out;
  }, [stories]);

  return (
    <div className="mx-auto w-full max-w-6xl px-3 pb-28 pt-4 sm:px-5 sm:pb-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link to="/" className="mb-2 inline-flex items-center gap-1 text-[11px] font-semibold text-white/45 hover:text-white">
            <ChevronLeft className="h-3.5 w-3.5" /> Feed
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/35">Stories</p>
          <h1 className="mt-1 flex items-center gap-2 font-display text-[28px] font-semibold leading-none tracking-[-0.02em]">
            <Sparkles className="h-5 w-5" style={{ color: "var(--brand)" }} /> Stories
          </h1>
          <p className="mt-1.5 text-[12px] text-white/40">{groups.length} people sharing right now</p>
        </div>
        <button
          onClick={() => setComposer(true)}
          className="brand-grad flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold text-black shadow-[0_14px_30px_-18px_rgba(168,85,247,0.95)]"
        >
          <Plus className="h-3.5 w-3.5" /> Add your story
        </button>
      </header>

      {loading ? (
        <div className="py-24 text-center text-[13px] text-white/40">
          <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" /> Loading stories…
        </div>
      ) : groups.length === 0 ? (
        <div className="panel mt-5 grid place-items-center px-6 py-20 text-center">
          <div>
            <Sparkles className="mx-auto h-8 w-8" style={{ color: "var(--brand)" }} />
            <p className="mt-2 text-[17px] font-semibold">No stories yet</p>
            <p className="mt-1 text-[12px] text-white/40">Be the first to share a moment with a photo or a note.</p>
            <button onClick={() => setComposer(true)} className="brand-grad mt-3 rounded-full px-4 py-2 text-[12px] font-bold text-black">
              Add your story
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {groups.map((g) => (
            <button
              key={g.handle}
              onClick={() => setOpenGroup(g)}
              className="group relative aspect-[3/4] overflow-hidden rounded-[22px] border border-white/[0.1] text-left transition-transform duration-200 hover:-translate-y-1"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14), 0 22px 44px -28px rgba(0,0,0,1)" }}
            >
              {g.latest?.image_url ? (
                <img src={g.latest.image_url} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{ backgroundImage: "linear-gradient(155deg, rgba(168,85,247,0.65), rgba(56,189,248,0.35) 55%, rgba(236,72,153,0.6))" }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/25" />
              <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.35)" }} />

              <div className="absolute left-3 top-3 flex items-center gap-2">
                <span className={`grid h-9 w-9 place-items-center rounded-full p-[2px] ${RING}`}>
                  <span className="grid h-full w-full place-items-center overflow-hidden rounded-full bg-[#0b0818]">
                    {g.avatar ? (
                      <img src={g.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[12px] font-bold text-amber-200">{initials(g.name)}</span>
                    )}
                  </span>
                </span>
                <span className="rounded-full bg-black/45 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-white/80 backdrop-blur">
                  {g.items.length} {g.items.length === 1 ? "story" : "stories"}
                </span>
              </div>

              <div className="absolute inset-x-3 bottom-3">
                <p className="truncate text-[13px] font-bold">{g.name}</p>
                <p className="truncate text-[11px] text-white/60">@{g.handle}</p>
                {g.latest?.caption && <p className="mt-1 line-clamp-2 text-[11px] text-white/55">{g.latest.caption}</p>}
                <p className="mt-1 flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.1em] text-white/40">
                  <Clock3 className="h-3 w-3" /> {ago(g.latest?.created_date)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {openGroup && <StoryViewer items={openGroup.items} startIdx={0} onClose={() => setOpenGroup(null)} />}

      {composer && (
        <StoryComposer
          user={user}
          authorName={authorName}
          authorHandle={myHandle}
          authorAvatar={authorAvatar}
          onClose={() => setComposer(false)}
          onCreated={load}
        />
      )}
    </div>
  );
}