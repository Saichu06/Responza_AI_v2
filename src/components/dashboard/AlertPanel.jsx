// src/components/dashboard/AlertPanel.jsx
import { useState } from "react";
import { COLORS, FONTS } from "../../utils/constants";
import { sevColor, sevBg } from "../../utils/helpers";
import Loader from "../common/Loader";

const SEV_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

/* ══════════════════════════
   NEW ALERT MODAL
══════════════════════════ */
function NewAlertModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    name: "", type: "Flood Risk", sev: "high",
    description: "", temp: "", wind: "", precip: "",
    lat: "", lon: "",
  });
  const [error, setError] = useState("");

  const TYPES = ["Flood Risk","Wildfire","Earthquake","Cyclone","Tsunami","Heat Wave","High Winds","Thunderstorm","Blizzard","Custom Alert"];
  const SEVS  = ["critical","high","medium","low"];

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Convert lat/lon to approximate SVG x/y (0-1000, 0-500)
  const latLonToXY = (lat, lon) => ({
    x: Math.round(((parseFloat(lon) + 180) / 360) * 1000),
    y: Math.round(((90 - parseFloat(lat)) / 180) * 500),
  });

  const handleSubmit = () => {
    if (!form.name.trim())  { setError("Location name is required"); return; }
    if (!form.lat || !form.lon) { setError("Latitude and longitude are required to place on map"); return; }
    const lat = parseFloat(form.lat), lon = parseFloat(form.lon);
    if (isNaN(lat) || isNaN(lon)) { setError("Invalid coordinates"); return; }
    if (lat < -90 || lat > 90)   { setError("Latitude must be between -90 and 90"); return; }
    if (lon < -180 || lon > 180) { setError("Longitude must be between -180 and 180"); return; }

    const { x, y } = latLonToXY(lat, lon);
    onAdd({
      name: form.name.trim(),
      type: form.type,
      sev:  form.sev,
      description: form.description.trim() || `Manual alert: ${form.type}`,
      temp:   form.temp  ? `${form.temp}°C`   : null,
      wind:   form.wind  ? `${form.wind} km/h` : null,
      precip: form.precip ? `${form.precip} mm` : null,
      lat, lon, x, y,
      live: false,
    });
    onClose();
  };

  const inputStyle = {
    width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`,
    borderRadius: 6, padding: "8px 10px", color: COLORS.text,
    fontFamily: FONTS.mono, fontSize: 11, outline: "none", boxSizing: "border-box",
  };
  const labelStyle = { fontSize: 10, fontFamily: FONTS.mono, color: COLORS.muted, letterSpacing: .5, marginBottom: 5, display: "block" };
  const fieldGroup = { marginBottom: 12 };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10000,
      background: "rgba(0,0,0,.7)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{
        background: COLORS.surface, border: `1px solid ${COLORS.border}`,
        borderRadius: 14, width: "100%", maxWidth: 440,
        boxShadow: "0 8px 48px rgba(0,0,0,.6)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        {/* Modal header */}
        <div style={{
          padding: "14px 18px", borderBottom: `1px solid ${COLORS.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>+ New Alert</div>
            <div style={{ fontSize: 10, fontFamily: FONTS.mono, color: COLORS.muted, marginTop: 2 }}>
              Add incident to map and incidents list
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: COLORS.muted, fontSize: 18, cursor: "pointer", padding: "0 4px" }}
          >×</button>
        </div>

        {/* Form */}
        <div style={{ padding: "16px 18px" }}>
          <div style={fieldGroup}>
            <label style={labelStyle}>LOCATION NAME *</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Chennai, India" style={inputStyle} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, ...fieldGroup }}>
            <div>
              <label style={labelStyle}>ALERT TYPE</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>SEVERITY</label>
              <select value={form.sev} onChange={(e) => set("sev", e.target.value)} style={{ ...inputStyle, cursor: "pointer", color: sevColor(form.sev) }}>
                {SEVS.map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, ...fieldGroup }}>
            <div>
              <label style={labelStyle}>LATITUDE *</label>
              <input value={form.lat} onChange={(e) => set("lat", e.target.value)} placeholder="e.g. 13.0827" style={inputStyle} type="number" step="any" />
            </div>
            <div>
              <label style={labelStyle}>LONGITUDE *</label>
              <input value={form.lon} onChange={(e) => set("lon", e.target.value)} placeholder="e.g. 80.2707" style={inputStyle} type="number" step="any" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, ...fieldGroup }}>
            <div>
              <label style={labelStyle}>TEMP (°C)</label>
              <input value={form.temp} onChange={(e) => set("temp", e.target.value)} placeholder="32" style={inputStyle} type="number" />
            </div>
            <div>
              <label style={labelStyle}>WIND (km/h)</label>
              <input value={form.wind} onChange={(e) => set("wind", e.target.value)} placeholder="45" style={inputStyle} type="number" />
            </div>
            <div>
              <label style={labelStyle}>PRECIP (mm)</label>
              <input value={form.precip} onChange={(e) => set("precip", e.target.value)} placeholder="12" style={inputStyle} type="number" />
            </div>
          </div>

          <div style={fieldGroup}>
            <label style={labelStyle}>DESCRIPTION (optional)</label>
            <input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Brief situation description..." style={inputStyle} />
          </div>

          {/* Preview badge */}
          <div style={{
            background: `${sevColor(form.sev)}0d`, border: `1px solid ${sevColor(form.sev)}33`,
            borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 11,
            fontFamily: FONTS.mono, display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: sevColor(form.sev) }} />
            <span style={{ color: sevColor(form.sev), fontWeight: 700 }}>{form.sev.toUpperCase()}</span>
            <span style={{ color: COLORS.muted }}>—</span>
            <span style={{ color: COLORS.text }}>{form.type}</span>
            {form.name && <span style={{ color: COLORS.muted }}>at {form.name}</span>}
          </div>

          {error && (
            <div style={{ fontSize: 11, color: COLORS.red, fontFamily: FONTS.mono, marginBottom: 12, padding: "6px 10px", background: "rgba(255,59,92,.08)", borderRadius: 6 }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, background: "transparent", border: `1px solid ${COLORS.border}`,
                borderRadius: 7, padding: "9px", color: COLORS.muted, fontFamily: FONTS.mono,
                fontSize: 11, cursor: "pointer",
              }}
            >Cancel</button>
            <button
              onClick={handleSubmit}
              style={{
                flex: 2, background: `${COLORS.green}18`, border: `1px solid ${COLORS.green}44`,
                borderRadius: 7, padding: "9px", color: COLORS.green, fontFamily: FONTS.mono,
                fontSize: 11, cursor: "pointer", fontWeight: 700, letterSpacing: .5,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = `${COLORS.green}28`}
              onMouseLeave={(e) => e.currentTarget.style.background = `${COLORS.green}18`}
            >
              + ADD TO MAP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════
   ALERT CARD
══════════════════════════ */
function AlertCard({ alert, selected, onSelect, onRemove }) {
  const isSelected = selected?.id === alert.id;
  const col = sevColor(alert.sev);
  const [hov, setHov] = useState(false);

  return (
    <div
      onClick={() => onSelect(isSelected ? null : alert)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: isSelected ? `${col}0d` : hov ? `${COLORS.surface}cc` : COLORS.surface,
        border: `1px solid ${isSelected ? col : hov ? COLORS.blue + "55" : COLORS.border}`,
        borderRadius: 10, padding: "12px 14px",
        cursor: "pointer", transition: "all .18s", marginBottom: 6,
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Left accent */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
        background: col, borderRadius: "10px 0 0 10px",
        opacity: isSelected ? 1 : 0.45, transition: "opacity 0.18s",
      }} />

      <div style={{ paddingLeft: 8 }}>
        {/* Row 1 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: FONTS.mono, color: col, letterSpacing: 0.3 }}>
              {alert.type}
            </span>
            {alert.live && (
              <span style={{
                fontSize: 9, padding: "1px 6px",
                background: "rgba(0,255,136,.12)", color: COLORS.green,
                borderRadius: 3, fontFamily: FONTS.mono, letterSpacing: 0.5,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: COLORS.green, animation: "panelBlink 1s infinite" }} />
                LIVE
              </span>
            )}
            {alert.custom && (
              <span style={{
                fontSize: 9, padding: "1px 5px",
                background: "rgba(77,159,255,.12)", color: COLORS.blue,
                borderRadius: 3, fontFamily: FONTS.mono,
              }}>CUSTOM</span>
            )}
          </div>
          <span style={{
            padding: "2px 7px", borderRadius: 4, fontSize: 9, fontWeight: 700,
            fontFamily: FONTS.mono, background: sevBg(alert.sev), color: col, letterSpacing: 0.5,
          }}>
            {alert.sev?.toUpperCase()}
          </span>
        </div>

        {/* Row 2 */}
        <div style={{ fontSize: 12, color: COLORS.text, fontWeight: 500, marginBottom: 4, lineHeight: 1.4 }}>
          {alert.name}
        </div>

        {/* Row 3: weather chips */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[alert.temp, alert.wind].filter(Boolean).map((val, i) => (
            <span key={i} style={{
              fontSize: 10, fontFamily: FONTS.mono, color: COLORS.muted,
              background: `${COLORS.bg}cc`, border: `1px solid ${COLORS.border}`,
              borderRadius: 4, padding: "1px 7px",
            }}>{val}</span>
          ))}
        </div>

        {/* Expanded */}
        {isSelected && (
          <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 10, marginTop: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 12px", marginBottom: 10 }}>
              {[
                ["Temp",   alert.temp],
                ["Wind",   alert.wind],
                ["Precip", alert.precip],
                ["Rain %", alert.precipProb],
                ["Mag",    alert.mag],
                ["Status", alert.description],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} style={{ fontSize: 11, fontFamily: FONTS.mono }}>
                  <span style={{ color: COLORS.muted }}>{k}: </span>
                  <span style={{ color: COLORS.text }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={(e) => e.stopPropagation()}
                style={{
                  flex: 1, background: `${col}14`,
                  border: `1px solid ${col}40`, borderRadius: 6, padding: "6px",
                  color: col, fontSize: 11, fontFamily: FONTS.mono,
                  cursor: "pointer", letterSpacing: 0.5, transition: "all 0.18s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = `${col}25`}
                onMouseLeave={(e) => e.currentTarget.style.background = `${col}14`}
              >VIEW ON MAP →</button>
              {alert.custom && onRemove && (
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(alert.id); }}
                  style={{
                    background: "rgba(255,59,92,.08)", border: "1px solid rgba(255,59,92,.2)",
                    borderRadius: 6, padding: "6px 10px", color: COLORS.red,
                    fontSize: 11, fontFamily: FONTS.mono, cursor: "pointer",
                  }}
                >✕</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════
   MAIN COMPONENT
══════════════════════════ */
export default function AlertPanel({ alerts, loading, selected, onSelect, onAddAlert, onRemoveAlert }) {
  const [search,     setSearch]     = useState("");
  const [sortBySev,  setSortBySev]  = useState(true);
  const [showModal,  setShowModal]  = useState(false);

  const filtered = alerts
    .filter((a) => !search ||
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.type?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => sortBySev ? (SEV_ORDER[a.sev] ?? 9) - (SEV_ORDER[b.sev] ?? 9) : 0);

  const critCount   = alerts.filter((a) => a.sev === "critical").length;
  const customCount = alerts.filter((a) => a.custom).length;

  return (
    <>
      <style>{`@keyframes panelBlink { 0%,100%{opacity:1} 50%{opacity:0.2} }`}</style>

      {showModal && (
        <NewAlertModal
          onAdd={(alert) => { onAddAlert?.(alert); }}
          onClose={() => setShowModal(false)}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: FONTS.sans }}>

        {/* Header */}
        <div style={{ padding: "14px 14px 10px", borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <span style={{ fontSize: 11, fontFamily: FONTS.mono, color: COLORS.muted, letterSpacing: 1 }}>ACTIVE INCIDENTS</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                <span style={{ fontSize: 20, fontWeight: 700, fontFamily: FONTS.mono, color: COLORS.text }}>{alerts.length}</span>
                {critCount > 0 && (
                  <span style={{ fontSize: 10, padding: "2px 7px", background: "rgba(255,59,92,.12)", color: COLORS.red, borderRadius: 4, fontFamily: FONTS.mono, border: `1px solid rgba(255,59,92,.25)` }}>
                    {critCount} CRITICAL
                  </span>
                )}
                {customCount > 0 && (
                  <span style={{ fontSize: 10, padding: "2px 7px", background: "rgba(77,159,255,.12)", color: COLORS.blue, borderRadius: 4, fontFamily: FONTS.mono }}>
                    {customCount} CUSTOM
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setSortBySev((s) => !s)}
                style={{
                  fontSize: 10, fontFamily: FONTS.mono,
                  background: sortBySev ? `${COLORS.blue}18` : "transparent",
                  border: `1px solid ${sortBySev ? COLORS.blue : COLORS.border}`,
                  color: sortBySev ? COLORS.blue : COLORS.muted,
                  borderRadius: 6, padding: "4px 9px", cursor: "pointer", transition: "all 0.18s",
                }}
              >{sortBySev ? "⬆ SEV" : "SORT"}</button>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  fontSize: 10, fontFamily: FONTS.mono,
                  background: `${COLORS.green}14`,
                  border: `1px solid ${COLORS.green}44`,
                  color: COLORS.green,
                  borderRadius: 6, padding: "4px 9px", cursor: "pointer", fontWeight: 700,
                  transition: "all 0.18s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = `${COLORS.green}25`}
                onMouseLeave={(e) => e.currentTarget.style.background = `${COLORS.green}14`}
              >+ NEW</button>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: COLORS.muted }}>⌕</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search incidents..."
              style={{
                width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`,
                borderRadius: 7, padding: "7px 10px 7px 28px", color: COLORS.text,
                fontFamily: FONTS.mono, fontSize: 11, outline: "none", transition: "border-color 0.18s",
              }}
              onFocus={(e) => e.target.style.borderColor = COLORS.blue}
              onBlur={(e) => e.target.style.borderColor = COLORS.border}
            />
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
          {loading && !alerts.length ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 120 }}>
              <Loader label="Fetching live data..." />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", color: COLORS.muted, fontSize: 12, fontFamily: FONTS.mono, marginTop: 40 }}>
              No incidents match filter
            </div>
          ) : (
            filtered.map((a) => (
              <AlertCard
                key={a.id}
                alert={a}
                selected={selected}
                onSelect={onSelect}
                onRemove={onRemoveAlert}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "8px 14px", borderTop: `1px solid ${COLORS.border}`, flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 9, fontFamily: FONTS.mono, color: COLORS.muted, letterSpacing: 0.5 }}>
            {filtered.length}/{alerts.length} SHOWN
          </span>
          <span style={{ fontSize: 9, fontFamily: FONTS.mono, color: COLORS.muted }}>
            CLICK TO SELECT → AI
          </span>
        </div>
      </div>
    </>
  );
}