import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { base44 } from "@/api/base44Client";
import { FileText, Save, Plus, Trash2, Download, Loader2 } from "lucide-react";

export default function Docs() {
  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState("Untitled document");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const load = async () => {
    try { setDocs(await base44.entities.Doc.list("-created_date", 50)); } catch (e) {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      if (activeId) await base44.entities.Doc.update(activeId, { title: title.trim() || "Untitled", content });
      else { const rec = await base44.entities.Doc.create({ title: title.trim() || "Untitled", content }); setActiveId(rec.id); }
      setSaved(true); setTimeout(() => setSaved(false), 1500); load();
    } catch (e) {}
    setSaving(false);
  };

  const open = (d) => { setActiveId(d.id); setTitle(d.title); setContent(d.content || ""); };
  const newDoc = () => { setActiveId(null); setTitle("Untitled document"); setContent(""); };
  const remove = async (d) => { if (!confirm("Delete this document?")) return; await base44.entities.Doc.delete(d.id); if (activeId === d.id) newDoc(); load(); };

  const plainText = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = plainText ? plainText.split(" ").length : 0;
  const chars = plainText.length;
  const pages = Math.max(1, Math.ceil(words / 500));

  const exportDoc = () => {
    const html = `<!doctype html><meta charset="utf-8"><title>${title}</title>${content}`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    a.download = (title || "document").replace(/[^\w\-]+/g, "-") + ".html";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const proposal = () => setContent(
    "<h2>Business proposal</h2><p><strong>Prepared for:</strong> Client name</p><p><strong>Prepared by:</strong> Your company</p>" +
    "<h3>Objective</h3><p>What this engagement delivers.</p><h3>Scope of work</h3><ul><li>Deliverable one</li><li>Deliverable two</li></ul>" +
    "<h3>Timeline</h3><p>Week 1–2 discovery, week 3–6 build, week 7 handover.</p><h3>Investment</h3><p>$0.00</p><h3>Next steps</h3><p>Reply to approve and we begin.</p>"
  );

  const meetingNotes = () => setContent(
    "<h2>Meeting notes</h2><p><strong>Date:</strong> </p><p><strong>Attendees:</strong> </p>" +
    "<h3>Agenda</h3><ol><li>Item one</li><li>Item two</li></ol><h3>Decisions</h3><p>—</p><h3>Action items</h3><ul><li>Owner — task — due date</li></ul>"
  );

  return (
    <div className="flex flex-col h-[calc(100dvh-7rem)] min-h-[520px] rounded-xl overflow-hidden border border-white/10 mx-1 sm:mx-3 my-2 bg-[#f3f2f1]">

      {/* Word-style title bar */}
      <div className="flex items-center gap-2 h-12 px-2.5 shrink-0 bg-[#185abd] text-white">
        <span className="w-7 h-7 rounded bg-white/15 grid place-items-center shrink-0"><FileText className="w-4 h-4" /></span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="min-w-0 flex-1 max-w-[360px] bg-transparent outline-none text-sm font-semibold placeholder-white/60 border border-transparent focus:border-white/40 rounded px-1.5 py-1"
        />
        <span className="hidden sm:inline text-[11px] text-white/70 truncate">
          {saving ? "Saving…" : saved ? "All changes saved" : activeId ? "Saved to your cloud" : "New document"}
        </span>
        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          <button onClick={newDoc} className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[12px] font-semibold hover:bg-white/15">
            <Plus className="w-3.5 h-3.5" /> New
          </button>
          <button onClick={save} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 rounded bg-white text-[#185abd] text-[12px] font-bold disabled:opacity-60">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
          </button>
        </div>
      </div>

      {/* Ribbon */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 shrink-0 bg-white border-b border-neutral-300 text-neutral-700 text-[12px]">
        <span className="text-[10px] uppercase tracking-wide text-neutral-400">Templates</span>
        <button onClick={proposal} className="px-2.5 py-1 rounded border border-neutral-300 hover:bg-neutral-100">Proposal</button>
        <button onClick={meetingNotes} className="px-2.5 py-1 rounded border border-neutral-300 hover:bg-neutral-100">Meeting notes</button>
        <span className="w-px h-5 bg-neutral-200 mx-1" />
        <button onClick={exportDoc} className="flex items-center gap-1 px-2.5 py-1 rounded border border-neutral-300 hover:bg-neutral-100">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
        <span className="ml-auto text-[11px] text-neutral-500">{words} words</span>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Document list rail */}
        <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-neutral-300 bg-[#f3f2f1]">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-neutral-500 flex items-center justify-between">
            Documents
            <button onClick={newDoc} title="New document" className="w-6 h-6 rounded hover:bg-neutral-200 grid place-items-center"><Plus className="w-3.5 h-3.5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto thin-scrollbar pb-2">
            {loading ? (
              <p className="px-3 py-2 text-[12px] text-neutral-500">Loading…</p>
            ) : docs.length === 0 ? (
              <p className="px-3 py-2 text-[12px] text-neutral-500 leading-relaxed">No saved documents yet. Hit Save to keep one.</p>
            ) : (
              docs.map((d) => (
                <div key={d.id} className={`group flex items-center gap-1 mx-1.5 mb-1 rounded ${activeId === d.id ? "bg-[#deecf9]" : "hover:bg-neutral-200/70"}`}>
                  <button onClick={() => open(d)} className="flex-1 min-w-0 text-left px-2 py-1.5">
                    <p className="text-[12.5px] font-semibold text-neutral-800 truncate">{d.title}</p>
                    <p className="text-[11px] text-neutral-500 truncate">{(d.content || "").replace(/<[^>]+>/g, "").trim().slice(0, 40) || "Empty document"}</p>
                  </button>
                  <button onClick={() => remove(d)} title="Delete" className="opacity-0 group-hover:opacity-100 w-7 h-7 grid place-items-center rounded text-neutral-500 hover:text-rose-600 shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Page canvas */}
        <div className="flex-1 min-w-0 overflow-y-auto thin-scrollbar px-3 sm:px-6 py-5">
          <div className="mx-auto w-full max-w-[816px] bg-white shadow-[0_2px_14px_rgba(0,0,0,0.18)] rounded-sm overflow-hidden">
            <ReactQuill theme="snow" value={content} onChange={setContent} placeholder="Start writing your document…" />
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="shrink-0 flex items-center gap-4 h-7 px-3 bg-[#f3f2f1] border-t border-neutral-300 text-[11px] text-neutral-600">
        <span>Page {pages} of {pages}</span>
        <span>{words} words</span>
        <span>{chars} characters</span>
        <span className="ml-auto hidden sm:inline">English (US)</span>
      </div>
    </div>
  );
}