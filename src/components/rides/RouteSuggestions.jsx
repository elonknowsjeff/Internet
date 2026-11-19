import React from "react";
import { Plane, TrainFront, Briefcase, Home, Hospital, GraduationCap } from "lucide-react";

const ROUTES = [
  { from: "Union Station, Toronto", to: "Toronto Pearson Airport", label: "Airport run", mins: 32, icon: Plane },
  { from: "Yonge & Dundas Square", to: "Distillery District", label: "Night out", mins: 12, icon: TrainFront },
  { from: "Downtown Toronto", to: "Downtown Toronto", label: "Commute to work", mins: 18, icon: Briefcase },
  { from: "Toronto Pearson Airport", to: "Downtown Toronto", label: "Back home", mins: 34, icon: Home },
  { from: "Toronto", to: "Mount Sinai Hospital", label: "Hospital visit", mins: 14, icon: Hospital },
  { from: "Toronto", to: "University of Toronto", label: "Campus", mins: 16, icon: GraduationCap },
];

export default function RouteSuggestions({ onPick }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-white/55 mb-2">Recommended routes</h3>
      <div className="grid grid-cols-2 gap-2">
        {ROUTES.map((r) => {
          const Icon = r.icon;
          return (
            <button
              key={r.label}
              onClick={() => onPick(r)}
              className="glass-card px-3 py-2.5 text-left hover:border-white/35 transition-colors"
            >
              <div className="flex items-center gap-2 text-[11px] text-fuchsia-200"><Icon className="w-3.5 h-3.5" /> {r.label} · {r.mins} min</div>
              <p className="text-xs mt-1 leading-snug line-clamp-2">{r.from} → {r.to}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}