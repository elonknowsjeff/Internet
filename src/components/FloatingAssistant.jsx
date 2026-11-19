import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useSettings } from "@/components/SettingsContext";
import { Sparkles, Send, X, Image as ImageIcon, Loader2, Trash2, Video, History, Plus, MessageSquare } from "lucide-react";
import { Image as ContentImage } from "@/components/ui/image";

const GREETING = { role: "assistant", content: "Hey — I'm XSI AI. Ask me anything, or tap the picture or video button to generate media with XSI AI." };

// The assistant helps with the task in front of you: starters follow the page you're on.
const PAGE_PROMPTS = {
  "/": ["Summarize my feed", "Write a post about my day", "Find people to follow"],
  "/news": ["Summarize today's top story", "Explain this in simple terms", "Business headlines"],
  "/studio": ["Ideas for my next post", "Write a caption for my photo", "Plan a week of content"],
  "/music": ["Recommend something to listen to", "Write lyrics for a chill track", "Name my playlist"],
  "/video": ["Ideas for my next video", "Write a title and description", "Summarize this video"],
  "/movies": ["What should I watch tonight?", "Movies like my favourites", "Write a short review"],
  "/eats": ["What should I order tonight?", "Highest rated place near me", "Compare delivery times"],
  "/rides": ["Estimate a ride to the airport", "Cheapest way across town", "Plan my route"],
  "/hotels": ["Find a hotel this weekend", "Cheap stays downtown", "What's a fair nightly rate?"],
  "/flights": ["Find cheap flights next month", "Best time to book", "Compare two routes"],
  "/finance": ["Explain the market today", "Compare two stocks", "Build me a watchlist"],
  "/desktop": ["Plan my day", "Summarize my notes", "Draft a task list"],
  "/settings": ["How do I change my background?", "Explain these settings", "Reset my preferences"],
};
const FALLBACK_PROMPTS = ["Today's top stories", "Write a caption for my photo", "Plan my weekend"];

const newChat = () => ({ id: `c${Date.now()}`, title: "New chat", messages: [GREETING], updated: Date.now() });

export default function FloatingAssistant() {
  const { settings, update } = useSettings();
  const { pathname } = useLocation();
  const prompts = PAGE_PROMPTS[pathname] || FALLBACK_PROMPTS;
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [chats, setChats] = useState([newChat()]);
  const [activeId, setActiveId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [imgBusy, setImgBusy] = useState(false);
  const [vidBusy, setVidBusy] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { base44.auth.me().then((u) => setUserId(u?.id || "guest")).catch(() => setUserId("guest")); }, []);

  // Load saved conversations for this user
  useEffect(() => {
    if (!userId) return;
    try {
      const raw = localStorage.getItem(`walza_ai_chats_${userId}`);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length) {
          setChats(arr);
          setActiveId(arr[0].id);
          return;
        }
      }
      const legacy = localStorage.getItem(`walza_ai_chat_${userId}`);
      const first = newChat();
      if (legacy) {
        const msgs = JSON.parse(legacy);
        if (Array.isArray(msgs) && msgs.length) { first.messages = msgs; first.title = msgs.find((m) => m.role === "user")?.content?.slice(0, 40) || "Earlier chat"; }
      }
      setChats([first]);
      setActiveId(first.id);
    } catch {}
  }, [userId]);

  useEffect(() => {
    if (!userId || !activeId) return;
    try { localStorage.setItem(`walza_ai_chats_${userId}`, JSON.stringify(chats)); } catch {}
  }, [chats, userId, activeId]);

  const active = chats.find((c) => c.id === activeId) || chats[0];
  const messages = active?.messages || [GREETING];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy, imgBusy, vidBusy, open, activeId]);

  if (settings.hideFloatingAssistant) return null;

  const push = (msg) =>
    setChats((cs) => cs.map((c) => {
      if (c.id !== (activeId || active?.id)) return c;
      const msgs = [...c.messages, msg];
      const firstUser = msgs.find((m) => m.role === "user");
      return { ...c, messages: msgs, title: firstUser ? firstUser.content.slice(0, 42) : c.title, updated: Date.now() };
    }));

  const send = async (text) => {
    const t = (text ?? input).trim();
    if (!t || busy) return;
    push({ role: "user", content: t });
    setInput("");
    setBusy(true);
    try {
      const history = messages
        .filter((m) => m.content && !m.image && !m.video)
        .slice(-8)
        .map((m) => `${m.role === "user" ? "User" : "XSI AI"}: ${m.content}`)
        .join("\n");
      const prompt = `You are XSI AI, the assistant built into XSI — a social and services super-app with a Feed, Messages, News, Music, Movies, Video, Gaming, Eats, Rides, Flights, Hotels, Cloud and AI studios. Today is ${new Date().toDateString()}.

How to answer:
- Lead with the answer in the first line, then only the detail that earns its place. Never restate the question or pad with pleasantries.
- Use live web context whenever the answer depends on current facts, people, prices, schedules or news, and name where the information comes from.
- Plain text only: no markdown symbols or asterisks. Short paragraphs and hyphen lines.
- This is a narrow chat panel, so aim for 60-160 words unless the user asks for depth.
- If the request is ambiguous, pick the most sensible reading, answer, and note the assumption in one short clause.

Conversation so far:
${history}

User: ${t}
XSI AI:`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt, add_context_from_internet: true, model: "gemini_3_flash" });
      const out = typeof res === "string" ? res : res?.output || res?.text || JSON.stringify(res);
      push({ role: "assistant", content: out });
    } catch (e) {
      push({ role: "assistant", content: "Sorry, I couldn't reach the model right now." });
    } finally { setBusy(false); }
  };

  const genImage = async () => {
    const t = input.trim();
    if (!t || imgBusy) return;
    push({ role: "user", content: `🎨 Generate an image: ${t}` });
    setInput("");
    setImgBusy(true);
    try {
      const res = await base44.integrations.Core.GenerateImage({ prompt: t });
      push({ role: "assistant", content: "Here's the image I made for you:", image: res?.url });
    } catch (e) {
      push({ role: "assistant", content: "I couldn't generate that image right now." });
    } finally { setImgBusy(false); }
  };

  const genVideo = async () => {
    const t = input.trim();
    if (!t || vidBusy) return;
    push({ role: "user", content: `🎬 Generate a video: ${t}` });
    setInput("");
    setVidBusy(true);
    try {
      const res = await base44.integrations.Core.GenerateVideo({ prompt: t, duration: 6, aspect_ratio: "16:9", generate_audio: true });
      push({ role: "assistant", content: "Here's your video:", video: res?.url });
    } catch (e) {
      push({ role: "assistant", content: "I couldn't generate that video right now." });
    } finally { setVidBusy(false); }
  };

  const startNew = () => {
    const c = newChat();
    setChats((cs) => [c, ...cs]);
    setActiveId(c.id);
    setShowHistory(false);
  };

  const deleteChat = (id) => {
    setChats((cs) => {
      const left = cs.filter((c) => c.id !== id);
      if (!left.length) { const c = newChat(); setActiveId(c.id); return [c]; }
      if (id === activeId) setActiveId(left[0].id);
      return left;
    });
  };

  return (
    <>
      <div className="fixed bottom-24 left-4 z-50 lg:left-[92px]">
        <button onClick={() => setOpen((o) => !o)} title="XSI AI" className="w-14 h-14 rounded-full brand-grad text-black flex items-center justify-center shadow-2xl shadow-fuchsia-500/30 hover:scale-105 transition-transform">
          <Sparkles className="w-6 h-6" />
        </button>
        <button onClick={() => update({ hideFloatingAssistant: true })} title="Hide assistant" className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#2a2152] border border-white/25 flex items-center justify-center text-white/70 hover:bg-rose-500 hover:border-rose-500">
          <X className="w-3 h-3" />
        </button>
      </div>

      {open && (
        <div className="fixed bottom-44 left-4 z-50 w-[92vw] max-w-sm h-[64vh] flex flex-col glass-card bg-[#2a2152]/85 overflow-hidden shadow-2xl animate-slide-up lg:left-[92px]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/15">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg brand-grad flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold">XSI AI</p>
                <p className="text-[10px] text-emerald-300 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> Online · chats saved</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={startNew} title="New chat" className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center text-white/70 hover:text-white"><Plus className="w-4 h-4" /></button>
              <button onClick={() => setShowHistory((v) => !v)} title="Past chats" className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center text-white/70 hover:text-white"><History className="w-4 h-4" /></button>
              <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
          </div>

          {showHistory ? (
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <p className="px-2 py-1 text-[11px] uppercase tracking-wider text-white/45">Past chats ({chats.length})</p>
              {chats.map((c) => (
                <div key={c.id} className={`flex items-center gap-2 px-2 py-2 rounded-xl ${c.id === activeId ? "bg-white/15" : "hover:bg-white/10"}`}>
                  <button onClick={() => { setActiveId(c.id); setShowHistory(false); }} className="flex-1 text-left min-w-0">
                    <p className="text-sm truncate flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-fuchsia-300 shrink-0" /> {c.title}</p>
                    <p className="text-[10px] text-white/45">{c.messages.length} messages</p>
                  </button>
                  <button onClick={() => deleteChat(c.id)} className="text-white/40 hover:text-rose-300"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          ) : (
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 p-3">
              {messages.length <= 1 && (
                <div className="flex flex-wrap gap-1.5">
                  {prompts.map((s) => (
                    <button key={s} onClick={() => send(s)} className="rounded-full border border-white/[0.12] bg-white/[0.06] px-2.5 py-1 text-[11px] text-white/60 transition-colors hover:bg-white/[0.12] hover:text-white">{s}</button>
                  ))}
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${m.role === "user" ? "brand-grad text-black" : "bg-white/10 border border-white/15"}`}>
                    {m.content}
                    {m.image && <div className="mt-2 rounded-xl overflow-hidden"><ContentImage src={m.image} alt="generated" className="w-full" fittingType="fit" /></div>}
                    {m.video && <video src={m.video} controls className="mt-2 rounded-xl w-full" />}
                  </div>
                </div>
              ))}
              {(busy || imgBusy || vidBusy) && (
                <div className="flex justify-start">
                  <div className="px-3 py-2 rounded-2xl bg-white/10 border border-white/15 flex items-center gap-2 text-xs text-white/70">
                    {imgBusy ? <><Loader2 className="w-4 h-4 animate-spin text-fuchsia-300" /> Generating image…</>
                      : vidBusy ? <><Loader2 className="w-4 h-4 animate-spin text-fuchsia-300" /> Rendering video (up to a minute)…</>
                      : <><span className="w-2 h-2 rounded-full bg-cyan-300 animate-bounce" /><span className="w-2 h-2 rounded-full bg-fuchsia-300 animate-bounce" style={{ animationDelay: "0.1s" }} /><span className="w-2 h-2 rounded-full bg-cyan-300 animate-bounce" style={{ animationDelay: "0.2s" }} /></>}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-white/5 border-t border-white/15 px-3 py-2">
            <button onClick={genImage} disabled={imgBusy || !input.trim()} title="Generate an image" className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center disabled:opacity-40 hover:border-fuchsia-300">
              {imgBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4 text-fuchsia-300" />}
            </button>
            <button onClick={genVideo} disabled={vidBusy || !input.trim()} title="Generate a video" className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center disabled:opacity-40 hover:border-fuchsia-300">
              {vidBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4 text-cyan-300" />}
            </button>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask anything…" className="flex-1 bg-transparent outline-none text-sm placeholder-white/40" />
            <button onClick={() => send()} disabled={busy || !input.trim()} className="w-9 h-9 rounded-full brand-grad text-black flex items-center justify-center disabled:opacity-40">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}