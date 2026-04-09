import { weatherCodeToRisk, WMO_CODES } from "./openMeteo";

// Convert raw weather API response into a structured alert object
export const buildAlert = (location, weatherData) => {
  const cw     = weatherData.current_weather;
  const daily  = weatherData.daily;
  const hourly = weatherData.hourly;

  const maxPrecip   = daily?.precipitation_sum?.[0] ?? 0;
  const maxWind     = daily?.windspeed_10m_max?.[0]  ?? cw.windspeed;
  const risk        = weatherCodeToRisk(cw.weathercode, maxWind, maxPrecip);
  const description = WMO_CODES[cw.weathercode] ?? "Unknown";
  const precipProb  = hourly?.precipitation_probability?.[0] ?? 0;

  return {
    id:          location.id,
    name:        location.name,
    lat:         location.lat,
    lon:         location.lon,
    x:           location.x,
    y:           location.y,
    type:        risk.type,
    sev:         risk.sev,
    color:       risk.color,
    mag:         `${Math.round(cw.windspeed)} km/h`,
    temp:        `${Math.round(cw.temperature)}°C`,
    wind:        `${Math.round(maxWind)} km/h`,
    precip:      `${maxPrecip.toFixed(1)} mm`,
    precipProb:  `${precipProb}%`,
    description,
    weathercode: cw.weathercode,
    timestamp:   cw.time,
    live:        true,
  };
};

export const SEV_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export const sortAlerts = (alerts) =>
  [...alerts].sort((a, b) => SEV_ORDER[a.sev] - SEV_ORDER[b.sev]);

export const filterAlerts = (alerts, sev) =>
  sev === "all" ? alerts : alerts.filter((a) => a.sev === sev);

// Static fallback incidents (shown when API is loading or offline)
export const STATIC_INCIDENTS = [
  { id:"s1", name:"Tokyo",      lat:35.68, lon:139.69, x:770, y:135, type:"Earthquake", sev:"critical", color:"#ff3b5c", mag:"6.8",   temp:"22°C",  wind:"45 km/h",  precip:"0 mm",  precipProb:"5%",  description:"Seismic Event",  live:false },
  { id:"s2", name:"Chennai",    lat:13.08, lon:80.27,  x:590, y:195, type:"Flood",      sev:"critical", color:"#ff3b5c", mag:"Cat 3", temp:"31°C",  wind:"85 km/h",  precip:"120 mm",precipProb:"95%", description:"Severe Flooding",live:false },
  { id:"s3", name:"Mumbai",     lat:19.08, lon:72.88,  x:560, y:180, type:"Cyclone",    sev:"critical", color:"#ff3b5c", mag:"Cat 4", temp:"28°C",  wind:"140 km/h", precip:"80 mm", precipProb:"90%", description:"Tropical Cyclone",live:false },
  { id:"s4", name:"San Francisco",lat:37.77,lon:-122.4,x:110, y:150, type:"Wildfire",   sev:"high",     color:"#ffb930", mag:"Lvl 4", temp:"38°C",  wind:"60 km/h",  precip:"0 mm",  precipProb:"2%",  description:"Active Wildfire", live:false },
  { id:"s5", name:"Sydney",     lat:-33.87,lon:151.21, x:752, y:340, type:"Wildfire",   sev:"critical", color:"#ff3b5c", mag:"Lvl 5", temp:"42°C",  wind:"55 km/h",  precip:"0 mm",  precipProb:"1%",  description:"Extreme Wildfire",live:false },
  { id:"s6", name:"Shanghai",   lat:31.23, lon:121.47, x:742, y:125, type:"Typhoon",    sev:"critical", color:"#ff3b5c", mag:"Cat 5", temp:"25°C",  wind:"175 km/h", precip:"200 mm",precipProb:"99%", description:"Super Typhoon",  live:false },
  { id:"s7", name:"Delhi",      lat:28.61, lon:77.21,  x:530, y:155, type:"Heatwave",   sev:"medium",   color:"#4d9fff", mag:"48°C",  temp:"48°C",  wind:"20 km/h",  precip:"0 mm",  precipProb:"0%",  description:"Extreme Heat",    live:false },
  { id:"s8", name:"London",     lat:51.51, lon:-0.13,  x:450, y:90,  type:"Storm",      sev:"medium",   color:"#4d9fff", mag:"80mph", temp:"12°C",  wind:"80 km/h",  precip:"15 mm", precipProb:"70%", description:"Severe Storm",    live:false },
  { id:"s9", name:"Bali",       lat:-8.34, lon:115.09, x:700, y:240, type:"Tsunami",    sev:"critical", color:"#ff3b5c", mag:"Alert", temp:"27°C",  wind:"30 km/h",  precip:"5 mm",  precipProb:"40%", description:"Tsunami Alert",   live:false },
];