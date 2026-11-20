import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Star, Clock, Users, ChevronLeft, LocateFixed, Phone, MessageSquare, CreditCard, Check, Loader2, ShieldCheck, Car, Share2, ExternalLink } from "lucide-react";
import LiveRideMap from "@/components/rides/LiveRideMap";
import AddressField from "@/components/rides/AddressField";
import { RIDE_TIERS } from "@/lib/rideTiers";
import { startCheckout } from "@/lib/checkout";
import { roadRoute } from "@/lib/routes";

const DRIVERS = [
  { name: "Marcus", rating: 4.94, car: "Toyota Prius", plate: "CXR 482", tone: "from-neutral-700 to-neutral-900" },
  { name: "Elena", rating: 4.89, car: "Honda Accord", plate: "BKT 119", tone: "from-indigo-600 to-violet-800" },
  { name: "James", rating: 4.97, car: "Mercedes E-Class", plate: "AXL 903", tone: "from-slate-600 to-slate-900" },
  { name: "Priya", rating: 4.92, car: "Toyota Sienna", plate: "DMV 447", tone: "from-rose-600 to-fuchsia-800" },
];

const CO_RIDERS = [
  { name: "Alex M.", stop: "Bloor St", rating: 4.8 },
  { name: "Sam T.", stop: "Union Station", rating: 4.9 },
  { name: "Jordan K.", stop: "Queen St W", rating: 4.7 },
];

const toRad = (v) => (v * Math.PI) / 180;
const distanceKm = (a, b) => {
  if (!a || !b) return 0;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const lerp = (a, b, t) => ({ lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t });

const osmGeocode = async (text) => {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(text)}`, { headers: { Accept: "application/json" } });
  const rows = await res.json();
  return rows?.[0] ? { lat: parseFloat(rows[0].lat), lng: parseFloat(rows[0].lon) } : null;
};

export default function Rides() {
  const [stage, setStage] = useState("whereto");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [myPos, setMyPos] = useState(null);
  const [locating, setLocating] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [selected, setSelected] = useState(RIDE_TIERS[0]);
  const [driver, setDriver] = useState(null);
  const [driverPos, setDriverPos] = useState(null);
  const [rideId, setRideId] = useState(null);
  const [rides, setRides] = useState([]);
  const [eta, setEta] = useState(0);
  const [tripPct, setTripPct] = useState(0);
  const [err, setErr] = useState("");
  const [paying, setPaying] = useState(false);
  const [payErr, setPayErr] = useState("");
  const [rating, setRating] = useState(0);
  const [shared, setShared] = useState("");
  const [route, setRoute] = useState(null);
  const [shareRide, setShareRide] = useState(false);
  const [coRider, setCoRider] = useState(null);

  const loadRides = async () => {
    try { setRides(await base44.entities.Ride.list("-created_date", 10)); } catch (e) {}
  };
  useEffect(() => { loadRides(); }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watch = navigator.geolocation.watchPosition(
      (pos) => setMyPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, []);

  // driver approaches the pickup, then the trip runs to the destination
  useEffect(() => {
    if (stage !== "arriving" || !pickupCoords) return;
    const start = driverPos || { lat: pickupCoords.lat + 0.0055, lng: pickupCoords.lng + 0.0055 };
    setDriverPos(start);
    let t = 0;
    const id = setInterval(() => {
      t += 1;
      const p = Math.min(1, t / 14);
      setDriverPos(lerp(start, pickupCoords, p));
      setEta(Math.max(0, Math.ceil((1 - p) * 4)));
      if (p >= 1) {
        clearInterval(id);
        setTimeout(() => setStage("inprogress"), 2200);
      }
    }, 800);
    return () => clearInterval(id);
  }, [stage, pickupCoords]);

  useEffect(() => {
    if (stage !== "inprogress" || !pickupCoords || !destCoords) return;
    let t = 0;
    const id = setInterval(() => {
      t += 1;
      const p = Math.min(1, t / 22);
      setDriverPos(lerp(pickupCoords, destCoords, p));
      setTripPct(Math.round(p * 100));
      if (p >= 1) {
        clearInterval(id);
        setStage("completed");
        if (rideId) base44.entities.Ride.update(rideId, { status: "completed" }).catch(() => {});
      }
    }, 800);
    return () => clearInterval(id);
  }, [stage, pickupCoords, destCoords, rideId]);

  const detectLocation = () => {
    if (!navigator.geolocation) { setErr("Geolocation isn't supported here."); return; }
    setLocating(true); setErr("");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const here = { lat: latitude, lng: longitude };
      setPickupCoords(here);
      setMyPos(here);
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const j = await r.json();
        setPickup(j?.display_name?.split(",").slice(0, 2).join(",") || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      } catch { setPickup(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`); }
      setLocating(false);
    }, () => { setLocating(false); setErr("Location permission denied — type the address instead."); }, { enableHighAccuracy: true, timeout: 10000 });
  };

  useEffect(() => { if (!pickup) detectLocation(); }, []);

  const seePrices = async () => {
    if (!destination.trim()) return;
    setEstimating(true); setErr("");
    try {
      let p = pickupCoords;
      if (!p) p = await osmGeocode(pickup || "my location").catch(() => null);
      let d = destCoords;
      if (!d) d = await osmGeocode(destination).catch(() => null);
      if (p) setPickupCoords(p);
      if (d) setDestCoords(d);
      if (!d) setErr("Couldn't pin that address — pick one from the suggestions.");
      if (p && d) {
        const rt = await roadRoute(p, d);
        setRoute(rt);
      }
      setStage("options");
    } catch (e) { setErr("Couldn't reach the map service."); }
    setEstimating(false);
  };

  const requestRide = async (tier) => {
    setSelected(tier);
    setStage("searching");
    setErr("");
    const chosen = DRIVERS[Math.floor(Math.random() * DRIVERS.length)];
    setTimeout(async () => {
      setDriver(chosen);
      setCoRider(shareRide ? CO_RIDERS[Math.floor(Math.random() * CO_RIDERS.length)] : null);
      setEta(tier.eta);
      setStage("arriving");
      try {
        const rec = await base44.entities.Ride.create({
          pickup: pickup.trim(),
          destination: destination.trim(),
          ride_type: tier.type,
          fare: Number((shareRide ? tier.price * 0.6 : tier.price).toFixed(2)),
          eta_minutes: tier.eta,
          status: "accepted",
          driver_name: chosen.name,
          driver_rating: chosen.rating,
          vehicle: `${chosen.car} · ${chosen.plate}`,
          shared: shareRide,
          co_rider: shareRide ? coRider?.name : undefined,
        });
        setRideId(rec?.id);
        loadRides();
      } catch (e) {}
    }, 3200);
  };

  const cancelRide = async () => {
    if (rideId) base44.entities.Ride.delete(rideId).catch(() => {});
    setStage("whereto");
    setDriver(null);
    setDriverPos(null);
    setRideId(null);
    setTripPct(0);
    setRating(0);
    setPayErr("");
    loadRides();
  };

  const reset = () => {
    setPickup(""); setDestination(""); setPickupCoords(null); setDestCoords(null);
    setStage("whereto"); setDriver(null); setDriverPos(null); setRideId(null);
    setTripPct(0); setRating(0); setPayErr("");
    setShareRide(false); setCoRider(null); setRoute(null);
  };

  const pay = async () => {
    if (paying) return;
    setPaying(true); setPayErr("");
    try {
      await startCheckout({ kind: "ride", tier: selected.type });
    } catch (e) {
      setPayErr(e?.message || "Couldn't open checkout.");
    }
    setPaying(false);
  };

  const km = route?.distanceKm ?? distanceKm(pickupCoords, destCoords);
  const minutes = route?.minutes ?? Math.max(3, Math.round((km / 28) * 60));
  const withShare = (price) => Number((shareRide ? price * 0.6 : price).toFixed(2));
  const tripFare = withShare(selected.price);

  const uberUrl = pickupCoords && destCoords
    ? `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${pickupCoords.lat}&pickup[longitude]=${pickupCoords.lng}&pickup[formatted_address]=${encodeURIComponent(pickup)}&dropoff[latitude]=${destCoords.lat}&dropoff[longitude]=${destCoords.lng}&dropoff[formatted_address]=${encodeURIComponent(destination)}`
    : `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent(destination || "")}`;
  const lyftUrl = `https://www.lyft.com/app?ride[pickup]=my_location&ride[destination]=${encodeURIComponent(destination || "")}`;

  const shareTrip = async () => {
    const text = `${selected.type} · ${pickup} → ${destination}${driver ? ` with ${driver.name} (${driver.car} · ${driver.plate})` : ""}`;
    try {
      if (navigator.share) await navigator.share({ title: "Valo Rides", text, url: uberUrl });
      else { await navigator.clipboard?.writeText(`${text}\n${uberUrl}`); setShared("Trip details copied"); setTimeout(() => setShared(""), 1800); }
    } catch (e) {}
  };

  const recentDestinations = [...new Set(rides.map((r) => r.destination).filter(Boolean))].slice(0, 3);

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-0">
        <LiveRideMap pickup={pickupCoords} destination={destCoords} driver={driverPos} riderLocation={myPos} route={route?.points} height="h-full" />
      </div>

      {/* floating pickup pill */}
      <div className="fixed top-3 inset-x-0 z-20 flex justify-center px-3 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 bg-white text-neutral-900 rounded-full shadow-2xl shadow-black/30 pl-2 pr-3 py-1.5 max-w-md w-full">
          <button
            onClick={() => (stage === "whereto" ? null : stage === "searching" ? cancelRide() : setStage("whereto"))}
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${stage === "whereto" ? "opacity-40" : "hover:bg-neutral-100"}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-[13px] font-semibold truncate flex-1">{pickup || "Getting your location…"}</span>
          <button onClick={detectLocation} title="Use my location" className="text-neutral-500 hover:text-neutral-900 shrink-0">
            <LocateFixed className={`w-4 h-4 ${locating ? "animate-pulse" : ""}`} />
          </button>
        </div>
      </div>

      {/* uber-style sheet */}
      <div className="fixed inset-x-0 bottom-[72px] z-20 px-2 sm:px-0">
        <div className="mx-auto w-full max-w-md rounded-2xl rounded-b-none bg-white text-neutral-900 shadow-[0_-20px_60px_-12px_rgba(0,0,0,0.55)] max-h-[62vh] overflow-y-auto thin-scrollbar">
          <div className="flex justify-center pt-2 pb-1"><span className="w-10 h-1 rounded-full bg-neutral-300" /></div>

          {stage === "whereto" && (
            <div className="px-4 pb-4">
              <h1 className="text-[22px] font-bold tracking-tight mb-3">Where to?</h1>
              <div className="space-y-2">
                <AddressField value={destination} onChange={setDestination} onSelect={(c) => setDestCoords(c)} placeholder="Enter destination" autoFocus dotClass="bg-rose-500" />
                <AddressField value={pickup} onChange={setPickup} onSelect={(c) => setPickupCoords(c)} placeholder="Pickup location" dotClass="bg-emerald-500" />
              </div>

              {recentDestinations.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto thin-scrollbar pb-1">
                  {recentDestinations.map((d) => (
                    <button key={d} onClick={() => { setDestination(d); setDestCoords(null); }} className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full bg-neutral-100 text-[12px] font-medium max-w-[220px]">
                      <Clock className="w-3.5 h-3.5 text-neutral-500 shrink-0" /> <span className="truncate">{d}</span>
                    </button>
                  ))}
                </div>
              )}

              {err && <p className="text-[12px] text-rose-600 mt-2">{err}</p>}

              <button onClick={seePrices} disabled={!destination.trim() || estimating} className="mt-3 w-full py-3 rounded-xl bg-black text-white font-semibold text-[15px] disabled:bg-neutral-300 disabled:text-neutral-500 flex items-center justify-center gap-2">
                {estimating ? <><Loader2 className="w-4 h-4 animate-spin" /> Finding prices…</> : "See prices"}
              </button>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <a href={uberUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-neutral-100 text-[12px] font-semibold hover:bg-neutral-200">Uber <ExternalLink className="w-3 h-3" /></a>
                <a href={lyftUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-neutral-100 text-[12px] font-semibold hover:bg-neutral-200">Lyft <ExternalLink className="w-3 h-3" /></a>
              </div>
              <p className="text-[10px] text-neutral-500 mt-1.5 text-center">Partner buttons open Uber or Lyft with this trip already filled in.</p>
            </div>
          )}

          {stage === "options" && (
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[17px] font-bold">Choose a ride</h2>
                <span className="text-[11px] text-neutral-500">{km ? `~${km.toFixed(1)} km · ${minutes} min` : "Live prices"}</span>
              </div>
              <div className="mt-1 text-[12px] text-neutral-500 truncate">{pickup} → {destination}</div>

              <button
                onClick={() => setShareRide((v) => !v)}
                className={`mt-2 w-full flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-colors ${shareRide ? "border-emerald-500 bg-emerald-50" : "border-neutral-200 hover:bg-neutral-50"}`}
              >
                <span className={`w-9 h-9 rounded-lg grid place-items-center shrink-0 ${shareRide ? "bg-emerald-500 text-white" : "bg-neutral-100 text-neutral-700"}`}>
                  <Users className="w-4 h-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-bold">Ride share · split the fare</span>
                  <span className="block text-[11px] text-neutral-500">Matched with 1 co-rider along the way · pay 40% less</span>
                </span>
                <span className={`w-5 h-5 rounded-full border-2 grid place-items-center shrink-0 ${shareRide ? "border-emerald-500 bg-emerald-500 text-white" : "border-neutral-300"}`}>
                  {shareRide && <Check className="w-3 h-3" />}
                </span>
              </button>

              <div className="mt-2 divide-y divide-neutral-200">
                {RIDE_TIERS.map((t) => {
                  const active = selected.type === t.type;
                  return (
                    <button key={t.type} onClick={() => setSelected(t)} className={`w-full flex items-center gap-3 py-2.5 text-left ${active ? "" : "opacity-90"}`}>
                      <span className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${active ? "bg-black text-white" : "bg-neutral-100 text-neutral-700"}`}>
                        <Car className="w-6 h-6" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-bold flex items-center gap-1.5">{t.type} <Users className="w-3 h-3 text-neutral-500" /> <span className="text-[11px] font-normal text-neutral-500">{t.seats}</span></span>
                        <span className="block text-[11px] text-neutral-500 truncate">{t.desc} · {t.eta} min away</span>
                      </span>
                      <span className="text-right shrink-0">
                        {shareRide && <span className="block text-[10.5px] text-neutral-400 line-through">${t.price.toFixed(2)}</span>}
                        <span className="block text-[15px] font-bold">${withShare(t.price).toFixed(2)}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {err && <p className="text-[12px] text-rose-600 mt-2">{err}</p>}
              <button onClick={() => requestRide(selected)} className="mt-2 w-full py-3 rounded-xl bg-black text-white font-semibold text-[15px]">
                Choose {selected.type} · ${withShare(selected.price).toFixed(2)}{shareRide ? " shared" : ""}
              </button>
              <button onClick={() => setStage("whereto")} className="mt-2 w-full py-2 text-[12px] font-semibold text-neutral-500">Edit trip</button>
            </div>
          )}

          {stage === "searching" && (
            <div className="px-5 py-6 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-neutral-900 flex items-center justify-center mb-3"><Car className="w-6 h-6 text-white animate-pulse" /></div>
              <p className="font-bold text-[16px]">Looking for a driver nearby</p>
              <p className="text-[12px] text-neutral-500 mt-0.5">Contacting cars around {pickup?.split(",")[0]}</p>
              <div className="mt-4 h-1.5 rounded-full bg-neutral-200 overflow-hidden">
                <div className="h-full w-1/2 bg-black rounded-full animate-[searching-bar_1.4s_ease-in-out_infinite]" />
              </div>
              <button onClick={cancelRide} className="mt-4 text-[12px] font-semibold text-neutral-500 underline">Cancel</button>
            </div>
          )}

          {stage === "arriving" && driver && (
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-full bg-neutral-900 text-white text-[11px] font-bold">{selected.type}</span>
                <p className="text-[15px] font-bold">Your driver is on the way</p>
                <span className="ml-auto text-[12px] text-neutral-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {Math.max(1, eta)} min</span>
              </div>

              <div className="mt-2.5 flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${driver.tone} flex items-center justify-center font-bold text-white shrink-0`}>{driver.name[0]}</div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[14px] flex items-center gap-1.5">{driver.name} <span className="text-[11px] text-neutral-500 flex items-center gap-0.5"><Star className="w-3 h-3 fill-neutral-900" /> {driver.rating}</span></p>
                  <p className="text-[12px] text-neutral-500 truncate">{driver.car} · {driver.plate}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <a href="tel:+14165550100" className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200"><Phone className="w-4 h-4" /></a>
                  <a href="sms:+14165550100" className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200"><MessageSquare className="w-4 h-4" /></a>
                </div>
              </div>

              {coRider && (
                <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                  <span className="w-7 h-7 rounded-full bg-emerald-500 text-white grid place-items-center text-[11px] font-bold shrink-0">{coRider.name[0]}</span>
                  <p className="text-[11.5px] text-emerald-900 min-w-0">
                    <b>{coRider.name}</b> shares this ride · picked up at {coRider.stop} · ★ {coRider.rating}
                  </p>
                </div>
              )}

              <div className="mt-3 rounded-xl bg-neutral-50 border border-neutral-200 p-3 flex items-center gap-2 text-[12px] text-neutral-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" /> Share your trip with a friend for extra peace of mind.
                <button onClick={shareTrip} className="ml-auto flex items-center gap-1 font-semibold text-neutral-900"><Share2 className="w-3.5 h-3.5" /> Share</button>
              </div>
              {shared && <p className="text-[11px] text-emerald-600 mt-1">{shared}</p>}

              <button onClick={cancelRide} className="mt-2 w-full py-2.5 rounded-xl bg-neutral-100 font-semibold text-[13px] text-rose-600">Cancel ride</button>
            </div>
          )}

          {stage === "inprogress" && driver && (
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between">
                <p className="text-[15px] font-bold truncate">On the way to {destination.split(",")[0]}</p>
                <span className="text-[12px] text-neutral-500 shrink-0 ml-2">{Math.max(1, Math.round(minutes * (1 - tripPct / 100)))} min</span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-neutral-200 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${Math.max(4, tripPct)}%` }} />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${driver.tone} flex items-center justify-center font-bold text-white shrink-0`}>{driver.name[0]}</div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[13px]">{driver.name} · {driver.plate}</p>
                  <p className="text-[11px] text-neutral-500">{driver.car}</p>
                </div>
                <p className="font-bold text-[15px]">${tripFare.toFixed(2)}</p>
              </div>
              <p className="mt-2 text-[11px] text-neutral-500">Arriving in about {Math.max(1, Math.round(minutes * (1 - tripPct / 100)))} min · trip {tripPct}% complete</p>
              {coRider && <p className="mt-0.5 text-[11px] text-emerald-700">Shared with {coRider.name} · fare split, you pay ${tripFare.toFixed(2)}</p>}
            </div>
          )}

          {stage === "completed" && (
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0"><Check className="w-5 h-5 text-emerald-600" /></span>
                <div>
                  <p className="font-bold text-[15px]">You've arrived</p>
                  <p className="text-[11px] text-neutral-500">{destination.split(",")[0]} · {selected.type}</p>
                </div>
                <p className="ml-auto font-bold text-[17px]">${tripFare.toFixed(2)}</p>
              </div>

              <div className="mt-3 flex items-center gap-1">
                <span className="text-[12px] text-neutral-600 mr-1">Rate {driver?.name || "your driver"}</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setRating(n)}><Star className={`w-5 h-5 ${n <= rating ? "fill-neutral-900 text-neutral-900" : "text-neutral-300"}`} /></button>
                ))}
              </div>

              {payErr && <p className="text-[12px] text-rose-600 mt-2">{payErr}</p>}
              <button onClick={pay} disabled={paying} className="mt-3 w-full py-3 rounded-xl bg-black text-white font-semibold text-[15px] flex items-center justify-center gap-2 disabled:opacity-50">
                {paying ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening checkout…</> : <><CreditCard className="w-4 h-4" /> Pay ${tripFare.toFixed(2)}{shareRide ? " (shared)" : ""}</>}
              </button>
              <button onClick={reset} className="mt-2 w-full py-2.5 rounded-xl bg-neutral-100 font-semibold text-[13px]">Book another ride</button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}