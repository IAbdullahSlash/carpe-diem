import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Moon, Sun, SunMoon } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { greetingFor } from "@/lib/time";
import { useAsiaNow, useTheme, type ThemeMode } from "@/lib/use-theme";
import { useAuthUser } from "@/hooks/use-auth";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { QuoteCard } from "./QuoteCard";

const NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/tasks", label: "Tasks" },
  { to: "/goals", label: "Goals" },
  { to: "/notes", label: "Notes" },
  { to: "/calendar", label: "Calendar" },
] as const;

const MODES: { mode: ThemeMode; icon: typeof Sun; label: string }[] = [
  { mode: "auto", icon: SunMoon, label: "Auto (India time)" },
  { mode: "day", icon: Sun, label: "Day" },
  { mode: "night", icon: Moon, label: "Night" },
];

export function GreetingHeader() {
  const { clock, longDate, hour } = useAsiaNow();
  const { mode, setMode, night } = useTheme();
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!user) return;
    if (user.displayName) {
      setDisplayName(user.displayName);
      return;
    }
    // Read from Firestore profile — the source of truth after signup
    getDoc(doc(db, "users", user.uid))
      .then((snap) => {
        if (snap.exists()) setDisplayName(snap.data()["displayName"] ?? null);
      })
      .catch(() => null);
  }, [user]);

  return (
    <header className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              <span className="marker">{greetingFor(hour, displayName)}</span>
            </h1>
            <p
              className="mt-2 truncate text-xs font-medium text-muted-foreground sm:text-sm"
              suppressHydrationWarning
            >
              {longDate}
              {mounted ? ` · ${clock} IST · ${night ? "night mode" : "day mode"}` : ""}
            </p>
          </div>
          <div className="nb-segment shrink-0">
            {MODES.map(({ mode: m, icon: Icon, label }) => (
              <button
                key={m}
                type="button"
                aria-label={label}
                aria-pressed={mode === m}
                title={label}
                onClick={() => setMode(m)}
                className="nb-segment-item h-9 w-9 px-0"
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
        <QuoteCard compact />
      </div>

      <nav className="mt-5 flex flex-wrap gap-3">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === "/" }}
            className="nb-btn nb-btn-sm text-sm"
            inactiveProps={{ className: "bg-card text-foreground" }}
            activeProps={{ className: "bg-main text-main-foreground" }}
          >
            {item.label}
          </Link>
        ))}
        <div className="ml-auto flex items-center gap-2">
          {displayName ? (
            <span className="hidden max-w-[12rem] truncate text-xs font-bold text-muted-foreground sm:block">
              {displayName}
            </span>
          ) : null}
          <button
            type="button"
            onClick={async () => {
              await signOut(auth);
              await navigate({ to: "/auth" });
            }}
            className="nb-btn nb-btn-sm bg-card text-sm text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </nav>
    </header>
  );
}
