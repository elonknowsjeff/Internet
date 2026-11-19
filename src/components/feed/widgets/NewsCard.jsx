import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import WidgetShell from "@/components/feed/widgets/WidgetShell";

const CACHE = "si_headlines_v1";
const TTL = 15 * 60 * 1000;

function cached() {
  try {
    const raw = JSON.parse(sessionStorage.getItem(CACHE) || "null");
    if (raw && Date.now() - raw.ts < TTL && raw.items?.length) return raw.items;
  } catch (e) {}
  return null;
}

export default function NewsCard({ onHide }) {
  const [items, setItems] = useState(() => cached() || []);
  const [loading, setLoading] = useState(!cached());

  useEffect(() => {
    if (items.length) return;
    let alive = true;
    (async () => {
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: "Return the 5 biggest news headlines right now. For each: a short specific headline, the publisher, and one category (world, tech, ai, business, science, sports, entertainment, health, politics). Under 90 characters per headline.",
          add_context_from_internet: true,
          model: "gemini_3_flash",
          response_json_schema: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: { headline: { type: "string" }, source: { type: "string" }, category: { type: "string" } },
                },
              },
            },
          },
        });
        const list = (res?.items || []).slice(0, 5);
        if (!alive) return;
        setItems(list);
        try { sessionStorage.setItem(CACHE, JSON.stringify({ ts: Date.now(), items: list })); } catch (e) {}
      } catch (e) {}
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [items.length]);

  return (
    <WidgetShell title="What's happening" action={<span className="text-[10.5px] text-white/35">Live</span>} onHide={onHide}>
      {loading ? (
        <div className="flex items-center gap-2 px-3.5 py-6 text-[12px] text-white/40"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Fetching headlines…</div>
      ) : items.length === 0 ? (
        <p className="px-3.5 py-5 text-[12px] text-white/40">Headlines are unavailable right now.</p>
      ) : (
        <div>
          {items.map((n, i) => (
            <Link key={`${n.headline}-${i}`} to="/news" className="block border-t border-white/[0.06] px-3.5 py-2 first:border-0 hover:bg-white/[0.04]">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/30">{n.category || "news"} · trending</p>
              <p className="mt-0.5 line-clamp-2 text-[12.5px] font-semibold leading-snug text-white/90">{n.headline}</p>
              {n.source && <p className="mt-0.5 truncate text-[10.5px] text-white/35">{n.source}</p>}
            </Link>
          ))}
          <Link to="/news" className="block border-t border-white/[0.07] px-3.5 py-2 text-[11.5px] font-semibold text-white/55 hover:bg-white/[0.04] hover:text-white">
            See the full news table
          </Link>
        </div>
      )}
    </WidgetShell>
  );
}