import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Sparkles, Search, ImagePlus, Loader2, BarChart3, Wand2, Camera, X, Video as VideoIcon, Smile, Target } from "lucide-react";
import ComposerPoll from "@/components/social/ComposerPoll";
import EmojiGifPicker from "@/components/social/EmojiGifPicker";
import QuickComposeBar from "@/components/social/QuickComposeBar";
import ListsBar from "@/components/feed/ListsBar";
import CameraCapture from "@/components/social/CameraCapture";
import HubBanner from "@/components/feed/HubBanner";
import AccountView from "@/components/social/AccountView";
import DmsPanel from "@/components/DmsPanel";
import LikeAnimation from "@/components/LikeAnimation";
import usePostReactions from "@/hooks/usePostReactions";
import useSocialCall from "@/hooks/useSocialCall";
import CallStage from "@/components/messages/CallStage";
import IncomingCallBanner from "@/components/messages/IncomingCallBanner";
import StoriesBar from "@/components/StoriesBar";
import XSearchPanel from "@/components/social/XSearchPanel";
import PostCard from "@/components/social/PostCard";
import CreatorCard from "@/components/social/CreatorCard";
import ProfilePhotoDialog from "@/components/profile/ProfilePhotoDialog";
import TrendingBar from "@/components/feed/TrendingBar";
import ProductivityHub from "@/components/productivity/ProductivityHub";
import WidgetsRail from "@/components/feed/WidgetsRail";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { useSettings } from "@/components/SettingsContext";

const avatars = [
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
];

const TABS = [
  { key: "foryou", label: "For you" },
  { key: "following", label: "Following" },
  { key: "bookmarks", label: "Bookmarks" },
  { key: "lists", label: "Lists" },
];

export default function Feed() {
  const { settings } = useSettings();
  const compact = settings.density === "compact";
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [user, setUser] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [authorFilter, setAuthorFilter] = useState(null);
  const [tab, setTab] = useState("foryou");
  const [following, setFollowing] = useState(null);
  const [search, setSearch] = useState("");
  const [pendingMedia, setPendingMedia] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dmOpen, setDmOpen] = useState(false);
  const [dmTarget, setDmTarget] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [blocked, setBlocked] = useState(new Set());
  const [creatorBusy, setCreatorBusy] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTab, setSearchTab] = useState("top");
  const [bookmarked, setBookmarked] = useState({});
  const [savedPosts, setSavedPosts] = useState([]);
  const [lists, setLists] = useState([]);
  const [activeList, setActiveList] = useState(null);
  const [pollOptions, setPollOptions] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(() => localStorage.getItem("laxin_focus") === "1");
  const draftRef = useRef(null);
  const toggleFocus = () =>
    setFocusMode((v) => {
      localStorage.setItem("laxin_focus", v ? "0" : "1");
      return !v;
    });
  const applyAvatar = (url) => setUser((u) => Object.assign({}, u, { avatar: url }));
  const creator = !!user?.is_creator;

  const enableCreator = async () => {
    if (!user || creatorBusy) return;
    setCreatorBusy(true);
    try {
      await base44.auth.updateMe({ is_creator: true });
      setUser((u) => ({ ...u, is_creator: true }));
    } finally {
      setCreatorBusy(false);
    }
  };

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      if (res?.file_url) setPendingMedia({ url: res.file_url, type: "image" });
    } catch (err) {}
    setUploading(false);
    e.target.value = "";
  };

  const uploadVideo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      if (res?.file_url) setPendingMedia({ url: res.file_url, type: "video" });
    } catch (err) {}
    setUploading(false);
    e.target.value = "";
  };

  const load = async () => {
    try {
      const data = await base44.entities.Post.list("-created_date", 50);
      setPosts(data);
    } catch (e) { setPosts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    base44.auth.me().then(setUser).catch(() => {});
    const unsub = base44.entities.Post?.subscribe?.(() => load());
    return () => { if (typeof unsub === "function") unsub(); };
  }, []);

  useEffect(() => {
    if (!user) return;
    load();
    base44.entities.Follow.filter({ follower_id: user.id }).then((rows) => setFollowing(new Set(rows.map((r) => r.following_handle).filter(Boolean)))).catch(() => {});
    base44.entities.Block.filter({ blocker_id: user.id }).then((rows) => setBlocked(new Set(rows.map((r) => r.blocked_handle).filter(Boolean)))).catch(() => {});
    base44.entities.Bookmark.list("-created_date", 200)
      .then((rows) => {
        const map = {};
        (Array.isArray(rows) ? rows : rows?.items || []).forEach((b) => { map[b.post_id] = b.id; });
        setBookmarked(map);
      })
      .catch(() => {});
    base44.entities.PostList.list("-created_date", 50)
      .then((rows) => setLists(Array.isArray(rows) ? rows : rows?.items || []))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (tab !== "bookmarks") return;
    const ids = Object.keys(bookmarked);
    if (!ids.length) { setSavedPosts([]); return; }
    base44.entities.Post.filter({ id: { $in: ids } }, { limit: 50 })
      .then((res) => setSavedPosts(Array.isArray(res) ? res : res?.items || []))
      .catch(() => setSavedPosts([]));
  }, [tab, bookmarked]);

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

  const createList = async (data) => {
    const rec = await base44.entities.PostList.create(data);
    setLists((prev) => [rec, ...prev]);
    setActiveList(rec);
  };

  const onBlocked = (handle, isBlocked) =>
    setBlocked((s) => {
      const n = new Set(s);
      if (isBlocked) n.add(handle); else n.delete(handle);
      return n;
    });

  const authorName = user?.display_name || user?.full_name || "You";
  const authorHandle = user?.username || (user ? ((user.display_name || user.full_name || "").toLowerCase().replace(/\s+/g, "") || user.email?.split("@")[0]) : "you");
  const authorAvatar = user?.avatar || avatars[0];

  const genImage = async () => {
    if (!aiPrompt.trim() || aiBusy) return;
    setAiBusy(true);
    try {
      const res = await base44.integrations.Core.GenerateImage({ prompt: aiPrompt.trim() });
      if (res?.url) { setPendingMedia({ url: res.url, type: "image" }); setAiOpen(false); setAiPrompt(""); }
    } catch (e) {}
    setAiBusy(false);
  };

  const pollReady = (pollOptions || []).map((o) => o.trim()).filter(Boolean);

  const post = async () => {
    if (!draft.trim() && !pendingMedia && pollReady.length < 2) return;
    await base44.entities.Post.create({
      content: draft.trim() || "Poll",
      author_name: authorName,
      author_handle: authorHandle,
      author_avatar: authorAvatar,
      category: "general",
      is_creator: creator,
      ...(pendingMedia ? { media_url: pendingMedia.url, media_type: pendingMedia.type } : {}),
      ...(pollReady.length >= 2 ? { poll_options: pollReady.map((label) => ({ label, votes: 0 })) } : {}),
    });
    setDraft("");
    setPendingMedia(null);
    setPollOptions(null);
    load();
  };

  const del = async (p) => {
    if (!confirm("Delete this post?")) return;
    await base44.entities.Post.delete(p.id);
    load();
  };

  const isOwn = (p) => !!user && p.author_handle === authorHandle;

  const { liked, reposted, toggleLike, toggleRepost } = usePostReactions(user, posts, load);
  const { call, startTo } = useSocialCall(user);

  const base = authorFilter ? posts.filter((p) => p.author_handle === authorFilter) : posts;
  const searched = search.trim()
    ? base.filter((p) => (p.content || "").toLowerCase().includes(search.toLowerCase()) || (p.author_name || "").toLowerCase().includes(search.toLowerCase()) || (p.author_handle || "").toLowerCase().includes(search.toLowerCase()))
    : base;
  const visible = searched.filter((p) => !blocked.has(p.author_handle));
  const feedPosts = tab === "following" && following ? visible.filter((p) => following.has(p.author_handle) || p.author_handle === authorHandle) : visible;
  const listPosts = activeList ? visible.filter((p) => (activeList.handles || []).includes(p.author_handle)) : [];
  const displayPosts = tab === "bookmarks" ? savedPosts.filter((p) => !blocked.has(p.author_handle)) : tab === "lists" ? listPosts : feedPosts;

  return (
    <div className="relative flex justify-center">
      <LikeAnimation />
      <div className="flex w-full max-w-[1280px] items-start gap-5 px-3 sm:px-5">

        {/* Timeline column — the app's editorial voice */}
        <div className="relative min-w-0 max-w-[720px] flex-1 pb-28">
          <header className="sticky top-3 z-30 mb-4 overflow-hidden rounded-[22px] atmo-glass">
            <div className="flex items-center gap-2.5 h-[56px] px-3 sm:px-4">
              <button onClick={() => setPhotoOpen(true)} title="Change profile photo" className="shrink-0">
                {authorAvatar ? (
                  <img src={authorAvatar} alt="you" className="w-8 h-8 rounded-full object-cover ring-1 ring-white/15 hover:ring-white/40 transition" />
                ) : (
                  <span className="w-8 h-8 rounded-full brand-grad grid place-items-center text-[13px] font-bold text-black">
                    {authorName[0]?.toUpperCase()}
                  </span>
                )}
              </button>
              <h1 className="hidden sm:block text-[19px] font-extrabold tracking-tight shrink-0">Home</h1>
              <TrendingBar
                query={search}
                setQuery={setSearch}
                posts={posts}
                onTag={(tag) => { setTab("foryou"); setAuthorFilter(null); setSearch(tag); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                onOpenUser={setAuthorFilter}
                onOpenSearch={() => { setSearchTab("top"); setSearchOpen(true); }}
              />
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={toggleFocus}
                  title={focusMode ? "Exit focus mode" : "Focus mode"}
                  className={`w-9 h-9 rounded-full grid place-items-center transition-colors ${focusMode ? "panel text-white" : "text-white/70 hover:bg-white/10"}`}
                >
                  <Target className="w-[19px] h-[19px]" />
                </button>
                <NotificationCenter user={user} />
              </div>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto px-2 pb-2 scrollbar-none">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`relative shrink-0 overflow-hidden rounded-full px-4 py-1.5 text-[13px] transition-colors ${
                    tab === t.key ? "font-bold text-white" : "font-medium text-white/45 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  {tab === t.key && <span className="absolute inset-0 brand-grad opacity-25" />}
                  <span className="relative">{t.label}</span>
                </button>
              ))}
            </div>
          </header>

          <ProductivityHub />

          {!focusMode && <HubBanner />}

          {authorFilter && (
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.08] bg-white/[0.03] text-[13px]">
              <span>Showing posts from <b>@{authorFilter}</b></span>
              <button onClick={() => setAuthorFilter(null)} className="text-fuchsia-300 font-semibold hover:underline">Clear</button>
            </div>
          )}

          {/* Stories sit on top of the timeline, Instagram style */}
          {!focusMode && <StoriesBar posts={posts} user={user} />}

          {/* Composer */}
          <div className="mb-3 rounded-[22px] atmo-stage px-4 pt-4 pb-2">
          <div className="flex gap-3">
            <button onClick={() => setPhotoOpen(true)} title="Change profile photo" className="shrink-0 group">
              {authorAvatar ? (
                <img src={authorAvatar} alt="you" className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10 group-hover:ring-white/40 transition" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-500 flex items-center justify-center font-bold text-black group-hover:brightness-110 transition">
                  {authorName[0]?.toUpperCase()}
                </div>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <textarea
                ref={draftRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="What is happening?!"
                rows={2}
                className="w-full bg-transparent resize-none outline-none text-[17px] leading-6 pt-1 placeholder-white/40"
              />

              {pollOptions && (
                <ComposerPoll options={pollOptions} onChange={setPollOptions} onRemove={() => setPollOptions(null)} />
              )}

              {pendingMedia && (
                <div className="relative mt-2 inline-block">
                  {pendingMedia.type === "video" ? (
                    <video src={pendingMedia.url} className="max-h-60 rounded-2xl border border-white/10" />
                  ) : (
                    <img src={pendingMedia.url} alt="media" className="max-h-60 rounded-2xl border border-white/10" />
                  )}
                  <button onClick={() => setPendingMedia(null)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/75 backdrop-blur text-white flex items-center justify-center hover:bg-black">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {aiOpen && (
                <div className="mt-2 flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-full px-3 py-1.5">
                  <Sparkles className="w-4 h-4 text-fuchsia-400 shrink-0" />
                  <input value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Describe an image for Super Internet AI to make…" className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder-white/40" />
                  <button onClick={genImage} disabled={aiBusy || !aiPrompt.trim()} className="text-xs px-3 py-1 rounded-full bg-white text-black font-bold disabled:opacity-40">{aiBusy ? "Making…" : "Generate"}</button>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-white/[0.08] mt-2.5 pt-2 pb-1.5">
                <div className="flex items-center gap-0.5 -ml-2">
                  <label title="Upload a photo" className="cursor-pointer w-9 h-9 rounded-full grid place-items-center text-fuchsia-400 hover:bg-fuchsia-400/10">
                    {uploading ? <Loader2 className="w-[20px] h-[20px] animate-spin" /> : <ImagePlus className="w-[20px] h-[20px]" />}
                    <input type="file" accept="image/*" onChange={uploadImage} className="hidden" />
                  </label>
                  <label title="Upload a video" className="cursor-pointer w-9 h-9 rounded-full grid place-items-center text-fuchsia-400 hover:bg-fuchsia-400/10">
                    {uploading ? <Loader2 className="w-[20px] h-[20px] animate-spin" /> : <VideoIcon className="w-[20px] h-[20px]" />}
                    <input type="file" accept="video/*" onChange={uploadVideo} className="hidden" />
                  </label>
                  <button onClick={() => setCameraOpen(true)} title="Take a photo" className="w-9 h-9 rounded-full grid place-items-center text-fuchsia-400 hover:bg-fuchsia-400/10"><Camera className="w-[20px] h-[20px]" /></button>
                  <button onClick={() => setAiOpen((v) => !v)} title="Generate an image with Super Internet AI" className={`w-9 h-9 rounded-full grid place-items-center ${aiOpen ? "text-fuchsia-200 bg-fuchsia-400/15" : "text-fuchsia-400 hover:bg-fuchsia-400/10"}`}><Sparkles className="w-[20px] h-[20px]" /></button>
                  <button onClick={() => setPollOptions(pollOptions ? null : ["", ""])} title="Add a poll" className={`w-9 h-9 rounded-full grid place-items-center ${pollOptions ? "text-fuchsia-200 bg-fuchsia-400/15" : "text-fuchsia-400 hover:bg-fuchsia-400/10"}`}><BarChart3 className="w-[20px] h-[20px]" /></button>
                  <span className="relative">
                    <button onClick={() => setPickerOpen((v) => !v)} title="Emoji & GIF" className={`w-9 h-9 rounded-full grid place-items-center ${pickerOpen ? "text-fuchsia-200 bg-fuchsia-400/15" : "text-fuchsia-400 hover:bg-fuchsia-400/10"}`}><Smile className="w-[20px] h-[20px]" /></button>
                    {pickerOpen && (
                      <EmojiGifPicker
                        onClose={() => setPickerOpen(false)}
                        onEmoji={(e) => setDraft((d) => d + e)}
                        onGif={(url) => { setPendingMedia({ url, type: "image" }); setPickerOpen(false); }}
                      />
                    )}
                  </span>
                </div>
                <button
                  onClick={post}
                  disabled={!draft.trim() && !pendingMedia && pollReady.length < 2}
                  className="px-5 h-9 rounded-full bg-white text-black font-bold text-[15px] disabled:opacity-40 hover:bg-white/90 transition-colors"
                >
                  Post
                </button>
              </div>
            </div>
            </div>
          </div>

          {!focusMode && (
            <CreatorCard user={user} creator={creator} busy={creatorBusy} onEnable={enableCreator} />
          )}

          {tab === "lists" && (
            <ListsBar lists={lists} activeId={activeList?.id} onSelect={setActiveList} onCreate={createList} />
          )}

          {loading ? (
            <div className="p-10 text-center text-white/45">Loading feed…</div>
          ) : displayPosts.length === 0 ? (
            <div className="p-10 text-center text-white/45">
              {tab === "following" ? "No posts from people you follow yet."
                : tab === "bookmarks" ? "Nothing saved yet — tap the bookmark icon on any post."
                : tab === "lists" ? (lists.length ? "No posts from this list yet." : "Create a list of people to follow their posts.")
                : authorFilter ? "No posts from this user." : "No posts yet. Be the first to share!"}
            </div>
          ) : (
            displayPosts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                compact={compact}
                isOwn={isOwn(p)}
                liked={!!liked[p.id]}
                reposted={!!reposted[p.id]}
                bookmarked={!!bookmarked[p.id]}
                commentsOpen={expandedId === p.id}
                onOpenAuthor={setAuthorFilter}
                onDelete={del}
                onLike={toggleLike}
                onRepost={toggleRepost}
                onBookmark={toggleBookmark}
                onComment={(x) => setExpandedId(expandedId === x.id ? null : x.id)}
                onCommented={load}
                onDm={(h) => { setDmTarget(h); setDmOpen(true); }}
                onCall={startTo}
              />
            ))
          )}

        </div>

        {/* Right rail — only where there is room for it */}
        <aside className="sticky top-3 hidden w-[318px] shrink-0 lg:block">
          <WidgetsRail user={user} />
        </aside>
      </div>

      <QuickComposeBar
        avatar={user?.avatar}
        onClick={() => {
          draftRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          draftRef.current?.focus();
        }}
      />

      {authorFilter && (
        <AccountView
          handle={authorFilter}
          me={user}
          onClose={() => setAuthorFilter(null)}
          onBlock={onBlocked}
          onMessage={(h) => { setAuthorFilter(null); setDmTarget(h); setDmOpen(true); }}
        />
      )}
      {searchOpen && (
        <XSearchPanel
          me={user}
          initialTab={searchTab}
          onClose={() => setSearchOpen(false)}
          onOpenAccount={(h) => setAuthorFilter(h)}
        />
      )}
      {dmOpen && <DmsPanel initialHandle={dmTarget} onClose={() => setDmOpen(false)} />}
      <IncomingCallBanner incoming={call.incoming} onAccept={call.accept} onDecline={call.decline} />
      <CallStage call={call} />
      {cameraOpen && <CameraCapture onClose={() => setCameraOpen(false)} onCapture={(media) => setPendingMedia(media)} />}
      <ProfilePhotoDialog open={photoOpen} user={user} onClose={() => setPhotoOpen(false)} onSaved={applyAvatar} />
    </div>
  );
}