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
    <div className="fixed z-40 bottom-[calc(78px+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 lg:left-[calc(50%+44px)] w-[min(1160px,calc(100vw-160px))] rounded-2xl border border-white/10 bg-[#0b0716]/92 backdrop-blur-2xl shadow-[0_18px_50px_-20px_rgba(0,0,0,0.95)] animate-slide-up">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <Link to="/music" title="Open XSI Music" className="flex items-center gap-2.5 min-w-0 w-[26%] shrink-0">
          <span className="w-11 h-11 rounded-lg overflow-hidden bg-white/10 shrink-0 grid place-items-center">
            {current.art ? <img src={current.art} alt="" className="w-full h-full object-cover" /> : <Music2 className="w-4 h-4 text-white/40" />}
          </span>
          <span className="min-w-0 hidden sm:block">
            <span className="block text-[13px] font-semibold truncate leading-tight">{current.title}</span>
            <span className="block text-[11px] text-white/45 truncate leading-tight mt-0.5">{current.subtitle || "XSI Music"}</span>
          </span>
        </Link>

        <div className="flex-1 min-w-0 flex flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (progress > 3 || !current.onPrev ? seek(0) : current.onPrev())}
              disabled={!canPrev}
              title="Previous"
              className="text-white/65 hover:text-white disabled:opacity-25 transition-colors"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={toggle}
              title={playing ? "Pause" : "Play"}
              className="w-9 h-9 rounded-full bg-white text-black grid place-items-center hover:scale-105 active:scale-95 transition"
            >
              {playing ? <Pause className="w-[17px] h-[17px] fill-current" /> : <Play className="w-[17px] h-[17px] fill-current ml-0.5" />}
            </button>
            <button
              onClick={() => current.onNext?.()}
              disabled={!canNext}
              title="Next"
              className="text-white/65 hover:text-white disabled:opacity-25 transition-colors"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>
          <div className="w-full flex items-center gap-2">
            <span className="text-[10px] tabular-nums text-white/35 w-7 text-right">{fmt(progress)}</span>
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
            <span className="text-[10px] tabular-nums text-white/35 w-7">{fmt(total)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden xl:block text-[9px] uppercase tracking-[0.18em] text-white/25">XSI Music</span>
          <div className="hidden md:flex items-center gap-1.5">
            <button onClick={() => setVolume(volume > 0 ? 0 : 0.9)} title={volume > 0 ? "Mute" : "Unmute"} className="text-white/55 hover:text-white">
              {volume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volume"
              className="w-20 h-1 cursor-pointer"
              style={{ accentColor: "var(--brand)" }}
            />
          </div>
          <button onClick={stop} title="Close player" className="w-7 h-7 rounded-full text-white/45 hover:text-white hover:bg-white/10 grid place-items-center">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}