import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { CalendarDays, Loader2, MapPin, Sparkles, Ticket } from "lucide-react";

const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);

function EventCard({ item }) {
  return (
    <article className="rounded-2xl overflow-hidden gloss-strong">
      <div className="aspect-[16/10] bg-neutral-900">
        {item.image ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" /> : null}
      </div>
      <div className="p-3">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-[color:var(--brand)]">
          {item.kind === "idea" ? <Sparkles className="w-3 h-3" /> : <Ticket className="w-3 h-3" />}
          {item.category || (item.kind === "idea" ? "Date idea" : "Event")}
        </div>
        <p className="text-[13.5px] font-bold leading-tight mt-1">{item.title}</p>
        {item.description ? <p className="text-[11.5px] text-neutral-400 mt-1 line-clamp-2">{item.description}</p> : null}
        <div className="flex items-center gap-2 mt-2 text-[10.5px] text-neutral-400">
          {item.when ? <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {item.when}</span> : null}
          {item.city ? <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.city}</span> : null}
          {item.price ? <span className="ml-auto font-semibold text-white/70">{item.price}</span> : null}
        </div>
      </div>
    </article>
  );
}

export default function DateFeed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    base44.entities.DateEvent.list("-created_date", 40)
      .then((res) => { if (alive) setItems(asItems(res)); })
      .catch(() => { if (alive) setItems([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const events = items.filter((i) => i.kind !== "idea");
  const ideas = items.filter((i) => i.kind === "idea");

  if (loading) {
    return <div className="py-16 text-center text-neutral-400 text-sm"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" /> Loading dates…</div>;
  }

  return (
    <div className="space-y-5 mt-4">
      <section>
        <h2 className="text-[13px] font-bold flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5" style={{ color: "var(--brand)" }} /> Events near you
          <span className="text-[11px] font-normal text-neutral-500">· {events.length}</span>
        </h2>
        {events.length === 0 ? (
          <p className="text-[12px] text-neutral-500 mt-2">No events listed yet.</p>
        ) : (
          <div className="mt-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {events.map((e) => <EventCard key={e.id} item={e} />)}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-[13px] font-bold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--brand)" }} /> Date ideas
          <span className="text-[11px] font-normal text-neutral-500">· {ideas.length}</span>
        </h2>
        {ideas.length === 0 ? (
          <p className="text-[12px] text-neutral-500 mt-2">No ideas yet.</p>
        ) : (
          <div className="mt-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ideas.map((e) => <EventCard key={e.id} item={e} />)}
          </div>
        )}
      </section>
    </div>
  );
}