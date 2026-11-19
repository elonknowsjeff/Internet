import React, { useState } from "react";
import { LayoutGrid } from "lucide-react";
import ProCard from "@/components/feed/widgets/ProCard";
import AppsCard from "@/components/feed/widgets/AppsCard";
import NewsCard from "@/components/feed/widgets/NewsCard";
import SpacesCard from "@/components/feed/widgets/SpacesCard";
const ORDER = ["pro", "news", "spaces", "apps"];
const STORE = "si_widgets_hidden";

export default function WidgetsRail({ user }) {
  const [hidden, setHidden] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORE) || "[]"); } catch { return []; }
  });

  const hide = (key) =>
    setHidden((prev) => {
      const next = [...new Set([...prev, key])];
      try { localStorage.setItem(STORE, JSON.stringify(next)); } catch (e) {}
      return next;
    });

  const reset = () => {
    try { localStorage.setItem(STORE, "[]"); } catch (e) {}
    setHidden([]);
  };

  const cards = {
    pro: <ProCard user={user} onHide={() => hide("pro")} />,
    news: <NewsCard onHide={() => hide("news")} />,
    spaces: <SpacesCard onHide={() => hide("spaces")} />,
    apps: <AppsCard onHide={() => hide("apps")} />,
  };

  const visible = ORDER.filter((k) => !hidden.includes(k));

  return (
    <aside className="hidden w-[320px] shrink-0 xl:block">
      <div className="sticky top-2 flex max-h-[calc(100dvh-16px)] flex-col gap-2.5 overflow-y-auto pb-24 pr-1 scrollbar-none">
        {visible.map((k) => (
          <div key={k}>{cards[k]}</div>
        ))}
        {visible.length === 0 && (
          <button onClick={reset} className="flex items-center justify-center gap-1.5 rounded-2xl panel px-3 py-4 text-[12px] font-semibold text-white/55 hover:text-white">
            <LayoutGrid className="h-4 w-4" /> Bring back your widgets
          </button>
        )}
      </div>
    </aside>
  );
}