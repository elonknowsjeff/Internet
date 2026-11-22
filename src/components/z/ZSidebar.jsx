import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home as HomeIcon, Compass, Play, MessageSquare, Bell, CreditCard, User, Plus,
} from "lucide-react";
import ZLogo from "@/components/z/ZLogo";

const ITEMS = [
  { to: "/z", label: "Home", icon: HomeIcon, exact: true },
  { to: "/z/explore", label: "Explore", icon: Compass },
  { to: "/z/reels", label: "Reels", icon: Play },
  { to: "/z/messages", label: "Messages", icon: MessageSquare },
  { to: "/z/notifications", label: "Notifications", icon: Bell },
  { to: "/z/wallet", label: "Wallet", icon: CreditCard },
  { to: "/z/profile", label: "Profile", icon: User },
];

export default function ZSidebar() {
  const { pathname } = useLocation();
  const active = (it) => (it.exact ? pathname === it.to : pathname.startsWith(it.to));
  return (
    <aside className="hidden md:flex fixed left-0 top-0 z-40 h-[100dvh] w-[76px] flex-col items-center gap-1 border-r border-[#2f3336] bg-black px-2 py-4">
      <Link to="/z" className="mb-3 text-white" aria-label="Z">
        <ZLogo size={26} />
      </Link>

      <Link
        to="/upload"
        className="mb-2 grid h-11 w-11 place-items-center rounded-full bg-white text-black shadow-[0_0_0_1px_rgba(255,255,255,0.15)] transition-transform active:scale-95 hover:scale-105"
        title="Create"
      >
        <Plus className="h-5 w-5" strokeWidth={2.6} />
      </Link>

      {ITEMS.map((it) => {
        const on = active(it);
        const Icon = it.icon;
        return (
          <Link
            key={it.to}
            to={it.to}
            title={it.label}
            className={`group relative grid h-11 w-11 place-items-center rounded-full transition-colors ${
              on ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <Icon className="h-[22px] w-[22px]" strokeWidth={on ? 2.4 : 1.9} />
            <span className="pointer-events-none absolute left-[110%] z-50 whitespace-nowrap rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-black opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              {it.label}
            </span>
          </Link>
        );
      })}
    </aside>
  );
}