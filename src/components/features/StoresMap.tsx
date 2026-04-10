"use client";

import { useState } from "react";
import Map, { Marker, Popup, NavigationControl, FullscreenControl } from "react-map-gl/mapbox";
import { MapPin, Clock, Phone } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

interface Store {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string | null;
  schedule?: string | null;
}

interface StoresMapProps {
  stores: Store[];
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

// Centro aproximado de México como fallback
const DEFAULT_CENTER = { latitude: 23.6345, longitude: -102.5528, zoom: 5 };

export function StoresMap({ stores }: StoresMapProps) {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  // Calcular centro del mapa a partir de las tiendas disponibles
  const initialCenter =
    stores.length > 0
      ? {
          latitude: stores.reduce((sum, s) => sum + s.latitude, 0) / stores.length,
          longitude: stores.reduce((sum, s) => sum + s.longitude, 0) / stores.length,
          zoom: stores.length === 1 ? 13 : 10,
        }
      : DEFAULT_CENTER;

  if (stores.length === 0) return null;

  return (
    <section className="w-full py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-[#58321D] mb-2">
            Nuestras Sucursales
          </h2>
          <p className="text-muted-foreground text-sm">
            Encuéntranos en {stores.length} punto{stores.length > 1 ? "s" : ""} de venta
          </p>
        </div>

        {/* Mapa */}
        <style>{`
          .mapboxgl-popup-close-button {
            font-size: 18px;
            line-height: 1;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #58321D;
            border-radius: 9999px;
            margin: 4px;
          }
          .mapboxgl-popup-close-button:hover {
            background-color: #F7DCBE;
            color: #58321D;
          }
        `}</style>
        <div className="rounded-2xl overflow-hidden shadow-lg border border-[#A6A3A2]/30"
             style={{ height: "480px" }}>
          <Map
            mapboxAccessToken={MAPBOX_TOKEN}
            initialViewState={initialCenter}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
          >
            <NavigationControl position="top-right" />
            <FullscreenControl position="top-right" />

            {stores.map((store) => (
              <Marker
                key={store.id}
                latitude={store.latitude}
                longitude={store.longitude}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedStore(store);
                }}
              >
                {/* Marcador personalizado */}
                <div className="cursor-pointer group flex flex-col items-center">
                  <div className="bg-[#58321D] text-white p-2 rounded-full shadow-lg
                                  group-hover:bg-[#A42D2C] transition-colors duration-200
                                  group-hover:scale-110 transform">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="w-0.5 h-2 bg-[#58321D] group-hover:bg-[#A42D2C] transition-colors" />
                </div>
              </Marker>
            ))}

            {/* Popup al hacer click en un marcador */}
            {selectedStore && (
              <Popup
                latitude={selectedStore.latitude}
                longitude={selectedStore.longitude}
                anchor="bottom"
                offset={42}
                onClose={() => setSelectedStore(null)}
                closeOnClick={false}
                maxWidth="280px"
              >
                <div className="p-1 space-y-2">
                  <h3 className="font-serif font-bold text-[#58321D] text-base leading-tight">
                    {selectedStore.name}
                  </h3>
                  <div className="flex items-start gap-1.5 text-sm text-gray-600">
                    <MapPin className="h-3.5 w-3.5 text-[#58321D] mt-0.5 shrink-0" />
                    <span>{selectedStore.address}</span>
                  </div>
                  {selectedStore.phone && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Phone className="h-3.5 w-3.5 text-[#58321D] shrink-0" />
                      <span>{selectedStore.phone}</span>
                    </div>
                  )}
                  {selectedStore.schedule && (
                    <div className="flex items-start gap-1.5 text-sm text-gray-600">
                      <Clock className="h-3.5 w-3.5 text-[#58321D] mt-0.5 shrink-0" />
                      <span>{selectedStore.schedule}</span>
                    </div>
                  )}
                </div>
              </Popup>
            )}
          </Map>
        </div>
      </div>
    </section>
  );
}
