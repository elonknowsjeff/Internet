import React, { useState } from "react";
import { Send, Loader2, User } from "lucide-react";

const ago = (iso) => {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (!Number.isFinite(d)) return "now";
  if (d < 60) return "now";
  if (d < 3600) return `${Math.floor(d / 60)}m`;
  if (d < 86400) return `${Math.floor(d / 3600)}h`;
  return `${Math.floor(d / 86400)}d`;
};

export default function NewsComments({ comments = [], me, onSend }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || busy || !me) return;
    setBusy(true);
    try {
      await onSend(text.trim());
      setText("");
    } catch {}
    setBusy(false);
  };

  return (
    <div className="px-4 pb-3 pt-1 bg-white/[0.02] border-b border-white/[0.06] animate-slide-up">
      {me ? (
        <form onSubmit={send} className="flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/10 px-3 h-9 focus-within:border-[color:var(--brand)]/60">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add your take on this story…"
            className="flex-1 min-w-0 bg-transparent outline-none text-[12.5px] placeholder-white/35"
          />
          <button type="submit" disabled={!text.trim() || busy} className="shrink-0 text-white/60 hover:text-white disabled:opacity-30">
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </form>
      ) : (
        <p className="text-[11.5px] text-white/40">Sign in to join the conversation.</p>
      )}

      {comments.length === 0 ? (
        <p className="mt-2 text-[11.5px] text-white/35">No comments yet — start the thread.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {comments.slice(0, 8).map((c) => (
            <li key={c.id} className="flex gap-2">
              <span className="w-6 h-6 rounded-full overflow-hidden bg-white/10 grid place-items-center shrink-0">
                {c.author_avatar ? <img src={c.author_avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-3 h-3 text-white/50" />}
              </span>
              <div className="min-w-0">
                <p className="text-[11.5px] text-white/70">
                  <b className="text-white">{c.author_name || "Member"}</b> @{c.author_handle || "user"} · {ago(c.created_date)}
                </p>
                <p className="text-[12.5px] text-white/85 break-words">{c.text}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}