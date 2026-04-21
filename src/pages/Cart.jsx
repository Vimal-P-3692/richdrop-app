import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// ── Design Tokens (matches RichDrop system) ───────────────────────────────────
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
.ct-topbar {
  background: var(--navy);
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
}
.ct-topbar span {
  font-size: 10px;
  color: rgba(226,204,138,.7);
  letter-spacing: .5px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.ct-topbar b { color: var(--goldL); font-weight: 600; }

/* ── NAVBAR ── */
.ct-nav {
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
.ct-logo {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-shrink: 0;
  text-decoration: none;
}
.ct-logo-drop {
  width: 22px;
  height: 28px;
  background: linear-gradient(160deg, #B8E0F7, #1A6FA3);
  border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
  position: relative;
}
.ct-logo-drop::after {
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
.ct-logo h1 {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2px;
  line-height: 1;
}
.ct-logo p {
  font-size: 7px;
  color: var(--gold);
  letter-spacing: 2.5px;
  text-transform: uppercase;
  margin-top: 2px;
}
.ct-nav-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
}
.ct-nav-btn {
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
.ct-nav-btn:hover { background: rgba(255,255,255,.06); color: #fff; }
.ct-nav-btn .lbl { font-size: 9px; font-weight: 500; }

/* ── BREADCRUMB ── */
.ct-bread {
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
.ct-bread a { color: var(--ivory); transition: color .15s; }
.ct-bread a:hover { color: var(--navy); }
.ct-bread-sep { color: var(--border); }
.ct-bread-cur { color: var(--navy); font-weight: 600; }

/* ── PAGE ── */
.ct-page {
  max-width: 1140px;
  margin: 0 auto;
  padding: 28px 24px 100px;
  animation: ctFade .35s ease;
}
@keyframes ctFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

/* ── PAGE HEADER ── */
.ct-hdr {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 10px;
}
.ct-hdr-left h1 {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  color: var(--navy);
  line-height: 1;
  margin-bottom: 4px;
}
.ct-hdr-left p { font-size: 12px; color: var(--ivory); }
.ct-continue {
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
}
.ct-continue:hover { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,168,76,.08); }

/* ── LAYOUT ── */
.ct-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
  align-items: start;
}
@media (max-width: 900px) {
  .ct-layout { grid-template-columns: 1fr; }
}

/* ── ITEMS PANEL ── */
.ct-items { display: flex; flex-direction: column; gap: 12px; }

/* ── ITEM CARD ── */
.ct-item {
  background: var(--white);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  padding: 16px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  box-shadow: var(--shadow);
  transition: box-shadow .18s, transform .18s;
  animation: itemIn .3s ease both;
}
.ct-item:hover { box-shadow: var(--shadow-md); }
@keyframes itemIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: none; } }

/* Product image — clickable */
.ct-item-img {
  width: 88px;
  height: 88px;
  background: linear-gradient(135deg, #EEF6FC, #F4F8FB);
  border-radius: 10px;
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  cursor: pointer;
  transition: transform .18s, box-shadow .18s;
  position: relative;
}
.ct-item-img:hover { transform: scale(1.04); box-shadow: var(--shadow-md); }
.ct-item-img img { width: 88px; height: 88px; object-fit: contain; }
.ct-item-img-fallback { font-size: 32px; opacity: .25; }

/* Item body */
.ct-item-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }

.ct-item-cat { font-size: 9px; font-weight: 700; color: var(--blue); letter-spacing: 1.5px; text-transform: uppercase; }

/* Item name — clickable link to product detail */
.ct-item-name {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--navy);
  line-height: 1.2;
  cursor: pointer;
  text-decoration: none;
  display: block;
  transition: color .15s;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.ct-item-name:hover { color: var(--blue); }

.ct-item-unit { font-size: 10px; color: var(--ivory); }

/* Price row */
.ct-item-prices { display: flex; align-items: baseline; gap: 8px; }
.ct-item-price { font-size: 18px; font-weight: 800; color: var(--navy); }
.ct-item-each { font-size: 10px; color: var(--ivory); }

/* Qty + remove row */
.ct-item-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
.ct-qty {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--white);
}
.ct-qty-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 300;
  color: var(--navy);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background .15s;
  font-family: var(--font-body);
}
.ct-qty-btn:hover { background: var(--bg); }
.ct-qty-val {
  width: 36px;
  height: 32px;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--navy);
  border-left: 1px solid var(--border);
  border-right: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ct-subtotal { font-size: 11px; color: var(--ivory); }
.ct-subtotal b { color: var(--navy); font-weight: 700; }
.ct-remove {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--red);
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 7px;
  border: 1px solid rgba(176,58,46,.2);
  background: rgba(176,58,46,.04);
  cursor: pointer;
  transition: background .15s, border-color .15s;
  font-family: var(--font-body);
}
.ct-remove:hover { background: rgba(176,58,46,.09); border-color: rgba(176,58,46,.4); }

/* View detail pill on item */
.ct-view-detail {
  font-size: 10px;
  font-weight: 600;
  color: var(--blue);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 9px;
  border-radius: 20px;
  border: 1px solid rgba(26,111,163,.25);
  background: rgba(26,111,163,.04);
  transition: background .15s;
  align-self: flex-start;
}
.ct-view-detail:hover { background: rgba(26,111,163,.1); }

/* ── EMPTY CART ── */
.ct-empty {
  background: var(--white);
  border-radius: 20px;
  border: 1px solid var(--border);
  padding: 64px 32px;
  text-align: center;
  box-shadow: var(--shadow);
  animation: ctFade .35s ease;
}
.ct-empty-drop {
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
  50% { transform: translateY(-8px); }
}
.ct-empty h3 {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  color: var(--navy);
  margin-bottom: 8px;
}
.ct-empty p { font-size: 13px; color: var(--ivory); margin-bottom: 24px; }
.ct-empty-cta {
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
.ct-empty-cta:hover { opacity: .88; transform: translateY(-2px); }

/* ── ORDER SUMMARY ── */
.ct-summary {
  background: var(--navy);
  border-radius: 18px;
  border: 1px solid rgba(201,168,76,.22);
  overflow: hidden;
  position: sticky;
  top: 78px;
  animation: ctFade .4s ease .1s both;
}
.ct-sum-hdr {
  padding: 20px 22px 16px;
  border-bottom: 1px solid rgba(201,168,76,.12);
}
.ct-sum-hdr h3 {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
  margin-bottom: 2px;
}
.ct-sum-hdr p { font-size: 10px; color: rgba(226,204,138,.55); }
.ct-sum-body { padding: 18px 22px; display: flex; flex-direction: column; gap: 0; }
.ct-sum-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 0;
  border-bottom: 1px solid rgba(255,255,255,.06);
}
.ct-sum-row:last-of-type { border-bottom: none; }
.ct-sum-key { font-size: 12px; color: rgba(226,204,138,.6); }
.ct-sum-val { font-size: 13px; font-weight: 600; color: rgba(255,255,255,.9); }
.ct-sum-val.green { color: #5CBA8A; }
.ct-sum-val.gold  { color: var(--goldL); }
.ct-sum-div { height: 1px; background: rgba(201,168,76,.15); margin: 6px 0; }
.ct-sum-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0 0;
}
.ct-sum-total-key { font-size: 13px; font-weight: 700; color: rgba(226,204,138,.8); }
.ct-sum-total-val {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  color: #fff;
}
.ct-sum-savings {
  font-size: 10px;
  color: #5CBA8A;
  text-align: right;
  margin-top: 3px;
}

/* Checkout btn */
.ct-checkout {
  margin: 16px 22px 20px;
  width: calc(100% - 44px);
  height: 50px;
  background: linear-gradient(135deg, var(--gold), var(--goldL));
  color: var(--navy);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity .15s, transform .15s;
  font-family: var(--font-body);
  box-shadow: 0 6px 20px rgba(201,168,76,.3);
}
.ct-checkout:hover { opacity: .9; transform: translateY(-1px); }

/* Trust pills inside summary */
.ct-trust-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  padding: 0 22px 18px;
}
.ct-trust-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(201,168,76,.18);
  font-size: 9px;
  color: rgba(226,204,138,.6);
}

/* ── PROMO CODE ── */
.ct-promo {
  background: var(--white);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  padding: 16px;
  box-shadow: var(--shadow);
  margin-bottom: 0;
}
.ct-promo h4 { font-size: 12px; font-weight: 700; color: var(--navy); margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
.ct-promo-row { display: flex; gap: 8px; }
.ct-promo-input {
  flex: 1;
  height: 36px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  padding: 0 12px;
  font-size: 12px;
  font-family: var(--font-body);
  color: var(--navy);
  background: var(--bg);
  outline: none;
  transition: border-color .15s;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.ct-promo-input::placeholder { text-transform: none; letter-spacing: 0; color: var(--ivory); }
.ct-promo-input:focus { border-color: var(--gold); }
.ct-promo-apply {
  height: 36px;
  padding: 0 14px;
  background: var(--navy);
  color: var(--gold);
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  font-family: var(--font-body);
  transition: opacity .15s;
}
.ct-promo-apply:hover { opacity: .85; }

/* ── RECOMMENDED ── */
.ct-rec-sec {
  margin-top: 32px;
}
.ct-rec-hdr {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 16px;
}
.ct-rec-hdr h2 {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--navy);
  position: relative;
  padding-bottom: 6px;
}
.ct-rec-hdr h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 36px;
  height: 2px;
  background: linear-gradient(90deg, var(--gold), transparent);
  border-radius: 1px;
}
.ct-see { font-size: 12px; font-weight: 600; color: var(--blue); text-decoration: none; }
.ct-see:hover { text-decoration: underline; }

.ct-rec-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}
.ct-rec-card {
  background: var(--white);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  overflow: hidden;
  cursor: pointer;
  transition: transform .18s, box-shadow .18s;
  text-decoration: none;
  display: flex;
  flex-direction: column;
}
.ct-rec-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
.ct-rec-img {
  height: 130px;
  background: #EEF6FC;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.ct-rec-img img { width: 100%; height: 100%; object-fit: contain; transition: transform .3s; }
.ct-rec-card:hover .ct-rec-img img { transform: scale(1.05); }
.ct-rec-fallback { font-size: 32px; opacity: .25; }
.ct-rec-info { padding: 10px 12px 13px; }
.ct-rec-cat { font-size: 9px; font-weight: 600; color: var(--blue); letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 3px; }
.ct-rec-name {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  color: var(--navy);
  line-height: 1.2;
  margin-bottom: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ct-rec-price { font-size: 14px; font-weight: 700; color: var(--navy); }

/* ── TOAST ── */
.ct-toast {
  position: fixed;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: var(--navy);
  color: #fff;
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid rgba(201,168,76,.3);
  box-shadow: 0 8px 28px rgba(0,0,0,.25);
  z-index: 999;
  white-space: nowrap;
  opacity: 0;
  transition: opacity .25s, transform .25s;
  pointer-events: none;
}
.ct-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

/* ── MOBILE BOTTOM NAV ── */
.ct-bnav {
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
  .ct-bnav { display: flex; }
  .ct-page { padding-bottom: 100px; }
  .ct-topbar { display: none; }
}
.ct-nav-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-decoration: none;
  padding: 4px;
}
.ct-nav-tab .ti { font-size: 19px; }
.ct-nav-tab-lbl { font-size: 9px; color: #C0B8A8; font-weight: 500; }
.ct-nav-tab.active .ct-nav-tab-lbl { color: var(--navy); font-weight: 700; }
.ct-nav-bar { width: 16px; height: 2px; background: var(--gold); border-radius: 2px; }

/* ── SPIN ── */
.ct-spin-wrap { padding: 60px; display: flex; justify-content: center; }
.ct-spin {
  width: 28px; height: 28px;
  border: 2.5px solid var(--border);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── REMOVE CONFIRM ── */
.ct-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
  animation: ovIn .2s ease;
}
@keyframes ovIn { from { opacity: 0; } to { opacity: 1; } }
.ct-confirm {
  background: var(--white);
  border-radius: 18px;
  padding: 28px;
  max-width: 340px;
  width: 90%;
  text-align: center;
  animation: confIn .25s cubic-bezier(.22,1,.36,1);
}
@keyframes confIn { from { transform: scale(.92); opacity: 0; } to { transform: none; opacity: 1; } }
.ct-confirm h4 {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--navy);
  margin-bottom: 8px;
}
.ct-confirm p { font-size: 12px; color: var(--ivory); margin-bottom: 20px; }
.ct-confirm-btns { display: flex; gap: 10px; }
.ct-conf-cancel {
  flex: 1;
  height: 42px;
  border-radius: 9px;
  background: var(--bg);
  border: 1.5px solid var(--border);
  font-size: 12px;
  font-weight: 600;
  color: var(--navy);
  cursor: pointer;
  font-family: var(--font-body);
  transition: background .15s;
}
.ct-conf-cancel:hover { background: var(--border); }
.ct-conf-remove {
  flex: 1;
  height: 42px;
  border-radius: 9px;
  background: var(--red);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  font-family: var(--font-body);
  transition: opacity .15s;
}
.ct-conf-remove:hover { opacity: .88; }
`;

// ── Component ─────────────────────────────────────────────────────────────────
export default function Cart() {
  const navigate = useNavigate();

  const [user, setUser]         = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [toast, setToast]       = useState({ show: false, msg: "" });
  const [confirmRemove, setConfirmRemove] = useState(null); // item to confirm remove

  // Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setLoading(false);
    });
    return unsub;
  }, []);

  // Real-time cart listener
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      collection(db, "carts", user.uid, "items"),
      (snap) => {
        setCartItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }
    );
    return unsub;
  }, [user]);

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2500);
  };

  // Remove item (with confirm dialog)
  const confirmAndRemove = (item) => setConfirmRemove(item);
  const doRemove = async () => {
    if (!confirmRemove) return;
    await deleteDoc(doc(db, "carts", user.uid, "items", confirmRemove.id));
    showToast("🗑 Item removed");
    setConfirmRemove(null);
  };

  // Qty controls
  const increaseQty = async (item) => {
    await updateDoc(doc(db, "carts", user.uid, "items", item.id), {
      quantity: item.quantity + 1,
    });
  };

  const decreaseQty = async (item) => {
    if (item.quantity === 1) {
      setConfirmRemove(item);
      return;
    }
    await updateDoc(doc(db, "carts", user.uid, "items", item.id), {
      quantity: item.quantity - 1,
    });
  };

  // Promo code
  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === "RICHDROP10") {
      setPromoApplied(true);
      showToast("🎉 Promo applied! 10% off");
    } else {
      showToast("❌ Invalid promo code");
    }
  };

  // Totals
  const subtotal    = cartItems.reduce((s, i) => s + (i.price ?? 0) * (i.quantity ?? 1), 0);
  const discount    = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const delivery    = subtotal >= 999 ? 0 : 99;
  const total       = subtotal - discount + delivery;
  const totalItems  = cartItems.reduce((s, i) => s + (i.quantity ?? 1), 0);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <nav className="ct-nav">
          <Link to="/" className="ct-logo">
            <div className="ct-logo-drop" />
            <div><h1>RichDrop</h1><p>Pure Water Solutions</p></div>
          </Link>
        </nav>
        <div className="ct-page">
          <div className="ct-spin-wrap"><div className="ct-spin" /></div>
        </div>
      </>
    );
  }

  // ── Not signed in ────────────────────────────────────────────────────────
  if (!user) {
    return (
      <>
        <style>{CSS}</style>
        <nav className="ct-nav">
          <Link to="/" className="ct-logo">
            <div className="ct-logo-drop" />
            <div><h1>RichDrop</h1><p>Pure Water Solutions</p></div>
          </Link>
        </nav>
        <div className="ct-page">
          <div className="ct-empty">
            <div className="ct-empty-drop" />
            <h3>Sign in to view your cart</h3>
            <p>Your cart items are saved when you're signed in.</p>
            <Link to="/login" className="ct-empty-cta">Sign In →</Link>
          </div>
        </div>
      </>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>

      {/* Topbar */}
      <div className="ct-topbar">
        {[["⚡","Same-day","service"],["🚚","Free delivery","₹999+"],["✅","ISI","Certified"],["🎧","24/7","Support"]].map(([ic,b,a])=>(
          <span key={b}>{ic} <b>{b}</b> {a}</span>
        ))}
      </div>

      {/* Navbar */}
      <nav className="ct-nav">
        <Link to="/" className="ct-logo">
          <div className="ct-logo-drop" />
          <div><h1>RichDrop</h1><p>Pure Water Solutions</p></div>
        </Link>
        <div className="ct-nav-right">
          <Link to="/user" className="ct-nav-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span className="lbl">Home</span>
          </Link>
          <Link to="/wishlist" className="ct-nav-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
            <span className="lbl">Wishlist</span>
          </Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="ct-bread">
        <Link to="/user">Home</Link>
        <span className="ct-bread-sep">›</span>
        <span className="ct-bread-cur">My Cart</span>
      </div>

      {/* Page */}
      <div className="ct-page">

        {/* Header */}
        <div className="ct-hdr">
          <div className="ct-hdr-left">
            <h1>My Cart</h1>
            <p>{totalItems} item{totalItems !== 1 ? "s" : ""} in your cart</p>
          </div>
          <Link to="/user" className="ct-continue">
            ← Continue Shopping
          </Link>
        </div>

        {/* Empty */}
        {cartItems.length === 0 ? (
          <div className="ct-empty">
            <div className="ct-empty-drop" />
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything yet. Explore our premium RO range.</p>
            <Link to="/user" className="ct-empty-cta">Shop Products →</Link>
          </div>
        ) : (
          <div className="ct-layout">

            {/* ── LEFT: Items + Promo ── */}
            <div>
              <div className="ct-items">
                {cartItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="ct-item"
                    style={{ animationDelay: `${idx * 0.06}s` }}
                  >
                    {/* Product image → navigate to product detail */}
                    <div
                      className="ct-item-img"
                      onClick={() => item.productId && navigate(`/product/${item.productId}`)}
                      title="View product details"
                    >
                      {item.image
                        ? <img src={item.image} alt={item.name} />
                        : <div className="ct-item-img-fallback">💧</div>
                      }
                    </div>

                    <div className="ct-item-body">
                      {item.category && (
                        <div className="ct-item-cat">{item.category}</div>
                      )}

                      {/* Product name → navigate to product detail */}
                      <span
                        className="ct-item-name"
                        onClick={() => item.productId && navigate(`/product/${item.productId}`)}
                        title="View product details"
                      >
                        {item.name ?? "Product"}
                      </span>

                      <div className="ct-item-prices">
                        <div className="ct-item-price">₹{item.price ?? 0}</div>
                        <div className="ct-item-each">per unit</div>
                      </div>

                      <div className="ct-item-actions">
                        {/* Qty stepper */}
                        <div className="ct-qty">
                          <button className="ct-qty-btn" onClick={() => decreaseQty(item)}>−</button>
                          <div className="ct-qty-val">{item.quantity ?? 1}</div>
                          <button className="ct-qty-btn" onClick={() => increaseQty(item)}>+</button>
                        </div>

                        {/* Subtotal */}
                        <div className="ct-subtotal">
                          Subtotal: <b>₹{((item.price ?? 0) * (item.quantity ?? 1)).toLocaleString()}</b>
                        </div>

                        {/* Remove */}
                        <button className="ct-remove" onClick={() => confirmAndRemove(item)}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                          Remove
                        </button>
                      </div>

                      {/* View detail link */}
                      {item.productId && (
                        <Link
                          to={`/product/${item.productId}`}
                          className="ct-view-detail"
                        >
                          View full details →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="ct-promo" style={{ marginTop: 16 }}>
                <h4>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth="2.5">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                    <line x1="7" y1="7" x2="7.01" y2="7"/>
                  </svg>
                  Promo Code
                  {promoApplied && <span style={{ fontSize: 10, color: T.green, marginLeft: 6, fontWeight: 700 }}>✓ Applied</span>}
                </h4>
                <div className="ct-promo-row">
                  <input
                    className="ct-promo-input"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={promoApplied}
                  />
                  <button className="ct-promo-apply" onClick={applyPromo} disabled={promoApplied}>
                    {promoApplied ? "Applied ✓" : "Apply"}
                  </button>
                </div>
                <div style={{ fontSize: 10, color: T.ivory, marginTop: 6 }}>
                  Try <b style={{ color: T.navy }}>RICHDROP10</b> for 10% off
                </div>
              </div>
            </div>

            {/* ── RIGHT: Order Summary ── */}
            <div>
              <div className="ct-summary">
                <div className="ct-sum-hdr">
                  <h3>Order Summary</h3>
                  <p>{totalItems} item{totalItems !== 1 ? "s" : ""} · {cartItems.length} product{cartItems.length !== 1 ? "s" : ""}</p>
                </div>

                <div className="ct-sum-body">
                  <div className="ct-sum-row">
                    <span className="ct-sum-key">Subtotal</span>
                    <span className="ct-sum-val">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="ct-sum-row">
                    <span className="ct-sum-key">Delivery</span>
                    <span className={`ct-sum-val ${delivery === 0 ? "green" : ""}`}>
                      {delivery === 0 ? "FREE" : `₹${delivery}`}
                    </span>
                  </div>
                  {promoApplied && (
                    <div className="ct-sum-row">
                      <span className="ct-sum-key">Promo (RICHDROP10)</span>
                      <span className="ct-sum-val green">− ₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="ct-sum-row">
                    <span className="ct-sum-key">Tax (GST incl.)</span>
                    <span className="ct-sum-val">Included</span>
                  </div>

                  <div className="ct-sum-div" />

                  <div className="ct-sum-total">
                    <span className="ct-sum-total-key">TOTAL</span>
                    <span className="ct-sum-total-val">₹{total.toLocaleString()}</span>
                  </div>
                  {(discount > 0 || delivery === 0) && (
                    <div className="ct-sum-savings">
                      🎉 You're saving ₹{(discount + (delivery === 0 && subtotal >= 999 ? 99 : 0)).toLocaleString()} on this order
                    </div>
                  )}
                </div>

                <button
                  className="ct-checkout"
                  onClick={() => navigate("/checkout")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.navy} strokeWidth="2.5">
                    <rect x="1" y="4" width="22" height="16" rx="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  PROCEED TO CHECKOUT
                </button>

                <div className="ct-trust-row">
                  {[["🔒","Secure Pay"],["🚚","Fast Delivery"],["🔄","Easy Returns"]].map(([ic, tx]) => (
                    <div key={tx} className="ct-trust-pill">{ic} {tx}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* You may also like — recommended products placeholder */}
        {cartItems.length > 0 && (
          <div className="ct-rec-sec">
            <div className="ct-rec-hdr">
              <h2>You May Also Like</h2>
              <Link to="/user" className="ct-see">View all →</Link>
            </div>
            {/* Recommended grid — navigates to product detail on click */}
            <div className="ct-rec-grid">
              {[
                { icon: "💧", name: "RO Membrane Filter", cat: "Spare Parts", price: 899 },
                { icon: "⚙️", name: "Pre-Filter Set", cat: "Filters", price: 349 },
                { icon: "🔧", name: "UV Lamp 11W", cat: "UV Systems", price: 599 },
                { icon: "💡", name: "TDS Meter Pro", cat: "Accessories", price: 249 },
              ].map((r) => (
                <Link key={r.name} to="/user" className="ct-rec-card">
                  <div className="ct-rec-img">
                    <div className="ct-rec-fallback">{r.icon}</div>
                  </div>
                  <div className="ct-rec-info">
                    <div className="ct-rec-cat">{r.cat}</div>
                    <div className="ct-rec-name">{r.name}</div>
                    <div className="ct-rec-price">₹{r.price}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="ct-bnav">
        {[
          { label: "Home",   icon: "🏠", to: "/user" },
          { label: "Search", icon: "🔍", to: "/products" },
          { label: "Cart",   icon: "🛒", to: "/cart",   active: true },
          { label: "Service",icon: "🔧", to: "/service" },
          { label: "Profile",icon: "👤", to: "/profile" },
        ].map((t) => (
          <Link key={t.label} to={t.to} className={`ct-nav-tab ${t.active ? "active" : ""}`}>
            <div className="ti">{t.icon}</div>
            <div className="ct-nav-tab-lbl">{t.label}</div>
            {t.active && <div className="ct-nav-bar" />}
          </Link>
        ))}
      </nav>

      {/* Remove confirm dialog */}
      {confirmRemove && (
        <div className="ct-overlay" onClick={() => setConfirmRemove(null)}>
          <div className="ct-confirm" onClick={(e) => e.stopPropagation()}>
            <h4>Remove Item?</h4>
            <p>Remove <b>{confirmRemove.name}</b> from your cart?</p>
            <div className="ct-confirm-btns">
              <button className="ct-conf-cancel" onClick={() => setConfirmRemove(null)}>Keep It</button>
              <button className="ct-conf-remove" onClick={doRemove}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`ct-toast ${toast.show ? "show" : ""}`}>{toast.msg}</div>
    </>
  );
}