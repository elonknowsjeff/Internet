import React, { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Music2, Volume2, VolumeX } from "lucide-react";

const DUR = 6;

function ImageBar({ active, done }) {
  const [w, setW] = useState(done ? 100 : 0);
  useEffect(() => {
    if (!active) { setW(done ? 100 : 0); return; }
    setW(0);
    const r = requestAnimationFrame(() => setW(100));
    return () => cancelAnimationFrame(r);
  }, [active, done]);
  return <div className="h-full bg-white" style={{ width: `${w}%`, transition: active ? `width ${DUR}s linear` : "none" }} />;
}

export default function StoryViewer({ items, startIdx = 0, onClose }) {
  const [idx, setIdx] = useState(startIdx);
  const [muted, setMuted] = useState(false);
  const [vidProg, setVidProg] = useState(0);
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const item = items[Math.min(idx, items.length - 1)];
  const isVideo = !!item?.video;

  const advance = () => (idx + 1 >= items.length ? onClose() : setIdx((i) => i + 1));

  // Image stories auto-advance on a timer
  useEffect(() => {
    if (isVideo) return;
    const t = setTimeout(() => {
      if (idx + 1 >= items.length) onClose();
      else setIdx((i) => i + 1);
    }, DUR * 1000);
    return () => clearTimeout(t);
  }, [idx, items.length, onClose, isVideo]);

  // Background music (image stories only — video stories play their own audio)
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (!isVideo && item?.music_url) {
      a.src = item.music_url;
      a.volume = 0.7;
      a.muted = muted;
      a.play().catch(() => {});
    } else {
      a.pause();
      a.removeAttribute("src");
    }
  }, [item, muted, isVideo]);

  // Video stories: drive progress from the element and advance on end
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isVideo) return;
    setVidProg(0);
    const onTime = () => { if (v.duration) setVidProg((v.currentTime / v.duration) * 100); };
    const onEnded = () => advance();
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("ended", onEnded);
    v.muted = false;
    v.play().catch(() => {});
    return () => { v.removeEventListener("timeupdate", onTime); v.removeEventListener("ended", onEnded); };
  }, [item, isVideo]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx((i) => Math.min(items.length - 1, i + 1));
      if (e.key === "ArrowLeft") setIdx((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items.length, onClose]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-[#160f2e]/95 backdrop-blur-md flex flex-col">
      <audio ref={audioRef} loop />

      <div className="flex gap-1 p-3">
        {items.map((_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full bg-white/25 overflow-hidden">
            {isVideo && i === idx ? (
              <div className="h-full bg-white" style={{ width: `${vidProg}%` }} />
            ) : (
              <ImageBar active={i === idx} done={i < idx} />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 px-4 pb-2">
        <div className="w-9 h-9 rounded-full bg-fuchsia-500 overflow-hidden flex items-center justify-center shrink-0">
          {item.avatar ? <img src={item.avatar} alt="" className="w-full h-full object-cover" /> : <span className="font-bold text-black">{(item.name || "U")[0]?.toUpperCase()}</span>}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm leading-tight truncate">{item.name}</p>
          <p className="text-[11px] text-white/60">@{item.handle}</p>
        </div>
        {!isVideo && item.music_url && (
          <button onClick={() => setMuted((m) => !m)} className="ml-2 flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 border border-white/20 text-[11px]">
            <Music2 className="w-3 h-3" /> {muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          </button>
        )}
        <button onClick={onClose} title="Close" className="ml-auto w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><X className="w-5 h-5" /></button>
      </div>

      <div className="flex-1 flex items-center justify-center px-3 pb-4 relative overflow-hidden">
        <button onClick={() => setIdx((i) => Math.max(0, i - 1))} className="absolute left-1 sm:left-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><ChevronLeft className="w-5 h-5" /></button>

        <div onClick={advance} className="w-full max-w-sm h-full max-h-[74vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-[#3a2c66] to-[#221a3f] border border-white/20 shadow-2xl cursor-pointer">
          {isVideo ? (
            <video ref={videoRef} src={item.video} autoPlay playsInline controls className="w-full max-h-[74vh] object-cover rounded-3xl" />
          ) : item.image ? (
            <div className="relative">
              <img src={item.image} alt="" className="w-full max-h-[52vh] object-cover" />
              {item.music_url && <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-[11px] flex items-center gap-1"><Music2 className="w-3 h-3" /> {item.music_title}</div>}
            </div>
          ) : (
            <div className="min-h-[36vh] flex items-center justify-center p-6 text-center text-lg">{item.text}</div>
          )}
          {item.image && item.text && <p className="p-4 text-[15px] leading-relaxed whitespace-pre-wrap">{item.text}</p>}
          {!isVideo && item.music_url && item.image && <p className="px-4 pb-3 text-[11px] text-white/60">{item.music_artist} · {item.music_title}</p>}
          <p className="px-4 pb-4 text-[10px] text-white/40">Story {idx + 1} of {items.length}</p>
        </div>

        <button onClick={() => setIdx((i) => Math.min(items.length - 1, i + 1))} className="absolute right-1 sm:right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><ChevronRight className="w-5 h-5" /></button>
      </div>
    </div>
  );
}