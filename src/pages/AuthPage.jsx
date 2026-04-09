import { useState } from "react";
import { COLORS, FONTS } from "../utils/constants";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
@keyframes scan   { 0%{ transform:translateY(-100%); opacity:.7; } 100%{ transform:translateY(100vh); opacity:0; } }
input:-webkit-autofill { -webkit-box-shadow: 0 0 0px 1000px #0c1628 inset !important; -webkit-text-fill-color: #e8f0fe !important; }
`;

function Field({ label, type, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 11, fontFamily: FONTS.mono, color: COLORS.muted, letterSpacing: .5, marginBottom: 6 }}>{label}</label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`,
          borderRadius: 8, padding: "10px 14px", color: COLORS.text,
          fontFamily: FONTS.sans, fontSize: 14, outline: "none", transition: "border-color .2s",
        }}
        onFocus={(e)  => e.target.style.borderColor = COLORS.green}
        onBlur={(e)   => e.target.style.borderColor = COLORS.border}
      />
    </div>
  );
}

export default function AuthPage({ onSuccess, onBack }) {
  const [mode,     setMode]     = useState("login"); // "login" | "signup"
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [name,     setName]     = useState("");
  const [error,    setError]    = useState("");

  const handleSubmit = () => {
    if (!email || !password) { setError("All fields are required."); return; }
    if (mode === "signup" && !name) { setError("Name is required."); return; }
    setError("");
    // Replace with real auth — this is a demo passthrough
    onSuccess?.({ email, name: name || email.split("@")[0] });
  };

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONTS.sans, position: "relative", overflow: "hidden" }}>
      <style>{css}</style>
      {/* Scan line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${COLORS.green},transparent)`, animation: "scan 3s ease-in-out infinite" }} />

      {/* Card */}
      <div style={{ width: "100%", maxWidth: 400, animation: "fadeUp .5s both" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 22, fontWeight: 700, cursor: "pointer" }} onClick={onBack}>
            RESPONZA<span style={{ color: COLORS.green }}>.AI</span>
          </div>
          <div style={{ fontSize: 11, fontFamily: FONTS.mono, color: COLORS.muted, marginTop: 6, letterSpacing: 1 }}>
            {mode === "login" ? "MISSION CONTROL ACCESS" : "CREATE ACCOUNT"}
          </div>
        </div>

        {/* Form card */}
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 28 }}>
          {/* Mode tabs */}
          <div style={{ display: "flex", marginBottom: 24, background: COLORS.bg, borderRadius: 8, padding: 3 }}>
            {["login","signup"].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
                flex: 1, padding: "7px 0", borderRadius: 6, border: "none", cursor: "pointer",
                fontFamily: FONTS.mono, fontSize: 11, fontWeight: 600, letterSpacing: .5, transition: "all .18s",
                background: mode === m ? COLORS.green : "transparent",
                color:      mode === m ? "#000"        : COLORS.muted,
              }}>
                {m.toUpperCase()}
              </button>
            ))}
          </div>

          {mode === "signup" && (
            <Field label="FULL NAME" type="text" value={name} onChange={setName} placeholder="John Doe" />
          )}
          <Field label="EMAIL ADDRESS" type="email" value={email}    onChange={setEmail}    placeholder="you@agency.gov" />
          <Field label="PASSWORD"      type="password" value={password} onChange={setPassword} placeholder="••••••••" />

          {error && (
            <div style={{ fontSize: 12, color: COLORS.red, fontFamily: FONTS.mono, marginBottom: 12 }}>{error}</div>
          )}

          <button
            onClick={handleSubmit}
            style={{
              width: "100%", padding: "11px 0", background: COLORS.green, border: "none",
              borderRadius: 9, color: "#000", fontFamily: FONTS.sans, fontSize: 14, fontWeight: 700,
              cursor: "pointer", transition: "all .18s", marginTop: 4,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 20px rgba(0,255,136,.3)`; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
          >
            {mode === "login" ? "Access Mission Control →" : "Create Account →"}
          </button>

          <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: COLORS.muted }}>
            <span
              style={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
            >
              {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </span>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span style={{ fontSize: 12, color: COLORS.muted, cursor: "pointer", fontFamily: FONTS.mono }} onClick={onBack}>
            ← Back to home
          </span>
        </div>
      </div>
    </div>
  );
}