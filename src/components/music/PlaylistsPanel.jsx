import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Play, Pause, Trash2, ListMusic, Loader2, ArrowLeft, Check } from "lucide-react";

export function PlaylistCard({ playlist, count, onOpen }) {
  return (
    <button onClick={onOpen} className="text-left rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:bg-white/10 transition">
      <div className="h-28 bg-gradient-to-br from-fuchsia-500/40 to-cyan-400/30 flex items-center justify-center">
        {playlist.cover ? <img src={playlist.cover} alt="" className="w-full h-full object-cover" /> : <ListMusic className="w-8 h-8 text-white/70" />}
      </div>
      <div className="p-2.5">
        <p className="text-sm font-semibold truncate">{playlist.name}</p>
        <p className="text-[11px] text-white/50">{count} {count === 1 ? "song" : "songs"}</p>
      </div>
    </button>
  );
}

export default function PlaylistsPanel({ playlists, tracks, onChanged, onPlay, currentKey, playing }) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState(null);

  const open = playlists.find((p) => p.id === openId) || null;
  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const create = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const first = tracks.find((t) => t.id === selected[0]);
      await base44.entities.Playlist.create({
        name: name.trim(),
        track_ids: selected,
        cover: first?.artwork || "",
      });
      setName(""); setSelected([]); setCreating(false);
      onChanged?.();
    } catch (e) {}
    setBusy(false);
  };

  const remove = async (id) => {
    try { await base44.entities.Playlist.delete(id); if (openId === id) setOpenId(null); onChanged?.(); } catch (e) {}
  };

  if (open) {
    const items = (open.track_ids || []).map((id) => tracks.find((t) => t.id === id)).filter(Boolean);
    return (
      <div className="p-3">
        <button onClick={() => setOpenId(null)} className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white mb-3"><ArrowLeft className="w-3.5 h-3.5" /> All playlists</button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-fuchsia-500/40 to-cyan-400/30 overflow-hidden flex items-center justify-center">
            {open.cover ? <img src={open.cover} alt="" className="w-full h-full object-cover" /> : <ListMusic className="w-7 h-7" />}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold truncate">{open.name}</h2>
            <p className="text-xs text-white/50">{items.length} songs</p>
          </div>
          <button onClick={() => remove(open.id)} title="Delete playlist" className="ml-auto w-8 h-8 rounded-full bg-white/10 hover:bg-rose-500/30 flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-white/50">This playlist is empty.</p>
        ) : (
          <div className="space-y-0.5">
            {items.map((t, i) => {
              const isCur = currentKey === `cat:${t.id}`;
              return (
                <button key={t.id} onClick={() => onPlay(t)} className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/10 text-left">
                  <span className="w-4 text-xs text-white/40 tabular-nums">{i + 1}</span>
                  <span className="w-9 h-9 rounded bg-white/10 overflow-hidden shrink-0">
                    {t.artwork ? <img src={t.artwork} alt="" className="w-full h-full object-cover" /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm truncate">{t.title}</span>
                    <span className="block text-xs text-white/50 truncate">{t.artist_name}</span>
                  </span>
                  {isCur && playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-white/60" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-3 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Your playlists</h2>
        <button onClick={() => setCreating((v) => !v)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-black text-xs font-bold"><Plus className="w-3.5 h-3.5" /> New playlist</button>
      </div>

      {creating && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Playlist name" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-white/30" />
          <div>
            <p className="text-[11px] uppercase tracking-widest text-white/40 mb-1.5">Add songs from your library</p>
            <div className="max-h-44 overflow-y-auto space-y-0.5">
              {tracks.length === 0 && <p className="text-xs text-white/45 py-2">Upload music or import from Spotify first.</p>}
              {tracks.map((t) => (
                <button key={t.id} onClick={() => toggle(t.id)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 text-left">
                  <span className={`w-4 h-4 rounded border flex items-center justify-center ${selected.includes(t.id) ? "bg-emerald-400 border-emerald-400 text-black" : "border-white/30"}`}>
                    {selected.includes(t.id) && <Check className="w-3 h-3" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs truncate">{t.title}</span>
                    <span className="block text-[10px] text-white/45 truncate">{t.artist_name}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
          <button onClick={create} disabled={busy || !name.trim()} className="w-full py-2 rounded-full bg-white text-black text-sm font-bold disabled:opacity-40 flex items-center justify-center gap-2">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Create playlist
          </button>
        </div>
      )}

      {playlists.length === 0 ? (
        <p className="text-sm text-white/50 py-6">No playlists yet — make your first one.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {playlists.map((p) => (
            <PlaylistCard key={p.id} playlist={p} count={(p.track_ids || []).length} onOpen={() => setOpenId(p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}