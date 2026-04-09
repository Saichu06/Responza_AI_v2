// src/services/ai.js
// Uses Anthropic API for context-aware disaster intelligence

export const getAIInsight = async (alertSummary, locationContext = null) => {
  try {
    const locationPart = locationContext
      ? `\nUser location context: ${locationContext}`
      : "";

    const systemPrompt = `You are an expert disaster response coordinator AI. 
Analyze emergency alerts and provide concise, actionable intelligence briefings.
Keep responses under 120 words. Be direct, use bullet points when listing actions.
Always prioritize life safety over property.`;

    const userPrompt = `Current emergency situation:
${alertSummary}${locationPart}

Provide:
1. Threat assessment (1-2 sentences)
2. Immediate actions (2-3 bullets)
3. Resource priorities (1 sentence)`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.map((b) => b.text || "").join("\n").trim();
    return text || generateLocalInsight(alertSummary);
  } catch {
    return generateLocalInsight(alertSummary);
  }
};

export const getCityWeatherInsight = async (cityName, weatherData) => {
  try {
    const temp = weatherData?.current_weather?.temperature;
    const wind = weatherData?.current_weather?.windspeed;
    const code = weatherData?.current_weather?.weathercode;

    const prompt = `City: ${cityName}
Current weather: temp=${temp}°C, wind=${wind}km/h, weather_code=${code}

Give a 2-sentence emergency preparedness tip for residents based on this weather. Be specific and actionable.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    return data.content?.[0]?.text?.trim() || null;
  } catch {
    return null;
  }
};

// Local fallback — no API needed
const generateLocalInsight = (summary) => {
  const lower = summary.toLowerCase();
  if (lower.includes("flood"))
    return "⚠️ Flood Risk Detected\n\n• Deploy water rescue units immediately\n• Evacuate all low-lying areas\n• Activate elevated emergency shelters\n\nMonitor river levels every 30 minutes. Prioritize elderly and mobility-impaired residents.";
  if (lower.includes("fire") || lower.includes("wildfire"))
    return "🔥 Wildfire Threat Active\n\n• Establish firebreak perimeters now\n• Coordinate air support for water drops\n• Issue mandatory evacuation for 10km radius\n\nAlert respiratory health centers. Distribute N95 masks at staging areas.";
  if (lower.includes("cyclone") || lower.includes("typhoon"))
    return "🌀 Cyclonic System Approaching\n\n• Activate coastal evacuation protocols\n• Secure all port infrastructure\n• Pre-position emergency medical teams\n\nEstimated landfall window: 6–12 hours. All shelters must be at capacity before landfall.";
  if (lower.includes("earthquake"))
    return "🏚️ Seismic Event Response\n\n• Deploy USAR teams to collapse zones\n• Assess structural integrity of critical infrastructure\n• Establish field hospitals at safe distances\n\nShut off gas mains. Check water line integrity before resuming supply.";
  if (lower.includes("tsunami"))
    return "🌊 TSUNAMI IMMINENT\n\n• IMMEDIATE coastal evacuation — move inland 3km+\n• Alert all maritime authorities\n• Monitor DART buoy network for wave height\n\nDo not return to coast until all-clear issued by official authorities.";
  if (lower.includes("heat"))
    return "🌡️ Extreme Heat Advisory\n\n• Open cooling centers across all districts\n• Increase EMS capacity by 40%\n• Issue public health advisory via all channels\n\nPrioritize monitoring elderly, infants, and outdoor workers. Hydration stations at transit hubs.";
  return "📡 Monitoring Active\n\n• Mobilize rapid response teams to standby\n• Coordinate with local emergency management\n• Prepare resource deployment manifest\n\nContinue monitoring. Escalate if conditions deteriorate.";
};

export const buildAlertSummary = (alerts) => {
  const critical = alerts.filter((a) => a.sev === "critical");
  const high = alerts.filter((a) => a.sev === "high");

  if (!critical.length && !high.length) return "No critical or high-severity alerts at this time.";

  const lines = [];
  if (critical.length) {
    lines.push(`CRITICAL (${critical.length}): ` +
      critical.map((a) => `${a.type} at ${a.name} — wind ${a.wind}, precip ${a.precip}`).join("; ")
    );
  }
  if (high.length) {
    lines.push(`HIGH (${high.length}): ` +
      high.map((a) => `${a.type} at ${a.name}`).join("; ")
    );
  }
  return lines.join("\n");
};

export const getPersonalizedRecommendation = (weatherData) => {
  if (!weatherData?.current_weather) return null;
  const { temperature: temp, windspeed: wind, weathercode: code } = weatherData.current_weather;

  if (temp > 35) return "🌡️ HEAT ALERT: Extreme temperatures detected. Stay hydrated, avoid outdoor activity 11AM–4PM, check on elderly neighbors.";
  if (temp < 5)  return "❄️ COLD ALERT: Freezing conditions. Dress in layers, protect pipes, drive cautiously on icy roads.";
  if (wind > 70) return "💨 HIGH WIND WARNING: Secure outdoor objects, avoid travel, stay away from trees and power lines.";
  if (code >= 95) return "⛈️ THUNDERSTORM WARNING: Stay indoors, unplug electronics, avoid landlines until storm passes.";
  if (code >= 61 && code <= 67) return "🌧️ HEAVY RAIN ALERT: Flash flooding possible. Avoid flooded roads, move to higher ground if needed.";
  if (code >= 71 && code <= 77) return "🌨️ SNOW ALERT: Drive with extreme caution, keep emergency supplies in vehicle, limit non-essential travel.";
  return null;
};