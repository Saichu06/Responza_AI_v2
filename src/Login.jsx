// src/components/Login.jsx
import { useState } from "react";
import { validateLogin } from "./data/userStorage";

export default function Login({ setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState("");
  const [loading, setLoading] = useState(false);

  // src/components/Login.jsx
  // Find this line (around line 18-20):
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const success = validateLogin(email, password);
      if (success) {
        setPage("dashboard"); // ← CHANGE THIS from "home" to "dashboard"
      } else {
        setError("Invalid email or password");
        setLoading(false);
      }
    }, 600);
  };

  
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&family=JetBrains+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          background: #060c18;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          position: relative;
          overflow: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .login-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 20% 50%, rgba(0,255,136,0.05) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 80% 20%, rgba(0,180,255,0.04) 0%, transparent 60%);
          pointer-events: none;
        }

        .grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .login-card {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: rgba(10,18,32,0.95);
          border: 1px solid rgba(0,255,136,0.12);
          border-radius: 20px;
          padding: 44px 40px;
          box-shadow:
            0 0 0 1px rgba(0,255,136,0.05),
            0 40px 80px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(255,255,255,0.04);
          animation: fadeUp 0.5s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .brand-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(0,255,136,0.08);
          border: 1px solid rgba(0,255,136,0.2);
          border-radius: 100px;
          padding: 5px 12px;
          font-size: 11px;
          font-weight: 500;
          color: #00ff88;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 28px;
          font-family: 'JetBrains Mono', monospace;
        }

        .brand-dot {
          width: 6px;
          height: 6px;
          background: #00ff88;
          border-radius: 50%;
          box-shadow: 0 0 6px #00ff88;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .login-title {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 32px;
          font-weight: 700;
          color: #f0f4ff;
          line-height: 1.1;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .login-subtitle {
          color: #4a5f7a;
          font-size: 14px;
          font-weight: 400;
          margin-bottom: 36px;
          font-family: 'Inter', sans-serif;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 8px;
        }

        .field-wrap {
          position: relative;
        }

        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          color: #3a5070;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
          transition: color 0.2s;
          font-family: 'Inter', sans-serif;
        }

        .field-wrap.active .field-label {
          color: #00ff88;
        }

        .field-input {
          width: 100%;
          padding: 13px 16px;
          background: rgba(4,10,20,0.8);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          color: #e8edf5;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .field-input:focus {
          border-color: rgba(0,255,136,0.4);
          box-shadow: 0 0 0 3px rgba(0,255,136,0.07);
        }

        .field-input::placeholder {
          color: #2a3a50;
          font-family: 'Inter', sans-serif;
        }

        .error-msg {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #f87171;
          font-size: 12.5px;
          margin-top: 16px;
          padding: 10px 14px;
          background: rgba(248,113,113,0.06);
          border: 1px solid rgba(248,113,113,0.15);
          border-radius: 10px;
          font-family: 'Inter', sans-serif;
        }

        .submit-btn {
          width: 100%;
          margin-top: 24px;
          padding: 14px;
          background: #00ff88;
          color: #030d08;
          border: none;
          border-radius: 12px;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          box-shadow: 0 0 20px rgba(0,255,136,0.25), 0 4px 12px rgba(0,0,0,0.3);
          position: relative;
          overflow: hidden;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 0 30px rgba(0,255,136,0.35), 0 8px 20px rgba(0,0,0,0.4);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(3,13,8,0.3);
          border-top-color: #030d08;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .divider {
          height: 1px;
          background: rgba(255,255,255,0.05);
          margin: 28px 0;
        }

        .footer-text {
          text-align: center;
          font-size: 13px;
          color: #3a5070;
          font-family: 'Inter', sans-serif;
        }

        .footer-link {
          color: #00ff88;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 500;
          padding: 0;
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: rgba(0,255,136,0.3);
          transition: text-decoration-color 0.2s;
        }

        .footer-link:hover {
          text-decoration-color: #00ff88;
        }
      `}</style>

      <div className="login-root">
        <div className="grid-bg" />
        <div className="login-card">
          <div className="brand-chip">
            <span className="brand-dot" />
            Alert System
          </div>

          <h2 className="login-title">
            Welcome
            <br />
            back.
          </h2>
          <p className="login-subtitle">Sign in to access your dashboard</p>

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <div
                className={`field-wrap ${focused === "email" ? "active" : ""}`}
              >
                <label className="field-label">Email Address</label>
                <input
                  type="email"
                  className="field-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused("")}
                  autoFocus
                />
              </div>

              <div
                className={`field-wrap ${focused === "password" ? "active" : ""}`}
              >
                <label className="field-label">Password</label>
                <input
                  type="password"
                  className="field-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused("")}
                />
              </div>
            </div>

            {error && (
              <div className="error-msg">
                <span>⚠</span> {error}
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" />
                  Signing in...
                </>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>

          <div className="divider" />

          <p className="footer-text">
            Don't have an account?{" "}
            <button className="footer-link" onClick={() => setPage("signup")}>
              Create one
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
