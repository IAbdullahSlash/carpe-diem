import { useState } from "react";
import { Quote, Shuffle } from "lucide-react";
import { SketchCard } from "./SketchCard";
import { quoteForDay } from "@/lib/quotes";
import { useTodayKey } from "@/hooks/use-today";

export function QuoteCard({ compact = false }: { compact?: boolean }) {
  const today = useTodayKey();
  const [offset, setOffset] = useState(0);
  const quote = quoteForDay(today, offset);
  if (!quote) return null;

  return (
    <SketchCard
      title="Quote of the day"
      icon={<Quote className="h-5 w-5" />}
      action={
        <button
          type="button"
          aria-label="Show another quote"
          onClick={() => setOffset((o) => o + 1)}
          className="nb-btn nb-btn-sm nb-icon bg-mint text-on-tint"
        >
          <Shuffle className="h-4 w-4" />
        </button>
      }
      className="bg-card"
    >
      <blockquote
        className={
          compact
            ? "hand text-xl leading-snug text-foreground sm:text-2xl"
            : "hand text-2xl leading-snug text-foreground sm:text-3xl"
        }
      >
        “{quote.text}”
      </blockquote>
      <p className="nb-label mt-3">— {quote.author}</p>
    </SketchCard>
  );
}
