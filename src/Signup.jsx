// src/components/Signup.jsx
import { useState, useEffect } from "react";
import { saveUser, emailExists } from "./data/userStorage";

const STEPS = [
  { id: "personal",  title: "Personal Info", icon: "👤", hint: "Tell us about yourself" },
  { id: "location",  title: "Location",      icon: "📍", hint: "Where are you located?" },
  { id: "emergency", title: "Emergency",     icon: "🆘", hint: "Who should we call?" },
  { id: "household", title: "Household",     icon: "🏠", hint: "Who's in your home?" },
  { id: "medical",   title: "Medical",       icon: "🩸", hint: "Quick health info" },
  { id: "alerts",    title: "Alerts",        icon: "🔔", hint: "Customize notifications" },
  { id: "account",   title: "Account",       icon: "🔐", hint: "Secure your account" },
];

export default function Signup({ setPage }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    location: { city: "", address: "", pincode: "", lat: null, lng: null, accuracy: null },
    emergency: { name: "", phone: "" },
    household: { members: 1, elderly: false, disabled: false, pets: false },
    medical: { bloodGroup: "" },
    alerts: { fire: true, flood: true, storm: true },
    account: { email: "", password: "" },
  });
  const [error, setError] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focused, setFocused] = useState("");

  const updateForm = (section, field, value) => {
    if (section) {
      setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const getLocation = () => {
    setLocationStatus("Requesting…");
    if (!navigator.geolocation) { setLocationStatus("Not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude, accuracy } }) => {
        setFormData(prev => ({
          ...prev,
          location: { ...prev.location, lat: latitude, lng: longitude, accuracy: Math.round(accuracy) }
        }));
        setLocationStatus(`✓ Located (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
      },
      (err) => setLocationStatus(`⚠ ${err.message}`)
    );
  };

  const nextStep = () => {
    if (step === 0 && (!formData.name || !formData.age || !formData.gender)) {
      setError("Please fill all personal details"); return;
    }
    if (step === 1 && (!formData.location.city || !formData.location.pincode)) {
      setError("Please enter city and pincode"); return;
    }
    if (step === 2 && (!formData.emergency.name || !formData.emergency.phone)) {
      setError("Please enter emergency contact details"); return;
    }
    if (step === 6 && (!formData.account.email || !formData.account.password)) {
      setError("Please enter email and password"); return;
    }
    if (step === 6 && emailExists(formData.account.email)) {
      setError("Email already registered. Please login."); return;
    }
    setError("");
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (step > 0) { setStep(step - 1); }
    setError("");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const finalUser = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      ...formData,
      riskLevel: "LOW",
    };
    saveUser(finalUser);
    setTimeout(() => {
      setIsSubmitting(false);
      alert("✅ Account created successfully!");
      setPage("login");
    }, 600);
  };

  useEffect(() => { window.scrollTo(0, 0); }, [step]);

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&family=JetBrains+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .signup-root {
          min-height: 100vh;
          background: #060c18;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 40px 20px 60px;
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          position: relative;
          overflow: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .signup-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 50% 60% at 10% 30%, rgba(0,255,136,0.05) 0%, transparent 55%),
            radial-gradient(ellipse 40% 40% at 90% 70%, rgba(0,140,255,0.04) 0%, transparent 55%);
          pointer-events: none;
        }

        .grid-bg {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,255,136,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,136,0.025) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .signup-card {
          position: relative;
          width: 100%;
          max-width: 560px;
          background: rgba(10,18,32,0.97);
          border: 1px solid rgba(0,255,136,0.1);
          border-radius: 24px;
          padding: 40px;
          box-shadow:
            0 0 0 1px rgba(0,255,136,0.04),
            0 40px 80px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(255,255,255,0.04);
          animation: fadeUp 0.5s ease both;
          margin-top: 20px;
          backdrop-filter: blur(2px);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Step indicator */
        .step-track {
          display: flex;
          align-items: center;
          gap: 0;
          margin-bottom: 32px;
        }

        .step-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
        }

        .step-node:not(:last-child)::after {
          content: '';
          position: absolute;
          top: 14px;
          left: calc(50% + 14px);
          right: calc(-50% + 14px);
          height: 2px;
          background: #0e1c2e;
          z-index: 0;
          transition: background 0.4s;
        }

        .step-node.done:not(:last-child)::after {
          background: rgba(0,255,136,0.3);
        }

        .step-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 700;
          position: relative;
          z-index: 1;
          transition: all 0.3s;
          border: 2px solid #0e1c2e;
        }

        .step-circle.past {
          background: rgba(0,255,136,0.15);
          border-color: rgba(0,255,136,0.4);
          color: #00ff88;
        }

        .step-circle.current {
          background: #00ff88;
          border-color: #00ff88;
          color: #030d08;
          box-shadow: 0 0 14px rgba(0,255,136,0.5);
        }

        .step-circle.future {
          background: transparent;
          border-color: #1a2c42;
          color: #2a3f55;
        }

        .step-label {
          font-size: 9px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-top: 5px;
          font-weight: 500;
          white-space: nowrap;
          font-family: 'JetBrains Mono', monospace;
        }

        .step-label.active-label { color: #00ff88; }
        .step-label.done-label   { color: #2a6645; }
        .step-label.idle-label   { color: #1a2c42; }

        /* Progress bar */
        .progress-bar-wrap {
          height: 2px;
          background: #0e1c2e;
          border-radius: 2px;
          margin-bottom: 32px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #00cc6a, #00ff88);
          border-radius: 2px;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 8px rgba(0,255,136,0.4);
        }

        /* Header */
        .step-header {
          margin-bottom: 28px;
        }

        .step-icon-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
        }

        .step-emoji {
          font-size: 20px;
          line-height: 1;
        }

        .step-counter {
          font-size: 11px;
          color: #2a4060;
          font-weight: 500;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .step-title {
          font-family: 'Inter', sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: #eef2f9;
          letter-spacing: -0.4px;
          margin-bottom: 4px;
        }

        .step-hint {
          font-size: 13.5px;
          color: #3a5070;
          font-weight: 400;
          font-family: 'Inter', sans-serif;
        }

        /* Fields */
        .fields {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin-bottom: 8px;
        }

        .field-wrap { position: relative; }

        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          color: #2a4060;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 7px;
          transition: color 0.2s;
          font-family: 'Inter', sans-serif;
        }

        .field-wrap.active .field-label { color: #00ff88; }

        .field-input {
          width: 100%;
          padding: 13px 16px;
          background: rgba(4,10,22,0.85);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          color: #dde4f0;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          appearance: none;
          -webkit-appearance: none;
        }

        .field-input option {
          background: #0a1220;
          font-family: 'Inter', sans-serif;
        }

        .field-input:focus {
          border-color: rgba(0,255,136,0.35);
          box-shadow: 0 0 0 3px rgba(0,255,136,0.06);
        }

        .field-input::placeholder { color: #1e3048; }

        /* Location button */
        .loc-btn {
          width: 100%;
          padding: 13px 16px;
          background: rgba(0,255,136,0.05);
          border: 1px dashed rgba(0,255,136,0.2);
          border-radius: 12px;
          color: #00cc6a;
          font-family: 'Inter', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, border-color 0.2s;
        }

        .loc-btn:hover {
          background: rgba(0,255,136,0.09);
          border-color: rgba(0,255,136,0.35);
        }

        .loc-status {
          font-size: 12px;
          color: #00cc6a;
          padding: 8px 12px;
          background: rgba(0,255,136,0.04);
          border-radius: 8px;
          border: 1px solid rgba(0,255,136,0.1);
          font-family: 'Inter', sans-serif;
        }

        .info-note {
          font-size: 12px;
          color: #2a4060;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 12px;
          background: rgba(255,255,255,0.02);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.04);
          font-family: 'Inter', sans-serif;
        }

        /* Toggle rows */
        .toggle-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          background: rgba(4,10,22,0.6);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          transition: border-color 0.2s;
        }

        .toggle-row:hover {
          border-color: rgba(255,255,255,0.09);
        }

        .toggle-label {
          font-size: 14px;
          color: #c8d3e8;
          font-weight: 400;
          font-family: 'Inter', sans-serif;
        }

        .toggle-switch {
          width: 48px;
          height: 26px;
          border-radius: 26px;
          border: none;
          cursor: pointer;
          position: relative;
          transition: background 0.25s;
          flex-shrink: 0;
        }

        .toggle-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #fff;
          position: absolute;
          top: 3px;
          transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 4px rgba(0,0,0,0.4);
        }

        /* Error */
        .error-msg {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #f87171;
          font-size: 12.5px;
          margin-top: 14px;
          padding: 10px 14px;
          background: rgba(248,113,113,0.06);
          border: 1px solid rgba(248,113,113,0.14);
          border-radius: 10px;
          font-family: 'Inter', sans-serif;
        }

        /* Nav buttons */
        .nav-row {
          display: flex;
          gap: 12px;
          margin-top: 28px;
        }

        .btn-back {
          padding: 13px 22px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #8899aa;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
          white-space: nowrap;
        }

        .btn-back:hover {
          border-color: rgba(255,255,255,0.15);
          color: #ccd6e4;
        }

        .btn-next {
          flex: 1;
          padding: 13px 22px;
          background: #00ff88;
          color: #030d08;
          border: none;
          border-radius: 12px;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          box-shadow: 0 0 20px rgba(0,255,136,0.2), 0 4px 12px rgba(0,0,0,0.3);
        }

        .btn-next:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 0 28px rgba(0,255,136,0.3), 0 8px 20px rgba(0,0,0,0.35);
        }

        .btn-next:active:not(:disabled) { transform: none; }
        .btn-next:disabled { opacity: 0.7; cursor: not-allowed; }

        .spinner {
          display: inline-block;
          width: 13px;
          height: 13px;
          border: 2px solid rgba(3,13,8,0.3);
          border-top-color: #030d08;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin-right: 7px;
          vertical-align: middle;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .divider {
          height: 1px;
          background: rgba(255,255,255,0.04);
          margin: 24px 0;
        }

        .footer-text {
          text-align: center;
          font-size: 13px;
          color: #2a4060;
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
          text-underline-offset: 3px;
          text-decoration: underline;
          text-decoration-color: rgba(0,255,136,0.3);
          transition: text-decoration-color 0.2s;
        }
        .footer-link:hover { text-decoration-color: #00ff88; }
      `}</style>

      <div className="signup-root">
        <div className="grid-bg" />
        <div className="signup-card">

          {/* Step indicator */}
          <div className="step-track">
            {STEPS.map((s, idx) => {
              const cls = idx < step ? "past" : idx === step ? "current" : "future";
              return (
                <div key={s.id} className={`step-node ${idx < step ? "done" : ""}`}>
                  <div className={`step-circle ${cls}`}>
                    {idx < step ? "✓" : idx + 1}
                  </div>
                  <span className={`step-label ${idx === step ? "active-label" : idx < step ? "done-label" : "idle-label"}`}>
                    {s.id}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>

          {/* Step header */}
          <div className="step-header">
            <div className="step-icon-badge">
              <span className="step-emoji">{STEPS[step].icon}</span>
              <span className="step-counter">Step {step + 1} of {STEPS.length}</span>
            </div>
            <h2 className="step-title">{STEPS[step].title}</h2>
            <p className="step-hint">{STEPS[step].hint}</p>
          </div>

          {/* Form body */}
          <div className="fields">
            {step === 0 && <>
              <Field label="Full Name" focused={focused} id="name">
                <input className="field-input" type="text" placeholder="e.g. Arjun Sharma" value={formData.name}
                  onChange={(e) => updateForm(null, "name", e.target.value)}
                  onFocus={() => setFocused("name")} onBlur={() => setFocused("")} autoFocus />
              </Field>
              <Field label="Age" focused={focused} id="age">
                <input className="field-input" type="number" placeholder="Your age" value={formData.age}
                  onChange={(e) => updateForm(null, "age", e.target.value)}
                  onFocus={() => setFocused("age")} onBlur={() => setFocused("")} />
              </Field>
              <Field label="Gender" focused={focused} id="gender">
                <select className="field-input" value={formData.gender}
                  onChange={(e) => updateForm(null, "gender", e.target.value)}
                  onFocus={() => setFocused("gender")} onBlur={() => setFocused("")}>
                  <option value="">Select gender</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </Field>
            </>}

            {step === 1 && <>
              <button className="loc-btn" onClick={getLocation}>
                <span>📍</span> Detect My Location
              </button>
              {locationStatus && <div className="loc-status">{locationStatus}</div>}
              <Field label="City" focused={focused} id="city">
                <input className="field-input" type="text" placeholder="e.g. Chennai" value={formData.location.city}
                  onChange={(e) => updateForm("location", "city", e.target.value)}
                  onFocus={() => setFocused("city")} onBlur={() => setFocused("")} />
              </Field>
              <Field label="Street / Area" focused={focused} id="address">
                <input className="field-input" type="text" placeholder="Your street or locality" value={formData.location.address}
                  onChange={(e) => updateForm("location", "address", e.target.value)}
                  onFocus={() => setFocused("address")} onBlur={() => setFocused("")} />
              </Field>
              <Field label="Pincode" focused={focused} id="pincode">
                <input className="field-input" type="text" placeholder="6-digit pincode" value={formData.location.pincode}
                  onChange={(e) => updateForm("location", "pincode", e.target.value)}
                  onFocus={() => setFocused("pincode")} onBlur={() => setFocused("")} />
              </Field>
            </>}

            {step === 2 && <>
              <Field label="Contact Name" focused={focused} id="ename">
                <input className="field-input" type="text" placeholder="Full name" value={formData.emergency.name}
                  onChange={(e) => updateForm("emergency", "name", e.target.value)}
                  onFocus={() => setFocused("ename")} onBlur={() => setFocused("")} autoFocus />
              </Field>
              <Field label="Phone Number" focused={focused} id="ephone">
                <input className="field-input" type="tel" placeholder="+91 98765 43210" value={formData.emergency.phone}
                  onChange={(e) => updateForm("emergency", "phone", e.target.value)}
                  onFocus={() => setFocused("ephone")} onBlur={() => setFocused("")} />
              </Field>
              <div className="info-note">⚠️ Helps responders reach your family quickly during emergencies</div>
            </>}

            {step === 3 && <>
              <Field label="Household Members" focused={focused} id="members">
                <input className="field-input" type="number" min="1" placeholder="Number of people" value={formData.household.members}
                  onChange={(e) => updateForm("household", "members", parseInt(e.target.value) || 1)}
                  onFocus={() => setFocused("members")} onBlur={() => setFocused("")} />
              </Field>
              <ToggleRow label="👴 Elderly Present"   checked={formData.household.elderly}  onChange={(v) => updateForm("household", "elderly", v)} />
              <ToggleRow label="♿ Disabled Person"   checked={formData.household.disabled} onChange={(v) => updateForm("household", "disabled", v)} />
              <ToggleRow label="🐾 Pets at Home"      checked={formData.household.pets}     onChange={(v) => updateForm("household", "pets", v)} />
            </>}

            {step === 4 && <>
              <Field label="Blood Group" focused={focused} id="blood">
                <select className="field-input" value={formData.medical.bloodGroup}
                  onChange={(e) => updateForm("medical", "bloodGroup", e.target.value)}
                  onFocus={() => setFocused("blood")} onBlur={() => setFocused("")}>
                  <option value="">Select blood group</option>
                  <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                  <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                </select>
              </Field>
              <div className="info-note">🩸 Used to coordinate emergency medical response</div>
            </>}

            {step === 5 && <>
              <ToggleRow label="🔥 Fire Alerts"   checked={formData.alerts.fire}  onChange={(v) => updateForm("alerts", "fire", v)} />
              <ToggleRow label="🌊 Flood Alerts"  checked={formData.alerts.flood} onChange={(v) => updateForm("alerts", "flood", v)} />
              <ToggleRow label="🌀 Storm Alerts"  checked={formData.alerts.storm} onChange={(v) => updateForm("alerts", "storm", v)} />
              <div className="info-note">🔔 You can change these anytime from settings</div>
            </>}

            {step === 6 && <>
              <Field label="Email Address" focused={focused} id="email">
                <input className="field-input" type="email" placeholder="you@example.com" value={formData.account.email}
                  onChange={(e) => updateForm("account", "email", e.target.value)}
                  onFocus={() => setFocused("email")} onBlur={() => setFocused("")} autoFocus />
              </Field>
              <Field label="Password" focused={focused} id="password">
                <input className="field-input" type="password" placeholder="••••••••" value={formData.account.password}
                  onChange={(e) => updateForm("account", "password", e.target.value)}
                  onFocus={() => setFocused("password")} onBlur={() => setFocused("")} />
              </Field>
            </>}
          </div>

          {error && (
            <div className="error-msg">
              <span>⚠</span> {error}
            </div>
          )}

          {/* Navigation */}
          <div className="nav-row">
            {step > 0 && (
              <button className="btn-back" onClick={prevStep}>← Back</button>
            )}
            <button className="btn-next" onClick={nextStep} disabled={isSubmitting}>
              {isSubmitting
                ? <><span className="spinner" />Creating…</>
                : step === STEPS.length - 1
                  ? "🚀 Create Account"
                  : "Continue →"
              }
            </button>
          </div>

          <div className="divider" />
          <p className="footer-text">
            Already have an account?{" "}
            <button className="footer-link" onClick={() => setPage("login")}>Sign in</button>
          </p>
        </div>
      </div>
    </>
  );
}

// Helper wrapper for labeled fields
function Field({ label, focused, id, children }) {
  return (
    <div className={`field-wrap ${focused === id ? "active" : ""}`}>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

// Toggle component
function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="toggle-row">
      <span className="toggle-label">{label}</span>
      <button
        className="toggle-switch"
        style={{ background: checked ? "#00ff88" : "#0e1c2e" }}
        onClick={() => onChange(!checked)}
      >
        <div className="toggle-thumb" style={{ left: checked ? "25px" : "3px" }} />
      </button>
    </div>
  );
}