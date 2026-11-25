"use client";
import Link from "next/link";
import { useState } from "react";
import { PRODUCTS, type Product } from "@/lib/data";
import { SIZES, SHOW_PRICES, WHATSAPP } from "@/lib/config";
import { useCart, waLink } from "@/lib/cart";
import ProductCard from "./ProductCard";

export default function ProductView({ p }: { p: Product }) {
  const { add } = useCart();
  const [size, setSize] = useState("42");
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const idx = PRODUCTS.findIndex((x) => x.id === p.id);
  const prev = PRODUCTS[(idx + PRODUCTS.length - 1) % PRODUCTS.length];
  const next = PRODUCTS[(idx + 1) % PRODUCTS.length];
  const more = PRODUCTS.filter((x) => x.id !== p.id).slice(0, 3);

  const move = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <main className="pdp">
      <nav className="crumbs"><Link href="/">Home</Link> / <Link href="/#stockroom">Shoes</Link> / <span>{p.name}</span></nav>
      <div className="pdp-grid">
        <div className="pdp-media">
          <div className="pdp-frame" style={{ background: `radial-gradient(circle at 50% 45%, ${p.colour}40, #efe2c8 75%)` }} onMouseMove={move} onMouseLeave={() => setZoom(null)}>
            <img src={p.img} alt={p.name}
              style={zoom ? { transform: "scale(1.9)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined} />
            <span className="pdp-tag">{p.art}</span>
            <span className="pdp-hint">{zoom ? "" : "Hover to zoom"}</span>
          </div>
        </div>

        <div className="pdp-info">
          <small className="label">{p.series}</small>
          <h1>{p.name}</h1>
          <div className="pdp-meta">
            <i className="swatch lg" style={{ background: p.colour }} /> {p.colourName}
            <span>·</span> Made in Pakistan
            <span>·</span> {SHOW_PRICES && p.price ? `Rs. ${p.price.toLocaleString()}` : "Price on WhatsApp"}
          </div>
          <p className="pdp-story">{p.story}</p>

          <div className="pdp-block">
            <div className="pdp-label"><b>Size (EU)</b><span>Not sure? Message us, we&apos;ll help.</span></div>
            <div className="sizes lg">
              {SIZES.map((s) => <button key={s} className={s === size ? "on" : ""} onClick={() => setSize(s)}>{s}</button>)}
            </div>
          </div>

          <div className="pdp-actions">
            <div className="qty lg">
              <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span>{qty}</span><button onClick={() => setQty(Math.min(10, qty + 1))}>+</button>
            </div>
            <button className="btn" onClick={() => add(p.id, size, qty)}>Add to bag</button>
            <a className="btn btn-ghost" target="_blank" rel="noreferrer" href={waLink([{ id: p.id, size, qty }])}>Order now on WhatsApp</a>
          </div>

          <ul className="pdp-feat">{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
          <p className="pdp-note">Orders are confirmed on WhatsApp ({WHATSAPP.replace(/(\d{2})(\d{3})(\d+)/, "+$1 $2 $3")}): size, address and delivery are agreed with you directly.</p>
        </div>
      </div>

      <div className="pdp-pager">
        <Link href={`/shoes/${prev.id}`}>← {prev.name}</Link>
        <Link href={`/shoes/${next.id}`}>{next.name} →</Link>
      </div>

      <section className="pdp-more">
        <h2>More from the stockroom</h2>
        <div className="grid">{more.map((m, i) => <ProductCard key={m.id} p={m} i={i} />)}</div>
      </section>
    </main>
  );
}
