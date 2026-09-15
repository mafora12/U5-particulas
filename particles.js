// Sistema de partículas de la presentación.
//
// Gramática visual (ver DECISIONES_SISTEMA_VISUAL.md):
//   · Partícula      = una persona.
//   · Generación     = "experiencia" (grande, lenta, violeta/azul) o "joven" (pequeña, rápida, cian/rosa).
//   · Vínculo        = relación. Crece con la cercanía sostenida (convivencia) y se debilita con la distancia.
//   · Brillo         = ser visto / ser valorado.
//   · Onda           = impacto que se propaga.
//   · Rastro         = camino recorrido.
//
// Las partículas son las mismas durante toda la charla: al cambiar de diapositiva no se
// reinician, se reorganizan. La estructura cambia; las personas permanecen.

(() => {
  const W = 1920;
  const H = 1080;
  const TAU = Math.PI * 2;

  const PAL = {
    ink: [244, 243, 239],
    white: [255, 255, 255],
    blue: [36, 87, 255],
    cyan: [101, 230, 226],
    violet: [102, 85, 238],
    pink: [255, 79, 163],
    lilac: [174, 113, 255],
    grey: [150, 150, 170],
  };

  const COUNT = { exp: 70, young: 130, child: 50 };

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => {
    t = clamp(t, 0, 1);
    return t * t * (3 - 2 * t);
  };
  const mix = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
  const hash = (n) => {
    const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(3)})`;

  class Particle {
    constructor(i, gen) {
      this.i = i;
      this.gen = gen;
      this.h1 = hash(i + 1);
      this.h2 = hash(i * 3.7 + 11);
      this.h3 = hash(i * 7.3 + 29);
      this.x = this.h1 * W;
      this.y = this.h2 * H;
      this.vx = 0;
      this.vy = 0;
      this.base = gen === "exp" ? 4.4 : gen === "young" ? 2.7 : 2.2;
      this.r = this.base;
      this.col = [...PAL.ink];
      this.a = 0;
      this.glow = 0;
      this.deg = 0;
      this.reset();
    }

    // Valores objetivo que cada escena reescribe en cada cuadro.
    reset() {
      this.active = true;
      this.tx = this.x;
      this.ty = this.y;
      this.k = 0.006;
      this.fr = 0.9;
      this.ta = 0.8;
      this.ts = 1;
      this.tc = PAL.ink;
      this.ax = 0;
      this.ay = 0;
    }

    off() {
      this.active = false;
      this.ta = 0;
      this.k = 0.002;
      this.ax = 0;
      this.ay = 0;
    }
  }

  // Curva Catmull-Rom para los caminos de la diapositiva 8.
  function catmull(points, u) {
    const n = points.length - 1;
    const s = clamp(u, 0, 0.99999) * n;
    const i = Math.floor(s);
    const t = s - i;
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(n, i + 2)];
    const t2 = t * t;
    const t3 = t2 * t;
    const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
    return { x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) };
  }

  // El camino cruza el panel de vidrio por la franja libre entre el texto y la navegación
  // (y ≈ 580–770) y luego sube por la derecha.
  const ROUTE = [
    { x: -60, y: 690 },
    { x: 300, y: 665 },
    { x: 650, y: 690 },
    { x: 1000, y: 660 },
    { x: 1300, y: 610 },
    { x: 1560, y: 430 },
    { x: 1760, y: 260 },
    { x: 1990, y: 150 },
  ];
  const ROUTE_BAND = { x1: 1250, y0: 585, y1: 765 };

  // ---------------------------------------------------------------------------
  // Escenas: una por diapositiva. Cada una define qué relaciones existen y cómo
  // se comportan las partículas para comunicar la frase.
  // ---------------------------------------------------------------------------
  const SCENES = {
    // 1 · RELEVO GENERACIONAL: LA VENTAJA QUE NADIE ESTÁ APROVECHANDO
    // La experiencia ya está conectada alrededor del edificio. Los jóvenes existen,
    // dispersos y apagados. De vez en cuando la experiencia pasa un pulso de luz
    // (el relevo) a un joven: brilla un instante y vuelve a apagarse. Nadie lo aprovecha.
    latente: {
      link: { dist: 150, grow: 0.02, decay: 0.02, alpha: 0.45, rule: (p, q) => p.gen === "exp" && q.gen === "exp" },
      enter(sys) {
        sys.pulses = [];
        sys.nextPulse = 0.8;
      },
      update(sys, dt, t) {
        for (const p of sys.ps) {
          if (p.gen === "child") { p.off(); continue; }
          p.reset();
          if (p.gen === "exp") {
            const ang = p.h1 * TAU;
            const rad = Math.sqrt(p.h2);
            p.tx = 560 + Math.cos(ang) * 440 * rad + Math.sin(t * 0.3 + p.h3 * TAU) * 18;
            p.ty = 640 + Math.sin(ang) * 330 * rad + Math.cos(t * 0.27 + p.h3 * TAU) * 14;
            p.tc = p.h3 < 0.5 ? PAL.blue : PAL.violet;
            p.ta = 0.85;
          } else {
            p.tx = 30 + p.h1 * 1160 + Math.sin(t * 0.2 + p.h3 * 9) * 36;
            p.ty = 30 + p.h2 * 1020 + Math.cos(t * 0.23 + p.h1 * 9) * 36;
            p.tc = PAL.cyan;
            p.ta = 0.26 + p.glow * 0.74;
            p.ts = 1 + p.glow * 1.1;
            p.k = 0.004;
          }
        }
        sys.nextPulse -= dt;
        if (sys.nextPulse <= 0) {
          sys.nextPulse = 0.9 + Math.random() * 1.1;
          const exps = sys.byGen.exp;
          const a = exps[(Math.random() * exps.length) | 0];
          let best = null;
          let bestD = 380 * 380;
          for (const q of sys.byGen.young) {
            const d = (q.x - a.x) ** 2 + (q.y - a.y) ** 2;
            if (d < bestD && q.glow < 0.1) { bestD = d; best = q; }
          }
          if (best) sys.pulses.push({ a, b: best, t: 0 });
        }
        sys.pulses = sys.pulses.filter((pl) => {
          pl.t += dt / 1.2;
          if (pl.t >= 1) { pl.b.glow = 1; return false; }
          return true;
        });
      },
      draw(sys, ctx) {
        for (const pl of sys.pulses) {
          const { a, b } = pl;
          ctx.strokeStyle = rgba(PAL.cyan, 0.16 * (1 - pl.t * 0.5));
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          const e = smooth(pl.t);
          const x = lerp(a.x, b.x, e);
          const y = lerp(a.y, b.y, e);
          ctx.fillStyle = rgba(PAL.ink, 0.25);
          ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill();
          ctx.fillStyle = rgba(PAL.white, 0.95);
          ctx.beginPath(); ctx.arc(x, y, 2.6, 0, TAU); ctx.fill();
        }
      },
    },

    // 2 · ¿UN GRAN AUDITORIO SOLO PARA HACER GRADOS?
    // Todas las personas ocupan filas fijas, como en una ceremonia: una sola función.
    // Grupos lanzan su energía hacia arriba (los birretes) pero chocan con un techo
    // invisible y vuelven a su silla. Potencial contenido.
    auditorio: {
      link: { dist: 58, grow: 0.06, decay: 0.08, alpha: 0.5, rule: (p, q) => !p.air && !q.air },
      enter(sys) {
        sys.nextToss = 0.6;
        sys.tossColor = 0;
        const people = [...sys.byGen.exp, ...sys.byGen.young];
        const rows = 6;
        const perRow = Math.ceil(people.length / rows);
        people.forEach((p, k) => {
          const row = Math.floor(k / perRow);
          const col = (k % perRow) / (perRow - 1 || 1);
          const depth = row / (rows - 1);
          p.seatX = lerp(820 - depth * 70, 1860 + depth * 20, col) + (p.h1 - 0.5) * 14;
          p.seatY = 700 + row * 62 + (p.h2 - 0.5) * 8;
          p.seatS = 0.75 + depth * 0.45;
          p.air = false;
        });
      },
      update(sys, dt) {
        sys.nextToss -= dt;
        if (sys.nextToss <= 0) {
          sys.nextToss = 1.4 + Math.random() * 1.2;
          const cx = 860 + Math.random() * 980;
          // cada salto tiene su color: la energía contenida se enciende al liberarse
          const jumpColors = [PAL.cyan, PAL.pink, PAL.lilac, PAL.blue];
          const col = jumpColors[sys.tossColor++ % jumpColors.length];
          for (const p of sys.ps) {
            if (p.gen !== "child" && Math.abs(p.seatX - cx) < 170 && Math.random() < 0.75) {
              p.air = true;
              p.vy = -(15 + Math.random() * 8);
              p.glow = 1;
              p.jumpCol = col;
            }
          }
        }
        for (const p of sys.ps) {
          if (p.gen === "child") { p.off(); continue; }
          p.reset();
          p.tc = PAL.white;
          p.ta = 1;
          p.ts = p.seatS * 1.35;
          p.glow = Math.max(p.glow, 0.3);
          p.tx = p.seatX;
          if (p.air) {
            p.tc = p.jumpCol || PAL.cyan;
            p.ts = p.seatS * 1.8;
            p.glow = Math.max(p.glow, 0.9);
            p.k = 0.02;
            p.fr = 0.985;
            p.ty = p.y;
            p.ay = 0.55;
            if (p.y < 400) { p.y = 400; p.vy = Math.abs(p.vy) * 0.25; }
            if (p.vy > 0 && p.y >= p.seatY) { p.air = false; p.vy *= 0.2; }
          } else {
            p.ty = p.seatY;
            p.k = 0.02;
            p.fr = 0.82;
          }
        }
      },
    },

    // 3 · LOS EVENTOS NO LLEGARON A LA UNIVERSIDAD. LA UNIVERSIDAD DECIDIÓ ENCONTRARSE CON EL MUNDO.
    // La esfera central es la Universidad. Sus partículas (lila) salen de adentro hacia el borde.
    // Las del mundo (cian y rosa) llegan desde fuera. Solo aparecen vínculos entre ambos
    // grupos, y solo en la frontera: el encuentro.
    encuentro: {
      link: { dist: 110, grow: 0.03, decay: 0.02, alpha: 0.7, rule: (p, q) => p.gen !== q.gen },
      update(sys, dt, t, st) {
        const cx = 940;
        const cy = 540;
        const R = 560;
        const prog = smooth(st / 5.5);
        for (const p of sys.ps) {
          if (p.gen === "child") { p.off(); continue; }
          p.reset();
          p.k = 0.008;
          if (p.gen === "exp") {
            const th = p.h1 * TAU + t * 0.035;
            const rr = R * lerp(0.42 + 0.22 * p.h2, 0.93 + 0.12 * p.h2, prog);
            p.tx = cx + Math.cos(th) * rr;
            p.ty = cy + Math.sin(th) * rr;
            p.tc = PAL.lilac;
            p.ta = 0.9;
          } else {
            const th = p.h1 * TAU - t * 0.025;
            const rr = R * lerp(1.85 + 0.4 * p.h2, 1.02 + 0.16 * p.h2, prog);
            p.tx = cx + Math.cos(th) * rr;
            p.ty = cy + Math.sin(th) * rr;
            p.tc = p.h3 < 0.3 ? PAL.pink : PAL.cyan;
            p.ta = 0.85;
          }
        }
      },
    },

    // 4 · ACADEMIA + INDUSTRIA + CIUDAD
    // Tres grupos con color y ritmo propio, cohesionados por dentro. Unas pocas partículas
    // "puente" se ubican entre grupos y forman los "+": relaciones que unen sin fusionar.
    triada: {
      link: { dist: 88, grow: 0.03, decay: 0.02, alpha: 0.55, rule: (p, q) => p.grp === q.grp || (p.bridge && q.bridge) },
      enter(sys) {
        sys.groups = [
          { x: 330, y: 650, col: PAL.blue },
          { x: 760, y: 320, col: PAL.violet },
          { x: 1200, y: 330, col: PAL.cyan },
        ];
        sys.ps.forEach((p, k) => {
          p.grp = k % 3;
          p.bridge = p.h3 < 0.07;
        });
      },
      update(sys, dt, t) {
        const G = sys.groups;
        for (const p of sys.ps) {
          if (p.gen === "child") { p.off(); continue; }
          p.reset();
          const g = G[p.grp];
          p.tc = g.col;
          p.ta = 0.9;
          p.k = 0.008;
          if (p.bridge) {
            const o = G[(p.grp + (p.h2 < 0.5 ? 1 : 2)) % 3];
            const f = 0.42 + p.h1 * 0.08;
            p.tx = lerp(g.x, o.x, f) + Math.sin(t * 0.8 + p.h3 * 40) * 6;
            p.ty = lerp(g.y, o.y, f) + Math.cos(t * 0.7 + p.h3 * 40) * 6;
            p.ts = 1.2;
          } else {
            const rad = p.gen === "exp" ? 28 + p.h2 * 70 : 85 + p.h2 * 95;
            const speed = (p.grp === 1 ? -0.12 : 0.1) * (p.gen === "exp" ? 0.6 : 1);
            const ang = p.h1 * TAU + t * speed;
            p.tx = g.x + Math.cos(ang) * rad;
            p.ty = g.y + Math.sin(ang) * rad * 0.85;
          }
        }
      },
      linkColor: (p) => p.col,
    },

    // 5 · LOS EVENTOS NUNCA FUERON EL OBJETIVO. EL IMPACTO SÍ.
    // Los tres actores convergen en un punto: el evento. Lo importante no es ese punto,
    // es la onda que produce: atraviesa el espacio, enciende a las personas que alcanza
    // y deja relaciones nuevas a su paso.
    impacto: {
      link: { dist: 125, grow: 0.08, decay: 0.03, alpha: 0.6, rule: (p, q) => p.glow > 0.35 && q.glow > 0.35 && !p.core && !q.core },
      enter(sys) {
        sys.waves = [];
        sys.nextWave = 2.1;
        sys.waveId = 0;
        if (!sys.groups) SCENES.triada.enter(sys);
        for (const p of sys.ps) p.core = p.gen !== "child" && p.h3 > 0.72;
      },
      update(sys, dt, t, st) {
        const E = { x: 1250, y: 560 };
        const prog = smooth(st / 1.8);
        sys.nextWave -= dt;
        if (sys.nextWave <= 0) {
          sys.nextWave = 3.4;
          sys.waves.push({ t0: t, id: ++sys.waveId });
          for (const p of sys.ps) if (p.core) p.glow = 1;
        }
        sys.waves = sys.waves.filter((w) => (t - w.t0) * 560 < 1700);
        for (const p of sys.ps) {
          if (p.gen === "child") { p.off(); continue; }
          p.reset();
          if (p.core) {
            const g = sys.groups[p.grp % 3];
            const gx = lerp(g.x, E.x, prog);
            const gy = lerp(g.y, E.y, prog);
            const ang = p.h1 * TAU + t * 0.4;
            const rad = (20 + p.h2 * 60) * (1 - 0.6 * prog);
            p.tx = gx + Math.cos(ang) * rad;
            p.ty = gy + Math.sin(ang) * rad;
            p.tc = mix(g.col, PAL.ink, p.glow * 0.5);
            p.ta = 0.95;
            p.k = 0.01;
          } else {
            p.tx = 20 + p.h1 * 1880;
            p.ty = 20 + p.h2 * 1040;
            p.k = 0.005;
            const dx = p.x - E.x;
            const dy = p.y - E.y;
            const d = Math.hypot(dx, dy) || 1;
            for (const w of sys.waves) {
              const R = (t - w.t0) * 560;
              if (Math.abs(d - R) < 40 && p.lastWave !== w.id) {
                p.lastWave = w.id;
                p.glow = 1;
                p.vx += (dx / d) * 5.5;
                p.vy += (dy / d) * 5.5;
              }
            }
            p.tc = mix(PAL.ink, PAL.blue, p.glow);
            p.ta = 0.2 + p.glow * 0.8;
            p.ts = 1 + p.glow * 1.1;
          }
        }
      },
      draw(sys, ctx, t) {
        for (const w of sys.waves) {
          const R = (t - w.t0) * 560;
          const a = 0.28 * (1 - R / 1700);
          ctx.strokeStyle = rgba(PAL.blue, a);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(1250, 560, R, 0, TAU);
          ctx.stroke();
        }
      },
      linkColor: () => PAL.blue,
    },

    // 6 · UN EVENTO TRAE PERSONAS. UNA COMUNIDAD TRAE TRANSFORMACIÓN.
    // Primero llegan personas sueltas, blancas, sin vínculos (el evento).
    // Luego se tejen relaciones: cuanto más conectada está una persona, más cambia
    // de color hacia el rosa y más crece (la transformación que trae la comunidad).
    comunidad: {
      link: { dist: 140, grow: 0.014, decay: 0.01, alpha: 0.55, spring: 0.0008, rest: 95 },
      update(sys, dt, t, st) {
        this.link.grow = st > 2.4 ? 0.014 : 0;
        const box = { x0: 540, x1: 1500, y0: 270, y1: 640 };
        for (const p of sys.ps) {
          if (p.gen === "child") { p.off(); continue; }
          p.reset();
          const ang = p.h1 * TAU;
          const rx = 480 + p.h2 * 480;
          const ry = 330 + p.h2 * 290;
          p.tx = clamp(1010 + Math.cos(ang) * rx, 30, 1890) + Math.sin(t * 0.4 + p.h3 * 20) * 22;
          p.ty = clamp(470 + Math.sin(ang) * ry, 40, 1050) + Math.cos(t * 0.35 + p.h3 * 20) * 22;
          p.k = st < 2.4 ? 0.006 : 0.0025;
          const D = Math.min(1, p.deg / 2.4);
          p.tc = mix(PAL.ink, p.gen === "exp" ? PAL.violet : PAL.pink, D);
          p.ts = 1 + D * 0.55;
          p.ta = 0.45 + D * 0.55;
          // la frase queda libre: las personas rodean el texto
          if (p.x > box.x0 && p.x < box.x1 && p.y > box.y0 && p.y < box.y1) {
            p.ay += p.y < (box.y0 + box.y1) / 2 ? -0.25 : 0.25;
          }
        }
      },
    },

    // 7 · EL TALENTO CRECE A LA VELOCIDAD DE LA CONFIANZA.
    // Las personas giran juntas, sin cambiar de posición relativa: la cercanía se sostiene.
    // Los vínculos se fortalecen despacio (la confianza toma tiempo) y el tamaño y brillo
    // de cada partícula —su talento— crece según la confianza acumulada.
    confianza: {
      link: { dist: 150, grow: 0.005, decay: 0.004, alpha: 0.7, spring: 0.0006, rest: 115 },
      enter(sys) {
        for (const [key, s] of sys.links) sys.links.set(key, s * 0.15);
      },
      update(sys, dt, t) {
        const O = { x: 1060, y: 600 };
        for (const p of sys.ps) {
          if (p.gen === "child") { p.off(); continue; }
          p.reset();
          const rad = 250 + p.h2 * 620;
          const ang = p.h1 * TAU + t * 0.04;
          p.tx = O.x + Math.cos(ang) * rad * 1.05;
          p.ty = O.y + Math.sin(ang) * rad * 0.62;
          p.k = 0.004;
          const D = Math.min(1, p.deg / 2.6);
          p.tc = p.gen === "young" ? PAL.cyan : mix(PAL.ink, PAL.cyan, D * 0.5);
          p.ts = 0.8 + D * 1.5;
          p.ta = 0.3 + D * 0.7;
          p.glow = Math.max(p.glow, D * 0.45);
        }
      },
      linkColor: () => PAL.cyan,
    },

    // 8 · LA EXPERIENCIA CONSTRUYE EL CAMINO. LAS NUEVAS GENERACIONES DESCUBREN NUEVAS RUTAS.
    // La experiencia (violeta) avanza despacio y va trazando el camino principal.
    // Los jóvenes (cian) lo recorren más rápido y, en algún punto, se desvían: dejan
    // rastros propios que abren rutas nuevas desde el camino existente.
    rutas: {
      link: { dist: 70, grow: 0.03, decay: 0.03, alpha: 0.35 },
      enter(sys) {
        sys.reveal = 0;
        sys.trails = [];
        for (const p of sys.byGen.young) this.respawn(p, sys, true);
      },
      respawn(p, sys, first) {
        p.route = {
          state: "path",
          u: first ? Math.random() * 0.25 : Math.random() * 0.05,
          ub: 0.2 + Math.random() * 0.7,
          speed: 0.045 + Math.random() * 0.035,
          side: Math.random() < 0.5 ? -1 : 1,
          pts: [],
          life: 0,
        };
      },
      update(sys, dt, t) {
        sys.reveal = Math.min(1, sys.reveal + dt / 6);
        for (const p of sys.ps) {
          if (p.gen === "child") { p.off(); continue; }
          p.reset();
          if (p.gen === "exp") {
            const u = (p.h1 + t * 0.012) % 1;
            const pt = catmull(ROUTE, u * sys.reveal);
            const nx = catmull(ROUTE, Math.min(1, u * sys.reveal + 0.01));
            const ang = Math.atan2(nx.y - pt.y, nx.x - pt.x) + Math.PI / 2;
            const off = (p.h2 - 0.5) * 34;
            p.tx = pt.x + Math.cos(ang) * off;
            p.ty = pt.y + Math.sin(ang) * off;
            p.tc = PAL.violet;
            p.ta = 0.9;
            p.k = 0.02;
            continue;
          }
          const r = p.route || (this.respawn(p, sys, true), p.route);
          p.tc = p.h3 < 0.25 ? PAL.pink : PAL.cyan;
          p.ta = 0.9;
          if (r.state === "path") {
            r.u += r.speed * dt;
            const lim = Math.min(r.ub, sys.reveal);
            const pt = catmull(ROUTE, Math.min(r.u, lim));
            p.tx = pt.x + (p.h2 - 0.5) * 20;
            p.ty = pt.y + (p.h1 - 0.5) * 20;
            p.k = 0.03;
            if (r.u >= r.ub && sys.reveal >= r.ub) {
              const nx = catmull(ROUTE, Math.min(1, r.u + 0.01));
              r.state = "branch";
              r.heading = Math.atan2(nx.y - pt.y, nx.x - pt.x) + r.side * (0.35 + Math.random() * 0.7);
              r.turn = r.side * (Math.random() * 0.5 - 0.1);
              r.bx = p.x;
              r.by = p.y;
              r.maxLife = 3 + Math.random() * 3;
            }
          } else {
            r.life += dt;
            r.heading += r.turn * dt;
            r.bx += Math.cos(r.heading) * 120 * dt;
            r.by += Math.sin(r.heading) * 120 * dt;
            // sobre el vidrio, las rutas nuevas se mantienen en la franja libre y no tapan el texto
            if (r.bx < ROUTE_BAND.x1 && (r.by < ROUTE_BAND.y0 || r.by > ROUTE_BAND.y1)) {
              r.by = clamp(r.by, ROUTE_BAND.y0, ROUTE_BAND.y1);
              r.heading = -r.heading;
              r.turn = -r.turn;
            }
            p.tx = r.bx;
            p.ty = r.by;
            p.k = 0.08;
            p.fr = 0.7;
            if (!r.lastPt || r.life - r.lastPt > 0.06) {
              r.lastPt = r.life;
              r.pts.push(p.x, p.y);
            }
            const out = r.bx < -40 || r.bx > W + 40 || r.by < -40 || r.by > H + 40;
            if (r.life > r.maxLife || out) {
              if (r.pts.length > 4) sys.trails.push({ pts: r.pts, born: t, col: p.tc });
              this.respawn(p, sys, false);
              const start = catmull(ROUTE, 0);
              p.x = start.x; p.y = start.y; p.vx = 0; p.vy = 0; p.a = 0;
            }
          }
        }
        sys.trails = sys.trails.filter((tr) => t - tr.born < 8).slice(-90);
      },
      draw(sys, ctx, t) {
        // camino principal: lo que la experiencia ya recorrió
        const steps = 80;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        for (let s = 0; s <= steps; s++) {
          const pt = catmull(ROUTE, (s / steps) * sys.reveal);
          if (s === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = rgba(PAL.violet, 0.5);
        ctx.lineWidth = 7;
        ctx.stroke();
        ctx.strokeStyle = rgba(PAL.ink, 0.22);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // rutas nuevas
        const drawTrail = (pts, col, a) => {
          if (pts.length < 4) return;
          ctx.beginPath();
          ctx.moveTo(pts[0], pts[1]);
          for (let k = 2; k < pts.length; k += 2) ctx.lineTo(pts[k], pts[k + 1]);
          ctx.strokeStyle = rgba(col, a);
          ctx.lineWidth = 2;
          ctx.stroke();
        };
        for (const tr of sys.trails) drawTrail(tr.pts, tr.col, 0.55 * (1 - (t - tr.born) / 8));
        for (const p of sys.byGen.young) if (p.route && p.route.state === "branch") drawTrail(p.route.pts, p.tc, 0.6);
      },
    },

    // 9 · UNA VISIÓN. DOS GENERACIONES.
    // Un único punto de luz arriba: la visión compartida. Cada generación gira a su
    // manera alrededor de ella —la experiencia en una órbita amplia y lenta, los jóvenes
    // en una órbita cercana, rápida y en sentido contrario—. Dos ritmos, un mismo centro.
    vision: {
      link: { dist: 75, grow: 0.03, decay: 0.03, alpha: 0.5, rule: (p, q) => p.gen === q.gen },
      update(sys, dt, t) {
        const V = { x: 960, y: 300 };
        for (const p of sys.ps) {
          if (p.gen === "child") { p.off(); continue; }
          p.reset();
          let ang, rx, ry, tilt;
          if (p.gen === "exp") {
            ang = p.h1 * TAU + t * 0.16;
            rx = 500 + p.h2 * 60;
            ry = 170 + p.h2 * 24;
            tilt = 0.12;
            p.tc = p.h3 < 0.5 ? PAL.violet : PAL.blue;
          } else {
            ang = p.h1 * TAU - t * 0.38;
            rx = 350 + p.h2 * 80;
            ry = 105 + p.h2 * 32;
            tilt = -0.15;
            p.tc = p.h3 < 0.3 ? PAL.pink : PAL.cyan;
          }
          const ex = Math.cos(ang) * rx;
          const ey = Math.sin(ang) * ry;
          p.tx = V.x + ex * Math.cos(tilt) - ey * Math.sin(tilt);
          p.ty = V.y + ex * Math.sin(tilt) + ey * Math.cos(tilt);
          p.k = 0.012;
          p.ta = 0.9;
        }
      },
      draw(sys, ctx, t) {
        const V = { x: 960, y: 300 };
        ctx.lineWidth = 1;
        for (const p of sys.ps) {
          if (!p.active || p.i % 4) continue;
          ctx.strokeStyle = rgba(PAL.ink, 0.06 * p.a);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(V.x, V.y);
          ctx.stroke();
        }
        const pulse = 1 + Math.sin(t * 1.6) * 0.15;
        const g = ctx.createRadialGradient(V.x, V.y, 0, V.x, V.y, 70 * pulse);
        g.addColorStop(0, "rgba(255,255,255,0.9)");
        g.addColorStop(0.2, "rgba(244,243,239,0.35)");
        g.addColorStop(1, "rgba(244,243,239,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(V.x, V.y, 70 * pulse, 0, TAU);
        ctx.fill();
      },
    },

    // 10 · EL CRECIMIENTO NO OCURRE CUANDO UNA GENERACIÓN REEMPLAZA A OTRA. OCURRE CUANDO TRABAJAN JUNTAS.
    // Cada persona con experiencia se une a una joven: giran juntas, ninguna ocupa el lugar
    // de la otra. De esas parejas nacen partículas nuevas: el crecimiento sale de trabajar juntas.
    juntas: {
      blend: "source-over",
      link: { dist: 95, grow: 0.03, decay: 0.02, alpha: 0.4, rule: (p, q) => p.pair !== q.pair || p.pair < 0 },
      enter(sys) {
        const E = sys.byGen.exp;
        const Y = sys.byGen.young;
        sys.pairs = E.map((e, i) => {
          const y = Y[i];
          e.pair = i;
          y.pair = i;
          return { e, y, x: 90 + hash(i * 3.1 + 5) * 870, y0: 130 + hash(i * 7.7 + 2) * 880, ph: hash(i + 99) * TAU };
        });
        for (let k = E.length; k < Y.length; k++) Y[k].pair = -1;
        sys.childTimer = 0;
        for (const c of sys.byGen.child) { c.pair = -1; c.born = false; }
      },
      update(sys, dt, t, st) {
        sys.childTimer += dt;
        if (st > 1.5 && sys.childTimer > 0.3) {
          sys.childTimer = 0;
          const c = sys.byGen.child.find((ch) => !ch.born);
          if (c) {
            const pr = sys.pairs[(Math.random() * sys.pairs.length) | 0];
            c.born = true;
            c.x = pr.e.x; c.y = pr.e.y; c.a = 0;
            c.hx = clamp(pr.x + (Math.random() - 0.5) * 140, 40, 1000);
            c.hy = clamp(pr.y0 + (Math.random() - 0.5) * 140, 60, 1040);
            c.glow = 1;
          }
        }
        for (const pr of sys.pairs) {
          const cx = pr.x + Math.sin(t * 0.3 + pr.ph) * 26;
          const cy = pr.y0 + Math.cos(t * 0.26 + pr.ph) * 26;
          const a = pr.ph + t * 1.1;
          const ox = Math.cos(a) * 12;
          const oy = Math.sin(a) * 12;
          const { e, y } = pr;
          e.reset(); y.reset();
          e.tx = cx + ox; e.ty = cy + oy; e.k = 0.03; e.fr = 0.8;
          y.tx = cx - ox; y.ty = cy - oy; y.k = 0.03; y.fr = 0.8;
          e.tc = PAL.blue; e.ta = 0.95;
          y.tc = PAL.white; y.ta = 0.95; y.ts = 1.2;
        }
        for (const p of sys.ps) {
          if (p.gen === "young" && p.pair < 0) {
            p.reset();
            p.tx = 60 + p.h1 * 940 + Math.sin(t * 0.3 + p.h3 * 9) * 30;
            p.ty = 90 + p.h2 * 950;
            p.tc = PAL.white; p.ta = 0.45;
          } else if (p.gen === "child") {
            if (!p.born) { p.off(); continue; }
            p.reset();
            p.tx = p.hx + Math.sin(t * 0.5 + p.h3 * 9) * 14;
            p.ty = p.hy + Math.cos(t * 0.45 + p.h1 * 9) * 14;
            p.tc = PAL.violet; p.ta = 0.95; p.ts = 1.3; p.k = 0.01;
          }
        }
      },
      draw(sys, ctx) {
        ctx.lineWidth = 2.4;
        for (const pr of sys.pairs) {
          ctx.strokeStyle = rgba(PAL.blue, 0.85 * Math.min(pr.e.a, pr.y.a));
          ctx.beginPath();
          ctx.moveTo(pr.e.x, pr.e.y);
          ctx.lineTo(pr.y.x, pr.y.y);
          ctx.stroke();
        }
      },
      linkColor: () => PAL.blue,
    },

    // 11 · LOS JÓVENES NO SON EL FUTURO. SON EL PRESENTE QUE MUCHAS ORGANIZACIONES AÚN NO VEN.
    // Los jóvenes aparecen en un punto lejano, casi invisibles (el "futuro").
    // Viajan hacia el frente, crecen, se encienden y se conectan entre ellos: están aquí,
    // ahora. La experiencia se retira al fondo para que se vean.
    presente: {
      link: { dist: 135, grow: 0.03, decay: 0.03, alpha: 0.6, rule: (p, q) => p.here && q.here },
      update(sys, dt, t, st) {
        const VP = { x: 560, y: 430 };
        for (const p of sys.ps) {
          if (p.gen === "child") { p.off(); continue; }
          p.reset();
          if (p.gen === "young") {
            const delay = p.h1 * 5.5;
            const z = 1 - smooth((st - delay) / 2.4);
            const ang = p.h2 * TAU;
            const rad = Math.sqrt(p.h3);
            const fx = 520 + Math.cos(ang) * 450 * rad + Math.sin(t * 0.3 + p.h3 * 9) * 12 * (1 - z);
            const fy = 560 + Math.sin(ang) * 440 * rad + Math.cos(t * 0.28 + p.h2 * 9) * 12 * (1 - z);
            const zz = z * z;
            p.tx = lerp(fx, VP.x, zz);
            p.ty = lerp(fy, VP.y, zz);
            p.k = 0.06;
            p.fr = 0.75;
            p.ts = 0.35 + 1.35 * (1 - z);
            p.ta = 0.05 + 0.95 * (1 - z);
            p.tc = (p.h1 * 7) % 1 < 0.25 ? PAL.pink : PAL.cyan;
            p.here = z < 0.05;
            if (p.here) p.glow = Math.max(p.glow, 0.35);
          } else {
            p.here = false;
            p.tx = 1020 + p.h1 * 880;
            p.ty = 20 + p.h2 * 1040;
            p.tc = PAL.grey;
            p.ta = 0.16;
            p.ts = 0.8;
            p.k = 0.003;
          }
        }
      },
      linkColor: () => PAL.cyan,
    },

    // 12 · EL FUTURO NO SE HEREDA. SE CONSTRUYE.
    // No aparece una estructura hecha. Las dos generaciones, por turnos, llevan cada pieza
    // a su lugar y la estructura (un arco) se levanta desde la base hasta la clave.
    // Las vigas solo existen cuando sus dos extremos ya fueron colocados.
    construye: {
      blend: "source-over",
      link: null,
      enter(sys) {
        const cx = 960;
        const cy = 1720;
        const R1 = 1100;
        const R2 = 1010;
        const th = Math.asin(880 / R1);
        const N = 24;
        const outer = [];
        const inner = [];
        for (let k = 0; k <= N; k++) {
          const a = -th + (2 * th * k) / N;
          outer.push({ x: cx + Math.sin(a) * R1, y: cy - Math.cos(a) * R1 });
        }
        for (let k = 0; k < N; k++) {
          const a = -th + (2 * th * (k + 0.5)) / N;
          inner.push({ x: cx + Math.sin(a) * R2, y: cy - Math.cos(a) * R2 });
        }
        const slots = [...outer, ...inner].map((s) => ({ ...s, p: null, lock: 0 }));
        const O = (k) => slots[k];
        const I = (k) => slots[N + 1 + k];
        const beams = [];
        for (let k = 0; k < N; k++) {
          beams.push([O(k), O(k + 1)], [O(k), I(k)], [I(k), O(k + 1)]);
          if (k < N - 1) beams.push([I(k), I(k + 1)]);
        }
        sys.slots = slots;
        sys.beams = beams;
        sys.order = [...slots].sort((a, b) => b.y - a.y);
        const E = sys.byGen.exp;
        const Y = sys.byGen.young;
        sys.builders = [];
        for (let k = 0; k < slots.length; k++) sys.builders.push(k % 2 ? Y[k] : E[k]);
        for (const p of sys.ps) p.slot = null;
        sys.buildTimer = 0;
        sys.next = 0;
        sys.doneAt = 0;
      },
      update(sys, dt, t, st) {
        sys.buildTimer += dt;
        while (st > 0.8 && sys.buildTimer > 0.17 && sys.next < sys.order.length) {
          sys.buildTimer -= 0.17;
          const slot = sys.order[sys.next];
          const b = sys.builders[sys.next];
          slot.p = b;
          b.slot = slot;
          sys.next++;
        }
        let locked = 0;
        for (const p of sys.ps) {
          if (p.gen === "child") { p.off(); continue; }
          p.reset();
          if (p.slot) {
            const s = p.slot;
            p.tx = s.x;
            p.ty = s.y;
            const d = Math.hypot(p.x - s.x, p.y - s.y);
            if (!s.lock && d < 8) s.lock = t;
            if (s.lock) locked++;
            p.k = s.lock ? 0.08 : 0.018;
            p.fr = s.lock ? 0.7 : 0.88;
            p.tc = p.gen === "exp" ? PAL.violet : PAL.cyan;
            p.ta = 1;
            p.ts = 1.25;
          } else {
            p.tx = 40 + p.h1 * 1840 + Math.sin(t * 0.4 + p.h3 * 9) * 30;
            p.ty = 980 + p.h2 * 90;
            p.tc = p.gen === "exp" ? PAL.violet : PAL.cyan;
            p.ta = 0.4;
            p.k = 0.006;
          }
        }
        if (!sys.doneAt && locked === sys.slots.length) sys.doneAt = t;
        if (sys.doneAt) {
          // al completarse, una luz recorre el arco desde la base hasta la clave
          const wave = (t - sys.doneAt) * 0.9;
          for (const s of sys.slots) {
            const h = (1060 - s.y) / 440;
            if (Math.abs(h - (wave % 2.2)) < 0.08) s.p.glow = 1;
          }
        }
      },
      draw(sys, ctx, t) {
        ctx.lineCap = "round";
        for (const [a, b] of sys.beams) {
          if (!a.lock || !b.lock) continue;
          const s = smooth((t - Math.max(a.lock, b.lock)) / 0.6);
          ctx.strokeStyle = rgba(PAL.ink, 0.7 * s);
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(a.p.x, a.p.y);
          ctx.lineTo(lerp(a.p.x, b.p.x, s), lerp(a.p.y, b.p.y, s));
          ctx.stroke();
        }
      },
    },

    // 13 · CIERRE
    // Todas las personas del recorrido forman una sola red en espiral que sigue girando
    // alrededor de los códigos: la conversación continúa después de la charla.
    // Los tres brazos de color dialogan con el remolino del logo de Future Leaders Forum.
    continuidad: {
      link: { dist: 120, grow: 0.025, decay: 0.015, alpha: 0.6 },
      update(sys, dt, t) {
        const C0 = { x: 960, y: 520 };
        const arms = [PAL.pink, PAL.blue, PAL.cyan];
        for (const p of sys.ps) {
          if (p.gen === "child") { p.off(); continue; }
          p.reset();
          const arm = Math.floor(p.h3 * 3);
          const rad = 90 + p.h2 * 640;
          const ang = (arm * TAU) / 3 + p.h1 * 0.9 + p.h2 * 2.2 + t * 0.12 * (1 - p.h2 * 0.5);
          p.tx = C0.x + Math.cos(ang) * rad * 1.15;
          p.ty = C0.y + Math.sin(ang) * rad * 0.7;
          p.tc = arms[arm];
          p.ta = 0.85;
          p.k = 0.006;
        }
      },
    },
  };

  class ParticleSystem {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.ps = [];
      this.byGen = { exp: [], young: [], child: [] };
      let i = 0;
      for (const gen of ["exp", "young", "child"]) {
        for (let k = 0; k < COUNT[gen]; k++) {
          const p = new Particle(i++, gen);
          this.ps.push(p);
          this.byGen[gen].push(p);
        }
      }
      this.links = new Map();
      this.t = 0;
      this.st = 0;
      this.scale = 1;
      this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    resize(scale) {
      this.scale = scale;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.max(1, Math.round(W * scale * dpr));
      this.canvas.height = Math.max(1, Math.round(H * scale * dpr));
      this.pixel = scale * dpr;
    }

    // Al entrar a una diapositiva las partículas nacen dentro del panel de vidrio (o del
    // texto) y salen desde ahí hacia la estructura de la nueva escena: la frase las origina.
    setScene(name, areas) {
      const scene = SCENES[name];
      if (!scene || scene === this.scene) return;
      this.scene = scene;
      this.st = 0;
      if (areas && areas.length) this.spawn(areas);
      scene.enter?.(this);
    }

    spawn(areas) {
      const weights = areas.map((r) => r.w * r.h);
      const total = weights.reduce((a, b) => a + b, 0);
      this.links.clear();
      for (const p of this.ps) {
        let pick = Math.random() * total;
        let r = areas[0];
        for (let k = 0; k < areas.length; k++) {
          pick -= weights[k];
          if (pick <= 0) { r = areas[k]; break; }
        }
        const cx = r.x + r.w / 2;
        const cy = r.y + r.h / 2;
        p.x = cx + (Math.random() - 0.5) * r.w * 0.8;
        p.y = cy + (Math.random() - 0.5) * r.h * 0.8;
        const ang = Math.atan2(p.y - cy, p.x - cx) + (Math.random() - 0.5) * 0.6;
        const speed = 3 + Math.random() * 6;
        p.vx = Math.cos(ang) * speed;
        p.vy = Math.sin(ang) * speed;
        p.a = 0;
        p.r = p.base * 0.3;
        p.glow = 0.8;
      }
    }

    step(dt) {
      const scene = this.scene;
      if (!scene) return;
      this.t += dt;
      this.st += dt;
      scene.update(this, dt, this.t, this.st);

      const f = dt * 60;
      // justo después de nacer, las partículas se dirigen con más decisión a su lugar
      const pull = this.st < 1.6 ? 1 + 0.8 * (1 - this.st / 1.6) : 1;
      for (const p of this.ps) {
        p.vx += ((p.tx - p.x) * p.k * pull + p.ax) * f;
        p.vy += ((p.ty - p.y) * p.k * pull + p.ay) * f;
        const fr = Math.pow(p.fr, f);
        p.vx *= fr;
        p.vy *= fr;
        const sp = Math.hypot(p.vx, p.vy);
        if (sp > 34) { p.vx *= 34 / sp; p.vy *= 34 / sp; }
        p.x += p.vx * f;
        p.y += p.vy * f;
        const e = 1 - Math.pow(0.92, f);
        p.a += (p.ta - p.a) * e;
        p.r += (p.base * p.ts - p.r) * e;
        p.col = mix(p.col, p.tc, e);
        p.glow *= Math.pow(0.975, f);
        p.deg = 0;
      }
      this.updateLinks(f);
    }

    updateLinks(f) {
      const L = this.scene.link;
      const ps = this.ps;
      const n = ps.length;
      const dist = L ? L.dist : 0;
      const d2max = dist * dist;
      for (let i = 0; i < n; i++) {
        const p = ps[i];
        for (let j = i + 1; j < n; j++) {
          const q = ps[j];
          const key = i * 1024 + j;
          let s = this.links.get(key) || 0;
          const dx = q.x - p.x;
          const dy = q.y - p.y;
          const d2 = dx * dx + dy * dy;
          const ok = L && this.st > 0.6 && p.active && q.active && d2 < d2max && (!L.rule || L.rule(p, q));
          if (ok) {
            const d = Math.sqrt(d2);
            s = Math.min(1, s + L.grow * f * (1 - d / dist));
            if (L.spring && s > 0.05 && d > 0) {
              const force = (d - L.rest) * L.spring * s * f;
              const fx = (dx / d) * force;
              const fy = (dy / d) * force;
              p.vx += fx; p.vy += fy;
              q.vx -= fx; q.vy -= fy;
            }
          } else if (s > 0) {
            s -= (L ? L.decay : 0.03) * f;
          }
          if (s <= 0) {
            this.links.delete(key);
          } else {
            this.links.set(key, s);
            p.deg += s;
            q.deg += s;
          }
        }
      }
    }

    draw() {
      const ctx = this.ctx;
      const scene = this.scene;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (!scene) return;
      ctx.setTransform(this.pixel, 0, 0, this.pixel, 0, 0);
      ctx.globalCompositeOperation = "source-over";

      scene.draw?.(this, ctx, this.t);

      const L = scene.link;
      const alpha = L ? L.alpha : 0.5;
      ctx.lineCap = "round";
      for (const [key, s] of this.links) {
        if (s < 0.02) continue;
        const p = this.ps[(key / 1024) | 0];
        const q = this.ps[key % 1024];
        const a = s * alpha * Math.min(p.a, q.a);
        if (a < 0.01) continue;
        const col = scene.linkColor ? scene.linkColor(p, q) : mix(p.col, q.col, 0.5);
        ctx.strokeStyle = rgba(col, a);
        ctx.lineWidth = 0.6 + s * 1.6;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }

      ctx.globalCompositeOperation = scene.blend || "lighter";
      for (const p of this.ps) {
        if (p.a < 0.01) continue;
        const halo = p.r * (3 + p.glow * 2.4);
        ctx.fillStyle = rgba(p.col, p.a * (0.13 + p.glow * 0.22));
        ctx.beginPath();
        ctx.arc(p.x, p.y, halo, 0, TAU);
        ctx.fill();
        ctx.fillStyle = rgba(p.col, p.a);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (1 + p.glow * 0.35), 0, TAU);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    }
  }

  window.ParticleSystem = ParticleSystem;
})();
