import React, { useMemo } from "react";
import { Hash, TrendingUp } from "lucide-react";

// Derive trending hashtags from post content (real data, no extra calls).
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
    // If the feed is sparse, pad with evergreen topics so the rail isn't empty.
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
    <div className="mt-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
      <span className="flex shrink-0 items-center gap-1 pl-1 text-[11px] font-bold uppercase tracking-wide text-white/45">
        <TrendingUp className="h-3.5 w-3.5" /> Trending
      </span>
      {tags.map(({ tag, n }) => {
        const on = active === tag;
        return (
          <button
            key={tag}
            onClick={() => onSelect?.(on ? null : tag)}
            className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${on ? "text-black" : "border border-white/10 bg-white/[0.04] text-white/70 hover:text-white"}`}
            style={on ? { background: "var(--brand)" } : undefined}
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