import React from "react";
import { Plane, Clock, ArrowRight } from "lucide-react";

export default function FlightCard({ flight, index, cabin, onSelect }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[.03] p-4 hover:border-cyan-400/40 transition">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-400/15 border border-cyan-300/25 flex items-center justify-center shrink-0">
          <Plane className="w-5 h-5 text-cyan-200" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold truncate">{flight.airline}</p>
            <p className="text-[11px] text-neutral-500">{flight.flight_number}</p>
          </div>
          <p className="text-[11px] text-neutral-400">{cabin} · {flight.stops === 0 ? "Nonstop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}</p>

          <div className="flex items-center gap-2 mt-2.5">
            <div>
              <p className="text-lg font-bold leading-none tabular-nums">{flight.depart_time}</p>
              <p className="text-[10px] text-neutral-500 mt-0.5">{flight.from_code}</p>
            </div>
            <div className="flex-1 flex items-center gap-1.5 text-neutral-500">
              <span className="h-px flex-1 bg-white/15" />
              <span className="text-[10px] flex items-center gap-1"><Clock className="w-3 h-3" /> {flight.duration}</span>
              <ArrowRight className="w-3 h-3" />
            </div>
            <div className="text-right">
              <p className="text-lg font-bold leading-none tabular-nums">{flight.arrive_time}</p>
              <p className="text-[10px] text-neutral-500 mt-0.5">{flight.to_code}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
        <p className="text-lg font-black">${Number(flight.price).toFixed(0)}<span className="text-[11px] font-medium text-neutral-500"> /person</span></p>
        <button onClick={() => onSelect(flight, index)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black text-xs font-bold">
          Select
        </button>
      </div>
    </article>
  );
}