import { useEffect, useState, useRef, useCallback } from "react";
import { db, auth } from "../firebase/config";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

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

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260329_050842_be71947f-f16e-4a14-810c-06e83d23ddb5.mp4";

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600;700&family=Schibsted+Grotesk:wght@400;500;600;700&family=Fustat:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --navy: ${T.navy}; --navy2: ${T.navy2};
  --gold: ${T.gold}; --goldL: ${T.goldL};
  --bg: ${T.bg}; --white: ${T.white};
  --ivory: ${T.ivory}; --border: ${T.border};
  --blue: ${T.blue}; --green: ${T.green}; --red: ${T.red};
  --font-display: 'Cormorant Garamond', serif;
  --font-schibsted: 'Schibsted Grotesk', sans-serif;
  --font-fustat: 'Fustat', sans-serif;
  --font-inter: 'Inter', sans-serif;
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
  position: relative;
  z-index: 200;
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

/* ── REALTIME BADGE ── */
.hm-live-dot {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 9px;
  font-weight: 700;
  color: #2E7D4F;
  letter-spacing: .5px;
  text-transform: uppercase;
}
.hm-live-dot::before {
  content: '';
  width: 7px;
  height: 7px;
  background: #2E7D4F;
  border-radius: 50%;
  display: inline-block;
  animation: livePulse 1.6s ease-in-out infinite;
}
@keyframes livePulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(0.75); }
}

/* ── HERO WRAPPER ── */
.hm-hero-wrap {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── VIDEO BACKGROUND ── */
.hm-video-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.hm-video-bg video {
  width: 115%;
  height: 115%;
  object-fit: cover;
  object-position: top center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.hm-video-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(10,18,28,0.62) 0%,
    rgba(10,18,28,0.45) 40%,
    rgba(10,18,28,0.72) 80%,
    rgba(10,18,28,0.92) 100%
  );
}
.hm-video-overlay-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(0deg, var(--bg) 0%, transparent 100%);
}

/* ── HERO NAVBAR ── */
.hm-nav {
  position: relative;
  z-index: 100;
  height: 72px;
  display: flex;
  align-items: center;
  padding: 0 60px;
  gap: 16px;
  border-bottom: 1px solid rgba(201,168,76,0.10);
  background: rgba(10,18,28,0.35);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
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
  font-family: var(--font-schibsted);
  font-size: 22px;
  font-weight: 600;
  color: #fff;
  letter-spacing: -1.44px;
  line-height: 1;
}
.hm-logo p {
  font-size: 7px;
  color: var(--gold);
  letter-spacing: 2.5px;
  text-transform: uppercase;
  margin-top: 2px;
}

/* Nav center links */
.hm-nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-left: 40px;
}
.hm-nav-link {
  font-family: var(--font-schibsted);
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.2px;
  color: rgba(255,255,255,0.80);
  text-decoration: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color .15s;
  background: none;
  border: none;
}
.hm-nav-link:hover { color: #fff; }
.hm-nav-link svg { opacity: 0.7; }

.hm-nav-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}
.hm-nav-btn-ghost {
  font-family: var(--font-schibsted);
  font-size: 14px;
  font-weight: 500;
  color: rgba(255,255,255,0.85);
  padding: 8px 18px;
  border-radius: 8px;
  border: 1.5px solid rgba(255,255,255,0.18);
  background: transparent;
  cursor: pointer;
  transition: background .15s, border-color .15s;
  width: 82px;
  text-align: center;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.hm-nav-btn-ghost:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.3); }

.hm-nav-cta {
  font-family: var(--font-schibsted);
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  padding: 8px 18px;
  border-radius: 8px;
  background: var(--navy);
  cursor: pointer;
  transition: opacity .15s;
  width: 101px;
  text-align: center;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
}
.hm-nav-cta:hover { opacity: 0.85; }

/* Cart button in nav */
.hm-nav-icon-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 6px 10px;
  border-radius: 8px;
  color: rgba(255,255,255,.75);
  cursor: pointer;
  transition: background .15s;
  background: none;
  border: none;
}
.hm-nav-icon-btn:hover { background: rgba(255,255,255,.06); color: #fff; }
.hm-nav-icon-btn .lbl { font-size: 9px; font-weight: 500; }

/* ── HERO CONTENT ── */
.hm-hero-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 0 120px;
  min-height: calc(100vh - 72px);
  margin-top: -50px;
  text-align: center;
  gap: 0;
}

/* Badge */
.hm-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0;
  margin-bottom: 34px;
  border-radius: 40px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  flex-shrink: 0;
}
.hm-hero-badge-dark {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: #0e1311;
  border-radius: 40px 0 0 40px;
  font-family: var(--font-inter);
  font-size: 13px;
  font-weight: 500;
  color: var(--goldL);
}
.hm-hero-badge-light {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  background: rgba(255,255,255,0.93);
  border-radius: 0 40px 40px 0;
  font-family: var(--font-inter);
  font-size: 13px;
  font-weight: 400;
  color: #1a1a1a;
}

/* Headline */
.hm-hero-headline {
  font-family: var(--font-fustat);
  font-size: clamp(52px, 7vw, 80px);
  font-weight: 800;
  color: #fff;
  letter-spacing: -4.8px;
  line-height: 1;
  margin-bottom: 34px;
  text-shadow: 0 2px 32px rgba(0,0,0,0.35);
}
.hm-hero-headline span { color: var(--goldL); }

/* Subtitle */
.hm-hero-subtitle {
  font-family: var(--font-fustat);
  font-size: 20px;
  font-weight: 500;
  letter-spacing: -0.4px;
  color: rgba(255,255,255,0.72);
  max-width: 542px;
  line-height: 1.6;
  margin-bottom: 44px;
}

/* ── SEARCH BOX ── */
.hm-search-box {
  width: 100%;
  max-width: 728px;
  background: rgba(0,0,0,0.24);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 18px;
  padding: 14px 14px 12px;
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 8px 40px rgba(0,0,0,0.3);
  flex-shrink: 0;
}

/* Top row */
.hm-search-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 0 2px;
}
.hm-search-credits {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-schibsted);
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.75);
}
.hm-search-upgrade {
  background: rgba(90,225,76,0.89);
  color: #0a1a08;
  font-family: var(--font-schibsted);
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  cursor: pointer;
  border: none;
  letter-spacing: 0.3px;
}
.hm-search-ai-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-schibsted);
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.65);
}

/* Main input */
.hm-search-inner {
  background: #fff;
  border-radius: 12px;
  padding: 14px 14px 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
  position: relative;
}
.hm-search-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.hm-search-input {
  flex: 1;
  border: none;
  outline: none;
  font-family: var(--font-inter);
  font-size: 16px;
  font-weight: 400;
  color: rgba(0,0,0,0.85);
  background: transparent;
  caret-color: var(--navy);
}
.hm-search-input::placeholder { color: rgba(0,0,0,0.38); }
.hm-search-submit {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #0F1C2A;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: opacity .15s, transform .15s;
}
.hm-search-submit:hover { opacity: 0.82; transform: scale(1.07); }

/* Bottom row */
.hm-search-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding: 0 2px;
}
.hm-search-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.hm-search-action-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 6px;
  background: #f3f3f3;
  border: none;
  cursor: pointer;
  font-family: var(--font-schibsted);
  font-size: 11px;
  font-weight: 500;
  color: #555;
  transition: background .15s;
}
.hm-search-action-btn:hover { background: #e8e8e8; }
.hm-search-char-count {
  font-family: var(--font-schibsted);
  font-size: 12px;
  color: #999;
}

/* Hero stats strip */
.hm-hero-stats {
  display: flex;
  justify-content: center;
  gap: 48px;
  margin-top: 52px;
  padding-top: 36px;
  border-top: 1px solid rgba(201,168,76,.15);
  flex-wrap: wrap;
  position: relative;
  z-index: 10;
  width: 100%;
  padding-bottom: 40px;
}
.hm-hero-stat-val {
  font-family: var(--font-fustat);
  font-size: 30px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
  letter-spacing: -1px;
}
.hm-hero-stat-lbl {
  font-family: var(--font-inter);
  font-size: 11px;
  color: rgba(226,204,138,.55);
  margin-top: 5px;
  letter-spacing: .3px;
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
.hm-sec-hdr-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
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

/* ── PRIMARY BUTTON ── */
.hm-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 28px;
  background: linear-gradient(135deg, ${T.gold}, ${T.goldL});
  color: ${T.navy};
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

/* ── ERROR BANNER ── */
.hm-error {
  background: rgba(176,58,46,0.08);
  border: 1px solid rgba(176,58,46,0.25);
  border-radius: 10px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: var(--red);
  font-weight: 500;
  margin: 16px 0;
}

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
/* FIX: footer nav items use buttons (not <a> with onClick) for semantics */
.hm-footer-links .hm-footer-nav-btn {
  font-size: 12px;
  color: rgba(226,204,138,.55);
  text-decoration: none;
  transition: color .15s;
  cursor: pointer;
  background: none;
  border: none;
  font-family: var(--font-body);
  text-align: left;
  padding: 0;
}
.hm-footer-links .hm-footer-nav-btn:hover { color: var(--goldL); }
.hm-footer-links a {
  font-size: 12px;
  color: rgba(226,204,138,.55);
  text-decoration: none;
  transition: color .15s;
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
@media (max-width: 900px) {
  .hm-nav { padding: 0 24px; }
  .hm-nav-links { display: none; }
  .hm-hero-content { padding: 0 24px; min-height: calc(100vh - 72px); }
  .hm-hero-headline { font-size: clamp(38px, 9vw, 58px); letter-spacing: -2px; }
  .hm-hero-subtitle { font-size: 16px; }
  .hm-search-box { max-width: 100%; }
  .hm-hero-stats { gap: 20px; padding: 24px 24px 40px; }
  .hm-bnav { display: flex; }
  .hm-footer { padding-bottom: 80px; }
  .hm-topbar { display: none; }
  .hm-banner { padding: 28px 24px; }
  .hm-search-top { display: none; }
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
@keyframes heroReveal { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }
.hm-fade { animation: hmFade .4s ease both; }
.hm-hero-anim-1 { animation: heroReveal .7s cubic-bezier(.22,1,.36,1) .15s both; }
.hm-hero-anim-2 { animation: heroReveal .7s cubic-bezier(.22,1,.36,1) .28s both; }
.hm-hero-anim-3 { animation: heroReveal .7s cubic-bezier(.22,1,.36,1) .4s both; }
.hm-hero-anim-4 { animation: heroReveal .7s cubic-bezier(.22,1,.36,1) .52s both; }
.hm-hero-anim-5 { animation: heroReveal .7s cubic-bezier(.22,1,.36,1) .64s both; }

/* ── FLASH ANIMATION for new product entries ── */
@keyframes newItemFlash {
  0%   { background: rgba(201,168,76,0.18); }
  100% { background: var(--white); }
}
.hm-prod-card.hm-new-item {
  animation: newItemFlash 1.2s ease-out both;
}
`;

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const IconChevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IconArrowUp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);
const IconStar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#C9A84C" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconAI = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8">
    <path d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z" />
    <path d="M19 17L19.8 19.2L22 20L19.8 20.8L19 23L18.2 20.8L16 20L18.2 19.2L19 17Z" />
  </svg>
);
const IconAttach = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
  </svg>
);
const IconVoice = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);
const IconSearch = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// Category icon map
const CAT_ICONS = {
  "RO System": "💧",
  "Filter":    "🔵",
  "Accessory": "🔧",
  "UV System": "☀️",
  "Softener":  "💎",
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
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "ISI Certified",
    desc: "All products meet Bureau of Indian Standards quality norms.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth="2">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    title: "Free Delivery",
    desc: "Orders above ₹999 qualify for free doorstep delivery.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: "Genuine Products",
    desc: "Sourced directly from authorised manufacturers.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    title: "Easy Returns",
    desc: "Hassle-free 7-day return & replacement policy.",
  },
];

// ── VideoBackground Component ─────────────────────────────────────────────────
function VideoBackground() {
  const videoRef    = useRef(null);
  const opacityRef  = useRef(0);
  const fadingOutRef = useRef(false);
  const rafRef      = useRef(null);
  const FADE_DURATION = 250; // ms

  const cancelRaf = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const fadeIn = useCallback(() => {
    cancelRaf();
    fadingOutRef.current = false;
    const video = videoRef.current;
    if (!video) return;
    const startOpacity = opacityRef.current;
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / FADE_DURATION, 1);
      const newOpacity = startOpacity + (1 - startOpacity) * progress;
      opacityRef.current = newOpacity;
      video.style.opacity = newOpacity;
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, [cancelRaf]);

  const fadeOut = useCallback(() => {
    cancelRaf();
    fadingOutRef.current = true;
    const video = videoRef.current;
    if (!video) return;
    const startOpacity = opacityRef.current;
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / FADE_DURATION, 1);
      const newOpacity = startOpacity * (1 - progress);
      opacityRef.current = newOpacity;
      video.style.opacity = newOpacity;
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, [cancelRaf]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.style.opacity = "0";

    const handleCanPlay  = () => { video.play().catch(() => {}); };
    const handlePlaying  = () => { fadeIn(); };
    const handleTimeUpdate = () => {
      // FIX: guard against NaN duration (video not yet loaded)
      if (video.duration && isFinite(video.duration)
          && !fadingOutRef.current
          && video.duration - video.currentTime <= 0.55) {
        fadeOut();
      }
    };
    // FIX: on ended, cleanly reset without calling play() twice
    const handleEnded = () => {
      cancelRaf();
      opacityRef.current = 0;
      fadingOutRef.current = false;
      video.style.opacity = "0";
      video.currentTime = 0;
      // Small delay lets the browser stabilise before replaying
      setTimeout(() => { video.play().catch(() => {}); }, 120);
    };

    video.addEventListener("canplay",    handleCanPlay);
    video.addEventListener("playing",    handlePlaying);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended",      handleEnded);

    return () => {
      cancelRaf();
      video.removeEventListener("canplay",    handleCanPlay);
      video.removeEventListener("playing",    handlePlaying);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended",      handleEnded);
    };
  }, [fadeIn, fadeOut, cancelRaf]);

  return (
    <div className="hm-video-bg">
      <video
        ref={videoRef}
        src={VIDEO_URL}
        muted
        playsInline
        preload="auto"
        style={{ opacity: 0 }}
      />
      <div className="hm-video-overlay" />
      <div className="hm-video-overlay-bottom" />
    </div>
  );
}

// ── SearchBox Component ───────────────────────────────────────────────────────
function SearchBox({ onSearch, navigate }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    } else {
      navigate("/user");
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="hm-search-box">
      {/* Top row */}
      <div className="hm-search-top">
        <div className="hm-search-credits">
          <span>60/450 credits</span>
          <button className="hm-search-upgrade">Upgrade</button>
        </div>
        <div className="hm-search-ai-badge">
          <IconAI />
          Powered by GPT-4o
        </div>
      </div>

      {/* Main input */}
      <div className="hm-search-inner">
        <div className="hm-search-row">
          <input
            className="hm-search-input"
            type="text"
            placeholder="Search RO systems, filters, accessories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKey}
          />
          <button className="hm-search-submit" onClick={handleSubmit}>
            <IconArrowUp />
          </button>
        </div>

        {/* Bottom action row */}
        <div className="hm-search-bottom">
          <div className="hm-search-actions">
            <button className="hm-search-action-btn">
              <IconAttach /> Attach
            </button>
            <button className="hm-search-action-btn">
              <IconVoice /> Voice
            </button>
            <button
              className="hm-search-action-btn"
              onClick={() => navigate("/user")}
            >
              <IconSearch /> Browse
            </button>
          </div>
          {/* FIX: was using `query` (the Firestore import name) as the state var */}
          <span className="hm-search-char-count">{searchQuery.length}/3,000</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Home Component ───────────────────────────────────────────────────────
export default function Home() {
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [user,        setUser]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  // FIX: track new product IDs so we can flash them on arrival
  const [newIds,      setNewIds]      = useState(new Set());
  const prevIdsRef = useRef(new Set());

  const navigate = useNavigate();

  // Auth listener
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return unsub;
  }, []);

  // FIX: renamed Firestore query call variable to `fsQuery` to avoid any
  // future naming confusion; added error handling; track new items for flash.
  useEffect(() => {
    setError(null);
    const fsQuery = query(
      collection(db, "products"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      fsQuery,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Detect newly arrived IDs (only after initial load)
        if (!loading) {
          const incoming = new Set(data.map((p) => p.id));
          const fresh = new Set(
            [...incoming].filter((id) => !prevIdsRef.current.has(id))
          );
          if (fresh.size > 0) {
            setNewIds(fresh);
            // Clear flash markers after animation completes
            setTimeout(() => setNewIds(new Set()), 1400);
          }
          prevIdsRef.current = incoming;
        } else {
          prevIdsRef.current = new Set(data.map((p) => p.id));
        }

        setProducts(data);
        setCategories([...new Set(data.map((p) => p.category).filter(Boolean))]);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore error:", err);
        setError("Failed to load products. Please refresh.");
        setLoading(false);
      }
    );

    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (searchQuery) => {
    navigate(`/user?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <>
      <style>{CSS}</style>

      {/* Topbar */}
      <div className="hm-topbar">
        {[
          ["⚡", "Same-day", "service"],
          ["🚚", "Free delivery", "₹999+"],
          ["✅", "ISI", "Certified"],
          ["🎧", "24/7", "Support"],
        ].map(([ic, b, a]) => (
          <span key={b}>
            {ic} <b>{b}</b> {a}
          </span>
        ))}
      </div>

      {/* ── HERO with Video ── */}
      <div className="hm-hero-wrap">
        <VideoBackground />

        {/* Navbar over video */}
        <nav className="hm-nav">
          <div className="hm-logo">
            <div className="hm-logo-drop" />
            <div>
              <h1>RichDrop</h1>
              <p>Pure Water Solutions</p>
            </div>
          </div>

          {/* Center links */}
          <div className="hm-nav-links">
            <button className="hm-nav-link" onClick={() => navigate("/user")}>Platform</button>
            <button className="hm-nav-link" onClick={() => navigate("/user")}>
              Features <IconChevron />
            </button>
            <button className="hm-nav-link" onClick={() => navigate("/user")}>Products</button>
            <button className="hm-nav-link" onClick={() => navigate("/user")}>Community</button>
            <button className="hm-nav-link" onClick={() => navigate("/user")}>Contact</button>
          </div>

          <div className="hm-nav-right">
            {user ? (
              <>
                <button className="hm-nav-icon-btn" onClick={() => navigate("/cart")}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.96-1.58l1.54-6.42H6" />
                  </svg>
                  <span className="lbl">Cart</span>
                </button>
                <button className="hm-nav-cta" onClick={() => navigate("/user")}>
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <Link to="/signup" className="hm-nav-btn-ghost">Sign Up</Link>
                <button className="hm-nav-cta" onClick={() => navigate("/login")}>Log In</button>
              </>
            )}
          </div>
        </nav>

        {/* Hero Content */}
        <div className="hm-hero-content">
          {/* Badge */}
          <div className="hm-hero-badge hm-hero-anim-1">
            <div className="hm-hero-badge-dark">
              <IconStar /> New
            </div>
            <div className="hm-hero-badge-light">
              Discover what's possible
            </div>
          </div>

          {/* Headline */}
          <h2 className="hm-hero-headline hm-hero-anim-2">
            Pure Water,<br />
            <span>Pure Life</span>
          </h2>

          {/* Subtitle */}
          <p className="hm-hero-subtitle hm-hero-anim-3">
            Upload your requirements and get the perfect water purification
            solution right away. Shop ISI-certified RO systems, filters &amp;
            accessories — delivered across India.
          </p>

          {/* Search Box */}
          <div
            className="hm-hero-anim-4"
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <SearchBox onSearch={handleSearch} navigate={navigate} />
          </div>

          {/* Stats */}
          <div className="hm-hero-stats hm-hero-anim-5">
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
      </div>

      {/* Trust Bar */}
      <div className="hm-trust">
        {[
          { icon: "🔒", title: "Secure Checkout", sub: "256-bit SSL" },
          { icon: "🚚", title: "Fast Shipping",   sub: "2–5 business days" },
          { icon: "✅", title: "ISI Certified",   sub: "Verified products" },
          { icon: "🔄", title: "Easy Returns",    sub: "7-day policy" },
          { icon: "🎧", title: "24/7 Support",    sub: "Always here for you" },
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
              {/* FIX: right side now holds both live badge and link */}
              <div className="hm-sec-hdr-right">
                <span className="hm-live-dot">Live</span>
                <button className="hm-sec-link" onClick={() => navigate("/user")}>
                  View All →
                </button>
              </div>
            </div>
            <div className="hm-cat-grid">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="hm-cat-card"
                  onClick={() => navigate("/user")}
                >
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
            {/* FIX: live badge in products header too */}
            <div className="hm-sec-hdr-right">
              {!loading && <span className="hm-live-dot">Realtime</span>}
              <button className="hm-sec-link" onClick={() => navigate("/user")}>
                Explore More →
              </button>
            </div>
          </div>

          {/* FIX: show error state */}
          {error && (
            <div className="hm-error">
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div className="hm-spin-wrap">
              <div className="hm-spin" />
            </div>
          ) : (
            <div className="hm-prod-grid">
              {products.slice(0, 8).map((product, i) => (
                <div
                  key={product.id ?? i}
                  className={`hm-prod-card${newIds.has(product.id) ? " hm-new-item" : ""}`}
                  style={{ animationDelay: `${i * 0.04}s` }}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="hm-prod-img-wrap">
                    {i < 3 && (
                      <div className="hm-prod-badge">
                        {i === 0 ? "NEW" : i === 1 ? "HOT" : "TOP"}
                      </div>
                    )}
                    <img src={product.image} alt={product.name ?? "Product"} />
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
                        <svg
                          width="14" height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5"  y1="12" x2="19" y2="12" />
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
            <h3>
              Free Installation
              <br />
              on RO Systems
            </h3>
            <p>
              Book any RO system this month and get professional installation
              at no extra cost.
            </p>
            <div className="hm-banner-pills">
              {["Same-day service", "Certified technicians", "1-yr warranty"].map((t) => (
                <div key={t} className="hm-banner-pill">{t}</div>
              ))}
            </div>
          </div>
          {/* FIX: hm-btn-primary is now in the main CSS block above — no more split style tag */}
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
                India's trusted source for premium water purification systems
                and accessories.
              </p>
            </div>

            {/* FIX: nav items that use navigate() are now <button> elements,
                not <a> with onClick — semantically correct & no href warning */}
            <div className="hm-footer-links">
              <h5>Shop</h5>
              <button className="hm-footer-nav-btn" onClick={() => navigate("/user")}>All Products</button>
              <button className="hm-footer-nav-btn" onClick={() => navigate("/user")}>RO Systems</button>
              <button className="hm-footer-nav-btn" onClick={() => navigate("/user")}>Filters</button>
              <button className="hm-footer-nav-btn" onClick={() => navigate("/user")}>Accessories</button>
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
              <button className="hm-footer-nav-btn">Contact Us</button>
              <button className="hm-footer-nav-btn">Track Order</button>
              <button className="hm-footer-nav-btn">Returns</button>
              <button className="hm-footer-nav-btn">FAQ</button>
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
          { label: "Home",    icon: "🏠", to: "/",                       active: true },
          { label: "Search",  icon: "🔍", to: "/user" },
          { label: "Cart",    icon: "🛒", to: "/cart" },
          { label: "Profile", icon: "👤", to: user ? "/user" : "/login" },
        ].map((t) => (
          <Link
            key={t.label}
            to={t.to}
            className={`hm-nav-tab ${t.active ? "active" : ""}`}
          >
            <div className="ti">{t.icon}</div>
            <div className="hm-nav-tab-lbl">{t.label}</div>
            {t.active && <div className="hm-nav-bar" />}
          </Link>
        ))}
      </nav>
    </>
  );
}