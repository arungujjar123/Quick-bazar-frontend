import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ShopMap from "../components/ShopMap";
import "../HomeRedesign.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://quick-bazar-backend.vercel.app"
    : "http://localhost:5000");

// Mock images based on generated assets
const MOCK_IMAGES = {
  hero_bg: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80",
  avocados: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80",
  sourdough: "https://images.unsplash.com/photo-1585478259715-876a6a81fa08?auto=format&fit=crop&w=600&q=80",
  paneer: "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=600&q=80",
  fruit_basket: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80",
  baker: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80",
  farm: "https://images.unsplash.com/photo-1595856453615-5ce82d54ea2c?auto=format&fit=crop&w=600&q=80",
};

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationCity, setLocationCity] = useState("Mumbai, MH");
  const [pincode, setPincode] = useState("");
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = async (e, productId, productName) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await addToCart(productId, 1);
    if (result.success) {
      alert(`${productName} added to cart!`);
    } else {
      alert(result.message || "Failed to add to cart");
    }
  };

  const handleFindLocal = async () => {
    if (!pincode.trim()) {
      alert("Please enter a pin code or address");
      return;
    }
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pincode)}`);
      if (res.data && res.data.length > 0) {
        const { lat, lon, display_name } = res.data[0];
        const shortName = display_name.split(',')[0];
        localStorage.setItem("qb_location_city", shortName);
        localStorage.setItem("qb_lat", lat);
        localStorage.setItem("qb_lng", lon);
        setLocationCity(shortName);
        window.dispatchEvent(new Event('locationChanged'));
      } else {
        alert("Location not found. Please try a different pincode or city.");
      }
    } catch (err) {
      console.error("Geocoding failed", err);
      alert("Error finding location.");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const city = localStorage.getItem("qb_location_city") || "Mumbai, MH";
      const lat = localStorage.getItem("qb_lat");
      const lng = localStorage.getItem("qb_lng");
      setLocationCity(city);
      const radius = localStorage.getItem("qb_radius_km") || 50;
      
      let url = `${API_BASE_URL}/api/products`;
      if (lat && lng) {
        url = `${API_BASE_URL}/api/products/nearby?lat=${lat}&lng=${lng}&radiusKm=${radius}`;
      }
      
      const response = await axios.get(url);
      setProducts(response.data || []);
    } catch (error) {
      console.error("Home data load error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('locationChanged', fetchData);
    return () => window.removeEventListener('locationChanged', fetchData);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontStyle: "italic",
          color: "#666",
        }}
      >
        Loading your local marketplace...
      </div>
    );
  }

  return (
    <div className="qb-home-container">
      {/* Hero Section */}
      <section
        className="qb-home-hero"
        style={{ backgroundImage: `url(${MOCK_IMAGES.hero_bg})` }}
      >
        <div className="qb-home-hero-content">
          <h1>
            Your Neighborhood, <br /> <span>Delivered</span>
          </h1>
          <div className="qb-home-hero-search">
            <span style={{ marginLeft: "1rem" }}>📍</span>
            <input
              type="text"
              placeholder="Enter your pin code or address..."
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFindLocal()}
            />
            <button type="button" onClick={handleFindLocal}>
              Find Local
            </button>
          </div>
          <div className="qb-home-hero-categories">
            <div className="qb-category-pill">
              <span>🍎</span> Fresh Produce
            </div>
            <div className="qb-category-pill">
              <span>🍞</span> Bakery
            </div>
            <div className="qb-category-pill">
              <span>📦</span> Daily Essentials
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="qb-section-redesign">
        <div className="qb-section-header-redesign">
          <h2>Featured Products</h2>
          <Link to="/categories" className="qb-view-all">
            View all →
          </Link>
        </div>
        <div className="qb-product-grid-redesign">
          {products.length > 0 ? (
            products.slice(0, 4).map((product) => (
              <article
                key={product._id}
                className="qb-product-card-redesign"
                onClick={() => navigate(`/product/${product._id}`)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={
                    product.imageUrl || product.image || MOCK_IMAGES.avocados
                  }
                  alt={product.name}
                  className="qb-product-card-img"
                />
                <h3>{product.name}</h3>
                <p>{product.category || "Local Product"}</p>
                <div className="qb-product-card-price-row">
                  <strong>₹{Number(product.price).toFixed(2)}</strong>
                  <button
                    className="qb-add-btn"
                    onClick={(e) =>
                      handleAddToCart(e, product._id, product.name)
                    }
                  >
                    +
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div style={{ padding: "2rem", color: "#666" }}>
              No products available.
            </div>
          )}
        </div>
      </section>

      {/* Map Section */}
      <section className="qb-section-redesign" style={{ padding: "1rem 2rem 3rem" }}>
        <div className="qb-section-header-redesign">
          <h2>Shops in Your Area</h2>
          <p style={{ color: "#64748b", margin: 0 }}>Showing stores within {localStorage.getItem("qb_radius_km") || 50}km</p>
        </div>
        <ShopMap />
      </section>

      {/* Meet Your Makers */}
      <section className="qb-makers-section">
        <div className="qb-makers-header-redesign">
          <h2>Meet Your Makers</h2>
          <p>
            Discover the local artisans, farmers, and small businesses powering
            your neighborhood.
          </p>
        </div>
        <div className="qb-makers-grid-redesign">
          <article className="qb-maker-card-redesign">
            <img
              src={MOCK_IMAGES.baker}
              alt="Baker"
              className="qb-maker-card-img"
            />
            <div className="qb-maker-card-content">
              <img
                src={MOCK_IMAGES.baker}
                alt="Baker Avatar"
                className="qb-maker-avatar"
              />
              <h3>The Crusty Loaf</h3>
              <span>Artisanal Bakery</span>
              <p>
                Baking fresh, naturally leavened breads every morning using
                locally sourced...
              </p>
            </div>
          </article>

          <article className="qb-maker-card-redesign">
            <img
              src={MOCK_IMAGES.farm}
              alt="Farm"
              className="qb-maker-card-img"
            />
            <div className="qb-maker-card-content">
              <h3>Green Valley Urban Farm</h3>
              <span style={{ color: "#6366f1" }}>
                Hydroponic Greens & Produce
              </span>
              <p>
                Pioneering sustainable urban agriculture. We deliver
                pesticide-free, nutrient-dense greens harvested within hours of
                delivery.
              </p>
              <div className="qb-maker-tags">
                <span className="qb-maker-tag">Organic</span>
                <span className="qb-maker-tag">Hyper-local</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Footer rendered in App.js */}
    </div>
  );
}

export default Home;
