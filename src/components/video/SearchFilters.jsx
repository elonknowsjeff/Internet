import React from "react";
import { SlidersHorizontal, X } from "lucide-react";

const TYPES = [
  { k: "all", l: "All" },
  { k: "videos", l: "Videos" },
  { k: "shorts", l: "Shorts" },
];

const SORTS = [
  { k: "new", l: "Newest" },
  { k: "views", l: "Most viewed" },
  { k: "likes", l: "Most liked" },
];

function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
        active
          ? "bg-white text-black border-white"
          : "bg-white/[0.06] text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export default function SearchFilters({
  count,
  type,
  onType,
  sort,
  onSort,
  category,
  onCategory,
  categories = [],
  channel,
  onChannel,
  channels = [],
  onClear,
}) {
  const Row = ({ label, children }) => (
    <div className="flex items-start gap-2">
      <span className="w-16 shrink-0 pt-1.5 text-[10px] uppercase tracking-widest text-white/35">{label}</span>
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none flex-1 pb-0.5">{children}</div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-3 mb-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-white/60 flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
          <span className="text-white">{count}</span> result{count === 1 ? "" : "s"}
        </p>
        <button onClick={onClear} className="text-[11px] px-2 py-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 flex items-center gap-1">
          <X className="w-3 h-3" /> Clear
        </button>
      </div>

      <div className="mt-2.5 space-y-2">
        <Row label="Type">
          {TYPES.map((t) => (
            <Pill key={t.k} active={type === t.k} onClick={() => onType(t.k)}>{t.l}</Pill>
          ))}
        </Row>
        <Row label="Sort">
          {SORTS.map((s) => (
            <Pill key={s.k} active={sort === s.k} onClick={() => onSort(s.k)}>{s.l}</Pill>
          ))}
        </Row>
        <Row label="Category">
          {categories.map((c) => (
            <Pill key={c} active={category === c} onClick={() => onCategory(c)}>{c}</Pill>
          ))}
        </Row>
        {channels.length > 0 && (
          <Row label="Channel">
            <Pill active={!channel} onClick={() => onChannel("")}>Any</Pill>
            {channels.map((c) => (
              <Pill key={c.handle} active={channel === c.handle} onClick={() => onChannel(c.handle)}>{c.name}</Pill>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}