import { useState } from "react";
import { COLORS, FONTS } from "../../utils/constants";
import { sevColor, sevBg } from "../../utils/helpers";
import Loader from "../common/Loader";

const SEV_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

function AlertCard({ alert, selected, onSelect }) {
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
        borderRadius: 10,
        padding: "12px 14px",
        cursor: "pointer",
        transition: "all .18s",
        marginBottom: 6,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left accent bar */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: 3, background: col,
        borderRadius: "10px 0 0 10px",
        opacity: isSelected ? 1 : 0.45,
        transition: "opacity 0.18s",
      }} />

      <div style={{ paddingLeft: 8 }}>
        {/* Row 1: type + badge */}
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
          </div>
          <span style={{
            padding: "2px 7px", borderRadius: 4, fontSize: 9, fontWeight: 700,
            fontFamily: FONTS.mono, background: sevBg(alert.sev), color: col, letterSpacing: 0.5,
          }}>
            {alert.sev?.toUpperCase()}
          </span>
        </div>

        {/* Row 2: location name */}
        <div style={{ fontSize: 12, color: COLORS.text, fontWeight: 500, marginBottom: 4, lineHeight: 1.4 }}>
          {alert.name}
        </div>

        {/* Row 3: quick weather chips */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[alert.temp, alert.wind].filter(Boolean).map((val, i) => (
            <span key={i} style={{
              fontSize: 10, fontFamily: FONTS.mono, color: COLORS.muted,
              background: `${COLORS.bg}cc`, border: `1px solid ${COLORS.border}`,
              borderRadius: 4, padding: "1px 7px",
            }}>{val}</span>
          ))}
        </div>

        {/* Expanded detail */}
        {isSelected && (
          <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 10, marginTop: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 12px" }}>
              {[
                ["Temp",    alert.temp],
                ["Wind",    alert.wind],
                ["Precip",  alert.precip],
                ["Rain %",  alert.precipProb],
                ["Mag",     alert.mag],
                ["Status",  alert.description],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} style={{ fontSize: 11, fontFamily: FONTS.mono }}>
                  <span style={{ color: COLORS.muted }}>{k}: </span>
                  <span style={{ color: COLORS.text }}>{v}</span>
                </div>
              ))}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); }}
              style={{
                marginTop: 10, width: "100%", background: `${col}14`,
                border: `1px solid ${col}40`, borderRadius: 6, padding: "6px",
                color: col, fontSize: 11, fontFamily: FONTS.mono,
                cursor: "pointer", letterSpacing: 0.5, transition: "all 0.18s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = `${col}25`}
              onMouseLeave={e => e.currentTarget.style.background = `${col}14`}
            >
              VIEW ON MAP →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AlertPanel({ alerts, loading, selected, onSelect }) {
  const [search, setSearch] = useState("");
  const [sortBySev, setSortBySev] = useState(true);

  const filtered = alerts
    .filter(a => !search || a.name?.toLowerCase().includes(search.toLowerCase()) || a.type?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBySev ? (SEV_ORDER[a.sev] ?? 9) - (SEV_ORDER[b.sev] ?? 9) : 0);

  const critCount = alerts.filter(a => a.sev === "critical").length;

  return (
    <>
      <style>{`@keyframes panelBlink { 0%,100%{opacity:1} 50%{opacity:0.2} }`}</style>
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
              </div>
            </div>
            <button
              onClick={() => setSortBySev(s => !s)}
              style={{ fontSize: 10, fontFamily: FONTS.mono, background: sortBySev ? `${COLORS.blue}18` : "transparent", border: `1px solid ${sortBySev ? COLORS.blue : COLORS.border}`, color: sortBySev ? COLORS.blue : COLORS.muted, borderRadius: 6, padding: "4px 9px", cursor: "pointer", transition: "all 0.18s" }}
            >
              {sortBySev ? "⬆ SEVERITY" : "SORT"}
            </button>
          </div>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: COLORS.muted }}>⌕</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search incidents..."
              style={{
                width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`,
                borderRadius: 7, padding: "7px 10px 7px 28px", color: COLORS.text,
                fontFamily: FONTS.mono, fontSize: 11, outline: "none",
                transition: "border-color 0.18s",
              }}
              onFocus={e => e.target.style.borderColor = COLORS.blue}
              onBlur={e => e.target.style.borderColor = COLORS.border}
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
            filtered.map(a => (
              <AlertCard key={a.id} alert={a} selected={selected} onSelect={onSelect} />
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "8px 14px", borderTop: `1px solid ${COLORS.border}`, flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 9, fontFamily: FONTS.mono, color: COLORS.muted, letterSpacing: 0.5 }}>
            {filtered.length}/{alerts.length} SHOWN
          </span>
          <span style={{ fontSize: 9, fontFamily: FONTS.mono, color: COLORS.muted }}>
            CLICK MARKER TO SELECT
          </span>
        </div>
      </div>
    </>
  );
}