import React, { useMemo } from "react";
import { Hash, TrendingUp } from "lucide-react";

export default function TrendingHashtags({ posts, onSelect, active }) {
  const tags = useMemo(() => {
    const counts = {};
    (posts || []).forEach((p) => {
      const matches = String(p.content || "").matchAll(/#([\p{L}\p{N}_]{2,28})/gu);
      for (const m of matches) {
        const t = m[1].toLowerCase();
        counts[t] = (counts[t] || 0) + 1;
      }
    });
    const base = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, n]) => ({ tag, n }));
    const FALLBACK = ["tech", "ai", "gaming", "music", "travel", "food", "space", "crypto"];
    if (base.length < 4) {
      const seen = new Set(base.map((b) => b.tag));
      for (const f of FALLBACK) {
        if (base.length >= 8) break;
        if (!seen.has(f)) base.push({ tag: f, n: 0 });
      }
    }
    return base;
  }, [posts]);

  if (!tags.length) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-4 py-2.5">
      <span className="flex shrink-0 items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-white/40">
        <TrendingUp className="h-3.5 w-3.5" /> Trending
      </span>
      {tags.map(({ tag, n }) => {
        const on = active === tag;
        return (
          <button
            key={tag}
            onClick={() => onSelect?.(on ? null : tag)}
            className="flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors"
            style={on
              ? { background: "#fff", color: "#000" }
              : { border: "1px solid #2F3336", color: "rgba(255,255,255,0.65)" }}
          >
            <Hash className="h-3 w-3 opacity-70" />
            {tag}
            {n > 0 && <span className="opacity-50">{n}</span>}
          </button>
        );
      })}
    </div>
  );
}