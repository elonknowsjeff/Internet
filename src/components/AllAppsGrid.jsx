import React from "react";
import { Link } from "react-router-dom";
import { Grid3x3 } from "lucide-react";
import { NAV_SECTIONS } from "@/lib/navApps";

export default function AllAppsGrid() {
  return (
    <section className="mt-6 border-t border-white/10 pt-4">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Grid3x3 className="w-4 h-4 text-fuchsia-300" />
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white/70">All apps</h2>
      </div>
      <div className="space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.name}>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/35 mb-1.5 px-1">{section.name}</p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
              {section.items.map(({ key, to, label, icon: Icon }) => (
                <Link key={key} to={to} className="flex flex-col items-center gap-1.5 rounded-xl py-2.5 px-1 hover:bg-white/10 text-center">
                  <span className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                    <Icon className="w-[18px] h-[18px]" />
                  </span>
                  <span className="text-[10px] leading-tight text-white/70 truncate w-full">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}