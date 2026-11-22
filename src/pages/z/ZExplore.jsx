import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, Loader2, BadgeCheck, UserPlus, Check, Newspaper, ExternalLink, Play } from "lucide-react";
import { DEFAULT_AVATAR } from "@/lib/defaults";

const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);
const handleOf = (u) => u?.username || (u?.email ? u.email.split("@")[0] : "");
const nameOf = (u) => u?.display_name || u?.full_name || handleOf(u) || "User";

const NEWS_SCHEMA = {
  type: "object",
  properties: {
    topics: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          category: { type: "string" },
          posts: { type: "number" },
        },
      },
    },
    articles: {
      type: "array",
      items: {
        type: "object",
        properties: {
          headline: { type: "string" },
          summary: { type: "string" },
          source: { type: "string" },
          url: { type: "string" },
          category: { type: "string" },
        },
      },
    },
  },
};

export default function ZExplore() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState(new Set());
  const [news, setNews] = useState([]);
  const [q, setQ] = useState(params.get("q") || "");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setQ(params.get("q") || ""); }, [params]);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me().catch(() => null);
        setMe(u);
        const [uList, pList] = await Promise.all([
          base44.entities.User.list("-created_date", 100).catch(() => []),
          base44.entities.Post.list("-created_date", 80).catch(() => []),
        ]);
        setUsers(asItems(uList));
        setPosts(asItems(pList));
        if (u) {
          const f = await base44.entities.Follow.filter({ follower_id: u.id }).catch(() => []);
          setFollowing(new Set(asItems(f).map((r) => r.following_id).filter(Boolean)));
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    base44.integrations.Core.InvokeLLM({
      prompt: "Return 5 real current trending topics and 5 real current news articles for today. For topics: title, category, approximate post count. For articles: headline, 1-2 sentence summary, source, real url, category.",
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: NEWS_SCHEMA,
    }).then((r) => setNews(r || { topics: [], articles: [] })).catch(() => setNews({ topics: [], articles: [] }));
  }, []);

  const qq = q.trim().toLowerCase();
  const suggestions = useMemo(() => {
    if (!qq) return [];
    return users.filter((u) => handleOf(u).toLowerCase().includes(qq) || nameOf(u).toLowerCase().includes(qq)).slice(0, 6);
  }, [users, qq]);

  const mediaPosts = useMemo(() => posts.filter((p) => p.media_url), [posts]);

  const toggleFollow = async (peer) => {
    if (!me) { navigate("/login"); return; }
    const isF = following.has(peer.id);
    setFollowing((s) => { const n = new Set(s); isF ? n.delete(peer.id) : n.add(peer.id); return n; });
    try {
      if (isF) {
        const rows = asItems(await base44.entities.Follow.filter({ follower_id: me.id, following_id: peer.id }));
        for (const r of rows) await base44.entities.Follow.delete(r.id);
      } else {
        await base44.entities.Follow.create({
          follower_id: me.id, follower_handle: handleOf(me), follower_name: nameOf(me),
          following_id: peer.id, following_handle: handleOf(peer), following_name: nameOf(peer), following_avatar: peer.avatar || "",
        });
      }
    } catch {}
  };

  return (
    <div className="mx-auto w-full max-w-[640px] px-3 sm:px-4 pb-24">
      {/* Search */}
      <div className="sticky top-3 z-30">
        <div className="flex items-center gap-2 rounded-full border border-[#2f3336] bg-white/[0.05] px-4 py-3 focus-within:border-white/50">
          <Search className="h-5 w-5 text-white/50" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Search accounts, hashtags, keywords, media"
            className="flex-1 bg-transparent text-[15px] outline-none placeholder-white/40"
          />
        </div>

        {focused && suggestions.length > 0 && (
          <div className="mt-1 overflow-hidden rounded-2xl border border-[#2f3336] bg-black/95 shadow-2xl backdrop-blur-xl">
            {suggestions.map((u) => {
              const h = handleOf(u);
              const isF = following.has(u.id);
              return (
                <div key={u.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.05]">
                  <img src={u.avatar || DEFAULT_AVATAR} alt="" className="h-10 w-10 rounded-full object-cover ring-1 ring-white/10" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 text-[14px] font-bold truncate">
                      {nameOf(u)} {(u.is_creator || u.verified) && <BadgeCheck className="h-4 w-4 text-[#1d9bf0]" />}
                    </p>
                    <p className="text-[12px] text-white/45 truncate">@{h}</p>
                  </div>
                  {me?.id !== u.id && (
                    <button
                      onClick={() => toggleFollow(u)}
                      className={`flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[12px] font-bold ${isF ? "border border-[#2f3336] text-white" : "bg-white text-black"}`}
                    >
                      {isF ? <><Check className="h-3.5 w-3.5" /> Following</> : <><UserPlus className="h-3.5 w-3.5" /> Follow</>}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trending now */}
      <section className="mt-5 rounded-2xl border border-[#2f3336] bg-white/[0.03] p-4">
        <h2 className="flex items-center gap-2 text-[18px] font-extrabold"><Newspaper className="h-5 w-5 text-white/70" /> Trending now</h2>
        <div className="mt-3 space-y-2.5">
          {news?.articles?.length ? news.articles.slice(0, 5).map((a, i) => (
            <a key={i} href={a.url} target="_blank" rel="noreferrer" className="block rounded-xl p-2 hover:bg-white/[0.05]">
              <p className="text-[11px] font-bold uppercase tracking-wide text-white/45">{a.category || "News"}</p>
              <p className="text-[14px] font-bold leading-snug">{a.headline}</p>
              <p className="mt-0.5 text-[12px] text-white/55 line-clamp-2">{a.summary}</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-white/40">{a.source} <ExternalLink className="h-3 w-3" /></p>
            </a>
          )) : (
            <p className="text-[13px] text-white/40">Loading trending topics…</p>
          )}
        </div>
      </section>

      {/* Explore media grid */}
      <h2 className="mt-6 mb-2 text-[17px] font-extrabold">Explore media</h2>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-white/50" /></div>
      ) : mediaPosts.length === 0 ? (
        <p className="py-10 text-center text-sm text-white/45">No media posts yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-0.5">
          {mediaPosts.map((p) => (
            <div key={p.id} className="relative aspect-square overflow-hidden bg-white/[0.03]">
              {p.media_type === "video" ? (
                <>
                  <video src={p.media_url} className="h-full w-full object-cover" />
                  <span className="absolute left-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/60"><Play className="h-3.5 w-3.5 text-white" /></span>
                </>
              ) : (
                <img src={p.media_url} alt="" className="h-full w-full object-cover" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}