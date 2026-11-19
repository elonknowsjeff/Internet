import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Send, Loader2, Check } from "lucide-react";

export default function ComposeDialog({ user, onClose, onSent, initial }) {
  const [to, setTo] = useState(initial?.to || "");
  const [subject, setSubject] = useState(initial?.subject || "");
  const [body, setBody] = useState(initial?.body || "");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const send = async (e) => {
    e.preventDefault();
    if (!to.trim() || !subject.trim() || busy) return;
    setBusy(true); setErr("");
    try {
      await base44.integrations.Core.SendEmail({ to: to.trim(), subject: subject.trim(), body: body.trim() || "(no body)", from_name: user?.full_name || "Walza Plus" });
      const msg = {
        id: `s${Date.now()}`,
        folder: "sent",
        from_name: "You",
        from_email: user?.email || "you@walzaplus.app",
        to_email: to.trim(),
        to_name: to.trim().split("@")[0],
        subject: subject.trim(),
        snippet: (body.trim() || "(no body)").slice(0, 110),
        body: body.trim() || "(no body)",
        date: Date.now(),
        read: true,
        starred: false,
      };
      setSent(true);
      onSent?.(msg);
      setTimeout(() => onClose(), 700);
    } catch (e2) {
      setErr("Couldn't send that. Registered Walza Plus users are always reachable; outside addresses need a paid plan with a connected domain.");
    }
    setBusy(false);
  };

  const field = "w-full bg-[#1f1f1f] border border-white/10 rounded px-3 py-2 outline-none focus:border-[#66c0f4] text-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <form onSubmit={send} className="relative w-full sm:max-w-xl bg-[#2b2b2b] rounded-t-xl sm:rounded-xl border border-white/15 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-[#1f1f1f] border-b border-white/10">
          <p className="text-sm font-semibold">New message</p>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-3 space-y-2">
          <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Recipients" type="email" className={field} />
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className={field} />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={9} placeholder="Write your message…" className={`${field} resize-none`} />
        </div>
        <div className="flex items-center gap-2 px-3 pb-3">
          <button type="submit" disabled={busy || !to.trim() || !subject.trim()} className="px-5 py-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 text-black font-bold text-sm flex items-center gap-2 disabled:opacity-40">
            {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Send</>}
          </button>
          {sent && <span className="text-xs text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Sent</span>}
          {err && <span className="text-xs text-rose-300">{err}</span>}
        </div>
      </form>
    </div>
  );
}