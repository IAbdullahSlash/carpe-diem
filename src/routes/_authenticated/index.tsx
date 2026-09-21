import { createFileRoute } from "@tanstack/react-router";
import { TaskList } from "@/components/tracker/TaskList";
import { GoalsCard } from "@/components/tracker/GoalsCard";
import { NotesBoard } from "@/components/tracker/NotesBoard";
import { HabitTracker } from "@/components/tracker/HabitTracker";
import { ProgressPanel } from "@/components/tracker/ProgressPanel";
import { FocusCard, MoodCard } from "@/components/tracker/DayPanel";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Carpe Diem — tasks, goals, habits & notes" },
      {
        name: "description",
        content:
          "A hand-drawn daily tracker: pending tasks, goals, habits, quote of the day and notes, with day/night mode on India time.",
      },
      { property: "og:title", content: "Carpe Diem" },
      {
        property: "og:description",
        content: "Pending tasks, goals, habits, quote of the day and notes in one sketchbook dashboard.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <FocusCard className="md:col-span-2 xl:col-span-2" />
      <MoodCard />
      <NotesBoard />
      <TaskList />
      <ProgressPanel />
      <GoalsCard />
      <HabitTracker />
    </div>
  );
}
