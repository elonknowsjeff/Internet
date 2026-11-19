import React, { createContext, useContext, useState, useCallback } from "react";

const Ctx = createContext(null);

// Global suspendable video player: a video popped out here keeps playing
// in a floating mini window while the user browses other pages.
export function VideoPlayerProvider({ children }) {
  const [current, setCurrent] = useState(null);
  const [minimized, setMinimized] = useState(false);

  const play = useCallback((video) => {
    setCurrent(video);
    setMinimized(false);
  }, []);

  const close = useCallback(() => { setCurrent(null); setMinimized(false); }, []);
  const minimize = useCallback(() => setMinimized(true), []);
  const restore = useCallback(() => setMinimized(false), []);

  return (
    <Ctx.Provider value={{ current, minimized, play, close, minimize, restore }}>
      {children}
    </Ctx.Provider>
  );
}

export function useVideoPlayer() {
  return useContext(Ctx);
}

export default VideoPlayerProvider;