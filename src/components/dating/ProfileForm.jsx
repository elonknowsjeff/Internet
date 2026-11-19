import React, { useState } from "react";
import { X, ImagePlus, Loader2, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

const FIELDS = [
  { key: "display_name", label: "Name", placeholder: "Alex" },
  { key: "age", label: "Age", placeholder: "27", type: "number" },
  { key: "location", label: "City", placeholder: "Toronto" },
  { key: "distance_km", label: "Distance from you (km)", placeholder: "12", type: "number" },
  { key: "interests", label: "Interests (comma separated)", placeholder: "music, hiking, coffee" },
  { key: "looking_for", label: "Looking for", placeholder: "Something real" },
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
    bio: "",
    ...initial,
  });
  const [pics, setPics] = useState(() => [initial.photo, ...(initial.photos || [])].filter(Boolean));
  const [uploading, setUploading] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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
        bio: form.bio,
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
        </div>
        {error && <p className="text-xs text-rose-400 mt-3">{error}</p>}
        <button disabled={busy} className="mt-4 w-full py-2.5 rounded-full brand-grad text-black font-bold text-sm disabled:opacity-60">
          {busy ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}