import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
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

/* ── TOPBAR ── */
.ap-topbar {
  background: var(--navy);
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
}
.ap-topbar span {
  font-size: 10px;
  color: rgba(226,204,138,.7);
  letter-spacing: .5px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.ap-topbar b { color: var(--goldL); font-weight: 600; }

/* ── NAVBAR ── */
.ap-nav {
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
.ap-logo {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-shrink: 0;
}
.ap-logo-drop {
  width: 22px;
  height: 28px;
  background: linear-gradient(160deg, #B8E0F7, #1A6FA3);
  border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
  position: relative;
}
.ap-logo-drop::after {
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
.ap-logo h1 {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2px;
  line-height: 1;
}
.ap-logo p {
  font-size: 7px;
  color: var(--gold);
  letter-spacing: 2.5px;
  text-transform: uppercase;
  margin-top: 2px;
}
.ap-nav-badge {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 14px 5px 10px;
  border-radius: 20px;
  background: rgba(201,168,76,.1);
  border: 1px solid rgba(201,168,76,.25);
}
.ap-nav-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--gold);
  animation: pulseDot 2s ease-in-out infinite;
}
@keyframes pulseDot {
  0%,100% { opacity: 1; transform: scale(1); }
  50%      { opacity: .5; transform: scale(.7); }
}
.ap-nav-badge span {
  font-size: 11px;
  font-weight: 600;
  color: var(--goldL);
  letter-spacing: .5px;
}

/* ── BREADCRUMB ── */
.ap-bread {
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
.ap-bread a { color: var(--ivory); transition: color .15s; }
.ap-bread a:hover { color: var(--navy); }
.ap-bread-sep { color: var(--border); }
.ap-bread-cur { color: var(--navy); font-weight: 600; }

/* ── PAGE ── */
.ap-page {
  max-width: 860px;
  margin: 0 auto;
  padding: 32px 24px 80px;
  animation: apFade .35s ease;
}
@keyframes apFade {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}

/* ── PAGE HEADER ── */
.ap-hdr {
  margin-bottom: 28px;
}
.ap-hdr h1 {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 700;
  color: var(--navy);
  line-height: 1;
  margin-bottom: 6px;
}
.ap-hdr p { font-size: 13px; color: var(--ivory); }

/* ── DIVIDER LABEL ── */
.ap-section-label {
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
.ap-section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

/* ── FORM CARD ── */
.ap-form-card {
  background: var(--white);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  overflow: hidden;
  animation: apFade .4s ease both;
}
.ap-form-body { padding: 28px; }

.ap-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
@media (max-width: 600px) { .ap-form-grid { grid-template-columns: 1fr; } }

.ap-form-group { display: flex; flex-direction: column; gap: 7px; }
.ap-form-group.full { grid-column: 1 / -1; }

.ap-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--ivory);
}
.ap-label-req { color: var(--red); margin-left: 2px; }

.ap-input {
  font-family: var(--font-body);
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-size: 13px;
  color: var(--navy);
  background: var(--bg);
  transition: border-color .2s, box-shadow .2s;
  outline: none;
}
.ap-input:focus {
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgba(201,168,76,.1);
  background: var(--white);
}
.ap-input::placeholder { color: rgba(138,122,96,.5); }
textarea.ap-input { resize: vertical; min-height: 100px; }
select.ap-input { cursor: pointer; }

.ap-price-wrap { position: relative; }
.ap-price-prefix {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
  font-weight: 700;
  color: var(--ivory);
  pointer-events: none;
}
.ap-price-wrap .ap-input { padding-left: 26px; }

.ap-hint { font-size: 10px; color: var(--ivory); margin-top: 3px; }
.ap-char-count { font-size: 10px; color: var(--ivory); text-align: right; margin-top: 3px; }

/* ── DIVIDER ── */
.ap-divider { height: 1px; background: var(--border); margin: 22px 0; }

/* ── UPLOAD ZONE ── */
.ap-upload-zone {
  border: 2px dashed var(--border);
  border-radius: 10px;
  padding: 28px 20px;
  text-align: center;
  background: var(--bg);
  transition: border-color .2s, background .2s;
  cursor: pointer;
  position: relative;
}
.ap-upload-zone:hover {
  border-color: var(--gold);
  background: rgba(201,168,76,.04);
}
.ap-upload-zone input[type="file"] {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
}
.ap-upload-icon { font-size: 28px; margin-bottom: 8px; }
.ap-upload-zone p { font-size: 12px; color: var(--ivory); line-height: 1.6; }
.ap-upload-zone b { color: var(--navy); font-weight: 700; }

.ap-preview {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  background: var(--bg);
  border-radius: 10px;
  border: 1.5px solid var(--border);
  margin-top: 10px;
}
.ap-preview-thumb {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid var(--border);
  flex-shrink: 0;
}
.ap-preview-info { flex: 1; min-width: 0; }
.ap-preview-info p { font-size: 12px; font-weight: 600; color: var(--navy); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ap-preview-info span { font-size: 10px; color: var(--ivory); }
.ap-remove-btn {
  background: rgba(176,58,46,.08);
  border: 1px solid rgba(176,58,46,.2);
  color: var(--red);
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background .15s;
}
.ap-remove-btn:hover { background: rgba(176,58,46,.15); }

/* ── FORM FOOTER ── */
.ap-form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 28px;
  background: rgba(247,245,240,.7);
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
  gap: 12px;
}
.ap-btn-reset {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 10px;
  background: transparent;
  border: 1.5px solid var(--border);
  font-size: 12px;
  font-weight: 700;
  color: var(--ivory);
  transition: border-color .15s, color .15s;
}
.ap-btn-reset:hover { border-color: var(--navy); color: var(--navy); }

.ap-btn-submit {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 28px;
  border-radius: 10px;
  background: var(--navy);
  border: none;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  letter-spacing: .5px;
  transition: background .2s, box-shadow .2s;
  position: relative;
  overflow: hidden;
}
.ap-btn-submit::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(201,168,76,.15), rgba(226,204,138,.1));
  opacity: 0;
  transition: opacity .2s;
}
.ap-btn-submit:hover { background: #162637; box-shadow: 0 4px 16px rgba(15,28,42,.25); }
.ap-btn-submit:hover::before { opacity: 1; }
.ap-btn-submit:disabled { opacity: .6; cursor: not-allowed; }

.ap-btn-gold-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--gold);
  flex-shrink: 0;
}

/* ── TOAST ── */
.ap-toast {
  position: fixed;
  bottom: 28px;
  right: 24px;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: var(--shadow-md);
  z-index: 9999;
  animation: toastIn .3s ease;
}
@keyframes toastIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: none; }
}
.ap-toast.success { background: var(--green); }
.ap-toast.error   { background: var(--red); }

/* ── SPIN ── */
.ap-spin {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .ap-topbar { display: none; }
}
`;

export default function AddProduct() {
  const [name,      setName]      = useState("");
  const [price,     setPrice]     = useState("");
  const [category,  setCategory]  = useState("");
  const [desc,      setDesc]      = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [toast,     setToast]     = useState(null); // { msg, type }
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  // 🔥 Real-time categories
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "categories"), (snap) => {
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // ── Toast helper ────────────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ➕ Add category
  const addCategory = async () => {
    if (!newCategory.trim()) return showToast("⚠️ Enter a category name", "error");
    setSaving(true);
    try {
      await addDoc(collection(db, "categories"), {
        name: newCategory.trim(),
        createdAt: new Date(),
      });
      setNewCategory("");
      showToast("✅ Category added", "success");
    } catch (e) {
      showToast("❌ " + e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // ✏️ Update category
  const updateCategory = async () => {
    if (!editName.trim()) return showToast("⚠️ Name cannot be empty", "error");
    try {
      await updateDoc(doc(db, "categories", editId), { name: editName.trim() });
      showToast("✅ Category updated", "success");
      setEditId(null);
      setEditName("");
    } catch (e) {
      showToast("❌ " + e.message, "error");
    }
  };

  // ❌ Delete category
  const deleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, "categories", id));
      showToast(`🗑️ "${name}" deleted`, "success");
    } catch (e) {
      showToast("❌ " + e.message, "error");
    }
  };

  // ── Image select ────────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview({ url: URL.createObjectURL(file), name: file.name, size: (file.size / 1024).toFixed(1) });
  };

  const removeImage = () => {
    setImageFile(null);
    setPreview(null);
  };

  // ── Reset ────────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setName(""); setPrice(""); setCategory(""); setDesc("");
    setImageFile(null); setPreview(null);
  };

  // ── Upload to Cloudinary ─────────────────────────────────────────────────────
  const uploadImage = async () => {
    if (!imageFile) return null;
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "richdrop_upload");

    const res  = await fetch("https://api.cloudinary.com/v1_1/dkckg903x/image/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!data.secure_url) throw new Error("Image upload failed");
    return data.secure_url;
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!name || !price || !desc || !imageFile) {
      showToast("All fields are required ❌", "error");
      return;
    }
    try {
      setLoading(true);
      const imageUrl = await uploadImage();
      await addDoc(collection(db, "products"), {
        name,
        price:       Number(price),
        category:    category || "Uncategorised",
        description: desc,
        image:       imageUrl,
        createdAt:   new Date(),
      });
      showToast("Product added successfully 🚀", "success");
      handleReset();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>

      {/* Topbar */}
      <div className="ap-topbar">
        {[["🛠","Product","Management"],["📦","Manage","Orders"],["⚡","Real-time","data"]].map(([ic, b, a]) => (
          <span key={b}>{ic} <b>{b}</b> {a}</span>
        ))}
      </div>

      {/* Navbar */}
      <nav className="ap-nav">
        <div className="ap-logo">
          <div className="ap-logo-drop" />
          <div><h1>RichDrop</h1><p>Admin Panel</p></div>
        </div>
        <div className="ap-nav-badge">
          <div className="ap-nav-dot" />
          <span>LIVE DASHBOARD</span>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="ap-bread">
        <Link to="/admin">Admin Dashboard</Link>
        <span className="ap-bread-sep">›</span>
        <span className="ap-bread-cur">Add Product</span>
      </div>

      {/* Page */}
      <div className="ap-page">

        {/* Header */}
        <div className="ap-hdr">
          <h1>Add Product</h1>
          <p>Create a new product listing for your RichDrop store</p>
        </div>

        {/* Form Section Label */}
        <div className="ap-section-label">Product Details</div>

        {/* Form Card */}
        <div className="ap-form-card">
          <div className="ap-form-body">
            <div className="ap-form-grid">

              {/* Name */}
              <div className="ap-form-group full">
                <label className="ap-label">Product Name <span className="ap-label-req">*</span></label>
                <input
                  className="ap-input"
                  type="text"
                  placeholder="e.g. Premium Rose Water Toner"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Price */}
              <div className="ap-form-group">
                <label className="ap-label">Price <span className="ap-label-req">*</span></label>
                <div className="ap-price-wrap">
                  <span className="ap-price-prefix">₹</span>
                  <input
                    className="ap-input"
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                  />
                </div>
                <span className="ap-hint">Enter price in Indian Rupees</span>
              </div>

              {/* Category */}
              <div className="ap-form-group">
                <label className="ap-label">Category</label>
                <select
                  className="ap-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select category…</option>
                  {categories.map((c) => <option key={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Description */}
              <div className="ap-form-group full">
                <label className="ap-label">Description <span className="ap-label-req">*</span></label>
                <textarea
                  className="ap-input"
                  placeholder="Describe your product — ingredients, benefits, usage tips…"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value.slice(0, 500))}
                />
                <div className="ap-char-count">{desc.length} / 500</div>
              </div>

            </div>

            <div className="ap-divider" />

            {/* Image Upload */}
            <div className="ap-section-label" style={{ marginBottom: 14 }}>Product Image</div>

            {!preview ? (
              <label className="ap-upload-zone">
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <div className="ap-upload-icon">🖼</div>
                <p><b>Click to upload</b> or drag &amp; drop<br /><span style={{ fontSize: 11 }}>PNG, JPG, WEBP up to 10 MB</span></p>
              </label>
            ) : (
              <div className="ap-preview">
                <img className="ap-preview-thumb" src={preview.url} alt="preview" />
                <div className="ap-preview-info">
                  <p>{preview.name}</p>
                  <span>{preview.size} KB</span>
                </div>
                <button className="ap-remove-btn" onClick={removeImage}>✕ Remove</button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="ap-form-footer">
            <button className="ap-btn-reset" onClick={handleReset} disabled={loading}>
              ↺ Reset Form
            </button>
            <button className="ap-btn-submit" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <><div className="ap-spin" /> UPLOADING…</>
              ) : (
                <><div className="ap-btn-gold-dot" /> ADD PRODUCT →</>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Categories Panel */}
      <div className="ap-page" style={{ paddingTop: 0 }}>
        <div className="ap-section-label">Manage Categories</div>
        <div className="ap-form-card">
          <div className="ap-form-body">
            {/* Add category */}
            <div style={{ marginBottom: 20 }}>
              <label className="ap-label">New Category</label>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input
                  className="ap-input"
                  placeholder="e.g. Water Purifiers"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCategory()}
                />
                <button
                  className="ap-btn-submit"
                  onClick={addCategory}
                  disabled={saving}
                  style={{ padding: "11px 20px", minWidth: 100, flexShrink: 0 }}
                >
                  {saving ? "…" : "Add"}
                </button>
              </div>
            </div>

            {/* Category list */}
            {categories.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--ivory)", fontSize: 12, background: "var(--bg)", borderRadius: 10 }}>
                No categories yet. Add one above.
              </div>
            ) : (
              <div>
                {categories.map((c, i) => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0", borderBottom: i < categories.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ flex: 1 }}>
                      {editId === c.id ? (
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <input
                            className="ap-input"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && updateCategory()}
                            autoFocus
                            style={{ height: 32, fontSize: 12 }}
                          />
                          <button
                            className="ap-btn-submit"
                            onClick={updateCategory}
                            style={{ padding: "0 12px", height: 32, flexShrink: 0 }}
                          >
                            Save
                          </button>
                          <button
                            className="ap-btn-reset"
                            onClick={() => { setEditId(null); setEditName(""); }}
                            style={{ padding: "0 10px", height: 32, flexShrink: 0 }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>{c.name}</div>
                      )}
                    </div>
                    {editId !== c.id && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="ap-btn-reset"
                          style={{ height: 28, padding: "0 10px", fontSize: 10 }}
                          onClick={() => { setEditId(c.id); setEditName(c.name); }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="ap-btn-reset"
                          style={{ height: 28, padding: "0 10px", fontSize: 10, color: "var(--red)", borderColor: "rgba(176,58,46,.3)" }}
                          onClick={() => deleteCategory(c.id, c.name)}
                        >
                          🗑
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {toast && (
        <div className={`ap-toast ${toast.type}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}
    </>
  );
}