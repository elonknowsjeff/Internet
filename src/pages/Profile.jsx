import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useSettings } from "@/components/SettingsContext";
import { startSubscription } from "@/lib/checkout";
import { ArrowLeft, CalendarDays, CreditCard, LogOut, Loader2, User, Gamepad2, Camera, Play, Link2 } from "lucide-react";
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
  const tabs = [
    { key: "posts", label: "Posts", count: ownPosts.length },
    { key: "reposts", label: "Reposts", count: reposts.length },
    { key: "media", label: "Photos", count: imagePosts.length },
    { key: "videos", label: "Videos", count: videoPosts.length },
    { key: "games", label: "Games", count: recentGames.length },
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
    return <div className="py-24 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-white/50" /></div>;
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <User className="w-10 h-10 mx-auto text-white/40" />
        <h2 className="mt-3 text-lg font-bold">Sign in to see your profile</h2>
        <Link to="/login" className="mt-4 inline-block px-5 py-2 rounded-full bg-white text-black text-sm font-bold">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[640px] mx-auto pb-28 bg-[#0a0512]/40">
      {/* X-style header */}
      <header className="sticky top-0 z-30 flex items-center gap-3 px-3 py-2 bg-[#0a0512]/85 backdrop-blur-xl border-b border-white/10">
        <Link to="/" className="w-9 h-9 rounded-full hover:bg-white/10 grid place-items-center shrink-0"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold truncate leading-tight">{name}</p>
          <p className="text-[11px] text-white/45 leading-tight">{ownPosts.length} posts · {reposts.length} reposts</p>
        </div>
        <AccountSearch me={user} onPick={(h) => setViewHandle(h)} />
      </header>

      {/* Banner + avatar */}
      <div className="relative h-40 bg-gradient-to-r from-fuchsia-700/50 via-violet-700/40 to-cyan-700/40">
        {user.banner && <img src={user.banner} alt="" className="w-full h-full object-cover" />}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/30 bg-black/40 backdrop-blur text-xs font-bold hover:bg-black/60"
          >
            <Camera className="w-3.5 h-3.5" /> Change photo
          </button>
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-1.5 rounded-full border border-white/30 bg-black/40 backdrop-blur text-sm font-bold hover:bg-black/60"
          >
            Edit profile
          </button>
        </div>
        <button
          onClick={() => setEditing(true)}
          title="Change profile photo"
          style={{ boxShadow: "0 0 0 3px color-mix(in srgb, var(--brand) 55%, transparent), 0 0 26px -6px var(--brand)" }}
          className="absolute -bottom-12 left-4 w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-[var(--bg-base)] bg-neutral-800 grid place-items-center group"
        >
          {user.avatar ? <img src={user.avatar} alt="profile" className="w-full h-full object-cover" /> : <User className="w-9 h-9 text-neutral-400" />}
          <span className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center">
            <Camera className="w-6 h-6" />
          </span>
        </button>
      </div>

      <div className="px-4 pt-14">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-black leading-tight truncate">{name}</h1>
            <p className="text-sm text-white/45">@{handle} · <Link to="/username" className="hover:underline" style={{ color: "var(--brand)" }}>change username</Link></p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => startSubscription("plus").catch(() => {})} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black text-xs font-bold">
              <CreditCard className="w-3.5 h-3.5" /> Internet X
            </button>
            <button onClick={logout} title="Log off" className="w-8 h-8 rounded-full border border-white/15 grid place-items-center text-white/60 hover:text-rose-400 hover:bg-white/10">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {user.bio && <p className="mt-3 text-sm text-white/85 whitespace-pre-wrap">{user.bio}</p>}

        {user.bio_link && (
          <a
            href={/^https?:\/\//i.test(user.bio_link) ? user.bio_link : `https://${user.bio_link}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold hover:underline"
            style={{ color: "var(--brand)" }}
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
      <div className="flex mt-3 border-b border-white/10">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-sm relative hover:bg-white/[0.04] ${tab === t.key ? "font-bold text-white" : "text-white/45"}`}
          >
            {t.label}{t.count ? ` ${t.count}` : ""}
            {tab === t.key && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-full bg-fuchsia-400" />}
          </button>
        ))}
      </div>

      {tab === "posts" && (
        ownPosts.length === 0 ? (
          <p className="text-sm text-white/45 py-10 text-center">No posts yet — share something on the Feed.</p>
        ) : ownPosts.map(renderPost)
      )}

      {tab === "reposts" && (
        reposts.length === 0 ? (
          <p className="text-sm text-white/45 py-10 text-center">Nothing reposted yet — repost a post and it appears here.</p>
        ) : reposts.map((p) => (
          <RepostCard key={p.id} post={p} onOpen={(h) => h && setViewHandle(h)} />
        ))
      )}

      {tab === "media" && (
        imagePosts.length === 0 ? (
          <p className="text-sm text-white/45 py-10 text-center">No photos posted yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-0.5 p-0.5">
            {imagePosts.map((p) => (
              <a key={p.id} href={p.media_url} target="_blank" rel="noreferrer" className="aspect-square bg-black/50 overflow-hidden block">
                <img src={p.media_url} alt="" className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
              </a>
            ))}
          </div>
        )
      )}

      {tab === "videos" && (
        videoPosts.length === 0 ? (
          <p className="text-sm text-white/45 py-10 text-center">No videos posted yet.</p>
        ) : (
          <div className="p-3 space-y-3">
            {videoPosts.map((p) => (
              <div key={p.id} className="rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                <video src={p.media_url} controls className="w-full max-h-96 bg-black" />
                {p.content && (
                  <p className="flex items-start gap-2 text-sm text-white/75 p-3">
                    <Play className="w-3.5 h-3.5 mt-1 text-fuchsia-300 shrink-0" /> {p.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {tab === "games" && (
        recentGames.length === 0 ? (
          <p className="text-sm text-white/45 py-10 text-center flex items-center justify-center gap-2"><Gamepad2 className="w-4 h-4" /> No games played yet — open Gaming and hit play.</p>
        ) : (
          <div className="p-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
            {recentGames.map((g) => {
              let hours = "0.0";
              try { hours = (JSON.parse(localStorage.getItem("walza_game_hours") || "{}")[g.id] || 0).toFixed(1); } catch {}
              return (
                <div key={g.id} className="text-center">
                  <div className="aspect-square rounded-xl overflow-hidden border border-white/10">
                    <img src={g.cover} alt={g.title} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[11px] mt-1.5 truncate">{g.title}</p>
                  <p className="text-[10px] text-white/40">{hours}h played</p>
                </div>
              );
            })}
          </div>
        )
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