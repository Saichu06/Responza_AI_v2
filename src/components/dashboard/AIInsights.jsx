// src/components/dashboard/AIInsights.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { COLORS, FONTS } from "../../utils/constants";
import { getAIInsight, buildAlertSummary, getPersonalizedRecommendation } from "../../services/ai";
import { getWeatherData } from "../../services/openMeteo";
import { useGeolocation } from "../../hooks/useGeolocation";
import { sevColor } from "../../utils/helpers";
import Card from "../common/Card";
import Button from "../common/Button";

const css = `
@keyframes typing { from { width:0; } to { width:100%; } }
@keyframes blink  { 0%,100%{ opacity:1; } 50%{ opacity:0; } }
@keyframes pulse { 0%,100%{ opacity:1; } 50%{ opacity:0.5; } }
`;

export default function AIInsights({ alerts }) {
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationWeather, setLocationWeather] = useState(null);
  const [personalizedTip, setPersonalizedTip] = useState(null);
  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);
  
  const { location, loading: locLoading, error: locError, permission, getLocation } = useGeolocation();

  // Fetch weather for user's location
  useEffect(() => {
    if (location && !locationWeather) {
      const fetchLocationWeather = async () => {
        try {
          const weather = await getWeatherData(location.lat, location.lng);
          setLocationWeather(weather);
          
          // Get personalized safety tip based on local weather
          const tip = getPersonalizedRecommendation(weather);
          setPersonalizedTip(tip);
        } catch (err) {
          console.error("Failed to fetch location weather:", err);
        }
      };
      fetchLocationWeather();
    }
  }, [location]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const generate = useCallback(async (alertList = alerts) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isMountedRef.current) return;
    
    setLoading(true);
    setInsight("");
    
    const summary = buildAlertSummary(alertList);
    let text = await getAIInsight(summary);
    
    // Add personalized location tip if available
    if (personalizedTip) {
      text = `${personalizedTip}\n\n${text}`;
    }
    
    if (!isMountedRef.current) return;
    
    // Typewriter effect
    let i = 0;
    intervalRef.current = setInterval(() => {
      if (!isMountedRef.current) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      
      setInsight(text.slice(0, i));
      i += 2;
      
      if (i > text.length) {
        setInsight(text);
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 18);
    
    setLoading(false);
  }, [alerts, personalizedTip]);

  // Auto-generate when alerts change
  useEffect(() => {
    if (alerts?.length) {
      const timer = setTimeout(() => {
        generate(alerts);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [alerts?.length, generate]);

  const critical = alerts?.filter((a) => a.sev === "critical") ?? [];

  return (
    <Card style={{ height: "100%", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>🧠</span>
          <span style={{ fontSize: 11, fontFamily: FONTS.mono, color: COLORS.muted, letterSpacing: .5 }}>AI RESPONSE INSIGHTS</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {permission !== "granted" && !location && (
            <Button 
              variant="mono" 
              size="sm" 
              onClick={getLocation}
              disabled={locLoading}
              style={{ fontSize: 10 }}
            >
              {locLoading ? "📍 Locating..." : "📍 Enable Location"}
            </Button>
          )}
          <Button variant="mono" size="sm" onClick={() => generate()} disabled={loading}>
            {loading ? "Analyzing..." : "↻ Refresh"}
          </Button>
        </div>
      </div>

      {/* Location Status Banner */}
      {permission !== "granted" && !location && !locError && (
        <div style={{ 
          padding: "10px 16px", 
          background: "rgba(0,255,136,0.05)", 
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 11
        }}>
          <span style={{ animation: "pulse 1.5s infinite" }}>📍</span>
          <span style={{ color: COLORS.muted, fontFamily: FONTS.mono }}>
            Enable location for real-time weather alerts and personalized safety recommendations for your area
          </span>
        </div>
      )}

      {locError && (
        <div style={{ 
          padding: "10px 16px", 
          background: "rgba(255,59,92,0.1)", 
          borderBottom: `1px solid ${COLORS.border}`,
          fontSize: 11,
          color: COLORS.red,
          fontFamily: FONTS.mono
        }}>
          ⚠️ {locError}
        </div>
      )}

      {/* Location Active Badge */}
      {location && personalizedTip && (
        <div style={{ 
          padding: "10px 16px", 
          background: "rgba(0,255,136,0.08)", 
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap"
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.green, animation: "pulse 1.5s infinite" }} />
          <span style={{ color: COLORS.green, fontFamily: FONTS.mono, fontSize: 10 }}>📍 YOUR LOCATION</span>
          <span style={{ color: COLORS.text, fontSize: 11, flex: 1 }}>
            {personalizedTip}
          </span>
        </div>
      )}

      {/* Insight text */}
      <div style={{ padding: "14px 16px", flex: 1, overflowY: "auto", minHeight: 180 }}>
        {loading ? (
          <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.muted }}>
            <span style={{ animation: "blink 1s infinite" }}>▊</span> Analyzing {critical.length} critical incidents...
          </div>
        ) : insight ? (
          <div style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.text, lineHeight: 1.65 }}>
            {insight.split('\n\n').map((para, i) => (
              <p key={i} style={{ marginBottom: i < insight.split('\n\n').length - 1 ? 12 : 0 }}>
                {para}
              </p>
            ))}
            {insight.length < 10 && <span style={{ animation: "blink .8s infinite", marginLeft: 2 }}>▊</span>}
          </div>
        ) : (
          <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.muted, textAlign: "center", padding: "30px 20px" }}>
            {permission === "granted" && location ? (
              "Analyzing global alerts and your location data..."
            ) : (
              <>
                <span style={{ fontSize: 24, display: "block", marginBottom: 12 }}>📍</span>
                Click "Enable Location" to get personalized weather alerts and safety recommendations for your exact location
              </>
            )}
          </div>
        )}
      </div>

      {/* Critical alert quick-list */}
      {critical.length > 0 && (
        <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: "10px 16px" }}>
          <div style={{ fontSize: 10, fontFamily: FONTS.mono, color: COLORS.muted, letterSpacing: .5, marginBottom: 8 }}>PRIORITY TARGETS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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