// src/components/dashboard/AIInsights.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { COLORS, FONTS } from "../../utils/constants";
import { getAIInsight, getCityWeatherInsight, buildAlertSummary, getPersonalizedRecommendation } from "../../services/ai";
import { getWeatherData, searchCity, WMO_CODES, weatherCodeToRisk } from "../../services/openMeteo";
import { useGeolocation } from "../../hooks/useGeolocation";
import { sevColor } from "../../utils/helpers";
import Card from "../common/Card";
import Button from "../common/Button";

const css = `
@keyframes typing  { from{width:0} to{width:100%} }
@keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0} }
@keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
@keyframes fadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin    { to{transform:rotate(360deg)} }
`;

/* ── Tiny spinner ── */
const Spin = () => (
  <span style={{
    display: "inline-block", width: 10, height: 10,
    border: `1.5px solid ${COLORS.muted}`, borderTopColor: COLORS.green,
    borderRadius: "50%", animation: "spin .7s linear infinite",
  }} />
);

/* ── Risk meter bar ── */
function RiskMeter({ alerts }) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  alerts.forEach((a) => { if (counts[a.sev] !== undefined) counts[a.sev]++; });
  const total = alerts.length || 1;
  const riskScore = Math.round(
    ((counts.critical * 4 + counts.high * 3 + counts.medium * 2 + counts.low) / (total * 4)) * 100
  );
  const riskColor = riskScore > 70 ? "#ff3b5c" : riskScore > 40 ? "#ffb930" : "#00ff88";
  const riskLabel = riskScore > 70 ? "CRITICAL" : riskScore > 40 ? "ELEVATED" : "NOMINAL";

  return (
    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
        <span style={{ fontSize: 10, fontFamily: FONTS.mono, color: COLORS.muted, letterSpacing: .5 }}>GLOBAL RISK INDEX</span>
        <span style={{ fontSize: 11, fontFamily: FONTS.mono, color: riskColor, fontWeight: 700 }}>{riskLabel} — {riskScore}%</span>
      </div>
      <div style={{ height: 4, background: `${COLORS.border}`, borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${riskScore}%`,
          background: `linear-gradient(90deg, ${COLORS.green}, ${riskColor})`,
          borderRadius: 4, transition: "width 0.8s ease",
          boxShadow: `0 0 8px ${riskColor}88`,
        }} />
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        {[["critical","#ff3b5c"],["high","#ffb930"],["medium","#4d9fff"],["low","#00ff88"]].map(([sev, col]) => (
          <span key={sev} style={{ fontSize: 9, fontFamily: FONTS.mono, color: col }}>
            {counts[sev]} <span style={{ color: COLORS.muted }}>{sev.toUpperCase()}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Action cards ── */
function SuggestedActions({ insight }) {
  if (!insight) return null;

  // Extract bullet points from insight
  const lines = insight.split("\n").filter((l) => l.trim().startsWith("•") || l.trim().startsWith("-"));
  if (!lines.length) return null;

  return (
    <div style={{ padding: "12px 16px", borderTop: `1px solid ${COLORS.border}`, animation: "fadeIn .5s ease" }}>
      <div style={{ fontSize: 10, fontFamily: FONTS.mono, color: COLORS.muted, letterSpacing: .5, marginBottom: 10 }}>SUGGESTED ACTIONS</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {lines.slice(0, 3).map((line, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start", gap: 8,
            background: "rgba(0,255,136,0.04)",
            border: `1px solid ${COLORS.border}`,
            borderRadius: 7, padding: "7px 10px",
          }}>
            <span style={{ color: COLORS.green, fontSize: 11, flexShrink: 0, marginTop: 1 }}>▸</span>
            <span style={{ fontSize: 11, color: COLORS.text, fontFamily: FONTS.sans, lineHeight: 1.5 }}>
              {line.replace(/^[•\-]\s*/, "")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── City search + weather card ── */
function CitySearch({ onInsight }) {
  const [query,     setQuery]     = useState("");
  const [results,   setResults]   = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected,  setSelected]  = useState(null);
  const [weather,   setWeather]   = useState(null);
  const [aiTip,     setAiTip]     = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const debounce = useRef(null);

  const handleInput = (val) => {
    setQuery(val);
    clearTimeout(debounce.current);
    if (val.length < 2) { setResults([]); return; }
    debounce.current = setTimeout(async () => {
      setSearching(true);
      try { setResults(await searchCity(val)); } catch { setResults([]); }
      finally { setSearching(false); }
    }, 400);
  };

  const handleSelect = async (city) => {
    setSelected(city);
    setResults([]);
    setQuery(city.display);
    setAiTip("");

    try {
      const w = await getWeatherData(city.lat, city.lon);
      setWeather(w);
      setLoadingAI(true);
      const tip = await getCityWeatherInsight(city.name, w);
      setAiTip(tip || "");
      if (onInsight) onInsight(city.name, tip);
    } catch {
      setWeather(null);
    } finally {
      setLoadingAI(false);
    }
  };

  const cw = weather?.current_weather;
  const risk = cw ? weatherCodeToRisk(cw.weathercode, cw.windspeed, weather?.daily?.precipitation_sum?.[0] ?? 0) : null;

  return (
    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
      <div style={{ fontSize: 10, fontFamily: FONTS.mono, color: COLORS.muted, letterSpacing: .5, marginBottom: 8 }}>
        🔍 ASK ABOUT ANY CITY
      </div>

      {/* Input */}
      <div style={{ position: "relative" }}>
        <input
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Search city for AI weather briefing..."
          style={{
            width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`,
            borderRadius: 7, padding: "8px 10px 8px 10px", color: COLORS.text,
            fontFamily: FONTS.mono, fontSize: 11, outline: "none", boxSizing: "border-box",
          }}
          onFocus={(e) => e.target.style.borderColor = COLORS.blue}
          onBlur={(e) => e.target.style.borderColor = COLORS.border}
        />
        {searching && (
          <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)" }}>
            <Spin />
          </span>
        )}
      </div>

      {/* Dropdown */}
      {results.length > 0 && (
        <div style={{
          background: COLORS.surface, border: `1px solid ${COLORS.border}`,
          borderRadius: 7, marginTop: 4, overflow: "hidden", zIndex: 10, position: "relative",
        }}>
          {results.map((r, i) => (
            <div
              key={i}
              onClick={() => handleSelect(r)}
              style={{
                padding: "8px 12px", fontSize: 12, color: COLORS.text,
                fontFamily: FONTS.sans, cursor: "pointer",
                borderBottom: i < results.length - 1 ? `1px solid ${COLORS.border}` : "none",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = COLORS.bg}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              {r.display}
            </div>
          ))}
        </div>
      )}

      {/* City weather card */}
      {selected && cw && (
        <div style={{
          marginTop: 10, background: "rgba(0,255,136,0.04)",
          border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 12px",
          animation: "fadeIn .4s ease",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.text }}>{selected.name}</span>
            {risk && (
              <span style={{
                fontSize: 9, padding: "2px 7px", borderRadius: 4,
                background: `${sevColor(risk.sev)}18`, color: sevColor(risk.sev),
                fontFamily: FONTS.mono, fontWeight: 700,
              }}>{risk.type}</span>
            )}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              ["🌡️", `${cw.temperature}°C`],
              ["💨", `${cw.windspeed} km/h`],
              ["🌤️", WMO_CODES[cw.weathercode] || "Unknown"],
            ].map(([icon, val]) => (
              <span key={val} style={{ fontSize: 11, fontFamily: FONTS.mono, color: COLORS.muted }}>
                {icon} <span style={{ color: COLORS.text }}>{val}</span>
              </span>
            ))}
          </div>
          {loadingAI && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: COLORS.muted, fontFamily: FONTS.mono }}>
              <Spin /> Generating AI briefing...
            </div>
          )}
          {aiTip && !loadingAI && (
            <div style={{
              marginTop: 8, fontSize: 11, color: COLORS.text,
              fontFamily: FONTS.sans, lineHeight: 1.55,
              borderTop: `1px solid ${COLORS.border}`, paddingTop: 8,
              animation: "fadeIn .4s ease",
            }}>
              {aiTip}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function AIInsights({ alerts }) {
  const [insight,        setInsight]        = useState("");
  const [loading,        setLoading]        = useState(false);
  const [locationWeather, setLocationWeather] = useState(null);
  const [personalizedTip, setPersonalizedTip] = useState(null);
  const intervalRef  = useRef(null);
  const isMountedRef = useRef(true);

  const { location, loading: locLoading, error: locError, permission, getLocation } = useGeolocation();

  /* ── Fetch weather for user's GPS location ── */
  useEffect(() => {
    if (location && !locationWeather) {
      const fetch_ = async () => {
        try {
          const w = await getWeatherData(location.lat, location.lng);
          setLocationWeather(w);
          setPersonalizedTip(getPersonalizedRecommendation(w));
        } catch { /* silent */ }
      };
      fetch_();
    }
  }, [location]);

  /* ── Cleanup ── */
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  /* ── Generate AI insight with context ── */
  const generate = useCallback(async (alertList = alerts) => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (!isMountedRef.current) return;

    setLoading(true);
    setInsight("");

    const summary = buildAlertSummary(alertList);
    const locationCtx = locationWeather?.current_weather
      ? `User location weather: ${locationWeather.current_weather.temperature}°C, wind ${locationWeather.current_weather.windspeed}km/h`
      : null;

    let text = await getAIInsight(summary, locationCtx);

    if (!isMountedRef.current) return;

    // Typewriter
    let i = 0;
    intervalRef.current = setInterval(() => {
      if (!isMountedRef.current) { clearInterval(intervalRef.current); return; }
      setInsight(text.slice(0, i));
      i += 2;
      if (i > text.length) {
        setInsight(text);
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 18);

    setLoading(false);
  }, [alerts, locationWeather]);

  /* ── Auto-generate on alert change ── */
  useEffect(() => {
    if (alerts?.length) {
      const t = setTimeout(() => generate(alerts), 600);
      return () => clearTimeout(t);
    }
  }, [alerts?.length]);

  const critical = alerts?.filter((a) => a.sev === "critical") ?? [];

  return (
    <Card style={{ height: "100%", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
      <style>{css}</style>

      {/* ── Header ── */}
      <div style={{
        padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>🧠</span>
          <span style={{ fontSize: 11, fontFamily: FONTS.mono, color: COLORS.muted, letterSpacing: .5 }}>AI RESPONSE INSIGHTS</span>
          {loading && <Spin />}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {permission !== "granted" && !location && (
            <Button variant="mono" size="sm" onClick={getLocation} disabled={locLoading} style={{ fontSize: 10 }}>
              {locLoading ? "📍 Locating..." : "📍 My Location"}
            </Button>
          )}
          <Button variant="mono" size="sm" onClick={() => generate()} disabled={loading}>
            {loading ? "Analyzing..." : "↻ Generate"}
          </Button>
        </div>
      </div>

      {/* ── Location banners ── */}
      {locError && (
        <div style={{ padding: "8px 16px", background: "rgba(255,59,92,0.1)", borderBottom: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.red, fontFamily: FONTS.mono }}>
          ⚠️ {locError}
        </div>
      )}
      {location && personalizedTip && (
        <div style={{
          padding: "8px 16px", background: "rgba(0,255,136,0.06)",
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex", alignItems: "flex-start", gap: 8,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.green, animation: "pulse 1.5s infinite", flexShrink: 0, marginTop: 3 }} />
          <span style={{ color: COLORS.text, fontSize: 11, fontFamily: FONTS.sans, lineHeight: 1.5 }}>{personalizedTip}</span>
        </div>
      )}

      {/* ── Global risk meter ── */}
      {alerts?.length > 0 && <RiskMeter alerts={alerts} />}

      {/* ── City search ── */}
      <CitySearch />

      {/* ── AI Insight text ── */}
      <div style={{ padding: "14px 16px", flex: 1, overflowY: "auto", minHeight: 120 }}>
        {loading ? (
          <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.muted }}>
            <span style={{ animation: "blink 1s infinite" }}>▊</span> Analyzing {critical.length} critical incidents...
          </div>
        ) : insight ? (
          <div style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.text, lineHeight: 1.65, animation: "fadeIn .3s ease" }}>
            {insight.split("\n\n").map((para, i) => (
              <p key={i} style={{ marginBottom: 10, marginTop: 0 }}>{para}</p>
            ))}
            {insight.length < 10 && <span style={{ animation: "blink .8s infinite", marginLeft: 2 }}>▊</span>}
          </div>
        ) : (
          <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.muted, textAlign: "center", padding: "20px 10px" }}>
            <span style={{ fontSize: 22, display: "block", marginBottom: 10 }}>🧠</span>
            Click "↻ Generate" to get an AI-powered emergency briefing based on active incidents
          </div>
        )}
      </div>

      {/* ── Suggested actions (extracted from AI insight) ── */}
      <SuggestedActions insight={insight} />

      {/* ── Critical alert quick-list ── */}
      {critical.length > 0 && (
        <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: "10px 16px" }}>
          <div style={{ fontSize: 10, fontFamily: FONTS.mono, color: COLORS.muted, letterSpacing: .5, marginBottom: 8 }}>PRIORITY TARGETS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {critical.slice(0, 3).map((a) => (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: sevColor(a.sev), flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: COLORS.text }}>{a.name}</span>
                </div>
                <span style={{ fontSize: 11, fontFamily: FONTS.mono, color: sevColor(a.sev) }}>{a.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}