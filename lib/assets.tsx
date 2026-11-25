"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { PRODUCTS } from "./data";
import { SCENES, loadScene } from "./frames";

const IMAGES = PRODUCTS.map((p) => p.img);
type Ctx = { progress: number; done: boolean };
const C = createContext<Ctx>({ progress: 0, done: false });
export const useAssets = () => useContext(C);

export function AssetProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Ctx>({ progress: 0, done: false });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const frac: Record<string, number> = {};
    // The loader waits for the hero + product photos only; other scenes keep loading quietly after.
    const W: Record<string, number> = { hero: 10 };
    IMAGES.forEach((u) => (W[u] = 0.7));
    const totalW = Object.values(W).reduce((a, b) => a + b, 0);
    let last = 0;
    const report = (force = false) => {
      const now = performance.now();
      if (!force && now - last < 80) return;
      last = now;
      const p = Object.keys(W).reduce((a, k) => a + (frac[k] || 0) * W[k], 0) / totalW;
      setState((s) => ({ ...s, progress: p }));
    };
    // Start the other scenes' coarse passes right away (in parallel), so they're ready long before the visitor scrolls to them.
    const others = SCENES.filter((x) => x !== "hero").map((n) => loadScene(n));
    const jobs = [
      (async () => { const h = loadScene("hero", (d, t) => { frac.hero = d / t; report(); }); await h.coarse; frac.hero = 1; })(),
      ...IMAGES.map(async (u) => { try { const im = new Image(); im.src = u; await im.decode(); } catch {} frac[u] = 1; report(); }),
    ];
    const timeout = new Promise((r) => setTimeout(r, 45000)); // never trap the visitor
    Promise.race([Promise.all(jobs), timeout]).then(() => {
      report(true); setState({ progress: 1, done: true });
      // remaining frames of every scene keep filling in quietly (already running in parallel)
      void others;
    });
  }, []);

  return <C.Provider value={state}>{children}</C.Provider>;
}
