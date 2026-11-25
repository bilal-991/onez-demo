"use client";
import { useEffect, useRef, useState } from "react";
import { PRODUCTS, STEPS } from "@/lib/data";
import { WHATSAPP, INSTAGRAM, FACEBOOK } from "@/lib/config";
import { ramp, useStickyProgress } from "@/lib/hooks";
import Logo from "./Logo";
import { useFrames } from "@/lib/useFrames";

export function Tape() {
  const t = "ONEZ  ★  EST. 1997  ★  MADE IN PAKISTAN  ★  WALK DIFFERENT  ★  ";
  return (
    <div className="tapeband" aria-hidden>
      <div className="tapetrack">{[0, 1, 2, 3].map((i) => <span key={i}>{t}</span>)}</div>
    </div>
  );
}

const MANIFESTO = "We don't just sell shoes. We make them. Cut, stitched and pressed in our own workshop, then packed in the orange box you already know. No middlemen. No mystery. Just a pair with your name on the size tag.";

export function Manifesto() {
  const sec = useRef<HTMLElement>(null);
  const words = MANIFESTO.split(" ");
  useStickyProgress(sec, (p) => {
    sec.current?.querySelectorAll<HTMLElement>(".w").forEach((el, i) => {
      el.style.opacity = String(0.14 + 0.86 * ramp(p * 1.25, i / words.length, (i + 3) / words.length));
    });
  });
  return (
    <section ref={sec} className="manifesto">
      <div className="sticky">
        <small className="label">WHO WE ARE</small>
        <p>{words.map((w, i) => <span className="w" key={i}>{w} </span>)}</p>
      </div>
    </section>
  );
}

export function Anatomy() {
  const sec = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const labels = useRef<HTMLUListElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const { draw } = useFrames("anatomy", canvas, { mzoom: 2, my: 0.48 });
  useStickyProgress(sec, (p) => {
    draw(p);
    labels.current?.querySelectorAll<HTMLElement>("li").forEach((li, i) => {
      const o = ramp(p, 0.16 + i * 0.07, 0.24 + i * 0.07) * (1 - ramp(p, 0.62, 0.7));
      li.style.opacity = String(o);
      li.style.transform = `translateX(${(1 - o) * 30}px)`;
    });
    if (copy.current) copy.current.style.opacity = String(1 - ramp(p, 0.72, 0.85) * 0.0);
  });
  return (
    <section ref={sec} className="anatomy" id="anatomy">
      <div className="sticky">
        <canvas ref={canvas} className="full-canvas" />
        <div className="anat-shade" />
        <div ref={copy} className="anat-copy">
          <small className="label">THE CUT-SHEET</small>
          <h2>Three layers.<br />One pair.</h2>
          <p>Scroll to pull a ONEZ apart.</p>
        </div>
        <ul ref={labels} className="anat-labels">
          <li><b>01 Upper</b><span>Light, flexible, shaped to move with your stride.</span></li>
          <li><b>02 Midsole</b><span>The cushion that does the quiet work all day.</span></li>
          <li><b>03 Outsole</b><span>Pressed and bonded for grip on real Pakistani streets.</span></li>
        </ul>
      </div>
    </section>
  );
}

export function Turntable() {
  const sec = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const deg = useRef<HTMLSpanElement>(null);
  const { draw } = useFrames("turn", canvas, { mzoom: 2.1, my: 0.56 });
  useStickyProgress(sec, (p) => {
    draw(p);
    if (deg.current) deg.current.textContent = String(Math.round(p * 360)).padStart(3, "0");
  });
  return (
    <section ref={sec} className="turn">
      <div className="sticky">
        <canvas ref={canvas} className="full-canvas" />
        <div className="turn-shade" />
        <div className="turn-copy">
          <small className="label">EVERY ANGLE</small>
          <h2>Turn it<br />over.</h2>
        </div>
        <div className="turn-deg"><span ref={deg}>000</span>°</div>
      </div>
    </section>
  );
}

export function Process() {
  return (
    <section className="process" id="factory">
      <small className="label">FROM OUR WORKSHOP</small>
      <h2>Made, not<br />shipped in.</h2>
      <div className="tickets">
        {STEPS.map((s, i) => (
          <div className="ticket" key={s.n} style={{ transform: `rotate(${[-2, 1.5, -1, 2][i]}deg)` }}>
            <span className="num">{s.n}</span>
            <h3>{s.t}</h3>
            <p>{s.d}</p>
            <span className="stamp">QC ✓</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Order() {
  const [model, setModel] = useState(PRODUCTS[0].name);
  const [size, setSize] = useState("42");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const msg = `Hi ONEZ! I'd like to order:\n• Model: ${model}\n• Size: ${size}\n• Name: ${name}\n• City: ${city}`;
  const href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
  return (
    <section className="order" id="order">
      <div className="slip">
        <div className="slip-head"><Logo size={24} /><span>PACKING SLIP · No. {new Date().getFullYear()}-{String(PRODUCTS.length).padStart(4, "0")}</span></div>
        <h2>Fill the slip.<br />We'll pack the box.</h2>
        <form onSubmit={(e) => { e.preventDefault(); window.open(href, "_blank"); }}>
          <label>Model
            <select value={model} onChange={(e) => setModel(e.target.value)}>
              {PRODUCTS.map((p) => <option key={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label>Size (EU)
            <div className="sizes">{["40", "41", "42", "43", "44", "45"].map((s) => (
              <button type="button" key={s} className={s === size ? "on" : ""} onClick={() => setSize(s)}>{s}</button>
            ))}</div>
          </label>
          <label>Your name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ahmed Khan" required /></label>
          <label>City<input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Lahore" required /></label>
          <button className="btn btn-wa" type="submit">Send on WhatsApp →</button>
        </form>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="foot-word" aria-hidden>ONEZ</div>
      <div className="foot-row">
        <Logo size={22} />
        <span>Designed &amp; manufactured in Pakistan.</span>
        <span className="links"><a href={INSTAGRAM}>Instagram</a><a href={FACEBOOK}>Facebook</a><a href={`https://wa.me/${WHATSAPP}`}>WhatsApp</a></span>
      </div>
    </footer>
  );
}
