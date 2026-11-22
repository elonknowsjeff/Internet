import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, MessageSquare, UserPlus, Check, CalendarDays, Heart, MessageCircle, Repeat2,
  Image as ImageIcon, X, Shield, ShieldOff, AtSign, Loader2, Settings as Gear, BadgeCheck, Play,
} from "lucide-react";

const FALLBACK = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200";
const handleOf = (u) => u?.username || (u?.email ? u.email.split("@")[0] : "");
const nameOf = (u) => u?.display_name || u?.full_name || handleOf(u) || "User";

const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);

export default function AccountView({ handle, me, onClose, onMessage, onBlock }) {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("posts");
  const [followers, setFollowers] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const myHandle = handleOf(me);
  const isMe = !!myHandle && myHandle === handle;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        let found = null;
        try {
          const rows = asItems(await base44.entities.User.filter({ username: handle }));
          found = rows[0] || null;
        } catch (e) {}
        if (!found) {
          try {
            const all = await base44.entities.User.list("-created_date", 300);
            found = (all || []).find((u) => handleOf(u) === handle) || null;
          } catch (e) {}
        }
        if (alive) setProfile(found);

        try { if (alive) setPosts(asItems(await base44.entities.Post.filter({ author_handle: handle }, { sort: "-created_date", limit: 50 }))); } catch (e) {}
        try { const f = await base44.entities.Follow.filter({ following_handle: handle }); if (alive) setFollowers((f || []).length); } catch (e) {}
        if (me) {
          try { const r = await base44.entities.Follow.filter({ follower_id: me.id, following_handle: handle }); if (alive) setIsFollowing((r || []).length > 0); } catch (e) {}
          try { const b = await base44.entities.Block.filter({ blocker_id: me.id, blocked_handle: handle }); if (alive) setIsBlocked((b || []).length > 0); } catch (e) {}
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [handle, me]);

  const toggleFollow = async () => {
    if (!me || !profile) return;
    try {
      if (isFollowing) {
        const rows = await base44.entities.Follow.filter({ follower_id: me.id, following_handle: handle });
        for (const r of rows) await base44.entities.Follow.delete(r.id);
        setIsFollowing(false);
        setFollowers((v) => Math.max(0, v - 1));
      } else {
        await base44.entities.Follow.create({
          follower_id: me.id, follower_handle: myHandle, follower_name: nameOf(me),
          following_id: profile.id, following_handle: handle,
          following_name: nameOf(profile), following_avatar: profile.avatar || "",
        });
        setIsFollowing(true);
        setFollowers((v) => v + 1);
      }
    } catch (e) {}
  };

  const toggleBlock = async () => {
    if (!me) return;
    try {
      if (isBlocked) {
        const rows = await base44.entities.Block.filter({ blocker_id: me.id, blocked_handle: handle });
        for (const r of rows) await base44.entities.Block.delete(r.id);
        setIsBlocked(false);
        onBlock?.(handle, false);
      } else if (profile) {
        await base44.entities.Block.create({ blocker_id: me.id, blocked_id: profile.id, blocked_handle: handle });
        setIsBlocked(true);
        onBlock?.(handle, true);
      }
    } catch (e) {}
  };

  const media = posts.filter((p) => p.media_url);
  const list = tab === "media" ? media : posts;
  const likes = posts.reduce((s, p) => s + (p.likes || 0), 0);
  const name = nameOf(profile) !== "User" ? nameOf(profile) : handle;
  const avatar = profile?.avatar;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-0 sm:p-6 overflow-y-auto">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl my-0 sm:my-6 rounded-none sm:rounded-2xl overflow-hidden bg-black border border-[#2F3336] animate-slide-up">
        <div className="h-28 sm:h-32 bg-[#16181c] relative">
          {profile?.banner && <img src={profile.banner} alt="" className="w-full h-full object-cover" />}
          <button onClick={onClose} className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center hover:bg-black/70" title="Back">
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="px-4 -mt-12">
          <div className="flex items-end justify-between gap-3">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-black bg-[#16181c] shrink-0">
              <img src={avatar || FALLBACK} onError={(e) => { e.currentTarget.src = FALLBACK; }} alt={name} className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center gap-2 pb-1">
              {isMe ? (
                <>
                  <Link to="/profile" className="flex items-center gap-1.5 rounded-full bg-white text-black px-3.5 py-1.5 text-sm font-bold"><Gear className="w-3.5 h-3.5" /> Edit</Link>
                  <Link to="/settings" title="Settings" className="w-9 h-9 rounded-full border border-[#2F3336] flex items-center justify-center hover:bg-white/[0.06]"><Gear className="w-4 h-4 text-white" /></Link>
                </>
              ) : (
                <>
                  <button onClick={() => onMessage?.(handle)} title="Message" className="w-9 h-9 rounded-full border border-[#2F3336] flex items-center justify-center hover:bg-white/[0.06]">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </button>
                  <button onClick={toggleFollow} disabled={!profile} className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold disabled:opacity-40 ${isFollowing ? "border border-[#2F3336] text-white hover:bg-white/[0.06]" : "bg-white text-black"}`}>
                    {isFollowing ? <><Check className="w-4 h-4" /> Following</> : <><UserPlus className="w-4 h-4" /> Follow</>}
                  </button>
                  <button onClick={toggleBlock} title={isBlocked ? "Unblock" : "Block"} className={`w-9 h-9 rounded-full border flex items-center justify-center ${isBlocked ? "border-red-500 text-red-400 bg-red-500/10" : "border-[#2F3336] hover:bg-white/[0.06]"}`}>
                    {isBlocked ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4 text-white" />}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mt-2">
            <h2 className="text-xl font-bold leading-tight flex items-center gap-2 text-white">{name}{profile?.is_creator && <BadgeCheck className="w-4 h-4 text-[#1d9bf0]" />}{isMe && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 font-medium">You</span>}</h2>
            <p className="text-sm text-white/45 flex items-center gap-0.5"><AtSign className="w-3.5 h-3.5" />{handle}</p>
            {loading ? (
              <div className="mt-3 flex items-center gap-2 text-xs text-white/40"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading profile…</div>
            ) : (
              <>
                {profile?.bio && <p className="mt-2.5 text-sm text-white/85 whitespace-pre-wrap">{profile.bio}</p>}
                <div className="flex items-center gap-4 mt-3 text-sm flex-wrap">
                  <span><b className="text-white">{posts.length}</b> <span className="text-white/45">posts</span></span>
                  <span><b className="text-white">{followers}</b> <span className="text-white/45">followers</span></span>
                  <span><b className="text-white">{likes}</b> <span className="text-white/45">likes</span></span>
                  <span className="text-white/40 flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> Member</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex border-b border-[#2F3336] mt-3">
          {[["posts", "Posts", MessageCircle], ["media", "Media", ImageIcon]].map(([k, label, Icon]) => {
            const active = tab === k;
            return (
              <button key={k} onClick={() => setTab(k)} className="relative flex-1 flex items-center justify-center gap-1.5 py-3 text-sm hover:bg-white/[0.03]" style={{ fontWeight: active ? 700 : 400, color: active ? "#fff" : "rgba(255,255,255,0.5)" }}>
                <Icon className="w-4 h-4" /> {label}
                {active && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-12 rounded-full bg-[#1d9bf0]" />}
              </button>
            );
          })}
        </div>

        <div className="divide-y divide-[#2F3336] max-h-[50vh] overflow-y-auto thin-scrollbar">
          {loading ? (
            <p className="p-8 text-center text-sm text-white/40">Loading…</p>
          ) : list.length === 0 ? (
            <p className="p-8 text-center text-sm text-white/40">{tab === "media" ? "No media posts yet." : `@${handle} hasn't posted yet.`}</p>
          ) : (
            list.map((p) => (
              <div key={p.id} className="p-4 flex gap-3 hover:bg-white/[0.02]">
                <img src={avatar || FALLBACK} onError={(e) => { e.currentTarget.src = FALLBACK; }} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="font-bold text-white">{p.author_name || name}</span>
                    <span className="text-white/45">@{p.author_handle || handle}</span>
                  </div>
                  {p.content && <p className="text-[15px] mt-0.5 whitespace-pre-wrap text-white">{p.content}</p>}
                  {p.media_url && (
                    <button onClick={() => setLightbox(p.media_url)} className="mt-2 block rounded-xl overflow-hidden border border-[#2F3336] max-w-xs">
                      {p.media_type === "video" ? (
                        <div className="relative">
                          <video src={p.media_url} className="w-full max-h-56 object-cover" muted />
                          <Play className="absolute inset-0 m-auto w-8 h-8 text-white fill-white" />
                        </div>
                      ) : (
                        <img src={p.media_url} alt="" className="w-full max-h-56 object-cover" />
                      )}
                    </button>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                    <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {p.comments || 0}</span>
                    <span className="flex items-center gap-1"><Repeat2 className="w-3.5 h-3.5" /> {p.rebuzzs || 0}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {p.likes || 0}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center p-6" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"><X className="w-4 h-4 text-white" /></button>
          <img src={lightbox} alt="" className="max-h-full max-w-full rounded-xl" />
        </div>
      )}
    </div>
  );
}

export { handleOf, nameOf };