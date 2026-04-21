import { useState, useEffect } from "react";
import { auth, db } from "../firebase/config";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

const ADMIN_EMAIL = "admin@gmail.com";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState(null);
  const navigate = useNavigate();

  // ── Auto-login redirect if already signed in ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        routeByEmail(user.email ?? "");
      }
    });
    return () => unsub();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const routeByEmail = (emailStr) => {
    if (emailStr.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase()) {
      navigate("/admin", { replace: true });
    } else {
      navigate("/user", { replace: true });
    }
  };

  const showSnack = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const friendlyError = (raw) => {
    if (raw.includes("user-not-found"))     return "No account found with this email.";
    if (raw.includes("wrong-password"))     return "Incorrect password. Please try again.";
    if (raw.includes("invalid-email"))      return "Please enter a valid email address.";
    if (raw.includes("too-many-requests"))  return "Too many attempts. Try again later.";
    if (raw.includes("invalid-credential")) return "Invalid email or password.";
    return "Login failed. Please try again.";
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showSnack("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      routeByEmail(cred.user?.email ?? email);
    } catch (e) {
      showSnack(friendlyError(e.message ?? ""));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --navy:       #1C2B3A;
          --gold:       #C9A84C;
          --gold-light: #E8D9B0;
          --gold-soft:  #D8CEA8;
          --bg:         #F5F3EE;
          --ivory:      #7A6A50;
          --border:     #EAE4D6;
          --blue-deep:  #1A6FA3;
          --field-bg:   #FAFAF7;
        }

        body { font-family: 'DM Sans', sans-serif; }

        .login-page {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        .login-page::before {
          content: '';
          position: absolute;
          top: -120px; left: -120px;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(91,184,232,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .login-page::after {
          content: '';
          position: absolute;
          bottom: -100px; right: -100px;
          width: 360px; height: 360px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .login-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid var(--border);
          padding: 40px 36px 36px;
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 1;
          animation: slideUp 0.6s cubic-bezier(0.22,1,0.36,1) both;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        .logo-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 28px;
        }

        .drop-logo {
          width: 56px; height: 68px;
          position: relative;
          margin-bottom: 12px;
          animation: floatDrop 3.5s ease-in-out infinite;
        }

        @keyframes floatDrop {
          0%, 100% { transform: translateY(0);   }
          50%       { transform: translateY(-6px); }
        }

        .drop-svg { width: 100%; height: 100%; }

        .brand-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 26px;
          font-weight: 800;
          color: var(--navy);
          letter-spacing: 4px;
          margin-bottom: 4px;
        }

        .brand-tagline {
          font-size: 10px;
          color: var(--gold);
          letter-spacing: 4px;
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        .gold-divider {
          width: 70px; height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
          border: none;
        }

        .greeting h2 {
          font-size: 18px;
          font-weight: 700;
          color: var(--navy);
          margin-bottom: 4px;
        }
        .greeting p {
          font-size: 13px;
          color: var(--ivory);
          margin-bottom: 24px;
        }

        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: var(--ivory);
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .field-wrap {
          position: relative;
          margin-bottom: 16px;
        }

        .field-input {
          width: 100%;
          height: 48px;
          padding: 0 44px 0 16px;
          background: var(--field-bg);
          border: 1px solid #E0D8C8;
          border-radius: 10px;
          font-size: 14px;
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

        .eye-btn {
          position: absolute;
          right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--gold);
          display: flex; align-items: center; justify-content: center;
          padding: 0;
          font-size: 17px;
          line-height: 1;
        }

        .forgot-row {
          display: flex;
          justify-content: flex-end;
          margin-top: -8px;
          margin-bottom: 22px;
        }
        .forgot-link {
          font-size: 12px;
          color: var(--gold);
          font-weight: 500;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .forgot-link:hover { opacity: 0.75; }

        .signin-btn {
          width: 100%;
          height: 50px;
          background: var(--navy);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 2.5px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          gap: 8px;
          transition: background 0.2s, transform 0.15s, opacity 0.2s;
          margin-bottom: 20px;
        }
        .signin-btn:hover:not(:disabled) {
          background: #243447;
          transform: translateY(-1px);
        }
        .signin-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .or-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .or-line { flex: 1; height: 1px; background: var(--border); }
        .or-text  { font-size: 11px; color: #C0B8A8; letter-spacing: 1.5px; }

        .create-btn {
          width: 100%;
          height: 48px;
          background: transparent;
          border: 1px solid var(--gold-soft);
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          color: var(--ivory);
          letter-spacing: 1px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          text-decoration: none;
          display: flex; align-items: center; justify-content: center;
          transition: border-color 0.2s, background 0.2s;
          margin-bottom: 24px;
        }
        .create-btn:hover {
          border-color: var(--gold);
          background: rgba(201,168,76,0.04);
        }

        .card-footer {
          text-align: center;
          font-size: 10px;
          color: var(--gold);
          letter-spacing: 2.5px;
          text-transform: uppercase;
        }

        .toast {
          position: fixed;
          bottom: 24px; left: 50%;
          transform: translateX(-50%) translateY(0);
          background: var(--navy);
          color: #fff;
          padding: 12px 20px;
          border-radius: 10px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          max-width: 340px;
          width: calc(100% - 48px);
          text-align: center;
          z-index: 200;
          box-shadow: 0 8px 24px rgba(0,0,0,0.18);
          animation: toastIn 0.3s ease;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0);    }
        }
      `}</style>

      <div className="login-page">
        <div className="login-card">

          {/* Logo */}
          <div className="logo-wrap">
            <div className="drop-logo">
              <svg className="drop-svg" viewBox="0 0 56 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="dropGrad" x1="28" y1="2" x2="28" y2="58" gradientUnits="userSpaceOnUse">
                    <stop offset="0%"   stopColor="#B8E0F7"/>
                    <stop offset="50%"  stopColor="#4AABDF"/>
                    <stop offset="100%" stopColor="#1A6FA3"/>
                  </linearGradient>
                </defs>
                <path d="M28 2 C10 20 6 32 6 42 A22 22 0 0 0 50 42 C50 32 46 20 28 2Z" fill="url(#dropGrad)"/>
                <ellipse cx="20" cy="26" rx="4.5" ry="8" fill="white" fillOpacity="0.28" transform="rotate(-18 20 26)"/>
                <circle cx="28" cy="0"  r="3"   fill="#C9A84C"/>
                <circle cx="20" cy="2"  r="2"   fill="#C9A84C" fillOpacity="0.7"/>
                <circle cx="36" cy="2"  r="2"   fill="#C9A84C" fillOpacity="0.7"/>
              </svg>
            </div>
            <div className="brand-name">RichDrop</div>
            <div className="brand-tagline">Pure Water Solutions</div>
            <hr className="gold-divider" />
          </div>

          {/* Greeting */}
          <div className="greeting">
            <h2>Welcome back</h2>
            <p>Sign in to your account</p>
          </div>

          {/* Email */}
          <label className="field-label">Email Address</label>
          <div className="field-wrap">
            <input
              type="email"
              className="field-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ paddingRight: 16 }}
            />
          </div>

          {/* Password */}
          <label className="field-label">Password</label>
          <div className="field-wrap">
            <input
              type={showPass ? "text" : "password"}
              className="field-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="eye-btn"
              onClick={() => setShowPass((v) => !v)}
              tabIndex={-1}
              type="button"
            >
              {showPass ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>

          {/* Forgot */}
          <div className="forgot-row">
            <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
          </div>

          {/* Sign In — uses onClick, NOT a form submit */}
          <button
            className="signin-btn"
            onClick={handleLogin}
            disabled={loading}
            type="button"
          >
            {loading ? <div className="spinner" /> : "SIGN IN"}
          </button>

          {/* OR */}
          <div className="or-row">
            <div className="or-line" />
            <span className="or-text">OR</span>
            <div className="or-line" />
          </div>

          {/* Create Account */}
          <Link to="/signup" className="create-btn">Create an account</Link>

          {/* Footer */}
          <div className="card-footer">EST. 2010 · RICHDROP™</div>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}