import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "how-it-works", label: "How It Works" },
  { id: "features", label: "Key Features" },
  { id: "disaster-types", label: "Disaster Types" },
  { id: "integration", label: "Integration" },
  { id: "faq", label: "FAQ" },
  { id: "support", label: "Support" },
];

const STATS = [
  { value: "94.7%", label: "AI Accuracy" },
  { value: "0.8s", label: "Alert Speed" },
  { value: "200+", label: "Data Streams" },
  { value: "138+", label: "Regions" },
];

const FEATURES = [
  {
    icon: "◎",
    title: "Real-Time Detection",
    desc: "Sub-second event detection across 200+ global data streams with automatic severity classification.",
  },
  {
    icon: "◈",
    title: "AI Decision Engine",
    desc: "Maps optimal response actions in under 3 seconds using reinforcement learning models.",
  },
  {
    icon: "◉",
    title: "Geo Mapping",
    desc: "Precision-layered geospatial intelligence with 1m resolution satellite imagery.",
  },
  {
    icon: "◐",
    title: "Resource Allocation",
    desc: "Dynamic routing of rescue teams and emergency supplies via constraint optimization.",
  },
  {
    icon: "◑",
    title: "Multi-Source Data",
    desc: "Satellite feeds, IoT sensors, and government data fused into a single truth layer.",
  },
  {
    icon: "◒",
    title: "Predictive Analysis",
    desc: "24-hour ahead risk forecasting using ensemble climate models and historical patterns.",
  },
];

const DISASTERS = [
  "Earthquake",
  "Flood",
  "Storm",
  "Tsunami",
  "Wildfire",
  "Cyclone",
  "Landslide",
  "Heatwave",
  "Blizzard",
];

const FAQS = [
  {
    q: "How accurate is the AI prediction system?",
    a: "Our AI models achieve 94.7% accuracy in predicting disaster paths within 24-hour windows, validated across 3 years of retrospective disaster data.",
  },
  {
    q: "What data sources are integrated?",
    a: "We integrate 200+ global data streams including satellites, IoT sensors, weather stations, and government agencies spanning 138 regions.",
  },
  {
    q: "How fast is the response time?",
    a: "Sub-second detection with AI decision engine response in under 3 seconds. Critical alerts are dispatched within 0.8 seconds of event confirmation.",
  },
  {
    q: "Is the platform secure?",
    a: "Yes. Enterprise-grade AES-256 encryption at rest and in transit. SOC 2 Type II certified with annual third-party penetration testing.",
  },
  {
    q: "Can I integrate with my existing emergency system?",
    a: "Yes. We provide REST APIs, webhooks, and SDKs (Python, Node.js, Java) for seamless integration with CAD, GIS, and dispatch systems.",
  },
];

function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observers = ids.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: "-30% 0px -60% 0px" },
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, [ids]);
  return active;
}

function Section({ id, children }) {
  return (
    <section id={id} style={{ marginBottom: "72px", scrollMarginTop: "80px" }}>
      {children}
    </section>
  );
}

function SectionHeading({ label }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "32px",
      }}
    >
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "11px",
          color: "#22c55e",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          opacity: 0.7,
        }}
      >
        //
      </span>
      <h2
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "26px",
          fontWeight: "700",
          color: "#f1f5f9",
          margin: 0,
          letterSpacing: "-0.3px",
        }}
      >
        {label}
      </h2>
      <div
        style={{
          flex: 1,
          height: "1px",
          background: "linear-gradient(to right, #1e293b, transparent)",
        }}
      />
    </div>
  );
}

export default function Documentation() {
  const active = useActiveSection(NAV_ITEMS.map((n) => n.id));
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      style={{
        background: "#080d14",
        minHeight: "100vh",
        fontFamily: "'DM Sans', sans-serif",
        position: "relative",
      }}
    >
      {/* Dot grid background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, #1a2537 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.4,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Green ambient glow */}
      <div
        style={{
          position: "fixed",
          top: "-200px",
          right: "-100px",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Main Content - No top bar since Navbar handles it */}
      <div
        style={{
          display: "flex",
          maxWidth: "1240px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
          paddingTop: "20px",
        }}
      >
        {/* Sidebar */}
        <nav
          style={{
            width: "220px",
            flexShrink: 0,
            position: "sticky",
            top: "100px",
            height: "fit-content",
            paddingTop: "48px",
            paddingLeft: "24px",
            paddingRight: "16px",
          }}
        >
          <p
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "10px",
              color: "#334155",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "20px",
            }}
          >
            On this page
          </p>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                background: "none",
                border: "none",
                padding: "7px 10px",
                marginBottom: "2px",
                borderRadius: "6px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13.5px",
                fontWeight: active === item.id ? "500" : "400",
                color: active === item.id ? "#22c55e" : "#4b5563",
                cursor: "pointer",
                transition: "all 0.15s ease",
                borderLeft:
                  active === item.id
                    ? "2px solid #22c55e"
                    : "2px solid transparent",
                paddingLeft: active === item.id ? "12px" : "10px",
              }}
              onMouseEnter={(e) => {
                if (active !== item.id) e.currentTarget.style.color = "#94a3b8";
              }}
              onMouseLeave={(e) => {
                if (active !== item.id) e.currentTarget.style.color = "#4b5563";
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Main content */}
        <main style={{ flex: 1, padding: "48px 56px 120px 56px" }}>
          {/* Page title */}
          <div style={{ marginBottom: "64px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "11px",
                  color: "#22c55e",
                  letterSpacing: "0.15em",
                }}
              >
                v2.4.1
              </span>
              <span
                style={{
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  borderRadius: "4px",
                  padding: "2px 8px",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "10px",
                  color: "#22c55e",
                  letterSpacing: "0.1em",
                }}
              >
                STABLE
              </span>
            </div>
            <h1
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "48px",
                fontWeight: "800",
                color: "#f1f5f9",
                margin: "0 0 16px",
                lineHeight: 1.1,
                letterSpacing: "-1px",
              }}
            >
              Platform
              <br />
              <span style={{ color: "#22c55e" }}>Documentation</span>
            </h1>
            <p
              style={{
                fontSize: "16px",
                color: "#64748b",
                lineHeight: "1.7",
                maxWidth: "560px",
                margin: 0,
              }}
            >
              Everything you need to understand, integrate, and operate the
              RESPONZA.AI disaster response intelligence platform.
            </p>
          </div>

          {/* Stats bar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1px",
              background: "#0f1923",
              border: "1px solid #0f1923",
              borderRadius: "12px",
              overflow: "hidden",
              marginBottom: "72px",
            }}
          >
            {STATS.map((s) => (
              <div
                key={s.label}
                style={{
                  background: "#0b1320",
                  padding: "20px 24px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#22c55e",
                    marginBottom: "4px",
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "11px",
                    color: "#4b5563",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Overview */}
          <Section id="overview">
            <SectionHeading label="Overview" />
            <p
              style={{
                fontSize: "15px",
                color: "#94a3b8",
                lineHeight: "1.8",
                marginBottom: "32px",
                maxWidth: "680px",
              }}
            >
              RESPONZA.AI is a government-grade disaster response intelligence
              platform that helps emergency services respond faster and more
              effectively to natural disasters. Our system processes real-time
              data from multiple sources to provide actionable insights when
              every second counts.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "16px",
              }}
            >
              {[
                {
                  icon: "⬡",
                  label: "Real-Time Alerts",
                  sub: "Sub-second detection",
                },
                {
                  icon: "⬢",
                  label: "AI-Powered",
                  sub: "Smart decision engine",
                },
                {
                  icon: "⬣",
                  label: "Global Coverage",
                  sub: "138+ active regions",
                },
              ].map((c) => (
                <div
                  key={c.label}
                  style={{
                    background: "#0b1320",
                    border: "1px solid #0f1923",
                    borderRadius: "10px",
                    padding: "20px",
                    transition: "border-color 0.2s, transform 0.2s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(34,197,94,0.25)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#0f1923";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontSize: "22px",
                      color: "#22c55e",
                      marginBottom: "10px",
                    }}
                  >
                    {c.icon}
                  </div>
                  <div
                    style={{
                      color: "#e2e8f0",
                      fontWeight: "500",
                      fontSize: "14px",
                      marginBottom: "4px",
                    }}
                  >
                    {c.label}
                  </div>
                  <div
                    style={{
                      color: "#4b5563",
                      fontSize: "12px",
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    {c.sub}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* How It Works */}
          <Section id="how-it-works">
            <SectionHeading label="How It Works" />
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {[
                {
                  n: "01",
                  title: "Data Collection",
                  body: "We aggregate data from 200+ global sources including satellites, IoT sensors, weather stations, and government agencies — unified into a single streaming pipeline.",
                },
                {
                  n: "02",
                  title: "AI Analysis",
                  body: "Our AI engine processes incoming data in real-time, identifying patterns and predicting disaster paths with 94.7% accuracy using transformer-based sequence models.",
                },
                {
                  n: "03",
                  title: "Alert & Response",
                  body: "Critical alerts are dispatched within 0.8 seconds with recommended response actions, resource allocation plans, and estimated impact zones.",
                },
              ].map((step, i) => (
                <div
                  key={step.n}
                  style={{
                    display: "flex",
                    gap: "24px",
                    padding: "28px 0",
                    borderBottom: i < 2 ? "1px solid #0f1923" : "none",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(34,197,94,0.02)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontSize: "42px",
                      fontWeight: "800",
                      color: "#0f1923",
                      lineHeight: 1,
                      flexShrink: 0,
                      width: "64px",
                      paddingTop: "2px",
                    }}
                  >
                    {step.n}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: "600",
                        fontSize: "18px",
                        color: "#f1f5f9",
                        margin: "0 0 8px",
                      }}
                    >
                      {step.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#64748b",
                        lineHeight: "1.7",
                        margin: 0,
                      }}
                    >
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Key Features */}
          <Section id="features">
            <SectionHeading label="Key Features" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "16px",
              }}
            >
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  style={{
                    background: "#0b1320",
                    border: "1px solid #0f1923",
                    borderRadius: "10px",
                    padding: "20px 22px",
                    transition: "border-color 0.2s, background 0.2s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(34,197,94,0.2)";
                    e.currentTarget.style.background = "#0d1826";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#0f1923";
                    e.currentTarget.style.background = "#0b1320";
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "18px",
                      color: "#22c55e",
                      marginBottom: "12px",
                    }}
                  >
                    {f.icon}
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "#e2e8f0",
                      margin: "0 0 6px",
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#4b5563",
                      lineHeight: "1.6",
                      margin: 0,
                    }}
                  >
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* Disaster Types */}
          <Section id="disaster-types">
            <SectionHeading label="Disaster Types" />
            <p
              style={{
                fontSize: "14px",
                color: "#64748b",
                lineHeight: "1.7",
                marginBottom: "24px",
              }}
            >
              The platform supports detection, prediction, and response
              coordination for the following event categories:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {DISASTERS.map((d) => (
                <span
                  key={d}
                  style={{
                    background: "#0b1320",
                    border: "1px solid #0f1923",
                    borderRadius: "6px",
                    padding: "6px 14px",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "12px",
                    color: "#64748b",
                    transition: "all 0.15s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#22c55e";
                    e.currentTarget.style.borderColor = "rgba(34,197,94,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#64748b";
                    e.currentTarget.style.borderColor = "#0f1923";
                  }}
                >
                  {d}
                </span>
              ))}
            </div>
          </Section>

          {/* Integration */}
          <Section id="integration">
            <SectionHeading label="Integration" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "12px",
                marginBottom: "28px",
              }}
            >
              {[
                { icon: "▣", label: "Mobile App", sub: "iOS & Android" },
                {
                  icon: "▤",
                  label: "Web Dashboard",
                  sub: "Real-time monitoring",
                },
                { icon: "▥", label: "REST API", sub: "Enterprise integration" },
                {
                  icon: "▦",
                  label: "SMS Alerts",
                  sub: "Emergency notifications",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: "#0b1320",
                    border: "1px solid #0f1923",
                    borderRadius: "10px",
                    padding: "18px 14px",
                    textAlign: "center",
                    transition: "border-color 0.2s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(34,197,94,0.2)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "#0f1923")
                  }
                >
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "20px",
                      color: "#22c55e",
                      marginBottom: "10px",
                    }}
                  >
                    {item.icon}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#e2e8f0",
                      marginBottom: "4px",
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "10px",
                      color: "#334155",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {item.sub}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                background: "#0b1320",
                border: "1px solid #0f1923",
                borderRadius: "10px",
                padding: "20px 24px",
              }}
            >
              <p
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "11px",
                  color: "#334155",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Quick integration
              </p>
              <code
                style={{
                  display: "block",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "13px",
                  color: "#22c55e",
                  lineHeight: "1.8",
                  background: "#060b11",
                  padding: "14px 16px",
                  borderRadius: "6px",
                  border: "1px solid #0f1923",
                }}
              >
                <span style={{ color: "#334155" }}>$ </span>curl -X POST
                https://api.responza.ai/v2/alerts \<br />
                &nbsp;&nbsp;-H{" "}
                <span style={{ color: "#64748b" }}>
                  "Authorization: Bearer YOUR_KEY"
                </span>{" "}
                \<br />
                &nbsp;&nbsp;-d{" "}
                <span style={{ color: "#64748b" }}>
                  {`'{"region": "US-CA", "types": ["wildfire"]}'`}
                </span>
              </code>
            </div>
          </Section>

          {/* FAQ */}
          <Section id="faq">
            <SectionHeading label="FAQ" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  style={{
                    borderBottom: "1px solid #0f1923",
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "20px 0",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      gap: "16px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: "600",
                        fontSize: "14px",
                        color: openFaq === i ? "#22c55e" : "#e2e8f0",
                        transition: "color 0.15s",
                      }}
                    >
                      {faq.q}
                    </span>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: "16px",
                        color: "#22c55e",
                        flexShrink: 0,
                        transform:
                          openFaq === i ? "rotate(45deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                        display: "block",
                      }}
                    >
                      +
                    </span>
                  </button>
                  {openFaq === i && (
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#64748b",
                        lineHeight: "1.7",
                        margin: "0 0 20px",
                        paddingRight: "32px",
                      }}
                    >
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* Support */}
          <section id="support" style={{ scrollMarginTop: "80px" }}>
            <div
              style={{
                background: "#0b1320",
                border: "1px solid rgba(34,197,94,0.2)",
                borderRadius: "14px",
                padding: "40px 48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "24px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "7px",
                      height: "7px",
                      background: "#22c55e",
                      borderRadius: "50%",
                      boxShadow: "0 0 6px #22c55e",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "11px",
                      color: "#22c55e",
                      letterSpacing: "0.15em",
                    }}
                  >
                    SUPPORT ONLINE
                  </span>
                </div>
                <h2
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: "700",
                    fontSize: "26px",
                    color: "#f1f5f9",
                    margin: "0 0 8px",
                    letterSpacing: "-0.3px",
                  }}
                >
                  Need Assistance?
                </h2>
                <p style={{ fontSize: "14px", color: "#4b5563", margin: 0 }}>
                  Our support team is available 24/7 for emergency response
                  inquiries.
                </p>
              </div>
              <div style={{ display: "flex", gap: "12px", flexShrink: 0 }}>
                <button
                  style={{
                    background: "#22c55e",
                    border: "none",
                    borderRadius: "8px",
                    padding: "11px 24px",
                    color: "#000",
                    fontWeight: "600",
                    fontFamily: "'Syne', sans-serif",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "opacity 0.15s, transform 0.15s",
                    letterSpacing: "0.02em",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.88";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  Contact Support →
                </button>
                <button
                  style={{
                    background: "transparent",
                    border: "1px solid #1e293b",
                    borderRadius: "8px",
                    padding: "11px 24px",
                    color: "#64748b",
                    fontFamily: "'Syne', sans-serif",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#334155";
                    e.currentTarget.style.color = "#e2e8f0";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#1e293b";
                    e.currentTarget.style.color = "#64748b";
                  }}
                >
                  View Tutorials
                </button>
              </div>
            </div>
            scrollMarginTop: "80px" 
          </section>
        </main>
      </div>
    </div>
  );
}
