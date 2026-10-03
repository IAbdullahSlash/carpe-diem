import { useState } from "react";
import { Check, Flame, Plus, Trash2 } from "lucide-react";
import { SketchCard } from "./SketchCard";
import { cn } from "@/lib/utils";
import { dayLabels, lastNDayKeys } from "@/lib/time";
import { streakOf, useHabits } from "@/lib/tracker-store";
import { useTodayKey } from "@/hooks/use-today";

export function HabitTracker() {
  const { habits, addHabit, toggleHabit, removeHabit } = useHabits();
  const [title, setTitle] = useState("");
  const today = useTodayKey();
  const week = lastNDayKeys(7, today);

  return (
    <SketchCard
      title="Habits & streaks"
      subtitle="Last 7 days"
      icon={<Flame className="h-5 w-5" />}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 pb-2">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Habit</span>
        <div className="flex shrink-0 items-center gap-1">
          {week.map((day) => {
            const l = dayLabels(day);
            return (
              <div
                key={day}
                className={cn(
                  "w-6 text-center",
                  day === today ? "font-bold text-foreground" : "text-muted-foreground",
                )}
              >
                <span className="block text-[10px] uppercase">{l.weekday}</span>
                <span className="block text-[11px] leading-tight">{l.day}</span>
              </div>
            );
          })}
          <span className="ml-1 w-4" />
        </div>
      </div>
      <ul className="space-y-3 border-t-2 border-ink/20 pt-3">
        {habits.map((habit) => (
          <li key={habit.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{habit.title}</p>
              <p className="text-xs text-muted-foreground">
                {streakOf(habit.days, today)} day streak
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {week.map((day) => {
                const active = habit.days.includes(day);
                const l = dayLabels(day);
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={active}
                    title={`${habit.title} — ${l.weekday} ${l.day} ${l.month}`}
                    aria-label={`${habit.title} on ${l.weekday} ${l.day} ${l.month}`}
                    onClick={() => toggleHabit(habit.id, day)}
                    className={cn(
                      "grid h-6 w-6 place-items-center rounded-full border-2 border-ink transition-colors",
                      active ? "bg-mint text-on-tint" : "bg-transparent hover:bg-mint/30",
                      day === today && "ring-2 ring-ring ring-offset-1 ring-offset-background",
                    )}
                  >
                    {active ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                  </button>
                );
              })}
              <button
                type="button"
                aria-label={`Delete ${habit.title}`}
                onClick={() => removeHabit(habit.id)}
                className="ml-1 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          addHabit(title.trim());
          setTitle("");
        }}
        className="mt-3 flex gap-2"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New habit…"
          aria-label="New habit"
          className="field min-w-0 flex-1"
        />
        <button
          type="submit"
          className="lift grid min-h-11 w-11 place-items-center rounded-lg border-2 border-ink bg-butter text-on-tint"
          aria-label="Add habit"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>
    </SketchCard>
  );
}
