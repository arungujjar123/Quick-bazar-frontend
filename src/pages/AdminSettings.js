import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminShared.css";

function AdminSettings() {
  const [adminInfo, setAdminInfo] = useState({ name: "", email: "", role: "" });
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const adminInfoStr = localStorage.getItem("adminInfo");
    if (adminInfoStr) {
      try {
        const info = JSON.parse(adminInfoStr);
        setAdminInfo(info);
        setIsSuperAdmin(info.role === "super_admin");
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    navigate("/admin/login");
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedMsg("✅ Settings saved successfully!");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  return (
    <div className="qb-admin-shell fade-in">
      {/* Sidebar */}
      <aside className="qb-admin-sidebar">
        <div className="qb-admin-brand-block">
          <div className="logo-icon">QB</div>
          <div>
            <h2>QuickBazaar</h2>
            <p>Admin Portal</p>
          </div>
        </div>
        <button
          className="qb-admin-btn-add"
          onClick={() => navigate("/admin/add-product")}
        >
          + Create Listing
        </button>
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
              <button onClick={() => navigate("/admin/shops")}>
                <span>🏪</span> Shops
              </button>
            </>
          )}
          <button onClick={() => navigate("/admin/support")}>
            <span>🤖</span> AI Agent
          </button>
          <button onClick={() => navigate("/admin/customers")}>
            <span>👥</span> Customers
          </button>
          <button onClick={() => navigate("/admin/categories")}>
            <span>📁</span> Categories
          </button>
          <button className="active" onClick={() => navigate("/admin/settings")}>
            <span>⚙️</span> Settings
          </button>
        </nav>
        <div className="qb-admin-sidebar-bottom">
          <button onClick={() => navigate("/")}>🏠 View Store</button>
          <button onClick={handleLogout}>🚪 Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="qb-admin-main">
        <header className="qb-admin-topbar">
          <div>
            <h1>⚙️ Store Settings & Preferences</h1>
            <p>Manage your account, platform defaults, and notification preferences.</p>
          </div>
        </header>

        {savedMsg && (
          <div
            style={{
              padding: "1rem 1.5rem",
              background: "#dcfce7",
              color: "#166534",
              borderRadius: "12px",
              marginBottom: "1.5rem",
              fontWeight: "600",
            }}
          >
            {savedMsg}
          </div>
        )}

        <div style={{ display: "grid", gap: "2rem", maxWidth: "800px" }}>
          {/* Admin Profile Card */}
          <section className="qb-admin-card">
            <h3>👤 Merchant Profile</h3>
            <form onSubmit={handleSaveSettings} style={{ display: "grid", gap: "1.25rem", marginTop: "1rem" }}>
              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: "0.35rem" }}>Admin Name</label>
                <input
                  type="text"
                  value={adminInfo.name || "Admin User"}
                  onChange={(e) => setAdminInfo({ ...adminInfo, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: "0.35rem" }}>Email Address</label>
                <input
                  type="email"
                  value={adminInfo.email || "admin@quickbazaar.com"}
                  disabled
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    color: "#64748b",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: "0.35rem" }}>Role</label>
                <input
                  type="text"
                  value={isSuperAdmin ? "Super Admin (Platform Owner)" : "Shopkeeper / Merchant Admin"}
                  disabled
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    color: "#64748b",
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "10px",
                  background: "var(--admin-primary)",
                  color: "white",
                  border: "none",
                  fontWeight: "700",
                  cursor: "pointer",
                  width: "fit-content",
                }}
              >
                💾 Save Profile Changes
              </button>
            </form>
          </section>

          {/* Platform Defaults */}
          <section className="qb-admin-card">
            <h3>🌐 Marketplace Defaults</h3>
            <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>Currency Symbol</strong>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>Default marketplace currency</p>
                </div>
                <span style={{ fontWeight: 800, fontSize: "1.2rem", color: "#4f46e5" }}>₹ (INR)</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>Default Delivery Radius</strong>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>Max auto-search radius</p>
                </div>
                <span style={{ fontWeight: 700, color: "#1e293b" }}>50 km</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>AI Image Generator</strong>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>Auto-attach Unsplash photos</p>
                </div>
                <span style={{ fontWeight: 700, color: "#16a34a" }}>🟢 Enabled</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AdminSettings;
