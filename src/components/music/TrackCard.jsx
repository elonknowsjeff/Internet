import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Play, Pause, Heart, Repeat2, MessageCircle, Share2, Video, Clock, TrendingUp } from "lucide-react";
import TrackComments from "@/components/music/TrackComments";

const fmt = (s) => `${Math.floor((s || 0) / 60)}:${String(Math.floor((s || 0) % 60)).padStart(2, "0")}`;
const fmtK = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n;

export default function TrackCard({ track, user, isCurrent, isPlaying, onPlay, onRefresh, rankFirst }) {
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loadingVid, setLoadingVid] = useState(false);
  const [toast, setToast] = useState("");

  const isVideo = track.media_type === "video" && track.file_uri;
  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 1600); };

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    await base44.entities.Track.update(track.id, { likes: (track.likes || 0) + 1 });
    onRefresh?.();
  };

  const handleRepost = async () => {
    if (reposted) return;
    setReposted(true);
    await base44.entities.Track.update(track.id, { reposts: (track.reposts || 0) + 1 });
    try {
      const name = user?.display_name || user?.full_name || "You";
      const handle = user?.username || (user ? user.email?.split("@")[0] || "you" : "you");
      await base44.entities.Post.create({
        content: `🎵 ${track.title} by ${track.artist_name} — now on Walza Plus Music`,
        author_name: name,
        author_handle: handle,
        author_avatar: user?.avatar || "",
        category: "general",
      });
      flash("Reposted to the Feed");
    } catch (e) { flash("Reposted"); }
    onRefresh?.();
  };

  const watchVideo = async () => {
    if (videoUrl) return;
    setLoadingVid(true);
    try {
      const r = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: track.file_uri });
      setVideoUrl(r.signed_url);
    } catch (e) {}
    setLoadingVid(false);
  };

  const share = () => {
    const url = `${window.location.origin}/music`;
    if (navigator.share) navigator.share({ title: `Walza Plus — ${track.title}`, url }).catch(() => {});
    else { navigator.clipboard?.writeText(url); flash("Link copied"); }
  };

  return (
    <div className="flex gap-4 items-start group">
      <div className="relative shrink-0">
        <img src={track.artwork} alt={track.title} className="w-16 h-16 rounded-lg object-cover" />
        {!isVideo && (
          <button onClick={onPlay} className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
            {isCurrent && isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
          </button>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {rankFirst && <TrendingUp className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
          <p className="font-semibold truncate">{track.title}</p>
          {isVideo && <span className="text-[10px] px-1.5 py-0.5 rounded bg-fuchsia-500 text-black font-bold flex items-center gap-1"><Video className="w-2.5 h-2.5" />VIDEO</span>}
        </div>
        <p className="text-sm text-neutral-400 truncate">{track.artist_name} · <span className="text-neutral-600">@{track.artist_handle}</span></p>

        {isVideo && (
          <div className="mt-2">
            {videoUrl ? (
              <video src={videoUrl} controls autoPlay className="w-full max-w-md rounded-lg border border-neutral-800" />
            ) : (
              <button onClick={watchVideo} disabled={loadingVid} className="px-3 py-1.5 rounded-full bg-fuchsia-500 text-black text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50">
                <Video className="w-3.5 h-3.5" /> {loadingVid ? "Loading…" : "Watch"}
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
          {!isVideo && <button onClick={onPlay} className="flex items-center gap-1 hover:text-orange-400"><Play className="w-3 h-3" /> {fmtK(track.plays || 0)}</button>}
          <button onClick={handleLike} className={`flex items-center gap-1 ${liked ? "text-rose-500" : "hover:text-rose-500"}`}><Heart className={`w-3.5 h-3.5 ${liked ? "fill-rose-500" : ""}`} /> {fmtK(track.likes || 0)}</button>
          <button onClick={handleRepost} className={`flex items-center gap-1 ${reposted ? "text-fuchsia-400" : "hover:text-fuchsia-400"}`}><Repeat2 className="w-3.5 h-3.5" /> {fmtK(track.reposts || 0)}</button>
          <button onClick={() => setCommentsOpen((v) => !v)} className={`flex items-center gap-1 ${commentsOpen ? "text-violet-400" : "hover:text-violet-400"}`}><MessageCircle className="w-3.5 h-3.5" /> {track.comments || 0}</button>
          <button onClick={share} className="hover:text-orange-400"><Share2 className="w-3.5 h-3.5" /></button>
          {!isVideo && <span className="flex items-center gap-1 ml-auto"><Clock className="w-3 h-3" /> {fmt(track.duration || 0)}</span>}
        </div>

        {commentsOpen && (
          <div className="mt-2 pt-2 border-t border-white/10 animate-slide-up">
            <TrackComments track={track} onCommented={onRefresh} />
          </div>
        )}
      </div>
      {toast && <span className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-orange-500 text-black text-xs font-semibold shadow-lg">{toast}</span>}
    </div>
  );
}