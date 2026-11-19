import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ArrowUpRight, ArrowDownRight, Star } from "lucide-react";
import StockChart from "./StockChart";
import { money } from "@/lib/stockWatchlist";

const RANGES = [
  ["1d", "1D"],
  ["5d", "5D"],
  ["1mo", "1M"],
  ["3mo", "3M"],
  ["6mo", "6M"],
  ["1y", "1Y"],
  ["5y", "5Y"],
];

export default function StockDetail({ symbol, name, followed, onToggleFollow }) {
  const [range, setRange] = useState("1mo");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");
    base44.functions
      .invoke("stockMarket", { action: "chart", symbol, range })
      .then((res) => {
        if (alive) setData(res.data);
      })
      .catch(() => {
        if (alive) {
          setData(null);
          setErr("Couldn't load this chart.");
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [symbol, range]);

  const up = (data?.change ?? 0) >= 0;
  const points = data?.points || [];
  const first = points[0]?.c;
  const last = points[points.length - 1]?.c;
  const periodPct = first && last ? ((last - first) / first) * 100 : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#1a1338]/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold tracking-tight">{symbol}</h2>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-400/25">
              NASDAQ
            </span>
          </div>
          <p className="text-[12px] text-white/45 truncate">{name || data?.exchange || "US equity"}</p>
        </div>
        <button
          onClick={() => onToggleFollow(symbol)}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            followed
              ? "border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-200"
              : "border-white/15 text-white/70 hover:bg-white/[0.08]"
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${followed ? "fill-fuchsia-300 text-fuchsia-300" : ""}`} />
          {followed ? "Following" : "Follow"}
        </button>
      </div>

      <div className="flex items-end gap-3 mt-3">
        <p className="text-3xl font-extrabold tracking-tight tabular-nums">
          {loading && !data ? "—" : `$${money(data?.price)}`}
        </p>
        {data && data.change != null && (
          <p className={`text-sm font-semibold flex items-center gap-0.5 pb-1 ${up ? "text-emerald-400" : "text-rose-400"}`}>
            {up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {up ? "+" : ""}
            {money(data.change)} ({up ? "+" : ""}
            {money(data.changePercent)}%)
          </p>
        )}
        {periodPct != null && (
          <p className="text-[11px] text-white/40 pb-1.5 ml-auto">
            {RANGES.find((r) => r[0] === range)?.[1]} {periodPct >= 0 ? "+" : ""}
            {periodPct.toFixed(2)}%
          </p>
        )}
      </div>

      {loading ? (
        <div className="h-[190px] grid place-items-center text-white/40">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : err ? (
        <p className="h-[190px] grid place-items-center text-sm text-rose-300">{err}</p>
      ) : (
        <StockChart points={points} up={up} />
      )}

      <div className="flex items-center gap-1 mt-2">
        {RANGES.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setRange(key)}
            className={`flex-1 py-1.5 rounded-full text-[11px] font-bold transition-colors ${
              range === key ? "bg-fuchsia-500 text-black" : "text-white/55 hover:bg-white/[0.08]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}