"use client";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { frameStore } from "./frames";

/** Draws frame(p) of a preloaded image sequence onto a canvas (cover), cross-fading neighbours. */
export function useFrames(name: string, canvas: RefObject<HTMLCanvasElement | null>, opts: { zoom?: number; dx?: number; mzoom?: number; my?: number } = {}) {
  const zoom = opts.zoom ?? 1, dx = opts.dx ?? 0, mzoom = opts.mzoom ?? 1.6, my = opts.my ?? 0.5;
  const lastP = useRef(0);
  const maskKey = useRef("");
  const [ready, setReady] = useState(false);

  const draw = useCallback((p: number) => {
    lastP.current = p;
    const c = canvas.current, list = frameStore[name];
    if (!c || !list?.length) return;
    const ok = (im?: HTMLImageElement) => !!im && im.complete && im.naturalWidth > 0;
    const f = Math.min(list.length - 1, Math.max(0, p * (list.length - 1)));
    const i0 = Math.floor(f), i1 = Math.min(list.length - 1, i0 + 1);
    let a: HTMLImageElement, b: HTMLImageElement, t = 0;
    if (ok(list[i0]) && ok(list[i1])) { a = list[i0]; b = list[i1]; t = f - i0; } // both neighbours ready: smooth cross-fade
    else { // gaps still loading: snap (no blending, so no ghosting) to the nearest loaded frame, monotonic so it never jitters back and forth
      let best = -1;
      for (let d = 0; d < list.length && best < 0; d++) {
        const lo = Math.round(f) - d, hi = Math.round(f) + d;
        if (lo >= 0 && ok(list[lo])) best = lo; else if (hi < list.length && ok(list[hi])) best = hi;
      }
      if (best < 0) return;
      a = b = list[best];
    }
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const cw = Math.round(c.clientWidth * dpr), ch = Math.round(c.clientHeight * dpr);
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
    const key = feather ? `${cw}x${ch}:${portrait}` : "";
    if (key !== maskKey.current) { // feather edges; only recomputed on resize
      maskKey.current = key;
      let m = "";
      const pc = (n: number) => `${(n * 100).toFixed(2)}%`;
      const y0 = y / ch, y1 = (y + h) / ch, fy = (h * (portrait ? 0.22 : 0.16)) / ch;
      const v = `linear-gradient(180deg,transparent ${pc(y0)},#000 ${pc(y0 + fy)},#000 ${pc(y1 - fy)},transparent ${pc(y1)})`;
      if (portrait) m = v;
      else if (feather) {
        const fx = (w * 0.14) / cw, x0 = x / cw, x1 = (x + w) / cw;
        m = `linear-gradient(90deg,transparent ${pc(x0)},#000 ${pc(x0 + fx)},#000 ${pc(x1 - fx)},transparent ${pc(x1)}),${v}`;
      }
      c.style.maskImage = m; c.style.webkitMaskImage = m;
      c.style.maskComposite = "intersect"; c.style.webkitMaskComposite = "source-in";
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
