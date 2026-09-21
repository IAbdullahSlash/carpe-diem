import { createFileRoute } from "@tanstack/react-router";
import { NotesBoard } from "@/components/tracker/NotesBoard";
import { QuoteCard } from "@/components/tracker/QuoteCard";

export const Route = createFileRoute("/_authenticated/notes")({
  head: () => ({
    meta: [
      { title: "Notes — Carpe Diem" },
      { name: "description", content: "Sticky notes for ideas, reminders and quick thoughts." },
      { property: "og:title", content: "Notes — Carpe Diem" },
      {
        property: "og:description",
        content: "Capture ideas and reminders on colourful sticky notes.",
      },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  return (
    <div className="grid gap-4">
      <QuoteCard />
      <NotesBoard full />
    </div>
  );
}
