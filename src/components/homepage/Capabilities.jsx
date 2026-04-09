import { useState, useEffect, useRef } from "react";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
@keyframes stepIn { from { opacity:.3; transform:translateX(0); } to { opacity:1; transform:translateX(4px); } }
`;

const STEPS = [
  { title: "Real-Time Detection",  desc: "Sub-second event detection across 200+ global data streams",                     tag: "0.8s latency"  },
  { title: "AI Decision Engine",   desc: "GPT-class reasoning maps optimal response actions in under 3 seconds",           tag: "3s response"   },
  { title: "Geo Mapping",          desc: "Precision-layered geospatial intelligence with satellite overlay",               tag: "1m resolution" },
  { title: "Resource Allocation",  desc: "Dynamic routing of rescue teams and emergency supply chains",                    tag: "Auto-dispatch" },
  { title: "Predictive Analysis",  desc: "24-hour ahead risk forecasting using climate models",                            tag: "24h forecast"  },
  { title: "Alert Broadcasting",   desc: "Multi-channel push alerts to agencies, responders and civilians worldwide",      tag: "Global reach"  },
];

export default function Capabilities() {
  const [activeCount, setActiveCount] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        let i = 0;
        const interval = setInterval(() => {
          i++;
          setActiveCount(i);
          if (i >= STEPS.length) clearInterval(interval);
        }, 350);
      }
    }, { threshold: 0.2 });

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} style={{ background: "#060d1a", padding: "60px 48px", fontFamily: "'Space Grotesk', sans-serif" }}>
      <style>{css}</style>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "inline-block", background: "rgba(77,159,255,.08)", border: "1px solid rgba(77,159,255,.2)", color: "#4d9fff", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", padding: "4px 10px", borderRadius: 5, letterSpacing: 1.5, marginBottom: 16 }}>
            PLATFORM CAPABILITIES
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -.5, color: "#e8f0fe", marginBottom: 8 }}>How Intelligence Flows</h2>
          <p style={{ color: "#4a6080", fontSize: 14 }}>Each layer activates the next — watch the system come alive</p>
        </div>

        {/* Steps Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {STEPS.map((step, i) => {
            const active = i < activeCount;
            return (
              <div key={step.title} style={{
                background: active ? "#0c1628" : "transparent",
                border: `1px solid ${active ? "#00ff88" : "#1a2d4a"}`,
                borderRadius: 12,
                padding: 18,
                transition: "all .35s ease",
                opacity: active ? 1 : .35,
                transform: active ? "translateX(4px)" : "translateX(0)",
              }}>
                {/* Number badge */}
                <div style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: active ? "#00ff88" : "#1a2d4a",
                  color: active ? "#000" : "#4a6080",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                  marginBottom: 10, transition: "all .3s",
                }}>
                  {i + 1}
                </div>

                <div style={{ fontSize: 14, fontWeight: 600, color: active ? "#e8f0fe" : "#4a6080", marginBottom: 6, transition: "color .3s" }}>
                  {step.title}
                </div>

                <div style={{ fontSize: 12, color: "#4a6080", lineHeight: 1.55 }}>
                  {step.desc}
                </div>

                {active && (
                  <span style={{
                    display: "inline-block", marginTop: 8, padding: "2px 8px",
                    background: "rgba(0,255,136,.07)", color: "#00ff88",
                    fontSize: 10, fontFamily: "'JetBrains Mono', monospace", borderRadius: 4,
                  }}>
                    {step.tag}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}