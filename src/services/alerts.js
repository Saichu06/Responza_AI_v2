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
  // ========== ASIA PACIFIC ==========
  { id:"s1", name:"Tokyo",      lat:35.68, lon:139.69, x:770, y:135, type:"Earthquake", sev:"critical", color:"#ff3b5c", mag:"6.8",   temp:"22°C",  wind:"45 km/h",  precip:"0 mm",  precipProb:"5%",  description:"Seismic Event",  live:false },
  { id:"s2", name:"Chennai",    lat:13.08, lon:80.27,  x:590, y:195, type:"Flood",      sev:"critical", color:"#ff3b5c", mag:"Cat 3", temp:"31°C",  wind:"85 km/h",  precip:"120 mm",precipProb:"95%", description:"Severe Flooding",live:false },
  { id:"s3", name:"Mumbai",     lat:19.08, lon:72.88,  x:560, y:180, type:"Cyclone",    sev:"critical", color:"#ff3b5c", mag:"Cat 4", temp:"28°C",  wind:"140 km/h", precip:"80 mm", precipProb:"90%", description:"Tropical Cyclone",live:false },
  { id:"s4", name:"Shanghai",   lat:31.23, lon:121.47, x:742, y:125, type:"Typhoon",    sev:"critical", color:"#ff3b5c", mag:"Cat 5", temp:"25°C",  wind:"175 km/h", precip:"200 mm",precipProb:"99%", description:"Super Typhoon",  live:false },
  { id:"s5", name:"Delhi",      lat:28.61, lon:77.21,  x:530, y:155, type:"Heatwave",   sev:"medium",   color:"#4d9fff", mag:"48°C",  temp:"48°C",  wind:"20 km/h",  precip:"0 mm",  precipProb:"0%",  description:"Extreme Heat",    live:false },
  { id:"s6", name:"Bangkok",    lat:13.73, lon:100.50, x:685, y:200, type:"Flood",      sev:"high",     color:"#ffb930", mag:"Alert", temp:"32°C",  wind:"30 km/h",  precip:"90 mm", precipProb:"85%", description:"Urban Flooding", live:false },
  { id:"s7", name:"Jakarta",    lat:-6.17, lon:106.83, x:715, y:235, type:"Flood",      sev:"high",     color:"#ffb930", mag:"Alert", temp:"30°C",  wind:"25 km/h",  precip:"110 mm",precipProb:"90%", description:"Coastal Flood",  live:false },
  { id:"s8", name:"Manila",     lat:14.60, lon:120.98, x:740, y:195, type:"Typhoon",    sev:"critical", color:"#ff3b5c", mag:"Cat 4", temp:"29°C",  wind:"160 km/h", precip:"180 mm",precipProb:"95%", description:"Super Typhoon",  live:false },
  { id:"s9", name:"Seoul",      lat:37.57, lon:126.98, x:760, y:110, type:"Storm",      sev:"medium",   color:"#4d9fff", mag:"Alert", temp:"18°C",  wind:"55 km/h",  precip:"40 mm", precipProb:"75%", description:"Severe Storm",   live:false },
  { id:"s10",name:"Singapore",  lat:1.35,  lon:103.82, x:700, y:215, type:"Haze",       sev:"medium",   color:"#4d9fff", mag:"PSI 150",temp:"31°C", wind:"15 km/h",  precip:"10 mm", precipProb:"30%", description:"Air Quality Alert",live:false },
  { id:"s11",name:"Karachi",    lat:24.86, lon:67.01,  x:520, y:190, type:"Heatwave",   sev:"high",     color:"#ffb930", mag:"45°C",  temp:"45°C",  wind:"25 km/h",  precip:"0 mm",  precipProb:"0%",  description:"Extreme Heat",    live:false },
  { id:"s12",name:"Beijing",    lat:39.90, lon:116.40, x:735, y:105, type:"Dust Storm", sev:"medium",   color:"#4d9fff", mag:"Alert", temp:"22°C",  wind:"40 km/h",  precip:"0 mm",  precipProb:"10%", description:"Sandstorm",      live:false },

  // ========== NORTH AMERICA ==========
  { id:"s13",name:"San Francisco",lat:37.77,lon:-122.4, x:110, y:150, type:"Wildfire",   sev:"high",     color:"#ffb930", mag:"Lvl 4", temp:"38°C",  wind:"60 km/h",  precip:"0 mm",  precipProb:"2%",  description:"Active Wildfire", live:false },
  { id:"s14",name:"Los Angeles", lat:34.05, lon:-118.24, x:95,  y:170, type:"Wildfire",   sev:"high",     color:"#ffb930", mag:"Lvl 3", temp:"35°C",  wind:"45 km/h",  precip:"0 mm",  precipProb:"5%",  description:"Fire Risk",      live:false },
  { id:"s15",name:"New York",    lat:40.71, lon:-74.01,  x:230, y:115, type:"Storm",      sev:"medium",   color:"#4d9fff", mag:"Alert", temp:"20°C",  wind:"65 km/h",  precip:"35 mm", precipProb:"80%", description:"Coastal Storm",  live:false },
  { id:"s16",name:"Miami",       lat:25.76, lon:-80.19,  x:190, y:185, type:"Hurricane",  sev:"critical", color:"#ff3b5c", mag:"Cat 3", temp:"30°C",  wind:"185 km/h", precip:"150 mm",precipProb:"95%", description:"Hurricane Alert", live:false },
  { id:"s17",name:"Vancouver",   lat:49.28, lon:-123.12, x:55,  y:85,  type:"Flood",      sev:"high",     color:"#ffb930", mag:"Alert", temp:"14°C",  wind:"40 km/h",  precip:"75 mm", precipProb:"90%", description:"Heavy Rain",     live:false },
  { id:"s18",name:"Mexico City", lat:19.43, lon:-99.13,  x:130, y:210, type:"Earthquake", sev:"high",     color:"#ffb930", mag:"5.2",   temp:"22°C",  wind:"20 km/h",  precip:"5 mm",  precipProb:"20%", description:"Seismic Activity",live:false },

  // ========== EUROPE ==========
  { id:"s19",name:"London",     lat:51.51, lon:-0.13,   x:450, y:90,  type:"Storm",      sev:"medium",   color:"#4d9fff", mag:"80mph", temp:"12°C",  wind:"80 km/h",  precip:"15 mm", precipProb:"70%", description:"Severe Storm",    live:false },
  { id:"s20",name:"Paris",      lat:48.86, lon:2.35,    x:490, y:95,  type:"Heatwave",   sev:"medium",   color:"#4d9fff", mag:"38°C",  temp:"38°C",  wind:"15 km/h",  precip:"0 mm",  precipProb:"0%",  description:"Heat Alert",     live:false },
  { id:"s21",name:"Berlin",     lat:52.52, lon:13.41,   x:530, y:80,  type:"Storm",      sev:"medium",   color:"#4d9fff", mag:"Alert", temp:"16°C",  wind:"55 km/h",  precip:"25 mm", precipProb:"75%", description:"Thunderstorms",  live:false },
  { id:"s22",name:"Rome",       lat:41.90, lon:12.50,   x:570, y:115, type:"Heatwave",   sev:"high",     color:"#ffb930", mag:"42°C",  temp:"42°C",  wind:"20 km/h",  precip:"0 mm",  precipProb:"5%",  description:"Extreme Heat",    live:false },

  // ========== AUSTRALIA ==========
  { id:"s23",name:"Sydney",     lat:-33.87,lon:151.21,  x:752, y:340, type:"Wildfire",   sev:"critical", color:"#ff3b5c", mag:"Lvl 5", temp:"42°C",  wind:"55 km/h",  precip:"0 mm",  precipProb:"1%",  description:"Extreme Wildfire",live:false },
  { id:"s24",name:"Brisbane",   lat:-27.47,lon:153.03,  x:770, y:325, type:"Flood",      sev:"high",     color:"#ffb930", mag:"Alert", temp:"28°C",  wind:"35 km/h",  precip:"95 mm", precipProb:"85%", description:"River Flooding", live:false },
  { id:"s25",name:"Perth",      lat:-31.95,lon:115.86,  x:700, y:345, type:"Heatwave",   sev:"high",     color:"#ffb930", mag:"43°C",  temp:"43°C",  wind:"25 km/h",  precip:"0 mm",  precipProb:"0%",  description:"Extreme Heat",    live:false },

  // ========== SOUTH AMERICA ==========
  { id:"s26",name:"São Paulo",  lat:-23.55,lon:-46.63,  x:340, y:290, type:"Flood",      sev:"high",     color:"#ffb930", mag:"Alert", temp:"27°C",  wind:"30 km/h",  precip:"85 mm", precipProb:"80%", description:"Heavy Rainfall", live:false },
  { id:"s27",name:"Rio",        lat:-22.91,lon:-43.17,  x:355, y:280, type:"Landslide",  sev:"high",     color:"#ffb930", mag:"Alert", temp:"29°C",  wind:"20 km/h",  precip:"110 mm",precipProb:"90%", description:"Mudslide Risk",  live:false },

  // ========== AFRICA ==========
  { id:"s28",name:"Cape Town",  lat:-33.92,lon:18.42,   x:380, y:330, type:"Drought",    sev:"high",     color:"#ffb930", mag:"Alert", temp:"32°C",  wind:"25 km/h",  precip:"0 mm",  precipProb:"0%",  description:"Water Crisis",   live:false },
  { id:"s29",name:"Nairobi",    lat:-1.29, lon:36.82,   x:500, y:255, type:"Flood",      sev:"medium",   color:"#4d9fff", mag:"Alert", temp:"24°C",  wind:"20 km/h",  precip:"60 mm", precipProb:"75%", description:"Flash Floods",   live:false },
  { id:"s30",name:"Cairo",      lat:30.04, lon:31.24,   x:535, y:155, type:"Heatwave",   sev:"high",     color:"#ffb930", mag:"44°C",  temp:"44°C",  wind:"15 km/h",  precip:"0 mm",  precipProb:"0%",  description:"Extreme Heat",    live:false },

  // ========== REMAINING ORIGINALS ==========
  { id:"s31",name:"Bali",       lat:-8.34, lon:115.09,  x:700, y:240, type:"Tsunami",    sev:"critical", color:"#ff3b5c", mag:"Alert", temp:"27°C",  wind:"30 km/h",  precip:"5 mm",  precipProb:"40%", description:"Tsunami Alert",   live:false },
];