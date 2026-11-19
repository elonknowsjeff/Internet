import React from "react";
import { Headphones, Star, Clock, Mic, ExternalLink, Plus } from "lucide-react";

const books = [
  {
    id: "ab-horizon",
    title: "The Last Horizon",
    author: "Mara Voss",
    narrator: "Dana Reyes",
    hours: "11h 24m",
    price: 21.99,
    rating: 4.8,
    cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500",
  },
  {
    id: "ab-signal",
    title: "Signal / Noise",
    author: "Ilya Karim",
    narrator: "Ben Okafor",
    hours: "8h 05m",
    price: 16.5,
    rating: 4.6,
    cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500",
  },
  {
    id: "ab-cartographer",
    title: "The Cartographer's Wife",
    author: "Elena Duarte",
    narrator: "Nina Alvarez",
    hours: "14h 12m",
    price: 27.0,
    rating: 4.9,
    cover: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500",
  },
  {
    id: "ab-midnight",
    title: "Midnight Systems",
    author: "Ray Calloway",
    narrator: "Sam Whitfield",
    hours: "9h 47m",
    price: 18.75,
    rating: 4.4,
    cover: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=500",
  },
  {
    id: "ab-atlas",
    title: "Atlas of Small Things",
    author: "Priya Raman",
    narrator: "Priya Raman",
    hours: "6h 58m",
    price: 13.99,
    rating: 4.7,
    cover: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=500",
  },
  {
    id: "ab-deepwater",
    title: "Deepwater Hours",
    author: "Tomas Lindqvist",
    narrator: "Erik Holm",
    hours: "12h 31m",
    price: 24.5,
    rating: 4.5,
    cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500",
  },
];

export default function AudiobookStore({ onAdd }) {
  const buy = (b) =>
    window.open(`https://www.amazon.com/s?k=${encodeURIComponent(b.title + " " + b.author + " audiobook")}`, "_blank");

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 rounded-2xl border border-fuchsia-400/25 bg-fuchsia-400/5 px-4 py-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-fuchsia-400 to-cyan-400 flex items-center justify-center shrink-0">
          <Headphones className="w-5 h-5 text-black" />
        </div>
        <div>
          <p className="text-sm font-semibold">Audiobooks</p>
          <p className="text-xs text-neutral-400">Narrated titles · buy a copy or add it to your cart</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {books.map((b) => (
          <div
            key={b.id}
            className="group rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden flex flex-col hover:border-fuchsia-400/40 transition-all"
          >
            <div className="aspect-square bg-black/30 overflow-hidden">
              <img
                src={b.cover}
                alt={b.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3 flex flex-col flex-1">
              <p className="text-sm font-semibold leading-snug line-clamp-2">{b.title}</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">{b.author}</p>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-neutral-400">
                <span className="flex items-center gap-1">
                  <Mic className="w-3 h-3" /> {b.narrator}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {b.hours}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {b.rating}
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-lg font-bold font-display">${b.price.toFixed(2)}</span>
              </div>
              <div className="mt-auto pt-2 flex gap-1.5">
                <button
                  onClick={() => onAdd({ id: b.id, title: `${b.title} (audiobook)`, price: b.price, image: b.cover })}
                  title="Add to cart"
                  className="w-9 h-9 shrink-0 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => buy(b)}
                  className="flex-1 py-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-black text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  Buy <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}