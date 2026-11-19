import React from "react";
import { Plus, X } from "lucide-react";

export default function ComposerPoll({ options, onChange, onRemove }) {
  const set = (i, v) => onChange(options.map((o, k) => (k === i ? v : o)));

  return (
    <div className="mt-2 rounded-2xl border border-white/12 bg-white/[0.04] p-2.5 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-white/60">Poll · {options.length}/4 options</span>
        <button type="button" onClick={onRemove} className="w-6 h-6 rounded-full grid place-items-center text-white/50 hover:bg-white/10" aria-label="Remove poll">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {options.map((o, i) => (
        <input
          key={i}
          value={o}
          onChange={(e) => set(i, e.target.value.slice(0, 40))}
          placeholder={`Option ${i + 1}`}
          className="w-full px-3 py-2 rounded-xl bg-black/35 border border-white/10 text-sm outline-none focus:border-[color:var(--brand)]"
        />
      ))}
      {options.length < 4 && (
        <button type="button" onClick={() => onChange([...options, ""])} className="text-[11.5px] font-semibold flex items-center gap-1 text-[color:var(--brand)]">
          <Plus className="w-3.5 h-3.5" /> Add option
        </button>
      )}
    </div>
  );
}