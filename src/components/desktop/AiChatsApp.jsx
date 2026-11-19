import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Sparkles, Plus, Loader2, MessageSquare, ExternalLink } from "lucide-react";

export default function AiChatsApp() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.ChatThread.list("-created_date", 40)
      .then((list) => {
        setThreads(list);
        setActiveId(list[0]?.id || "");
      })
      .catch(() => setThreads([]))
      .finally(() => setLoading(false));
  }, []);

  const active = threads.find((t) => t.id === activeId);
  const messages = active?.messages || [];

  return (
    <div className="flex h-full min-h-0">
      <aside className="flex w-[176px] shrink-0 flex-col border-r border-white/[0.07]">
        <button
          onClick={() => navigate("/assistant")}
          className="m-2 flex items-center justify-center gap-1.5 rounded-lg brand-grad py-1.5 text-[11.5px] font-bold text-black"
        >
          <Plus className="h-3.5 w-3.5" /> New chat
        </button>
        <div className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-2">
          {loading ? (
            <div className="flex items-center gap-1.5 px-2 py-2 text-[11px] text-white/40"><Loader2 className="h-3 w-3 animate-spin" /> Loading chats…</div>
          ) : threads.length === 0 ? (
            <p className="px-2 py-2 text-[11px] text-white/35">No saved chats yet.</p>
          ) : (
            threads.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                className={`mb-0.5 flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[11.5px] transition-colors ${activeId === t.id ? "bg-white/[0.1] font-semibold text-white" : "text-white/55 hover:bg-white/[0.06]"}`}
              >
                <MessageSquare className="h-3 w-3 shrink-0 text-white/35" />
                <span className="min-w-0 flex-1 truncate">{t.title || "Untitled chat"}</span>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-white/[0.07] px-3 py-2">
          <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--brand)" }} />
          <span className="min-w-0 flex-1 truncate text-[12px] font-semibold">{active?.title || "AI chats"}</span>
          <button onClick={() => navigate("/assistant")} title="Open the full assistant" className="grid h-6 w-6 place-items-center rounded-md text-white/45 hover:bg-white/10 hover:text-white">
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          {messages.length === 0 ? (
            <p className="py-8 text-center text-[11.5px] text-white/35">Pick a chat on the left to read it.</p>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[86%] rounded-xl px-2.5 py-1.5 text-[11.5px] leading-relaxed ${m.role === "user" ? "ml-auto brand-grad text-black" : "border border-white/[0.08] bg-white/[0.05] text-white/80"}`}
              >
                {m.content}
                {m.image_url && <img src={m.image_url} alt="" className="mt-1.5 w-full rounded-lg" />}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}