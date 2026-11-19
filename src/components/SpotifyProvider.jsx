import React, { createContext, useContext, useState } from "react";
import SpotifyPlayer from "@/components/music/SpotifyPlayer";

const SpotifyContext = createContext({ open: () => {}, close: () => {} });

export function SpotifyProvider({ children }) {
  const [item, setItem] = useState(null);
  return (
    <SpotifyContext.Provider value={{ open: setItem, close: () => setItem(null) }}>
      {children}
      <SpotifyPlayer spotify={item} onClose={() => setItem(null)} />
    </SpotifyContext.Provider>
  );
}

export function useSpotify() {
  return useContext(SpotifyContext);
}