import React, { useEffect, useState } from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";

const carIcon = (deg, scale = 1) =>
  L.divIcon({
    className: "",
    iconSize: [16 * scale, 22 * scale],
    iconAnchor: [8 * scale, 11 * scale],
    html: `<div style="transform:rotate(${deg}deg);width:${14 * scale}px;height:${20 * scale}px;border-radius:${5 * scale}px;background:#111;border:1px solid rgba(255,255,255,0.85);box-shadow:0 2px 6px rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center">
      <div style="width:${6 * scale}px;height:${9 * scale}px;border-radius:2px;background:#facc15"></div>
    </div>`,
  });

const seedCars = (center, count) =>
  Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + Math.random();
    const dist = 0.004 + Math.random() * 0.012;
    return {
      id: i,
      lat: center.lat + Math.sin(angle) * dist,
      lng: center.lng + Math.cos(angle) * dist,
      dLat: (Math.random() - 0.5) * 0.0007,
      dLng: (Math.random() - 0.5) * 0.0007,
      deg: Math.random() * 360,
    };
  });

// Decorative traffic that keeps drifting across the map, so the map always feels alive.
export default function MovingTraffic({ center, count = 8 }) {
  const [cars, setCars] = useState(() => seedCars(center, count));

  useEffect(() => {
    setCars(seedCars(center, count));
    const id = setInterval(() => {
      setCars((prev) =>
        prev.map((c) => {
          let dLat = c.dLat, dLng = c.dLng;
          let lat = c.lat + dLat, lng = c.lng + dLng;
          if (Math.abs(lat - center.lat) > 0.016) { dLat = -dLat; lat = c.lat; }
          if (Math.abs(lng - center.lng) > 0.02) { dLng = -dLng; lng = c.lng; }
          return { ...c, lat, lng, dLat, dLng, deg: (Math.atan2(dLat, dLng) * 180) / Math.PI + 90 };
        })
      );
    }, 1000);
    return () => clearInterval(id);
  }, [center.lat, center.lng, count]);

  return cars.map((c) => <Marker key={c.id} position={[c.lat, c.lng]} icon={carIcon(c.deg)} interactive={false} />);
}

export { carIcon };