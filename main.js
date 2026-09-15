const DESIGN_W = 1920;
const DESIGN_H = 1080;
const ICONS = "./assets/icons/";

const $ = (sel) => document.querySelector(sel);
const stage = $("#stage");
const bgLayer = $("#bg-layer");
const copyRoot = $("#copy");
const glassEls = [...document.querySelectorAll(".glass")];
const brandForum = $("#brand-forum");
const brandNinety = $("#brand-ninety");
const navArrows = $("#nav-arrows");
const prevBtn = $("#prev");
const nextBtn = $("#next");
const counter = $("#counter");
const langToggle = $("#lang-toggle");
const gearBtn = $("#gear");
const fullscreenBtn = $("#fullscreen");
const help = $("#help");
const helpBtn = $("#help-button");
const notice = $("#notice");

const particles = new ParticleSystem($("#particles"));

const storedLang = (() => {
  try {
    return localStorage.getItem("forum-lang");
  } catch {
    return null;
  }
})();

let lang = storedLang === "es" || storedLang === "pt" ? storedLang : CONFIG.defaultLanguage;
let index = 0;
let currentBgKey = "";

// ---------- Escala del lienzo 1920 × 1080 ----------

function fit() {
  const scale = Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H);
  stage.style.setProperty("--scale", scale);
  particles.resize(scale);
}

// ---------- Construcción de cada diapositiva ----------

const px = (v) => `${v}px`;
const move = (el, x, y) => {
  el.style.transform = `translate(${x}px, ${y}px)`;
};

function setBackground(slide) {
  const key = slide.bg.image || slide.bg.css;
  if (key === currentBgKey) return;
  currentBgKey = key;
  const layer = document.createElement("div");
  if (slide.bg.image) layer.style.backgroundImage = `url("${slide.bg.image}")`;
  else layer.style.background = slide.bg.css;
  bgLayer.append(layer);
  requestAnimationFrame(() => requestAnimationFrame(() => layer.classList.add("is-visible")));
  const old = [...bgLayer.children].filter((el) => el !== layer);
  window.setTimeout(() => old.forEach((el) => el.remove()), CONFIG.transition * 1000 + 100);
}

function setPanels(slide) {
  glassEls.forEach((el, k) => {
    const p = slide.panels[k];
    if (!p) {
      el.classList.remove("is-visible");
      return;
    }
    el.style.left = px(p.x);
    el.style.top = px(p.y);
    el.style.width = px(p.w);
    el.style.height = px(p.h);
    el.style.borderRadius = p.r.map(px).join(" ");
    el.style.setProperty("--blur", px(p.blur * 0.75));
    el.style.background = p.fill || "";
    el.classList.add("is-visible");
  });
}

function buildText(block, language = lang) {
  const el = document.createElement("p");
  el.className = "t";
  el.style.top = px(block.y);
  if (block.size) {
    el.style.fontSize = px(block.size);
    el.dataset.size = block.size;
  }
  if (block.color) el.style.color = block.color;
  if (block.weight) el.style.fontWeight = block.weight;
  if (block.nowrap) el.classList.add("t--nowrap");

  if (block.right !== undefined) {
    el.classList.add("t--right");
    el.style.left = px(block.right - block.w);
    el.style.width = px(block.w);
  } else if (block.cx !== undefined) {
    el.classList.add("t--center");
    el.style.left = px(block.cx);
    if (block.w) el.style.width = px(block.w);
  } else {
    el.style.left = px(block.x);
    if (block.w) el.style.width = px(block.w);
  }

  const target = block.link === "social"
    ? Object.assign(document.createElement("a"), { href: CONFIG.qr.socialUrl, target: "_blank", rel: "noopener noreferrer" })
    : el;

  for (const part of block.parts) {
    const span = document.createElement("span");
    span.textContent = part[language] ?? part.es;
    if (part.color) span.style.color = part.color;
    if (part.size) {
      span.style.fontSize = px(part.size);
      span.dataset.size = part.size;
    }
    target.append(span);
    if (part.br) target.append(document.createElement("br"));
  }
  if (target !== el) el.append(target);
  return el;
}

function buildCopy(slide) {
  const set = document.createElement("div");
  set.className = "copy-set";
  for (const block of slide.texts) set.append(buildText(block));
  for (const img of slide.images || []) {
    const link = Object.assign(document.createElement("a"), { href: CONFIG.qr.socialUrl, target: "_blank", rel: "noopener noreferrer" });
    const el = Object.assign(document.createElement("img"), { className: "copy-img", src: CONFIG.qr.socialImage, alt: "Código QR @centrodeeventosupb" });
    Object.assign(el.style, { left: px(img.x), top: px(img.y), width: px(img.w), height: px(img.h) });
    link.append(el);
    set.append(link);
  }
  return set;
}

// El diseño de Figma está hecho en español. En otro idioma, cada bloque de texto se reduce
// lo necesario para ocupar como máximo el mismo alto y ancho que ocupa en español, así la
// composición no se desborda ni se monta sobre la navegación.
const referenceCache = new Map();

// Ancho real de las líneas (no de la caja): así un texto alineado a la derecha no se sale
// del panel aunque su caja siga midiendo lo mismo.
function contentWidth(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const scale = stage.getBoundingClientRect().width / DESIGN_W || 1;
  return range.getBoundingClientRect().width / scale;
}

function referenceBox(block) {
  if (referenceCache.has(block)) return referenceCache.get(block);
  const el = buildText(block, "es");
  el.style.visibility = "hidden";
  copyRoot.append(el);
  const box = { w: contentWidth(el), h: el.offsetHeight };
  el.remove();
  if (document.fonts.status === "loaded") referenceCache.set(block, box);
  return box;
}

function scaleText(el, scale) {
  for (const node of [el, ...el.querySelectorAll("[data-size]")]) {
    if (node.dataset.size) node.style.fontSize = px(Number(node.dataset.size) * scale);
  }
}

function fitCopy(set, slide) {
  if (lang === "es") return;
  set.querySelectorAll(".t").forEach((el, k) => {
    const ref = referenceBox(slide.texts[k]);
    let scale = 1;
    while (scale > 0.6 && (el.offsetHeight > ref.h + 2 || contentWidth(el) > ref.w + 2)) {
      scale -= 0.02;
      scaleText(el, scale);
    }
  });
}

function setCopy(slide, animate = true) {
  const next = buildCopy(slide);
  const old = [...copyRoot.children];
  copyRoot.append(next);
  fitCopy(next, slide);
  if (animate) {
    old.forEach((el) => {
      el.classList.remove("is-visible");
      el.classList.add("is-leaving");
    });
    requestAnimationFrame(() => requestAnimationFrame(() => next.classList.add("is-visible")));
    window.setTimeout(() => old.forEach((el) => el.remove()), 400);
  } else {
    old.forEach((el) => el.remove());
    next.classList.add("is-visible");
    next.style.transitionDelay = "0s";
  }
}

// La navegación en Figma aparece de dos formas: repartida (diapositiva 1)
// o apilada bajo el texto (flechas arriba, engranaje y pantalla completa abajo).
function setNav(slide) {
  const nav = slide.nav;
  if (nav.stack) {
    const { x, y, gap } = nav.stack;
    const row2 = y + 61 + gap;
    move(navArrows, x + 210.5, y);
    move(langToggle, x, row2 + 5);
    move(fullscreenBtn, x + 421 - 62, row2);
  } else {
    move(navArrows, nav.arrows.cx, nav.arrows.y);
    move(langToggle, nav.gear.x, nav.gear.y);
    move(fullscreenBtn, nav.fullscreen.x, nav.fullscreen.y);
  }
  move(brandForum, slide.brand.forum.x, slide.brand.forum.y);
  move(brandNinety, slide.brand.ninety.x, slide.brand.ninety.y);

  const first = index === 0;
  const last = index === SLIDES.length - 1;
  prevBtn.disabled = first;
  nextBtn.disabled = last;
  prevBtn.querySelector("img").src = ICONS + (first ? "arrow-left-slide1.svg" : "arrow-left.svg");
  nextBtn.querySelector("img").src = ICONS + (last ? "arrow-right-last.svg" : "arrow-right.svg");
  counter.textContent = `${index + 1}/${SLIDES.length}`;
}

// Zonas desde donde nacen las partículas al entrar a una diapositiva: los paneles de vidrio
// (recortados a la pantalla) o, si la diapositiva no tiene panel, los bloques de texto.
function birthAreas(slide) {
  const clip = (r) => {
    const x0 = Math.max(0, r.x);
    const y0 = Math.max(0, r.y);
    const x1 = Math.min(DESIGN_W, r.x + r.w);
    const y1 = Math.min(DESIGN_H, r.y + r.h);
    return x1 - x0 > 20 && y1 - y0 > 20 ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
  };
  if (slide.birth) return slide.birth.map(clip).filter(Boolean);
  if (slide.panels.length) return slide.panels.map(clip).filter(Boolean);
  const stageRect = stage.getBoundingClientRect();
  const scale = stageRect.width / DESIGN_W;
  const set = copyRoot.lastElementChild;
  return [...set.querySelectorAll(".t")]
    .map((el) => {
      const r = el.getBoundingClientRect();
      return clip({ x: (r.left - stageRect.left) / scale, y: (r.top - stageRect.top) / scale, w: r.width / scale, h: r.height / scale });
    })
    .filter(Boolean);
}

function go(i, { animate = true } = {}) {
  const nextIndex = Math.max(0, Math.min(SLIDES.length - 1, i));
  if (nextIndex === index && animate) return;
  index = nextIndex;
  const slide = SLIDES[index];
  stage.dataset.slide = slide.id;
  stage.classList.toggle("is-light", Boolean(slide.light));
  stage.classList.toggle("particles-front", Boolean(slide.particlesFront));
  setBackground(slide);
  setPanels(slide);
  setCopy(slide, animate);
  setNav(slide);
  particles.setScene(slide.scene, birthAreas(slide));
  if (location.hash !== `#${index + 1}`) history.replaceState(null, "", `#${index + 1}`);
}

// ---------- Idioma y ayuda ----------

function applyLanguage(nextLang) {
  lang = nextLang;
  try {
    localStorage.setItem("forum-lang", lang);
  } catch {}
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "es";
  langToggle.dataset.lang = lang;
  const ui = UI_COPY[lang];
  help.querySelectorAll(".help__chip").forEach((chip, k) => {
    chip.textContent = ui.help[k];
  });
  setCopy(SLIDES[index], false);
}

function toggle(el, button, force) {
  const open = force ?? !el.classList.contains("is-open");
  el.classList.toggle("is-open", open);
  button.setAttribute("aria-expanded", String(open));
}

let noticeTimer = 0;
function showNotice(text) {
  notice.textContent = text;
  notice.classList.add("is-visible");
  window.clearTimeout(noticeTimer);
  noticeTimer = window.setTimeout(() => notice.classList.remove("is-visible"), 4200);
}

async function toggleFullscreen() {
  const root = document.documentElement;
  try {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) await document.exitFullscreen();
      else document.webkitExitFullscreen();
    } else if (root.requestFullscreen) {
      // algunos navegadores integrados dejan la petición sin respuesta: se espera como máximo 1,5 s
      await Promise.race([
        root.requestFullscreen({ navigationUI: "hide" }),
        new Promise((_, reject) => window.setTimeout(() => {
          if (!document.fullscreenElement) reject(new Error("sin respuesta"));
        }, 1500)),
      ]);
    } else if (root.webkitRequestFullscreen) {
      root.webkitRequestFullscreen();
    } else {
      throw new Error("Fullscreen API no disponible");
    }
  } catch {
    showNotice(UI_COPY[lang].fullscreenBlocked);
  }
}

// ---------- Eventos ----------

prevBtn.addEventListener("click", () => go(index - 1));
nextBtn.addEventListener("click", () => go(index + 1));
fullscreenBtn.addEventListener("click", toggleFullscreen);
gearBtn.addEventListener("click", () => toggle(langToggle, gearBtn));
helpBtn.addEventListener("click", () => toggle(help, helpBtn));
langToggle.querySelectorAll("[data-lang]").forEach((btn) => {
  btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
});

window.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  const key = event.key.toLowerCase();
  if (key === "arrowright" || key === " " || key === "pagedown") {
    event.preventDefault();
    go(index + 1);
  } else if (key === "arrowleft" || key === "pageup") {
    event.preventDefault();
    go(index - 1);
  } else if (key === "f") {
    toggleFullscreen();
  } else if (key === "h") {
    toggle(help, helpBtn);
  } else if (key === "r") {
    go(0);
  }
});

let touchX = 0;
stage.addEventListener("touchstart", (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
stage.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 42) go(index + (dx < 0 ? 1 : -1));
});

window.addEventListener("resize", fit);
document.addEventListener("fullscreenchange", fit);
document.addEventListener("webkitfullscreenchange", fit);
document.fonts.ready.then(() => {
  referenceCache.clear();
  setCopy(SLIDES[index], false);
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
index = -1;
go(Number.isFinite(startAt) ? startAt - 1 : 0, { animate: false });
requestAnimationFrame(loop);
