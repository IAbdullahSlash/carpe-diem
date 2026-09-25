import { useState } from "react";
import { Smile, Star } from "lucide-react";
import { SketchCard } from "./SketchCard";
import { cn } from "@/lib/utils";
import { asiaDayKey } from "@/lib/time";
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
  const today = asiaDayKey();
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
            onClick={() => setMoods((prev) => ({ ...prev, [today]: i }))}
            className={cn(
              "grid h-12 w-12 place-items-center rounded-full border-2 border-ink text-xl transition-transform hover:-translate-y-0.5",
              current === i ? "bg-butter" : "bg-transparent",
            )}
          >
            {m}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {current === undefined ? "Pick a face for today." : "Saved for today."}
      </p>
    </SketchCard>
  );
}

export function FocusCard({ className }: { className?: string | undefined }) {
  const today = asiaDayKey();
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
            <span className="text-xs uppercase tracking-widest text-coral">Held for today</span>
            <button
              type="button"
              onClick={release}
              className="text-xs underline decoration-dashed underline-offset-4 text-foreground"
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
            className="hand min-h-11 w-full border-b-2 border-dashed border-ink bg-transparent text-2xl outline-none placeholder:text-muted-foreground"
          />
          {current.trim() ? (
            <button
              type="button"
              onClick={handleHold}
              className="mt-3 rounded-full border-2 border-ink bg-sky px-4 py-2 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
            >
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
