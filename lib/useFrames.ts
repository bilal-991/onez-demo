"use client";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { frameStore } from "./frames";

/** Draws frame(p) of a preloaded image sequence onto a canvas (cover), cross-fading neighbours. */
export function useFrames(name: string, canvas: RefObject<HTMLCanvasElement | null>, opts: { zoom?: number; dx?: number } = {}) {
  const zoom = opts.zoom ?? 1, dx = opts.dx ?? 0;
  const lastP = useRef(0);
  const maskKey = useRef("");
  const [ready, setReady] = useState(false);

  const draw = useCallback((p: number) => {
    lastP.current = p;
    const c = canvas.current, list = frameStore[name];
    if (!c || !list?.length) return;
    const ok = (im?: HTMLImageElement) => !!im && im.complete && im.naturalWidth > 0;
    const f = Math.min(list.length - 1, Math.max(0, p * (list.length - 1)));
    let i0 = Math.floor(f), i1 = Math.min(list.length - 1, i0 + 1), t = f - i0;
    if (!ok(list[i0])) { // nearest loaded frame
      let found = -1;
      for (let d = 1; d < list.length && found < 0; d++) {
        if (ok(list[i0 - d])) found = i0 - d; else if (ok(list[i0 + d])) found = i0 + d;
      }
      if (found < 0) return;
      i0 = found; t = 0;
    }
    const a = list[i0], b = ok(list[i1]) ? list[i1] : a;
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const cw = Math.round(c.clientWidth * dpr), ch = Math.round(c.clientHeight * dpr);
    if (c.width !== cw || c.height !== ch) { c.width = cw; c.height = ch; }
    const s = Math.max(cw / a.naturalWidth, ch / a.naturalHeight) * zoom;
    const w = a.naturalWidth * s, h = a.naturalHeight * s;
    const x = (cw - w) / 2 + dx * cw, y = (ch - h) / 2;
    const g = c.getContext("2d", { alpha: zoom < 1 })!;
    g.imageSmoothingQuality = "high";
    if (zoom < 1) g.clearRect(0, 0, cw, ch);
    g.globalAlpha = 1;
    g.drawImage(a, x, y, w, h);
    if (t > 0.02 && b !== a) { g.globalAlpha = t; g.drawImage(b, x, y, w, h); g.globalAlpha = 1; }
    if (zoom < 1) {
      const key = `${cw}x${ch}`;
      if (key !== maskKey.current) { // feather edges; only recomputed on resize
        maskKey.current = key;
        const fx = (w * 0.14) / cw, fy = (h * 0.16) / ch, x0 = x / cw, x1 = (x + w) / cw, y0 = y / ch, y1 = (y + h) / ch;
        const pc = (n: number) => `${(n * 100).toFixed(2)}%`;
        const m = `linear-gradient(90deg,transparent ${pc(x0)},#000 ${pc(x0 + fx)},#000 ${pc(x1 - fx)},transparent ${pc(x1)}),linear-gradient(180deg,transparent ${pc(y0)},#000 ${pc(y0 + fy)},#000 ${pc(y1 - fy)},transparent ${pc(y1)})`;
        c.style.maskImage = m; c.style.webkitMaskImage = m;
        c.style.maskComposite = "intersect"; c.style.webkitMaskComposite = "source-in";
      }
    }
  }, [name, canvas, zoom, dx]);

  useEffect(() => {
    // frames may still be loading (e.g. arriving from another page): poll until the first one exists
    const id = setInterval(() => { if (frameStore[name]?.[0]) { setReady(true); draw(lastP.current); clearInterval(id); } }, 150);
    const onResize = () => draw(lastP.current);
    window.addEventListener("resize", onResize);
    return () => { clearInterval(id); window.removeEventListener("resize", onResize); };
  }, [name, draw]);

  return { ready, draw };
}
