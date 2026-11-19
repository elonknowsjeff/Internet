// Real geocoding + road routing (OpenStreetMap Nominatim + OSRM public demo servers)
const NOMINATIM = "https://nominatim.openstreetmap.org";
const OSRM = "https://router.project-osrm.org/route/v1/driving";

export const geocode = async (text) => {
  if (!text || !text.trim()) return null;
  try {
    const res = await fetch(`${NOMINATIM}/search?format=json&limit=1&addressdetails=0&q=${encodeURIComponent(text.trim())}`, {
      headers: { Accept: "application/json" },
    });
    const rows = await res.json();
    if (!rows?.[0]) return null;
    return { lat: parseFloat(rows[0].lat), lng: parseFloat(rows[0].lon), label: rows[0].display_name };
  } catch {
    return null;
  }
};

export const reverseGeocode = async ({ lat, lng }) => {
  try {
    const res = await fetch(`${NOMINATIM}/reverse?format=json&lat=${lat}&lon=${lng}`, { headers: { Accept: "application/json" } });
    const j = await res.json();
    return j?.display_name?.split(",").slice(0, 2).join(",") || null;
  } catch {
    return null;
  }
};

const straight = (a, b) => ({
  points: [[a.lat, a.lng], [b.lat, b.lng]],
  distanceKm: null,
  minutes: null,
});

// Real driving route with road geometry, distance and duration
export const roadRoute = async (a, b) => {
  if (!a || !b) return null;
  try {
    const url = `${OSRM}/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return straight(a, b);
    const json = await res.json();
    const r = json?.routes?.[0];
    if (!r?.geometry?.coordinates?.length) return straight(a, b);
    return {
      distanceKm: r.distance / 1000,
      minutes: Math.max(1, Math.round(r.duration / 60)),
      points: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    };
  } catch {
    return straight(a, b);
  }
};

// A point a given fraction (0..1) along a route polyline
export const pointAlong = (points, t) => {
  if (!points?.length) return null;
  if (points.length === 1) return { lat: points[0][0], lng: points[0][1] };
  const clamped = Math.min(1, Math.max(0, t));
  const idx = Math.min(points.length - 2, Math.floor(clamped * (points.length - 1)));
  const local = clamped * (points.length - 1) - idx;
  const [aLat, aLng] = points[idx];
  const [bLat, bLng] = points[idx + 1];
  return { lat: aLat + (bLat - aLat) * local, lng: aLng + (bLng - aLng) * local };
};