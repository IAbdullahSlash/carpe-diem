import { createFileRoute } from "@tanstack/react-router";
import { CalendarBoard } from "@/components/tracker/CalendarBoard";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Carpe Diem" },
      {
        name: "description",
        content: "Plan your days: notes, reminders and important events on a calendar.",
      },
      { property: "og:title", content: "Calendar — Carpe Diem" },
      {
        property: "og:description",
        content: "Notes, reminders, important events and pinned sticky notes, day by day.",
      },
    ],
  }),
  component: CalendarBoard,
});
