import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Users, UserPlus, Check, Loader2, Search } from "lucide-react";
import AccountView from "@/components/social/AccountView";

const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);
const FALLBACK = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200";
const handleOf = (u) => u?.username || (u?.email ? u.email.split("@")[0] : "");
const nameOf = (u) => u?.display_name || u?.full_name || handleOf(u) || "User";

export default function Discover() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [latest, setLatest] = useState({});
  const [following, setFollowing] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [view, setView] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me().catch(() => null);
        setMe(u);
        const [uList, posts] = await Promise.all([
          base44.entities.User.list("-created_date", 100).catch(() => []),
          base44.entities.Post.list("-created_date", 80).catch(() => []),
        ]);
        const uArr = asItems(uList);
        const map = {};
        asItems(posts).forEach((p) => { const h = p.author_handle; if (h && !map[h]) map[h] = p; });
        setUsers(uArr);
        setLatest(map);
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

  const filtered = users.filter((u) => {
    const qq = q.trim().toLowerCase();
    if (!qq) return true;
    return handleOf(u).toLowerCase().includes(qq) || nameOf(u).toLowerCase().includes(qq);
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-28">
      <header className="flex items-center gap-2 mb-5">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Users className="w-5 h-5" style={{ color: "var(--accent)" }} /> Discover people
        </h1>
      </header>

      <div className="ig-card mb-4 flex items-center gap-2 px-3 py-2">
        <Search className="w-4 h-4 text-white/40" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search people by name or username"
          className="flex-1 bg-transparent outline-none text-sm py-1.5"
        />
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-white/50" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-white/45 py-10 text-center">No people found.</p>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((u) => {
            const h = handleOf(u);
            const isMe = me && u.id === me.id;
            const isF = following.has(u.id);
            const post = latest[h];
            const open = () => (isMe ? navigate("/profile") : setView(h));
            return (
              <div key={u.id} className="ig-card p-3 flex items-start gap-3">
                <button onClick={open} className="shrink-0">
                  <img
                    src={u.avatar || FALLBACK}
                    onError={(e) => { e.currentTarget.src = FALLBACK; }}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover ring-1 ring-white/10"
                  />
                </button>
                <div className="flex-1 min-w-0">
                  <button onClick={open} className="text-left">
                    <p className="text-sm font-bold truncate">{nameOf(u)}</p>
                    <p className="text-[12px] text-white/45 truncate">@{h}</p>
                  </button>
                  {post ? (
                    <p className="mt-1 text-[13px] text-white/70 line-clamp-2">
                      {post.content || (post.media_type === "video" ? "🎥 Video" : post.media_type === "audio" ? "🎵 Track" : "📷 Photo")}
                    </p>
                  ) : (
                    <p className="mt-1 text-[12px] text-white/35">No posts yet</p>
                  )}
                </div>
                {!isMe && (
                  <button
                    onClick={() => toggleFollow(u)}
                    className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-bold ${isF ? "ig-solid text-white" : "brand-grad text-black"}`}
                  >
                    {isF ? <><Check className="w-3.5 h-3.5" /> Following</> : <><UserPlus className="w-3.5 h-3.5" /> Follow</>}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

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