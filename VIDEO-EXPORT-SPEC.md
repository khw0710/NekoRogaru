# Ten-second replay export specification

## Is it achievable in HTML?

Yes. A browser can capture a game canvas as a real-time `MediaStream`, combine it with Web Audio, encode the stream with `MediaRecorder`, create a video `Blob`, and pass the resulting file to the operating system's share sheet.

Relevant browser primitives:

- [`HTMLCanvasElement.captureStream()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream)
- [`MediaRecorder`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API)
- [`AudioContext.createMediaStreamDestination()`](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaStreamDestination)
- [`navigator.share()` and `navigator.canShare()`](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)

The APIs exist, but file type and share-target support vary by browser and operating system. Production code must detect capabilities and retain a download fallback.

## Recommended architecture

Do not try to keep the last ten seconds by discarding old `MediaRecorder` blobs. Video chunks can depend on container headers and keyframes, so an arbitrary tail of chunks may not form a valid independent video.

Instead, retain a replayable game-state window:

1. Maintain a rolling snapshot at `current time − 7 seconds`.
2. Retain input events, random-number-generator state, spawns, encounter outcomes, and audio events after that snapshot.
3. When the run ends, append a deterministic two-second ending and one-second result hold.
4. Replay those ten seconds on a dedicated `720 × 1280` export canvas.
5. Capture and encode that replay while the player watches the replay preview.

This approach gives a valid video, guarantees the funny ending is framed correctly, and lets the export use a clean social layout even if gameplay was displayed at another resolution.

## Replay data contract

The engine should expose:

```ts
type ReplaySnapshot = {
  timeMs: number;
  rngState: number | string;
  cat: CatState;
  camera: CameraState;
  world: WorldState;
  activeEntities: SerializableEntity[];
  locationId: string;
  seasonId: string;
  timeOfDayId: string;
  weatherId: string;
  lives: number;
  distance: number;
};

type ReplayEvent = {
  timeMs: number;
  type: "input" | "spawn" | "encounter" | "audio" | "transition";
  payload: unknown;
};

type EndingDescriptor = {
  id: string;
  durationMs: 2000;
  captionKey: string;
  discoveryId?: string;
};
```

The simulation must use seeded randomness. If a replay consumes fresh `Math.random()` values, it will drift from the actual run.

## Rendering contract

- Export canvas: `720 × 1280`, 9:16.
- Frame rate: 30 fps.
- Replay duration: exactly 10 seconds.
- Structure: 7 seconds prior play + 2 seconds ending + 1 second result hold.
- Draw order: background → seasonal/time/weather layer → entities → particles → ending → replay frame → text/results.
- Draw `assets/generated/share/replay-frame.png` last, before dynamic text.
- Keep cat and rare discovery inside the central 80% safe area.
- Render all score/caption text onto the canvas; DOM overlays are not captured automatically.
- Wait for the export font to load before recording.

## Recording flow

Illustrative browser-side flow:

```js
const MIME_CANDIDATES = [
  "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm"
];

function chooseRecordingMimeType() {
  return MIME_CANDIDATES.find(type => MediaRecorder.isTypeSupported(type));
}

async function recordReplay(exportCanvas, audioContext, renderReplay) {
  const videoStream = exportCanvas.captureStream(30);
  const audioDestination = audioContext.createMediaStreamDestination();

  // Connect the game's replay audio bus to both speakers and the recorder.
  replayAudioBus.connect(audioContext.destination);
  replayAudioBus.connect(audioDestination);

  const stream = new MediaStream([
    ...videoStream.getVideoTracks(),
    ...audioDestination.stream.getAudioTracks()
  ]);

  const mimeType = chooseRecordingMimeType();
  if (!mimeType) throw new Error("No supported recording format");

  const chunks = [];
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 5_000_000,
    audioBitsPerSecond: 128_000
  });

  recorder.ondataavailable = event => {
    if (event.data.size) chunks.push(event.data);
  };

  const stopped = new Promise(resolve => {
    recorder.onstop = resolve;
  });

  recorder.start(1000);
  await renderReplay({ durationMs: 10_000, fps: 30 });
  recorder.stop();
  await stopped;

  stream.getTracks().forEach(track => track.stop());
  return new Blob(chunks, { type: mimeType });
}
```

The real implementation should clean up object URLs, disconnect audio nodes, handle tab suspension, and expose progress during the ten-second render.

## Sharing flow

Sharing must happen from a button click because the Web Share API requires transient user activation. It also requires HTTPS and is not supported in every major browser.

```js
async function shareOrDownload(blob) {
  const extension = blob.type.includes("mp4") ? "mp4" : "webm";
  const file = new File([blob], `neko-rogaru-replay.${extension}`, {
    type: blob.type
  });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: "My Neko Rogaru ending",
      text: "Nine lives. No brakes."
    });
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), {
    href: url,
    download: file.name
  });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
```

## Format strategy

`MediaRecorder.isTypeSupported()` must choose the recording format at runtime. A practical production strategy is:

1. Prefer MP4/H.264/AAC when the browser can record it.
2. Otherwise record WebM/VP9 or WebM/VP8.
3. Offer the native share sheet immediately when it accepts the generated file.
4. For a guaranteed Instagram-friendly MP4, upload the WebM to a small backend and transcode it to MP4/H.264/AAC, then return the final file.

Client-side `ffmpeg.wasm` can transcode, but its download size, memory use, battery cost, and delay make it a poor default for a lightweight cat game.

TikTok's official Content Posting API accepts `video/mp4`, `video/quicktime`, and `video/webm`, but direct integration requires a registered app, OAuth scope, and a posting/upload flow. That is a later product integration, not necessary for the MVP's native share sheet. See [TikTok's official upload documentation](https://developers.tiktok.com/doc/content-posting-api-reference-upload-video) and [getting-started requirements](https://developers.tiktok.com/doc/content-posting-api-get-started).

## Critical implementation constraints

- All images, fonts, and videos drawn to the canvas must be same-origin or served with correct CORS headers. A tainted canvas cannot be captured/exported safely.
- Gameplay UI implemented only as HTML must be redrawn on the export canvas.
- Game audio must pass through a Web Audio bus connected to a `MediaStreamAudioDestinationNode`.
- Mobile browsers may suspend rendering when the page is backgrounded; keep the player on the preview page until encoding finishes.
- Use a visible progress state: “Making your replay… 6/10 seconds.”
- If recording fails, show a static share card and keep Download/Play Again usable.
- Never make replay creation a condition for restarting.

## Test matrix

- iPhone Safari, current and previous major iOS
- Android Chrome on one mid-range and one low-end device
- Desktop Chrome, Safari, Firefox, and Edge
- Audio enabled and muted
- Reduced-motion mode
- Long run followed by export
- Tab interruption during replay rendering
- Unsupported `navigator.share`
- Supported share API but rejected file type
- Cross-origin asset deliberately misconfigured
- Low-memory device

## MVP decision

Implement deterministic replay + `captureStream()` + `MediaRecorder` + native share/download fallback. Defer direct TikTok/Instagram account posting and universal server transcoding until real players prove that exporting is used.
