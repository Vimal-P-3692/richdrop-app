import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";

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
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --navy: #0F1C2A; --navy2: #1A2E42;
  --gold: #C9A84C; --goldL: #E2CC8A;
  --bg: #F7F5F0; --white: #FFFFFF;
  --ivory: #8A7A60; --border: #E5E0D5;
  --blue: #1A6FA3; --green: #2E7D4F; --red: #B03A2E;
  --font-display: 'Cormorant Garamond', serif;
  --font-body: 'Outfit', sans-serif;
  --radius: 14px;
  --shadow: 0 4px 20px rgba(15,28,42,.08);
  --shadow-md: 0 8px 32px rgba(15,28,42,.12);
}
html { scroll-behavior: smooth; }
body { font-family: var(--font-body); background: var(--bg); color: var(--navy); -webkit-font-smoothing: antialiased; }
a { text-decoration: none; color: inherit; }
button { font-family: var(--font-body); cursor: pointer; border: none; background: none; }
img { display: block; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

.ad-topbar {
  background: var(--navy); height: 34px;
  display: flex; align-items: center; justify-content: center; gap: 32px;
}
.ad-topbar span { font-size: 10px; color: rgba(226,204,138,.7); letter-spacing: .5px; display: flex; align-items: center; gap: 5px; }
.ad-topbar b { color: var(--goldL); font-weight: 600; }

.ad-nav {
  background: var(--navy); height: 60px;
  display: flex; align-items: center; padding: 0 24px; gap: 16px;
  position: sticky; top: 0; z-index: 100;
  border-bottom: 1px solid rgba(201,168,76,.12);
}
.ad-logo { display: flex; align-items: center; gap: 9px; flex-shrink: 0; }
.ad-logo-drop {
  width: 22px; height: 28px;
  background: linear-gradient(160deg, #B8E0F7, #1A6FA3);
  border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
  position: relative;
}
.ad-logo-drop::after {
  content: ''; position: absolute; top: -4px; left: 50%; transform: translateX(-50%);
  width: 5px; height: 5px; background: var(--gold); border-radius: 50%;
}
.ad-logo h1 { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: #fff; letter-spacing: 2px; line-height: 1; }
.ad-logo p  { font-size: 7px; color: var(--gold); letter-spacing: 2.5px; text-transform: uppercase; margin-top: 2px; }
.ad-nav-badge {
  margin-left: auto; display: flex; align-items: center; gap: 8px;
  padding: 5px 14px 5px 10px; border-radius: 20px;
  background: rgba(201,168,76,.1); border: 1px solid rgba(201,168,76,.25);
}
.ad-nav-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--gold); animation: pulseDot 2s ease-in-out infinite; }
@keyframes pulseDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.5; transform:scale(.7); } }
.ad-nav-badge span { font-size: 11px; font-weight: 600; color: var(--goldL); letter-spacing: .5px; }

.ad-bread {
  background: var(--white); border-bottom: 1px solid var(--border);
  padding: 0 24px; height: 38px; display: flex; align-items: center; gap: 6px;
  font-size: 11px; color: var(--ivory);
}
.ad-bread a { color: var(--ivory); transition: color .15s; }
.ad-bread a:hover { color: var(--navy); }
.ad-bread-sep { color: var(--border); }
.ad-bread-cur { color: var(--navy); font-weight: 600; }

.ad-page { max-width: 1200px; margin: 0 auto; padding: 28px 24px 80px; animation: adFade .35s ease; }
@keyframes adFade { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }

.ad-hdr { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.ad-hdr-left h1 { font-family: var(--font-display); font-size: 36px; font-weight: 700; color: var(--navy); line-height: 1; margin-bottom: 5px; }
.ad-hdr-left p { font-size: 12px; color: var(--ivory); }

.ad-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 24px; }
@media (max-width:800px) { .ad-stats { grid-template-columns: 1fr 1fr; } }
@media (max-width:500px) { .ad-stats { grid-template-columns: 1fr; } }
.ad-stat {
  background: var(--white); border-radius: var(--radius); border: 1px solid var(--border);
  box-shadow: var(--shadow); padding: 18px 20px; display: flex; align-items: center; gap: 14px;
  animation: adFade .35s ease both;
}
.ad-stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.ad-stat-icon.gold  { background: rgba(201,168,76,.1);  border: 1px solid rgba(201,168,76,.2); }
.ad-stat-icon.green { background: rgba(46,125,79,.1);   border: 1px solid rgba(46,125,79,.2); }
.ad-stat-icon.blue  { background: rgba(26,111,163,.1);  border: 1px solid rgba(26,111,163,.2); }
.ad-stat-icon.red   { background: rgba(176,58,46,.1);   border: 1px solid rgba(176,58,46,.2); }
.ad-stat-val { font-family: var(--font-display); font-size: 26px; font-weight: 700; color: var(--navy); line-height: 1; }
.ad-stat-key { font-size: 10px; color: var(--ivory); font-weight: 600; letter-spacing: .4px; margin-top: 3px; }

.ad-filters { display: flex; gap: 6px; margin-bottom: 18px; flex-wrap: wrap; }
.ad-filter-tab {
  padding: 7px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: .4px;
  border: 1.5px solid var(--border); background: var(--white); color: var(--ivory);
  cursor: pointer; transition: all .15s;
}
.ad-filter-tab:hover { border-color: rgba(201,168,76,.4); color: var(--navy); }
.ad-filter-tab.active { background: var(--navy); color: var(--gold); border-color: var(--navy); }

.ad-orders { display: flex; flex-direction: column; gap: 16px; }

.ad-card {
  background: var(--white); border-radius: var(--radius); border: 1px solid var(--border);
  box-shadow: var(--shadow); overflow: hidden; animation: adFade .3s ease both; transition: box-shadow .2s;
}
.ad-card:hover { box-shadow: var(--shadow-md); }

.ad-card-hdr {
  display: flex; align-items: center; gap: 14px; padding: 16px 20px;
  border-bottom: 1px solid var(--border); flex-wrap: wrap;
}
.ad-card-id { font-family: var(--font-display); font-size: 17px; font-weight: 700; color: var(--navy); letter-spacing: .5px; }
.ad-card-uid {
  font-size: 10px; color: var(--ivory); background: var(--bg); border: 1px solid var(--border);
  border-radius: 6px; padding: 3px 9px; font-weight: 500; max-width: 200px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ad-card-time { font-size: 10px; color: var(--ivory); margin-left: auto; white-space: nowrap; }
.ad-card-total { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--navy); white-space: nowrap; }

.ad-status { display: inline-flex; align-items: center; gap: 5px; padding: 4px 11px; border-radius: 20px; font-size: 10px; font-weight: 700; letter-spacing: .5px; white-space: nowrap; }
.ad-status.placed    { background: rgba(26,111,163,.1);  color: #1A6FA3;  border: 1px solid rgba(26,111,163,.25); }
.ad-status.Pending   { background: rgba(176,125,46,.1);  color: #B07D2E;  border: 1px solid rgba(176,125,46,.25); }
.ad-status.Delivered { background: rgba(46,125,79,.1);   color: #2E7D4F;  border: 1px solid rgba(46,125,79,.25); }
.ad-status.Cancelled { background: rgba(176,58,46,.1);   color: #B03A2E;  border: 1px solid rgba(176,58,46,.25); }
.ad-status-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

.ad-card-body { display: grid; grid-template-columns: 1fr auto; gap: 0; }
@media (max-width:700px) { .ad-card-body { grid-template-columns: 1fr; } }

.ad-items { padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; border-right: 1px solid var(--border); }
@media (max-width:700px) { .ad-items { border-right: none; border-bottom: 1px solid var(--border); } }

.ad-item {
  display: flex; align-items: center; gap: 12px; padding: 10px 12px;
  border-radius: 10px; border: 1px solid var(--border); background: var(--bg); transition: border-color .15s;
}
.ad-item:hover { border-color: rgba(201,168,76,.3); }
.ad-item-img {
  width: 48px; height: 48px; border-radius: 8px; border: 1px solid var(--border);
  background: var(--white); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;
}
.ad-item-img img { width: 48px; height: 48px; object-fit: contain; }
.ad-item-fallback { font-size: 22px; opacity: .4; }
.ad-item-info { flex: 1; min-width: 0; }
.ad-item-name { font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--navy); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ad-item-sub { font-size: 10px; color: var(--ivory); margin-top: 2px; }
.ad-item-price { font-size: 13px; font-weight: 700; color: var(--navy); white-space: nowrap; }

.ad-card-right { width: 280px; display: flex; flex-direction: column; flex-shrink: 0; }
@media (max-width:700px) { .ad-card-right { width: 100%; } }

.ad-addr { padding: 16px 18px; border-bottom: 1px solid var(--border); flex: 1; }
.ad-addr-lbl { font-size: 9px; font-weight: 700; letter-spacing: 1px; color: var(--ivory); text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 5px; }
.ad-addr-name { font-size: 13px; font-weight: 700; color: var(--navy); margin-bottom: 3px; }
.ad-addr-line { font-size: 11px; color: var(--ivory); line-height: 1.6; }
.ad-addr-phone { display: inline-flex; align-items: center; gap: 4px; margin-top: 6px; font-size: 11px; font-weight: 600; color: var(--navy); background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: 3px 9px; }

.ad-delivery-row { padding: 8px 18px 14px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.ad-delivery-pill { display: flex; align-items: center; gap: 4px; font-size: 9px; color: var(--ivory); background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 3px 9px; font-weight: 600; }
.ad-delivery-pill.free { color: #2E7D4F; border-color: rgba(46,125,79,.25); background: rgba(46,125,79,.06); }

.ad-actions { padding: 14px 18px; display: flex; flex-direction: column; gap: 8px; }
.ad-actions-lbl { font-size: 9px; font-weight: 700; letter-spacing: 1px; color: var(--ivory); text-transform: uppercase; margin-bottom: 2px; }
.ad-btn-row { display: flex; gap: 6px; }
.ad-btn {
  flex: 1; height: 34px; border-radius: 8px; font-size: 10px; font-weight: 700; letter-spacing: .8px;
  display: flex; align-items: center; justify-content: center; gap: 4px;
  cursor: pointer; border: 1.5px solid transparent; transition: opacity .15s, transform .15s, box-shadow .15s;
  font-family: var(--font-body);
}
.ad-btn:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
.ad-btn:disabled { opacity: .4; cursor: not-allowed; transform: none; }
.ad-btn.pending   { background: rgba(176,125,46,.1); color: #B07D2E; border-color: rgba(176,125,46,.3); }
.ad-btn.delivered { background: rgba(46,125,79,.1);  color: #2E7D4F; border-color: rgba(46,125,79,.3); }
.ad-btn.cancelled { background: rgba(176,58,46,.08); color: #B03A2E; border-color: rgba(176,58,46,.2); }
.ad-btn.active-status { opacity: .35; cursor: default; pointer-events: none; }

.ad-search-wrap { position: relative; max-width: 320px; }
.ad-search {
  width: 100%; height: 38px; border: 1.5px solid var(--border); border-radius: 10px;
  padding: 0 12px 0 36px; font-size: 12px; font-family: var(--font-body); color: var(--navy);
  background: var(--white); outline: none; transition: border-color .15s, box-shadow .15s;
}
.ad-search::placeholder { color: var(--ivory); }
.ad-search:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,168,76,.08); }
.ad-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--ivory); pointer-events: none; }

.ad-empty { background: var(--white); border-radius: 20px; border: 1px solid var(--border); padding: 64px 32px; text-align: center; box-shadow: var(--shadow); }
.ad-empty-drop { width: 80px; height: 100px; background: linear-gradient(170deg,#E8F6FF 0%,#5BB8E8 50%,#1A6FA3 100%); border-radius: 50% 50% 50% 50%/40% 40% 60% 60%; margin: 0 auto 20px; opacity: .3; animation: floatDrop 3s ease-in-out infinite; }
@keyframes floatDrop { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
.ad-empty h3 { font-family: var(--font-display); font-size: 26px; font-weight: 700; color: var(--navy); margin-bottom: 8px; }
.ad-empty p { font-size: 13px; color: var(--ivory); }

.ad-spin-wrap { padding: 80px; display: flex; justify-content: center; }
.ad-spin { width: 28px; height: 28px; border: 2.5px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }

.ad-toast {
  position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(20px);
  background: var(--navy); color: #fff; padding: 10px 20px; border-radius: 25px;
  font-size: 13px; font-weight: 500; border: 1px solid rgba(201,168,76,.3);
  box-shadow: 0 8px 28px rgba(0,0,0,.25); z-index: 999; white-space: nowrap;
  opacity: 0; transition: opacity .25s, transform .25s; pointer-events: none;
}
.ad-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

@media (max-width:768px) {
  .ad-topbar { display: none; }
  .ad-page { padding-bottom: 40px; }
  .ad-card-time { display: none; }
}
`;

const STATUS_CONFIG = {
  placed:    { label: "Placed",    emoji: "📦" },
  Pending:   { label: "Pending",   emoji: "⏳" },
  Delivered: { label: "Delivered", emoji: "✅" },
  Cancelled: { label: "Cancelled", emoji: "❌" },
};

const ALL_FILTERS = ["All", "placed", "Pending", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("All");
  const [search,   setSearch]   = useState("");
  const [toast,    setToast]    = useState({ show: false, msg: "" });
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2500);
  };

  const updateStatus = async (id, status) => {
    setUpdating(id + status);
    try {
      await updateDoc(doc(db, "orders", id), { status });
      showToast(`✅ Order updated to "${status}"`);
    } catch (err) {
      showToast("❌ " + err.message);
    } finally {
      setUpdating(null);
    }
  };

  const total     = orders.length;
  const delivered = orders.filter((o) => o.status === "Delivered").length;
  const pending   = orders.filter((o) => o.status === "Pending" || o.status === "placed").length;
  const revenue   = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((s, o) => s + (o.total ?? 0), 0);

  const visible = orders
    .filter((o) => filter === "All" || o.status === filter)
    .filter((o) => {
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        o.id.toLowerCase().includes(s) ||
        o.userId?.toLowerCase().includes(s) ||
        `${o.address?.firstName ?? ""} ${o.address?.lastName ?? ""}`.toLowerCase().includes(s) ||
        o.address?.city?.toLowerCase().includes(s)
      );
    });

  return (
    <>
      <style>{CSS}</style>

      <div className="ad-topbar">
        {[["⚡","Real-time","updates"],["📦","Total",total],["✅","Delivered",delivered],["🎧","24/7","Support"]].map(([ic,b,a])=>(
          <span key={b}>{ic} <b>{b}</b> {a}</span>
        ))}
      </div>

      <nav className="ad-nav">
        <div className="ad-logo">
          <div className="ad-logo-drop" />
          <div><h1>RichDrop</h1><p>Admin Panel</p></div>
        </div>
        <div className="ad-nav-badge">
          <div className="ad-nav-badge-dot" />
          <span>LIVE — {total} Orders</span>
        </div>
      </nav>

      <div className="ad-bread">
        <a href="/admin">Admin</a>
        <span className="ad-bread-sep">›</span>
        <span className="ad-bread-cur">Orders</span>
      </div>

      <div className="ad-page">

        <div className="ad-hdr">
          <div className="ad-hdr-left">
            <h1>All Orders</h1>
            <p>Manage and update customer orders in real time</p>
          </div>
          <div className="ad-search-wrap">
            <svg className="ad-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="ad-search"
              placeholder="Search by order ID, name, city…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="ad-stats">
          {[
            { icon: "📦", val: total,                          key: "TOTAL ORDERS", cls: "gold"  },
            { icon: "✅", val: delivered,                      key: "DELIVERED",    cls: "green" },
            { icon: "⏳", val: pending,                        key: "PENDING",      cls: "blue"  },
            { icon: "💰", val: `₹${revenue.toLocaleString()}`, key: "REVENUE",      cls: "gold"  },
          ].map((s, i) => (
            <div className="ad-stat" key={s.key} style={{ animationDelay: `${i * .06}s` }}>
              <div className={`ad-stat-icon ${s.cls}`}>{s.icon}</div>
              <div>
                <div className="ad-stat-val">{s.val}</div>
                <div className="ad-stat-key">{s.key}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="ad-filters">
          {ALL_FILTERS.map((f) => (
            <button
              key={f}
              className={`ad-filter-tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "All"
                ? `All (${total})`
                : `${STATUS_CONFIG[f]?.emoji ?? ""} ${f} (${orders.filter((o) => o.status === f).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="ad-spin-wrap"><div className="ad-spin" /></div>
        ) : visible.length === 0 ? (
          <div className="ad-empty">
            <div className="ad-empty-drop" />
            <h3>No orders found</h3>
            <p>{search ? "Try a different search term." : "Orders will appear here in real time."}</p>
          </div>
        ) : (
          <div className="ad-orders">
            {visible.map((order, idx) => {
              const addr = order.address ?? {};
              const cfg  = STATUS_CONFIG[order.status] ?? { label: order.status, emoji: "•" };
              const isFree = (order.delivery ?? 99) === 0;

              return (
                <div className="ad-card" key={order.id} style={{ animationDelay: `${idx * .04}s` }}>

                  <div className="ad-card-hdr">
                    <div className="ad-card-id">#{order.id.slice(0, 8).toUpperCase()}</div>
                    <div className="ad-card-uid">{order.userId ?? "—"}</div>
                    <div className={`ad-status ${order.status}`}>
                      <div className="ad-status-dot" />
                      {cfg.emoji} {cfg.label}
                    </div>
                    <div className="ad-card-time">
                      {order.createdAt?.toDate
                        ? order.createdAt.toDate().toLocaleString("en-IN", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })
                        : "—"}
                    </div>
                    <div className="ad-card-total">₹{(order.total ?? 0).toLocaleString()}</div>
                  </div>

                  <div className="ad-card-body">

                    <div className="ad-items">
                      {(order.items ?? []).map((item, i) => (
                        <div key={i} className="ad-item">
                          <div className="ad-item-img">
                            {item.image
                              ? <img src={item.image} alt={item.name} />
                              : <div className="ad-item-fallback">💧</div>}
                          </div>
                          <div className="ad-item-info">
                            <div className="ad-item-name">{item.name ?? "Product"}</div>
                            <div className="ad-item-sub">₹{(item.price ?? 0).toLocaleString()} × {item.quantity ?? 1}</div>
                          </div>
                          <div className="ad-item-price">₹{((item.price ?? 0) * (item.quantity ?? 1)).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>

                    <div className="ad-card-right">
                      <div className="ad-addr">
                        <div className="ad-addr-lbl">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          Delivery Address
                        </div>
                        <div className="ad-addr-name">{addr.firstName ?? ""} {addr.lastName ?? ""}</div>
                        <div className="ad-addr-line">
                          {[addr.address, addr.landmark, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
                        </div>
                        {addr.phone && <div className="ad-addr-phone">📞 {addr.phone}</div>}
                      </div>

                      <div className="ad-delivery-row">
                        <div className={`ad-delivery-pill ${isFree ? "free" : ""}`}>
                          🚚 {isFree ? "FREE delivery" : `₹${order.delivery} delivery`}
                        </div>
                        <div className="ad-delivery-pill">
                          💵 {order.payment === "cod" ? "Cash on Delivery" : (order.payment ?? "COD")}
                        </div>
                      </div>

                      <div className="ad-actions">
                        <div className="ad-actions-lbl">Update Status</div>
                        <div className="ad-btn-row">
                          <button
                            className={`ad-btn pending ${order.status === "Pending" ? "active-status" : ""}`}
                            onClick={() => updateStatus(order.id, "Pending")}
                            disabled={!!updating}
                          >
                            {updating === order.id + "Pending" ? "…" : "⏳"} Pending
                          </button>
                        </div>
                        <div className="ad-btn-row">
                          <button
                            className={`ad-btn delivered ${order.status === "Delivered" ? "active-status" : ""}`}
                            onClick={() => updateStatus(order.id, "Delivered")}
                            disabled={!!updating}
                          >
                            {updating === order.id + "Delivered" ? "…" : "✅"} Delivered
                          </button>
                          <button
                            className={`ad-btn cancelled ${order.status === "Cancelled" ? "active-status" : ""}`}
                            onClick={() => updateStatus(order.id, "Cancelled")}
                            disabled={!!updating}
                          >
                            {updating === order.id + "Cancelled" ? "…" : "❌"} Cancel
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={`ad-toast ${toast.show ? "show" : ""}`}>{toast.msg}</div>
    </>
  );
}