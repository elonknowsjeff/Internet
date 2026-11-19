import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Trash2, RotateCcw, Loader2, FileText, Image as ImageIcon, Film, Music, Archive } from "lucide-react";

const ICONS = { document: FileText, image: ImageIcon, video: Film, audio: Music, archive: Archive, other: FileText };

export default function TrashApp() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setItems((await base44.entities.TrashItem.list("-created_date", 100)) || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const restore = async (item) => {
    setBusy(true);
    try {
      await base44.entities.CloudFile.create({
        name: item.name,
        size_mb: item.size_mb || 0,
        kind: item.kind || "other",
        mime: item.mime || "",
        file_uri: item.file_uri || "",
      });
      await base44.entities.TrashItem.delete(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } finally { setBusy(false); }
  };

  const destroy = async (item) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    await base44.entities.TrashItem.delete(item.id);
  };

  const emptyAll = async () => {
    const all = items;
    setItems([]);
    for (const it of all) await base44.entities.TrashItem.delete(it.id);
  };

  return (
    <div className="h-full flex flex-col bg-[#0b0d13] text-white text-xs">
      <div className="flex items-center gap-2 px-2 py-2 border-b border-white/10 bg-white/[.04]">
        <span className="font-semibold flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5" style={{ color: "var(--brand)" }} /> Recycle Bin</span>
        <span className="text-neutral-500">· {items.length} item{items.length === 1 ? "" : "s"}</span>
        <button onClick={emptyAll} disabled={!items.length || busy} className="ml-auto px-2.5 py-1.5 rounded-md border border-white/15 hover:bg-white/10 disabled:opacity-40">
          Empty Recycle Bin
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-2">
        {loading ? (
          <div className="h-full flex items-center justify-center text-neutral-500"><Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading…</div>
        ) : items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-neutral-500 text-center">
            <Trash2 className="w-8 h-8" />
            <p>Recycle Bin is empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {items.map((item) => {
              const Icon = ICONS[item.kind] || FileText;
              return (
                <div key={item.id} className="rounded-lg border border-white/10 bg-white/5 p-2 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500">{(item.size_mb || 0).toFixed(2)} MB</span>
                  <div className="flex gap-1 mt-auto">
                    <button onClick={() => restore(item)} disabled={busy} className="flex-1 py-1 rounded brand-grad text-black font-semibold flex items-center justify-center gap-1 disabled:opacity-40">
                      <RotateCcw className="w-3 h-3" /> Restore
                    </button>
                    <button onClick={() => destroy(item)} title="Delete permanently" className="px-2 py-1 rounded border border-white/15 text-neutral-300 hover:text-rose-400 hover:border-rose-400/50">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}