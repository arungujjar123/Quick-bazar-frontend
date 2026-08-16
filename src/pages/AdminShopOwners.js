import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminShared.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://quick-bazar-backend.vercel.app"
    : "http://localhost:5000");

function AdminShopOwners() {
  const [shopOwners, setShopOwners] = useState([]);
  const [loading, setLoading] = useState(true);
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
      fetchShopOwners();
    }
  }, [isSuperAdmin]);

  const fetchShopOwners = async () => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await axios.get(`${API_BASE_URL}/api/superadmin/shop-owners`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShopOwners(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching shop owners:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      }
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    navigate("/admin/login");
  };

  if (loading)
    return (
      <div className="qb-admin-shell">
        <div className="loading" style={{ margin: "auto" }}>
          Loading Shop Owners...
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
            <span>🏪</span> Platform Owners
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
            <h1>Platform Shop Owners</h1>
            <p>Manage and view all registered shop owners on the platform.</p>
          </div>
          <div className="qb-admin-topbar-right">
            <div className="qb-admin-search-box">
              <input type="text" placeholder="Quick search..." />
              <i>🔍</i>
            </div>
          </div>
        </header>

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
        </section>

        <section className="qb-admin-card" style={{ marginTop: "2rem" }}>
          <table className="qb-admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Shops Owned</th>
                <th>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {shopOwners.map((owner) => (
                <tr key={owner._id}>
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
                  <td>{owner.shopCount || 0}</td>
                  <td>{new Date(owner.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {shopOwners.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>
                    No shop owners found on the platform.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default AdminShopOwners;
