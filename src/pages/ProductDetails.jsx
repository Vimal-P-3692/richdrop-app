import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db, auth } from "../firebase/config";
import {
  doc, getDoc, collection, addDoc, serverTimestamp, onSnapshot, query, where, limit, getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

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
  blue:   "#1A6FA3",
  green:  "#2E7D4F",
  red:    "#B03A2E",
};

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
body { font-family: var(--font-body); background: var(--bg); color: var(--navy); -webkit-font-smoothing: antialiased; }
a { text-decoration: none; color: inherit; }
button { font-family: var(--font-body); cursor: pointer; border: none; background: none; }
img { display: block; }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

.pd-topbar {
  background: var(--navy);
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
}
.pd-topbar span { font-size: 10px; color: rgba(226,204,138,.7); letter-spacing: .5px; display: flex; align-items: center; gap: 5px; }
.pd-topbar b { color: var(--goldL); font-weight: 600; }

.pd-nav {
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
.pd-logo { display: flex; align-items: center; gap: 9px; flex-shrink: 0; text-decoration: none; }
.pd-logo-drop {
  width: 22px; height: 28px;
  background: linear-gradient(160deg, #B8E0F7, #1A6FA3);
  border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
  position: relative;
}
.pd-logo-drop::after {
  content: '';
  position: absolute;
  top: -4px; left: 50%;
  transform: translateX(-50%);
  width: 5px; height: 5px;
  background: var(--gold);
  border-radius: 50%;
}
.pd-logo h1 { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: #fff; letter-spacing: 2px; line-height: 1; }
.pd-logo p { font-size: 7px; color: var(--gold); letter-spacing: 2.5px; text-transform: uppercase; margin-top: 2px; }
.pd-nav-right { margin-left: auto; display: flex; align-items: center; gap: 4px; }
.pd-nav-btn {
  position: relative;
  display: flex; flex-direction: column; align-items: center; gap: 1px;
  padding: 6px 10px; border-radius: 8px;
  color: rgba(255,255,255,.75); text-decoration: none;
  transition: background .15s;
}
.pd-nav-btn:hover { background: rgba(255,255,255,.06); color: #fff; }
.pd-nav-btn .lbl { font-size: 9px; font-weight: 500; }
.pd-badge {
  position: absolute; top: 3px; right: 3px;
  background: var(--gold); color: var(--navy);
  font-size: 8px; font-weight: 800;
  width: 14px; height: 14px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}

.pd-bread {
  background: var(--white);
  border-bottom: 1px solid var(--border);
  padding: 0 24px; height: 38px;
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; color: var(--ivory);
}
.pd-bread a { color: var(--ivory); transition: color .15s; }
.pd-bread a:hover { color: var(--navy); }
.pd-bread-sep { color: var(--border); }
.pd-bread-cur { color: var(--navy); font-weight: 600; }

.pd-back {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: 8px;
  background: var(--white); border: 1px solid var(--border);
  font-size: 12px; font-weight: 600; color: var(--navy);
  cursor: pointer; transition: background .15s, transform .15s;
  margin-bottom: 20px; font-family: var(--font-body);
}
.pd-back:hover { background: var(--bg); transform: translateX(-2px); }

.pd-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 24px 100px;
  animation: pdFade .4s ease;
}
@keyframes pdFade { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }

/* ── ADDED TO CART BANNER ── */
.pd-cart-banner {
  background: linear-gradient(135deg, #1C4A2E, #2E7D4F);
  border-radius: 12px;
  border: 1px solid rgba(46,125,79,.4);
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 20px;
  animation: bannerIn .3s cubic-bezier(.22,1,.36,1);
  flex-wrap: wrap;
}
@keyframes bannerIn { from { transform: translateY(-10px); opacity: 0; } to { transform: none; opacity: 1; } }
.pd-banner-left { display: flex; align-items: center; gap: 10px; }
.pd-banner-icon {
  width: 36px; height: 36px; border-radius: 9px;
  background: rgba(255,255,255,.12);
  display: flex; align-items: center; justify-content: center;
  font-size: 17px;
}
.pd-banner-text h4 { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 2px; }
.pd-banner-text p { font-size: 10px; color: rgba(255,255,255,.7); }
.pd-banner-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.pd-go-cart {
  padding: 9px 18px;
  background: #fff; color: ${T.green};
  border-radius: 8px; font-size: 11px; font-weight: 800;
  letter-spacing: 1px; border: none; cursor: pointer;
  font-family: var(--font-body); transition: opacity .15s;
  text-decoration: none; display: inline-flex; align-items: center; gap: 5px;
}
.pd-go-cart:hover { opacity: .9; }
.pd-keep-btn {
  font-size: 10px; color: rgba(255,255,255,.65);
  font-weight: 600; cursor: pointer;
  background: none; border: none; font-family: var(--font-body);
  text-decoration: underline; text-underline-offset: 2px;
}

/* ── MAIN CARD ── */
.pd-card {
  background: var(--white);
  border-radius: 20px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  display: grid;
  grid-template-columns: 460px 1fr;
  margin-bottom: 24px;
}
@media (max-width: 860px) { .pd-card { grid-template-columns: 1fr; } }

.pd-img-panel {
  position: relative;
  background: linear-gradient(145deg, #EEF6FC, #F7F9FB);
  display: flex; align-items: center; justify-content: center;
  min-height: 400px;
  border-right: 1px solid var(--border);
  overflow: hidden;
}
@media (max-width: 860px) { .pd-img-panel { min-height: 260px; border-right: none; border-bottom: 1px solid var(--border); } }
.pd-img-panel img { max-width: 78%; max-height: 320px; object-fit: contain; transition: transform .4s ease; position: relative; z-index: 1; }
.pd-img-panel img:hover { transform: scale(1.05); }
.pd-img-fallback { font-size: 80px; opacity: .15; }
.pd-img-corner { position: absolute; top: 0; left: 0; width: 120px; height: 120px; background: radial-gradient(circle at top left, rgba(201,168,76,.07), transparent 70%); pointer-events: none; }
.pd-img-badge { position: absolute; top: 14px; left: 14px; background: var(--navy); color: var(--gold); font-size: 7px; font-weight: 700; letter-spacing: 1.5px; padding: 4px 9px; border-radius: 5px; z-index: 2; text-transform: uppercase; }
.pd-img-wish { position: absolute; top: 12px; right: 12px; width: 36px; height: 36px; border-radius: 50%; background: var(--white); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 16px; cursor: pointer; z-index: 2; transition: transform .2s, box-shadow .2s; box-shadow: var(--shadow); }
.pd-img-wish:hover { transform: scale(1.12); box-shadow: var(--shadow-md); }
.pd-share { position: absolute; bottom: 14px; right: 14px; width: 32px; height: 32px; border-radius: 8px; background: var(--white); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 2; transition: background .15s; box-shadow: var(--shadow); }
.pd-share:hover { background: var(--bg); }

.pd-info { padding: 30px 34px; display: flex; flex-direction: column; gap: 0; }
@media (max-width: 640px) { .pd-info { padding: 20px 16px; } }

.pd-info-cat { font-size: 9px; font-weight: 700; color: var(--blue); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
.pd-info-cat::before { content: ''; display: inline-block; width: 16px; height: 2px; background: var(--blue); border-radius: 1px; }
.pd-info-name { font-family: var(--font-display); font-size: 30px; font-weight: 700; color: var(--navy); line-height: 1.15; margin-bottom: 10px; }
@media (max-width: 640px) { .pd-info-name { font-size: 24px; } }
.pd-info-desc { font-size: 13px; color: var(--ivory); line-height: 1.7; margin-bottom: 16px; }

.pd-stars { display: flex; align-items: center; gap: 6px; margin-bottom: 16px; }
.pd-star-row { font-size: 14px; display: flex; gap: 1px; }
.pd-star-count { font-size: 11px; color: var(--ivory); }
.pd-star-sep { color: var(--border); font-size: 10px; }
.pd-verified { font-size: 10px; color: var(--green); font-weight: 600; display: flex; align-items: center; gap: 3px; }
.pd-div { height: 1px; background: var(--border); margin: 16px 0; }

.pd-price-block {
  background: linear-gradient(135deg, #F7F9FB, #F0F4F8);
  border-radius: 12px; border: 1px solid var(--border);
  padding: 14px 16px; margin-bottom: 18px;
  display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 10px;
}
.pd-price { font-size: 32px; font-weight: 800; color: var(--navy); line-height: 1; }
.pd-price-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.pd-mrp { font-size: 12px; color: var(--ivory); text-decoration: line-through; }
.pd-disc-badge { padding: 3px 10px; background: rgba(46,125,79,.1); border: 1px solid rgba(46,125,79,.3); border-radius: 20px; font-size: 10px; font-weight: 700; color: var(--green); }
.pd-tax { font-size: 9px; color: var(--ivory); margin-top: 3px; }

.pd-qty-row { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
.pd-qty-lbl { font-size: 12px; font-weight: 600; color: var(--navy); }
.pd-qty-ctrl { display: flex; align-items: center; border: 1.5px solid var(--border); border-radius: 9px; overflow: hidden; background: var(--white); }
.pd-qty-btn { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 300; color: var(--navy); background: transparent; border: none; cursor: pointer; transition: background .15s; font-family: var(--font-body); }
.pd-qty-btn:hover { background: var(--bg); }
.pd-qty-val { width: 38px; height: 34px; text-align: center; font-size: 14px; font-weight: 700; color: var(--navy); border-left: 1px solid var(--border); border-right: 1px solid var(--border); display: flex; align-items: center; justify-content: center; }
.pd-stock-badge { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; color: var(--green); }
.pd-stock-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); animation: pulse 1.8s ease infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .6; transform: scale(.85); } }

.pd-ctas { display: flex; gap: 10px; margin-bottom: 12px; }
.pd-btn-cart {
  flex: 1; height: 48px; border-radius: 10px;
  background: var(--navy); color: var(--gold);
  font-size: 12px; font-weight: 700; letter-spacing: 1.5px;
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  transition: opacity .15s, transform .15s; font-family: var(--font-body);
}
.pd-btn-cart:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
.pd-btn-cart:disabled { opacity: .6; cursor: not-allowed; }
.pd-btn-buy {
  flex: 1; height: 48px; border-radius: 10px;
  background: var(--gold); color: var(--navy);
  font-size: 12px; font-weight: 700; letter-spacing: 1.5px;
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  transition: opacity .15s, transform .15s; font-family: var(--font-body);
}
.pd-btn-buy:hover { opacity: .88; transform: translateY(-1px); }

/* Persistent "View Cart" link — appears once cart has items */
.pd-view-cart {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  font-size: 11px; font-weight: 600; color: var(--blue);
  text-decoration: none; margin-bottom: 14px;
  padding: 8px; border-radius: 8px;
  border: 1px solid rgba(26,111,163,.2); background: rgba(26,111,163,.04);
  transition: background .15s;
}
.pd-view-cart:hover { background: rgba(26,111,163,.09); }

.pd-trust-pills { display: flex; gap: 8px; flex-wrap: wrap; }
.pd-trust-pill { display: flex; align-items: center; gap: 5px; padding: 5px 11px; border-radius: 20px; background: var(--bg); border: 1px solid var(--border); font-size: 10px; color: var(--ivory); font-weight: 500; }

.pd-details { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
@media (max-width: 640px) { .pd-details { grid-template-columns: 1fr; } }
.pd-det-card { background: var(--white); border-radius: 16px; border: 1px solid var(--border); padding: 22px; box-shadow: var(--shadow); }
.pd-det-hdr { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.pd-det-hdr h3 { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--navy); }
.pd-det-icon { width: 32px; height: 32px; border-radius: 8px; background: var(--bg); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 15px; }
.pd-spec-row { display: flex; align-items: flex-start; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid var(--border); gap: 12px; }
.pd-spec-row:last-child { border-bottom: none; }
.pd-spec-key { font-size: 11px; color: var(--ivory); flex-shrink: 0; }
.pd-spec-val { font-size: 11px; font-weight: 600; color: var(--navy); text-align: right; }
.pd-feature { display: flex; align-items: center; gap: 9px; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 12px; color: var(--navy); }
.pd-feature:last-child { border-bottom: none; }
.pd-feature-check { width: 18px; height: 18px; border-radius: 50%; background: rgba(46,125,79,.1); border: 1px solid rgba(46,125,79,.3); display: flex; align-items: center; justify-content: center; font-size: 9px; flex-shrink: 0; color: var(--green); }

.pd-sec { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 16px; }
.pd-sec h2 { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--navy); position: relative; padding-bottom: 6px; }
.pd-sec h2::after { content: ''; position: absolute; bottom: 0; left: 0; width: 36px; height: 2px; background: linear-gradient(90deg, var(--gold), transparent); border-radius: 1px; }
.pd-see { font-size: 12px; font-weight: 600; color: var(--blue); text-decoration: none; }
.pd-see:hover { text-decoration: underline; }
.pd-similar-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(192px, 1fr)); gap: 14px; margin-bottom: 28px; }
.pd-sim-card { background: var(--white); border-radius: var(--radius); border: 1px solid var(--border); overflow: hidden; cursor: pointer; transition: transform .18s, box-shadow .18s; display: flex; flex-direction: column; text-decoration: none; }
.pd-sim-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
.pd-sim-img { height: 140px; background: #EEF6FC; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.pd-sim-img img { width: 100%; height: 100%; object-fit: contain; transition: transform .3s; }
.pd-sim-card:hover .pd-sim-img img { transform: scale(1.05); }
.pd-sim-fallback { font-size: 36px; opacity: .3; }
.pd-sim-info { padding: 12px 13px 14px; }
.pd-sim-cat { font-size: 9px; font-weight: 600; color: var(--blue); letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 3px; }
.pd-sim-name { font-family: var(--font-display); font-size: 13px; font-weight: 700; color: var(--navy); line-height: 1.25; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.pd-sim-price { font-size: 15px; font-weight: 700; color: var(--navy); }

.pd-svc-strip {
  background: linear-gradient(135deg, var(--navy), var(--navy2));
  border-radius: var(--radius); border: 1px solid rgba(201,168,76,.22);
  padding: 20px 26px; display: flex; align-items: center; justify-content: space-between;
  gap: 20px; margin-bottom: 28px; flex-wrap: wrap;
  text-decoration: none; transition: opacity .15s;
}
.pd-svc-strip:hover { opacity: .93; }
.pd-svc-left { display: flex; align-items: center; gap: 14px; }
.pd-svc-icon { width: 46px; height: 46px; border-radius: 12px; background: rgba(26,111,163,.18); border: 1px solid rgba(91,184,232,.28); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.pd-svc-strip h3 { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 3px; }
.pd-svc-strip p { font-size: 11px; color: rgba(226,204,138,.65); }
.pd-svc-btn { padding: 10px 20px; background: var(--gold); color: var(--navy); border-radius: 8px; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; border: none; cursor: pointer; white-space: nowrap; font-family: var(--font-body); }

.pd-mob-cta { display: none; position: fixed; bottom: 60px; left: 0; right: 0; padding: 10px 16px; background: var(--white); border-top: 1px solid var(--border); z-index: 99; gap: 10px; }
@media (max-width: 768px) { .pd-mob-cta { display: flex; } }
.pd-mob-cart { flex: 1; height: 44px; border-radius: 9px; background: var(--navy); color: var(--gold); font-size: 12px; font-weight: 700; letter-spacing: 1px; border: none; cursor: pointer; font-family: var(--font-body); }
.pd-mob-buy { flex: 1; height: 44px; border-radius: 9px; background: var(--gold); color: var(--navy); font-size: 12px; font-weight: 700; letter-spacing: 1px; border: none; cursor: pointer; font-family: var(--font-body); }

.pd-bnav { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: var(--white); border-top: 1px solid var(--border); padding: 5px 0 env(safe-area-inset-bottom, 8px); z-index: 100; justify-content: space-around; }
@media (max-width: 768px) { .pd-bnav { display: flex; } .pd-page { padding-bottom: 120px; } .pd-topbar { display: none; } }
.pd-nav-tab { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; text-decoration: none; padding: 4px; }
.pd-nav-tab .ti { font-size: 19px; }
.pd-nav-tab-lbl { font-size: 9px; color: #C0B8A8; font-weight: 500; }

.pd-loading { min-height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; }
.pd-spin { width: 36px; height: 36px; border: 3px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.pd-not-found { text-align: center; padding: 80px 20px; }
.pd-not-found .nf-icon { font-size: 52px; opacity: .25; margin-bottom: 14px; }
.pd-not-found h2 { font-family: var(--font-display); font-size: 26px; font-weight: 700; color: var(--navy); margin-bottom: 8px; }
.pd-not-found p { font-size: 13px; color: var(--ivory); margin-bottom: 22px; }
.pd-not-found button { padding: 11px 24px; background: var(--navy); color: var(--gold); border-radius: 9px; font-size: 12px; font-weight: 700; cursor: pointer; border: none; font-family: var(--font-body); }
`;

function StarRow({ rating = 4.5 }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div className="pd-star-row">
      {[...Array(5)].map((_, i) =>
        i < full ? "⭐" : (i === full && half ? "✨" : "☆")
      )}
    </div>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [qty, setQty]                 = useState(1);
  const [wishlist, setWishlist]       = useState(false);
  const [cartCount, setCartCount]     = useState(0);
  const [cartLoading, setCartLoading] = useState(false);
  const [justAdded, setJustAdded]     = useState(false);
  const [similar, setSimilar]         = useState([]);
  const [user, setUser]               = useState(null);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(collection(db, "carts", user.uid, "items"), (s) =>
      setCartCount(s.docs.length)
    );
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setJustAdded(false);
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() };
          setProduct(data);
          if (data.category) {
            const simSnap = await getDocs(
              query(collection(db, "products"), where("category", "==", data.category), limit(5))
            );
            setSimilar(
              simSnap.docs
                .map((d) => ({ id: d.id, ...d.data() }))
                .filter((p) => p.id !== id)
                .slice(0, 4)
            );
          }
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  const addToCart = async () => {
    if (!user) { navigate("/login"); return; }
    setCartLoading(true);
    try {
      await addDoc(collection(db, "carts", user.uid, "items"), {
        productId: id,                     // ← cart uses this to link back here
        name:      product.name,
        price:     product.price,
        image:     product.image ?? null,
        category:  product.category ?? null,
        quantity:  qty,
        addedAt:   serverTimestamp(),
      });
      setJustAdded(true);
    } catch (err) { console.error(err); }
    finally { setCartLoading(false); }
  };

  const buyNow = async () => {
    await addToCart();
    navigate("/cart");
  };

  const discount = product?.mrp ? Math.round((1 - product.price / product.mrp) * 100) : null;

  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <div className="pd-topbar">
          {[["⚡","Same-day","service"],["🚚","Free delivery","₹999+"],["✅","ISI","Certified"],["🎧","24/7","Support"]].map(([ic,b,a])=>(
            <span key={b}>{ic} <b>{b}</b> {a}</span>
          ))}
        </div>
        <nav className="pd-nav">
          <Link to="/" className="pd-logo"><div className="pd-logo-drop" /><div><h1>RichDrop</h1><p>Pure Water Solutions</p></div></Link>
        </nav>
        <div className="pd-page"><div className="pd-loading"><div className="pd-spin" /><div style={{fontSize:13,color:"var(--ivory)"}}>Loading product…</div></div></div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <style>{CSS}</style>
        <nav className="pd-nav"><Link to="/" className="pd-logo"><div className="pd-logo-drop" /><div><h1>RichDrop</h1><p>Pure Water Solutions</p></div></Link></nav>
        <div className="pd-page"><div className="pd-not-found"><div className="nf-icon">💧</div><h2>Product Not Found</h2><p>This product may have been removed.</p><button onClick={() => navigate("/user")}>← Back to Shop</button></div></div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>

      <div className="pd-topbar">
        {[["⚡","Same-day","service"],["🚚","Free delivery","₹999+"],["✅","ISI","Certified"],["🎧","24/7","Support"]].map(([ic,b,a])=>(
          <span key={b}>{ic} <b>{b}</b> {a}</span>
        ))}
      </div>

      <nav className="pd-nav">
        <Link to="/" className="pd-logo">
          <div className="pd-logo-drop" />
          <div><h1>RichDrop</h1><p>Pure Water Solutions</p></div>
        </Link>
        <div className="pd-nav-right">
          <Link to="/wishlist" className="pd-nav-btn">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
            <span className="lbl">Wishlist</span>
          </Link>
          <Link to="/cart" className="pd-nav-btn">
            <div style={{position:"relative"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {cartCount > 0 && <span className="pd-badge">{cartCount}</span>}
            </div>
            <span className="lbl">Cart</span>
          </Link>
        </div>
      </nav>

      <div className="pd-bread">
        <Link to="/user">Home</Link>
        <span className="pd-bread-sep">›</span>
        <Link to="/user">Products</Link>
        {product.category && <><span className="pd-bread-sep">›</span><Link to="/user">{product.category}</Link></>}
        <span className="pd-bread-sep">›</span>
        <span className="pd-bread-cur">{product.name}</span>
      </div>

      <div className="pd-page">

        <button className="pd-back" onClick={() => navigate(-1)}>← Back</button>

        {/* ── ADDED TO CART BANNER — with "Go to Cart" link ── */}
        {justAdded && (
          <div className="pd-cart-banner">
            <div className="pd-banner-left">
              <div className="pd-banner-icon">✅</div>
              <div className="pd-banner-text">
                <h4>Added to your cart!</h4>
                <p>{qty} × {product.name} · ₹{((product.price ?? 0) * qty).toLocaleString()}</p>
              </div>
            </div>
            <div className="pd-banner-right">
              {/* ← Go to Cart navigates to /cart */}
              <Link to="/cart" className="pd-go-cart">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                Go to Cart ({cartCount})
              </Link>
              <button className="pd-keep-btn" onClick={() => setJustAdded(false)}>Keep shopping</button>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="pd-card">
          <div className="pd-img-panel">
            <div className="pd-img-corner" />
            <div className="pd-img-badge">✦ PREMIUM</div>
            <button className="pd-img-wish" onClick={() => setWishlist(w => !w)}>
              {wishlist ? "❤️" : "🤍"}
            </button>
            <button className="pd-share" title="Share">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.navy} strokeWidth="2.5">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>
            {product.image ? <img src={product.image} alt={product.name} /> : <div className="pd-img-fallback">💧</div>}
          </div>

          <div className="pd-info">
            {product.category && <div className="pd-info-cat">{product.category}</div>}
            <div className="pd-info-name">{product.name ?? "Product"}</div>
            <div className="pd-info-desc">{product.description ?? "Premium quality RO water purification product."}</div>

            <div className="pd-stars">
              <StarRow rating={4.5} />
              <span className="pd-star-count">4.5</span>
              <span className="pd-star-sep">•</span>
              <span className="pd-star-count">120 reviews</span>
              <span className="pd-star-sep">•</span>
              <span className="pd-verified">✔ Verified</span>
            </div>

            <div className="pd-div" />

            <div className="pd-price-block">
              <div>
                <div style={{fontSize:10,color:"var(--ivory)",marginBottom:4}}>PRICE</div>
                <div className="pd-price">₹{product.price ?? 0}</div>
                <div className="pd-tax">Inclusive of all taxes</div>
              </div>
              {product.mrp && (
                <div className="pd-price-right">
                  <div className="pd-mrp">MRP ₹{product.mrp}</div>
                  {discount && <div className="pd-disc-badge">{discount}% OFF</div>}
                </div>
              )}
            </div>

            <div className="pd-qty-row">
              <span className="pd-qty-lbl">Qty:</span>
              <div className="pd-qty-ctrl">
                <button className="pd-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <div className="pd-qty-val">{qty}</div>
                <button className="pd-qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
              </div>
              <div className="pd-stock-badge">
                <div className="pd-stock-dot" />
                In Stock
              </div>
            </div>

            <div className="pd-ctas">
              <button className="pd-btn-cart" onClick={addToCart} disabled={cartLoading}>
                {cartLoading ? "Adding…" : "🛒 Add to Cart"}
              </button>
              <button className="pd-btn-buy" onClick={buyNow}>
                ⚡ Buy Now
              </button>
            </div>

            {/* Persistent "View Cart" pill — always visible once cart has items */}
            {cartCount > 0 && (
              <Link to="/cart" className="pd-view-cart">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                View Cart ({cartCount} item{cartCount !== 1 ? "s" : ""}) →
              </Link>
            )}

            <div className="pd-trust-pills">
              {[["🚚","Free Delivery"],["🔄","7-Day Returns"],["🔒","Secure Pay"],["✅","ISI Certified"]].map(([ic,tx]) => (
                <div key={tx} className="pd-trust-pill">{ic} {tx}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="pd-details">
          <div className="pd-det-card">
            <div className="pd-det-hdr"><div className="pd-det-icon">📋</div><h3>Specifications</h3></div>
            {[["Category",product.category??"—"],["Product ID",id.slice(0,10)+"…"],["Price",`₹${product.price??0}`],["MRP",product.mrp?`₹${product.mrp}`:"—"],["Availability","In Stock"],["Brand","RichDrop™"],["Warranty","1 Year"],["Certification","ISI & NSF Approved"]].map(([k,v])=>(
              <div key={k} className="pd-spec-row"><span className="pd-spec-key">{k}</span><span className="pd-spec-val">{v}</span></div>
            ))}
          </div>
          <div className="pd-det-card">
            <div className="pd-det-hdr"><div className="pd-det-icon">✨</div><h3>Key Features</h3></div>
            {["Advanced multi-stage filtration","Removes 99.9% of contaminants","High flow rate — up to 15 L/hr","UV + RO dual purification","Smart TDS controller built-in","Energy-efficient design","BPA-free food-grade materials","Easy DIY installation"].map(f=>(
              <div key={f} className="pd-feature"><div className="pd-feature-check">✓</div>{f}</div>
            ))}
          </div>
        </div>

        <Link to="/service" className="pd-svc-strip">
          <div className="pd-svc-left">
            <div className="pd-svc-icon">🔧</div>
            <div><h3>Need Installation or Service?</h3><p>Certified RO technicians — same-day slots, 7 days a week</p></div>
          </div>
          <button className="pd-svc-btn">BOOK NOW</button>
        </Link>

        {/* Similar products — each navigates to /product/:id */}
        {similar.length > 0 && (
          <>
            <div className="pd-sec">
              <h2>Similar Products</h2>
              <Link to="/user" className="pd-see">View all →</Link>
            </div>
            <div className="pd-similar-grid">
              {similar.map((p) => (
                <div key={p.id} className="pd-sim-card" onClick={() => navigate(`/product/${p.id}`)}>
                  <div className="pd-sim-img">
                    {p.image ? <img src={p.image} alt={p.name} /> : <div className="pd-sim-fallback">💧</div>}
                  </div>
                  <div className="pd-sim-info">
                    {p.category && <div className="pd-sim-cat">{p.category}</div>}
                    <div className="pd-sim-name">{p.name}</div>
                    <div className="pd-sim-price">₹{p.price ?? 0}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="pd-mob-cta">
        <button className="pd-mob-cart" onClick={addToCart} disabled={cartLoading}>
          {cartLoading ? "Adding…" : "🛒 Add to Cart"}
        </button>
        <button className="pd-mob-buy" onClick={buyNow}>⚡ Buy Now</button>
      </div>

      <nav className="pd-bnav">
        {[{label:"Home",icon:"🏠",to:"/user"},{label:"Search",icon:"🔍",to:"/products"},{label:"Cart",icon:"🛒",to:"/cart"},{label:"Service",icon:"🔧",to:"/service"},{label:"Profile",icon:"👤",to:"/profile"}].map(t=>(
          <Link key={t.label} to={t.to} className="pd-nav-tab">
            <div className="ti">{t.icon}</div>
            <div className="pd-nav-tab-lbl">{t.label}</div>
          </Link>
        ))}
      </nav>
    </>
  );
}