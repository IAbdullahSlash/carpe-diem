import { useEffect, useState } from "react";
import { deleteDoc, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { auth, db } from "./firebase";
import { userCol } from "./firebase-collections";
import { HISTORY_DAYS, asiaDayKey, asiaParts, lastNDayKeys } from "./time";
import { usePersistentState } from "./tracker-store";

export type ThemeMode = "auto" | "day" | "night";

/** Ticks every 30s so the greeting, clock and auto theme stay live. */
export function useAsiaNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  return asiaParts(now);
}

/** Saves the chosen mode for today and prunes anything past the 90-day window. */
async function recordDayMode(mode: ThemeMode) {
  const user = auth.currentUser;
  if (!user) return;
  const day = asiaDayKey();
  await setDoc(
    doc(db, "users", user.uid, "dayModes", day),
    { day, mode, updatedAt: new Date().toISOString() },
    { merge: true },
  );
  const cutoff = lastNDayKeys(HISTORY_DAYS)[0];
  if (!cutoff) return;
  const old = await getDocs(query(userCol(user.uid, "dayModes"), where("day", "<", cutoff)));
  await Promise.all(old.docs.map((d) => deleteDoc(d.ref)));
}

export function useTheme() {
  const [mode, setMode, hydrated] = usePersistentState<ThemeMode>("theme-mode", "day");
  const { isNight } = useAsiaNow();
  const night = mode === "auto" ? isNight : mode === "night";
  const today = asiaDayKey();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", night);
  }, [night]);

  useEffect(() => {
    if (!hydrated) return;
    void recordDayMode(mode).catch(() => {
      /* offline or signed out */
    });
  }, [mode, hydrated, today]);

  return { mode, setMode, night };
}
