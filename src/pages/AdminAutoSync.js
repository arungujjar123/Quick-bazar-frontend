import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminShared.css";
import "./AdminAutoSync.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://quick-bazar-backend.vercel.app"
    : "http://localhost:5000");

function AdminAutoSync() {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState("");
  const [syncUrl, setSyncUrl] = useState("");
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
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
        const firstShop = shopList[0];
        setSelectedShop(firstShop._id);
        fetchShopSyncStatus(firstShop._id);
      }
    } catch (err) {
      console.error("Error fetching shops:", err);
    }
  };

  const fetchShopSyncStatus = async (shopId) => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/shops/${shopId}/sync-status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSyncUrl(response.data.syncUrl || "");
      setSyncEnabled(Boolean(response.data.syncEnabled));
      setSyncStatus(response.data);
    } catch (err) {
      console.error("Error fetching sync status:", err);
    }
  };

  const handleShopChange = (shopId) => {
    setSelectedShop(shopId);
    setMessage(null);
    setError("");
    fetchShopSyncStatus(shopId);
  };

  const handleSaveConfig = async () => {
    if (!selectedShop) {
      setError("Please select a shop first.");
      return;
    }

    setSaving(true);
    setMessage(null);
    setError("");

    const token = localStorage.getItem("adminToken");
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/admin/shops/${selectedShop}/sync-config`,
        { syncUrl, syncEnabled },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage({ type: "success", text: "✅ Auto-sync settings saved successfully!" });
      setSyncStatus(response.data.shop);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save sync settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleSyncNow = async () => {
    if (!selectedShop) {
      setError("Please select a shop first.");
      return;
    }
    if (!syncUrl.trim()) {
      setError("Please enter a OneDrive or Google Sheet link before syncing.");
      return;
    }

    setSyncing(true);
    setMessage(null);
    setError("");

    const token = localStorage.getItem("adminToken");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/shops/${selectedShop}/sync-now`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage({
        type: "success",
        text: response.data.message || "✅ Inventory & AI Images synced successfully!",
        details: response.data.result,
      });

      fetchShopSyncStatus(selectedShop);
    } catch (err) {
      setError(err.response?.data?.message || "Sync failed. Please check your link.");
      fetchShopSyncStatus(selectedShop);
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    navigate("/admin/login");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
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
          <button onClick={() => navigate("/admin/bulk-upload")}>
            <span>📤</span> Bulk Import
          </button>
          <button className="active" onClick={() => navigate("/admin/auto-sync")}>
            <span>🔄</span> Live Auto-Sync
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
            <h1>🔄 Live Auto-Sync & AI Image Fetcher</h1>
            <p>
              Connect your OneDrive Excel or Google Sheet view link for automatic store updates & AI image fetching.
            </p>
          </div>
          <button onClick={() => navigate("/admin/products")}>
            ← Back to Inventory
          </button>
        </header>

        <div className="autosync-container">
          {/* Feature Highlight Card */}
          <div className="autosync-card highlight-card">
            <div className="highlight-icon">🤖</div>
            <div>
              <h3>Zero-Touch Automated Store Updates</h3>
              <p>
                Edit your inventory in MS Excel on Desktop or Google Sheets. QuickBazaar automatically pulls updated stock & prices every 15 minutes, and our <strong>AI Agent automatically searches Google/DuckDuckGo for matching product images!</strong>
              </p>
            </div>
          </div>

          {/* Shop Selection & Link Form */}
          <div className="autosync-card">
            <h3>🏪 Select Shop & Live Link</h3>
            
            <div className="form-group">
              <label>Select Shop:</label>
              {shops.length === 0 ? (
                <p className="error-text">No shops found. Please create a shop first.</p>
              ) : (
                <select
                  className="autosync-input"
                  value={selectedShop}
                  onChange={(e) => handleShopChange(e.target.value)}
                >
                  {shops.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} — {s.address}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label>OneDrive or Google Sheet Sharing Link:</label>
              <input
                type="text"
                className="autosync-input"
                placeholder="e.g. https://1drv.ms/x/c/38C13EBA4B8DF0EA/IQB3xrexS... or Google Sheet CSV link"
                value={syncUrl}
                onChange={(e) => setSyncUrl(e.target.value)}
              />
              <span className="input-help">
                💡 Works with OneDrive view links (e.g. <code>https://1drv.ms/x/...</code>) and Google Sheet published links.
              </span>
            </div>

            <div className="form-group-toggle">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={syncEnabled}
                  onChange={(e) => setSyncEnabled(e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <div>
                <strong>Enable Automatic 15-Minute Background Sync</strong>
                <p>When enabled, QuickBazaar continuously syncs stock & fetches missing images every 15 mins.</p>
              </div>
            </div>

            <div className="action-buttons">
              <button
                className="btn-save-config"
                onClick={handleSaveConfig}
                disabled={saving || syncing}
              >
                {saving ? "Saving Settings..." : "💾 Save Sync Settings"}
              </button>

              <button
                className="btn-sync-now"
                onClick={handleSyncNow}
                disabled={saving || syncing || !syncUrl.trim()}
              >
                {syncing ? (
                  <>
                    <span className="spinner"></span> Syncing & Fetching AI Images...
                  </>
                ) : (
                  <>🔄 Sync Now & Fetch AI Images</>
                )}
              </button>
            </div>
          </div>

          {/* Status Display Card */}
          {syncStatus && (
            <div className="autosync-card status-card">
              <h3>📊 Sync Status & Log</h3>
              <div className="status-grid">
                <div className="status-item">
                  <span>Last Sync Status:</span>
                  <strong className={`status-badge status-${syncStatus.lastSyncStatus || "none"}`}>
                    {syncStatus.lastSyncStatus === "success" && "🟢 SUCCESS"}
                    {syncStatus.lastSyncStatus === "failed" && "🔴 FAILED"}
                    {syncStatus.lastSyncStatus === "none" && "⚪ NOT SYNCED YET"}
                  </strong>
                </div>

                <div className="status-item">
                  <span>Last Sync Time:</span>
                  <strong>{formatDate(syncStatus.lastSyncAt)}</strong>
                </div>

                <div className="status-item">
                  <span>Auto-Sync Background Job:</span>
                  <strong style={{ color: syncEnabled ? "#16a34a" : "#dc2626" }}>
                    {syncEnabled ? "🟢 ACTIVE (Every 15m)" : "🔴 DISABLED"}
                  </strong>
                </div>
              </div>

              {syncStatus.lastSyncMessage && (
                <div className="status-log-box">
                  <strong>Last Sync Output Log:</strong>
                  <p>{syncStatus.lastSyncMessage}</p>
                </div>
              )}
            </div>
          )}

          {/* Result Alert */}
          {message && (
            <div className="autosync-alert alert-success">
              <h4>{message.text}</h4>
              {message.details && (
                <div className="result-stats-row">
                  <div className="stat-pill stat-blue">
                    <strong>{message.details.totalSynced}</strong> Total Items
                  </div>
                  <div className="stat-pill stat-green">
                    <strong>{message.details.newCount}</strong> New Products
                  </div>
                  <div className="stat-pill stat-amber">
                    <strong>{message.details.updatedCount}</strong> Updated
                  </div>
                  <div className="stat-pill stat-purple">
                    <strong>🤖 {message.details.imagesFetched}</strong> AI Images Attached
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="autosync-alert alert-error">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* How to get sharing links guide */}
          <div className="autosync-card guide-card">
            <h3>📖 How to Get Your Sharing Link</h3>
            <div className="guide-columns">
              <div className="guide-col">
                <h4>Microsoft Excel (OneDrive)</h4>
                <ol>
                  <li>Open your Excel file in MS Excel Desktop or Web.</li>
                  <li>Click the green <strong>"Share"</strong> button in top right.</li>
                  <li>Click <strong>"Copy Link"</strong> (Ensure view permission).</li>
                  <li>Paste the link (e.g. <code>https://1drv.ms/x/c/...</code>) in the box above!</li>
                </ol>
              </div>

              <div className="guide-col">
                <h4>Google Sheets</h4>
                <ol>
                  <li>Open your Google Sheet.</li>
                  <li>Click <strong>File &gt; Share &gt; Publish to web</strong>.</li>
                  <li>Choose <strong>Comma-separated values (.csv)</strong>.</li>
                  <li>Copy the published link and paste it in the box above!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminAutoSync;
