import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Archive, ArchiveRestore, Check, X, FileText } from "lucide-react";
import useNotifications from "@/components/notifications/useNotifications";

const CLAMP = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const TONES = {
  msg: "bg-[#EE8FB5] text-[#181614]",
  flw: "bg-[#B08CD9] text-[#181614]",
  art: "bg-[#7FA4E8] text-[#181614]",
  sys: "bg-[#6DBE7C] text-[#181614]",
};

const FOLDERS = [
  { key: "inbox", label: "Inbox", active: "bg-[var(--brand)] text-black" },
  { key: "general", label: "General", active: "bg-[#9DC3A6] text-[#181614]" },
  { key: "archived", label: "Archived", active: "bg-[#EE8FB5] text-[#181614]" },
];

const MAX_LIST = 456;

export default function NotificationCenter({ user }) {
  const navigate = useNavigate();
  const { items, markRead, archive, restore, markAllRead, clearRead } = useNotifications(user);
  const [open, setOpen] = useState(false);
  const [folder, setFolder] = useState("inbox");
  const [pos, setPos] = useState(null);
  const bellRef = useRef(null);
  const panelRef = useRef(null);
  const listRef = useRef(null);

  const unread = items.filter((n) => n.state === "unread").length;

  const place = () => {
    const r = bellRef.current?.getBoundingClientRect();
    if (!r) return;
    const width = Math.min(430, window.innerWidth - 32);
    setPos({
      top: r.bottom + 6,
      right: Math.max(12, window.innerWidth - r.right),
      width,
      maxHeight: window.innerHeight - r.bottom - 22,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    place();
    const onMove = () => place();
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (panelRef.current?.contains(e.target) || bellRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") { setOpen(false); bellRef.current?.focus(); }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const inFolder = useMemo(() => items.filter((n) => n.state === folder), [items, folder]);
  const counts = useMemo(() => ({
    inbox: items.filter((n) => n.state === "unread" && n.folder === "inbox").length,
    general: items.filter((n) => n.state === "unread" && n.folder === "general").length,
    archived: items.filter((n) => n.state === "archived").length,
  }), [items]);

  const inboxRows = items.filter((n) => n.state !== "archived" && n.folder === "inbox");
  const inboxUnread = items.filter((n) => n.state === "unread" && n.folder === "inbox");
  const share = inboxRows.length ? Math.round((inboxUnread.length / inboxRows.length) * 100) : 0;

  // The list card ends on a whole row: largest height <= 456 that fits complete rows.
  useLayoutEffect(() => {
    if (!open) return;
    const fit = () => {
      const el = listRef.current;
      if (!el) return;
      el.style.height = `${MAX_LIST}px`;
      const pad = parseFloat(window.getComputedStyle(el).paddingBottom) || 0;
      const top = el.getBoundingClientRect().top - el.scrollTop;
      let best = 0;
      el.querySelectorAll("[data-row]").forEach((row) => {
        const bottom = row.getBoundingClientRect().bottom - top;
        if (bottom + pad <= MAX_LIST && bottom > best) best = bottom;
      });
      if (best) el.style.height = `${Math.ceil(best + pad)}px`;
    };
    fit();
    window.addEventListener("resize", fit);
    if (document.fonts?.ready) document.fonts.ready.then(fit);
    return () => window.removeEventListener("resize", fit);
  }, [open, folder]);

  const openRow = (n) => {
    markRead(n.key);
    setOpen(false);
    navigate(n.to);
  };

  const big = folder === "archived" ? counts.archived : counts[folder];
  const empty = big === 0;
  const eyebrow = empty
    ? folder === "archived" ? "Nothing archived" : "You're all caught up"
    : "Right now, you have";
  const headline = empty
    ? folder === "archived" ? "Empty" : "All clear"
    : folder === "archived" ? `${big} archived` : `${big} new`;

  return (
    <div className="relative shrink-0">
      <button
        ref={bellRef}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="xsi-notifications"
        aria-label={`Notifications, ${unread} unread`}
        className={`relative grid h-9 w-9 place-items-center rounded-full transition-colors ${open ? "bg-white/[0.12] text-white" : "text-white/85 hover:bg-white/10"}`}
      >
        <Bell className="h-[19px] w-[19px]" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-[var(--brand)] px-1 font-mono text-[10px] font-bold text-black ring-2 ring-[#0b0818]">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && pos && (
        <div
          ref={panelRef}
          id="xsi-notifications"
          role="region"
          aria-label="Notifications"
          className="fixed z-[85] flex flex-col gap-1.5"
          style={{ top: pos.top, right: pos.right, width: pos.width, maxHeight: pos.maxHeight }}
        >
          {/* header */}
          <header className="rounded-[22px] border border-white/[0.09] bg-[#0d0a1a]/95 px-5 py-4 shadow-[0_30px_60px_-30px_rgba(0,0,0,1)] backdrop-blur-2xl">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">{eyebrow}</p>
                <h2 className="mt-1 truncate text-[34px] font-semibold leading-none tracking-[-0.03em] text-white">
                  {headline}
                </h2>
              </div>
              <div className="flex items-center gap-3 pb-0.5">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">
                  {FOLDERS.find((f) => f.key === folder)?.label}
                </span>
                <div className="relative h-14 w-14">
                  <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90">
                    <circle cx="36" cy="36" r="32" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
                    <circle
                      cx="36" cy="36" r="32" fill="none" stroke="var(--brand)" strokeWidth="5" strokeLinecap="round"
                      pathLength="100" strokeDasharray={`${share} 100`} opacity={share ? 1 : 0}
                      style={{ transition: "stroke-dasharray 300ms cubic-bezier(0.22,1,0.36,1)" }}
                    />
                    <circle cx="36" cy="36" r="20" fill="none" stroke="#9DC3A6" strokeWidth="5" />
                    <circle cx="36" cy="36" r="10" fill="#EE8FB5" />
                  </svg>
                </div>
              </div>
            </div>
          </header>

          {/* folders */}
          <div className="flex gap-2 rounded-[22px] border border-white/[0.09] bg-[#0d0a1a]/95 p-2 backdrop-blur-2xl" role="tablist" aria-label="Notification folders">
            {FOLDERS.map((f) => {
              const active = folder === f.key;
              return (
                <button
                  key={f.key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFolder(f.key)}
                  className={`h-[38px] flex-1 rounded-full text-[13px] transition-colors ${
                    active ? `${f.active} font-bold` : "bg-white/[0.06] font-medium text-white/75 hover:bg-white/[0.1]"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* list */}
          <div
            ref={listRef}
            className="min-h-0 overflow-y-auto overscroll-contain rounded-[22px] border border-white/[0.09] bg-[#0d0a1a]/95 p-1.5 backdrop-blur-2xl thin-scrollbar"
            style={{ height: MAX_LIST }}
          >
            {inFolder.length === 0 ? (
              <div className="grid h-full place-items-center px-4 text-center">
                <div>
                  <Check className="mx-auto h-8 w-8 text-[#9DC3A6]" />
                  <p className="mt-2 text-[22px] font-semibold tracking-[-0.02em]">
                    {folder === "archived" ? "Nothing archived" : folder === "general" ? "All quiet" : "Inbox zero"}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                    {folder === "archived" ? "Archived notifications land here" : "Nothing new right now"}
                  </p>
                </div>
              </div>
            ) : (
              inFolder.map((n, i) => {
                const isUnread = n.state === "unread";
                const isArchived = n.state === "archived";
                const divider = !isUnread && i > 0 && inFolder[i - 1].state !== "unread";
                return (
                  <div
                    key={n.key}
                    data-row
                    className={`group relative mb-1.5 rounded-[18px] transition-colors ${
                      isUnread ? "bg-white/[0.055] hover:bg-white/[0.09]" : "bg-transparent"
                    } ${divider ? "border-t border-white/[0.06] pt-1.5" : ""}`}
                  >
                    <button
                      onClick={() => openRow(n)}
                      className="w-full pr-14 text-left"
                      style={{ padding: "12px 56px 12px 12px" }}
                    >
                      <span className="flex items-start gap-3">
                        <span className={`mt-0.5 grid h-[26px] w-[52px] shrink-0 place-items-center rounded-full font-mono text-[10px] font-bold ${TONES[n.tone] || TONES.sys}`}>
                          {n.tag}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14px] leading-[1.35] text-white/60" style={CLAMP}>
                            <b className={`font-semibold ${isUnread ? "text-white" : "text-white/75"}`}>{n.actor}</b>{" "}
                            {n.verb}{" "}
                            {n.object && <b className={`font-semibold ${isUnread ? "text-white" : "text-white/75"}`}>{n.object}</b>}
                          </span>
                          {n.body && (
                            <span className="mt-0.5 block text-[12.5px] leading-[1.35] text-white/45" style={CLAMP}>
                              {n.body}
                            </span>
                          )}
                          <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.1em] text-white/35">
                            {n.meta}
                          </span>
                        </span>
                      </span>
                    </button>

                    {isUnread && (
                      <span className="pointer-events-none absolute right-6 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[var(--brand)] transition-opacity group-hover:opacity-0" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isArchived) restore(n.key); else archive(n.key);
                      }}
                      title={isArchived ? "Restore" : "Archive"}
                      aria-label={isArchived ? "Restore" : "Archive"}
                      className={`absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-[11px] text-white/45 transition-all hover:bg-white/[0.1] hover:text-white ${
                        isUnread ? "opacity-0 group-hover:opacity-100 focus:opacity-100" : "opacity-100"
                      }`}
                    >
                      {isArchived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* footer */}
          <footer className="rounded-[22px] border border-white/[0.09] bg-[#0d0a1a]/95 px-5 py-1.5 backdrop-blur-2xl">
            <div className="flex flex-wrap items-center justify-between gap-x-4">
              <p className="min-w-[120px] py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
                {folder === "archived" ? `${counts.archived} archived` : `${counts[folder]} / ${inFolder.length} unread`}
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={clearRead}
                  disabled={!items.some((n) => n.state === "read")}
                  className="py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/70 hover:text-white disabled:text-white/25"
                >
                  Clear read
                </button>
                <button
                  onClick={markAllRead}
                  disabled={unread === 0}
                  className="py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--brand)] hover:brightness-125 disabled:text-white/25"
                >
                  {unread === 0 ? "All read" : "Mark all read"}
                </button>
              </div>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}