import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

// Light-themed address field with OpenStreetMap suggestions (used on the Uber-style white sheet).
export default function AddressField({ value, onChange, onSelect, placeholder, autoFocus, dotClass = "bg-neutral-900" }) {
  const [hits, setHits] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);
  const box = useRef(null);

  useEffect(() => {
    const onDown = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    clearTimeout(timer.current);
    const q = (value || "").trim();
    if (q.length < 3) { setHits([]); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`, { headers: { Accept: "application/json" } });
        const rows = await res.json();
        setHits((rows || []).map((r) => ({ label: r.display_name, lat: parseFloat(r.lat), lng: parseFloat(r.lon) })));
        setOpen(true);
      } catch (e) { setHits([]); }
      setLoading(false);
    }, 350);
    return () => clearTimeout(timer.current);
  }, [value]);

  const pick = (h) => {
    onChange(h.label.split(",").slice(0, 2).join(","));
    onSelect?.({ lat: h.lat, lng: h.lng, label: h.label });
    setOpen(false);
    setHits([]);
  };

  return (
    <div ref={box} className="relative">
      <div className="flex items-center gap-3 bg-neutral-100 rounded-xl px-3.5 py-3">
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotClass}`} />
        <input
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => hits.length && setOpen(true)}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent outline-none text-[15px] text-neutral-900 placeholder:text-neutral-500"
        />
        {loading && <Loader2 className="w-4 h-4 animate-spin text-neutral-400 shrink-0" />}
      </div>

      {open && hits.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-30 rounded-xl bg-white shadow-2xl shadow-black/20 border border-neutral-200 overflow-hidden max-h-64 overflow-y-auto">
          {hits.map((h, i) => (
            <button key={`${h.lat}-${i}`} onMouseDown={(e) => e.preventDefault()} onClick={() => pick(h)} className="w-full text-left px-3.5 py-2.5 hover:bg-neutral-100 border-b border-neutral-100 last:border-0">
              <p className="text-[13px] font-medium text-neutral-900 truncate">{h.label.split(",")[0]}</p>
              <p className="text-[11px] text-neutral-500 truncate">{h.label}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}