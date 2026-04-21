import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

// ── Design Tokens (matches Cart / RichDrop system) ────────────────────────────
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
  min-height: 100vh;
}
a { text-decoration: none; color: inherit; }
button { font-family: var(--font-body); cursor: pointer; border: none; background: none; }
img { display: block; }

::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

/* ── TOPBAR ── */
.ud-topbar {
  background: var(--navy);
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
}
.ud-topbar span {
  font-size: 10px;
  color: rgba(226,204,138,.7);
  letter-spacing: .5px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.ud-topbar b { color: var(--goldL); font-weight: 600; }

/* ── NAVBAR ── */
.ud-nav {
  background: var(--navy);
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 12px;
  position: sticky;
  top: 0;
  z-index: 300;
  border-bottom: 1px solid rgba(201,168,76,.12);
}

/* Logo */
.ud-logo {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-shrink: 0;
  text-decoration: none;
  cursor: pointer;
}
.ud-logo-drop {
  width: 22px; height: 28px;
  background: linear-gradient(160deg, #B8E0F7, #1A6FA3);
  border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
  position: relative;
}
.ud-logo-drop::after {
  content: '';
  position: absolute;
  top: -4px; left: 50%;
  transform: translateX(-50%);
  width: 5px; height: 5px;
  background: var(--gold);
  border-radius: 50%;
}
.ud-logo h1 {
  font-family: var(--font-display);
  font-size: 20px; font-weight: 700;
  color: #fff; letter-spacing: 2px; line-height: 1;
}
.ud-logo p {
  font-size: 7px; color: var(--gold);
  letter-spacing: 2.5px; text-transform: uppercase; margin-top: 2px;
}

/* Search */
.ud-search-wrap {
  flex: 1;
  display: flex;
  max-width: 600px;
  height: 38px;
  border-radius: 9px;
  overflow: hidden;
  border: 1.5px solid rgba(201,168,76,.3);
  transition: border-color .15s;
}
.ud-search-wrap:focus-within { border-color: var(--gold); }
.ud-search-cat {
  background: rgba(255,255,255,.07);
  border: none;
  border-right: 1px solid rgba(201,168,76,.2);
  padding: 0 10px;
  font-size: 11px;
  color: rgba(255,255,255,.8);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  outline: none;
  height: 100%;
  font-family: var(--font-body);
  min-width: 60px;
  max-width: 110px;
}
.ud-search-cat option { background: var(--navy); color: #fff; }
.ud-search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 0 12px;
  font-size: 13px;
  font-family: var(--font-body);
  color: var(--navy);
  background: var(--white);
  min-width: 0;
}
.ud-search-input::placeholder { color: var(--ivory); }
.ud-search-btn {
  background: var(--gold);
  border: none;
  padding: 0 16px;
  font-size: 14px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background .15s;
  color: var(--navy);
  font-weight: 700;
  display: flex;
  align-items: center;
}
.ud-search-btn:hover { background: var(--goldL); }

/* Nav right */
.ud-nav-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.ud-nav-btn {
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
  cursor: pointer;
}
.ud-nav-btn:hover { background: rgba(255,255,255,.06); color: #fff; }
.ud-nav-btn .lbl { font-size: 9px; font-weight: 500; }
.ud-cart-badge {
  position: absolute;
  top: 2px; right: 4px;
  background: var(--gold);
  color: var(--navy);
  font-size: 9px;
  font-weight: 800;
  border-radius: 50%;
  min-width: 16px; height: 16px;
  display: flex; align-items: center; justify-content: center;
  padding: 0 3px; line-height: 1;
}

/* ── SUBNAV ── */
.ud-subnav {
  background: var(--navy2);
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 2px;
  border-bottom: 1px solid rgba(201,168,76,.1);
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.ud-subnav::-webkit-scrollbar { display: none; }
.ud-subnav-item {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(226,204,138,.7);
  white-space: nowrap;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color .15s, border-color .15s;
  text-decoration: none;
  letter-spacing: .3px;
}
.ud-subnav-item:hover { color: var(--goldL); }
.ud-subnav-item.active { color: var(--goldL); border-bottom-color: var(--gold); }

/* ── HERO ── */
.ud-hero {
  position: relative;
  background: linear-gradient(150deg, var(--navy2) 0%, var(--navy) 60%, #060E15 100%);
  overflow: hidden;
  min-height: 320px;
  display: flex;
  align-items: center;
}
.ud-hero-bg {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 55% 70% at 75% 50%, rgba(201,168,76,.09) 0%, transparent 60%),
    radial-gradient(ellipse 40% 60% at 15% 30%, rgba(26,111,163,.08) 0%, transparent 50%);
  pointer-events: none;
}
.ud-hero-drops {
  position: absolute;
  right: 60px; top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 18px;
  align-items: flex-end;
}
.ud-hero-drop {
  background: linear-gradient(160deg, rgba(184,224,247,.35), rgba(26,111,163,.35));
  border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
  border: 1px solid rgba(201,168,76,.2);
  animation: floatDrop 3s ease-in-out infinite;
}
.ud-hero-drop:nth-child(1) { width: 50px; height: 64px; animation-delay: 0s; }
.ud-hero-drop:nth-child(2) { width: 70px; height: 90px; animation-delay: .7s; }
.ud-hero-drop:nth-child(3) { width: 40px; height: 52px; animation-delay: 1.4s; }
@keyframes floatDrop {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.ud-hero-content {
  position: relative; z-index: 1;
  padding: 48px;
  max-width: 560px;
}
.ud-hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(201,168,76,.13);
  border: 1px solid rgba(201,168,76,.3);
  border-radius: 20px;
  padding: 4px 13px;
  font-size: 10px;
  font-weight: 700;
  color: var(--goldL);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 16px;
}
.ud-hero-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--gold);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(.65)} }
.ud-hero h1 {
  font-family: var(--font-display);
  font-size: clamp(28px, 4vw, 46px);
  font-weight: 700;
  color: #fff;
  line-height: 1.1;
  margin-bottom: 12px;
}
.ud-hero h1 em { font-style: normal; color: var(--goldL); }
.ud-hero p {
  font-size: 13px;
  color: rgba(255,255,255,.55);
  line-height: 1.7;
  margin-bottom: 26px;
}
.ud-hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, var(--gold), var(--goldL));
  color: var(--navy);
  font-size: 12px;
  font-weight: 800;
  padding: 12px 26px;
  border-radius: 10px;
  cursor: pointer;
  border: none;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  transition: opacity .15s, transform .15s;
  text-decoration: none;
  box-shadow: 0 6px 20px rgba(201,168,76,.3);
}
.ud-hero-cta:hover { opacity: .9; transform: translateY(-2px); color: var(--navy); }

/* ── PAGE BODY ── */
.ud-body {
  max-width: 1180px;
  margin: 0 auto;
  padding: 28px 24px 80px;
  animation: pageFade .35s ease;
}
@keyframes pageFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

/* ── SECTION HEADER ── */
.ud-sec-hdr {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}
.ud-sec-hdr h2 {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  color: var(--navy);
  position: relative;
  padding-bottom: 6px;
}
.ud-sec-hdr h2::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0;
  width: 36px; height: 2px;
  background: linear-gradient(90deg, var(--gold), transparent);
  border-radius: 1px;
}
.ud-sec-hdr-count { font-size: 12px; color: var(--ivory); }
.ud-see-all {
  font-size: 12px; font-weight: 600;
  color: var(--blue); text-decoration: none;
}
.ud-see-all:hover { text-decoration: underline; }

/* ── CATEGORY CARDS ── */
.ud-cats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 28px;
}
.ud-cat-card {
  background: var(--white);
  border-radius: var(--radius);
  border: 1.5px solid var(--border);
  box-shadow: var(--shadow);
  padding: 16px 12px 14px;
  cursor: pointer;
  transition: box-shadow .18s, border-color .18s, transform .18s;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.ud-cat-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--gold);
  transform: translateY(-2px);
}
.ud-cat-card.active {
  border-color: var(--gold);
  background: #FDF9EF;
}
.ud-cat-icon {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
  transition: background .15s;
}
.ud-cat-card.active .ud-cat-icon { background: rgba(201,168,76,.15); }
.ud-cat-name {
  font-size: 11px; font-weight: 600;
  color: var(--navy); line-height: 1.3;
}

/* ── DEALS STRIP ── */
.ud-deals {
  background: var(--navy);
  border-radius: 18px;
  border: 1px solid rgba(201,168,76,.22);
  padding: 20px 22px;
  margin-bottom: 28px;
  overflow: hidden;
}
.ud-deals-hdr {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.ud-deals-hdr h3 {
  font-family: var(--font-display);
  font-size: 20px; font-weight: 700;
  color: #fff; letter-spacing: .5px;
}
.ud-deals-count {
  font-size: 10px;
  color: rgba(226,204,138,.55);
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(201,168,76,.2);
  border-radius: 20px;
  padding: 3px 10px;
}
.ud-deals-row {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: thin;
  scrollbar-color: rgba(201,168,76,.3) transparent;
}
.ud-deal-chip {
  flex-shrink: 0;
  background: rgba(255,255,255,.05);
  border-radius: 12px;
  border: 1px solid rgba(201,168,76,.2);
  padding: 12px 14px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  min-width: 130px;
  transition: border-color .15s, background .15s;
}
.ud-deal-chip:hover { border-color: var(--gold); background: rgba(201,168,76,.08); }
.ud-deal-chip-img {
  width: 56px; height: 56px;
  display: flex; align-items: center; justify-content: center;
  font-size: 26px; opacity: .5;
}
.ud-deal-chip img { width: 56px; height: 56px; object-fit: contain; }
.ud-deal-name { font-size: 11px; font-weight: 600; color: rgba(255,255,255,.85); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px; }
.ud-deal-off { font-size: 12px; font-weight: 800; color: var(--goldL); }
.ud-deal-price { font-size: 10px; color: rgba(226,204,138,.5); }

/* ── PRODUCT GRID ── */
.ud-prod-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}
@media (max-width: 1100px) { .ud-prod-grid { grid-template-columns: repeat(3,1fr); } }
@media (max-width: 780px)  { .ud-prod-grid { grid-template-columns: repeat(2,1fr); gap: 12px; } }
@media (max-width: 420px)  { .ud-prod-grid { grid-template-columns: 1fr; } }

/* ── PRODUCT CARD ── */
.ud-pcard {
  background: var(--white);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: box-shadow .2s, transform .2s;
  animation: cardIn .4s ease both;
  position: relative;
}
.ud-pcard:hover { box-shadow: var(--shadow-md); transform: translateY(-3px); }
@keyframes cardIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }

/* Badges */
.ud-badge-wrap {
  position: absolute;
  top: 9px; left: 9px;
  display: flex; flex-direction: column; gap: 4px;
  z-index: 2;
}
.ud-badge {
  display: inline-flex; align-items: center;
  font-size: 9px; font-weight: 800;
  padding: 3px 8px;
  border-radius: 5px;
  letter-spacing: .5px;
  text-transform: uppercase;
  white-space: nowrap;
}
.ud-badge.deal  { background: var(--red); color: #fff; }
.ud-badge.new   { background: var(--navy); color: var(--goldL); border: 1px solid rgba(201,168,76,.3); }
.ud-badge.top   { background: linear-gradient(135deg,var(--gold),var(--goldL)); color: var(--navy); }
.ud-badge.prime { background: var(--blue); color: #fff; }

/* Card image */
.ud-pcard-img {
  background: linear-gradient(135deg, #EEF6FC, #F4F8FB);
  height: 190px;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; flex-shrink: 0;
  position: relative;
}
.ud-pcard-img img {
  width: 100%; height: 100%;
  object-fit: contain; padding: 12px;
  transition: transform .3s ease;
}
.ud-pcard:hover .ud-pcard-img img { transform: scale(1.06); }
.ud-pcard-img-fallback { font-size: 48px; opacity: .15; }

/* Wishlist */
.ud-wish {
  position: absolute; top: 9px; right: 9px;
  width: 28px; height: 28px;
  background: var(--white);
  border-radius: 50%;
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: border-color .15s, background .15s;
  z-index: 2;
  font-size: 13px;
}
.ud-wish:hover { border-color: var(--gold); background: #FDF9EF; }

/* Card body */
.ud-pcard-body { padding: 12px 14px 16px; flex: 1; display: flex; flex-direction: column; gap: 5px; }
.ud-pcard-cat { font-size: 9px; font-weight: 700; color: var(--blue); letter-spacing: 1.5px; text-transform: uppercase; }
.ud-pcard-name {
  font-family: var(--font-display);
  font-size: 15px; font-weight: 700;
  color: var(--navy); line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

/* Stars */
.ud-stars { display: flex; align-items: center; gap: 2px; }
.ud-star { font-size: 11px; color: var(--gold); }
.ud-star.empty { color: var(--border); }
.ud-review-count { font-size: 10px; color: var(--ivory); margin-left: 3px; }

/* Price */
.ud-price-row { display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; }
.ud-price-main { font-size: 20px; font-weight: 800; color: var(--navy); line-height: 1; }
.ud-price-mrp { font-size: 11px; color: var(--ivory); text-decoration: line-through; }
.ud-price-save { font-size: 10px; color: var(--green); font-weight: 700; background: rgba(46,125,79,.08); padding: 2px 6px; border-radius: 4px; }

.ud-stock { font-size: 10px; color: var(--green); font-weight: 600; }
.ud-stock-low { font-size: 10px; color: var(--gold); font-weight: 600; }

/* Add to cart */
.ud-add-btn {
  width: 100%;
  height: 36px;
  margin-top: 8px;
  background: var(--navy);
  color: var(--gold);
  border-radius: 9px;
  font-size: 11px; font-weight: 700;
  letter-spacing: 1px;
  border: none;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  transition: background .15s, color .15s, transform .15s;
  cursor: pointer;
  font-family: var(--font-body);
}
.ud-add-btn:hover { background: var(--navy2); transform: translateY(-1px); }
.ud-add-btn.added {
  background: linear-gradient(135deg, var(--green), #3DAB68);
  color: #fff; letter-spacing: .5px;
}

/* View detail */
.ud-view-btn {
  width: 100%;
  height: 30px;
  margin-top: 5px;
  background: transparent;
  color: var(--blue);
  border-radius: 9px;
  font-size: 11px; font-weight: 600;
  border: 1.5px solid rgba(26,111,163,.25);
  display: flex; align-items: center; justify-content: center; gap: 4px;
  transition: background .15s, border-color .15s;
  cursor: pointer;
  font-family: var(--font-body);
}
.ud-view-btn:hover { background: rgba(26,111,163,.06); border-color: rgba(26,111,163,.5); }

/* ── EMPTY / LOADING ── */
.ud-empty-state {
  grid-column: 1/-1;
  text-align: center;
  padding: 64px 24px;
  background: var(--white);
  border-radius: 20px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}
.ud-empty-drop {
  width: 70px; height: 88px;
  background: linear-gradient(170deg, #E8F6FF 0%, #5BB8E8 50%, #1A6FA3 100%);
  border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
  margin: 0 auto 18px;
  opacity: .3;
  animation: floatDrop 3s ease-in-out infinite;
}
.ud-empty-state h3 {
  font-family: var(--font-display);
  font-size: 24px; font-weight: 700; color: var(--navy); margin-bottom: 8px;
}
.ud-empty-state p { font-size: 12px; color: var(--ivory); }

.ud-loading-wrap {
  grid-column: 1/-1;
  display: flex; align-items: center; justify-content: center;
  padding: 64px; gap: 12px;
  font-size: 13px; color: var(--ivory);
  background: var(--white);
  border-radius: 20px;
  border: 1px solid var(--border);
}
.ud-spin {
  width: 26px; height: 26px;
  border: 2.5px solid var(--border);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin .75s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── TOAST ── */
.ud-toast {
  position: fixed;
  bottom: 90px; right: 24px;
  background: var(--navy);
  color: #fff;
  padding: 12px 18px;
  border-radius: 12px;
  font-size: 13px; font-weight: 500;
  border-left: 3px solid var(--gold);
  box-shadow: 0 8px 28px rgba(15,28,42,.25);
  z-index: 9999;
  max-width: 300px;
  opacity: 0;
  transform: translateY(14px);
  transition: opacity .25s, transform .25s;
  pointer-events: none;
}
.ud-toast.show { opacity: 1; transform: translateY(0); }

/* ── FOOTER BACK TO TOP ── */
.ud-footer-top {
  background: var(--navy2);
  text-align: center;
  padding: 14px;
  font-size: 12px;
  color: rgba(226,204,138,.7);
  cursor: pointer;
  font-weight: 600;
  letter-spacing: .5px;
  transition: background .15s;
}
.ud-footer-top:hover { background: var(--navy); color: var(--goldL); }
.ud-footer {
  background: var(--navy);
  padding: 20px;
  text-align: center;
  font-size: 11px;
  color: rgba(255,255,255,.4);
  letter-spacing: .5px;
  border-top: 1px solid rgba(201,168,76,.1);
}
.ud-footer b { color: rgba(226,204,138,.7); }

/* ── TRUST ROW ── */
.ud-trust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 14px 0 20px;
  border-top: 1px solid var(--border);
  margin-top: 4px;
}
.ud-trust-pill {
  display: flex; align-items: center; gap: 4px;
  padding: 5px 12px;
  border-radius: 20px;
  background: var(--white);
  border: 1px solid var(--border);
  font-size: 10px; color: var(--ivory);
  box-shadow: var(--shadow);
}

/* ── MOBILE BOTTOM NAV ── */
.ud-bnav {
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
  .ud-bnav { display: flex; }
  .ud-body { padding-bottom: 100px; }
  .ud-topbar { display: none; }
  .ud-hero-drops { display: none; }
  .ud-hero-content { padding: 32px 20px; }
  .ud-cats-grid { grid-template-columns: repeat(auto-fill, minmax(90px,1fr)); gap: 8px; }
}
.ud-nav-tab {
  flex: 1;
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  text-decoration: none;
  padding: 4px;
}
.ud-nav-tab .ti { font-size: 19px; }
.ud-nav-tab-lbl { font-size: 9px; color: #C0B8A8; font-weight: 500; }
.ud-nav-tab.active .ud-nav-tab-lbl { color: var(--navy); font-weight: 700; }
.ud-nav-bar { width: 16px; height: 2px; background: var(--gold); border-radius: 2px; }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
const CAT_META = {
  all:         { emoji: "🏠", label: "All" },
  skincare:    { emoji: "✨", label: "Skincare" },
  haircare:    { emoji: "💆", label: "Haircare" },
  fragrance:   { emoji: "🌸", label: "Fragrance" },
  wellness:    { emoji: "🌿", label: "Wellness" },
  accessories: { emoji: "💎", label: "Accessories" },
  default:     { emoji: "📦", label: "" },
};
const getCatMeta = (name = "") =>
  CAT_META[name.toLowerCase()] ?? { ...CAT_META.default, label: name };

const hashNum = (str = "", max = 100) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h) % max;
};

const Stars = ({ id }) => {
  const rating = 3.5 + hashNum(id, 15) / 10;
  return (
    <div className="ud-stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`ud-star ${rating < s - 0.25 ? "empty" : ""}`}>★</span>
      ))}
      <span className="ud-review-count">({(hashNum(id + "r", 900) + 12).toLocaleString()})</span>
    </div>
  );
};

const PriceBlock = ({ price = 0, id }) => {
  const hasDiscount = hashNum(id + "d", 3) > 0;
  const discPct     = hasDiscount ? 10 + hashNum(id + "p", 40) : 0;
  const mrp         = hasDiscount ? Math.round(price * (100 / (100 - discPct))) : null;
  return (
    <div className="ud-price-row">
      <span className="ud-price-main">₹{(price ?? 0).toLocaleString("en-IN")}</span>
      {hasDiscount && mrp && (
        <>
          <span className="ud-price-mrp">₹{mrp.toLocaleString("en-IN")}</span>
          <span className="ud-price-save">{discPct}% off</span>
        </>
      )}
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function UserDashboard() {
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [search,      setSearch]      = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category,    setCategory]    = useState("All");
  const [loading,     setLoading]     = useState(true);
  const [cartCount,   setCartCount]   = useState(0);
  const [addedIds,    setAddedIds]    = useState({});
  const [toast,       setToast]       = useState({ show: false, msg: "" });

  const navigate = useNavigate();

  // 🔥 Real-time products
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  // 🔥 Real-time categories
  useEffect(() => {
    return onSnapshot(collection(db, "categories"), (snap) => {
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2800);
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    try {
      await addDoc(collection(db, "cart"), {
        productId: product.id,
        name:      product.name,
        price:     product.price,
        image:     product.image ?? null,
        quantity:  1,
        addedAt:   new Date(),
      });
      setCartCount((n) => n + 1);
      setAddedIds((p) => ({ ...p, [product.id]: true }));
      setTimeout(() => setAddedIds((p) => ({ ...p, [product.id]: false })), 2000);
      showToast(`✅ Added "${product.name}" to cart`);
    } catch (err) {
      showToast("❌ " + err.message);
    }
  };

  const allCategories = [{ id: "all", name: "All" }, ...categories];
  const catOptions    = ["All Departments", ...categories.map((c) => c.name)];

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q);
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  const deals = products.filter((p) => hashNum(p.id + "d", 3) > 0).slice(0, 8);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <>
      <style>{CSS}</style>

      {/* ── Topbar ── */}
      <div className="ud-topbar">
        {[["⚡","Same-day","service"],["🚚","Free delivery","₹999+"],["✅","ISI","Certified"],["🎧","24/7","Support"]].map(([ic,b,a])=>(
          <span key={b}>{ic} <b>{b}</b> {a}</span>
        ))}
      </div>

      {/* ── Navbar ── */}
      <nav className="ud-nav">
        {/* Logo */}
        <div className="ud-logo" onClick={() => navigate("/user")}>
          <div className="ud-logo-drop" />
          <div><h1>RichDrop</h1><p>Pure Water Solutions</p></div>
        </div>

        {/* Search */}
        <form className="ud-search-wrap" onSubmit={handleSearch} style={{ display: "flex" }}>
          <select
            className="ud-search-cat"
            onChange={(e) => {
              const val = e.target.value;
              setCategory(val === "All Departments" ? "All" : val);
            }}
          >
            {catOptions.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input
            className="ud-search-input"
            type="text"
            placeholder="Search RichDrop…"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              if (!e.target.value) setSearch("");
            }}
          />
          <button className="ud-search-btn" type="submit">🔍</button>
        </form>

        {/* Nav right */}
        <div className="ud-nav-right">
          <Link to="/profile" className="ud-nav-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <span className="lbl">Account</span>
          </Link>
          <Link to="/orders" className="ud-nav-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
            </svg>
            <span className="lbl">Orders</span>
          </Link>
          <Link to="/wishlist" className="ud-nav-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
            <span className="lbl">Wishlist</span>
          </Link>
          <Link to="/cart" className="ud-nav-btn">
            {cartCount > 0 && <span className="ud-cart-badge">{cartCount}</span>}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 001.97 1.61h9.72a2 2 0 001.97-1.61L23 6H6"/>
            </svg>
            <span className="lbl">Cart</span>
          </Link>
        </div>
      </nav>

      {/* ── Subnav ── */}
      <div className="ud-subnav">
        <div className="ud-subnav-item">☰ All</div>
        {allCategories.map((c) => (
          <div
            key={c.id}
            className={`ud-subnav-item ${category === (c.name === "All" ? "All" : c.name) ? "active" : ""}`}
            onClick={() => setCategory(c.name === "All" ? "All" : c.name)}
          >
            {c.name}
          </div>
        ))}
        <Link to="/orders" className="ud-subnav-item">Today's Deals</Link>
        <Link to="/service" className="ud-subnav-item">Service Center</Link>
        <Link to="/profile" className="ud-subnav-item">Support</Link>
      </div>

      {/* ── Hero ── */}
      {!search && (
        <div className="ud-hero">
          <div className="ud-hero-bg" />
          <div className="ud-hero-drops">
            <div className="ud-hero-drop" />
            <div className="ud-hero-drop" />
            <div className="ud-hero-drop" />
          </div>
          <div className="ud-hero-content">
            <div className="ud-hero-tag">
              <div className="ud-hero-dot" />
              New Arrivals
            </div>
            <h1>Premium Purity,<br /><em>Delivered Fast</em></h1>
            <p>Discover our curated range of RO purifiers & water solutions. ISI certified, always in stock, same-day service.</p>
            <button
              className="ud-hero-cta"
              onClick={() => document.querySelector(".ud-body")?.scrollIntoView({ behavior: "smooth" })}
            >
              Shop Now →
            </button>
          </div>
        </div>
      )}

      {/* ── Page Body ── */}
      <div className="ud-body">

        {/* Trust pills */}
        {!search && (
          <div className="ud-trust" style={{ marginBottom: 20 }}>
            {[["🔒","Secure Payments"],["🚚","Free Delivery ₹999+"],["🔄","Easy Returns"],["⭐","ISI Certified"],["🎧","24/7 Support"]].map(([ic,tx])=>(
              <div key={tx} className="ud-trust-pill">{ic} {tx}</div>
            ))}
          </div>
        )}

        {/* ── Categories ── */}
        {!search && (
          <>
            <div className="ud-sec-hdr" style={{ marginBottom: 12 }}>
              <h2>Shop by Category</h2>
            </div>
            <div className="ud-cats-grid">
              {allCategories.map((c) => {
                const meta = getCatMeta(c.name);
                return (
                  <div
                    key={c.id}
                    className={`ud-cat-card ${category === (c.name === "All" ? "All" : c.name) ? "active" : ""}`}
                    onClick={() => setCategory(c.name === "All" ? "All" : c.name)}
                  >
                    <div className="ud-cat-icon">{meta.emoji}</div>
                    <div className="ud-cat-name">{c.name}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Deals Strip ── */}
        {!search && deals.length > 0 && (
          <div className="ud-deals">
            <div className="ud-deals-hdr">
              <h3>⚡ Today's Deals</h3>
              <span className="ud-deals-count">{deals.length} deals live</span>
            </div>
            <div className="ud-deals-row">
              {deals.map((p) => {
                const discPct = 10 + hashNum(p.id + "p", 40);
                return (
                  <div
                    key={p.id}
                    className="ud-deal-chip"
                    onClick={() => navigate(`/product/${p.id}`)}
                  >
                    {p.image
                      ? <img src={p.image} alt={p.name} className="ud-deal-chip-img" style={{ borderRadius: 8 }} />
                      : <div className="ud-deal-chip-img">💧</div>
                    }
                    <div className="ud-deal-name">{p.name}</div>
                    <div className="ud-deal-off">Up to {discPct}% off</div>
                    <div className="ud-deal-price">₹{(p.price ?? 0).toLocaleString("en-IN")}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Product Grid ── */}
        <div className="ud-sec-hdr">
          <h2>
            {search
              ? `Results for "${search}"`
              : category !== "All"
              ? category
              : "Featured Products"}
          </h2>
          {!search && (
            <span className="ud-sec-hdr-count">
              {filtered.length} item{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="ud-prod-grid">
          {loading ? (
            <div className="ud-loading-wrap">
              <div className="ud-spin" />
              Loading products…
            </div>
          ) : filtered.length === 0 ? (
            <div className="ud-empty-state">
              <div className="ud-empty-drop" />
              <h3>No results found</h3>
              <p>Try a different search term or category</p>
            </div>
          ) : (
            filtered.map((product, i) => {
              const badges = [];
              if (hashNum(product.id + "n", 4) === 0) badges.push("new");
              if (hashNum(product.id + "d", 3) > 0)   badges.push("deal");
              if (hashNum(product.id + "pr", 3) === 0) badges.push("prime");
              if (hashNum(product.id + "t", 5) === 0)  badges.push("top");
              const stockLevel = hashNum(product.id + "s", 20);

              return (
                <div
                  key={product.id}
                  className="ud-pcard"
                  style={{ animationDelay: `${Math.min(i, 10) * 0.045}s` }}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {/* Badges */}
                  {badges.length > 0 && (
                    <div className="ud-badge-wrap">
                      {badges.slice(0, 2).map((b) => (
                        <span key={b} className={`ud-badge ${b}`}>
                          {b === "deal" ? "Deal" : b === "new" ? "New" : b === "prime" ? "Prime" : "Best Seller"}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Wishlist */}
                  <div
                    className="ud-wish"
                    onClick={(e) => {
                      e.stopPropagation();
                      showToast(`🤍 Added "${product.name}" to wishlist`);
                    }}
                    title="Add to wishlist"
                  >
                    🤍
                  </div>

                  {/* Image */}
                  <div className="ud-pcard-img">
                    {product.image
                      ? <img src={product.image} alt={product.name} loading="lazy" />
                      : <div className="ud-pcard-img-fallback">💧</div>
                    }
                  </div>

                  {/* Body */}
                  <div className="ud-pcard-body">
                    {product.category && (
                      <div className="ud-pcard-cat">{product.category}</div>
                    )}
                    <div className="ud-pcard-name">{product.name ?? "Product"}</div>

                    <Stars id={product.id} />

                    <PriceBlock price={product.price ?? 0} id={product.id} />

                    {stockLevel < 5
                      ? <div className="ud-stock-low">Only {stockLevel + 1} left in stock</div>
                      : <div className="ud-stock">✓ In Stock</div>
                    }

                    <button
                      className={`ud-add-btn ${addedIds[product.id] ? "added" : ""}`}
                      onClick={(e) => handleAddToCart(e, product)}
                    >
                      {addedIds[product.id]
                        ? <>✓ Added to Cart</>
                        : <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                              <path d="M1 1h4l2.68 13.39a2 2 0 001.97 1.61h9.72a2 2 0 001.97-1.61L23 6H6"/>
                            </svg>
                            Add to Cart
                          </>
                      }
                    </button>

                    <button
                      className="ud-view-btn"
                      onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className="ud-footer-top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        ↑ Back to top
      </div>
      <div className="ud-footer">
        <b>RichDrop</b> · Pure Water Solutions · ISI Certified · Secure Checkout
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="ud-bnav">
        {[
          { label: "Home",    icon: "🏠", to: "/user",     active: true },
          { label: "Search",  icon: "🔍", to: "/products" },
          { label: "Cart",    icon: "🛒", to: "/cart" },
          { label: "Service", icon: "🔧", to: "/service" },
          { label: "Profile", icon: "👤", to: "/profile" },
        ].map((t) => (
          <Link key={t.label} to={t.to} className={`ud-nav-tab ${t.active ? "active" : ""}`}>
            <div className="ti">{t.icon}</div>
            <div className="ud-nav-tab-lbl">{t.label}</div>
            {t.active && <div className="ud-nav-bar" />}
          </Link>
        ))}
      </nav>

      {/* Toast */}
      <div className={`ud-toast ${toast.show ? "show" : ""}`}>{toast.msg}</div>
    </>
  );
}