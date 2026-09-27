import { useState } from "react";
import { Target, Minus, Plus, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { SketchCard } from "./SketchCard";
import { useGoals } from "@/lib/tracker-store";

export function GoalsCard({ className }: { className?: string | undefined }) {
  const { goals, addGoal, bumpGoal, removeGoal } = useGoals();
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("10");
  const [unit, setUnit] = useState("times");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = title.trim();
    const t = Number(target);
    if (!value || !Number.isFinite(t) || t <= 0) return;
    try {
      await addGoal(value, t, unit.trim() || "times");
      setTitle("");
      toast.success("Goal added");
    } catch {
      toast.error("Failed to add goal");
    }
  };

  const doneCount = goals.filter((g) => g.current >= g.target).length;

  return (
    <SketchCard
      title="Goals to achieve"
      subtitle={goals.length ? `${doneCount}/${goals.length} complete` : "No goals yet"}
      icon={<Target className="h-5 w-5" />}
      className={className}
    >
      <ul className="space-y-4">
        {goals.map((goal) => {
          const pct = Math.round((goal.current / goal.target) * 100);
          const done = goal.current >= goal.target;
          return (
            <li key={goal.id} className="min-w-0">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <p
                  className={`min-w-0 truncate text-sm font-semibold ${done ? "line-through text-muted-foreground" : "text-foreground"}`}
                >
                  {goal.title}
                </p>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Decrease ${goal.title}`}
                    onClick={() => bumpGoal(goal.id, -1)}
                    className="grid h-8 w-8 place-items-center rounded-md border-2 border-ink"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Increase ${goal.title}`}
                    onClick={() => bumpGoal(goal.id, 1)}
                    className="grid h-8 w-8 place-items-center rounded-md border-2 border-ink bg-mint"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${goal.title}`}
                    onClick={() => removeGoal(goal.id)}
                    className="grid h-8 w-8 place-items-center rounded-md border-2 border-ink text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  {done ? (
                    <span className="shrink-0 text-sky">
                      <Check className="h-4 w-4" />
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full border-2 border-ink">
                <div
                  className={`h-full rounded-full transition-[width] duration-500 ${done ? "bg-sky" : "bg-mint"}`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {goal.current} / {goal.target} {goal.unit} · {pct}%
              </p>
            </li>
          );
        })}
      </ul>

      {goals.length === 0 ? (
        <p className="mt-4 text-center text-sm text-muted-foreground">No goals set yet — add one below.</p>
      ) : null}

      <form onSubmit={submit} className="mt-4 flex flex-wrap gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New goal…"
          aria-label="Goal title"
          className="min-h-11 min-w-0 flex-1 rounded-lg border-2 border-ink bg-transparent px-3 text-sm"
        />
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          inputMode="numeric"
          aria-label="Target"
          className="min-h-11 w-20 rounded-lg border-2 border-ink bg-transparent px-3 text-sm"
        />
        <input
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          aria-label="Unit"
          className="min-h-11 w-24 rounded-lg border-2 border-ink bg-transparent px-3 text-sm"
        />
        <button
          type="submit"
          className="min-h-11 rounded-lg border-2 border-ink bg-butter px-3 text-sm font-semibold text-ink"
        >
          Add goal
        </button>
      </form>
    </SketchCard>
  );
}
