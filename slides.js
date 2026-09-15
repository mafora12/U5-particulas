// Contenido y composición de las 13 diapositivas.
// Todas las medidas están en píxeles del lienzo de Figma (1920 × 1080).
// Los textos están separados por idioma (es / pt) para poder cambiarlos sin tocar el código.

const C = {
  ink: "#f4f3ef",
  ink78: "rgba(244, 243, 239, 0.78)",
  blue: "#2457ff",
  cyan: "#65e6e2",
  violet: "#6655ee",
  pink: "#ff4fa3",
  lilac: "#ae71ff",
  aqua: "#a1fffc",
};

// Fondos radiales de las diapositivas 9, 10 y 11 (traducidos del gradiente de Figma).
const radial = (stops, base = "") =>
  `radial-gradient(1338px 892px at 955px 613px, ${stops})${base ? `, ${base}` : ""}`;

// Marca a la derecha (todas menos la 1).
const BRAND_RIGHT = { forum: { x: 1393, y: 39 }, ninety: { x: 1824, y: 23 } };

window.SLIDES = [
  // 1 · Relevo generacional
  {
    id: "relevo",
    scene: "latente",
    bg: { image: "./assets/slides/bg-01.webp" },
    brand: { forum: { x: 24, y: 36 }, ninety: { x: 455, y: 20 } },
    panels: [{ x: 1229, y: 0, w: 691, h: 1341, r: [200, 0, 0, 0], blur: 38 }],
    texts: [
      {
        x: 1594, y: 452, weight: 500, size: 32, color: C.aqua, nowrap: true,
        parts: [{ es: "@centrodeeventosupb", pt: "@centrodeeventosupb" }],
      },
      {
        // caja limitada al ancho interior del vidrio (panel desde x = 1229)
        right: 1884, y: 493, w: 620, size: 80, align: "right",
        parts: [
          { es: "RELEVO GENERACIONAL:", pt: "RELEVO GERACIONAL:", color: C.blue, br: true },
          { es: "LA VENTAJA QUE NADIE ESTÁ APROVECHANDO", pt: "A VANTAGEM QUE NINGUÉM ESTÁ APROVEITANDO" },
        ],
      },
    ],
    nav: { arrows: { cx: 1556, y: 939 }, gear: { x: 1259, y: 1003 }, fullscreen: { x: 1840, y: 998 } },
  },

  // 2 · Auditorio solo para grados
  {
    id: "auditorio",
    scene: "auditorio",
    bg: { image: "./assets/slides/bg-02.webp" },
    brand: { forum: { x: 1396, y: 27 }, ninety: { x: 1827, y: 11 } },
    panels: [{ x: 115, y: 54, w: 575, h: 931, r: [255, 255, 255, 255], blur: 66 }],
    texts: [
      {
        cx: 408.5, y: 347, w: 505, size: 80,
        parts: [{ es: "¿Un gran auditorio solo para hacer grados?", pt: "Um grande auditório apenas para formaturas?" }],
      },
    ],
    nav: { stack: { x: 192, y: 735, gap: 22 } },
  },

  // 3 · La Universidad decidió encontrarse con el mundo
  {
    id: "encuentro",
    scene: "encuentro",
    bg: { image: "./assets/slides/bg-03.webp" },
    brand: BRAND_RIGHT,
    panels: [],
    texts: [
      {
        cx: 963.5, y: 341, w: 475, size: 48,
        parts: [{ es: "Los eventos no llegaron a la Universidad.", pt: "Os eventos não chegaram à Universidade." }],
      },
      {
        cx: 973, y: 459, w: 706, size: 80, color: C.lilac,
        parts: [{ es: "La Universidad decidió encontrarse con el mundo.", pt: "A Universidade decidiu se encontrar com o mundo." }],
      },
    ],
    nav: { stack: { x: 745, y: 748, gap: 22 } },
  },

  // 4 · Academia + Industria + Ciudad
  {
    id: "triada",
    scene: "triada",
    bg: { image: "./assets/slides/bg-04.webp" },
    brand: BRAND_RIGHT,
    panels: [{ x: 914, y: 505, w: 1342, h: 575, r: [255, 255, 255, 255], blur: 45, fill: "transparent" }],
    texts: [
      {
        cx: 1523.5, y: 639, w: 521, size: 80,
        parts: [
          { es: "Academia ", pt: "Academia " },
          { es: "+", pt: "+", color: C.blue },
          { es: " Industria ", pt: " Indústria " },
          { es: "+", pt: "+", color: C.blue },
          { es: " Ciudad", pt: " Cidade" },
        ],
      },
    ],
    nav: { stack: { x: 1301, y: 910, gap: 22 } },
  },

  // 5 · El impacto sí
  {
    id: "impacto",
    scene: "impacto",
    bg: { image: "./assets/slides/bg-05.webp" },
    brand: BRAND_RIGHT,
    panels: [{ x: 75, y: 39, w: 675, h: 885, r: [150, 150, 52, 150], blur: 72 }],
    texts: [
      {
        cx: 421.5, y: 359, w: 555, size: 64, color: C.ink78,
        parts: [{ es: "Los eventos nunca fueron el objetivo", pt: "Os eventos nunca foram o objetivo" }],
      },
      {
        cx: 415, y: 499, size: 96, color: C.blue, nowrap: true,
        parts: [{ es: "El impacto sí.", pt: "O impacto, sim." }],
      },
    ],
    nav: { stack: { x: 211, y: 767, gap: 0 } },
  },

  // 6 · Comunidad
  {
    id: "comunidad",
    scene: "comunidad",
    bg: { image: "./assets/slides/bg-06.webp" },
    brand: BRAND_RIGHT,
    panels: [],
    texts: [
      {
        cx: 1017.5, y: 295, size: 64, color: C.ink78, nowrap: true,
        parts: [{ es: "Un evento trae personas.", pt: "Um evento traz pessoas." }],
      },
      {
        cx: 1022.5, y: 370, w: 817, size: 96, color: C.pink,
        parts: [{ es: "Una comunidad trae transformación.", pt: "Uma comunidade traz transformação." }],
      },
    ],
    nav: { stack: { x: 812, y: 618, gap: 0 } },
  },

  // 7 · Confianza
  {
    id: "confianza",
    scene: "confianza",
    bg: { image: "./assets/slides/bg-07.webp" },
    brand: BRAND_RIGHT,
    panels: [{ x: 75, y: -340, w: 675, h: 1294, r: [150, 150, 150, 150], blur: 72 }],
    texts: [
      {
        cx: 412.5, y: 287, w: 577, size: 96,
        parts: [
          { es: "El talento crece a la velocidad de ", pt: "O talento cresce na velocidade " },
          { es: "la confianza.", pt: "da confiança.", color: C.cyan },
        ],
      },
    ],
    nav: { stack: { x: 202, y: 792, gap: 0 } },
  },

  // 8 · Nuevas rutas
  {
    id: "rutas",
    scene: "rutas",
    bg: { image: "./assets/slides/bg-08.webp" },
    brand: BRAND_RIGHT,
    panels: [{ x: 75, y: 115, w: 1166, h: 839, r: [150, 150, 150, 150], blur: 72 }],
    // las partículas nacen entre el texto y la navegación y se dibujan encima del vidrio
    birth: [{ x: 160, y: 585, w: 1000, h: 180 }],
    particlesFront: true,
    texts: [
      {
        cx: 677, y: 281, w: 1052,
        parts: [
          { es: "La experiencia construye el camino.", pt: "A experiência constrói o caminho.", size: 48, br: true },
          { es: "Las nuevas generaciones descubren nuevas rutas.", pt: "As novas gerações descobrem novas rotas.", size: 96, color: C.cyan },
        ],
      },
    ],
    nav: { stack: { x: 429, y: 792, gap: 0 } },
  },

  // 9 · Una visión. Dos generaciones.
  {
    id: "vision",
    scene: "vision",
    bg: { css: radial("rgb(9,24,74) 57.7%, rgb(22,32,78) 68.3%, rgb(35,41,82) 78.8%, rgb(62,58,89) 100%") },
    brand: BRAND_RIGHT,
    panels: [{ x: 37, y: 581, w: 1845, h: 839, r: [150, 150, 150, 150], blur: 72 }],
    texts: [
      {
        cx: 996, y: 649, w: 1052, size: 96,
        parts: [
          { es: "Una visión.", pt: "Uma visão.", br: true },
          { es: "Dos generaciones.", pt: "Duas gerações." },
        ],
      },
    ],
    nav: { stack: { x: 782, y: 912, gap: 0 } },
  },

  // 10 · Trabajan juntas
  {
    id: "juntas",
    scene: "juntas",
    bg: { css: radial("rgba(255,79,163,0.56) 0%, rgba(179,82,201,0.535) 50%, rgba(102,85,238,0.51) 100%", "#ffffff") },
    brand: BRAND_RIGHT,
    light: true,
    panels: [{ x: 1039, y: 229, w: 831, h: 839, r: [150, 150, 150, 150], blur: 72 }],
    texts: [
      {
        cx: 1456, y: 349, w: 524, size: 64, color: C.blue,
        parts: [
          { es: "El crecimiento no ocurre cuando una generación reemplaza a otra.", pt: "O crescimento não acontece quando uma geração substitui a outra.", br: true },
          { es: "Ocurre cuando trabajan juntas", pt: "Acontece quando trabalham juntas" },
          { es: ".", pt: ".", size: 48 },
        ],
      },
    ],
    nav: { stack: { x: 1244, y: 856, gap: 0 } },
  },

  // 11 · El presente joven
  {
    id: "presente",
    scene: "presente",
    bg: { css: radial("rgb(62,58,89) 23.6%, rgb(35,41,82) 61.8%, rgb(22,32,78) 80.9%, rgb(9,24,74) 100%") },
    brand: BRAND_RIGHT,
    panels: [{ x: 1039, y: 229, w: 831, h: 839, r: [150, 150, 150, 150], blur: 72 }],
    texts: [
      {
        cx: 1455, y: 438, w: 628,
        parts: [
          { es: "Los jóvenes no son el futuro.", pt: "Os jovens não são o futuro.", size: 48, color: C.blue, br: true },
          { es: "Son el presente que muchas organizaciones aún no ven.", pt: "São o presente que muitas organizações ainda não veem.", size: 64 },
        ],
      },
    ],
    nav: { stack: { x: 1244, y: 856, gap: 0 } },
  },

  // 12 · El futuro se construye
  {
    id: "futuro",
    scene: "construye",
    bg: { image: "./assets/slides/bg-12.webp" },
    brand: BRAND_RIGHT,
    panels: [{ x: 549, y: -317, w: 760, h: 930, r: [150, 150, 150, 150], blur: 72 }],
    texts: [
      {
        cx: 929, y: 77, w: 542, size: 96,
        parts: [
          { es: "El futuro no se hereda.", pt: "O futuro não se herda.", br: true },
          { es: "Se construye.", pt: "Ele se constrói." },
        ],
      },
    ],
    nav: { stack: { x: 718, y: 455, gap: 0 } },
  },

  // 13 · Cierre con QR
  {
    id: "cierre",
    scene: "continuidad",
    bg: { image: "./assets/slides/bg-13.webp" },
    brand: BRAND_RIGHT,
    panels: [
      { x: 42, y: 138, w: 760, h: 695, r: [150, 150, 150, 150], blur: 72 },
      { x: 1041, y: 138, w: 760, h: 695, r: [150, 150, 150, 150], blur: 72 },
      { x: 532, y: 872, w: 760, h: 163, r: [81, 81, 81, 81], blur: 72 },
    ],
    texts: [
      {
        cx: 416, y: 169, w: 542, size: 48, weight: 500, link: "mobile",
        parts: [{ es: "Versión para celular", pt: "Versão para celular" }],
      },
      {
        cx: 416, y: 706, w: 542, size: 48,
        parts: [
          { es: "Memorias", pt: "Memórias", br: true },
          { es: "(app móvil)", pt: "(app móvel)" },
        ],
      },
      {
        cx: 1414, y: 169, w: 542, size: 48, weight: 500,
        parts: [{ es: "Escanéame", pt: "Escaneie-me" }],
      },
      {
        cx: 1435, y: 758, w: 542, size: 48, link: "social",
        parts: [{ es: "@centrodeeventosupb", pt: "@centrodeeventosupb" }],
      },
    ],
    images: [
      { key: "mobile", x: 196, y: 239, w: 440, h: 440 },
      { key: "social", x: 1184, y: 239, w: 501, h: 501 },
    ],
    // En el celular no tiene sentido escanear un QR con el mismo teléfono: se muestran enlaces.
    mobile: {
      texts: [
        { size: 48, weight: 500, parts: [{ es: "Sigue conectado con", pt: "Continue conectado com" }] },
        { size: 64, link: "social", color: C.cyan, parts: [{ es: "@centrodeeventosupb", pt: "@centrodeeventosupb" }] },
        { size: 40, parts: [{ es: "Memorias (app móvil)", pt: "Memórias (app móvel)" }] },
      ],
    },
    nav: { stack: { x: 722, y: 892, gap: 0 } },
  },
];

window.UI_COPY = {
  es: {
    help: ["Espacio / → avanzar", "← volver", "H ayuda", "R reiniciar"],
    languages: { es: "Esp", pt: "Por" },
    fullscreenBlocked: "Este navegador bloqueó la pantalla completa. Presiona F11 o abre la presentación en Chrome.",
  },
  pt: {
    help: ["Espaço / → avançar", "← voltar", "H ajuda", "R reiniciar"],
    languages: { es: "Esp", pt: "Por" },
    fullscreenBlocked: "Este navegador bloqueou a tela cheia. Pressione F11 ou abra a apresentação no Chrome.",
  },
};
