const BASE = "https://www.themealdb.com/api/json/v1/1";

const priceFor = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 997;
  return Number((9 + (h % 22) + 0.99).toFixed(2));
};

function shape(m: any) {
  if (!m) return null;
  const ingredients: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const item = m[`strIngredient${i}`];
    const qty = m[`strMeasure${i}`];
    if (item && String(item).trim()) {
      ingredients.push(`${qty ? String(qty).trim() + " " : ""}${String(item).trim()}`);
    }
  }
  return {
    id: m.idMeal,
    name: m.strMeal,
    category: m.strCategory || "Meal",
    area: m.strArea || "Global",
    image: m.strMealThumb,
    instructions: String(m.strInstructions || "").slice(0, 1600),
    ingredients,
    source: m.strSource || "",
    youtube: m.strYoutube || "",
    price: priceFor(m.strMeal || ""),
  };
}

export default async function (req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = String(body.query || "").trim().slice(0, 60);
    const category = String(body.category || "").trim().slice(0, 40);

    let url = `${BASE}/search.php?s=${encodeURIComponent(query || "a")}`;
    if (category) url = `${BASE}/filter.php?c=${encodeURIComponent(category)}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return Response.json({ dishes: [], error: "Food data is unavailable right now." });
    const json = await res.json().catch(() => null);
    const meals: any[] = Array.isArray(json?.meals) ? json.meals : [];

    const dishes = meals.slice(0, 24).map(shape).filter(Boolean);
    return Response.json({ dishes, query, category });
  } catch (error) {
    return Response.json({ dishes: [], error: "Food data is unavailable right now." });
  }
}