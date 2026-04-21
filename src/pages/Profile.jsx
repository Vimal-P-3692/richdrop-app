import { useEffect, useState, useRef } from "react";
import { auth, db } from "../firebase/config";
import {
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  doc, getDoc, setDoc,
  collection, query, where,
  onSnapshot, orderBy,
} from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --navy:   #0F1C2A;
  --navy2:  #1A2E42;
  --gold:   #C9A84C;
  --goldL:  #E2CC8A;
  --bg:     #F7F5F0;
  --white:  #FFFFFF;
  --ivory:  #8A7A60;
  --border: #E5E0D5;
  --blue:   #1A6FA3;
  --green:  #2E7D4F;
  --red:    #B03A2E;
  --purple: #7B3FA0;
  --font-display: 'Cormorant Garamond', serif;
  --font-body:    'Outfit', sans-serif;
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
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

/* ── NAVBAR ── */
.pf-nav {
  background: var(--navy);
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 12px;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(201,168,76,.12);
}
.pf-logo {
  display: flex; align-items: center; gap: 9px;
  flex-shrink: 0; text-decoration: none;
}
.pf-logo-drop {
  width: 22px; height: 28px;
  background: linear-gradient(160deg, #B8E0F7, #1A6FA3);
  border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
  position: relative; flex-shrink: 0;
}
.pf-logo-drop::after {
  content: ''; position: absolute;
  top: -4px; left: 50%; transform: translateX(-50%);
  width: 5px; height: 5px; background: var(--gold); border-radius: 50%;
}
.pf-logo h1 {
  font-family: var(--font-display); font-size: 20px;
  font-weight: 700; color: #fff; letter-spacing: 2px; line-height: 1;
}
.pf-logo p {
  font-size: 7px; color: var(--gold);
  letter-spacing: 2.5px; text-transform: uppercase; margin-top: 2px;
}
.pf-nav-back {
  margin-left: auto;
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 8px;
  font-size: 12px; font-weight: 600;
  color: rgba(255,255,255,.7);
  border: 1px solid rgba(255,255,255,.12);
  transition: all .15s; text-decoration: none;
}
.pf-nav-back:hover {
  background: rgba(255,255,255,.07); color: #fff;
  border-color: rgba(201,168,76,.4);
}

/* ── PAGE ── */
.pf-page { max-width: 960px; margin: 0 auto; padding: 32px 24px 80px; }

.pf-page-hdr { margin-bottom: 28px; }
.pf-page-hdr h2 {
  font-family: var(--font-display); font-size: 32px;
  font-weight: 700; color: var(--navy); line-height: 1; margin-bottom: 4px;
}
.pf-page-hdr p { font-size: 13px; color: var(--ivory); }

.pf-grid {
  display: grid;
  grid-template-columns: 290px 1fr;
  gap: 20px; align-items: start;
}
@media (max-width: 760px) { .pf-grid { grid-template-columns: 1fr; } }

/* ── CARD ── */
.pf-card {
  background: var(--white);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  overflow: hidden;
}

/* ── AVATAR BAND ── */
.pf-avatar-band {
  background: var(--navy);
  padding: 28px 24px 20px;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  position: relative; overflow: hidden;
}
.pf-avatar-band::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse at 70% 30%, rgba(201,168,76,.08) 0%, transparent 70%);
  pointer-events: none;
}
.pf-avatar-wrap { position: relative; z-index: 1; }
.pf-avatar {
  width: 76px; height: 76px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-size: 30px; font-weight: 700;
  color: var(--navy); border: 3px solid rgba(201,168,76,.5);
  cursor: pointer; transition: transform .2s; user-select: none;
}
.pf-avatar:hover { transform: scale(1.06); }
.pf-avatar-edit-hint {
  position: absolute; bottom: -2px; right: -2px;
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--gold); border: 2px solid var(--navy);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; pointer-events: none;
}
.pf-avatar-name {
  font-family: var(--font-display); font-size: 20px; font-weight: 700;
  color: #fff; line-height: 1; text-align: center; position: relative; z-index: 1;
}
.pf-avatar-email {
  font-size: 11px; color: rgba(226,204,138,.6);
  text-align: center; position: relative; z-index: 1;
}
.pf-role-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 12px;
  background: rgba(201,168,76,.12); border: 1px solid rgba(201,168,76,.3);
  border-radius: 20px; font-size: 9px; font-weight: 700;
  color: var(--gold); letter-spacing: 1.5px; text-transform: uppercase;
  position: relative; z-index: 1;
}

/* Colour picker popover */
.pf-color-popover {
  position: absolute;
  top: calc(100% + 10px); left: 50%; transform: translateX(-50%);
  background: var(--white); border: 1px solid var(--border);
  border-radius: 12px; padding: 12px;
  box-shadow: var(--shadow-md);
  z-index: 20;
  display: flex; flex-wrap: wrap; gap: 7px;
  width: 168px;
  animation: pfFadeIn .15s ease;
}
@keyframes pfFadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}
.pf-color-swatch {
  width: 28px; height: 28px; border-radius: 50%;
  cursor: pointer; transition: transform .15s;
  border: 2px solid transparent;
}
.pf-color-swatch:hover { transform: scale(1.18); }
.pf-color-swatch.selected { border-color: var(--navy); box-shadow: 0 0 0 2px var(--gold); }

/* ── SECTION HEADER ── */
.pf-section-hdr {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--border);
}
.pf-section-title {
  font-size: 11px; font-weight: 700; color: var(--ivory);
  letter-spacing: 1.5px; text-transform: uppercase;
}
.pf-edit-toggle {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 12px; border-radius: 7px;
  font-size: 11px; font-weight: 600;
  cursor: pointer; transition: all .15s; font-family: var(--font-body);
}
.pf-edit-toggle.view-mode {
  background: var(--bg); border: 1px solid var(--border); color: var(--navy);
}
.pf-edit-toggle.view-mode:hover { border-color: var(--gold); color: var(--gold); }
.pf-edit-toggle.edit-mode {
  background: rgba(176,58,46,.07); border: 1px solid rgba(176,58,46,.25); color: var(--red);
}
.pf-edit-toggle.edit-mode:hover { background: rgba(176,58,46,.13); }

/* ── DETAIL ROWS ── */
.pf-details { padding: 4px 20px 8px; display: flex; flex-direction: column; }
.pf-detail-row {
  display: flex; align-items: center; gap: 11px;
  padding: 11px 0; border-bottom: 1px solid var(--border);
}
.pf-detail-row:last-child { border-bottom: none; }
.pf-detail-icon {
  width: 32px; height: 32px; border-radius: 8px;
  background: var(--bg); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; flex-shrink: 0;
}
.pf-detail-body { flex: 1; min-width: 0; }
.pf-detail-lbl {
  font-size: 9px; font-weight: 600; color: var(--ivory);
  letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 3px;
}
.pf-detail-val {
  font-size: 13px; font-weight: 500; color: var(--navy);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.pf-detail-static { font-size: 11px; color: var(--ivory); font-style: italic; }

/* Inline inputs */
.pf-inline-input {
  width: 100%;
  background: var(--bg); border: 1.5px solid var(--border);
  border-radius: 7px; padding: 7px 10px;
  font-size: 13px; font-family: var(--font-body);
  color: var(--navy); outline: none; transition: border-color .18s;
}
.pf-inline-input:focus { border-color: var(--gold); background: #fff; }
.pf-inline-input.error { border-color: var(--red); }

/* Save / cancel row */
.pf-save-row {
  padding: 12px 20px 16px;
  display: flex; align-items: center; gap: 8px;
  border-top: 1px solid var(--border);
}
.pf-save-btn {
  flex: 1; height: 38px; border-radius: 9px;
  background: var(--navy); color: var(--gold);
  font-size: 12px; font-weight: 700; letter-spacing: 1px;
  border: none; cursor: pointer; font-family: var(--font-body);
  display: flex; align-items: center; justify-content: center; gap: 7px;
  transition: opacity .15s;
}
.pf-save-btn:hover:not(:disabled) { opacity: .85; }
.pf-save-btn:disabled { opacity: .5; cursor: default; }
.pf-cancel-btn {
  height: 38px; padding: 0 16px; border-radius: 9px;
  background: var(--bg); border: 1px solid var(--border); color: var(--ivory);
  font-size: 12px; font-weight: 600; font-family: var(--font-body);
  cursor: pointer; transition: all .15s; white-space: nowrap;
}
.pf-cancel-btn:hover { color: var(--navy); }

/* Inline feedback messages */
.pf-msg {
  margin: 0 20px 14px;
  padding: 9px 14px;
  font-size: 11px; font-weight: 600;
  display: flex; align-items: center; gap: 6px;
  border-radius: 8px;
}
.pf-msg.success {
  background: rgba(46,125,79,.08); color: var(--green);
  border: 1px solid rgba(46,125,79,.2);
}
.pf-msg.error {
  background: rgba(176,58,46,.07); color: var(--red);
  border: 1px solid rgba(176,58,46,.2);
}

/* ── QUICK NAV ── */
.pf-quick-nav {
  padding: 12px 20px; border-top: 1px solid var(--border);
  display: flex; flex-direction: column; gap: 2px;
}
.pf-quick-link {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border-radius: 8px;
  font-size: 13px; font-weight: 500; color: var(--navy);
  transition: background .15s; text-decoration: none;
}
.pf-quick-link:hover { background: var(--bg); }
.pf-quick-link .qi { font-size: 15px; width: 20px; text-align: center; }
.pf-quick-link .qa { margin-left: auto; font-size: 11px; color: var(--ivory); }

/* ── LOGOUT ── */
.pf-logout-wrap { padding: 14px 20px; border-top: 1px solid var(--border); }
.pf-logout {
  width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 11px; border-radius: 9px;
  background: rgba(176,58,46,.06); border: 1px solid rgba(176,58,46,.2);
  color: var(--red); font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all .18s; font-family: var(--font-body);
}
.pf-logout:hover { background: rgba(176,58,46,.12); border-color: rgba(176,58,46,.4); }

/* ── ORDERS CARD ── */
.pf-orders-hdr {
  padding: 20px 24px 16px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--border);
}
.pf-orders-title {
  font-family: var(--font-display); font-size: 20px;
  font-weight: 700; color: var(--navy);
}
.pf-orders-count {
  padding: 3px 10px; background: var(--bg);
  border: 1px solid var(--border); border-radius: 20px;
  font-size: 11px; font-weight: 600; color: var(--ivory);
}

.pf-order { border-bottom: 1px solid var(--border); transition: background .15s; }
.pf-order:last-child { border-bottom: none; }
.pf-order:hover { background: #FDFCFB; }

.pf-order-top {
  padding: 16px 24px 12px;
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
}
.pf-order-id {
  font-size: 10px; color: var(--ivory); margin-bottom: 4px;
  font-family: monospace; letter-spacing: .5px;
}
.pf-order-date { font-size: 12px; font-weight: 600; color: var(--navy); }
.pf-order-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.pf-order-total { font-size: 16px; font-weight: 700; color: var(--navy); }

.pf-status {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: 20px;
  font-size: 10px; font-weight: 700; letter-spacing: .5px; white-space: nowrap;
}
.pf-status-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.status-pending   { background: rgba(201,168,76,.12); color: #A07A28; border: 1px solid rgba(201,168,76,.3); }
.status-confirmed { background: rgba(26,111,163,.1);  color: #1A6FA3; border: 1px solid rgba(26,111,163,.3); }
.status-delivered { background: rgba(46,125,79,.1);   color: #2E7D4F; border: 1px solid rgba(46,125,79,.3); }
.status-cancelled { background: rgba(176,58,46,.1);   color: #B03A2E; border: 1px solid rgba(176,58,46,.3); }
.status-shipped   { background: rgba(123,63,160,.1);  color: #7B3FA0; border: 1px solid rgba(123,63,160,.3); }
.dot-pending   { background: #C9A84C; }
.dot-confirmed { background: #1A6FA3; }
.dot-delivered { background: #2E7D4F; }
.dot-cancelled { background: #B03A2E; }
.dot-shipped   { background: #7B3FA0; }

.pf-order-items { padding: 0 24px 16px; display: flex; flex-direction: column; gap: 6px; }
.pf-order-item {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 8px 10px; background: var(--bg);
  border-radius: 8px; border: 1px solid var(--border);
}
.pf-item-name {
  font-size: 12px; font-weight: 500; color: var(--navy);
  flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.pf-item-qty { font-size: 10px; color: var(--ivory); white-space: nowrap; flex-shrink: 0; }
.pf-item-price { font-size: 12px; font-weight: 600; color: var(--navy); white-space: nowrap; flex-shrink: 0; }

/* Empty */
.pf-empty { padding: 52px 24px; text-align: center; }
.pf-empty-icon { font-size: 42px; opacity: .25; margin-bottom: 14px; }
.pf-empty h4 { font-size: 16px; font-weight: 700; color: var(--navy); margin-bottom: 6px; }
.pf-empty p { font-size: 12px; color: var(--ivory); margin-bottom: 20px; }
.pf-empty-cta {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 20px; background: var(--navy); color: var(--gold);
  border-radius: 8px; font-size: 12px; font-weight: 700; letter-spacing: 1px;
  text-decoration: none; transition: opacity .15s;
}
.pf-empty-cta:hover { opacity: .85; }

/* Skeleton */
.pf-skeleton {
  background: linear-gradient(90deg, #EEEAE2 25%, #F7F4EE 50%, #EEEAE2 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 6px;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* Spinner */
.pf-spin {
  width: 14px; height: 14px;
  border: 2px solid rgba(201,168,76,.3);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin .65s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Mobile bottom nav */
.pf-bnav {
  display: none; position: fixed; bottom: 0; left: 0; right: 0;
  background: var(--white); border-top: 1px solid var(--border);
  padding: 6px 0 env(safe-area-inset-bottom, 8px); z-index: 100;
}
@media (max-width: 768px) {
  .pf-bnav { display: flex; }
  .pf-page { padding-bottom: 90px; }
}
.pf-bnav-tab {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 3px; cursor: pointer; text-decoration: none; padding: 4px 2px; min-width: 0;
}
.pf-bnav-tab .ti { font-size: 18px; line-height: 1; }
.pf-bnav-lbl { font-size: 9px; color: #C0B8A8; font-weight: 500; line-height: 1; }
.pf-bnav-tab.active .pf-bnav-lbl { color: var(--navy); font-weight: 700; }
.pf-bnav-bar { width: 16px; height: 2px; background: var(--gold); border-radius: 2px; }

@media (max-width: 480px) {
  .pf-page { padding: 20px 14px 90px; }
  .pf-nav  { padding: 0 14px; }
}
`;

// ── Avatar colour swatches ────────────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: "linear-gradient(135deg,#C9A84C,#E2CC8A)", key: "gold"   },
  { bg: "linear-gradient(135deg,#1A6FA3,#5BB8E8)", key: "blue"   },
  { bg: "linear-gradient(135deg,#2E7D4F,#6AC98A)", key: "green"  },
  { bg: "linear-gradient(135deg,#7B3FA0,#C07EE0)", key: "purple" },
  { bg: "linear-gradient(135deg,#B03A2E,#E07060)", key: "red"    },
  { bg: "linear-gradient(135deg,#C96A1A,#F5A455)", key: "orange" },
  { bg: "linear-gradient(135deg,#2C4A6A,#6A9DC0)", key: "slate"  },
  { bg: "linear-gradient(135deg,#5A4A3A,#A07850)", key: "tan"    },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function statusCfg(status) {
  const s = (status ?? "pending").toLowerCase();
  const map = {
    pending:   { cls: "status-pending",   dot: "dot-pending",   label: "Pending"   },
    confirmed: { cls: "status-confirmed", dot: "dot-confirmed", label: "Confirmed" },
    shipped:   { cls: "status-shipped",   dot: "dot-shipped",   label: "Shipped"   },
    delivered: { cls: "status-delivered", dot: "dot-delivered", label: "Delivered" },
    cancelled: { cls: "status-cancelled", dot: "dot-cancelled", label: "Cancelled" },
  };
  return map[s] ?? map.pending;
}

function fmtDate(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function initials(name, email) {
  if (name)  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  if (email) return email[0].toUpperCase();
  return "?";
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Profile() {
  const navigate = useNavigate();

  // data
  const [userData, setUserData] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [orders, setOrders]     = useState([]);

  // profile edit
  const [editing, setEditing]       = useState(false);
  const [form, setForm]             = useState({ name: "", phone: "", city: "", address: "" });
  const [saving, setSaving]         = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  // avatar colour
  const [avatarColor, setAvatarColor]         = useState("gold");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorRef = useRef(null);

  const user = auth.currentUser;

  // Fetch user doc
  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    getDoc(doc(db, "users", user.uid)).then(snap => {
      if (snap.exists()) {
        const d = snap.data();
        setUserData(d);
        setForm({ name: d.name || "", phone: d.phone || "", city: d.city || "", address: d.address || "" });
        setAvatarColor(d.avatarColor || "gold");
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [navigate, user]);

  // Real-time orders
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, snap =>
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, [user]);

  // Close colour picker on outside click
  useEffect(() => {
    const h = e => {
      if (colorRef.current && !colorRef.current.contains(e.target))
        setShowColorPicker(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── Save profile ──────────────────────────────────────────────────────────
  const saveProfile = async () => {
    if (!form.name.trim()) {
      setProfileMsg({ type: "error", text: "Name cannot be empty." });
      return;
    }
    setSaving(true);
    setProfileMsg(null);
    try {
      const updated = { ...userData, ...form, name: form.name.trim() };
      await setDoc(doc(db, "users", user.uid), updated, { merge: true });
      await updateProfile(user, { displayName: form.name.trim() });
      setUserData(updated);
      setEditing(false);
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setProfileMsg(null), 3500);
    } catch {
      setProfileMsg({ type: "error", text: "Failed to save. Please try again." });
    }
    setSaving(false);
  };

  const cancelEdit = () => {
    setForm({ name: userData?.name || "", phone: userData?.phone || "", city: userData?.city || "", address: userData?.address || "" });
    setEditing(false);
    setProfileMsg(null);
  };

  // ── Save avatar colour ────────────────────────────────────────────────────
  const saveAvatarColor = async key => {
    setAvatarColor(key);
    setShowColorPicker(false);
    try { await setDoc(doc(db, "users", user.uid), { avatarColor: key }, { merge: true }); } catch (_) {}
  };

  const handleLogout = async () => { await signOut(auth); navigate("/login"); };

  const displayName = form.name || userData?.name || user?.displayName || user?.email?.split("@")[0] || "User";
  const ini         = initials(displayName, user?.email);
  const avatarBg    = (AVATAR_COLORS.find(c => c.key === avatarColor) || AVATAR_COLORS[0]).bg;

  // Editable fields
  const FIELDS = [
    { key: "name",    icon: "👤", label: "Full Name",    placeholder: "Your full name",     type: "text",  required: true  },
    { key: "phone",   icon: "📱", label: "Phone Number", placeholder: "+91 98765 43210",    type: "tel",   required: false },
    { key: "city",    icon: "📍", label: "City",         placeholder: "e.g. Chennai",       type: "text",  required: false },
    { key: "address", icon: "🏠", label: "Address",      placeholder: "Street, Area, PIN",  type: "text",  required: false },
  ];

  return (
    <>
      <style>{CSS}</style>

      {/* ── Navbar ── */}
      <nav className="pf-nav">
        <Link to="/user" className="pf-logo">
          <div className="pf-logo-drop" />
          <div><h1>RichDrop</h1><p>Pure Water Solutions</p></div>
        </Link>
        <Link to="/user" className="pf-nav-back">← Back to Store</Link>
      </nav>

      <div className="pf-page">
        <div className="pf-page-hdr">
          <h2>My Account</h2>
          <p>Manage your profile and track your orders</p>
        </div>

        <div className="pf-grid">

          {/* ══════════════════════════════════
              LEFT — Profile card
          ══════════════════════════════════ */}
          <div className="pf-card">

            {/* Avatar band */}
            <div className="pf-avatar-band">
              {loading ? (
                <>
                  <div style={{ width: 76, height: 76, borderRadius: "50%" }} className="pf-skeleton" />
                  <div style={{ width: 130, height: 18, marginTop: 4 }} className="pf-skeleton" />
                  <div style={{ width: 170, height: 12 }} className="pf-skeleton" />
                </>
              ) : (
                <>
                  <div className="pf-avatar-wrap" ref={colorRef}>
                    <div
                      className="pf-avatar"
                      style={{ background: avatarBg }}
                      onClick={() => setShowColorPicker(v => !v)}
                      title="Tap to change avatar colour"
                    >
                      {ini}
                    </div>
                    <div className="pf-avatar-edit-hint">✏️</div>

                    {showColorPicker && (
                      <div className="pf-color-popover">
                        {AVATAR_COLORS.map(c => (
                          <div
                            key={c.key}
                            className={`pf-color-swatch ${avatarColor === c.key ? "selected" : ""}`}
                            style={{ background: c.bg }}
                            onClick={() => saveAvatarColor(c.key)}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pf-avatar-name">{displayName}</div>
                  <div className="pf-avatar-email">{user?.email}</div>
                  <div className="pf-role-badge"><span>✦</span>{userData?.role ?? "Customer"}</div>
                </>
              )}
            </div>

            {/* ── Account Details ── */}
            <div className="pf-section-hdr">
              <span className="pf-section-title">Account Details</span>
              {!loading && (
                editing
                  ? <button className="pf-edit-toggle edit-mode" onClick={cancelEdit}>✕ Cancel</button>
                  : <button className="pf-edit-toggle view-mode" onClick={() => { setEditing(true); setProfileMsg(null); }}>✏️ Edit</button>
              )}
            </div>

            <div className="pf-details">
              {/* Editable fields */}
              {FIELDS.map(f => (
                <div className="pf-detail-row" key={f.key}>
                  <div className="pf-detail-icon">{f.icon}</div>
                  <div className="pf-detail-body">
                    <div className="pf-detail-lbl">{f.label}</div>
                    {editing ? (
                      <input
                        className={`pf-inline-input${f.required && !form[f.key].trim() ? " error" : ""}`}
                        type={f.type}
                        value={form[f.key]}
                        placeholder={f.placeholder}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      />
                    ) : (
                      <div className="pf-detail-val">
                        {loading
                          ? <span className="pf-skeleton" style={{ display: "block", width: "75%", height: 14 }} />
                          : (userData?.[f.key] || <span className="pf-detail-static">Not set — tap Edit to add</span>)
                        }
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Read-only: email */}
              <div className="pf-detail-row">
                <div className="pf-detail-icon">📧</div>
                <div className="pf-detail-body">
                  <div className="pf-detail-lbl">Email <span style={{ fontSize: 8, color: "var(--blue)", marginLeft: 4 }}>READ-ONLY</span></div>
                  <div className="pf-detail-val" style={{ fontSize: 12 }}>{user?.email}</div>
                </div>
              </div>

              {/* Read-only: member since */}
              <div className="pf-detail-row">
                <div className="pf-detail-icon">🏷️</div>
                <div className="pf-detail-body">
                  <div className="pf-detail-lbl">Member Since</div>
                  <div className="pf-detail-val">
                    {loading
                      ? <span className="pf-skeleton" style={{ display: "block", width: "60%", height: 14 }} />
                      : fmtDate(userData?.createdAt)
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Save / cancel row */}
            {editing && (
              <div className="pf-save-row">
                <button className="pf-save-btn" onClick={saveProfile} disabled={saving}>
                  {saving ? <><div className="pf-spin" /> Saving…</> : "💾 Save Changes"}
                </button>
                <button className="pf-cancel-btn" onClick={cancelEdit}>Cancel</button>
              </div>
            )}

            {profileMsg && (
              <div className={`pf-msg ${profileMsg.type}`}>
                {profileMsg.type === "success" ? "✅" : "❌"} {profileMsg.text}
              </div>
            )}

            {/* Quick links — Cart only */}
            <div className="pf-quick-nav">
              <Link to="/cart" className="pf-quick-link">
                <span className="qi">🛒</span>
                My Cart
                <span className="qa">→</span>
              </Link>
            </div>

            <div className="pf-logout-wrap">
              <button className="pf-logout" onClick={handleLogout}><span>🚪</span> Sign Out</button>
            </div>
          </div>

          {/* ══════════════════════════════════
              RIGHT — Orders card
          ══════════════════════════════════ */}
          <div className="pf-card">
            <div className="pf-orders-hdr">
              <div className="pf-orders-title">My Orders</div>
              <div className="pf-orders-count">{orders.length} order{orders.length !== 1 ? "s" : ""}</div>
            </div>

            {orders.length === 0 ? (
              <div className="pf-empty">
                <div className="pf-empty-icon">📦</div>
                <h4>No orders yet</h4>
                <p>Your order history will appear here once you make a purchase.</p>
                <Link to="/user" className="pf-empty-cta">Browse Products →</Link>
              </div>
            ) : orders.map(order => {
              const sc = statusCfg(order.status);
              return (
                <div key={order.id} className="pf-order">
                  <div className="pf-order-top">
                    <div>
                      <div className="pf-order-id">#{order.id.slice(0, 12).toUpperCase()}</div>
                      <div className="pf-order-date">{fmtDate(order.createdAt)}</div>
                    </div>
                    <div className="pf-order-right">
                      <div className="pf-order-total">₹{order.total ?? 0}</div>
                      <div className={`pf-status ${sc.cls}`}>
                        <span className={`pf-status-dot ${sc.dot}`} />
                        {sc.label}
                      </div>
                    </div>
                  </div>

                  {Array.isArray(order.items) && order.items.length > 0 && (
                    <div className="pf-order-items">
                      {order.items.map((item, i) => (
                        <div key={i} className="pf-order-item">
                          <div className="pf-item-name">{item.name ?? "Product"}</div>
                          <div className="pf-item-qty">× {item.quantity ?? 1}</div>
                          <div className="pf-item-price">₹{(item.price ?? 0) * (item.quantity ?? 1)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="pf-bnav">
        {[
          { label: "Home",    icon: "🏠", to: "/user" },
          { label: "Search",  icon: "🔍", to: "/products" },
          { label: "Cart",    icon: "🛒", to: "/cart" },
          { label: "Service", icon: "🔧", to: "/service" },
          { label: "Profile", icon: "👤", to: "/profile", active: true },
        ].map(t => (
          <Link key={t.label} to={t.to} className={`pf-bnav-tab ${t.active ? "active" : ""}`}>
            <div className="ti">{t.icon}</div>
            <div className="pf-bnav-lbl">{t.label}</div>
            {t.active && <div className="pf-bnav-bar" />}
          </Link>
        ))}
      </nav>
    </>
  );
}