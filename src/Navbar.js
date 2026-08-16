import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useCart } from "./context/CartContext";
import "./HomeRedesign.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItemCount, clearCart } = useCart();
  const token = localStorage.getItem("token");
  const [userName, setUserName] = useState("");
  const [savedLocation, setSavedLocation] = useState("Mumbai, MH");
  const [radiusKm, setRadiusKm] = useState(localStorage.getItem("qb_radius_km") || "50");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserName(parsed.name || "");
      } catch {
        setUserName("");
      }
    } else {
      setUserName("");
    }

    const detectLocation = async () => {
      const city = localStorage.getItem("qb_location_city");
      const lat = localStorage.getItem("qb_lat");
      const lng = localStorage.getItem("qb_lng");

      if (city && lat && lng && city !== "San Jose, CA") {
        setSavedLocation(city);
      } else {
        try {
          let res;
          try {
            res = await axios.get("https://ipapi.co/json/");
            if (res.data && res.data.city && res.data.latitude) {
              const loc = `${res.data.city}, ${res.data.region_code || res.data.country_code}`;
              setSavedLocation(loc);
              localStorage.setItem("qb_location_city", loc);
              localStorage.setItem("qb_lat", res.data.latitude);
              localStorage.setItem("qb_lng", res.data.longitude);
              window.dispatchEvent(new Event('locationChanged'));
              return;
            }
          } catch (e) {
            console.log("ipapi failed, trying fallback...");
          }
          
          // Fallback to freeipapi
          res = await axios.get("https://freeipapi.com/api/json");
          if (res.data && res.data.cityName) {
             const loc = `${res.data.cityName}, ${res.data.countryCode}`;
             setSavedLocation(loc);
             localStorage.setItem("qb_location_city", loc);
             localStorage.setItem("qb_lat", res.data.latitude);
             localStorage.setItem("qb_lng", res.data.longitude);
             window.dispatchEvent(new Event('locationChanged'));
             return;
          }
          throw new Error("Both location APIs failed");
        } catch (err) {
          console.error("Location detection failed:", err);
          // Fallback to Mumbai if detection fails
          setSavedLocation("Mumbai, MH");
          localStorage.setItem("qb_location_city", "Mumbai, MH");
          localStorage.setItem("qb_lat", 19.0760);
          localStorage.setItem("qb_lng", 72.8777);
          window.dispatchEvent(new Event('locationChanged'));
        }
      }
    };

    detectLocation();
  }, [token]);

  const handleLocationChange = async () => {
    const newCity = window.prompt("Enter your city or pincode (e.g., Mumbai, MH):", savedLocation);
    if (newCity && newCity !== savedLocation) {
      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(newCity)}`);
        if (res.data && res.data.length > 0) {
          const { lat, lon, display_name } = res.data[0];
          const shortName = display_name.split(',')[0];
          setSavedLocation(shortName);
          localStorage.setItem("qb_location_city", shortName);
          localStorage.setItem("qb_lat", lat);
          localStorage.setItem("qb_lng", lon);
          window.dispatchEvent(new Event('locationChanged'));
        } else {
          alert("Location not found. Please try a different pincode or city.");
        }
      } catch (err) {
        console.error("Geocoding failed", err);
        alert("Error finding location.");
      }
    }
  };

  const handleRadiusChange = (e) => {
    const newRadius = e.target.value;
    setRadiusKm(newRadius);
    localStorage.setItem("qb_radius_km", newRadius);
    window.dispatchEvent(new Event('locationChanged'));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    clearCart();
    navigate("/login");
  };

  return (
    <nav className="qb-nav-redesign">
      <Link to="/" className="qb-nav-brand-redesign">
        QuickBazaar
      </Link>

      <div className="qb-nav-links-redesign">
        <Link to="/categories">Categories</Link>
        <Link to="/offers">Offers</Link>
        <Link to="/orders">My Orders</Link>
      </div>

      <div className="qb-nav-search-redesign">
        <i>🔍</i>
        <input 
          type="text" 
          placeholder="Search products..." 
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
              navigate(`/categories?q=${encodeURIComponent(e.target.value.trim())}`);
            }
          }}
        />
      </div>

      <div className="qb-nav-actions-redesign" style={{ alignItems: 'center' }}>
        <select 
          value={radiusKm}
          onChange={handleRadiusChange}
          style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem', background: '#f8fafc', color: '#334155', cursor: 'pointer', marginRight: '0.5rem' }}
          title="Search Radius"
        >
          <option value="5">Within 5 km</option>
          <option value="10">Within 10 km</option>
          <option value="20">Within 20 km</option>
          <option value="50">Within 50 km</option>
          <option value="100">Within 100 km</option>
          <option value="500">Within 500 km</option>
        </select>
        <button 
          className="qb-nav-icon-btn" 
          title="Change Location"
          onClick={handleLocationChange}
        >
          <span>📍</span>
          <small style={{ fontSize: '0.75rem', fontWeight: 600 }}>{savedLocation}</small>
        </button>

        {token ? (
          <Link to="/profile" className="qb-nav-icon-btn" title="Profile">
            <span>👤</span>
          </Link>
        ) : (
          <Link to="/login" className="qb-nav-icon-btn" title="Login">
            <span>👤</span>
          </Link>
        )}

        <button className="qb-nav-icon-btn" title="Notifications">
          <span>🔔</span>
        </button>

        <Link to="/cart" className="qb-nav-cart-btn">
          <span>🛒</span>
          Cart
          {cartItemCount > 0 && (
            <span style={{ 
              background: 'white', 
              color: 'var(--qb-blue)', 
              borderRadius: '50%', 
              width: '20px', 
              height: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '0.7rem'
            }}>
              {cartItemCount}
            </span>
          )}
        </Link>
        
        {token && (
          <button onClick={handleLogout} style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--qb-text-muted)', 
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
