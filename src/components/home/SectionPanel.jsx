import React from "react";
import { useNavigate } from "react-router-dom";

export default function SectionPanel({ title, icon: Icon, tint, apps }) {
  const navigate = useNavigate();
  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 py-4">
      <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025] neon-edge-soft">
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.03]">
          <span className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${tint} text-white`}>
            <Icon className="w-5 h-5" />
          </span>
          <h3 className="text-[15px] font-bold tracking-tight">{title}</h3>
          <span className="ml-auto flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          </span>
        </div>
        <div className="p-4 sm:p-5 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {apps.map((a) => (
            <button
              key={a.to}
              onClick={() => navigate(a.to)}
              className="group flex flex-col items-center gap-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl brand-grad text-black shadow-[0_8px_20px_-10px_var(--brand)] transition-transform group-hover:scale-105">
                <a.icon className="h-5 w-5" />
              </span>
              <span className="text-[12.5px] font-medium text-white/85">{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}