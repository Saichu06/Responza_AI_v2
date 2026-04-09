const HF_API = "https://api-inference.huggingface.co/models";

// Uses a free summarization model - no API key needed for limited use
export const getAIInsight = async (alertSummary) => {
  try {
    const res = await fetch(`${HF_API}/facebook/bart-large-cnn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inputs: `Disaster response briefing: ${alertSummary}. Provide actionable emergency response recommendations.`,
        parameters: { max_length: 150, min_length: 50 },
      }),
    });
    const data = await res.json();
    return data[0]?.summary_text ?? generateLocalInsight(alertSummary);
  } catch {
    return generateLocalInsight(alertSummary);
  }
};

// Local fallback — no API needed
const generateLocalInsight = (summary) => {
  const lower = summary.toLowerCase();
  if (lower.includes("flood"))
    return "Deploy water rescue units. Evacuate low-lying areas immediately. Activate emergency shelters at elevated locations. Monitor river levels every 30 minutes.";
  if (lower.includes("fire") || lower.includes("wildfire"))
    return "Establish firebreak perimeters. Coordinate air support for water drops. Issue mandatory evacuation orders for 10km radius. Alert respiratory health centers.";
  if (lower.includes("cyclone") || lower.includes("typhoon"))
    return "Activate coastal evacuation protocols. Secure port infrastructure. Pre-position emergency medical teams. Estimated landfall window: 6–12 hours.";
  if (lower.includes("earthquake"))
    return "Deploy urban search and rescue (USAR) teams. Assess structural damage to critical infrastructure. Set up field hospitals. Check gas and water lines.";
  if (lower.includes("tsunami"))
    return "IMMEDIATE coastal evacuation. Move inland minimum 3km. Alert maritime authorities. Monitor DART buoy network for wave height data.";
  if (lower.includes("heat"))
    return "Open cooling centers across the city. Increase EMS capacity. Issue public health advisory. Monitor vulnerable populations — elderly and children first.";
  return "Monitor situation. Mobilize rapid response teams. Coordinate with local emergency management authorities. Prepare resource deployment manifest.";
};

export const buildAlertSummary = (alerts) => {
  const critical = alerts.filter((a) => a.sev === "critical");
  if (!critical.length) return "No critical alerts at this time.";
  return critical
    .map((a) => `${a.type} at ${a.name}: ${a.description}, wind ${a.wind}, precip ${a.precip}`)
    .join(". ");
};


export const getPersonalizedRecommendation = (weatherData) => {
  if (!weatherData || !weatherData.current_weather) return null;
  
  const temp = weatherData.current_weather.temperature;
  const wind = weatherData.current_weather.windspeed;
  const code = weatherData.current_weather.weathercode;
  
  if (temp > 35) {
    return "🌡️ HEAT ALERT: Extreme temperatures in your area. Stay hydrated, avoid outdoor activities between 11 AM-4 PM, and check on elderly neighbors.";
  }
  if (temp < 5) {
    return "❄️ COLD ALERT: Freezing conditions detected. Dress in layers, protect pipes from freezing, and drive with caution on potentially icy roads.";
  }
  if (wind > 70) {
    return "💨 HIGH WIND WARNING: Strong winds in your area. Secure outdoor objects, avoid unnecessary travel, and stay away from trees and power lines.";
  }
  if (code >= 95) {
    return "⛈️ THUNDERSTORM WARNING: Severe weather approaching your location. Stay indoors, unplug electronics, and avoid using landlines until the storm passes.";
  }
  if (code >= 61 && code <= 67) {
    return "🌧️ HEAVY RAIN ALERT: Significant rainfall expected. Be aware of flash flooding, avoid driving through flooded roads, and move to higher ground if necessary.";
  }
  if (code >= 71 && code <= 77) {
    return "🌨️ SNOW ALERT: Winter weather affecting your area. Drive with extreme caution, keep emergency supplies in your vehicle, and limit non-essential travel.";
  }
  
  return null;
};