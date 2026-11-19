const C = [
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600",
  "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=600",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600",
  "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=600",
  "https://images.unsplash.com/photo-1511882150382-421056c89033?w=600",
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600",
];

export const seedGames = [
  { title: "Neon Drift", genre: "Racing", dimension: "3D", perspective: "Third Person", developer: "Walza AI Labs", cover: C[0], rating: 4.6, plays: 48200, likes: 3980, reposts: 340, hours_played: 12400, price: 19.99, discount: 40, ai_generated: true, tags: "AI generated,Racing,Cyberpunk", description: "An AI-forged neon city where every street is procedurally built and every rival is a live model. Race, drift, and outrun an evolving track that never repeats." },
  { title: "Shadow Protocol", genre: "Shooter", dimension: "3D", perspective: "First Person", developer: "Walza AI Labs", cover: C[1], rating: 4.8, plays: 64100, likes: 6100, reposts: 540, hours_played: 19100, price: 29.99, discount: 25, ai_generated: true, tags: "AI generated,FPS,Tactical", description: "A tactical FPS with AI-directed enemies that adapt to how you play. Every mission is generated around your last run." },
  { title: "Crown of Embers", genre: "RPG", dimension: "3D", perspective: "Third Person", developer: "Mythwright", cover: C[2], rating: 4.7, plays: 32100, likes: 2700, reposts: 260, hours_played: 16800, price: 39.99, discount: 0, ai_generated: true, tags: "AI generated,RPG,Fantasy", description: "A generated open world of warring kingdoms, where every NPC is written on the fly and remembers what you did." },
  { title: "Pixel Dungeon", genre: "Adventure", dimension: "2D", perspective: "Top-Down", developer: "Pixelforge", cover: C[3], rating: 4.4, plays: 19800, likes: 1620, reposts: 90, hours_played: 4100, price: 9.99, discount: 50, ai_generated: false, tags: "Roguelike,Pixel", description: "Descend through endless generated floors. Every run builds a new dungeon, new loot and new bosses." },
  { title: "Tactical Strike", genre: "Shooter", dimension: "3D", perspective: "First Person", developer: "Ironclad", cover: C[4], rating: 4.5, plays: 41200, likes: 3100, reposts: 300, hours_played: 7400, price: 24.99, discount: 30, ai_generated: false, tags: "FPS,Competitive", description: "Round-based 5v5 with a generated map pool and a full skin economy." },
  { title: "Zen Garden", genre: "Puzzle", dimension: "2D", perspective: "Top-Down", developer: "Calmwave", cover: C[5], rating: 4.6, plays: 17600, likes: 1540, reposts: 70, hours_played: 1900, price: 0, discount: 0, ai_generated: true, tags: "AI generated,Free,Puzzle", description: "A free AI-designed puzzle garden where each level is drawn for your mood." },
  { title: "Galaxy Conquest", genre: "Strategy", dimension: "3D", perspective: "Other", developer: "Nebula", cover: C[0], rating: 4.3, plays: 22100, likes: 1880, reposts: 120, hours_played: 3300, price: 14.99, discount: 20, ai_generated: false, tags: "Strategy,Space", description: "Build fleets, take systems and hold the line in a living galaxy." },
  { title: "Street Brawl", genre: "Action", dimension: "2D", perspective: "Side-View", developer: "Arcsys", cover: C[1], rating: 4.5, plays: 26800, likes: 2200, reposts: 180, hours_played: 3900, price: 12.99, discount: 0, ai_generated: false, tags: "Fighting,Arcade", description: "Hand-animated brawls across a neon downtown with a live tournament ladder." },
  { title: "Aether Wings", genre: "Arcade", dimension: "2D", perspective: "Side-View", developer: "Skyforge", cover: C[2], rating: 4.2, plays: 12400, likes: 910, reposts: 60, hours_played: 1200, price: 0, discount: 0, ai_generated: false, tags: "Free,Arcade", description: "A free flight arcade with generated sky islands and daily challenges." },
  { title: "Goal Machine", genre: "Sports", dimension: "3D", perspective: "Third Person", developer: "Pitchside", cover: C[3], rating: 4.4, plays: 28900, likes: 1970, reposts: 130, hours_played: 4100, price: 17.99, discount: 35, ai_generated: false, tags: "Sports,Football", description: "Fast football with generated tournaments and full kit customisation." },
  { title: "Lone Wolf", genre: "Shooter", dimension: "3D", perspective: "First Person", developer: "Walza AI Labs", cover: C[4], rating: 4.7, plays: 38500, likes: 3700, reposts: 410, hours_played: 8200, price: 34.99, discount: 0, ai_generated: true, tags: "AI generated,FPS,Solo", description: "A solo survival shooter where the forest, the enemy and the weather are all generated live." },
  { title: "Mystic Vale", genre: "Adventure", dimension: "3D", perspective: "Third Person", developer: "Greenleaf", cover: C[5], rating: 4.6, plays: 29700, likes: 2500, reposts: 220, hours_played: 5600, price: 21.99, discount: 15, ai_generated: false, tags: "Adventure,Open world", description: "An open valley of ruins, puzzles and a story that reacts to your choices." },
];

export const seedSkins = [
  { name: "Neon Drift — Holographic Wrap", game: "Neon Drift", type: "Wrap", rarity: "Covert", wear: "Factory New", float: 0.01, price: 89.5, image: C[0], listings: 3, stattrak: false },
  { name: "Shadow Protocol — Ghost Rifle", game: "Shadow Protocol", type: "Weapon", rarity: "Classified", wear: "Minimal Wear", float: 0.07, price: 64.0, image: C[1], listings: 7, stattrak: true },
  { name: "Crown of Embers — Ember Blade", game: "Crown of Embers", type: "Weapon", rarity: "Covert", wear: "Factory New", float: 0.02, price: 142.25, image: C[2], listings: 2, stattrak: false },
  { name: "Tactical Strike — Desert Camo", game: "Tactical Strike", type: "Weapon", rarity: "Mil-Spec", wear: "Field-Tested", float: 0.19, price: 18.75, image: C[4], listings: 24, stattrak: false },
  { name: "Tactical Strike — Rime Finish", game: "Tactical Strike", type: "Weapon", rarity: "Restricted", wear: "Well-Worn", float: 0.41, price: 33.4, image: C[3], listings: 11, stattrak: false },
  { name: "Lone Wolf — Arctic Operator", game: "Lone Wolf", type: "Character", rarity: "Classified", wear: "N/A", float: 0, price: 76.0, image: C[5], listings: 5, stattrak: false },
  { name: "Pixel Dungeon — Golden Sprite", game: "Pixel Dungeon", type: "Charm", rarity: "Industrial", wear: "N/A", float: 0, price: 4.25, image: C[3], listings: 58, stattrak: false },
  { name: "Galaxy Conquest — Void Fleet", game: "Galaxy Conquest", type: "Ship", rarity: "Covert", wear: "N/A", float: 0, price: 119.99, image: C[0], listings: 1, stattrak: false },
  { name: "Street Brawl — Chrome Gloves", game: "Street Brawl", type: "Gloves", rarity: "Restricted", wear: "Factory New", float: 0.05, price: 41.0, image: C[1], listings: 9, stattrak: false },
  { name: "Goal Machine — Away Kit 26", game: "Goal Machine", type: "Kit", rarity: "Consumer", wear: "N/A", float: 0, price: 2.99, image: C[3], listings: 120, stattrak: false },
  { name: "Mystic Vale — Spirit Cape", game: "Mystic Vale", type: "Cosmetic", rarity: "Contraband", wear: "N/A", float: 0, price: 249.0, image: C[5], listings: 1, stattrak: false },
  { name: "Aether Wings — Prism Trail", game: "Aether Wings", type: "Trail", rarity: "Mil-Spec", wear: "N/A", float: 0, price: 7.5, image: C[2], listings: 32, stattrak: false },
];

export const rarityColor = {
  Consumer: "text-neutral-300 border-neutral-500/50",
  Industrial: "text-sky-300 border-sky-500/50",
  "Mil-Spec": "text-blue-300 border-blue-500/50",
  Restricted: "text-violet-300 border-violet-500/50",
  Classified: "text-fuchsia-300 border-fuchsia-500/50",
  Covert: "text-rose-300 border-rose-500/50",
  Contraband: "text-amber-300 border-amber-500/50",
};

export const priceOf = (g) => {
  const p = Number(g.price || 0);
  const d = Number(g.discount || 0);
  return { base: p, now: +(p * (1 - d / 100)).toFixed(2), off: d > 0 ? d : 0 };
};