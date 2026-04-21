import { useState, useEffect } from "react";
import { auth, db } from "../firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { useNavigate, Link, useLocation } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();

  const userId         = location.state?.userId || null;
  const currentUserRole = location.state?.currentUserRole || "user";

  const [name, setName]                     = useState("");
  const [phone, setPhone]                   = useState("");
  const [email, setEmail]                   = useState("");
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole]                     = useState("user");
  const [showPass, setShowPass]             = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [loading, setLoading]               = useState(false);
  const [toast, setToast]                   = useState(null);
  const [toastType, setToastType]           = useState("error");

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const snap = await getDoc(doc(db, "users", userId));
      if (snap.exists()) {
        const d = snap.data();
        setName(d.name ?? "");
        setPhone(d.phone ?? "");
        setEmail(d.email ?? "");
        setRole(d.role ?? "user");
      }
    })();
  }, [userId]);

  const showSnack = (msg, type = "error") => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !email.trim()) {
      return showSnack("Please fill in all required fields.");
    }
    if (role === "admin" && currentUserRole !== "admin") {
      return showSnack("Only an Admin can create an Admin account.");
    }
    if (!userId) {
      if (!password || !confirmPassword) return showSnack("Please enter and confirm your password.");
      if (password !== confirmPassword)   return showSnack("Passwords do not match.");
      if (password.length < 6)            return showSnack("Password must be at least 6 characters.");
    }

    setLoading(true);
    try {
      if (!userId) {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await setDoc(doc(db, "users", cred.user.uid), {
          name: name.trim(), phone: phone.trim(),
          email: email.trim(), role, createdAt: new Date(),
        });
        showSnack("Account created successfully! 🚀", "success");
        setTimeout(() => navigate("/"), 1200);
      } else {
        await updateDoc(doc(db, "users", userId), {
          name: name.trim(), phone: phone.trim(),
          email: email.trim(), role,
        });
        showSnack("Profile updated successfully! ✏️", "success");
        setTimeout(() => navigate(-1), 1200);
      }
    } catch (e) {
      const msg = e.message ?? "";
      if (msg.includes("email-already-in-use")) showSnack("This email is already registered.");
      else if (msg.includes("invalid-email"))    showSnack("Please enter a valid email address.");
      else if (msg.includes("weak-password"))    showSnack("Password is too weak. Use 6+ characters.");
      else showSnack("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSubmit(); };

  const isEdit = !!userId;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --navy:      #1C2B3A;
          --gold:      #C9A84C;
          --gold-light:#E8D9B0;
          --gold-soft: #D8CEA8;
          --bg:        #F5F3EE;
          --ivory:     #7A6A50;
          --border:    #EAE4D6;
          --blue:      #1A6FA3;
          --blue-m:    #5BB8E8;
          --blue-l:    #E8F6FF;
          --field-bg:  #FAFAF7;
          --green:     #2E7D4F;
        }

        body { font-family: 'DM Sans', sans-serif; }

        .signup-page {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        /* Background blobs */
        .signup-page::before {
          content: '';
          position: absolute;
          top: -140px; right: -100px;
          width: 420px; height: 420px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(91,184,232,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .signup-page::after {
          content: '';
          position: absolute;
          bottom: -120px; left: -80px;
          width: 380px; height: 380px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ── Card ── */
        .signup-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid var(--border);
          padding: 36px 36px 32px;
          width: 100%;
          max-width: 460px;
          position: relative;
          z-index: 1;
          animation: slideUp 0.55s cubic-bezier(0.22,1,0.36,1) both;
          box-shadow: 0 8px 40px rgba(28,43,58,0.07);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        /* ── Logo ── */
        .logo-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 24px;
        }
        .drop-logo {
          width: 48px; height: 58px;
          margin-bottom: 10px;
          animation: floatDrop 3.5s ease-in-out infinite;
        }
        @keyframes floatDrop {
          0%,100% { transform: translateY(0);    }
          50%      { transform: translateY(-6px); }
        }
        .brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 23px; font-weight: 800;
          color: var(--navy); letter-spacing: 4px;
          margin-bottom: 3px;
        }
        .brand-tagline {
          font-size: 9px; color: var(--gold);
          letter-spacing: 4px; text-transform: uppercase;
          margin-bottom: 12px;
        }
        .gold-divider {
          width: 64px; height: 1px; border: none;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
        }

        /* ── Card header ── */
        .card-header { margin-bottom: 22px; }
        .card-header h2 {
          font-size: 17px; font-weight: 700; color: var(--navy); margin-bottom: 3px;
        }
        .card-header p { font-size: 12px; color: var(--ivory); }

        /* ── Two-column row ── */
        .field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        /* ── Field ── */
        .field-group { margin-bottom: 14px; }
        .field-label {
          display: block;
          font-size: 10px; font-weight: 600;
          color: var(--ivory); letter-spacing: 1.5px;
          text-transform: uppercase; margin-bottom: 7px;
        }
        .field-wrap { position: relative; }
        .field-input {
          width: 100%; height: 46px;
          padding: 0 42px 0 14px;
          background: var(--field-bg);
          border: 1px solid #E0D8C8;
          border-radius: 10px;
          font-size: 13.5px;
          font-family: 'DM Sans', sans-serif;
          color: var(--navy);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .field-input::placeholder { color: #C0B8A8; }
        .field-input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(201,168,76,0.1);
        }
        .field-input.no-icon { padding-right: 14px; }

        /* phone prefix */
        .phone-wrap { display: flex; }
        .phone-prefix {
          height: 46px; padding: 0 12px;
          background: #F0EBE0; border: 1px solid #E0D8C8;
          border-right: none; border-radius: 10px 0 0 10px;
          font-size: 13px; font-weight: 600; color: var(--ivory);
          display: flex; align-items: center; white-space: nowrap;
        }
        .phone-wrap .field-input {
          border-radius: 0 10px 10px 0;
          padding-left: 12px;
        }

        /* eye btn */
        .eye-btn {
          position: absolute; right: 11px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: var(--gold); padding: 0;
          display: flex; align-items: center; justify-content: center;
        }

        /* role select */
        .role-select {
          width: 100%; height: 46px; padding: 0 14px;
          background: var(--field-bg);
          border: 1px solid #E0D8C8; border-radius: 10px;
          font-size: 13.5px; font-family: 'DM Sans', sans-serif;
          color: var(--navy); outline: none; cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C9A84C' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 36px;
        }
        .role-select:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(201,168,76,0.1);
        }

        /* role badge */
        .role-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 20px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
          margin-bottom: 14px;
        }
        .role-badge.admin {
          background: rgba(201,168,76,0.12);
          border: 1px solid rgba(201,168,76,0.4);
          color: var(--gold);
        }
        .role-badge.user {
          background: var(--blue-l);
          border: 1px solid rgba(26,111,163,0.3);
          color: var(--blue);
        }

        /* password strength */
        .strength-bar { display: flex; gap: 3px; margin-top: 6px; }
        .strength-seg {
          flex: 1; height: 3px; border-radius: 2px;
          background: var(--border); transition: background 0.3s;
        }
        .strength-label { font-size: 9px; color: var(--ivory); margin-top: 3px; }

        /* match indicator */
        .match-indicator {
          font-size: 10px; margin-top: 5px;
          display: flex; align-items: center; gap: 4px;
        }

        /* ── Submit btn ── */
        .submit-btn {
          width: 100%; height: 50px;
          background: var(--navy); color: #fff;
          border: none; border-radius: 10px;
          font-size: 12px; font-weight: 700;
          letter-spacing: 2.5px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.2s, transform 0.15s, opacity 0.2s;
          margin-top: 6px; margin-bottom: 18px;
        }
        .submit-btn:hover:not(:disabled) { background: #243447; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .submit-btn.edit-mode { background: var(--blue); }
        .submit-btn.edit-mode:hover:not(:disabled) { background: #155c8a; }

        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── OR divider ── */
        .or-row {
          display: flex; align-items: center; gap: 12px; margin-bottom: 14px;
        }
        .or-line { flex: 1; height: 1px; background: var(--border); }
        .or-text  { font-size: 10px; color: #C0B8A8; letter-spacing: 1.5px; }

        /* ── Login link btn ── */
        .login-btn {
          width: 100%; height: 46px;
          background: transparent; border: 1px solid var(--gold-soft);
          border-radius: 10px; font-size: 13px; font-weight: 500;
          color: var(--ivory); letter-spacing: 1px;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          text-decoration: none;
          display: flex; align-items: center; justify-content: center;
          transition: border-color 0.2s, background 0.2s;
          margin-bottom: 22px;
        }
        .login-btn:hover { border-color: var(--gold); background: rgba(201,168,76,0.04); }

        /* ── Footer ── */
        .card-footer {
          text-align: center; font-size: 9px;
          color: var(--gold); letter-spacing: 2.5px; text-transform: uppercase;
        }

        /* ── Toast ── */
        .toast {
          position: fixed; bottom: 24px; left: 50%;
          transform: translateX(-50%);
          padding: 12px 20px; border-radius: 10px;
          font-size: 13px; font-family: 'DM Sans', sans-serif;
          max-width: 340px; width: calc(100% - 48px);
          text-align: center; z-index: 200;
          box-shadow: 0 8px 24px rgba(0,0,0,0.18);
          animation: toastIn 0.3s ease;
          color: #fff;
        }
        .toast.error   { background: var(--navy); }
        .toast.success { background: var(--green); }
        @keyframes toastIn {
          from { opacity:0; transform: translateX(-50%) translateY(12px); }
          to   { opacity:1; transform: translateX(-50%) translateY(0); }
        }

        /* ── Divider section ── */
        .section-divider {
          display: flex; align-items: center; gap: 10px; margin: 4px 0 14px;
        }
        .section-divider span {
          font-size: 9px; font-weight: 700; color: var(--gold);
          letter-spacing: 2px; text-transform: uppercase; white-space: nowrap;
        }
        .section-divider::before, .section-divider::after {
          content: ''; flex: 1; height: 1px; background: var(--border);
        }

        @media (max-width: 480px) {
          .signup-card { padding: 28px 22px 24px; }
          .field-row   { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="signup-page">
        <div className="signup-card">

          {/* Logo */}
          <div className="logo-wrap">
            <svg className="drop-logo" viewBox="0 0 56 68" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="sg" x1="28" y1="2" x2="28" y2="58" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="#B8E0F7"/>
                  <stop offset="50%"  stopColor="#4AABDF"/>
                  <stop offset="100%" stopColor="#1A6FA3"/>
                </linearGradient>
              </defs>
              <path d="M28 2 C10 20 6 32 6 42 A22 22 0 0 0 50 42 C50 32 46 20 28 2Z" fill="url(#sg)"/>
              <ellipse cx="20" cy="26" rx="4.5" ry="8" fill="white" fillOpacity="0.28" transform="rotate(-18 20 26)"/>
              <circle cx="28" cy="0"  r="3"   fill="#C9A84C"/>
              <circle cx="20" cy="2"  r="2"   fill="#C9A84C" fillOpacity="0.7"/>
              <circle cx="36" cy="2"  r="2"   fill="#C9A84C" fillOpacity="0.7"/>
            </svg>
            <div className="brand-name">RichDrop</div>
            <div className="brand-tagline">Pure Water Solutions</div>
            <hr className="gold-divider"/>
          </div>

          {/* Header */}
          <div className="card-header">
            <h2>{isEdit ? "Update Profile" : "Create Account"}</h2>
            <p>{isEdit ? "Update your account details below" : "Join RichDrop — pure water, delivered"}</p>
          </div>

          {/* ── PERSONAL INFO ── */}
          <div className="section-divider"><span>Personal Info</span></div>

          <div className="field-row">
            {/* Full Name */}
            <div className="field-group">
              <label className="field-label">Full Name</label>
              <div className="field-wrap">
                <input
                  className="field-input no-icon"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="field-group">
              <label className="field-label">Phone</label>
              <div className="phone-wrap">
                <div className="phone-prefix">🇮🇳 +91</div>
                <input
                  className="field-input no-icon"
                  placeholder="9876543210"
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g,""))}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="field-group">
            <label className="field-label">Email Address</label>
            <div className="field-wrap">
              <input
                className="field-input no-icon"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                readOnly={isEdit}
                style={isEdit ? { opacity: 0.6, cursor: "not-allowed" } : {}}
              />
            </div>
          </div>

          {/* ── SECURITY (only on create) ── */}
          {!isEdit && (
            <>
              <div className="section-divider"><span>Security</span></div>

              {/* Password */}
              <div className="field-group">
                <label className="field-label">Password</label>
                <div className="field-wrap">
                  <input
                    className="field-input"
                    type={showPass ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button className="eye-btn" type="button" tabIndex={-1} onClick={() => setShowPass(v=>!v)}>
                    {showPass ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {/* Strength bar */}
                {password && (() => {
                  const s = [password.length>=6, /[A-Z]/.test(password), /[0-9]/.test(password), /[^a-zA-Z0-9]/.test(password)].filter(Boolean).length;
                  const labels = ["","Weak","Fair","Good","Strong"];
                  const colors = ["","#c0392b","#e67e22","#2980b9","#27ae60"];
                  return (
                    <>
                      <div className="strength-bar">
                        {[1,2,3,4].map(i=>(
                          <div key={i} className="strength-seg" style={{background: i<=s ? colors[s] : undefined}}/>
                        ))}
                      </div>
                      <div className="strength-label" style={{color: colors[s]}}>{labels[s]}</div>
                    </>
                  );
                })()}
              </div>

              {/* Confirm Password */}
              <div className="field-group">
                <label className="field-label">Confirm Password</label>
                <div className="field-wrap">
                  <input
                    className="field-input"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button className="eye-btn" type="button" tabIndex={-1} onClick={() => setShowConfirm(v=>!v)}>
                    {showConfirm ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {/* Match indicator */}
                {confirmPassword && (
                  <div className="match-indicator" style={{color: confirmPassword===password ? "#27ae60" : "#c0392b"}}>
                    {confirmPassword===password ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── ROLE (admin only) ── */}
          {currentUserRole === "admin" && (
            <>
              <div className="section-divider"><span>Account Role</span></div>
              <div className="field-group">
                <label className="field-label">Assign Role</label>
                <select
                  className="role-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="user">👤 User</option>
                  <option value="admin">🔑 Admin</option>
                </select>
                <div className={`role-badge ${role}`} style={{marginTop:8}}>
                  {role === "admin" ? "🔑 Admin access — full control" : "👤 User access — standard"}
                </div>
              </div>
            </>
          )}

          {/* Submit */}
          <button
            className={`submit-btn ${isEdit ? "edit-mode" : ""}`}
            onClick={handleSubmit}
            disabled={loading}
            type="button"
          >
            {loading
              ? <div className="spinner"/>
              : isEdit ? "✏️  UPDATE PROFILE" : "CREATE ACCOUNT"
            }
          </button>

          {/* OR + Login link (only on create) */}
          {!isEdit && (
            <>
              <div className="or-row">
                <div className="or-line"/>
                <span className="or-text">OR</span>
                <div className="or-line"/>
              </div>
              <Link to="/login" className="login-btn">Sign in to existing account</Link>
            </>
          )}

          {/* Footer */}
          <div className="card-footer">EST. 2010 · RICHDROP™</div>
        </div>
      </div>

      {/* Toast */}
      {toast && <div className={`toast ${toastType}`}>{toast}</div>}
    </>
  );
}