"use client";
import { RefObject, useEffect } from "react";

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const ramp = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Calls cb(progress 0..1) while a tall section scrolls past its sticky child.
 *  Progress is eased toward the scroll target every frame, so scrubbing feels buttery. */
export function useStickyProgress(ref: RefObject<HTMLElement | null>, cb: (p: number) => void, damping = 1) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0, cur = -1, target = 0;
    const read = () => {
      const r = el.getBoundingClientRect();
      target = clamp(-r.top / Math.max(1, r.height - window.innerHeight));
    };
    const tick = () => {
      raf = 0;
      read();
      if (cur < 0) cur = target;
      cur += (target - cur) * damping;
      if (Math.abs(target - cur) < 0.0003) cur = target;
      cb(cur);
      if (cur !== target) raf = requestAnimationFrame(tick);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
}
