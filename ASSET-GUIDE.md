# Neko Rogaru visual kit

This kit treats the original photograph's funniest idea—the tabby sliding toward us with all four paw pads visible—as the one stable visual anchor. Everything else changes around her.

## The visual hook

The game should feel like an endlessly unfolding forest story, not a repeating wallpaper. The cat stays near the lower-middle of the screen while the chute, debris, and foreground leaves race upward. Her body is large enough that the paw pads and green-eyed expression remain readable on a phone.

The overall look is soft 48–64 px pixel art: crisp clusters, rounded shapes, restrained texture, deep cocoa outlines, and enough detail to feel cozy without turning noisy. It is more illustrated than *Flappy Bird*, but still readable at game speed.

Core palette sampled from the key art:

- Ink/shadow: `#221e19`, `#302920`
- Dark loam: `#3c3325`, `#463828`
- Bark: `#5e4a31`, `#6f5336`
- Moss: `#303322`, `#494b2c`
- Fern: `#75683d`, `#8e814c`
- Warm highlight: `#b5a36c`
- Accent suggestions: cat-eye green `#9ac65b`, coral `#d96f4d`, rain blue `#5f8292`, glow cyan `#54c8cf`

## How to make falling feel physical

Use several cues together; no single dust animation will carry the illusion.

1. Scroll the background upward while keeping the cat within a small vertical band.
2. Run three visual speeds: distant canopy at roughly `0.35x`, dirt lane at `1x`, foreground leaves at `1.35–1.6x`.
3. Spawn `dust-puff`, `dirt-pebbles`, and `speed-leaves` behind and beside the cat. Stretch their travel vertically as speed rises.
4. Alternate `slide-neutral`, `slide-left`, and `slide-right`; use `fast-fall` only at peak speed so it feels special.
5. Add a two- or three-pixel camera nudge opposite each steer. Keep it tiny; the moving world should do most of the work.
6. On a bank scrape, draw a short brighter dirt line, a dust burst, and a brief cat squash. On wet ground, swap dust for a narrow water spray.
7. Let large foreground leaves enter from the bottom edge and exit rapidly upward. This is the strongest depth cue in the kit.

## How to keep the background from repeating

The full-height backgrounds are chapters, not merely color swaps:

- **Sunlit Fern Run** — warm, legible onboarding; mushrooms, snail, frog, paw stones.
- **Rainy Creek Run** — reflective mud and rivulets; paper boat, leaf umbrella, fish-shaped stones.
- **Glowroot Hollow** — magical darkness; crystals, moon shrine, sleeping bat, UFO, paw fossil.
- **Koi River Rush** — a water-first route with koi, paper boat, fishing frog, waterfalls, and river stones.
- **Torii Maple Descent** — an autumn dusk shrine approach with bamboo, torii, lanterns, tanuki, fox spirit, and maple leaves.

The season/weather kit multiplies these locations without requiring a unique painted background for every permutation. Compose one base place with one season row, one time-of-day layer, and zero or one weather layer. For example: Koi River + spring blossoms + dawn mist + rain, or Torii Maple + winter banks + moonbeams + snow.

Within each chapter, compose procedural side margins from the environment sprites. A simple chunk can contain:

- one left and one right bank piece;
- zero to two foliage clusters;
- one foreground/parallax piece;
- zero or one landmark;
- a separately spawned obstacle or pickup in the lane.

Mirror safe foliage pieces, vary scale by about 10%, and tint them only within the current chapter palette. Avoid mirroring signs, text-like marks, creatures, or directional light rays.

Change one environmental condition every 20–40 seconds: denser roots, flower edge, rain, dusk, glow cave, then back to a calmer stretch. A quiet stretch makes the next surprise feel authored.

## The discovery loop

Use three rarity bands so the player repeatedly thinks, “Wait—was that new?”

- **Common, every 8–15 seconds:** mushroom spirits, snail, frog, mole, cardboard box, tiny waterfall.
- **Uncommon, every 30–60 seconds:** soccer or baseball callback, cool cucumber, moon shrine, glowing cave, strange trail sign.
- **Rare, roughly every 2–4 minutes:** UFO, golden toilet roll, bat burrito, hidden constellation, premium-can trail, a forest landmark assembled into a tiny scene.

Easter eggs should live mostly outside the collision lane. They reward looking without punishing the player for noticing them. A rare discovery can briefly slow the scenery by 10–15%, add a sparkle, and record itself in a future collection book.

Combine existing pieces for micro-stories:

- frog beside the paper boat;
- mushroom spirit guarding a premium can;
- mole watching a baseball roll past;
- cardboard box placed beneath the blank trail sign;
- UFO peeking through the glow-cave asset;
- snail following the cat's dirt trail.

## Asset inventory

All production assets live under `assets/generated/`.

- `backgrounds/`: five 941 × 1672 chapter backgrounds.
- `key-art/`: one portrait gameplay art-direction image.
- `atlases/`: transparent full sprite sheets.
- `sprites/character/`: 16 character frames.
- `sprites/props/`: 36 pickups, powerups, creatures, hazards, easter eggs, and effects.
- `sprites/environment/`: 25 modular banks, foliage, landmarks, transitions, and foreground layers.
- `sprites/ui/`: 25 panels, buttons, HUD pieces, and feedback icons.
- `sprites/season-weather/`: 36 spring, summer, autumn, winter, light, and weather layers.
- `sprites/endings/`: 16 safe, funny run endings designed for replay exports.
- `share/replay-frame.png`: transparent 9:16 frame for the final ten-second video.
- `sources/`: original chroma-key sheets retained for reprocessing.
- `manifest.json`: machine-readable paths, grids, and sprite IDs.

The atlases are 1254 × 1254. Their dimensions do not divide evenly into every grid, so use the individual PNGs for a first implementation or derive atlas rectangles with rounded fractional boundaries as shown in `scripts/slice_atlases.py`.

## A good first visual prototype

Before designing the full game loop, make one non-interactive 15-second scene:

1. Scroll `sunlit-fern-run.png` upward twice with a crossfade.
2. Place `slide-neutral.png` in the lower-middle and gently steer it left/right.
3. Layer two foreground fern sprites above the cat.
4. Emit dust and three speed leaves every few frames.
5. Place one tuna can, one rock, a frog in the margin, and a very rare UFO peek.
6. Add only the food counter, pause button, and distance flag.

If that short scene feels fast, funny, and readable without gameplay, the art system is doing its job.

## Publishing note

These are newly generated game assets, but the central character is intentionally based on a recognizable real cat and meme photograph. Before a public or commercial release, confirm permission for the underlying cat likeness/photo association and avoid reusing other people's derivative meme artwork directly.
