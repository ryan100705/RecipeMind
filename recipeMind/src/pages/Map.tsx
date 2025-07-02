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
  const [searchRadius, setSearchRadius] = useState(2000); // Default 2km

  // Helper function to format radius for display
  const formatRadius = (radius: number): string => {
    if (radius >= 1000) {
      return `${(radius / 1000).toFixed(1)}km`;
    }
    return `${radius}m`;
  };

  const fetchNearbyPlaces = async (
    lat: number,
    lon: number,
    radius: number = searchRadius
  ) => {
    setLoading(true);
    try {
      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Query for supermarkets, grocery stores, wholesale stores, and supercenters - more precise filtering
      const query = `
        [out:json][timeout:30];
        (
          node["shop"="supermarket"](around:${radius},${lat},${lon});
          way["shop"="supermarket"](around:${radius},${lat},${lon});
          node["shop"="grocery"](around:${radius},${lat},${lon});
          way["shop"="grocery"](around:${radius},${lat},${lon});
          node["shop"="wholesale"](around:${radius},${lat},${lon});
          way["shop"="wholesale"](around:${radius},${lat},${lon});
          node["shop"="convenience"](around:${radius},${lat},${lon});
          way["shop"="convenience"](around:${radius},${lat},${lon});
          node["shop"="department_store"]["name"~"Target|Walmart|Meijer|Kmart"](around:${radius},${lat},${lon});
          way["shop"="department_store"]["name"~"Target|Walmart|Meijer|Kmart"](around:${radius},${lat},${lon});
          node["brand"~"Target|Walmart|Costco|Sam's Club|BJ's Wholesale Club|Meijer|Kroger|Safeway|Publix|H-E-B|Wegmans|Giant|Stop & Shop"](around:${radius},${lat},${lon});
          way["brand"~"Target|Walmart|Costco|Sam's Club|BJ's Wholesale Club|Meijer|Kroger|Safeway|Publix|H-E-B|Wegmans|Giant|Stop & Shop"](around:${radius},${lat},${lon});
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

          // Filter out non-grocery establishments
          if (element.tags) {
            // Exclude restaurants, cafes, bars, and other food service
            if (
              element.tags.amenity &&
              [
                "restaurant",
                "cafe",
                "bar",
                "pub",
                "fast_food",
                "food_court",
              ].includes(element.tags.amenity)
            ) {
              return null;
            }

            // Exclude clothing, electronics, and other non-food shops
            if (
              element.tags.shop &&
              [
                "clothes",
                "electronics",
                "furniture",
                "hardware",
                "books",
                "toys",
                "sports",
                "jewelry",
                "shoes",
                "beauty",
                "mobile_phone",
                "car",
                "bicycle",
              ].includes(element.tags.shop)
            ) {
              return null;
            }

            // Only include if it's clearly a food retail establishment
            const isGroceryStore =
              element.tags.shop &&
              ["supermarket", "grocery", "wholesale", "convenience"].includes(
                element.tags.shop
              );
            const isKnownBrand =
              element.tags.brand &&
              /target|walmart|costco|sam's club|bj's|meijer|kroger|safeway|publix|h-e-b|wegmans|giant|stop & shop/i.test(
                element.tags.brand
              );
            const isDepartmentStoreWithFood =
              element.tags.shop === "department_store" &&
              element.tags.name &&
              /target|walmart|meijer|kmart/i.test(element.tags.name);

            if (
              !isGroceryStore &&
              !isKnownBrand &&
              !isDepartmentStoreWithFood
            ) {
              return null;
            }
          }

          let name = "Store";
          let storeType = "grocery";

          if (element.tags) {
            name =
              element.tags.name ||
              element.tags.brand ||
              (element.tags.shop === "supermarket"
                ? "Supermarket"
                : element.tags.shop === "wholesale"
                ? "Wholesale Store"
                : element.tags.shop === "convenience"
                ? "Convenience Store"
                : element.tags.shop === "department_store"
                ? "Supercenter"
                : "Grocery Store");

            // Determine store type based on tags
            if (element.tags.shop === "convenience") {
              storeType = "convenience";
            } else if (
              element.tags.shop === "department_store" ||
              (element.tags.name &&
                /target|walmart|costco|sam's club|bj's|meijer/i.test(
                  element.tags.name
                )) ||
              (element.tags.brand &&
                /target|walmart|costco|sam's club|bj's|meijer/i.test(
                  element.tags.brand
                ))
            ) {
              storeType = "supercenter";
            } else {
              storeType = element.tags.shop || "grocery";
            }
          }

          return {
            id: element.id.toString(),
            lat: lat,
            lon: lon,
            name: name,
            type: storeType,
            amenity: element.tags?.amenity,
            shop: element.tags?.shop,
            brand: element.tags?.brand,
            category: storeType,
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
        fetchNearbyPlaces(location[0], location[1], searchRadius);
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

  const getMarkerColor = (place: NearbyPlace): string => {
    // Different colors for different store types
    switch (place.type) {
      case "supermarket":
        return "#27AE60"; // Green for supermarkets
      case "wholesale":
        return "#3498DB"; // Blue for wholesale stores
      case "convenience":
        return "#F39C12"; // Yellow for convenience stores
      case "supercenter":
      case "department_store":
        return "#9B59B6"; // Purple for supercenters
      case "grocery":
      default:
        return "#E67E22"; // Orange for grocery stores
    }
  };

  const getStoreIcon = (storeType: string): string => {
    switch (storeType) {
      case "supermarket":
        return "🏪";
      case "wholesale":
        return "🏬";
      case "convenience":
        return "🏪";
      case "supercenter":
      case "department_store":
        return "🏢";
      case "grocery":
      default:
        return "🛒";
    }
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
            marginBottom: "15px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "16px" }}>
            Supermarkets, Grocery, Wholesale & Supercenters
          </h3>
          <button
            onClick={() =>
              Loc && fetchNearbyPlaces(Loc[0], Loc[1], searchRadius)
            }
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

        {/* Range Filter */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "bold",
              marginBottom: "8px",
              color: "#333",
            }}
          >
            Search Radius: {formatRadius(searchRadius)}
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="range"
              min="500"
              max="5000"
              step="250"
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              style={{
                flex: 1,
                height: "6px",
                borderRadius: "3px",
                background: "#ddd",
                outline: "none",
                cursor: "pointer",
              }}
            />
            <button
              onClick={() =>
                Loc && fetchNearbyPlaces(Loc[0], Loc[1], searchRadius)
              }
              disabled={loading || !Loc}
              style={{
                padding: "6px 12px",
                backgroundColor: loading ? "#ccc" : "#3498DB",
                color: "white",
                border: "none",
                borderRadius: "15px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              Update
            </button>
          </div>
        </div>

        {/* Legend */}
        <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
          <span style={{ marginRight: "12px" }}>
            <span style={{ color: "#27AE60" }}>●</span> Supermarkets
          </span>
          <span style={{ marginRight: "12px" }}>
            <span style={{ color: "#E67E22" }}>●</span> Grocery
          </span>
          <span style={{ marginRight: "12px" }}>
            <span style={{ color: "#F39C12" }}>●</span> Convenience
          </span>
          <span style={{ marginRight: "12px" }}>
            <span style={{ color: "#3498DB" }}>●</span> Wholesale
          </span>
          <span>
            <span style={{ color: "#9B59B6" }}>●</span> Supercenters
          </span>
        </div>

        {loading && (
          <div
            style={{ margin: "10px 0 0 0", fontSize: "14px", color: "#666" }}
          >
            <p style={{ margin: 0 }}>🔍 Searching for stores...</p>
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
                <strong>
                  {getStoreIcon(place.type)} {place.name}
                </strong>
                <br />
                <span style={{ color: "#666" }}>
                  {place.type === "supermarket" && "🏪 Supermarket"}
                  {place.type === "grocery" && "🛒 Grocery Store"}
                  {place.type === "convenience" && "🏪 Convenience Store"}
                  {place.type === "wholesale" && "🏬 Wholesale Store"}
                  {(place.type === "supercenter" ||
                    place.type === "department_store") &&
                    "🏢 Supercenter"}
                  {place.brand && ` • ${place.brand}`}
                </span>
                <br />
                <small style={{ color: "#888" }}>
                  {place.lat.toFixed(4)}, {place.lon.toFixed(4)}
                </small>
                <br />
                <div style={{ marginTop: "8px" }}>
                  <button
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`,
                        "_blank"
                      )
                    }
                    style={{
                      padding: "6px 10px",
                      backgroundColor: "#4285f4",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "12px",
                      cursor: "pointer",
                      marginRight: "6px",
                      marginBottom: "4px",
                    }}
                  >
                    📍 Google Maps
                  </button>
                  <button
                    onClick={() =>
                      window.open(
                        `https://maps.apple.com/?ll=${place.lat},${place.lon}`,
                        "_blank"
                      )
                    }
                    style={{
                      padding: "6px 10px",
                      backgroundColor: "#007aff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "12px",
                      cursor: "pointer",
                      marginBottom: "4px",
                    }}
                  >
                    🍎 Apple Maps
                  </button>
                </div>
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
          Showing {nearbyPlaces.length} stores within{" "}
          {formatRadius(searchRadius)}
        </p>
        {nearbyPlaces.length > 0 && (
          <div style={{ marginTop: "5px", fontSize: "12px", color: "#888" }}>
            {nearbyPlaces.filter((p) => p.type === "supermarket").length}{" "}
            supermarkets •{" "}
            {nearbyPlaces.filter((p) => p.type === "grocery").length} grocery •{" "}
            {nearbyPlaces.filter((p) => p.type === "convenience").length}{" "}
            convenience •{" "}
            {nearbyPlaces.filter((p) => p.type === "wholesale").length}{" "}
            wholesale •{" "}
            {
              nearbyPlaces.filter((p) =>
                ["supercenter", "department_store"].includes(p.type)
              ).length
            }{" "}
            supercenters
          </div>
        )}
      </div>
    </div>
  );
};

export default UserLocationMap;
