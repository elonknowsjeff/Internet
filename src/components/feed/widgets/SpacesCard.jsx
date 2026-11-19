import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Headphones, Radio, Users } from "lucide-react";
import WidgetShell from "@/components/feed/widgets/WidgetShell";

export default function SpacesCard({ onHide }) {
  const [spaces, setSpaces] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    base44.entities.LiveStream.filter({ is_live: true }, { limit: 5 })
      .then((res) => { if (alive) setSpaces(Array.isArray(res) ? res : res?.items || []); })
      .catch(() => {})
      .finally(() => { if (alive) setLoaded(true); });
    return () => { alive = false; };
  }, []);

  return (
    <WidgetShell title="Spaces" action={<span className="text-[10.5px] text-white/35">Live audio</span>} onHide={onHide}>
      {!loaded ? (
        <p className="px-3.5 py-5 text-[12px] text-white/35">Looking for live rooms…</p>
      ) : spaces.length === 0 ? (
        <div className="px-3.5 pb-3.5">
          <p className="text-[12px] leading-snug text-white/45">No one is hosting right now. Start a room and invite people in.</p>
          <Link to="/video" className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[11.5px] font-semibold hover:bg-white/10">
            <Radio className="h-3.5 w-3.5" /> Start a space
          </Link>
        </div>
      ) : (
        <div>
          {spaces.map((s) => (
            <Link key={s.id} to="/video" className="flex items-center gap-2.5 border-t border-white/[0.06] px-3.5 py-2 first:border-0 hover:bg-white/[0.04]">
              <span className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10">
                {s.host_avatar ? <img src={s.host_avatar} alt="" className="h-full w-full object-cover" /> : <Headphones className="h-4 w-4 text-white/60" />}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0b0819]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-semibold">{s.title}</span>
                <span className="block truncate text-[10.5px] text-white/40">{s.host_name} · {s.category}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-[10.5px] text-white/45"><Users className="h-3 w-3" /> {s.viewers || 0}</span>
            </Link>
          ))}
          <Link to="/video" className="block border-t border-white/[0.07] px-3.5 py-2 text-[11.5px] font-semibold text-white/55 hover:bg-white/[0.04] hover:text-white">
            All spaces
          </Link>
        </div>
      )}
    </WidgetShell>
  );
}