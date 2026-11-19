export const AIRPORTS = [
  { code: "YYZ", city: "Toronto", name: "Toronto Pearson", country: "Canada", lat: 43.6777, lng: -79.6248 },
  { code: "YTZ", city: "Toronto", name: "Billy Bishop City", country: "Canada", lat: 43.6275, lng: -79.3962 },
  { code: "YVR", city: "Vancouver", name: "Vancouver Intl", country: "Canada", lat: 49.1967, lng: -123.1815 },
  { code: "YUL", city: "Montreal", name: "Montréal-Trudeau", country: "Canada", lat: 45.4706, lng: -73.7408 },
  { code: "YYC", city: "Calgary", name: "Calgary Intl", country: "Canada", lat: 51.1139, lng: -114.0203 },
  { code: "JFK", city: "New York", name: "John F. Kennedy", country: "USA", lat: 40.6413, lng: -73.7781 },
  { code: "LAX", city: "Los Angeles", name: "Los Angeles Intl", country: "USA", lat: 33.9416, lng: -118.4085 },
  { code: "ORD", city: "Chicago", name: "O'Hare", country: "USA", lat: 41.9742, lng: -87.9073 },
  { code: "MIA", city: "Miami", name: "Miami Intl", country: "USA", lat: 25.7959, lng: -80.2870 },
  { code: "SFO", city: "San Francisco", name: "San Francisco Intl", country: "USA", lat: 37.6213, lng: -122.3790 },
  { code: "LHR", city: "London", name: "Heathrow", country: "UK", lat: 51.4700, lng: -0.4543 },
  { code: "CDG", city: "Paris", name: "Charles de Gaulle", country: "France", lat: 49.0097, lng: 2.5479 },
  { code: "DXB", city: "Dubai", name: "Dubai Intl", country: "UAE", lat: 25.2532, lng: 55.3657 },
  { code: "NRT", city: "Tokyo", name: "Narita", country: "Japan", lat: 35.7720, lng: 140.3929 },
  { code: "SYD", city: "Sydney", name: "Kingsford Smith", country: "Australia", lat: -33.9399, lng: 151.1753 },
  { code: "DEL", city: "Delhi", name: "Indira Gandhi", country: "India", lat: 28.5562, lng: 77.1000 },
];

const toRad = (v) => (v * Math.PI) / 180;

export function distanceKm(a, b) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function airportByCode(code) {
  return AIRPORTS.find((a) => a.code === code) || AIRPORTS[0];
}