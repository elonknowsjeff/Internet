import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Mail, Sparkles, UserRound, Settings, Plus } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const ITEMS = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/news", label: "Explore", Icon: Compass },
  { to: "/messages", label: "Messages", Icon: Mail },
  { to: "/assistant", label: "AI assistant", Icon: Sparkles },
  { to: "/profile", label: "Profile", Icon: UserRound },
  { to: "/settings", label: "Settings", Icon: Settings },
];

export default function MessagesXNav({ unread = 0, onCompose }) {
  const { pathname } = useLocation();

  return (
    <nav className="hidden md:flex flex-col items-center w-[74px] shrink-0 h-full border-r border-fuchsia-300/15 bg-[#150b2b]/70 py-3">
      <Link to="/" title="Valo" className="mb-3">
        <BrandLogo size={30} />
      </Link>

      {ITEMS.map(({ to, label, Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            title={label}
            className={`relative w-11 h-11 mb-1 rounded-full grid place-items-center transition-colors ${
              active ? "bg-white/15 text-white" : "text-white/55 hover:text-white hover:bg-white/10"
            }`}
          >
            <Icon className="w-[20px] h-[20px]" />
            {to === "/messages" && unread > 0 && (
              <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-fuchsia-500 text-black text-[10px] font-bold grid place-items-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
            {active && <span className="absolute -left-[9px] top-2.5 bottom-2.5 w-[3px] rounded-full brand-grad" />}
          </Link>
        );
      })}

      <button
        onClick={onCompose}
        title="New message"
        className="mt-2 w-11 h-11 rounded-full brand-grad text-black grid place-items-center hover:brightness-110 transition"
      >
        <Plus className="w-5 h-5" />
      </button>
    </nav>
  );
}