import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Loader2, Star } from "lucide-react";
import { money, compact } from "@/lib/stockWatchlist";

export default function NasdaqList({ onSelect, isFollowed, onToggleFollow }) {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  const load = async (offset) => {
    setLoading(true);
    setErr("");
    try {
      const res = await base44.functions.invoke("stockMarket", { action: "list", limit: 60, offset });
      const data = res.data || {};
      setRows((prev) => (offset === 0 ? data.rows || [] : [...prev, ...(data.rows || [])]));
      setTotal(data.total || 0);
    } catch {
      setErr("Couldn't load the NASDAQ list.");
    }
    setLoading(false);
  };

  useEffect(() => {
    load(0);
  }, []);

  const needle = q.trim().toLowerCase();
  const filtered = needle
    ? rows.filter(
        (r) =>
          r.symbol?.toLowerCase().includes(needle) || (r.name || "").toLowerCase().includes(needle),
      )
    : rows;

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white/60">NASDAQ listings</h2>
        <span className="text-[11px] text-white/35">{total ? `${total.toLocaleString()} companies` : ""}</span>
      </div>

      <div className="flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/12 px-3 py-2 mb-2">
        <Search className="w-4 h-4 text-white/40 shrink-0" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search every NASDAQ company"
          className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder-white/40"
        />
      </div>

      {err && <p className="text-xs text-rose-300 py-3">{err}</p>}

      <div className="rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/[0.06]">
        {filtered.map((r) => {
          const up = (r.changePercent ?? 0) >= 0;
          return (
            <div key={r.symbol} className="flex items-center gap-2 px-3 py-2.5 hover:bg-white/[0.05]">
              <button onClick={() => onSelect(r.symbol, r.name)} className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold flex items-center gap-2">
                  {r.symbol}
                  <span className={`text-[11px] font-medium ${up ? "text-emerald-400" : "text-rose-400"}`}>
                    {r.changePercent != null ? `${up ? "+" : ""}${money(r.changePercent)}%` : ""}
                  </span>
                </p>
                <p className="text-[11px] text-white/45 truncate">
                  {r.name}
                  {r.marketCap ? ` · $${compact(r.marketCap)}` : ""}
                </p>
              </button>
              <span className="text-sm font-semibold tabular-nums shrink-0">{r.price != null ? `$${money(r.price)}` : "—"}</span>
              <button
                onClick={() => onToggleFollow(r.symbol)}
                title={isFollowed(r.symbol) ? "Unfollow" : "Follow"}
                className={`shrink-0 w-7 h-7 rounded-full grid place-items-center ${
                  isFollowed(r.symbol) ? "text-fuchsia-300" : "text-white/30 hover:text-white/70"
                }`}
              >
                <Star className={`w-4 h-4 ${isFollowed(r.symbol) ? "fill-fuchsia-300" : ""}`} />
              </button>
            </div>
          );
        })}
        {!loading && filtered.length === 0 && (
          <p className="px-3 py-8 text-center text-sm text-white/45">No company matches “{q}”.</p>
        )}
      </div>

      {loading ? (
        <div className="py-5 grid place-items-center text-white/40">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        rows.length < total && (
          <button
            onClick={() => load(rows.length)}
            className="w-full mt-2 py-2.5 rounded-full border border-white/12 text-xs font-semibold text-white/70 hover:bg-white/[0.07]"
          >
            Load more companies
          </button>
        )
      )}
    </section>
  );
}