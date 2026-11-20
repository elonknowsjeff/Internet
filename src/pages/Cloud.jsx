import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useSettings } from "@/components/SettingsContext";
import { startSubscription } from "@/lib/checkout";
import { File as FileIcon, FileText, Image as ImageIcon, Video, Music, Archive, HardDrive, Upload, Check, Cloud as CloudIcon, Trash2, Play, Pause, X, Search, Home, Folder, Star, Users } from "lucide-react";

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

const VIEWS = [
  { key: "home", label: "Home", Icon: Home },
  { key: "all", label: "All files", Icon: Folder },
  { key: "photos", label: "Photos", Icon: ImageIcon },
  { key: "documents", label: "Documents", Icon: FileText },
  { key: "starred", label: "Starred", Icon: Star },
  { key: "shared", label: "Shared", Icon: Users },
];

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
  const [view, setView] = useState("home");
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
  const byView = (list) => {
    if (view === "photos") return list.filter((f) => f.kind === "image");
    if (view === "documents") return list.filter((f) => f.kind === "document");
    if (view === "starred" || view === "shared") return [];
    return list;
  };
  const recents = [...searched].sort((a, b) => (b.created_date || "").localeCompare(a.created_date || ""));
  const showFiles = view === "home" ? recents.slice(0, 8) : byView(searched);

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
    <div className="mx-auto w-full max-w-5xl pb-28 sm:pb-8">
      <div className="flex gap-4 px-3 sm:px-6 pt-4">
        {/* Sidebar */}
        <aside className="hidden sm:flex w-56 shrink-0 flex-col">
          <div className="flex items-center gap-2 px-1 mb-4">
            <span className="grid h-8 w-8 place-items-center rounded-xl brand-grad text-black"><CloudIcon className="h-4 w-4" /></span>
            <span className="font-display text-lg font-semibold tracking-tight">Valo Cloud</span>
          </div>
          <button onClick={() => fileInput.current?.click()} disabled={uploading} className="mb-3 flex items-center justify-center gap-2 rounded-xl brand-grad px-4 py-2.5 text-[13px] font-bold text-black disabled:opacity-50">
            <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload"}
          </button>
          <nav className="flex flex-col gap-0.5">
            {VIEWS.map((v) => (
              <button key={v.key} onClick={() => setView(v.key)} className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] ${view === v.key ? "bg-white/[0.1] font-semibold" : "text-white/65 hover:bg-white/[0.05]"}`}>
                <v.Icon className="h-4 w-4" /> {v.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto pt-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between text-[11px] text-white/55"><span>Storage</span><span>{Math.round(pct)}%</span></div>
              <div className="mt-1.5 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full brand-grad" style={{ width: `${Math.max(pct, 2)}%` }} /></div>
              <p className="mt-1.5 text-[11px] text-white/45">{fmtSize(used)} of {FREE_GB} GB · stored privately</p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <section className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-4">
            <h1 className="font-display text-[22px] font-semibold tracking-tight sm:hidden">Cloud</h1>
            <div className="flex h-10 flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5">
              <Search className="h-4 w-4 text-white/40" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search files" className="flex-1 bg-transparent text-[13px] outline-none placeholder-white/35" />
            </div>
            <button onClick={() => fileInput.current?.click()} disabled={uploading} className="sm:hidden grid h-10 w-10 shrink-0 place-items-center rounded-full brand-grad text-black disabled:opacity-50"><Upload className="h-4 w-4" /></button>
          </div>

          <div className="sm:hidden mb-3 flex gap-1.5 overflow-x-auto scrollbar-none">
            {VIEWS.map((v) => (
              <button key={v.key} onClick={() => setView(v.key)} className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] ${view === v.key ? "brand-grad text-black font-bold" : "border border-white/10 text-white/65"}`}><v.Icon className="h-3.5 w-3.5" /> {v.label}</button>
            ))}
          </div>

          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-white/80">{view === "home" ? "Recents" : VIEWS.find((v) => v.key === view).label}</h2>
            <span className="text-[11px] text-white/40">{showFiles.length} item{showFiles.length === 1 ? "" : "s"}</span>
          </div>

          <input ref={fileInput} type="file" className="hidden" onChange={onUpload} />

          <div className="panel overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-[13px] text-white/40">Loading files…</div>
            ) : showFiles.length === 0 ? (
              <div className="p-12 text-center">
                <Upload className="mx-auto mb-2 h-7 w-7 text-white/25" />
                <p className="text-[13px] text-white/45">{query ? "No files match that search." : view === "starred" ? "Star files to find them fast." : view === "shared" ? "Files shared with you will appear here." : "No files yet. Upload your first file — it's stored privately to your account."}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-3">
                {showFiles.map((f) => {
                  const { Icon, color } = kindIcon[f.kind] || kindIcon.other;
                  const media = f.kind === "image" || f.kind === "video" || f.kind === "audio";
                  return (
                    <div key={f.id} className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.06]">
                      <button onClick={() => media && openMedia(f)} className="grid h-24 w-full place-items-center rounded-xl border border-white/[0.06] bg-white/[0.03]">
                        <Icon className={`h-9 w-9 ${color}`} />
                      </button>
                      <p className="mt-2 truncate text-[12.5px] font-medium">{f.name}</p>
                      <p className="text-[11px] text-white/35">{fmtSize(f.size_mb)}</p>
                      <button onClick={() => remove(f)} className="absolute right-2 top-2 rounded-full bg-black/40 p-1.5 text-white/50 opacity-0 transition-opacity hover:text-rose-300 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {busy && <p className="mt-2 animate-pulse text-[11px] text-white/35">Loading file…</p>}

          <div className="mt-6">
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
        </section>
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