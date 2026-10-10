export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      /* Standalone (no app CSS), so the neobrutalism palette is inlined here. */
      :root { --bg: oklch(0.968 0.065 102.3); --card: oklch(1 0 0); --fg: oklch(0 0 0); --muted: oklch(0.38 0 0); --main: oklch(0.86 0.176 92.4); --border: oklch(0 0 0); --dots: oklch(0 0 0 / 12%); color-scheme: light dark; }
      @media (prefers-color-scheme: dark) { :root { --bg: oklch(0.25 0.012 95); --card: oklch(0.32 0.012 95); --fg: oklch(0.95 0.01 95); --muted: oklch(0.78 0.01 95); --dots: oklch(1 0 0 / 7%); } }
      body { font: 500 15px/1.5 "Karla", ui-sans-serif, system-ui, sans-serif; background: var(--bg) radial-gradient(var(--dots) 1px, transparent 1px) 0 0 / 22px 22px; color: var(--fg); display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1rem; box-sizing: border-box; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem 1.5rem; background: var(--card); border: 2px solid var(--border); border-radius: 5px; box-shadow: 4px 4px 0 0 var(--border); box-sizing: border-box; }
      h1 { font-size: 1.5rem; line-height: 1.2; font-weight: 700; margin: 0 0 0.75rem; }
      h1 span { background: var(--main); color: #000; padding: 0 0.2em; }
      p { color: var(--muted); margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
      a, button { min-height: 2.75rem; display: inline-flex; align-items: center; padding: 0 1rem; border-radius: 5px; font: 700 0.875rem/1 inherit; font-family: inherit; cursor: pointer; text-decoration: none; border: 2px solid var(--border); color: var(--fg); background: var(--card); box-shadow: 4px 4px 0 0 var(--border); transition: transform 120ms ease, box-shadow 120ms ease; }
      a:hover, button:hover { transform: translate(4px, 4px); box-shadow: none; }
      .primary { background: var(--main); color: #000; }
      a:focus-visible, button:focus-visible { outline: 2px solid var(--fg); outline-offset: 2px; }
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
