import { useState } from "react";
import { StickyNote, Plus, Trash2, Pin, X } from "lucide-react";
import { SketchCard } from "./SketchCard";
import { cn } from "@/lib/utils";
import { useNotes, type Note } from "@/lib/tracker-store";
import { noteTint } from "./tints";
import { useTodayKey } from "@/hooks/use-today";
import { dateOfDayKey, dayKeyOfDate, friendlyDay } from "@/lib/time";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function NotesBoard({ full = false }: { full?: boolean }) {
  const { notes, addNote, updateNote, pinNote, removeNote } = useNotes();

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
        <div
          className={cn("grid gap-3", full ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2")}
        >
          {notes.map((note, i) => (
            <div
              key={note.id}
              className={cn(
                "relative rounded-md border-2 border-ink p-2 shadow-[3px_3px_0_0_var(--ink)]",
                noteTint[note.tint],
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
              <PinControl note={note} onPin={(day) => pinNote(note.id, day)} />
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

/** "Pin to date" picker, or the pinned date with an unpin button. */
function PinControl({ note, onPin }: { note: Note; onPin: (day: string | null) => void }) {
  const today = useTodayKey();
  const [open, setOpen] = useState(false);

  if (note.day) {
    return (
      <span className="mt-1 inline-flex items-center gap-1 rounded-full border-2 border-ink bg-background/60 px-2 py-0.5 text-[11px] font-semibold text-ink">
        <Pin className="h-3 w-3 fill-current" /> {friendlyDay(note.day, today)}
        <button
          type="button"
          aria-label="Unpin from calendar"
          onClick={() => onPin(null)}
          className="ml-0.5 text-ink/60 hover:text-ink"
        >
          <X className="h-3 w-3" />
        </button>
      </span>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="mt-1 inline-flex items-center gap-1 text-[11px] text-ink/60 hover:text-ink"
        >
          <Pin className="h-3 w-3" /> Pin to date
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <Calendar
          mode="single"
          defaultMonth={dateOfDayKey(today)}
          today={dateOfDayKey(today)}
          weekStartsOn={1}
          onSelect={(date) => {
            if (!date) return;
            onPin(dayKeyOfDate(date));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
