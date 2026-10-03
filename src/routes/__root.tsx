import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  type ErrorComponentProps,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { initAnalytics } from "@/lib/firebase";
import { useTheme } from "@/lib/use-theme";

function NotFoundComponent() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="sketch max-w-md p-6 text-center sm:p-8">
        <h1 className="hand font-bold text-6xl leading-none text-foreground">404</h1>
        <h2 className="hand font-bold mt-3 text-3xl leading-tight text-foreground">
          <span className="marker">Page not found</span>
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          This page isn't in the notebook — it may have moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-ink bg-mint px-4 text-sm font-semibold text-on-tint lift"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="sketch max-w-md p-6 text-center sm:p-8">
        <h1 className="hand text-3xl leading-tight text-foreground">
          <span className="marker">This page didn't load</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Something went wrong on our end. You can try again or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-ink bg-mint px-4 text-sm font-semibold text-on-tint lift"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-ink px-4 text-sm font-semibold text-foreground lift"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Carpe Diem" },
      {
        name: "description",
        content: "A hand-drawn daily tracker for tasks, goals, habits and notes.",
      },
      { name: "author", content: "Abdullah" },
      { property: "og:title", content: "Carpe Diem" },
      {
        property: "og:description",
        content: "A hand-drawn daily tracker for tasks, goals, habits and notes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      // Browser chrome matches the paper colour in each theme.
      { name: "theme-color", content: "#f9f6ee", media: "(prefers-color-scheme: light)" },
      { name: "theme-color", content: "#1c1f27", media: "(prefers-color-scheme: dark)" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Karla:wght@400;600;700&display=swap",
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // Applies the day/night theme on every page, signed in or not.
  useTheme();

  useEffect(() => {
    void initAnalytics();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
