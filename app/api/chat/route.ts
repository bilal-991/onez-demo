import { NextRequest, NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/data";
import { SIZES } from "@/lib/config";

export const runtime = "nodejs";

const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const IDS = PRODUCTS.map((p) => p.id);

const catalog = PRODUCTS.map((p) => ({
  id: p.id, name: p.name, article: p.art, series: p.series, colour: p.colourName,
  about: p.blurb, features: p.features.slice(0, 3), sizes_eu: SIZES.join(", "), page: `/shoes/${p.id}`,
}));

const SYSTEM = `You are "ONEZ Assistant", the friendly shopping helper on the website of ONEZ Shoes, a Pakistani sneaker brand that designs and manufactures its own shoes.

YOUR JOB: help visitors find the right pair and get it into their bag.
- RECOMMEND FIRST. As soon as the visitor mentions any colour, style, occasion, gift or just asks for suggestions, immediately pick the 1-3 best pairs from the catalog and call show_products. Do NOT ask for a size before recommending: the cards let them pick a size. Ask at most one short follow-up question after showing pairs.
- Recommend 1-3 pairs from the CATALOG below ONLY. Never invent products, colours, materials, prices, discounts, delivery times or stock levels. If asked about price, delivery, payment or availability, say it is confirmed with the team on WhatsApp when the order is sent.
- Whenever you recommend or mention any pair by name, ALWAYS call the show_products tool with their ids so the visitor sees cards with links, and explain in 1-2 sentences why each fits.
- Sizes are EU ${SIZES.join(", ")}. Only call add_to_bag when the visitor clearly wants a specific pair AND has told you their size (ask for the size if missing). Default quantity 1.
- After adding to bag, tell them it's in their bag and that they can open the bag, enter their name and city, and send the order on WhatsApp.
- Be warm, concise (2-4 short sentences), plain text, no markdown tables. Reply in the language the visitor uses (English, Urdu or Roman Urdu).
- Stay on topic (ONEZ shoes and ordering). Politely decline anything else.

CATALOG (JSON):
${JSON.stringify(catalog)}`;

const tools = [
  {
    type: "function",
    function: {
      name: "show_products",
      description: "Show product cards (image, link, size picker) for the recommended pairs in the chat.",
      parameters: { type: "object", properties: { ids: { type: "array", items: { type: "string", enum: IDS }, minItems: 1, maxItems: 3 } }, required: ["ids"] },
    },
  },
  {
    type: "function",
    function: {
      name: "add_to_bag",
      description: "Add a pair to the visitor's shopping bag. Only when they asked for it and gave a size.",
      parameters: {
        type: "object",
        properties: { id: { type: "string", enum: IDS }, size: { type: "string", enum: SIZES }, qty: { type: "integer", minimum: 1, maximum: 5 } },
        required: ["id", "size"],
      },
    },
  },
];

type Msg = { role: "user" | "assistant"; content: string };
type Action = { type: "products"; ids: string[] } | { type: "add"; id: string; size: string; qty: number };

// tiny in-memory rate limit: 20 requests / minute / IP
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  arr.push(now); hits.set(ip, arr);
  return arr.length > 20;
}

async function groq(messages: unknown[], withTools: boolean, retry = true): Promise<{ content: string | null; tool_calls?: { id: string; function: { name: string; arguments: string } }[] }> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: MODEL, messages, temperature: 0.4, max_tokens: 700,
      ...(MODEL.includes("gpt-oss") ? { reasoning_effort: "low" } : {}),
      ...(withTools ? { tools, tool_choice: "auto", parallel_tool_calls: false } : {}),
    }),
  });
  if (res.status === 429 && retry) { // free-tier tokens-per-minute limit: wait as Groq suggests, then retry once
    const t = await res.text();
    const wait = Math.min(10, (Number(/try again in ([\d.]+)s/.exec(t)?.[1]) || 4) + 0.4);
    await new Promise((r) => setTimeout(r, wait * 1000));
    return groq(messages, withTools, false);
  }
  if (!res.ok) throw new Error(`groq ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return (await res.json()).choices[0].message;
}

export async function POST(req: NextRequest) {
  if (!process.env.GROQ_API_KEY) return NextResponse.json({ error: "Assistant is not configured." }, { status: 500 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return NextResponse.json({ error: "Too many messages, please wait a moment." }, { status: 429 });

  let body: { messages?: Msg[]; bag?: { id: string; size: string; qty: number }[] };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }
  const history = (body.messages || [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-14).map((m) => ({ role: m.role, content: m.content.slice(0, 700) }));
  if (!history.length || history[history.length - 1].role !== "user") return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const bagLines = (body.bag || []).filter((b) => IDS.includes(b.id) && SIZES.includes(String(b.size))).slice(0, 12)
    .map((b) => `${PRODUCTS.find((p) => p.id === b.id)!.name} EU ${b.size} x${Math.max(1, Math.min(10, Number(b.qty) || 1))}`);
  const bagNote = `\n\nVISITOR'S BAG RIGHT NOW: ${bagLines.length ? bagLines.join("; ") : "empty"}. (Items may have been added by the visitor from product cards. Don't re-add them.)`;
  const messages: unknown[] = [{ role: "system", content: SYSTEM + bagNote }, ...history];
  const actions: Action[] = [];
  try {
    for (let i = 0; i < 4; i++) {
      let msg;
      try { msg = await groq(messages, true); }
      catch (e) { if (i === 0) msg = await groq(messages, false); else throw e; } // retry once without tools
      if (msg.tool_calls?.length) {
        messages.push({ role: "assistant", content: msg.content ?? "", tool_calls: msg.tool_calls });
        for (const tc of msg.tool_calls) {
          let out = "ok";
          try {
            const a = JSON.parse(tc.function.arguments || "{}");
            if (tc.function.name === "show_products") {
              const ids = (a.ids as string[] || []).filter((x) => IDS.includes(x)).slice(0, 3);
              if (ids.length) actions.push({ type: "products", ids }); else out = "error: unknown ids";
            } else if (tc.function.name === "add_to_bag") {
              if (IDS.includes(a.id) && SIZES.includes(String(a.size))) {
                actions.push({ type: "add", id: a.id, size: String(a.size), qty: Math.min(5, Math.max(1, Number(a.qty) || 1)) });
                out = "added to the visitor's bag";
              } else out = "error: invalid id or size";
            } else out = "error: unknown tool";
          } catch { out = "error: bad arguments"; }
          messages.push({ role: "tool", tool_call_id: tc.id, content: out });
        }
        continue;
      }
      let text = (msg.content || "").trim();
      // safety net: a clear "add <pair> in size N" request that the model answered in words only
      if (!actions.some((a) => a.type === "add")) {
        const q = history[history.length - 1].content.toLowerCase();
        const size = /\b(4[0-5])\b/.exec(q)?.[1];
        if (size && /\b(add|put|bag|buy|order|take|get|want|need|le lo|dal do|chahiye)\b/.test(q)) {
          const words = q.split(/[^a-z0-9]+/).filter((w) => w.length > 2);
          const sc = PRODUCTS.map((p) => {
            const names = `${p.name} ${p.colourName} ${p.id.replace(/-/g, " ")}`.toLowerCase();
            return { p, n: words.reduce((n, w) => n + (names.includes(w) ? 1 : 0), 0) };
          }).sort((a, b) => b.n - a.n);
          if (sc[0].n > 0 && sc[0].n > (sc[1]?.n ?? 0)) {
            const qty = Math.min(5, Math.max(1, Number(/\b([2-5])\s*(pairs?|x)\b|\bx\s*([2-5])\b/.exec(q)?.[1]) || 1));
            actions.push({ type: "add", id: sc[0].p.id, size, qty });
            text = `Done! ${sc[0].p.name} (EU ${size}${qty > 1 ? ` x${qty}` : ""}) is in your bag. Open the bag, add your name and city, and send the order on WhatsApp. Want me to find a matching pair too?`;
          }
        }
      }
      // safety net: if the model named catalog shoes but forgot show_products, attach the cards ourselves
      if (!actions.some((a) => a.type === "products" || a.type === "add")) {
        const norm = (x: string) => x.toLowerCase().replace(/[‑–-]/g, " ");
        const t = norm(text);
        const found = PRODUCTS.filter((p) => t.includes(norm(p.name))).slice(0, 3).map((p) => p.id);
        if (found.length) actions.push({ type: "products", ids: found });
      }
      if (!actions.some((a) => a.type === "products" || a.type === "add")) {
        // second safety net: match keywords in what the visitor typed (colour / series / name)
        const q = history[history.length - 1].content.toLowerCase();
        const words = q.split(/[^a-z0-9]+/).filter((w) => w.length > 2);
        const scored = PRODUCTS.map((p) => {
          const hay = `${p.colourName} ${p.series} ${p.name} ${p.blurb}`.toLowerCase();
          return { id: p.id, score: words.reduce((n, w) => n + (hay.includes(w) ? 1 : 0), 0) + (q.includes(p.colourName.toLowerCase()) ? 3 : 0) };
        }).filter((x) => x.score >= 3 || (x.score > 0 && /show|suggest|recommend|everything|all|options/.test(q))).sort((a, b) => b.score - a.score).slice(0, 3);
        if (scored.length) actions.push({ type: "products", ids: scored.map((x) => x.id) });
        else if (/everything|show me|all shoes|what do you have|options|suggest|recommend|gift|bold|catchy/.test(q)) actions.push({ type: "products", ids: PRODUCTS.slice(0, 3).map((p) => p.id) });
      }
      return NextResponse.json({ reply: text || "Tell me what kind of shoe you're after and I'll find your pair!", actions });
    }
    return NextResponse.json({ reply: "Here are my suggestions!", actions });
  } catch (e) {
    console.error("[chat]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "The assistant is busy right now. Please try again in a moment." }, { status: 502 });
  }
}
