import { StickyNote, Plus, Trash2 } from "lucide-react";
import { SketchCard } from "./SketchCard";
import { cn } from "@/lib/utils";
import { useNotes, type Note } from "@/lib/tracker-store";

const tintClass: Record<Note["tint"], string> = {
  mint: "bg-mint",
  sky: "bg-sky",
  butter: "bg-butter",
  coral: "bg-coral",
};

export function NotesBoard({ full = false }: { full?: boolean }) {
  const { notes, addNote, updateNote, removeNote } = useNotes();

  return (
    <SketchCard
      title="Notes"
      subtitle={`${notes.length} note${notes.length === 1 ? "" : "s"}`}
      icon={<StickyNote className="h-5 w-5" />}
      action={
        <button
          type="button"
          onClick={() => addNote("")}
          className="flex min-h-9 items-center gap-1 rounded-md border-2 border-ink bg-butter px-2 text-xs font-semibold text-ink"
        >
          <Plus className="h-3.5 w-3.5" /> New
        </button>
      }
    >
      {notes.length === 0 ? (
        <p className="hand text-lg text-muted-foreground">No notes yet — jot something down.</p>
      ) : (
        <div className={cn("grid gap-3", full ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2")}>
          {notes.map((note, i) => (
            <div
              key={note.id}
              className={cn(
                "relative rounded-md border-2 border-ink p-2 shadow-[3px_3px_0_0_var(--ink)]",
                tintClass[note.tint],
                i % 2 ? "rotate-[0.6deg]" : "-rotate-[0.6deg]",
              )}
            >
              <textarea
                value={note.text}
                onChange={(e) => updateNote(note.id, e.target.value)}
                placeholder="Type here…"
                aria-label="Note text"
                rows={3}
                className="hand w-full resize-none bg-transparent pr-6 text-xl leading-snug text-ink outline-none placeholder:text-ink/50"
              />
              <button
                type="button"
                aria-label="Delete note"
                onClick={() => removeNote(note.id)}
                className="absolute right-1.5 top-1.5 text-ink/60 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </SketchCard>
  );
}
