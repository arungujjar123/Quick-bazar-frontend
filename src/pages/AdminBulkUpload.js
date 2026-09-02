import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminShared.css";
import "./AdminBulkUpload.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://quick-bazar-backend.vercel.app"
    : "http://localhost:5000");

function AdminBulkUpload() {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState("");
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    const adminInfoStr = localStorage.getItem("adminInfo");
    if (adminInfoStr) {
      try {
        const info = JSON.parse(adminInfoStr);
        setIsSuperAdmin(info.role === "super_admin");
      } catch (e) {}
    }

    fetchShops();
  }, [navigate]);

  const fetchShops = async () => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await axios.get(`${API_BASE_URL}/api/shops/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const shopList = response.data || [];
      setShops(shopList);
      if (shopList.length > 0) {
        setSelectedShop(shopList[0]._id);
      }
    } catch (err) {
      console.error("Error fetching shops:", err);
    }
  };

  // ========== Drag & Drop Handlers ==========
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError("");
    setResult(null);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileSelect = (e) => {
    setError("");
    setResult(null);
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
    ];
    const ext = selectedFile.name.split(".").pop().toLowerCase();

    if (!validTypes.includes(selectedFile.type) && !["xlsx", "xls", "csv"].includes(ext)) {
      setError("❌ Invalid file type. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("❌ File too large. Maximum size is 10MB.");
      return;
    }

    setFile(selectedFile);
  };

  // ========== Upload Handler ==========
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }
    if (!selectedShop) {
      setError("Please select a shop first.");
      return;
    }

    setUploading(true);
    setError("");
    setResult(null);

    const token = localStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("shopId", selectedShop);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/products/bulk-upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(response.data);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      const msg =
        err.response?.data?.message || "Upload failed. Please try again.";
      const errorDetails = err.response?.data?.errors || [];
      setError(msg);
      if (errorDetails.length > 0) {
        setResult({ summary: { errorDetails } });
      }
    } finally {
      setUploading(false);
    }
  };

  // ========== Template Download ==========
  const handleDownloadTemplate = async () => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/products/bulk-template`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "QuickBazaar_Stock_Template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download template. Please try again.");
    }
  };

  // ========== Remove Selected File ==========
  const removeFile = () => {
    setFile(null);
    setResult(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    navigate("/admin/login");
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
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
          <button className="active" onClick={() => navigate("/admin/bulk-upload")}>
            <span>📤</span> Bulk Import
          </button>
          <button onClick={() => navigate("/admin/support")}>
            <span>🤖</span> AI Agent
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
            <h1>📤 Bulk Stock Import</h1>
            <p>
              Upload your inventory Excel/CSV file to add or update products in
              bulk.
            </p>
          </div>
          <button onClick={() => navigate("/admin/products")}>
            ← Back to Inventory
          </button>
        </header>

        <div className="bulk-upload-container">
          {/* Step 1: How it works guide */}
          <div className="bulk-section bulk-guide">
            <h3>📋 How It Works</h3>
            <div className="guide-steps">
              <div className="guide-step">
                <div className="step-number">1</div>
                <div>
                  <strong>Download Template</strong>
                  <p>Get the sample Excel file with correct column headers.</p>
                </div>
              </div>
              <div className="guide-step">
                <div className="step-number">2</div>
                <div>
                  <strong>Fill Your Data</strong>
                  <p>
                    Add your products with Name, Price, Stock, Category &
                    Description.
                  </p>
                </div>
              </div>
              <div className="guide-step">
                <div className="step-number">3</div>
                <div>
                  <strong>Upload & Sync</strong>
                  <p>
                    Select your shop, upload the file — products go live
                    instantly!
                  </p>
                </div>
              </div>
            </div>
            <button className="template-btn" onClick={handleDownloadTemplate}>
              📥 Download Sample Excel Template
            </button>
          </div>

          {/* Step 2: Shop selection */}
          <div className="bulk-section">
            <h3>🏪 Select Your Shop</h3>
            {shops.length === 0 ? (
              <div className="no-shops-msg">
                <p>
                  ⚠️ No shops found. Please{" "}
                  <span
                    className="link-text"
                    onClick={() => navigate("/admin/shops")}
                  >
                    create a shop
                  </span>{" "}
                  first before importing products.
                </p>
              </div>
            ) : (
              <select
                className="shop-select"
                value={selectedShop}
                onChange={(e) => setSelectedShop(e.target.value)}
              >
                {shops.map((shop) => (
                  <option key={shop._id} value={shop._id}>
                    {shop.name} — {shop.address}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Step 3: Drag & Drop Upload Zone */}
          <div className="bulk-section">
            <h3>📁 Upload Inventory File</h3>
            <div
              className={`drop-zone ${dragActive ? "drag-active" : ""} ${file ? "has-file" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />

              {file ? (
                <div className="file-selected">
                  <div className="file-icon">📄</div>
                  <div className="file-info">
                    <strong>{file.name}</strong>
                    <span>{formatFileSize(file.size)}</span>
                  </div>
                  <button
                    className="remove-file-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="drop-zone-content">
                  <div className="drop-icon">📤</div>
                  <p className="drop-main-text">
                    Drag & drop your Excel/CSV file here
                  </p>
                  <p className="drop-sub-text">
                    or click to browse • Supports .xlsx, .xls, .csv (max 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Supported Headers Info */}
          <div className="bulk-section headers-info">
            <h3>🧠 Smart Column Detection</h3>
            <p>
              Your Excel headers will be auto-detected. We support these column
              names:
            </p>
            <div className="headers-grid">
              <div className="header-item">
                <strong>Product Name:</strong>
                <span>Name, Item, Product, Samagri, Naam, Title</span>
              </div>
              <div className="header-item">
                <strong>Price:</strong>
                <span>Price, Rate, Kimat, MRP, Cost, Daam</span>
              </div>
              <div className="header-item">
                <strong>Stock/Quantity:</strong>
                <span>Stock, Qty, Quantity, Matra, Units, Inventory</span>
              </div>
              <div className="header-item">
                <strong>Category:</strong>
                <span>Category, Varg, Type, Group, Section</span>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bulk-alert bulk-alert-error">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Success Result */}
          {result && result.success && (
            <div className="bulk-alert bulk-alert-success">
              <h4>{result.message}</h4>
              <div className="result-stats">
                <div className="stat-item stat-total">
                  <span className="stat-num">
                    {result.summary.totalProcessed}
                  </span>
                  <span className="stat-label">Total Processed</span>
                </div>
                <div className="stat-item stat-created">
                  <span className="stat-num">{result.summary.created}</span>
                  <span className="stat-label">New Products</span>
                </div>
                <div className="stat-item stat-updated">
                  <span className="stat-num">{result.summary.updated}</span>
                  <span className="stat-label">Updated</span>
                </div>
                {result.summary.errors > 0 && (
                  <div className="stat-item stat-errors">
                    <span className="stat-num">{result.summary.errors}</span>
                    <span className="stat-label">Skipped</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Details from result */}
          {result && result.summary?.errorDetails?.length > 0 && (
            <div className="bulk-alert bulk-alert-warning">
              <h4>⚠️ Some rows were skipped:</h4>
              <ul>
                {result.summary.errorDetails.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Upload Button */}
          <div className="bulk-actions">
            <button
              className="upload-btn"
              onClick={handleUpload}
              disabled={!file || !selectedShop || uploading}
            >
              {uploading ? (
                <>
                  <span className="spinner"></span> Uploading & Processing...
                </>
              ) : (
                <>🚀 Upload & Sync Inventory</>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminBulkUpload;
