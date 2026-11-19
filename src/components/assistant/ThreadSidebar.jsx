import React from "react";
import { Plus, MessageSquare, Trash2, X, Sparkles } from "lucide-react";

const timeAgo = (iso) => {
  if (!iso) return "";
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "now";
  if (d < 3600) return `${Math.floor(d / 60)}m`;
  if (d < 86400) return `${Math.floor(d / 3600)}h`;
  return `${Math.floor(d / 86400)}d`;
};

export default function ThreadSidebar({ threads, activeId, onSelect, onNew, onDelete, onClose }) {
  return (
    <aside className="flex flex-col h-full rounded-2xl border border-white/10 bg-white/[0.035] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.08]">
        <Sparkles className="w-4 h-4" style={{ color: "var(--brand)" }} />
        <p className="text-[13px] font-bold flex-1">Your chats</p>
        {onClose && (
          <button onClick={onClose} className="md:hidden w-7 h-7 rounded-full hover:bg-white/10 grid place-items-center">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <button
        onClick={onNew}
        className="m-2 flex items-center gap-2 px-3 py-2 rounded-xl brand-grad text-black text-[12.5px] font-bold hover:brightness-110 transition"
      >
        <Plus className="w-3.5 h-3.5" /> New chat
      </button>
      <div className="flex-1 overflow-y-auto px-1.5 pb-2 thin-scrollbar">
        {threads.length === 0 ? (
          <p className="px-2 py-4 text-[11.5px] text-white/35 leading-relaxed">
            Your conversations are saved here so you can pick them back up anytime.
          </p>
        ) : (
          threads.map((t) => (
            <div
              key={t.id}
              className={`group flex items-start gap-2 rounded-xl px-2 py-2 cursor-pointer transition-colors ${activeId === t.id ? "bg-white/[0.09]" : "hover:bg-white/[0.05]"}`}
              onClick={() => onSelect(t)}
            >
              <MessageSquare className="w-3.5 h-3.5 mt-1 shrink-0 text-white/40" />
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold truncate">{t.title}</p>
                <p className="text-[11px] text-white/40 truncate">{t.preview || "No messages yet"}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[10px] text-white/30">{timeAgo(t.updated_date || t.created_date)}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(t); }}
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md grid place-items-center text-white/40 hover:text-rose-300 hover:bg-rose-500/15"
                  title="Delete chat"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}