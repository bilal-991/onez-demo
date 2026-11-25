export type Product = {
  id: string;           // used in the URL: /shoes/<id>
  name: string;
  art: string;          // article / model number
  img: string;
  colourName: string;   // used by the catalog filter
  colour: string;       // swatch + card accent
  series: string;
  blurb: string;        // one line, on the card
  story: string;        // paragraph, on the detail page
  features: string[];
  price?: number;       // PKR — shown only when SHOW_PRICES is true in lib/config.ts
};

// Swap the images in /public/products with clean studio shots (same filenames).
export const PRODUCTS: Product[] = [
  {
    id: "brown-1997", name: "Mocha 1997", art: "ON-1997-MC", img: "/products/brown-1997.jpg",
    colourName: "Brown", colour: "#6b4a34", series: "1997 Series",
    blurb: "Rich brown suede with a cool-blue swoosh. Warm, bold, goes with everything.",
    story: "Mocha 1997 is where ONEZ started: deep brown suede, a contrasting swoosh and a gum-tone sole. It sits easy with jeans, shalwar kameez or a track suit.",
    features: ["Brown suede-look upper", "Contrast swoosh", "Gum-tone cushioned sole", "Comes in the ONEZ kraft box"],
  },
  {
    id: "midnight-1997", name: "Midnight 1997", art: "ON-1997-MN", img: "/products/midnight-1997.jpg",
    colourName: "Navy", colour: "#1d2a44", series: "1997 Series",
    blurb: "Deep navy canvas on a chunky white sole. Sharp by day, sharper at night.",
    story: "The same 1997 spirit in midnight navy: a clean canvas upper, flat laces and a thick white platform sole that makes every outfit pop.",
    features: ["Navy canvas upper", "Chunky white platform sole", "Flat lace-up fit", "Comes in the ONEZ kraft box"],
  },
  {
    id: "olive-air", name: "Olive High", art: "ON-HI-OL", img: "/products/olive-air.jpg",
    colourName: "Olive", colour: "#6a7152", series: "High Series",
    blurb: "Olive high-top with a cream sole. Built to be seen from the street.",
    story: "Olive High is the one people ask about: a soft olive canvas high-top with a cream cup sole. Great with denim, cargo and everything earthy.",
    features: ["Olive canvas high-top", "Cream cup sole", "Ankle-height lace-up fit", "Comes in the ONEZ kraft box"],
  },
  {
    id: "black-runner", name: "Black Glow", art: "ON-GLO-BK", img: "/products/black-runner.jpg",
    colourName: "Black", colour: "#141414", series: "Glow Series",
    blurb: "Black high-tops with a glowing green sole. Lights up the night.",
    story: "Black Glow is all night-time attitude: a sleek black high-top with a strap closure and an LED-glow sole that turns every step into a statement.",
    features: ["Black high-top with strap", "Glowing green sole", "Padded ankle collar", "Comes in the ONEZ kraft box"],
  },
  {
    id: "cream-stripe", name: "Spark White", art: "ON-SPK-WH", img: "/products/cream-stripe.jpg",
    colourName: "White", colour: "#e9e4da", series: "Classic Series",
    blurb: "Clean white low-top with a sparkle finish. The showroom favourite.",
    story: "Spark White is the clean one: a low-profile white sneaker with a subtle sparkle finish and a thick platform sole. Dress it up or down.",
    features: ["White low-top with sparkle finish", "Platform rubber sole", "Classic lace-up fit", "Comes in the ONEZ kraft box"],
  },
  {
    id: "mocha-pair", name: "Pastel Pop", art: "ON-POP-PS", img: "/products/mocha-pair.jpg",
    colourName: "Pastel", colour: "#b8c4ea", series: "Runner Series",
    blurb: "Soft pastel runner with an orange accent. Light, fresh, easy.",
    story: "Pastel Pop is the fun one: a soft lilac-and-blue runner with a bright orange accent and a cushioned sole. Made for long days and bright outfits.",
    features: ["Pastel mesh and suede upper", "Orange accent detail", "Cushioned runner sole", "Comes in the ONEZ kraft box"],
  },
];

export const STEPS = [
  { n: "01", t: "Cut", d: "Patterns are cut and checked before a single stitch is sewn." },
  { n: "02", t: "Stitch", d: "Uppers are stitched and lasted by hand, pair by pair." },
  { n: "03", t: "Press", d: "Soles are bonded and pressed until they stay put." },
  { n: "04", t: "Box", d: "Every pair is inspected and packed into the kraft ONEZ box." },
];

export const COLOURS = ["All", ...Array.from(new Set(PRODUCTS.map((p) => p.colourName)))];
export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);
