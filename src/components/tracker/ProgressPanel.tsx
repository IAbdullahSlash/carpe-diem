import { useEffect, useState } from "react";
import { Activity, BarChart3 } from "lucide-react";
import { SketchCard } from "./SketchCard";
import { useHabits, useHistory, useTasks } from "@/lib/tracker-store";
import { useTodayKey } from "@/hooks/use-today";
import {
  HISTORY_DAYS,
  dayLabels,
  lastNDayKeys,
  monthKeyOf,
  monthLabel,
  quarterKeyOf,
} from "@/lib/time";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Bar = { key: string; label: string; caption?: string; value: number };

function BarChart({ bars, unitLabel }: { bars: Bar[]; unitLabel: string }) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  return (
    <div className="w-full pb-1">
      <div className="flex w-full items-end gap-1">
        {bars.map((bar) => (
          <div key={bar.key} className="flex min-w-0 flex-1 flex-col items-center gap-0.5">
            <span className="text-[10px] font-semibold text-muted-foreground">
              {bar.value || ""}
            </span>
            <div
              title={`${bar.value} ${unitLabel}`}
              className="w-full rounded-t-md border-2 border-ink bg-sky transition-[height] duration-500"
              style={{ height: `${Math.max(6, (bar.value / max) * 120)}px` }}
            />
            <span className="text-[10px] text-muted-foreground">{bar.label}</span>
            {bar.caption ? (
              <span className="text-[9px] uppercase text-muted-foreground">{bar.caption}</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProgressPanel() {
  const { tasks, hydrated: tasksReady } = useTasks();
  const { habits, hydrated: habitsReady } = useHabits();
  const { log, record, hydrated: logReady } = useHistory();
  const [open, setOpen] = useState(false);
  const today = useTodayKey();

  // Today's progress only counts today's work: tasks still open plus tasks
  // finished today (older completions drop out), and habits ticked today.
  const tasksDoneToday = tasks.filter((t) => t.done && t.completedOn === today).length;
  const tasksToday = tasks.filter((t) => !t.done).length + tasksDoneToday;
  const habitsDoneOn = (day: string) => habits.filter((h) => h.days.includes(day)).length;
  const habitsDone = habitsDoneOn(today);

  const total = tasksToday + habits.length;
  const pct = total ? Math.round(((tasksDoneToday + habitsDone) / total) * 100) : 0;

  useEffect(() => {
    // Writing before the data loads would overwrite today's record with zeros.
    if (!tasksReady || !habitsReady || !logReady) return;
    record(today, {
      tasksDone: tasksDoneToday,
      tasksTotal: tasksToday,
      habitsDone,
      habitsTotal: habits.length,
    });
    // Habits can be ticked for earlier days in the grid; keep those records in step.
    for (const day of lastNDayKeys(7, today).slice(0, -1)) {
      const entry = log[day];
      const done = habitsDoneOn(day);
      if (entry && entry.habitsDone !== done) record(day, { ...entry, habitsDone: done });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    record,
    today,
    tasksReady,
    habitsReady,
    logReady,
    tasksDoneToday,
    tasksToday,
    habits,
    habitsDone,
  ]);

  // Live completions are exact for today; earlier days come from the log, which
  // also remembers tasks that have since been deleted.
  const tasksDoneOn = (day: string) =>
    day === today
      ? tasksDoneToday
      : (log[day]?.tasksDone ?? tasks.filter((t) => t.completedOn === day).length);

  const week = lastNDayKeys(7, today);
  const counts = week.map(tasksDoneOn);
  const max = Math.max(1, ...counts);
  const circumference = 2 * Math.PI * 42;

  const history = lastNDayKeys(HISTORY_DAYS, today);
  const historyCounts = history.map(tasksDoneOn);

  const daily: Bar[] = history.slice(-30).map((day, i) => ({
    key: day,
    label: dayLabels(day).day,
    caption: dayLabels(day).weekday,
    value: historyCounts[history.length - 30 + i] ?? 0,
  }));

  const sumBy = (bucket: (day: string) => string) => {
    const sums = new Map<string, number>();
    history.forEach((day, i) => {
      const key = bucket(day);
      sums.set(key, (sums.get(key) ?? 0) + (historyCounts[i] ?? 0));
    });
    return [...sums];
  };
  const monthly: Bar[] = sumBy(monthKeyOf).map(([key, value]) => ({
    key,
    label: monthLabel(key),
    value,
  }));
  const quarterly: Bar[] = sumBy(quarterKeyOf).map(([key, value]) => ({ key, label: key, value }));

  const totalTracked = Object.keys(log).length;

  return (
    <SketchCard
      title="Today's progress"
      subtitle={`${totalTracked} of ${HISTORY_DAYS} days recorded — tap for charts`}
      icon={<Activity className="h-5 w-5" />}
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              aria-label="Open progress charts"
              className="grid h-9 w-9 place-items-center rounded-md border-2 border-ink bg-mint text-ink"
            >
              <BarChart3 className="h-4 w-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="grid-cols-[minmax(0,1fr)] max-w-3xl overflow-hidden">
            <DialogHeader>
              <DialogTitle className="hand text-3xl">Progress charts</DialogTitle>
              <DialogDescription>
                Tasks completed, from the last {HISTORY_DAYS} days of records.
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="daily" className="w-full min-w-0">
              <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
              </TabsList>
              <TabsContent value="daily" className="min-w-0 pt-4">
                <BarChart bars={daily} unitLabel="tasks done" />
              </TabsContent>
              <TabsContent value="monthly" className="min-w-0 pt-4">
                <BarChart bars={monthly} unitLabel="tasks done" />
              </TabsContent>
              <TabsContent value="quarterly" className="min-w-0 pt-4">
                <BarChart bars={quarterly} unitLabel="tasks done" />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      }
    >
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full flex-wrap items-center gap-5 text-left"
      >
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--muted)" strokeWidth="10" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--mint)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - pct / 100)}
              className="transition-all duration-700"
            />
          </svg>
          <span className="hand absolute inset-0 grid place-items-center text-3xl">{pct}%</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">
            {tasksDoneToday} of {tasksToday} tasks done today
          </p>
          <p className="text-sm text-muted-foreground">
            {habitsDone} of {habits.length} habits ticked
          </p>
          <div className="mt-3 flex h-20 items-end gap-2">
            {counts.map((c, i) => (
              <div key={week[i]} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md border-2 border-ink bg-sky transition-[height] duration-500"
                  style={{ height: `${Math.max(6, (c / max) * 60)}px` }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {dayLabels(week[i] ?? today).day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </button>
    </SketchCard>
  );
}
