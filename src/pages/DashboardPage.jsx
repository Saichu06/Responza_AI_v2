import {
  useState,
  useEffect,
  useCallback,
  useRef,
  createContext,
  useContext,
} from "react";
import { useAlerts } from "../hooks/useAlerts";

import StatsCards from "../components/dashboard/StatsCards";
import MapView from "../components/dashboard/MapView";
import AlertPanel from "../components/dashboard/AlertPanel";
import IncidentPanel from "../components/dashboard/IncidentPanel";
import AIInsights from "../components/dashboard/AIInsights";
import AIChat from "../components/dashboard/AICHAT";

/* ─────────────────────────────────────────────────────────────────────────
   THEME CONTEXT  — supports dark + light
───────────────────────────────────────────────────────────────────────── */
const ThemeContext = createContext();
function useTheme() {
  return useContext(ThemeContext);
}

function ThemeProvider({ children }) {
  const [dark, setDark] = useState(true);
  const toggleDark = useCallback(() => setDark((d) => !d), []);
  return (
    <ThemeContext.Provider value={{ dark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS — dark & light variants
───────────────────────────────────────────────────────────────────────── */
const DARK_TOKENS = {
  bg: "#060d1a",
  surface: "#0b1628",
  surfaceEl: "#0f1e35",
  border: "#1a2d4a",
  border2: "#2a4060",
  text: "#e8f0fe",
  textSub: "#8ba3c0",
  muted: "#4a6180",
  green: "#00e5a0",
  blue: "#3b82f6",
  amber: "#f59e0b",
  red: "#ef4444",
  overlay: "rgba(6,13,26,.7)",
  navBg: "rgba(11,22,40,.95)",
  inputBg: "rgba(255,255,255,.04)",
  shadow: "0 8px 32px rgba(0,0,0,.4)",
  isDark: true,
};

const LIGHT_TOKENS = {
  bg: "#f0f4ff",
  surface: "#ffffff",
  surfaceEl: "#f7f9ff",
  border: "#dce4f5",
  border2: "#b8c8e8",
  text: "#0f1e35",
  textSub: "#3a5070",
  muted: "#7a90b0",
  green: "#00b882",
  blue: "#2563eb",
  amber: "#d97706",
  red: "#dc2626",
  overlay: "rgba(240,244,255,.85)",
  navBg: "rgba(255,255,255,.95)",
  inputBg: "rgba(0,0,0,.03)",
  shadow: "0 8px 32px rgba(0,0,0,.1)",
  isDark: false,
};

function useTokens() {
  const { dark } = useTheme();
  return dark ? DARK_TOKENS : LIGHT_TOKENS;
}

/* ─────────────────────────────────────────────────────────────────────────
   GLOBAL CSS
───────────────────────────────────────────────────────────────────────── */
function useGlobalCSS(isDark) {
  const T = isDark ? DARK_TOKENS : LIGHT_TOKENS;
  useEffect(() => {
    const id = "responza-css";
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; }
body { background: ${T.bg}; color: ${T.text}; font-family: 'DM Sans', sans-serif; transition: background .3s, color .3s; }
::-webkit-scrollbar { width: 3px; height: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }

@keyframes blink  { 0%,100%{opacity:1} 50%{opacity:.15} }
@keyframes ping   { 0%{transform:scale(1);opacity:.6} 80%,100%{transform:scale(2.4);opacity:0} }
@keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes shimmer{ 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes markerPop { from{transform:scale(0) translateY(4px)} to{transform:scale(1) translateY(0)} }
@keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

.fade-up { animation: fadeUp .22s ease forwards; }

[data-tip] { position: relative; }
[data-tip]::after {
  content: attr(data-tip);
  position: absolute; left: calc(100% + 12px); top: 50%; transform: translateY(-50%);
  background: ${T.surface}; color: ${T.text}; font-size: 11px;
  font-family: 'DM Sans', sans-serif; border: 1px solid ${T.border2};
  border-radius: 6px; padding: 5px 10px; white-space: nowrap;
  pointer-events: none; opacity: 0; transition: opacity .15s; z-index: 9999;
  box-shadow: ${T.shadow};
}
[data-tip]:hover::after { opacity: 1; }

mark { background: ${T.amber}28; color: ${T.amber}; border-radius: 2px; padding: 0 2px; }

.skeleton {
  background: linear-gradient(90deg, ${T.border} 25%, ${T.border2} 50%, ${T.border} 75%);
  background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 6px;
}

.search-input:focus { outline: none; border-color: ${T.blue} !important; box-shadow: 0 0 0 3px ${T.blue}18; }

.marker-dot { animation: markerPop .3s cubic-bezier(.4,0,.2,1) both; }
.marker-dot:hover { transform: scale(1.4) !important; }

.profile-dropdown { animation: slideDown .18s cubic-bezier(.4,0,.2,1) forwards; }
`;
  }, [isDark]);
}

const REFRESH_MS = 30_000;
const mono = "'Space Mono', monospace";

/* ─────────────────────────────────────────────────────────────────────────
   CITY DATABASE for search
───────────────────────────────────────────────────────────────────────── */
const CITY_LIST = [
  // Asia Pacific
  { name: "Tokyo", lat: 35.68, lng: 139.69 },
  { name: "Chennai", lat: 13.08, lng: 80.27 },
  { name: "Mumbai", lat: 19.08, lng: 72.88 },
  { name: "Shanghai", lat: 31.23, lng: 121.47 },
  { name: "Delhi", lat: 28.61, lng: 77.21 },
  { name: "Bangkok", lat: 13.73, lng: 100.50 },
  { name: "Jakarta", lat: -6.17, lng: 106.83 },
  { name: "Manila", lat: 14.60, lng: 120.98 },
  { name: "Seoul", lat: 37.57, lng: 126.98 },
  { name: "Singapore", lat: 1.35, lng: 103.82 },
  { name: "Karachi", lat: 24.86, lng: 67.01 },
  { name: "Beijing", lat: 39.90, lng: 116.40 },
  
  // North America
  { name: "San Francisco", lat: 37.77, lng: -122.40 },
  { name: "Los Angeles", lat: 34.05, lng: -118.24 },
  { name: "New York", lat: 40.71, lng: -74.01 },
  { name: "Miami", lat: 25.76, lng: -80.19 },
  { name: "Vancouver", lat: 49.28, lng: -123.12 },
  { name: "Mexico City", lat: 19.43, lng: -99.13 },
  
  // Europe
  { name: "London", lat: 51.51, lng: -0.13 },
  { name: "Paris", lat: 48.86, lng: 2.35 },
  { name: "Berlin", lat: 52.52, lng: 13.41 },
  { name: "Rome", lat: 41.90, lng: 12.50 },
  
  // Australia
  { name: "Sydney", lat: -33.87, lng: 151.21 },
  { name: "Brisbane", lat: -27.47, lng: 153.03 },
  { name: "Perth", lat: -31.95, lng: 115.86 },
  
  // South America
  { name: "São Paulo", lat: -23.55, lng: -46.63 },
  { name: "Rio", lat: -22.91, lng: -43.17 },
  
  // Africa
  { name: "Cape Town", lat: -33.92, lng: 18.42 },
  { name: "Nairobi", lat: -1.29, lng: 36.82 },
  { name: "Cairo", lat: 30.04, lng: 31.24 },
  
  // Original
  { name: "Bali", lat: -8.34, lng: 115.09 },
];
/* ─────────────────────────────────────────────────────────────────────────
   GEOLOCATION HOOK
───────────────────────────────────────────────────────────────────────── */
function useGeolocation() {
  const [userLocation, setUserLocation] = useState(null);
  const [locStatus, setLocStatus] = useState("detecting");

  const nearestCity = useCallback((lat, lng) => {
    let best = CITY_LIST[0],
      bestD = 9999;
    CITY_LIST.forEach((c) => {
      const d = Math.sqrt((c.lat - lat) ** 2 + (c.lng - lng) ** 2);
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    });
    return best.name;
  }, []);

  const locate = useCallback(() => {
    setLocStatus("detecting");
    if (!navigator.geolocation) {
      setUserLocation({ lat: 20.5937, lng: 78.9629, cityName: "India" });
      setLocStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const cityName = nearestCity(lat, lng);
        setUserLocation({ lat, lng, cityName });
        setLocStatus("found");
      },
      () => {
        setUserLocation({ lat: 12.9716, lng: 80.2209, cityName: "Chennai" });
        setLocStatus("denied");
      },
      { timeout: 8000, enableHighAccuracy: false },
    );
  }, [nearestCity]);

  useEffect(() => {
    locate();
  }, [locate]);

  return { userLocation, locStatus, relocate: locate };
}

/* ─────────────────────────────────────────────────────────────────────────
   CITY SEARCH BAR
───────────────────────────────────────────────────────────────────────── */
function CitySearchBar({ onGoToCity, onLocateMe }) {
  const T = useTokens();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef();
  const debounceRef = useRef();

  const handleInput = (val) => {
    setQuery(val);
    setError(false);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (val.length < 2) {
        setSuggestions([]);
        setShowSug(false);
        return;
      }
      const matches = CITY_LIST.filter((c) =>
        c.name.toLowerCase().startsWith(val.toLowerCase()),
      ).slice(0, 6);
      setSuggestions(matches);
      setShowSug(matches.length > 0);
    }, 200);
  };

  const goToCity = (city) => {
    setQuery(city.name);
    setShowSug(false);
    onGoToCity(city);
  };

  const handleSearch = () => {
    const match = CITY_LIST.find((c) =>
      c.name.toLowerCase().includes(query.toLowerCase()),
    );
    if (match) {
      goToCity(match);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        position: "relative",
      }}
    >
      <div style={{ position: "relative", flex: 1 }}>
        <span
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: T.muted,
            fontSize: 14,
            pointerEvents: "none",
          }}
        >
          ⌕
        </span>
        <input
          ref={inputRef}
          className="search-input"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
            if (e.key === "Escape") setShowSug(false);
          }}
          onFocus={() => suggestions.length && setShowSug(true)}
          placeholder="Search any city... (press Enter)"
          style={{
            width: "100%",
            height: 36,
            paddingLeft: 32,
            paddingRight: 10,
            background: T.inputBg,
            border: `1px solid ${error ? T.red : T.border}`,
            borderRadius: 8,
            color: T.text,
            fontFamily: "inherit",
            fontSize: 13,
            transition: "border-color .15s, box-shadow .15s",
          }}
        />
        {showSug && (
          <div
            style={{
              position: "absolute",
              top: 40,
              left: 0,
              right: 0,
              zIndex: 200,
              background: T.surfaceEl,
              border: `1px solid ${T.border2}`,
              borderRadius: 8,
              overflow: "hidden",
              boxShadow: "0 8px 24px rgba(0,0,0,.5)",
            }}
          >
            {suggestions.map((c) => (
              <div
                key={c.name}
                onMouseDown={() => goToCity(c)}
                style={{
                  padding: "10px 14px",
                  cursor: "pointer",
                  fontSize: 13,
                  color: T.text,
                  borderBottom: `1px solid ${T.border}`,
                  transition: "background .1s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = T.inputBg)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                📍 {c.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleSearch}
        style={{
          padding: "5px 16px",
          height: 36,
          borderRadius: 8,
          border: `1px solid ${T.border2}`,
          background: `${T.blue}14`,
          color: T.blue,
          fontFamily: mono,
          fontSize: 10,
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "background .15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = `${T.blue}22`)}
        onMouseLeave={(e) => (e.currentTarget.style.background = `${T.blue}14`)}
      >
        SEARCH
      </button>

      <button
        onClick={onLocateMe}
        style={{
          padding: "5px 13px",
          height: 36,
          borderRadius: 8,
          border: `1px solid ${T.green}40`,
          background: `${T.green}10`,
          color: T.green,
          fontFamily: mono,
          fontSize: 10,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
          whiteSpace: "nowrap",
          transition: "background .15s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = `${T.green}1c`)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = `${T.green}10`)
        }
      >
        📍 MY LOCATION
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MAP WITH GEOLOCATION + CITY SEARCH + VIEW-ON-MAP
───────────────────────────────────────────────────────────────────────── */
function MapWithGeo({
  alerts,
  loading,
  selected,
  onSelect,
  showSearch = false,
  userLocation,
  onLocateMe,
}) {
  const T = useTokens();
  const [mapCenter, setMapCenter] = useState(null);
  const [zoomCity, setZoomCity] = useState(null);

  useEffect(() => {
    if (userLocation) {
      setMapCenter({
        lat: userLocation.lat,
        lng: userLocation.lng,
        label: userLocation.cityName,
      });
    }
  }, [userLocation]);

  useEffect(() => {
    if (selected?.lat != null && selected?.lng != null) {
      setMapCenter({
        lat: selected.lat,
        lng: selected.lng,
        label: selected.location,
        zoom: 3,
      });
      setZoomCity(selected.location);
    }
  }, [selected]);

  const handleGoToCity = useCallback((city) => {
    setMapCenter({ lat: city.lat, lng: city.lng, label: city.name, zoom: 2.5 });
    setZoomCity(city.name);
  }, []);

  const handleLocateMe = useCallback(() => {
    onLocateMe?.();
    if (userLocation) {
      setMapCenter({
        lat: userLocation.lat,
        lng: userLocation.lng,
        label: userLocation.cityName,
      });
      setZoomCity(null);
    }
  }, [onLocateMe, userLocation]);

  const resetMap = () => {
    setMapCenter(null);
    setZoomCity(null);
    onSelect(null);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        gap: 0,
      }}
    >
      {showSearch && (
        <div
          style={{
            padding: "12px 14px",
            borderBottom: `1px solid ${T.border}`,
            flexShrink: 0,
          }}
        >
          <CitySearchBar
            onGoToCity={handleGoToCity}
            onLocateMe={handleLocateMe}
          />
        </div>
      )}

      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <MapView
          alerts={alerts}
          loading={loading}
          selected={selected}
          onSelect={onSelect}
          mapCenter={mapCenter}
          userLocation={userLocation}
        />

        {userLocation && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: 12,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(6,13,26,.85)",
              border: `1px solid ${T.blue}35`,
              borderRadius: 8,
              padding: "5px 10px",
              fontFamily: mono,
              fontSize: 9,
              color: T.blue,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: T.blue,
                boxShadow: `0 0 8px ${T.blue}`,
                animation: "blink 2s infinite",
                display: "inline-block",
              }}
            />
            📍 YOU: {userLocation.cityName.toUpperCase()}
          </div>
        )}

        {zoomCity && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              right: 12,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(6,13,26,.85)",
              border: `1px solid ${T.border2}`,
              borderRadius: 8,
              padding: "5px 10px",
              fontFamily: mono,
              fontSize: 9,
              color: T.muted,
            }}
          >
            VIEWING: {zoomCity.toUpperCase()}
            <button
              onClick={resetMap}
              style={{
                background: "none",
                border: "none",
                color: T.muted,
                cursor: "pointer",
                fontSize: 14,
                lineHeight: 1,
                padding: 0,
                marginLeft: 4,
              }}
            >
              ×
            </button>
          </div>
        )}

        {selected && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 20,
              background: T.surfaceEl,
              borderTop: `1px solid ${T.border2}`,
              padding: "14px 16px",
              animation: "fadeUp .2s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 9,
                      letterSpacing: ".5px",
                      background: `${sevColor(T, selected.severity)}18`,
                      border: `1px solid ${sevColor(T, selected.severity)}35`,
                      color: sevColor(T, selected.severity),
                      borderRadius: 20,
                      padding: "2px 8px",
                    }}
                  >
                    {(selected.severity ?? "info").toUpperCase()}
                  </span>
                  <span
                    style={{ fontFamily: mono, fontSize: 9, color: T.muted }}
                  >
                    {selected.id}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: T.text,
                    marginBottom: 3,
                  }}
                >
                  {selected.title}
                </div>
                <div
                  style={{ fontSize: 12, color: T.textSub, marginBottom: 6 }}
                >
                  📍 {selected.location}
                </div>
                <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6 }}>
                  {selected.description}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                {selected.temp && (
                  <div
                    style={{
                      background: T.surface,
                      border: `1px solid ${T.border}`,
                      borderRadius: 8,
                      padding: "8px 12px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: mono,
                        fontSize: 8,
                        color: T.muted,
                        marginBottom: 3,
                      }}
                    >
                      TEMP
                    </div>
                    <div
                      style={{ fontSize: 15, fontWeight: 700, color: T.amber }}
                    >
                      {selected.temp}
                    </div>
                  </div>
                )}
                {selected.wind && (
                  <div
                    style={{
                      background: T.surface,
                      border: `1px solid ${T.border}`,
                      borderRadius: 8,
                      padding: "8px 12px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: mono,
                        fontSize: 8,
                        color: T.muted,
                        marginBottom: 3,
                      }}
                    >
                      WIND
                    </div>
                    <div
                      style={{ fontSize: 14, fontWeight: 600, color: T.blue }}
                    >
                      {selected.wind}
                    </div>
                  </div>
                )}
                <button
                  onClick={resetMap}
                  style={{
                    background: "transparent",
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    color: T.muted,
                    fontFamily: mono,
                    fontSize: 9,
                    padding: "6px 10px",
                    cursor: "pointer",
                  }}
                >
                  CLOSE ×
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   HELPER
───────────────────────────────────────────────────────────────────────── */
function sevColor(T, sev) {
  const s = (sev ?? "info").toLowerCase();
  if (s === "critical") return T.red;
  if (s === "warning") return T.amber;
  return T.green;
}

/* ─────────────────────────────────────────────────────────────────────────
   PRIMITIVES
───────────────────────────────────────────────────────────────────────── */
function LiveDot({ color, size = 5, pulse = false }) {
  const T = useTokens();
  const c = color ?? T.green;
  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {pulse && (
        <span
          style={{
            position: "absolute",
            inset: -3,
            borderRadius: "50%",
            background: c,
            animation: "ping 2.2s infinite",
            opacity: 0,
          }}
        />
      )}
      <span
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: c,
          animation: "blink 1.8s infinite",
          boxShadow: `0 0 5px ${c}88`,
        }}
      />
    </span>
  );
}

function Chip({ children, color, bg, border }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontFamily: mono,
        fontSize: 9,
        letterSpacing: ".8px",
        color,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 20,
        padding: "3px 9px",
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant = "ghost", style: extra = {} }) {
  const T = useTokens();
  const [hov, setHov] = useState(false);
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
    fontFamily: mono,
    fontSize: 10,
    letterSpacing: ".5px",
    borderRadius: 8,
    padding: "5px 13px",
    transition: "all .15s",
    border: "1px solid",
    background: "transparent",
    outline: "none",
    ...extra,
  };
  const styles = {
    ghost: {
      borderColor: hov ? T.border2 : T.border,
      color: hov ? T.text : T.muted,
      background: hov ? T.inputBg : "transparent",
    },
    primary: {
      borderColor: `${T.green}50`,
      color: T.green,
      background: hov ? `${T.green}22` : `${T.green}12`,
    },
    danger: {
      borderColor: hov ? `${T.red}50` : T.border,
      color: hov ? T.red : T.muted,
      background: hov ? `${T.red}12` : "transparent",
    },
  };
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ ...base, ...styles[variant] }}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   REFRESH RING
───────────────────────────────────────────────────────────────────────── */
function RefreshRing({ progress }) {
  const T = useTokens();
  const r = 5,
    circ = 2 * Math.PI * r;
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
      <circle
        cx="7"
        cy="7"
        r={r}
        fill="none"
        stroke={T.border2}
        strokeWidth="1.8"
      />
      <circle
        cx="7"
        cy="7"
        r={r}
        fill="none"
        stroke={T.green}
        strokeWidth="1.8"
        strokeDasharray={`${circ * progress} ${circ * (1 - progress)}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray .9s linear" }}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   THEME TOGGLE SWITCH
───────────────────────────────────────────────────────────────────────── */
function ThemeToggle() {
  const T = useTokens();
  const { dark, toggleDark } = useTheme();
  return (
    <button
      onClick={toggleDark}
      title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        padding: "9px 14px",
        background: "transparent",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        color: T.textSub,
        fontFamily: "inherit",
        fontSize: 13,
        transition: "background .15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = T.inputBg)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div
        style={{
          position: "relative",
          width: 36,
          height: 20,
          borderRadius: 10,
          background: dark ? T.border2 : `${T.blue}40`,
          border: `1px solid ${dark ? T.border2 : T.blue}`,
          transition: "background .2s",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: dark ? 2 : 18,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: dark ? T.muted : T.blue,
            transition: "left .2s, background .2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 8,
          }}
        >
          {dark ? "🌙" : "☀"}
        </div>
      </div>
      <span style={{ color: T.text, fontWeight: 500 }}>
        {dark ? "Dark Mode" : "Light Mode"}
      </span>
      <span
        style={{
          marginLeft: "auto",
          fontFamily: mono,
          fontSize: 9,
          color: T.muted,
          background: T.inputBg,
          border: `1px solid ${T.border}`,
          borderRadius: 4,
          padding: "2px 6px",
        }}
      >
        ON
      </span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   PROFILE DROPDOWN
───────────────────────────────────────────────────────────────────────── */
function ProfileDropdown({ onClose, userLocation }) {
  const T = useTokens();
  const ref = useRef();

  const [username, setUsername] = useState("Operator");
  const [email, setEmail] = useState("operator@responza.ai");
  const [locationLabel, setLocationLabel] = useState(
    userLocation?.cityName ?? "Unknown",
  );
  const [editField, setEditField] = useState(null);
  const [tempVal, setTempVal] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (userLocation?.cityName) setLocationLabel(userLocation.cityName);
  }, [userLocation]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const startEdit = (field, current) => {
    setEditField(field);
    setTempVal(current);
    setSaved(false);
  };
  const cancelEdit = () => {
    setEditField(null);
    setTempVal("");
  };
  const commitEdit = () => {
    if (!tempVal.trim()) return;
    if (editField === "username") setUsername(tempVal.trim());
    if (editField === "email") setEmail(tempVal.trim());
    if (editField === "location") setLocationLabel(tempVal.trim());
    setEditField(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const avatarLetter = username.charAt(0).toUpperCase();

  const FieldRow = ({ label, value, fieldKey, icon }) => {
    const isEditing = editField === fieldKey;
    return (
      <div
        style={{ padding: "10px 14px", borderBottom: `1px solid ${T.border}` }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: isEditing ? 8 : 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 13, color: T.muted }}>{icon}</span>
            <div>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 8,
                  color: T.muted,
                  letterSpacing: ".5px",
                  marginBottom: 2,
                }}
              >
                {label}
              </div>
              {!isEditing && (
                <div style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>
                  {value}
                </div>
              )}
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => startEdit(fieldKey, value)}
              style={{
                background: "transparent",
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                color: T.muted,
                fontFamily: mono,
                fontSize: 9,
                padding: "3px 9px",
                cursor: "pointer",
                transition: "all .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = T.blue;
                e.currentTarget.style.color = T.blue;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = T.border;
                e.currentTarget.style.color = T.muted;
              }}
            >
              EDIT
            </button>
          )}
        </div>
        {isEditing && (
          <div style={{ display: "flex", gap: 6 }}>
            <input
              autoFocus
              value={tempVal}
              onChange={(e) => setTempVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitEdit();
                if (e.key === "Escape") cancelEdit();
              }}
              style={{
                flex: 1,
                height: 32,
                padding: "0 10px",
                background: T.inputBg,
                border: `1px solid ${T.blue}`,
                borderRadius: 7,
                color: T.text,
                fontFamily: "inherit",
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              onClick={commitEdit}
              style={{
                padding: "0 12px",
                height: 32,
                borderRadius: 7,
                border: `1px solid ${T.green}50`,
                background: `${T.green}14`,
                color: T.green,
                fontFamily: mono,
                fontSize: 9,
                cursor: "pointer",
                transition: "background .15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = `${T.green}22`)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = `${T.green}14`)
              }
            >
              SAVE
            </button>
            <button
              onClick={cancelEdit}
              style={{
                padding: "0 10px",
                height: 32,
                borderRadius: 7,
                border: `1px solid ${T.border}`,
                background: "transparent",
                color: T.muted,
                fontFamily: mono,
                fontSize: 9,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={ref}
      className="profile-dropdown"
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        right: 0,
        zIndex: 500,
        width: 300,
        background: T.surface,
        border: `1px solid ${T.border2}`,
        borderRadius: 12,
        boxShadow: T.shadow,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 14px 14px",
          background: `linear-gradient(135deg, ${T.blue}12, ${T.green}08)`,
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${T.green}30, ${T.blue}30)`,
            border: `2px solid ${T.green}50`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: mono,
            fontSize: 18,
            fontWeight: 700,
            color: T.green,
            flexShrink: 0,
          }}
        >
          {avatarLetter}
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: T.text,
              marginBottom: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {username}
          </div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 9,
              color: T.muted,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {email}
          </div>
        </div>
        {saved && (
          <span
            style={{
              fontFamily: mono,
              fontSize: 9,
              color: T.green,
              background: `${T.green}14`,
              border: `1px solid ${T.green}30`,
              borderRadius: 20,
              padding: "3px 8px",
              flexShrink: 0,
            }}
          >
            ✓ SAVED
          </span>
        )}
      </div>

      <FieldRow
        label="USERNAME"
        value={username}
        fieldKey="username"
        icon="◈"
      />
      <FieldRow label="EMAIL" value={email} fieldKey="email" icon="✉" />
      <FieldRow
        label="LOCATION"
        value={locationLabel}
        fieldKey="location"
        icon="📍"
      />

      {/* Theme Toggle */}
      <div style={{ borderBottom: `1px solid ${T.border}` }}>
        <ThemeToggle />
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontFamily: mono, fontSize: 9, color: T.muted }}>
          RESPONZA.AI · v2.2.0
        </span>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: `1px solid ${T.border}`,
            borderRadius: 6,
            color: T.muted,
            fontFamily: mono,
            fontSize: 9,
            padding: "4px 10px",
            cursor: "pointer",
            transition: "all .15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = T.text;
            e.currentTarget.style.borderColor = T.border2;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = T.muted;
            e.currentTarget.style.borderColor = T.border;
          }}
        >
          CLOSE ×
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   PROFILE BUTTON (with dropdown)
───────────────────────────────────────────────────────────────────────── */
function ProfileButton({ userLocation }) {
  const T = useTokens();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef();

  return (
    <div ref={wrapRef} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Profile & Settings"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          height: 34,
          padding: "0 12px 0 8px",
          borderRadius: 8,
          border: `1px solid ${open ? T.border2 : T.border}`,
          background: open ? T.inputBg : "transparent",
          cursor: "pointer",
          color: open ? T.text : T.muted,
          transition: "all .15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = T.inputBg;
          e.currentTarget.style.color = T.text;
          e.currentTarget.style.borderColor = T.border2;
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = T.muted;
            e.currentTarget.style.borderColor = T.border;
          }
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${T.green}40, ${T.blue}30)`,
            border: `1px solid ${T.green}50`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: mono,
            fontSize: 10,
            fontWeight: 700,
            color: T.green,
            flexShrink: 0,
          }}
        >
          O
        </div>
        <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: ".4px" }}>
          PROFILE
        </span>
        <span
          style={{
            fontSize: 9,
            color: T.muted,
            marginLeft: 2,
            transition: "transform .15s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            display: "inline-block",
          }}
        >
          ▾
        </span>
      </button>

      {open && (
        <ProfileDropdown
          onClose={() => setOpen(false)}
          userLocation={userLocation}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   TOP NAVBAR
───────────────────────────────────────────────────────────────────────── */
function TopNavbar({
  liveCount,
  onGoHome,
  nextRefresh,
  onRefreshNow,
  sidebarOpen,
  onToggleSidebar,
  userLocation,
  locStatus,
}) {
  const T = useTokens();
  const { dark } = useTheme();

  // Inject global CSS here (has access to dark state)
  useGlobalCSS(dark);

  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const locLabel =
    locStatus === "detecting"
      ? "DETECTING..."
      : locStatus === "found"
        ? (userLocation?.cityName ?? "").toUpperCase()
        : (userLocation?.cityName ?? "UNKNOWN").toUpperCase();

  return (
    <nav
      style={{
        height: 52,
        background: T.navBg,
        borderBottom: `1px solid ${T.border}`,
        display: "flex",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 300,
        backdropFilter: "blur(20px)",
        flexShrink: 0,
        transition: "background .3s, border-color .3s",
      }}
    >
      {/* Left */}
      <div
        style={{
          width: sidebarOpen ? 220 : 60,
          height: "100%",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          borderRight: `1px solid ${T.border}`,
          transition: "width .25s cubic-bezier(.4,0,.2,1)",
          overflow: "hidden",
          padding: sidebarOpen ? "0 14px" : "0",
          justifyContent: sidebarOpen ? "space-between" : "center",
          gap: 8,
        }}
      >
        {sidebarOpen && (
          <div
            onClick={onGoHome}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              flex: 1,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                flexShrink: 0,
                background:
                  "linear-gradient(135deg,rgba(0,229,160,.2),rgba(59,130,246,.15))",
                border: `1px solid ${T.green}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
              }}
            >
              <img
                src="/logo.png"
                alt="Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderRadius: 6,
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML = "⚡";
                }}
              />
            </div>
            <span
              style={{
                fontFamily: mono,
                fontSize: 12,
                fontWeight: 700,
                color: T.text,
                whiteSpace: "nowrap",
              }}
            >
              RESPONZA<span style={{ color: T.green }}>.AI</span>
            </span>
          </div>
        )}
        <button
          onClick={onToggleSidebar}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          style={{
            width: 30,
            height: 30,
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            background: "transparent",
            cursor: "pointer",
            color: T.muted,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            transition: "all .15s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = T.inputBg;
            e.currentTarget.style.color = T.text;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = T.muted;
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                display: "block",
                height: 1.5,
                borderRadius: 1,
                background: "currentColor",
                width: i === 1 ? (sidebarOpen ? 12 : 14) : 14,
                transition: "width .2s",
              }}
            />
          ))}
        </button>
      </div>

      {/* Center */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 16px",
        }}
      >
        <span
          style={{
            fontFamily: mono,
            fontSize: 9,
            letterSpacing: 2,
            color: T.muted,
          }}
        >
          MISSION CONTROL
        </span>
        <Chip color={T.green} bg={`${T.green}0d`} border={`${T.green}25`}>
          <LiveDot pulse size={4} />
          SYSTEMS NOMINAL
        </Chip>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: `${T.blue}0d`,
            border: `1px solid ${T.blue}25`,
            borderRadius: 20,
            padding: "3px 9px",
            fontFamily: mono,
            fontSize: 9,
            color: T.blue,
          }}
        >
          <span>📍</span>
          <span>{locLabel}</span>
        </div>
      </div>

      {/* Right */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          paddingRight: 16,
        }}
      >
        <Chip color={T.amber} bg={`${T.amber}0d`} border={`${T.amber}20`}>
          <LiveDot color={T.amber} size={4} />
          {liveCount ?? 0} LIVE
        </Chip>
        <Btn
          variant="ghost"
          onClick={onRefreshNow}
          style={{ padding: "4px 10px" }}
        >
          <RefreshRing progress={(REFRESH_MS - nextRefresh) / REFRESH_MS} />
          SYNC
        </Btn>
        <div
          style={{
            fontFamily: mono,
            fontSize: 11,
            color: T.textSub,
            background: T.inputBg,
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            padding: "4px 10px",
          }}
        >
          {time.toLocaleTimeString()}
        </div>
        {/* Profile button — replaces ← HOME */}
        <ProfileButton userLocation={userLocation} />
        {/* Keep a subtle home link too */}
        <Btn variant="ghost" onClick={onGoHome} style={{ padding: "4px 10px" }}>
          ← HOME
        </Btn>
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "◫", sub: "Overview & stats" },
  { id: "map", label: "Map View", icon: "◉", sub: "Global incidents" },
  { id: "incidents", label: "Incidents", icon: "△", sub: "Alert log" },
  { id: "insights", label: "AI Insights", icon: "◈", sub: "Predictive AI" },
  { id: "chat", label: "AI Assistant", icon: "⬡", sub: "Chat & Guidance" },
];

function Sidebar({
  active,
  onChange,
  open,
  alertCount,
  onNewAlert,
  onLocateMe,
}) {
  const T = useTokens();
  const [hovered, setHovered] = useState(null);
  const [hovExpanded, setHovExpanded] = useState(false);
  const hoverTimer = useRef();
  const isExpanded = open || hovExpanded;

  const handleMouseEnter = () => {
    if (!open) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = setTimeout(() => setHovExpanded(true), 200);
    }
  };
  const handleMouseLeave = () => {
    clearTimeout(hoverTimer.current);
    setHovExpanded(false);
    setHovered(null);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        width: isExpanded ? 220 : 60,
        background: T.surface,
        borderRight: `1px solid ${T.border}`,
        display: "flex",
        flexDirection: "column",
        transition: "width .25s cubic-bezier(.4,0,.2,1)",
        overflow: "hidden",
        flexShrink: 0,
        zIndex: 50,
        boxShadow: hovExpanded && !open ? "4px 0 20px rgba(0,0,0,.5)" : "none",
      }}
    >
      {!isExpanded && (
        <div
          style={{
            padding: "12px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <LiveDot size={6} pulse />
          <span
            style={{
              fontFamily: mono,
              fontSize: 7,
              color: T.green,
              letterSpacing: 1,
            }}
          >
            LIVE
          </span>
          {alertCount > 0 && (
            <div
              style={{
                width: 24,
                height: 18,
                borderRadius: 9,
                background: `${T.red}18`,
                border: `1px solid ${T.red}35`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: mono,
                fontSize: 9,
                color: T.red,
              }}
            >
              {alertCount > 99 ? "99+" : alertCount}
            </div>
          )}
        </div>
      )}

      <div
        style={{
          flex: 1,
          padding: isExpanded ? "10px 8px" : "10px",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          const isHov = hovered === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onChange(item.id)}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              {...(!isExpanded ? { "data-tip": item.label } : {})}
              style={{
                display: "flex",
                alignItems: "center",
                gap: isExpanded ? 10 : 0,
                padding: isExpanded ? "9px 12px" : "10px 0",
                justifyContent: isExpanded ? "flex-start" : "center",
                borderRadius: 8,
                cursor: "pointer",
                marginBottom: 2,
                borderLeft: `3px solid ${isActive ? T.green : "transparent"}`,
                borderTop: "1px solid transparent",
                borderRight: "1px solid transparent",
                borderBottom: "1px solid transparent",
                background: isActive
                  ? "rgba(0,229,160,.06)"
                  : isHov
                    ? T.inputBg
                    : "transparent",
                transition: "all .15s",
              }}
            >
              <span
                style={{
                  fontSize: isExpanded ? 15 : 17,
                  color: isActive ? T.green : isHov ? T.text : T.muted,
                  transition: "color .15s",
                  flexShrink: 0,
                  fontFamily: mono,
                  lineHeight: 1,
                }}
              >
                {item.icon}
              </span>
              {isExpanded && (
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: isActive ? 500 : 400,
                      color: isActive ? T.text : isHov ? T.text : T.textSub,
                      transition: "color .15s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </div>
                  {isActive && (
                    <div style={{ fontSize: 10, color: T.muted, marginTop: 1 }}>
                      {item.sub}
                    </div>
                  )}
                </div>
              )}
              {isExpanded && item.id === "incidents" && alertCount > 0 && (
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 9,
                    background: `${T.red}18`,
                    border: `1px solid ${T.red}35`,
                    color: T.red,
                    borderRadius: 10,
                    padding: "1px 6px",
                    flexShrink: 0,
                  }}
                >
                  {alertCount}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {isExpanded && (
        <div
          style={{ padding: "10px 8px", borderTop: `1px solid ${T.border}` }}
        >
          <button
            onClick={onNewAlert}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 8,
              background: `${T.green}10`,
              border: `1px solid ${T.green}30`,
              color: T.green,
              fontFamily: "inherit",
              fontSize: 12,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              transition: "all .15s",
              marginBottom: 6,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${T.green}1c`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${T.green}10`;
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>New Alert
          </button>
          <button
            onClick={onLocateMe}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 8,
              background: `${T.blue}0d`,
              border: `1px solid ${T.blue}30`,
              color: T.blue,
              fontFamily: "inherit",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              transition: "all .15s",
              marginBottom: 6,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${T.blue}18`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${T.blue}0d`;
            }}
          >
            <span>📍</span>My Location
          </button>
          <button
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 8,
              background: "transparent",
              border: `1px solid ${T.border}`,
              color: T.muted,
              fontFamily: "inherit",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              transition: "all .15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = T.inputBg;
              e.currentTarget.style.color = T.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = T.muted;
            }}
          >
            <span style={{ fontSize: 13 }}>⚙</span>Settings
          </button>
        </div>
      )}

      {!isExpanded && (
        <div
          style={{
            padding: "10px",
            borderTop: `1px solid ${T.border}`,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            alignItems: "center",
          }}
        >
          <button
            data-tip="New Alert"
            onClick={onNewAlert}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: `1px solid ${T.green}30`,
              background: `${T.green}10`,
              cursor: "pointer",
              color: T.green,
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all .15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${T.green}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${T.green}10`;
            }}
          >
            +
          </button>
          <button
            data-tip="My Location"
            onClick={onLocateMe}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: `1px solid ${T.blue}30`,
              background: `${T.blue}0d`,
              cursor: "pointer",
              color: T.blue,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all .15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${T.blue}18`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${T.blue}0d`;
            }}
          >
            📍
          </button>
          <button
            data-tip="Settings"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: `1px solid ${T.border}`,
              background: "transparent",
              cursor: "pointer",
              color: T.muted,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all .15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = T.inputBg;
              e.currentTarget.style.color = T.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = T.muted;
            }}
          >
            ⚙
          </button>
        </div>
      )}

      {isExpanded && (
        <div
          style={{
            padding: "8px 14px",
            borderTop: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontFamily: mono, fontSize: 9, color: T.muted }}>
            v2.2.0
          </span>
          <span style={{ fontSize: 10, color: T.muted }}>Build stable</span>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   ALERT FILTER LOGIC
───────────────────────────────────────────────────────────────────────── */
function useAlertFilter(alerts) {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("all");
  const [zone, setZone] = useState("all zones");

  const filtered = (alerts ?? []).filter((alert) => {
    const q = query.toLowerCase();
    const matchQ =
      !q ||
      (alert.title ?? "").toLowerCase().includes(q) ||
      (alert.description ?? "").toLowerCase().includes(q) ||
      (alert.location ?? "").toLowerCase().includes(q) ||
      (alert.zone ?? "").toLowerCase().includes(q) ||
      String(alert.id ?? "")
        .toLowerCase()
        .includes(q);
    const matchS =
      severity === "all" ||
      (alert.severity ?? alert.level ?? "").toLowerCase() === severity;
    const matchZ =
      zone === "all zones" ||
      (alert.zone ?? "").toLowerCase().includes(zone) ||
      (alert.location ?? "").toLowerCase().includes(zone);
    return matchQ && matchS && matchZ;
  });

  return { query, setQuery, severity, setSeverity, zone, setZone, filtered };
}

/* ─────────────────────────────────────────────────────────────────────────
   SEARCH + FILTER BAR
───────────────────────────────────────────────────────────────────────── */
const SEVERITIES = ["all", "critical", "warning", "info"];
const ZONES = ["all zones", "north-east", "west", "south", "global"];

function SearchFilterBar({
  query,
  setQuery,
  severity,
  setSeverity,
  zone,
  setZone,
  resultCount,
}) {
  const T = useTokens();
  const inputRef = useRef();
  const active = query || severity !== "all" || zone !== "all zones";

  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setQuery("");
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [setQuery]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
        padding: "10px 14px",
        background: T.surfaceEl,
        border: `1px solid ${active ? T.border2 : T.border}`,
        borderRadius: 10,
        transition: "border-color .2s",
      }}
    >
      <div style={{ position: "relative", flex: "1 1 180px", minWidth: 160 }}>
        <span
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: T.muted,
            fontSize: 14,
            pointerEvents: "none",
            lineHeight: 1,
          }}
        >
          ⌕
        </span>
        <input
          ref={inputRef}
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search alerts, zones, IDs…"
          style={{
            width: "100%",
            height: 34,
            paddingLeft: 32,
            paddingRight: query ? 28 : 10,
            background: T.inputBg,
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            color: T.text,
            fontFamily: "inherit",
            fontSize: 13,
            transition: "border-color .15s, box-shadow .15s",
          }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: T.muted,
              cursor: "pointer",
              fontSize: 16,
              lineHeight: 1,
              padding: 0,
            }}
          >
            ×
          </button>
        )}
      </div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {SEVERITIES.map((s) => {
          const isActive = severity === s;
          const col =
            s === "critical"
              ? T.red
              : s === "warning"
                ? T.amber
                : s === "info"
                  ? T.blue
                  : T.green;
          return (
            <button
              key={s}
              onClick={() => setSeverity(s)}
              style={{
                fontFamily: mono,
                fontSize: 9,
                letterSpacing: ".5px",
                padding: "4px 10px",
                borderRadius: 6,
                cursor: "pointer",
                textTransform: "uppercase",
                transition: "all .15s",
                background: isActive ? `${col}18` : "transparent",
                border: `1px solid ${isActive ? `${col}50` : T.border}`,
                color: isActive ? col : T.muted,
              }}
            >
              {s}
            </button>
          );
        })}
      </div>
      <select
        value={zone}
        onChange={(e) => setZone(e.target.value)}
        style={{
          height: 34,
          padding: "0 26px 0 10px",
          background: T.inputBg,
          border: `1px solid ${T.border}`,
          borderRadius: 8,
          color: T.text,
          fontFamily: mono,
          fontSize: 10,
          cursor: "pointer",
          outline: "none",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%234a6180'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 8px center",
        }}
      >
        {ZONES.map((z) => (
          <option key={z} value={z} style={{ background: T.surface }}>
            {z.toUpperCase()}
          </option>
        ))}
      </select>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginLeft: "auto",
        }}
      >
        {active && (
          <span
            style={{
              fontFamily: mono,
              fontSize: 10,
              color: resultCount === 0 ? T.red : T.muted,
            }}
          >
            {resultCount} result{resultCount !== 1 ? "s" : ""}
          </span>
        )}
        {!active && (
          <kbd
            style={{
              fontFamily: mono,
              fontSize: 9,
              color: T.muted,
              background: T.inputBg,
              border: `1px solid ${T.border}`,
              borderRadius: 5,
              padding: "2px 6px",
            }}
          >
            ⌘K
          </kbd>
        )}
        {active && (
          <button
            onClick={() => {
              setQuery("");
              setSeverity("all");
              setZone("all zones");
            }}
            style={{
              fontFamily: mono,
              fontSize: 9,
              color: T.muted,
              background: "transparent",
              border: `1px solid ${T.border}`,
              borderRadius: 6,
              padding: "3px 8px",
              cursor: "pointer",
              transition: "all .15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = T.text;
              e.currentTarget.style.borderColor = T.border2;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = T.muted;
              e.currentTarget.style.borderColor = T.border;
            }}
          >
            CLEAR ×
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   LAYOUT WRAPPERS
───────────────────────────────────────────────────────────────────────── */
function Section({ children }) {
  return (
    <div
      className="fade-up"
      style={{
        flex: 1,
        overflow: "auto",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {children}
    </div>
  );
}

function PageHeader({ title, sub, children }) {
  const T = useTokens();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div>
        <h2
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: T.text,
            letterSpacing: "-.2px",
          }}
        >
          {title}
        </h2>
        {sub && (
          <p style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>{sub}</p>
        )}
      </div>
      {children && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SECTION VIEWS
───────────────────────────────────────────────────────────────────────── */
function DashboardSection({
  alerts,
  loading,
  liveCount,
  lastFetch,
  selected,
  setSelected,
  filterProps,
  userLocation,
  onLocateMe,
}) {
  const T = useTokens();
  const { query, setQuery, severity, setSeverity, zone, setZone, filtered } =
    filterProps;

  return (
    <Section>
      <PageHeader
        title="Mission Control"
        sub={
          lastFetch
            ? `Live ops — synced ${Math.round((Date.now() - lastFetch) / 1000)}s ago`
            : "Live ops"
        }
      >
        <Btn variant="ghost">↓ Export</Btn>
        <Btn variant="primary">+ New Alert</Btn>
      </PageHeader>

      <StatsCards
        alerts={alerts}
        loading={loading}
        liveCount={liveCount}
        lastFetch={lastFetch}
      />

      <SearchFilterBar
        query={query}
        setQuery={setQuery}
        severity={severity}
        setSeverity={setSeverity}
        zone={zone}
        setZone={setZone}
        resultCount={filtered.length}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 14,
          flex: 1,
          minHeight: 380,
        }}
      >
        <div
          style={{
            borderRadius: 10,
            overflow: "hidden",
            border: `1px solid ${T.border}`,
          }}
        >
          <MapWithGeo
            alerts={filtered}
            loading={loading}
            selected={selected}
            onSelect={setSelected}
            showSearch={false}
            userLocation={userLocation}
            onLocateMe={onLocateMe}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              flex: 1,
              borderRadius: 10,
              overflow: "hidden",
              border: `1px solid ${T.border}`,
            }}
          >
            <AlertPanel
              alerts={filtered}
              loading={loading}
              selected={selected}
              onSelect={setSelected}
            />
          </div>
          <div
            style={{
              flex: 1,
              borderRadius: 10,
              overflow: "hidden",
              border: `1px solid ${T.border}`,
            }}
          >
            <IncidentPanel
              alert={selected}
              alerts={alerts}
              onClose={() => setSelected(null)}
            />
          </div>
        </div>
      </div>
    </Section>
  );
}

function MapSection({
  alerts,
  loading,
  selected,
  setSelected,
  filterProps,
  userLocation,
  onLocateMe,
}) {
  const T = useTokens();
  const { query, setQuery, severity, setSeverity, zone, setZone, filtered } =
    filterProps;
  return (
    <Section>
      <PageHeader
        title="Global Map"
        sub="All active incidents across monitored regions"
      />
      <SearchFilterBar
        query={query}
        setQuery={setQuery}
        severity={severity}
        setSeverity={setSeverity}
        zone={zone}
        setZone={setZone}
        resultCount={filtered.length}
      />
      <div
        style={{
          flex: 1,
          borderRadius: 10,
          overflow: "hidden",
          border: `1px solid ${T.border}`,
          minHeight: 460,
        }}
      >
        <MapWithGeo
          alerts={filtered}
          loading={loading}
          selected={selected}
          onSelect={setSelected}
          showSearch={true}
          userLocation={userLocation}
          onLocateMe={onLocateMe}
        />
      </div>
    </Section>
  );
}

function IncidentsSection({
  alerts,
  loading,
  selected,
  setSelected,
  filterProps,
  onViewOnMap,
}) {
  const T = useTokens();
  const { query, setQuery, severity, setSeverity, zone, setZone, filtered } =
    filterProps;
  return (
    <Section>
      <PageHeader
        title="All Incidents"
        sub="Complete log of active and historical incidents"
      >
        <Btn variant="ghost">↓ Export</Btn>
      </PageHeader>
      <SearchFilterBar
        query={query}
        setQuery={setQuery}
        severity={severity}
        setSeverity={setSeverity}
        zone={zone}
        setZone={setZone}
        resultCount={filtered.length}
      />
      <div
        style={{
          borderRadius: 10,
          overflow: "hidden",
          border: `1px solid ${T.border}`,
          flex: 1,
        }}
      >
        <IncidentsTable
          alerts={filtered}
          loading={loading}
          selected={selected}
          onSelect={setSelected}
          onViewOnMap={onViewOnMap}
        />
      </div>
    </Section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   INCIDENTS TABLE — with View on Map button per row
───────────────────────────────────────────────────────────────────────── */
function IncidentsTable({ alerts, loading, selected, onSelect, onViewOnMap }) {
  const T = useTokens();

  if (loading) {
    return (
      <div
        style={{
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 52 }} />
        ))}
      </div>
    );
  }

  if (!alerts?.length) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: T.muted,
          fontFamily: mono,
          fontSize: 12,
        }}
      >
        NO INCIDENTS MATCH CURRENT FILTERS
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${T.border}` }}>
            {[
              "ID",
              "INCIDENT",
              "LOCATION",
              "SEVERITY",
              "ZONE",
              "TIME",
              "ACTION",
            ].map((h) => (
              <th
                key={h}
                style={{
                  padding: "10px 14px",
                  textAlign: "left",
                  fontFamily: mono,
                  fontSize: 9,
                  letterSpacing: ".5px",
                  color: T.muted,
                  fontWeight: 400,
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => {
            const col = sevColor(T, alert.severity);
            const isSelected = selected?.id === alert.id;
            return (
              <tr
                key={alert.id}
                onClick={() => onSelect(alert)}
                style={{
                  borderBottom: `1px solid ${T.border}`,
                  background: isSelected ? `${T.green}06` : "transparent",
                  cursor: "pointer",
                  transition: "background .12s",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected)
                    e.currentTarget.style.background = "rgba(255,255,255,.025)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <td
                  style={{
                    padding: "12px 14px",
                    fontFamily: mono,
                    fontSize: 10,
                    color: T.muted,
                    whiteSpace: "nowrap",
                  }}
                >
                  {alert.id}
                </td>
                <td style={{ padding: "12px 14px" }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: col,
                        flexShrink: 0,
                        boxShadow: `0 0 5px ${col}88`,
                        animation:
                          alert.severity === "critical"
                            ? "blink 1.2s infinite"
                            : "none",
                      }}
                    />
                    <div>
                      <div
                        style={{ fontSize: 13, fontWeight: 500, color: T.text }}
                      >
                        {alert.title}
                      </div>
                      {alert.description && (
                        <div
                          style={{
                            fontSize: 11,
                            color: T.muted,
                            marginTop: 2,
                            maxWidth: 260,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {alert.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td
                  style={{
                    padding: "12px 14px",
                    fontSize: 12,
                    color: T.textSub,
                    whiteSpace: "nowrap",
                  }}
                >
                  📍 {alert.location}
                </td>
                <td style={{ padding: "12px 14px" }}>
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 9,
                      background: `${col}14`,
                      border: `1px solid ${col}28`,
                      color: col,
                      borderRadius: 20,
                      padding: "3px 9px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {(alert.severity ?? "info").toUpperCase()}
                  </span>
                </td>
                <td
                  style={{
                    padding: "12px 14px",
                    fontFamily: mono,
                    fontSize: 10,
                    color: T.muted,
                  }}
                >
                  {alert.zone ?? "—"}
                </td>
                <td
                  style={{
                    padding: "12px 14px",
                    fontFamily: mono,
                    fontSize: 10,
                    color: T.muted,
                    whiteSpace: "nowrap",
                  }}
                >
                  {alert.time ?? "—"}
                </td>
                <td style={{ padding: "12px 14px" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewOnMap(alert);
                    }}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 6,
                      border: `1px solid ${T.blue}30`,
                      background: `${T.blue}0d`,
                      color: T.blue,
                      fontFamily: mono,
                      fontSize: 9,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all .15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${T.blue}1c`;
                      e.currentTarget.style.borderColor = `${T.blue}50`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `${T.blue}0d`;
                      e.currentTarget.style.borderColor = `${T.blue}30`;
                    }}
                  >
                    VIEW MAP →
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function InsightsSection({ alerts }) {
  const T = useTokens();
  return (
    <Section>
      <PageHeader
        title="AI Intelligence"
        sub="Predictive analysis powered by Responza AI"
      >
        <Chip color={T.green} bg={`${T.green}0d`} border={`${T.green}25`}>
          <LiveDot pulse size={4} />
          LIVE
        </Chip>
      </PageHeader>
      <div
        style={{
          flex: 1,
          borderRadius: 10,
          overflow: "hidden",
          border: `1px solid ${T.border}`,
        }}
      >
        <AIInsights alerts={alerts} />
      </div>
    </Section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   ROOT
───────────────────────────────────────────────────────────────────────── */
function DashboardInner({ setPage }) {
  const T = useTokens();

  const { alerts, loading, lastFetch, liveCount, refetch } = useAlerts();
  const { userLocation, locStatus, relocate } = useGeolocation();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [selected, setSelected] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [nextRefresh, setNextRefresh] = useState(REFRESH_MS);
  const [sectionKey, setSectionKey] = useState(0);

  const filterProps = useAlertFilter(alerts);

  const handleSectionChange = useCallback((id) => {
    setActiveSection(id);
    setSectionKey((k) => k + 1);
    if (id === "map") setSidebarOpen(false);
  }, []);

  const handleViewOnMap = useCallback(
    (alert) => {
      setSelected(alert);
      handleSectionChange("map");
    },
    [handleSectionChange],
  );

  useEffect(() => {
    const tick = setInterval(() => {
      setNextRefresh((p) => {
        if (p <= 1000) {
          refetch?.();
          return REFRESH_MS;
        }
        return p - 1000;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [refetch]);

  const handleRefreshNow = useCallback(() => {
    refetch?.();
    setNextRefresh(REFRESH_MS);
  }, [refetch]);

  const criticalCount = (alerts ?? []).filter(
    (a) => (a.severity ?? a.level ?? "").toLowerCase() === "critical",
  ).length;

  const sharedProps = {
    alerts,
    loading,
    selected,
    setSelected,
    filterProps,
    userLocation,
    onLocateMe: relocate,
  };

  return (
    <div
      style={{
        background: T.bg,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        transition: "background .3s",
      }}
    >
      <TopNavbar
        liveCount={liveCount}
        onGoHome={() => setPage("home")}
        nextRefresh={nextRefresh}
        onRefreshNow={handleRefreshNow}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        userLocation={userLocation}
        locStatus={locStatus}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar
          active={activeSection}
          onChange={handleSectionChange}
          open={sidebarOpen}
          alertCount={criticalCount}
          onNewAlert={() => {
            /* wire to your modal */
          }}
          onLocateMe={relocate}
        />

        <div
          key={sectionKey}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {activeSection === "dashboard" && (
            <DashboardSection
              {...sharedProps}
              liveCount={liveCount}
              lastFetch={lastFetch}
            />
          )}
          {activeSection === "map" && <MapSection {...sharedProps} />}
          {activeSection === "incidents" && (
            <IncidentsSection {...sharedProps} onViewOnMap={handleViewOnMap} />
          )}
          {activeSection === "insights" && <InsightsSection alerts={alerts} />}
          {activeSection === "chat" && (
            <div style={{ flex: 1, overflow: "auto", padding: "20px" }}>
              <div
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: `1px solid ${T.border}`,
                  height: "calc(100vh - 140px)",
                }}
              >
                <AIChat />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage({ setPage }) {
  return (
    <ThemeProvider>
      <DashboardInner setPage={setPage} />
    </ThemeProvider>
  );
}
