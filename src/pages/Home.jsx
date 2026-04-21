import { useEffect, useState } from "react";
import { db, auth } from "../firebase/config";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

// ── Design Tokens (matches Checkout) ─────────────────────────────────────────
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

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --navy: ${T.navy}; --navy2: ${T.navy2};
  --gold: ${T.gold}; --goldL: ${T.goldL};
  --bg: ${T.bg}; --white: ${T.white};
  --ivory: ${T.ivory}; --border: ${T.border};
  --blue: ${T.blue}; --green: ${T.green}; --red: ${T.red};
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
.hm-topbar {
  background: var(--navy);
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
}
.hm-topbar span {
  font-size: 10px;
  color: rgba(226,204,138,.7);
  letter-spacing: .5px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.hm-topbar b { color: var(--goldL); font-weight: 600; }

/* ── NAVBAR ── */
.hm-nav {
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
.hm-logo {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-shrink: 0;
  text-decoration: none;
}
.hm-logo-drop {
  width: 22px;
  height: 28px;
  background: linear-gradient(160deg, #B8E0F7, #1A6FA3);
  border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
  position: relative;
  flex-shrink: 0;
}
.hm-logo-drop::after {
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
.hm-logo h1 {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2px;
  line-height: 1;
}
.hm-logo p {
  font-size: 7px;
  color: var(--gold);
  letter-spacing: 2.5px;
  text-transform: uppercase;
  margin-top: 2px;
}
.hm-nav-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
}
.hm-nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 6px 10px;
  border-radius: 8px;
  color: rgba(255,255,255,.75);
  text-decoration: none;
  transition: background .15s;
  cursor: pointer;
  background: none;
  border: none;
  font-family: var(--font-body);
}
.hm-nav-btn:hover { background: rgba(255,255,255,.06); color: #fff; }
.hm-nav-btn .lbl { font-size: 9px; font-weight: 500; }

.hm-nav-cta {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--gold), var(--goldL));
  color: var(--navy);
  border-radius: 9px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-decoration: none;
  cursor: pointer;
  border: none;
  font-family: var(--font-body);
  transition: opacity .15s, transform .15s;
  box-shadow: 0 4px 14px rgba(201,168,76,.25);
}
.hm-nav-cta:hover { opacity: .88; transform: translateY(-1px); }

/* ── HERO ── */
.hm-hero {
  background: var(--navy);
  position: relative;
  overflow: hidden;
  padding: 80px 24px 90px;
  text-align: center;
}
.hm-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 70% 60% at 50% 110%, rgba(26,111,163,.35) 0%, transparent 70%);
  pointer-events: none;
}
.hm-hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 20px;
  border: 1px solid rgba(201,168,76,.3);
  background: rgba(201,168,76,.08);
  font-size: 10px;
  font-weight: 700;
  color: var(--goldL);
  letter-spacing: 1.5px;
  margin-bottom: 22px;
}
.hm-hero h2 {
  font-family: var(--font-display);
  font-size: clamp(38px, 6vw, 58px);
  font-weight: 700;
  color: #fff;
  line-height: 1.1;
  margin-bottom: 16px;
}
.hm-hero h2 span { color: var(--goldL); }
.hm-hero p {
  font-size: 15px;
  color: rgba(226,204,138,.6);
  max-width: 440px;
  margin: 0 auto 32px;
  line-height: 1.7;
}
.hm-hero-btns {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}
.hm-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 28px;
  background: linear-gradient(135deg, var(--gold), var(--goldL));
  color: var(--navy);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 2px;
  border: none;
  cursor: pointer;
  font-family: var(--font-body);
  transition: opacity .15s, transform .15s;
  box-shadow: 0 6px 20px rgba(201,168,76,.3);
}
.hm-btn-primary:hover { opacity: .88; transform: translateY(-2px); }
.hm-btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 28px;
  background: rgba(255,255,255,.06);
  color: rgba(255,255,255,.85);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  border: 1.5px solid rgba(255,255,255,.15);
  cursor: pointer;
  font-family: var(--font-body);
  transition: background .15s, border-color .15s;
}
.hm-btn-secondary:hover { background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.25); }

/* Hero stats */
.hm-hero-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 44px;
  padding-top: 32px;
  border-top: 1px solid rgba(201,168,76,.12);
  flex-wrap: wrap;
}
.hm-hero-stat-val {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}
.hm-hero-stat-lbl {
  font-size: 10px;
  color: rgba(226,204,138,.5);
  margin-top: 4px;
  letter-spacing: .5px;
}

/* ── TRUST BAR ── */
.hm-trust {
  background: var(--white);
  border-bottom: 1px solid var(--border);
  padding: 14px 24px;
  display: flex;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
}
.hm-trust-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
  color: var(--navy);
}
.hm-trust-item span { color: var(--ivory); font-weight: 400; }

/* ── SECTION WRAPPER ── */
.hm-section {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ── CATEGORIES ── */
.hm-cats { padding: 48px 0 12px; }
.hm-sec-hdr {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 12px;
}
.hm-sec-hdr-left h2 {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  color: var(--navy);
  line-height: 1;
  margin-bottom: 3px;
}
.hm-sec-hdr-left p { font-size: 11px; color: var(--ivory); }
.hm-sec-link {
  font-size: 11px;
  font-weight: 700;
  color: var(--gold);
  letter-spacing: .5px;
  cursor: pointer;
  transition: opacity .15s;
  border: none;
  background: none;
  font-family: var(--font-body);
  flex-shrink: 0;
}
.hm-sec-link:hover { opacity: .75; }

.hm-cat-grid {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
}
.hm-cat-grid::-webkit-scrollbar { display: none; }

.hm-cat-card {
  flex-shrink: 0;
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: border-color .15s, box-shadow .15s, transform .15s;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 160px;
}
.hm-cat-card:hover {
  border-color: rgba(201,168,76,.5);
  box-shadow: 0 4px 16px rgba(201,168,76,.12);
  transform: translateY(-2px);
}
.hm-cat-icon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: rgba(15,28,42,.06);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.hm-cat-name { font-size: 12px; font-weight: 700; color: var(--navy); line-height: 1.3; }
.hm-cat-count { font-size: 10px; color: var(--ivory); margin-top: 2px; }

/* ── PRODUCTS ── */
.hm-products { padding: 48px 0; }

.hm-prod-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 16px;
}

.hm-prod-card {
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  cursor: pointer;
  transition: border-color .15s, box-shadow .15s, transform .15s;
  display: flex;
  flex-direction: column;
}
.hm-prod-card:hover {
  border-color: rgba(201,168,76,.45);
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
}
.hm-prod-img-wrap {
  position: relative;
  background: var(--bg);
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--border);
  overflow: hidden;
}
.hm-prod-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 12px;
  transition: transform .3s;
}
.hm-prod-card:hover .hm-prod-img-wrap img { transform: scale(1.04); }
.hm-prod-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1px;
  padding: 3px 8px;
  border-radius: 20px;
  background: rgba(15,28,42,.85);
  color: var(--goldL);
  border: 1px solid rgba(201,168,76,.3);
}
.hm-prod-body { padding: 14px 16px 16px; flex: 1; display: flex; flex-direction: column; }
.hm-prod-cat {
  font-size: 9px;
  font-weight: 700;
  color: var(--gold);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 5px;
}
.hm-prod-name {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--navy);
  line-height: 1.3;
  margin-bottom: 10px;
  flex: 1;
}
.hm-prod-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
}
.hm-prod-price {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--navy);
}
.hm-prod-price span {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 400;
  color: var(--ivory);
  display: block;
  line-height: 1;
}
.hm-prod-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--navy);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gold);
  flex-shrink: 0;
  transition: background .15s;
}
.hm-prod-card:hover .hm-prod-btn { background: var(--gold); color: var(--navy); }

/* ── BANNER ── */
.hm-banner {
  background: var(--navy);
  border-radius: 18px;
  border: 1px solid rgba(201,168,76,.2);
  padding: 40px 40px;
  margin: 0 0 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  position: relative;
  overflow: hidden;
  flex-wrap: wrap;
}
.hm-banner::before {
  content: '';
  position: absolute;
  right: -60px;
  top: -60px;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: rgba(26,111,163,.15);
  pointer-events: none;
}
.hm-banner-tag {
  font-size: 9px;
  font-weight: 700;
  color: var(--gold);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.hm-banner h3 {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  margin-bottom: 8px;
}
.hm-banner p { font-size: 12px; color: rgba(226,204,138,.55); max-width: 340px; }
.hm-banner-pills { display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap; }
.hm-banner-pill {
  font-size: 10px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 20px;
  background: rgba(201,168,76,.1);
  border: 1px solid rgba(201,168,76,.25);
  color: var(--goldL);
}

/* ── WHY ── */
.hm-why { padding: 0 0 56px; }
.hm-why-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
}
.hm-why-card {
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  padding: 22px 20px;
  transition: border-color .15s, box-shadow .15s;
}
.hm-why-card:hover {
  border-color: rgba(201,168,76,.4);
  box-shadow: 0 4px 16px rgba(201,168,76,.1);
}
.hm-why-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(15,28,42,.05);
  border: 1px solid rgba(15,28,42,.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}
.hm-why-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--navy); margin-bottom: 5px; }
.hm-why-desc { font-size: 11px; color: var(--ivory); line-height: 1.6; }

/* ── FOOTER ── */
.hm-footer {
  background: var(--navy);
  border-top: 1px solid rgba(201,168,76,.12);
  padding: 36px 24px 20px;
}
.hm-footer-inner { max-width: 1180px; margin: 0 auto; }
.hm-footer-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 32px;
  flex-wrap: wrap;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(201,168,76,.1);
  margin-bottom: 20px;
}
.hm-footer-brand h4 {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2px;
  margin-bottom: 4px;
}
.hm-footer-brand p { font-size: 11px; color: rgba(226,204,138,.45); max-width: 240px; line-height: 1.6; }
.hm-footer-links { display: flex; flex-direction: column; gap: 8px; }
.hm-footer-links a {
  font-size: 12px;
  color: rgba(226,204,138,.55);
  text-decoration: none;
  transition: color .15s;
  cursor: pointer;
}
.hm-footer-links a:hover { color: var(--goldL); }
.hm-footer-links h5 {
  font-size: 10px;
  font-weight: 700;
  color: var(--gold);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.hm-footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}
.hm-footer-copy { font-size: 10px; color: rgba(226,204,138,.35); }
.hm-footer-badges { display: flex; gap: 8px; }
.hm-footer-badge {
  font-size: 9px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(201,168,76,.08);
  border: 1px solid rgba(201,168,76,.18);
  color: rgba(226,204,138,.55);
  letter-spacing: .5px;
}

/* ── MOBILE BOTTOM NAV ── */
.hm-bnav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--white);
  border-top: 1px solid var(--border);
  padding: 5px 0 env(safe-area-inset-bottom, 8px);
  z-index: 100;
  justify-content: space-around;
}
@media (max-width: 768px) {
  .hm-bnav { display: flex; }
  .hm-footer { padding-bottom: 80px; }
  .hm-topbar { display: none; }
  .hm-hero { padding: 52px 20px 60px; }
  .hm-hero-stats { gap: 24px; }
  .hm-banner { padding: 28px 24px; }
}
.hm-nav-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-decoration: none;
  padding: 4px;
  cursor: pointer;
  border: none;
  background: none;
  font-family: var(--font-body);
}
.hm-nav-tab .ti { font-size: 19px; }
.hm-nav-tab-lbl { font-size: 9px; color: #C0B8A8; font-weight: 500; }
.hm-nav-tab.active .hm-nav-tab-lbl { color: var(--navy); font-weight: 700; }
.hm-nav-bar { width: 16px; height: 2px; background: var(--gold); border-radius: 2px; }

/* ── LOADING ── */
.hm-spin-wrap { padding: 60px; display: flex; justify-content: center; }
.hm-spin {
  width: 28px; height: 28px;
  border: 2.5px solid var(--border);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes hmFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.hm-fade { animation: hmFade .4s ease both; }
`;

// Category icon map
const CAT_ICONS = {
  "RO System": "💧",
  "Filter": "🔵",
  "Accessory": "🔧",
  "UV System": "☀️",
  "Softener": "💎",
};
function catIcon(cat) {
  for (const [k, v] of Object.entries(CAT_ICONS)) {
    if (cat?.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return "🛒";
}

const WHY_ITEMS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "ISI Certified",
    desc: "All products meet Bureau of Indian Standards quality norms.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth="2">
        <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    title: "Free Delivery",
    desc: "Orders above ₹999 qualify for free doorstep delivery.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    title: "Genuine Products",
    desc: "Sourced directly from authorised manufacturers.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    title: "Easy Returns",
    desc: "Hassle-free 7-day return & replacement policy.",
  },
];

export default function Home() {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [user, setUser]             = useState(null);
  const [loading, setLoading]       = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(data);
      setCategories([...new Set(data.map((p) => p.category).filter(Boolean))]);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <>
      <style>{CSS}</style>

      {/* Topbar */}
      <div className="hm-topbar">
        {[["⚡","Same-day","service"],["🚚","Free delivery","₹999+"],["✅","ISI","Certified"],["🎧","24/7","Support"]].map(([ic,b,a]) => (
          <span key={b}>{ic} <b>{b}</b> {a}</span>
        ))}
      </div>

      {/* Navbar */}
      <nav className="hm-nav">
        <div className="hm-logo">
          <div className="hm-logo-drop" />
          <div>
            <h1>RichDrop</h1>
            <p>Pure Water Solutions</p>
          </div>
        </div>

        <div className="hm-nav-right">
          {user ? (
            <>
              <button className="hm-nav-btn" onClick={() => navigate("/cart")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.96-1.58l1.54-6.42H6"/>
                </svg>
                <span className="lbl">Cart</span>
              </button>
              <button className="hm-nav-cta" onClick={() => navigate("/user")}>
                DASHBOARD →
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hm-nav-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                <span className="lbl">Login</span>
              </Link>
              <button className="hm-nav-cta" onClick={() => navigate("/signup")}>
                SIGN UP →
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="hm-hero">
        <div className="hm-hero-tag">
          💧 INDIA'S PREMIUM WATER SOLUTIONS
        </div>
        <h2>
          Pure Water,<br />
          <span>Pure Life</span>
        </h2>
        <p>
          Shop ISI-certified RO systems, filters & accessories —
          delivered to your door across India.
        </p>
        <div className="hm-hero-btns">
          <button className="hm-btn-primary" onClick={() => navigate("/user")}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T.navy} strokeWidth="2.5">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.96-1.58l1.54-6.42H6"/>
            </svg>
            SHOP NOW
          </button>
          <button className="hm-btn-secondary" onClick={() => navigate("/user")}>
            VIEW CATALOGUE →
          </button>
        </div>

        <div className="hm-hero-stats">
          {[
            { val: "10,000+",   lbl: "Happy Customers" },
            { val: "200+",      lbl: "Products" },
            { val: "4.9★",     lbl: "Avg. Rating" },
            { val: "Pan-India", lbl: "Delivery" },
          ].map((s) => (
            <div key={s.lbl} style={{ textAlign: "center" }}>
              <div className="hm-hero-stat-val">{s.val}</div>
              <div className="hm-hero-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Bar */}
      <div className="hm-trust">
        {[
          { icon: "🔒", title: "Secure Checkout", sub: "256-bit SSL" },
          { icon: "🚚", title: "Fast Shipping",    sub: "2–5 business days" },
          { icon: "✅", title: "ISI Certified",    sub: "Verified products" },
          { icon: "🔄", title: "Easy Returns",     sub: "7-day policy" },
          { icon: "🎧", title: "24/7 Support",     sub: "Always here for you" },
        ].map((t) => (
          <div key={t.title} className="hm-trust-item">
            {t.icon} {t.title} <span>· {t.sub}</span>
          </div>
        ))}
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="hm-section hm-fade">
          <div className="hm-cats">
            <div className="hm-sec-hdr">
              <div className="hm-sec-hdr-left">
                <h2>Categories</h2>
                <p>Browse by product type</p>
              </div>
              <button className="hm-sec-link" onClick={() => navigate("/user")}>
                View All →
              </button>
            </div>
            <div className="hm-cat-grid">
              {categories.map((cat) => (
                <div key={cat} className="hm-cat-card" onClick={() => navigate("/user")}>
                  <div className="hm-cat-icon">{catIcon(cat)}</div>
                  <div>
                    <div className="hm-cat-name">{cat}</div>
                    <div className="hm-cat-count">
                      {products.filter((p) => p.category === cat).length} products
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Latest Products */}
      <div className="hm-section hm-fade">
        <div className="hm-products">
          <div className="hm-sec-hdr">
            <div className="hm-sec-hdr-left">
              <h2>Latest Products</h2>
              <p>Fresh arrivals curated for you</p>
            </div>
            <button className="hm-sec-link" onClick={() => navigate("/user")}>
              Explore More →
            </button>
          </div>

          {loading ? (
            <div className="hm-spin-wrap"><div className="hm-spin" /></div>
          ) : (
            <div className="hm-prod-grid">
              {products.slice(0, 8).map((product, i) => (
                <div
                  key={product.id}
                  className="hm-prod-card"
                  style={{ animationDelay: `${i * 0.04}s` }}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="hm-prod-img-wrap">
                    {i < 3 && (
                      <div className="hm-prod-badge">
                        {i === 0 ? "NEW" : i === 1 ? "HOT" : "TOP"}
                      </div>
                    )}
                    <img src={product.image} alt={product.name} />
                  </div>
                  <div className="hm-prod-body">
                    {product.category && (
                      <div className="hm-prod-cat">{product.category}</div>
                    )}
                    <div className="hm-prod-name">{product.name}</div>
                    <div className="hm-prod-footer">
                      <div className="hm-prod-price">
                        <span>MRP</span>
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </div>
                      <div className="hm-prod-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA Banner */}
      <div className="hm-section">
        <div className="hm-banner hm-fade">
          <div>
            <div className="hm-banner-tag">LIMITED OFFER</div>
            <h3>Free Installation<br />on RO Systems</h3>
            <p>Book any RO system this month and get professional installation at no extra cost.</p>
            <div className="hm-banner-pills">
              {["Same-day service", "Certified technicians", "1-yr warranty"].map((t) => (
                <div key={t} className="hm-banner-pill">{t}</div>
              ))}
            </div>
          </div>
          <button className="hm-btn-primary" onClick={() => navigate("/user")}>
            CLAIM OFFER →
          </button>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="hm-section hm-fade">
        <div className="hm-why">
          <div className="hm-sec-hdr" style={{ marginBottom: 20 }}>
            <div className="hm-sec-hdr-left">
              <h2>Why RichDrop?</h2>
              <p>What sets us apart from the rest</p>
            </div>
          </div>
          <div className="hm-why-grid">
            {WHY_ITEMS.map((w) => (
              <div key={w.title} className="hm-why-card">
                <div className="hm-why-icon">{w.icon}</div>
                <div className="hm-why-title">{w.title}</div>
                <div className="hm-why-desc">{w.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="hm-footer">
        <div className="hm-footer-inner">
          <div className="hm-footer-top">
            <div className="hm-footer-brand">
              <h4>RichDrop</h4>
              <p style={{ marginTop: 6 }}>
                India's trusted source for premium water purification systems and accessories.
              </p>
            </div>
            <div className="hm-footer-links">
              <h5>Shop</h5>
              <a onClick={() => navigate("/user")}>All Products</a>
              <a onClick={() => navigate("/user")}>RO Systems</a>
              <a onClick={() => navigate("/user")}>Filters</a>
              <a onClick={() => navigate("/user")}>Accessories</a>
            </div>
            <div className="hm-footer-links">
              <h5>Account</h5>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
              <Link to="/cart">My Cart</Link>
              <Link to="/user">Dashboard</Link>
            </div>
            <div className="hm-footer-links">
              <h5>Support</h5>
              <a>Contact Us</a>
              <a>Track Order</a>
              <a>Returns</a>
              <a>FAQ</a>
            </div>
          </div>
          <div className="hm-footer-bottom">
            <div className="hm-footer-copy">© 2026 RichDrop · Pure Water Solutions 💧</div>
            <div className="hm-footer-badges">
              {["ISI Certified", "Secure Pay", "COD Available"].map((b) => (
                <div key={b} className="hm-footer-badge">{b}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="hm-bnav">
        {[
          { label: "Home",    icon: "🏠", to: "/",                   active: true },
          { label: "Search",  icon: "🔍", to: "/user" },
          { label: "Cart",    icon: "🛒", to: "/cart" },
          { label: "Profile", icon: "👤", to: user ? "/user" : "/login" },
        ].map((t) => (
          <Link key={t.label} to={t.to} className={`hm-nav-tab ${t.active ? "active" : ""}`}>
            <div className="ti">{t.icon}</div>
            <div className="hm-nav-tab-lbl">{t.label}</div>
            {t.active && <div className="hm-nav-bar" />}
          </Link>
        ))}
      </nav>
    </>
  );
}