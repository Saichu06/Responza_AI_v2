import Navbar       from "../components/homepage/Navbar";
import Hero         from "../components/homepage/Hero";
import MapHero      from "../components/homepage/MapHero";
import VideoSection from "../components/homepage/VideoSection";
import Capabilities from "../components/homepage/Capabilities";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Syne:wght@400;600;800&family=JetBrains+Mono:wght@400;500&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: #0f172a; color: #e2e8f0; overflow-x: hidden; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: #22c55e44; }
@keyframes pulse { 0%,100%{ opacity:1; transform:scale(1); } 50%{ opacity:.5; transform:scale(.85); } }
@keyframes footerGlow { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
`;

export default function HomePage({ onGoDashboard }) {
  return (
    <>
      <style>{css}</style>

      <Navbar onGoDashboard={onGoDashboard} />
      <Hero onGoDashboard={onGoDashboard} />
      <MapHero />
      <VideoSection />
      <Capabilities />

      {/* Footer */}
      <footer style={{
        background: "#060d18",
        borderTop: "1px solid rgba(34,197,94,0.12)",
        padding: "32px 60px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Glow line */}
        <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: "linear-gradient(90deg,transparent,rgba(34,197,94,0.4),rgba(56,189,248,0.4),transparent)", animation: "footerGlow 4s ease-in-out infinite" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          {/* Brand */}
          <div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: 18, color: "#f1f5f9", marginBottom: 4 }}>
              RESPONZA<span style={{ color: "#22c55e" }}>.AI</span>
            </div>
            <div style={{ fontSize: 12, color: "#334155", fontFamily: "'JetBrains Mono',monospace" }}>
              © 2026 Responza Intelligence Systems
            </div>
          </div>

          {/* Center — hackathon badge */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, fontFamily: "'Orbitron',monospace", color: "#38bdf8", fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>
              COMPUTEX 1.0
            </div>
            <div style={{ fontSize: 10, color: "#1e293b", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1 }}>
              HACKATHON SUBMISSION · TEAM RESPONZA
            </div>
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: 20 }}>
            {["Privacy", "Terms", "Contact"].map((l) => (
              <span key={l} style={{ cursor: "pointer", fontSize: 12, color: "#334155", fontFamily: "'Syne',sans-serif", transition: "color 0.18s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#22c55e"}
                onMouseLeave={e => e.currentTarget.style.color = "#334155"}>
                {l}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}