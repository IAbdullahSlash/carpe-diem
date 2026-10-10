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
      <div className="nb-card max-w-md p-6 text-center sm:p-8">
        <h1 className="text-6xl font-extrabold leading-none text-foreground">404</h1>
        <h2 className="mt-4 text-2xl leading-tight text-foreground">
          <span className="marker">Page not found</span>
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          This page isn't in the notebook — it may have moved.
        </p>
        <div className="mt-6">
          <Link to="/" className="nb-btn">
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
      <div className="nb-card max-w-md p-6 text-center sm:p-8">
        <h1 className="text-2xl leading-tight text-foreground">
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
            className="nb-btn"
          >
            Try again
          </button>
          <a href="/" className="nb-btn bg-card text-foreground">
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
        content: "A bold daily tracker for tasks, goals, habits and notes.",
      },
      { name: "author", content: "Abdullah" },
      { property: "og:title", content: "Carpe Diem" },
      {
        property: "og:description",
        content: "A bold daily tracker for tasks, goals, habits and notes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      // Browser chrome matches the page colour in each theme.
      { name: "theme-color", content: "#fdf7c5", media: "(prefers-color-scheme: light)" },
      { name: "theme-color", content: "#23221b", media: "(prefers-color-scheme: dark)" },
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
        href: "https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Karla:wght@400;500;600;700;800&display=swap",
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
