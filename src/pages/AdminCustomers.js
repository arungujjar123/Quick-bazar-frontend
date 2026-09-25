import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminShared.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://tear-isa-kings-bruce.trycloudflare.com"
    : "http://localhost:5000");

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    navigate("/admin/login");
  };

  const filteredCustomers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return customers;
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query)
    );
  }, [customers, searchTerm]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="qb-admin-shell">
        <div className="loading" style={{ margin: "auto" }}>
          Loading Registered Customers...
        </div>
      </div>
    );
  }

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
          <button className="active" onClick={() => navigate("/admin/customers")}>
            <span>👥</span> Customers
          </button>
          <button onClick={() => navigate("/admin/categories")}>
            <span>📁</span> Categories
          </button>
          <button onClick={() => navigate("/admin/settings")}>
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
            <h1>👥 Registered Customers</h1>
            <p>View and manage all registered shoppers on QuickBazaar.</p>
          </div>
          <button onClick={() => navigate("/admin/orders")}>
            🧾 View Orders
          </button>
        </header>

        {/* Toolbar */}
        <div className="qb-admin-toolbar-row">
          <div className="qb-admin-toolbar-search">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or phone..."
            />
          </div>
        </div>

        {/* Customer Table */}
        <section className="qb-inventory-table-card">
          <table className="qb-inventory-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact Phone</th>
                <th>Joined Date</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    No registered customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id}>
                    <td>
                      <div className="qb-product-cell">
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #6366f1, #a855f7)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "700",
                            fontSize: "1rem",
                            flexShrink: 0,
                          }}
                        >
                          {(customer.name || "U")[0].toUpperCase()}
                        </div>
                        <div>
                          <strong>{customer.name || "Unnamed Customer"}</strong>
                          <small>{customer.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>{customer.phone || "Not Provided"}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.9rem", color: "#64748b" }}>
                        {formatDate(customer.createdAt)}
                      </span>
                    </td>
                    <td>
                      <span
                        className="qb-stock-state ok"
                        style={{ background: "#f0fdf4", color: "#166534" }}
                      >
                        🟢 Verified User
                      </span>
                    </td>
                    <td>
                      <div className="qb-row-actions">
                        <a
                          href={`mailto:${customer.email}`}
                          style={{
                            padding: "0.4rem 0.85rem",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            background: "white",
                            color: "#3b82f6",
                            textDecoration: "none",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                          }}
                        >
                          ✉️ Contact
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {/* Metrics */}
        <section className="qb-inventory-metrics">
          <article>
            <h4>Total Registered Shoppers</h4>
            <strong>{customers.length}</strong>
            <p>Active accounts in system</p>
          </article>
          <article>
            <h4>Verified Users</h4>
            <strong style={{ color: "#16a34a" }}>{customers.length}</strong>
            <p>Email verified accounts</p>
          </article>
        </section>
      </main>
    </div>
  );
}

export default AdminCustomers;
