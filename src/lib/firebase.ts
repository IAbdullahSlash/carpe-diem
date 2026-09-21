import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

/** Analytics only exists in the browser; safe to call from an effect. */
export async function initAnalytics() {
  if (typeof window === "undefined") return;
  const { getAnalytics, isSupported } = await import("firebase/analytics");
  try {
    if (await isSupported()) getAnalytics(app);
  } catch {
    /* analytics blocked or unavailable */
  }
}

/** Resolves once Firebase knows whether somebody is signed in. */
export function waitForAuthUser() {
  if (auth.currentUser) return Promise.resolve(auth.currentUser);
  return new Promise<import("firebase/auth").User | null>((resolve) => {
    const stop = auth.onAuthStateChanged((user) => {
      stop();
      resolve(user);
    });
  });
}
