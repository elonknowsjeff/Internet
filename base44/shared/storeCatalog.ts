// Server-owned prices. Checkout amounts are always computed here — never sent by the browser.
export const STORE_CATALOG = {
  mcdonalds: { name: "McDonald's", fee: 1.99, items: { "Big Mac": 7.29, "10 McNuggets": 8.19, "McDouble": 3.39, "Fries (Large)": 3.99, "Coca-Cola (Medium)": 2.29 } },
  timhortons: { name: "Tim Hortons", fee: 1.49, items: { "Double Double (Medium)": 2.19, "Iced Capp": 3.79, "Bagel BELT": 5.29, "Timbits (10)": 3.49, "Farmer's Wrap": 5.79 } },
  subway: { name: "Subway", fee: 1.99, items: { '6" Turkey Breast': 6.49, "Footlong Italian B.M.T.": 11.29, "Chicken Bacon Ranch": 7.99, "Chips": 1.79 } },
  popeyes: { name: "Popeyes", fee: 2.49, items: { "3pc Chicken Combo": 12.99, "Chicken Sandwich": 8.49, "Cajun Fries": 3.99, "Biscuit": 1.99 } },
  pizzapizza: { name: "Pizza Pizza", fee: 2.49, items: { "Medium Pepperoni": 14.99, "Large Cheese": 17.99, "Garlic Bread": 5.49, "Chicken Wings (10)": 13.49 } },
  wendys: { name: "Wendy's", fee: 1.99, items: { "Baconator": 8.99, "Dave's Single": 6.29, "Frosty": 3.19, "Fries (Medium)": 3.29 } },
  starbucks: { name: "Starbucks", fee: 1.49, items: { "Caffè Latte (Grande)": 4.95, "Caramel Frappuccino": 5.75, "Cold Brew": 4.45, "Butter Croissant": 3.95 } },
  kfc: { name: "KFC", fee: 2.49, items: { "3pc Combo": 11.99, "Zinger Sandwich": 7.49, "Popcorn Chicken": 6.99, "Gravy": 2.49 } },
  osmows: { name: "Osmow's Shawarma", fee: 2.29, items: { "Chicken Shawarma Wrap": 9.49, "Chicken on the Rocks": 14.99, "Beef Shawarma Plate": 15.49, "Garlic Sauce Side": 1.49 } },
  sushishop: { name: "Sushi Shop", fee: 2.99, items: { "Salmon Sashimi (9)": 15.99, "California Roll (8)": 9.49, "Spicy Tuna Roll": 10.99, "Miso Soup": 3.49 } },
  walmart: { name: "Walmart Grocery", fee: 3.99, items: { "Milk 2L": 3.29, "Large Eggs (12)": 4.49, "Whole Wheat Bread": 2.99, "Bananas (bunch)": 1.79, "Chicken Breast 1kg": 12.49, "Laundry Detergent": 9.99 } },
  costco: { name: "Costco", fee: 4.99, items: { "Rotisserie Chicken": 7.99, "Kirkland Olive Oil 2L": 24.99, "Paper Towels (12)": 22.99, "Mixed Berries 1.5kg": 11.99 } },
  loblaws: { name: "Loblaws", fee: 3.49, items: { "PC Free Range Eggs": 5.49, "Fresh Salmon Fillet": 11.99, "Sourdough Loaf": 4.29, "Avocados (3)": 4.99, "Greek Yogurt 750g": 5.29 } },
  nofrills: { name: "No Frills", fee: 2.99, items: { "Instant Ramen (5 pack)": 3.49, "Frozen Pizza": 5.99, "Rice 2kg": 6.49, "Peanut Butter 1kg": 5.99 } },
  freshco: { name: "FreshCo", fee: 2.99, items: { "Strawberries 454g": 3.99, "Broccoli Crowns": 2.49, "Ground Beef 500g": 7.49, "Orange Juice 1.89L": 4.29 } },
  metro: { name: "Metro", fee: 3.49, items: { "Deli Sliced Turkey 200g": 6.99, "Fresh Baguette": 2.99, "Cheddar Block 400g": 6.49, "Sparkling Water (12)": 5.99 } },
  sobeys: { name: "Sobeys", fee: 3.99, items: { "Compliments Bacon 375g": 6.49, "Fresh Peppers (3)": 3.99, "Ice Cream 1.5L": 5.99, "Coffee Cream 1L": 3.79 } },
  foodbasics: { name: "Food Basics", fee: 2.49, items: { "Pasta 900g": 1.99, "Tomato Sauce": 1.79, "Chicken Drumsticks 1kg": 6.99, "Apples (bag)": 3.99 } },
  pawprint: { name: "PawPrint Rescue", fee: 0, items: { "Golden Retriever Puppy": 1200, "Tabby Kitten": 320, "French Bulldog Puppy": 1800, "Rescue Beagle (adult)": 240, "Kitten Starter Kit": 89 } },
  happyhops: { name: "Happy Hops Small Pets", fee: 19.99, items: { "Holland Lop Rabbit": 180, "Guinea Pig Pair": 140, "Syrian Hamster": 45, "Hutch + Bedding Bundle": 210 } },
  featherfriends: { name: "Feathered Friends Aviary", fee: 24.99, items: { "Budgie Pair": 120, "Cockatiel": 260, "Canary": 150, "Flight Cage": 189 } },
  aquaticlife: { name: "Aquatic Life Aquarium", fee: 19.99, items: { "Betta Fish (male)": 25, "Goldfish Pair": 18, "Leopard Gecko": 130, "20L Starter Aquarium": 149 } },
};

export const RIDE_TIERS = {
  UberX: { label: "UberX", price: 12 },
  Comfort: { label: "Comfort", price: 16.5 },
  Black: { label: "Black", price: 24 },
  XL: { label: "XL", price: 19 },
};

export function priceEatsOrder(storeId, rawItems) {
  const store = STORE_CATALOG[storeId];
  if (!store) return { error: "Unknown store" };
  if (!Array.isArray(rawItems) || rawItems.length === 0) return { error: "Cart is empty" };
  const lines = [];
  for (const item of rawItems) {
    const name = String(item?.name || "");
    const qty = Math.floor(Number(item?.quantity ?? item?.qty));
    if (!store.items[name]) return { error: `Unknown item: ${name}` };
    if (!Number.isFinite(qty) || qty < 1 || qty > 20) return { error: `Bad quantity for ${name}` };
    lines.push({ name, unitAmount: Math.round(store.items[name] * 100), quantity: qty });
  }
  const subtotal = lines.reduce((sum, l) => sum + (l.unitAmount / 100) * l.quantity, 0);
  const fee = store.fee;
  return { store, lines, subtotal, fee, total: subtotal + fee };
}