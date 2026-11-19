import React from "react";
import { BarChart3, Clock, Eye, Heart, Radio, TrendingUp, Upload, Youtube } from "lucide-react";
import VideoThumb from "@/components/video/VideoThumb";

const fmt = (n = 0) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : n);

export default function CreatorStudioSection({ videos, myHandle, onUpload, onGoLive, onOpen }) {
  const mine = myHandle ? videos.filter((v) => v.channel_handle === myHandle) : [];
  const views = mine.reduce((s, v) => s + (v.views || 0), 0);
  const likes = mine.reduce((s, v) => s + (v.likes || 0), 0);
  const shorts = mine.filter((v) => v.is_short).length;
  const top = [...mine].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  const stats = [
    { label: "Videos", value: mine.length, icon: Youtube },
    { label: "Views", value: fmt(views), icon: Eye },
    { label: "Likes", value: fmt(likes), icon: Heart },
    { label: "Shorts", value: shorts, icon: Clock },
  ];

  return (
    <div className="pb-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="flex items-center gap-2 text-[17px] font-bold tracking-tight"><BarChart3 className="h-4 w-4 text-[#ff0000]" /> Creator studio</h2>
        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-white/60">CHANNEL</span>
        <div className="ml-auto flex gap-2">
          <button onClick={onGoLive} className="flex items-center gap-1.5 rounded-full bg-white/[0.08] px-3 py-1.5 text-[12.5px] font-semibold hover:bg-white/[0.16]"><Radio className="h-3.5 w-3.5 text-red-500" /> Go live</button>
          <button onClick={onUpload} className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12.5px] font-bold text-black hover:bg-white/90"><Upload className="h-3.5 w-3.5" /> Upload</button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-white/[0.08] bg-[#181818] p-3">
            <s.icon className="h-4 w-4 text-white/40" />
            <p className="mt-1.5 text-[19px] font-bold leading-none tabular-nums">{s.value}</p>
            <p className="mt-1 text-[11px] text-white/45">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-white/[0.08] bg-[#181818]">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-3.5 py-2.5">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold"><TrendingUp className="h-3.5 w-3.5 text-[#3ea6ff]" /> Your top videos</p>
          <span className="text-[11px] text-white/35">by views</span>
        </div>
        {top.length === 0 ? (
          <div className="px-3.5 py-8 text-center">
            <p className="text-[13px] font-semibold">{myHandle ? "No uploads yet" : "Sign in to see your channel"}</p>
            <p className="mx-auto mt-1 max-w-sm text-[12px] text-white/40">Publish your first video or short and your studio fills with views, likes and watch data.</p>
            <button onClick={onUpload} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[12px] font-bold text-black"><Upload className="h-3.5 w-3.5" /> Upload a video</button>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {top.map((v, i) => (
              <button key={v.id} onClick={() => onOpen(v)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-white/[0.04]">
                <span className="w-4 shrink-0 text-[11px] tabular-nums text-white/30">{i + 1}</span>
                <span className="h-11 w-20 shrink-0 overflow-hidden rounded-md bg-black">
                  <VideoThumb video={v} className="h-full w-full object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold">{v.title}</span>
                  <span className="block text-[11px] text-white/40">{fmt(v.views)} views · {fmt(v.likes)} likes</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}