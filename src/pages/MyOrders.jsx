import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

// ── Design Tokens (matches Checkout / RichDrop system) ─────────────────────
const T = {
  navy:   "#0F1C2A",
  navy2:  "#1A2E42",
  gold:   "#C9A84C",
  goldL:  "#E2CC8A",
  bg:     "#F7F5F0",
  white:  "#FFFFFF",
  ivory:  "#8A7A60",
  border: "#E5E0D5",
  blue:   "#1A6FA3",
  green:  "#2E7D4F",
  red:    "#B03A2E",
  yellow: "#B45309",
};

// ── CSS ────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --navy: ${T.navy}; --navy2: ${T.navy2};
  --gold: ${T.gold}; --goldL: ${T.goldL};
  --bg: ${T.bg}; --white: ${T.white};
  --ivory: ${T.ivory}; --border: ${T.border};
  --blue: ${T.blue}; --green: ${T.green};
  --red: ${T.red};
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
img { display: block; }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

/* ── TOPBAR ── */
.mo-topbar {
  background: var(--navy);
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
}
.mo-topbar span {
  font-size: 10px;
  color: rgba(226,204,138,.7);
  letter-spacing: .5px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.mo-topbar b { color: var(--goldL); font-weight: 600; }

/* ── NAVBAR ── */
.mo-nav {
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
.mo-logo {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-shrink: 0;
  text-decoration: none;
}
.mo-logo-drop {
  width: 22px;
  height: 28px;
  background: linear-gradient(160deg, #B8E0F7, #1A6FA3);
  border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
  position: relative;
}
.mo-logo-drop::after {
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
.mo-logo h1 {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2px;
  line-height: 1;
}
.mo-logo p {
  font-size: 7px;
  color: var(--gold);
  letter-spacing: 2.5px;
  text-transform: uppercase;
  margin-top: 2px;
}
.mo-nav-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
}
.mo-nav-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 6px 10px;
  border-radius: 8px;
  color: rgba(255,255,255,.75);
  text-decoration: none;
  transition: background .15s;
}
.mo-nav-btn:hover { background: rgba(255,255,255,.06); color: #fff; }
.mo-nav-btn .lbl { font-size: 9px; font-weight: 500; }

/* ── BREADCRUMB ── */
.mo-bread {
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
.mo-bread a { color: var(--ivory); transition: color .15s; }
.mo-bread a:hover { color: var(--navy); }
.mo-bread-sep { color: var(--border); }
.mo-bread-cur { color: var(--navy); font-weight: 600; }

/* ── PAGE ── */
.mo-page {
  max-width: 860px;
  margin: 0 auto;
  padding: 28px 24px 100px;
  animation: moFade .35s ease;
}
@keyframes moFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

/* ── PAGE HEADER ── */
.mo-hdr {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 10px;
}
.mo-hdr-left h1 {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  color: var(--navy);
  line-height: 1;
  margin-bottom: 4px;
}
.mo-hdr-left p { font-size: 12px; color: var(--ivory); }
.mo-back {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 9px;
  background: var(--white);
  border: 1.5px solid var(--border);
  font-size: 11px;
  font-weight: 600;
  color: var(--navy);
  text-decoration: none;
  transition: border-color .15s, box-shadow .15s;
  cursor: pointer;
}
.mo-back:hover { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,168,76,.08); }

/* ── ORDER CARD ── */
.mo-orders { display: flex; flex-direction: column; gap: 20px; }

.mo-card {
  background: var(--white);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  overflow: hidden;
  animation: moFade .35s ease both;
}

/* Card header — navy like the summary panel */
.mo-card-hdr {
  background: var(--navy);
  padding: 16px 20px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  border-bottom: 1px solid rgba(201,168,76,.12);
}

.mo-order-id-label {
  font-size: 9px;
  font-weight: 700;
  color: rgba(226,204,138,.5);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 3px;
}
.mo-order-id-val {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
}

.mo-card-hdr-right {
  text-align: right;
}
.mo-total {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
  margin-bottom: 3px;
}
.mo-date {
  font-size: 10px;
  color: rgba(226,204,138,.5);
}

/* ── STATUS BADGE ── */
.mo-status-row {
  padding: 10px 20px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 8px;
}
.mo-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.mo-status-text {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .4px;
}
.mo-status-label { font-size: 11px; color: var(--ivory); }

/* Status colours */
.mo-status--Delivered .mo-status-dot  { background: ${T.green}; }
.mo-status--Delivered .mo-status-text { color: ${T.green}; }
.mo-status--Pending   .mo-status-dot  { background: ${T.yellow}; }
.mo-status--Pending   .mo-status-text { color: ${T.yellow}; }
.mo-status--Placed    .mo-status-dot  { background: ${T.blue}; }
.mo-status--Placed    .mo-status-text { color: ${T.blue}; }
.mo-status--Cancelled .mo-status-dot  { background: ${T.red}; }
.mo-status--Cancelled .mo-status-text { color: ${T.red}; }
.mo-status--default   .mo-status-dot  { background: ${T.blue}; }
.mo-status--default   .mo-status-text { color: ${T.blue}; }

/* ── ITEMS ── */
.mo-items { padding: 4px 0; }
.mo-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(201,168,76,.08);
}
.mo-item:last-child { border-bottom: none; }

.mo-item-img {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.mo-item-img img { width: 56px; height: 56px; object-fit: contain; }
.mo-item-fallback { font-size: 22px; opacity: .35; }

.mo-item-body { flex: 1; min-width: 0; }
.mo-item-name {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--navy);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
  margin-bottom: 3px;
}
.mo-item-meta { font-size: 11px; color: var(--ivory); }

.mo-item-price {
  font-size: 14px;
  font-weight: 700;
  color: var(--navy);
  white-space: nowrap;
}

/* ── CARD FOOTER ── */
.mo-card-footer {
  padding: 12px 20px;
  background: rgba(201,168,76,.04);
  border-top: 1px solid rgba(201,168,76,.12);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
.mo-trust-row { display: flex; gap: 6px; flex-wrap: wrap; }
.mo-trust-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(255,255,255,.7);
  border: 1px solid var(--border);
  font-size: 9px;
  color: var(--ivory);
}
.mo-item-count {
  font-size: 11px;
  color: var(--ivory);
  font-weight: 600;
}

/* ── SPIN ── */
.mo-spin-wrap {
  padding: 80px;
  display: flex;
  justify-content: center;
}
.mo-spin {
  width: 28px; height: 28px;
  border: 2.5px solid var(--border);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── EMPTY ── */
.mo-empty {
  background: var(--white);
  border-radius: 20px;
  border: 1px solid var(--border);
  padding: 64px 32px;
  text-align: center;
  box-shadow: var(--shadow);
}
.mo-empty-drop {
  width: 80px;
  height: 100px;
  background: linear-gradient(170deg, #E8F6FF 0%, #5BB8E8 50%, #1A6FA3 100%);
  border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
  margin: 0 auto 20px;
  opacity: .35;
  animation: floatDrop 3s ease-in-out infinite;
}
@keyframes floatDrop {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}
.mo-empty h3 {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  color: var(--navy);
  margin-bottom: 8px;
}
.mo-empty p { font-size: 13px; color: var(--ivory); margin-bottom: 24px; }
.mo-empty-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: var(--navy);
  color: var(--gold);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-decoration: none;
  transition: opacity .15s, transform .15s;
}
.mo-empty-cta:hover { opacity: .88; transform: translateY(-2px); }

/* ── MOBILE BOTTOM NAV ── */
.mo-bnav {
  display: none;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: var(--white);
  border-top: 1px solid var(--border);
  padding: 5px 0 env(safe-area-inset-bottom, 8px);
  z-index: 100;
  justify-content: space-around;
}
@media (max-width: 768px) {
  .mo-bnav { display: flex; }
  .mo-page { padding-bottom: 100px; }
  .mo-topbar { display: none; }
}
.mo-nav-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-decoration: none;
  padding: 4px;
}
.mo-nav-tab .ti { font-size: 19px; }
.mo-nav-tab-lbl { font-size: 9px; color: #C0B8A8; font-weight: 500; }
.mo-nav-tab.active .mo-nav-tab-lbl { color: var(--navy); font-weight: 700; }
.mo-nav-bar { width: 16px; height: 2px; background: var(--gold); border-radius: 2px; }
`;

// ── Helpers ───────────────────────────────────────────────────────────────
const getStatusClass = (status) => {
  const map = { Delivered: "Delivered", Pending: "Pending", Cancelled: "Cancelled", Placed: "Placed" };
  return map[status] || "default";
};

const getStatusLabel = (status) => status || "Placed";

// ── Component ─────────────────────────────────────────────────────────────
export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else navigate("/login");
    });
    return () => unsub();
  }, []);

  // Real-time orders
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <nav className="mo-nav">
          <Link to="/" className="mo-logo">
            <div className="mo-logo-drop" />
            <div><h1>RichDrop</h1><p>Pure Water Solutions</p></div>
          </Link>
        </nav>
        <div className="mo-page">
          <div className="mo-spin-wrap"><div className="mo-spin" /></div>
        </div>
      </>
    );
  }

  // ── Empty ──────────────────────────────────────────────────────────────
  if (orders.length === 0) {
    return (
      <>
        <style>{CSS}</style>

        <div className="mo-topbar">
          {[["⚡","Same-day","service"],["🚚","Free delivery","₹999+"],["✅","ISI","Certified"],["🎧","24/7","Support"]].map(([ic,b,a])=>(
            <span key={b}>{ic} <b>{b}</b> {a}</span>
          ))}
        </div>

        <nav className="mo-nav">
          <Link to="/" className="mo-logo">
            <div className="mo-logo-drop" />
            <div><h1>RichDrop</h1><p>Pure Water Solutions</p></div>
          </Link>
          <div className="mo-nav-right">
            <Link to="/user" className="mo-nav-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span className="lbl">Home</span>
            </Link>
            <Link to="/cart" className="mo-nav-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.96-1.58l1.54-6.42H6"/>
              </svg>
              <span className="lbl">Cart</span>
            </Link>
          </div>
        </nav>

        <div className="mo-page">
          <div className="mo-empty">
            <div className="mo-empty-drop" />
            <h3>No orders yet</h3>
            <p>You haven't placed any orders with us. Start shopping to see your orders here.</p>
            <Link to="/user" className="mo-empty-cta">Shop Products →</Link>
          </div>
        </div>
      </>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>

      {/* Topbar */}
      <div className="mo-topbar">
        {[["⚡","Same-day","service"],["🚚","Free delivery","₹999+"],["✅","ISI","Certified"],["🎧","24/7","Support"]].map(([ic,b,a])=>(
          <span key={b}>{ic} <b>{b}</b> {a}</span>
        ))}
      </div>

      {/* Navbar */}
      <nav className="mo-nav">
        <Link to="/" className="mo-logo">
          <div className="mo-logo-drop" />
          <div><h1>RichDrop</h1><p>Pure Water Solutions</p></div>
        </Link>
        <div className="mo-nav-right">
          <Link to="/user" className="mo-nav-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span className="lbl">Home</span>
          </Link>
          <Link to="/cart" className="mo-nav-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.96-1.58l1.54-6.42H6"/>
            </svg>
            <span className="lbl">Cart</span>
          </Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="mo-bread">
        <Link to="/user">Home</Link>
        <span className="mo-bread-sep">›</span>
        <span className="mo-bread-cur">My Orders</span>
      </div>

      {/* Page */}
      <div className="mo-page">

        {/* Header */}
        <div className="mo-hdr">
          <div className="mo-hdr-left">
            <h1>My Orders</h1>
            <p>{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
          </div>
          <button className="mo-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>

        {/* Orders list */}
        <div className="mo-orders">
          {orders.map((order, i) => {
            const statusClass = getStatusClass(order.status);
            const statusLabel = getStatusLabel(order.status);
            const itemCount   = (order.items || []).reduce((s, it) => s + (it.quantity ?? 1), 0);

            return (
              <div
                key={order.id}
                className="mo-card"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {/* Card header — navy strip */}
                <div className="mo-card-hdr">
                  <div>
                    <div className="mo-order-id-label">Order ID</div>
                    <div className="mo-order-id-val">#{order.id.slice(0, 10).toUpperCase()}</div>
                  </div>
                  <div className="mo-card-hdr-right">
                    <div className="mo-total">₹{(order.total ?? 0).toLocaleString()}</div>
                    <div className="mo-date">
                      {order.createdAt?.toDate
                        ? order.createdAt.toDate().toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Just now"}
                    </div>
                  </div>
                </div>

                {/* Status bar */}
                <div className={`mo-status-row mo-status--${statusClass}`}>
                  <div className="mo-status-dot" />
                  <span className="mo-status-label">Status:</span>
                  <span className="mo-status-text">{statusLabel}</span>
                </div>

                {/* Items */}
                <div className="mo-items">
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} className="mo-item">
                      <div className="mo-item-img">
                        {item.image
                          ? <img src={item.image} alt={item.name} />
                          : <div className="mo-item-fallback">💧</div>
                        }
                      </div>
                      <div className="mo-item-body">
                        <div className="mo-item-name">{item.name ?? "Product"}</div>
                        <div className="mo-item-meta">
                          ₹{item.price ?? 0} × {item.quantity ?? 1}
                        </div>
                      </div>
                      <div className="mo-item-price">
                        ₹{((item.price ?? 0) * (item.quantity ?? 1)).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card footer */}
                <div className="mo-card-footer">
                  <div className="mo-trust-row">
                    {[["🔒","Secure"],["🚚","Tracked"],["🔄","Returnable"]].map(([ic, tx]) => (
                      <div key={tx} className="mo-trust-pill">{ic} {tx}</div>
                    ))}
                  </div>
                  <div className="mo-item-count">
                    {itemCount} item{itemCount !== 1 ? "s" : ""}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="mo-bnav">
        {[
          { label: "Home",    icon: "🏠", to: "/user" },
          { label: "Search",  icon: "🔍", to: "/products" },
          { label: "Cart",    icon: "🛒", to: "/cart" },
          { label: "Orders",  icon: "📦", to: "/orders", active: true },
          { label: "Profile", icon: "👤", to: "/profile" },
        ].map((t) => (
          <Link key={t.label} to={t.to} className={`mo-nav-tab ${t.active ? "active" : ""}`}>
            <div className="ti">{t.icon}</div>
            <div className="mo-nav-tab-lbl">{t.label}</div>
            {t.active && <div className="mo-nav-bar" />}
          </Link>
        ))}
      </nav>
    </>
  );
}