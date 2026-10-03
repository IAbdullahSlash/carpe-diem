import { Link } from "@tanstack/react-router";
import { CalendarClock, Pin } from "lucide-react";
import { SketchCard } from "./SketchCard";
import { EntryRow } from "./CalendarBoard";
import { noteTint } from "./tints";
import { cn } from "@/lib/utils";
import { useTodayKey } from "@/hooks/use-today";
import { friendlyDay, lastNDayKeys, shiftDayKey } from "@/lib/time";
import { useCalendar, useNotes, useOverdueDeadlines } from "@/lib/tracker-store";

const DAYS_AHEAD = 7;

/** Dashboard list of calendar entries and pinned notes for today + the next week. */
export function ComingUp({ className }: { className?: string | undefined }) {
  const today = useTodayKey();
  const until = shiftDayKey(today, DAYS_AHEAD);
  const { entries, updateEntry, removeEntry } = useCalendar(today, until);
  const { notes } = useNotes();
  const overdue = useOverdueDeadlines(today);

  const days = lastNDayKeys(DAYS_AHEAD + 1, until);
  const groups = days
    .map((day) => ({
      day,
      // Important first, then by time (all-day entries lead).
      entries: entries
        .filter((e) => e.day === day)
        .sort((a, b) => Number(b.important) - Number(a.important)),
      notes: notes.filter((n) => n.day === day),
    }))
    .filter((g) => g.entries.length || g.notes.length);

  // Missed deadlines stay on top until they're ticked off.
  if (overdue.length) groups.unshift({ day: "overdue", entries: overdue, notes: [] });

  return (
    <SketchCard
      title="Coming up"
      subtitle={
        overdue.length ? `${overdue.length} overdue · next 7 days` : "Today and the next 7 days"
      }
      icon={<CalendarClock className="h-5 w-5" />}
      className={className}
      action={
        <Link
          to="/calendar"
          className="lift inline-flex min-h-8 items-center rounded-full border-2 border-ink px-3 text-xs font-semibold"
        >
          Calendar
        </Link>
      }
    >
      {groups.length === 0 ? (
        <p className="hand text-lg text-muted-foreground">
          Nothing planned this week — add something on the calendar.
        </p>
      ) : (
        <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
          {groups.map((group) => (
            <div key={group.day}>
              <p
                className={cn(
                  "text-xs uppercase tracking-widest",
                  group.day === today ? "font-bold text-foreground" : "text-muted-foreground",
                  group.day === "overdue" && "font-bold text-coral-ink",
                )}
              >
                {group.day === "overdue" ? "Overdue" : friendlyDay(group.day, today)}
              </p>
              <ul>
                {group.entries.map((entry) => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    onUpdate={updateEntry}
                    onRemove={removeEntry}
                  />
                ))}
              </ul>
              {group.notes.map((note) => (
                <p
                  key={note.id}
                  className={cn(
                    "hand mt-1 flex items-start gap-1.5 rounded-md border-2 border-ink px-2 py-1 text-base leading-snug text-on-tint",
                    noteTint[note.tint],
                  )}
                >
                  <Pin className="mt-1 h-3.5 w-3.5 shrink-0" />
                  <span className="min-w-0 break-words">{note.text || "(empty note)"}</span>
                </p>
              ))}
            </div>
          ))}
        </div>
      )}
    </SketchCard>
  );
}
