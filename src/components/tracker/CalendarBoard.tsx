import { useState } from "react";
import { endOfMonth, startOfMonth } from "date-fns";
import {
  Bell,
  CalendarDays,
  Check,
  Flag,
  NotebookPen,
  PartyPopper,
  Pin,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { SketchCard } from "./SketchCard";
import { noteTint } from "./tints";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useTodayKey } from "@/hooks/use-today";
import { dateOfDayKey, dayKeyOfDate, daysUntil, deadlineText, friendlyDay } from "@/lib/time";
import { useCalendar, useNotes, type CalendarEntry, type EntryKind } from "@/lib/tracker-store";

const KINDS: { kind: EntryKind; label: string; icon: typeof Bell; tint: string }[] = [
  { kind: "event", label: "Event", icon: PartyPopper, tint: "bg-sky" },
  { kind: "deadline", label: "Deadline", icon: Flag, tint: "bg-coral" },
  { kind: "reminder", label: "Reminder", icon: Bell, tint: "bg-butter" },
  { kind: "note", label: "Note", icon: NotebookPen, tint: "bg-mint" },
];

const kindMeta = (kind: EntryKind) => KINDS.find((k) => k.kind === kind) ?? KINDS[0]!;

export function EntryRow({
  entry,
  onUpdate,
  onRemove,
}: {
  entry: CalendarEntry;
  onUpdate: (id: string, changes: Partial<Pick<CalendarEntry, "important" | "done">>) => void;
  onRemove: (id: string) => void;
}) {
  const today = useTodayKey();
  const meta = kindMeta(entry.kind);
  const Icon = meta.icon;
  const countdown = entry.kind === "deadline" && !entry.done;
  return (
    <li className="flex min-h-11 items-start gap-3 border-b border-dashed border-border/60 py-2 last:border-0">
      <button
        type="button"
        aria-label={entry.done ? `Mark ${entry.title} not done` : `Mark ${entry.title} done`}
        onClick={() => onUpdate(entry.id, { done: !entry.done })}
        className={cn(
          "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 border-ink text-on-tint",
          meta.tint,
        )}
      >
        {entry.done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "break-words text-sm font-semibold",
            entry.done && "text-muted-foreground line-through",
          )}
        >
          {entry.time ? (
            <span className="mr-2 font-mono text-xs text-muted-foreground">{entry.time}</span>
          ) : null}
          {entry.title}
          {countdown ? (
            <span
              className={cn(
                "ml-2 whitespace-nowrap rounded-full border border-ink px-1.5 text-[10px] font-semibold uppercase",
                daysUntil(entry.day, today) <= 1
                  ? "bg-coral text-on-tint"
                  : "text-muted-foreground",
              )}
            >
              {deadlineText(entry.day, today)}
            </span>
          ) : null}
        </p>
        {entry.details ? (
          <p className="mt-0.5 whitespace-pre-wrap break-words text-xs text-muted-foreground">
            {entry.details}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        aria-pressed={entry.important}
        aria-label={entry.important ? "Unmark important" : "Mark important"}
        onClick={() => onUpdate(entry.id, { important: !entry.important })}
        className={cn(
          "shrink-0 transition-colors",
          entry.important ? "text-coral-ink" : "text-muted-foreground hover:text-coral-ink",
        )}
      >
        <Star className={cn("h-4 w-4", entry.important && "fill-current")} />
      </button>
      <button
        type="button"
        aria-label={`Delete ${entry.title}`}
        onClick={() => onRemove(entry.id)}
        className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}

function AddEntryForm({
  day,
  onAdd,
}: {
  day: string;
  onAdd: (entry: Omit<CalendarEntry, "id" | "done">) => Promise<void>;
}) {
  const [kind, setKind] = useState<EntryKind>("event");
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [details, setDetails] = useState("");
  const [important, setImportant] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = title.trim();
    if (!value) return;
    try {
      await onAdd({
        kind,
        title: value,
        day,
        time: time || undefined,
        details: details.trim() || undefined,
        important,
      });
      setTitle("");
      setTime("");
      setDetails("");
      setImportant(false);
      toast.success(`${kindMeta(kind).label} added`);
    } catch {
      toast.error("Couldn't save — try again");
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 space-y-2 border-t-2 border-ink/20 pt-4">
      <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Entry type">
        {KINDS.map(({ kind: k, label, icon: Icon, tint }) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={kind === k}
            onClick={() => setKind(k)}
            className={cn(
              "lift flex min-h-8 items-center gap-1 rounded-full border-2 border-ink px-3 py-1 text-xs",
              kind === k
                ? cn(tint, "font-semibold text-on-tint")
                : "bg-transparent text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`New ${kindMeta(kind).label.toLowerCase()}…`}
          aria-label="Title"
          className="field min-w-0 flex-1"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          aria-label="Time (optional)"
          className="field w-28 px-2"
        />
      </div>
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Details (optional)"
        aria-label="Details"
        rows={2}
        className="w-full resize-none rounded-lg border-2 border-ink bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
      />
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-pressed={important}
          onClick={() => setImportant((v) => !v)}
          className={cn(
            "flex items-center gap-1 text-sm",
            important ? "font-semibold text-coral-ink" : "text-muted-foreground",
          )}
        >
          <Star className={cn("h-4 w-4", important && "fill-current")} /> Important
        </button>
        <button
          type="submit"
          className="lift min-h-11 rounded-lg border-2 border-ink bg-butter px-4 text-sm font-semibold text-on-tint"
        >
          Add
        </button>
      </div>
    </form>
  );
}

export function CalendarBoard() {
  const today = useTodayKey();
  const [selected, setSelected] = useState(today);
  const [month, setMonth] = useState(() => startOfMonth(dateOfDayKey(today)));

  const from = dayKeyOfDate(startOfMonth(month));
  const to = dayKeyOfDate(endOfMonth(month));
  const { entries, addEntry, updateEntry, removeEntry } = useCalendar(from, to);
  const { notes, pinNote } = useNotes();

  const pinned = notes.filter((n) => n.day);
  const dayEntries = entries.filter((e) => e.day === selected);
  const dayNotes = pinned.filter((n) => n.day === selected);

  const busyDays = new Set([...entries.map((e) => e.day), ...pinned.map((n) => n.day!)]);
  const importantDays = new Set(entries.filter((e) => e.important).map((e) => e.day));

  const select = (date: Date | undefined) => {
    if (!date) return;
    setSelected(dayKeyOfDate(date));
    setMonth(startOfMonth(date));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <SketchCard
        title="Calendar"
        subtitle={`${entries.length} entr${entries.length === 1 ? "y" : "ies"} this month`}
        icon={<CalendarDays className="h-5 w-5" />}
        action={
          <button
            type="button"
            onClick={() => select(dateOfDayKey(today))}
            className="lift inline-flex min-h-8 items-center rounded-full border-2 border-ink px-3 text-xs font-semibold"
          >
            Today
          </button>
        }
      >
        <Calendar
          mode="single"
          selected={dateOfDayKey(selected)}
          onSelect={select}
          month={month}
          onMonthChange={setMonth}
          today={dateOfDayKey(today)}
          weekStartsOn={1}
          modifiers={{
            busy: (date) => busyDays.has(dayKeyOfDate(date)),
            important: (date) => importantDays.has(dayKeyOfDate(date)),
          }}
          modifiersClassNames={{
            busy: "after:pointer-events-none after:absolute after:bottom-1 after:left-1/2 after:h-1.5 after:w-1.5 after:-translate-x-1/2 after:rounded-full after:bg-sky after:ring-1 after:ring-ink",
            important: "after:!bg-coral",
          }}
          className="w-full bg-transparent p-0 [--cell-size:2.6rem] sm:[--cell-size:3rem]"
          classNames={{ root: "w-full" }}
        />
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky ring-1 ring-ink" /> Has entries
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-coral ring-1 ring-ink" /> Something important
          </span>
        </div>
      </SketchCard>

      <SketchCard
        title={friendlyDay(selected, today)}
        subtitle={dateOfDayKey(selected).toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        icon={<NotebookPen className="h-5 w-5" />}
      >
        {dayEntries.length === 0 && dayNotes.length === 0 ? (
          <p className="hand text-lg text-muted-foreground">Nothing planned — a clear day.</p>
        ) : null}

        {dayEntries.length ? (
          <ul>
            {dayEntries.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                onUpdate={updateEntry}
                onRemove={removeEntry}
              />
            ))}
          </ul>
        ) : null}

        {dayNotes.length ? (
          <div className="mt-3">
            <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
              Pinned sticky notes
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {dayNotes.map((note) => (
                <div
                  key={note.id}
                  className={cn(
                    "relative rounded-md border-2 border-ink p-2 pr-7 shadow-[3px_3px_0_0_var(--ink)]",
                    noteTint[note.tint],
                  )}
                >
                  <p className="hand whitespace-pre-wrap break-words text-lg leading-snug text-on-tint">
                    {note.text || "(empty note)"}
                  </p>
                  <button
                    type="button"
                    aria-label="Unpin note from this day"
                    title="Unpin"
                    onClick={() => pinNote(note.id, null)}
                    className="absolute right-1.5 top-1.5 text-on-tint/60 hover:text-on-tint"
                  >
                    <Pin className="h-4 w-4 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <AddEntryForm day={selected} onAdd={addEntry} />
      </SketchCard>
    </div>
  );
}
