import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  GoogleAuthProvider,
  updateProfile,
  createUserWithEmailAndPassword,
  getRedirectResult,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Carpe Diem" },
      {
        name: "description",
        content:
          "Sign in to Carpe Diem to sync tasks, goals, habits, notes and 90 days of progress across devices.",
      },
      { property: "og:title", content: "Sign in — Carpe Diem" },
      {
        property: "og:description",
        content: "Sign in to sync your tasks, goals, habits and notes across devices.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [busy, setBusy] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    // Completes a Google sign-in that had to fall back to a full page redirect.
    void getRedirectResult(auth).catch(() => null);
    const stop = auth.onAuthStateChanged((user) => {
      if (user) void navigate({ to: "/" });
    });
    return stop;
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "signup") {
        if (!firstName.trim() || !secondName.trim()) {
          toast.error("Please enter both first name and second name.");
          return;
        }
        if (password !== confirmPassword) {
          toast.error("Passwords do not match.");
          return;
        }
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, {
          displayName: `${firstName.trim()} ${secondName.trim()}`,
        });
        await setDoc(doc(db, "users", cred.user.uid), {
          firstName: firstName.trim(),
          secondName: secondName.trim(),
          displayName: `${firstName.trim()} ${secondName.trim()}`,
          createdAt: new Date().toISOString(),
        });
        toast.success("Account created — you're in.");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      await navigate({ to: "/" });
    } catch (error) {
      const raw = error instanceof Error ? error.message : "Could not sign in";
      const message = raw.replace(/^Firebase:\s*/, "");
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      await navigate({ to: "/" });
    } catch {
      try {
        await signInWithRedirect(auth, provider);
        return;
      } catch {
        toast.error("Google sign-in failed");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-md place-items-center px-4 py-10">
      <div className="nb-card w-full p-6 sm:p-7">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground">
          <span className="marker">Carpe Diem</span>
        </h1>
        <p className="mt-3 text-sm font-medium text-muted-foreground">
          {mode === "signin"
            ? "Sign in to load your tasks, goals, habits and notes."
            : "Create your account to start tracking."}
        </p>

        {error && (
          <div className="mt-4 rounded-base border-2 border-border bg-coral px-4 py-3 text-sm font-bold text-on-tint">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-3">
          {mode === "signup" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  aria-label="First name"
                  autoComplete="given-name"
                  className="nb-field w-full"
                />
                <input
                  type="text"
                  required
                  value={secondName}
                  onChange={(e) => setSecondName(e.target.value)}
                  placeholder="Second name"
                  aria-label="Second name"
                  autoComplete="family-name"
                  className="nb-field w-full"
                />
              </div>
            </>
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            aria-label="Email"
            autoComplete="email"
            className="nb-field w-full"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            aria-label="Password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="nb-field w-full"
          />
          {mode === "signup" && (
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              aria-label="Confirm password"
              autoComplete="new-password"
              className="nb-field w-full"
            />
          )}
          <button type="submit" disabled={busy} className="nb-btn w-full disabled:cursor-wait">
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="nb-label my-5 flex items-center gap-3">
          <span className="h-0.5 flex-1 bg-border" /> or <span className="h-0.5 flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={google}
          disabled={busy}
          className="nb-btn w-full bg-card text-foreground disabled:cursor-wait"
        >
          Continue with Google
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 w-full cursor-pointer text-sm font-bold text-foreground underline decoration-2 underline-offset-4"
        >
          {mode === "signin" ? "No account yet? Create one" : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
