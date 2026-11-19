import React from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const INTERESTS = ["Music", "Travel", "Food", "Fitness", "Art", "Movies", "Coffee", "Hiking", "Gaming", "Books", "Dogs", "Cats", "Dancing", "Photography"];
const DISTANCES = [
  { v: 0, label: "Any distance" },
  { v: 5, label: "5 km" },
  { v: 10, label: "10 km" },
  { v: 25, label: "25 km" },
  { v: 50, label: "50 km" },
  { v: 100, label: "100 km" },
];

export default function DatingFilters({ filters, setFilters, onClose }) {
  const patch = (p) => setFilters((f) => ({ ...f, ...p }));
  const toggle = (i) =>
    patch({ interests: filters.interests.includes(i) ? filters.interests.filter((x) => x !== i) : [...filters.interests, i] });

  return (
    <div className="mt-3 rounded-2xl gloss-strong p-3.5 space-y-3.5 animate-pop-in">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-bold flex items-center gap-1.5"><SlidersHorizontal className="w-3.5 h-3.5" style={{ color: "var(--brand)" }} /> Filters</span>
        <button onClick={onClose} className="w-6 h-6 rounded-full grid place-items-center text-white/50 hover:bg-white/10" aria-label="Close filters">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between text-[11px] text-neutral-400">
          <span>Age</span>
          <span className="tabular-nums text-white/80">{filters.minAge} – {filters.maxAge}</span>
        </div>
        <Slider
          className="mt-2"
          min={18}
          max={70}
          step={1}
          minStepsBetweenThumbs={1}
          value={[filters.minAge, filters.maxAge]}
          onValueChange={([a, b]) => patch({ minAge: a, maxAge: b })}
        />
      </div>

      <div>
        <span className="text-[11px] text-neutral-400">Distance</span>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {DISTANCES.map((d) => (
            <button
              key={d.v}
              onClick={() => patch({ maxDistance: d.v })}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${filters.maxDistance === d.v ? "bg-white text-black border-white" : "border-white/15 text-white/70 hover:bg-white/10"}`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-[11px] text-neutral-400">Interests</span>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {INTERESTS.map((i) => (
            <button
              key={i}
              onClick={() => toggle(i)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${filters.interests.includes(i) ? "brand-grad text-black border-transparent" : "border-white/15 text-white/70 hover:bg-white/10"}`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setFilters({ minAge: 18, maxAge: 70, maxDistance: 0, interests: [] })}
        className="text-[11px] font-semibold text-neutral-400 hover:text-white"
      >
        Reset all
      </button>
    </div>
  );
}