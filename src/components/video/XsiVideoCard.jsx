import React from "react";
import { Play } from "lucide-react";
import VideoThumb from "@/components/video/VideoThumb";

const fmtViews = (n = 0) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(0)}K` : n);
const ago = (date) => {
  if (!date) return "";
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months < 12 ? `${months} mo ago` : `${Math.floor(months / 12)} yr ago`;
};

export default function XsiVideoCard({ video, onOpen }) {
  return (
    <button onClick={() => onOpen(video)} className="group block w-full text-left">
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_24px_50px_-34px_rgba(0,0,0,0.95)]">
        <VideoThumb video={video} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-70" />
        <span className="absolute inset-0 grid place-items-center bg-black/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-black shadow-xl">
            <Play className="h-5 w-5 fill-black" />
          </span>
        </span>
        {video.duration && (
          <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur">
            {video.duration}
          </span>
        )}
      </div>

      <div className="mt-2.5 flex gap-2.5">
        <img
          src={video.channel_avatar || `https://i.pravatar.cc/64?u=${video.channel_handle || video.channel_name}`}
          alt=""
          className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-white/15"
        />
        <div className="min-w-0">
          <p className="line-clamp-2 text-[13px] font-semibold leading-snug tracking-[-0.01em] text-white/95">{video.title}</p>
          <p className="mt-1 truncate text-[11.5px] text-white/45">{video.channel_name}</p>
          <p className="text-[11px] text-white/35">{fmtViews(video.views)} views · {ago(video.created_date)}</p>
        </div>
      </div>
    </button>
  );
}