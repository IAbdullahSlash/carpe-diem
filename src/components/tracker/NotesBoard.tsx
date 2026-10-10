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
        <button type="button" onClick={() => addNote("")} className="nb-btn nb-btn-sm">
          <Plus className="h-3.5 w-3.5" /> New
        </button>
      }
    >
      {notes.length === 0 ? (
        <p className="text-sm font-medium text-muted-foreground">
          No notes yet — jot something down.
        </p>
      ) : (
        <div
          className={cn("grid gap-3", full ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2")}
        >
          {notes.map((note) => (
            <div
              key={note.id}
              className={cn(
                "relative rounded-base border-2 border-border p-3 shadow-[4px_4px_0_0_var(--border)]",
                noteTint[note.tint],
              )}
            >
              <textarea
                value={note.text}
                onChange={(e) => updateNote(note.id, e.target.value)}
                placeholder="Type here…"
                aria-label="Note text"
                rows={3}
                className="hand w-full resize-none bg-transparent pr-8 text-xl leading-snug text-on-tint outline-none placeholder:text-on-tint/55"
              />
              <PinControl note={note} onPin={(day) => pinNote(note.id, day)} />
              <button
                type="button"
                aria-label="Delete note"
                onClick={() => removeNote(note.id)}
                className="nb-ghost absolute right-1 top-1 text-on-tint/70 hover:text-on-tint"
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
      <span className="nb-badge mt-1 bg-card text-foreground">
        <Pin className="h-3 w-3 fill-current" /> {friendlyDay(note.day, today)}
        <button
          type="button"
          aria-label="Unpin from calendar"
          onClick={() => onPin(null)}
          className="ml-0.5 opacity-60 hover:opacity-100"
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
          className="nb-badge mt-1 cursor-pointer border-on-tint bg-transparent text-on-tint hover:bg-card hover:text-foreground"
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
