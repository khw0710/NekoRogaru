# Neko Rogaru — game requirements

Status: product and content specification, before engine implementation.

## 1. Product promise

Neko Rogaru is a one-thumb portrait browser game where a famous-looking tabby slides endlessly through changing places. The player steers around trouble, follows tempting curiosities, collects food, and discovers short, combinatorial cat moments. Every run ends with a safe, funny outcome and an exportable ten-second vertical replay.

The game should be understandable in three seconds, playable without login, and interesting to watch even when the viewer is not controlling it.

## 2. Platform and presentation

- Mobile-first HTML game; desktop keyboard support.
- Portrait logical canvas, recommended export resolution `720 × 1280` at 30 fps.
- One primary gameplay canvas so the same composition can be recorded.
- Controls: drag/swipe horizontally; optional left/right keys.
- Instant play after one tap, which also unlocks audio.
- No camera, microphone, account, or personal data required for the MVP.

## 3. Core loop

1. Cat falls/slides automatically while the world scrolls upward.
2. Player steers toward food and discoveries and away from hazards.
3. Encounters immediately change lives, score, state, or discovery progress.
4. A location, season, time, or weather transition changes the visual rules.
5. Compatible combinations trigger a two-second authored “cute moment.”
6. The run ends at zero lives or a contextual terminal encounter.
7. The game plays a funny ending, assembles the final ten-second replay, and offers Replay, Share, and Try Again.

## 4. Player state

Keep the HUD to three values:

- **Nine lives:** nine paw segments. Minor damage removes one; major damage removes two; restorative encounters add one to three.
- **Distance:** primary score and difficulty driver.
- **Discoveries:** count of new moments found during this run.

Cat-food cans are pickups, but do not need a permanent fourth HUD value unless they become spendable later. For the MVP, cans restore a life and add score.

At zero lives the cat never dies visibly. It lands in a box, leaves, mud, water, snow, futon, onsen, spirit rescue, or another context-safe ending.

## 5. Encounter language

Every interactable must be readable at speed:

| Type | Player meaning | Examples | Result |
|---|---|---|---|
| Food | Usually safe and beneficial | cans, sardine, shrimp, treat | life and score |
| Curiosity | Riskier route, discovery potential | box, bell, cucumber, UFO, paper boat | moment, state, or surprise |
| Creature | Context-dependent social moment | frog, mole, mushroom spirit, tanuki, koi | discovery or assistance |
| Soft hazard | Clearly avoidable trouble | rock, log, branch, bramble, mud | lose one or two lives |
| Power-up | Short readable advantage | shield, magnet, feather, catnip | temporary state |

Random generation must always leave at least one safe route. Hazards need enough visual telegraphing to be avoidable on a phone.

## 6. World multiplication system

Build each scene from four independent dimensions:

`location + season + time + weather`

### Base locations

1. Sunlit forest dirt chute
2. Rainy creek and mud
3. Glowroot cave
4. Koi river
5. Torii and bamboo shrine approach

### Seasons

- Spring: blossoms, wildflowers, fiddleheads, pink petal currents
- Summer: dense leaves, cicada, pollen, warm light, fireflies
- Autumn: maple, acorns, persimmons, dry grass, orange leaf currents
- Winter: snow banks, icy bamboo, icicles, frost sparkles

### Times

- Dawn mist
- Clear noon
- Coral sunset
- Moonlit night

### Weather

- Clear
- Fine rain
- Heavy rain
- Wind
- Fog
- Snow
- Rare lightning

Not every mathematical combination should be allowed. Use compatibility rules: snow needs winter or Glowroot magic; fireflies prefer summer dusk/night; heavy rain should not occur in the enclosed cave; lantern glow appears near Torii or at night.

This produces variety without painting a unique background for every permutation.

## 7. Discovery and moment recipes

A moment recipe checks:

`location + environment condition + encountered object + cat state`

Examples:

- River + rain + cardboard box → box-boat ride
- Torii + dusk + bell → tanuki follows with a leaf umbrella
- Forest + night + fireflies → cat chases lights and briefly forgets to steer
- Winter + low lives + warm spring/onsen → restore three lives
- Forest + cucumber + active shield → cucumber bounces away
- River + full lives + koi → rare koi-back ride

Content target for the first playable release:

- 5 base locations
- 4 seasonal treatments
- 4 time treatments
- 6 weather treatments plus clear
- 20 common moments
- 12 uncommon moments
- 8 rare moments
- 16 contextual endings

Cadence target:

- Small curiosity: every 8–15 seconds
- Landmark or authored combination opportunity: every 25–45 seconds
- Time/weather shift: every 30–60 seconds
- Location transition: every 60–100 seconds
- Rare moment: normally once every 2–4 complete runs, with bad-luck protection

## 8. Difficulty and fairness

- First 15 seconds contain no unavoidable damage.
- Scroll speed rises gradually, then plateaus before each location transition.
- Collisions provide roughly one second of invulnerability.
- Low lives slightly increase restorative-item probability.
- Curiosity routes may be harder, but discoveries must never require blind damage.
- Reduced-motion mode removes camera shake, lightning flashes, and intense foreground streaks.

## 9. Ending and replay experience

The final replay is part of the core product, not a later marketing feature.

- Total clip: 10 seconds in portrait 9:16.
- Recommended structure: 7 seconds before the final encounter, 2 seconds of contextual ending, 1 second result hold.
- Draw the game title, distance, remaining/used lives, discovery icon, and a short generated caption onto the export canvas.
- Use the transparent replay frame from `assets/generated/share/replay-frame.png`.
- Keep important content away from the extreme right edge and bottom-right corner where social apps place controls.
- Provide Preview, Share Video, Download Video, and Play Again.
- Sharing failure must never block restarting the game.

Caption template examples:

- “Mochi slid 842 m and was rescued by a suspicious tanuki.”
- “Nine lives, one box, absolutely no brakes.”
- “I found the mushroom umbrella ending.”

Captions should be rendered by the game, not baked into image assets.

## 10. Social and retention requirements

- A shared daily trail uses the same seed for every player.
- Unlimited random runs remain available.
- The travel album shows undiscovered moments as silhouettes.
- A replay reveals the funny outcome without exposing the full discovery recipe.
- A rare discovery should be visually identifiable within the exported clip.
- No login is required to play, export, or download.
- Optional account/streak features remain outside the MVP.

## 11. Accessibility

- Keyboard, touch, and pointer controls.
- Mute and separate sound/music toggles.
- Reduced motion and reduced flash settings.
- High-contrast outline option for hazards.
- Do not rely on color alone to distinguish food, curiosity, and danger.
- All result actions have text labels in the HTML UI even if their visual buttons use icons.

## 12. Performance requirements

- Target 60 fps during play; acceptable fallback 30 fps on lower-end devices.
- Keep the logical canvas smaller than CSS display size and upscale with pixelated rendering.
- Separate static background, dynamic gameplay, and foreground/effect work where useful.
- Convert production backgrounds to WebP/AVIF with PNG fallbacks as needed.
- Preload only the first location and common sprites; stream later locations before transition.
- All draw sources must be same-origin or CORS-safe so the canvas remains exportable.
- Test recording memory and heat on iOS Safari and mid-range Android Chrome.

## 13. Analytics events

- `game_loaded`
- `run_started`
- `first_input`
- `encounter_resolved`
- `discovery_unlocked`
- `location_changed`
- `run_ended`
- `replay_render_started`
- `replay_render_completed`
- `share_opened`
- `share_completed_or_returned`
- `video_downloaded`
- `restart_clicked`

Do not include personal content in analytics payloads.

## 14. MVP acceptance criteria

- A new player can begin within one tap and understand steering without prose.
- The first minute visibly changes at least twice.
- One full run can include at least two locations and one weather/time transition.
- Every damaging encounter is avoidable.
- Every run ends in a funny, safe animation.
- A ten-second clip with game audio and result overlay can be previewed and exported.
- On supported mobile browsers, the native share sheet receives the video file.
- Unsupported sharing falls back to a downloadable video.
- Restart remains available even when recording or sharing fails.

## 15. Explicitly out of scope for the first release

- Multiplayer
- User-uploaded cat photos
- Character gacha or economy
- Accounts and cloud saves
- Direct posting through TikTok or Instagram developer APIs
- Long narrative cutscenes
- Complex equipment or upgrade trees
