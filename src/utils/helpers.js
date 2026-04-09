import { SEV_COLORS, SEV_BG } from "./constants";

export const sevColor = (sev) => SEV_COLORS[sev] ?? "#e8f0fe";
export const sevBg    = (sev) => SEV_BG[sev]     ?? "rgba(255,255,255,.05)";

export const formatTime = (date) =>
  date ? new Date(date).toLocaleTimeString() : "--:--:--";

export const formatUTC = (date) =>
  date ? new Date(date).toUTCString().slice(-12, -4) : "--:--:--";

export const animateCount = (target, setter, duration = 1400, delay = 0) => {
  const timeout = setTimeout(() => {
    const t0 = Date.now();
    const tick = () => {
      const p    = Math.min(1, (Date.now() - t0) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      setter(Math.round(target * ease));
      if (p < 1) requestAnimationFrame(tick);
    };
    tick();
  }, delay);
  return () => clearTimeout(timeout);
};

export const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

export const groupBySeverity = (alerts) =>
  alerts.reduce((acc, a) => {
    acc[a.sev] = (acc[a.sev] ?? 0) + 1;
    return acc;
  }, {});

export const dedupe = (arr, key = "id") => {
  const seen = new Set();
  return arr.filter((item) => {
    if (seen.has(item[key])) return false;
    seen.add(item[key]);
    return true;
  });
};