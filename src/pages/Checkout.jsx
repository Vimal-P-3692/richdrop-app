import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// ── Design Tokens (matches RichDrop / Cart system) ────────────────────────────
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
.ck-topbar {
  background: var(--navy);
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
}
.ck-topbar span {
  font-size: 10px;
  color: rgba(226,204,138,.7);
  letter-spacing: .5px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.ck-topbar b { color: var(--goldL); font-weight: 600; }

/* ── NAVBAR ── */
.ck-nav {
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
.ck-logo {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-shrink: 0;
  text-decoration: none;
}
.ck-logo-drop {
  width: 22px;
  height: 28px;
  background: linear-gradient(160deg, #B8E0F7, #1A6FA3);
  border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
  position: relative;
}
.ck-logo-drop::after {
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
.ck-logo h1 {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2px;
  line-height: 1;
}
.ck-logo p {
  font-size: 7px;
  color: var(--gold);
  letter-spacing: 2.5px;
  text-transform: uppercase;
  margin-top: 2px;
}
.ck-nav-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
}
.ck-nav-btn {
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
.ck-nav-btn:hover { background: rgba(255,255,255,.06); color: #fff; }
.ck-nav-btn .lbl { font-size: 9px; font-weight: 500; }

/* ── BREADCRUMB ── */
.ck-bread {
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
.ck-bread a { color: var(--ivory); transition: color .15s; }
.ck-bread a:hover { color: var(--navy); }
.ck-bread-sep { color: var(--border); }
.ck-bread-cur { color: var(--navy); font-weight: 600; }

/* ── PROGRESS STEPS ── */
.ck-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 18px 24px;
  background: var(--white);
  border-bottom: 1px solid var(--border);
}
.ck-step {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
  color: var(--ivory);
}
.ck-step.done { color: var(--green); }
.ck-step.active { color: var(--navy); }
.ck-step-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  background: var(--bg);
  color: var(--ivory);
  flex-shrink: 0;
}
.ck-step.done .ck-step-num {
  background: var(--green);
  border-color: var(--green);
  color: #fff;
}
.ck-step.active .ck-step-num {
  background: var(--navy);
  border-color: var(--navy);
  color: var(--gold);
}
.ck-step-line {
  width: 48px;
  height: 1px;
  background: var(--border);
  margin: 0 4px;
}
.ck-step.done + .ck-step-line { background: var(--green); }

/* ── PAGE ── */
.ck-page {
  max-width: 1140px;
  margin: 0 auto;
  padding: 28px 24px 100px;
  animation: ckFade .35s ease;
}
@keyframes ckFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

/* ── PAGE HEADER ── */
.ck-hdr {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 10px;
}
.ck-hdr-left h1 {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  color: var(--navy);
  line-height: 1;
  margin-bottom: 4px;
}
.ck-hdr-left p { font-size: 12px; color: var(--ivory); }
.ck-back {
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
.ck-back:hover { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,168,76,.08); }

/* ── LAYOUT ── */
.ck-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
  align-items: start;
}
@media (max-width: 900px) {
  .ck-layout { grid-template-columns: 1fr; }
}

/* ── SECTION CARD ── */
.ck-section {
  background: var(--white);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  overflow: hidden;
  animation: ckFade .35s ease both;
}
.ck-section + .ck-section { margin-top: 16px; }

.ck-sec-hdr {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 10px;
}
.ck-sec-hdr h3 {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--navy);
  flex: 1;
}
.ck-sec-hdr p { font-size: 10px; color: var(--ivory); }
.ck-sec-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(201,168,76,.12), rgba(201,168,76,.05));
  border: 1px solid rgba(201,168,76,.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gold);
  font-size: 14px;
  flex-shrink: 0;
}
.ck-sec-body { padding: 20px; }

/* ── FORM ── */
.ck-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.ck-form-grid .full { grid-column: 1 / -1; }
@media (max-width: 600px) {
  .ck-form-grid { grid-template-columns: 1fr; }
  .ck-form-grid .full { grid-column: 1; }
}

.ck-field { display: flex; flex-direction: column; gap: 5px; }
.ck-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--ivory);
  letter-spacing: .5px;
  text-transform: uppercase;
}
.ck-input,
.ck-select,
.ck-textarea {
  height: 40px;
  border: 1.5px solid var(--border);
  border-radius: 9px;
  padding: 0 12px;
  font-size: 13px;
  font-family: var(--font-body);
  color: var(--navy);
  background: var(--bg);
  outline: none;
  transition: border-color .15s, box-shadow .15s;
  width: 100%;
}
.ck-input::placeholder,
.ck-textarea::placeholder { color: var(--ivory); font-size: 12px; }
.ck-input:focus,
.ck-select:focus,
.ck-textarea:focus {
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgba(201,168,76,.08);
  background: var(--white);
}
.ck-input.error { border-color: var(--red); box-shadow: 0 0 0 3px rgba(176,58,46,.08); }
.ck-select { appearance: none; cursor: pointer; }
.ck-textarea {
  height: auto;
  padding: 10px 12px;
  resize: vertical;
  min-height: 72px;
  line-height: 1.5;
}
.ck-err-msg { font-size: 10px; color: var(--red); font-weight: 600; }

/* ── PAYMENT OPTIONS ── */
.ck-pay-opts { display: flex; flex-direction: column; gap: 10px; }
.ck-pay-opt {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1.5px solid var(--border);
  cursor: pointer;
  transition: border-color .15s, background .15s;
  background: var(--bg);
}
.ck-pay-opt:hover { border-color: rgba(201,168,76,.4); background: rgba(201,168,76,.02); }
.ck-pay-opt.selected {
  border-color: var(--gold);
  background: rgba(201,168,76,.05);
}
.ck-pay-radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color .15s;
}
.ck-pay-opt.selected .ck-pay-radio {
  border-color: var(--gold);
}
.ck-pay-radio-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--gold);
  opacity: 0;
  transition: opacity .15s;
}
.ck-pay-opt.selected .ck-pay-radio-dot { opacity: 1; }
.ck-pay-icon {
  font-size: 20px;
  width: 36px;
  text-align: center;
}
.ck-pay-info { flex: 1; }
.ck-pay-title { font-size: 13px; font-weight: 700; color: var(--navy); }
.ck-pay-desc  { font-size: 10px; color: var(--ivory); margin-top: 2px; }
.ck-pay-badge {
  font-size: 9px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 20px;
  background: rgba(46,125,79,.1);
  color: var(--green);
  border: 1px solid rgba(46,125,79,.2);
}

/* ── ORDER ITEMS (right panel top) ── */
.ck-items { display: flex; flex-direction: column; gap: 0; }
.ck-item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 14px 22px;
  border-bottom: 1px solid rgba(201,168,76,.1);
}
.ck-item:last-child { border-bottom: none; }
.ck-item-img {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  border: 1px solid rgba(201,168,76,.15);
  background: rgba(255,255,255,.08);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ck-item-img img { width: 52px; height: 52px; object-fit: contain; }
.ck-item-fallback { font-size: 20px; opacity: .4; }
.ck-item-body { flex: 1; min-width: 0; }
.ck-item-name {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ck-item-meta { font-size: 10px; color: rgba(226,204,138,.5); margin-top: 2px; }
.ck-item-price {
  font-size: 14px;
  font-weight: 700;
  color: var(--goldL);
  white-space: nowrap;
}

/* ── ORDER SUMMARY (sticky right) ── */
.ck-summary {
  background: var(--navy);
  border-radius: 18px;
  border: 1px solid rgba(201,168,76,.22);
  overflow: hidden;
  position: sticky;
  top: 78px;
  animation: ckFade .4s ease .1s both;
}
.ck-sum-hdr {
  padding: 20px 22px 14px;
  border-bottom: 1px solid rgba(201,168,76,.12);
}
.ck-sum-hdr h3 {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
  margin-bottom: 2px;
}
.ck-sum-hdr p { font-size: 10px; color: rgba(226,204,138,.55); }

.ck-sum-rows { padding: 14px 22px; display: flex; flex-direction: column; gap: 0; }
.ck-sum-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255,255,255,.06);
}
.ck-sum-row:last-of-type { border-bottom: none; }
.ck-sum-key { font-size: 12px; color: rgba(226,204,138,.6); }
.ck-sum-val { font-size: 13px; font-weight: 600; color: rgba(255,255,255,.9); }
.ck-sum-val.green { color: #5CBA8A; }
.ck-sum-div { height: 1px; background: rgba(201,168,76,.15); margin: 4px 0; }
.ck-sum-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0 0;
}
.ck-sum-total-key { font-size: 13px; font-weight: 700; color: rgba(226,204,138,.8); }
.ck-sum-total-val {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  color: #fff;
}
.ck-sum-savings {
  font-size: 10px;
  color: #5CBA8A;
  text-align: right;
  margin-top: 3px;
  padding-bottom: 4px;
}

/* Place order btn */
.ck-place-btn {
  margin: 14px 22px 18px;
  width: calc(100% - 44px);
  height: 52px;
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
.ck-place-btn:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
.ck-place-btn:disabled {
  opacity: .5;
  cursor: not-allowed;
  transform: none;
}
.ck-place-btn.loading { opacity: .75; cursor: wait; }

/* Trust */
.ck-trust-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  padding: 0 22px 18px;
}
.ck-trust-pill {
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

/* ── EMPTY ── */
.ck-empty {
  background: var(--white);
  border-radius: 20px;
  border: 1px solid var(--border);
  padding: 64px 32px;
  text-align: center;
  box-shadow: var(--shadow);
}
.ck-empty-drop {
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
.ck-empty h3 {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  color: var(--navy);
  margin-bottom: 8px;
}
.ck-empty p { font-size: 13px; color: var(--ivory); margin-bottom: 24px; }
.ck-empty-cta {
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
.ck-empty-cta:hover { opacity: .88; transform: translateY(-2px); }

/* ── SPIN ── */
.ck-spin-wrap { padding: 60px; display: flex; justify-content: center; }
.ck-spin {
  width: 28px; height: 28px;
  border: 2.5px solid var(--border);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── TOAST ── */
.ck-toast {
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
.ck-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

/* ── SUCCESS OVERLAY ── */
.ck-success-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15,28,42,.92);
  z-index: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  animation: ovIn .3s ease;
}
@keyframes ovIn { from { opacity: 0; } to { opacity: 1; } }
.ck-success-card {
  background: var(--white);
  border-radius: 24px;
  padding: 40px 36px;
  max-width: 380px;
  width: 90%;
  text-align: center;
  animation: confIn .35s cubic-bezier(.22,1,.36,1);
}
@keyframes confIn { from { transform: scale(.9); opacity: 0; } to { transform: none; opacity: 1; } }
.ck-success-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(46,125,79,.12), rgba(46,125,79,.05));
  border: 2px solid rgba(46,125,79,.3);
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
}
.ck-success-card h3 {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  color: var(--navy);
  margin-bottom: 8px;
}
.ck-success-card p { font-size: 13px; color: var(--ivory); margin-bottom: 6px; }
.ck-success-order {
  font-size: 11px;
  font-weight: 700;
  color: var(--navy);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 16px;
  display: inline-block;
  margin: 10px 0 20px;
  letter-spacing: 1px;
}
.ck-success-cta {
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
  cursor: pointer;
  border: none;
  font-family: var(--font-body);
  transition: opacity .15s;
}
.ck-success-cta:hover { opacity: .88; }

/* ── MOBILE BOTTOM NAV ── */
.ck-bnav {
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
  .ck-bnav { display: flex; }
  .ck-page { padding-bottom: 100px; }
  .ck-topbar { display: none; }
}
.ck-nav-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-decoration: none;
  padding: 4px;
}
.ck-nav-tab .ti { font-size: 19px; }
.ck-nav-tab-lbl { font-size: 9px; color: #C0B8A8; font-weight: 500; }
.ck-nav-tab.active .ck-nav-tab-lbl { color: var(--navy); font-weight: 700; }
.ck-nav-bar { width: 16px; height: 2px; background: var(--gold); border-radius: 2px; }
`;

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman & Nicobar","Chandigarh","Delhi","Jammu & Kashmir","Ladakh",
  "Lakshadweep","Puducherry",
];



// ── Component ─────────────────────────────────────────────────────────────────
export default function Checkout() {
  const navigate = useNavigate();

  const [user, setUser]           = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [placing, setPlacing]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [orderId, setOrderId]     = useState("");
  const [toast, setToast]         = useState({ show: false, msg: "" });

  // Form fields
  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "", email: "",
    address: "", landmark: "", city: "", state: "", pincode: "",
  });
  const [errors, setErrors] = useState({});

  // Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setLoading(false);
      // Pre-fill email from auth
      if (u?.email) setForm((f) => ({ ...f, email: u.email }));
    });
    return unsub;
  }, []);

  // Real-time cart
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim())  e.firstName = "Required";
    if (!form.lastName.trim())   e.lastName  = "Required";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "Enter valid 10-digit number";
    if (!form.address.trim())    e.address   = "Required";
    if (!form.city.trim())       e.city      = "Required";
    if (!form.state)             e.state     = "Select a state";
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Enter valid 6-digit pincode";
    return e;
  };

  // Totals
  const subtotal   = cartItems.reduce((s, i) => s + (i.price ?? 0) * (i.quantity ?? 1), 0);
  const delivery   = subtotal >= 999 ? 0 : 99;
  const total      = subtotal + delivery;
  const totalItems = cartItems.reduce((s, i) => s + (i.quantity ?? 1), 0);

  // Place order
  const placeOrder = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      showToast("⚠️ Please fix the errors above");
      return;
    }

    setPlacing(true);
    try {
      // 1) Save order
      const orderRef = await addDoc(collection(db, "orders"), {
        userId:    user.uid,
        items:     cartItems,
        total,
        delivery,
        subtotal,
        address:   form,
        payment:   "cod",
        status:    "placed",
        createdAt: serverTimestamp(),
      });

      // 2) Clear cart
      const cartSnap = await getDocs(collection(db, "carts", user.uid, "items"));
      await Promise.all(
        cartSnap.docs.map((d) => deleteDoc(doc(db, "carts", user.uid, "items", d.id)))
      );

      setOrderId(orderRef.id.slice(0, 8).toUpperCase());
      setSuccess(true);
    } catch (err) {
      showToast("❌ " + err.message);
    } finally {
      setPlacing(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <nav className="ck-nav">
          <Link to="/" className="ck-logo">
            <div className="ck-logo-drop" />
            <div><h1>RichDrop</h1><p>Pure Water Solutions</p></div>
          </Link>
        </nav>
        <div className="ck-page">
          <div className="ck-spin-wrap"><div className="ck-spin" /></div>
        </div>
      </>
    );
  }

  // ── Not signed in ────────────────────────────────────────────────────────
  if (!user) {
    return (
      <>
        <style>{CSS}</style>
        <nav className="ck-nav">
          <Link to="/" className="ck-logo">
            <div className="ck-logo-drop" />
            <div><h1>RichDrop</h1><p>Pure Water Solutions</p></div>
          </Link>
        </nav>
        <div className="ck-page">
          <div className="ck-empty">
            <div className="ck-empty-drop" />
            <h3>Sign in to checkout</h3>
            <p>Please sign in to place your order.</p>
            <Link to="/login" className="ck-empty-cta">Sign In →</Link>
          </div>
        </div>
      </>
    );
  }

  // ── Empty cart ───────────────────────────────────────────────────────────
  if (!loading && cartItems.length === 0 && !success) {
    return (
      <>
        <style>{CSS}</style>
        <nav className="ck-nav">
          <Link to="/" className="ck-logo">
            <div className="ck-logo-drop" />
            <div><h1>RichDrop</h1><p>Pure Water Solutions</p></div>
          </Link>
        </nav>
        <div className="ck-page">
          <div className="ck-empty">
            <div className="ck-empty-drop" />
            <h3>Nothing to checkout</h3>
            <p>Add some products to your cart before placing an order.</p>
            <Link to="/user" className="ck-empty-cta">Shop Products →</Link>
          </div>
        </div>
      </>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>

      {/* Success overlay */}
      {success && (
        <div className="ck-success-overlay">
          <div className="ck-success-card">
            <div className="ck-success-icon">✅</div>
            <h3>Order Placed!</h3>
            <p>Thank you, {form.firstName || "there"}! Your order has been received.</p>
            <p>We'll deliver to <b>{form.city}</b> within 2–5 business days.</p>
            <div className="ck-success-order">ORDER #{orderId}</div>
            <button className="ck-success-cta" onClick={() => navigate("/user")}>
              Continue Shopping →
            </button>
          </div>
        </div>
      )}

      {/* Topbar */}
      <div className="ck-topbar">
        {[["⚡","Same-day","service"],["🚚","Free delivery","₹999+"],["✅","ISI","Certified"],["🎧","24/7","Support"]].map(([ic,b,a])=>(
          <span key={b}>{ic} <b>{b}</b> {a}</span>
        ))}
      </div>

      {/* Navbar */}
      <nav className="ck-nav">
        <Link to="/" className="ck-logo">
          <div className="ck-logo-drop" />
          <div><h1>RichDrop</h1><p>Pure Water Solutions</p></div>
        </Link>
        <div className="ck-nav-right">
          <Link to="/user" className="ck-nav-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span className="lbl">Home</span>
          </Link>
          <Link to="/cart" className="ck-nav-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.96-1.58l1.54-6.42H6"/>
            </svg>
            <span className="lbl">Cart</span>
          </Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="ck-bread">
        <Link to="/user">Home</Link>
        <span className="ck-bread-sep">›</span>
        <Link to="/cart">My Cart</Link>
        <span className="ck-bread-sep">›</span>
        <span className="ck-bread-cur">Checkout</span>
      </div>

      {/* Progress steps */}
      <div className="ck-steps">
        <div className="ck-step done">
          <div className="ck-step-num">✓</div>
          Cart
        </div>
        <div className="ck-step-line" />
        <div className="ck-step active">
          <div className="ck-step-num">2</div>
          Checkout
        </div>
        <div className="ck-step-line" />
        <div className="ck-step">
          <div className="ck-step-num">3</div>
          Confirmed
        </div>
      </div>

      {/* Page */}
      <div className="ck-page">

        {/* Header */}
        <div className="ck-hdr">
          <div className="ck-hdr-left">
            <h1>Checkout</h1>
            <p>{totalItems} item{totalItems !== 1 ? "s" : ""} · ₹{total.toLocaleString()} total</p>
          </div>
          <Link to="/cart" className="ck-back">← Back to Cart</Link>
        </div>

        <div className="ck-layout">

          {/* ── LEFT: Forms ── */}
          <div>

            {/* Delivery Address */}
            <div className="ck-section">
              <div className="ck-sec-hdr">
                <div className="ck-sec-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <h3>Delivery Address</h3>
                  <p>Where should we deliver your order?</p>
                </div>
              </div>
              <div className="ck-sec-body">
                <div className="ck-form-grid">
                  {/* First name */}
                  <div className="ck-field">
                    <label className="ck-label">First Name *</label>
                    <input
                      className={`ck-input ${errors.firstName ? "error" : ""}`}
                      name="firstName"
                      placeholder="e.g. Arjun"
                      value={form.firstName}
                      onChange={handleChange}
                    />
                    {errors.firstName && <span className="ck-err-msg">{errors.firstName}</span>}
                  </div>

                  {/* Last name */}
                  <div className="ck-field">
                    <label className="ck-label">Last Name *</label>
                    <input
                      className={`ck-input ${errors.lastName ? "error" : ""}`}
                      name="lastName"
                      placeholder="e.g. Sharma"
                      value={form.lastName}
                      onChange={handleChange}
                    />
                    {errors.lastName && <span className="ck-err-msg">{errors.lastName}</span>}
                  </div>

                  {/* Phone */}
                  <div className="ck-field">
                    <label className="ck-label">Phone Number *</label>
                    <input
                      className={`ck-input ${errors.phone ? "error" : ""}`}
                      name="phone"
                      placeholder="10-digit mobile"
                      value={form.phone}
                      onChange={handleChange}
                      maxLength={10}
                      inputMode="numeric"
                    />
                    {errors.phone && <span className="ck-err-msg">{errors.phone}</span>}
                  </div>

                  {/* Email */}
                  <div className="ck-field">
                    <label className="ck-label">Email Address</label>
                    <input
                      className="ck-input"
                      name="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      type="email"
                    />
                  </div>

                  {/* Full address */}
                  <div className="ck-field full">
                    <label className="ck-label">Full Address *</label>
                    <textarea
                      className={`ck-textarea ${errors.address ? "error" : ""}`}
                      name="address"
                      placeholder="House / Flat no., Street, Area"
                      value={form.address}
                      onChange={handleChange}
                      rows={3}
                    />
                    {errors.address && <span className="ck-err-msg">{errors.address}</span>}
                  </div>

                  {/* Landmark */}
                  <div className="ck-field full">
                    <label className="ck-label">Landmark <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
                    <input
                      className="ck-input"
                      name="landmark"
                      placeholder="Near Metro Station, School etc."
                      value={form.landmark}
                      onChange={handleChange}
                    />
                  </div>

                  {/* City */}
                  <div className="ck-field">
                    <label className="ck-label">City *</label>
                    <input
                      className={`ck-input ${errors.city ? "error" : ""}`}
                      name="city"
                      placeholder="e.g. Chennai"
                      value={form.city}
                      onChange={handleChange}
                    />
                    {errors.city && <span className="ck-err-msg">{errors.city}</span>}
                  </div>

                  {/* Pincode */}
                  <div className="ck-field">
                    <label className="ck-label">Pincode *</label>
                    <input
                      className={`ck-input ${errors.pincode ? "error" : ""}`}
                      name="pincode"
                      placeholder="6-digit pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      maxLength={6}
                      inputMode="numeric"
                    />
                    {errors.pincode && <span className="ck-err-msg">{errors.pincode}</span>}
                  </div>

                  {/* State */}
                  <div className="ck-field full">
                    <label className="ck-label">State *</label>
                    <select
                      className={`ck-select ck-input ${errors.state ? "error" : ""}`}
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                    >
                      <option value="">Select state…</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {errors.state && <span className="ck-err-msg">{errors.state}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Cash on Delivery notice */}
            <div className="ck-section" style={{ animationDelay: ".08s" }}>
              <div className="ck-sec-hdr">
                <div className="ck-sec-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="1" y="4" width="22" height="16" rx="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <h3>Payment Method</h3>
                  <p>Secure & hassle-free</p>
                </div>
              </div>
              <div className="ck-sec-body">
                <div className="ck-pay-opt selected" style={{ cursor: "default" }}>
                  <div className="ck-pay-radio">
                    <div className="ck-pay-radio-dot" style={{ opacity: 1 }} />
                  </div>
                  <div className="ck-pay-icon">💵</div>
                  <div className="ck-pay-info">
                    <div className="ck-pay-title">Cash on Delivery</div>
                    <div className="ck-pay-desc">Pay in cash when your order arrives at your door</div>
                  </div>
                  <div className="ck-pay-badge">No fees</div>
                </div>
                <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(46,125,79,.06)", border: "1px solid rgba(46,125,79,.18)", borderRadius: 9, display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2.5" style={{ flexShrink: 0 }}>
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <span style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>
                    Keep exact change ready · No advance payment required
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT: Order Summary ── */}
          <div>
            <div className="ck-summary">
              <div className="ck-sum-hdr">
                <h3>Your Order</h3>
                <p>{totalItems} item{totalItems !== 1 ? "s" : ""} · {cartItems.length} product{cartItems.length !== 1 ? "s" : ""}</p>
              </div>

              {/* Items list */}
              <div className="ck-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="ck-item">
                    <div className="ck-item-img">
                      {item.image
                        ? <img src={item.image} alt={item.name} />
                        : <div className="ck-item-fallback">💧</div>
                      }
                    </div>
                    <div className="ck-item-body">
                      <div className="ck-item-name">{item.name ?? "Product"}</div>
                      <div className="ck-item-meta">Qty: {item.quantity ?? 1}</div>
                    </div>
                    <div className="ck-item-price">
                      ₹{((item.price ?? 0) * (item.quantity ?? 1)).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="ck-sum-rows">
                <div className="ck-sum-row">
                  <span className="ck-sum-key">Subtotal</span>
                  <span className="ck-sum-val">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="ck-sum-row">
                  <span className="ck-sum-key">Delivery</span>
                  <span className={`ck-sum-val ${delivery === 0 ? "green" : ""}`}>
                    {delivery === 0 ? "FREE" : `₹${delivery}`}
                  </span>
                </div>
                <div className="ck-sum-row">
                  <span className="ck-sum-key">Tax (GST incl.)</span>
                  <span className="ck-sum-val">Included</span>
                </div>
                <div className="ck-sum-row">
                  <span className="ck-sum-key">Payment</span>
                  <span className="ck-sum-val" style={{ color: "rgba(226,204,138,.8)" }}>Cash on Delivery</span>
                </div>

                <div className="ck-sum-div" />

                <div className="ck-sum-total">
                  <span className="ck-sum-total-key">TOTAL</span>
                  <span className="ck-sum-total-val">₹{total.toLocaleString()}</span>
                </div>
                {delivery === 0 && (
                  <div className="ck-sum-savings">🎉 You saved ₹99 on delivery!</div>
                )}
              </div>

              {/* Place order button */}
              <button
                className={`ck-place-btn ${placing ? "loading" : ""}`}
                onClick={placeOrder}
                disabled={placing}
              >
                {placing ? (
                  <>
                    <div style={{
                      width: 16, height: 16,
                      border: `2px solid rgba(15,28,42,.3)`,
                      borderTopColor: T.navy,
                      borderRadius: "50%",
                      animation: "spin .7s linear infinite",
                    }} />
                    PLACING ORDER…
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.navy} strokeWidth="2.5">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    PLACE ORDER · ₹{total.toLocaleString()}
                  </>
                )}
              </button>

              <div className="ck-trust-row">
                {[["🔒","Secure Pay"],["🚚","Fast Delivery"],["🔄","Easy Returns"]].map(([ic, tx]) => (
                  <div key={tx} className="ck-trust-pill">{ic} {tx}</div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="ck-bnav">
        {[
          { label: "Home",     icon: "🏠", to: "/user" },
          { label: "Search",   icon: "🔍", to: "/products" },
          { label: "Cart",     icon: "🛒", to: "/cart" },
          { label: "Checkout", icon: "💳", to: "/checkout", active: true },
          { label: "Profile",  icon: "👤", to: "/profile" },
        ].map((t) => (
          <Link key={t.label} to={t.to} className={`ck-nav-tab ${t.active ? "active" : ""}`}>
            <div className="ti">{t.icon}</div>
            <div className="ck-nav-tab-lbl">{t.label}</div>
            {t.active && <div className="ck-nav-bar" />}
          </Link>
        ))}
      </nav>

      {/* Toast */}
      <div className={`ck-toast ${toast.show ? "show" : ""}`}>{toast.msg}</div>
    </>
  );
}