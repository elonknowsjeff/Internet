import React, { useState, useEffect, useRef, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { X, ArrowLeft, Search, MessageSquare, Sparkles, Loader2, UserRound, LogIn } from "lucide-react";
import WalzaAiChat from "@/components/messages/WalzaAiChat";
import AccountView from "@/components/social/AccountView";
import MessageBubble from "@/components/messages/MessageBubble";
import MessageComposer from "@/components/messages/MessageComposer";

const AI = { ai: true, id: "walza-ai" };
const handleOf = (u) => u?.username || (u?.email ? u.email.split("@")[0] : "user");
const nameOf = (u) => u?.display_name || u?.full_name || handleOf(u);
const timeOf = (ts) => (ts ? new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "");

export default function DmsPanel({ onClose, initialHandle }) {
  const startedRef = useRef(false);
  const [me, setMe] = useState(null);
  const [signedOut, setSignedOut] = useState(false);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [active, setActive] = useState(null);
  const [profileHandle, setProfileHandle] = useState(null);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  const load = async () => {
    try {
      const u = await base44.auth.me();
      setMe(u);
      const [all, sent, recv] = await Promise.all([
        base44.entities.User.list("-created_date", 200),
        base44.entities.DirectMessage.filter({ sender_id: u.id }),
        base44.entities.DirectMessage.filter({ receiver_id: u.id }),
      ]);
      const others = (all || []).filter((x) => x.id !== u.id);
      setUsers(others);
      setMessages([...(sent || []), ...(recv || [])]);
      if (initialHandle && !startedRef.current) {
        const match = others.find((x) => handleOf(x) === initialHandle);
        if (match) { setActive(match); startedRef.current = true; }
      }
    } catch (e) {
      setSignedOut(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const unsub = base44.entities.DirectMessage?.subscribe?.(() => load());
    return () => { if (typeof unsub === "function") unsub(); };
  }, []);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, active]);

  const conversations = useMemo(() => {
    const map = {};
    for (const m of messages) {
      const otherId = m.sender_id === me?.id ? m.receiver_id : m.sender_id;
      if (!otherId) continue;
      const isMine = m.sender_id === me?.id;
      const entry = map[otherId] || {
        id: otherId,
        handle: isMine ? m.receiver_handle : m.sender_handle,
        name: isMine ? m.receiver_name : m.sender_name,
        avatar: isMine ? m.receiver_avatar : m.sender_avatar,
        last: "",
        ts: "",
      };
      if ((m.created_date || "") >= (entry.ts || "")) { entry.last = m.content; entry.ts = m.created_date; }
      map[otherId] = entry;
    }
    return Object.values(map).sort((a, b) => (b.ts || "").localeCompare(a.ts || ""));
  }, [messages, me]);

  const thread = useMemo(() => {
    if (!active || active.ai || !me) return [];
    return messages
      .filter((m) => (m.sender_id === me.id && m.receiver_id === active.id) || (m.receiver_id === me.id && m.sender_id === active.id))
      .sort((a, b) => (a.created_date || "").localeCompare(b.created_date || ""));
  }, [messages, active, me]);

  const send = async (payload) => {
    const content = (payload?.content || "").trim();
    if (!content || !active || active.ai || !me) return;
    try {
      await base44.entities.DirectMessage.create({
        sender_id: me.id, sender_handle: handleOf(me), sender_name: nameOf(me), sender_avatar: me.avatar || "",
        receiver_id: active.id, receiver_handle: handleOf(active), receiver_name: nameOf(active), receiver_avatar: active.avatar || "",
        content,
        kind: payload.kind || "text",
        media_url: payload.media_url || "",
        duration: payload.duration || 0,
      });
      await load();
    } catch (e) {}
  };

  const filteredUsers = q.trim()
    ? users.filter((u) => (nameOf(u) + " " + handleOf(u) + " " + (u.phone || "")).toLowerCase().includes(q.toLowerCase()))
    : [];

  const Avatar = ({ u, size = "w-10 h-10" }) => (
    <div className={`${size} rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-500 flex items-center justify-center text-black font-bold overflow-hidden shrink-0`}>
      {u?.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : (nameOf(u)?.[0] || "U").toUpperCase()}
    </div>
  );

  const openUser = (handle) => setProfileHandle(handle);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg h-full bg-[#0b0619]/[0.98] border-l border-white/[0.08] flex flex-col animate-slide-up">
        <div className="flex items-center gap-2 px-3 h-[56px] border-b border-white/[0.08] shrink-0">
          {active ? (
            <>
              <button onClick={() => setActive(null)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center shrink-0"><ArrowLeft className="w-4 h-4" /></button>
              {active.ai ? (
                <>
                  <span className="w-9 h-9 rounded-full bg-gradient-to-br from-fuchsia-400 to-cyan-400 flex items-center justify-center shrink-0"><Sparkles className="w-4 h-4 text-black" /></span>
                  <div className="min-w-0">
                    <p className="text-[15px] font-bold leading-tight">XSI AI</p>
                    <p className="text-[11.5px] text-emerald-400">Always on</p>
                  </div>
                </>
              ) : (
                <button onClick={() => openUser(handleOf(active))} className="flex items-center gap-2 min-w-0 text-left hover:opacity-80">
                  <Avatar u={active} size="w-9 h-9" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight truncate">{nameOf(active)}</p>
                    <p className="text-[11px] text-white/45 truncate">@{handleOf(active)} · view profile</p>
                  </div>
                </button>
              )}
            </>
          ) : (
            <>
              <h2 className="text-[17px] font-extrabold flex items-center gap-2"><MessageSquare className="w-[18px] h-[18px] text-[var(--brand)]" /> Messages</h2>
              <Link to="/messages" className="ml-auto text-[11px] text-white/45 hover:text-white">Full screen</Link>
            </>
          )}
          <button onClick={onClose} className={`${active ? "" : "ml-1"} w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center shrink-0`}><X className="w-4 h-4" /></button>
        </div>

        {!active && (
          <div className="flex-1 overflow-y-auto thin-scrollbar">
            <div className="p-3">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-2">
                <Search className="w-4 h-4 text-white/45 shrink-0" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search people, @handles or phone numbers" className="flex-1 min-w-0 bg-transparent outline-none text-sm" />
              </div>
            </div>

            <button onClick={() => setActive(AI)} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 text-left border-y border-white/10">
              <span className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-400 to-cyan-400 flex items-center justify-center shrink-0"><Sparkles className="w-5 h-5 text-black" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold flex items-center gap-1.5">XSI AI <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-400/15 text-emerald-300 font-semibold">NEW</span></p>
                <p className="text-xs text-white/45 truncate">Ask anything — writing, plans, answers</p>
              </div>
            </button>

            {signedOut ? (
              <div className="p-6 text-center">
                <p className="text-sm text-white/60">Sign in to send and receive messages.</p>
                <Link to="/login" className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-fuchsia-500 text-black text-sm font-semibold"><LogIn className="w-4 h-4" /> Sign in</Link>
              </div>
            ) : q.trim() ? (
              <div className="px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-white/35 mb-1.5">People · {filteredUsers.length}</p>
                <div className="space-y-0.5">
                  {filteredUsers.slice(0, 12).map((u) => (
                    <div key={u.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5">
                      <button onClick={() => openUser(handleOf(u))} className="flex items-center gap-3 min-w-0 flex-1 text-left">
                        <Avatar u={u} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{nameOf(u)}</p>
                          <p className="text-xs text-white/45 truncate">@{handleOf(u)}</p>
                        </div>
                      </button>
                      <button onClick={() => { setActive(u); setQ(""); }} className="px-3 py-1.5 rounded-full bg-white/10 text-xs font-semibold hover:bg-white/20">Message</button>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && <p className="text-sm text-white/40 py-3">No people match that.</p>}
                </div>
              </div>
            ) : (
              <div className="px-3 py-3">
                <p className="text-[11px] uppercase tracking-wide text-white/35 mb-2 flex items-center gap-1"><UserRound className="w-3.5 h-3.5" /> Conversations</p>
                {loading ? (
                  <div className="flex items-center gap-2 text-sm text-white/45 py-6 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
                ) : conversations.length === 0 ? (
                  <p className="text-sm text-white/40 py-8 text-center">No conversations yet. Search for someone above, or open any profile and tap Message.</p>
                ) : (
                  <div className="space-y-0.5">
                    {conversations.map((c) => {
                      const u = users.find((x) => x.id === c.id) || { id: c.id, handle: c.handle, name: c.name, avatar: c.avatar };
                      return (
                        <div key={c.id} className="flex items-center gap-1 rounded-xl hover:bg-white/5">
                          <button onClick={() => setActive(u)} className="flex items-center gap-3 p-2 flex-1 min-w-0 text-left">
                            <Avatar u={u} />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold truncate">{c.name || nameOf(u)}</p>
                              <p className="text-xs text-white/40 truncate">{c.last}</p>
                            </div>
                          </button>
                          <button onClick={() => openUser(handleOf(u))} title="View profile" className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white shrink-0"><UserRound className="w-4 h-4" /></button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {active?.ai && <WalzaAiChat />}

        {active && !active.ai && (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5 thin-scrollbar">
              {thread.length === 0 ? (
                <div className="text-center py-12">
                  <Avatar u={active} size="w-16 h-16 mx-auto" />
                  <p className="mt-3 text-sm font-semibold">{nameOf(active)}</p>
                  <p className="text-xs text-white/40 mt-1">This is the start of your conversation. Say hi 👋</p>
                </div>
              ) : (
                thread.map((m) => (
                  <MessageBubble key={m.id} m={m} mine={m.sender_id === me?.id} peer={{ id: active.id, name: nameOf(active), avatar: active.avatar }} />
                ))
              )}
            </div>
            <MessageComposer peerName={nameOf(active)} onSend={send} />
          </>
        )}
      </div>

      {profileHandle && (
        <AccountView
          handle={profileHandle}
          me={me}
          onClose={() => setProfileHandle(null)}
          onMessage={(h) => {
            const u = users.find((x) => handleOf(x) === h);
            setProfileHandle(null);
            if (u) { setActive(u); setQ(""); }
          }}
        />
      )}
    </div>
  );
}