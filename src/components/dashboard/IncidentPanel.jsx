import { useState, useEffect } from "react";
import { COLORS, FONTS } from "../../utils/constants";
import { sevColor, sevBg } from "../../utils/helpers";

// ── Hugging Face response plan generator ──────────────────────────────────────
const HF_API = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1";
// Put your HF token here or in a .env as VITE_HF_TOKEN
const HF_TOKEN = import.meta.env?.VITE_HF_TOKEN ?? "";

async function generatePlan(alert) {
  const prompt = `[INST] You are a disaster response coordinator. Generate a concise 5-step emergency response plan for: ${alert.type} in ${alert.name}, severity: ${alert.sev}, conditions: temp ${alert.temp ?? "unknown"}, wind ${alert.wind ?? "unknown"}, precipitation ${alert.precip ?? "none"}. Be specific and actionable. [/INST]`;
  const res = await fetch(HF_API, {
    method: "POST",
    headers: { Authorization: `Bearer ${HF_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 300, temperature: 0.7 } }),
  });
  if (!res.ok) throw new Error(`HF API ${res.status}`);
  const data = await res.json();
  const raw = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text ?? "";
  // Strip the prompt from the output
  return raw.replace(prompt, "").trim();
}

// ── Mini bar chart for severity trend ─────────────────────────────────────────
function TrendChart({ alerts }) {
  // Build last-6-hour buckets (fake time spread for demo)
  const buckets = Array.from({ length: 6 }, (_, i) => {
    const label = `${5 - i}h`;
    // Distribute alerts across buckets using their id mod 6
    const count = alerts.filter(a => (Number(a.id?.toString().replace(/\D/g, "") || 0) % 6) === i).length;
    return { label, count };
  });
  const max = Math.max(...buckets.map(b => b.count), 1);

  return (
    <div>
      <div style={{ fontSize: 10, fontFamily: FONTS.mono, color: COLORS.muted, letterSpacing: 1, marginBottom: 8 }}>
        INCIDENT TREND (6H)
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 48 }}>
        {buckets.map(({ label, count }) => (
          <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{
              width: "100%", borderRadius: "3px 3px 0 0",
              height: `${(count / max) * 40}px`, minHeight: count > 0 ? 4 : 2,
              background: count > 0
                ? `linear-gradient(180deg, ${COLORS.blue}, ${COLORS.green}88)`
                : COLORS.border,
              transition: "height 0.4s ease",
            }} />
            <span style={{ fontSize: 9, color: COLORS.muted, fontFamily: FONTS.mono }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main panel ─────────────────────────────────────────────────────────────────
export default function IncidentPanel({ alert, alerts, onClose }) {
  const [plan, setPlan]         = useState("");
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError]     = useState("");

  // Reset when alert changes
  useEffect(() => { setPlan(""); setPlanError(""); }, [alert?.id]);

  if (!alert) {
    // Empty state — show top 3 critical
    const critical = (alerts ?? [])
      .filter(a => a.sev === "critical")
      .slice(0, 3);

    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: FONTS.sans }}>
        {/* Header */}
        <div style={{ padding: "14px 16px 10px", borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
          <div style={{ fontSize: 10, fontFamily: FONTS.mono, color: COLORS.muted, letterSpacing: 1, marginBottom: 2 }}>INCIDENT PANEL</div>
          <div style={{ fontSize: 12, color: COLORS.muted }}>Click a marker or alert to inspect</div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
          {/* Top critical */}
          {critical.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontFamily: FONTS.mono, color: COLORS.red, letterSpacing: 1, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: COLORS.red, animation: "ipBlink 1s infinite" }} />
                NEEDS IMMEDIATE ACTION
              </div>
              {critical.map(a => (
                <div key={a.id} style={{ background: `${COLORS.red}0a`, border: `1px solid ${COLORS.red}35`, borderRadius: 8, padding: "9px 12px", marginBottom: 7, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, fontFamily: FONTS.mono, color: COLORS.red }}>{a.type}</div>
                    <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{a.name}</div>
                  </div>
                  <span style={{ fontSize: 9, padding: "2px 7px", background: `${COLORS.red}18`, color: COLORS.red, borderRadius: 4, fontFamily: FONTS.mono, border: `1px solid ${COLORS.red}30` }}>CRITICAL</span>
                </div>
              ))}
            </div>
          )}

          {/* Trend chart */}
          <TrendChart alerts={alerts ?? []} />
        </div>
      </div>
    );
  }

  const col = sevColor(alert.sev);

  const handleGeneratePlan = async () => {
    setPlanLoading(true); setPlanError(""); setPlan("");
    try {
      const result = await generatePlan(alert);
      setPlan(result || "Response plan generated. Deploy teams to the affected zone immediately.");
    } catch (e) {
      // Fallback static plan when HF is unavailable / no token
      setPlan(
        `RESPONSE PLAN — ${alert.type?.toUpperCase()} · ${alert.name}\n\n` +
        `1. ALERT — Activate emergency broadcast for ${alert.name} region.\n` +
        `2. ASSESS — Deploy reconnaissance teams to evaluate ${alert.sev} severity zone.\n` +
        `3. EVACUATE — Initiate evacuation of high-risk zones within 5km radius.\n` +
        `4. DEPLOY — Dispatch medical units, rescue teams & supply convoys.\n` +
        `5. MONITOR — Enable 15-min weather loop via Open-Meteo feed.\n\n` +
        `[Add VITE_HF_TOKEN to .env for AI-generated plans]`
      );
    }
    setPlanLoading(false);
  };

  return (
    <>
      <style>{`@keyframes ipBlink{0%,100%{opacity:1}50%{opacity:0.2}} .ip-plan{white-space:pre-wrap;}`}</style>
      <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: FONTS.sans }}>

        {/* Header */}
        <div style={{ padding: "12px 14px 10px", borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: col, boxShadow: `0 0 8px ${col}`, animation: "ipBlink 1.4s infinite" }} />
              <span style={{ fontSize: 12, fontWeight: 700, fontFamily: FONTS.mono, color: col, letterSpacing: 0.5 }}>
                {alert.type?.toUpperCase()}
              </span>
              {alert.live && (
                <span style={{ fontSize: 9, padding: "1px 5px", background: "rgba(0,255,136,.12)", color: COLORS.green, borderRadius: 3, fontFamily: FONTS.mono }}>LIVE</span>
              )}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, lineHeight: 1.3 }}>{alert.name}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 9, padding: "3px 8px", background: sevBg(alert.sev), color: col, borderRadius: 4, fontFamily: FONTS.mono, fontWeight: 700, letterSpacing: 0.5 }}>
              {alert.sev?.toUpperCase()}
            </span>
            <button onClick={onClose} style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 2 }}
              onMouseEnter={e => e.currentTarget.style.color = COLORS.text}
              onMouseLeave={e => e.currentTarget.style.color = COLORS.muted}>✕</button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>

          {/* Coordinates */}
          <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "9px 12px", marginBottom: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
            {[["LAT", alert.lat?.toFixed?.(4) ?? alert.lat], ["LNG", alert.lng?.toFixed?.(4) ?? alert.lng]].map(([k, v]) => (
              <div key={k} style={{ fontFamily: FONTS.mono, fontSize: 11 }}>
                <span style={{ color: COLORS.muted }}>{k} </span>
                <span style={{ color: COLORS.green }}>{v ?? "—"}</span>
              </div>
            ))}
          </div>

          {/* Weather conditions */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontFamily: FONTS.mono, color: COLORS.muted, letterSpacing: 1, marginBottom: 8 }}>WEATHER CONDITIONS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {[
                ["🌡 Temp",      alert.temp],
                ["💨 Wind",      alert.wind],
                ["🌧 Precip",    alert.precip],
                ["☔ Rain %",    alert.precipProb],
                ["📊 Magnitude", alert.mag],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 7, padding: "7px 10px" }}>
                  <div style={{ fontSize: 9, color: COLORS.muted, fontFamily: FONTS.mono, marginBottom: 3 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, fontFamily: FONTS.mono }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {alert.description && (
            <div style={{ background: `${col}08`, border: `1px solid ${col}25`, borderRadius: 8, padding: "9px 12px", marginBottom: 14, fontSize: 12, color: COLORS.muted, lineHeight: 1.6 }}>
              {alert.description}
            </div>
          )}

          {/* Trend */}
          <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 12px", marginBottom: 14 }}>
            <TrendChart alerts={alerts ?? []} />
          </div>

          {/* Generate plan button */}
          <button
            onClick={handleGeneratePlan}
            disabled={planLoading}
            style={{
              width: "100%", padding: "10px", borderRadius: 8, cursor: planLoading ? "wait" : "pointer",
              background: planLoading ? `${COLORS.blue}18` : `linear-gradient(135deg, ${COLORS.blue}22, ${COLORS.green}22)`,
              border: `1px solid ${planLoading ? COLORS.blue : COLORS.green}55`,
              color: planLoading ? COLORS.blue : COLORS.green,
              fontFamily: FONTS.mono, fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
              transition: "all 0.2s", marginBottom: 12,
            }}
            onMouseEnter={e => { if (!planLoading) { e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.blue}35, ${COLORS.green}35)`; e.currentTarget.style.boxShadow = `0 0 20px ${COLORS.green}22`; } }}
            onMouseLeave={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.blue}22, ${COLORS.green}22)`; e.currentTarget.style.boxShadow = "none"; }}
          >
            {planLoading ? "⏳ GENERATING PLAN..." : "🧠 GENERATE RESPONSE PLAN"}
          </button>

          {/* Plan output */}
          {plan && (
            <div style={{ background: "#060f1a", border: `1px solid ${COLORS.green}30`, borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, fontFamily: FONTS.mono, color: COLORS.green, letterSpacing: 1, marginBottom: 8 }}>◉ AI RESPONSE PLAN</div>
              <div className="ip-plan" style={{ fontSize: 11, color: COLORS.text, fontFamily: FONTS.mono, lineHeight: 1.8, opacity: 0.85 }}>
                {plan}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}