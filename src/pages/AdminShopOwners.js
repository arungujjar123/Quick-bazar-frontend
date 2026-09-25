import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminShared.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://tear-isa-kings-bruce.trycloudflare.com"
    : "http://localhost:5000");

function AdminShopOwners() {
  const [activeTab, setActiveTab] = useState("owners"); // "owners" | "shops"
  const [shopOwners, setShopOwners] = useState([]);
  const [allShops, setAllShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOwnerId, setExpandedOwnerId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const adminInfoStr = localStorage.getItem("adminInfo");
    if (adminInfoStr) {
      try {
        const info = JSON.parse(adminInfoStr);
        setIsSuperAdmin(info.role === "super_admin");
        if (info.role !== "super_admin") {
          navigate("/admin/dashboard");
        }
      } catch (e) {
        navigate("/admin/login");
      }
    } else {
      navigate("/admin/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchData();
    }
  }, [isSuperAdmin]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchShopOwners(), fetchAllShops()]);
    setLoading(false);
  };

  const fetchShopOwners = async () => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await axios.get(`${API_BASE_URL}/api/superadmin/shop-owners`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShopOwners(response.data);
    } catch (error) {
      console.error("Error fetching shop owners:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      }
    }
  };

  const fetchAllShops = async () => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await axios.get(`${API_BASE_URL}/api/superadmin/shops`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllShops(response.data);
    } catch (error) {
      console.error("Error fetching platform shops:", error);
    }
  };

  const handleDeleteShop = async (shopId, shopName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete shop "${shopName}"?\nAll associated products will also be permanently deleted.`
      )
    ) {
      return;
    }

    const token = localStorage.getItem("adminToken");
    try {
      await axios.delete(`${API_BASE_URL}/api/superadmin/shops/${shopId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`Shop "${shopName}" deleted successfully!`);
      fetchData();
    } catch (error) {
      console.error("Failed to delete shop:", error);
      alert("Failed to delete shop: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteOwner = async (ownerId, ownerName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete owner "${ownerName}"?\nAll shops and products belonging to this owner will be permanently deleted.`
      )
    ) {
      return;
    }

    const token = localStorage.getItem("adminToken");
    try {
      await axios.delete(`${API_BASE_URL}/api/superadmin/shop-owners/${ownerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`Owner "${ownerName}" deleted successfully!`);
      fetchData();
    } catch (error) {
      console.error("Failed to delete owner:", error);
      alert("Failed to delete owner: " + (error.response?.data?.message || error.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    navigate("/admin/login");
  };

  // Filtered lists by search query
  const filteredOwners = shopOwners.filter(
    (o) =>
      o.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredShops = allShops.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.pincode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.owner?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading)
    return (
      <div className="qb-admin-shell">
        <div className="loading" style={{ margin: "auto" }}>
          Loading Platform Data...
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

          <button className="active" onClick={() => navigate("/admin/shop-owners")}>
            <span>🏪</span> Platform Owners & Shops
          </button>

          <button onClick={() => navigate("/admin/categories")}>
            <span>📁</span> Categories
          </button>
          <button onClick={() => navigate("/admin/support")}>
            <span>🤖</span> AI Agent
          </button>
          <button onClick={() => navigate("/admin/settings")}>
            <span>⚙️</span> Settings
          </button>
        </nav>
        <div className="qb-admin-sidebar-bottom">
          <button onClick={() => navigate("/")}>
            <span>🏠</span> View Store
          </button>
          <button onClick={handleLogout}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      <main className="qb-admin-main">
        <header className="qb-admin-topbar">
          <div>
            <h1>Platform Shop & Owner Management</h1>
            <p>View, inspect, and delete shops or merchants registered on QuickBazaar.</p>
          </div>
          <div className="qb-admin-topbar-right">
            <div className="qb-admin-search-box">
              <input
                type="text"
                placeholder="Search by owner, shop name, pincode (e.g. 281403)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i>🔍</i>
            </div>
          </div>
        </header>

        {/* Stats Section */}
        <section className="qb-admin-stats-grid">
          <div className="qb-admin-stat-card">
            <div className="header">
              <span>TOTAL SHOP OWNERS</span>
              <div className="icon-box" style={{ background: "#eff6ff", color: "#3b82f6" }}>
                👥
              </div>
            </div>
            <strong>{shopOwners.length}</strong>
          </div>
          <div className="qb-admin-stat-card">
            <div className="header">
              <span>TOTAL REGISTERED SHOPS</span>
              <div className="icon-box" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                🏪
              </div>
            </div>
            <strong>{allShops.length}</strong>
          </div>
        </section>

        {/* Tab Switcher */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginTop: "2rem",
            borderBottom: "1px solid var(--admin-border, #e2e8f0)",
            paddingBottom: "0.5rem",
          }}
        >
          <button
            onClick={() => setActiveTab("owners")}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "10px",
              border: "none",
              fontWeight: 700,
              cursor: "pointer",
              background: activeTab === "owners" ? "#0f172a" : "#f1f5f9",
              color: activeTab === "owners" ? "white" : "#64748b",
              transition: "all 0.2s ease",
            }}
          >
            👥 Shop Owners ({filteredOwners.length})
          </button>
          <button
            onClick={() => setActiveTab("shops")}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "10px",
              border: "none",
              fontWeight: 700,
              cursor: "pointer",
              background: activeTab === "shops" ? "#0f172a" : "#f1f5f9",
              color: activeTab === "shops" ? "white" : "#64748b",
              transition: "all 0.2s ease",
            }}
          >
            🏪 All Platform Shops ({filteredShops.length})
          </button>
        </div>

        {/* Tab 1: Shop Owners */}
        {activeTab === "owners" && (
          <section className="qb-admin-card" style={{ marginTop: "1.5rem" }}>
            <table className="qb-admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Shops Owned</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOwners.map((owner) => (
                  <React.Fragment key={owner._id}>
                    <tr>
                      <td style={{ fontWeight: 700 }}>{owner.name}</td>
                      <td>{owner.email}</td>
                      <td>
                        <span
                          style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "999px",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            backgroundColor: owner.isActive ? "#ecfdf5" : "#fef2f2",
                            color: owner.isActive ? "#10b981" : "#ef4444",
                          }}
                        >
                          {owner.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            setExpandedOwnerId(
                              expandedOwnerId === owner._id ? null : owner._id
                            )
                          }
                          style={{
                            background: "#f1f5f9",
                            border: "1px solid #cbd5e1",
                            padding: "0.35rem 0.75rem",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                          }}
                        >
                          {owner.shopCount || 0} Shop(s) {expandedOwnerId === owner._id ? "▲" : "▼"}
                        </button>
                      </td>
                      <td>{new Date(owner.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteOwner(owner._id, owner.name)}
                          style={{
                            padding: "0.4rem 0.8rem",
                            borderRadius: "8px",
                            border: "1px solid #fca5a5",
                            background: "#fef2f2",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                          }}
                          title="Delete Owner and all their shops"
                        >
                          🗑️ Delete Owner
                        </button>
                      </td>
                    </tr>
                    {expandedOwnerId === owner._id && (
                      <tr>
                        <td colSpan="6" style={{ background: "#f8fafc", padding: "1rem 1.5rem" }}>
                          <h4 style={{ margin: "0 0 0.75rem 0", color: "#334155" }}>
                            Shops owned by {owner.name}:
                          </h4>
                          {(!owner.shops || owner.shops.length === 0) ? (
                            <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
                              No shops registered by this owner yet.
                            </p>
                          ) : (
                            <div style={{ display: "grid", gap: "0.75rem" }}>
                              {owner.shops.map((shop) => (
                                <div
                                  key={shop._id}
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "0.75rem 1rem",
                                    background: "white",
                                    borderRadius: "8px",
                                    border: "1px solid #e2e8f0",
                                  }}
                                >
                                  <div>
                                    <strong>{shop.name}</strong>
                                    <span
                                      style={{
                                        color: "#64748b",
                                        fontSize: "0.85rem",
                                        marginLeft: "1rem",
                                      }}
                                    >
                                      📍 {shop.address}, {shop.city}
                                    </span>
                                    <span
                                      style={{
                                        padding: "0.15rem 0.5rem",
                                        borderRadius: "6px",
                                        background: "#eff6ff",
                                        color: "#2563eb",
                                        fontWeight: 700,
                                        fontSize: "0.8rem",
                                        marginLeft: "0.75rem",
                                        border: "1px solid #bfdbfe",
                                      }}
                                    >
                                      📌 Pincode: {shop.pincode || "281403"}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteShop(shop._id, shop.name)}
                                    style={{
                                      padding: "0.35rem 0.75rem",
                                      borderRadius: "6px",
                                      border: "1px solid #fca5a5",
                                      background: "#fef2f2",
                                      color: "#ef4444",
                                      cursor: "pointer",
                                      fontWeight: 700,
                                      fontSize: "0.8rem",
                                    }}
                                  >
                                    🗑️ Delete Shop
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {filteredOwners.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>
                      No shop owners matching "{searchQuery}" found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}

        {/* Tab 2: All Platform Shops */}
        {activeTab === "shops" && (
          <section className="qb-admin-card" style={{ marginTop: "1.5rem" }}>
            <table className="qb-admin-table">
              <thead>
                <tr>
                  <th>Shop Name</th>
                  <th>Owner</th>
                  <th>Location</th>
                  <th>Pincode</th>
                  <th>Products</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShops.map((shop) => (
                  <tr key={shop._id}>
                    <td style={{ fontWeight: 700 }}>{shop.name}</td>
                    <td>
                      <div>
                        <strong>{shop.owner?.name || "N/A"}</strong>
                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          {shop.owner?.email}
                        </div>
                      </div>
                    </td>
                    <td>
                      {shop.address}, {shop.city}
                    </td>
                    <td>
                      <span
                        style={{
                          padding: "0.25rem 0.6rem",
                          borderRadius: "6px",
                          background: "#eff6ff",
                          color: "#2563eb",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          border: "1px solid #bfdbfe",
                          display: "inline-block",
                        }}
                      >
                        📌 {shop.pincode || "281403"}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{shop.productCount || 0}</td>
                    <td>
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: "999px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          backgroundColor: shop.isActive ? "#ecfdf5" : "#fef2f2",
                          color: shop.isActive ? "#10b981" : "#ef4444",
                        }}
                      >
                        {shop.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteShop(shop._id, shop.name)}
                        style={{
                          padding: "0.4rem 0.8rem",
                          borderRadius: "8px",
                          border: "1px solid #fca5a5",
                          background: "#fef2f2",
                          color: "#ef4444",
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                        }}
                      >
                        🗑️ Delete Shop
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredShops.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                      No platform shops matching "{searchQuery}" found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminShopOwners;
