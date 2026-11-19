import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { X, Upload, Loader2, Film, Link as LinkIcon } from "lucide-react";

const GENRES = ["Horror", "Sci-Fi", "Action", "Thriller", "Drama", "Comedy", "Romance", "Animation", "Documentary", "Fantasy", "Crime", "Adventure", "Musical", "Western", "Bollywood", "Kids", "Other"];

const parseId = (s) => {
  const v = (s || "").trim();
  const m = v.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : v.length === 11 ? v : "";
};

export default function UploadMovieDialog({ open, user, onClose, onPublished }) {
  const [form, setForm] = useState({ title: "", genre: "Horror", customGenre: "", synopsis: "", release_date: new Date().toISOString().slice(0, 10), link: "" });
  const [poster, setPoster] = useState("");
  const [videoUri, setVideoUri] = useState("");
  const [busy, setBusy] = useState("");
  const [saving, setSaving] = useState(false);
  const posterInput = useRef(null);
  const videoInput = useRef(null);

  if (!open) return null;

  const genre = form.genre === "Other" ? form.customGenre.trim() || "Other" : form.genre;

  const upload = async (file, kind) => {
    if (!file) return;
    setBusy(kind);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      if (kind === "poster") setPoster(file_url);
      else setVideoUri(file_url);
    } catch (e) {
      alert("Upload failed. Try a smaller file.");
    } finally {
      setBusy("");
    }
  };

  const submit = async () => {
    if (!form.title.trim() || saving) return;
    const id = parseId(form.link);
    if (!id && !videoUri) return;
    setSaving(true);
    try {
      const handle = user?.username || (user?.email ? user.email.split("@")[0] : "creator");
      await base44.entities.Movie.create({
        title: form.title.trim(),
        genre,
        synopsis: form.synopsis.trim(),
        release_date: form.release_date,
        poster: poster || (id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : ""),
        trailer: videoUri ? "" : id,
        video_uri: videoUri,
        language: "Community",
        uploader_name: user?.display_name || user?.full_name || handle,
        uploader_handle: handle,
        status: "now_showing",
      });
      setForm({ title: "", genre: "Horror", customGenre: "", synopsis: "", release_date: new Date().toISOString().slice(0, 10), link: "" });
      setPoster("");
      setVideoUri("");
      onPublished?.();
    } catch (e) {
      alert("Couldn't publish the movie.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl panel p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-[17px] font-bold tracking-[-0.01em]"><Film className="h-4 w-4" style={{ color: "var(--brand)" }} /> Upload a movie</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.06] hover:bg-white/[0.12]"><X className="h-4 w-4" /></button>
        </div>

        <div className="space-y-3">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Movie title"
            className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-3.5 py-2.5 text-sm outline-none placeholder-white/35 focus:border-white/30"
          />

          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.genre}
              onChange={(e) => setForm({ ...form, genre: e.target.value })}
              className="rounded-xl border border-white/[0.1] bg-white/[0.05] px-3 py-2.5 text-sm outline-none focus:border-white/30"
            >
              {GENRES.map((g) => <option key={g} value={g} className="bg-[#12101f]">{g}</option>)}
            </select>
            <input
              type="date"
              value={form.release_date}
              onChange={(e) => setForm({ ...form, release_date: e.target.value })}
              className="rounded-xl border border-white/[0.1] bg-white/[0.05] px-3 py-2.5 text-sm outline-none focus:border-white/30"
            />
          </div>

          {form.genre === "Other" && (
            <input
              value={form.customGenre}
              onChange={(e) => setForm({ ...form, customGenre: e.target.value })}
              placeholder="Name the genre"
              className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-3.5 py-2.5 text-sm outline-none placeholder-white/35 focus:border-white/30"
            />
          )}

          <textarea
            value={form.synopsis}
            onChange={(e) => setForm({ ...form, synopsis: e.target.value })}
            rows={3}
            placeholder="What is it about?"
            className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-3.5 py-2.5 text-sm outline-none placeholder-white/35 focus:border-white/30"
          />

          <div className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.05] px-3.5 py-2.5">
            <LinkIcon className="h-4 w-4 shrink-0 text-white/40" />
            <input
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder="YouTube link to the film (or upload a file below)"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder-white/35"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input ref={posterInput} type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0], "poster")} />
            <input ref={videoInput} type="file" accept="video/*" className="hidden" onChange={(e) => upload(e.target.files?.[0], "video")} />

            <button onClick={() => posterInput.current?.click()} className="flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.1] bg-white/[0.04] py-2.5 text-[12px] font-semibold hover:bg-white/[0.09]">
              {busy === "poster" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} {poster ? "Poster ready" : "Poster image"}
            </button>
            <button onClick={() => videoInput.current?.click()} className="flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.1] bg-white/[0.04] py-2.5 text-[12px] font-semibold hover:bg-white/[0.09]">
              {busy === "video" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} {videoUri ? "Film ready" : "Movie file"}
            </button>
          </div>

          {poster && <img src={poster} alt="" className="h-28 w-full rounded-xl object-cover" />}
        </div>

        <button
          onClick={submit}
          disabled={!form.title.trim() || (!videoUri && !parseId(form.link)) || saving}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full brand-grad py-2.5 text-sm font-bold text-black disabled:opacity-40"
        >
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Publishing…</> : "Publish movie"}
        </button>
        <p className="mt-2 text-center text-[10.5px] text-white/35">Files are stored publicly — anyone with the link can open them.</p>
      </div>
    </div>
  );
}