import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminShared.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://quick-bazar-backend.vercel.app"
    : "http://localhost:5000");

function AdminShops() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingShop, setEditingShop] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    city: "",
    deliveryRadiusKm: 5,
  });
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const adminInfoStr = localStorage.getItem("adminInfo");
    if (adminInfoStr) {
      try {
        const info = JSON.parse(adminInfoStr);
        setIsSuperAdmin(info.role === "super_admin");
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return navigate("/admin/login");

    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/shops/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShops(res.data);
    } catch (err) {
      console.error("Failed to fetch shops:", err);
      alert("Failed to load your shops.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingShop(null);
    setFormData({
      name: "",
      description: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
      city: "",
      deliveryRadiusKm: 5,
    });
  };

  const handleEdit = (shop) => {
    setIsCreating(false);
    setEditingShop(shop);
    setFormData({
      name: shop.name || "",
      description: shop.description || "",
      contactEmail: shop.contactEmail || "",
      contactPhone: shop.contactPhone || "",
      address: shop.address || "",
      city: shop.city || "",
      deliveryRadiusKm: shop.deliveryRadiusKm || 5,
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingShop(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shop? This cannot be undone.")) return;
    
    const token = localStorage.getItem("adminToken");
    try {
      await axios.delete(`${API_BASE_URL}/api/shops/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Shop deleted successfully!");
      fetchShops();
    } catch (err) {
      console.error("Failed to delete shop:", err);
      alert("Failed to delete shop.");
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim()) {
      return alert("Name and Address are required!");
    }

    const token = localStorage.getItem("adminToken");
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        deliveryRadiusKm: formData.deliveryRadiusKm,
        lat: 0, // Hardcoded for simplicity if map is not integrated
        lng: 0,
      };

      if (isCreating) {
        await axios.post(`${API_BASE_URL}/api/shops`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Shop created successfully!");
      } else if (editingShop) {
        await axios.put(`${API_BASE_URL}/api/shops/${editingShop._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Shop updated successfully!");
      }
      
      setIsCreating(false);
      setEditingShop(null);
      fetchShops();
    } catch (err) {
      console.error("Failed to save shop:", err);
      alert("Failed to save shop: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading)
    return (
      <div className="qb-admin-shell">
        <div className="loading" style={{ margin: "auto" }}>
          Loading Shops...
        </div>
      </div>
    );

  return (
    <div className="qb-admin-shell fade-in">
      <aside className="qb-admin-sidebar">
        <div className="qb-admin-brand-block">
          <div className="logo-icon">QB</div>
          <div>
            <h2>QuickBazaar</h2>
            <p>Admin Portal</p>
          </div>
        </div>
        <nav className="qb-admin-menu">
          <button onClick={() => navigate("/admin/dashboard")}>
            <span>📊</span> Dashboard
          </button>
          
          {isSuperAdmin ? (
            <button onClick={() => navigate("/admin/shop-owners")}>
              <span>🏪</span> Platform Owners
            </button>
          ) : (
            <>
              <button onClick={() => navigate("/admin/products")}>
                <span>📦</span> Inventory
              </button>
              <button onClick={() => navigate("/admin/orders")}>
                <span>🧾</span> Orders
              </button>
              <button
                className="active"
                onClick={() => navigate("/admin/shops")}
              >
                <span>🏪</span> Shops
              </button>
            </>
          )}
          
          <button onClick={() => navigate("/admin/support")}>
            <span>🤖</span> AI Agent
          </button>
          {!isSuperAdmin && (
            <button onClick={() => navigate("/admin/customers")}>
              <span>👥</span> Customers
            </button>
          )}
          <button onClick={() => navigate("/admin/categories")}>
            <span>📁</span> Categories
          </button>
          <button onClick={() => navigate("/admin/settings")}>
            <span>⚙️</span> Settings
          </button>
        </nav>
        <div className="qb-admin-sidebar-bottom">
          <button onClick={handleLogout}>🚪 Logout</button>
        </div>
      </aside>

      <main className="qb-admin-main">
        <header className="qb-admin-topbar">
          <div>
            <h1>Shop Management</h1>
            <p>Manage your marketplace locations and operational details.</p>
          </div>
        </header>

        {!isCreating && !editingShop ? (
          <section className="qb-admin-card" style={{ maxWidth: "900px" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3>Your Shops</h3>
              <button className="qb-admin-btn-add" onClick={handleCreateNew}>
                ➕ Create New Shop
              </button>
            </div>

            {shops.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                You haven't created any shops yet. Create one to start adding products!
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {shops.map((shop) => (
                  <div key={shop._id} style={{
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid var(--admin-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>{shop.name}</h4>
                      <p style={{ margin: '0', color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>
                        {shop.address}, {shop.city}
                      </p>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>
                        Delivery Radius: {shop.deliveryRadiusKm} km | Status: {shop.isActive ? '🟢 Active' : '🔴 Inactive'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleEdit(shop)}
                        style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(shop._id)}
                        style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="qb-admin-card" style={{ maxWidth: "800px" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3>{isCreating ? "Create New Shop" : "Edit Shop"}</h3>
              <button 
                onClick={handleCancel}
                style={{ background: 'none', border: 'none', color: 'var(--admin-text-muted)', cursor: 'pointer' }}
              >
                ✕ Cancel
              </button>
            </div>
            
            <form
              onSubmit={handleSave}
              className="qb-admin-toolbar-search"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2rem",
              }}
            >
              <div className="qb-input-group" style={{ gridColumn: "span 2" }}>
                <label
                  style={{
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                    display: "block",
                  }}
                >
                  Shop Name *
                </label>
                <input
                  style={{
                    width: "100%",
                    padding: "0.85rem",
                    borderRadius: "12px",
                    border: "1px solid var(--admin-border)",
                  }}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. QuickBazaar Store"
                  required
                />
              </div>

              <div className="qb-input-group" style={{ gridColumn: "span 2" }}>
                <label
                  style={{
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                    display: "block",
                  }}
                >
                  Public Description
                </label>
                <textarea
                  style={{
                    width: "100%",
                    padding: "0.85rem",
                    borderRadius: "12px",
                    border: "1px solid var(--admin-border)",
                    minHeight: "100px",
                  }}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Tell customers about your shop..."
                ></textarea>
              </div>

              <div className="qb-input-group" style={{ gridColumn: "span 2" }}>
                <label
                  style={{
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                    display: "block",
                  }}
                >
                  Address *
                </label>
                <input
                  style={{
                    width: "100%",
                    padding: "0.85rem",
                    borderRadius: "12px",
                    border: "1px solid var(--admin-border)",
                  }}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="e.g. 123, Marketplace St"
                  required
                />
              </div>

              <div className="qb-input-group">
                <label
                  style={{
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                    display: "block",
                  }}
                >
                  City
                </label>
                <input
                  style={{
                    width: "100%",
                    padding: "0.85rem",
                    borderRadius: "12px",
                    border: "1px solid var(--admin-border)",
                  }}
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="e.g. Mumbai"
                />
              </div>
              
              <div className="qb-input-group">
                <label
                  style={{
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                    display: "block",
                  }}
                >
                  Delivery Radius (km)
                </label>
                <input
                  type="number"
                  style={{
                    width: "100%",
                    padding: "0.85rem",
                    borderRadius: "12px",
                    border: "1px solid var(--admin-border)",
                  }}
                  value={formData.deliveryRadiusKm}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryRadiusKm: e.target.value })
                  }
                  placeholder="e.g. 5"
                />
              </div>
              <button type="submit" className="qb-admin-btn-add" style={{ marginTop: "2rem", gridColumn: "span 2" }}>
                💾 Save Shop
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminShops;

