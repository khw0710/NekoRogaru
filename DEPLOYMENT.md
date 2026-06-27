# Deployment notes

Neko Rogaru is a static browser game. There is no build step, but it must be served as a website rather than opened directly from the filesystem.

## Minimum requirements

- Serve the whole repository root, not only `index.html`.
- Use HTTP/HTTPS, not `file://`.
- Keep the `assets/` folder next to `index.html` so relative paths resolve.
- Allow JavaScript to run.
- Allow the external scripts/styles used by `index.html`:
  - `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`
  - `https://fonts.googleapis.com`
  - `https://fonts.gstatic.com`
- For the best mobile and replay-export behavior, host over HTTPS. `localhost` is fine for local testing.

## Local preview

From the repository root:

```sh
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173/
```

Do not open `index.html` directly in the browser. Some browsers block or behave strangely with local asset, audio, and canvas APIs from `file://`.

## Static hosting checklist

Upload or deploy the entire repo folder with this structure intact:

```text
index.html
game-overrides.js
assets/
  generated/
    atlases/
    audio/
    backgrounds/
    sprites/
```

The game loads production art, audio, and replay assets with relative URLs such as `assets/generated/...`. If a host moves `index.html` without the matching `assets/` directory, the screen may load but the game can appear broken.

## If embedding in another website

An iframe is okay, but avoid sandboxing it too tightly. If the parent site uses an iframe sandbox, include at least:

```html
<iframe
  src="/path-to-neko-rogaru/"
  allow="fullscreen"
  sandbox="allow-scripts allow-same-origin allow-downloads"
></iframe>
```

Also make sure the parent site or iframe wrapper does not place a transparent overlay above the game, set `pointer-events: none` on the iframe, or prevent touch gestures from reaching the iframe.

## Common “not interactable” causes

- `index.html` was opened with `file://` instead of served from HTTP/HTTPS.
- The host deployed only `index.html`, without `game-overrides.js` or `assets/`.
- A Content Security Policy blocked cdnjs, Google Fonts, inline scripts, images, audio, or blob URLs.
- Three.js failed to load, usually visible in the browser console as `THREE is not defined`.
- The game is inside a sandboxed iframe without `allow-scripts` / `allow-same-origin`.
- Another page layer is covering the game and stealing clicks/touches.
- The page is stale-cached. Hard refresh or change the asset version query string in `game-overrides.js` / `index.html`.

## Browser behavior notes

- Drag/touch controls start after pressing the play button.
- Keyboard fallback: arrow keys or `A` / `D`.
- Music starts only after a user gesture, which is normal browser audio policy.
- Replay export relies on Canvas capture and MediaRecorder. Browser support varies, especially on older iOS Safari. The game tries MP4 first and falls back to WebM where needed.
