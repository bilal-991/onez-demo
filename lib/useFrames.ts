"use client";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { frameStore } from "./frames";

/** Draws frame(p) of a preloaded image sequence onto a canvas (cover), cross-fading neighbours. */
export function useFrames(name: string, canvas: RefObject<HTMLCanvasElement | null>, opts: { zoom?: number; dx?: number; mzoom?: number; my?: number } = {}) {
  const zoom = opts.zoom ?? 1, dx = opts.dx ?? 0, mzoom = opts.mzoom ?? 1.6, my = opts.my ?? 0.5;
  const lastP = useRef(0);
  const lastKey = useRef("");
  const [ready, setReady] = useState(false);

  const draw = useCallback((p: number) => {
    lastP.current = p;
    const c = canvas.current, list = frameStore[name];
    if (!c || !list?.length) return;
    const ok = (im?: HTMLImageElement) => !!im && im.complete && im.naturalWidth > 0;
    const f = Math.min(list.length - 1, Math.max(0, p * (list.length - 1)));
    const i0 = Math.floor(f), i1 = Math.min(list.length - 1, i0 + 1);
    let a: HTMLImageElement, b: HTMLImageElement, t = 0, ia = i0, ib = i1;
    if (ok(list[i0]) && ok(list[i1])) { a = list[i0]; b = list[i1]; t = f - i0; } // both neighbours ready: smooth cross-fade
    else { // gaps still loading: snap (no blending, so no ghosting) to the nearest loaded frame, monotonic so it never jitters back and forth
      let best = -1;
      for (let d = 0; d < list.length && best < 0; d++) {
        const lo = Math.round(f) - d, hi = Math.round(f) + d;
        if (lo >= 0 && ok(list[lo])) best = lo; else if (hi < list.length && ok(list[hi])) best = hi;
      }
      if (best < 0) return;
      a = b = list[best]; ia = ib = best;
    }
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const cw = Math.round(c.clientWidth * dpr), ch = Math.round(c.clientHeight * dpr);
    // nothing visible changed since the last paint (same frames, same blend step, same size): skip the work
    const key = `${ia}|${ib}|${Math.round(t * 40)}|${cw}x${ch}`;
    if (key === lastKey.current) return;
    lastKey.current = key;
    if (c.width !== cw || c.height !== ch) { c.width = cw; c.height = ch; }
    // Portrait phones: 16:9 frames can't "cover" a tall screen without cutting the shoe off, so fit the frame to the
    // screen width (zoomed by mzoom, shoe is centred), park it at height `my`, and feather top/bottom into the section colour.
    const portrait = cw / ch < 0.9;
    const s = portrait ? (cw / a.naturalWidth) * mzoom : Math.max(cw / a.naturalWidth, ch / a.naturalHeight) * zoom;
    const w = a.naturalWidth * s, h = a.naturalHeight * s;
    const x = (cw - w) / 2 + (portrait ? 0 : dx * cw), y = portrait ? ch * my - h / 2 : (ch - h) / 2;
    const feather = portrait || zoom < 1;
    const g = c.getContext("2d")!;
    g.imageSmoothingQuality = "high";
    if (feather) g.clearRect(0, 0, cw, ch);
    g.globalAlpha = 1;
    g.drawImage(a, x, y, w, h);
    if (t > 0.02 && b !== a) { g.globalAlpha = t; g.drawImage(b, x, y, w, h); g.globalAlpha = 1; }
    if (feather) { // soft edges painted straight into the canvas (far cheaper on phones than a CSS mask that re-composites every frame)
      g.globalCompositeOperation = "destination-out";
      const fade = (x0: number, y0: number, x1: number, y1: number, rx: number, ry: number, rw: number, rh: number) => {
        const gr = g.createLinearGradient(x0, y0, x1, y1);
        gr.addColorStop(0, "rgba(0,0,0,1)"); gr.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = gr; g.fillRect(rx, ry, rw, rh);
      };
      const fy = h * (portrait ? 0.22 : 0.16);
      fade(0, y, 0, y + fy, 0, y - 1, cw, fy + 1); // top
      fade(0, y + h, 0, y + h - fy, 0, y + h - fy, cw, fy + 1); // bottom
      if (!portrait) {
        const fx = w * 0.14;
        fade(x, 0, x + fx, 0, x - 1, 0, fx + 1, ch); // left
        fade(x + w, 0, x + w - fx, 0, x + w - fx, 0, fx + 1, ch); // right
      }
      g.globalCompositeOperation = "source-over";
    }
  }, [name, canvas, zoom, dx, mzoom, my]);

  useEffect(() => {
    // frames may still be loading (e.g. arriving from another page): poll until the first one exists
    const id = setInterval(() => { if (frameStore[name]?.[0]) { setReady(true); draw(lastP.current); clearInterval(id); } }, 150);
    const onResize = () => draw(lastP.current);
    window.addEventListener("resize", onResize);
    return () => { clearInterval(id); window.removeEventListener("resize", onResize); };
  }, [name, draw]);

  return { ready, draw };
}
