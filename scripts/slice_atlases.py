#!/usr/bin/env python3
"""Slice the generated transparent atlases into consistently sized PNG cells."""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]

ATLASES = {
    "character": {
        "file": "cat-atlas.png",
        "grid": (4, 4),
        "names": [
            "slide-neutral", "slide-left", "slide-right", "fast-fall",
            "blink", "happy-meow", "worried", "dizzy",
            "pickup-happy", "bump", "sneeze", "branch-catch",
            "tumble-a", "tumble-b", "soft-landing", "victory-wave",
        ],
    },
    "props": {
        "file": "props-atlas.png",
        "grid": (6, 6),
        "names": [
            "tuna-can", "premium-can", "mystery-can", "sardine", "shrimp", "cat-treat",
            "glowing-feather", "catnip", "yarn-shield", "bell-magnet", "fishbone-boost", "lucky-paw",
            "red-mushroom-spirit", "blue-mushroom-spirit", "sleepy-acorn", "snail", "frog", "mole",
            "rock", "fallen-log", "springy-branch", "bramble", "mud-splash", "pinecone",
            "soccer-ball", "baseball", "cardboard-box", "cool-cucumber", "ufo", "golden-toilet-roll",
            "dust-puff", "dirt-pebbles", "speed-leaves", "pickup-sparkle", "impact-star", "bubble-shield",
        ],
    },
    "environment": {
        "file": "environment-atlas.png",
        "grid": (5, 5),
        "names": [
            "moss-bank-left", "moss-bank-right", "root-wall-left", "root-wall-right", "dark-soil-patch",
            "broad-leaves", "fern-cluster", "clover", "tall-grass", "berry-bush",
            "hollow-tree", "mossy-stump", "root-arch", "tiny-waterfall", "blank-trail-sign",
            "meadow-edge", "rainy-mud-edge", "dusk-forest-edge", "glow-cave", "moon-shrine",
            "foreground-fern-left", "foreground-fern-right", "leaf-spray", "vine-curtain", "light-rays",
        ],
    },
    "ui": {
        "file": "ui-atlas.png",
        "grid": (5, 5),
        "names": [
            "title-plaque", "message-panel", "results-panel", "score-badge", "food-counter",
            "play", "retry", "pause", "home", "settings",
            "sound-on", "sound-off", "music", "vibration", "fullscreen",
            "lives-meter", "boost-meter", "distance-flag", "record-crown", "combo-flame",
            "left-arrow", "right-arrow", "paw-cursor", "heart-bubble", "achievement",
        ],
    },
    "season-weather": {
        "file": "season-weather-atlas.png",
        "grid": (6, 6),
        "names": [
            "spring-branch-left", "spring-branch-right", "spring-petal-swirl", "spring-wildflowers", "spring-fiddleheads", "spring-blossom-puddle",
            "summer-leaves-left", "summer-leaves-right", "summer-sun-rays", "summer-cicada", "summer-pollen", "summer-fireflies",
            "autumn-maple-left", "autumn-maple-right", "autumn-leaf-vortex", "autumn-acorns", "autumn-persimmons", "autumn-golden-grass",
            "winter-bank-left", "winter-bank-right", "winter-bamboo", "winter-icicles", "winter-snowdrift", "winter-ice-sparkles",
            "time-dawn-mist", "time-noon-rays", "time-sunset-motes", "time-moonbeams", "time-stars", "time-lantern-glow",
            "weather-rain", "weather-heavy-rain", "weather-wind", "weather-fog", "weather-snow", "weather-lightning",
        ],
    },
    "endings": {
        "file": "endings-atlas.png",
        "grid": (4, 4),
        "names": [
            "ending-rock-bonk", "ending-mud-splat", "ending-river-splash", "ending-bramble-hammock",
            "ending-cardboard-box", "ending-leaf-pile", "ending-futon", "ending-onsen",
            "ending-ufo", "ending-tanuki-rescue", "ending-snowbank", "ending-shrine-bell",
            "ending-koi-ride", "ending-mushroom-umbrella", "ending-goalkeeper", "ending-golden-cans",
        ],
    },
}


def slice_atlas(group: str, config: dict) -> None:
    source = ROOT / "assets" / "generated" / "atlases" / config["file"]
    output = ROOT / "assets" / "generated" / "sprites" / group
    output.mkdir(parents=True, exist_ok=True)

    image = Image.open(source).convert("RGBA")
    cols, rows = config["grid"]
    names = config["names"]
    if len(names) != cols * rows:
        raise ValueError(f"{group}: expected {cols * rows} names, got {len(names)}")

    for index, name in enumerate(names):
        col, row = index % cols, index // cols
        left = round(col * image.width / cols)
        top = round(row * image.height / rows)
        right = round((col + 1) * image.width / cols)
        bottom = round((row + 1) * image.height / rows)
        image.crop((left, top, right, bottom)).save(output / f"{name}.png", optimize=True)

    print(f"{group}: wrote {len(names)} sprites to {output.relative_to(ROOT)}")


if __name__ == "__main__":
    for atlas_group, atlas_config in ATLASES.items():
        slice_atlas(atlas_group, atlas_config)
