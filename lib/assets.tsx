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
    // The loader waits for the coarse pass of every scene + product photos; the rest keeps loading quietly after.
    const W: Record<string, number> = { hero: 10, anatomy: 5, turn: 5 };
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
    // Hero is the first thing seen, so it gets a finer first pass (every 3rd frame) and finishes completely before the other
    // scenes refine. All scenes still load their rough pass up front, so nothing is blank when you scroll quickly.
    const hero = loadScene("hero", (d, t) => { frac.hero = d / t; report(); }, { stride: 3 });
    const heroDone = hero.all.catch(() => {});
    const others = SCENES.filter((x) => x !== "hero").map((n) => ({ n, s: loadScene(n, (d, t) => { frac[n] = d / t; report(); }, { gate: heroDone }) }));
    const jobs = [
      (async () => { await hero.coarse; frac.hero = 1; })(),
      ...others.map(async (o) => { await o.s.coarse; frac[o.n] = 1; }),
      ...IMAGES.map(async (u) => { try { const im = new Image(); im.src = u; await im.decode(); } catch {} frac[u] = 1; report(); }),
    ];
    const timeout = new Promise((r) => setTimeout(r, 45000)); // never trap the visitor
    Promise.race([Promise.all(jobs), timeout]).then(() => {
      report(true); setState({ progress: 1, done: true });
      // remaining frames of every scene keep filling in quietly (already running in parallel)
      void others; void heroDone;
    });
  }, []);

  return <C.Provider value={state}>{children}</C.Provider>;
}
