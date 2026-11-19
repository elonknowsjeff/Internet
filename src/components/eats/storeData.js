// Real-world restaurant + grocery chains users can order from inside Walza Plus Eats.
const logo = (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
const photo = (id) => `https://images.unsplash.com/${id}?w=500`;

const BURGER = photo("photo-1550547660-d9450f859349");
const PIZZA = photo("photo-1565299624946-b28f40a0ae38");
const COFFEE = photo("photo-1495474472287-4d71bcdd2085");
const DESSERT = photo("photo-1551024601-bec78aea704b");
const SALAD = photo("photo-1512621776951-a57141f2eefd");
const SEAFOOD = photo("photo-1559737558-2f5a35f4523b");
const MEDITERRANEAN = photo("photo-1504674900247-0877df9cc836");
const GROCERY = photo("photo-1542838132-92c53300491e");
const ASIAN = photo("photo-1579871494447-9811cf80d66c");

export const STORES = [
  {
    id: "mcdonalds", name: "McDonald's", category: "restaurant", cuisine: "Burgers · Fast food",
    rating: 4.4, eta: "15-25 min", fee: 1.99, image: BURGER, logo: logo("mcdonalds.com"),
    menu: [
      { name: "Big Mac", price: 7.29 }, { name: "10 McNuggets", price: 8.19 },
      { name: "McDouble", price: 3.39 }, { name: "Fries (Large)", price: 3.99 },
      { name: "Coca-Cola (Medium)", price: 2.29 },
    ],
  },
  {
    id: "timhortons", name: "Tim Hortons", category: "restaurant", cuisine: "Coffee · Breakfast",
    rating: 4.5, eta: "10-20 min", fee: 1.49, image: COFFEE, logo: logo("timhortons.com"),
    menu: [
      { name: "Double Double (Medium)", price: 2.19 }, { name: "Iced Capp", price: 3.79 },
      { name: "Bagel BELT", price: 5.29 }, { name: "Timbits (10)", price: 3.49 },
      { name: "Farmer's Wrap", price: 5.79 },
    ],
  },
  {
    id: "subway", name: "Subway", category: "restaurant", cuisine: "Sandwiches",
    rating: 4.2, eta: "15-25 min", fee: 1.99, image: SALAD, logo: logo("subway.com"),
    menu: [
      { name: "6\" Turkey Breast", price: 6.49 }, { name: "Footlong Italian B.M.T.", price: 11.29 },
      { name: "Chicken Bacon Ranch", price: 7.99 }, { name: "Chips", price: 1.79 },
    ],
  },
  {
    id: "popeyes", name: "Popeyes", category: "restaurant", cuisine: "Fried chicken",
    rating: 4.3, eta: "20-30 min", fee: 2.49, image: BURGER, logo: logo("popeyes.com"),
    menu: [
      { name: "3pc Chicken Combo", price: 12.99 }, { name: "Chicken Sandwich", price: 8.49 },
      { name: "Cajun Fries", price: 3.99 }, { name: "Biscuit", price: 1.99 },
    ],
  },
  {
    id: "pizzapizza", name: "Pizza Pizza", category: "restaurant", cuisine: "Pizza",
    rating: 4.1, eta: "25-35 min", fee: 2.49, image: PIZZA, logo: logo("pizzapizza.ca"),
    menu: [
      { name: "Medium Pepperoni", price: 14.99 }, { name: "Large Cheese", price: 17.99 },
      { name: "Garlic Bread", price: 5.49 }, { name: "Chicken Wings (10)", price: 13.49 },
    ],
  },
  {
    id: "wendys", name: "Wendy's", category: "restaurant", cuisine: "Burgers",
    rating: 4.2, eta: "18-28 min", fee: 1.99, image: BURGER, logo: logo("wendys.com"),
    menu: [
      { name: "Baconator", price: 8.99 }, { name: "Dave's Single", price: 6.29 },
      { name: "Frosty", price: 3.19 }, { name: "Fries (Medium)", price: 3.29 },
    ],
  },
  {
    id: "starbucks", name: "Starbucks", category: "restaurant", cuisine: "Coffee",
    rating: 4.6, eta: "10-15 min", fee: 1.49, image: COFFEE, logo: logo("starbucks.com"),
    menu: [
      { name: "Caffè Latte (Grande)", price: 4.95 }, { name: "Caramel Frappuccino", price: 5.75 },
      { name: "Cold Brew", price: 4.45 }, { name: "Butter Croissant", price: 3.95 },
    ],
  },
  {
    id: "kfc", name: "KFC", category: "restaurant", cuisine: "Fried chicken",
    rating: 4.0, eta: "20-30 min", fee: 2.49, image: BURGER, logo: logo("kfc.ca"),
    menu: [
      { name: "3pc Combo", price: 11.99 }, { name: "Zinger Sandwich", price: 7.49 },
      { name: "Popcorn Chicken", price: 6.99 }, { name: "Gravy", price: 2.49 },
    ],
  },
  {
    id: "osmows", name: "Osmow's Shawarma", category: "restaurant", cuisine: "Mediterranean",
    rating: 4.5, eta: "20-30 min", fee: 2.29, image: MEDITERRANEAN, logo: logo("osmows.com"),
    menu: [
      { name: "Chicken Shawarma Wrap", price: 9.49 }, { name: "Chicken on the Rocks", price: 14.99 },
      { name: "Beef Shawarma Plate", price: 15.49 }, { name: "Garlic Sauce Side", price: 1.49 },
    ],
  },
  {
    id: "sushishop", name: "Sushi Shop", category: "restaurant", cuisine: "Japanese · Sushi",
    rating: 4.4, eta: "25-35 min", fee: 2.99, image: SEAFOOD, logo: logo("sushishop.com"),
    menu: [
      { name: "Salmon Sashimi (9)", price: 15.99 }, { name: "California Roll (8)", price: 9.49 },
      { name: "Spicy Tuna Roll", price: 10.99 }, { name: "Miso Soup", price: 3.49 },
    ],
  },
  {
    id: "walmart", name: "Walmart Grocery", category: "grocery", cuisine: "Groceries · Household",
    rating: 4.3, eta: "45-60 min", fee: 3.99, image: GROCERY, logo: logo("walmart.ca"),
    menu: [
      { name: "Milk 2L", price: 3.29 }, { name: "Large Eggs (12)", price: 4.49 },
      { name: "Whole Wheat Bread", price: 2.99 }, { name: "Bananas (bunch)", price: 1.79 },
      { name: "Chicken Breast 1kg", price: 12.49 }, { name: "Laundry Detergent", price: 9.99 },
    ],
  },
  {
    id: "costco", name: "Costco", category: "grocery", cuisine: "Bulk groceries",
    rating: 4.6, eta: "60-90 min", fee: 4.99, image: GROCERY, logo: logo("costco.ca"),
    menu: [
      { name: "Rotisserie Chicken", price: 7.99 }, { name: "Kirkland Olive Oil 2L", price: 24.99 },
      { name: "Paper Towels (12)", price: 22.99 }, { name: "Mixed Berries 1.5kg", price: 11.99 },
    ],
  },
  {
    id: "loblaws", name: "Loblaws", category: "grocery", cuisine: "Groceries · Fresh",
    rating: 4.4, eta: "40-55 min", fee: 3.49, image: GROCERY, logo: logo("loblaws.ca"),
    menu: [
      { name: "PC Free Range Eggs", price: 5.49 }, { name: "Fresh Salmon Fillet", price: 11.99 },
      { name: "Sourdough Loaf", price: 4.29 }, { name: "Avocados (3)", price: 4.99 },
      { name: "Greek Yogurt 750g", price: 5.29 },
    ],
  },
  {
    id: "nofrills", name: "No Frills", category: "grocery", cuisine: "Discount groceries",
    rating: 4.2, eta: "35-50 min", fee: 2.99, image: GROCERY, logo: logo("nofrills.ca"),
    menu: [
      { name: "Instant Ramen (5 pack)", price: 3.49 }, { name: "Frozen Pizza", price: 5.99 },
      { name: "Rice 2kg", price: 6.49 }, { name: "Peanut Butter 1kg", price: 5.99 },
    ],
  },
  {
    id: "freshco", name: "FreshCo", category: "grocery", cuisine: "Groceries · Produce",
    rating: 4.1, eta: "35-50 min", fee: 2.99, image: GROCERY, logo: logo("freshco.com"),
    menu: [
      { name: "Strawberries 454g", price: 3.99 }, { name: "Broccoli Crowns", price: 2.49 },
      { name: "Ground Beef 500g", price: 7.49 }, { name: "Orange Juice 1.89L", price: 4.29 },
    ],
  },
  {
    id: "metro", name: "Metro", category: "grocery", cuisine: "Groceries · Deli",
    rating: 4.3, eta: "40-55 min", fee: 3.49, image: GROCERY, logo: logo("metro.ca"),
    menu: [
      { name: "Deli Sliced Turkey 200g", price: 6.99 }, { name: "Fresh Baguette", price: 2.99 },
      { name: "Cheddar Block 400g", price: 6.49 }, { name: "Sparkling Water (12)", price: 5.99 },
    ],
  },
  {
    id: "sobeys", name: "Sobeys", category: "grocery", cuisine: "Groceries · Bakery",
    rating: 4.2, eta: "45-60 min", fee: 3.99, image: GROCERY, logo: logo("sobeys.com"),
    menu: [
      { name: "Compliments Bacon 375g", price: 6.49 }, { name: "Fresh Peppers (3)", price: 3.99 },
      { name: "Ice Cream 1.5L", price: 5.99 }, { name: "Coffee Cream 1L", price: 3.79 },
    ],
  },
  {
    id: "foodbasics", name: "Food Basics", category: "grocery", cuisine: "Discount groceries",
    rating: 4.0, eta: "35-50 min", fee: 2.49, image: GROCERY, logo: logo("foodbasics.ca"),
    menu: [
      { name: "Pasta 900g", price: 1.99 }, { name: "Tomato Sauce", price: 1.79 },
      { name: "Chicken Drumsticks 1kg", price: 6.99 }, { name: "Apples (bag)", price: 3.99 },
    ],
  },
  {
    id: "pawprint", name: "PawPrint Rescue", category: "animals", cuisine: "Dogs & cats · Delivered home",
    rating: 4.8, eta: "Same day", fee: 0, image: photo("photo-1548199973-03cce0bbc87b"), logo: logo("ontariospca.ca"),
    menu: [
      { name: "Golden Retriever Puppy", price: 1200 }, { name: "Tabby Kitten", price: 320 },
      { name: "French Bulldog Puppy", price: 1800 }, { name: "Rescue Beagle (adult)", price: 240 },
      { name: "Kitten Starter Kit", price: 89 },
    ],
  },
  {
    id: "happyhops", name: "Happy Hops Small Pets", category: "animals", cuisine: "Rabbits · Guinea pigs · Hamsters",
    rating: 4.7, eta: "Same day", fee: 19.99, image: photo("photo-1552053831-71594a27632d"), logo: logo("petvalu.com"),
    menu: [
      { name: "Holland Lop Rabbit", price: 180 }, { name: "Guinea Pig Pair", price: 140 },
      { name: "Syrian Hamster", price: 45 }, { name: "Hutch + Bedding Bundle", price: 210 },
    ],
  },
  {
    id: "featherfriends", name: "Feathered Friends Aviary", category: "animals", cuisine: "Birds · Parrots",
    rating: 4.6, eta: "1-2 days", fee: 24.99, image: photo("photo-1518791841217-8f162f1e1131"), logo: logo("petsmart.com"),
    menu: [
      { name: "Budgie Pair", price: 120 }, { name: "Cockatiel", price: 260 },
      { name: "Canary", price: 150 }, { name: "Flight Cage", price: 189 },
    ],
  },
  {
    id: "aquaticlife", name: "Aquatic Life Aquarium", category: "animals", cuisine: "Fish · Reptiles",
    rating: 4.5, eta: "1-2 days", fee: 19.99, image: photo("photo-1514888286974-6c03e2ca1dba"), logo: logo("bigalonline.com"),
    menu: [
      { name: "Betta Fish (male)", price: 25 }, { name: "Goldfish Pair", price: 18 },
      { name: "Leopard Gecko", price: 130 }, { name: "20L Starter Aquarium", price: 149 },
    ],
  },
];

export const STORE_CATEGORIES = [
  { key: "all", label: "All" },
  { key: "restaurant", label: "Restaurants" },
  { key: "grocery", label: "Grocery stores" },
  { key: "animals", label: "Animals" },
];