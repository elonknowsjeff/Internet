import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ALL_APPS } from "@/lib/navApps";
import WidgetShell from "@/components/feed/widgets/WidgetShell";

const PICKS = ["eats", "market", "music", "video", "movies", "news", "dating", "rides", "finance", "sheets", "assistant", "desktop"];

export default function AppsCard({ onHide }) {
  const apps = PICKS.map((k) => ALL_APPS.find((a) => a.key === k)).filter(Boolean);

  return (
    <WidgetShell title="Your apps" action={<span className="text-[10.5px] text-white/35">All in one</span>} onHide={onHide}>
      <div className="grid grid-cols-4 gap-1 px-2.5 pb-2">
        {apps.map((a) => (
          <Link
            key={a.key}
            to={a.to}
            className="group flex flex-col items-center gap-1 rounded-xl px-1 py-2 transition-colors hover:bg-white/[0.06]"
          >
            <span className="grid h-9 w-9 place-items-center rounded-[11px] border border-white/[0.09] bg-white/[0.05] text-white/65 transition-colors group-hover:border-white/25 group-hover:text-white">
              <a.icon className="h-[17px] w-[17px]" />
            </span>
            <span className="w-full truncate text-center text-[9.5px] leading-tight text-white/45 group-hover:text-white/75">{a.label}</span>
          </Link>
        ))}
      </div>
      <Link to="/desktop" className="flex items-center justify-between border-t border-white/[0.07] px-3.5 py-2 text-[11.5px] font-semibold text-white/55 hover:bg-white/[0.04] hover:text-white">
        Open the full launcher <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </WidgetShell>
  );
}