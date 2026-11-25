"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { PRODUCTS } from "./data";
import { WHATSAPP } from "./config";

export type Line = { id: string; size: string; qty: number };
type Ctx = {
  lines: Line[]; count: number; open: boolean; bump: number;
  add: (id: string, size: string, qty?: number, openBag?: boolean) => void;
  setQty: (id: string, size: string, qty: number) => void;
  remove: (id: string, size: string) => void;
  clear: () => void; setOpen: (v: boolean) => void;
};
const C = createContext<Ctx>(null as unknown as Ctx);
export const useCart = () => useContext(C);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try { setLines(JSON.parse(localStorage.getItem("onez-bag") || "[]")); } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem("onez-bag", JSON.stringify(lines)); }, [lines, loaded]);

  const add = useCallback((id: string, size: string, qty = 1, openBag = true) => {
    setLines((l) => {
      const f = l.find((x) => x.id === id && x.size === size);
      return f ? l.map((x) => (x === f ? { ...x, qty: Math.min(10, x.qty + qty) } : x)) : [...l, { id, size, qty }];
    });
    setBump((b) => b + 1); if (openBag) setOpen(true);
  }, []);
  const setQty = useCallback((id: string, size: string, qty: number) =>
    setLines((l) => l.map((x) => (x.id === id && x.size === size ? { ...x, qty: Math.max(1, Math.min(10, qty)) } : x))), []);
  const remove = useCallback((id: string, size: string) => setLines((l) => l.filter((x) => !(x.id === id && x.size === size))), []);
  const clear = useCallback(() => setLines([]), []);
  const count = lines.reduce((a, l) => a + l.qty, 0);

  const value = useMemo(() => ({ lines, count, open, bump, add, setQty, remove, clear, setOpen }), [lines, count, open, bump, add, setQty, remove, clear]);
  return <C.Provider value={value}>{children}</C.Provider>;
}

export function waLink(lines: Line[], name = "", city = "") {
  const items = lines.map((l) => {
    const p = PRODUCTS.find((x) => x.id === l.id);
    return `• ${p?.name ?? l.id} (${p?.art ?? ""}) — size ${l.size} × ${l.qty}`;
  }).join("\n");
  const msg = `Hi ONEZ! I'd like to order:\n${items}${name ? `\n\nName: ${name}` : ""}${city ? `\nCity: ${city}` : ""}`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
}
