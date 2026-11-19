import React, { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";

export default function PlaceAutocomplete({ value, onChange, onSelect, placeholder = "Search a place", className = "" }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);
  const skip = useRef(false);

  useEffect(() => {
    if (skip.current) { skip.current = false; return; }
    const q = (value || "").trim();
    if (q.length < 3) { setItems([]); return; }
    const id = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`, { headers: { Accept: "application/json" } });
        const rows = await res.json();
        setItems((rows || []).map((r) => ({ label: r.display_name, lat: parseFloat(r.lat), lng: parseFloat(r.lon) })));
        setOpen(true);
      } catch (e) { setItems([]); }
      setLoading(false);
    }, 400);
    return () => clearTimeout(id);
  }, [value]);

  useEffect(() => {
    const onDoc = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = (it) => {
    skip.current = true;
    onChange(it.label.split(",").slice(0, 3).join(","));
    onSelect?.(it);
    setOpen(false);
    setItems([]);
  };

  return (
    <div ref={boxRef} className={`relative flex-1 min-w-0 ${className}`}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => items.length && setOpen(true)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none text-sm placeholder-white/45"
      />
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin absolute right-1 top-1 text-white/50" />}
      {open && items.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-[600] rounded-xl overflow-hidden bg-[#221c42]/98 backdrop-blur-xl border border-white/20 shadow-2xl max-h-64 overflow-y-auto">
          {items.map((it, i) => (
            <button key={i} onClick={() => pick(it)} className="w-full text-left px-3 py-2 text-xs flex items-start gap-2 hover:bg-white/12 border-b border-white/5 last:border-0">
              <MapPin className="w-3.5 h-3.5 text-emerald-300 mt-0.5 shrink-0" />
              <span className="line-clamp-2 text-white/85">{it.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}