import { useEffect, useState } from "react";
import { asiaDayKey } from "@/lib/time";

/**
 * Today's Asia day key, re-checked every 30s and whenever the tab becomes
 * visible again, so day-based cards roll over at midnight without a reload.
 */
export function useTodayKey() {
  const [today, setToday] = useState(() => asiaDayKey());

  useEffect(() => {
    const tick = () => setToday(asiaDayKey());
    const id = setInterval(tick, 30_000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);

  return today;
}
