import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { waitForAuthUser } from "@/lib/firebase";
import { GreetingHeader } from "@/components/tracker/GreetingHeader";
import { ensureSeed } from "@/lib/seed";
import { useAuthUser } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const user = await waitForAuthUser();
    if (!user) throw redirect({ to: "/auth" });
    return {};
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user } = useAuthUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;
    ensureSeed(user.uid, user.displayName ?? user.email ?? null)
      .then((seeded) => {
        if (seeded) void queryClient.invalidateQueries();
      })
      .catch(() => {
        /* seeding is best-effort; the dashboard still works empty */
      });
  }, [user, queryClient]);

  return (
    <div className="min-h-screen pb-16">
      <GreetingHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
