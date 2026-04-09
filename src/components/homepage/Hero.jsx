import { useState, useEffect } from "react";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
@keyframes fadeUp    { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
@keyframes pulse     { 0%,100%{ opacity:1; transform:scale(1); } 50%{ opacity:.6; transform:scale(.92); } }
@keyframes orbit     { from{ transform:rotate(0deg)   translateX(110px) rotate(0deg);   } to{ transform:rotate(360deg)  translateX(110px) rotate(-360deg);  } }
@keyframes orbit2    { from{ transform:rotate(120deg) translateX(145px) rotate(-120deg);} to{ transform:rotate(480deg)  translateX(145px) rotate(-480deg); } }
@keyframes orbit3    { from{ transform:rotate(240deg) translateX(175px) rotate(-240deg);} to{ transform:rotate(600deg)  translateX(175px) rotate(-600deg); } }
@keyframes ring-spin { from{ stroke-dashoffset:0; } to{ stroke-dashoffset:-220; } }
@keyframes radar     { from{ transform:rotate(0deg); } to{ transform:rotate(360deg); } }
@keyframes glitch    { 0%,95%,100%{ clip-path:none; transform:none; } 96%{ clip-path:polygon(0 20%,100% 20%,100% 40%,0 40%); transform:translate(-2px,1px); } 98%{ clip-path:polygon(0 60%,100% 60%,100% 80%,0 80%); transform:translate(2px,-1px); } }
@keyframes slideRight{ from{ width:0; } to{ width:100%; } }
@keyframes intro-scan{ 0%{ transform:translateY(-100%); opacity:.6; } 100%{ transform:translateY(100vh); opacity:0; } }
@keyframes introDone { from{ opacity:1; } to{ opacity:0; pointer-events:none; } }
.dot-orbit{ position:absolute; top:50%; left:50%; width:8px; height:8px; margin:-4px; border-radius:50%; }
.dot-orbit.d1{ background:#ff3b5c; animation:orbit  5s linear infinite; box-shadow:0 0 8px #ff3b5c; }
.dot-orbit.d2{ background:#ffb930; animation:orbit2 7s linear infinite; box-shadow:0 0 8px #ffb930; }
.dot-orbit.d3{ background:#4d9fff; animation:orbit3 9s linear infinite; box-shadow:0 0 8px #4d9fff; }
.orbit-ring{ position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); }
.orbit-ring svg circle{ animation:ring-spin 10s linear infinite; }
#radar-sweep-g{ transform-origin:170px 170px; animation:radar 3s linear infinite; }
`;

function GlobeWidget() {
  return (
    <div style={{ position: "relative", width: 340, height: 340, margin: "0 auto" }}>
      {/* Orbit rings */}
      {[
        { size: 220, color: "rgba(0,255,136,.12)", dash: "4 6" },
        { size: 290, color: "rgba(255,59,92,.1)",  dash: "2 8" },
        { size: 350, color: "rgba(77,159,255,.07)", dash: "6 10" },
      ].map(({ size, color, dash }, i) => (
        <div key={i} className="orbit-ring" style={{ width: size, height: size, marginLeft: -size/2, marginTop: -size/2 }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={size/2} cy={size/2} r={size/2 - 10} fill="none" stroke={color} strokeWidth="1" strokeDasharray={dash} />
          </svg>
        </div>
      ))}
      <div className="dot-orbit d1" />
      <div className="dot-orbit d2" />
      <div className="dot-orbit d3" />

      {/* SVG Globe */}
      <svg width="100%" height="100%" viewBox="0 0 340 340" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="ggrad" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#1a3860" />
            <stop offset="60%" stopColor="#0c1e38" />
            <stop offset="100%" stopColor="#060d1a" />
          </radialGradient>
          <radialGradient id="glow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(0,255,136,.12)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <clipPath id="gc"><circle cx="170" cy="170" r="130" /></clipPath>
        </defs>
        <circle cx="170" cy="170" r="145" fill="url(#glow)" opacity=".7" />
        <circle cx="170" cy="170" r="130" fill="url(#ggrad)" stroke="rgba(0,255,136,.2)" strokeWidth="1" />
        <g clipPath="url(#gc)" opacity=".2">
          <ellipse cx="170" cy="170" rx="40"  ry="130" fill="none" stroke="#4d9fff" strokeWidth=".5" />
          <ellipse cx="170" cy="170" rx="80"  ry="130" fill="none" stroke="#4d9fff" strokeWidth=".5" />
          <ellipse cx="170" cy="170" rx="115" ry="130" fill="none" stroke="#4d9fff" strokeWidth=".5" />
          <line x1="40" y1="120" x2="300" y2="120" stroke="#4d9fff" strokeWidth=".5" />
          <line x1="40" y1="170" x2="300" y2="170" stroke="#4d9fff" strokeWidth=".5" />
          <line x1="40" y1="220" x2="300" y2="220" stroke="#4d9fff" strokeWidth=".5" />
        </g>
        <g clipPath="url(#gc)" fill="rgba(30,80,140,.55)" stroke="rgba(77,159,255,.3)" strokeWidth=".5">
          <path d="M80,90 L130,85 L145,100 L140,130 L120,145 L90,140 L70,125 L60,90 Z" />
          <path d="M115,155 L140,150 L150,175 L140,210 L120,215 L105,200 L100,175 Z" />
          <path d="M170,80 L200,78 L210,95 L205,115 L195,110 L185,95 Z" />
          <path d="M175,118 L205,118 L215,150 L210,190 L195,205 L178,200 L168,175 L162,150 Z" />
          <path d="M205,75 L260,72 L280,90 L285,115 L265,130 L240,125 L220,115 L208,100 Z" />
          <path d="M248,185 L280,180 L290,200 L280,218 L255,220 L242,205 Z" />
          <path d="M750,90 L768,85 L775,100 L768,118 L750,120 L740,105 Z" />
        </g>
        <g clipPath="url(#gc)">
          <g id="radar-sweep-g">
            <path d="M170,170 L300,170 A130,130 0 0,0 170,40 Z" fill="url(#glow)" opacity=".35" />
          </g>
        </g>
        {/* Incident blips */}
        {[
          { cx:258, cy:110, dur:"2s",   color:"#ff3b5c" },
          { cx:218, cy:150, dur:"2.3s", color:"#ff3b5c" },
          { cx:208, cy:143, dur:"1.8s", color:"#ff3b5c" },
          { cx:84,  cy:118, dur:"2.8s", color:"#ffb930" },
          { cx:252, cy:118, dur:"2.1s", color:"#ff3b5c" },
          { cx:267, cy:202, dur:"2.5s", color:"#ff3b5c" },
          { cx:245, cy:178, dur:"1.5s", color:"#ff3b5c" },
        ].map(({ cx, cy, dur, color }, i) => (
          <g key={i} clipPath="url(#gc)">
            <circle cx={cx} cy={cy} r="4" fill="none" stroke={color} strokeWidth="1.5">
              <animate attributeName="r" values="4;10;4" dur={dur} repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0;1" dur={dur} repeatCount="indefinite" />
            </circle>
            <circle cx={cx} cy={cy} r="3" fill={color} />
          </g>
        ))}
        <circle cx="170" cy="170" r="130" fill="none" stroke="rgba(0,255,136,.3)" strokeWidth="1.5" strokeDasharray="3 5" />
      </svg>
    </div>
  );
}

function SystemPanel() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const rows = [
    { label: "Active Alerts",      val: "47",    color: "#ff3b5c" },
    { label: "Monitored Regions",  val: "138",   color: "#e8f0fe" },
    { label: "AI Confidence",      val: "98.4%", color: "#00ff88" },
    { label: "Data Sources",       val: "12 Active" },
    { label: "Last Update",        val: time.toLocaleTimeString(), color: "#ffb930" },
  ];

  return (
    <div style={{ background: "#0c1628", border: "1px solid #1a2d4a", borderRadius: 14, padding: 20, marginTop: 18 }}>
      {rows.map(({ label, val, color }) => (
        <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1a2d4a" }}>
          <span style={{ fontSize: 13, color: "#4a6080", fontFamily: "'Space Grotesk', sans-serif" }}>{label}</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 500, color: color || "#e8f0fe" }}>{val}</span>
        </div>
      ))}
    </div>
  );
}

function useCountUp(target, delay = 0, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const t0 = Date.now();
      const tick = () => {
        const p = Math.min(1, (Date.now() - t0) / duration);
        const ease = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(target * ease));
        if (p < 1) requestAnimationFrame(tick);
      };
      tick();
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, delay, duration]);
  return val;
}

export default function Hero() {
  const alerts   = useCountUp(47,    800);
  const regions  = useCountUp(138,   1000);
  const response = useCountUp(830,   1200);

  return (
    <section style={{ background: "#060d1a", padding: "70px 48px 60px", fontFamily: "'Space Grotesk', sans-serif" }}>
      <style>{css}</style>
      <div style={{ maxWidth: 1300, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 380px", gap: 48, alignItems: "center" }}>

        {/* Left */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,255,136,.08)", border: "1px solid rgba(0,255,136,.2)", borderRadius: 6, padding: "5px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#00ff88", letterSpacing: 1, marginBottom: 24, animation: "fadeUp .6s .3s both" }}>
            <span style={{ width: 6, height: 6, background: "#00ff88", borderRadius: "50%", animation: "pulse 1.5s infinite" }} />
            LIVE · GLOBAL INCIDENT MONITORING
          </div>

          <h1 style={{ fontSize: 52, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.05, marginBottom: 20, color: "#e8f0fe", animation: "fadeUp .6s .4s both" }}>
            Real-Time Disaster<br />
            <span style={{ color: "#00ff88", animation: "glitch 6s 2s infinite", display: "inline-block" }}>Response Intelligence</span>
          </h1>

          <p style={{ fontSize: 15, lineHeight: 1.65, color: "#4a6080", maxWidth: 420, marginBottom: 32, animation: "fadeUp .6s .5s both" }}>
            AI-powered decisions when every second matters. Geo-intelligence, predictive response, zero delay. Protecting lives across 138+ monitored regions.
          </p>

          <div style={{ display: "flex", gap: 14, animation: "fadeUp .6s .6s both" }}>
            {[
              { label: "Launch Demo",       bg: "#00ff88", color: "#000", border: "none" },
              { label: "View Documentation",bg: "transparent", color: "#e8f0fe", border: "1px solid #1a2d4a" },
            ].map(({ label, bg, color, border }) => (
              <button key={label} style={{ padding: "12px 28px", fontSize: 14, fontWeight: 700, borderRadius: 10, fontFamily: "'Space Grotesk', sans-serif", cursor: "pointer", background: bg, color, border, transition: "all .2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; if (bg === "transparent") { e.currentTarget.style.borderColor = "#00ff88"; e.currentTarget.style.color = "#00ff88"; } else { e.currentTarget.style.boxShadow = "0 0 24px rgba(0,255,136,.25)"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; if (bg === "transparent") { e.currentTarget.style.borderColor = "#1a2d4a"; e.currentTarget.style.color = "#e8f0fe"; } else { e.currentTarget.style.boxShadow = "none"; } }}
              >{label}</button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 32, marginTop: 40, animation: "fadeUp .6s .7s both" }}>
            {[
              { val: alerts,                 label: "ACTIVE ALERTS" },
              { val: regions,                label: "REGIONS COVERED" },
              { val: response, suffix: "ms", label: "AVG RESPONSE TIME" },
            ].map(({ val, label, suffix }) => (
              <div key={label}>
                <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#e8f0fe" }}>
                  {val}{suffix && <span style={{ fontSize: 14 }}>{suffix}</span>}
                </div>
                <div style={{ fontSize: 11, color: "#4a6080", marginTop: 2, letterSpacing: .5 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div style={{ animation: "fadeUp .7s .4s both" }}>
          <GlobeWidget />
          <SystemPanel />
        </div>

      </div>
    </section>
  );
}