import React, { useState } from "react";
import { useVideoPlayer } from "@/components/VideoPlayerProvider";
import { X, Minimize2, Maximize2 } from "lucide-react";

// Floating, suspendable picture-in-picture style video that persists across navigation.
export default function FloatingVideo() {
  const { current, minimized, close, minimize, restore } = useVideoPlayer();
  const [expanded, setExpanded] = useState(false);

  if (!current) return null;

  const start = current.start || 0;
  const src = `https://www.youtube.com/embed/${current.youtube_id}?autoplay=1&start=${start}&enablejsapi=1`;

  const Player = ({ className = "" }) =>
    current.file_uri ? (
      <video src={current.file_uri} controls autoPlay className={className} />
    ) : (
      <iframe src={src} title={current.title} className={className} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
    );

  if (expanded) {
    return (
      <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" onClick={() => setExpanded(false)}>
        <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
          <div className="aspect-video rounded-xl overflow-hidden bg-black">
            <Player className="w-full h-full" />
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="min-w-0">
              <h2 className="font-bold truncate">{current.title}</h2>
              <p className="text-xs text-neutral-400 truncate">{current.channel_name}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setExpanded(false)} className="px-3 py-1.5 rounded-full border border-white/10 text-sm hover:bg-white/10 flex items-center gap-1"><Minimize2 className="w-4 h-4" /> Float</button>
              <button onClick={close} className="px-3 py-1.5 rounded-full bg-rose-500 text-black text-sm font-semibold">Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (minimized) {
    return (
      <div className="fixed bottom-20 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-black/80 backdrop-blur-xl border border-white/15 shadow-xl max-w-[80vw]">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        <p className="text-xs font-medium truncate max-w-[40vw]">{current.title}</p>
        <button onClick={restore} className="text-neutral-300 hover:text-white" title="Restore"><Maximize2 className="w-4 h-4" /></button>
        <button onClick={close} className="text-neutral-400 hover:text-rose-400" title="Close"><X className="w-4 h-4" /></button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 w-72 sm:w-80 rounded-xl overflow-hidden bg-black/80 backdrop-blur-xl border border-white/15 shadow-2xl animate-slide-up">
      <div className="flex items-center gap-1 px-2 py-1.5 bg-black/60 border-b border-white/10">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
        <p className="text-xs font-medium truncate flex-1">{current.title}</p>
        <button onClick={() => setExpanded(true)} title="Expand" className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center"><Maximize2 className="w-3.5 h-3.5" /></button>
        <button onClick={minimize} title="Minimize" className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center"><Minimize2 className="w-3.5 h-3.5" /></button>
        <button onClick={close} title="Close" className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-rose-400"><X className="w-3.5 h-3.5" /></button>
      </div>
      <div className="aspect-video bg-black">
        <Player className="w-full h-full" />
      </div>
    </div>
  );
}