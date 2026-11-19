import React from "react";
import { Play } from "lucide-react";
import VideoThumb from "@/components/video/VideoThumb";

const fmt = (n = 0) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(0)}K` : n);
const ago = (d) => {
  if (!d) return "just now";
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};

export default function VideoCard({ video, onOpen }) {
  return (
    <button onClick={() => onOpen(video)} className="text-left group min-w-0">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-black ring-1 ring-white/[0.08]">
        <VideoThumb video={video} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
        <span className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="w-11 h-11 rounded-full bg-red-600/95 grid place-items-center"><Play className="w-5 h-5 fill-white" /></span>
        </span>
        {video.duration ? (
          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/85 text-[10px] font-medium">{video.duration}</span>
        ) : null}
      </div>
      <div className="mt-2.5 flex gap-3">
        <img
          src={video.channel_avatar || `https://i.pravatar.cc/72?u=${video.channel_handle || video.id}`}
          alt=""
          className="h-9 w-9 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 pr-4">
          <p className="line-clamp-2 text-[14.5px] font-semibold leading-snug text-white">{video.title}</p>
          <p className="mt-1 truncate text-[12.5px] text-white/55">{video.channel_name}</p>
          <p className="truncate text-[12.5px] text-white/45">{fmt(video.views)} views · {ago(video.created_date)}</p>
        </div>
      </div>
    </button>
  );
}