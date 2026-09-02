import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useCart } from "./context/CartContext";
import "./HomeRedesign.css";

// SVG Icon Components
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
);

const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
  </svg>
);

const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItemCount, clearCart } = useCart();
  const token = localStorage.getItem("token");
  const [userName, setUserName] = useState("");
  const [savedLocation, setSavedLocation] = useState("Mumbai, MH");
  const [radiusKm, setRadiusKm] = useState(localStorage.getItem("qb_radius_km") || "50");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll listener for navbar background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <>
      <nav className={`qb-nav-redesign ${scrolled ? 'qb-nav-scrolled' : ''}`}>
        <Link to="/" className="qb-nav-brand-redesign">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" style={{marginRight: '0.5rem', verticalAlign: 'middle'}}>
            <rect width="32" height="32" rx="8" fill="url(#brand-grad)"/>
            <path d="M8 12h16l-2 10H10L8 12z" fill="white" opacity="0.9"/>
            <circle cx="12" cy="25" r="2" fill="white"/>
            <circle cx="20" cy="25" r="2" fill="white"/>
            <path d="M8 12l-2-4h-2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <defs><linearGradient id="brand-grad" x1="0" y1="0" x2="32" y2="32"><stop stopColor="#6C63FF"/><stop offset="1" stopColor="#00D2FF"/></linearGradient></defs>
          </svg>
          QuickBazaar
        </Link>

        <div className="qb-nav-links-redesign qb-desktop-only">
          <Link to="/categories" className={location.pathname === '/categories' ? 'active' : ''}>Categories</Link>
          <Link to="/offers" className={location.pathname === '/offers' ? 'active' : ''}>Offers</Link>
          <Link to="/orders" className={location.pathname === '/orders' ? 'active' : ''}>My Orders</Link>
        </div>

        <div className="qb-nav-search-redesign qb-desktop-only">
          <span className="qb-nav-search-icon"><SearchIcon /></span>
          <input
            type="text"
            placeholder="Search products, shops..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                navigate(`/categories?q=${encodeURIComponent(e.target.value.trim())}`);
              }
            }}
          />
        </div>

        <div className="qb-nav-actions-redesign">
          <button
            className="qb-nav-location-btn qb-desktop-only"
            onClick={handleLocationChange}
            title="Change Location"
          >
            <span className="qb-location-dot"></span>
            <LocationIcon />
            <span className="qb-location-text">{savedLocation}</span>
          </button>

          <select
            value={radiusKm}
            onChange={handleRadiusChange}
            className="qb-radius-select qb-desktop-only"
            title="Search Radius"
          >
            <option value="5">5 km</option>
            <option value="10">10 km</option>
            <option value="20">20 km</option>
            <option value="50">50 km</option>
            <option value="100">100 km</option>
            <option value="500">500 km</option>
          </select>

          {token ? (
            <Link to="/profile" className="qb-nav-icon-btn" title="Profile">
              <UserIcon />
            </Link>
          ) : (
            <Link to="/login" className="qb-nav-icon-btn" title="Login">
              <UserIcon />
            </Link>
          )}

          <button className="qb-nav-icon-btn qb-desktop-only" title="Notifications">
            <BellIcon />
            <span className="qb-notification-dot"></span>
          </button>

          <Link to="/cart" className="qb-nav-cart-btn">
            <CartIcon />
            <span className="qb-desktop-only">Cart</span>
            {cartItemCount > 0 && (
              <span className="qb-cart-badge">{cartItemCount}</span>
            )}
          </Link>

          {token && (
            <button onClick={handleLogout} className="qb-nav-logout-btn qb-desktop-only">
              Logout
            </button>
          )}

          <button
            className="qb-nav-hamburger qb-mobile-only"
            onClick={() => setMobileMenuOpen(true)}
          >
            <MenuIcon />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="qb-mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="qb-mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="qb-mobile-drawer-header">
              <span className="gradient-text" style={{fontSize: '1.5rem', fontWeight: 800}}>QuickBazaar</span>
              <button onClick={() => setMobileMenuOpen(false)} className="qb-mobile-close">
                <CloseIcon />
              </button>
            </div>

            <div className="qb-mobile-search">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search products..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    navigate(`/categories?q=${encodeURIComponent(e.target.value.trim())}`);
                    setMobileMenuOpen(false);
                  }
                }}
              />
            </div>

            <div className="qb-mobile-location" onClick={handleLocationChange}>
              <LocationIcon />
              <span>{savedLocation}</span>
              <select
                value={radiusKm}
                onChange={(e) => { handleRadiusChange(e); }}
                onClick={(e) => e.stopPropagation()}
                className="qb-radius-select-mobile"
              >
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="20">20 km</option>
                <option value="50">50 km</option>
                <option value="100">100 km</option>
                <option value="500">500 km</option>
              </select>
            </div>

            <nav className="qb-mobile-nav-links">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link to="/categories" onClick={() => setMobileMenuOpen(false)}>Categories</Link>
              <Link to="/offers" onClick={() => setMobileMenuOpen(false)}>Offers</Link>
              <Link to="/orders" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
              <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>
                Cart {cartItemCount > 0 && `(${cartItemCount})`}
              </Link>
              {token ? (
                <>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="qb-mobile-logout">Logout</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login / Register</Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
