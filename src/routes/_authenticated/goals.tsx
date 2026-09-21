import { createFileRoute } from "@tanstack/react-router";
import { GoalsCard } from "@/components/tracker/GoalsCard";
import { HabitTracker } from "@/components/tracker/HabitTracker";

export const Route = createFileRoute("/_authenticated/goals")({
  head: () => ({
    meta: [
      { title: "Goals — Carpe Diem" },
      {
        name: "description",
        content: "Track goal progress with targets, units and daily habit streaks.",
      },
      { property: "og:title", content: "Goals — Carpe Diem" },
      {
        property: "og:description",
        content: "Set targets, log progress and keep your habit streaks alive.",
      },
    ],
  }),
  component: GoalsPage,
});

function GoalsPage() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <GoalsCard full />
      <HabitTracker />
    </div>
  );
}
