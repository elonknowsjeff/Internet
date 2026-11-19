import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Loader2, FileText, Image as ImageIcon, Film, Music, Archive, Trash2, HardDrive } from "lucide-react";

const ICONS = { document: FileText, image: ImageIcon, video: Film, audio: Music, archive: Archive, other: FileText };

export const kindOf = (mime = "") => {
  const m = String(mime).toLowerCase();
  if (m.startsWith("image")) return "image";
  if (m.startsWith("video")) return "video";
  if (m.startsWith("audio")) return "audio";
  if (/zip|rar|tar|7z|gzip/.test(m)) return "archive";
  if (/pdf|word|text|sheet|excel|csv/.test(m)) return "document";
  return "other";
};

export default function FilesApp() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  const load = async () => {
    try {
      setFiles((await base44.entities.CloudFile.list("-created_date", 100)) || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const upload = async (e) => {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;
    setBusy(true);
    try {
      for (const file of picked) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        await base44.entities.CloudFile.create({
          name: file.name,
          size_mb: +(file.size / 1048576).toFixed(2),
          kind: kindOf(file.type),
          mime: file.type,
          file_uri,
        });
      }
      await load();
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const moveToTrash = async (file) => {
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
    await base44.entities.TrashItem.create({
      name: file.name,
      kind: file.kind || "other",
      size_mb: file.size_mb || 0,
      mime: file.mime || "",
      file_uri: file.file_uri || "",
    });
    await base44.entities.CloudFile.delete(file.id);
  };

  const total = files.reduce((s, f) => s + (f.size_mb || 0), 0);

  return (
    <div className="h-full flex flex-col bg-[#0b0d13] text-white text-xs">
      <div className="flex items-center gap-2 px-2 py-2 border-b border-white/10 bg-white/[.04]">
        <span className="font-semibold flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5" style={{ color: "var(--brand)" }} /> This PC</span>
        <span className="text-neutral-500">· {files.length} files · {total.toFixed(2)} MB</span>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-md brand-grad text-black font-semibold disabled:opacity-50"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Upload
        </button>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={upload} />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center text-neutral-500"><Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading files…</div>
        ) : files.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-neutral-500 p-6 text-center">
            <Upload className="w-8 h-8" />
            <p>No files yet. Upload documents, photos, video or audio.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-[#0b0d13] text-neutral-500">
              <tr className="text-left">
                <th className="font-medium px-3 py-2">Name</th>
                <th className="font-medium px-3 py-2 hidden sm:table-cell">Type</th>
                <th className="font-medium px-3 py-2 text-right">Size</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {files.map((f) => {
                const Icon = ICONS[f.kind] || FileText;
                return (
                  <tr key={f.id} className="border-t border-white/5 hover:bg-white/5">
                    <td className="px-3 py-2">
                      <span className="flex items-center gap-2 min-w-0">
                        <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--brand)" }} />
                        <span className="truncate">{f.name}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2 text-neutral-500 hidden sm:table-cell">{f.kind}</td>
                    <td className="px-3 py-2 text-right text-neutral-400 tabular-nums">{(f.size_mb || 0).toFixed(2)} MB</td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => moveToTrash(f)} title="Move to Trash" className="p-1.5 rounded hover:bg-white/10 text-neutral-400 hover:text-rose-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}