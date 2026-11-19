import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

const Ctx = createContext(null);

// Single global audio source that survives route changes and keeps playing
// in the background via the Media Session API.
export function AudioProvider({ children }) {
  const audioRef = useRef(null);
  const [current, setCurrent] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const simTimer = useRef(null);
  const currentRef = useRef(null);
  currentRef.current = current;

  const stopSim = useCallback(() => {
    if (simTimer.current) { clearInterval(simTimer.current); simTimer.current = null; }
  }, []);

  const startSim = useCallback((track) => {
    stopSim();
    setDuration(track.duration || 0);
    simTimer.current = setInterval(() => {
      setProgress((p) => {
        const np = p + 1;
        if (np >= (track.duration || 0)) {
          stopSim();
          setPlaying(false);
          setProgress(0);
          try { currentRef.current?.onEnded?.(); } catch (e) {}
          return 0;
        }
        return np;
      });
    }, 1000);
  }, [stopSim]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setProgress(a.currentTime || 0);
    const onDur = () => setDuration(a.duration && isFinite(a.duration) ? a.duration : 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => { setPlaying(false); setProgress(0); try { currentRef.current?.onEnded?.(); } catch (e) {} };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("durationchange", onDur);
    a.addEventListener("loadedmetadata", onDur);
    a.addEventListener("play", onPlay);
    a.addEventListener("playing", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("durationchange", onDur);
      a.removeEventListener("loadedmetadata", onDur);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("playing", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnded);
    };
  }, []);

  const play = useCallback((track) => {
    stopSim();
    const a = audioRef.current;
    setCurrent(track);
    setProgress(0);
    if (!track || (!track.src && !track.simulated)) { if (a) { a.pause(); a.removeAttribute("src"); } return; }
    if (track.simulated || !track.src) {
      if (a) { a.pause(); a.removeAttribute("src"); }
      setPlaying(true);
      startSim(track);
    } else {
      if (a) {
        a.src = track.src;
        a.volume = volume;
        a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      }
    }
  }, [stopSim, startSim, volume]);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    const cur = currentRef.current;
    if (!cur) return;
    if (cur.simulated || !cur.src) {
      if (playing) { stopSim(); setPlaying(false); }
      else { setPlaying(true); startSim(cur); }
      return;
    }
    if (a) { if (a.paused) a.play().catch(() => {}); else a.pause(); }
  }, [playing, stopSim, startSim]);

  const stop = useCallback(() => {
    stopSim();
    const a = audioRef.current;
    if (a) { a.pause(); a.removeAttribute("src"); try { a.load(); } catch (e) {} }
    setCurrent(null); setPlaying(false); setProgress(0); setDuration(0);
  }, [stopSim]);

  const seek = useCallback((t) => {
    const cur = currentRef.current;
    const a = audioRef.current;
    if (cur && (cur.simulated || !cur.src)) { setProgress(t); return; }
    if (a) { try { a.currentTime = t; } catch (e) {} setProgress(t); }
  }, []);

  const setVol = useCallback((v) => { setVolume(v); const a = audioRef.current; if (a) a.volume = v; }, []);

  // Media Session — lock screen / background controls
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    if (!current) { try { navigator.mediaSession.metadata = null; } catch (e) {} return; }
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: current.title || "",
        artist: current.subtitle || "",
        album: "Walza Plus",
        artwork: current.art ? [{ src: current.art, sizes: "512x512", type: "image/jpeg" }] : [],
      });
      navigator.mediaSession.setActionHandler("play", () => toggle());
      navigator.mediaSession.setActionHandler("pause", () => toggle());
      navigator.mediaSession.setActionHandler("stop", () => stop());
      navigator.mediaSession.playbackState = playing ? "playing" : "paused";
    } catch (e) {}
  }, [current, playing, toggle, stop]);

  return (
    <Ctx.Provider value={{ current, playing, progress, duration, volume, play, toggle, stop, seek, setVolume: setVol }}>
      <audio ref={audioRef} />
      {children}
    </Ctx.Provider>
  );
}

export function useAudio() {
  return useContext(Ctx);
}

export default AudioProvider;