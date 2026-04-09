// src/components/dashboard/MapView.jsx
import { useState } from "react";
import { COLORS, FONTS } from "../../utils/constants";
import { sevColor } from "../../utils/helpers";
import Loader from "../common/Loader";

const css = `
@keyframes markerPulse { 0%,100%{ opacity:.8; } 50%{ opacity:0; } }
@keyframes radar-sweep { from{ transform:rotate(0deg); } to{ transform:rotate(360deg); } }
#radar-g { transform-origin: 500px 250px; animation: radar-sweep 4s linear infinite; }
`;

function Tooltip({ alert, pos }) {
  if (!alert) return null;
  const col = sevColor(alert.sev);
  return (
    <div style={{
      position: "fixed", left: pos.x + 14, top: pos.y - 50, zIndex: 9999,
      background: "#0a172b", border: `1px solid ${col}44`,
      borderRadius: 10, padding: "12px 14px", minWidth: 200, pointerEvents: "none",
      fontFamily: FONTS.sans, fontSize: 12,
      boxShadow: `0 4px 24px rgba(0,0,0,.5), 0 0 0 1px ${col}22`,
    }}>
      <div style={{ fontWeight: 700, fontFamily: FONTS.mono, color: col, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
        {alert.type}
        {alert.live && (
          <span style={{ fontSize: 9, padding: "1px 5px", background: "rgba(0,255,136,.12)", color: COLORS.green, borderRadius: 3 }}>LIVE</span>
        )}
        {alert.custom && (
          <span style={{ fontSize: 9, padding: "1px 5px", background: "rgba(77,159,255,.12)", color: COLORS.blue, borderRadius: 3 }}>CUSTOM</span>
        )}
      </div>
      <div style={{ color: COLORS.text, fontWeight: 600, marginBottom: 6 }}>{alert.name}</div>
      <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "3px 12px" }}>
        {[
          ["Temp",  alert.temp],
          ["Wind",  alert.wind],
          ["Rain",  alert.precip],
          ["Prob",  alert.precipProb],
        ].map(([k, v]) => v && (
          <span key={k} style={{ fontFamily: FONTS.mono, fontSize: 11 }}>
            <span style={{ color: COLORS.muted }}>{k} </span>
            <span style={{ color: COLORS.text }}>{v}</span>
          </span>
        ))}
      </div>
      {alert.description && (
        <div style={{ marginTop: 8, fontSize: 10, color: COLORS.muted, fontFamily: FONTS.mono, lineHeight: 1.5 }}>
          {alert.description}
        </div>
      )}
      <div style={{ marginTop: 8, fontSize: 9, color: COLORS.muted, fontFamily: FONTS.mono }}>
        Click to select → AI will analyze
      </div>
    </div>
  );
}

export default function MapView({ alerts, loading, selected, onSelect }) {
  const [hovered, setHovered] = useState(null);
  const [pos,     setPos]     = useState({ x: 0, y: 0 });

  const validAlerts = alerts?.filter(
    (a) => a && typeof a.x === "number" && typeof a.y === "number" && !isNaN(a.x) && !isNaN(a.y)
  ) || [];

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: COLORS.bg }}>
      <style>{css}</style>

      <svg width="100%" height="100%" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="mapbg" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#0d1e35" />
            <stop offset="100%" stopColor="#060d1a" />
          </radialGradient>
          <radialGradient id="sweep-glow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(0,255,136,.08)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="sel-glow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(77,159,255,.15)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glowStrong" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width="1000" height="500" fill="url(#mapbg)" />

        {/* Grid */}
        <g stroke="rgba(77,159,255,.05)" strokeWidth=".5">
          {[100,200,300,400].map((v) => <line key={`h${v}`} x1="0" y1={v} x2="1000" y2={v} />)}
          {[200,400,600,800].map((v) => <line key={`v${v}`} x1={v} y1="0" x2={v} y2="500" />)}
        </g>

        {/* Equator / Prime Meridian */}
        <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(77,159,255,.12)" strokeWidth=".8" strokeDasharray="4 6" />
        <line x1="500" y1="0" x2="500" y2="500" stroke="rgba(77,159,255,.12)" strokeWidth=".8" strokeDasharray="4 6" />

        {/* Landmasses */}
        <g fill="rgba(20,50,100,.75)" stroke="rgba(77,159,255,.28)" strokeWidth=".8">
          <path d="M90,60 L180,50 L220,80 L240,120 L220,160 L190,190 L160,195 L130,180 L100,150 L70,120 L60,90 Z" />
          <path d="M165,220 L210,210 L240,240 L250,290 L240,340 L215,360 L185,355 L162,330 L150,290 L148,250 Z" />
          <path d="M435,60 L490,55 L510,80 L505,110 L485,120 L462,115 L440,100 L432,80 Z" />
          <path d="M415,70 L428,67 L432,80 L425,90 L412,88 Z" />
          <path d="M440,140 L510,135 L535,165 L540,220 L530,280 L510,320 L480,335 L455,325 L435,295 L420,250 L415,200 L420,165 Z" />
          <path d="M510,55 L680,45 L760,55 L800,80 L820,110 L810,145 L780,160 L740,155 L700,145 L660,150 L630,140 L600,120 L565,100 L535,85 L510,80 Z" />
          <path d="M570,145 L620,138 L640,165 L635,200 L615,215 L590,210 L568,190 L560,165 Z" />
          <path d="M640,165 L700,160 L730,180 L735,210 L715,225 L690,215 L665,195 L642,185 Z" />
          <path d="M680,220 L710,215 L730,230 L725,248 L700,252 L678,240 Z" />
          <path d="M740,218 L770,215 L780,232 L765,245 L742,240 Z" />
          <path d="M750,90 L768,85 L775,100 L768,118 L750,120 L740,105 Z" />
          <path d="M690,295 L780,285 L830,310 L840,355 L820,390 L775,400 L730,390 L695,360 L680,325 Z" />
          <path d="M855,365 L868,358 L875,375 L865,390 L852,385 Z" />
          <path d="M260,20 L310,18 L330,40 L320,65 L290,70 L262,55 Z" />
          <path d="M450,30 L480,25 L492,45 L480,60 L460,58 L445,45 Z" />
          {/* Africa */}
          <path d="M470,165 L510,160 L530,185 L535,230 L525,270 L505,310 L480,325 L455,310 L440,270 L438,225 L445,185 Z" />
        </g>

        {/* Radar sweep */}
        <g id="radar-g">
          <path d="M500,250 L900,250 A400,250 0 0,0 500,0 Z" fill="url(#sweep-glow)" opacity=".25" />
        </g>

        {/* Selected glow halo */}
        {selected && typeof selected.x === "number" && (
          <circle cx={selected.x} cy={selected.y} r="60" fill="url(#sel-glow)" />
        )}

        {/* Markers */}
        {validAlerts.map((alert) => {
          const col        = sevColor(alert.sev);
          const isSelected = selected?.id === alert.id;
          const dur        = alert.sev === "critical" ? "1.4s" : alert.sev === "high" ? "2s" : "2.8s";

          return (
            <g
              key={alert.id}
              style={{ cursor: "pointer" }}
              onMouseMove={(e) => { setHovered(alert); setPos({ x: e.clientX, y: e.clientY }); }}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect(isSelected ? null : alert)}
            >
              {/* Pulse ring */}
              <circle cx={alert.x} cy={alert.y} r="7" fill="none" stroke={col} strokeWidth="1.5" opacity="0.6">
                <animate attributeName="r" values="7;22;7" dur={dur} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur={dur} repeatCount="indefinite" />
              </circle>

              {/* Selected ring */}
              {isSelected && (
                <circle cx={alert.x} cy={alert.y} r="14" fill="none" stroke={col} strokeWidth="1.2" opacity="0.4">
                  <animate attributeName="r" values="14;32;14" dur="1.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="1.2s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Core dot */}
              <circle
                cx={alert.x} cy={alert.y}
                r={isSelected ? 7 : 5}
                fill={col}
                stroke="#ffffff"
                strokeWidth={isSelected ? 2.5 : 1.5}
                filter={isSelected ? "url(#glowStrong)" : "url(#glow)"}
              />

              {/* Live dot */}
              {alert.live && (
                <circle cx={alert.x + 6} cy={alert.y - 6} r="3" fill={COLORS.green}>
                  <animate attributeName="opacity" values="1;0.2;1" dur="0.9s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Custom marker badge */}
              {alert.custom && (
                <circle cx={alert.x - 6} cy={alert.y - 6} r="3" fill={COLORS.blue}>
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Label on hover */}
              {hovered?.id === alert.id && (
                <text
                  x={alert.x} y={alert.y - 14}
                  textAnchor="middle" fontSize="9"
                  fill={col} fontFamily="monospace" fontWeight="700"
                >
                  {alert.name?.split(",")[0]}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Loading */}
      {loading && (
        <div style={{
          position: "absolute", bottom: 16, left: 16,
          display: "flex", alignItems: "center", gap: 8,
          fontFamily: FONTS.mono, fontSize: 11, color: COLORS.green,
          background: `${COLORS.surface}cc`, padding: "6px 12px",
          borderRadius: 6, border: `1px solid ${COLORS.border}`,
        }}>
          <Loader inline label="Fetching live weather..." />
        </div>
      )}

      {/* Selected info badge */}
      {selected && (
        <div style={{
          position: "absolute", top: 12, left: 12,
          background: `${COLORS.surface}ee`, border: `1px solid ${sevColor(selected.sev)}44`,
          borderRadius: 8, padding: "8px 12px", fontSize: 11,
          fontFamily: FONTS.mono, backdropFilter: "blur(4px)",
          boxShadow: `0 2px 12px rgba(0,0,0,.4)`,
        }}>
          <div style={{ color: sevColor(selected.sev), fontWeight: 700, marginBottom: 2 }}>{selected.type}</div>
          <div style={{ color: COLORS.text }}>{selected.name}</div>
          <div style={{ color: COLORS.muted, fontSize: 10, marginTop: 3 }}>Selected — see AI insights panel</div>
        </div>
      )}

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 12, right: 12,
        display: "flex", gap: 12, fontFamily: FONTS.mono, fontSize: 10,
        background: `${COLORS.surface}dd`, padding: "7px 12px",
        borderRadius: 8, border: `1px solid ${COLORS.border}`, backdropFilter: "blur(4px)",
      }}>
        {[["#ff3b5c","Critical"],["#ffb930","High"],["#4d9fff","Medium"],["#00ff88","Low"]].map(([c, l]) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: 5, color: COLORS.muted }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: c, boxShadow: `0 0 4px ${c}` }} />
            {l}
          </span>
        ))}
        <span style={{ display: "flex", alignItems: "center", gap: 5, color: COLORS.muted, marginLeft: 4, paddingLeft: 8, borderLeft: `1px solid ${COLORS.border}` }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: COLORS.green, boxShadow: `0 0 4px ${COLORS.green}` }} />
          LIVE
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, color: COLORS.muted }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: COLORS.blue, boxShadow: `0 0 4px ${COLORS.blue}` }} />
          CUSTOM
        </span>
      </div>

      <Tooltip alert={hovered} pos={pos} />
    </div>
  );
}