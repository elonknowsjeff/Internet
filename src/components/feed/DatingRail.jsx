import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Heart, ChevronRight, MapPin } from "lucide-react";

const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);

export default function DatingRail() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    base44.entities.DatingProfile
      .list("-created_date", 16)
      .then((r) => setProfiles(asItems(r)))
      .catch(() => {});
  }, []);

  const list = profiles.filter((p) => p.photo || (p.photos || []).length).slice(0, 12);
  if (list.length === 0) return null;

  return (
    <section className="border-b border-white/[0.06] py-3">
      <div className="flex items-center justify-between px-4 mb-2.5">
        <h2 className="text-[16px] font-extrabold flex items-center gap-2">
          <Heart className="w-4 h-4" style={{ color: "var(--brand)" }} /> Dating picks
        </h2>
        <Link to="/dating" className="text-[12.5px] font-semibold text-white/55 hover:text-white flex items-center gap-0.5">
          See all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="flex gap-2.5 overflow-x-auto scrollbar-none px-4 snap-x snap-mandatory">
        {list.map((p) => {
          const photo = p.photo || (p.photos || [])[0];
          return (
            <Link
              key={p.id}
              to="/dating"
              className="group relative shrink-0 w-[128px] snap-start rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] transition-transform duration-300 hover:-translate-y-0.5 hover:border-white/25"
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={photo}
                  alt={p.display_name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
                <p className="text-[12px] font-bold leading-tight truncate">
                  {p.display_name}{p.age ? `, ${p.age}` : ""}
                </p>
                {p.location && (
                  <p className="text-[10px] text-white/60 truncate flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5" /> {p.location}
                  </p>
                )}
              </div>
              <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 backdrop-blur grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Heart className="w-3 h-3 text-rose-300" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}