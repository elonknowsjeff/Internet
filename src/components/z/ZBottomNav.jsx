import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home as HomeIcon, Compass, Play, Bell, User, Plus } from "lucide-react";

const ITEMS = [
  { to: "/z", label: "Home", icon: HomeIcon, exact: true },
  { to: "/z/explore", label: "Explore", icon: Compass },
  { to: "/z/reels", label: "Reels", icon: Play },
  { to: "/z/notifications", label: "Alerts", icon: Bell },
  { to: "/z/profile", label: "Profile", icon: User },
];

export default function ZBottomNav() {
  const { pathname } = useLocation();
  const active = (it) => (it.exact ? pathname === it.to : pathname.startsWith(it.to));
  return (
    <nav className="md:hidden fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-[#2f3336] bg-black px-1 pb-[calc(6px+env(safe-area-inset-bottom))] pt-1.5">
      {ITEMS.slice(0, 2).map((it) => <NavBtn key={it.to} it={it} active={active(it)} />)}
      <Link
        to="/upload"
        className="grid h-11 w-11 -translate-y-1 place-items-center rounded-full bg-white text-black shadow-lg active:scale-95"
        aria-label="Create"
      >
        <Plus className="h-5 w-5" strokeWidth={2.6} />
      </Link>
      {ITEMS.slice(2).map((it) => <NavBtn key={it.to} it={it} active={active(it)} />)}
    </nav>
  );
}

function NavBtn({ it, active }) {
  const Icon = it.icon;
  return (
    <Link to={it.to} className="flex flex-1 flex-col items-center gap-0.5 py-1">
      <Icon
        className="h-6 w-6"
        strokeWidth={active ? 2.5 : 1.8}
        style={{ color: active ? "#fff" : "rgba(255,255,255,0.55)" }}
      />
      <span className="text-[9px] font-medium" style={{ color: active ? "#fff" : "rgba(255,255,255,0.45)" }}>
        {it.label}
      </span>
    </Link>
  );
}