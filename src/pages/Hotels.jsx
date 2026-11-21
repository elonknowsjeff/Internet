import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { BedDouble, Star, MapPin, Search, X, CalendarDays, Wifi, Waves, Utensils, Car, Loader2 } from "lucide-react";
import BookingDialog from "@/components/hotels/BookingDialog";

const HOTELS = [
  {
    id: "h1", name: "Aurora Skyline Hotel", city: "Toronto, Canada", price_per_night: 219, rating: 4.8, reviews: 1284, stars: 5,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    description: "Floor-to-ceiling views over the harbour with a rooftop pool and late-night lounge.",
    amenities: ["Free WiFi", "Rooftop pool", "Gym", "Valet"],
  },
  {
    id: "h2", name: "The Velvet Lantern", city: "New York, USA", price_per_night: 348, rating: 4.7, reviews: 942, stars: 5,
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
    description: "A boutique stay two blocks from the park, famous for its jazz bar and breakfast.",
    amenities: ["Free WiFi", "Bar", "Concierge", "Pet friendly"],
  },
  {
    id: "h3", name: "Casa Marbella Resort", city: "Barcelona, Spain", price_per_night: 176, rating: 4.6, reviews: 2231, stars: 4,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
    description: "Beachfront resort with three pools, tapas terrace and a five-minute walk to the marina.",
    amenities: ["Beach access", "3 pools", "Spa", "Restaurant"],
  },
  {
    id: "h4", name: "Sakura Garden Inn", city: "Kyoto, Japan", price_per_night: 158, rating: 4.9, reviews: 617, stars: 4,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    description: "Quiet ryokan-style rooms around a koi garden, ten minutes from the old town.",
    amenities: ["Onsen", "Tea service", "Free WiFi", "Garden"],
  },
  {
    id: "h5", name: "Desert Bloom Lodge", city: "Dubai, UAE", price_per_night: 402, rating: 4.8, reviews: 1587, stars: 5,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
    description: "Private villas, infinity pool and desert excursions at golden hour.",
    amenities: ["Infinity pool", "Spa", "Airport transfer", "Butler"],
  },
  {
    id: "h6", name: "Harbourlight Suites", city: "Vancouver, Canada", price_per_night: 189, rating: 4.5, reviews: 803, stars: 4,
    image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
    description: "Mountain-view suites with kitchenettes, steps from the seawall and markets.",
    amenities: ["Kitchenette", "Free WiFi", "Bike hire", "Parking"],
  },
];

const trivagoUrl = (q) => `https://www.trivago.com/en-US/srl?query=${encodeURIComponent(q)}`;

const inDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

const amenityIcon = (a) => {
  if (/wifi/i.test(a)) return Wifi;
  if (/pool|beach|onsen/i.test(a)) return Waves;
  if (/restaurant|tea|bar|breakfast/i.test(a)) return Utensils;
  if (/parking|valet|transfer|bike/i.test(a)) return Car;
  return BedDouble;
};

export default function Hotels() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All");
  const [sort, setSort] = useState("Recommended");
  const [booking, setBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [cmpCity, setCmpCity] = useState("Toronto");
  const [cmpIn, setCmpIn] = useState(inDays(7));
  const [cmpOut, setCmpOut] = useState(inDays(10));
  const [cmpGuests, setCmpGuests] = useState(2);
  const [comparing, setComparing] = useState(false);
  const [cmpResults, setCmpResults] = useState([]);
  const [cmpError, setCmpError] = useState("");

  const loadBookings = async () => {
    try {
      const res = await base44.entities.HotelBooking.list("-created_date", 6);
      setBookings(Array.isArray(res) ? res : res?.items || []);
    } catch {
      setBookings([]);
    }
  };
  useEffect(() => { loadBookings(); }, []);

  const comparePrices = async (e) => {
    e?.preventDefault();
    setComparing(true); setCmpError(""); setCmpResults([]);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Find 5 real hotels in ${cmpCity} for a stay from ${cmpIn} to ${cmpOut}, ${cmpGuests} guests. For each hotel return its name, star rating, guest rating, and the per-night price in USD from each of these providers: Booking.com, Expedia, Hotels.com, Trivago. Use live web context for real current prices. Sort by best (lowest) price.`,
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: {
          type: "object",
          properties: {
            hotels: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  stars: { type: "number" },
                  rating: { type: "number" },
                  providers: { type: "array", items: { type: "object", properties: { name: { type: "string" }, price: { type: "number" } } } },
                },
              },
            },
          },
        },
      });
      setCmpResults(res?.hotels || []);
      if (!res?.hotels?.length) setCmpError("No comparisons came back — try another city or dates.");
    } catch { setCmpError("Hotel comparison is unavailable right now. Try again in a moment."); }
    setComparing(false);
  };

  const cities = useMemo(() => ["All", ...new Set(HOTELS.map((h) => h.city.split(",").slice(-1)[0].trim()))], []);

  const visible = HOTELS
    .filter((h) => (city === "All" ? true : h.city.endsWith(city)))
    .filter((h) => (h.name + " " + h.city).toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (sort === "Price: low" ? a.price_per_night - b.price_per_night : sort === "Price: high" ? b.price_per_night - a.price_per_night : b.rating - a.rating));

  return (
    <div className="px-4 py-5 pb-28">
      <header className="mb-5">
        <p className="text-[10px] uppercase tracking-[0.22em] text-fuchsia-300">Book a stay</p>
        <h1 className="text-2xl sm:text-3xl font-black font-display flex items-center gap-2 mt-1">
          <BedDouble className="w-6 h-6 text-violet-300" /> Hotels
        </h1>
        <p className="text-sm text-neutral-400 mt-1">Pick a city, choose your dates, reserve instantly — or compare live prices on Trivago.</p>
        <a
          href={trivagoUrl(city === "All" ? query.trim() || "Toronto" : city)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0a5c8a] hover:bg-[#0a6a9d] text-white text-xs font-bold"
        >
          <Search className="w-3.5 h-3.5" /> Compare {city === "All" ? "this city" : city} on Trivago
        </a>
      </header>

      <section className="mb-6 rounded-2xl border border-white/10 bg-white/[.04] p-4">
        <h2 className="text-sm font-bold flex items-center gap-1.5 mb-3"><Search className="w-4 h-4 text-violet-300" /> Compare hotel prices</h2>
        <form onSubmit={comparePrices} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input value={cmpCity} onChange={(e) => setCmpCity(e.target.value)} placeholder="City" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm outline-none focus:border-violet-400" />
          <input type="date" value={cmpIn} onChange={(e) => setCmpIn(e.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm outline-none" />
          <input type="date" value={cmpOut} onChange={(e) => setCmpOut(e.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm outline-none" />
          <button type="submit" disabled={comparing} className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-60">{comparing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Compare</button>
        </form>
        {cmpError && <p className="text-sm text-amber-300 mt-3">{cmpError}</p>}
        {cmpResults.length > 0 && (
          <div className="mt-4 space-y-2.5">
            {cmpResults.map((h, i) => {
              const best = [...(h.providers || [])].sort((a, b) => a.price - b.price)[0];
              return (
                <div key={i} className="rounded-xl border border-white/10 bg-white/[.03] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{h.name}</p>
                      <p className="text-[11px] text-neutral-400">{"★".repeat(h.stars || 0)} · {h.rating} rating</p>
                    </div>
                    {best && (
                      <a href={trivagoUrl(h.name + " " + cmpCity)} target="_blank" rel="noreferrer" className="shrink-0 text-right">
                        <p className="text-[10px] text-neutral-400">Best price</p>
                        <p className="text-base font-black text-emerald-300">${best.price}<span className="text-[10px] font-medium text-neutral-400"> /night · {best.name}</span></p>
                      </a>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(h.providers || []).map((p, j) => (
                      <span key={j} className="text-[11px] px-2 py-1 rounded-md bg-white/5 border border-white/10">{p.name}: <b>${p.price}</b></span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="flex items-center gap-2 flex-1 rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5">
          <Search className="w-4 h-4 text-neutral-500" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search hotels or cities…" className="flex-1 bg-transparent outline-none text-sm" />
          {query && <button onClick={() => setQuery("")} className="text-neutral-500 hover:text-white"><X className="w-4 h-4" /></button>}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-white/10 bg-[#170f26] px-3 py-2.5 text-sm outline-none">
          {["Recommended", "Price: low", "Price: high"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
        {cities.map((c) => (
          <button key={c} onClick={() => setCity(c)} className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${city === c ? "bg-white text-black border-white" : "border-white/12 bg-white/[.04] text-neutral-300 hover:bg-white/[.08]"}`}>
            {c === "All" ? "All cities" : c}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((h) => (
          <article key={h.id} className="rounded-2xl overflow-hidden border border-white/10 bg-white/[.03] hover:border-violet-400/50 transition flex flex-col">
            <div className="relative h-40">
              <img src={h.image} alt={h.name} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 text-[10px] font-semibold text-amber-300 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-300" /> {h.rating} · {h.reviews.toLocaleString()}
              </span>
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-violet-500/85 text-[10px] font-bold">{"★".repeat(h.stars)}</span>
            </div>
            <div className="p-3.5 flex flex-col flex-1">
              <h3 className="font-bold leading-tight">{h.name}</h3>
              <p className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {h.city}</p>
              <p className="text-xs text-neutral-400 mt-2 line-clamp-2 flex-1">{h.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {h.amenities.slice(0, 3).map((a) => {
                  const Icon = amenityIcon(a);
                  return (
                    <span key={a} className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-neutral-300 flex items-center gap-1">
                      <Icon className="w-2.5 h-2.5" /> {a}
                    </span>
                  );
                })}
              </div>
              <div className="flex items-center justify-between gap-2 mt-3">
                <p className="text-lg font-black">${h.price_per_night}<span className="text-[11px] font-medium text-neutral-400"> /night</span></p>
                <div className="flex items-center gap-1.5">
                  <a href={trivagoUrl(h.name + " " + h.city)} target="_blank" rel="noreferrer" className="px-2.5 py-2 rounded-xl border border-white/15 text-[11px] font-semibold text-neutral-200 hover:bg-white/10">Trivago</a>
                  <button onClick={() => setBooking(h)} className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs font-bold">Reserve</button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {visible.length === 0 && <p className="text-center text-neutral-500 py-12">No hotels match that search.</p>}

      {bookings.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-bold text-neutral-300 mb-3 flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-violet-300" /> Your bookings</h2>
          <div className="space-y-2">
            {bookings.map((b) => (
              <div key={b.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.03] p-2.5">
                {b.image && <img src={b.image} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{b.hotel_name}</p>
                  <p className="text-[11px] text-neutral-400">
                    {format(new Date(b.check_in), "d MMM")} – {format(new Date(b.check_out), "d MMM")} · {b.nights} night{b.nights > 1 ? "s" : ""} · {b.guests} guest{b.guests > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">${b.total?.toFixed(2)}</p>
                  <p className="text-[10px] text-emerald-400">{b.status}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {booking && (
        <BookingDialog hotel={booking} onClose={() => setBooking(null)} onDone={loadBookings} />
      )}
    </div>
  );
}