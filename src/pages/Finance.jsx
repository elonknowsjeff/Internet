import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { TrendingUp, RefreshCw, Landmark, BarChart3 } from "lucide-react";
import StockDetail from "@/components/finance/StockDetail";
import Watchlist from "@/components/finance/Watchlist";
import NasdaqList from "@/components/finance/NasdaqList";
import BankingHub from "@/components/finance/BankingHub";
import { useWatchlist } from "@/lib/stockWatchlist";

const TABS = [
  { key: "markets", label: "Markets", icon: BarChart3 },
  { key: "banking", label: "Banking", icon: Landmark },
];

export default function Finance() {
  const { list, toggle, has } = useWatchlist();
  const [quotes, setQuotes] = useState({});
  const [symbol, setSymbol] = useState(list[0] || "AAPL");
  const [name, setName] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState("markets");

  useEffect(() => {
    if (!list.length) {
      setQuotes({});
      return;
    }
    let alive = true;
    const pull = async () => {
      setRefreshing(true);
      try {
        const res = await base44.functions.invoke("stockMarket", { action: "quotes", symbols: list });
        const map = {};
        (res.data?.quotes || []).forEach((q) => {
          map[q.symbol] = q;
        });
        if (alive) setQuotes(map);
      } catch {
        /* keep the previous quotes on a failed refresh */
      }
      if (alive) setRefreshing(false);
    };
    pull();
    const id = setInterval(pull, 60000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [list]);

  const open = (sym, company) => {
    setSymbol(sym);
    if (company) setName(company);
  };

  return (
    <div className="mx-auto max-w-4xl px-2 pb-28 sm:px-4">
      <header className="sticky top-2 z-30 flex items-center gap-3 rounded-2xl border border-white/[0.1] bg-[#0b0818]/72 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-2xl">
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 font-display text-[17px] font-semibold tracking-[-0.02em]">
            <TrendingUp className="h-4 w-4" style={{ color: "var(--brand)" }} /> XSI Money
          </h1>
          <p className="truncate text-[10.5px] text-white/40">Live NASDAQ quotes, your accounts and real-time rates</p>
        </div>
        <div className="flex gap-1 rounded-full border border-white/[0.08] bg-black/25 p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition-colors ${tab === t.key ? "bg-white text-black" : "text-white/55 hover:text-white"}`}
            >
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
        </div>
        {tab === "markets" && <RefreshCw className={`h-4 w-4 shrink-0 text-white/30 ${refreshing ? "animate-spin" : ""}`} />}
      </header>

      <div className="pt-3">
        {tab === "markets" ? (
          <div className="space-y-4">
            <Watchlist symbols={list} quotes={quotes} active={symbol} onSelect={(s) => open(s)} onRemove={toggle} />
            <StockDetail symbol={symbol} name={name} followed={has(symbol)} onToggleFollow={toggle} />
            <NasdaqList onSelect={open} isFollowed={has} onToggleFollow={toggle} />
          </div>
        ) : (
          <BankingHub />
        )}
      </div>
    </div>
  );
}