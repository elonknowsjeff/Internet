import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useSettings } from "@/components/SettingsContext";
import { startSubscription } from "@/lib/checkout";
import { File as FileIcon, FileText, Image as ImageIcon, Video, Music, Archive, HardDrive, Upload, Check, Cloud as CloudIcon, Trash2, Play, Pause, X, Search } from "lucide-react";

const FREE_GB = 5;
const FREE_MB = FREE_GB * 1024;

const plans = [
  { name: "Free", size: "5 GB", price: "$0", features: ["5 GB storage", "Web access", "Private files"] },
  { name: "Plus", size: "100 GB", price: "$4.99", features: ["100 GB storage", "Smart sync", "Priority support"] },
  { name: "Pro", size: "1 TB", price: "$9.99", features: ["1 TB storage", "Version history", "Team folders"], popular: true },
  { name: "Business", size: "10 TB", price: "$24.99", features: ["10 TB storage", "Admin controls", "SSO & audit logs"] },
];

const kindFor = (file) => {
  const ext = (file.name || "").split(".").pop().toLowerCase();
  if (["jpg","jpeg","png","gif","webp","svg","bmp"].includes(ext)) return "image";
  if (["mp4","webm","mov","mkv","avi"].includes(ext)) return "video";
  if (["mp3","wav","ogg","m4a","flac","aac"].includes(ext)) return "audio";
  if (["zip","rar","7z","tar","gz"].includes(ext)) return "archive";
  if (["pdf","doc","docx","txt","md","xls","xlsx","ppt","pptx","csv"].includes(ext)) return "document";
  return "other";
};

const kindIcon = {
  document: { Icon: FileText, color: "text-sky-300" },
  image: { Icon: ImageIcon, color: "text-emerald-300" },
  video: { Icon: Video, color: "text-rose-300" },
  audio: { Icon: Music, color: "text-amber-300" },
  archive: { Icon: Archive, color: "text-orange-300" },
  other: { Icon: FileIcon, color: "text-white/50" },
};

const fmtSize = (mb) => mb < 1 ? `${(mb * 1024).toFixed(0)} KB` : mb < 1024 ? `${mb.toFixed(1)} MB` : `${(mb / 1024).toFixed(2)} GB`;

function RoundAudioPlayer({ src, name, onClose }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  useEffect(() => { if (audioRef.current) audioRef.current.play().catch(() => {}); }, []);
  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause(); else audioRef.current.play();
    setPlaying(!playing);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-xl" onClick={onClose}>
      <div className="flex flex-col items-center gap-6" onClick={(e) => e.stopPropagation()}>
        <p className="max-w-xs truncate text-center text-sm text-white/55">{name}</p>
        <div className="relative grid h-56 w-56 place-items-center rounded-full border border-white/15 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-2xl">
          <div className="absolute inset-3 rounded-full border border-white/10" />
          <div className="absolute inset-8 rounded-full border border-white/5" />
          <button onClick={toggle} className="grid h-20 w-20 place-items-center rounded-full brand-grad text-black shadow-2xl">
            {playing ? <Pause className="h-8 w-8" /> : <Play className="ml-1 h-8 w-8" />}
          </button>
        </div>
        <audio ref={audioRef} src={src} autoPlay onEnded={onClose} className="hidden" />
        <button onClick={onClose} className="rounded-full border border-white/15 bg-white/[0.07] px-5 py-2 text-sm">Close</button>
      </div>
    </div>
  );
}

export default function Cloud() {
  const { settings } = useSettings();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const fileInput = useRef(null);

  const load = async () => {
    try {
      const me = user || await base44.auth.me().catch(() => null);
      if (me) setUser(me);
      const data = await base44.entities.CloudFile.list("-created_date", 200);
      const mine = me ? data.filter((f) => f.created_by_id === me.id) : data;
      setFiles(mine);
    } catch (e) { setFiles([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const used = files.reduce((s, f) => s + (f.size_mb || 0), 0);
  const pct = Math.min(100, (used / FREE_MB) * 100);
  const searched = query.trim() ? files.filter((f) => (f.name || "").toLowerCase().includes(query.trim().toLowerCase())) : files;

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const sizeMb = file.size / 1048576;
    if (used + sizeMb > FREE_MB) { alert("Storage full. Upgrade your plan to upload more."); return; }
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await base44.entities.CloudFile.create({
        name: file.name,
        size_mb: +sizeMb.toFixed(2),
        kind: kindFor(file),
        file_uri,
        mime: file.type,
      });
      load();
    } catch (err) { alert("Upload failed."); }
    setUploading(false);
  };

  const openMedia = async (f) => {
    if (!f.file_uri) return;
    setBusy(true);
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: f.file_uri });
      setPreview({ type: f.kind, src: signed_url, name: f.name });
    } catch (e) { alert("Couldn't load file."); }
    setBusy(false);
  };

  const remove = async (f) => {
    if (!confirm(`Delete ${f.name}?`)) return;
    await base44.entities.CloudFile.delete(f.id);
    load();
  };

  return (
    <div className="mx-auto w-full max-w-4xl pb-28 sm:pb-8">
      <header className="px-4 pt-5 sm:px-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-white/35">Valo</p>
            <h1 className="mt-1 font-display text-[26px] font-semibold leading-none tracking-[-0.02em]">Cloud</h1>
            <p className="mt-1.5 text-[12px] text-white/40">Private storage for everything you keep.</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-1.5 text-[11px] font-semibold text-white/60">
            <CloudIcon className="h-3.5 w-3.5" style={{ color: "var(--brand)" }} /> Free · {FREE_GB} GB
          </span>
        </div>
      </header>

      <div className="mt-4 px-4 sm:px-6">
        <div className="panel overflow-hidden p-5">
          <div className="flex items-center gap-5">
            <div className="relative h-24 w-24 shrink-0">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="2.6" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none" stroke="url(#cloudGrad)" strokeWidth="2.6" strokeLinecap="round"
                  strokeDasharray={`${Math.max(pct, 1)} 100`}
                />
                <defs>
                  <linearGradient id="cloudGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" />
                    <stop offset="100%" stopColor="var(--brand-2)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <p className="text-[15px] font-bold leading-none">{Math.round(pct)}%</p>
                  <p className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-white/35">used</p>
                </div>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold">{fmtSize(used)} <span className="font-normal text-white/35">of {FREE_GB} GB</span></p>
              <p className="mt-0.5 text-[11.5px] text-white/40">{files.length} file{files.length === 1 ? "" : "s"} · stored privately</p>
              <input ref={fileInput} type="file" className="hidden" onChange={onUpload} />
              <button
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
                className="mt-3 flex items-center justify-center gap-2 rounded-full brand-grad px-4 py-2 text-[12.5px] font-bold text-black shadow-[0_14px_30px_-16px_rgba(168,85,247,0.95)] disabled:opacity-50"
              >
                <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload a file"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 px-4 sm:px-6">
        <div className="mb-2 flex items-center gap-2">
          <h3 className="text-[13px] font-semibold text-white/70">Your files</h3>
          <div className="ml-auto flex h-8 items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.04] px-3">
            <Search className="h-3.5 w-3.5 text-white/35" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search files" className="w-28 bg-transparent text-[12px] outline-none placeholder-white/30 sm:w-40" />
          </div>
        </div>

        <div className="panel overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-[13px] text-white/40">Loading files…</div>
          ) : searched.length === 0 ? (
            <div className="p-10 text-center">
              <Upload className="mx-auto mb-2 h-7 w-7 text-white/25" />
              <p className="text-[13px] text-white/45">{query ? "No files match that search." : "No files yet. Upload your first file — it's stored privately to your account."}</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {searched.map((f) => {
                const { Icon, color } = kindIcon[f.kind] || kindIcon.other;
                const media = f.kind === "image" || f.kind === "video" || f.kind === "audio";
                return (
                  <div key={f.id} className="group flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-white/[0.03]">
                    <button onClick={() => media && openMedia(f)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
                      <Icon className={`h-[18px] w-[18px] ${color}`} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">{f.name}</p>
                      <p className="text-[11px] text-white/35">{fmtSize(f.size_mb)} · {f.kind}</p>
                    </div>
                    {media && (
                      <button onClick={() => openMedia(f)} className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-white/45 opacity-0 transition-opacity hover:text-white group-hover:opacity-100">
                        {f.kind === "audio" ? "Play" : "Open"}
                      </button>
                    )}
                    <button onClick={() => remove(f)} className="rounded-full p-1.5 text-white/30 opacity-0 transition-opacity hover:text-rose-300 group-hover:opacity-100">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {busy && <p className="mt-2 animate-pulse text-[11px] text-white/35">Loading file…</p>}
      </div>

      <div className="mt-6 px-4 sm:px-6">
        <h3 className="mb-3 text-[13px] font-semibold text-white/70">More space</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {plans.map((p) => (
            <div key={p.name} className={`rounded-2xl p-4 transition-colors ${p.popular ? "panel ring-1 ring-[color:var(--brand)]/45" : "panel"}`}>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold">{p.name}</span>
                {p.popular && <span className="rounded-full bg-white/[0.12] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-white/70">Popular</span>}
              </div>
              <p className="mt-1 font-display text-2xl font-semibold tracking-[-0.02em]">{p.price}<span className="text-[13px] font-normal text-white/35">/mo</span></p>
              <p className="mt-0.5 flex items-center gap-1 text-[12px] text-white/55"><HardDrive className="h-3.5 w-3.5" style={{ color: "var(--brand)" }} /> {p.size}</p>
              <ul className="mt-3 space-y-1.5">
                {p.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-[11.5px] text-white/45">
                    <Check className="h-3 w-3 shrink-0" style={{ color: "var(--brand)" }} /> {feat}
                  </li>
                ))}
              </ul>
              <button onClick={() => startSubscription("plus").catch(() => {})} className="mt-4 block w-full rounded-full bg-white/[0.1] py-2 text-center text-[12px] font-bold hover:bg-white/[0.16]">Upgrade</button>
            </div>
          ))}
        </div>
      </div>

      {preview && preview.type === "audio" && <RoundAudioPlayer src={preview.src} name={preview.name} onClose={() => setPreview(null)} />}
      {preview && preview.type !== "audio" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/88 p-4 backdrop-blur-md" onClick={() => setPreview(null)}>
          <button onClick={() => setPreview(null)} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/10">
            <X className="h-5 w-5" />
          </button>
          {preview.type === "image" && <img src={preview.src} alt={preview.name} className="max-h-[85vh] max-w-full rounded-2xl" />}
          {preview.type === "video" && <video src={preview.src} controls autoPlay className="max-h-[85vh] max-w-full rounded-2xl" />}
        </div>
      )}
    </div>
  );
}