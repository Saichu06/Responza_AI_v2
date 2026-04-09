import { useEffect, useState } from "react";
import { COLORS, FONTS } from "../../utils/constants";
import { groupBySeverity, animateCount } from "../../utils/helpers";

function StatCard({ label, value, sub, color, icon, accent, trend }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background:   hov ? `${COLORS.surface}ee` : COLORS.surface,
        border:       `1px solid ${hov ? (accent || COLORS.border) : COLORS.border}`,
        borderRadius: 12,
        padding:      "18px 20px",
        position:     "relative",
        overflow:     "hidden",
        transition:   "all .2s",
        boxShadow:    hov ? `0 0 24px ${(accent || COLORS.blue)}18` : "none",
        cursor:       "default",
      }}
    >
      {/* Top glow strip */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accent || COLORS.blue}00, ${accent || COLORS.blue}, ${accent || COLORS.blue}00)`, opacity: hov ? 1 : 0.4, transition: "opacity 0.2s" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: COLORS.muted, fontFamily: FONTS.mono, letterSpacing: 1.5, marginBottom: 10, textTransform: "uppercase" }}>{label}</div>
          <div style={{ fontSize: 30, fontWeight: 700, fontFamily: FONTS.mono, color: color ?? COLORS.text, lineHeight: 1, marginBottom: 6, textShadow: hov ? `0 0 20px ${color}40` : "none", transition: "text-shadow 0.2s" }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: FONTS.sans, lineHeight: 1.4 }}>{sub}</div>}
          {trend && (
            <div style={{ marginTop: 8, fontSize: 10, fontFamily: FONTS.mono, color: trend.up ? COLORS.green : COLORS.red, display: "flex", alignItems: "center", gap: 4 }}>
              {trend.up ? "↑" : "↓"} {trend.label}
            </div>
          )}
        </div>
        <div style={{ fontSize: 26, opacity: hov ? 0.8 : 0.4, transition: "opacity 0.2s", marginLeft: 10 }}>{icon}</div>
      </div>

      {/* Bottom mini bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: COLORS.bg, borderRadius: "0 0 12px 12px" }}>
        <div style={{ height: "100%", width: `${Math.min((typeof value === "number" ? value : 0) * 3, 100)}%`, background: accent || COLORS.blue, borderRadius: "0 0 12px 12px", opacity: 0.6, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

export default function StatsCards({ alerts, liveCount, lastFetch }) {
  const [counts, setCounts] = useState({ critical: 0, high: 0, medium: 0, low: 0 });

  useEffect(() => {
    if (!alerts?.length) return;
    const g = groupBySeverity(alerts);
    const cleanups = Object.entries(g).map(([sev, count]) => {
      const fn = animateCount(count, (v) => setCounts((c) => ({ ...c, [sev]: v })), 1000);
      return fn;
    });
    return () => cleanups.forEach((fn) => fn?.());
  }, [alerts]);

  const total = alerts?.length ?? 0;

  const cards = [
    {
      label:  "TOTAL INCIDENTS",
      value:  total,
      color:  COLORS.text,
      accent: COLORS.blue,
      sub:    `${liveCount ?? 0} live from API`,
      icon:   "🌍",
      trend:  { up: true, label: "+3 last hour" },
    },
    {
      label:  "CRITICAL",
      value:  counts.critical ?? 0,
      color:  COLORS.red,
      accent: COLORS.red,
      sub:    "Immediate response needed",
      icon:   "🔴",
      trend:  counts.critical > 0 ? { up: false, label: "Active emergency" } : null,
    },
    {
      label:  "HIGH SEVERITY",
      value:  counts.high ?? 0,
      color:  COLORS.amber,
      accent: COLORS.amber,
      sub:    "Deploy within 1 hour",
      icon:   "⚠️",
      trend:  { up: true, label: "Monitoring active" },
    },
    {
      label:  "LAST REFRESH",
      value:  lastFetch ? new Date(lastFetch).toLocaleTimeString() : "--:--",
      color:  COLORS.green,
      accent: COLORS.green,
      sub:    "Auto-refresh every 5 min",
      icon:   "🔄",
      trend:  { up: true, label: "Systems nominal" },
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, padding: "16px 24px", background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}` }}>
      {cards.map((c) => (
        <StatCard key={c.label} {...c} />
      ))}
    </div>
  );
}