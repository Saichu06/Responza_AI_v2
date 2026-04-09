import { useState } from "react";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
`;

const INCIDENTS = [
  { id:1, x:770, y:135, type:"Earthquake", sev:"critical", mag:"6.8",   loc:"Tokyo, Japan",        color:"#ff3b5c" },
  { id:2, x:590, y:195, type:"Flood",      sev:"critical", mag:"Cat 3", loc:"Chennai, India",       color:"#ff3b5c" },
  { id:3, x:560, y:180, type:"Cyclone",    sev:"critical", mag:"Cat 4", loc:"Mumbai, India",        color:"#ff3b5c" },
  { id:4, x:110, y:150, type:"Wildfire",   sev:"high",     mag:"Lvl 4", loc:"San Francisco, USA",   color:"#ffb930" },
  { id:5, x:752, y:340, type:"Wildfire",   sev:"critical", mag:"Lvl 5", loc:"Sydney, Australia",    color:"#ff3b5c" },
  { id:6, x:742, y:125, type:"Typhoon",    sev:"critical", mag:"Cat 5", loc:"Shanghai, China",      color:"#ff3b5c" },
  { id:7, x:530, y:155, type:"Heatwave",   sev:"medium",   mag:"48°C",  loc:"Delhi, India",         color:"#4d9fff" },
  { id:8, x:450, y:90,  type:"Storm",      sev:"medium",   mag:"80mph", loc:"London, UK",           color:"#4d9fff" },
  { id:9, x:700, y:240, type:"Tsunami",    sev:"critical", mag:"Alert", loc:"Bali, Indonesia",      color:"#ff3b5c" },
];

const FILTERS = [
  { key: "all",      label: "ALL" },
  { key: "critical", label: "CRITICAL" },
  { key: "high",     label: "HIGH" },
  { key: "medium",   label: "MEDIUM" },
];

function Tooltip({ inc, pos }) {
  if (!inc) return null;
  return (
    <div style={{
      position: "fixed", left: pos.x + 12, top: pos.y - 40,
      background: "#0f1e35", border: "1px solid #1a2d4a", borderRadius: 10,
      padding: "12px 14px", fontSize: 12, pointerEvents: "none", zIndex: 999,
      minWidth: 160, fontFamily: "'Space Grotesk', sans-serif",
    }}>
      <div style={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4, color: inc.color }}>{inc.type}</div>
      <div style={{ color: "#4a6080", marginBottom: 4 }}>{inc.loc}</div>
      <div style={{ color: "#4a6080" }}>Magnitude: {inc.mag}</div>
    </div>
  );
}

export default function MapHero() {
  const [filter, setFilter]   = useState("all");
  const [hovered, setHovered] = useState(null);
  const [tooltipPos, setPos]  = useState({ x: 0, y: 0 });

  const visible = filter === "all" ? INCIDENTS : INCIDENTS.filter(i => i.sev === filter);

  return (
    <section style={{ background: "rgba(0,0,0,.2)", borderTop: "1px solid #1a2d4a", borderBottom: "1px solid #1a2d4a", padding: "60px 48px", fontFamily: "'Space Grotesk', sans-serif" }}>
      <style>{css}</style>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "inline-block", background: "rgba(77,159,255,.08)", border: "1px solid rgba(77,159,255,.2)", color: "#4d9fff", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", padding: "4px 10px", borderRadius: 5, letterSpacing: 1.5, marginBottom: 16 }}>
            LIVE MONITORING
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -.5, color: "#e8f0fe", marginBottom: 8 }}>Global Incident Map</h2>
          <p style={{ color: "#4a6080", fontSize: 14 }}>{visible.length} active incidents · Real-time updates</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>

          {/* Map */}
          <div style={{ background: "#0c1628", border: "1px solid #1a2d4a", borderRadius: 14, overflow: "hidden", position: "relative" }}>

            {/* Filters */}
            <div style={{ position: "absolute", top: 14, left: 14, zIndex: 10, display: "flex", gap: 8 }}>
              {FILTERS.map(({ key, label }) => (
                <button key={key} onClick={() => setFilter(key)} style={{
                  padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                  fontFamily: "'JetBrains Mono', monospace", cursor: "pointer", letterSpacing: .5,
                  transition: "all .18s",
                  background: filter === key ? "rgba(77,159,255,.15)" : "transparent",
                  color:      filter === key ? "#4d9fff" : "#4a6080",
                  border:     `1px solid ${filter === key ? "rgba(77,159,255,.3)" : "#1a2d4a"}`,
                }}>
                  {label}
                </button>
              ))}
            </div>

            {/* SVG World Map */}
            <svg width="100%" viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="mapbg" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="#0d1e35" />
                  <stop offset="100%" stopColor="#060d1a" />
                </radialGradient>
              </defs>
              <rect width="1000" height="500" fill="url(#mapbg)" />

              {/* Grid */}
              <g stroke="rgba(77,159,255,.06)" strokeWidth=".5">
                {[125,250,375].map(v => <line key={v} x1="0" y1={v} x2="1000" y2={v} />)}
                {[250,500,750].map(v => <line key={v} x1={v} y1="0" x2={v} y2="500" />)}
              </g>

              {/* Landmasses */}
              <g fill="rgba(20,50,100,.7)" stroke="rgba(77,159,255,.25)" strokeWidth=".8">
                <path d="M90,60 L180,50 L220,80 L240,120 L220,160 L190,190 L160,195 L130,180 L100,150 L70,120 L60,90 Z" />
                <path d="M165,220 L210,210 L240,240 L250,290 L240,340 L215,360 L185,355 L162,330 L150,290 L148,250 Z" />
                <path d="M435,60 L490,55 L510,80 L505,110 L485,120 L462,115 L440,100 L432,80 Z" />
                <path d="M440,140 L510,135 L535,165 L540,220 L530,280 L510,320 L480,335 L455,325 L435,295 L420,250 L415,200 L420,165 Z" />
                <path d="M415,70 L428,67 L432,80 L425,90 L412,88 Z" />
                <path d="M510,55 L680,45 L760,55 L800,80 L820,110 L810,145 L780,160 L740,155 L700,145 L660,150 L630,140 L600,120 L565,100 L535,85 L510,80 Z" />
                <path d="M570,145 L620,138 L640,165 L635,200 L615,215 L590,210 L568,190 L560,165 Z" />
                <path d="M640,165 L700,160 L730,180 L735,210 L715,225 L690,215 L665,195 L642,185 Z" />
                <path d="M680,220 L710,215 L730,230 L725,248 L700,252 L678,240 Z" />
                <path d="M740,218 L770,215 L780,232 L765,245 L742,240 Z" />
                <path d="M750,90 L768,85 L775,100 L768,118 L750,120 L740,105 Z" />
                <path d="M690,295 L780,285 L830,310 L840,355 L820,390 L775,400 L730,390 L695,360 L680,325 Z" />
                <path d="M260,20 L310,18 L330,40 L320,65 L290,70 L262,55 Z" />
                <path d="M450,30 L480,25 L492,45 L480,60 L460,58 L445,45 Z" />
              </g>

              {/* Incident Markers */}
              {visible.map(inc => (
                <g key={inc.id} style={{ cursor: "pointer" }}
                  onMouseMove={(e) => { setHovered(inc); setPos({ x: e.clientX, y: e.clientY }); }}
                  onMouseLeave={() => setHovered(null)}>
                  <circle cx={inc.x} cy={inc.y} r="6" fill="none" stroke={inc.color} strokeWidth="1.5">
                    <animate attributeName="r"       values="6;16;6"    dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values=".8;0;.8"   dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={inc.x} cy={inc.y} r="5" fill={inc.color} stroke="#fff" strokeWidth="1.5" />
                </g>
              ))}
            </svg>

            {/* Stats bar */}
            <div style={{ background: "rgba(0,0,0,.4)", borderTop: "1px solid #1a2d4a", padding: "10px 16px", display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
              <span style={{ color: "#4a6080" }}>Data Sources: 12 active</span>
              <div style={{ display: "flex", gap: 16 }}>
                {[{ c:"#ff3b5c", l:"Critical" },{ c:"#ffb930", l:"High" },{ c:"#4d9fff", l:"Medium" }].map(({ c, l }) => (
                  <span key={l} style={{ display: "flex", alignItems: "center", gap: 6, color: "#4a6080" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: c, flexShrink: 0 }} />
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Incident Sidebar */}
          <div>
            <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "#4a6080", marginBottom: 10, letterSpacing: .5 }}>ACTIVE INCIDENTS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 420, overflowY: "auto" }}>
              {visible.map(inc => {
                const bg   = inc.sev === "critical" ? "rgba(255,59,92,.15)"  : inc.sev === "high" ? "rgba(255,185,48,.15)" : "rgba(77,159,255,.15)";
                const text = inc.sev === "critical" ? "#ff3b5c"              : inc.sev === "high" ? "#ffb930"              : "#4d9fff";
                return (
                  <div key={inc.id} style={{ background: "#0c1628", border: "1px solid #1a2d4a", borderRadius: 10, padding: 12, cursor: "pointer", transition: "all .18s", fontFamily: "'Space Grotesk', sans-serif" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#4d9fff"; e.currentTarget.style.transform = "translateX(3px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1a2d4a"; e.currentTarget.style.transform = "translateX(0)"; }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, fontFamily: "'JetBrains Mono', monospace", color: inc.color }}>{inc.type}</div>
                    <div style={{ fontSize: 12, color: "#4a6080", marginBottom: 6 }}>{inc.loc}</div>
                    <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", background: bg, color: text }}>
                      {inc.sev.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 10, color: "#4a6080", fontFamily: "'JetBrains Mono', monospace", marginLeft: 6 }}>{inc.mag}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      <Tooltip inc={hovered} pos={tooltipPos} />
    </section>
  );
}