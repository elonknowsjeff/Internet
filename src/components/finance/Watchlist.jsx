import React from "react";
import { ArrowUpRight, ArrowDownRight, X } from "lucide-react";
import { money } from "@/lib/stockWatchlist";

export default function Watchlist({ symbols, quotes, active, onSelect, onRemove }) {
  if (!symbols.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 px-4 py-5 text-center text-xs text-white/45">
        Follow a stock below to pin it here.
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto thin-scrollbar pb-1">
      {symbols.map((sym) => {
        const q = quotes[sym];
        const up = (q?.change ?? 0) >= 0;
        return (
          <div
            key={sym}
            className={`shrink-0 w-[148px] rounded-xl border p-3 transition-colors ${
              active === sym ? "border-fuchsia-400/50 bg-fuchsia-500/10" : "border-white/10 bg-white/[0.04] hover:border-white/25"
            }`}
          >
            <div className="flex items-center justify-between">
              <button onClick={() => onSelect(sym)} className="text-left flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{sym}</p>
                <p className="text-[15px] font-semibold tabular-nums mt-0.5">{q ? `$${money(q.price)}` : "—"}</p>
                <p className={`text-[11px] flex items-center gap-0.5 ${up ? "text-emerald-400" : "text-rose-400"}`}>
                  {q && q.changePercent != null ? (
                    <>
                      {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {up ? "+" : ""}
                      {money(q.changePercent)}%
                    </>
                  ) : (
                    <span className="text-white/35">loading…</span>
                  )}
                </p>
              </button>
              <button onClick={() => onRemove(sym)} title="Unfollow" className="text-white/30 hover:text-white/80 -mt-4 -mr-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}