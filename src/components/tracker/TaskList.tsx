import { useState } from "react";
import { Check, Plus, Trash2, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { SketchCard } from "./SketchCard";
import { cn } from "@/lib/utils";
import { useTasks, type Priority, type Task } from "@/lib/tracker-store";
import { pendingSinceText } from "@/lib/time";
import { useTodayKey } from "@/hooks/use-today";

const priorityStyles: Record<Priority, string> = {
  low: "bg-sky",
  normal: "bg-mint",
  high: "bg-coral",
};

export function TaskRow({
  task,
  onToggle,
  onRemove,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const today = useTodayKey();
  const pendingSince = task.done ? null : pendingSinceText(task.createdAt, today);
  return (
    <li className="flex min-h-11 items-center gap-3 border-b border-dashed border-border/60 py-2 last:border-0">
      <button
        type="button"
        aria-label={task.done ? `Mark ${task.title} pending` : `Complete ${task.title}`}
        onClick={() => onToggle(task.id)}
        className="grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 border-ink"
      >
        {task.done ? <Check className="h-4 w-4" strokeWidth={3} /> : null}
      </button>
      <span
        className={cn(
          "min-w-0 flex-1 break-words text-sm",
          task.done && "text-muted-foreground line-through",
        )}
      >
        {task.title}
        {task.due ? (
          <span className="ml-2 whitespace-nowrap text-xs text-muted-foreground">
            due {task.due}
          </span>
        ) : null}
        {pendingSince ? (
          <span className="ml-2 whitespace-nowrap text-xs font-medium text-coral-ink">
            {pendingSince}
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          "hidden shrink-0 rounded-full border-2 border-ink px-2 py-0.5 text-[10px] uppercase text-on-tint sm:inline",
          priorityStyles[task.priority],
        )}
      >
        {task.priority}
      </span>
      <button
        type="button"
        aria-label={`Delete ${task.title}`}
        onClick={() => onRemove(task.id)}
        className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}

export function TaskList({ full = false }: { full?: boolean }) {
  const { tasks, addTask, toggleTask, removeTask } = useTasks();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [due, setDue] = useState("");
  const [filter, setFilter] = useState<"pending" | "done" | "all">(full ? "all" : "pending");

  const pending = tasks.filter((t) => !t.done);
  const shown =
    filter === "all" ? tasks : filter === "pending" ? pending : tasks.filter((t) => t.done);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = title.trim();
    if (!value) return;
    addTask(value, priority, due || undefined);
    setTitle("");
    setDue("");
    toast.success("Task added");
  };

  return (
    <SketchCard
      title="Pending tasks"
      subtitle={`${pending.length} to go · ${tasks.length - pending.length} done`}
      icon={<CheckSquare className="h-5 w-5" />}
      action={
        <div className="flex gap-1">
          {(["pending", "done", "all"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "lift min-h-8 rounded-full border-2 border-ink px-2.5 text-[11px] capitalize",
                filter === f ? "bg-ink font-semibold text-primary-foreground" : "bg-transparent",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      }
    >
      <form onSubmit={submit} className="mb-3 flex flex-wrap gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Write a task…"
          aria-label="Task title"
          className="field min-w-0 flex-1"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          aria-label="Priority"
          className="field px-2"
        >
          <option value="low">low</option>
          <option value="normal">normal</option>
          <option value="high">high</option>
        </select>
        {full ? (
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            aria-label="Due date"
            className="field px-2"
          />
        ) : null}
        <button
          type="submit"
          className="lift flex min-h-11 items-center gap-1 rounded-lg border-2 border-ink bg-butter px-3 text-sm font-semibold text-on-tint"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </form>

      {shown.length === 0 ? (
        <p className="hand text-lg text-muted-foreground">Nothing here — enjoy the blank page.</p>
      ) : (
        <ul className={cn("min-w-0", !full && "max-h-72 overflow-y-auto pr-1")}>
          {shown.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={toggleTask} onRemove={removeTask} />
          ))}
        </ul>
      )}
    </SketchCard>
  );
}
