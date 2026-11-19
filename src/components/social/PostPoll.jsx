import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export default function PostPoll({ post, onVoted }) {
  const options = post.poll_options || [];
  const [rows, setRows] = useState([]);
  const [meId, setMeId] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([
      base44.entities.PollVote.filter({ post_id: post.id }, { limit: 500 }).catch(() => []),
      base44.auth.me().catch(() => null),
    ]).then(([votes, me]) => {
      if (!alive) return;
      setRows(Array.isArray(votes) ? votes : votes?.items || []);
      setMeId(me?.id || null);
    });
    return () => { alive = false; };
  }, [post.id]);

  if (!options.length) return null;

  const total = rows.length;
  const countOf = (i) => rows.filter((r) => r.option_index === i).length;
  const mine = meId ? rows.find((r) => r.created_by_id === meId) : null;
  const voted = mine ? mine.option_index : null;
  const show = voted !== null && voted !== undefined;

  const vote = async (i) => {
    if (voted !== null || busy) return;
    setBusy(true);
    try {
      const rec = await base44.entities.PollVote.create({ post_id: post.id, option_index: i });
      setRows((prev) => [...prev, { ...rec, option_index: i, created_by_id: meId }]);
      onVoted?.();
    } catch {}
    setBusy(false);
  };

  return (
    <div className="mt-2 space-y-1.5">
      {options.map((o, i) => {
        const count = countOf(i);
        const pct = total ? Math.round((count / total) * 100) : 0;
        return (
          <button
            key={i}
            onClick={() => vote(i)}
            disabled={show || busy}
            className={`relative w-full h-9 rounded-xl border overflow-hidden text-left px-3 ${voted === i ? "border-[color:var(--brand)]" : "border-white/12"} ${show ? "cursor-default" : "hover:border-white/30"}`}
          >
            {show && <span className="absolute inset-y-0 left-0 bg-[color:var(--brand)]/25" style={{ width: `${pct}%` }} />}
            <span className="relative flex items-center justify-between gap-2 text-[12.5px]">
              <span className="truncate font-medium">{o.label}</span>
              {show && <span className="tabular-nums text-white/70 shrink-0">{pct}%</span>}
            </span>
          </button>
        );
      })}
      <p className="text-[11px] text-white/45">
        {total} {total === 1 ? "vote" : "votes"}{show ? " · you voted" : " · tap to vote"}
      </p>
    </div>
  );
}