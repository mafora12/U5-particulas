// Versión para celular. Usa los mismos textos (slides.js), el mismo motor de partículas
// (particles.js) y la misma configuración (config.js) que la presentación de escritorio.

const DESIGN_W = 1920;
const DESIGN_H = 1080;
const ICONS = "./assets/icons/";

const $ = (sel) => document.querySelector(sel);
const app = $("#app");
const bgLayer = $("#bg");
const card = $("#card");
const glass = $("#glass");
const prevBtn = $("#prev");
const nextBtn = $("#next");
const counter = $("#counter");
const langToggle = $("#lang-toggle");
const gearBtn = $("#gear");
const fullscreenBtn = $("#fullscreen");
const hint = $("#hint");
const notice = $("#notice");

const particles = new ParticleSystem($("#particles"));
particles.sizeBoost = 1.35;
particles.lineBoost = 1.5;

const LINKS = {
  social: CONFIG.qr.socialUrl,
  mobile: CONFIG.qr.mobileUrl,
};

const MOBILE_COPY = {
  es: {
    swipe: "Desliza para avanzar",
    fullscreenBlocked: "Este navegador no permite pantalla completa.",
  },
  pt: {
    swipe: "Deslize para avançar",
    fullscreenBlocked: "Este navegador não permite tela cheia.",
  },
};

const storedLang = (() => {
  try {
    return localStorage.getItem("forum-lang");
  } catch {
    return null;
  }
})();

let lang = storedLang === "es" || storedLang === "pt" ? storedLang : CONFIG.defaultLanguage;
let index = -1;
let currentBg = "";

// ---------- Composición de cada diapositiva en el celular ----------

// La tarjeta se ubica arriba, al centro o abajo según dónde está el texto en el diseño de Figma.
function anchorFor(slide) {
  const ys = slide.texts.map((t) => t.y);
  const center = (Math.min(...ys) + Math.max(...ys) + 150) / 2;
  if (center < 380) return "top";
  if (center > 650) return "bottom";
  return "center";
}

// Radios del panel de Figma reducidos a escala de celular, conservando su forma.
function radiiFor(panel) {
  return panel.r.map((r) => (r > 0 ? Math.max(20, Math.min(56, r * 0.24)) : 10));
}

function textsFor(slide) {
  return slide.mobile?.texts || slide.texts;
}

function buildText(block) {
  const el = document.createElement("p");
  el.className = "m-t";
  el.style.setProperty("--fs", block.size || 48);
  if (block.color) el.style.color = block.color;
  if (block.weight) el.style.fontWeight = block.weight;

  const target = block.link
    ? Object.assign(document.createElement("a"), { href: LINKS[block.link], target: "_blank", rel: "noopener noreferrer" })
    : el;

  for (const part of block.parts) {
    const span = document.createElement("span");
    span.textContent = part[lang] ?? part.es;
    if (part.color) span.style.color = part.color;
    if (part.size) {
      span.dataset.size = part.size;
      span.style.setProperty("--fs", part.size);
    }
    target.append(span);
    if (part.br) target.append(document.createElement("br"));
  }
  if (target !== el) el.append(target);
  return el;
}

function setBackground(slide) {
  const key = slide.bg.image || slide.bg.css;
  if (key === currentBg) return;
  currentBg = key;
  const layer = document.createElement("div");
  if (slide.bg.image) layer.style.backgroundImage = `url("${slide.bg.image}")`;
  else layer.style.background = slide.bg.css;
  bgLayer.append(layer);
  requestAnimationFrame(() => requestAnimationFrame(() => layer.classList.add("is-visible")));
  const old = [...bgLayer.children].filter((el) => el !== layer);
  window.setTimeout(() => old.forEach((el) => el.remove()), 900);
}

// Tamaño de letra: proporcional al ancho de la pantalla y reducido si la tarjeta no cabe.
function fitCard() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const landscape = w > h;
  let k = landscape ? Math.min(0.5, Math.max(0.26, h / 1100)) : Math.min(0.55, Math.max(0.3, w / 980));
  const styles = getComputedStyle(document.documentElement);
  const top = parseFloat(styles.getPropertyValue("--top")) || 64;
  const bottom = parseFloat(styles.getPropertyValue("--bottom")) || 84;
  const available = h - top - bottom - 24;
  card.style.setProperty("--k", k);
  while (card.scrollHeight > available && k > 0.2) {
    k -= 0.01;
    card.style.setProperty("--k", k);
  }
}

// El vidrio copia la posición de la tarjeta (sin su pequeño desplazamiento de entrada).
function cardRect() {
  const r = card.getBoundingClientRect();
  const matrix = new DOMMatrixReadOnly(getComputedStyle(card).transform);
  return { x: r.left - matrix.m41, y: r.top - matrix.m42, w: r.width, h: r.height };
}

function placeGlass(slide) {
  const panel = slide.panels[0];
  if (!panel) {
    // diapositivas sin panel en Figma (3 y 6): el texto va sin vidrio
    glass.classList.remove("is-visible");
    return;
  }
  const rect = cardRect();
  Object.assign(glass.style, {
    left: `${rect.x}px`,
    top: `${rect.y}px`,
    width: `${rect.w}px`,
    height: `${rect.h}px`,
    borderRadius: radiiFor(panel).map((v) => `${v}px`).join(" "),
    background: panel.fill || "",
  });
  glass.style.setProperty("--blur", `${Math.round(panel.blur * 0.45)}px`);
  glass.classList.add("is-visible");
}

// Las partículas nacen dentro de la tarjeta de vidrio (en coordenadas de la escena).
function birthAreas() {
  const rect = cardRect();
  const sx = DESIGN_W / window.innerWidth;
  const sy = DESIGN_H / window.innerHeight;
  return [{ x: rect.x * sx, y: rect.y * sy, w: rect.w * sx, h: rect.h * sy }];
}

function render(slide, { animate = true } = {}) {
  const build = () => {
    card.replaceChildren(...textsFor(slide).map(buildText));
    card.dataset.anchor = anchorFor(slide);
    card.dataset.align = slide.texts.some((t) => t.align === "right") ? "right" : "center";
    fitCard();
    placeGlass(slide);
    requestAnimationFrame(() => card.classList.add("is-visible"));
  };
  if (animate && card.classList.contains("is-visible")) {
    card.classList.remove("is-visible");
    window.setTimeout(build, 250);
  } else {
    build();
  }
}

function go(i, { animate = true } = {}) {
  const next = Math.max(0, Math.min(SLIDES.length - 1, i));
  if (next === index) return;
  index = next;
  const slide = SLIDES[index];
  app.classList.toggle("particles-front", Boolean(slide.particlesFront));
  setBackground(slide);
  render(slide, { animate });

  const first = index === 0;
  const last = index === SLIDES.length - 1;
  prevBtn.disabled = first;
  nextBtn.disabled = last;
  prevBtn.querySelector("img").src = ICONS + (first ? "arrow-left-slide1.svg" : "arrow-left.svg");
  nextBtn.querySelector("img").src = ICONS + (last ? "arrow-right-last.svg" : "arrow-right.svg");
  counter.textContent = `${index + 1}/${SLIDES.length}`;

  // se espera a que la tarjeta esté ubicada para que las partículas nazcan de ella
  window.setTimeout(() => particles.setScene(slide.scene, birthAreas()), animate ? 280 : 30);
  if (location.hash !== `#${index + 1}`) history.replaceState(null, "", `#${index + 1}`);
}

// ---------- Idioma, pantalla completa y avisos ----------

function applyLanguage(nextLang) {
  lang = nextLang;
  try {
    localStorage.setItem("forum-lang", lang);
  } catch {}
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "es";
  langToggle.dataset.lang = lang;
  if (index >= 0) render(SLIDES[index], { animate: false });
}

function showHint(el, text, ms = 3200) {
  el.textContent = text;
  el.classList.add("is-visible");
  window.setTimeout(() => el.classList.remove("is-visible"), ms);
}

const canFullscreen = Boolean(document.fullscreenEnabled || document.webkitFullscreenEnabled);
fullscreenBtn.hidden = !canFullscreen;

async function toggleFullscreen() {
  const root = document.documentElement;
  try {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) await document.exitFullscreen();
      else document.webkitExitFullscreen();
    } else if (root.requestFullscreen) {
      await Promise.race([
        root.requestFullscreen({ navigationUI: "hide" }),
        new Promise((_, reject) => window.setTimeout(() => {
          if (!document.fullscreenElement) reject(new Error("sin respuesta"));
        }, 1500)),
      ]);
    } else {
      root.webkitRequestFullscreen();
    }
  } catch {
    showHint(notice, MOBILE_COPY[lang].fullscreenBlocked);
  }
}

function fit() {
  particles.resizeView(window.innerWidth, window.innerHeight);
  if (index >= 0) {
    fitCard();
    placeGlass(SLIDES[index]);
  }
}

// ---------- Eventos ----------

prevBtn.addEventListener("click", () => go(index - 1));
nextBtn.addEventListener("click", () => go(index + 1));
fullscreenBtn.addEventListener("click", toggleFullscreen);
gearBtn.addEventListener("click", () => {
  const open = !langToggle.classList.contains("is-open");
  langToggle.classList.toggle("is-open", open);
  gearBtn.setAttribute("aria-expanded", String(open));
});
langToggle.querySelectorAll("[data-lang]").forEach((btn) => {
  btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
});

let touchX = 0;
let touchY = 0;
app.addEventListener("touchstart", (e) => {
  touchX = e.changedTouches[0].clientX;
  touchY = e.changedTouches[0].clientY;
}, { passive: true });
app.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - touchX;
  const dy = e.changedTouches[0].clientY - touchY;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
});

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (key === "arrowright" || key === " " || key === "pagedown") go(index + 1);
  else if (key === "arrowleft" || key === "pageup") go(index - 1);
});

window.addEventListener("resize", fit);
window.addEventListener("orientationchange", () => window.setTimeout(fit, 250));
document.addEventListener("fullscreenchange", fit);
document.fonts.ready.then(() => {
  if (index >= 0) render(SLIDES[index], { animate: false });
});
window.addEventListener("hashchange", () => {
  const n = parseInt(location.hash.slice(1), 10);
  if (n) go(n - 1);
});

// ---------- Arranque ----------

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  particles.step(dt);
  particles.draw();
  requestAnimationFrame(loop);
}

fit();
applyLanguage(lang);
const startAt = parseInt(location.hash.slice(1), 10);
go(Number.isFinite(startAt) ? startAt - 1 : 0, { animate: false });
window.setTimeout(() => showHint(hint, MOBILE_COPY[lang].swipe), 900);
requestAnimationFrame(loop);
