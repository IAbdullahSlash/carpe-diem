import { useState } from "react";
import { Smile, Star } from "lucide-react";
import { SketchCard } from "./SketchCard";
import { cn } from "@/lib/utils";
import { useTodayKey } from "@/hooks/use-today";
import { usePersistentState } from "@/lib/tracker-store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MOODS = ["😖", "😕", "🙂", "😄", "🤩"];

export function MoodCard({ className }: { className?: string | undefined }) {
  const today = useTodayKey();
  const [moods, setMoods] = usePersistentState<Record<string, number>>("moods", {});
  const current = moods[today];

  return (
    <SketchCard title="How's today?" icon={<Smile className="h-5 w-5" />} className={className}>
      <div className="flex flex-wrap gap-2">
        {MOODS.map((m, i) => (
          <button
            key={m}
            type="button"
            aria-label={`Rate day ${i + 1} of 5`}
            aria-pressed={current === i}
            onClick={() => setMoods((prev) => ({ ...prev, [today]: i }))}
            className={cn(
              "nb-btn nb-icon h-12 w-12 text-xl",
              current === i ? "bg-main" : "bg-card",
            )}
          >
            {m}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs font-medium text-muted-foreground">
        {current === undefined ? "Pick a face for today." : "Saved for today."}
      </p>
    </SketchCard>
  );
}

export function FocusCard({ className }: { className?: string | undefined }) {
  const today = useTodayKey();
  const [focus, setFocus] = usePersistentState<Record<string, string>>("focus", {});
  const [held, setHeld] = usePersistentState<Record<string, string>>("focusHeld", {});
  const [open, setOpen] = useState(false);

  const current = focus[today] ?? "";
  const heldToday = held[today];
  const isHeld = !!heldToday;

  function handleHold() {
    if (!current.trim()) return;
    setOpen(true);
  }

  function confirmHold() {
    setHeld((prev) => ({ ...prev, [today]: current.trim() }));
    setOpen(false);
  }

  function release() {
    setHeld((prev) => {
      const next = { ...prev };
      delete next[today];
      return next;
    });
  }

  return (
    <SketchCard title="Main focus today" icon={<Star className="h-5 w-5" />} className={className}>
      {isHeld ? (
        <div className="space-y-3">
          <p className="hand text-3xl font-bold text-foreground">{heldToday}</p>
          <div className="flex items-center gap-3">
            <span className="nb-badge bg-coral text-on-tint">Held for today</span>
            <button
              type="button"
              onClick={release}
              className="nb-btn nb-btn-sm bg-card text-foreground"
            >
              Release
            </button>
          </div>
        </div>
      ) : (
        <>
          <input
            value={current}
            onChange={(e) => setFocus((prev) => ({ ...prev, [today]: e.target.value }))}
            placeholder="The one thing that matters…"
            aria-label="Main focus today"
            className="nb-field hand w-full text-2xl"
          />
          {current.trim() ? (
            <button type="button" onClick={handleHold} className="nb-btn mt-3">
              Hold today's focus
            </button>
          ) : null}
        </>
      )}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hold this as today's focus?</AlertDialogTitle>
            <AlertDialogDescription>
              This locks your focus for the rest of today. You can release it anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmHold}>Hold</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SketchCard>
  );
}
