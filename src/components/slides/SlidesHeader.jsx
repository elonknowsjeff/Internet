import React from "react";
import { Presentation, FolderOpen, Save, Play, FilePlus, Check, Loader2 } from "lucide-react";

export default function SlidesHeader({ name, setName, saved, saving, onSave, onPresent, onOpen, onNew }) {
  return (
    <div className="flex items-center gap-2 px-3 h-12 bg-[#151030]/90 backdrop-blur-xl border-b border-white/10 shrink-0">
      <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shrink-0">
        <Presentation className="w-4 h-4 text-white" />
      </span>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="bg-transparent outline-none text-sm font-semibold min-w-0 flex-1 sm:flex-none sm:max-w-[260px] truncate rounded px-1 hover:bg-white/5 focus:bg-white/5"
      />
      <span className="hidden md:flex items-center gap-1 text-[11px] text-white/40">
        {saved ? <><Check className="w-3 h-3 text-emerald-400" /> Saved</> : "Walza Slides"}
      </span>

      <div className="ml-auto flex items-center gap-1.5">
        <button onClick={onNew} className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-white/70 hover:bg-white/10">
          <FilePlus className="w-3.5 h-3.5" /> New
        </button>
        <button onClick={onOpen} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-white/70 hover:bg-white/10">
          <FolderOpen className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Open</span>
        </button>
        <button onClick={onSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/12 border border-white/15 hover:bg-white/20 disabled:opacity-50">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
        </button>
        <button onClick={onPresent} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-black brand-grad">
          <Play className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Present</span>
        </button>
      </div>
    </div>
  );
}