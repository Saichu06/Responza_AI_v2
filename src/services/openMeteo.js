// src/services/openMeteo.js
const BASE_URL = "https://api.open-meteo.com/v1/forecast";
const GEO_URL  = "https://geocoding-api.open-meteo.com/v1/search";

export const getWeatherData = async (lat, lon) => {
  const res = await fetch(
    `${BASE_URL}?latitude=${lat}&longitude=${lon}` +
    `&current_weather=true` +
    `&hourly=precipitation_probability,windspeed_10m,visibility` +
    `&daily=precipitation_sum,windspeed_10m_max,weathercode` +
    `&timezone=auto&forecast_days=3`
  );
  if (!res.ok) throw new Error("Weather fetch failed");
  return res.json();
};

export const getWeatherBatch = async (locations) => {
  const results = await Promise.allSettled(
    locations.map(({ lat, lon, id }) =>
      getWeatherData(lat, lon).then((data) => ({ id, data }))
    )
  );
  return results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);
};

// Search city by name — returns [{name, lat, lon, country}]
export const searchCity = async (query) => {
  const res = await fetch(`${GEO_URL}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  return (data.results || []).map((r) => ({
    name: r.name,
    country: r.country,
    lat: r.latitude,
    lon: r.longitude,
    display: `${r.name}, ${r.country}`,
  }));
};

// Map Open-Meteo weather codes to disaster risk
export const weatherCodeToRisk = (code, windspeed, precip) => {
  if (code >= 95)                 return { type: "Thunderstorm", sev: "critical", color: "#ff3b5c" };
  if (code >= 80 || precip > 20)  return { type: "Flood Risk",   sev: "high",     color: "#ffb930" };
  if (windspeed > 70)             return { type: "Storm",        sev: "critical", color: "#ff3b5c" };
  if (windspeed > 45)             return { type: "High Winds",   sev: "high",     color: "#ffb930" };
  if (code >= 71 && code <= 77)   return { type: "Blizzard",     sev: "high",     color: "#ffb930" };
  if (code >= 51 && code <= 67)   return { type: "Heavy Rain",   sev: "medium",   color: "#4d9fff" };
  return                                 { type: "Clear",        sev: "low",      color: "#00ff88" };
};

export const WMO_CODES = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Icy fog", 51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain", 71: "Light snow", 73: "Snow",
  75: "Heavy snow", 77: "Snow grains", 80: "Rain showers", 81: "Heavy showers",
  82: "Violent showers", 85: "Snow showers", 86: "Heavy snow showers",
  95: "Thunderstorm", 96: "Thunderstorm w/ hail", 99: "Thunderstorm w/ heavy hail",
};