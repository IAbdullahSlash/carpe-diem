import { useState } from "react";
import { Target, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { SketchCard } from "./SketchCard";
import { useGoals } from "@/lib/tracker-store";

export function GoalsCard({ className }: { className?: string | undefined }) {
  const { goals, addGoal, bumpGoal, removeGoal } = useGoals();
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

  // Only show the oldest unfinished goal — one box, one focus
  const activeGoal = goals.find((g) => g.current < g.target);
  const achieved = goals.length - goals.filter((g) => g.current < g.target).length;

  return (
    <SketchCard
      title="Goals to achieve"
      subtitle={`${activeGoal ? "In progress" : "No active goal"} · ${achieved} achieved`}
      icon={<Target className="h-5 w-5" />}
      className={className}
    >
      {activeGoal ? (
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{activeGoal.title}</p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Mark goal achieved"
              title="Mark achieved"
              onClick={async () => {
                await bumpGoal(activeGoal.id, activeGoal.target - activeGoal.current);
                toast.success("Goal achieved");
              }}
              className="lift grid h-9 w-9 place-items-center rounded-md border-2 border-ink bg-mint text-on-tint"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label="Delete goal"
              onClick={() => removeGoal(activeGoal.id)}
              className="lift grid h-9 w-9 place-items-center rounded-md border-2 border-ink text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
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
            className="field min-w-0 flex-1"
          />
          <button
            type="submit"
            className="lift min-h-11 rounded-lg border-2 border-ink bg-butter px-4 text-sm font-semibold text-on-tint"
          >
            Add
          </button>
        </div>
      </form>
    </SketchCard>
  );
}
