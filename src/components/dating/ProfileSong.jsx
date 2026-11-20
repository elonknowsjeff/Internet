import React, { useRef, useState } from "react";
import { Play, Pause, Music2 } from "lucide-react";

export default function ProfileSong({ url, title, artist }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  if (!url) return null;

  const toggle = (e) => {
    e?.stopPropagation();
    const a = ref.current;
    if (!a) return;
    if (a.paused) {
      a.play().catch(() => {});
      setPlaying(true);
    } else {
      a.pause();
      setPlaying(false);
    }
  };

  return (
    <button
      onClick={toggle}
      className="flex w-full items-center gap-2.5 rounded-2xl border border-white/10 bg-black/35 neon-edge-soft px-3 py-2 text-left"
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full neon-btn">
        {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 translate-x-px" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-semibold">{title || "Profile song"}</p>
        <p className="truncate text-[9.5px] text-white/45">{artist || "Tap to play"}</p>
      </div>
      <Music2 className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--brand)" }} />
      <audio ref={ref} src={url} onEnded={() => setPlaying(false)} preload="none" />
    </button>
  );
}