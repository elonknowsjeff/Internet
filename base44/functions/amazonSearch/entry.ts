const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const decode = (v: string) =>
  String(v || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

const num = (v?: string) => {
  if (!v) return undefined;
  const n = Number(String(v).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : undefined;
};

type Product = {
  asin: string;
  title: string;
  price?: number;
  rating?: number;
  reviews?: number;
  prime: boolean;
  image: string;
  url: string;
};

function parse(html: string): Product[] {
  const out: Product[] = [];
  const chunks = html.split('data-component-type="s-search-result"').slice(1);
  for (const chunk of chunks) {
    const card = chunk.slice(0, 9000);
    const asin =
      (card.match(/data-asin="([A-Z0-9]{10})"/) || [])[1] ||
      (card.match(/\/dp\/([A-Z0-9]{10})/) || [])[1] ||
      "";
    const title =
      decode((card.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [])[1]) ||
      decode((card.match(/aria-label="([^"]{12,180})"/) || [])[1]);
    const image =
      (card.match(/class="s-image"[^>]*src="([^"]+)"/) || [])[1] ||
      (card.match(/src="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/) || [])[1] ||
      "";
    const whole = (card.match(/a-price-whole">([\d,]+)/) || [])[1];
    const frac = (card.match(/a-price-fraction">(\d{2})/) || [])[1];
    const offscreen = (card.match(/a-offscreen">\$([\d,.]+)</) || [])[1];
    const price = whole ? num(`${whole.replace(/,/g, "")}.${frac || "00"}`) : num(offscreen);
    const rating = num((card.match(/([\d.]+) out of 5 stars/) || [])[1]);
    const reviews = num((card.match(/s-underline-text">([\d,]+)</) || [])[1]);
    if (!title || !asin) continue;
    if (out.some((p) => p.asin === asin)) continue;
    out.push({
      asin,
      title: title.slice(0, 220),
      price,
      rating,
      reviews,
      prime: /a-icon-prime|aria-label="Amazon Prime"|Prime"/.test(card),
      image,
      url: `https://www.amazon.com/dp/${asin}`,
    });
    if (out.length >= 16) break;
  }
  return out;
}

export default async function (req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = typeof body.query === "string" ? body.query.trim().slice(0, 120) : "";
    if (!query) return Response.json({ products: [], error: "Type what you want to shop for." }, { status: 400 });

    const target = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
    let products: Product[] = [];
    let status = 0;

    for (let attempt = 1; attempt <= 2 && products.length === 0; attempt++) {
      const res = await fetch(target, {
        redirect: "follow",
        headers: {
          "User-Agent": UA,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
        },
        signal: AbortSignal.timeout(15000),
      });
      status = res.status;
      products = parse(await res.text());
      if (products.length === 0) await new Promise((r) => setTimeout(r, 600));
    }

    console.log("amazonSearch", { query, status, count: products.length });

    if (!products.length) {
      return Response.json({
        products: [],
        error: "Amazon sent no products back for that search. Try a simpler phrase.",
        searchUrl: `https://www.amazon.com/s?k=${encodeURIComponent(query)}`,
      });
    }

    return Response.json({
      products,
      searchUrl: `https://www.amazon.com/s?k=${encodeURIComponent(query)}`,
    });
  } catch (error) {
    console.error("amazonSearch failed", error);
    const msg =
      error && (error as { name?: string }).name === "TimeoutError"
        ? "Amazon took too long to answer. Try again."
        : "Could not reach Amazon right now.";
    return Response.json({ products: [], error: msg }, { status: 502 });
  }
}