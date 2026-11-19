import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Play, Pause, Download, Loader2, Music4, ImagePlus, Save, Check } from "lucide-react";

export default function AiSongCard({ song, playing, onPlay, onSave, onDownload, rendering, saved, onCover }) {
  const [coverBusy, setCoverBusy] = useState(false);

  const makeCover = async () => {
    if (coverBusy) return;
    setCoverBusy(true);
    try {
      const res = await base44.integrations.Core.GenerateImage({
        prompt: `Square album cover artwork for a ${song.genre} song titled "${song.title}". Mood: ${song.mood || "moody"}, energy ${song.energy || 6}/10. Bold abstract shapes, deep violet and magenta gradient lighting, cinematic grain, no text, no lettering, high detail.`,
      });
      if (res?.url) onCover?.(res.url);
    } catch {}
    setCoverBusy(false);
  };

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className="flex items-start gap-3">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gradient-to-br from-fuchsia-500 to-violet-700 flex items-center justify-center shrink-0">
          {song.cover ? <img src={song.cover} alt="" className="w-full h-full object-cover" /> : <Music4 className="w-7 h-7" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold truncate">{song.title}</p>
          <p className="text-xs text-white/50 truncate">
            {song.genre} · {song.bpm} BPM · {song.bars || 8} bars{song.key ? ` · ${song.key}` : ""}
          </p>
          <p className="text-[11px] text-white/35 truncate">{song.progression.join(" – ")}</p>
        </div>
        <button onClick={onPlay} className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shrink-0" title={playing ? "Stop" : "Play"}>
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      </div>

      {(song.hook || song.verse || song.bridge) && (
        <div className="mt-3 grid sm:grid-cols-2 gap-3 text-xs text-white/70 leading-relaxed">
          {song.hook && <p className="whitespace-pre-wrap"><span className="block text-[10px] uppercase tracking-widest text-fuchsia-300 mb-1">Hook</span>{song.hook}</p>}
          {song.verse && <p className="whitespace-pre-wrap"><span className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Verse</span>{song.verse}</p>}
          {song.bridge && <p className="whitespace-pre-wrap sm:col-span-2"><span className="block text-[10px] uppercase tracking-widest text-cyan-300 mb-1">Bridge</span>{song.bridge}</p>}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-3">
        <button onClick={onSave} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold hover:bg-white/20">
          {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />} {saved ? "Saved" : "Save"}
        </button>
        <button onClick={onDownload} disabled={rendering} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold hover:bg-white/20 disabled:opacity-50">
          {rendering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />} Download WAV
        </button>
        <button onClick={makeCover} disabled={coverBusy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold hover:bg-white/20 disabled:opacity-50">
          {coverBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />} {song.cover ? "New cover art" : "Cover art"}
        </button>
      </div>
    </div>
  );
}