"use client";
import { useEffect, useRef } from "react";
import { ease, ramp, useStickyProgress } from "@/lib/hooks";
import { useFrames } from "@/lib/useFrames";

export default function Hero() {
  const sec = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const t1 = useRef<HTMLDivElement>(null);
  const t2 = useRef<HTMLDivElement>(null);
  const t3 = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const { ready, draw } = useFrames("hero", canvas, { zoom: 0.74, dx: 0.1 });
  const last = useRef(0);

  const update = (p: number) => {
    last.current = p;
    draw(p);
    const set = (r: React.RefObject<HTMLElement | null>, o: number, y: number) => {
      if (!r.current) return;
      r.current.style.opacity = String(o);
      r.current.style.transform = `translateY(${y}px)`;
    };
    const a = 1 - ramp(p, 0.1, 0.2);
    const b = ramp(p, 0.2, 0.3) * (1 - ramp(p, 0.42, 0.52));
    const c = ramp(p, 0.62, 0.74);
    set(t1, a, -ease(ramp(p, 0.08, 0.2)) * 40);
    set(t2, b, (1 - ramp(p, 0.2, 0.3)) * 40);
    set(t3, c, (1 - c) * 40);
    if (hint.current) hint.current.style.opacity = String(1 - ramp(p, 0, 0.05));
  };
  useStickyProgress(sec, update);
  useEffect(() => { if (ready) update(last.current); /* eslint-disable-next-line */ }, [ready]);

  return (
    <section ref={sec} className="hero" id="top">
      <div className="hero-stage">
        <canvas ref={canvas} className="hero-canvas" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <div ref={t1} className="beat"><small>01 / SEALED</small><h1>Sealed in<br />Pakistan.</h1></div>
          <div ref={t2} className="beat"><small>02 / OPENING</small><h1>Cut the<br />tape.</h1></div>
          <div ref={t3} className="beat"><small>03 / YOURS</small><h1>Step into<br />ONEZ.</h1><a href="#stockroom" className="btn">See the stockroom ↓</a></div>
        </div>
        <div ref={hint} className="hint"><span /> SCROLL TO UNBOX</div>
      </div>
    </section>
  );
}
