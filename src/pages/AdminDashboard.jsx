import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  navy:   "#0F1C2A",
  navy2:  "#1A2E42",
  gold:   "#C9A84C",
  goldL:  "#E2CC8A",
  bg:     "#F7F5F0",
  white:  "#FFFFFF",
  ivory:  "#8A7A60",
  border: "#E5E0D5",
  green:  "#2E7D4F",
  red:    "#B03A2E",
  blue:   "#1A6FA3",
};

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --navy: ${T.navy}; --navy2: ${T.navy2};
  --gold: ${T.gold}; --goldL: ${T.goldL};
  --bg: ${T.bg}; --white: ${T.white};
  --ivory: ${T.ivory}; --border: ${T.border};
  --green: ${T.green}; --red: ${T.red}; --blue: ${T.blue};
  --font-display: 'Cormorant Garamond', serif;
  --font-body: 'Outfit', sans-serif;
  --radius: 14px;
  --shadow: 0 4px 20px rgba(15,28,42,.08);
  --shadow-md: 0 8px 32px rgba(15,28,42,.12);
}

html { scroll-behavior: smooth; }
body {
  font-family: var(--font-body);
  background: var(--bg);
  color: var(--navy);
  -webkit-font-smoothing: antialiased;
}
a { text-decoration: none; color: inherit; }
button { font-family: var(--font-body); cursor: pointer; border: none; background: none; }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

/* ── TOPBAR ── */
.db-topbar {
  background: var(--navy);
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
}
.db-topbar span {
  font-size: 10px;
  color: rgba(226,204,138,.7);
  letter-spacing: .5px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.db-topbar b { color: var(--goldL); font-weight: 600; }

/* ── NAVBAR ── */
.db-nav {
  background: var(--navy);
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(201,168,76,.12);
}
.db-logo {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-shrink: 0;
}
.db-logo-drop {
  width: 22px;
  height: 28px;
  background: linear-gradient(160deg, #B8E0F7, #1A6FA3);
  border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
  position: relative;
}
.db-logo-drop::after {
  content: '';
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 5px;
  height: 5px;
  background: var(--gold);
  border-radius: 50%;
}
.db-logo h1 {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2px;
  line-height: 1;
}
.db-logo p {
  font-size: 7px;
  color: var(--gold);
  letter-spacing: 2.5px;
  text-transform: uppercase;
  margin-top: 2px;
}
.db-nav-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}
.db-nav-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 14px 5px 10px;
  border-radius: 20px;
  background: rgba(201,168,76,.1);
  border: 1px solid rgba(201,168,76,.25);
}
.db-nav-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--gold);
  animation: pulseDot 2s ease-in-out infinite;
}
@keyframes pulseDot {
  0%,100% { opacity: 1; transform: scale(1); }
  50%      { opacity: .5; transform: scale(.7); }
}
.db-nav-badge span {
  font-size: 11px;
  font-weight: 600;
  color: var(--goldL);
  letter-spacing: .5px;
}

/* ── SIGN OUT BUTTON ── */
.db-signout {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  background: rgba(176,58,46,.12);
  border: 1px solid rgba(176,58,46,.3);
  font-size: 11px;
  font-weight: 700;
  color: #E07A72;
  letter-spacing: .5px;
  cursor: pointer;
  transition: background .2s, border-color .2s, transform .15s;
  font-family: var(--font-body);
}
.db-signout:hover {
  background: rgba(176,58,46,.22);
  border-color: rgba(176,58,46,.5);
  transform: translateY(-1px);
}
.db-signout:active { transform: translateY(0); }

/* ── BREADCRUMB ── */
.db-bread {
  background: var(--white);
  border-bottom: 1px solid var(--border);
  padding: 0 24px;
  height: 38px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--ivory);
}
.db-bread a { color: var(--ivory); transition: color .15s; }
.db-bread a:hover { color: var(--navy); }
.db-bread-sep { color: var(--border); }
.db-bread-cur { color: var(--navy); font-weight: 600; }

/* ── PAGE ── */
.db-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 80px;
  animation: dbFade .35s ease;
}
@keyframes dbFade {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}

/* ── PAGE HEADER ── */
.db-hdr {
  margin-bottom: 28px;
}
.db-hdr h1 {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 700;
  color: var(--navy);
  line-height: 1;
  margin-bottom: 6px;
}
.db-hdr p { font-size: 13px; color: var(--ivory); }

/* ── DIVIDER LABEL ── */
.db-section-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--ivory);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.db-section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

/* ── STATS GRID ── */
.db-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 32px;
}
@media (max-width: 900px) { .db-stats { grid-template-columns: 1fr 1fr; } }
@media (max-width: 500px) { .db-stats { grid-template-columns: 1fr; } }

.db-stat {
  background: var(--white);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: dbFade .4s ease both;
  transition: box-shadow .2s, transform .2s;
}
.db-stat:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
.db-stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.db-stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.db-stat-icon.gold  { background: rgba(201,168,76,.1);  border: 1px solid rgba(201,168,76,.2); }
.db-stat-icon.green { background: rgba(46,125,79,.1);   border: 1px solid rgba(46,125,79,.2); }
.db-stat-icon.blue  { background: rgba(26,111,163,.1);  border: 1px solid rgba(26,111,163,.2); }
.db-stat-icon.red   { background: rgba(176,58,46,.1);   border: 1px solid rgba(176,58,46,.2); }
.db-stat-trend {
  font-size: 9px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 20px;
}
.db-stat-trend.up   { background: rgba(46,125,79,.1); color: var(--green); border: 1px solid rgba(46,125,79,.2); }
.db-stat-trend.live { background: rgba(201,168,76,.1); color: var(--gold); border: 1px solid rgba(201,168,76,.2); }
.db-stat-trend.warn { background: rgba(176,58,46,.08); color: var(--red);  border: 1px solid rgba(176,58,46,.2); }
.db-stat-val {
  font-family: var(--font-display);
  font-size: 34px;
  font-weight: 700;
  color: var(--navy);
  line-height: 1;
}
.db-stat-key {
  font-size: 10px;
  color: var(--ivory);
  font-weight: 600;
  letter-spacing: .5px;
  text-transform: uppercase;
  margin-top: 2px;
}

/* ── ACTIONS GRID ── */
.db-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 32px;
}
@media (max-width: 700px) { .db-actions { grid-template-columns: 1fr; } }

.db-action-card {
  background: var(--white);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  padding: 24px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-decoration: none;
  color: inherit;
  animation: dbFade .4s ease both;
  transition: box-shadow .2s, transform .2s, border-color .2s;
  position: relative;
  overflow: hidden;
}
.db-action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--gold), var(--goldL));
  opacity: 0;
  transition: opacity .2s;
}
.db-action-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
  border-color: rgba(201,168,76,.3);
}
.db-action-card:hover::before { opacity: 1; }

.db-action-card.navy {
  background: var(--navy);
  border-color: rgba(201,168,76,.2);
}
.db-action-card.navy::before {
  background: linear-gradient(90deg, var(--gold), var(--goldL));
}

.db-action-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}
.db-action-icon-wrap.gold       { background: rgba(201,168,76,.1);  border: 1px solid rgba(201,168,76,.2); }
.db-action-icon-wrap.green      { background: rgba(46,125,79,.1);   border: 1px solid rgba(46,125,79,.2); }
.db-action-icon-wrap.blue       { background: rgba(26,111,163,.1);  border: 1px solid rgba(26,111,163,.2); }
.db-action-icon-wrap.navy-light { background: rgba(255,255,255,.08); border: 1px solid rgba(201,168,76,.2); }

.db-action-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--navy);
  line-height: 1;
}
.db-action-card.navy .db-action-title { color: #fff; }

.db-action-desc {
  font-size: 11px;
  color: var(--ivory);
  line-height: 1.5;
  flex: 1;
}
.db-action-card.navy .db-action-desc { color: rgba(226,204,138,.55); }

.db-action-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  font-size: 11px;
  font-weight: 700;
  color: var(--gold);
  letter-spacing: .5px;
}
.db-action-card.navy .db-action-cta { border-color: rgba(201,168,76,.15); }

/* ── ERROR BANNER ── */
.db-error {
  background: rgba(176,58,46,.08);
  border: 1px solid rgba(176,58,46,.25);
  border-radius: 10px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: var(--red);
  font-weight: 500;
  margin-bottom: 24px;
}

/* ── RECENT ORDERS TABLE ── */
.db-recent {
  background: var(--white);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  overflow: hidden;
  animation: dbFade .4s ease .1s both;
}
.db-recent-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid var(--border);
  gap: 12px;
  flex-wrap: wrap;
}
.db-recent-hdr h3 {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--navy);
}
.db-recent-hdr p { font-size: 11px; color: var(--ivory); }
.db-view-all {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 8px;
  background: var(--bg);
  border: 1.5px solid var(--border);
  font-size: 11px;
  font-weight: 700;
  color: var(--navy);
  text-decoration: none;
  transition: border-color .15s, box-shadow .15s;
}
.db-view-all:hover { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,168,76,.08); }

.db-table { width: 100%; border-collapse: collapse; }
.db-table th {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--ivory);
  padding: 10px 22px;
  text-align: left;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}
.db-table td {
  padding: 14px 22px;
  font-size: 12px;
  color: var(--navy);
  border-bottom: 1px solid rgba(229,224,213,.5);
  vertical-align: middle;
}
.db-table tr:last-child td { border-bottom: none; }
.db-table tr:hover td { background: rgba(201,168,76,.03); }

.db-td-id {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  color: var(--navy);
}
.db-td-name  { font-weight: 600; }
.db-td-amt   { font-weight: 700; }
.db-td-muted { color: var(--ivory); font-size: 11px; }

.db-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
}
.db-badge.placed    { background: rgba(26,111,163,.1);  color: #1A6FA3; border: 1px solid rgba(26,111,163,.25); }
.db-badge.Pending   { background: rgba(176,125,46,.1);  color: #B07D2E; border: 1px solid rgba(176,125,46,.25); }
.db-badge.Delivered { background: rgba(46,125,79,.1);   color: ${T.green}; border: 1px solid rgba(46,125,79,.25); }
.db-badge.Cancelled { background: rgba(176,58,46,.1);   color: ${T.red};   border: 1px solid rgba(176,58,46,.25); }

.db-empty-row td {
  text-align: center;
  padding: 48px;
  color: var(--ivory);
  font-size: 13px;
}

/* ── SPIN ── */
.db-spin {
  width: 24px; height: 24px;
  border: 2px solid var(--border);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin .7s linear infinite;
  margin: 0 auto;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── MOBILE ── */
@media (max-width: 768px) {
  .db-topbar { display: none; }
  .db-table th:nth-child(3),
  .db-table td:nth-child(3),
  .db-table th:nth-child(4),
  .db-table td:nth-child(4) { display: none; }
  .db-nav-badge { display: none; }
  .db-signout span:last-child { display: none; }
  .db-signout { padding: 6px 10px; }
}
`;

const STATUS_CONFIG = {
  placed:    { emoji: "📦", label: "Placed"    },
  Pending:   { emoji: "⏳", label: "Pending"   },
  Delivered: { emoji: "✅", label: "Delivered" },
  Cancelled: { emoji: "❌", label: "Cancelled" },
};

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  // FIX Bug 14: track Firestore errors so admin sees them
  const [error,    setError]    = useState(null);
  const navigate = useNavigate();

  // 🔥 Real-time products
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "products"),
      (snap) => { setProducts(snap.docs); },
      (err)  => { console.error("Products error:", err); setError("Failed to load products."); }
    );
    return () => unsub();
  }, []);

  // 🔥 Real-time orders
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "orders"),
      (snap) => {
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Orders error:", err);
        setError("Failed to load orders.");
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  // ── Derived stats ──────────────────────────────────────────────────────────

  // FIX Bug 8: Revenue = Delivered orders only (not all non-Cancelled)
  const revenue   = orders
    .filter((o) => o.status === "Delivered")
    .reduce((s, o) => s + (o.total ?? 0), 0);

  const delivered = orders.filter((o) => o.status === "Delivered").length;

  // FIX Bug 8 (cont): separate pending count for its own clear stat
  const pending   = orders.filter(
    (o) => o.status === "Pending" || o.status === "placed"
  ).length;

  const cancelled = orders.filter((o) => o.status === "Cancelled").length;

  // 5 most recent orders
  const recent = [...orders]
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
    .slice(0, 5);

  return (
    <>
      <style>{CSS}</style>

      {/* Topbar */}
      <div className="db-topbar">
        {[
          ["⚡", "Real-time", "data"],
          ["📦", "Orders",    orders.length],
          ["✅", "Delivered", delivered],
          // FIX Bug 8: show confirmed revenue (Delivered only)
          ["💰", "Revenue",   `₹${revenue.toLocaleString()}`],
        ].map(([ic, b, a]) => (
          <span key={b}>{ic} <b>{b}</b> {a}</span>
        ))}
      </div>

      {/* Navbar */}
      <nav className="db-nav">
        <div className="db-logo">
          <div className="db-logo-drop" />
          <div><h1>RichDrop</h1><p>Admin Panel</p></div>
        </div>
        <div className="db-nav-right">
          <div className="db-nav-badge">
            <div className="db-nav-dot" />
            <span>LIVE DASHBOARD</span>
          </div>
          <button className="db-signout" onClick={handleSignOut}>
            <span>🚪</span>
            <span>SIGN OUT</span>
          </button>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="db-bread">
        <span className="db-bread-cur">Admin Dashboard</span>
      </div>

      {/* Page */}
      <div className="db-page">

        {/* Header */}
        <div className="db-hdr">
          <h1>Admin Dashboard</h1>
          <p>Real-time overview of your RichDrop store</p>
        </div>

        {/* FIX Bug 14: show error banner if Firestore fails */}
        {error && (
          <div className="db-error">
            ⚠️ {error} — Check your Firestore connection or security rules.
          </div>
        )}

        {/* Stats */}
        <div className="db-section-label">Key Metrics</div>
        <div className="db-stats">
          {[
            {
              icon: "📦", val: products.length,
              key: "Total Products", cls: "gold",
              trend: "LIVE", trendCls: "live",
            },
            {
              icon: "🛒", val: orders.length,
              key: "Total Orders", cls: "blue",
              trend: "LIVE", trendCls: "live",
            },
            {
              icon: "✅", val: delivered,
              key: "Delivered", cls: "green",
              trend: "↑ Completed", trendCls: "up",
            },
            {
              // FIX Bug 8: revenue label clarifies it is confirmed (Delivered) revenue
              icon: "💰", val: `₹${revenue.toLocaleString()}`,
              key: "Confirmed Revenue", cls: "gold",
              trend: "↑ Net", trendCls: "up",
            },
          ].map((s, i) => (
            <div className="db-stat" key={s.key} style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="db-stat-top">
                <div className={`db-stat-icon ${s.cls}`}>{s.icon}</div>
                <div className={`db-stat-trend ${s.trendCls}`}>{s.trend}</div>
              </div>
              <div>
                <div className="db-stat-val">{s.val}</div>
                <div className="db-stat-key">{s.key}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Secondary stats row — pending & cancelled */}
        <div className="db-stats" style={{ gridTemplateColumns: "repeat(2,1fr)", marginTop: -18 }}>
          <div className="db-stat" style={{ animationDelay: ".28s" }}>
            <div className="db-stat-top">
              <div className="db-stat-icon gold">⏳</div>
              <div className="db-stat-trend live">LIVE</div>
            </div>
            <div>
              <div className="db-stat-val">{pending}</div>
              <div className="db-stat-key">Pending / Placed</div>
            </div>
          </div>
          <div className="db-stat" style={{ animationDelay: ".35s" }}>
            <div className="db-stat-top">
              <div className="db-stat-icon red">❌</div>
              <div className="db-stat-trend warn">↓ Lost</div>
            </div>
            <div>
              <div className="db-stat-val">{cancelled}</div>
              <div className="db-stat-key">Cancelled</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="db-section-label">Quick Actions</div>
        <div className="db-actions">

          <Link to="/product-management" className="db-action-card" style={{ animationDelay: ".05s" }}>
            <div className="db-action-icon-wrap gold">🛠</div>
            <div>
              <div className="db-action-title">Manage Products</div>
              <div className="db-action-desc">Add, edit or remove products from your store catalogue.</div>
            </div>
            <div className="db-action-cta">
              <span>GO TO PRODUCTS</span>
              <span>→</span>
            </div>
          </Link>

          <Link to="/admin-orders" className="db-action-card" style={{ animationDelay: ".1s" }}>
            <div className="db-action-icon-wrap green">📦</div>
            <div>
              <div className="db-action-title">Manage Orders</div>
              <div className="db-action-desc">View all orders, update statuses and track deliveries.</div>
            </div>
            <div className="db-action-cta">
              <span>GO TO ORDERS</span>
              <span>→</span>
            </div>
          </Link>

          {/*
            FIX Bug 10: Replaced the useless "Dashboard Home → /admin" self-link
            with a useful "Add Product" shortcut that actually saves the admin a
            navigation step.
          */}
          <Link to="/add-product" className="db-action-card navy" style={{ animationDelay: ".15s" }}>
            <div className="db-action-icon-wrap navy-light">➕</div>
            <div>
              <div className="db-action-title">Add Product</div>
              <div className="db-action-desc">Quickly list a new product to the store catalogue.</div>
            </div>
            <div className="db-action-cta">
              <span>ADD NEW</span>
              <span>→</span>
            </div>
          </Link>

        </div>

        {/* Recent Orders */}
        <div className="db-section-label">Recent Orders</div>
        <div className="db-recent">
          <div className="db-recent-hdr">
            <div>
              <h3>Latest Orders</h3>
              <p>Most recent {Math.min(5, orders.length)} of {orders.length} total orders</p>
            </div>
            <Link to="/admin-orders" className="db-view-all">View All →</Link>
          </div>

          {loading ? (
            <div style={{ padding: 48 }}><div className="db-spin" /></div>
          ) : (
            <table className="db-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr className="db-empty-row">
                    <td colSpan={6}>No orders yet. They'll appear here in real time.</td>
                  </tr>
                ) : recent.map((order) => {
                  const addr = order.address ?? {};
                  const cfg  = STATUS_CONFIG[order.status] ?? { emoji: "•", label: order.status ?? "—" };
                  return (
                    <tr key={order.id}>
                      <td>
                        <span className="db-td-id">#{order.id.slice(0, 8).toUpperCase()}</span>
                      </td>
                      <td>
                        <div className="db-td-name">
                          {addr.firstName ?? ""} {addr.lastName ?? ""}
                        </div>
                        <div className="db-td-muted">{addr.city ?? "—"}</div>
                      </td>
                      <td>
                        <span className="db-td-muted">
                          {(order.items ?? []).length} item{(order.items ?? []).length !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td>
                        <span className="db-td-muted">
                          {order.createdAt?.toDate
                            ? order.createdAt.toDate().toLocaleDateString("en-IN", {
                                day: "numeric", month: "short", year: "numeric",
                              })
                            : "—"}
                        </span>
                      </td>
                      <td>
                        <span className="db-td-amt">₹{(order.total ?? 0).toLocaleString()}</span>
                      </td>
                      <td>
                        <span className={`db-badge ${order.status}`}>
                          {cfg.emoji} {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </>
  );
}