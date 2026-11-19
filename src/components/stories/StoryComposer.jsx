import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, ImagePlus, Music2, Loader2 } from "lucide-react";

const MUSIC = [
  { title: "Neon Skyline", artist: "Walza Sounds", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { title: "Midnight Drive", artist: "Walza Sounds", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { title: "Golden Hour", artist: "Walza Sounds", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
];

export default function StoryComposer({ user, authorName, authorHandle, authorAvatar, onClose, onCreated }) {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [music, setMusic] = useState(null);
  const [customMusic, setCustomMusic] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      if (res?.file_url) setImage(res.file_url);
    } catch (err) {}
    setUploading(false);
  };

  const share = async () => {
    if (!image && !caption.trim() || saving) return;
    setSaving(true);
    const chosen = music || (customMusic.trim() ? { title: "Custom track", artist: "Link", url: customMusic.trim() } : null);
    try {
      await base44.entities.Story.create({
        author_name: authorName,
        author_handle: authorHandle,
        author_avatar: authorAvatar || "",
        image_url: image || "",
        caption: caption.trim(),
        ...(chosen ? { music_title: chosen.title, music_artist: chosen.artist, music_url: chosen.url } : {}),
      });
      onCreated?.();
      onClose();
    } catch (e) {}
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card w-full max-w-sm bg-[#2a2152]/95 p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2"><ImagePlus className="w-4 h-4 text-fuchsia-300" /> New story</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <label className="relative flex items-center justify-center h-36 rounded-xl border border-dashed border-white/25 bg-white/5 overflow-hidden cursor-pointer">
          {image ? (
            <img src={image} alt="story" className="w-full h-full object-cover" />
          ) : uploading ? (
            <span className="text-sm text-white/60 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</span>
          ) : (
            <span className="text-sm text-white/55 flex flex-col items-center gap-1"><ImagePlus className="w-6 h-6" /> Add a photo or video still</span>
          )}
          <input type="file" accept="image/*" onChange={pickFile} className="hidden" />
        </label>

        <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add a caption…" className="w-full bg-white/10 border border-white/20 rounded-full px-3 py-2 text-sm outline-none placeholder-white/40" />

        <div>
          <p className="text-xs text-white/60 mb-1.5 flex items-center gap-1"><Music2 className="w-3.5 h-3.5" /> Add music</p>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {MUSIC.map((m) => (
              <button key={m.url} onClick={() => { setMusic(music?.url === m.url ? null : m); setCustomMusic(""); }} className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] border ${music?.url === m.url ? "brand-grad text-black border-transparent" : "border-white/20 text-white/75"}`}>{m.title}</button>
            ))}
          </div>
          <input value={customMusic} onChange={(e) => { setCustomMusic(e.target.value); setMusic(null); }} placeholder="…or paste an audio link (mp3)" className="mt-1.5 w-full bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-xs outline-none placeholder-white/40" />
        </div>

        <button onClick={share} disabled={saving || (!image && !caption.trim())} className="w-full py-2.5 rounded-full brand-grad text-black font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Sharing…</> : "Share story"}
        </button>
        <p className="text-[10px] text-white/40 text-center">Photos are stored publicly — anyone with the link can open them.</p>
      </div>
    </div>
  );
}