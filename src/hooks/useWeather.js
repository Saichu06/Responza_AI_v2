import { useEffect, useState, useCallback } from "react";
import { getWeatherData } from "../services/openMeteo";
import { buildAlert } from "../services/alerts";

export const useWeather = (location) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetch_ = useCallback(async () => {
    if (!location) return;
    setLoading(true);
    setError(null);
    try {
      const raw   = await getWeatherData(location.lat, location.lon);
      const alert = buildAlert(location, raw);
      setData({ raw, alert });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [location?.lat, location?.lon]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { data, loading, error, refetch: fetch_ };
};