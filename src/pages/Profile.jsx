import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useSettings } from "@/components/SettingsContext";
import { startSubscription } from "@/lib/checkout";
import { ArrowLeft, CalendarDays, CreditCard, LogOut, Loader2, User, Gamepad2, Camera, Play, Link2, Grid3x3, MessageCircle, Heart } from "lucide-react";
import AccountSearch from "@/components/profile/AccountSearch";
import EditProfileDialog from "@/components/profile/EditProfileDialog";
import ProfilePost from "@/components/profile/ProfilePost";
import RepostCard from "@/components/profile/RepostCard";
import AccountView from "@/components/social/AccountView";
import DmsPanel from "@/components/DmsPanel";
import CallStage from "@/components/messages/CallStage";
import IncomingCallBanner from "@/components/messages/IncomingCallBanner";
import usePostReactions from "@/hooks/usePostReactions";
import useSocialCall from "@/hooks/useSocialCall";

const handleOf = (u) => u?.username || (u?.email ? u.email.split("@")[0] : "");
const nameOf = (u) => u?.display_name || u?.full_name || handleOf(u) || "User";

export default function Profile() {
  const { settings } = useSettings();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [recentGames, setRecentGames] = useState([]);
  const [tab, setTab] = useState("posts");
  const [editing, setEditing] = useState(false);
  const [viewHandle, setViewHandle] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [dmOpen, setDmOpen] = useState(false);
  const [dmTarget, setDmTarget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const p = await base44.entities.Post.filter({ created_by_id: u.id }, "-created_date", 50);
        setPosts(p);
        try {
          const [out, back] = await Promise.all([
            base44.entities.Follow.filter({ follower_id: u.id }),
            base44.entities.Follow.filter({ following_id: u.id }),
          ]);
          setFollowing(out.length);
          setFollowers(back.length);
        } catch {}
        try { setRecentGames(JSON.parse(localStorage.getItem("walza_recent_games") || "[]")); } catch {}
      } catch {}
      setLoading(false);
    })();
  }, []);

  const logout = async () => { try { await base44.auth.logout(); } catch { window.location.href = "/"; } };

  const reloadPosts = async () => {
    if (!user) return;
    try { setPosts(await base44.entities.Post.filter({ created_by_id: user.id }, "-created_date", 50)); } catch {}
  };

  const { liked, reposted, toggleLike, toggleRepost } = usePostReactions(user, posts, reloadPosts);
  const { call, startTo } = useSocialCall(user);

  const handle = handleOf(user);
  const name = nameOf(user);
  const joined = user?.created_date
    ? new Date(user.created_date).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : "";
  const ownPosts = posts.filter((p) => !p.repost_of);
  const reposts = posts.filter((p) => p.repost_of);
  const imagePosts = posts.filter((p) => p.media_url && p.media_type !== "video");
  const videoPosts = posts.filter((p) => p.media_url && p.media_type === "video");
  const replyPosts = ownPosts.filter((p) => p.repost_of); // placeholder, replies would need a replies field
  const likedPosts = posts; // simplified: show all posts as "likes" tab placeholder
  const tabs = [
    { key: "posts", label: "Posts", count: ownPosts.length, icon: MessageCircle },
    { key: "media", label: "Media", count: imagePosts.length + videoPosts.length, icon: Grid3x3 },
    { key: "replies", label: "Replies", count: 0, icon: MessageCircle },
    { key: "likes", label: "Likes", count: 0, icon: Heart },
  ];

  const renderPost = (p) => (
    <ProfilePost
      key={p.id}
      post={p}
      name={name}
      handle={handle}
      avatar={user.avatar}
      liked={!!liked[p.id]}
      reposted={!!reposted[p.id]}
      onLike={toggleLike}
      onRepost={toggleRepost}
      commentsOpen={expandedId === p.id}
      onComment={(x) => setExpandedId(expandedId === x.id ? null : x.id)}
      onCommented={reloadPosts}
      onDm={() => setDmOpen(true)}
      onCall={startTo}
    />
  );

  if (loading) {
    return <div className="py-24 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-white/30" /></div>;
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <User className="w-10 h-10 mx-auto text-white/30" />
        <h2 className="mt-3 text-lg font-bold text-white">Sign in to see your profile</h2>
        <Link to="/login" className="mt-4 inline-block px-5 py-2 rounded-full bg-white text-black text-sm font-bold">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[640px] mx-auto pb-28 xl:pb-6 bg-black min-h-[100dvh]">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-2.5 bg-black/90 backdrop-blur-xl border-b border-[#2F3336] xl:hidden">
        <Link to="/" className="w-9 h-9 rounded-full hover:bg-white/[0.06] grid place-items-center shrink-0"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold truncate leading-tight text-white">{name}</p>
          <p className="text-[11px] text-white/40 leading-tight">{ownPosts.length} posts</p>
        </div>
        <AccountSearch me={user} onPick={(h) => setViewHandle(h)} />
      </header>

      {/* Banner + avatar */}
      <div className="relative h-32 bg-[#16181c] sm:h-40">
        {user.banner && <img src={user.banner} alt="" className="w-full h-full object-cover" />}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 rounded-full border border-[#2F3336] bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur hover:bg-black/80"
          >
            <Camera className="w-3.5 h-3.5" /> Edit
          </button>
        </div>
        <button
          onClick={() => setEditing(true)}
          title="Change profile photo"
          className="absolute -bottom-10 left-4 w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-black bg-[#16181c] grid place-items-center group"
        >
          {user.avatar ? <img src={user.avatar} alt="profile" className="w-full h-full object-cover" /> : <User className="w-9 h-9 text-white/40" />}
          <span className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center">
            <Camera className="w-6 h-6 text-white" />
          </span>
        </button>
      </div>

      <div className="px-4 pt-12">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-black leading-tight truncate text-white">{name}</h1>
            <p className="text-sm text-white/45">@{handle} · <Link to="/username" className="hover:underline text-[#1d9bf0]">change</Link></p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => startSubscription("plus").catch(() => {})} className="flex items-center gap-1.5 rounded-full border border-[#2F3336] px-3 py-1.5 text-white text-xs font-bold hover:bg-white/[0.06]">
              <CreditCard className="w-3.5 h-3.5" /> Z+
            </button>
            <button onClick={logout} title="Log off" className="w-8 h-8 rounded-full border border-[#2F3336] grid place-items-center text-white/50 hover:text-red-400 hover:bg-white/[0.06]">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {user.bio && <p className="mt-3 text-sm text-white/90 whitespace-pre-wrap">{user.bio}</p>}

        {user.bio_link && (
          <a
            href={/^https?:\/\//i.test(user.bio_link) ? user.bio_link : `https://${user.bio_link}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold hover:underline text-[#1d9bf0]"
          >
            <Link2 className="w-3.5 h-3.5 shrink-0" />
            {user.bio_link.replace(/^https?:\/\//i, "").replace(/\/$/, "")}
          </a>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-white/45">
          {joined && <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4" /> Joined {joined}</span>}
          <Link to="/follows"><b className="text-white">{following}</b> following</Link>
          <Link to="/follows"><b className="text-white">{followers}</b> followers</Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mt-4 border-b border-[#2F3336]">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="relative flex-1 flex items-center justify-center gap-1.5 py-3.5 text-sm hover:bg-white/[0.03]"
              style={{ fontWeight: active ? 700 : 400, color: active ? "#fff" : "rgba(255,255,255,0.5)" }}
            >
              <Icon className="w-4 h-4 sm:hidden" />
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.label}</span>
              {active && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-14 rounded-full bg-[#1d9bf0]" />}
            </button>
          );
        })}
      </div>

      {tab === "posts" && (
        ownPosts.length === 0 ? (
          <p className="text-sm text-white/40 py-10 text-center">No posts yet — share something on the Feed.</p>
        ) : ownPosts.map(renderPost)
      )}

      {tab === "media" && (
        (imagePosts.length + videoPosts.length) === 0 ? (
          <p className="text-sm text-white/40 py-10 text-center">No media posted yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-0.5">
            {[...videoPosts, ...imagePosts].map((p) => (
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
        )
      )}

      {tab === "replies" && (
        <p className="text-sm text-white/40 py-10 text-center">No replies yet.</p>
      )}

      {tab === "likes" && (
        <p className="text-sm text-white/40 py-10 text-center">Posts you liked will appear here.</p>
      )}

      <EditProfileDialog
        open={editing}
        user={user}
        onClose={() => setEditing(false)}
        onSaved={(patch) => { setUser((u) => ({ ...u, ...patch })); setPosts((ps) => ps.map((p) => ({ ...p, author_name: patch.display_name || p.author_name, author_handle: patch.username || p.author_handle, author_avatar: patch.avatar || p.author_avatar }))); }}
      />

      {viewHandle && (
        <AccountView
          handle={viewHandle}
          me={user}
          onClose={() => setViewHandle(null)}
          onMessage={(h) => { setViewHandle(null); setDmTarget(h); setDmOpen(true); }}
        />
      )}
      {dmOpen && <DmsPanel initialHandle={dmTarget} onClose={() => setDmOpen(false)} />}
      <IncomingCallBanner incoming={call.incoming} onAccept={call.accept} onDecline={call.decline} />
      <CallStage call={call} />
    </div>
  );
}