import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Plus, MessageSquare, ArrowLeft, X, Loader2, Search, Send, Hash, Users, Circle,
} from "lucide-react";

const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);
const nameOf = (u) => u?.display_name || u?.full_name || (u?.email ? u.email.split("@")[0] : "You");
const handleOf = (u) => u?.username || (u?.email ? u.email.split("@")[0] : "");
const avatarOf = (u) => u?.avatar || `https://i.pravatar.cc/120?u=${u?.id || "you"}`;
const EMOJIS = ["💬", "🎵", "🎮", "📰", "💻", "🏀", "🚀", "🎨", "🎬", "📚"];

export default function Chats() {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", emoji: "💬" });
  const [query, setQuery] = useState("");
  const scrollRef = useRef(null);

  const loadRooms = async () => {
    try {
      const list = asItems(await base44.entities.ChatRoom.filter({ is_live: true }, { sort: "-created_date", limit: 60 }));
      setRooms(list);
    } catch { setRooms([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    loadRooms();
    const unsub = base44.entities.ChatRoom?.subscribe?.(() => loadRooms());
    return () => { if (typeof unsub === "function") unsub(); };
  }, []);

  const loadMessages = async (roomId) => {
    try {
      const list = asItems(await base44.entities.ChatMessage.filter({ room_id: roomId }, { sort: "created_date", limit: 200 }));
      setMessages(list);
    } catch { setMessages([]); }
  };

  useEffect(() => {
    if (!active) { setMessages([]); return; }
    loadMessages(active.id);
    const unsub = base44.entities.ChatMessage?.subscribe?.((e) => {
      if (!e) return;
      const m = e.data;
      if (e.type === "create" && m?.room_id === active.id) {
        setMessages((prev) => prev.some((x) => x.id === m.id) ? prev : [...prev, m]);
      } else if (e.type === "delete") {
        setMessages((prev) => prev.filter((x) => x.id !== m.id));
      } else {
        loadMessages(active.id);
      }
    });
    return () => { if (typeof unsub === "function") unsub(); };
  }, [active?.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  const createRoom = async () => {
    if (!form.title.trim() || !user) return;
    const room = await base44.entities.ChatRoom.create({
      title: form.title.trim(),
      description: form.description.trim(),
      emoji: form.emoji,
      host_name: nameOf(user),
      host_handle: handleOf(user),
      host_avatar: avatarOf(user),
      is_live: true,
      member_count: 1,
    });
    setForm({ title: "", description: "", emoji: "💬" });
    setCreating(false);
    setActive(room);
    loadRooms();
  };

  const joinRoom = async (room) => {
    setActive(room);
    try {
      await base44.entities.ChatRoom.update(room.id, { member_count: (room.member_count || 0) + 1 }).catch(() => {});
    } catch {}
    loadRooms();
  };

  const leaveRoom = () => setActive(null);

  const endRoom = async () => {
    if (!active || active.created_by_id !== user?.id) { leaveRoom(); return; }
    await base44.entities.ChatMessage.deleteMany({ room_id: active.id }).catch(() => {});
    await base44.entities.ChatRoom.update(active.id, { is_live: false }).catch(() => {});
    setActive(null);
    loadRooms();
  };

  const send = async (e) => {
    e?.preventDefault();
    const content = text.trim();
    if (!content || !user || !active) return;
    setText("");
    const msg = await base44.entities.ChatMessage.create({
      room_id: active.id,
      content,
      author_name: nameOf(user),
      author_handle: handleOf(user),
      author_avatar: avatarOf(user),
    });
    setMessages((prev) => prev.some((x) => x.id === msg.id) ? prev : [...prev, msg]);
  };

  const q = query.trim().toLowerCase();
  const filtered = rooms.filter((r) => !q || `${r.title} ${r.description} ${r.host_name}`.toLowerCase().includes(q));

  if (active) {
    return (
      <div className="mx-auto flex h-[calc(100dvh-88px)] max-w-[680px] flex-col px-3 sm:px-4">
        <header className="flex items-center gap-3 border-b border-white/10 py-3">
          <button onClick={leaveRoom} className="w-9 h-9 rounded-full hover:bg-white/10 grid place-items-center shrink-0"><ArrowLeft className="w-5 h-5" /></button>
          <span className="text-2xl">{active.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--brand)" }}><Circle className="w-2 h-2 fill-current animate-pulse" /> Live chat</p>
            <h1 className="truncate text-[15px] font-bold leading-tight">{active.title}</h1>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-white/45"><Users className="w-3.5 h-3.5" /> {active.member_count || 1}</span>
          {active.created_by_id === user?.id && (
            <button onClick={endRoom} className="px-2.5 py-1.5 rounded-full text-[11px] font-bold text-rose-300 border border-rose-400/40 hover:bg-rose-500/10">End</button>
          )}
        </header>

        <div ref={scrollRef} className="flex-1 min-h-0 space-y-2 overflow-y-auto py-3 thin-scrollbar">
          {messages.length === 0 ? (
            <div className="grid h-full place-items-center text-center text-[12.5px] text-white/40">
              <div>
                <Hash className="mx-auto mb-2 h-8 w-8 text-white/20" />
                <p>No messages yet — say hi 👋</p>
              </div>
            </div>
          ) : messages.map((m) => {
            const mine = m.created_by_id === user?.id;
            return (
              <div key={m.id} className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                <img src={m.author_avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                <div className={`max-w-[78%] rounded-2xl px-3 py-2 ${mine ? "rounded-br-sm text-black" : "rounded-bl-sm bg-white/[0.06] text-white"}`} style={mine ? { background: "var(--brand)" } : {}}>
                  {!mine && <p className="text-[10.5px] font-bold text-white/55 mb-0.5">{m.author_name}</p>}
                  <p className="text-[13px] leading-snug whitespace-pre-wrap break-words">{m.content}</p>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={send} className="flex items-center gap-2 border-t border-white/10 py-2.5 pb-[calc(10px+env(safe-area-inset-bottom))]">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message…" className="min-w-0 flex-1 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2.5 text-[13.5px] outline-none focus:border-white/30" />
          <button type="submit" disabled={!text.trim()} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-black disabled:opacity-40" style={{ background: "var(--brand)" }}>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[680px] px-3 sm:px-4 pb-28 pt-3">
      <div className="sticky top-0 z-20 -mx-3 sm:-mx-4 mb-3 border-b border-white/10 bg-[#0b0b0d]/85 px-3 sm:px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: "var(--brand)" }}><MessageSquare className="w-5 h-5 text-black" /></span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[17px] font-extrabold tracking-tight leading-tight">Live Chats</h1>
            <p className="text-[11px] text-white/45">{rooms.length} rooms · real-time</p>
          </div>
          <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-bold text-black" style={{ background: "var(--brand)" }}>
            <Plus className="w-4 h-4" /> New
          </button>
        </div>
        <div className="mt-2.5 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2">
          <Search className="w-4 h-4 text-white/40" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search rooms" className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder-white/35" />
          {query && <button onClick={() => setQuery("")}><X className="w-4 h-4 text-white/40" /></button>}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[13px] text-white/40"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" /> Loading rooms…</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-white/25" />
          <p className="text-[14px] font-semibold">No live chat rooms</p>
          <p className="mt-1 text-[12px] text-white/45">Create a room and people can join in real time.</p>
          <button onClick={() => setCreating(true)} className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold text-black" style={{ background: "var(--brand)" }}>
            <Plus className="w-4 h-4" /> Create a room
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((r) => (
            <button key={r.id} onClick={() => joinRoom(r)} className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.05]">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.06] text-2xl">{r.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold leading-tight">{r.title}</p>
                  <p className="truncate text-[11.5px] text-white/50">{r.description || `Hosted by ${r.host_name}`}</p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-white/8 px-2.5 py-1 text-[11px] font-semibold text-white/65"><Users className="w-3 h-3" /> {r.member_count || 1}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {creating && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setCreating(false)}>
          <div className="w-full max-w-md rounded-3xl border border-white/12 bg-[#0c0c0f] p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <Hash className="w-5 h-5" style={{ color: "var(--brand)" }} />
              <h2 className="text-lg font-bold">Create a chat room</h2>
              <button onClick={() => setCreating(false)} className="ml-auto w-8 h-8 rounded-full hover:bg-white/10 grid place-items-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {EMOJIS.map((em) => (
                  <button key={em} onClick={() => setForm({ ...form, emoji: em })} className={`grid h-9 w-9 place-items-center rounded-xl text-lg ${form.emoji === em ? "ring-2" : "border border-white/10 hover:bg-white/8"}`} style={form.emoji === em ? { "--tw-ring-color": "var(--brand)" } : {}}>{em}</button>
                ))}
              </div>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={60} placeholder="Room name" className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-white/30" />
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={120} placeholder="What's this room about?" className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-white/30" />
            </div>
            <button onClick={createRoom} disabled={!form.title.trim()} className="mt-4 w-full py-2.5 rounded-full text-[13px] font-bold text-black disabled:opacity-40" style={{ background: "var(--brand)" }}>Create room</button>
          </div>
        </div>
      )}
    </div>
  );
}