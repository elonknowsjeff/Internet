import React from "react";
import { Plus, Clock, Star } from "lucide-react";

export default function DishCard({ dish, onAdd }) {
  return (
    <article className="group rounded-2xl overflow-hidden border border-white/10 bg-white/[.03] hover:border-amber-400/40 transition flex flex-col">
      <div className="relative h-36 overflow-hidden">
        <img src={dish.image} alt={dish.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/65 text-[10px] font-semibold text-amber-300 backdrop-blur">{dish.category}</span>
        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/65 text-[10px] font-bold text-white backdrop-blur">${dish.price.toFixed(2)}</span>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-bold text-sm leading-tight line-clamp-1">{dish.name}</h3>
        <p className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1">
          <Star className="w-3 h-3 fill-amber-300 text-amber-300" /> {dish.area} · {dish.ingredients.length} ingredients
        </p>
        <p className="text-[11px] text-neutral-500 mt-1.5 line-clamp-2 flex-1">{dish.instructions?.slice(0, 90)}…</p>
        <button
          onClick={() => onAdd(dish)}
          className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold hover:brightness-110 transition"
        >
          <Plus className="w-3.5 h-3.5" /> Add to cart
        </button>
      </div>
    </article>
  );
}