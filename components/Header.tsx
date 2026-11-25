"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import Logo from "./Logo";

const LINKS = [["Craft", "/#anatomy"], ["Shoes", "/#stockroom"], ["Workshop", "/#factory"], ["Order", "/#order"]] as const;

export default function Header() {
  const { count, setOpen, bump } = useCart();
  const [pop, setPop] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => { if (!bump) return; setPop(true); const t = setTimeout(() => setPop(false), 450); return () => clearTimeout(t); }, [bump]);
  useEffect(() => { // lock page scroll while the mobile menu is open
    if (!menu) return;
    window.__lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => { window.__lenis?.start(); document.documentElement.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [menu]);
  return (
    <header className={`hdr ${menu ? "menu-on" : ""}`}>
      <Link href="/" aria-label="ONEZ home" onClick={() => setMenu(false)}><Logo size={26} /></Link>
      <nav className="hdr-nav">
        {LINKS.map(([t, h]) => <Link key={h} href={h}>{t}</Link>)}
      </nav>
      <div className="hdr-right">
        <button className={`bag-btn ${pop ? "pop" : ""}`} onClick={() => { setMenu(false); setOpen(true); }} aria-label="Open bag">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 016 0v2" /></svg>
          <span>Bag</span><b>{count}</b>
        </button>
        <button className="burger" onClick={() => setMenu((m) => !m)} aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu}><i /><i /></button>
      </div>
      <div className="mnav" aria-hidden={!menu}>
        {LINKS.map(([t, h], i) => <Link key={h} href={h} onClick={() => setMenu(false)} style={{ ["--i" as string]: i }} tabIndex={menu ? 0 : -1}><small>0{i + 1}</small>{t}</Link>)}
        <p>EST. 1997 · MADE IN PAKISTAN</p>
      </div>
    </header>
  );
}
