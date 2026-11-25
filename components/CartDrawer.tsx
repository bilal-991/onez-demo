"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart, waLink } from "@/lib/cart";
import { getProduct } from "@/lib/data";

declare global { interface Window { __lenis?: { stop(): void; start(): void } } }

export default function CartDrawer() {
  const { lines, open, setOpen, setQty, remove, clear, count } = useCart();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  useEffect(() => {
    window.__lenis?.[open ? "stop" : "start"]();
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, setOpen]);
  const ready = lines.length > 0 && name.trim() && city.trim();
  return (
    <>
      <div className={`scrim ${open ? "on" : ""}`} onClick={() => setOpen(false)} />
      <aside className={`drawer ${open ? "on" : ""}`} aria-hidden={!open} data-lenis-prevent>
        <div className="drawer-head">
          <h2>Your bag <span>({count})</span></h2>
          <button onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>
        {lines.length === 0 ? (
          <div className="drawer-empty">
            <p>The box is empty.</p>
            <Link href="/#stockroom" onClick={() => setOpen(false)} className="btn btn-sm">Browse the shoes →</Link>
          </div>
        ) : (
          <>
            <ul className="drawer-list">
              {lines.map((l) => {
                const p = getProduct(l.id)!;
                return (
                  <li key={l.id + l.size}>
                    <Link href={`/shoes/${p.id}`} onClick={() => setOpen(false)} className="dl-img"><img src={p.img} alt={p.name} /></Link>
                    <div className="dl-info">
                      <b>{p.name}</b><small>{p.art} · EU {l.size}</small>
                      <div className="qty">
                        <button onClick={() => (l.qty > 1 ? setQty(l.id, l.size, l.qty - 1) : remove(l.id, l.size))}>−</button>
                        <span>{l.qty}</span>
                        <button onClick={() => setQty(l.id, l.size, l.qty + 1)}>+</button>
                      </div>
                    </div>
                    <button className="dl-x" onClick={() => remove(l.id, l.size)} aria-label="Remove">Remove</button>
                  </li>
                );
              })}
            </ul>
            <div className="drawer-foot">
              <div className="dl-fields">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
              </div>
              <a className={`btn btn-wa ${ready ? "" : "off"}`} href={ready ? waLink(lines, name, city) : undefined} target="_blank" rel="noreferrer"
                 onClick={(e) => { if (!ready) e.preventDefault(); }}>Send order on WhatsApp →</a>
              <button className="linkbtn" onClick={clear}>Empty bag</button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
