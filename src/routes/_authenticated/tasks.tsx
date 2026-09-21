import { createFileRoute } from "@tanstack/react-router";
import { TaskList } from "@/components/tracker/TaskList";
import { ProgressPanel } from "@/components/tracker/ProgressPanel";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Carpe Diem" },
      {
        name: "description",
        content: "Every task in one place: add, prioritise, set due dates and check things off.",
      },
      { property: "og:title", content: "Tasks — Carpe Diem" },
      {
        property: "og:description",
        content: "Add, prioritise and complete your tasks with due dates and filters.",
      },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <TaskList full />
      <ProgressPanel />
    </div>
  );
}
