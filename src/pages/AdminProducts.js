import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminShared.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://quick-bazar-backend.vercel.app"
    : "http://localhost:5000");

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    category: "",
    stock: "",
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
    checkAdminAuth();
    fetchProducts();
  }, []);

  const pageSize = 8;

  const checkAdminAuth = () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }
  };

  const fetchProducts = async () => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      }
      setLoading(false);
    }
  };

  const getPlaceholderImage = (label) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&background=f1f5f9&color=475569&size=128`;
  };

  const handleEdit = (product) => {
    setEditingProduct(product._id);
    setEditForm({
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.imageUrl || product.image,
      category: product.category || "",
      stock: product.stock || 0,
    });
  };

  const handleSaveEdit = async (productId) => {
    const token = localStorage.getItem("adminToken");
    try {
      const updateData = {
        ...editForm,
        imageUrl: editForm.image,
      };
      delete updateData.image;

      await axios.put(
        `${API_BASE_URL}/api/admin/products/${productId}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setProducts(
        products.map((p) =>
          p._id === productId
            ? {
                ...p,
                ...editForm,
                price: parseFloat(editForm.price),
                stock: parseInt(editForm.stock),
              }
            : p,
        ),
      );

      setEditingProduct(null);
      alert("Product updated successfully");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    }
  };

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Delete "${productName}"?`)) return;

    const token = localStorage.getItem("adminToken");
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter((p) => p._id !== productId));
    } catch (error) {
      alert("Failed to delete product");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    navigate("/admin/login");
  };

  const filteredProducts = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    let output = [...products];

    if (normalized) {
      output = output.filter(
        (product) =>
          product.name?.toLowerCase().includes(normalized) ||
          product.category?.toLowerCase().includes(normalized),
      );
    }

    if (categoryFilter !== "all") {
      output = output.filter(
        (product) => (product.category || "uncategorized") === categoryFilter,
      );
    }

    output.sort((a, b) => {
      if (sortBy === "price")
        return Number(a.price || 0) - Number(b.price || 0);
      if (sortBy === "stock")
        return Number(a.stock || 0) - Number(b.stock || 0);
      return (a.name || "").localeCompare(b.name || "");
    });

    return output;
  }, [products, searchTerm, categoryFilter, sortBy]);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category || "uncategorized"));
    return ["all", ...Array.from(set)];
  }, [products]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredProducts.length);
  const currentItems = filteredProducts.slice(startIndex, endIndex);

  const activeStock = products.reduce(
    (sum, p) => sum + Number(p.stock || 0),
    0,
  );
  const lowStockCount = products.filter(
    (p) => Number(p.stock || 0) <= 5,
  ).length;

  if (loading) {
    return (
      <div className="qb-admin-shell">
        <div className="loading" style={{ margin: "auto" }}>
          Fetching Inventory...
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
              <button
                className="active"
                onClick={() => navigate("/admin/products")}
              >
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
          <button onClick={() => navigate("/")}>🏠 View Store</button>
          <button onClick={handleLogout}>🚪 Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="qb-admin-main">
        <header className="qb-admin-topbar">
          <div>
            <h1>Products Inventory</h1>
            <p>Manage your artisanal marketplace offerings and stock levels.</p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={() => navigate("/admin/auto-sync")}
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              🔄 Live Auto-Sync
            </button>
            <button
              onClick={() => navigate("/admin/bulk-upload")}
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              📤 Bulk Import Stock
            </button>
            <button onClick={() => navigate("/admin/add-product")}>
              + Add New Product
            </button>
          </div>
        </header>

        <div className="qb-admin-toolbar-row">
          <div className="qb-admin-toolbar-search">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
            />
          </div>
          <div className="qb-admin-toolbar-actions">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All Categories" : c}
                </option>
              ))}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="stock">Sort by Stock</option>
            </select>
          </div>
        </div>

        <section className="qb-inventory-table-card">
          <table className="qb-inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div className="qb-product-cell">
                      <img
                        src={
                          product.imageUrl ||
                          product.image ||
                          getPlaceholderImage(product.name)
                        }
                        alt={product.name}
                      />
                      <div>
                        <strong>{product.name}</strong>
                        <small>ID: {product._id.slice(-6).toUpperCase()}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="qb-category-pill">
                      {product.category || "Uncategorized"}
                    </span>
                  </td>
                  <td>
                    <strong>₹{Number(product.price || 0).toFixed(2)}</strong>
                  </td>
                  <td>
                    <span
                      className={`qb-stock-state ${Number(product.stock || 0) <= 5 ? "low" : "ok"}`}
                    >
                      {product.stock || 0} in stock
                    </span>
                  </td>
                  <td>
                    <div className="qb-row-actions">
                      <button onClick={() => handleEdit(product)}>Edit</button>
                      <button
                        onClick={() => handleDelete(product._id, product.name)}
                        style={{ color: "#ef4444" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="qb-inventory-metrics">
          <article>
            <h4>Active Stock</h4>
            <strong>{activeStock.toLocaleString()}</strong>
            <p>Across all listings</p>
          </article>
          <article>
            <h4>Low Stock Alerts</h4>
            <strong
              style={{ color: lowStockCount > 0 ? "#ef4444" : "inherit" }}
            >
              {lowStockCount.toString().padStart(2, "0")}
            </strong>
            <p>Requires attention</p>
          </article>
        </section>
      </main>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000,
          display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div style={{
            background: "white", padding: "2rem", borderRadius: "16px",
            width: "500px", maxWidth: "90%", maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
          }}>
            <h2 style={{marginTop: 0, marginBottom: "1.5rem", color: "#1e293b"}}>Edit Product</h2>
            <div style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
              <div>
                <label style={{display: "block", marginBottom: "0.25rem", fontWeight: "600", fontSize: "0.9rem"}}>Name</label>
                <input style={{width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0"}} 
                       value={editForm.name || ""} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
              </div>
              <div>
                <label style={{display: "block", marginBottom: "0.25rem", fontWeight: "600", fontSize: "0.9rem"}}>Price (₹)</label>
                <input type="number" style={{width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0"}} 
                       value={editForm.price || ""} onChange={(e) => setEditForm({...editForm, price: e.target.value})} />
              </div>
              <div>
                <label style={{display: "block", marginBottom: "0.25rem", fontWeight: "600", fontSize: "0.9rem"}}>Category</label>
                <select style={{width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0"}}
                        value={editForm.category || ""} onChange={(e) => setEditForm({...editForm, category: e.target.value})}>
                  <option value="">Select Category...</option>
                  {categories.filter(c => c !== "all").map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{display: "block", marginBottom: "0.25rem", fontWeight: "600", fontSize: "0.9rem"}}>Stock</label>
                <input type="number" style={{width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0"}} 
                       value={editForm.stock !== undefined ? editForm.stock : ""} onChange={(e) => setEditForm({...editForm, stock: e.target.value})} />
              </div>
              <div>
                <label style={{display: "block", marginBottom: "0.25rem", fontWeight: "600", fontSize: "0.9rem"}}>Image URL</label>
                <input style={{width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0"}} 
                       value={editForm.image || ""} onChange={(e) => setEditForm({...editForm, image: e.target.value})} />
              </div>
              <div>
                <label style={{display: "block", marginBottom: "0.25rem", fontWeight: "600", fontSize: "0.9rem"}}>Description</label>
                <textarea style={{width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0", minHeight: "80px"}} 
                          value={editForm.description || ""} onChange={(e) => setEditForm({...editForm, description: e.target.value})} />
              </div>
            </div>
            <div style={{display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1.5rem"}}>
              <button style={{padding: "0.75rem 1.5rem", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontWeight: "600"}} onClick={() => setEditingProduct(null)}>Cancel</button>
              <button style={{padding: "0.75rem 1.5rem", borderRadius: "8px", border: "none", background: "var(--admin-primary)", color: "white", cursor: "pointer", fontWeight: "600"}} onClick={() => handleSaveEdit(editingProduct)}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
