import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { auth } from "@/lib/firebase";

/** Current signed-in user, kept in sync with auth state changes. */
export function useAuthUser() {
  const [user, setUser] = useState<User | null>(() => auth.currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stop = auth.onAuthStateChanged((next) => {
      setUser(next);
      setLoading(false);
    });
    return stop;
  }, []);

  return { user, loading };
}
