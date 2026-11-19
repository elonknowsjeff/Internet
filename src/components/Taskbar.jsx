import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { LogOut, User, Settings as SettingsIcon, LogIn, UserPlus, CircleUserRound, LayoutGrid } from "lucide-react";
import { useSettings } from "@/components/SettingsContext";
import { ALL_APPS } from "@/lib/navApps";
import TranslatorPanel from "@/components/TranslatorPanel";
import AppsMenu from "@/components/os/AppsMenu";
import DockIcon from "@/components/os/DockIcon";

// The dock is grouped the way the catalogue is: social, entertainment, tech.
const GROUPS = [
  { name: "Social", keys: ["feed", "messages", "dating"] },
  { name: "Entertainment", keys: ["music", "movies", "video", "radio"] },
  { name: "Tech", keys: ["assistant", "cloud", "docs"] },
];

export default function Taskbar() {
  const location = useLocation();
  const { settings } = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const [translatorOpen, setTranslatorOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let unsub = null;
    base44.auth.me().then((u) => {
      setUser(u);
      base44.entities.DirectMessage.count({ receiver_id: u.id, read: false }).then(setUnread).catch(() => {});
      unsub = base44.entities.DirectMessage?.subscribe?.((e) => {
        const m = e?.data;
        if (e?.type === "create" && m?.receiver_id === u.id && m?.sender_id !== u.id) setUnread((n) => n + 1);
      });
    }).catch(() => setUser(null));
    return () => { if (typeof unsub === "function") unsub(); };
  }, []);

  useEffect(() => { setMenuOpen(false); setAppsOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.DirectMessage.count({ receiver_id: user.id, read: false }).then(setUnread).catch(() => {});
  }, [location.pathname, user?.id]);

  const classic = (settings.barStyle || "floating") === "classic";
  const appFor = (key) => ALL_APPS.find((a) => a.key === key);
  const visible = (key) => !settings.hiddenTabs?.[key];

  const logout = async () => {
    try { await base44.auth.logout(); } catch { window.location.href = "/"; }
  };

  const isActive = (to) => (to === "/" ? location.pathname === "/" : location.pathname.startsWith(to));

  return (
    <>
      {menuOpen && (
        <div className="fixed bottom-[86px] right-3 sm:right-[calc(50%-280px)] z-[56] w-60 rounded-2xl bg-[#141029]/[0.98] backdrop-blur-2xl border border-white/[0.09] shadow-[0_18px_60px_-16px_rgba(0,0,0,0.95)] overflow-hidden animate-slide-up">
          <div className="px-3.5 py-3 border-b border-white/[0.08]">
            <p className="text-sm font-semibold truncate">{user ? user.display_name || user.full_name || "Member" : "Browsing as a guest"}</p>
            <p className="text-[11px] text-white/45 truncate">{user ? user.email : "Sign in to save your work"}</p>
          </div>
          <div className="p-1.5 space-y-0.5">
            {!user && (
              <>
                <Link to="/login" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-white/[0.07]"><LogIn className="w-4 h-4 text-white/60" /> Sign in</Link>
                <Link to="/register" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-white/[0.07]"><UserPlus className="w-4 h-4 text-white/60" /> Create account</Link>
              </>
            )}
            {user && <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-white/[0.07]"><CircleUserRound className="w-4 h-4 text-white/60" /> My account</Link>}
            <Link to="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-white/[0.07]"><SettingsIcon className="w-4 h-4 text-white/60" /> Settings</Link>
            {user && (
              <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-rose-300 hover:bg-rose-500/15">
                <LogOut className="w-4 h-4" /> Log off
              </button>
            )}
          </div>
        </div>
      )}

      <AppsMenu open={appsOpen} onClose={() => setAppsOpen(false)} onTranslate={() => setTranslatorOpen(true)} />
      {translatorOpen && <TranslatorPanel onClose={() => setTranslatorOpen(false)} />}

      <footer className={`fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none ${classic ? "px-0 pb-0" : "px-2 pb-2"}`}>
        <div
          className={`pointer-events-auto w-full border border-white/[0.1] bg-[#0b0818]/90 backdrop-blur-2xl ${
            classic ? "max-w-none rounded-none border-x-0 border-b-0 px-3 py-2" : "max-w-[660px] rounded-[24px] px-3 py-2"
          }`}
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14), 0 20px 50px -26px rgba(0,0,0,1)" }}
        >
          <div className="flex items-start justify-center gap-3">
            {GROUPS.map((group, gi) => {
              const apps = group.keys.map(appFor).filter((a) => a && visible(a.key));
              if (!apps.length) return null;
              return (
                <React.Fragment key={group.name}>
                  {gi > 0 && <span className="mt-1.5 h-9 w-px shrink-0 bg-white/[0.09]" />}
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-start gap-1.5">
                      {apps.map((a) => (
                        <DockIcon
                          key={a.key}
                          appKey={a.key}
                          to={a.to}
                          label={a.label}
                          icon={a.icon}
                          active={isActive(a.to)}
                          badge={a.key === "messages" ? unread : 0}
                        />
                      ))}
                    </div>
                    <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/30">{group.name}</span>
                  </div>
                </React.Fragment>
              );
            })}

            <span className="mt-1.5 h-9 w-px shrink-0 bg-white/[0.09]" />

            <div className="flex flex-col items-center gap-1">
              <div className="flex items-start gap-1.5">
                <DockIcon appKey="apps" label="All apps" icon={LayoutGrid} onClick={() => setAppsOpen((v) => !v)} active={appsOpen} />
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="Account menu"
                  className={`group relative h-[34px] w-[34px] shrink-0 overflow-hidden rounded-[11px] border transition-all ${
                    menuOpen ? "border-white/60" : "border-white/20 hover:-translate-y-1"
                  }`}
                  style={{
                    backgroundImage: "linear-gradient(165deg, rgba(255,255,255,0.28), rgba(255,255,255,0.05))",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), 0 10px 20px -10px rgba(0,0,0,0.95)",
                  }}
                >
                  {user?.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : <User className="mx-auto h-[17px] w-[17px] text-white/80" />}
                </button>
              </div>
              <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/30">Account</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}