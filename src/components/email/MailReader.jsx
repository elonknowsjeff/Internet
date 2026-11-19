import React from "react";
import { Star, Trash2, MailOpen, ArrowLeft, Reply } from "lucide-react";
import { fmtWhen, initials } from "./mailData";

export default function MailReader({ message, onClose, onStar, onTrash, onUnread, onReply }) {
  if (!message) {
    return (
      <div className="hidden lg:flex flex-col items-center justify-center h-full text-center px-8 text-[#9aa0a6]">
        <MailOpen className="w-12 h-12 mb-3 opacity-40" />
        <p className="text-sm">Select a message to read it here.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full bg-[#1f1f1f]">
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-white/10">
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center lg:hidden"><ArrowLeft className="w-4 h-4" /></button>
        <button onClick={() => onUnread(message)} title="Mark unread" className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"><MailOpen className="w-4 h-4" /></button>
        <button onClick={() => onTrash(message)} title="Delete" className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
        <button onClick={() => onStar(message)} title="Star" className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center">
          <Star className={`w-4 h-4 ${message.starred ? "fill-amber-400 text-amber-400" : ""}`} />
        </button>
        <span className="ml-auto text-xs text-[#9aa0a6]">{fmtWhen(message.date)}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold leading-snug">{message.subject}</h2>
        <div className="flex items-center gap-2.5 mt-4">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-black font-bold text-xs flex items-center justify-center shrink-0">
            {initials(message.from_name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{message.from_name}</p>
            <p className="text-xs text-[#9aa0a6] truncate">{message.from_email}</p>
          </div>
          <span className="ml-auto text-[11px] text-[#9aa0a6]">{message.folder === "sent" ? "Sent" : "to me"}</span>
        </div>
        <div className="mt-5 text-sm leading-relaxed whitespace-pre-wrap text-[#e3e3e3]">{message.body}</div>
        <div className="mt-6 flex items-center gap-2">
          <button onClick={() => onReply?.(message)} className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/15 text-sm hover:bg-white/10">
            <Reply className="w-4 h-4" /> Reply
          </button>
        </div>
      </div>
    </div>
  );
}