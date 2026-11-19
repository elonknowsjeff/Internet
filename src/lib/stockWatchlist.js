import { useEffect, useState } from "react";

const KEY = "si_stock_watchlist";
const DEFAULTS = ["AAPL", "NVDA", "MSFT", "TSLA"];

const read = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
};

export function useWatchlist() {
  const [list, setList] = useState(read);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(list));
  }, [list]);

  const toggle = (symbol) =>
    setList((l) => (l.includes(symbol) ? l.filter((s) => s !== symbol) : [...l, symbol]));

  const has = (symbol) => list.includes(symbol);

  return { list, toggle, has };
}

export const money = (v) =>
  v == null || !Number.isFinite(Number(v))
    ? "—"
    : Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const compact = (v) => {
  if (v == null || !Number.isFinite(Number(v))) return "—";
  const n = Number(v);
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  return String(n);
};