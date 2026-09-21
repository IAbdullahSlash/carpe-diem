import { Smile, Star } from "lucide-react";
import { SketchCard } from "./SketchCard";
import { cn } from "@/lib/utils";
import { asiaDayKey } from "@/lib/time";
import { usePersistentState } from "@/lib/tracker-store";

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

  return (
    <SketchCard title="Main focus today" icon={<Star className="h-5 w-5" />} className={className}>
      <input
        value={focus[today] ?? ""}
        onChange={(e) => setFocus((prev) => ({ ...prev, [today]: e.target.value }))}
        placeholder="The one thing that matters…"
        aria-label="Main focus today"
        className="hand min-h-11 w-full border-b-2 border-dashed border-ink bg-transparent text-2xl outline-none placeholder:text-muted-foreground"
      />
    </SketchCard>
  );
}
