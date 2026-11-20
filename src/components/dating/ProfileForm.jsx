import React, { useState } from "react";
import { X, ImagePlus, Loader2, Sparkles, Music2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const FIELDS = [
  { key: "display_name", label: "Name", placeholder: "Alex" },
  { key: "age", label: "Age", placeholder: "27", type: "number" },
  { key: "location", label: "City", placeholder: "Toronto" },
  { key: "distance_km", label: "Distance from you (km)", placeholder: "12", type: "number" },
  { key: "interests", label: "Interests (comma separated)", placeholder: "music, hiking, coffee" },
  { key: "looking_for", label: "Looking for", placeholder: "Something real" },
  { key: "bpm", label: "Resting heartbeat (BPM)", placeholder: "72", type: "number" },
];

const MAX_PICS = 5;

export default function ProfileForm({ initial = {}, onClose, onSave }) {
  const [form, setForm] = useState({
    display_name: "",
    age: "",
    location: "",
    distance_km: "",
    interests: "",
    looking_for: "",
    bpm: "",
    bio: "",
    song_title: "",
    song_artist: "",
    ...initial,
  });
  const [pics, setPics] = useState(() => [initial.photo, ...(initial.photos || [])].filter(Boolean));
  const [songUrl, setSongUrl] = useState(initial.song_url || "");
  const [uploading, setUploading] = useState(false);
  const [songUploading, setSongUploading] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const uploadSong = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSongUploading(true);
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      if (res?.file_url) setSongUrl(res.file_url);
    } catch (err) {
      setError("Could not upload that song.");
    } finally {
      setSongUploading(false);
      e.target.value = "";
    }
  };

  const addPhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files.slice(0, MAX_PICS - pics.length)) {
        const res = await base44.integrations.Core.UploadPublicFile({ file });
        if (res?.file_url) setPics((p) => (p.length >= MAX_PICS ? p : [...p, res.file_url]));
      }
    } catch (err) {
      setError("Could not upload that photo.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const writeBio = async () => {
    if (aiBusy) return;
    setAiBusy(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt:
          "Write a short, warm, first-person dating profile bio (max 45 words, no emojis, no clichés like 'partner in crime'). " +
          `Return only the bio text.\nName: ${form.display_name || "someone"}\nAge: ${form.age || "unspecified"}\nCity: ${form.location || "unspecified"}\n` +
          `Interests: ${form.interests || "unspecified"}\nLooking for: ${form.looking_for || "something real"}`,
      });
      const text = typeof res === "string" ? res : res?.response || res?.text || "";
      if (text.trim()) setForm((s) => ({ ...s, bio: text.trim() }));
    } catch (err) {
      setError("The AI writer is unavailable right now.");
    } finally {
      setAiBusy(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.display_name.trim()) { setError("Add your name first."); return; }
    setBusy(true);
    setError("");
    try {
      await onSave({
        display_name: form.display_name.trim(),
        age: form.age ? Number(form.age) : undefined,
        location: form.location,
        distance_km: form.distance_km ? Number(form.distance_km) : 0,
        interests: form.interests,
        looking_for: form.looking_for,
        bpm: form.bpm ? Number(form.bpm) : undefined,
        bio: form.bio,
        song_url: songUrl || "",
        song_title: form.song_title || "",
        song_artist: form.song_artist || "",
        photo: pics[0] || "",
        photos: pics.slice(1),
      });
    } catch (err) {
      setError(err?.message || "Could not save your profile.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl gloss-strong p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold font-display">Your dating profile</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          <div>
            <span className="text-[10px] uppercase tracking-wide text-neutral-500">Photos · up to {MAX_PICS}</span>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {pics.map((url, n) => (
                <div key={url + n} className="relative aspect-[4/5] rounded-xl overflow-hidden border border-white/10 bg-black/40">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {n === 0 && <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-semibold">Main</span>}
                  <button type="button" onClick={() => setPics((p) => p.filter((_, k) => k !== n))} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/75 flex items-center justify-center hover:bg-rose-500">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {pics.length < MAX_PICS && (
                <label className="aspect-[4/5] rounded-xl border border-dashed border-white/25 bg-white/[0.04] grid place-items-center cursor-pointer hover:border-[color:var(--brand)]">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin text-white/60" /> : <ImagePlus className="w-5 h-5 text-white/50" />}
                  <input type="file" accept="image/*" multiple onChange={addPhotos} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {FIELDS.map((f) => (
            <label key={f.key} className="block">
              <span className="text-[10px] uppercase tracking-wide text-neutral-500">{f.label}</span>
              <input
                type={f.type || "text"}
                value={form[f.key] ?? ""}
                onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 outline-none text-sm focus:border-[color:var(--brand)]"
              />
            </label>
          ))}

          <label className="block">
            <span className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wide text-neutral-500">About you</span>
              <button type="button" onClick={writeBio} disabled={aiBusy} className="text-[10px] font-semibold flex items-center gap-1 text-[color:var(--brand)] disabled:opacity-50">
                {aiBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Write with AI
              </button>
            </span>
            <textarea
              value={form.bio || ""}
              onChange={(e) => setForm((s) => ({ ...s, bio: e.target.value }))}
              rows={3}
              placeholder="A line or two about you"
              className="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 outline-none text-sm resize-none focus:border-[color:var(--brand)]"
            />
          </label>

          <div>
            <span className="text-[10px] uppercase tracking-wide text-neutral-500">Profile song</span>
            <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2">
              <Music2 className="h-4 w-4 text-white/50 shrink-0" />
              {songUrl ? (
                <>
                  <span className="flex-1 truncate text-[12px] text-white/80">{songUrl.split("/").pop() || "Song attached"}</span>
                  <button type="button" onClick={() => setSongUrl("")} className="text-white/40 hover:text-white"><X className="w-3.5 h-3.5" /></button>
                </>
              ) : (
                <label className="flex-1 cursor-pointer text-[12px] text-white/55 hover:text-white">
                  {songUploading ? "Uploading…" : "Choose an audio file"}
                  <input type="file" accept="audio/*" onChange={uploadSong} className="hidden" />
                </label>
              )}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input
                value={form.song_title || ""}
                onChange={(e) => setForm((s) => ({ ...s, song_title: e.target.value }))}
                placeholder="Song title"
                className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 outline-none text-[12px] focus:border-[color:var(--brand)]"
              />
              <input
                value={form.song_artist || ""}
                onChange={(e) => setForm((s) => ({ ...s, song_artist: e.target.value }))}
                placeholder="Artist"
                className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 outline-none text-[12px] focus:border-[color:var(--brand)]"
              />
            </div>
          </div>
        </div>
        {error && <p className="text-xs text-rose-400 mt-3">{error}</p>}
        <button disabled={busy} className="mt-4 w-full py-2.5 rounded-full brand-grad text-black font-bold text-sm disabled:opacity-60">
          {busy ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}