import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, ImagePlus, Send, Newspaper, Music2, Film, Gamepad2, Tv, ExternalLink, Sparkles } from "lucide-react";
import PostCard from "@/components/social/PostCard";
import usePostReactions from "@/hooks/usePostReactions";
import StoriesBar from "@/components/StoriesBar";
import TrendingHashtags from "@/components/home/TrendingHashtags";
import WhoToFollow from "@/components/WhoToFollow";
import ProfileSheet from "@/components/social/ProfileSheet";

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
  music: { label: "Music", icon: Music2, to: "/music" },
  movie: { label: "Movie", icon: Film, to: "/movies" },
  tv: { label: "TV", icon: Tv, to: "/cable" },
  game: { label: "Game", icon: Gamepad2, to: "/?cat=gaming" },
};

const CHIPS = [
  { key: "all", label: "All" },
  { key: "social", label: "Social" },
  { key: "news", label: "News" },
  { key: "entertainment", label: "Media" },
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
  const [tag, setTag] = useState(null);
  const [profileHandle, setProfileHandle] = useState(null);
  const [feedTab, setFeedTab] = useState("foryou");
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      if (u) {
        base44.entities.Follow.list("-created_date", 500)
          .then((rows) => setFollowing(asItems(rows).filter((f) => f.follower_id === u.id).map((f) => f.following_handle).filter(Boolean)))
          .catch(() => {});
      }
    }).catch(() => {});
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

  const stream = useMemo(() => {
    const items = [];
    const isFollowing = feedTab === "following";
    posts.forEach((p) => {
      if (tag && !new RegExp("#" + tag + "\\b", "i").test(p.content || "")) return;
      if (isFollowing && !following.includes(p.author_handle)) return;
      items.push({ type: "social", ts: new Date(p.created_date || 0).getTime() || Date.now(), data: p });
    });
    if (!tag && !isFollowing) {
      news.forEach((n, i) => items.push({ type: "news", ts: Date.now() - i * 60000 - 30000, data: n }));
      ent.forEach((e, i) => items.push({ type: "ent", ts: Date.now() - i * 90000 - 120000, data: e }));
    }
    items.sort((a, b) => b.ts - a.ts);
    return items;
  }, [posts, news, ent, tag, feedTab, following]);

  const filtered = chip === "all" ? stream : stream.filter((it) => it.type === chip);
  const counts = { social: posts.length, news: news.length, entertainment: ent.length };

  return (
    <div className="mx-auto w-full max-w-[640px] pb-28 lg:pb-6">
      {/* Stories */}
      <div className="border-b border-[#2F3336]">
        <StoriesBar user={user} />
      </div>

      {/* For You / Following tabs */}
      <div className="sticky top-14 z-20 flex border-b border-[#2F3336] bg-black/90 backdrop-blur-xl">
        {[
          { key: "foryou", label: "For You" },
          { key: "following", label: "Following" },
        ].map((t) => {
          const active = feedTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setFeedTab(t.key)}
              className="relative flex-1 px-4 py-3.5 text-[15px] transition-colors hover:bg-white/[0.04]"
              style={{ fontWeight: active ? 700 : 400, color: active ? "#fff" : "rgba(255,255,255,0.5)" }}
            >
              {t.label}
              {active && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-14 rounded-full bg-[#1d9bf0]" />}
            </button>
          );
        })}
      </div>

      {/* Composer */}
      <div className="border-b border-[#2F3336] px-4 py-3">
        <div className="flex gap-3">
          {authorAvatar
            ? <img src={authorAvatar} alt="you" className="h-10 w-10 shrink-0 rounded-full object-cover" />
            : <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1d9bf0] text-[13px] font-bold text-white">{authorName[0]?.toUpperCase()}</span>}
          <div className="min-w-0 flex-1">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="What's happening?"
              rows={2}
              className="w-full resize-none bg-transparent pt-1 text-[18px] leading-7 outline-none placeholder-white/40"
            />
            {pendingMedia && (
              <div className="relative mt-2 inline-block">
                <img src={pendingMedia.url} alt="" className="max-h-56 rounded-2xl border border-[#2F3336]" />
                <button onClick={() => setPendingMedia(null)} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/75 text-white hover:bg-black">×</button>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between border-t border-[#2F3336] pt-2">
              <label className="grid h-9 w-9 cursor-pointer place-items-center rounded-full text-[#1d9bf0] hover:bg-[#1d9bf0]/10">
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                <input type="file" accept="image/*" onChange={uploadImage} className="hidden" />
              </label>
              <button
                onClick={post}
                disabled={!draft.trim() && !pendingMedia}
                className="flex h-9 items-center gap-1.5 rounded-full bg-white px-5 text-[14px] font-bold text-black disabled:opacity-40"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      <TrendingHashtags posts={posts} active={tag} onSelect={setTag} />

      {/* Filter chips */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none border-b border-[#2F3336] px-4 py-2">
        {CHIPS.map((c) => {
          const active = chip === c.key;
          const count = c.key === "all" ? stream.length : counts[c.key];
          return (
            <button
              key={c.key}
              onClick={() => setChip(c.key)}
              className="shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors"
              style={active
                ? { background: "#fff", color: "#000" }
                : { background: "transparent", color: "rgba(255,255,255,0.6)", border: "1px solid #2F3336" }}
            >
              {c.label}{count > 0 && <span className="ml-1 opacity-60">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Stream */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-white/40">Nothing here yet. Be the first to post!</div>
      ) : (
        <div>
          {filtered.map((it, idx) => {
            if (it.type === "social") {
              const p = it.data;
              const lead = idx === 2 ? <WhoToFollow key="wtf-rail" /> : null;
              return (
                <React.Fragment key={p.id}>
                  {lead}
                  <PostCard
                    post={p}
                    isOwn={isOwn(p)}
                    liked={!!liked[p.id]}
                    reposted={!!reposted[p.id]}
                    bookmarked={!!bookmarked[p.id]}
                    commentsOpen={expandedId === p.id}
                    onOpenAuthor={(h) => setProfileHandle(h)}
                    onDelete={() => { base44.entities.Post.delete(p.id); loadPosts(); }}
                    onLike={toggleLike}
                    onRepost={toggleRepost}
                    onBookmark={toggleBookmark}
                    onComment={(x) => setExpandedId(expandedId === x.id ? null : x.id)}
                    onCommented={loadPosts}
                    onDm={() => {}}
                  />
                </React.Fragment>
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
                  className="block border-b border-[#2F3336] px-4 py-3 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#1d9bf0]">
                    <Newspaper className="h-3.5 w-3.5" /> News
                    <span className="ml-auto rounded-full border border-[#2F3336] px-2 py-0.5 text-[10px] font-medium text-white/50">{n.category}</span>
                  </div>
                  <h3 className="mt-2 text-[16px] font-bold leading-snug text-white">{n.headline}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">{n.summary}</p>
                  <div className="mt-2.5 flex items-center gap-1 text-[11.5px] text-white/40">
                    <span className="font-semibold text-white/65">{n.source}</span>
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
                className="group flex w-full items-center gap-3 border-b border-[#2F3336] px-4 py-3 text-left transition-colors hover:bg-white/[0.02]"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#16181c]">
                  {e.img
                    ? <img src={e.img} alt="" className="h-full w-full object-cover" />
                    : <span className="grid h-full w-full place-items-center"><Icon className="h-6 w-6 text-white/30" /></span>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10.5px] font-bold uppercase tracking-wide text-[#1d9bf0]">{k.label}</p>
                  <p className="mt-0.5 truncate text-[15px] font-bold text-white">{e.title}</p>
                  <p className="truncate text-[12px] text-white/50">{e.sub}</p>
                </div>
                <Sparkles className="h-4 w-4 shrink-0 text-white/25" />
              </button>
            );
          })}
        </div>
      )}

      {profileHandle && <ProfileSheet handle={profileHandle} onClose={() => setProfileHandle(null)} />}
    </div>
  );
}