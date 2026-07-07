"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// The map half of "help near you". CircleMarkers instead of icon markers:
// no bundler asset dance, and they tint to the page's scope accent so the
// map belongs to the same room as everything around it. Client-only —
// always reached through next/dynamic(ssr: false).

export interface MapPoint {
  lat: number;
  lon: number;
  title: string;
  subtitle?: string;
}

export function LocalMap({
  center,
  points,
  accent,
}: {
  center: { lat: number; lon: number };
  points: MapPoint[];
  accent: string;
}) {
  return (
    <div className="h-72 rounded-xl overflow-hidden border border-card-border">
      <MapContainer
        center={[center.lat, center.lon]}
        zoom={12}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* You are (roughly) here — hollow ring so it reads differently from results. */}
        <CircleMarker
          center={[center.lat, center.lon]}
          radius={7}
          pathOptions={{ color: accent, weight: 2, fillOpacity: 0 }}
        />
        {points.map((p, i) => (
          <CircleMarker
            key={`${p.title}-${i}`}
            center={[p.lat, p.lon]}
            radius={8}
            pathOptions={{ color: accent, weight: 1.5, fillColor: accent, fillOpacity: 0.55 }}
          >
            <Popup>
              <strong>{p.title}</strong>
              {p.subtitle && (
                <>
                  <br />
                  {p.subtitle}
                </>
              )}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
