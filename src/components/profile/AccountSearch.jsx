import React, { useEffect, useMemo, useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { nameOf, handleOf } from "@/lib/socialNames";

const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);

export default function AccountSearch({ me, onPick }) {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q.trim() || users) return;
    setLoading(true);
    base44.entities.User.list("-created_date", 100)
      .then((rows) => setUsers(asItems(rows)))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [q, users]);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t || !users) return [];
    return users
      .filter((u) => u.id !== me?.id)
      .filter((u) => `${nameOf(u)} ${handleOf(u)}`.toLowerCase().includes(t))
      .slice(0, 6);
  }, [q, users, me]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-full px-3 py-1.5 focus-within:border-fuchsia-400/60">
        <Search className="w-3.5 h-3.5 text-white/40 shrink-0" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search accounts"
          className="bg-transparent outline-none text-xs w-28 sm:w-40 placeholder-white/35"
        />
        {q && <button onClick={() => setQ("")}><X className="w-3 h-3 text-white/40" /></button>}
      </div>

      {q.trim() && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-white/10 bg-[#120d26] overflow-hidden z-40 shadow-2xl">
          {loading ? (
            <div className="px-3 py-4 text-xs text-white/45 flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching…</div>
          ) : results.length === 0 ? (
            <p className="px-3 py-4 text-xs text-white/45">No accounts found.</p>
          ) : (
            results.map((u) => (
              <button
                key={u.id}
                onClick={() => { onPick?.(handleOf(u)); setQ(""); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/[0.08] text-left"
              >
                <span className="w-8 h-8 rounded-full overflow-hidden bg-white/10 shrink-0 grid place-items-center text-[10px]">
                  {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : nameOf(u).slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold truncate">{nameOf(u)}</span>
                  <span className="block text-[11px] text-white/45 truncate">@{handleOf(u)}</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}