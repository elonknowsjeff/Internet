import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Users, UserPlus, Check, Loader2, Search, TrendingUp, BadgeCheck, Play } from "lucide-react";
import AccountView from "@/components/social/AccountView";
import { DEFAULT_AVATAR } from "@/lib/defaults";

const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);
const FALLBACK = DEFAULT_AVATAR;
const handleOf = (u) => u?.username || (u?.email ? u.email.split("@")[0] : "");
const nameOf = (u) => u?.display_name || u?.full_name || handleOf(u) || "User";

export default function Discover() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(params.get("q") || "");
  const [view, setView] = useState(null);
  const [focusSearch, setFocusSearch] = useState(false);

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

  // Real-time search suggestions
  const qq = q.trim().toLowerCase();
  const suggestions = useMemo(() => {
    if (qq.length < 1) return [];
    return users
      .filter((u) => handleOf(u).toLowerCase().includes(qq) || nameOf(u).toLowerCase().includes(qq))
      .slice(0, 6);
  }, [users, qq]);

  const filteredUsers = users.filter((u) => {
    if (!qq) return true;
    return handleOf(u).toLowerCase().includes(qq) || nameOf(u).toLowerCase().includes(qq);
  });

  // Media grid: posts with images/videos
  const mediaPosts = posts.filter((p) => p.media_url);
  // Trending hashtags from posts
  const trendingTags = useMemo(() => {
    const counts = {};
    posts.forEach((p) => {
      const matches = String(p.content || "").matchAll(/#([\p{L}\p{N}_]{2,28})/gu);
      for (const m of matches) { const t = m[1].toLowerCase(); counts[t] = (counts[t] || 0) + 1; }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([tag, n]) => ({ tag, n }));
  }, [posts]);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-4 pb-28 lg:pb-6">
      {/* Search header */}
      <div className="relative sticky top-0 z-30 bg-black/90 backdrop-blur-xl pb-3">
        <div className="flex items-center gap-3 border-b border-[#2F3336] pb-3">
          <div className="relative flex-1">
            <div className="flex items-center gap-2.5 rounded-full border border-[#2F3336] bg-[#16181c] px-4 py-2.5 focus-within:border-[#1d9bf0]/50">
              <Search className="w-4 h-4 text-white/40 shrink-0" />
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setFocusSearch(true); }}
                onFocus={() => setFocusSearch(true)}
                onBlur={() => setTimeout(() => setFocusSearch(false), 200)}
                placeholder="Search accounts, hashtags, keywords"
                className="flex-1 min-w-0 bg-transparent text-[15px] outline-none placeholder-white/35 text-white"
              />
              {q && <button onClick={() => setQ("")} className="text-white/40 hover:text-white">×</button>}
            </div>
            {/* Real-time dropdown suggestions */}
            {focusSearch && qq.length >= 1 && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 rounded-2xl border border-[#2F3336] bg-black shadow-2xl overflow-hidden z-50 max-h-[50vh] overflow-y-auto">
                <p className="px-4 py-2 text-[10px] uppercase tracking-wide text-white/40">People</p>
                {suggestions.map((u) => {
                  const h = handleOf(u);
                  const isMe = me && u.id === me.id;
                  const isF = following.has(u.id);
                  return (
                    <div key={u.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.04]">
                      <button onClick={() => { setFocusSearch(false); isMe ? navigate("/profile") : setView(h); }} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                        <img src={u.avatar || FALLBACK} onError={(e) => { e.currentTarget.src = FALLBACK; }} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate text-white flex items-center gap-1">{nameOf(u)} {u.is_creator && <BadgeCheck className="w-3.5 h-3.5 text-[#1d9bf0]" />}</p>
                          <p className="text-[12px] text-white/45 truncate">@{h}</p>
                        </div>
                      </button>
                      {!isMe && (
                        <button
                          onClick={() => toggleFollow(u)}
                          className={`shrink-0 rounded-full px-4 py-1.5 text-[12px] font-bold ${isF ? "border border-[#2F3336] text-white hover:bg-white/[0.06]" : "bg-white text-black"}`}
                        >
                          {isF ? "Following" : "Follow"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main content */}
        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="py-16 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-white/30" /></div>
          ) : (
            <>
              {/* Explore Media Grid */}
              <div className="mb-6">
                <h2 className="mb-3 text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#1d9bf0]" /> Explore
                </h2>
                {mediaPosts.length === 0 ? (
                  <p className="text-sm text-white/40 py-8 text-center">No media to explore yet.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
                    {mediaPosts.map((p) => (
                      <a key={p.id} href={p.media_url} target="_blank" rel="noreferrer" className="aspect-square bg-[#16181c] overflow-hidden block relative group">
                        {p.media_type === "video" ? (
                          <>
                            <video src={p.media_url} className="w-full h-full object-cover" muted />
                            <span className="absolute top-2 right-2 text-white"><Play className="w-4 h-4 fill-white" /></span>
                          </>
                        ) : (
                          <img src={p.media_url} alt="" className="w-full h-full object-cover" />
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* People to follow */}
              <div>
                <h2 className="mb-3 text-lg font-bold text-white">People</h2>
                {filteredUsers.length === 0 ? (
                  <p className="text-sm text-white/40 py-8 text-center">No people found.</p>
                ) : (
                  <div className="space-y-px">
                    {filteredUsers.slice(0, 20).map((u) => {
                      const h = handleOf(u);
                      const isMe = me && u.id === me.id;
                      const isF = following.has(u.id);
                      return (
                        <div key={u.id} className="flex items-center gap-3 py-3 hover:bg-white/[0.02] rounded-lg px-2">
                          <button onClick={() => (isMe ? navigate("/profile") : setView(h))} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                            <img src={u.avatar || FALLBACK} onError={(e) => { e.currentTarget.src = FALLBACK; }} alt="" className="w-11 h-11 rounded-full object-cover shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-bold truncate text-white flex items-center gap-1">{nameOf(u)} {u.is_creator && <BadgeCheck className="w-3.5 h-3.5 text-[#1d9bf0]" />}</p>
                              <p className="text-[12px] text-white/45 truncate">@{h}</p>
                            </div>
                          </button>
                          {!isMe && (
                            <button
                              onClick={() => toggleFollow(u)}
                              className={`shrink-0 rounded-full px-4 py-1.5 text-[12px] font-bold ${isF ? "border border-[#2F3336] text-white hover:bg-white/[0.06]" : "bg-white text-black"}`}
                            >
                              {isF ? <><Check className="w-3.5 h-3.5 inline mr-1" />Following</> : <><UserPlus className="w-3.5 h-3.5 inline mr-1" />Follow</>}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Trending Now sidebar (desktop) */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-20 rounded-2xl border border-[#2F3336] bg-[#16181c] p-4">
            <h3 className="mb-3 flex items-center gap-2 text-base font-black text-white">
              <TrendingUp className="w-4 h-4 text-[#1d9bf0]" /> Trending Now
            </h3>
            {trendingTags.length === 0 ? (
              <p className="text-sm text-white/40">No trends yet.</p>
            ) : (
              <div className="space-y-1">
                {trendingTags.map(({ tag, n }) => (
                  <button key={tag} onClick={() => navigate(`/?cat=social`)} className="block w-full rounded-lg px-2 py-2 text-left hover:bg-white/[0.04]">
                    <p className="text-sm font-bold text-white">#{tag}</p>
                    <p className="text-xs text-white/40">{n > 0 ? `${n} posts` : "Trending"}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {view && (
        <AccountView
          handle={view}
          me={me}
          onClose={() => setView(null)}
          onMessage={() => { setView(null); navigate("/messages"); }}
        />
      )}
    </div>
  );
}