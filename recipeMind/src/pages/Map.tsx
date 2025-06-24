import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// Custom icon for nearby places
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const RecenterMap = ({
  x_cord,
  y_cord,
}: {
  x_cord: number;
  y_cord: number;
}) => {
  const map = useMap();
  useEffect(() => {
    map.setView([x_cord, y_cord], 13);
  }, [x_cord, y_cord, map]);
  return null;
};

interface NearbyPlace {
  id: string;
  lat: number;
  lon: number;
  name: string;
  type: string;
  amenity?: string;
  shop?: string;
  cuisine?: string;
  brand?: string;
  category?: string;
}

const UserLocationMap: React.FC = () => {
  const [Loc, setLoc] = useState<[number, number] | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "supermarket",
    "convenience",
    "grocery",
  ]);

  const categories = {
    supermarket: { color: "#27AE60", label: "Supermarkets" },
    convenience: { color: "#3498DB", label: "Convenience Stores" },
    grocery: { color: "#E74C3C", label: "Grocery Stores" },
    butcher: { color: "#8E44AD", label: "Butcher Shops" },
    bakery: { color: "#F39C12", label: "Bakeries" },
    greengrocer: { color: "#2ECC71", label: "Fruit & Vegetables" },
    deli: { color: "#E67E22", label: "Delis" },
    organic: { color: "#16A085", label: "Organic Stores" },
  };

  const fetchNearbyPlaces = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simplified query to reduce load on API
      const radius = 2000;
      const query = `
        [out:json][timeout:30];
        (
          node["shop"~"supermarket|convenience|grocery|department_store"](around:${radius},${lat},${lon});
          way["shop"~"supermarket|convenience|grocery|department_store"](around:${radius},${lat},${lon});
        );
        out center;
      `;

      console.log("Making API request...");

      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: query,
      });

      if (response.status === 429) {
        throw new Error(
          "Rate limit exceeded. Please wait a moment and try again."
        );
      }

      if (response.status === 504) {
        throw new Error(
          "Request timeout. Try reducing the search area or try again later."
        );
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API response received:", data);

      if (!data.elements || data.elements.length === 0) {
        console.log("No elements found in API response");
        setNearbyPlaces([]);
        return;
      }

      const places: NearbyPlace[] = data.elements
        .map((element: any) => {
          const lat = element.lat || (element.center && element.center.lat);
          const lon = element.lon || (element.center && element.center.lon);

          if (!lat || !lon) return null;

          let name = "Store";
          if (element.tags) {
            name =
              element.tags.name ||
              element.tags.brand ||
              element.tags.shop ||
              "Grocery Store";
          }

          return {
            id: element.id.toString(),
            lat: lat,
            lon: lon,
            name: name,
            type: element.tags?.shop || "grocery",
            amenity: element.tags?.amenity,
            shop: element.tags?.shop,
            brand: element.tags?.brand,
            category: element.tags?.shop || "grocery",
          };
        })
        .filter((place) => place !== null)
        .slice(0, 30);

      console.log("Processed places:", places);
      setNearbyPlaces(places);
    } catch (error) {
      console.error("Error fetching nearby places:", error);

      if (error.message.includes("Rate limit")) {
        alert(
          "API rate limit reached. Please wait 30-60 seconds before trying again.\n\nTip: The free Overpass API has usage limits. Try refreshing the page after a short wait."
        );
      } else if (error.message.includes("timeout")) {
        alert(
          "Request timed out. This area might have too much data.\n\nTry:\n• Waiting a moment and refreshing\n• Moving to a different location"
        );
      } else {
        alert(
          `Unable to fetch nearby places: ${error.message}\n\nThis could be due to:\n• Network connectivity issues\n• API server problems\n• Rate limiting`
        );
      }

      // Set empty array so UI shows "0 stores found"
      setNearbyPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setLoc(location);
        fetchNearbyPlaces(location[0], location[1]);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to access your location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    if (Loc) {
      fetchNearbyPlaces(Loc[0], Loc[1]);
    }
  }, [selectedCategories]);

  const getMarkerColor = (place: NearbyPlace): string => {
    if (place.shop && categories[place.shop as keyof typeof categories]) {
      return categories[place.shop as keyof typeof categories].color;
    }
    // Default green for any grocery-related store not in our specific categories
    return "#27AE60";
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div>
      {/* Controls */}
      <div
        style={{
          padding: "15px",
          backgroundColor: "#f5f5f5",
          marginBottom: "10px",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "16px" }}>
            Grocery Stores Near You
          </h3>
          <button
            onClick={() => Loc && fetchNearbyPlaces(Loc[0], Loc[1])}
            disabled={loading || !Loc}
            style={{
              padding: "8px 16px",
              backgroundColor: loading ? "#ccc" : "#27AE60",
              color: "white",
              border: "none",
              borderRadius: "20px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            {loading ? "Loading..." : "🔄 Refresh"}
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {Object.entries(categories).map(([key, { color, label }]) => (
            <button
              key={key}
              onClick={() => toggleCategory(key)}
              style={{
                padding: "6px 12px",
                backgroundColor: selectedCategories.includes(key)
                  ? color
                  : "#ffffff",
                color: selectedCategories.includes(key) ? "white" : "#333",
                border: `2px solid ${color}`,
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {loading && (
          <div
            style={{ margin: "10px 0 0 0", fontSize: "14px", color: "#666" }}
          >
            <p style={{ margin: 0 }}>🔍 Searching for grocery stores...</p>
            <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#888" }}>
              This may take a few seconds. If you get an error, please wait
              30-60 seconds before trying again.
            </p>
          </div>
        )}
      </div>

      {/* Map */}
      <MapContainer
        center={Loc || [51.505, -0.09]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker */}
        {Loc && (
          <>
            <RecenterMap x_cord={Loc[0]} y_cord={Loc[1]} />
            <Marker position={Loc}>
              <Popup>
                <strong>You are here</strong>
                <br />
                📍 Your current location
              </Popup>
            </Marker>
          </>
        )}

        {/* Nearby places markers */}
        {nearbyPlaces.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lon]}
            icon={createCustomIcon(getMarkerColor(place))}
          >
            <Popup>
              <div>
                <strong>{place.name}</strong>
                <br />
                <span style={{ color: "#666" }}>
                  {place.amenity && `📍 ${place.amenity}`}
                  {place.shop && `🛍️ ${place.shop}`}
                  {place.cuisine && ` • ${place.cuisine}`}
                </span>
                <br />
                <small style={{ color: "#888" }}>
                  {place.lat.toFixed(4)}, {place.lon.toFixed(4)}
                </small>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Places count */}
      <div
        style={{
          padding: "10px",
          backgroundColor: "#f9f9f9",
          marginTop: "10px",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
          Showing {nearbyPlaces.length} grocery stores within 2km
        </p>
      </div>
    </div>
  );
};

export default UserLocationMap;
