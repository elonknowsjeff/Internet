import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Upload, Music2, Loader2, DollarSign } from "lucide-react";

const GENRES = ["Hip-Hop", "Electronic", "Lo-Fi", "Jazz", "Pop", "Rock", "Trap", "R&B", "Country", "Classical"];
const LICENSES = ["Basic Lease", "Premium Lease", "Exclusive Rights", "Full Track"];
const KEYS = ["—", "Am", "Bm", "Cm", "Dm", "Em", "Fm", "Gm", "C", "D", "E", "F", "G", "A", "B"];

export default function SellListingModal({ user, onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", genre: "Hip-Hop", bpm: 140, musical_key: "Am", price: 29, license_type: "Basic Lease", description: "", tags: "" });
  const [audioFile, setAudioFile] = useState(null);
  const [artFile, setArtFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!form.title.trim() || !form.price) { setErr("Add a title and a price."); return; }
    setBusy(true); setErr("");
    try {
      let preview_file_uri = "";
      if (audioFile) {
        const up = await base44.integrations.Core.UploadPrivateFile({ file: audioFile });
        preview_file_uri = up.file_uri;
      }
      let artwork = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600";
      if (artFile) {
        try {
          const ap = await base44.integrations.Core.UploadPublicFile({ file: artFile });
          artwork = ap.file_url;
        } catch (e) {}
      }
      const created = await base44.entities.MusicListing.create({
        title: form.title.trim(),
        seller_name: user?.display_name || user?.full_name || "Artist",
        seller_handle: user?.username || (user?.email ? user.email.split("@")[0] : "artist"),
        genre: form.genre,
        bpm: Number(form.bpm) || 0,
        musical_key: form.musical_key,
        price: Number(form.price) || 0,
        license_type: form.license_type,
        description: form.description.trim(),
        tags: form.tags.trim(),
        artwork,
        preview_file_uri,
      });
      onCreated?.(created);
      onClose?.();
    } catch (e) {
      setErr("Could not publish the listing. Try a smaller audio file.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-2xl bg-neutral-950 border border-white/15 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold font-display">Sell your sound</h2>
            <p className="text-xs text-neutral-500">Beats, instrumentals and full tracks</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-3">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Beat / track title" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 outline-none focus:border-orange-500 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm outline-none">
              {GENRES.map((g) => <option key={g} className="bg-neutral-900">{g}</option>)}
            </select>
            <select value={form.license_type} onChange={(e) => setForm({ ...form, license_type: e.target.value })} className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm outline-none">
              {LICENSES.map((l) => <option key={l} className="bg-neutral-900">{l}</option>)}
            </select>
            <input type="number" min="40" max="300" value={form.bpm} onChange={(e) => setForm({ ...form, bpm: e.target.value })} placeholder="BPM" className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm outline-none" />
            <select value={form.musical_key} onChange={(e) => setForm({ ...form, musical_key: e.target.value })} className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm outline-none">
              {KEYS.map((k) => <option key={k} className="bg-neutral-900">{k === "—" ? "Key (optional)" : k}</option>)}
            </select>
          </div>
          <div className="relative">
            <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input type="number" min="0" step="0.5" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-orange-500" />
          </div>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe the sound, included stems, usage terms…" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-500 resize-none" />
          <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Tags (dark, melodic, 808…)" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-500" />

          <label className="block">
            <span className="text-xs text-neutral-400 flex items-center gap-1 mb-1"><Music2 className="w-3.5 h-3.5" /> Preview audio (optional)</span>
            <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} className="w-full text-xs text-neutral-400 file:mr-3 file:rounded-full file:border-0 file:bg-orange-500 file:text-black file:px-3 file:py-1.5 file:font-semibold" />
          </label>
          <label className="block">
            <span className="text-xs text-neutral-400 mb-1 block">Cover art (optional)</span>
            <input type="file" accept="image/*" onChange={(e) => setArtFile(e.target.files?.[0] || null)} className="w-full text-xs text-neutral-400 file:mr-3 file:rounded-full file:border-0 file:bg-neutral-700 file:text-white file:px-3 file:py-1.5" />
          </label>

          {err && <p className="text-xs text-rose-400">{err}</p>}
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full border border-neutral-800 text-sm">Cancel</button>
          <button onClick={submit} disabled={busy || !form.title.trim() || !form.price} className="flex-1 py-2.5 rounded-full bg-orange-500 text-black font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-2">
            {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</> : <><Upload className="w-4 h-4" /> Publish listing</>}
          </button>
        </div>
      </div>
    </div>
  );
}