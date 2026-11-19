const FX_URL = "https://open.er-api.com/v6/latest/USD";
const CRYPTO_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=8&page=1&sparkline=false";

export default async function (req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const base = String(body.base || "USD").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3) || "USD";

    const [fxRes, cryptoRes] = await Promise.allSettled([
      fetch(FX_URL, { signal: AbortSignal.timeout(10000) }),
      fetch(CRYPTO_URL, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(10000) }),
    ]);

    let fx: { base: string; rates: Record<string, number>; updated: string } = {
      base: "USD",
      rates: {},
      updated: "",
    };

    if (fxRes.status === "fulfilled" && fxRes.value.ok) {
      const json = await fxRes.value.json().catch(() => null);
      const usdRates = json?.rates && typeof json.rates === "object" ? json.rates : {};
      const baseRate = Number(usdRates[base]);
      if (baseRate) {
        const rates: Record<string, number> = {};
        for (const [code, value] of Object.entries(usdRates)) {
          const n = Number(value);
          if (Number.isFinite(n)) rates[code] = Number((n / baseRate).toFixed(4));
        }
        fx = { base, rates, updated: json?.time_last_update_utc || "" };
      }
    }

    let crypto: any[] = [];
    if (cryptoRes.status === "fulfilled" && cryptoRes.value.ok) {
      const json = await cryptoRes.value.json().catch(() => null);
      if (Array.isArray(json)) {
        crypto = json.map((c: any) => ({
          symbol: String(c.symbol || "").toUpperCase(),
          name: c.name,
          price: Number(c.current_price) || 0,
          change24h: Number(c.price_change_percentage_24h) || 0,
          image: c.image || "",
        }));
      }
    }

    return Response.json({ fx, crypto });
  } catch (error) {
    return Response.json({ error: "Rates are unavailable right now." }, { status: 502 });
  }
}