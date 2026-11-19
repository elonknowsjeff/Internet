import React, { useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, MessageSquare, Sparkles, ArrowLeft, AtSign } from "lucide-react";
import MessageSidebar from "@/components/messages/MessageSidebar";
import MessageThread from "@/components/messages/MessageThread";
import MessagesRail from "@/components/messages/MessagesRail";
import MessagesXNav from "@/components/messages/MessagesXNav";
import WalzaAiChat from "@/components/messages/WalzaAiChat";
import CallStage from "@/components/messages/CallStage";
import IncomingCallBanner from "@/components/messages/IncomingCallBanner";
import AccountView from "@/components/social/AccountView";
import useDirectCall from "@/lib/useDirectCall";
import { playChime } from "@/lib/chime";
import { handleOf, nameOf } from "@/lib/socialNames";

export default function Messages() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signedOut, setSignedOut] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [composeSignal, setComposeSignal] = useState(0);
  const lastSeen = useRef(null);

  const call = useDirectCall(me);

  const load = async () => {
    try {
      const u = await base44.auth.me();
      setMe(u);
      const [all, sent, recv] = await Promise.all([
        base44.entities.User.list("-created_date", 300),
        base44.entities.DirectMessage.filter({ sender_id: u.id }),
        base44.entities.DirectMessage.filter({ receiver_id: u.id }),
      ]);
      setUsers((all || []).filter((x) => x.id !== u.id));
      setMessages([...(sent || []), ...(recv || [])]);
    } catch {
      setSignedOut(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const unsub = base44.entities.DirectMessage?.subscribe?.((event) => {
      if (event?.type !== "create") return;
      const m = event.data;
      if (m?.receiver_id === me?.id && m?.sender_id !== me?.id && m?.kind !== "call" && m?.id !== lastSeen.current) {
        lastSeen.current = m.id;
        playChime();
      }
      load();
    });
    return () => { if (typeof unsub === "function") unsub(); };
  }, [me?.id]);

  const conversations = useMemo(() => {
    const map = {};
    for (const m of messages) {
      const otherId = m.sender_id === me?.id ? m.receiver_id : m.sender_id;
      if (!otherId) continue;
      const isIncoming = m.receiver_id === me?.id && m.sender_id === otherId;
      const prev = map[otherId];
      if (!prev) map[otherId] = { id: otherId, last: m.content, kind: m.kind, ts: m.created_date, unread: 0, name: "", avatar: "" };
      const c = map[otherId];
      if ((m.created_date || "") >= (c.ts || "")) {
        c.last = m.content;
        c.kind = m.kind;
        c.ts = m.created_date;
        c.name = isIncoming ? m.sender_name : m.receiver_name;
        c.avatar = isIncoming ? m.sender_avatar : m.receiver_avatar;
      }
      if (isIncoming && !m.read) c.unread += 1;
    }
    return Object.values(map).sort((a, b) => (b.ts || "").localeCompare(a.ts || ""));
  }, [messages, me]);

  const thread = useMemo(() => {
    if (!active || !me) return [];
    return messages
      .filter((m) => (m.sender_id === me.id && m.receiver_id === active.id) || (m.receiver_id === me.id && m.sender_id === active.id))
      .sort((a, b) => (a.created_date || "").localeCompare(b.created_date || ""));
  }, [messages, active, me]);

  // Opening a conversation marks its incoming messages as read
  useEffect(() => {
    if (!active || !me) return;
    const unread = messages.filter((m) => m.receiver_id === me.id && m.sender_id === active.id && !m.read);
    if (!unread.length) return;
    setMessages((prev) => prev.map((m) => (unread.some((u) => u.id === m.id) ? { ...m, read: true } : m)));
    if (typeof base44.entities.DirectMessage.bulkUpdate === "function") {
      base44.entities.DirectMessage.bulkUpdate(unread.map((m) => ({ id: m.id, read: true }))).catch(() => {});
    }
  }, [active?.id, messages.length]);

  const openConversation = (u) => {
    setAiOpen(false);
    setActive(u);
  };

  const removeConversation = async (peerId) => {
    if (!me) return;
    if (!confirm("Delete this conversation? The messages are removed for both of you.")) return;
    await base44.entities.DirectMessage.deleteMany({ sender_id: me.id, receiver_id: peerId });
    await base44.entities.DirectMessage.deleteMany({ sender_id: peerId, receiver_id: me.id });
    setMessages((prev) => prev.filter((m) => !(
      (m.sender_id === me.id && m.receiver_id === peerId) || (m.sender_id === peerId && m.receiver_id === me.id)
    )));
    if (active?.id === peerId) setActive(null);
  };

  const clearAllChats = async () => {
    if (!me) return;
    if (!confirm("Delete every conversation? This cannot be undone.")) return;
    await base44.entities.DirectMessage.deleteMany({ sender_id: me.id });
    await base44.entities.DirectMessage.deleteMany({ receiver_id: me.id });
    setMessages([]);
    setActive(null);
  };

  const send = async (payload) => {
    if (!me || !active) return;
    const content = (payload?.content || "").trim();
    if (!content) return;
    await base44.entities.DirectMessage.create({
      sender_id: me.id,
      sender_handle: handleOf(me),
      sender_name: nameOf(me),
      sender_avatar: me.avatar || "",
      receiver_id: active.id,
      receiver_handle: handleOf(active),
      receiver_name: nameOf(active),
      receiver_avatar: active.avatar || "",
      content,
      kind: payload.kind || "text",
      media_url: payload.media_url || "",
      duration: payload.duration || 0,
    });
    load();
  };

  const acceptIncoming = () => {
    const peer = call.incoming?.peer;
    const found = users.find((u) => u.id === peer?.id);
    if (found) openConversation(found);
    call.accept();
  };

  if (loading) {
    return <div className="h-[60vh] flex items-center justify-center gap-2 text-neutral-400"><Loader2 className="w-4 h-4 animate-spin" /> Loading messages…</div>;
  }

  if (signedOut || !me) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <MessageSquare className="w-10 h-10 text-fuchsia-400 mb-3" />
        <h1 className="text-xl font-bold">Sign in to message people</h1>
        <p className="text-sm text-neutral-400 mt-1 max-w-sm">Messages, calls and voice notes only work between real accounts.</p>
        <Link to="/login" className="mt-4 px-5 py-2 rounded-full bg-fuchsia-500 text-black font-semibold text-sm">Sign in</Link>
      </div>
    );
  }

  const showThread = !!active || aiOpen;
  const unreadTotal = conversations.reduce((n, c) => n + (c.unread || 0), 0);

  return (
    <div className="flex h-[calc(100dvh-6rem)] overflow-hidden">
      <MessagesXNav
        unread={unreadTotal}
        onCompose={() => { setActive(null); setAiOpen(false); setComposeSignal((n) => n + 1); }}
      />

      <div className={`w-full sm:w-[330px] lg:w-[350px] shrink-0 border-r border-white/[0.08] ${showThread ? "hidden sm:block" : "block"}`}>
        <MessageSidebar
          me={me}
          users={users}
          conversations={conversations}
          active={active}
          focusSignal={composeSignal}
          onSelect={openConversation}
          onAi={() => { setActive(null); setAiOpen(true); }}
          onProfile={(u) => setProfileUser(u)}
          onDelete={removeConversation}
          onClearAll={clearAllChats}
        />
      </div>

      <div className={`flex-1 min-w-0 ${showThread ? "block" : "hidden sm:block"}`}>
        {aiOpen ? (
          <div className="h-full flex flex-col">
            <header className="flex items-center gap-2 px-3 py-2.5 border-b border-fuchsia-300/15 bg-[#0f0820]/90 backdrop-blur-xl shrink-0">
              <button onClick={() => setAiOpen(false)} className="sm:hidden w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
              <span className="w-9 h-9 rounded-full bg-gradient-to-br from-fuchsia-400 to-cyan-400 flex items-center justify-center shrink-0"><Sparkles className="w-4 h-4 text-black" /></span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Super Internet AI</p>
                <p className="text-[11px] text-emerald-400">Assistant · not a person</p>
              </div>
            </header>
            <WalzaAiChat />
          </div>
        ) : active ? (
          <MessageThread
            me={me}
            active={active}
            messages={thread}
            onSend={send}
            onBack={() => setActive(null)}
            onOpenProfile={(u) => setProfileUser(u)}
            call={call}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 rounded-full bg-white/10 border border-white/15 flex items-center justify-center mb-3">
              <MessageSquare className="w-7 h-7 text-fuchsia-300" />
            </div>
            <h2 className="text-xl font-bold">Your messages</h2>
            <p className="text-sm text-neutral-400 mt-1 max-w-xs">Pick a conversation or search a real account by name, @handle or phone number.</p>
            {me.phone && <p className="mt-3 text-xs text-neutral-500 flex items-center gap-1"><AtSign className="w-3 h-3" /> Friends can reach you at {me.phone}</p>}
            <div className="mt-5 grid grid-cols-2 gap-2 text-left w-full max-w-sm">
              {[["Text", "Send messages instantly"], ["Voice notes", "Record and send audio"], ["AI pictures", "Generate images in chat"], ["Calls", "Voice and video, in thread"]].map(([t, d]) => (
                <div key={t} className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                  <p className="text-xs font-semibold">{t}</p>
                  <p className="text-[11px] text-white/45">{d}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <MessagesRail onTag={() => navigate("/")} />

      {profileUser && (
        <AccountView
          handle={handleOf(profileUser)}
          me={me}
          onClose={() => setProfileUser(null)}
          onMessage={(h) => {
            const u = users.find((x) => handleOf(x) === h);
            setProfileUser(null);
            if (u) openConversation(u);
          }}
        />
      )}

      <IncomingCallBanner incoming={call.incoming} onAccept={acceptIncoming} onDecline={call.decline} />
      <CallStage call={call} />
    </div>
  );
}