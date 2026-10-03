export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      /* Standalone (no app CSS), so the sketchbook palette is inlined here. */
      :root { --paper: oklch(0.976 0.014 92.5); --card: oklch(0.995 0.008 92); --ink: oklch(0.23 0.02 265); --ink-soft: oklch(0.46 0.02 265); --mint: oklch(0.88 0.09 155); --butter: oklch(0.92 0.11 95); --on-tint: oklch(0.23 0.02 265); color-scheme: light dark; }
      @media (prefers-color-scheme: dark) { :root { --paper: oklch(0.21 0.018 265); --card: oklch(0.26 0.02 265); --ink: oklch(0.94 0.012 92); --ink-soft: oklch(0.75 0.02 265); --mint: oklch(0.68 0.09 155); --butter: oklch(0.72 0.1 95); } }
      body { font: 15px/1.5 "Karla", ui-sans-serif, system-ui, sans-serif; background: var(--paper) radial-gradient(oklch(0.9 0.02 240 / 45%) 1px, transparent 1px) 0 0 / 22px 22px; color: var(--ink); display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1rem; box-sizing: border-box; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem 1.5rem; background: var(--card); border: 2px solid var(--ink); border-radius: 14px 22px 16px 20px; box-shadow: 4px 5px 0 0 var(--ink); box-sizing: border-box; }
      h1 { font: 700 2rem/1.15 "Caveat", "Segoe Script", cursive; margin: 0 0 0.75rem; }
      h1 span { background: linear-gradient(100deg, transparent 2%, var(--butter) 2%, var(--butter) 96%, transparent 96%) no-repeat; color: var(--on-tint); padding: 0 0.2em; }
      p { color: var(--ink-soft); margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { min-height: 2.75rem; display: inline-flex; align-items: center; padding: 0 1.1rem; border-radius: 999px; font: 600 0.875rem/1 inherit; font-family: inherit; cursor: pointer; text-decoration: none; border: 2px solid var(--ink); color: var(--ink); background: transparent; }
      .primary { background: var(--mint); color: var(--on-tint); }
      a:focus-visible, button:focus-visible { outline: 2px solid var(--ink-soft); outline-offset: 2px; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1><span>This page didn't load</span></h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
