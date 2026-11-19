import React from "react";
import { Star, Inbox, Send, Trash2 } from "lucide-react";
import { fmtWhen, initials } from "./mailData";

const EMPTY = {
  inbox: { icon: Inbox, title: "Inbox is empty", hint: "Nothing has arrived yet. Mail sent to your address lands here." },
  starred: { icon: Star, title: "No starred mail", hint: "Star a message to keep it here." },
  sent: { icon: Send, title: "Nothing sent yet", hint: "Messages you send are saved here." },
  trash: { icon: Trash2, title: "Trash is empty", hint: "Deleted mail shows up here." },
};

export default function MailList({ messages, folder = "inbox", selectedId, onOpen, onStar }) {
  if (messages.length === 0) {
    const e = EMPTY[folder] || EMPTY.inbox;
    return (
      <div className="flex flex-col items-center justify-center text-center px-6 py-16">
        <span className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
          <e.icon className="w-6 h-6 text-white/35" />
        </span>
        <p className="text-sm font-semibold text-white/75">{e.title}</p>
        <p className="text-[11px] text-[#9aa0a6] mt-1 max-w-[240px]">{e.hint}</p>
      </div>
    );
  }
  return (
    <div className="divide-y divide-white/5">
      {messages.map((m) => (
        <div
          key={m.id}
          onClick={() => onOpen(m)}
          className={`flex items-center gap-2 px-2.5 py-2.5 cursor-pointer transition-colors ${selectedId === m.id ? "bg-white/10" : "hover:bg-white/5"} ${m.read ? "" : "bg-white/[0.04]"}`}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onStar(m); }}
            className="w-7 h-7 shrink-0 flex items-center justify-center text-[#9aa0a6] hover:text-amber-300"
          >
            <Star className={`w-4 h-4 ${m.starred ? "fill-amber-400 text-amber-400" : ""}`} />
          </button>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-black text-[10px] font-bold flex items-center justify-center shrink-0">
            {initials(m.folder === "sent" ? m.to_name || "me" : m.from_name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={`text-[13px] truncate ${m.read ? "text-[#dcdcdc]" : "font-bold text-white"}`}>
                {m.folder === "sent" ? `To: ${m.to_name || m.to_email || "recipient"}` : m.from_name}
              </p>
              <span className="ml-auto text-[11px] text-[#9aa0a6] shrink-0">{fmtWhen(m.date)}</span>
            </div>
            <p className={`text-[12px] truncate ${m.read ? "text-[#c2c2c2]" : "font-semibold text-white"}`}>{m.subject}</p>
            <p className="text-[11px] text-[#9aa0a6] truncate">{m.snippet}</p>
          </div>
        </div>
      ))}
    </div>
  );
}