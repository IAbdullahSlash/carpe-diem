import { useState } from "react";
import { Target, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { SketchCard } from "./SketchCard";
import { useGoals } from "@/lib/tracker-store";

export function GoalsCard({ className }: { className?: string | undefined }) {
  const { goals, addGoal, removeGoal } = useGoals();
  const [title, setTitle] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = title.trim();
    if (!value) return;
    try {
      await addGoal(value, 1, "times");
      setTitle("");
      toast.success("Goal added");
    } catch {
      toast.error("Failed to add goal");
    }
  };

  // Only show the most recent active goal — one box, one focus
  const activeGoal = goals.find((g) => g.current < g.target);

  const done = activeGoal ? activeGoal.current >= activeGoal.target : false;

  return (
    <SketchCard
      title="Goals to achieve"
      subtitle={activeGoal ? (done ? "Complete" : "In progress") : "No active goal"}
      icon={<Target className="h-5 w-5" />}
      className={className}
    >
      {activeGoal ? (
        <div className="flex items-center justify-between gap-2">
          <p
            className={`truncate text-sm font-semibold ${done ? "line-through text-muted-foreground" : "text-foreground"}`}
          >
            {activeGoal.title}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Delete goal"
              onClick={() => removeGoal(activeGoal.id)}
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
      ) : (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No active goal yet — add one below.
        </p>
      )}

      <form onSubmit={submit} className="mt-4">
        <div className="flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Write your goal…"
            aria-label="Goal title"
            className="min-h-11 flex-1 rounded-lg border-2 border-ink bg-transparent px-3 text-sm"
          />
          <button
            type="submit"
            className="min-h-11 rounded-lg border-2 border-ink bg-butter px-4 text-sm font-semibold text-ink"
          >
            Add
          </button>
        </div>
      </form>
    </SketchCard>
  );
}
