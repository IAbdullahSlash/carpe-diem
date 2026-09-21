import { doc, getDoc, setDoc, writeBatch } from "firebase/firestore";
import { db, userCol } from "./firebase-collections";

const DEFAULT_TASKS = [
  { title: "Review this week's plan", priority: "high" },
  { title: "Read 20 pages", priority: "normal" },
  { title: "Reply to pending emails", priority: "low" },
];

const DEFAULT_GOALS = [
  { title: "Read books this month", unit: "books", target: 4 },
  { title: "Workout sessions", unit: "sessions", target: 20 },
  { title: "Deep work hours", unit: "hrs", target: 40 },
];

const DEFAULT_NOTES = [
  { text: "Idea: block 7-9am for deep work, no phone.", tint: "butter" },
  { text: "Call the bank about the new card.", tint: "sky" },
];

const DEFAULT_HABITS = ["Drink 3L water", "Walk 8k steps", "Journal"];

/**
 * Creates the profile document and a starter set of tasks / goals / notes /
 * habits the first time an account opens the tracker. Safe to call on every
 * load: it only writes when the profile document is missing.
 */
let inFlight: Promise<boolean> | null = null;

export function ensureSeed(userId: string, displayName: string | null) {
  inFlight ??= seed(userId, displayName);
  return inFlight;
}

/** Returns true when starter documents were just created. */
async function seed(userId: string, displayName: string | null): Promise<boolean> {
  const profileRef = doc(db, "users", userId);
  const existing = await getDoc(profileRef);
  if (existing.exists()) return false;

  await setDoc(profileRef, {
    displayName,
    createdAt: new Date().toISOString(),
  });

  const now = new Date().toISOString();
  const batch = writeBatch(db);
  for (const task of DEFAULT_TASKS) {
    batch.set(doc(userCol(userId, "tasks")), {
      ...task,
      due: null,
      done: false,
      completedOn: null,
      createdAt: now,
    });
  }
  for (const goal of DEFAULT_GOALS) {
    batch.set(doc(userCol(userId, "goals")), { ...goal, current: 0, createdAt: now });
  }
  for (const note of DEFAULT_NOTES) {
    batch.set(doc(userCol(userId, "notes")), { ...note, createdAt: now, updatedAt: now });
  }
  for (const title of DEFAULT_HABITS) {
    batch.set(doc(userCol(userId, "habits")), { title, createdAt: now });
  }
  await batch.commit();
  return true;
}
