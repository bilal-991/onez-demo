"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

type L = { scrollTo(t: number | HTMLElement, o?: { immediate?: boolean; force?: boolean; duration?: number }): void };

export default function SmoothScroll() {
  const pathname = usePathname();
  // New page => start at the top. Lenis keeps its own scroll target, so without this it can drag a freshly opened page
  // back down to wherever the previous page was scrolled. Going back to the home page keeps the browser's restored position.
  useEffect(() => {
    const lenis = () => (window as unknown as { __lenis?: L }).__lenis;
    const go = () => {
      if (location.hash) return;
      if (pathname === "/") lenis()?.scrollTo(window.scrollY, { immediate: true, force: true }); // just re-sync
      else { lenis()?.scrollTo(0, { immediate: true, force: true }); window.scrollTo(0, 0); }
    };
    go();
    const a = requestAnimationFrame(go), b = setTimeout(go, 120);
    return () => { cancelAnimationFrame(a); clearTimeout(b); };
  }, [pathname]);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
    (window as unknown as { __lenis?: unknown }).__lenis = lenis;
    let raf = 0;
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const el = document.querySelector(a.getAttribute("href")!);
      if (el) { e.preventDefault(); lenis.scrollTo(el as HTMLElement, { duration: 1.6 }); }
    };
    document.addEventListener("click", onClick);
    return () => { cancelAnimationFrame(raf); document.removeEventListener("click", onClick); lenis.destroy(); delete (window as unknown as { __lenis?: unknown }).__lenis; };
  }, []);
  return null;
}
