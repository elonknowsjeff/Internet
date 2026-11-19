import React, { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, Marker, useMap } from "react-leaflet";
import MovingTraffic, { carIcon } from "@/components/rides/MovingTraffic";
import "leaflet/dist/leaflet.css";

const FALLBACK = { lat: 43.6532, lng: -79.3832 };

const MAP_CSS = `
.live-map .leaflet-tile-pane { filter: invert(1) hue-rotate(180deg) brightness(0.82) contrast(0.9) saturate(0.85); }
.live-map .route-line { stroke-dasharray: 16 10; animation: route-flow 1.1s linear infinite; }
@keyframes route-flow { to { stroke-dashoffset: -26; } }
.live-map .leaflet-container { background: #100e26; }
.live-map .leaflet-control-attribution { font-size: 9px; background: rgba(0,0,0,0.35); color: rgba(255,255,255,0.5); }
.live-map .leaflet-control-attribution a { color: rgba(255,255,255,0.65); }
`;

function Recenter({ points, zoom }) {
  const map = useMap();
  const sig = points.map((p) => `${p[0].toFixed(3)},${p[1].toFixed(3)}`).join("|");
  useEffect(() => {
    if (points.length > 1) map.fitBounds(points, { padding: [46, 46], maxZoom: 16 });
    else if (points.length === 1) map.setView(points[0], zoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);
  return null;
}

export default function LiveRideMap({ pickup, destination, driver, riderLocation, route, height = "h-64", dark = true, traffic = true, zoom = 15 }) {
  const points = [pickup, destination, driver, riderLocation].filter(Boolean);
  const center = points.length
    ? {
        lat: points.reduce((s, p) => s + p.lat, 0) / points.length,
        lng: points.reduce((s, p) => s + p.lng, 0) / points.length,
      }
    : FALLBACK;

  const routePoints = route && route.length > 1 ? route : null;
  const bounds = routePoints || [...(pickup ? [[pickup.lat, pickup.lng]] : []), ...(destination ? [[destination.lat, destination.lng]] : [])];

  return (
    <div className={`relative w-full ${height} bg-[#100e26] live-map`}>
      <style>{MAP_CSS}</style>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        zoomControl={false}
        scrollWheelZoom={false}
        attributionControl
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
        <Recenter points={bounds} zoom={zoom} />

        {routePoints ? (
          <>
            <Polyline positions={routePoints} pathOptions={{ color: "#0b0616", weight: 8, opacity: 0.55 }} />
            <Polyline positions={routePoints} pathOptions={{ color: "#e879f9", weight: 4, opacity: 0.95, className: "route-line" }} />
          </>
        ) : (
          pickup && destination && (
            <Polyline
              positions={[[pickup.lat, pickup.lng], [destination.lat, destination.lng]]}
              pathOptions={{ color: dark ? "#e879f9" : "#111", weight: 4, opacity: 0.9, className: "route-line" }}
            />
          )
        )}

        {pickup && (
          <CircleMarker center={[pickup.lat, pickup.lng]} radius={8} pathOptions={{ color: "#0b0616", weight: 3, fillColor: "#34d399", fillOpacity: 1 }}>
            <Tooltip>Pickup</Tooltip>
          </CircleMarker>
        )}

        {destination && (
          <CircleMarker center={[destination.lat, destination.lng]} radius={8} pathOptions={{ color: "#0b0616", weight: 3, fillColor: "#f43f5e", fillOpacity: 1 }}>
            <Tooltip>Destination</Tooltip>
          </CircleMarker>
        )}

        {riderLocation && (
          <CircleMarker center={[riderLocation.lat, riderLocation.lng]} radius={6} pathOptions={{ color: "#fff", weight: 3, fillColor: "#3b82f6", fillOpacity: 1 }}>
            <Tooltip permanent direction="top" offset={[0, -8]}>You</Tooltip>
          </CircleMarker>
        )}

        {driver && <Marker position={[driver.lat, driver.lng]} icon={carIcon(0, 1.5)} />}

        {traffic && <MovingTraffic center={center} />}
      </MapContainer>
    </div>
  );
}