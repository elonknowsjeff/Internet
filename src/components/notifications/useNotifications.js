import { useCallback, useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";

const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);

const timeAgo = (iso) => {
  if (!iso) return "now";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};

/*
  Real notifications for the signed-in member: unread messages, new followers and
  comments on articles. Read / archived state is kept per user in local storage,
  so the bell badge, the folder numbers and the footer counts all derive from it.
*/
export default function useNotifications(user) {
  const [raw, setRaw] = useState([]);
  const [state, setState] = useState({ read: {}, archived: {} });
  const uid = user?.id || "guest";
  const storeKey = `xsi_notifications_${uid}`;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storeKey) || "{}");
      setState({ read: saved.read || {}, archived: saved.archived || {} });
    } catch {
      setState({ read: {}, archived: {} });
    }
  }, [storeKey]);

  const persist = useCallback(
    (next) => {
      setState(next);
      try { localStorage.setItem(storeKey, JSON.stringify(next)); } catch { /* private mode */ }
    },
    [storeKey]
  );

  const load = useCallback(async () => {
    if (!user?.id) { setRaw([]); return; }
    const [msgs, follows, arts] = await Promise.all([
      base44.entities.DirectMessage.filter(
        { receiver_id: user.id, read: false },
        { sort: "-created_date", limit: 15 }
      ).catch(() => []),
      base44.entities.Follow.filter(
        { following_id: user.id },
        { sort: "-created_date", limit: 10 }
      ).catch(() => []),
      base44.entities.ArticleComment.list("-created_date", 12).catch(() => []),
    ]);

    setRaw([
      ...asItems(msgs).map((m) => ({
        key: `msg:${m.id}`,
        tag: "MSG",
        tone: "msg",
        folder: "inbox",
        actor: m.sender_name || `@${m.sender_handle || "member"}`,
        verb: "sent you a message",
        body: m.content || "",
        meta: `${timeAgo(m.created_date)} · Messages`,
        to: "/messages",
      })),
      ...asItems(follows).map((f) => ({
        key: `flw:${f.id}`,
        tag: "FLW",
        tone: "flw",
        folder: "inbox",
        actor: f.follower_name || `@${f.follower_handle || "member"}`,
        verb: "started following you",
        body: "",
        meta: `${timeAgo(f.created_date)} · Profile`,
        to: "/profile",
      })),
      ...asItems(arts)
        .filter((a) => a.created_by_id !== user.id)
        .map((a) => ({
          key: `art:${a.id}`,
          tag: "ART",
          tone: "art",
          folder: "general",
          actor: a.author_name || "A reader",
          verb: "commented on",
          object: "an article",
          body: a.text || "",
          meta: `${timeAgo(a.created_date)} · Articles`,
          to: "/articles",
        })),
    ]);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const unsub = base44.entities.DirectMessage?.subscribe?.(() => load());
    return () => { if (typeof unsub === "function") unsub(); };
  }, [load]);

  const items = useMemo(
    () =>
      raw.map((n) => ({
        ...n,
        state: state.archived[n.key] ? "archived" : state.read[n.key] ? "read" : "unread",
      })),
    [raw, state]
  );

  const markRead = (key) => {
    if (state.read[key] || state.archived[key]) return;
    persist({ ...state, read: { ...state.read, [key]: true } });
    if (key.startsWith("msg:")) {
      base44.entities.DirectMessage.update(key.slice(4), { read: true }).catch(() => {});
    }
  };

  const archive = (key) =>
    persist({ ...state, archived: { ...state.archived, [key]: true }, read: { ...state.read, [key]: true } });

  const restore = (key) => {
    const archived = { ...state.archived };
    delete archived[key];
    persist({ ...state, archived });
  };

  const markAllRead = () => {
    const read = { ...state.read };
    items.forEach((n) => { if (n.state !== "archived") read[n.key] = true; });
    persist({ ...state, read });
  };

  const clearRead = () => {
    const archived = { ...state.archived };
    items.forEach((n) => { if (n.state === "read") archived[n.key] = true; });
    persist({ ...state, archived });
  };

  return { items, markRead, archive, restore, markAllRead, clearRead, reload: load };
}