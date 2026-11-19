import React, { useEffect, useMemo, useState } from "react";
import { Car, Star, Navigation, MapPin, Gauge, Crosshair } from "lucide-react";
import LiveRideMap from "@/components/rides/LiveRideMap";

const rad = (d) => (d * Math.PI) / 180;
const km = (a, b) => {
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};
const lerp = (a, b, t) => ({ lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t });

const DEFAULT_PICKUP = { lat: 43.6532, lng: -79.3832 };
const DEFAULT_DEST = { lat: 43.7001, lng: -79.4163 };
const APPROACH = 0.35;

export default function RideTracker({ pickup, destination, driverName, vehicle, rating, etaMinutes = 5 }) {
  const origin = pickup || DEFAULT_PICKUP;
  const dest = destination || DEFAULT_DEST;
  const driverStart = useMemo(() => ({ lat: origin.lat + 0.016, lng: origin.lng - 0.014 }), [origin.lat, origin.lng]);
  const [progress, setProgress] = useState(0);
  const [riderLocation, setRiderLocation] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setProgress((p) => Math.min(1, p + 0.02)), 1000);
    return () => clearInterval(id);
  }, []);

  // real device location, streamed live while the trip runs
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watch = navigator.geolocation.watchPosition(
      (pos) => setRiderLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, []);

  const approaching = progress < APPROACH;
  const position = approaching ? lerp(driverStart, origin, progress / APPROACH) : lerp(origin, dest, (progress - APPROACH) / (1 - APPROACH));
  const target = approaching ? origin : dest;
  const remainingKm = km(position, target);
  const remainingMin = Math.max(0, Math.ceil((1 - progress) * (etaMinutes + 14)));
  const arrived = progress >= 1;
  const plate = `WZ ${String((Math.abs((driverName || "M").charCodeAt(0) * 371) % 9000) + 1000)}`;

  return (
    <div className="mt-4 text-left">
      <div className="rounded-2xl overflow-hidden border border-violet-400/25 shadow-[0_20px_60px_-25px_rgba(168,85,247,0.7)]">
        <div className="relative">
          <LiveRideMap pickup={origin} destination={dest} car={position} riderLocation={riderLocation} />
          <div className="absolute z-[500] top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur text-[11px] flex items-center gap-1.5 border border-white/10">
            <span className={`w-1.5 h-1.5 rounded-full ${arrived ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
            {arrived ? "Arrived" : approaching ? "Driver heading to pickup" : "On the way"}
          </div>
          <div className="absolute z-[500] top-3 right-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur text-[11px] flex items-center gap-1.5 border border-white/10">
            <Crosshair className={`w-3 h-3 ${riderLocation ? "text-sky-400" : "text-neutral-500"}`} />
            {riderLocation ? `GPS ±${Math.round(riderLocation.accuracy || 0)}m` : "GPS off"}
          </div>
        </div>

        <div className="bg-black/50 backdrop-blur px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-700 flex items-center justify-center font-bold">{(driverName || "M")[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{driverName || "Marcus"}</p>
              <p className="text-[11px] text-neutral-400 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {(rating || 4.9).toFixed(1)} · {vehicle || "Toyota Prius"} · {plate}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black leading-none">{arrived ? "0" : remainingMin}<span className="text-xs font-semibold"> min</span></p>
              <p className="text-[10px] text-neutral-400">{arrived ? "at destination" : `${remainingKm.toFixed(1)} km away`}</p>
            </div>
          </div>

          <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-all duration-1000" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-neutral-300">
            <p className="flex items-center gap-1.5 truncate"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> Pickup</p>
            <p className="flex items-center gap-1.5 truncate"><Navigation className="w-3.5 h-3.5 text-rose-400" /> Destination</p>
            <p className="flex items-center gap-1.5"><Car className="w-3.5 h-3.5 text-violet-300" /> {approaching ? "Approaching pickup" : "Trip in progress"}</p>
            <p className="flex items-center gap-1.5"><Gauge className="w-3.5 h-3.5 text-amber-300" /> Live 1-to-1 tracking</p>
          </div>
        </div>
      </div>
    </div>
  );
}