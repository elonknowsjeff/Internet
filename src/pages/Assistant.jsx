import React, { useRef, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Sparkles, MessageSquare, ImagePlus, Loader2, Menu, Plus } from "lucide-react";
import ThreadSidebar from "@/components/assistant/ThreadSidebar";

const WELCOME = {
  role: "assistant",
  content: "Hey, I'm Internet X AI — ask me anything, or switch to Create image and describe a picture you want.",
};

const askModel = async (prompt) => {
  try {
    return await base44.integrations.Core.InvokeLLM({ prompt, add_context_from_internet: true, model: "gemini_3_flash" });
  } catch {
    return await base44.integrations.Core.InvokeLLM({ prompt });
  }
};

const SUGGESTIONS = [
  "What's trending in tech right now?",
  "Summarize today's world news",
  "Plan a 3-day trip to Tokyo",
  "Create an image of a neon city at night",
];

export default function Assistant() {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState("chat");
  const [user, setUser] = useState(null);
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, busy]);

  useEffect(() => {
    base44.auth.me().then((u) => { setUser(u); loadThreads(); }).catch(() => {});
  }, []);

  const loadThreads = async () => {
    try {
      const rows = await base44.entities.ChatThread.list("-updated_date", 60);
      setThreads(Array.isArray(rows) ? rows : rows?.items || []);
    } catch { setThreads([]); }
  };

  const persist = async (list, threadId) => {
    if (!user) return;
    const firstUser = list.find((m) => m.role === "user");
    const last = list[list.length - 1];
    const title = (firstUser?.content || "New chat").slice(0, 70);
    const preview = (last?.content || (last?.image_url ? "AI image" : "")).slice(0, 140);
    try {
      if (threadId) {
        await base44.entities.ChatThread.update(threadId, { messages: list, title, preview });
      } else {
        const rec = await base44.entities.ChatThread.create({ messages: list, title, preview });
        setActiveId(rec.id);
      }
      loadThreads();
    } catch {}
  };

  const send = async (text) => {
    const t = (text ?? input).trim();
    if (!t || busy) return;
    setInput("");
    const next = [...messages, { role: "user", content: t }];
    setMessages(next);
    setBusy(true);

    let out;
    try {
      if (mode === "image") {
        const res = await base44.integrations.Core.GenerateImage({ prompt: t });
        out = res?.url
          ? { role: "assistant", content: `Here's your image for “${t}”.`, image_url: res.url }
          : { role: "assistant", content: "I couldn't create that image — try describing it differently." };
      } else {
        const prompt = `You are Internet X AI, a friendly, concise assistant built into the Internet X super-app. Current date: November 21, 2026. Answer helpfully and concisely.\n\nUser: ${t}`;
        const res = await askModel(prompt);
        const text = typeof res === "string" ? res : res?.output || res?.text || JSON.stringify(res);
        out = { role: "assistant", content: text };
      }
    } catch (e) {
      out = { role: "assistant", content: `I couldn't get an answer just now (${e?.message || "connection error"}). Please try that again.` };
    }

    const final = [...next, out];
    setMessages(final);
    setBusy(false);
    persist(final, activeId);
  };

  const openThread = (t) => {
    setActiveId(t.id);
    setMessages(Array.isArray(t.messages) && t.messages.length ? t.messages : [WELCOME]);
    setHistoryOpen(false);
  };

  const newChat = () => {
    setActiveId(null);
    setMessages([WELCOME]);
    setHistoryOpen(false);
    setInput("");
  };

  const deleteThread = async (t) => {
    try { await base44.entities.ChatThread.delete(t.id); } catch {}
    if (activeId === t.id) newChat();
    loadThreads();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 pb-28 flex flex-col h-[calc(100dvh-1.5rem)]">
      <header className="flex items-center gap-2.5 px-1 pb-3">
        <button onClick={() => setHistoryOpen((v) => !v)} className="md:hidden w-9 h-9 rounded-xl hover:bg-white/10 grid place-items-center">
          <Menu className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <span className="grid w-8 h-8 place-items-center rounded-lg" style={{ background: "color-mix(in srgb, var(--brand) 18%, transparent)" }}>
            <Sparkles className="w-4 h-4" style={{ color: "var(--brand)" }} />
          </span>
          <div className="leading-none">
            <h1 className="text-[16px] font-semibold tracking-tight">Internet X AI</h1>
            <p className="text-[10.5px] text-white/40 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
            </p>
          </div>
        </div>
        <div className="flex-1" />
        <button
          onClick={newChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 text-[12px] font-medium text-white/70"
        >
          <Plus className="w-3.5 h-3.5" /> New chat
        </button>
      </header>

      <div className="flex-1 min-h-0 grid md:grid-cols-[220px_1fr] gap-3">
        <div className="hidden md:block min-h-0">
          <ThreadSidebar
            threads={threads}
            activeId={activeId}
            onSelect={openThread}
            onNew={newChat}
            onDelete={deleteThread}
          />
        </div>

        <div className="flex flex-col min-h-0 rounded-2xl bg-white/[0.025] border border-white/[0.07] overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5 thin-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "user" ? (
                  <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-sm text-[14px] leading-relaxed whitespace-pre-wrap bg-white/[0.07] text-white/90">
                    {m.content}
                  </div>
                ) : (
                  <div className="max-w-[88%] text-[14px] leading-relaxed whitespace-pre-wrap text-white/85">
                    {m.content}
                    {m.image_url && (
                      <img
                        src={m.image_url}
                        alt="AI generated"
                        className="mt-3 rounded-xl w-full max-w-[380px] border border-white/10"
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="flex gap-1.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0.12s" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0.24s" }} />
                </div>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 px-4 sm:px-6 pb-3">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-[12px] px-3 py-1.5 rounded-full border border-white/10 hover:border-white/25 hover:bg-white/[0.04] text-white/70 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-white/[0.06] px-3 sm:px-4 py-3">
            <div className="flex items-center gap-1 mb-2">
              {[
                { key: "chat", label: "Chat", Icon: MessageSquare },
                { key: "image", label: "Create image", Icon: ImagePlus },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-medium transition-colors ${mode === m.key ? "text-white" : "text-white/45 hover:text-white/70"}`}
                  style={mode === m.key ? { background: "color-mix(in srgb, var(--brand) 16%, transparent)" } : {}}
                >
                  <m.Icon className="w-3.5 h-3.5" /> {m.label}
                </button>
              ))}
              {busy && (
                <span className="ml-auto text-[11px] text-white/35 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> {mode === "image" ? "Painting…" : "Thinking…"}
                </span>
              )}
            </div>
            <div className="flex items-end gap-2 bg-white/[0.05] border border-white/10 rounded-2xl px-3 py-2 focus-within:border-white/25 transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                rows={1}
                placeholder={mode === "image" ? "Describe the image you want…" : "Ask Internet X AI…"}
                className="flex-1 min-w-0 bg-transparent outline-none text-sm py-1.5 placeholder-white/35 resize-none max-h-32"
              />
              <button
                onClick={() => send()}
                disabled={busy || !input.trim()}
                className="shrink-0 w-9 h-9 rounded-xl grid place-items-center transition-colors disabled:opacity-30"
                style={{ background: "var(--brand)", color: "#000" }}
              >
                {mode === "image" ? <ImagePlus className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {historyOpen && (
        <div className="md:hidden fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm p-4" onClick={() => setHistoryOpen(false)}>
          <div className="h-full max-h-[70vh]" onClick={(e) => e.stopPropagation()}>
            <ThreadSidebar
              threads={threads}
              activeId={activeId}
              onSelect={openThread}
              onNew={newChat}
              onDelete={deleteThread}
              onClose={() => setHistoryOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}