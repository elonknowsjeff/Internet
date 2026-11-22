import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, CalendarDays, Link2, Loader2, User, BadgeCheck, Play, MessageSquare, Settings as SettingsIcon } from "lucide-react";
import EditProfileDialog from "@/components/profile/EditProfileDialog";
import ProfilePost from "@/components/profile/ProfilePost";
import usePostReactions from "@/hooks/usePostReactions";
import { DEFAULT_AVATAR } from "@/lib/defaults";

const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);
const handleOf = (u) => u?.username || (u?.email ? u.email.split("@")[0] : "");
const nameOf = (u) => u?.display_name || u?.full_name || handleOf(u) || "User";

export default function ZProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [following, setFollowing] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [tab, setTab] = useState("posts");
  const [editing, setEditing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [p, c, lk] = await Promise.all([
          base44.entities.Post.filter({ created_by_id: u.id }, "-created_date", 60).catch(() => []),
          base44.entities.Comment.filter({ author_handle: handleOf(u) }, "-created_date", 40).catch(() => []),
          base44.entities.Like.filter({ user_id: u.id }).catch(() => []),
        ]);
        setPosts(asItems(p));
        setComments(asItems(c));
        const likeRows = asItems(lk);
        const likedIds = likeRows.map((l) => l.post_id);
        if (likedIds.length) {
          const fetched = await Promise.all(likedIds.map((id) => base44.entities.Post.get(id).catch(() => null)));
          setLikedPosts(fetched.filter(Boolean));
        }
        try {
          const [out, back] = await Promise.all([
            base44.entities.Follow.filter({ follower_id: u.id }),
            base44.entities.Follow.filter({ following_id: u.id }),
          ]);
          setFollowing(asItems(out).length);
          setFollowers(asItems(back).length);
        } catch {}
      } catch {}
      setLoading(false);
    })();
  }, []);

  const reloadPosts = async () => {
    if (!user) return;
    try { setPosts(asItems(await base44.entities.Post.filter({ created_by_id: user.id }, "-created_date", 60))); } catch {}
  };
  const { liked, reposted, toggleLike, toggleRepost } = usePostReactions(user, posts, reloadPosts);

  const handle = handleOf(user);
  const name = nameOf(user);
  const joined = user?.created_date ? new Date(user.created_date).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "";

  const ownPosts = posts.filter((p) => !p.repost_of);
  const imagePosts = posts.filter((p) => p.media_url && p.media_type !== "video");
  const videoPosts = posts.filter((p) => p.media_url && p.media_type === "video");

  const tabs = [
    { key: "posts", label: "Posts", count: ownPosts.length },
    { key: "media", label: "Media", count: imagePosts.length + videoPosts.length },
    { key: "replies", label: "Replies", count: comments.length },
    { key: "likes", label: "Likes", count: likedPosts.length },
  ];

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-white/50" /></div>;
  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <User className="mx-auto h-10 w-10 text-white/40" />
        <h2 className="mt-3 text-lg font-bold">Sign in to see your profile</h2>
        <Link to="/login" className="mt-4 inline-block rounded-full bg-white px-5 py-2 text-sm font-bold text-black">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[640px] border-x border-[#2f3336] pb-24">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[#2f3336] bg-black/85 px-3 py-2 backdrop-blur-xl">
        <Link to="/z" className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10"><ArrowLeft className="h-5 w-5" /></Link>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-[15px] font-bold truncate">{name} {user.is_creator && <BadgeCheck className="h-4 w-4 text-[#1d9bf0]" />}</p>
          <p className="text-[11px] text-white/45">{ownPosts.length} posts</p>
        </div>
        <Link to="/settings" className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10"><SettingsIcon className="h-5 w-5 text-white/70" /></Link>
      </header>

      {/* Banner + avatar */}
      <div className="relative h-36 bg-gradient-to-r from-[#1d9bf0]/20 via-white/[0.06] to-[#1d9bf0]/20">
        {user.banner && <img src={user.banner} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="relative px-4">
        <div className="-mt-12 flex items-end justify-between">
          <button onClick={() => setEditing(true)} className="h-24 w-24 overflow-hidden rounded-full border-4 border-black bg-neutral-800">
            {user.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : <User className="h-10 w-10 text-neutral-400" />}
          </button>
          <button onClick={() => setEditing(true)} className="rounded-full border border-white/30 px-4 py-1.5 text-[13px] font-bold hover:bg-white/10">Edit profile</button>
        </div>

        <div className="mt-3">
          <h1 className="text-[20px] font-black leading-tight">{name}</h1>
          <p className="text-[14px] text-white/45">@{handle} · <Link to="/username" className="hover:underline" style={{ color: "#1d9bf0" }}>change</Link></p>
        </div>

        {user.bio && <p className="mt-2 whitespace-pre-wrap text-[14px] text-white/85">{user.bio}</p>}
        {user.bio_link && (
          <a href={/^https?:\/\//i.test(user.bio_link) ? user.bio_link : `https://${user.bio_link}`} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-semibold hover:underline" style={{ color: "#1d9bf0" }}>
            <Link2 className="h-3.5 w-3.5" /> {user.bio_link.replace(/^https?:\/\//i, "").replace(/\/$/, "")}
          </a>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-white/45">
          {joined && <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> Joined {joined}</span>}
          <Link to="/follows"><b className="text-white">{following}</b> Following</Link>
          <Link to="/follows"><b className="text-white">{followers}</b> Followers</Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-3 flex border-b border-[#2f3336]">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className="flex-1 py-3 text-[13px] font-semibold relative hover:bg-white/[0.04]" style={{ color: tab === t.key ? "#fff" : "rgba(255,255,255,0.5)" }}>
            {t.label}
            {tab === t.key && <span className="absolute bottom-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-white" />}
          </button>
        ))}
      </div>

      {tab === "posts" && (ownPosts.length === 0 ? (
        <p className="py-10 text-center text-sm text-white/45">No posts yet.</p>
      ) : ownPosts.map((p) => (
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
          onDm={() => navigate("/z/messages")}
        />
      )))}

      {tab === "media" && (imagePosts.length + videoPosts.length === 0 ? (
        <p className="py-10 text-center text-sm text-white/45">No media yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-0.5">
          {[...imagePosts, ...videoPosts].map((p) => (
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
      ))}

      {tab === "replies" && (comments.length === 0 ? (
        <p className="py-10 text-center text-sm text-white/45">No replies yet.</p>
      ) : (
        <div className="divide-y divide-[#2f3336]">
          {comments.map((c) => (
            <div key={c.id} className="px-4 py-3">
              <p className="text-[11px] text-white/40">Reply to a post</p>
              <p className="mt-1 whitespace-pre-wrap text-[14px] text-white/85">{c.content}</p>
            </div>
          ))}
        </div>
      ))}

      {tab === "likes" && (likedPosts.length === 0 ? (
        <p className="py-10 text-center text-sm text-white/45">No liked posts yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-0.5">
          {likedPosts.filter((p) => p.media_url).map((p) => (
            <div key={p.id} className="relative aspect-square overflow-hidden bg-white/[0.03]">
              {p.media_type === "video" ? <video src={p.media_url} className="h-full w-full object-cover" /> : <img src={p.media_url} alt="" className="h-full w-full object-cover" />}
            </div>
          ))}
        </div>
      ))}

      <EditProfileDialog
        open={editing}
        user={user}
        onClose={() => setEditing(false)}
        onSaved={(patch) => { setUser((u) => ({ ...u, ...patch })); setPosts((ps) => ps.map((p) => ({ ...p, author_name: patch.display_name || p.author_name, author_handle: patch.username || p.author_handle, author_avatar: patch.avatar || p.author_avatar }))); }}
      />
    </div>
  );
}