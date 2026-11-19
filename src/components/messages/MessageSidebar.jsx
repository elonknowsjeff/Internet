import React, { useEffect, useRef, useState } from "react";
import { Search, X, Sparkles, UserRound, MessageSquare, SquarePen, Trash2 } from "lucide-react";
import { handleOf, nameOf } from "@/lib/socialNames";

const digits = (s) => (s || "").replace(/\D/g, "");

export function PeerAvatar({ u, size = "w-10 h-10" }) {
  return (
    <div className={`${size} rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center text-black font-bold overflow-hidden shrink-0`}>
      {u?.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : (nameOf(u)[0] || "U").toUpperCase()}
    </div>
  );
}

const previewOf = (c) => {
  if (!c) return "";
  if (c.kind === "voice") return "🎤 Voice message";
  if (c.kind === "image") return "🖼 Photo";
  if (c.kind === "call") return "📞 Call";
  return c.last || "";
};

const when = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export default function MessageSidebar({ users, conversations, active, onSelect, onAi, onProfile, onDelete, onClearAll, focusSignal = 0 }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const inputRef = useRef(null);
  const text = q.trim().toLowerCase();
  const number = digits(q);

  useEffect(() => {
    if (focusSignal > 0) inputRef.current?.focus();
  }, [focusSignal]);

  const matches = users.filter((u) => {
    if (!text) return false;
    const byPhone = number.length >= 3 && digits(u.phone).includes(number);
    return nameOf(u).toLowerCase().includes(text) || handleOf(u).toLowerCase().includes(text) || byPhone;
  });

  const unreadCount = conversations.filter((c) => c.unread > 0).length;
  const list = filter === "unread" ? conversations.filter((c) => c.unread > 0) : conversations;

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 pt-3 pb-2 border-b border-white/[0.08] shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-[19px] font-extrabold tracking-tight">Messages</h1>
          <div className="flex items-center gap-1">
            <button onClick={() => { setQ(""); inputRef.current?.focus(); }} title="New message" className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70">
              <SquarePen className="w-4 h-4" />
            </button>
            <button onClick={onAi} title="Super Internet AI" className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-fuchsia-300" />
            </button>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] rounded-full px-3.5 py-2 focus-within:border-[var(--brand)]/60 transition-colors">
          <Search className="w-4 h-4 text-white/45 shrink-0" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search people, @handle or number"
            className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder-white/40"
          />
          {q && <button onClick={() => setQ("")}><X className="w-3.5 h-3.5 text-white/45" /></button>}
        </div>

        <div className="mt-2 flex items-center gap-1">
          {[{ k: "all", label: "All" }, { k: "unread", label: "Unread" }].map((t) => (
            <button
              key={t.k}
              onClick={() => setFilter(t.k)}
              className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-colors ${filter === t.k ? "bg-white text-black" : "text-white/55 hover:bg-white/[0.07]"}`}
            >
              {t.label}{t.k === "unread" && unreadCount ? ` ${unreadCount}` : ""}
            </button>
          ))}
          {conversations.length > 0 && (
            <button onClick={onClearAll} className="ml-auto flex items-center gap-1 px-2 py-1 rounded-full text-[11.5px] font-semibold text-white/45 hover:text-rose-300 hover:bg-rose-500/10">
              <Trash2 className="w-3 h-3" /> Clear all
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto thin-scrollbar">
        {text ? (
          <div className="p-2">
            <p className="px-2 py-1 text-[10px] uppercase tracking-widest text-white/40">People</p>
            {matches.slice(0, 12).map((u) => (
              <div key={u.id} className="flex items-center gap-1 rounded-xl hover:bg-white/10">
                <button onClick={() => { onSelect(u); setQ(""); }} className="flex items-center gap-3 p-2 flex-1 min-w-0 text-left">
                  <PeerAvatar u={u} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{nameOf(u)}</p>
                    <p className="text-xs text-white/45 truncate">@{handleOf(u)}{u.phone ? ` · ${u.phone}` : ""}</p>
                  </div>
                </button>
                <button onClick={() => onProfile?.(u)} title="View account" className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center text-white/40 hover:text-white shrink-0">
                  <UserRound className="w-4 h-4" />
                </button>
              </div>
            ))}
            {matches.length === 0 && <p className="px-2 py-3 text-sm text-white/45">No account matches that.</p>}
          </div>
        ) : list.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <MessageSquare className="w-8 h-8 mx-auto text-white/25" />
            <p className="mt-3 text-sm text-white/55">{filter === "unread" ? "No unread messages" : "No conversations yet"}</p>
            <p className="text-xs text-white/35 mt-1">{filter === "unread" ? "You're all caught up." : "Search a real account above to start one."}</p>
          </div>
        ) : (
          list.map((c) => {
            const u = users.find((x) => x.id === c.id) || { id: c.id, full_name: c.name || "Member", avatar: c.avatar };
            return (
              <div
                key={c.id}
                className={`group flex items-center border-b border-white/[0.05] transition-colors ${active?.id === c.id ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"}`}
              >
                <button onClick={() => onSelect(u)} className="flex-1 flex items-start gap-3 px-3 py-3 text-left min-w-0">
                  <PeerAvatar u={u} size="w-10 h-10" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-[14.5px] truncate ${c.unread ? "font-bold text-white" : "font-semibold text-white/90"}`}>{nameOf(u)}</p>
                      <span className="text-[11.5px] text-white/35 truncate">@{handleOf(u)}</span>
                      <span className="ml-auto text-[11.5px] text-white/35 shrink-0">{when(c.ts)}</span>
                    </div>
                    <p className={`text-[12.5px] truncate mt-0.5 ${c.unread ? "text-white/85 font-medium" : "text-white/45"}`}>{previewOf(c)}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="mt-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--brand)] text-white text-[10.5px] font-bold grid place-items-center shrink-0">{c.unread}</span>
                  )}
                </button>
                <button
                  onClick={() => onDelete?.(c.id)}
                  title="Delete conversation"
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0 w-9 h-9 rounded-full mr-1 flex items-center justify-center text-white/40 hover:text-rose-300 hover:bg-rose-500/10 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}