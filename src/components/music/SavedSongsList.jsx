import React from "react";
import { Play, Download, Trash2 } from "lucide-react";

export default function SavedSongsList({ songs, onPlay, onDownload, onRemove }) {
  if (!songs.length) return <p className="text-sm text-white/40">Nothing saved yet — generate a track and hit save.</p>;
  return (
    <div className="space-y-1">
      {songs.map((s) => (
        <div key={s.id} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5">
          <button onClick={() => onPlay(s)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
            <span className="w-9 h-9 rounded-md overflow-hidden bg-gradient-to-br from-fuchsia-500 to-violet-700 flex items-center justify-center shrink-0">
              {s.cover ? <img src={s.cover} alt="" className="w-full h-full object-cover" /> : <Play className="w-3.5 h-3.5" />}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium truncate">{s.title}</span>
              <span className="block text-[11px] text-white/45 truncate">{s.genre} · {s.bpm} BPM · {s.bars || 8} bars</span>
            </span>
          </button>
          <button onClick={() => onDownload(s)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center" title="Download"><Download className="w-4 h-4 text-white/60" /></button>
          <button onClick={() => onRemove(s.id)} className="w-8 h-8 rounded-full hover:bg-rose-500/20 flex items-center justify-center" title="Delete"><Trash2 className="w-4 h-4 text-white/60" /></button>
        </div>
      ))}
    </div>
  );
}