import { COLORS, FONTS, SEV_COLORS } from "../../utils/constants";

const FILTERS = [
  { key: "all",      label: "ALL" },
  { key: "critical", label: "CRITICAL" },
  { key: "high",     label: "HIGH" },
  { key: "medium",   label: "MEDIUM" },
  { key: "low",      label: "LOW" },
];

const TYPES = ["All Types", "Earthquake", "Flood", "Cyclone", "Wildfire", "Typhoon", "Heatwave", "Storm", "Tsunami"];

export default function Filters({ filter, setFilter, typeFilter, setTypeFilter, alertCount }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
      padding: "12px 24px", background: COLORS.surface,
      borderBottom: `1px solid ${COLORS.border}`,
      fontFamily: FONTS.sans,
    }}>
      {/* Severity pills */}
      <div style={{ display: "flex", gap: 6 }}>
        {FILTERS.map(({ key, label }) => {
          const active = filter === key;
          const col    = key === "all" ? COLORS.blue : SEV_COLORS[key] ?? COLORS.blue;
          return (
            <button key={key} onClick={() => setFilter(key)} style={{
              padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600,
              fontFamily: FONTS.mono, cursor: "pointer", letterSpacing: .5,
              transition: "all .18s",
              background:  active ? `${col}22` : "transparent",
              color:        active ? col        : COLORS.muted,
              border:       `1px solid ${active ? col : COLORS.border}`,
            }}>
              {label}
            </button>
          );
        })}
      </div>

      <div style={{ width: 1, height: 20, background: COLORS.border }} />

      {/* Type dropdown */}
      <select
        value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
        style={{
          background: COLORS.surface, border: `1px solid ${COLORS.border}`,
          borderRadius: 6, padding: "4px 10px", color: COLORS.muted,
          fontFamily: FONTS.mono, fontSize: 11, cursor: "pointer", outline: "none",
        }}
      >
        {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      <div style={{ marginLeft: "auto", fontFamily: FONTS.mono, fontSize: 11, color: COLORS.muted }}>
        <span style={{ color: COLORS.text, fontWeight: 600 }}>{alertCount}</span> incidents
      </div>
    </div>
  );
}