"use client";
import Link from "next/link";
import { SIZES, SHOW_PRICES } from "@/lib/config";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/data";
import Logo from "./Logo";

export default function ProductCard({ p, i = 0 }: { p: Product; i?: number }) {
  const { add } = useCart();
  return (
    <article className="pcard" style={{ ["--i" as string]: i }}>
      <Link href={`/shoes/${p.id}`} className="pcard-lid" aria-label={`${p.name} details`}>
        <span>{p.art}</span><Logo size={15} />
      </Link>
      <Link href={`/shoes/${p.id}`} className="pcard-img">
        <img src={p.img} alt={p.name} loading="lazy" />
        <em>View pair →</em>
      </Link>
      <div className="pcard-body">
        <div>
          <small>{p.series}</small>
          <h3>{p.name}</h3>
        </div>
        <i className="swatch" style={{ background: p.colour }} title={p.colourName} />
      </div>
      <p className="pcard-blurb">{p.blurb}{SHOW_PRICES && p.price ? ` Rs. ${p.price.toLocaleString()}` : ""}</p>
      <div className="pcard-sizes">
        <span>Quick add · EU</span>
        <div>{SIZES.map((s) => <button key={s} onClick={() => add(p.id, s)} aria-label={`Add ${p.name} size ${s}`}>{s}</button>)}</div>
      </div>
    </article>
  );
}
