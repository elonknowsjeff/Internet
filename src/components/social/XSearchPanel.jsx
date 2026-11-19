import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Search, X, Loader2, UserPlus, Check, Heart, MessageCircle } from "lucide-react";
import { nameOf, handleOf } from "@/lib/socialNames";

const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);

const TABS = [
  { key: "top", label: "Top" },
  { key: "people", label: "People" },
  { key: "posts", label: "Posts" },
];

export default function XSearchPanel({ me, initialTab = "top", onClose, onOpenAccount }) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState(initialTab);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [follows, setFollows] = useState({}); // handle -> follow record id
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [u, p, f] = await Promise.all([
          base44.entities.User.list("-created_date", 200),
          base44.entities.Post.list("-created_date", 100),
          me ? base44.entities.Follow.filter({ follower_id: me.id }).catch(() => []) : Promise.resolve([]),
        ]);
        if (!alive) return;
        setUsers(asItems(u).filter((x) => x.id !== me?.id));
        setPosts(asItems(p));
        const map = {};
        for (const row of asItems(f)) if (row.following_handle) map[row.following_handle] = row.id;
        setFollows(map);
      } catch (e) {
        if (alive) { setUsers([]); setPosts([]); }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [me]);

  // only accounts that still exist — posts from deleted accounts never appear
  const liveHandles = useMemo(() => new Set(users.filter((u) => u.id !== me?.id).map(handleOf).concat(me ? [handleOf(me)] : [])), [users, me]);
  const livePosts = useMemo(() => posts.filter((p) => liveHandles.has(p.author_handle)), [posts, liveHandles]);

  const term = q.trim().toLowerCase();
  const people = useMemo(() => {
    if (!term) return users.slice(0, 12);
    return users.filter((u) => `${nameOf(u)} ${handleOf(u)}`.toLowerCase().includes(term));
  }, [users, term]);

  const foundPosts = useMemo(() => {
    if (!term) return [];
    return livePosts.filter(
      (p) => (p.content || "").toLowerCase().includes(term) || `${p.author_name || ""} ${p.author_handle || ""}`.toLowerCase().includes(term)
    );
  }, [livePosts, term]);

  const toggleFollow = async (u) => {
    if (!me) return;
    const handle = handleOf(u);
    try {
      if (follows[handle]) {
        await base44.entities.Follow.delete(follows[handle]);
        setFollows((s) => { const n = { ...s }; delete n[handle]; return n; });
      } else {
        const rec = await base44.entities.Follow.create({
          follower_id: me.id,
          follower_handle: handleOf(me),
          follower_name: nameOf(me),
          following_id: u.id,
          following_handle: handle,
          following_name: nameOf(u),
          following_avatar: u.avatar || "",
        });
        setFollows((s) => ({ ...s, [handle]: rec.id }));
      }
    } catch (e) {}
  };

  const open = (handle) => { onClose?.(); onOpenAccount?.(handle); };

  const PersonRow = ({ u }) => {
    const handle = handleOf(u);
    const following = !!follows[handle];
    return (
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04]">
        <button onClick={() => open(handle)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
          <span className="w-11 h-11 rounded-full overflow-hidden bg-white/10 shrink-0 grid place-items-center text-xs font-bold">
            {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : nameOf(u).slice(0, 2).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block text-[15px] font-bold truncate">{nameOf(u)}</span>
            <span className="block text-[13px] text-white/45 truncate">@{handle}</span>
            {u.bio && <span className="block text-[13px] text-white/60 truncate mt-0.5">{u.bio}</span>}
          </span>
        </button>
        {me && (
          <button
            onClick={() => toggleFollow(u)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-bold flex items-center gap-1.5 ${following ? "border border-white/25 text-white" : "bg-white text-black"}`}
          >
            {following ? <><Check className="w-3.5 h-3.5" /> Following</> : <><UserPlus className="w-3.5 h-3.5" /> Follow</>}
          </button>
        )}
      </div>
    );
  };

  const PostRow = ({ p }) => (
    <button onClick={() => open(p.author_handle)} className="w-full text-left px-4 py-3 hover:bg-white/[0.04] border-b border-white/[0.06]">
      <div className="flex items-center gap-2 text-[13.5px]">
        <span className="w-8 h-8 rounded-full overflow-hidden bg-white/10 shrink-0 grid place-items-center text-[10px] font-bold">
          {p.author_avatar ? <img src={p.author_avatar} alt="" className="w-full h-full object-cover" /> : (p.author_name || "?")[0]}
        </span>
        <span className="font-bold truncate">{p.author_name}</span>
        <span className="text-white/45 truncate">@{p.author_handle}</span>
      </div>
      {p.content && <p className="text-[14.5px] mt-1.5 whitespace-pre-wrap line-clamp-4">{p.content}</p>}
      <div className="flex items-center gap-5 mt-2 text-[12.5px] text-white/45">
        <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {p.comments || 0}</span>
        <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {p.likes || 0}</span>
      </div>
    </button>
  );

  const showPeople = tab === "people" || (tab === "top" && !term);
  const showPosts = tab === "posts" || (tab === "top" && !!term);

  return (
    <div className="fixed inset-0 z-[65] flex justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[620px] h-full bg-[#0d0920] border-x border-white/10 flex flex-col animate-slide-up">
        <div className="flex items-center gap-2 px-2 py-2 border-b border-white/[0.08]">
          <button onClick={onClose} className="w-9 h-9 rounded-full grid place-items-center hover:bg-white/10" title="Close">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center gap-2.5 bg-white/[0.07] border border-white/10 focus-within:border-[color:var(--brand)]/70 rounded-full px-4 py-2">
            <Search className="w-4 h-4 text-white/45 shrink-0" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search people and posts"
              className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder-white/45"
            />
            {q && <button onClick={() => setQ("")}><X className="w-4 h-4 text-white/45" /></button>}
          </div>
        </div>

        <div className="grid grid-cols-3 border-b border-white/[0.08]">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className="relative py-3 hover:bg-white/[0.04]">
              <span className={`text-[14.5px] ${tab === t.key ? "font-bold text-white" : "text-white/55"}`}>{t.label}</span>
              {tab === t.key && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-[3px] rounded-full bg-[color:var(--brand)]" />}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto thin-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-white/50"><Loader2 className="w-4 h-4 animate-spin" /> Searching…</div>
          ) : (
            <>
              {showPeople && (
                <>
                  <p className="px-4 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-white/40">
                    {term ? "People" : "Suggested accounts"}
                  </p>
                  {people.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-white/45">No accounts found.</p>
                  ) : (
                    people.slice(0, tab === "top" ? 4 : 30).map((u) => <PersonRow key={u.id} u={u} />)
                  )}
                </>
              )}

              {showPosts && (
                <>
                  {term && <p className="px-4 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-white/40">Posts</p>}
                  {foundPosts.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-white/45">{term ? "No posts found." : "Type to search posts."}</p>
                  ) : (
                    foundPosts.slice(0, 40).map((p) => <PostRow key={p.id} p={p} />)
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}