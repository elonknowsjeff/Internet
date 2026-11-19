import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Upload, Link2, Loader2, Check, Film, ImagePlus } from "lucide-react";

const CATEGORIES = ["Tech", "Music", "Gaming", "News", "Comedy", "Sports", "Education", "Entertainment"];

const parseId = (s) => {
  const v = (s || "").trim();
  const m = v.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : v.length === 11 ? v : "";
};

export default function VideoUploadDialog({ open, user, onClose, onPublished }) {
  const [mode, setMode] = useState("file");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [thumbUrl, setThumbUrl] = useState("");
  const [busy, setBusy] = useState("");
  const [form, setForm] = useState({ title: "", url: "", category: "Tech", description: "", is_short: false });

  if (!open) return null;

  const handle = user?.username || (user?.email ? user.email.split("@")[0] : "you");

  const pickVideo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy("video");
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      if (res?.file_url) {
        setFileUrl(res.file_url);
        setFileName(file.name);
        if (!form.title) setForm((f) => ({ ...f, title: file.name.replace(/\.[^.]+$/, "") }));
      }
    } catch (err) {}
    setBusy("");
    e.target.value = "";
  };

  const pickThumb = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy("thumb");
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      if (res?.file_url) setThumbUrl(res.file_url);
    } catch (err) {}
    setBusy("");
    e.target.value = "";
  };

  const reset = () => {
    setFileUrl(""); setFileName(""); setThumbUrl("");
    setForm({ title: "", url: "", category: "Tech", description: "", is_short: false });
  };

  const id = parseId(form.url);
  const ready = form.title.trim() && (mode === "file" ? !!fileUrl : !!id);

  const publish = async () => {
    if (!ready || busy) return;
    setBusy("publish");
    const created = await base44.entities.Video.create({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      is_short: form.is_short,
      source: mode === "file" ? "file" : "youtube",
      channel_name: user?.display_name || user?.full_name || "New Creator",
      channel_handle: handle,
      channel_avatar: user?.avatar || `https://i.pravatar.cc/100?u=${handle}`,
      ...(mode === "file"
        ? { file_uri: fileUrl, thumbnail: thumbUrl }
        : { youtube_id: id, thumbnail: thumbUrl || `https://img.youtube.com/vi/${id}/hqdefault.jpg` }),
    });
    setBusy("");
    reset();
    onPublished?.(created);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-white/12 bg-[#120d26] p-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black font-display flex items-center gap-2"><Film className="w-5 h-5 text-fuchsia-400" /> Upload a video</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-full bg-white/5 border border-white/10 mb-4">
          {[["file", "Upload from device", Upload], ["link", "YouTube link", Link2]].map(([key, label, Icon]) => (
            <button key={key} onClick={() => setMode(key)} className={`flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-semibold transition-colors ${mode === key ? "brand-grad text-black" : "text-white/70 hover:text-white"}`}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {mode === "file" ? (
            <>
              <label className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 cursor-pointer text-center transition-colors ${fileUrl ? "border-emerald-400/40 bg-emerald-400/5" : "border-white/20 hover:border-fuchsia-400/60"}`}>
                {busy === "video" ? <Loader2 className="w-6 h-6 animate-spin text-fuchsia-400" /> : fileUrl ? <Check className="w-6 h-6 text-emerald-400" /> : <Upload className="w-6 h-6 text-white/60" />}
                <span className="text-sm font-semibold">{fileName || (fileUrl ? "Video ready" : "Choose a video file")}</span>
                <span className="text-[11px] text-white/45">MP4, WebM or MOV</span>
                <input type="file" accept="video/*" onChange={pickVideo} className="hidden" />
              </label>
              {fileUrl && <video src={fileUrl} controls className="w-full rounded-xl bg-black max-h-56" />}
            </>
          ) : (
            <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="YouTube link, video ID or Shorts URL" className="w-full bg-white/5 border border-white/12 rounded-xl px-3 py-2.5 outline-none focus:border-fuchsia-400/60 text-sm" />
          )}

          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full bg-white/5 border border-white/12 rounded-xl px-3 py-2.5 outline-none focus:border-fuchsia-400/60 text-sm" />

          <div className="grid grid-cols-2 gap-2">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-white/5 border border-white/12 rounded-xl px-3 py-2.5 outline-none text-sm">
              {CATEGORIES.map((c) => <option key={c} className="bg-[#120d26]">{c}</option>)}
            </select>
            <label className="flex items-center justify-center gap-2 text-sm text-white/80 rounded-xl border border-white/12 bg-white/5">
              <input type="checkbox" checked={form.is_short} onChange={(e) => setForm({ ...form, is_short: e.target.checked })} className="accent-fuchsia-500" /> Short
            </label>
          </div>

          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Description" className="w-full bg-white/5 border border-white/12 rounded-xl px-3 py-2.5 outline-none focus:border-fuchsia-400/60 text-sm resize-none" />

          <label className="flex items-center gap-2.5 text-xs text-white/60 cursor-pointer">
            {busy === "thumb" ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
            {thumbUrl ? "Custom thumbnail added" : "Add a custom thumbnail (optional)"}
            <input type="file" accept="image/*" onChange={pickThumb} className="hidden" />
          </label>
        </div>

        <button onClick={publish} disabled={!ready || !!busy} className="mt-5 w-full py-2.5 rounded-full brand-grad text-black font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2">
          {busy === "publish" ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</> : <><Check className="w-4 h-4" /> Publish video</>}
        </button>
      </div>
    </div>
  );
}