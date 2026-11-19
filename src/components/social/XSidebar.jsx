import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Home, Search, Mail, UserPlus, User, Settings as SettingsIcon, LogOut, PenSquare, LogIn, Music2 } from "lucide-react";

const items = (unread) => [
  { label: "Home", to: "/", icon: Home },
  { label: "Search", action: "search", icon: Search },
  { label: "Messages", to: "/messages", icon: Mail, badge: unread },
  { label: "Follow", action: "follow", icon: UserPlus },
  { label: "Music", to: "/music", icon: Music2 },
  { label: "Profile", to: "/profile", icon: User },
  { label: "Settings", to: "/settings", icon: SettingsIcon },
];

export default function XSidebar({ user, name, avatar, onCompose, onAvatarClick, onSearch, onFollow }) {
  const { pathname } = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.DirectMessage.count({ receiver_id: user.id, read: false }).then(setUnread).catch(() => {});
  }, [user?.id, pathname]);

  const logout = async () => {
    try { await base44.auth.logout(); } catch { window.location.href = "/"; }
  };

  return (
    <aside className="hidden lg:flex flex-col sticky top-0 h-[calc(100vh-92px)] shrink-0 w-[74px] xl:w-[248px] pl-1 pr-2 pb-3">
      <nav className="mt-2 space-y-0.5">
        {items(unread).map(({ label, to, action, icon: Icon, badge }) => {
          const active = to ? (to === "/" ? pathname === "/" : pathname.startsWith(to)) : false;
          const inner = (
            <>
              <span className="relative">
                <Icon className={`w-[25px] h-[25px] ${active ? "text-white" : "text-white/80"}`} strokeWidth={active ? 2.7 : 1.9} />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[color:var(--brand)] text-white text-[10px] font-bold grid place-items-center">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </span>
              <span className={`hidden xl:inline text-[19px] ${active ? "font-extrabold text-white" : "text-white/85"}`}>{label}</span>
            </>
          );
          const cls = "flex items-center gap-4 w-fit xl:w-[90%] px-3 py-2.5 rounded-full hover:bg-white/10 transition-colors";
          return to ? (
            <Link key={label} to={to} title={label} className={cls}>{inner}</Link>
          ) : (
            <button
              key={label}
              onClick={action === "search" ? onSearch : onFollow}
              title={label}
              className={cls}
            >
              {inner}
            </button>
          );
        })}
      </nav>

      <button
        onClick={onCompose}
        className="mt-3 h-[50px] w-[50px] xl:w-[90%] rounded-full bg-white text-black font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
        title="Post"
      >
        <PenSquare className="w-5 h-5 xl:hidden" />
        <span className="hidden xl:inline">Post</span>
      </button>

      <div className="mt-auto pt-4">
        <div className="flex items-center gap-2.5 rounded-full p-2 xl:pr-3 hover:bg-white/10 transition-colors">
          <button onClick={onAvatarClick} title="Change profile photo" className="shrink-0">
            {avatar ? (
              <img src={avatar} alt="" className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10" />
            ) : (
              <span className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-500 flex items-center justify-center text-black text-sm font-bold">
                {(name || "S")[0]?.toUpperCase()}
              </span>
            )}
          </button>
          <div className="min-w-0 flex-1 hidden xl:block">
            <p className="text-sm font-bold truncate leading-tight">{user ? name : "Browsing as guest"}</p>
            <p className="text-[13px] text-white/45 truncate leading-tight">@{user ? (user.username || user.email?.split("@")[0]) : "guest"}</p>
          </div>
          {user ? (
            <button onClick={logout} title="Log off" className="hidden xl:grid w-8 h-8 rounded-full place-items-center text-white/50 hover:text-rose-300 hover:bg-rose-500/10">
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          ) : (
            <Link to="/login" title="Sign in" className="hidden xl:flex px-3 py-1.5 rounded-full bg-white text-black text-[13px] font-bold items-center gap-1.5">
              <LogIn className="w-3.5 h-3.5" /> Sign in
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}