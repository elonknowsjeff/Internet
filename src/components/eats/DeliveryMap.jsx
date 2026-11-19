import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { Bike } from "lucide-react";
import { geocode, roadRoute, pointAlong } from "@/lib/routes";
import "leaflet/dist/leaflet.css";

const MAP_CSS = `
.delivery-map .leaflet-tile-pane { filter: invert(1) hue-rotate(180deg) brightness(0.84) contrast(0.9); }
.delivery-map .leaflet-container { background: #100e26; }
.delivery-map .leaflet-control-attribution { font-size: 9px; background: rgba(0,0,0,0.35); color: rgba(255,255,255,0.5); }
`;

const courierIcon = () =>
  L.divIcon({
    className: "",
    html: `<div style="width:30px;height:30px;border-radius:999px;display:grid;place-items:center;background:#34d399;color:#062b1c;box-shadow:0 6px 18px rgba(0,0,0,.55);font-size:15px;font-weight:800">🚴</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

function Fit({ points }) {
  const map = useMap();
  const sig = points.map((p) => `${p[0].toFixed(3)},${p[1].toFixed(3)}`).join("|");
  useEffect(() => {
    if (points.length > 1) map.fitBounds(points, { padding: [34, 34], maxZoom: 16 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);
  return null;
}

export default function DeliveryMap({ address, progress = 0.45, height = "h-44" }) {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setData(null);
    setFailed(false);
    if (!address) { setFailed(true); return () => { alive = false; }; }
    (async () => {
      const dest = await geocode(address);
      if (!alive) return;
      if (!dest) { setFailed(true); return; }
      const origin = { lat: dest.lat - 0.021, lng: dest.lng - 0.026 };
      const rt = await roadRoute(origin, dest);
      if (!alive) return;
      setData({ dest, origin, points: rt?.points || [[origin.lat, origin.lng], [dest.lat, dest.lng]] });
    })();
    return () => { alive = false; };
  }, [address]);

  if (failed) {
    return (
      <div className={`${height} rounded-2xl border border-white/10 bg-white/[0.04] grid place-items-center text-center px-4`}>
        <div>
          <Bike className="w-6 h-6 mx-auto text-white/35" />
          <p className="text-[11px] text-white/45 mt-1.5">Add a delivery address to see the live map.</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className={`${height} rounded-2xl border border-white/10 bg-white/[0.04] animate-pulse`} />;
  }

  const courier = pointAlong(data.points, progress);

  return (
    <div className={`${height} rounded-2xl overflow-hidden border border-white/10 delivery-map relative`}>
      <style>{MAP_CSS}</style>
      <MapContainer center={[data.dest.lat, data.dest.lng]} zoom={14} zoomControl={false} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
        <Fit points={data.points} />
        <Polyline positions={data.points} pathOptions={{ color: "#0b0616", weight: 8, opacity: 0.5 }} />
        <Polyline positions={data.points} pathOptions={{ color: "#34d399", weight: 4, opacity: 0.95 }} />
        <CircleMarker center={[data.origin.lat, data.origin.lng]} radius={6} pathOptions={{ color: "#0b0616", weight: 3, fillColor: "#e879f9", fillOpacity: 1 }}>
          <Tooltip>Restaurant</Tooltip>
        </CircleMarker>
        <CircleMarker center={[data.dest.lat, data.dest.lng]} radius={7} pathOptions={{ color: "#0b0616", weight: 3, fillColor: "#f43f5e", fillOpacity: 1 }}>
          <Tooltip>You</Tooltip>
        </CircleMarker>
        {courier && <Marker position={[courier.lat, courier.lng]} icon={courierIcon()} />}
      </MapContainer>
    </div>
  );
}