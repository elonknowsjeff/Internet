import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Pause, Play } from "lucide-react";

const BARS = [8, 14, 20, 11, 17, 24, 13, 9, 18, 22, 12, 16, 21, 10, 15, 23, 13, 19, 11, 17, 22, 14, 9, 16];

const clock = (s) => {
  const v = Math.max(0, Math.round(s || 0));
  return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, "0")}`;
};

export default function VoiceNote({ uri, duration = 0, mine }) {
  const [url, setUrl] = useState("");
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [total, setTotal] = useState(duration || 0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!uri) return undefined;
    if (/^https?:\/\//i.test(uri) || uri.startsWith("data:")) { setUrl(uri); return undefined; }
    let live = true;
    base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 3600 })
      .then((r) => { if (live) setUrl(r?.signed_url || ""); })
      .catch(() => {});
    return () => { live = false; };
  }, [uri]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); return; }
    a.play().catch(() => {});
  };

  const progress = total ? Math.min(100, (elapsed / total) * 100) : 0;

  return (
    <div className={`flex items-center gap-2.5 min-w-[190px] ${mine ? "text-white" : "text-white/90"}`}>
      <button
        onClick={toggle}
        disabled={!url}
        className={`w-9 h-9 rounded-full grid place-items-center shrink-0 disabled:opacity-50 ${mine ? "bg-white/20 hover:bg-white/30" : "bg-white text-black hover:bg-white/90"}`}
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>
      <div className="flex items-center gap-[2px] h-7 flex-1">
        {BARS.map((h, i) => (
          <span
            key={i}
            style={{ height: `${h}px` }}
            className={`w-[3px] rounded-full transition-colors ${(i / BARS.length) * 100 <= progress ? (mine ? "bg-white" : "bg-white") : mine ? "bg-white/35" : "bg-white/25"}`}
          />
        ))}
      </div>
      <span className="text-[11px] tabular-nums opacity-70 shrink-0">{clock(elapsed || total)}</span>
      {url && (
        <audio
          ref={audioRef}
          src={url}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => { setPlaying(false); setElapsed(0); }}
          onTimeUpdate={(e) => setElapsed(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => { if (!duration && isFinite(e.currentTarget.duration)) setTotal(e.currentTarget.duration); }}
          className="hidden"
        />
      )}
    </div>
  );
}