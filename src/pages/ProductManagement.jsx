import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";

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
.pm-topbar {
  background: var(--navy);
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
}
.pm-topbar span {
  font-size: 10px;
  color: rgba(226,204,138,.7);
  letter-spacing: .5px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.pm-topbar b { color: var(--goldL); font-weight: 600; }

/* ── NAVBAR ── */
.pm-nav {
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
.pm-logo {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-shrink: 0;
  text-decoration: none;
}
.pm-logo-drop {
  width: 22px;
  height: 28px;
  background: linear-gradient(160deg, #B8E0F7, #1A6FA3);
  border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
  position: relative;
}
.pm-logo-drop::after {
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
.pm-logo h1 {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2px;
  line-height: 1;
}
.pm-logo p {
  font-size: 7px;
  color: var(--gold);
  letter-spacing: 2.5px;
  text-transform: uppercase;
  margin-top: 2px;
}
.pm-nav-badge {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 14px 5px 10px;
  border-radius: 20px;
  background: rgba(201,168,76,.1);
  border: 1px solid rgba(201,168,76,.25);
}
.pm-nav-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--gold);
  animation: pulseDot 2s ease-in-out infinite;
}
@keyframes pulseDot {
  0%,100% { opacity: 1; transform: scale(1); }
  50%      { opacity: .5; transform: scale(.7); }
}
.pm-nav-badge span {
  font-size: 11px;
  font-weight: 600;
  color: var(--goldL);
  letter-spacing: .5px;
}

/* ── BREADCRUMB ── */
.pm-bread {
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
.pm-bread a { color: var(--ivory); transition: color .15s; }
.pm-bread a:hover { color: var(--navy); }
.pm-bread-sep { color: var(--border); }
.pm-bread-cur { color: var(--navy); font-weight: 600; }

/* ── PAGE ── */
.pm-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 80px;
  animation: pmFade .35s ease;
}
@keyframes pmFade {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}

/* ── PAGE HEADER ── */
.pm-hdr {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 14px;
}
.pm-hdr-left h1 {
  font-family: var(--font-display);
  font-size: 38px;
  font-weight: 700;
  color: var(--navy);
  line-height: 1;
  margin-bottom: 5px;
}
.pm-hdr-left p { font-size: 12px; color: var(--ivory); }

.pm-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 22px;
  background: linear-gradient(135deg, var(--gold), var(--goldL));
  color: var(--navy);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-decoration: none;
  box-shadow: 0 4px 16px rgba(201,168,76,.28);
  transition: opacity .15s, transform .15s;
  font-family: var(--font-body);
}
.pm-add-btn:hover { opacity: .9; transform: translateY(-1px); }

/* ── SECTION LABEL ── */
.pm-section-label {
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
.pm-section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

/* ── LAYOUT ── */
.pm-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
  align-items: start;
}
@media (max-width: 900px) { .pm-layout { grid-template-columns: 1fr; } }

/* ── SECTION CARD ── */
.pm-section {
  background: var(--white);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  overflow: hidden;
  animation: pmFade .35s ease both;
}
.pm-section + .pm-section { margin-top: 16px; }

.pm-sec-hdr {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 10px;
}
.pm-sec-hdr h3 {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--navy);
  flex: 1;
}
.pm-sec-hdr p { font-size: 10px; color: var(--ivory); }
.pm-sec-icon {
  width: 32px; height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(201,168,76,.12), rgba(201,168,76,.05));
  border: 1px solid rgba(201,168,76,.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}
.pm-sec-count {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  background: rgba(201,168,76,.1);
  color: var(--gold);
  border: 1px solid rgba(201,168,76,.2);
}

/* ── PRODUCT LIST ── */
.pm-products { display: flex; flex-direction: column; gap: 0; }

.pm-product {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(229,224,213,.6);
  transition: background .15s;
}
.pm-product:last-child { border-bottom: none; }
.pm-product:hover { background: rgba(201,168,76,.02); }

.pm-product-img {
  width: 52px; height: 52px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}
.pm-product-img img { width: 52px; height: 52px; object-fit: contain; }
.pm-product-fallback { font-size: 22px; opacity: .35; }

.pm-product-info { flex: 1; min-width: 0; }
.pm-product-name {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--navy);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pm-product-meta { font-size: 10px; color: var(--ivory); margin-top: 3px; display: flex; gap: 10px; flex-wrap: wrap; }
.pm-product-price {
  font-size: 15px;
  font-weight: 700;
  color: var(--navy);
  white-space: nowrap;
  margin-right: 8px;
}

.pm-product-actions { display: flex; gap: 6px; }

/* ── BUTTONS ── */
.pm-btn {
  height: 32px;
  padding: 0 14px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .6px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  border: 1.5px solid transparent;
  transition: opacity .15s, transform .15s;
  font-family: var(--font-body);
}
.pm-btn:hover { opacity: .88; transform: translateY(-1px); }
.pm-btn:disabled { opacity: .4; cursor: not-allowed; transform: none; }

.pm-btn-red {
  background: rgba(176,58,46,.1);
  color: var(--red);
  border-color: rgba(176,58,46,.25);
}
.pm-btn-red:hover { background: rgba(176,58,46,.16); }

.pm-btn-gold {
  background: linear-gradient(135deg, var(--gold), var(--goldL));
  color: var(--navy);
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(201,168,76,.2);
}

.pm-btn-navy {
  background: var(--navy);
  color: var(--gold);
  border-color: transparent;
}

.pm-btn-ghost {
  background: var(--bg);
  color: var(--navy);
  border-color: var(--border);
}

/* ── EMPTY STATE ── */
.pm-empty {
  padding: 48px 24px;
  text-align: center;
}
.pm-empty-drop {
  width: 60px; height: 75px;
  background: linear-gradient(170deg, #E8F6FF 0%, #5BB8E8 50%, #1A6FA3 100%);
  border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
  margin: 0 auto 16px;
  opacity: .3;
  animation: floatDrop 3s ease-in-out infinite;
}
@keyframes floatDrop {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.pm-empty h4 {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--navy);
  margin-bottom: 6px;
}
.pm-empty p { font-size: 12px; color: var(--ivory); }

/* ── CATEGORY PANEL (right) ── */
.pm-cat-panel {
  background: var(--white);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  overflow: hidden;
  position: sticky;
  top: 78px;
  animation: pmFade .4s ease .1s both;
}

.pm-cat-add {
  padding: 16px 18px;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pm-cat-add-row { display: flex; gap: 8px; }

.pm-input {
  flex: 1;
  height: 38px;
  border: 1.5px solid var(--border);
  border-radius: 9px;
  padding: 0 12px;
  font-size: 12px;
  font-family: var(--font-body);
  color: var(--navy);
  background: var(--bg);
  outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.pm-input::placeholder { color: var(--ivory); font-size: 11px; }
.pm-input:focus {
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgba(201,168,76,.08);
  background: var(--white);
}

/* ── CATEGORY LIST ── */
.pm-cats { display: flex; flex-direction: column; gap: 0; }

.pm-cat {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-bottom: 1px solid rgba(229,224,213,.6);
  transition: background .15s;
}
.pm-cat:last-child { border-bottom: none; }
.pm-cat:hover { background: rgba(201,168,76,.02); }

.pm-cat-icon {
  width: 30px; height: 30px;
  border-radius: 8px;
  background: rgba(201,168,76,.08);
  border: 1px solid rgba(201,168,76,.15);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px;
  flex-shrink: 0;
}
.pm-cat-name {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: var(--navy);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pm-cat-actions { display: flex; gap: 5px; flex-shrink: 0; }

.pm-cat-edit-row {
  display: flex;
  gap: 6px;
  flex: 1;
  align-items: center;
}

/* ── TOAST ── */
.pm-toast {
  position: fixed;
  bottom: 30px;
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
.pm-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

/* ── CONFIRM MODAL ── */
.pm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15,28,42,.6);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(3px);
  animation: pmFade .2s ease;
}
.pm-modal {
  background: var(--white);
  border-radius: 18px;
  padding: 32px 28px;
  max-width: 340px;
  width: 90%;
  text-align: center;
  animation: modalIn .25s cubic-bezier(.22,1,.36,1);
}
@keyframes modalIn {
  from { transform: scale(.92); opacity: 0; }
  to   { transform: none; opacity: 1; }
}
.pm-modal-icon {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: rgba(176,58,46,.08);
  border: 2px solid rgba(176,58,46,.2);
  margin: 0 auto 16px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px;
}
.pm-modal h3 {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--navy);
  margin-bottom: 8px;
}
.pm-modal p { font-size: 12px; color: var(--ivory); margin-bottom: 22px; }
.pm-modal-btns { display: flex; gap: 10px; }
.pm-modal-btns .pm-btn { flex: 1; height: 40px; font-size: 11px; justify-content: center; }

/* ── MOBILE ── */
@media (max-width: 768px) {
  .pm-topbar { display: none; }
  .pm-page { padding-bottom: 40px; }
  .pm-product-meta { display: none; }
}
`;

export default function ProductManagement() {
  const [products, setProducts]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editId, setEditId]           = useState(null);
  const [editName, setEditName]       = useState("");
  const [toast, setToast]             = useState({ show: false, msg: "" });
  const [confirm, setConfirm]         = useState(null); // { type, id, name }
  const [saving, setSaving]           = useState(false);

  // 🔥 Real-time products
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // 🔥 Real-time categories
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "categories"), (snap) => {
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2500);
  };

  // ➕ Add category
  const addCategory = async () => {
    if (!newCategory.trim()) return showToast("⚠️ Enter a category name");
    setSaving(true);
    try {
      await addDoc(collection(db, "categories"), {
        name: newCategory.trim(),
        createdAt: new Date(),
      });
      setNewCategory("");
      showToast("✅ Category added");
    } catch (e) {
      showToast("❌ " + e.message);
    } finally {
      setSaving(false);
    }
  };

  // ❌ Delete (product or category) — via confirm modal
  const handleDelete = async () => {
    if (!confirm) return;
    try {
      const col = confirm.type === "product" ? "products" : "categories";
      await deleteDoc(doc(db, col, confirm.id));
      showToast(`🗑️ "${confirm.name}" deleted`);
    } catch (e) {
      showToast("❌ " + e.message);
    } finally {
      setConfirm(null);
    }
  };

  // ✏️ Update category
  const updateCategory = async () => {
    if (!editName.trim()) return showToast("⚠️ Name cannot be empty");
    try {
      await updateDoc(doc(db, "categories", editId), { name: editName.trim() });
      showToast("✅ Category updated");
      setEditId(null);
      setEditName("");
    } catch (e) {
      showToast("❌ " + e.message);
    }
  };

  return (
    <>
      <style>{CSS}</style>

      {/* Confirm Modal */}
      {confirm && (
        <div className="pm-overlay">
          <div className="pm-modal">
            <div className="pm-modal-icon">🗑️</div>
            <h3>Delete {confirm.type === "product" ? "Product" : "Category"}?</h3>
            <p>
              "<b>{confirm.name}</b>" will be permanently removed. This action cannot be undone.
            </p>
            <div className="pm-modal-btns">
              <button className="pm-btn pm-btn-ghost" onClick={() => setConfirm(null)}>
                Cancel
              </button>
              <button className="pm-btn pm-btn-red" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topbar */}
      <div className="pm-topbar">
        {[["🛠","Product","Management"],["📦","Products",products.length],["📂","Categories",categories.length],["⚡","Real-time","sync"]].map(([ic,b,a])=>(
          <span key={b}>{ic} <b>{b}</b> {a}</span>
        ))}
      </div>

      {/* Navbar */}
      <nav className="pm-nav">
        <Link to="/" className="pm-logo">
          <div className="pm-logo-drop" />
          <div><h1>RichDrop</h1><p>Admin Panel</p></div>
        </Link>
        <div className="pm-nav-badge">
          <div className="pm-nav-dot" />
          <span>LIVE — {products.length} Products</span>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="pm-bread">
        <Link to="/">Home</Link>
        <span className="pm-bread-sep">›</span>
        <Link to="/admin">Admin</Link>
        <span className="pm-bread-sep">›</span>
        <span className="pm-bread-cur">Product Management</span>
      </div>

      {/* Page */}
      <div className="pm-page">

        {/* Header */}
        <div className="pm-hdr">
          <div className="pm-hdr-left">
            <h1>Product Management</h1>
            <p>Manage your product catalogue and categories in real time</p>
          </div>
          <Link to="/add-product" className="pm-add-btn">
            ➕ ADD PRODUCT
          </Link>
        </div>

        <div className="pm-layout">

          {/* ── LEFT: Products ── */}
          <div>
            <div className="pm-section-label">Product Catalogue</div>
            <div className="pm-section">
              <div className="pm-sec-hdr">
                <div className="pm-sec-icon">📦</div>
                <div style={{ flex: 1 }}>
                  <h3>All Products</h3>
                  <p>Manage your store catalogue</p>
                </div>
                <div className="pm-sec-count">{products.length} items</div>
              </div>

              {products.length === 0 ? (
                <div className="pm-empty">
                  <div className="pm-empty-drop" />
                  <h4>No products yet</h4>
                  <p>Click "Add Product" to get started.</p>
                </div>
              ) : (
                <div className="pm-products">
                  {products.map((p) => (
                    <div key={p.id} className="pm-product">
                      {/* Image */}
                      <div className="pm-product-img">
                        {p.image
                          ? <img src={p.image} alt={p.name} />
                          : <div className="pm-product-fallback">💧</div>
                        }
                      </div>

                      {/* Info */}
                      <div className="pm-product-info">
                        <div className="pm-product-name">{p.name ?? "Unnamed Product"}</div>
                        <div className="pm-product-meta">
                          {p.category && <span>📂 {p.category}</span>}
                          {p.stock != null && <span>🏷 Stock: {p.stock}</span>}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="pm-product-price">₹{(p.price ?? 0).toLocaleString()}</div>

                      {/* Actions */}
                      <div className="pm-product-actions">
                        <button
                          className="pm-btn pm-btn-red"
                          onClick={() => setConfirm({ type: "product", id: p.id, name: p.name ?? "this product" })}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Categories ── */}
          <div>
            <div className="pm-section-label">Categories</div>
            <div className="pm-cat-panel">
              <div className="pm-sec-hdr">
                <div className="pm-sec-icon">📂</div>
                <div style={{ flex: 1 }}>
                  <h3>Categories</h3>
                  <p>Organise your products</p>
                </div>
                <div className="pm-sec-count">{categories.length}</div>
              </div>

              {/* Add category */}
              <div className="pm-cat-add">
                <label style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "var(--ivory)", textTransform: "uppercase" }}>
                  New Category
                </label>
                <div className="pm-cat-add-row">
                  <input
                    className="pm-input"
                    placeholder="e.g. Water Purifiers"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCategory()}
                  />
                  <button
                    className="pm-btn pm-btn-gold"
                    onClick={addCategory}
                    disabled={saving}
                    style={{ padding: "0 16px", height: 38 }}
                  >
                    {saving ? "…" : "Add"}
                  </button>
                </div>
              </div>

              {/* Category list */}
              {categories.length === 0 ? (
                <div className="pm-empty" style={{ padding: "32px 18px" }}>
                  <p>No categories yet. Add one above.</p>
                </div>
              ) : (
                <div className="pm-cats">
                  {categories.map((c) => (
                    <div key={c.id} className="pm-cat">
                      <div className="pm-cat-icon">📂</div>

                      {editId === c.id ? (
                        <div className="pm-cat-edit-row">
                          <input
                            className="pm-input"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && updateCategory()}
                            autoFocus
                            style={{ height: 32, fontSize: 12 }}
                          />
                          <button
                            className="pm-btn pm-btn-navy"
                            onClick={updateCategory}
                            style={{ padding: "0 12px", height: 32, flexShrink: 0 }}
                          >
                            Save
                          </button>
                          <button
                            className="pm-btn pm-btn-ghost"
                            onClick={() => { setEditId(null); setEditName(""); }}
                            style={{ padding: "0 10px", height: 32, flexShrink: 0 }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="pm-cat-name">{c.name}</div>
                          <div className="pm-cat-actions">
                            <button
                              className="pm-btn pm-btn-ghost"
                              style={{ height: 28, padding: "0 10px", fontSize: 10 }}
                              onClick={() => { setEditId(c.id); setEditName(c.name); }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="pm-btn pm-btn-red"
                              style={{ height: 28, padding: "0 10px", fontSize: 10 }}
                              onClick={() => setConfirm({ type: "category", id: c.id, name: c.name })}
                            >
                              🗑
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Toast */}
      <div className={`pm-toast ${toast.show ? "show" : ""}`}>{toast.msg}</div>
    </>
  );
}