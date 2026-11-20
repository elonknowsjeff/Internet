import React from "react";
import { Link } from "react-router-dom";
import { useAudio } from "@/components/AudioProvider";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X, Music2 } from "lucide-react";

const fmt = (s) => {
  const v = Math.max(0, Math.floor(s || 0));
  return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, "0")}`;
};

export default function PlayerBar() {
  const audio = useAudio();
  if (!audio || !audio.current) return null;

  const { current, playing, toggle, progress, duration, volume, seek, setVolume, stop } = audio;
  const total = duration || current.duration || 0;
  const canPrev = progress > 3 || !!current.onPrev;
  const canNext = !!current.onNext;

  return (
    <div className="fixed z-40 right-3 bottom-[calc(92px+env(safe-area-inset-bottom))] w-[min(340px,calc(100vw-24px))] rounded-2xl border border-white/10 bg-[#0b0716]/92 backdrop-blur-2xl shadow-[0_18px_50px_-20px_rgba(0,0,0,0.95)] animate-slide-up overflow-hidden">
      <div className="flex items-center gap-2.5 px-2.5 py-2">
        <Link to="/music" title="Open Valo Music" className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="w-9 h-9 rounded-md overflow-hidden bg-white/10 shrink-0 grid place-items-center">
            {current.art ? <img src={current.art} alt="" className="w-full h-full object-cover" /> : <Music2 className="w-3.5 h-3.5 text-white/40" />}
          </span>
          <span className="min-w-0">
            <span className="block text-[12px] font-semibold truncate leading-tight">{current.title}</span>
            <span className="block text-[10px] text-white/45 truncate leading-tight mt-0.5">{current.subtitle || "Valo Music"}</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => (progress > 3 || !current.onPrev ? seek(0) : current.onPrev())}
            disabled={!canPrev}
            title="Previous"
            className="text-white/65 hover:text-white disabled:opacity-25 transition-colors"
          >
            <SkipBack className="w-3.5 h-3.5 fill-current" />
          </button>
          <button
            onClick={toggle}
            title={playing ? "Pause" : "Play"}
            className="w-8 h-8 rounded-full brand-grad text-black grid place-items-center hover:scale-105 active:scale-95 transition"
          >
            {playing ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>
          <button
            onClick={() => current.onNext?.()}
            disabled={!canNext}
            title="Next"
            className="text-white/65 hover:text-white disabled:opacity-25 transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5 fill-current" />
          </button>
          <button onClick={() => setVolume(volume > 0 ? 0 : 0.9)} title={volume > 0 ? "Mute" : "Unmute"} className="text-white/55 hover:text-white ml-0.5">
            {volume > 0 ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <button onClick={stop} title="Close player" className="w-6 h-6 rounded-full text-white/45 hover:text-white hover:bg-white/10 grid place-items-center">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="px-2.5 pb-1.5 flex items-center gap-2">
        <span className="text-[9px] tabular-nums text-white/35 w-7 text-right">{fmt(progress)}</span>
        <input
          type="range"
          min={0}
          max={Math.max(total, 1)}
          step={0.5}
          value={Math.min(progress, total || 0)}
          onChange={(e) => seek(Number(e.target.value))}
          disabled={!total}
          aria-label="Seek"
          className="flex-1 h-1 cursor-pointer disabled:cursor-default"
          style={{ accentColor: "var(--brand)" }}
        />
        <span className="text-[9px] tabular-nums text-white/35 w-7">{fmt(total)}</span>
      </div>
    </div>
  );
}