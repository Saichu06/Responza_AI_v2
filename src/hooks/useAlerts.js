import { useEffect, useState, useCallback } from "react";
import { getWeatherBatch } from "../services/openMeteo";
import { buildAlert, STATIC_INCIDENTS, sortAlerts } from "../services/alerts";

// Monitored locations — extend this list freely
const LOCATIONS = STATIC_INCIDENTS.map(({ id, name, lat, lon, x, y }) => ({
  id, name, lat, lon, x, y,
}));

export const useAlerts = () => {
  const [alerts,    setAlerts]    = useState(STATIC_INCIDENTS);
  const [loading,   setLoading]   = useState(true);
  const [lastFetch, setLastFetch] = useState(null);
  const [liveCount, setLiveCount] = useState(0);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const results = await getWeatherBatch(LOCATIONS);
      const live    = results.map(({ id, data }) => {
        const loc = LOCATIONS.find((l) => l.id === id);
        return buildAlert(loc, data);
      });

      // Merge live into static (live data overwrites static if available)
      const merged = STATIC_INCIDENTS.map((s) => {
        const liveMatch = live.find((l) => l.id === s.id);
        return liveMatch ?? s;
      });

      setAlerts(sortAlerts(merged));
      setLiveCount(live.length);
      setLastFetch(new Date());
    } catch {
      // Keep static fallback on failure
      setAlerts(sortAlerts(STATIC_INCIDENTS));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  return { alerts, loading, lastFetch, liveCount, refetch: fetchAlerts };
};