"use client";
import { useState } from "react";
import { COLOURS, PRODUCTS } from "@/lib/data";
import ProductCard from "./ProductCard";

export default function Catalog() {
  const [f, setF] = useState("All");
  const list = f === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.colourName === f);
  return (
    <section className="catalog" id="stockroom">
      <div className="cat-head">
        <div>
          <small className="label">THE STOCKROOM · {PRODUCTS.length} PAIRS</small>
          <h2>Pick your<br />box.</h2>
        </div>
        <div className="chips" role="tablist" aria-label="Filter by colour">
          {COLOURS.map((c) => (
            <button key={c} role="tab" aria-selected={f === c} className={f === c ? "on" : ""} onClick={() => setF(c)}>{c}</button>
          ))}
        </div>
      </div>
      <div className="grid" key={f}>
        {list.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
      </div>
    </section>
  );
}
