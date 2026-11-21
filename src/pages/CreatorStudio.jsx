import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { BarChart3, Heart, MessageCircle, Users, Video, Music2, Sparkles, PenLine, ArrowUpRight, ImagePlus, StickyNote, Trash2, Eye, Upload } from "lucide-react";
import VideoThumb from "@/components/video/VideoThumb";

export default function CreatorStudio() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [videos, setVideos] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [followers, setFollowers] = useState(0);

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me().catch(() => null);
      setUser(me);
      const [p, v, t] = await Promise.all([
        base44.entities.Post.list("-created_date", 200).catch(() => []),
        base44.entities.Video.list("-created_date", 200).catch(() => []),
        base44.entities.Track.list("-created_date", 200).catch(() => []),
      ]);
      setPosts(p); setVideos(v); setTracks(t);
      if (me) {
        const f = await base44.entities.Follow.filter({ following_id: me.id }).catch(() => []);
        setFollowers(f.length);
      }
    })();
  }, []);

  const myHandle = user?.username || (user?.email ? user.email.split("@")[0] : "you");
  const myPosts = posts.filter((p) => p.author_handle === myHandle);
  const myVideos = videos.filter((v) => v.channel_handle === myHandle);
  const videoViews = myVideos.reduce((s, v) => s + (v.views || 0), 0);
  const myLikes = myPosts.reduce((s, p) => s + (p.likes || 0), 0);
  const myComments = myPosts.reduce((s, p) => s + (p.comments || 0), 0);
  const myPlays = tracks.reduce((s, t) => s + (t.plays || 0), 0);
  const top = [...myPosts].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5);
  const maxLikes = Math.max(1, ...top.map((p) => p.likes || 0));

  const stats = [
    { label: "Posts", value: myPosts.length, icon: PenLine, color: "text-amber-300" },
    { label: "Likes", value: myLikes, icon: Heart, color: "text-rose-400" },
    { label: "Comments", value: myComments, icon: MessageCircle, color: "text-cyan-300" },
    { label: "Followers", value: followers, icon: Users, color: "text-emerald-300" },
    { label: "Videos", value: myVideos.length, icon: Video, color: "text-red-400" },
    { label: "Video views", value: videoViews, icon: Eye, color: "text-cyan-300" },
    { label: "Track plays", value: myPlays, icon: Music2, color: "text-fuchsia-300" },
  ];

  const actions = [
    { to: "/", label: "Write a post", icon: PenLine },
    { to: "/video", label: "Upload a video", icon: Video },
    { to: "/music", label: "Upload a track", icon: Music2 },
    { to: "/notes", label: "Open notes", icon: StickyNote },
  ];

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-28 sm:pb-8">
      <header className="py-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black font-display flex items-center gap-2"><BarChart3 className="w-6 h-6 text-fuchsia-400" /> Creator Studio</h1>
          <p className="text-sm text-neutral-400">@{myHandle} · your reach across Super Internet</p>
        </div>
        <Link to="/" className="text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/15 hover:bg-white/15">Back to feed</Link>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-4">
            <s.icon className={`w-5 h-5 ${s.color}`} />
            <p className="text-2xl font-black tabular-nums mt-1.5">{s.value.toLocaleString()}</p>
            <p className="text-xs text-neutral-400">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="glass-card p-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold flex items-center gap-2"><Video className="w-4 h-4 text-fuchsia-400" /> Your videos</h2>
          <Link to="/video" className="text-xs px-3 py-1.5 rounded-full brand-grad text-black font-bold flex items-center gap-1.5"><Upload className="w-3.5 h-3.5" /> Upload</Link>
        </div>
        {myVideos.length === 0 ? (
          <p className="text-sm text-neutral-500">Nothing uploaded yet. Publish your first video and it shows up here with its views.</p>
        ) : (
          <div className="space-y-2">
            {myVideos.map((v) => (
              <div key={v.id} className="flex items-center gap-2.5 group">
                <div className="w-20 aspect-video rounded-lg overflow-hidden bg-black shrink-0">
                  <VideoThumb video={v} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate">{v.title}</p>
                  <p className="text-[11px] text-neutral-500 truncate">{v.views || 0} views · {v.likes || 0} likes</p>
                </div>
                <button
                  onClick={async () => { await base44.entities.Video.delete(v.id).catch(() => {}); setVideos((prev) => prev.filter((x) => x.id !== v.id)); }}
                  title="Delete video"
                  className="w-8 h-8 rounded-full grid place-items-center text-neutral-500 hover:text-rose-400 hover:bg-rose-400/10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="glass-card p-4 mt-4">
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2"><Heart className="w-4 h-4 text-rose-400" /> Best performing posts</h2>
        {top.length === 0 ? (
          <p className="text-sm text-neutral-500">Post something and your top content shows up here.</p>
        ) : (
          <div className="space-y-2.5">
            {top.map((p) => (
              <div key={p.id}>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <p className="truncate text-neutral-200 flex-1">{p.content || "(media post)"}</p>
                  <span className="text-neutral-400 tabular-nums">{p.likes || 0} ♥</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 mt-1 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-fuchsia-400" style={{ width: `${((p.likes || 0) / maxLikes) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-4">
        <h2 className="text-sm font-bold mb-2 text-neutral-300">Quick actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {actions.map((a) => (
            <Link key={a.to + a.label} to={a.to} className="glass-card p-3 flex items-center gap-2 text-sm hover:bg-white/15 transition-colors">
              <a.icon className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="flex-1 truncate">{a.label}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}