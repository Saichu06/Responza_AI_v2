import { useEffect, useState } from "react";
import Navbar from "./components/homepage/Navbar";
import Home from "./components/homepage/Home";
import Login from "./Login";
import Signup from "./Signup";
import Documentation from "./components/homepage/Documentation";
import DashboardPage from "./pages/DashboardPage";  // ← ADD THIS IMPORT

const css = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: #060d1a; color: #e8f0fe; font-family: 'Space Grotesk', sans-serif; overflow-x: hidden; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: #060d1a; }
::-webkit-scrollbar-thumb { background: #1a2d4a; border-radius: 2px; }

@keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn   { from { opacity:1; } to { opacity:0; pointer-events:none; } }
@keyframes scan     { 0% { transform:translateY(-100%); opacity:.7; } 100% { transform:translateY(100vh); opacity:0; } }
@keyframes fillBar  { from { width:0; } to { width:100%; } }
@keyframes pulse    { 0%,100%{ transform:scale(1); opacity:1; } 50%{ transform:scale(.85); opacity:.5; } }

#intro { position:fixed; inset:0; background:#060d1a; z-index:9999; display:flex; align-items:center; justify-content:center; flex-direction:column; }
#intro.done { animation: fadeIn .5s forwards; pointer-events:none; }
.intro-scanline { position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,#00ff88,transparent); animation: scan 1.4s ease-in forwards; }
.intro-logo { font-family:'Space Grotesk',sans-serif; font-size:40px; font-weight:700; color:#e8f0fe; letter-spacing:-1px; }
.intro-logo span { color:#00ff88; }
.intro-sub { font-family:'JetBrains Mono',monospace; font-size:11px; color:#4a6080; margin-top:8px; letter-spacing:2px; }
.intro-bar { width:200px; height:2px; background:#1a2d4a; border-radius:2px; margin-top:24px; overflow:hidden; }
.intro-fill { height:100%; background:#00ff88; width:0; animation: fillBar 1.3s .7s ease-out forwards; }
`;

function Intro({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2300);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div id="intro">
      <div className="intro-scanline" />
      <div className="intro-logo">RESPONZA<span>.AI</span></div>
      <div className="intro-sub">INITIALIZING SYSTEMS</div>
      <div className="intro-bar"><div className="intro-fill" /></div>
    </div>
  );
}

function StatusBar() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const utc = time.toUTCString().slice(-12, -4);
  const items = [
    { color: "#00ff88", text: "ALL SYSTEMS NOMINAL" },
    { color: "#ffb930", text: "47 ACTIVE ALERTS" },
    { color: "#4d9fff", text: "138 REGIONS MONITORED" },
    { color: "#00ff88", text: "AI CONFIDENCE: 98.4%" },
    { color: "#e8f0fe", text: `UTC: ${utc}` },
  ];

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 24,
      padding: "10px 48px",
      background: "rgba(0,0,0,.3)", borderBottom: "1px solid #1a2d4a",
      fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#4a6080",
      overflowX: "hidden", whiteSpace: "nowrap",
    }}>
      {items.map(({ color, text }) => (
        <div key={text} style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, animation: "pulse 2s infinite", flexShrink: 0 }} />
          {text}
        </div>
      ))}
    </div>
  );
}

function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid #1a2d4a", padding: "20px 48px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      fontSize: 12, color: "#4a6080", fontFamily: "'Space Grotesk', sans-serif",
    }}>
      <div style={{ fontWeight: 700, color: "#e8f0fe" }}>
        RESPONZA<span style={{ color: "#00ff88" }}>.AI</span>
      </div>
      <div>© 2026 Responza Intelligence Systems · All rights reserved</div>
      <div style={{ display: "flex", gap: 16 }}>
        {["Privacy", "Terms", "Contact"].map(l => (
          <span key={l} style={{ cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.color = "#00ff88"} onMouseLeave={(e) => e.currentTarget.style.color = "#4a6080"}>{l}</span>
        ))}
      </div>
    </footer>
  );
}

// App.jsx - Update the navbar condition
export default function App() {
  const [introDone, setIntroDone] = useState(false);
  const [page, setPage] = useState("home");
  const [scrollToSection, setScrollToSection] = useState(null);

  const handleNavigate = (targetPage, section = null) => {
    setPage(targetPage);
    setScrollToSection(section || null);
  };

  return (
    <>
      <style>{css}</style>
      {!introDone && <Intro onDone={() => setIntroDone(true)} />}
      
      {/* Navbar - HIDE on dashboard and auth pages */}
      {page !== "dashboard" && page !== "login" && page !== "signup" && (
        <Navbar currentPage={page} onNavigate={handleNavigate} />
      )}
      
      {/* StatusBar only on home page */}
      {page === "home" && <StatusBar />}
      
      {/* Page Rendering */}
      {page === "home" && <Home scrollToSection={scrollToSection} />}
      {page === "dashboard" && <DashboardPage setPage={setPage} />}  {/* ← Pass setPage */}
      {page === "login" && <Login setPage={setPage} />}
      {page === "signup" && <Signup setPage={setPage} />}
      {page === "documentation" && <Documentation />}
      
      {/* Footer only on home page */}
      {page === "home" && <Footer />}
    </>
  );
}