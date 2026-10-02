// Catalogo dimostrativo: nomi, codici, materiali e prezzi sono inventati.
import sizes from "./media-sizes.json";

export type Colorway = { nome: string; hex: string; img: string };
export type Capo = {
  slug: string;
  codice: string;
  nome: string;
  categoria: string;
  prezzo: number;
  materiale: string;
  grammatura: string;
  descrizione: string;
  retro: string;
  colorway: Colorway[];
  scheda: [string, string][];
  /** strati per l'esploso corto nella pagina del capo */
  strati: { label: string; img: string }[];
  pagina: boolean;
};

const img = (p: string) => `/media/capi/${p}.webp`;

export const CAPI: Capo[] = [
  {
    slug: "giacca-trama",
    codice: "ORD-JKT-01",
    nome: "Giacca Trama",
    categoria: "Giacca imbottita",
    prezzo: 480,
    materiale: "Nylon ripstop",
    grammatura: "320 g/m²",
    descrizione: "Sette componenti, 214 cuciture. Guscio ripstop, imbottitura trapuntata a rombi, fodera in taffetà.",
    retro: img("jacket-back"),
    colorway: [
      { nome: "Grafite", hex: "#1a1a1a", img: img("jacket-a") },
      { nome: "Cemento", hex: "#a8a39a", img: img("jacket-b") },
    ],
    scheda: [
      ["Guscio", "Nylon ripstop 320 g/m²"],
      ["Imbottitura", "Fibra riciclata 120 g"],
      ["Fodera", "Taffetà 70 g/m²"],
      ["Zip", "YKK a doppio cursore [dimostrativo]"],
      ["Cuciture", "214"],
      ["Origine", "Made in Italy [dimostrativo]"],
    ],
    strati: [],
    pagina: true,
  },
  {
    slug: "t-shirt-peso",
    codice: "ORD-TEE-01",
    nome: "T-shirt Peso",
    categoria: "T-shirt",
    prezzo: 70,
    materiale: "Cotone heavy jersey",
    grammatura: "240 g/m²",
    descrizione: "Cinque pezzi tagliati al laser, cuciture a doppio ago, collo a costina chiuso a mano.",
    retro: img("tee-back"),
    colorway: [
      { nome: "Carta", hex: "#efeae0", img: img("tee-a") },
      { nome: "Grafite", hex: "#1c1c1c", img: img("tee-b") },
    ],
    scheda: [
      ["Tessuto", "Cotone heavy jersey 240 g/m²"],
      ["Pezzi", "Davanti, dietro, 2 maniche, collo"],
      ["Collo", "Costina 1×1, 2,2 cm"],
      ["Cuciture", "Doppio ago, 38"],
      ["Stampa", "Serigrafia a 3 passaggi"],
      ["Origine", "Made in Italy [dimostrativo]"],
    ],
    strati: [
      { label: "Davanti", img: img("tee-a") },
      { label: "Tessuto 240 g/m²", img: "/media/fab-jersey.webp" },
      { label: "Dietro", img: img("tee-back") },
    ],
    pagina: true,
  },
  {
    slug: "sovracamicia-cotta",
    codice: "ORD-OVS-01",
    nome: "Sovracamicia Cotta",
    categoria: "Sovracamicia",
    prezzo: 340,
    materiale: "Lana cotta",
    grammatura: "560 g/m²",
    descrizione: "Lana follata a caldo finché il tessuto non si chiude su sé stesso. Bordi a vivo, niente fodera.",
    retro: img("overshirt-back"),
    colorway: [
      { nome: "Antracite", hex: "#2b2b2b", img: img("overshirt-a") },
      { nome: "Cammello", hex: "#a9825a", img: img("overshirt-b") },
    ],
    scheda: [
      ["Tessuto", "Lana cotta 560 g/m²"],
      ["Bottoni", "Corno, 7"],
      ["Tasche", "2 a toppa con pattina"],
      ["Bordi", "A vivo"],
      ["Cuciture", "96"],
      ["Origine", "Made in Italy [dimostrativo]"],
    ],
    strati: [
      { label: "Davanti", img: img("overshirt-a") },
      { label: "Lana cotta 560 g/m²", img: "/media/fab-lana.webp" },
      { label: "Dietro", img: img("overshirt-back") },
    ],
    pagina: true,
  },
  {
    slug: "pantalone-cimosa",
    codice: "ORD-PNT-01",
    nome: "Pantalone Cimosa",
    categoria: "Pantalone tecnico",
    prezzo: 260,
    materiale: "Nylon ripstop",
    grammatura: "210 g/m²",
    descrizione: "Ginocchia articolate, tasca cargo con zip, coulisse all'orlo.",
    retro: img("pants-back"),
    colorway: [
      { nome: "Grafite", hex: "#1a1a1a", img: img("pants-a") },
      { nome: "Gesso", hex: "#9a968e", img: img("pants-b") },
    ],
    scheda: [],
    strati: [],
    pagina: false,
  },
  {
    slug: "gilet-imbottitura",
    codice: "ORD-GLT-01",
    nome: "Gilet Imbottitura",
    categoria: "Gilet",
    prezzo: 290,
    materiale: "Nylon ripstop",
    grammatura: "120 g",
    descrizione: "Trapuntatura a rombi da 6 cm, collo alto, zip a doppio cursore.",
    retro: img("gilet-back"),
    colorway: [
      { nome: "Grafite", hex: "#1a1a1a", img: img("gilet-a") },
      { nome: "Filo", hex: "#e8432e", img: img("gilet-b") },
    ],
    scheda: [],
    strati: [],
    pagina: false,
  },
  {
    slug: "felpa-ordito",
    codice: "ORD-HDY-01",
    nome: "Felpa Ordito",
    categoria: "Felpa",
    prezzo: 160,
    materiale: "Felpa garzata",
    grammatura: "460 g/m²",
    descrizione: "Cappuccio doppio strato, coulisse piatte con puntali rossi.",
    retro: img("hoodie-back"),
    colorway: [
      { nome: "Grafite", hex: "#2a2a2a", img: img("hoodie-a") },
      { nome: "Carta", hex: "#ede8dd", img: img("hoodie-b") },
    ],
    scheda: [],
    strati: [],
    pagina: false,
  },
];

export const getCapo = (slug: string) => CAPI.find((c) => c.slug === slug);

export const size = (src: string): [number, number] => {
  const key = src.replace(/^\/media\//, "") as keyof typeof sizes;
  return (sizes[key] as [number, number] | undefined) ?? [1100, 1475];
};

export const euro = (n: number) => `€ ${n.toLocaleString("it-IT")}`;
