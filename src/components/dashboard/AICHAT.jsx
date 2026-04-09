import { useState, useRef, useEffect } from "react";
import { COLORS, FONTS } from "../../utils/constants";

const css = `
@keyframes chatSlideIn {
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes typingDot {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-8px); }
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.typing-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${COLORS.green};
  margin: 0 2px;
  animation: typingDot 1.2s infinite;
}
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }
`;

// FREE Weather API (No API key required)
const GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API = "https://api.open-meteo.com/v1/forecast";
const AIR_QUALITY_API = "https://air-quality-api.open-meteo.com/v1/air-quality";

// Expanded city database with coordinates
const CITY_DATABASE = {
  mumbai: { lat: 19.076, lon: 72.877, name: "Mumbai", state: "Maharashtra", region: "west" },
  delhi: { lat: 28.704, lon: 77.103, name: "Delhi", state: "Delhi", region: "north" },
  chennai: { lat: 13.083, lon: 80.271, name: "Chennai", state: "Tamil Nadu", region: "south" },
  kolkata: { lat: 22.573, lon: 88.364, name: "Kolkata", state: "West Bengal", region: "east" },
  bangalore: { lat: 12.971, lon: 77.594, name: "Bangalore", state: "Karnataka", region: "south" },
  hyderabad: { lat: 17.385, lon: 78.487, name: "Hyderabad", state: "Telangana", region: "south" },
  pune: { lat: 18.520, lon: 73.857, name: "Pune", state: "Maharashtra", region: "west" },
  ahmedabad: { lat: 23.023, lon: 72.572, name: "Ahmedabad", state: "Gujarat", region: "west" },
  jaipur: { lat: 26.922, lon: 75.779, name: "Jaipur", state: "Rajasthan", region: "north" },
  lucknow: { lat: 26.846, lon: 80.946, name: "Lucknow", state: "Uttar Pradesh", region: "north" },
  patna: { lat: 25.594, lon: 85.137, name: "Patna", state: "Bihar", region: "east" },
  bhopal: { lat: 23.259, lon: 77.412, name: "Bhopal", state: "Madhya Pradesh", region: "central" },
  chandigarh: { lat: 30.733, lon: 76.779, name: "Chandigarh", state: "Chandigarh", region: "north" },
  guwahati: { lat: 26.144, lon: 91.736, name: "Guwahati", state: "Assam", region: "northeast" },
  bhubaneswar: { lat: 20.296, lon: 85.824, name: "Bhubaneswar", state: "Odisha", region: "east" },
  thiruvananthapuram: { lat: 8.524, lon: 76.936, name: "Thiruvananthapuram", state: "Kerala", region: "south" },
  visakhapatnam: { lat: 17.686, lon: 83.218, name: "Visakhapatnam", state: "Andhra Pradesh", region: "south" },
  coimbatore: { lat: 11.016, lon: 76.955, name: "Coimbatore", state: "Tamil Nadu", region: "south" },
  nagpur: { lat: 21.146, lon: 79.088, name: "Nagpur", state: "Maharashtra", region: "central" },
  indore: { lat: 22.719, lon: 75.857, name: "Indore", state: "Madhya Pradesh", region: "central" },
  surat: { lat: 21.170, lon: 72.831, name: "Surat", state: "Gujarat", region: "west" },
  vadodara: { lat: 22.307, lon: 73.181, name: "Vadodara", state: "Gujarat", region: "west" },
  ranchi: { lat: 23.344, lon: 85.309, name: "Ranchi", state: "Jharkhand", region: "east" },
  raipur: { lat: 21.251, lon: 81.629, name: "Raipur", state: "Chhattisgarh", region: "central" },
  srinagar: { lat: 34.083, lon: 74.797, name: "Srinagar", state: "Jammu & Kashmir", region: "north" },
  shimla: { lat: 31.104, lon: 77.173, name: "Shimla", state: "Himachal Pradesh", region: "north" },
  dehradun: { lat: 30.316, lon: 78.032, name: "Dehradun", state: "Uttarakhand", region: "north" },
  // Suburbs/localities
  mylapore: { lat: 13.033, lon: 80.270, name: "Mylapore", parent: "Chennai" },
  adyar: { lat: 13.005, lon: 80.256, name: "Adyar", parent: "Chennai" },
  bandra: { lat: 19.060, lon: 72.841, name: "Bandra", parent: "Mumbai" },
  andheri: { lat: 19.120, lon: 72.847, name: "Andheri", parent: "Mumbai" },
  koramangala: { lat: 12.927, lon: 77.627, name: "Koramangala", parent: "Bangalore" },
  indiranagar: { lat: 12.978, lon: 77.640, name: "Indiranagar", parent: "Bangalore" },
  connaught: { lat: 28.632, lon: 77.220, name: "Connaught Place", parent: "Delhi" },
};

// Disaster risk levels
const DISASTER_RISK_LEVELS = {
  LOW: { level: "LOW", color: "#22c55e", advice: "Normal precautions advised" },
  MODERATE: { level: "MODERATE", color: "#f59e0b", advice: "Stay alert and monitor updates" },
  HIGH: { level: "HIGH", color: "#ef4444", advice: "Take immediate precautions" },
  SEVERE: { level: "SEVERE", color: "#7f1d1d", advice: "EVACUATE if advised by authorities" },
};

// Historical disaster data by region (India)
const REGIONAL_DISASTER_RISKS = {
  north: { earthquakes: "HIGH", floods: "MODERATE", landslides: "MODERATE", heatwaves: "HIGH", coldwaves: "HIGH" },
  south: { earthquakes: "LOW", floods: "HIGH", landslides: "HIGH", cyclones: "HIGH", heatwaves: "MODERATE" },
  east: { earthquakes: "MODERATE", floods: "HIGH", cyclones: "SEVERE", landslides: "MODERATE" },
  west: { earthquakes: "LOW", floods: "MODERATE", cyclones: "HIGH", droughts: "HIGH", heatwaves: "HIGH" },
  central: { earthquakes: "LOW", floods: "MODERATE", droughts: "HIGH", heatwaves: "HIGH" },
  northeast: { earthquakes: "SEVERE", floods: "SEVERE", landslides: "SEVERE", cyclones: "MODERATE" },
};

// Extract city from message
function extractCity(message) {
  const lowerMsg = message.toLowerCase();
  for (const [key, data] of Object.entries(CITY_DATABASE)) {
    if (lowerMsg.includes(key)) {
      return data;
    }
  }
  return null;
}

// Extract date from message
function extractDate(message) {
  const lowerMsg = message.toLowerCase();
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (lowerMsg.includes("today")) return today;
  if (lowerMsg.includes("tomorrow")) return tomorrow;
  
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  for (let i = 0; i < days.length; i++) {
    if (lowerMsg.includes(days[i])) {
      const targetDay = i;
      const currentDay = today.getDay();
      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0) daysToAdd += 7;
      const result = new Date(today);
      result.setDate(result.getDate() + daysToAdd);
      return result;
    }
  }
  return null;
}

// Get weather data from Open-Meteo (current + forecast)
async function getWeatherData(lat, lon, forecastDays = 0) {
  try {
    let url;
    if (forecastDays > 0) {
      url = `${WEATHER_API}?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,precipitation_probability,rain,showers,snowfall,cloudcover,windspeed_10m,winddirection_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_max,windspeed_10m_max&timezone=auto&forecast_days=${forecastDays}`;
    } else {
      url = `${WEATHER_API}?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
    }
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Weather API error:", error);
    return null;
  }
}

// Get air quality data
async function getAirQualityData(lat, lon) {
  try {
    const url = `${AIR_QUALITY_API}?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2.5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide&timezone=auto`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Air Quality API error:", error);
    return null;
  }
}

// Get weather description
function getWeatherDescription(code) {
  const weatherCodes = {
    0: "Clear sky ☀️",
    1: "Mainly clear 🌤️",
    2: "Partly cloudy ⛅",
    3: "Overcast ☁️",
    45: "Foggy 🌫️",
    48: "Depositing rime fog 🌫️",
    51: "Light drizzle 🌦️",
    53: "Moderate drizzle 🌧️",
    55: "Heavy drizzle 🌧️",
    56: "Freezing drizzle ❄️🌧️",
    57: "Heavy freezing drizzle ❄️🌧️",
    61: "Light rain 🌦️",
    63: "Moderate rain 🌧️",
    65: "Heavy rain 🌧️",
    66: "Light freezing rain ❄️🌧️",
    67: "Heavy freezing rain ❄️🌧️",
    71: "Light snow 🌨️",
    73: "Moderate snow ❄️",
    75: "Heavy snow ❄️",
    77: "Snow grains ❄️",
    80: "Rain showers 🌦️",
    81: "Heavy rain showers 🌧️",
    82: "Violent rain showers 💧💧",
    85: "Snow showers 🌨️",
    86: "Heavy snow showers ❄️❄️",
    95: "Thunderstorm ⛈️",
    96: "Thunderstorm with hail ⛈️🧊",
    99: "Severe thunderstorm with hail ⛈️🧊🧊",
  };
  return weatherCodes[code] || "Unknown conditions";
}

// Get air quality description
function getAirQualityDescription(aqi) {
  if (!aqi) return "Data unavailable";
  if (aqi <= 50) return "Good 🌟 - Air quality is satisfactory";
  if (aqi <= 100) return "Moderate ⚠️ - Acceptable air quality";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups 😷 - Sensitive individuals should reduce outdoor activity";
  if (aqi <= 200) return "Unhealthy 😷 - Everyone may experience health effects";
  if (aqi <= 300) return "Very Unhealthy ⚠️😷 - Health alert: everyone may experience serious effects";
  return "Hazardous 🚫 - Health warning of emergency conditions";
}

// Get comprehensive disaster risk assessment
function getDisasterRiskAssessment(weatherData, airQualityData, locationName, region) {
  const temp = weatherData?.current_weather?.temperature;
  const wind = weatherData?.current_weather?.windspeed;
  const code = weatherData?.current_weather?.weathercode;
  const aqi = airQualityData?.current?.us_aqi;
  const regionalRisks = REGIONAL_DISASTER_RISKS[region] || REGIONAL_DISASTER_RISKS.central;
  
  const risks = [];
  const precautions = [];
  
  // Temperature-based risks
  if (temp > 45) {
    risks.push({ type: "Extreme Heatwave", level: DISASTER_RISK_LEVELS.SEVERE, detail: "Dangerous temperatures - avoid outdoor activity" });
    precautions.push("🌡️ Stay indoors with air conditioning or cooling centers");
    precautions.push("💧 Drink water every 15-20 minutes, even if not thirsty");
    precautions.push("👥 Check on elderly neighbors and vulnerable individuals");
  } else if (temp > 40) {
    risks.push({ type: "Severe Heatwave", level: DISASTER_RISK_LEVELS.HIGH, detail: "High risk of heat exhaustion/stroke" });
    precautions.push("🌡️ Limit outdoor activity between 12 PM - 4 PM");
    precautions.push("💧 Stay hydrated - avoid caffeine and alcohol");
  } else if (temp > 37) {
    risks.push({ type: "Heat Alert", level: DISASTER_RISK_LEVELS.MODERATE, detail: "Above normal temperatures" });
  } else if (temp < 5) {
    risks.push({ type: "Cold Wave", level: DISASTER_RISK_LEVELS.HIGH, detail: "Dangerously cold conditions" });
    precautions.push("🧣 Dress in warm layers, cover extremities");
    precautions.push("🏠 Ensure proper heating and ventilation");
  } else if (temp < 10) {
    risks.push({ type: "Cold Alert", level: DISASTER_RISK_LEVELS.MODERATE, detail: "Unusually cold conditions" });
  }
  
  // Wind-based risks
  if (wind > 100) {
    risks.push({ type: "Extreme Cyclonic Wind", level: DISASTER_RISK_LEVELS.SEVERE, detail: "Life-threatening wind speeds" });
    precautions.push("🏠 Stay in a sturdy interior room away from windows");
    precautions.push("📻 Listen for evacuation orders immediately");
  } else if (wind > 80) {
    risks.push({ type: "Cyclone Alert", level: DISASTER_RISK_LEVELS.HIGH, detail: "Severe wind speeds expected" });
    precautions.push("🔒 Secure all outdoor objects and windows");
    precautions.push("🎒 Prepare emergency kit for potential evacuation");
  } else if (wind > 60) {
    risks.push({ type: "Strong Winds", level: DISASTER_RISK_LEVELS.MODERATE, detail: "Gusty conditions may cause damage" });
    precautions.push("🧹 Secure loose objects on balconies/patios");
    precautions.push("🚗 Exercise caution while driving high-profile vehicles");
  } else if (wind > 40) {
    risks.push({ type: "Moderate Winds", level: DISASTER_RISK_LEVELS.LOW, detail: "Windy conditions expected" });
  }
  
  // Precipitation/Flood risks
  if (code >= 95) {
    risks.push({ type: "Severe Thunderstorm", level: DISASTER_RISK_LEVELS.HIGH, detail: "Lightning and heavy rainfall expected" });
    precautions.push("⚡ Stay indoors, avoid using electronics/plumbing");
    precautions.push("🏠 Avoid open fields, hilltops, and isolated trees");
  } else if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    risks.push({ type: "Heavy Rainfall", level: DISASTER_RISK_LEVELS.MODERATE, detail: "Risk of localized flooding" });
    precautions.push("🌊 Avoid low-lying areas and underpasses");
    precautions.push("🚗 Never drive through flooded roads - Turn Around Don't Drown");
  }
  
  // Regional disaster risks
  if (regionalRisks.earthquakes === "SEVERE" || regionalRisks.earthquakes === "HIGH") {
    risks.push({ type: "Earthquake Prone Zone", level: DISASTER_RISK_LEVELS[regionalRisks.earthquakes === "SEVERE" ? "HIGH" : "MODERATE"], detail: "This region is seismically active" });
    precautions.push("🏠 Secure heavy furniture and objects that could fall");
    precautions.push("📝 Practice 'Drop, Cover, Hold On' earthquake drill");
  }
  
  if (regionalRisks.cyclones === "SEVERE" || regionalRisks.cyclones === "HIGH") {
    risks.push({ type: "Cyclone Prone Coast", level: DISASTER_RISK_LEVELS.MODERATE, detail: "Coastal area susceptible to cyclonic storms" });
    precautions.push("📡 Know your cyclone evacuation route and shelter location");
    precautions.push("🎒 Keep cyclone emergency kit ready (water, food, documents)");
  }
  
  if (regionalRisks.floods === "SEVERE" || regionalRisks.floods === "HIGH") {
    risks.push({ type: "Flood Prone Area", level: DISASTER_RISK_LEVELS.MODERATE, detail: "Risk of flooding during heavy rainfall" });
    precautions.push("🏔️ Identify higher ground for evacuation if needed");
    precautions.push("📻 Monitor flood warnings and water levels");
  }
  
  // Air quality risk
  if (aqi && aqi > 200) {
    risks.push({ type: "Hazardous Air Quality", level: DISASTER_RISK_LEVELS.SEVERE, detail: "Emergency health conditions" });
    precautions.push("😷 Wear N95 masks when outdoors");
    precautions.push("🏠 Use air purifiers indoors, keep windows closed");
  } else if (aqi && aqi > 150) {
    risks.push({ type: "Poor Air Quality", level: DISASTER_RISK_LEVELS.HIGH, detail: "Health effects possible" });
    precautions.push("😷 Limit outdoor exertion, wear masks if sensitive");
  }
  
  return { risks, precautions };
}

// Generate summary insights
function generateSummaryInsights(weatherData, airQualityData, locationName) {
  const temp = weatherData?.current_weather?.temperature;
  const wind = weatherData?.current_weather?.windspeed;
  const weatherCode = weatherData?.current_weather?.weathercode;
  const aqi = airQualityData?.current?.us_aqi;
  const pm25 = airQualityData?.current?.pm2_5;
  
  let summary = `📊 **Weather Summary for ${locationName}**\n\n`;
  summary += `🌡️ **Temperature:** ${Math.round(temp)}°C (${temp > 30 ? 'Hot' : temp > 20 ? 'Warm' : temp > 15 ? 'Mild' : temp > 10 ? 'Cool' : 'Cold'})\n`;
  summary += `💨 **Wind:** ${Math.round(wind)} km/h (${wind > 50 ? 'Very Windy' : wind > 30 ? 'Windy' : wind > 15 ? 'Breezy' : 'Calm'})\n`;
  summary += `🌤️ **Conditions:** ${getWeatherDescription(weatherCode)}\n`;
  
  if (aqi) {
    summary += `😮‍💨 **Air Quality:** AQI ${aqi} - ${getAirQualityDescription(aqi)}\n`;
    if (pm25) summary += `   • PM2.5: ${pm25.toFixed(1)} µg/m³\n`;
  }
  
  summary += `\n💡 **Key Recommendations:**\n`;
  if (temp > 35) summary += `   • ⚠️ Heat alert - stay hydrated and avoid peak sun hours\n`;
  if (temp < 10) summary += `   • 🧣 Cold alert - dress in warm layers\n`;
  if (wind > 40) summary += `   • 🧹 Secure outdoor objects from strong winds\n`;
  if (weatherCode >= 95) summary += `   • ⛈️ Thunderstorm risk - stay indoors\n`;
  if (weatherCode >= 61 && weatherCode <= 67) summary += `   • 🌧️ Carry umbrella, avoid waterlogged areas\n`;
  
  return summary;
}

// Get forecast for specific date
async function getForecastForDate(lat, lon, targetDate) {
  try {
    const weatherData = await getWeatherData(lat, lon, 7);
    if (!weatherData || !weatherData.daily) return null;
    
    const targetStr = targetDate.toISOString().split('T')[0];
    const dailyData = weatherData.daily;
    
    let targetIndex = -1;
    for (let i = 0; i < dailyData.time.length; i++) {
      if (dailyData.time[i] === targetStr) {
        targetIndex = i;
        break;
      }
    }
    
    if (targetIndex === -1) return null;
    
    return {
      date: targetStr,
      maxTemp: Math.round(dailyData.temperature_2m_max[targetIndex]),
      minTemp: Math.round(dailyData.temperature_2m_min[targetIndex]),
      weatherCode: dailyData.weathercode[targetIndex],
      precipitation: dailyData.precipitation_sum[targetIndex],
      precipitationProb: dailyData.precipitation_probability_max[targetIndex],
      maxWind: Math.round(dailyData.windspeed_10m_max[targetIndex]),
      sunrise: dailyData.sunrise[targetIndex],
      sunset: dailyData.sunset[targetIndex],
    };
  } catch (error) {
    console.error("Forecast error:", error);
    return null;
  }
}

// Earthquake safety and information
function getEarthquakeResponse(query) {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes("prediction") || lowerQuery.includes("predict")) {
    return "🌋 **Earthquake Prediction Information**\n\n" +
      "⚠️ **Important:** Earthquakes CANNOT be reliably predicted with current technology.\n\n" +
      "**What we CAN do:**\n" +
      "• 🚨 Earthquake Early Warning (EEW) systems provide seconds to minutes of warning after detection\n" +
      "• 📊 Seismic hazard maps show high-risk zones\n" +
      "• 🔬 Scientists study precursors but no reliable prediction method exists\n\n" +
      "**In India, high-risk zones include:**\n" +
      "• Zone V (Very High): Northeast India, Kashmir, Himachal, Uttarakhand, Kutch (Gujarat)\n" +
      "• Zone IV (High): Delhi, Bihar, West Bengal, parts of Maharashtra\n\n" +
      "**Be Prepared:** Focus on earthquake-resistant construction and emergency drills instead of prediction!";
  }
  
  return "🌋 **EARTHQUAKE SAFETY - DROP, COVER, HOLD ON**\n\n" +
    "**During the shaking:**\n" +
    "1. 🛑 **DROP** to your hands and knees immediately\n" +
    "2. 🪑 **COVER** under sturdy furniture (table, desk) and protect head/neck\n" +
    "3. 🤲 **HOLD ON** to your cover until shaking stops\n\n" +
    "**If no shelter:**\n" +
    "• 📐 Sit against interior wall, protect head with arms\n" +
    "• 🚫 Stay away from windows, glass, exterior walls\n\n" +
    "**If outside:**\n" +
    "• 🏃 Move to open area away from buildings, trees, power lines\n\n" +
    "**If driving:**\n" +
    "• 🚗 Pull over safely, stay in vehicle\n\n" +
    "**After earthquake:**\n" +
    "• 🔍 Check for injuries and gas leaks\n" +
    "• ⚡ Expect aftershocks\n" +
    "• 🌊 If near coast, move to higher ground (tsunami risk)\n" +
    "• 📻 Listen to emergency broadcasts";
}

// Flood safety response
function getFloodResponse() {
  return "🌊 **FLOOD SAFETY & RESPONSE**\n\n" +
    "**Before/During Flood:**\n" +
    "1. 🏔️ **Move to higher ground immediately** - don't wait for evacuation orders\n" +
    "2. 🚫 **NEVER walk or drive through flood water** - 6 inches can knock you down, 12 inches floats a car\n" +
    "3. 🔌 **Turn off utilities** at main switches if instructed\n" +
    "4. 📻 **Listen to evacuation orders** and official instructions\n" +
    "5. 🎒 **Take emergency kit** with documents, medicines, water, food\n\n" +
    "**If trapped in vehicle:**\n" +
    "• 🚪 Abandon vehicle and move to higher ground immediately\n" +
    "• 🏊 If swept away, try to float feet-first downstream\n\n" +
    "**After Flood:**\n" +
    "• 🏠 Return home only when authorities say safe\n" +
    "• ⚡ Avoid standing water (may be electrically charged)\n" +
    "• 📸 Document damage for insurance claims\n" +
    "• 🥫 Throw away food that touched flood water\n" +
    "• 🧼 Clean and disinfect everything that got wet\n\n" +
    "**🚨 Emergency Numbers (India):** 112 (All emergencies), 101 (Fire), 102 (Ambulance)";
}

// Cyclone/Storm response
function getCycloneResponse() {
  return "🌀 **CYCLONE/STORM SAFETY**\n\n" +
    "**Before Cyclone (when warning issued):**\n" +
    "1. 🪟 **Board up windows** or close storm shutters\n" +
    "2. 🧹 **Secure outdoor objects** (furniture, plants, water tanks)\n" +
    "3. 🎒 **Prepare emergency kit** with 7-day supplies\n" +
    "4. 📻 **Charge all devices** and keep backup batteries\n" +
    "5. 🚗 **Know your evacuation zone** and routes\n" +
    "6. 📝 **Store important documents** in waterproof bags\n\n" +
    "**During the Storm:**\n" +
    "• 🏠 Stay indoors in strongest part of house (interior room, closet)\n" +
    "• 🚫 Stay away from windows, skylights, glass doors\n" +
    "• 🚪 Use mattresses for protection if roof starts to fail\n" +
    "• 📡 Listen for official warnings and updates\n\n" +
    "**If Evacuation Ordered:**\n" +
    "• 🏃 Leave immediately - don't wait!\n" +
    "• 🚫 Don't drive through flooded roads\n\n" +
    "**After Cyclone:**\n" +
    "• 🔍 Watch for downed power lines and debris\n" +
    "• 💧 Boil tap water until declared safe\n" +
    "• 📻 Continue listening for updates\n\n" +
    "💡 **Cyclone-prone states in India:** Odisha, Andhra, Tamil Nadu, West Bengal, Gujarat, Maharashtra";
}

// Landslide response
function getLandslideResponse() {
  return "🏔️ **LANDSLIDE SAFETY**\n\n" +
    "**Warning Signs:**\n" +
    "• Cracks appearing in ground or walls\n" +
    "• Doors/windows sticking or jamming\n" +
    "• Fences, retaining walls, or utility poles tilting\n" +
    "• Rumbling sound that increases in volume\n" +
    "• Sudden changes in water flow in streams\n\n" +
    "**During Landslide:**\n" +
    "1. 🏃 **Move away from path** - perpendicular to slide direction\n" +
    "2. 🪨 **Get to higher ground** away from hillside\n" +
    "3. 🚫 Don't cross landslide path\n" +
    "4. 🏠 If inside, take cover under sturdy furniture\n\n" +
    "**If Driving:**\n" +
    "• 🚗 Stay alert, watch for falling rocks and debris\n" +
    "• 🛑 Pull over to safe area away from slopes\n\n" +
    "**High-risk areas in India:**\n" +
    "• Himalayan regions (Uttarakhand, Himachal, J&K, Sikkim)\n" +
    "• Western Ghats (Kerala, Karnataka, Maharashtra, Tamil Nadu)\n" +
    "• Northeastern states\n\n" +
    "⚠️ After landslide, watch for secondary slides and flooding!";
}

// Tsunami response
function getTsunamiResponse() {
  return "🌊 **TSUNAMI SAFETY**\n\n" +
    "**Natural Warning Signs:**\n" +
    "• 🌋 Strong or long earthquake (20+ seconds)\n" +
    "• 🌊 Unusual ocean behavior - rapid receding or rising\n" +
    "• 🔊 Roaring ocean sound like jet engine\n\n" +
    "**IMMEDIATE ACTION:**\n" +
    "1. 🏔️ **Move to higher ground** (at least 30 meters/100 feet elevation)\n" +
    "2. 🚶 **Walk, don't drive** - roads may be damaged\n" +
    "3. 🏃 **Go inland** at least 3 kilometers/2 miles\n" +
    "4. ⏰ **Don't wait for official warning** - natural signs mean tsunami imminent\n\n" +
    "**Do NOT:**\n" +
    "• 🚫 Go to the shore to watch\n" +
    "• 🚫 Return to coast until official ALL CLEAR\n" +
    "• 🚫 Assume one wave means it's over - largest may be later\n\n" +
    "**Indian Ocean Tsunami Risk Areas:**\n" +
    "• Andaman & Nicobar Islands, Chennai, Kochi, Visakhapatnam, Mumbai, Puri\n\n" +
    "📡 **Tsunami Warning Systems:** Indian Tsunami Early Warning Centre (ITEWC) monitors and issues alerts";
}

// Fire/Wildfire response
function getFireResponse() {
  return "🔥 **WILDFIRE/FIRE SAFETY**\n\n" +
    "**If Under Evacuation Order:**\n" +
    "1. 🚪 **Evacuate immediately** - don't wait!\n" +
    "2. 👕 **Wear protective clothing** (long sleeves, pants, boots, mask)\n" +
    "3. 🪟 **Close all windows and doors**\n" +
    "4. 🎒 **Take emergency kit** and important documents\n" +
    "5. 🚗 **Follow designated evacuation routes**\n" +
    "6. 📻 **Stay informed** via local alerts\n\n" +
    "**If Trapped:**\n" +
    "• 📞 Call emergency services with your location\n" +
    "• 🏔️ Go to area clear of vegetation\n" +
    "• 🏊 Lie face down in ditch/water body, cover with soil\n" +
    "• 😷 Cover mouth and nose with cloth\n\n" +
    "**Prepare in Advance:**\n" +
    "• Create 30-100 feet defensible space around home\n" +
    "• Remove dead vegetation and flammable materials\n" +
    "• Keep fire extinguisher and water source ready\n\n" +
    "🔥 **Forest Fire-prone areas in India:** Uttarakhand, Himachal, Jharkhand, Odisha, Maharashtra, Karnataka";
}

// Heatwave response
function getHeatwaveResponse() {
  return "🥵 **HEATWAVE SAFETY**\n\n" +
    "**Symptoms of Heat-Related Illness:**\n" +
    "• 🤕 Headache, dizziness, confusion\n" +
    "• 💧 Heavy sweating or lack of sweating\n" +
    "• ❤️ Rapid heartbeat\n" +
    "• 🤢 Nausea, muscle cramps\n\n" +
    "**During Heatwave:**\n" +
    "1. 🏠 **Stay indoors** with AC or fans between 12 PM - 4 PM\n" +
    "2. 💧 **Drink water every 15-20 minutes** - even if not thirsty\n" +
    "3. 🚫 **Avoid caffeine and alcohol** - they cause dehydration\n" +
    "4. 🧥 **Wear light, loose, light-colored clothing**\n" +
    "5. 🛀 **Take cool showers** or use wet cloths\n" +
    "6. 🚗 **Never leave people/pets in parked cars**\n\n" +
    "**Help Others:**\n" +
    "• 👥 Check on elderly neighbors and those with chronic illness\n" +
    "• 🐕 Ensure pets have shade and water\n" +
    "• 🏢 Locate nearest cooling center\n\n" +
    "**Emergency:** Call 108/112 if someone shows signs of heat stroke (confusion, loss of consciousness, high body temperature)";
}

// General emergency numbers and resources
function getEmergencyResources() {
  return "📞 **INDIA EMERGENCY CONTACTS**\n\n" +
    "**National Emergency Numbers:**\n" +
    "• 🚨 **112** - Single Emergency Helpline (Police, Fire, Ambulance)\n" +
    "• 🚓 **100** - Police\n" +
    "• 🔥 **101** - Fire\n" +
    "• 🚑 **102** - Ambulance\n" +
    "• 🚨 **108** - Disaster Management/Medical Emergency\n\n" +
    "**Disaster-Specific Helplines:**\n" +
        "• 🌊 **NDMA** (National Disaster Management Authority): 1078\n" +
    "• 🌪️ **IMD** (Weather): 1800 180 1717\n" +
    "• 🌋 **NCS** (Earthquake): 011-24615334\n\n" +
    "**Useful Apps:**\n" +
    "• 📱 **NDMA Sachet** - Disaster preparedness\n" +
    "• 🌊 **Tsunami Early Warning** - INCOIS\n" +
    "• 🌀 **Cyclone Warning** - IMD\n\n" +
    "💡 **Prepare your phone:** Save ICE (In Case of Emergency) contacts";
}

// Get disaster preparedness kit checklist (complete)
function getEmergencyKitChecklist() {
  return "🎒 **EMERGENCY KIT CHECKLIST**\n\n" +
    "**Basic Supplies (72 hours minimum per person):**\n" +
    "• 💧 **Water** - 1 gallon/4 liters per person per day (for drinking & sanitation)\n" +
    "• 🍫 **Food** - Non-perishable, ready-to-eat (canned goods, energy bars, dry food)\n" +
    "• 🍴 **Manual can opener** & eating utensils\n\n" +
    "**Tools & Supplies:**\n" +
    "• 🔦 **Flashlight** with extra batteries\n" +
    "• 📻 **Battery-powered radio** (NOAA weather radio recommended)\n" +
    "• 🔋 **Power bank** and charging cables\n" +
    "• 🩹 **First aid kit** + manual\n" +
    "• 🗺️ **Local maps** and evacuation routes\n" +
    "• 🔧 **Multi-tool** or basic tools\n" +
    "• 📞 **Whistle** - to signal for help\n" +
    "• 🧻 **Personal hygiene items** (wet wipes, sanitizer, toilet paper)\n" +
    "• 🗑️ **Trash bags** and plastic ties\n\n" +
    "**Important Documents (in waterproof container):**\n" +
    "• 🆔 **ID proofs** (Aadhar, PAN, Voter ID, Passport)\n" +
    "• 📄 **Property documents** and insurance policies\n" +
    "• 💊 **Medical records** and prescription lists\n" +
    "• 💵 **Cash** (small bills) and coins\n" +
    "• 📞 **Emergency contact list**\n\n" +
    "**For Each Family Member:**\n" +
    "• 💊 **Prescription medications** (7-day supply)\n" +
    "• 👓 **Extra eyeglasses** or contact lenses\n" +
    "• 🧥 **Warm clothes**, blanket, sturdy shoes\n" +
    "• 🪥 **Toothbrush, toothpaste**, other personal care\n\n" +
    "**For Special Needs:**\n" +
    "• 👶 **Baby supplies** (formula, diapers, wipes, bottles)\n" +
    "• 🐕 **Pet supplies** (food, leash, carrier, vaccination records)\n" +
    "• 👴 **Elderly care items** (medications, mobility aids)\n\n" +
    "💡 **Pro Tip:** Review and refresh supplies every 6 months! Store kit in an easily accessible location.";
}

// Get drought response
function getDroughtResponse() {
  return "🏜️ **DROUGHT PREPAREDNESS & RESPONSE**\n\n" +
    "**Before/During Drought:**\n" +
    "1. 💧 **Conserve water** - Fix leaks, take shorter showers\n" +
    "2. 🚿 **Reuse water** - Collect rainwater, reuse cooking water for plants\n" +
    "3. 🌾 **Store emergency water** - Minimum 2 weeks supply\n" +
    "4. 🌡️ **Stay cool** - Use fans instead of AC when possible\n" +
    "5. 🧼 **Limit laundry/dishwasher** - Run only full loads\n\n" +
    "**Water Conservation Tips:**\n" +
    "• 🚰 Turn off tap while brushing teeth (saves 4 gallons/min)\n" +
    "• 💦 Water plants early morning or evening to reduce evaporation\n" +
    "• 🧹 Use broom instead of hose to clean driveways\n" +
    "• 🥤 Keep drinking water in refrigerator instead of running tap\n\n" +
    "**Health Precautions:**\n" +
    "• 💊 Take medications as prescribed\n" +
    "• 🏥 Seek medical help for heat-related illness\n" +
    "• 🧴 Use moisturizer for dry skin\n\n" +
    "**Drought-prone states in India:**\n" +
    "• Rajasthan, Gujarat, Maharashtra, Karnataka, Andhra Pradesh, Telangana\n\n" +
    "📻 **Stay informed:** Listen for water restriction announcements from local authorities";
}

// Get lightning safety response
function getLightningResponse() {
  return "⚡ **LIGHTNING SAFETY**\n\n" +
    "**When Thunder Roars, Go Indoors!**\n\n" +
    "**Before Storm:**\n" +
    "• 📡 Check weather forecast before outdoor activities\n" +
    "• 🏠 Identify safe shelters (buildings with plumbing/electrical)\n" +
    "• 📱 Enable weather alerts on phone\n\n" +
    "**During Lightning:**\n" +
    "1. 🏠 **Seek shelter immediately** in building or hard-top vehicle\n" +
    "2. 🚫 **Avoid open fields, hilltops, and isolated trees**\n" +
    "3. 🚫 **Stay away from water, metal objects, and electronics**\n" +
    "4. 🙏 **If no shelter:** Crouch down on balls of feet, hands on knees\n" +
    "5. 📏 **Wait 30 minutes** after last thunder before going out\n\n" +
    "**What NOT to do:**\n" +
    "• 🚫 Don't use corded electronics or plumbing\n" +
    "• 🚫 Don't lie flat on ground\n" +
    "• 🚫 Don't seek shelter under trees or pavilions\n" +
    "• 🚫 Don't use umbrellas or metal objects\n\n" +
    "**If Someone is Struck:**\n" +
    "• 🚨 Call emergency services immediately\n" +
    "• 🫀 Check for heartbeat/breathing - victims are safe to touch\n" +
    "• 💓 Perform CPR if needed\n" +
    "• 🏥 Get medical help as soon as possible\n\n" +
    "⚡ **Lightning kills ~2,000 people annually in India** - take precautions seriously!";
}

// Get general disaster preparedness tips
function getGeneralPreparedness() {
  return "📋 **GENERAL DISASTER PREPAREDNESS**\n\n" +
    "**1. Make a Plan:**\n" +
    "• 🗺️ Identify evacuation routes from home, work, school\n" +
    "• 📞 Choose an out-of-state emergency contact person\n" +
    "• 🏠 Decide on family meeting places (near home and outside neighborhood)\n" +
    "• 🐕 Plan for pets and livestock\n\n" +
    "**2. Build a Kit:**\n" +
    "• 🎒 72-hour emergency kit (see 'Emergency kit checklist')\n" +
    "• 🚗 Keep a smaller kit in each vehicle\n" +
    "• 🔋 Check batteries and food expiration dates every 6 months\n\n" +
    "**3. Stay Informed:**\n" +
    "• 📻 Weather radio with tone alert\n" +
    "• 📱 Emergency alert apps (NDMA, IMD)\n" +
    "• 📡 Follow local authorities on social media\n" +
    "• 🗞️ Learn about disasters that can happen in your area\n\n" +
    "**4. Practice Drills:**\n" +
    "• 🔥 Fire drill - practice escaping home in under 2 minutes\n" +
    "• 🌋 Earthquake drill - Drop, Cover, Hold On\n" +
    "• 🌊 Flood/cyclone drill - know evacuation routes\n\n" +
    "**5. Protect Your Home:**\n" +
    "• 🔒 Secure heavy furniture and appliances\n" +
    "• 🧹 Clear gutters and drains regularly\n" +
    "• 🌳 Trim trees and remove dead branches\n" +
    "• 🔥 Create defensible space around home for wildfires\n\n" +
    "💡 **Start today!** Disasters happen without warning - preparedness saves lives.";
}

// Get response from Puter.js AI (No API key needed!)
async function getPuterResponse(message, weatherContext = null) {
  if (typeof window.puter !== 'undefined' && window.puter?.ai) {
    try {
      let prompt = `You are RESPONZA AI, a professional disaster response assistant for India. 
Keep responses concise (2-3 paragraphs maximum), helpful, and focused on safety.

User query: ${message}`;

      if (weatherContext) {
        prompt += `\n\nWeather context for user's location: ${weatherContext}`;
      }

      prompt += `\n\nProvide a helpful response about disaster preparedness, weather, or emergency procedures. Be specific and actionable.`;

      const response = await window.puter.ai.chat(prompt);
      return response.message?.content || response || getFallbackResponse(message);
    } catch (error) {
      console.error("Puter AI error:", error);
      return getFallbackResponse(message);
    }
  }
  return getFallbackResponse(message);
}

// Fallback responses when Puter is not available (comprehensive)
function getFallbackResponse(message) {
  const lowerMsg = message.toLowerCase();
  
  // Earthquake related
  if (lowerMsg.includes("earthquake")) {
    return getEarthquakeResponse(message);
  }
  
  // Flood related
  if (lowerMsg.includes("flood")) {
    return getFloodResponse();
  }
  
  // Fire/wildfire related
  if (lowerMsg.includes("fire") || lowerMsg.includes("wildfire")) {
    return getFireResponse();
  }
  
  // Storm/cyclone related
  if (lowerMsg.includes("storm") || lowerMsg.includes("cyclone") || lowerMsg.includes("typhoon") || lowerMsg.includes("hurricane")) {
    return getCycloneResponse();
  }
  
  // Landslide related
  if (lowerMsg.includes("landslide") || lowerMsg.includes("mudslide")) {
    return getLandslideResponse();
  }
  
  // Tsunami related
  if (lowerMsg.includes("tsunami")) {
    return getTsunamiResponse();
  }
  
  // Heatwave related
  if (lowerMsg.includes("heatwave") || lowerMsg.includes("heat wave") || lowerMsg.includes("heat stroke")) {
    return getHeatwaveResponse();
  }
  
  // Drought related
  if (lowerMsg.includes("drought")) {
    return getDroughtResponse();
  }
  
  // Lightning related
  if (lowerMsg.includes("lightning")) {
    return getLightningResponse();
  }
  
  // Emergency kit/preparedness
  if (lowerMsg.includes("emergency kit") || lowerMsg.includes("preparedness kit") || lowerMsg.includes("survival kit")) {
    return getEmergencyKitChecklist();
  }
  
  // Emergency numbers/contacts
  if (lowerMsg.includes("emergency number") || lowerMsg.includes("helpline") || lowerMsg.includes("contact") || lowerMsg.includes("call")) {
    return getEmergencyResources();
  }
  
  // General preparedness
  if (lowerMsg.includes("preparedness") || lowerMsg.includes("prepare") || lowerMsg.includes("plan")) {
    return getGeneralPreparedness();
  }
  
  // Safety tips general
  if (lowerMsg.includes("safety tip") || lowerMsg.includes("how to stay safe")) {
    return "🛡️ **GENERAL SAFETY TIPS**\n\n" +
      "**Always remember:**\n" +
      "• 📱 Keep phone charged and emergency contacts saved\n" +
      "• 🎒 Know where your emergency kit is located\n" +
      "• 🗺️ Identify evacuation routes from home and work\n" +
      "• 📻 Have a battery-powered radio for updates\n" +
      "• 👨‍👩‍👧‍👦 Establish a family communication plan\n" +
      "• 🏠 Practice disaster drills regularly\n\n" +
      "**For specific disasters, ask me about:**\n" +
      "• Earthquakes, Floods, Cyclones, Wildfires\n" +
      "• Heatwaves, Landslides, Tsunamis, Lightning\n" +
      "• Emergency kit, Helpline numbers\n\n" +
      "Stay safe and be prepared! 🚨";
  }
  
  // General greeting
  if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("hey")) {
    return "👋 Hello! I'm RESPONZA AI, your disaster response assistant.\n\n" +
      "I can help you with:\n" +
      "• 🌍 **Real-time weather** for any city in India\n" +
      "• 🌡️ **Climate insights** (temperature, rainfall, wind)\n" +
      "• 🌋 **Earthquake safety** and information\n" +
      "• 🌊 **Flood response** and evacuation\n" +
      "• 🌀 **Cyclone/storm preparedness**\n" +
      "• 🔥 **Wildfire safety**\n" +
      "• 🎒 **Emergency kit checklist**\n" +
      "• 📞 **Emergency helpline numbers**\n\n" +
      "💡 **Try asking:**\n" +
      "• 'Weather in Chennai'\n" +
      "• 'What to do during an earthquake?'\n" +
      "• 'Emergency kit checklist'\n" +
      "• 'Flood safety tips'\n\n" +
      "How can I help you stay prepared today?";
  }
  
  // Default response
  return "🤖 I'm RESPONZA AI, your disaster response assistant. I can help with:\n\n" +
    "• 🌍 Real-time weather for any city in India\n" +
    "• 🌡️ Climate insights (temperature, rainfall, wind speed)\n" +
    "• 🌋 Earthquake safety procedures\n" +
    "• 🌊 Flood response and evacuation\n" +
    "• 🔥 Wildfire preparedness\n" +
    "• 🌀 Cyclone/Storm guidance\n" +
    "• 🎒 Emergency kit checklist\n" +
    "• 📞 Emergency helpline numbers\n" +
    "• 🏜️ Drought preparedness\n" +
    "• ⚡ Lightning safety\n\n" +
    "💡 **Try asking:**\n" +
    "• 'Weather in Mumbai'\n" +
    "• 'What to do during an earthquake?'\n" +
    "• 'Emergency kit checklist'\n" +
    "• 'Flood safety tips'\n" +
    "• 'Cyclone preparedness'\n" +
    "• 'Emergency numbers India'\n\n" +
    "How can I help you stay prepared today?";
}

// Load Puter.js script
function loadPuterScript() {
  return new Promise((resolve, reject) => {
    if (typeof window.puter !== 'undefined') {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = "https://js.puter.com/v2/";
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.head.appendChild(script);
  });
}

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content: "👋 Hello! I'm RESPONZA AI, your disaster response assistant powered by real-time weather data.\n\nI can help with:\n\n• 🌍 **Real-time weather** for any city in India\n• 🌡️ **Climate insights** (temperature, rainfall, wind speed, air quality)\n• 📊 **Disaster risk assessment** based on current conditions\n• 🌋 **Earthquake safety** and information\n• 🌊 **Flood response** and evacuation\n• 🔥 **Wildfire preparedness**\n• 🌀 **Cyclone/Storm guidance**\n• 🎒 **Emergency kit checklist**\n• 📞 **Emergency helpline numbers**\n• 🏜️ **Drought preparedness**\n• ⚡ **Lightning safety**\n\n💡 **Try asking:**\n• 'Weather in Chennai'\n• 'What to do during an earthquake?'\n• 'Emergency kit checklist'\n• 'Flood safety tips'\n• 'Climate summary for Mumbai'\n• 'Air quality in Delhi'\n\n**Note:** Weather data is real-time and free!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [puterStatus, setPuterStatus] = useState("loading");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load Puter.js on mount
  useEffect(() => {
    loadPuterScript()
      .then(() => {
        setPuterStatus("ready");
        console.log("✅ Puter.js loaded successfully!");
      })
      .catch((error) => {
        console.error("❌ Failed to load Puter.js:", error);
        setPuterStatus("fallback");
      });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setIsTyping(true);

    const lowerInput = userInput.toLowerCase();
    let response = "";
    
    // Check for weather queries
    const city = extractCity(userInput);
    
    // Check for date-specific queries
    const targetDate = extractDate(userInput);
    const hasDateQuery = targetDate && (lowerInput.includes("forecast") || lowerInput.includes("on ") || lowerInput.includes("for "));
    
    // Handle weather queries with Open-Meteo API
    if ((lowerInput.includes("weather") || lowerInput.includes("climate") || lowerInput.includes("temperature") || lowerInput.includes("rain") || lowerInput.includes("wind")) && city) {
      try {
        if (hasDateQuery && targetDate) {
          // Date-specific forecast
          const forecast = await getForecastForDate(city.lat, city.lon, targetDate);
          if (forecast) {
            const dateStr = targetDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            response = `📅 **Weather Forecast for ${city.name} on ${dateStr}**\n\n` +
              `🌡️ **Temperature:** High ${forecast.maxTemp}°C / Low ${forecast.minTemp}°C\n` +
              `🌤️ **Conditions:** ${getWeatherDescription(forecast.weatherCode)}\n` +
              `💨 **Max Wind:** ${forecast.maxWind} km/h\n` +
              `🌧️ **Rainfall:** ${forecast.precipitation} mm (${forecast.precipitationProb}% chance)\n` +
              `🌅 **Sunrise:** ${new Date(forecast.sunrise).toLocaleTimeString()}\n` +
              `🌇 **Sunset:** ${new Date(forecast.sunset).toLocaleTimeString()}\n\n` +
              `💡 **Tip:** ${forecast.precipitationProb > 70 ? 'Carry umbrella! 🌂' : forecast.maxTemp > 35 ? 'Stay hydrated! 💧' : 'Enjoy the weather! 😊'}`;
          } else {
            response = `Sorry, I couldn't find forecast data for ${city.name} on that date. Try asking for "today" or "tomorrow" instead.`;
          }
        } else {
          // Current weather
          const weather = await getWeatherData(city.lat, city.lon);
          const airQuality = await getAirQualityData(city.lat, city.lon);
          
          if (weather && weather.current_weather) {
            const temp = Math.round(weather.current_weather.temperature);
            const wind = weather.current_weather.windspeed;
            const weatherCode = weather.current_weather.weathercode;
            const weatherDesc = getWeatherDescription(weatherCode);
            const { risks, precautions } = getDisasterRiskAssessment(weather, airQuality, city.name, city.region);
            const summary = generateSummaryInsights(weather, airQuality, city.name);
            
            response = `🌍 **Real-time Weather for ${city.name}**${city.parent ? ` (${city.parent})` : ''}\n\n` +
              `📍 **Location:** ${city.name}, ${city.state || 'India'}\n` +
              `🌡️ **Temperature:** ${temp}°C\n` +
              `💨 **Wind Speed:** ${wind} km/h\n` +
              `🌤️ **Conditions:** ${weatherDesc}\n` +
              `🕐 **Updated:** ${new Date().toLocaleTimeString()}\n\n` +
              `⚠️ **${risks.length > 0 ? 'DISASTER RISK ASSESSMENT' : 'WEATHER SUMMARY'}**\n`;
            
            if (risks.length > 0) {
              response += risks.map(r => `   • 🔴 **${r.type}** (${r.level.level}): ${r.detail}\n`).join('');
              if (precautions.length > 0) {
                response += `\n🛡️ **RECOMMENDED PRECAUTIONS:**\n` + precautions.map(p => `   • ${p}\n`).join('');
              }
            } else {
              response += `   • ✅ No immediate weather-related disaster risks\n`;
            }
            
            response += `\n${summary}\n\n` +
              `🔄 *Data from Open-Meteo API - Real-time weather*`;
          } else {
            response = await getPuterResponse(userInput);
          }
        }
      } catch (error) {
        console.error("Weather error:", error);
        response = await getPuterResponse(userInput);
      }
    }
    // Handle summary insights query
    else if ((lowerInput.includes("summary") || lowerInput.includes("insight")) && city) {
      try {
        const weather = await getWeatherData(city.lat, city.lon);
        const airQuality = await getAirQualityData(city.lat, city.lon);
        if (weather && weather.current_weather) {
          response = generateSummaryInsights(weather, airQuality, city.name);
        } else {
          response = await getPuterResponse(userInput);
        }
      } catch (error) {
        response = await getPuterResponse(userInput);
      }
    }
    // Handle air quality query
    else if ((lowerInput.includes("air quality") || lowerInput.includes("aqi") || lowerInput.includes("pollution")) && city) {
      try {
        const airQuality = await getAirQualityData(city.lat, city.lon);
        if (airQuality && airQuality.current) {
          const aqi = airQuality.current.us_aqi;
          const pm25 = airQuality.current.pm2_5;
          const pm10 = airQuality.current.pm10;
          const co = airQuality.current.carbon_monoxide;
          
          response = `😮‍💨 **Air Quality Report for ${city.name}**\n\n` +
            `📊 **AQI (US Standard):** ${aqi || 'N/A'} - ${getAirQualityDescription(aqi)}\n` +
            `🫁 **PM2.5:** ${pm25 ? pm25.toFixed(1) : 'N/A'} µg/m³ (Fine particles)\n` +
            `🌫️ **PM10:** ${pm10 ? pm10.toFixed(1) : 'N/A'} µg/m³ (Inhalable particles)\n` +
            `💨 **CO:** ${co ? co.toFixed(1) : 'N/A'} µg/m³ (Carbon monoxide)\n\n` +
            `💡 **Health Recommendations:**\n` +
            `${aqi > 150 ? '   • 😷 Wear N95 mask when outdoors\n   • 🏠 Keep windows closed, use air purifier\n   • 🚫 Avoid outdoor exercise' : 
              aqi > 100 ? '   • ⚠️ Sensitive groups should limit outdoor activity\n   • 😷 Consider wearing mask if sensitive' : 
              '   • ✅ Air quality is good - enjoy outdoor activities!'}\n\n` +
            `🔄 *Data from Open-Meteo Air Quality API*`;
        } else {
          response = `Sorry, air quality data is currently unavailable for ${city.name}. Please try again later.`;
        }
      } catch (error) {
        response = await getPuterResponse(userInput);
      }
    }
    // Handle disaster-specific queries (fallback responses)
    else if (lowerInput.includes("earthquake")) {
      response = getEarthquakeResponse(userInput);
    }
    else if (lowerInput.includes("flood")) {
      response = getFloodResponse();
    }
    else if (lowerInput.includes("fire") || lowerInput.includes("wildfire")) {
      response = getFireResponse();
    }
    else if (lowerInput.includes("cyclone") || lowerInput.includes("storm") || lowerInput.includes("typhoon")) {
      response = getCycloneResponse();
    }
    else if (lowerInput.includes("landslide") || lowerInput.includes("mudslide")) {
      response = getLandslideResponse();
    }
    else if (lowerInput.includes("tsunami")) {
      response = getTsunamiResponse();
    }
    else if (lowerInput.includes("heatwave") || lowerInput.includes("heat wave")) {
      response = getHeatwaveResponse();
    }
    else if (lowerInput.includes("drought")) {
      response = getDroughtResponse();
    }
    else if (lowerInput.includes("lightning")) {
      response = getLightningResponse();
    }
    else if (lowerInput.includes("emergency kit") || lowerInput.includes("preparedness kit")) {
      response = getEmergencyKitChecklist();
    }
    else if (lowerInput.includes("emergency number") || lowerInput.includes("helpline") || lowerInput.includes("contact")) {
      response = getEmergencyResources();
    }
    else if (lowerInput.includes("preparedness") || lowerInput.includes("prepare") || lowerInput.includes("plan")) {
      response = getGeneralPreparedness();
    }
    else {
      // Use Puter AI for general queries
      response = await getPuterResponse(userInput);
    }
    
    const aiMessage = {
      id: Date.now() + 1,
      type: "ai",
      content: response,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "Weather in Chennai",
    "What to do during an earthquake?",
    "Emergency kit checklist",
    "Flood safety tips",
    "Cyclone preparedness",
    "Air quality in Delhi",
    "Heatwave safety",
    "Emergency numbers India",
  ];

  return (
    <div style={{ 
      height: "100%", 
      display: "flex", 
      flexDirection: "column", 
      background: COLORS.bg,
      fontFamily: FONTS.sans,
    }}>
      <style>{css}</style>

      {/* Chat Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: `1px solid ${COLORS.border}`,
        background: COLORS.surface,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <span style={{ fontSize: "24px" }}>🛡️</span>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 600, color: COLORS.text }}>
              RESPONZA AI Assistant
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
              <LiveDot color={puterStatus === "ready" ? COLORS.green : COLORS.amber} size={6} />
              <span style={{ fontSize: "10px", color: COLORS.muted, fontFamily: FONTS.mono }}>
                {puterStatus === "ready" ? "Puter.ai • AI Ready" : puterStatus === "loading" ? "Loading AI..." : "Fallback Mode"}
              </span>
            </div>
          </div>
        </div>
        {puterStatus === "fallback" && (
          <div style={{
            marginTop: "8px",
            fontSize: "10px",
            color: COLORS.amber,
            background: `${COLORS.amber}10`,
            padding: "6px 10px",
            borderRadius: "6px",
          }}>
            ⚠️ Using fallback mode. Weather data still works! Puter.js failed to load.
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: msg.type === "user" ? "flex-end" : "flex-start",
              animation: "chatSlideIn 0.3s ease",
            }}
          >
            <div style={{
              maxWidth: "85%",
              padding: "12px 16px",
              borderRadius: msg.type === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
              background: msg.type === "user" ? COLORS.green : COLORS.surface,
              color: msg.type === "user" ? "#000" : COLORS.text,
              border: msg.type === "user" ? "none" : `1px solid ${COLORS.border}`,
            }}>
              <div style={{
                fontSize: "13px",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap",
              }}>
                {msg.content}
              </div>
              <div style={{
                fontSize: "9px",
                marginTop: "6px",
                opacity: 0.5,
                fontFamily: FONTS.mono,
              }}>
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              padding: "12px 16px",
              borderRadius: "4px 14px 14px 14px",
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
            }}>
              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      <div style={{
        padding: "12px 16px",
        borderTop: `1px solid ${COLORS.border}`,
        borderBottom: `1px solid ${COLORS.border}`,
        background: COLORS.surface,
      }}>
        <div style={{ fontSize: "10px", color: COLORS.muted, marginBottom: "8px", fontFamily: FONTS.mono }}>
          SUGGESTED QUESTIONS
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => setInput(q)}
              style={{
                background: `${COLORS.blue}10`,
                border: `1px solid ${COLORS.blue}30`,
                borderRadius: "14px",
                padding: "5px 12px",
                fontSize: "11px",
                color: COLORS.blue,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${COLORS.blue}20`;
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${COLORS.blue}10`;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div style={{
        padding: "16px",
        display: "flex",
        gap: "10px",
        background: COLORS.surface,
        borderTop: `1px solid ${COLORS.border}`,
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about weather, disasters, or safety..."
          rows="1"
          style={{
            flex: 1,
            padding: "10px 14px",
            background: COLORS.bg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "10px",
            color: COLORS.text,
            fontFamily: FONTS.sans,
            fontSize: "13px",
            resize: "none",
            outline: "none",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isTyping}
          style={{
            padding: "10px 18px",
            background: input.trim() && !isTyping ? COLORS.green : COLORS.border,
            border: "none",
            borderRadius: "10px",
            color: input.trim() && !isTyping ? "#000" : COLORS.muted,
            fontWeight: 600,
            cursor: input.trim() && !isTyping ? "pointer" : "not-allowed",
            transition: "all 0.2s",
          }}
        >
          Send →
        </button>
      </div>
    </div>
  );
}

// LiveDot component
function LiveDot({ color, size = 6 }) {
  return (
    <span style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: color,
      animation: "blink 1.4s infinite",
      display: "inline-block",
      boxShadow: `0 0 6px ${color}`,
    }} />
  );
}