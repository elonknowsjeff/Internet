import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { UploadCloud, Music2, Film, Loader2, Check, ArrowLeft } from "lucide-react";

export default function Upload() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("video");
  const [caption, setCaption] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const authorName = user?.display_name || user?.full_name || "You";
  const authorHandle = user?.username || (user ? ((user.display_name || user.full_name || "").toLowerCase().replace(/\s+/g, "") || user.email?.split("@")[0]) : "you");
  const authorAvatar = user?.avatar || "";

  const submit = async () => {
    if (busy || !file) return;
    setBusy(true);
    setDone(false);
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      if (!res?.file_url) throw new Error("upload failed");
      const content = tab === "video" ? caption.trim() : (title.trim() || caption.trim() || "New track");
      await base44.entities.Post.create({
        content,
        author_name: authorName,
        author_handle: authorHandle,
        author_avatar: authorAvatar,
        category: "general",
        media_url: res.file_url,
        media_type: tab === "video" ? "video" : "audio",
      });
      setDone(true);
      setCaption("");
      setTitle("");
      setFile(null);
    } catch {}
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-28">
      <header className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full hover:bg-white/10 grid place-items-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <UploadCloud className="w-5 h-5" style={{ color: "var(--accent)" }} /> Upload to feed
        </h1>
      </header>

      <div className="ig-card p-1.5 flex gap-1 mb-4 max-w-xs">
        {[{ k: "video", l: "Video", Icon: Film }, { k: "music", l: "Music", Icon: Music2 }].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === t.k ? "ig-grad text-white" : "text-white/60 hover:bg-white/5"}`}
          >
            <t.Icon className="w-4 h-4" /> {t.l}
          </button>
        ))}
      </div>

      <div className="ig-card p-4 space-y-4">
        {tab === "music" && (
          <label className="block">
            <span className="block text-[11px] text-white/45 mb-1">Track title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Song name"
              className="w-full ig-solid rounded-xl px-3 py-2.5 text-sm outline-none"
            />
          </label>
        )}

        <label className="block">
          <span className="block text-[11px] text-white/45 mb-1">{tab === "video" ? "Caption" : "Description"}</span>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            placeholder={tab === "video" ? "Write a caption…" : "Describe your track…"}
            className="w-full ig-solid rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
          />
        </label>

        <label className="block">
          <span className="block text-[11px] text-white/45 mb-1">{tab === "video" ? "Video file" : "Audio file"}</span>
          <div className="ig-solid rounded-xl px-3 py-3 flex items-center gap-3">
            <input
              type="file"
              accept={tab === "video" ? "video/*" : "audio/*"}
              onChange={(e) => setFile(e.target.files?.[0])}
              className="text-sm text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:text-white file:px-3 file:py-1.5 file:font-semibold"
            />
            {file && <span className="text-xs text-white/50 truncate">{file.name}</span>}
          </div>
        </label>

        {done && (
          <p className="text-xs text-emerald-400 flex items-center gap-1.5">
            <Check className="w-4 h-4" /> Posted to your feed.
          </p>
        )}

        <button
          onClick={submit}
          disabled={busy || !file}
          className="w-full py-3 rounded-full brand-grad text-black font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : <>Post to feed</>}
        </button>
        <p className="text-[11px] text-white/35 text-center">Your {tab} is stored publicly and appears in the social feed.</p>
      </div>
    </div>
  );
}