import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Sparkles, Loader2, Trash2 } from "lucide-react";

const SEED = {
  id: "seed",
  role: "ai",
  content: "Hey, I'm Valo AI. Ask me anything — write a caption, plan a trip, fix a sentence, or find your way around the app.",
};

export default function WalzaAiChat() {
  const [msgs, setMsgs] = useState([SEED]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [msgs, busy]);

  const send = async () => {
    const text = draft.trim();
    if (!text || busy) return;
    setDraft("");
    const next = [...msgs, { id: `u${Date.now()}`, role: "user", content: text }];
    setMsgs(next);
    setBusy(true);
    try {
      const convo = next.slice(-8).map((m) => `${m.role === "user" ? "User" : "Valo AI"}: ${m.content}`).join("\n");
      const res = await base44.integrations.Core.InvokeLLM({
        prompt:
          "You are Valo AI, the assistant built into Super Internet — a social and services app with a Feed, Messages, Music, Movies, Video, Gaming, Mail, Cloud, Eats, Rides, Flights and Hotels.\n" +
          "Be warm, concise and practical. Answer in the language the user writes in. Keep replies under 120 words unless asked for detail.\n\n" +
          `Conversation so far:\n${convo}\n\nReply as Valo AI:`,
      });
      const answer = typeof res === "string" ? res : res?.response || res?.text || "";
      setMsgs((m) => [...m, { id: `a${Date.now()}`, role: "ai", content: answer.trim() || "I didn't catch that — try asking again." }]);
    } catch (e) {
      setMsgs((m) => [...m, { id: `e${Date.now()}`, role: "ai", content: "I can't reach the AI service right now. Try again in a moment." }]);
    } finally {
      setBusy(false);
    }
  };

  const clearChat = () => {
    if (busy) return;
    if (!confirm("Delete this AI chat? Your conversation will be cleared.")) return;
    setMsgs([SEED]);
    setDraft("");
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-end px-3 py-1.5 border-b border-white/[0.06] shrink-0">
        <button
          onClick={clearChat}
          disabled={msgs.length <= 1 || busy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold text-white/45 hover:text-rose-300 hover:bg-rose-500/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white/45"
        >
          <Trash2 className="w-3 h-3" /> Delete chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5 thin-scrollbar">
        {msgs.map((m) => {
          const mine = m.role === "user";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"} gap-2`}>
              {!mine && (
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-fuchsia-400 to-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                </span>
              )}
              <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${mine ? "bg-[linear-gradient(100deg,#fbbf24,#e879f9)] text-black rounded-br-sm" : "bg-white/10 text-white/90 rounded-bl-sm"}`}>
                {m.content}
              </div>
            </div>
          );
        })}
        {busy && (
          <div className="flex items-center gap-2 text-xs text-white/45 pl-9">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Valo AI is thinking…
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-3 border-t border-white/10 flex items-end gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          rows={1}
          placeholder="Ask Valo AI anything…"
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 outline-none text-sm resize-none max-h-28 focus:border-fuchsia-400/60"
        />
        <button onClick={send} disabled={!draft.trim() || busy} className="w-10 h-10 rounded-full bg-[linear-gradient(100deg,#fbbf24,#e879f9)] text-black flex items-center justify-center disabled:opacity-40 shrink-0">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}