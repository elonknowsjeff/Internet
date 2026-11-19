import React, { useState } from "react";
import { ArrowLeft, Play, ThumbsUp, Share2, PictureInPicture2, Bell, BellRing, Eye, MoreHorizontal, X } from "lucide-react";
import VideoThumb from "@/components/video/VideoThumb";

const fmtViews = (n = 0) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(0)}K` : n);
const ago = (d) => {
  if (!d) return "just now";
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days < 1) return "today";
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  const m = Math.floor(days / 30);
  if (m < 12) return `${m} month${m > 1 ? "s" : ""} ago`;
  return `${Math.floor(m / 12)} year${Math.floor(m / 12) > 1 ? "s" : ""} ago`;
};

// Full-screen YouTube-style watch page: player, channel bar, description, and "Up next".
export default function WatchView({ video, list = [], onClose, onSelect, onLike, liked, onPopOut }) {
  const [subscribed, setSubscribed] = useState(false);
  const [copied, setCopied] = useState(false);
  const upNext = list.filter((v) => v.id !== video.id).slice(0, 12);

  const share = async () => {
    const url = video.file_uri || `https://www.youtube.com/watch?v=${video.youtube_id}`;
    try {
      if (navigator.share) await navigator.share({ title: video.title, url });
      else { await navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] overflow-y-auto">
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1700px] mx-auto flex items-center gap-3 px-3 sm:px-6 py-2.5">
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center"><ArrowLeft className="w-5 h-5" /></button>
          <div className="flex items-center gap-1.5">
            <span className="w-7 h-5 rounded-md bg-red-600 flex items-center justify-center"><Play className="w-3 h-3 fill-white" /></span>
            <span className="font-bold tracking-tight text-sm hidden sm:block">XSI<span className="text-fuchsia-400"> Video</span></span>
          </div>
          <button onClick={onClose} className="ml-auto w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center lg:hidden"><X className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto px-2 sm:px-6 py-3 grid lg:grid-cols-[minmax(0,1fr)_390px] gap-6">
        <div className="min-w-0">
          <div className="aspect-video rounded-xl overflow-hidden bg-black">
            {video.file_uri ? (
              <video src={video.file_uri} poster={video.thumbnail || undefined} controls autoPlay className="w-full h-full" />
            ) : (
              <iframe
                src={`https://www.youtube.com/embed/${video.youtube_id}?autoplay=1`}
                title={video.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>

          <h1 className="mt-3 text-lg sm:text-[20px] font-bold leading-snug">{video.title}</h1>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <div className="flex items-center gap-2.5 mr-1">
              <img src={video.channel_avatar || `https://i.pravatar.cc/80?u=${video.channel_handle || "walza"}`} alt="" className="w-9 h-9 rounded-full object-cover" />
              <div className="leading-tight">
                <p className="text-sm font-semibold">{video.channel_name}</p>
                <p className="text-[11px] text-neutral-500">{(Math.random() * 900 + 100).toFixed(0)}K subscribers</p>
              </div>
              <button
                onClick={() => setSubscribed((s) => !s)}
                className={`ml-2 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold transition-colors ${subscribed ? "bg-white/10 text-white" : "bg-white text-black hover:bg-neutral-200"}`}
              >
                {subscribed ? <><BellRing className="w-3.5 h-3.5" /> Subscribed</> : <><Bell className="w-3.5 h-3.5" /> Subscribe</>}
              </button>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center bg-white/10 rounded-full overflow-hidden">
                <button onClick={() => onLike(video)} className={`flex items-center gap-1.5 px-3 py-2 text-[13px] font-semibold hover:bg-white/10 ${liked ? "text-red-400" : ""}`}>
                  <ThumbsUp className="w-4 h-4" fill={liked ? "currentColor" : "none"} /> {fmtViews(video.likes)}
                </button>
                <span className="w-px h-5 bg-white/15" />
                <button className="px-3 py-2 hover:bg-white/10"><ThumbsUp className="w-4 h-4 rotate-180" /></button>
              </div>
              <button onClick={share} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/10 text-[13px] font-semibold hover:bg-white/15">
                <Share2 className="w-4 h-4" /> {copied ? "Copied" : "Share"}
              </button>
              <button onClick={() => onPopOut(video)} title="Pop out" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center"><PictureInPicture2 className="w-4 h-4" /></button>
              <button className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center"><MoreHorizontal className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="mt-3 rounded-xl bg-white/5 p-3">
            <p className="text-[13px] font-semibold flex items-center gap-2">
              <Eye className="w-3.5 h-3.5" /> {fmtViews(video.views)} views · {ago(video.created_date)}
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-medium">{video.category}</span>
            </p>
            <p className="text-[13px] text-neutral-300 mt-1.5 whitespace-pre-wrap">{video.description || "No description was added for this video."}</p>
          </div>
        </div>

        <aside className="min-w-0">
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-3">
            {["All", "Related", "From this channel"].map((c, i) => (
              <span key={c} className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold ${i === 0 ? "bg-white text-black" : "bg-white/10 text-white/80"}`}>{c}</span>
            ))}
          </div>
          <div className="space-y-2.5">
            {upNext.map((v) => (
              <button key={v.id} onClick={() => onSelect(v)} className="w-full flex gap-2.5 text-left group">
                <div className="relative w-[168px] shrink-0 aspect-video rounded-lg overflow-hidden bg-neutral-900">
                  <VideoThumb video={v} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/85 text-[10px] font-medium">{v.duration}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold leading-snug line-clamp-2 group-hover:text-white">{v.title}</p>
                  <p className="text-[11px] text-neutral-500 mt-1 truncate">{v.channel_name}</p>
                  <p className="text-[11px] text-neutral-500 truncate">{fmtViews(v.views)} views · {ago(v.created_date)}</p>
                </div>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}