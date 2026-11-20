import React, { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext(null);

const TAB_KEYS = ["feed", "news", "dating", "eats", "rides", "market", "finance", "music", "movies", "video", "radio", "gaming", "cloud", "email", "sheets", "calculator", "calendar", "browser", "assistant"];

const defaults = {
  background: "trails", // trails | planets | orbit | space | aurora | waves | mesh | gradient | black
  navStyle: "dock", // top (top bar) | dock (bottom bar)
  barStyle: "floating", // floating (rounded pill) | classic (full-width taskbar)
  density: "comfortable", // comfortable | compact
  hiddenTabs: {},
  dockOrder: [], // user-arranged nav order
  stripeLink: "https://buy.stripe.com/test_eVq14ndV84pJ5G6aC1bQY00",
  hideFloatingAssistant: false,
  accent: "ocean", // ocean (apple blue) | purple | blue | red | orange
  sounds: { notification: true, reminder: true, startup: true },
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem("zync_settings");
      if (!raw) return { ...defaults };
      const saved = { ...defaults, ...JSON.parse(raw) };
      if (!saved.accent) saved.accent = "ocean";
      if (!saved.stripeLink) saved.stripeLink = defaults.stripeLink;
      if (!saved.density) saved.density = defaults.density;
      if (!saved.barVersion) { saved.navStyle = "dock"; saved.barVersion = 2; }
      if (!saved.bgVersion || saved.bgVersion < 2) { saved.background = "trails"; saved.bgVersion = 2; }
      return saved;
    } catch { return { ...defaults }; }
  });

  useEffect(() => {
    localStorage.setItem("zync_settings", JSON.stringify(settings));
    document.documentElement.dataset.accent = settings.accent || "blue";
  }, [settings]);

  const update = (patch) => setSettings((s) => ({ ...s, ...patch }));

  const reset = () => setSettings({ ...defaults });

  const toggleTab = (key) =>
    setSettings((s) => ({ ...s, hiddenTabs: { ...s.hiddenTabs, [key]: !s.hiddenTabs[key] } }));

  return (
    <SettingsContext.Provider value={{ settings, update, reset, toggleTab, tabKeys: TAB_KEYS }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) return { settings: defaults, update: () => {}, reset: () => {}, toggleTab: () => {}, tabKeys: TAB_KEYS };
  return ctx;
}