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

const UserLocationMap: React.FC = () => {
  const [Loc, setLoc] = useState<[number, number] | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLoc([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to access your location.");
      },
      {
        enableHighAccuracy: true, // Ask for GPS-level precision
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  return (
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
      {Loc && (
        <>
          <RecenterMap x_cord={Loc[0]} y_cord={Loc[1]} />
          <Marker position={Loc}>
            <Popup>You are here</Popup>
          </Marker>
        </>
      )}
    </MapContainer>
  );
};

export default UserLocationMap;
