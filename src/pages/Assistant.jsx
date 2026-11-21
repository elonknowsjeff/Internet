import React, { useRef, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Sparkles, MessageSquare, ImagePlus, Loader2, Menu } from "lucide-react";
import ThreadSidebar from "@/components/assistant/ThreadSidebar";

const WELCOME = {
  role: "assistant",
  content: "Hey, I'm Internet X AI — ask me anything, or switch to Create image and describe a picture you want.",
};

// Live web answers need the web-capable model; if that call is refused, fall back
// to a plain completion instead of failing the whole reply.
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
      <header className="bg-white/[0.045] backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 mb-3 flex items-center gap-2.5">
        <button onClick={() => setHistoryOpen((v) => !v)} className="md:hidden w-9 h-9 rounded-xl bg-white/[0.07] grid place-items-center">
          <Menu className="w-4 h-4" />
        </button>
        <div className="w-9 h-9 rounded-xl brand-grad flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-black" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-[17px] font-bold font-display leading-none">Internet X AI</h1>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Chat, search & image generation
          </p>
        </div>
        <button
          onClick={newChat}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.07] border border-white/10 text-[12px] font-semibold hover:bg-white/15"
        >
          <MessageSquare className="w-3.5 h-3.5" /> New chat
        </button>
      </header>

      <div className="flex-1 min-h-0 grid md:grid-cols-[240px_1fr] gap-3">
        <div className="hidden md:block min-h-0">
          <ThreadSidebar
            threads={threads}
            activeId={activeId}
            onSelect={openThread}
            onNew={newChat}
            onDelete={deleteThread}
          />
        </div>

        <div className="flex flex-col min-h-0 rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-3 thin-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
                <div
                  className={`max-w-[88%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "brand-grad text-black font-medium rounded-br-md"
                      : "bg-white/[0.06] border border-white/10 rounded-bl-md"
                  }`}
                >
                  {m.content}
                  {m.image_url && (
                    <img
                      src={m.image_url}
                      alt="AI generated"
                      className="mt-2 rounded-xl w-full max-w-[360px] border border-white/10"
                    />
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl bg-white/[0.06] border border-white/10 flex gap-1">
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--brand)" }} />
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--brand)", animationDelay: "0.1s" }} />
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--brand)", animationDelay: "0.2s" }} />
                </div>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 px-3 sm:px-5 pb-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-[11.5px] px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 hover:border-[color:var(--brand)] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-white/[0.08] px-3 sm:px-4 py-2.5">
            <div className="flex items-center gap-1 mb-2">
              {[
                { key: "chat", label: "Chat", Icon: MessageSquare },
                { key: "image", label: "Create image", Icon: ImagePlus },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold transition-colors ${mode === m.key ? "bg-white text-black" : "text-white/55 hover:bg-white/10"}`}
                >
                  <m.Icon className="w-3.5 h-3.5" /> {m.label}
                </button>
              ))}
              {busy && (
                <span className="ml-auto text-[11px] text-white/40 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> {mode === "image" ? "Painting…" : "Thinking…"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-full px-3.5 py-2 focus-within:border-[color:var(--brand)]/60">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={mode === "image" ? "Describe the image you want…" : "Ask Internet X AI…"}
                className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder-white/35"
              />
              <button
                onClick={() => send()}
                disabled={busy || !input.trim()}
                className="w-9 h-9 rounded-full brand-grad text-black flex items-center justify-center disabled:opacity-40"
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