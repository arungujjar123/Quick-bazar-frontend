import React, { useEffect, useState, useRef, useCallback } from "react";
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

// --- Curated Unsplash Images ---
const IMAGES = {
  hero: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
  heroFloat1: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=500&q=80",
  heroFloat2: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80",
  heroFloat3: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=500&q=80",
  avocados: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80",
  sourdough: "https://images.unsplash.com/photo-1585478259715-876a6a81fa08?auto=format&fit=crop&w=600&q=80",
  paneer: "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=600&q=80",
  fruit_basket: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80",
  baker: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80",
  farm: "https://images.unsplash.com/photo-1595856453615-5ce82d54ea2c?auto=format&fit=crop&w=600&q=80",
  dairy: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80",
  testimonial1: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  testimonial2: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  testimonial3: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
  cta: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1200&q=80",
};

// --- SVG Icons ---
const LocationPinIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const StorefrontIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" />
    <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
  </svg>
);

const TruckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
    <circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" />
  </svg>
);

const StarIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "#FFB347" : "none"} stroke="#FFB347" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const QuoteIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.15">
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 .42.24 1 1 1z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);

// --- Custom Hooks ---
function useScrollReveal() {
  return useRef(null);
}

function useCountUp(target, duration = 2000, loading = false) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (loading) return;
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentRef);
    return () => observer.disconnect();
  }, [started, loading]);

  useEffect(() => {
    if (!started) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [started, target, duration]);

  return [count, ref];
}

// --- Category data ---
const CATEGORIES = [
  { emoji: "🍎", label: "Fresh Produce", color: "#FF6B6B" },
  { emoji: "🍞", label: "Bakery", color: "#FFB347" },
  { emoji: "🥛", label: "Dairy", color: "#00D2FF" },
  { emoji: "📦", label: "Daily Essentials", color: "#6C63FF" },
  { emoji: "🌿", label: "Organic", color: "#00C9A7" },
  { emoji: "🍯", label: "Artisanal", color: "#ec4899" },
];

// --- Testimonials data ---
const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    location: "Mumbai, MH",
    avatar: IMAGES.testimonial1,
    text: "QuickBazaar has completely changed how I shop for groceries. The freshness of locally sourced produce is unmatched. I love knowing exactly which farm my vegetables come from!",
    rating: 5,
  },
  {
    name: "Rahul Mehta",
    location: "Delhi, DL",
    avatar: IMAGES.testimonial2,
    text: "As a home chef, finding quality artisan ingredients was always a challenge. QuickBazaar connected me with incredible local bakers and dairy farms. Game changer!",
    rating: 5,
  },
  {
    name: "Anita Desai",
    location: "Bangalore, KA",
    avatar: IMAGES.testimonial3,
    text: "The delivery is lightning fast and the prices are fair for both customers and vendors. It's marketplace done right — supporting local while getting the best quality.",
    rating: 5,
  },
];

// --- Main Component ---
function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationCity, setLocationCity] = useState("Mumbai, MH");
  const [pincode, setPincode] = useState("");
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Scroll reveal refs
  const heroRef = useScrollReveal();
  const statsRef = useScrollReveal();
  const productsRef = useScrollReveal();
  const howItWorksRef = useScrollReveal();
  const mapRef = useScrollReveal();
  const makersRef = useScrollReveal();
  const testimonialsRef = useScrollReveal();
  const ctaRef = useScrollReveal();
  const newsletterRef = useScrollReveal();

  // Animated counters
  const [shopCount, shopCountRef] = useCountUp(500, 2000, loading);
  const [customerCount, customerCountRef] = useCountUp(10000, 2500, loading);
  const [productCount, productCountRef] = useCountUp(25000, 2000, loading);
  const [cityCount, cityCountRef] = useCountUp(50, 1500, loading);

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
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pincode)}`
      );
      if (res.data && res.data.length > 0) {
        const { lat, lon, display_name } = res.data[0];
        const shortName = display_name.split(",")[0];
        localStorage.setItem("qb_location_city", shortName);
        localStorage.setItem("qb_lat", lat);
        localStorage.setItem("qb_lng", lon);
        setLocationCity(shortName);
        window.dispatchEvent(new Event("locationChanged"));
      } else {
        alert("Location not found. Please try a different pincode or city.");
      }
    } catch (err) {
      console.error("Geocoding failed", err);
      alert("Error finding location.");
    }
  };

  const fetchData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchData();
    window.addEventListener("locationChanged", fetchData);
    return () => window.removeEventListener("locationChanged", fetchData);
  }, [fetchData]);

  // Set up scroll reveal class on body
  useEffect(() => {
    document.body.classList.add("qb-reveal-ready");
    return () => {
      document.body.classList.remove("qb-reveal-ready");
    };
  }, []);

  // Set up IntersectionObserver for all reveal elements when page finishes loading
  useEffect(() => {
    if (loading) return;

    // Use a small delay to make sure React has committed the DOM
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("revealed");
            }
          });
        },
        { threshold: 0.05, rootMargin: "0px 0px -30px 0px" }
      );

      const revealElements = document.querySelectorAll(
        ".reveal, .reveal-left, .reveal-right, .reveal-scale"
      );
      revealElements.forEach((el) => observer.observe(el));

      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, [loading, products]);

  if (loading) {
    return (
      <div className="qb-loading-screen">
        <div className="qb-loading-spinner"></div>
        <p>Discovering local shops near you...</p>
      </div>
    );
  }

  return (
    <div className="qb-home-container">
      {/* ===== HERO SECTION ===== */}
      <section className="qb-hero" ref={heroRef}>
        <div className="qb-hero-bg-shapes">
          <div className="qb-hero-shape qb-hero-shape-1"></div>
          <div className="qb-hero-shape qb-hero-shape-2"></div>
          <div className="qb-hero-shape qb-hero-shape-3"></div>
        </div>

        <div className="qb-hero-content">
          <div className="qb-hero-left reveal">
            <div className="qb-hero-badge">
              <SparkleIcon />
              <span>India's Hyper-Local Marketplace</span>
            </div>
            <h1>
              Your Neighborhood,
              <br />
              <span className="gradient-text">Delivered Fresh</span>
            </h1>
            <p className="qb-hero-subtitle">
              Discover fresh produce, artisan goods, and daily essentials from
              trusted local shops — delivered to your doorstep in minutes.
            </p>

            <div className="qb-hero-search">
              <div className="qb-hero-search-icon">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Enter your pin code or city..."
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFindLocal()}
              />
              <button type="button" onClick={handleFindLocal}>
                Find Local
                <ArrowRightIcon />
              </button>
            </div>

            <div className="qb-hero-trust">
              <div className="qb-hero-trust-item">
                <CheckCircleIcon />
                <span>Free Delivery</span>
              </div>
              <div className="qb-hero-trust-item">
                <CheckCircleIcon />
                <span>Farm Fresh</span>
              </div>
              <div className="qb-hero-trust-item">
                <CheckCircleIcon />
                <span>Secure Payments</span>
              </div>
            </div>
          </div>

          <div className="qb-hero-right reveal-right">
            <div className="qb-hero-image-grid">
              <div className="qb-hero-image-main">
                <img src={IMAGES.hero} alt="Fresh local produce" loading="eager" />
              </div>
              <div className="qb-hero-image-float qb-float-1">
                <img src={IMAGES.heroFloat1} alt="Fresh fruits" loading="eager" />
              </div>
              <div className="qb-hero-image-float qb-float-2">
                <img src={IMAGES.heroFloat2} alt="Artisan bread" loading="eager" />
              </div>
              <div className="qb-hero-image-float qb-float-3">
                <img src={IMAGES.heroFloat3} alt="Organic produce" loading="eager" />
              </div>
              {/* Floating stats card */}
              <div className="qb-hero-float-card">
                <span className="qb-hero-float-card-emoji">🚀</span>
                <div>
                  <strong>30 min</strong>
                  <span>Avg. Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="qb-hero-categories reveal">
          {CATEGORIES.map((cat, i) => (
            <Link
              to="/categories"
              key={cat.label}
              className={`qb-category-pill stagger-${i + 1}`}
              style={{ "--pill-color": cat.color }}
            >
              <span className="qb-category-pill-emoji">{cat.emoji}</span>
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ===== SOCIAL PROOF BAR ===== */}
      <section className="qb-stats-bar" ref={statsRef}>
        <div className="qb-stats-inner">
          <div className="qb-stat reveal stagger-1" ref={shopCountRef}>
            <strong>{shopCount}+</strong>
            <span>Local Shops</span>
          </div>
          <div className="qb-stat-divider"></div>
          <div className="qb-stat reveal stagger-2" ref={customerCountRef}>
            <strong>{customerCount.toLocaleString()}+</strong>
            <span>Happy Customers</span>
          </div>
          <div className="qb-stat-divider"></div>
          <div className="qb-stat reveal stagger-3" ref={productCountRef}>
            <strong>{productCount.toLocaleString()}+</strong>
            <span>Products</span>
          </div>
          <div className="qb-stat-divider"></div>
          <div className="qb-stat reveal stagger-4" ref={cityCountRef}>
            <strong>{cityCount}+</strong>
            <span>Cities</span>
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="qb-section" ref={productsRef}>
        <div className="qb-section-header reveal">
          <div>
            <span className="qb-section-eyebrow">Curated for You</span>
            <h2>Featured Products</h2>
          </div>
          <Link to="/categories" className="qb-view-all-btn">
            View all
            <ArrowRightIcon />
          </Link>
        </div>
        <div className="qb-product-grid">
          {products.length > 0 ? (
            products.slice(0, 8).map((product, index) => (
              <article
                key={product._id}
                className={`qb-product-card reveal stagger-${(index % 4) + 1}`}
                onClick={() => navigate(`/product/${product._id}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="qb-product-card-image-wrap">
                  <img
                    src={product.imageUrl || product.image || IMAGES.avocados}
                    alt={product.name}
                    className="qb-product-card-img"
                    loading="lazy"
                  />
                  {index < 2 && (
                    <span className="qb-product-badge qb-badge-new">New</span>
                  )}
                  <button
                    className="qb-quick-add-btn"
                    onClick={(e) => handleAddToCart(e, product._id, product.name)}
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" /><path d="M12 5v14" />
                    </svg>
                  </button>
                </div>
                <div className="qb-product-card-info">
                  <span className="qb-product-category">
                    {product.category || "Local Product"}
                  </span>
                  <h3>{product.name}</h3>
                  <div className="qb-product-card-footer">
                    <strong>₹{Number(product.price).toFixed(2)}</strong>
                    <div className="qb-product-rating">
                      <StarIcon filled /> <span>4.8</span>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="qb-empty-state">
              <LocationPinIcon />
              <h3>No products found nearby</h3>
              <p>Try searching for a different location to discover local shops.</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="qb-how-it-works" ref={howItWorksRef}>
        <div className="qb-section-header reveal" style={{ justifyContent: "center", textAlign: "center" }}>
          <div>
            <span className="qb-section-eyebrow">Simple & Fast</span>
            <h2>How QuickBazaar Works</h2>
          </div>
        </div>
        <div className="qb-hiw-grid">
          <div className="qb-hiw-step reveal stagger-1">
            <div className="qb-hiw-icon" style={{ background: "linear-gradient(135deg, #6C63FF20, #6C63FF10)" }}>
              <LocationPinIcon />
            </div>
            <div className="qb-hiw-number">01</div>
            <h3>Enter Your Location</h3>
            <p>Share your pincode or allow GPS detection to find shops in your neighborhood.</p>
          </div>
          <div className="qb-hiw-connector">
            <svg width="80" height="2" viewBox="0 0 80 2"><line x1="0" y1="1" x2="80" y2="1" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="6 4" /></svg>
          </div>
          <div className="qb-hiw-step reveal stagger-2">
            <div className="qb-hiw-icon" style={{ background: "linear-gradient(135deg, #00D2FF20, #00D2FF10)" }}>
              <StorefrontIcon />
            </div>
            <div className="qb-hiw-number">02</div>
            <h3>Browse Local Shops</h3>
            <p>Explore products from verified neighborhood stores, farms, and artisan creators.</p>
          </div>
          <div className="qb-hiw-connector">
            <svg width="80" height="2" viewBox="0 0 80 2"><line x1="0" y1="1" x2="80" y2="1" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="6 4" /></svg>
          </div>
          <div className="qb-hiw-step reveal stagger-3">
            <div className="qb-hiw-icon" style={{ background: "linear-gradient(135deg, #00C9A720, #00C9A710)" }}>
              <TruckIcon />
            </div>
            <div className="qb-hiw-number">03</div>
            <h3>Get It Delivered</h3>
            <p>Place your order and receive farm-fresh goods at your doorstep in under 30 minutes.</p>
          </div>
        </div>
      </section>

      {/* ===== MAP SECTION ===== */}
      <section className="qb-section qb-map-section" ref={mapRef}>
        <div className="qb-section-header reveal">
          <div>
            <span className="qb-section-eyebrow">Explore Nearby</span>
            <h2>Shops in Your Area</h2>
          </div>
          <p className="qb-map-subtitle">
            Showing stores within {localStorage.getItem("qb_radius_km") || 50}km of {locationCity}
          </p>
        </div>
        <div className="qb-map-wrapper reveal-scale">
          <ShopMap />
        </div>
      </section>

      {/* ===== MEET YOUR MAKERS ===== */}
      <section className="qb-makers" ref={makersRef}>
        <div className="qb-makers-inner">
          <div className="qb-section-header reveal" style={{ marginBottom: "1rem" }}>
            <div>
              <span className="qb-section-eyebrow">The People Behind Your Food</span>
              <h2>Meet Your Makers</h2>
              <p className="qb-makers-subtitle">
                Discover the local artisans, farmers, and small businesses powering your neighborhood.
              </p>
            </div>
          </div>
          <div className="qb-makers-grid">
            <article className="qb-maker-card reveal stagger-1">
              <div className="qb-maker-card-image">
                <img src={IMAGES.baker} alt="The Crusty Loaf bakery" loading="lazy" />
                <div className="qb-maker-card-overlay">
                  <span className="qb-maker-badge">⭐ Top Rated</span>
                </div>
              </div>
              <div className="qb-maker-card-body">
                <img src={IMAGES.baker} alt="Baker" className="qb-maker-avatar" />
                <h3>The Crusty Loaf</h3>
                <span className="qb-maker-type">Artisanal Bakery</span>
                <p>
                  Baking fresh, naturally leavened breads every morning using locally sourced flour and organic ingredients.
                </p>
                <div className="qb-maker-tags">
                  <span>Organic</span>
                  <span>Fresh Daily</span>
                  <span>Artisanal</span>
                </div>
              </div>
            </article>

            <article className="qb-maker-card reveal stagger-2">
              <div className="qb-maker-card-image">
                <img src={IMAGES.farm} alt="Green Valley Urban Farm" loading="lazy" />
                <div className="qb-maker-card-overlay">
                  <span className="qb-maker-badge" style={{ background: "linear-gradient(135deg, #00C9A7, #00D2FF)" }}>🌿 Eco-Friendly</span>
                </div>
              </div>
              <div className="qb-maker-card-body">
                <h3>Green Valley Urban Farm</h3>
                <span className="qb-maker-type" style={{ color: "#00C9A7" }}>Hydroponic Greens & Produce</span>
                <p>
                  Pioneering sustainable urban agriculture. We deliver pesticide-free, nutrient-dense greens harvested within hours.
                </p>
                <div className="qb-maker-tags">
                  <span>Organic</span>
                  <span>Hyper-local</span>
                  <span>Sustainable</span>
                </div>
              </div>
            </article>

            <article className="qb-maker-card reveal stagger-3">
              <div className="qb-maker-card-image">
                <img src={IMAGES.dairy} alt="Pure Bliss Dairy" loading="lazy" />
                <div className="qb-maker-card-overlay">
                  <span className="qb-maker-badge" style={{ background: "linear-gradient(135deg, #00D2FF, #6C63FF)" }}>🥛 Farm Direct</span>
                </div>
              </div>
              <div className="qb-maker-card-body">
                <h3>Pure Bliss Dairy</h3>
                <span className="qb-maker-type" style={{ color: "#00D2FF" }}>Farm-Fresh Dairy Products</span>
                <p>
                  From our family farm to your table — pure, unprocessed milk, paneer, ghee, and yogurt made the traditional way.
                </p>
                <div className="qb-maker-tags">
                  <span>Farm Direct</span>
                  <span>Chemical-Free</span>
                  <span>Traditional</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="qb-testimonials" ref={testimonialsRef}>
        <div className="qb-section-header reveal" style={{ justifyContent: "center", textAlign: "center" }}>
          <div>
            <span className="qb-section-eyebrow">What People Say</span>
            <h2>Loved by Thousands</h2>
          </div>
        </div>
        <div className="qb-testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className={`qb-testimonial-card reveal stagger-${i + 1}`}>
              <div className="qb-testimonial-quote"><QuoteIcon /></div>
              <div className="qb-testimonial-stars">
                {Array.from({ length: t.rating }, (_, j) => (
                  <StarIcon key={j} filled />
                ))}
              </div>
              <p>{t.text}</p>
              <div className="qb-testimonial-author">
                <img src={t.avatar} alt={t.name} loading="lazy" />
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="qb-cta-banner" ref={ctaRef}>
        <div className="qb-cta-inner reveal-scale">
          <div className="qb-cta-content">
            <h2>Ready to Shop Local?</h2>
            <p>
              Join thousands of happy customers discovering fresh, local products every day.
            </p>
            <div className="qb-cta-buttons">
              <Link to="/categories" className="qb-cta-btn-primary">
                Start Shopping
                <ArrowRightIcon />
              </Link>
              <Link to="/register" className="qb-cta-btn-secondary">
                Create Account
              </Link>
            </div>
          </div>
          {/* Decorative SVG shapes */}
          <div className="qb-cta-shapes">
            <svg className="qb-cta-shape-1" width="120" height="120" viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="60" fill="rgba(255,255,255,0.1)" />
            </svg>
            <svg className="qb-cta-shape-2" width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="40" fill="rgba(255,255,255,0.08)" />
            </svg>
            <svg className="qb-cta-shape-3" width="200" height="200" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="100" fill="rgba(255,255,255,0.05)" />
            </svg>
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="qb-newsletter" ref={newsletterRef}>
        <div className="qb-newsletter-card reveal-scale">
          <div className="qb-newsletter-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#mail-grad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              <defs>
                <linearGradient id="mail-grad" x1="2" y1="4" x2="22" y2="20">
                  <stop stopColor="#6C63FF" /><stop offset="1" stopColor="#00D2FF" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h3>Stay in the Loop</h3>
          <p>Subscribe to get weekly updates on new local shops, seasonal products, and exclusive offers.</p>
          <form className="qb-newsletter-form" onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing!"); }}>
            <input type="email" placeholder="Enter your email address" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Home;
