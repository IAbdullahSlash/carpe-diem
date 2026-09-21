import { useState } from "react";
import { Quote, Shuffle } from "lucide-react";
import { SketchCard } from "./SketchCard";
import { quoteForDay } from "@/lib/quotes";
import { asiaDayKey } from "@/lib/time";

export function QuoteCard({ compact = false }: { compact?: boolean }) {
  const [offset, setOffset] = useState(0);
  const quote = quoteForDay(asiaDayKey(), offset);
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
          className="grid h-9 w-9 place-items-center rounded-md border-2 border-ink bg-mint"
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
      <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
        — {quote.author}
      </p>
    </SketchCard>
  );
}
