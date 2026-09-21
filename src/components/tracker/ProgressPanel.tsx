import { useEffect, useMemo, useState } from "react";
import { Activity, BarChart3 } from "lucide-react";
import { SketchCard } from "./SketchCard";
import { useHabits, useHistory, useTasks, type DayRecord } from "@/lib/tracker-store";
import {
  HISTORY_DAYS,
  asiaDayKey,
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
  const { tasks } = useTasks();
  const { habits } = useHabits();
  const { log, record } = useHistory();
  const [open, setOpen] = useState(false);

  const today = asiaDayKey();
  const done = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const habitsDone = habits.filter((h) => h.days.includes(today)).length;

  useEffect(() => {
    record(today, {
      tasksDone: tasks.filter((t) => t.completedOn === today).length,
      tasksTotal: tasks.length,
      habitsDone,
      habitsTotal: habits.length,
    });
  }, [record, today, tasks, habits, habitsDone]);

  const week = lastNDayKeys(7);
  const entryOf = (day: string): DayRecord | undefined => log[day];
  const counts = week.map(
    (day) => entryOf(day)?.tasksDone ?? tasks.filter((t) => t.completedOn === day).length,
  );
  const max = Math.max(1, ...counts);
  const circumference = 2 * Math.PI * 42;

  const daily = useMemo<Bar[]>(
    () =>
      lastNDayKeys(30).map((day) => {
        const l = dayLabels(day);
        return {
          key: day,
          label: l.day,
          caption: l.weekday,
          value: log[day]?.tasksDone ?? 0,
        };
      }),
    [log],
  );

  const monthly = useMemo<Bar[]>(() => {
    const sums = new Map<string, number>();
    for (const day of lastNDayKeys(HISTORY_DAYS)) {
      const key = monthKeyOf(day);
      sums.set(key, (sums.get(key) ?? 0) + (log[day]?.tasksDone ?? 0));
    }
    return [...sums].map(([key, value]) => ({ key, label: monthLabel(key), value }));
  }, [log]);

  const quarterly = useMemo<Bar[]>(() => {
    const sums = new Map<string, number>();
    for (const day of lastNDayKeys(HISTORY_DAYS)) {
      const key = quarterKeyOf(day);
      sums.set(key, (sums.get(key) ?? 0) + (log[day]?.tasksDone ?? 0));
    }
    return [...sums].map(([key, value]) => ({ key, label: key, value }));
  }, [log]);

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
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--muted)"
              strokeWidth="10"
            />
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
            {done} of {tasks.length} tasks completed
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
