// src/hooks/useAlerts.js
import { useEffect, useState, useCallback } from "react";
import { getWeatherBatch } from "../services/openMeteo";
import { buildAlert, STATIC_INCIDENTS, sortAlerts } from "../services/alerts";

const LOCATIONS = STATIC_INCIDENTS.map(({ id, name, lat, lon, x, y }) => ({
  id, name, lat, lon, x, y,
}));

export const useAlerts = () => {
  const [alerts,       setAlerts]       = useState(STATIC_INCIDENTS);
  const [loading,      setLoading]      = useState(true);
  const [lastFetch,    setLastFetch]    = useState(null);
  const [liveCount,    setLiveCount]    = useState(0);
  const [customAlerts, setCustomAlerts] = useState([]);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const results = await getWeatherBatch(LOCATIONS);
      const live = results.map(({ id, data }) => {
        const loc = LOCATIONS.find((l) => l.id === id);
        return buildAlert(loc, data);
      });

      const merged = STATIC_INCIDENTS.map((s) => {
        const liveMatch = live.find((l) => l.id === s.id);
        return liveMatch ?? s;
      });

      setAlerts(sortAlerts([...merged, ...customAlerts]));
      setLiveCount(live.length);
      setLastFetch(new Date());
    } catch {
      setAlerts(sortAlerts([...STATIC_INCIDENTS, ...customAlerts]));
    } finally {
      setLoading(false);
    }
  }, [customAlerts]);

  // Add a new custom alert (from NewAlert modal)
  const addAlert = useCallback((alert) => {
    const newAlert = {
      ...alert,
      id: `custom-${Date.now()}`,
      live: false,
      custom: true,
    };
    setCustomAlerts((prev) => {
      const updated = [...prev, newAlert];
      setAlerts((cur) => sortAlerts([...cur.filter((a) => !a.custom), ...updated]));
      return updated;
    });
    return newAlert;
  }, []);

  // Remove a custom alert
  const removeAlert = useCallback((id) => {
    setCustomAlerts((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      setAlerts((cur) => sortAlerts([...cur.filter((a) => a.id !== id)]));
      return updated;
    });
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  return { alerts, loading, lastFetch, liveCount, refetch: fetchAlerts, addAlert, removeAlert };
};