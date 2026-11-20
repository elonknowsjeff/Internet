import React, { useState, useEffect, useRef } from "react";
import { APPS } from "@/components/os/desktopApps";
import { Search, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function DesktopSearch({ onOpen }) {
  const [q, setQ] = useState("");
  const [people, setPeople] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const query = q.trim();
    if (query.length < 2) { setPeople([]); return; }
    timer.current = setTimeout(async () => {
      try {
        const rx = { $regex: query, $options: "i" };
        const page = await base44.entities.Post.filter(
          { $or: [{ content: rx }, { author_name: rx }, { author_handle: rx }] },
          { sort: "-created_date", limit: 20 }
        );
        const seen = new Map();
        (page?.items || []).forEach((p) => {
          if (p.created_by_id && !seen.has(p.created_by_id)) seen.set(p.created_by_id, { name: p.author_name, handle: p.author_handle, avatar: p.author_avatar });
        });
        setPeople([...seen.values()].slice(0, 5));
      } catch { setPeople([]); }
    }, 280);
    return () => clearTimeout(timer.current);
  }, [q]);

  const ql = q.trim().toLowerCase();
  const appMatches = Object.entries(APPS).filter(([, a]) => a.name.toLowerCase().includes(ql));
  const has = ql.length >= 1 && (appMatches.length || people.length);

  return (
    <div ref={ref} className="relative w-full max-w-[520px]">
      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3.5 py-2 focus-within:border-[color:var(--brand)]/60 transition-colors">
        <Search className="w-4 h-4 text-white/50 shrink-0" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search apps, people and accounts"
          className="flex-1 min-w-0 bg-transparent text-[13px] outline-none placeholder-white/40"
        />
        {q && <button onClick={() => { setQ(""); setPeople([]); }} className="shrink-0"><X className="w-4 h-4 text-white/40" /></button>}
      </div>
      {open && has && (
        <div className="absolute left-0 right-0 mt-2 rounded-2xl border border-white/10 bg-[#131316] shadow-[0_24px_64px_-24px_rgba(0,0,0,0.9)] overflow-hidden z-50 max-h-[60vh] overflow-y-auto thin-scrollbar p-1.5">
          {appMatches.length > 0 && (
            <div>
              <p className="px-2.5 py-1.5 text-[10px] uppercase tracking-wide text-white/40">Apps</p>
              {appMatches.slice(0, 6).map(([k, a]) => {
                const Icon = a.icon;
                return (
                  <button key={k} onClick={() => { onOpen(k); setOpen(false); setQ(""); }} className="flex w-full items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-white/[0.06] text-left">
                    <span className="grid h-8 w-8 place-items-center rounded-lg brand-grad text-black"><Icon className="w-4 h-4" /></span>
                    <span className="text-[13px] font-medium">{a.name}</span>
                  </button>
                );
              })}
            </div>
          )}
          {people.length > 0 && (
            <div className="border-t border-white/[0.06]">
              <p className="px-2.5 py-1.5 text-[10px] uppercase tracking-wide text-white/40">People</p>
              {people.map((p, i) => (
                <button key={i} onClick={() => { onOpen("messages"); setOpen(false); setQ(""); }} className="flex w-full items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-white/[0.06] text-left">
                  <span className="w-8 h-8 rounded-full overflow-hidden bg-white/10 grid place-items-center text-[12px] font-bold shrink-0">
                    {p.avatar ? <img src={p.avatar} alt="" className="w-full h-full object-cover" /> : (p.name || "?")[0]?.toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold truncate">{p.name || "User"}</span>
                    <span className="block text-[11px] text-white/45 truncate">@{p.handle || "user"}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}