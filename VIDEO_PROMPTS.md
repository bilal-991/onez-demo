# ONEZ — Hero video (Flow) → scroll-scrubbed frames

The hero currently uses a pure-CSS 3D box. When your Flow video is ready the site
**automatically** switches to it: scrolling scrubs the video frame by frame.

## 1. Generate the video in Flow
Keep the shot locked and cinematic. 8 s, 16:9, no text, no logos moving, **camera slowly pushing in**, no cuts.
Use the same start frame for every take (a photo of a real ONEZ box) so the box looks like your real packaging.

**Master prompt (unbox → shoe reveal)**
> Macro product film. A sealed orange kraft shoebox with a bold red-and-black "ONEZ" logo sits on a dark brown studio surface, warm rim light, shallow depth of field, subtle dust motes. A red tape strip across the lid splits open by itself, the lid swings back, and a brown-and-cream retro sneaker with a cream swoosh and white chunky sole rises slowly out of the box, rotating 180°, floating, soft red light flaring along the sole. Camera slowly orbits and pushes in. Photoreal, 35mm, cinematic, high contrast, no text overlay, no people.

**Variant B — "factory blueprint" (use for the Anatomy section later)**
> The same sneaker hovers against a cream paper background with faint blueprint grid lines. It explodes into three layers — upper, midsole, outsole — which drift apart vertically, then reassemble. Locked camera, soft shadow, studio light, photoreal.

**Variant C — "street" loop (optional background for the footer)**
> Slow-motion close-up of black ONEZ sneakers with white soles stepping on warm concrete at golden hour, dust rising, shallow depth of field, camera low and tracking.

Tip: in Flow, use "Frames to video" with (1) closed box, (2) shoe fully out as start/end frames to keep it controlled.

## 2. Turn it into frames
```bash
npm run frames -- path/to/flow-video.mp4 30
```
Writes `public/frames/hero/0001.webp …` + `manifest.json`. Reload — the canvas takes over.
Aim for 120–240 frames total (e.g. 8 s @ 24 fps ≈ 190). Delete `public/frames/hero/manifest.json` to go back to the CSS box.

## 3. Photos
Replace the files in `public/products/` with clean studio shots (same filenames). Transparent PNG/WebP cutouts will make the
"Cut-sheet" section look 10× better. Edit names/notes in `lib/data.ts`, WhatsApp/socials in `lib/config.ts`.
