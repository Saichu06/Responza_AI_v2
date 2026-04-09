// src/hooks/useGeolocation.js
import { useState, useEffect, useCallback } from "react";

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState("prompt");

  const getLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
        setPermission("granted");
        setLoading(false);
      },
      (err) => {
        let errorMsg = "Unable to get your location";
        if (err.code === 1) errorMsg = "Location permission denied. Please enable location access in your browser settings.";
        if (err.code === 2) errorMsg = "Location unavailable. Please check your device settings.";
        if (err.code === 3) errorMsg = "Location request timed out. Please try again.";
        
        setError(errorMsg);
        setPermission("denied");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // Check existing permission on mount
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          getLocation();
        } else if (result.state === 'denied') {
          setPermission("denied");
          setError("Location permission denied. Please enable location access in your browser settings.");
        }
      }).catch(() => {});
    }
  }, [getLocation]);

  return { location, loading, error, permission, getLocation };
};