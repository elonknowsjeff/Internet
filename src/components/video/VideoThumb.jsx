import React from "react";
import { Play } from "lucide-react";

// Thumbnail for both linked (YouTube) and uploaded video files.
export default function VideoThumb({ video, className = "" }) {
  const yt = video?.youtube_id ? `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg` : "";
  const src = video?.thumbnail || yt;

  if (src) {
    return <img src={src} alt={video?.title || ""} loading="lazy" className={className} />;
  }

  if (video?.file_uri) {
    return <video src={video.file_uri} muted playsInline preload="metadata" className={className} />;
  }

  return (
    <div className={`flex items-center justify-center bg-white/[0.06] ${className}`}>
      <Play className="w-7 h-7 text-white/25" />
    </div>
  );
}