import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, Bitcoin, ArrowUpRight, ArrowDownRight } from "lucide-react";

const SHOW = ["CAD", "EUR", "GBP", "JPY", "AUD", "MXN", "INR", "CNY"];

export default function LiveRates() {
  const [fx, setFx] = useState(null);
  const [crypto, setCrypto] = useState([]);
  const [busy, setBusy] = useState(true);

  const load = async () => {
    setBusy(true);
    try {
      const res = await base44.functions.invoke("ratesApi", { base: "USD" });
      setFx(res.data?.fx || null);
      setCrypto(res.data?.crypto || []);
    } catch {
      setFx(null);
    }
    setBusy(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <section className="panel p-3.5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-[15px] font-semibold tracking-[-0.01em]">
          Live rates
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">API</span>
        </h2>
        <button onClick={load} title="Refresh rates" className="grid h-7 w-7 place-items-center rounded-full hover:bg-white/10">
          <RefreshCw className={`h-3.5 w-3.5 text-white/40 ${busy ? "animate-spin" : ""}`} />
        </button>
      </div>

      {!fx ? (
        <p className="py-5 text-center text-[12px] text-white/40">{busy ? "Fetching rates…" : "Rates unavailable right now."}</p>
      ) : (
        <>
          <p className="mt-1.5 text-[10.5px] uppercase tracking-[0.14em] text-white/35">1 USD buys</p>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {SHOW.filter((c) => fx.rates[c]).map((c) => (
              <div key={c} className="rounded-xl border border-white/[0.07] bg-white/[0.04] px-2.5 py-1.5">
                <p className="text-[10px] font-semibold text-white/40">{c}</p>
                <p className="font-display text-[13.5px] font-semibold tabular-nums">{fx.rates[c].toFixed(3)}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {crypto.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.14em] text-white/35"><Bitcoin className="h-3 w-3" /> Crypto</p>
          {crypto.slice(0, 5).map((c) => {
            const up = c.change24h >= 0;
            return (
              <div key={c.symbol} className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-white/[0.05]">
                {c.image ? <img src={c.image} alt="" className="h-5 w-5 rounded-full" /> : <span className="h-5 w-5 rounded-full bg-white/10" />}
                <span className="min-w-0 flex-1 truncate text-[12px] font-medium">{c.name}</span>
                <span className="text-[12px] tabular-nums text-white/70">${c.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                <span className={`flex items-center gap-0.5 text-[10.5px] tabular-nums ${up ? "text-emerald-300" : "text-rose-300"}`}>
                  {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{Math.abs(c.change24h).toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}