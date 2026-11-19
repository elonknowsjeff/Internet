import React, { useEffect, useState } from "react";
import { Crosshair, Copy, Globe2, Map as MapIcon, Navigation, Gauge, Share2, Loader2 } from "lucide-react";
import LiveRideMap from "@/components/rides/LiveRideMap";

export default function Gps() {
  const [pos, setPos] = useState(null);
  const [place, setPlace] = useState("");
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) { setErr("This device doesn't support geolocation."); setLoading(false); return; }
    const watch = navigator.geolocation.watchPosition(
      (p) => {
        const next = {
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          accuracy: p.coords.accuracy,
          speed: p.coords.speed,
          heading: p.coords.heading,
        };
        setPos(next);
        setLoading(false);
        setErr("");
      },
      () => { setErr("Location permission denied — allow location to use the GPS section."); setLoading(false); },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, []);

  useEffect(() => {
    if (!pos) return;
    let alive = true;
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`)
      .then((r) => r.json())
      .then((j) => { if (alive && j?.display_name) setPlace(j.display_name); })
      .catch(() => {});
    return () => { alive = false; };
  }, [pos?.lat, pos?.lng]);

  const mapsUrl = pos ? `https://www.google.com/maps/search/?api=1&query=${pos.lat},${pos.lng}` : "https://www.google.com/maps";
  const earthUrl = pos ? `https://earth.google.com/web/@${pos.lat},${pos.lng},200a,1200d,35y,0h,0t,0r` : "https://earth.google.com/web/";

  const copy = async () => {
    if (!pos) return;
    try { await navigator.clipboard.writeText(`${pos.lat}, ${pos.lng}`); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch (e) {}
  };

  const share = async () => {
    if (!pos) return;
    try { await navigator.share({ title: "My live location", text: place || "My location", url: mapsUrl }); } catch (e) {}
  };

  const speedKmh = pos?.speed != null ? Math.max(0, pos.speed * 3.6) : null;

  return (
    <div className="max-w-3xl mx-auto pb-28">
      <header className="sticky top-0 z-30 bg-white/10 backdrop-blur-2xl border-b border-white/15 px-4 py-3 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold font-display flex items-center gap-2"><Crosshair className="w-5 h-5 text-emerald-300" /> GPS</h1>
          <p className="text-xs text-white/60">Your live position, accuracy and heading</p>
        </div>
        <div className="flex items-center gap-1.5">
          <a href={earthUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold hover:bg-white/20"><Globe2 className="w-3.5 h-3.5" /> Earth</a>
          <a href={mapsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold hover:bg-white/20"><MapIcon className="w-3.5 h-3.5" /> Maps</a>
        </div>
      </header>

      <div className="p-4 space-y-3">
        <div className="relative rounded-2xl overflow-hidden border border-white/15">
          {pos ? <LiveRideMap riderLocation={pos} height="h-72" /> : (
            <div className="h-72 flex items-center justify-center bg-white/5 text-sm text-white/60">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Getting a GPS fix…</> : err || "Waiting for a location…"}
            </div>
          )}
        </div>

        {err && <p className="text-sm text-rose-300">{err}</p>}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="glass-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-white/50">Latitude</p>
            <p className="font-mono text-sm">{pos ? pos.lat.toFixed(5) : "—"}</p>
          </div>
          <div className="glass-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-white/50">Longitude</p>
            <p className="font-mono text-sm">{pos ? pos.lng.toFixed(5) : "—"}</p>
          </div>
          <div className="glass-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-white/50">Accuracy</p>
            <p className="font-mono text-sm flex items-center gap-1"><Gauge className="w-3.5 h-3.5 text-emerald-300" /> {pos ? `±${Math.round(pos.accuracy)} m` : "—"}</p>
          </div>
          <div className="glass-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-white/50">Speed</p>
            <p className="font-mono text-sm flex items-center gap-1"><Navigation className="w-3.5 h-3.5 text-cyan-300" /> {speedKmh != null ? `${speedKmh.toFixed(1)} km/h` : "—"}</p>
          </div>
        </div>

        {place && (
          <div className="glass-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-white/50 mb-1">Nearest place</p>
            <p className="text-sm">{place}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button onClick={copy} disabled={!pos} className="py-2.5 rounded-full bg-white/10 border border-white/15 text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40"><Copy className="w-4 h-4" /> {copied ? "Copied" : "Copy coordinates"}</button>
          <button onClick={share} disabled={!pos} className="py-2.5 rounded-full brand-grad text-black text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-40"><Share2 className="w-4 h-4" /> Share location</button>
        </div>
        <p className="text-[11px] text-white/45 text-center">Uses your device's own GPS. Nothing is stored while this page is open.</p>
      </div>
    </div>
  );
}