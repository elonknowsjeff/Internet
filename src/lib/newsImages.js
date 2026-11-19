const IMAGES = {
  world: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=900&q=80",
  tech: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&q=80",
  ai: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900&q=80",
  business: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&q=80",
  science: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=900&q=80",
  sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=900&q=80",
  entertainment: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=900&q=80",
  health: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=900&q=80",
  politics: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=900&q=80",
};

export const CATEGORY_TINT = {
  world: "text-cyan-300",
  tech: "text-fuchsia-300",
  ai: "text-violet-300",
  business: "text-emerald-300",
  science: "text-sky-300",
  sports: "text-orange-300",
  entertainment: "text-rose-300",
  health: "text-pink-300",
  politics: "text-amber-300",
};

export const imageFor = (category) => IMAGES[(category || "").toLowerCase()] || IMAGES.world;

export const readingTime = (text = "") => {
  const words = `${text}`.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 60) + 1);
};