import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://quick-bazar-backend.vercel.app"
    : "http://localhost:5000");

// Fix for default marker icons in Leaflet with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Custom icon for the user
const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom icon for shops
const shopIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapController({ center, radius }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      const latOffset = (radius / 111);
      const lngOffset = (radius / (111 * Math.cos(center[0] * (Math.PI / 180))));
      
      const bounds = [
        [center[0] - latOffset, center[1] - lngOffset],
        [center[0] + latOffset, center[1] + lngOffset]
      ];
      
      map.fitBounds(bounds);
    }
  }, [center, radius, map]);
  return null;
}

function ShopMap() {
  const [shops, setShops] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [radiusKm, setRadiusKm] = useState(50);

  const fetchMapData = async () => {
    const lat = localStorage.getItem("qb_lat");
    const lng = localStorage.getItem("qb_lng");
    const radius = localStorage.getItem("qb_radius_km") || 50;
    
    if (lat && lng) {
      setUserLocation([parseFloat(lat), parseFloat(lng)]);
      setRadiusKm(parseFloat(radius));
      
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/shops?lat=${lat}&lng=${lng}&radiusKm=${radius}`
        );
        setShops(response.data || []);
      } catch (error) {
        console.error("Error fetching map data:", error);
      }
    }
  };

  useEffect(() => {
    fetchMapData();
    window.addEventListener("locationChanged", fetchMapData);
    return () => window.removeEventListener("locationChanged", fetchMapData);
  }, []);

  if (!userLocation) {
    return <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>Please set your location to see the map.</div>;
  }

  return (
    <div style={{ height: "400px", width: "100%", borderRadius: "16px", overflow: "hidden", zIndex: 0 }}>
      <MapContainer 
        center={userLocation} 
        zoom={13} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={userLocation} radius={radiusKm} />
        
        {/* User Location Marker */}
        <Marker position={userLocation} icon={userIcon}>
          <Popup>
            <strong style={{ fontSize: '1.1rem' }}>You are here</strong><br />
            Search Radius: {radiusKm} km
          </Popup>
        </Marker>
        
        {/* Search Radius Circle */}
        <Circle 
          center={userLocation} 
          radius={radiusKm * 1000} 
          pathOptions={{ color: '#4f46e5', fillColor: '#4f46e5', fillOpacity: 0.1, weight: 2 }}
        />
        
        {/* Shop Markers */}
        {shops.map(shop => {
          const shopLat = shop.location?.coordinates[1];
          const shopLng = shop.location?.coordinates[0];
          
          if (!shopLat || !shopLng) return null;
          
          return (
            <Marker key={shop._id} position={[shopLat, shopLng]} icon={shopIcon}>
              <Popup>
                <strong style={{ fontSize: '1.1rem', color: '#4f46e5' }}>{shop.name}</strong><br />
                {shop.address}, {shop.city}<br />
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  {shop.distanceKm} km away
                </span>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default ShopMap;
