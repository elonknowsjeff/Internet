import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, X, Loader2, Music2 } from "lucide-react";

const covers = [
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300",
  "https://images.unsplash.com/photo-1459749411175-04bf529300ce?w=300",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300",
  "https://images.unsplash.com/photo-1487180144351-b8472da7d214?w=300",
];
const genres = ["Hip-Hop", "Electronic", "Rock", "Lo-Fi", "Jazz", "Pop"];

const isVideo = (f) => f && (f.type?.startsWith("video") || /\.(mp4|webm|mov|m4v)$/i.test(f.name));
const isAudio = (f) => f && (f.type?.startsWith("audio") || /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(f.name));

export default function MusicUpload({ user, onClose, onDone }) {
  const [form, setForm] = useState({ title: "", genre: "Electronic" });
  const [media, setMedia] = useState(null);
  const [art, setArt] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!form.title.trim() || !media) { setErr("Add a title and a media file."); return; }
    setBusy(true); setErr("");
    try {
      const mediaType = isVideo(media) ? "video" : "audio";
      const up = await base44.integrations.Core.UploadPrivateFile({ file: media });
      let artwork = covers[Math.floor(Math.random() * covers.length)];
      if (art) {
        try {
          const ap = await base44.integrations.Core.UploadPublicFile({ file: art });
          artwork = ap.file_url;
        } catch (e) {}
      }
      const handle = user?.username || (user ? (user.email?.split("@")[0] || "you") : "you");
      await base44.entities.Track.create({
        title: form.title.trim(),
        artist_name: user?.display_name || user?.full_name || "You",
        artist_handle: handle,
        genre: form.genre,
        artwork,
        duration: 120 + Math.floor(Math.random() * 180),
        file_uri: up.file_uri,
        media_type: mediaType,
        uploaded_by_id: user?.id || "",
        uploaded_by_name: user?.display_name || user?.full_name || "You",
        uploaded_by_handle: handle,
      });
      onDone?.();
      onClose?.();
    } catch (e) {
      setErr("Upload failed. Try a smaller file.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Upload to Music</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Track title" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 outline-none focus:border-orange-500" />
          <select value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 outline-none">
            {genres.map((g) => <option key={g}>{g}</option>)}
          </select>

          <label className="block">
            <span className="text-xs text-neutral-400 flex items-center gap-1 mb-1"><Music2 className="w-3.5 h-3.5" /> Media file (audio or video)</span>
            <input type="file" accept="audio/*,video/*" onChange={(e) => setMedia(e.target.files?.[0] || null)} className="w-full text-xs text-neutral-400 file:mr-3 file:rounded-full file:border-0 file:bg-orange-500 file:text-black file:px-3 file:py-1.5 file:font-semibold" />
            {media && <p className="text-[11px] text-orange-400 mt-1">{media.name} · {isVideo(media) ? "Video" : "Audio"}</p>}
          </label>

          <label className="block">
            <span className="text-xs text-neutral-400 mb-1 block">Cover art (optional)</span>
            <input type="file" accept="image/*" onChange={(e) => setArt(e.target.files?.[0] || null)} className="w-full text-xs text-neutral-400 file:mr-3 file:rounded-full file:border-0 file:bg-neutral-700 file:text-white file:px-3 file:py-1.5" />
          </label>

          {err && <p className="text-xs text-rose-400">{err}</p>}
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full border border-neutral-800 text-sm">Cancel</button>
          <button onClick={submit} disabled={busy || !form.title.trim() || !media} className="flex-1 py-2.5 rounded-full bg-orange-500 text-black font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-2">
            {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : <><Upload className="w-4 h-4" /> Publish</>}
          </button>
        </div>
      </div>
    </div>
  );
}