"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getProduct } from "@/lib/data";
import { SIZES } from "@/lib/config";
import { useCart } from "@/lib/cart";

type Action = { type: "products"; ids: string[] } | { type: "add"; id: string; size: string; qty: number };
type Msg = { role: "user" | "assistant"; content: string; actions?: Action[] };

const HELLO: Msg = { role: "assistant", content: "Salaam! I'm the ONEZ assistant. Tell me what kind of shoes you like — colour, style, occasion, your size — and I'll find your pair and put it in your bag." };
const STARTERS = ["Black shoes for daily wear", "Something bold and eye-catching", "A gift for my brother", "Show me everything"];

function Bold({ text }: { text: string }) {
  return <>{text.split(/(\*\*[^*]+\*\*)/g).map((t, i) => (t.startsWith("**") ? <b key={i}>{t.slice(2, -2)}</b> : <span key={i}>{t}</span>))}</>;
}

function ProductCard({ id }: { id: string }) {
  const p = getProduct(id);
  const { add } = useCart();
  const [size, setSize] = useState<string>("");
  const [done, setDone] = useState(false);
  if (!p) return null;
  return (
    <div className="cb-card">
      <Link href={`/shoes/${p.id}`} className="cb-card-img"><img src={p.img} alt={p.name} /></Link>
      <div className="cb-card-body">
        <small>{p.series}</small>
        <Link href={`/shoes/${p.id}`}><b>{p.name}</b></Link>
        <div className="cb-sizes">{SIZES.map((s) => <button key={s} className={s === size ? "on" : ""} onClick={() => { setSize(s); setDone(false); }}>{s}</button>)}</div>
        <div className="cb-card-actions">
          <button className="cb-add" disabled={!size} onClick={() => { add(p.id, size, 1, false); setDone(true); }}>{done ? "Added ✓" : size ? `Add size ${size}` : "Pick a size"}</button>
          <Link href={`/shoes/${p.id}`} className="cb-view">View →</Link>
        </div>
      </div>
    </div>
  );
}

export default function ChatWidget() {
  const { add, setOpen: openBag, lines } = useCart();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([HELLO]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLInputElement>(null);
  const applied = useRef(0); // number of assistant messages whose "add" actions were already applied

  useEffect(() => { // restore chat for this tab
    try { const s = JSON.parse(sessionStorage.getItem("onez-chat") || "null"); if (s?.length) { setMsgs(s); applied.current = s.filter((m: Msg) => m.role === "assistant").length; } } catch {}
  }, []);
  useEffect(() => { sessionStorage.setItem("onez-chat", JSON.stringify(msgs.slice(-30))); end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs, busy, open]);
  useEffect(() => { if (open) setTimeout(() => box.current?.focus(), 250); }, [open]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    setErr(""); setInput("");
    const next: Msg[] = [...msgs, { role: "user", content: t }];
    setMsgs(next); setBusy(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })), bag: lines }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      const actions: Action[] = data.actions || [];
      for (const a of actions) if (a.type === "add" && getProduct(a.id)) add(a.id, a.size, a.qty, false);
      applied.current++;
      setMsgs([...next, { role: "assistant", content: data.reply, actions }]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally { setBusy(false); }
  }

  return (
    <>
      <button className={`cb-fab ${open ? "hide" : ""}`} onClick={() => setOpen(true)} aria-label="Open ONEZ assistant">
        <span className="cb-fab-dot" />
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z" /><path d="M8.5 12h.01M12 12h.01M15.5 12h.01" /></svg>
        <span>Ask ONEZ</span>
      </button>

      <section className={`cb ${open ? "on" : ""}`} aria-hidden={!open} aria-label="ONEZ assistant" data-lenis-prevent>
        <header className="cb-head">
          <div><b>ONEZ Assistant</b><small><i /> Finds your pair · adds it to your bag</small></div>
          <button onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
        </header>

        <div className="cb-body">
          {msgs.map((m, i) => (
            <div key={i} className={`cb-msg ${m.role}`}>
              <p><Bold text={m.content} /></p>
              {m.actions?.filter((a) => a.type === "products").map((a, k) => a.type === "products" && (
                <div className="cb-cards" key={k}>{a.ids.map((id) => <ProductCard key={id} id={id} />)}</div>
              ))}
              {m.actions?.filter((a) => a.type === "add").map((a, k) => {
                if (a.type !== "add") return null;
                const p = getProduct(a.id);
                return <div className="cb-added" key={k}>✓ Added {p?.name} · EU {a.size} × {a.qty}<button onClick={() => openBag(true)}>Open bag →</button></div>;
              })}
            </div>
          ))}
          {busy && <div className="cb-msg assistant"><p className="cb-typing"><i /><i /><i /></p></div>}
          {err && <div className="cb-err">{err}</div>}
          {msgs.length === 1 && !busy && <div className="cb-starters">{STARTERS.map((s) => <button key={s} onClick={() => send(s)}>{s}</button>)}</div>}
          <div ref={end} />
        </div>

        <form className="cb-input" onSubmit={(e) => { e.preventDefault(); send(input); }}>
          <input ref={box} value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. olive high-tops, size 43…" maxLength={400} />
          <button type="submit" disabled={busy || !input.trim()} aria-label="Send">➤</button>
        </form>
      </section>
    </>
  );
}
