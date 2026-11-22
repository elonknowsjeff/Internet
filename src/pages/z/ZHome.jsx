import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, ImagePlus, Send, Video as VideoIcon, X } from "lucide-react";
import PostCard from "@/components/social/PostCard";
import StoriesBar from "@/components/StoriesBar";
import usePostReactions from "@/hooks/usePostReactions";
import ProfileSheet from "@/components/social/ProfileSheet";
import { DEFAULT_AVATAR } from "@/lib/defaults";

const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);
const handleOf = (u) => u?.username || (u?.email ? u.email.split("@")[0] : "");
const nameOf = (u) => u?.display_name || u?.full_name || handleOf(u) || "You";

export default function ZHome() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState(null);
  const [tab, setTab] = useState("foryou");
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [pendingMedia, setPendingMedia] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [bookmarked, setBookmarked] = useState({});
  const [profileHandle, setProfileHandle] = useState(null);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      if (u) {
        base44.entities.Follow.filter({ follower_id: u.id })
          .then((rows) => setFollowing(new Set(asItems(rows).map((r) => r.following_handle).filter(Boolean))))
          .catch(() => setFollowing(new Set()));
        base44.entities.Bookmark.list("-created_date", 200)
          .then((rows) => {
            const map = {};
            asItems(rows).forEach((b) => { map[b.post_id] = b.id; });
            setBookmarked(map);
          })
          .catch(() => {});
      } else setFollowing(new Set());
    }).catch(() => { setUser(null); setFollowing(new Set()); });
    const unsub = base44.entities.Post?.subscribe?.(() => loadPosts());
    return () => { if (typeof unsub === "function") unsub(); };
  }, []);

  const loadPosts = async () => {
    try { setPosts(asItems(await base44.entities.Post.list("-created_date", 40))); }
    catch { setPosts([]); }
  };

  useEffect(() => { (async () => { await loadPosts(); setLoading(false); })(); }, []);

  const { liked, reposted, toggleLike, toggleRepost } = usePostReactions(user, posts, loadPosts);

  const toggleBookmark = async (p) => {
    const existing = bookmarked[p.id];
    if (existing) {
      await base44.entities.Bookmark.delete(existing).catch(() => {});
      setBookmarked((s) => { const n = { ...s }; delete n[p.id]; return n; });
    } else {
      const rec = await base44.entities.Bookmark.create({ post_id: p.id }).catch(() => null);
      if (rec) setBookmarked((s) => ({ ...s, [p.id]: rec.id }));
    }
  };

  const uploadMedia = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      if (res?.file_url) {
        const type = file.type.startsWith("video") ? "video" : "image";
        setPendingMedia({ url: res.file_url, type });
      }
    } catch {}
    setUploading(false);
    e.target.value = "";
  };

  const authorName = nameOf(user);
  const authorHandle = handleOf(user) || "you";
  const authorAvatar = user?.avatar || DEFAULT_AVATAR;
  const isOwn = (p) => !!user && p.author_handle === authorHandle;

  const post = async () => {
    if (!user) { navigate("/login"); return; }
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

  const feed = useMemo(() => {
    if (tab === "following" && following) {
      return posts.filter((p) => following.has(p.author_handle));
    }
    return posts;
  }, [posts, tab, following]);

  return (
    <div className="mx-auto w-full max-w-[640px] border-x border-[#2f3336] min-h-[100dvh]">
      {/* Top tabs */}
      <header className="sticky top-0 z-30 border-b border-[#2f3336] bg-black/85 backdrop-blur-xl">
        <div className="flex">
          {[
            { k: "foryou", l: "For you" },
            { k: "following", l: "Following" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className="flex-1 py-4 text-[15px] font-semibold relative transition-colors hover:bg-white/[0.04]"
              style={{ color: tab === t.k ? "#fff" : "rgba(255,255,255,0.5)" }}
            >
              {t.l}
              {tab === t.k && <span className="absolute bottom-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-white" />}
            </button>
          ))}
        </div>
      </header>

      {/* Stories */}
      <div className="border-b border-[#2f3336]">
        <StoriesBar user={user} />
      </div>

      {/* Composer */}
      <div className="border-b border-[#2f3336] p-3.5">
        <div className="flex gap-3">
          <img src={authorAvatar} alt="you" className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-white/15" />
          <div className="min-w-0 flex-1">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="What's happening?"
              rows={2}
              className="w-full resize-none bg-transparent pt-1 text-[16px] leading-6 outline-none placeholder-white/40"
            />
            {pendingMedia && (
              <div className="relative mt-2 inline-block">
                {pendingMedia.type === "video" ? (
                  <video src={pendingMedia.url} className="max-h-64 rounded-2xl border border-[#2f3336]" />
                ) : (
                  <img src={pendingMedia.url} alt="" className="max-h-64 rounded-2xl border border-[#2f3336]" />
                )}
                <button onClick={() => setPendingMedia(null)} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/75 text-white hover:bg-black">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between border-t border-[#2f3336] pt-2">
              <div className="flex items-center gap-1">
                <label className="grid h-9 w-9 cursor-pointer place-items-center rounded-full text-white/70 hover:bg-white/10">
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                  <input type="file" accept="image/*" onChange={uploadMedia} className="hidden" />
                </label>
                <label className="grid h-9 w-9 cursor-pointer place-items-center rounded-full text-white/70 hover:bg-white/10">
                  <VideoIcon className="h-5 w-5" />
                  <input type="file" accept="video/*" onChange={uploadMedia} className="hidden" />
                </label>
              </div>
              <button
                onClick={post}
                disabled={!draft.trim() && !pendingMedia}
                className="flex h-9 items-center gap-1.5 rounded-full bg-white px-5 text-[14px] font-bold text-black disabled:opacity-40"
              >
                <Send className="h-4 w-4" /> Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/50" /></div>
      ) : feed.length === 0 ? (
        <div className="py-16 text-center text-sm text-white/45">
          {tab === "following" ? "Follow people to see their posts here." : "Nothing here yet. Be the first to post!"}
        </div>
      ) : (
        feed.map((p) => (
          <PostCard
            key={p.id}
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
        ))
      )}

      {profileHandle && <ProfileSheet handle={profileHandle} onClose={() => setProfileHandle(null)} />}
    </div>
  );
}