import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, ImagePlus, Send, Newspaper, Music2, Film, Gamepad2, Tv, ExternalLink, Sparkles } from "lucide-react";
import PostCard from "@/components/social/PostCard";
import usePostReactions from "@/hooks/usePostReactions";

const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);
const avatars = ["https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100"];

const NEWS_SCHEMA = {
  type: "object",
  properties: {
    articles: {
      type: "array",
      items: {
        type: "object",
        properties: {
          headline: { type: "string" },
          summary: { type: "string" },
          source: { type: "string" },
          category: { type: "string" },
          url: { type: "string" },
        },
      },
    },
  },
};

const NEWS_PROMPT = `Return 6 real, current news headlines for today. For each: a specific headline, a 1-2 sentence summary, the source/publisher name, a single category (world, tech, ai, business, science, sports, entertainment, health, politics), and the real article url. Use live web context so stories are genuinely current.`;

const KIND = {
  music: { label: "Music", icon: Music2, to: "/music", color: "#a855f7" },
  movie: { label: "Movie", icon: Film, to: "/movies", color: "#f43f5e" },
  tv: { label: "TV", icon: Tv, to: "/cable", color: "#22d3ee" },
  game: { label: "Game", icon: Gamepad2, to: "/?cat=gaming", color: "#34d399" },
};

const CHIPS = [
  { key: "all", label: "All" },
  { key: "social", label: "Social" },
  { key: "news", label: "News" },
  { key: "entertainment", label: "Entertainment" },
];

export default function UnifiedFeed() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [news, setNews] = useState([]);
  const [ent, setEnt] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chip, setChip] = useState("all");
  const [user, setUser] = useState(null);
  const [draft, setDraft] = useState("");
  const [pendingMedia, setPendingMedia] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [bookmarked, setBookmarked] = useState({});

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const unsub = base44.entities.Post?.subscribe?.(() => loadPosts());
    return () => { if (typeof unsub === "function") unsub(); };
  }, []);

  const loadPosts = async () => {
    try {
      const data = asItems(await base44.entities.Post.list("-created_date", 40));
      setPosts(data);
    } catch { setPosts([]); }
  };

  const loadNews = async () => {
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: NEWS_PROMPT,
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: NEWS_SCHEMA,
      });
      setNews(res?.articles || []);
    } catch { setNews([]); }
  };

  const loadEnt = async () => {
    try {
      const [t, m, g, s] = await Promise.all([
        base44.entities.Track.list("-plays", 12).catch(() => []),
        base44.entities.Movie.list("-created_date", 12).catch(() => []),
        base44.entities.Game.list("-plays", 12).catch(() => []),
        base44.entities.LiveStream.list("-viewers", 12).catch(() => []),
      ]);
      const make = (kind, arr, map) => asItems(arr).map((x) => ({ kind, ...map(x) }));
      const merged = [
        ...make("music", t, (x) => ({ id: x.id, title: x.title, sub: x.artist_name, img: x.artwork })),
        ...make("movie", m, (x) => ({ id: x.id, title: x.title, sub: x.genre, img: x.poster })),
        ...make("tv", s, (x) => ({ id: x.id, title: x.title, sub: x.host_name, img: x.thumbnail })),
        ...make("game", g, (x) => ({ id: x.id, title: x.title, sub: x.genre, img: x.cover })),
      ];
      setEnt(merged);
    } catch { setEnt([]); }
  };

  useEffect(() => {
    (async () => {
      await Promise.all([loadPosts(), loadNews(), loadEnt()]);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
    base44.entities.Bookmark.list("-created_date", 200)
      .then((rows) => {
        const map = {};
        asItems(rows).forEach((b) => { map[b.post_id] = b.id; });
        setBookmarked(map);
      })
      .catch(() => {});
  }, [user]);

  const { liked, reposted, toggleLike, toggleRepost } = usePostReactions(user, posts, loadPosts);

  const toggleBookmark = async (p) => {
    const existing = bookmarked[p.id];
    if (existing) {
      await base44.entities.Bookmark.delete(existing).catch(() => {});
      setBookmarked((s) => { const n = { ...s }; delete n[p.id]; return n; });
    } else {
      const rec = await base44.entities.Bookmark.create({ post_id: p.id });
      setBookmarked((s) => ({ ...s, [p.id]: rec.id }));
    }
  };

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      if (res?.file_url) setPendingMedia({ url: res.file_url, type: "image" });
    } catch {}
    setUploading(false);
    e.target.value = "";
  };

  const authorName = user?.display_name || user?.full_name || "You";
  const authorHandle = user?.username || (user ? ((user.display_name || user.full_name || "").toLowerCase().replace(/\s+/g, "") || user.email?.split("@")[0]) : "you");
  const authorAvatar = user?.avatar || avatars[0];

  const post = async () => {
    if (!draft.trim() && !pendingMedia) return;
    await base44.entities.Post.create({
      content: draft.trim(),
      author_name: authorName,
      author_handle: authorHandle,
      author_avatar: authorAvatar,
      category: "general",
      is_creator: !!user?.is_creator,
      ...(pendingMedia ? { media_url: pendingMedia.url, media_type: pendingMedia.type } : {}),
    });
    setDraft("");
    setPendingMedia(null);
    loadPosts();
  };

  const isOwn = (p) => !!user && p.author_handle === authorHandle;

  // Interleave the three streams into one timeline by recency.
  const stream = useMemo(() => {
    const items = [];
    posts.forEach((p) => items.push({ type: "social", ts: new Date(p.created_date || 0).getTime() || Date.now(), data: p }));
    news.forEach((n, i) => items.push({ type: "news", ts: Date.now() - i * 60000 - 30000, data: n }));
    ent.forEach((e, i) => items.push({ type: "ent", ts: Date.now() - i * 90000 - 120000, data: e }));
    items.sort((a, b) => b.ts - a.ts);
    return items;
  }, [posts, news, ent]);

  const filtered = chip === "all" ? stream : stream.filter((it) => it.type === chip);
  const counts = {
    social: posts.length,
    news: news.length,
    entertainment: ent.length,
  };

  return (
    <div className="mx-auto w-full max-w-[640px] px-3 sm:px-4 pb-28">
      {/* Composer */}
      <div className="mt-3 rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-3.5 backdrop-blur-xl">
        <div className="flex gap-3">
          {authorAvatar
            ? <img src={authorAvatar} alt="you" className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-white/15" />
            : <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full brand-grad text-[13px] font-bold text-black">{authorName[0]?.toUpperCase()}</span>}
          <div className="min-w-0 flex-1">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Share something with the feed…"
              rows={2}
              className="w-full resize-none bg-transparent pt-1 text-[16px] leading-6 outline-none placeholder-white/40"
            />
            {pendingMedia && (
              <div className="relative mt-2 inline-block">
                <img src={pendingMedia.url} alt="" className="max-h-56 rounded-2xl border border-white/10" />
                <button onClick={() => setPendingMedia(null)} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/75 text-white hover:bg-black">×</button>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between border-t border-white/[0.08] pt-2">
              <label className="grid h-9 w-9 cursor-pointer place-items-center rounded-full text-fuchsia-400 hover:bg-fuchsia-400/10">
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                <input type="file" accept="image/*" onChange={uploadImage} className="hidden" />
              </label>
              <button
                onClick={post}
                disabled={!draft.trim() && !pendingMedia}
                className="flex h-9 items-center gap-1.5 rounded-full px-5 text-[14px] font-bold text-black disabled:opacity-40"
                style={{ background: "var(--brand)" }}
              >
                <Send className="h-4 w-4" /> Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="sticky top-[52px] z-20 mt-3 flex gap-1.5 overflow-x-auto scrollbar-none">
        {CHIPS.map((c) => {
          const active = chip === c.key;
          const count = c.key === "all" ? stream.length : counts[c.key];
          return (
            <button
              key={c.key}
              onClick={() => setChip(c.key)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition-colors ${active ? "text-black" : "border border-white/10 bg-white/[0.04] text-white/60 hover:text-white"}`}
              style={active ? { background: "var(--brand)" } : undefined}
            >
              {c.label}{count > 0 && <span className="ml-1 opacity-60">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Stream */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/50" /></div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-white/45">Nothing here yet. Be the first to post!</div>
      ) : (
        <div className="mt-3 space-y-3">
          {filtered.map((it) => {
            if (it.type === "social") {
              const p = it.data;
              return (
                <PostCard
                  key={p.id}
                  post={p}
                  isOwn={isOwn(p)}
                  liked={!!liked[p.id]}
                  reposted={!!reposted[p.id]}
                  bookmarked={!!bookmarked[p.id]}
                  commentsOpen={expandedId === p.id}
                  onOpenAuthor={() => {}}
                  onDelete={() => { base44.entities.Post.delete(p.id); loadPosts(); }}
                  onLike={toggleLike}
                  onRepost={toggleRepost}
                  onBookmark={toggleBookmark}
                  onComment={(x) => setExpandedId(expandedId === x.id ? null : x.id)}
                  onCommented={loadPosts}
                  onDm={() => {}}
                />
              );
            }
            if (it.type === "news") {
              const n = it.data;
              return (
                <a
                  key={`news-${n.url}`}
                  href={n.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block overflow-hidden rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.06]"
                >
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--brand)" }}>
                    <Newspaper className="h-3.5 w-3.5" /> News
                    <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/55">{n.category}</span>
                  </div>
                  <h3 className="mt-2 text-[16px] font-bold leading-snug">{n.headline}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-white/65">{n.summary}</p>
                  <div className="mt-2.5 flex items-center gap-1 text-[11.5px] text-white/45">
                    <span className="font-semibold text-white/70">{n.source}</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </a>
              );
            }
            const e = it.data;
            const k = KIND[e.kind];
            const Icon = k.icon;
            return (
              <button
                key={`ent-${e.kind}-${e.id}`}
                onClick={() => navigate(k.to)}
                className="group flex w-full items-center gap-3 overflow-hidden rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-3 text-left transition-colors hover:bg-white/[0.06]"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-black/30">
                  {e.img
                    ? <img src={e.img} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    : <span className="grid h-full w-full place-items-center"><Icon className="h-6 w-6 text-white/30" /></span>}
                  <span className="absolute left-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/55 backdrop-blur" style={{ color: k.color }}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10.5px] font-bold uppercase tracking-wide" style={{ color: k.color }}>{k.label}</p>
                  <p className="mt-0.5 truncate text-[15px] font-bold">{e.title}</p>
                  <p className="truncate text-[12px] text-white/55">{e.sub}</p>
                </div>
                <Sparkles className="h-4 w-4 shrink-0 text-white/30" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}