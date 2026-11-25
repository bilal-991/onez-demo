"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAssets } from "@/lib/assets";

/** Full-screen loader on the first visit to the home page. */
export default function Preloader() {
  const isHome = useRef(usePathname() === "/").current;
  const { progress, done } = useAssets();
  const [phase, setPhase] = useState<"on" | "out" | "gone">(isHome ? "on" : "gone");
  const [shown, setShown] = useState(0);
  const t0 = useRef(0);

  // smooth the displayed percentage toward the real one (time-based, so low frame rates don't slow it down)
  const tgt = useRef(0);
  tgt.current = done ? 1 : progress;
  useEffect(() => {
    if (phase === "gone") return;
    let raf = 0, last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(500, now - last); last = now;
      setShown((s) => { const t = tgt.current; const n = s + (t - s) * (1 - Math.exp(-dt / 120)); return Math.abs(t - n) < 0.002 ? t : n; });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  useEffect(() => { t0.current = performance.now(); }, []);
  useEffect(() => {
    if (phase !== "on") return;
    window.__lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = ""; };
  }, [phase]);

  useEffect(() => {
    if (phase !== "on" || !done || shown < 0.995) return;
    const wait = Math.max(0, 600 - (performance.now() - t0.current));
    const a = setTimeout(() => setPhase("out"), wait + 100);
    return () => clearTimeout(a);
  }, [phase, done, shown]);

  useEffect(() => {
    if (phase !== "out") return;
    window.scrollTo(0, 0);
    window.__lenis?.start();
    const b = setTimeout(() => setPhase("gone"), 1100);
    return () => clearTimeout(b);
  }, [phase]);

  if (phase === "gone") return null;
  const pct = Math.round(shown * 100);
  return (
    <div className={`loader ${phase === "out" ? "out" : ""}`} role="status" aria-label="Loading">
      <div className="loader-word" style={{ ["--p" as string]: `${pct}%` }}>
        <span className="lw-outline">ONEZ</span>
        <span className="lw-fill">ONEZ</span>
      </div>
      <div className="loader-meta">
        <span>PACKING THE BOX</span>
        <b>{String(pct).padStart(3, "0")}%</b>
      </div>
      <div className="loader-bar"><i style={{ width: `${pct}%` }} /></div>
      <small>EST. 1997 · MADE IN PAKISTAN</small>
    </div>
  );
}
