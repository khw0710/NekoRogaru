# Neko Rogaru

A playable Three.js prototype and visual-design kit for a cute portrait browser game inspired by the famous four-paws-up sliding cat pose.

![Gameplay art direction](assets/generated/key-art/gameplay-key-art.png)

The player steers a tabby through an endless sequence of forests, rivers, shrine paths, seasons, weather, collectibles, curiosities, and safe comic mishaps. Each run ends with an exportable ten-second vertical replay designed for sharing.

## What is included

- Five 9:16 scrolling environments
- 154 individually sliced pixel-art sprites
- Character, prop, environment, UI, season/weather, and ending atlases
- Transparent social-video replay frame
- Machine-readable asset manifest
- Complete game requirements and browser video-export specification
- Playable portrait Three.js prototype with drag/touch steering
- Five cycling biomes plus time, weather, and seasonal variations
- Nine-life encounter system, discoveries, pickups, hazards, and cute endings
- Ten-second vertical WebM replay export at the end of each run
- Static visual preview page

## Start here

- [`index.html`](index.html) — playable game prototype
- [`game-overrides.js`](game-overrides.js) — production art, touch input, falling world, encounter, and replay integration
- [`asset-preview.html`](asset-preview.html) — visual asset board
- [`GAME-REQUIREMENTS.md`](GAME-REQUIREMENTS.md) — consolidated product specification
- [`VIDEO-EXPORT-SPEC.md`](VIDEO-EXPORT-SPEC.md) — ten-second Canvas replay architecture
- [`ASSET-GUIDE.md`](ASSET-GUIDE.md) — art direction and discovery system
- [`assets/generated/manifest.json`](assets/generated/manifest.json) — asset paths and sprite IDs
- [`GENERATION-PROMPTS.md`](GENERATION-PROMPTS.md) — image-generation specifications

## Repository status

The repository now contains a first playable engine integration. Open it through a local HTTP server rather than directly from the filesystem so Three.js and the image assets load consistently:

```sh
python3 -m http.server 4173
```

Then visit `http://localhost:4173/`. Drag the cat horizontally with a finger or pointer; arrow keys and A/D remain as desktop fallbacks.

This is an art-and-interaction prototype, not final game balancing. The next pass should focus on encounter pacing, biome-specific spawn tables, animation polish, mobile performance, audio, and cross-browser replay export testing.

## Asset utilities

Run `scripts/slice_atlases.py` with Python and Pillow to regenerate individual sprites from the transparent atlases.

## Publishing note

The generated game art is original, but the central character intentionally references a recognizable real cat and meme photograph. Confirm the necessary rights for the underlying likeness/photo association before a commercial release.
