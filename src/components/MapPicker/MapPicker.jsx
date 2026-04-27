import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onSelect(lat, lng);
    },
  });

  return null;
}

function RecenterMap({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 13, {
        animate: true,
        duration: 0.8,
      });
    }
  }, [position, map]);

  return null;
}

function MapPicker({ lat, long, onChange, height = 350 }) {
  const markerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const hasPosition =
    lat !== "" &&
    long !== "" &&
    lat !== null &&
    long !== null &&
    !Number.isNaN(parseFloat(lat)) &&
    !Number.isNaN(parseFloat(long));

  const position = hasPosition
    ? [parseFloat(lat), parseFloat(long)]
    : [20.0, 0.0];

  const updatePosition = (newLat, newLong) => {
    const fixedLat = parseFloat(newLat).toFixed(6);
    const fixedLong = parseFloat(newLong).toFixed(6);
    onChange(fixedLat, fixedLong);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setSearchError("");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        updatePosition(data[0].lat, data[0].lon);
      } else {
        setSearchError("Location not found");
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchError("Search failed");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setSearchError("Geolocation is not supported by this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updatePosition(position.coords.latitude, position.coords.longitude);
        setSearchError("");
      },
      (error) => {
        console.error(error);
        setSearchError("Could not get your location");
      }
    );
  };

  const handleClear = () => {
    onChange("", "");
    setSearchQuery("");
    setSearchError("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search location..."
          className="flex-1 border border-gray-300 p-2 rounded"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
        />

        <button
          type="button"
          onClick={handleSearch}
          disabled={searchLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {searchLoading ? "Searching..." : "Search"}
        </button>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          My Location
        </button>

        <button
          type="button"
          onClick={handleClear}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Clear
        </button>
      </div>

      {searchError && <p className="text-red-500 text-sm">{searchError}</p>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Latitude</label>
          <input
            type="number"
            step="0.000001"
            value={lat || ""}
            onChange={(e) => onChange(e.target.value, long || "")}
            className="w-full border border-gray-300 p-2 rounded"
            placeholder="Latitude"
            onWheel={(e) => e.target.blur()}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Longitude</label>
          <input
            type="number"
            step="0.000001"
            value={long || ""}
            onChange={(e) => onChange(lat || "", e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
            placeholder="Longitude"
            onWheel={(e) => e.target.blur()}
          />
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-gray-300">
        <div className="bg-gray-50 px-3 py-2 border-b text-sm text-gray-600">
          Click anywhere on the map to drop a pin
        </div>

        <MapContainer
          center={position}
          zoom={hasPosition ? 13 : 2}
          style={{ height: `${height}px`, width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onSelect={updatePosition} />
          {hasPosition && <RecenterMap position={position} />}

          {hasPosition && (
            <Marker
              position={position}
              draggable={true}
              ref={markerRef}
              eventHandlers={{
                dragend: () => {
                  const marker = markerRef.current;
                  if (marker) {
                    const pos = marker.getLatLng();
                    updatePosition(pos.lat, pos.lng);
                  }
                },
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapPicker;
