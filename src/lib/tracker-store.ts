import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import { auth, db, waitForAuthUser } from "./firebase";
import { HISTORY_DAYS, asiaDayKey, lastNDayKeys } from "./time";

export type Priority = "low" | "normal" | "high";

export type Task = {
  id: string;
  title: string;
  due?: string | undefined;
  priority: Priority;
  done: boolean;
  createdAt: string;
  completedOn?: string | undefined;
};

export type Goal = {
  id: string;
  title: string;
  unit: string;
  target: number;
  current: number;
};

export type Note = {
  id: string;
  text: string;
  tint: "mint" | "sky" | "butter" | "coral";
  updatedAt: string;
};

export type Habit = {
  id: string;
  title: string;
  /** Asia day keys on which it was completed. */
  days: string[];
};

export const uid = () => Math.random().toString(36).slice(2, 10);

const PREFIX = "abdullah-tracker:";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Hydration-safe persisted state: renders the default on the server / first
 * paint, then swaps in the stored value after mount. Used for lightweight
 * device-local preferences (mood, focus, theme choice).
 */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(read(key, initial));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* storage full or unavailable */
    }
  }, [key, value, hydrated]);

  return [value, setValue, hydrated] as const;
}

/* ---------------------------------------------------------------------------
 * Firestore helpers — everything lives under users/{uid}/<collection>
 * ------------------------------------------------------------------------- */

export async function currentUserId() {
  const user = auth.currentUser ?? (await waitForAuthUser());
  if (!user) throw new Error("Not signed in");
  return user.uid;
}

export function userCol(userId: string, name: string) {
  return collection(db, "users", userId, name);
}

async function myCol(name: string) {
  return userCol(await currentUserId(), name);
}

function rows(snapshot: { docs: { id: string; data: () => DocumentData }[] }) {
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as DocumentData & { id: string });
}

function useCollection<T>(key: string, load: () => Promise<T[]>) {
  const q = useQuery({ queryKey: [key], queryFn: load, staleTime: 30_000 });
  const queryClient = useQueryClient();
  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: [key] }),
    [queryClient, key],
  );
  const patch = useCallback(
    (updater: (prev: T[]) => T[]) =>
      queryClient.setQueryData<T[]>([key], (prev) => updater(prev ?? [])),
    [queryClient, key],
  );
  return { data: q.data ?? [], hydrated: !q.isLoading, invalidate, patch };
}

/* ---------------------------------------------------------------------------
 * Tasks
 * ------------------------------------------------------------------------- */

export function useTasks() {
  const { data, hydrated, invalidate, patch } = useCollection<Task>("tasks", async () => {
    const snapshot = await getDocs(query(await myCol("tasks"), orderBy("createdAt", "desc")));
    return rows(snapshot).map((row) => ({
      id: row.id,
      title: String(row["title"] ?? ""),
      due: (row["due"] as string) ?? undefined,
      priority: (row["priority"] as Priority) ?? "normal",
      done: Boolean(row["done"]),
      createdAt: String(row["createdAt"] ?? new Date().toISOString()),
      completedOn: (row["completedOn"] as string) ?? undefined,
    }));
  });

  const addTask = useCallback(
    async (title: string, priority: Priority = "normal", due?: string) => {
      await addDoc(await myCol("tasks"), {
        title,
        priority,
        due: due ?? null,
        done: false,
        completedOn: null,
        createdAt: new Date().toISOString(),
      });
      await invalidate();
    },
    [invalidate],
  );

  const toggleTask = useCallback(
    async (id: string) => {
      const task = data.find((t) => t.id === id);
      if (!task) return;
      const done = !task.done;
      const completedOn = done ? asiaDayKey() : undefined;
      patch((prev) => prev.map((t) => (t.id === id ? { ...t, done, completedOn } : t)));
      const userId = await currentUserId();
      await updateDoc(doc(db, "users", userId, "tasks", id), {
        done,
        completedOn: completedOn ?? null,
      });
      await invalidate();
    },
    [data, invalidate, patch],
  );

  const removeTask = useCallback(
    async (id: string) => {
      patch((prev) => prev.filter((t) => t.id !== id));
      const userId = await currentUserId();
      await deleteDoc(doc(db, "users", userId, "tasks", id));
      await invalidate();
    },
    [invalidate, patch],
  );

  return { tasks: data, addTask, toggleTask, removeTask, hydrated };
}

/* ---------------------------------------------------------------------------
 * Goals
 * ------------------------------------------------------------------------- */

export function useGoals() {
  const { data, hydrated, invalidate, patch } = useCollection<Goal>("goals", async () => {
    const snapshot = await getDocs(query(await myCol("goals"), orderBy("createdAt", "asc")));
    return rows(snapshot).map((row) => ({
      id: row.id,
      title: String(row["title"] ?? ""),
      unit: String(row["unit"] ?? ""),
      target: Number(row["target"] ?? 0),
      current: Number(row["current"] ?? 0),
    }));
  });

  const addGoal = useCallback(
    async (title: string, target: number, unit: string) => {
      await addDoc(await myCol("goals"), {
        title,
        target,
        unit,
        current: 0,
        createdAt: new Date().toISOString(),
      });
      await invalidate();
    },
    [invalidate],
  );

  const bumpGoal = useCallback(
    async (id: string, delta: number) => {
      const goal = data.find((g) => g.id === id);
      if (!goal) return;
      const current = Math.max(0, Math.min(goal.target, goal.current + delta));
      if (current === goal.current) return;
      patch((prev) => prev.map((g) => (g.id === id ? { ...g, current } : g)));
      const userId = await currentUserId();
      await updateDoc(doc(db, "users", userId, "goals", id), { current });
      await invalidate();
    },
    [data, invalidate, patch],
  );

  const removeGoal = useCallback(
    async (id: string) => {
      patch((prev) => prev.filter((g) => g.id !== id));
      const userId = await currentUserId();
      await deleteDoc(doc(db, "users", userId, "goals", id));
      await invalidate();
    },
    [invalidate, patch],
  );

  return { goals: data, addGoal, bumpGoal, removeGoal, hydrated };
}

/* ---------------------------------------------------------------------------
 * Notes
 * ------------------------------------------------------------------------- */

const TINTS: Note["tint"][] = ["mint", "sky", "butter", "coral"];

export function useNotes() {
  const { data, hydrated, invalidate, patch } = useCollection<Note>("notes", async () => {
    const snapshot = await getDocs(query(await myCol("notes"), orderBy("createdAt", "desc")));
    return rows(snapshot).map((row) => ({
      id: row.id,
      text: String(row["text"] ?? ""),
      tint: (row["tint"] as Note["tint"]) ?? "mint",
      updatedAt: String(row["updatedAt"] ?? new Date().toISOString()),
    }));
  });

  const addNote = useCallback(
    async (text = "") => {
      const tint = TINTS[data.length % TINTS.length] ?? "mint";
      const now = new Date().toISOString();
      await addDoc(await myCol("notes"), { text, tint, createdAt: now, updatedAt: now });
      await invalidate();
    },
    [data.length, invalidate],
  );

  const updateNote = useCallback(
    async (id: string, text: string) => {
      const updatedAt = new Date().toISOString();
      patch((prev) => prev.map((n) => (n.id === id ? { ...n, text, updatedAt } : n)));
      const userId = await currentUserId();
      await updateDoc(doc(db, "users", userId, "notes", id), { text, updatedAt });
    },
    [patch],
  );

  const removeNote = useCallback(
    async (id: string) => {
      patch((prev) => prev.filter((n) => n.id !== id));
      const userId = await currentUserId();
      await deleteDoc(doc(db, "users", userId, "notes", id));
      await invalidate();
    },
    [invalidate, patch],
  );

  return { notes: data, addNote, updateNote, removeNote, hydrated };
}

/* ---------------------------------------------------------------------------
 * Habits + habit days
 * ------------------------------------------------------------------------- */

export function useHabits() {
  const { data, hydrated, invalidate, patch } = useCollection<Habit>("habits", async () => {
    const userId = await currentUserId();
    const [habits, days] = await Promise.all([
      getDocs(query(userCol(userId, "habits"), orderBy("createdAt", "asc"))),
      getDocs(userCol(userId, "habitDays")),
    ]);
    const dayRows = rows(days);
    return rows(habits).map((row) => ({
      id: row.id,
      title: String(row["title"] ?? ""),
      days: dayRows.filter((d) => d["habitId"] === row.id).map((d) => String(d["day"])),
    }));
  });

  const addHabit = useCallback(
    async (title: string) => {
      await addDoc(await myCol("habits"), { title, createdAt: new Date().toISOString() });
      await invalidate();
    },
    [invalidate],
  );

  const toggleHabit = useCallback(
    async (id: string, dayKey: string) => {
      const habit = data.find((h) => h.id === id);
      if (!habit) return;
      const on = habit.days.includes(dayKey);
      patch((prev) =>
        prev.map((h) =>
          h.id === id
            ? { ...h, days: on ? h.days.filter((d) => d !== dayKey) : [...h.days, dayKey] }
            : h,
        ),
      );
      const userId = await currentUserId();
      const dayRef = doc(db, "users", userId, "habitDays", `${id}_${dayKey}`);
      if (on) await deleteDoc(dayRef);
      else await setDoc(dayRef, { habitId: id, day: dayKey });
      await invalidate();
    },
    [data, invalidate, patch],
  );

  const removeHabit = useCallback(
    async (id: string) => {
      patch((prev) => prev.filter((h) => h.id !== id));
      const userId = await currentUserId();
      await deleteDoc(doc(db, "users", userId, "habits", id));
      const stale = await getDocs(query(userCol(userId, "habitDays"), where("habitId", "==", id)));
      await Promise.all(stale.docs.map((d) => deleteDoc(d.ref)));
      await invalidate();
    },
    [invalidate, patch],
  );

  return { habits: data, addHabit, toggleHabit, removeHabit, hydrated };
}

export function streakOf(days: string[], keys: string[]) {
  let streak = 0;
  for (let i = keys.length - 1; i >= 0; i--) {
    const key = keys[i];
    if (key && days.includes(key)) streak++;
    else break;
  }
  return streak;
}

/* ---------------------------------------------------------------------------
 * 90-day history log
 * ------------------------------------------------------------------------- */

export type DayRecord = {
  tasksDone: number;
  tasksTotal: number;
  habitsDone: number;
  habitsTotal: number;
};

export type HistoryLog = Record<string, DayRecord>;

/** Keeps a rolling {HISTORY_DAYS}-day log of daily completions in Firestore. */
export function useHistory() {
  const queryClient = useQueryClient();
  const q = useQuery({
    queryKey: ["day-progress"],
    staleTime: 30_000,
    queryFn: async (): Promise<HistoryLog> => {
      const keys = lastNDayKeys(HISTORY_DAYS);
      const from = keys[0] ?? asiaDayKey();
      const snapshot = await getDocs(
        query(await myCol("dayProgress"), where("day", ">=", from), orderBy("day", "asc")),
      );
      const log: HistoryLog = {};
      for (const row of rows(snapshot)) {
        log[String(row["day"])] = {
          tasksDone: Number(row["tasksDone"] ?? 0),
          tasksTotal: Number(row["tasksTotal"] ?? 0),
          habitsDone: Number(row["habitsDone"] ?? 0),
          habitsTotal: Number(row["habitsTotal"] ?? 0),
        };
      }
      return log;
    },
  });

  const { mutate } = useMutation({
    mutationFn: async ({ dayKey, entry }: { dayKey: string; entry: DayRecord }) => {
      const userId = await currentUserId();
      await setDoc(
        doc(db, "users", userId, "dayProgress", dayKey),
        { day: dayKey, ...entry, updatedAt: new Date().toISOString() },
        { merge: true },
      );
      // Enforce the rolling 90-day window on write.
      const cutoff = lastNDayKeys(HISTORY_DAYS)[0];
      if (cutoff) {
        const old = await getDocs(
          query(userCol(userId, "dayProgress"), where("day", "<", cutoff)),
        );
        await Promise.all(old.docs.map((d) => deleteDoc(d.ref)));
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["day-progress"] }),
  });

  const log = q.data ?? {};

  const record = useCallback(
    (dayKey: string, entry: DayRecord) => {
      const previous = log[dayKey];
      if (
        previous &&
        previous.tasksDone === entry.tasksDone &&
        previous.tasksTotal === entry.tasksTotal &&
        previous.habitsDone === entry.habitsDone &&
        previous.habitsTotal === entry.habitsTotal
      ) {
        return;
      }
      queryClient.setQueryData<HistoryLog>(["day-progress"], (prev) => ({
        ...(prev ?? {}),
        [dayKey]: entry,
      }));
      mutate({ dayKey, entry });
    },
    [log, mutate, queryClient],
  );

  return { log, record, hydrated: !q.isLoading };
}

export const emptyRecord: DayRecord = {
  tasksDone: 0,
  tasksTotal: 0,
  habitsDone: 0,
  habitsTotal: 0,
};
