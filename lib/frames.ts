"use client";
/** Shared store of downloaded + decoded frame images. */
export const frameStore: Record<string, HTMLImageElement[]> = {};
export const SCENES = ["hero", "anatomy", "turn"] as const;

/**
 * Loads a scene in two passes: a coarse pass (every 6th frame) that resolves `coarse` quickly,
 * then the remaining frames in the background (`all`). Drawing falls back to the nearest loaded frame.
 */
export function loadScene(name: string, onCoarse: (done: number, total: number) => void = () => {}) {
  let resolveCoarse!: () => void;
  const coarse = new Promise<void>((r) => (resolveCoarse = r));
  const all = (async () => {
    const m = await (await fetch(`/frames/${name}/manifest.json`)).json();
    const n: number = m.count;
    const list: HTMLImageElement[] = (frameStore[name] ||= new Array(n));
    const order: number[] = [];
    for (let i = 0; i < n; i += 6) order.push(i);
    if (order[order.length - 1] !== n - 1) order.push(n - 1);
    const coarseCount = order.length;
    for (let i = 0; i < n; i++) if (i % 6 && i !== n - 1) order.push(i);

    let k = 0, done = 0;
    const worker = async () => {
      while (k < order.length) {
        const i = order[k++];
        const im = new Image();
        im.decoding = "async";
        im.src = `/frames/${name}/${String(i + 1).padStart(4, "0")}.${m.ext || "webp"}`;
        if (done < coarseCount) {
          // first pass: wait for the DOWNLOAD only (decoding 1080p frames is CPU-heavy and would stall the loader)
          await new Promise<void>((r) => { im.onload = () => r(); im.onerror = () => r(); });
        } else {
          try { await im.decode(); } catch {}
        }
        list[i] = im; done++;
        if (done <= coarseCount) onCoarse(done, coarseCount);
        if (done === coarseCount) resolveCoarse();
      }
    };
    await Promise.all(Array.from({ length: 8 }, worker));
    resolveCoarse();
  })().catch(() => resolveCoarse());
  return { coarse, all };
}
