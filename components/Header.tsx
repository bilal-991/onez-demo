"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import Logo from "./Logo";

export default function Header() {
  const { count, setOpen, bump } = useCart();
  const [pop, setPop] = useState(false);
  useEffect(() => { if (!bump) return; setPop(true); const t = setTimeout(() => setPop(false), 450); return () => clearTimeout(t); }, [bump]);
  return (
    <header className="hdr">
      <Link href="/" aria-label="ONEZ home"><Logo size={26} /></Link>
      <nav className="hdr-nav">
        <Link href="/#anatomy">Craft</Link>
        <Link href="/#stockroom">Shoes</Link>
        <Link href="/#factory">Workshop</Link>
        <Link href="/#order">Order</Link>
      </nav>
      <button className={`bag-btn ${pop ? "pop" : ""}`} onClick={() => setOpen(true)} aria-label="Open bag">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 016 0v2" /></svg>
        <span>Bag</span><b>{count}</b>
      </button>
    </header>
  );
}
