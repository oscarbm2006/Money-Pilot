const { useState, useEffect, useRef, useCallback, useMemo, useId } = React;

import { C, GASTOS_DISC_DEF, GASTOS_FIJOS_DEF, GASTOS_HORMIGA_EJEMPLOS, I, STATS_REALES, TASA_INDICE_GLOBAL } from './constantes.js';
import { Card, EvidenciaModal, Eyebrow, FadeSwitch, FreqField, NumberField, SimpleStackedBarChart, drawRef } from './ui-basicos.js';
import { euros, numEs, proyeccionInteres, totalMensual } from './calculos.js';
import { useAparicion, useInclinacion, contarHasta, prefiereMenosMovimiento, esPantallaPequena } from './movimiento.js';
import { SeccionReloj, SeccionCapas } from './reloj.js';
import { montarPortada3D, montarCapa3D } from './efectos-3d.js';

// Longitud de una polilínea (en unidades del viewBox) a partir de su atributo points; sirve para trazarla al aparecer
const longitudPolilinea = pts => {
  const a = pts.split(' ').map(t => t.split(',').map(Number));
  let L = 0;
  for (let i = 1; i < a.length; i++) L += Math.hypot(a[i][0] - a[i - 1][0], a[i][1] - a[i - 1][1]);
  return Math.ceil(L) + 1;
};
export function AnimatedStatValue({
  raw
}) {
  const m = raw.match(/^([>~]?)([+-]?)([\d.,]+)/);
  const prefix = m ? m[1] : "";
  const sign = m ? m[2] : "";
  const target = m ? parseFloat(m[3].replace(",", ".")) : 0;
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const duration = 900;
    const tick = now => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => raf && cancelAnimationFrame(raf);
    // eslint-disable-next-line
  }, [target]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, prefix, sign, display.toLocaleString("es-ES", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }), "%");
}

export function StatsCarousel() {
  const [idx, setIdx] = useState(0);
  const total = STATS_REALES.length;
  const pausedRef = useRef(false);
  useEffect(() => {
    const t = setInterval(() => {
      if (!pausedRef.current) setIdx(i => (i + 1) % total);
    }, 5500);
    return () => clearInterval(t);
  }, []);
  const go = dir => setIdx(i => (i + dir + total) % total);
  const s = STATS_REALES[idx];
  return /*#__PURE__*/React.createElement(Card, {
    className: "p-6 sm:p-8 relative overflow-hidden",
    onMouseEnter: () => pausedRef.current = true,
    onMouseLeave: () => pausedRef.current = false,
    style: {
      borderColor: C.sand + "55",
      boxShadow: "0 0 30px -10px rgba(79,70,229,0.25)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
    style: {
      backgroundColor: "rgba(79,70,229,0.07)"
    }
  }, /*#__PURE__*/React.createElement(s.icon, {
    size: 22,
    color: C.sand
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => go(-1),
    className: "w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/5 border",
    style: {
      color: C.muted,
      border: "1px solid " + C.border
    }
  }, /*#__PURE__*/React.createElement(I.chevronLeft, {
    size: 15
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => go(1),
    className: "w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/5 border",
    style: {
      color: C.muted,
      border: "1px solid " + C.border
    }
  }, /*#__PURE__*/React.createElement(I.chevronRight, {
    size: 15
  })))), /*#__PURE__*/React.createElement(FadeSwitch, {
    id: idx
  }, /*#__PURE__*/React.createElement("div", {
    className: "mt-5 min-h-[128px] sm:min-h-[112px]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-4xl sm:text-5xl font-bold",
    style: {
      color: C.sand
    }
  }, /*#__PURE__*/React.createElement(AnimatedStatValue, {
    raw: s.valor
  })), /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-bold mt-2",
    style: {
      color: C.ink
    }
  }, s.label), /*#__PURE__*/React.createElement("p", {
    className: "text-xs mt-1.5 max-w-md",
    style: {
      color: C.muted
    }
  }, s.desc))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mt-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] font-bold uppercase inline-flex items-center gap-1 px-2 py-1 rounded-full border",
    style: {
      color: C.muted,
      border: "1px solid " + C.border,
      letterSpacing: "0.06em"
    }
  }, "Fuente: ", s.fuente), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5"
  }, STATS_REALES.map((_, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => setIdx(i),
    "aria-label": "Ver estadística " + (i + 1),
    className: "h-1.5 rounded-full transition-all duration-300",
    style: {
      width: i === idx ? 22 : 7,
      backgroundColor: i === idx ? C.sand : C.border
    }
  })))));
}

/* ==================================================================
   PORTADA · Rediseño 3D (Fase 1)
   Solo cambia el aspecto: los textos, datos y cálculos son los mismos
   que antes (inflación 2,5 %, rentabilidad 8 %, índice global, etc.).
   ================================================================== */
const ce = React.createElement;

// Monta una escena 3D en un <canvas> y la desmonta al salir de la pantalla.
// Con "retrasoMs", la escena se prepara pasado ese tiempo y cuando el navegador está desocupado, para que no compita
// con la portada mientras esta termina de cargar.
function useEscena3D(montar, retrasoMs = 0) {
  const lienzo = useRef(null), caja = useRef(null);
  const [fallo, setFallo] = useState(false);
  const [lista, setLista] = useState(!retrasoMs);
  useEffect(() => {
    if (!retrasoMs) return;
    let ocioso = 0;
    const t = setTimeout(() => { ocioso = window.requestIdleCallback ? window.requestIdleCallback(() => setLista(true), { timeout: 2000 }) : setTimeout(() => setLista(true), 0); }, retrasoMs);
    return () => { clearTimeout(t); if (ocioso && window.cancelIdleCallback) window.cancelIdleCallback(ocioso); };
  }, []);
  useEffect(() => {
    if (!lista) return;
    let desmontar = () => {}, vivo = true;
    montar(lienzo.current, caja.current, () => setFallo(true)).then(f => { if (vivo) desmontar = f; else f(); });
    return () => { vivo = false; desmontar(); };
  }, [lista]);
  return { lienzo, caja, fallo };
}

// Bloque que aparece al llegar con el scroll y desaparece al irse
function Aparece({ as = "div", retraso = 0, className = "", style = {}, children, ...rest }) {
  const ref = useAparicion();
  return ce(as, { ref, className: "mp-aparece " + className, style: { "--mp-retraso": retraso + "s", ...style }, ...rest }, children);
}

// Capa de transición: titular + iconos 3D que llegan girando
function CapaTransicion({ id, lineas, frase, iconos, retraso }) {
  const { lienzo, caja } = useEscena3D((c, b, fallar) => esPantallaPequena() ? Promise.resolve(() => {}) : montarCapa3D(c, b, iconos, { alFallar: fallar }), retraso);
  const visible = useAparicion();
  return ce("section", { ref: el => { caja.current = el; visible.current = el; }, className: "mp-capa", "aria-labelledby": id },
    ce("canvas", { ref: lienzo, className: "mp-lienzo", "aria-hidden": "true" }),
    ce("div", { className: "mp-capa-luz", "aria-hidden": "true" }),
    ce("div", { className: "mp-capa-texto" },
      ce("h2", { id, className: "mp-capa-titulo" }, lineas.map((l, i) => ce("span", { key: i, className: "mp-capa-linea" }, ce("span", null, l)))),
      ce("p", { className: "mp-capa-frase" }, frase)));
}

/* ---------- Cabecera de las herramientas ---------- */
// Banda oscura con el título de la herramienta y unos iconos 3D a la derecha. Sustituye a la tarjeta de introducción
// de cada herramienta. En móvil no monta el 3D (más ligero) y deja solo el texto.
// iconos: lista de [tipo, x, y, escala, giroInicial], igual que en las capas de transición.
export function CabeceraHerramienta({ id, antetitulo, titulo, frase, iconos }) {
  const { lienzo, caja } = useEscena3D((c, b, fallar) => esPantallaPequena() ? Promise.resolve(() => {}) : montarCapa3D(c, b, iconos, { alFallar: fallar }), 250);
  return ce("header", { ref: caja, className: "mp-cab mp-sans", "aria-labelledby": id },
    ce("canvas", { ref: lienzo, className: "mp-lienzo", "aria-hidden": "true" }),
    ce("div", { className: "mp-cab-luz", "aria-hidden": "true" }),
    ce("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 mp-cab-texto" },
      ce("p", { className: "mp-cab-ante mp-sube", style: { "--mp-retraso": ".05s" } }, antetitulo),
      ce("h1", { id, className: "mp-cab-titulo mp-sube", style: { "--mp-retraso": ".12s" } }, titulo),
      ce("p", { className: "mp-cab-frase mp-sube", style: { "--mp-retraso": ".22s" } }, frase)));
}

/* ---------- Gráfico 3D por capas: inflación frente a interés compuesto ---------- */
function GraficoInflacion3D({ anios, aporte, inflacion, rentabilidad }) {
  const ref = useRef(null), estado = useRef({ yv: 0.25, meta: anios, raf: 0, visto: false });
  const W = 800, H = 380, L = 50, R = 770, T = 40, B = 330;
  const dibujar = Y => {
    const raiz = ref.current; if (!raiz) return;
    Y = Math.max(Y, 0.25);
    const fc = t => Math.pow(1 + rentabilidad / 100, t), fi = t => 1 / Math.pow(1 + inflacion / 100, t);
    const ymax = fc(Y) * 1.12, X = t => L + t / Y * (R - L), Yp = v => B - v / ymax * (B - T);
    let dc = "", di = "", vuelta = "";
    for (let i = 0; i <= 60; i++) { const t = Y * i / 60; dc += (i ? "L" : "M") + X(t).toFixed(1) + " " + Yp(fc(t)).toFixed(1); di += (i ? "L" : "M") + X(t).toFixed(1) + " " + Yp(fi(t)).toFixed(1); }
    for (let j = 60; j >= 0; j--) { const t = Y * j / 60; vuelta += "L" + X(t).toFixed(1) + " " + Yp(fi(t)).toFixed(1); }
    const q = s => raiz.querySelector(s);
    q("[data-c]").setAttribute("d", dc); q("[data-i]").setAttribute("d", di); q("[data-area]").setAttribute("d", dc + vuelta + "Z");
    const yb = Yp(1); q("[data-base]").setAttribute("y1", yb); q("[data-base]").setAttribute("y2", yb); q("[data-base-t]").setAttribute("y", yb - 10);
    q("[data-anios]").innerHTML = [0, Y / 2, Y].map(t => `<text x="${X(t)}" y="${B + 30}">${t === 0 ? "Hoy" : Math.round(t) + " años"}</text>`).join("");
    const ce_ = fc(Y), ie = fi(Y), xc = X(Y), yc = Yp(ce_), yi = Yp(ie);
    q("[data-pc]").setAttribute("cx", xc); q("[data-pc]").setAttribute("cy", yc); q("[data-pi]").setAttribute("cx", xc); q("[data-pi]").setAttribute("cy", yi);
    const poner = (s, x, y, txt) => { const e = q(s); e.style.left = x / W * 100 + "%"; e.style.top = y / H * 100 + "%"; e.textContent = txt; };
    poner("[data-tc]", xc - 14, yc - 22, euros(aporte * ce_));
    poner("[data-ti]", xc - 14, yi + 26, euros(aporte * ie));
    poner("[data-tg]", (L + xc) / 2 + (xc - L) * 0.18, (yc + yi) / 2 + 10, "Diferencia: " + euros(aporte * (ce_ - ie)));
    q("[data-tg]").style.opacity = yi - yc > 70 ? 1 : 0;
  };
  const animar = () => {
    const s = estado.current; cancelAnimationFrame(s.raf);
    if (prefiereMenosMovimiento()) { s.yv = s.meta; dibujar(s.yv); return; }
    const paso = () => { s.yv += (s.meta - s.yv) * 0.08; if (Math.abs(s.meta - s.yv) < 0.01) s.yv = s.meta; dibujar(s.yv); if (s.yv !== s.meta) s.raf = requestAnimationFrame(paso); };
    s.raf = requestAnimationFrame(paso);
  };
  useEffect(() => { estado.current.meta = anios; if (estado.current.visto) animar(); else dibujar(estado.current.yv); }, [anios, aporte]);
  useEffect(() => {
    const el = ref.current, s = estado.current;
    const io = new IntersectionObserver(es => {
      if (es[0].isIntersecting) { if (!s.visto) { s.visto = true; s.yv = 0.25; animar(); } }
      else { s.visto = false; cancelAnimationFrame(s.raf); s.yv = 0.25; dibujar(0.25); }
    }, { threshold: 0.35 });
    io.observe(el);
    const caja = el.querySelector(".mp-grafico3d");
    const mover = e => { if (prefiereMenosMovimiento()) return; const r = caja.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; caja.classList.add("mp-siguiendo"); caja.style.setProperty("--mp-rx", (4 - y * 5) + "deg"); caja.style.setProperty("--mp-ry", (-3 + x * 7) + "deg"); };
    const salir = () => { caja.classList.remove("mp-siguiendo"); caja.style.removeProperty("--mp-rx"); caja.style.removeProperty("--mp-ry"); };
    caja.addEventListener("pointermove", mover); caja.addEventListener("pointerleave", salir);
    return () => { io.disconnect(); cancelAnimationFrame(s.raf); caja.removeEventListener("pointermove", mover); caja.removeEventListener("pointerleave", salir); };
  }, []);
  const svg = (extra, hijos) => ce("svg", { viewBox: "0 0 800 380", className: "mp-capa-svg " + extra, "aria-hidden": "true" }, hijos);
  return ce("div", { ref, className: "mp-grafico3d-marco" },
    ce("div", { className: "mp-grafico3d", role: "img", "aria-label": "Evolución de tu dinero con inflación frente a interés compuesto" },
      svg("mp-capa-fondo", [
        ...[0, 1, 2, 3, 4].map(k => ce("line", { key: "g" + k, x1: L, x2: R, y1: T + (B - T) * k / 4, y2: T + (B - T) * k / 4, stroke: "rgba(199,210,254,.12)" })),
        ce("line", { key: "b", "data-base": "", x1: L, x2: R, stroke: "rgba(199,210,254,.45)", strokeWidth: 1.5, strokeDasharray: "6 6" }),
        ce("text", { key: "bt", "data-base-t": "", x: 56, fill: "#C7D2FE", fontSize: 13 }, "Tu dinero hoy"),
        ce("g", { key: "a", "data-anios": "", fill: "#C7D2FE", fontSize: 13, textAnchor: "middle" })]),
      svg("", [
        ce("defs", { key: "d" }, ce("linearGradient", { id: "mpAreaInfl", x1: 0, y1: 0, x2: 0, y2: 1 }, ce("stop", { offset: 0, stopColor: "#818CF8", stopOpacity: .55 }), ce("stop", { offset: 1, stopColor: "#818CF8", stopOpacity: .05 }))),
        ce("path", { key: "ar", "data-area": "", fill: "url(#mpAreaInfl)" })]),
      svg("mp-capa-frente", [
        ce("path", { key: "i", "data-i": "", fill: "none", stroke: "#FCD34D", strokeWidth: 4, strokeLinecap: "round" }),
        ce("path", { key: "c", "data-c": "", fill: "none", stroke: "#A5B4FC", strokeWidth: 5, strokeLinecap: "round" }),
        ce("circle", { key: "pi", "data-pi": "", r: 7, fill: "#FCD34D" }),
        ce("circle", { key: "pc", "data-pc": "", r: 8, fill: "#A5B4FC" })]),
      ce("span", { className: "mp-etiqueta mp-etiqueta-c", "data-tc": "" }),
      ce("span", { className: "mp-etiqueta mp-etiqueta-i", "data-ti": "" }),
      ce("span", { className: "mp-etiqueta mp-etiqueta-g", "data-tg": "" })));
}

/* ---------- Barras 3D (aportado frente a interés generado) ---------- */
// datos: [{ etiqueta, aportado, interes }]. escalaMax: valor que ocupa toda la altura. Es común a todos los gastos,
// así que las barras crecen tanto al subir los años como al subir la cuantía.
// Se montan columna a columna al aparecer y se animan con suavidad al cambiar.
function Barras3D({ datos, escalaMax }) {
  const marco = useRef(null), escena = useRef(null), cols = useRef([]);
  // Lo último que llegó por props. El bucle de animación lo lee siempre de aquí, así que nunca trabaja con datos
  // viejos (antes, si cambiabas la cuantía mientras las barras se estaban montando, seguía con los del principio).
  const ultimo = useRef(null); ultimo.current = { datos, escalaMax };
  const motor = useRef(null);
  const H = 300, ANCHO = 74 * 7 + 40;
  if (!motor.current) {
    const st = { p: [], montado: false, t0: 0, raf: 0, ult: 0, actual: [], escala: 0 };
    const maximoBonito = v => { if (v <= 0) return 1; const e = Math.pow(10, Math.floor(Math.log10(v))); return [1, 2, 5, 10].map(m => m * e).find(x => x >= v); };
    const facil = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    const meta = () => { const { datos: d, escalaMax: e } = ultimo.current; return e > 0 ? e : maximoBonito(Math.max(...d.map(x => x.aportado + x.interes), 1)); };
    const pintar = () => {
      const max = st.escala || meta();
      cols.current.forEach((c, i) => {
        const a = st.actual[i];
        if (!c || !c.a || !c.i || !a) return;
        const ha = Math.max(3, a.aportado / max * H), hi = Math.max(0, a.interes / max * H);
        const h = (ha + hi) * facil(st.p[i] || 0), hL = Math.min(h, ha), hU = Math.max(0, h - ha);
        c.a.style.transform = `scaleY(${Math.max(0.0001, hL / H)})`;
        c.i.style.transform = `translateY(${-hL}px) scaleY(${Math.max(0.0001, hU / H)})`;
      });
    };
    const bucle = ahora => {
      const d = ultimo.current.datos;
      const dt = st.ult ? Math.min(64, ahora - st.ult) : 16; st.ult = ahora;
      const k = prefiereMenosMovimiento() ? 1 : 1 - Math.exp(-dt / 150); // suavizado que no depende de los fotogramas por segundo
      let ocupado = false;
      const m = meta();
      if (!st.escala) st.escala = m;
      st.escala += (m - st.escala) * k;
      if (Math.abs(m - st.escala) > m * 0.002) ocupado = true; else st.escala = m;
      st.actual.length = d.length;
      d.forEach((x, i) => {
        const a = st.actual[i] || (st.actual[i] = { aportado: 0, interes: 0 });
        a.aportado += (x.aportado - a.aportado) * k; a.interes += (x.interes - a.interes) * k;
        if (Math.abs(x.aportado - a.aportado) + Math.abs(x.interes - a.interes) > 0.5) ocupado = true; else { a.aportado = x.aportado; a.interes = x.interes; }
      });
      if (st.montado) d.forEach((_, i) => {
        const u = Math.min(1, Math.max(0, (ahora - st.t0 - i * 200) / 1300));
        if (u > (st.p[i] || 0)) st.p[i] = u;
        if ((st.p[i] || 0) < 1) ocupado = true;
      });
      pintar();
      st.raf = ocupado ? requestAnimationFrame(bucle) : 0;
    };
    const arrancar = () => { if (!st.raf) { st.ult = 0; st.raf = requestAnimationFrame(bucle); } };
    motor.current = { st, pintar, arrancar };
  }
  // Cada vez que cambian los datos o la escala se avisa al bucle (que siempre es el mismo y lee lo último)
  useEffect(() => {
    const { st, arrancar } = motor.current;
    if (st.montado) datos.forEach((_, i) => { if (st.p[i] === undefined) st.p[i] = 1; }); // una columna nueva aparece ya montada
    arrancar();
  }, [datos, escalaMax]);
  useEffect(() => {
    const { st, pintar, arrancar } = motor.current;
    const encajar = () => { const m = marco.current, k = Math.min(1, m.clientWidth / (ANCHO + 40)); escena.current.style.transform = `translateX(${(m.clientWidth - ANCHO * k) / 2}px) scale(${k})`; m.style.height = (H + 110) * k + "px"; };
    const ro = new ResizeObserver(encajar); ro.observe(marco.current); encajar();
    const io = new IntersectionObserver(es => {
      const e = es[0];
      if (e.intersectionRatio >= 0.5 && !st.montado) {
        st.montado = true;
        if (prefiereMenosMovimiento()) { st.p = ultimo.current.datos.map(() => 1); arrancar(); return; }
        st.t0 = performance.now(); arrancar();
      } else if (!e.isIntersecting && e.boundingClientRect.top > 0 && st.montado) { st.montado = false; st.p = []; pintar(); }
    }, { threshold: [0, 0.5] });
    io.observe(escena.current);
    arrancar();
    return () => { ro.disconnect(); io.disconnect(); cancelAnimationFrame(st.raf); st.raf = 0; };
  }, []);
  const prisma = (clase, ref) => ce("div", { className: "mp-prisma " + clase, ref, style: { height: H } }, ce("div", { className: "mp-cara-f" }), ce("div", { className: "mp-cara-r" }), ce("div", { className: "mp-cara-t" }));
  return ce("div", { ref: marco, className: "mp-barras-marco" },
    ce("div", { ref: escena, className: "mp-barras-escena", role: "img", "aria-label": "Gráfico de lo aportado frente a lo generado por el interés, año a año" },
      ce("div", { className: "mp-barras-iso" },
        ce("div", { className: "mp-barras-suelo" }),
        datos.map((d, i) => {
          const r = cols.current[i] || (cols.current[i] = {});
          return ce("div", { key: i, className: "mp-col", style: { left: 20 + i * 74 + "px" } },
            prisma("mp-p-aportado", el => { r.a = el; }),
            prisma("mp-p-interes", el => { r.i = el; }),
            ce("div", { className: "mp-col-etiqueta" }, d.etiqueta));
        }))));
}

// Rentabilidad del simulador de gastos innecesarios (la misma que la sección de inflación). No cambia TASA_INDICE_GLOBAL.
const TASA_HORMIGA = 8;
// Escala común de las barras: lo que acumularías a 30 años con el más alto de los gastos de ejemplo.
const ESCALA_HORMIGA = proyeccionInteres(0, Math.max(...GASTOS_HORMIGA_EJEMPLOS.map(g => g.valor)), TASA_HORMIGA, 30).valorFuturo;

/* ---------- Un pequeño experimento: gastos innecesarios ---------- */
// Recorrido sencillo: primero se pide pensar en un gasto innecesario; después se elige en un desplegable (o se escribe
// uno propio), se indica cuánto se gasta al mes y desde hace cuánto tiempo, y se calcula automáticamente lo que ha
// supuesto ese gasto y lo que habría dado invertido al 8 % con interés compuesto (lo aportado y lo generado).
// No se guarda nada de lo que se escribe aquí.
export function GastoHormigaSection() {
  const [tipo, setTipo] = useState("");
  const [otro, setOtro] = useState("");
  const [gasto, setGasto] = useState(0);
  const [orientativo, setOrientativo] = useState(false);
  const [anios, setAnios] = useState(5);
  const ejemplo = GASTOS_HORMIGA_EJEMPLOS.find(g => g.label === tipo);
  const nombreGasto = tipo === "otro" ? (otro.trim() ? "«" + otro.trim() + "»" : "ese gasto") : ejemplo ? "«" + ejemplo.label.toLowerCase() + "»" : "ese gasto";
  const elegir = valor => {
    setTipo(valor);
    const ej = GASTOS_HORMIGA_EJEMPLOS.find(g => g.label === valor);
    if (ej) { setGasto(ej.valor); setOrientativo(true); } else { setOrientativo(false); }
  };
  const proyeccion = useMemo(() => proyeccionInteres(0, gasto, TASA_HORMIGA, anios), [gasto, anios]);
  // Hasta 7 columnas repartidas entre el primer y el último año (mismos cálculos que el resumen)
  const columnas = useMemo(() => {
    const total = Math.max(1, Math.round(anios)), n = Math.min(7, total);
    const años = Array.from(new Set(Array.from({ length: n }, (_, k) => Math.max(1, Math.round(total * (k + 1) / n)))));
    return años.map(a => {
      const p = proyeccionInteres(0, gasto, TASA_HORMIGA, a);
      return { etiqueta: a + (a === 1 ? " año" : " años"), aportado: Math.round(p.totalAportado), interes: Math.max(0, Math.round(p.valorFuturo - p.totalAportado)) };
    });
  }, [gasto, anios]);
  // Escala común: la de los gastos de ejemplo a 30 años (si escribes un gasto mayor, se amplía para que quepa)
  const escala = useMemo(() => Math.max(ESCALA_HORMIGA, proyeccionInteres(0, gasto, TASA_HORMIGA, 30).valorFuturo), [gasto]);
  const listo = tipo !== "" && gasto > 0;
  const pctInteres = proyeccion.valorFuturo > 0 ? proyeccion.interesGenerado / proyeccion.valorFuturo * 100 : 0;
  const cifra = useRef(null), cifraA = useRef(null), cifraI = useRef(null);
  useEffect(() => {
    contarHasta(cifra.current, listo ? proyeccion.valorFuturo : 0, euros);
    contarHasta(cifraA.current, listo ? proyeccion.totalAportado : 0, euros);
    contarHasta(cifraI.current, listo ? proyeccion.interesGenerado : 0, euros);
  }, [listo, proyeccion.valorFuturo, proyeccion.totalAportado, proyeccion.interesGenerado]);
  return ce("section", { className: "mp-seccion mp-superficie mp-sans" },
    ce("div", { className: "mp-ancho" },
      ce("div", { className: "mp-hormiga-rejilla" },
        ce(Aparece, { className: "mp-hormiga-izq" },
          ce("p", { className: "mp-antetitulo" }, "Un pequeño experimento"),
          ce("h2", { className: "mp-h2" }, "Piensa en un gasto totalmente evitable"),
          ce("p", { className: "mp-sub" }, "Algo prescindible, que podrías dejar mañana sin echarlo de menos: innecesario, que te perjudica o que pagas casi sin darte cuenta. Tómate un momento: ¿cuál es el tuyo?"),
          ce("div", { className: "mp-hormiga-form" },
            ce("div", null,
              ce("label", { className: "mp-etiqueta-campo", htmlFor: "mp-hormiga-tipo" }, "¿Cuál es ese gasto?"),
              ce("select", { id: "mp-hormiga-tipo", className: "mp-select", value: tipo, onChange: e => elegir(e.target.value) },
                ce("option", { value: "", disabled: true }, "Elige un gasto…"),
                GASTOS_HORMIGA_EJEMPLOS.map(g => ce("option", { key: g.label, value: g.label }, g.label)),
                ce("option", { value: "otro" }, "Otro gasto (escríbelo tú)"))),
            tipo === "otro" && ce("div", { className: "fade-switch-enter" },
              ce("label", { className: "mp-etiqueta-campo", htmlFor: "mp-hormiga-otro" }, "Escribe tu gasto"),
              ce("input", { id: "mp-hormiga-otro", type: "text", className: "mp-campo-texto", value: otro, maxLength: 60, placeholder: "Por ejemplo: lotería", onChange: e => setOtro(e.target.value) })),
            tipo !== "" && ce("div", { className: "fade-switch-enter" },
              ce(NumberField, { label: "¿Cuánto crees que gastas al mes en esto?", value: gasto, onChange: v => { setGasto(v); setOrientativo(false); } }),
              orientativo && ce("p", { className: "mp-hormiga-pista-campo" }, "Es un valor orientativo: cámbialo por lo que gastas tú.")),
            tipo !== "" && ce("div", { className: "fade-switch-enter" },
              ce("label", { className: "mp-etiqueta-campo", htmlFor: "mp-hormiga-anios" }, "¿Cuánto tiempo llevas con este gasto?"),
              ce("input", { id: "mp-hormiga-anios", type: "range", min: "1", max: "30", value: anios, onChange: e => setAnios(Number(e.target.value)), className: "mp-rango" }),
              ce("div", { className: "mp-rango-valor" }, anios, anios === 1 ? " año" : " años"))),
          listo && ce("div", { className: "mp-hormiga-total fade-switch-enter" },
            ce("p", { className: "mp-hormiga-total-et" }, "Invertido al " + TASA_HORMIGA + " % durante " + anios + (anios === 1 ? " año" : " años") + ", hoy tendrías"),
            ce("p", { className: "mp-num mp-hormiga-cifra", ref: cifra }),
            ce("div", { className: "mp-reparto" },
              ce("div", null, ce("span", null, ce("i", { className: "mp-c-aportado" }), "Lo que te ha costado"), ce("strong", { className: "mp-num", ref: cifraA })),
              ce("div", null, ce("span", null, ce("i", { className: "mp-c-interes" }), "Lo que habría generado"), ce("strong", { className: "mp-num", ref: cifraI }))),
            ce("div", { className: "mp-reparto-barra", "aria-hidden": "true" },
              ce("b", { className: "mp-c-aportado", style: { width: 100 - pctInteres + "%" } }), ce("b", { className: "mp-c-interes", style: { width: pctInteres + "%" } })),
            ce("p", { className: "mp-reparto-nota" }, "El interés compuesto habría generado ", ce("strong", null, Math.round(pctInteres), " %"), " de todo ese dinero."),
            ce("div", { className: "mp-hormiga-texto" },
              ce("p", null, "En ", ce("b", null, anios, anios === 1 ? " año" : " años"), ", ", nombreGasto, " te ha costado ", ce("b", null, euros(proyeccion.totalAportado)), " (", euros(gasto), " al mes)."),
              ce("p", null, "Si ese dinero lo hubieras invertido en un índice con las empresas más grandes del mundo, con una rentabilidad media aproximada del ", TASA_HORMIGA, " % anual, hoy tendrías ", ce("b", null, euros(proyeccion.valorFuturo)), ": ", euros(proyeccion.totalAportado), " que pusiste tú y ", ce("b", { className: "mp-verde" }, euros(proyeccion.interesGenerado)), " que habría generado el interés compuesto.")))),
        ce(Aparece, { className: "mp-hormiga-der", retraso: 0.12 },
          ce(Barras3D, { datos: columnas, escalaMax: escala }),
          !listo && ce("p", { className: "mp-hormiga-pista" }, "Elige tu gasto y verás cuánto habría crecido ese dinero año a año."))),
      ce("p", { className: "mp-nota" }, "Proyección educativa con la rentabilidad histórica media de un índice global. Rentabilidades pasadas no garantizan resultados futuros.")));
}

/* ---------- ¿Qué pasa con 1.000 € si no haces nada? ---------- */
export function PoderAdquisitivoSection() {
  const [anios, setAnios] = useState(10);
  const [aporte, setAporte] = useState(1000);
  const inflacion = 2.5;
  const rentabilidad = 8;
  const valorInflacion = aporte / Math.pow(1 + inflacion / 100, anios);
  const valorCompuesto = aporte * Math.pow(1 + rentabilidad / 100, anios);
  const cifraInfl = useRef(null), cifraComp = useRef(null);
  useEffect(() => { contarHasta(cifraInfl.current, valorInflacion, euros); contarHasta(cifraComp.current, valorCompuesto, euros); }, [valorInflacion, valorCompuesto]);
  return ce("section", { className: "mp-seccion mp-oscura mp-sans", id: "inflacion" },
    ce("div", { className: "mp-ancho" },
      ce(Aparece, null,
        ce("p", { className: "mp-antetitulo" }, "Un minuto que puede cambiar tu perspectiva"),
        ce("h2", { className: "mp-h2" }, "¿Qué pasa con ", euros(aporte), " si no haces nada?"),
        ce("p", { className: "mp-sub" }, "La inflación reduce el poder de compra. La capitalización, en cambio, puede hacer crecer un capital con el tiempo. No es una promesa de rentabilidad: es una demostración sencilla del efecto matemático.")),
      ce("div", { className: "mp-infl-rejilla" },
        ce(Aparece, { className: "mp-infl-control" },
          ce("label", { htmlFor: "mp-infl-cap" }, "Cantidad: ", ce("span", null, euros(aporte))),
          ce("input", { id: "mp-infl-cap", "aria-label": "Cantidad inicial", type: "range", min: "500", max: "20000", step: "500", value: aporte, onChange: e => setAporte(+e.target.value), className: "mp-rango" }),
          ce("label", { htmlFor: "mp-infl-anios" }, "Horizonte: ", ce("span", null, anios, " años")),
          ce("input", { id: "mp-infl-anios", "aria-label": "Horizonte temporal", type: "range", min: "1", max: "30", value: anios, onChange: e => setAnios(+e.target.value), className: "mp-rango" })),
        ce("div", { className: "mp-infl-valores" },
          ce(Aparece, { className: "mp-valor" },
            ce("h3", null, "Si la inflación fuese ", inflacion, "%"),
            ce("p", { className: "mp-num mp-valor-cifra", ref: cifraInfl }),
            ce("p", { className: "mp-valor-delta mp-ambar" }, "Pierdes ", euros(aporte - valorInflacion), " de poder de compra"),
            ce("p", { className: "mp-valor-nota" }, "Lo que hoy compras con ", euros(aporte), " requeriría más dinero en el futuro.")),
          ce(Aparece, { className: "mp-valor", retraso: 0.12 },
            ce("h3", null, "Si creciera al ", rentabilidad, "%"),
            ce("p", { className: "mp-num mp-valor-cifra", ref: cifraComp }),
            ce("p", { className: "mp-valor-delta mp-lavanda" }, "Ganas ", euros(valorCompuesto - aporte)),
            ce("p", { className: "mp-valor-nota" }, "Aquí solo mostramos el efecto del interés compuesto; los mercados reales fluctúan.")))),
      ce(Aparece, null, ce(GraficoInflacion3D, { anios, aporte, inflacion, rentabilidad })),
      ce("div", { className: "mp-leyenda" },
        ce("span", null, ce("i", { style: { background: "#FCD34D" } }), "Poder de compra"),
        ce("span", null, ce("i", { style: { background: "#A5B4FC" } }), "Interés compuesto"))));
}

/* ---------- Qué vas a conseguir (tus tres herramientas) ---------- */
function TarjetaHerramienta({ n, k, t, desc, Icon, i }) {
  const ref = useInclinacion(14);
  return ce(Aparece, { retraso: i * 0.12, className: "mp-herr-hueco" },
    ce("div", { ref, className: "mp-herr mp-inclina" },
      ce("span", { className: "mp-brillo", "aria-hidden": "true" }),
      ce("span", { className: "mp-herr-num mp-num", "aria-hidden": "true" }, n),
      ce("span", { className: "mp-herr-icono" }, ce(Icon, { size: 30, color: C.sand })),
      ce("p", { className: "mp-herr-k" }, k),
      ce("h3", { className: "mp-herr-t" }, t),
      ce("p", { className: "mp-herr-d" }, desc)));
}
export function HowItWorksSection() {
  const steps = [["01", "Tu radiografía", "Diagnóstico interactivo", "Entenderás ingresos, gastos, ahorro, colchón y deuda sin enfrentarte a un formulario interminable.", I.chartLine], ["02", "Tu perfil", "Test adaptativo", "Tus respuestas se adaptan a ti y conectan el riesgo con tus objetivos y horizonte.", I.target], ["03", "Tu mapa", "Estrategia y simuladores", "Convertirás los datos en decisiones: objetivos, escenarios y acciones que puedas ejecutar.", I.compass]];
  return ce("section", { className: "mp-seccion mp-sans" },
    ce("div", { className: "mp-ancho" },
      ce(Aparece, { className: "mp-cabecera" },
        ce("p", { className: "mp-antetitulo" }, "Qué vas a conseguir"),
        ce("h2", { className: "mp-h2" }, "De entender tu dinero a saber qué hacer con él."),
        ce("p", { className: "mp-sub" }, "El objetivo no es darte una puntuación y dejarte solo. Es ", ce("b", null, "educarte, darte contexto y convertirlo en un plan accionable."))),
      ce("div", { className: "mp-herr-rejilla" }, steps.map(([n, k, t, desc, Icon], i) => ce(TarjetaHerramienta, { key: n, n, k, t, desc, Icon, i })))));
}

/* ---------- Mis finanzas: cuentas, inversiones y patrimonio en una sola página ---------- */
// Las tres pantallas de antes, unidas en una página larga que explica cada parte, como la introducción.
// Los bloques llegan ya construidos desde App.js: son los componentes de siempre, con su lógica intacta.
// "seccion" indica a qué parte bajar al entrar: "cuentas", "inversiones", "patrimonio" o "mis-finanzas" (arriba del todo).
// Así, todos los botones que antes llevaban a Cuentas, Inversiones o Patrimonio siguen funcionando.
export const VISTAS_MIS_FINANZAS = ["mis-finanzas", "cuentas", "inversiones", "patrimonio"];
// Páginas que ya tienen el diseño nuevo: usan el fondo blanco del prototipo, sin el tono gris azulado ni el dibujo
// de líneas. Cada vez que se rediseñe otra página, basta con añadirla aquí.
export const VISTAS_REDISENADAS = ["inicio", "diagnostico", ...VISTAS_MIS_FINANZAS, "estrategia", "plan", "seguimiento", "simulador", "simulador-deudas", "blog", "quienes-somos", "aviso-legal", "contacto"];
const BLOQUES_MF = [
  ["cuentas", "1", "Tu liquidez", "Tus cuentas", "Añade tus cuentas bancarias manualmente para ver tu liquidez total consolidada. No conectamos con tu banco: tú decides qué saldo introducir y cuándo actualizarlo.", "Si una de tus cuentas es tu colchón para imprevistos, márcala como fondo de emergencia al añadirla."],
  ["inversiones", "2", "Tu cartera", "Tus inversiones", "Añade tus acciones, fondos, ETFs u otros productos con lo que has aportado y la ganancia o pérdida acumulada; nosotros calculamos el valor actual. Los datos no se actualizan solos: revísalos cuando quieras.", null],
  ["patrimonio", "3", "Tu foto completa", "Tu patrimonio neto", "Todo lo que tienes (cuentas, inversiones y otros bienes) menos todo lo que debes. Se actualiza automáticamente según lo que registres en Cuentas, Inversiones, Deudas y aquí abajo.", "Aquí también puedes añadir otros bienes, como tu vivienda o tu coche."]
];
const PIEZAS_MF = [
  ["1", "Tu liquidez", "Cuentas", "El dinero que puedes usar hoy: tu cuenta nómina, tu cuenta de ahorro o tu efectivo. Es la base de tu colchón para imprevistos.", I.wallet],
  ["2", "Tu cartera", "Inversiones", "Lo que has puesto a trabajar: acciones, fondos o ETFs. Apuntas lo aportado y la ganancia o pérdida, y calculamos su valor actual.", I.chartLine],
  ["3", "Tu foto completa", "Patrimonio neto", "Todo lo que tienes, incluidos otros bienes como tu vivienda, menos todo lo que debes. Es la cifra que resume tu situación.", I.shieldCheck]
];
export function MisFinanzas({ seccion, cuentas, inversiones, patrimonio }) {
  const bloques = { cuentas, inversiones, patrimonio };
  const rCuentas = useRef(null), rInversiones = useRef(null), rPatrimonio = useRef(null);
  const refs = { cuentas: rCuentas, inversiones: rInversiones, patrimonio: rPatrimonio };
  const [activa, setActiva] = useState("cuentas");
  const comportamiento = () => prefiereMenosMovimiento() ? "auto" : "smooth";
  const ir = id => { const el = refs[id] && refs[id].current; if (el) el.scrollIntoView({ behavior: comportamiento(), block: "start" }); };
  // Al entrar (o al pulsar un enlace a Cuentas, Inversiones o Patrimonio) baja hasta esa parte.
  // Se espera un instante para no chocar con la subida al principio que hace la app al cambiar de pantalla.
  useEffect(() => {
    const t = setTimeout(() => { if (seccion === "mis-finanzas") window.scrollTo({ top: 0, behavior: comportamiento() }); else ir(seccion); }, 80);
    return () => clearTimeout(t);
  }, [seccion]);
  // El índice de arriba marca la parte que estás leyendo
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setActiva(e.target.getAttribute("data-bloque")); }), { rootMargin: "-40% 0px -55% 0px" });
    Object.values(refs).forEach(r => r.current && io.observe(r.current));
    return () => io.disconnect();
  }, []);
  return ce(React.Fragment, null,
    ce("nav", { className: "mp-mf-indice mp-sans", "aria-label": "Partes de la página" },
      ce("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 mp-mf-indice-fila" },
        BLOQUES_MF.map(([id, n, , titulo]) => ce("button", {
          key: id, type: "button", onClick: () => ir(id), "aria-current": activa === id ? "true" : undefined,
          className: "mp-mf-chip" + (activa === id ? " mp-mf-chip-activo" : "")
        }, ce("b", null, n), titulo)))),
    ce("section", { className: "mp-seccion mp-sans mp-mf-intro" },
      ce("div", { className: "max-w-6xl mx-auto px-4 sm:px-6" },
        ce(Aparece, { className: "mp-cabecera" },
          ce("p", { className: "mp-antetitulo" }, "Por qué tenerlo todo junto"),
          ce("h2", { className: "mp-h2" }, "Tres piezas para ver tu foto completa"),
          ce("p", { className: "mp-sub" }, "El diagnóstico muestra cómo entra y sale tu dinero cada mes. Aquí ves cuánto tienes ya y dónde está. No hace falta rellenarlo todo: cada pieza que añadas afina tus resultados.")),
        ce("div", { className: "mp-herr-rejilla" }, PIEZAS_MF.map(([n, k, t, desc, Icon], i) => ce(TarjetaHerramienta, { key: n, n, k, t, desc, Icon, i }))))),
    BLOQUES_MF.map(([id, n, ante, titulo, texto, consejo], i) => ce(React.Fragment, { key: id },
      i === 1 && ce(CapaTransicion, { id: "mp-capa-mf", retraso: 3000, lineas: ["Del dinero que guardas", "al dinero que trabaja."], frase: "Lo que tienes en tus cuentas y lo que has puesto a crecer forman, juntos, tu patrimonio.",
        iconos: [["moneda", -0.82, 0.42, 0.9, 0.3], ["flecha", 0.8, 0.46, 0.9, -0.4], ["barras", 0.68, -0.5, 0.8, 0.6], ["moneda", -0.64, -0.5, 0.75, 1.4], ["billete", -0.94, 0, 0.7, 0.9], ["flecha", 0.94, 0, 0.65, 2.2]] }),
      ce("div", { ref: refs[id], "data-bloque": id, id: "mf-" + id, className: "mp-mf-bloque mp-sans" },
        ce("div", { className: "max-w-4xl mx-auto px-4 sm:px-6" },
          ce(Aparece, { className: "mp-mf-cabeza" },
            ce("p", { className: "mp-antetitulo" }, n + " · " + ante),
            ce("h2", { className: "mp-h2" }, titulo),
            ce("p", { className: "mp-sub" }, texto),
            consejo && ce("p", { className: "mp-mf-consejo" }, consejo))),
        bloques[id]))));
}

/* ---------- Motivos: por qué importa la salud financiera ---------- */
function Motivo({ t, gancho }) {
  const Icon = t.icon;
  const det = useRef(null), mas = useRef(null);
  // La frase final de cada texto es el mensaje clave; el resto se despliega con el gancho
  const corte = t.texto.lastIndexOf(". ", t.texto.length - 2);
  const cuerpo = t.texto.slice(0, corte + 1), clave = t.texto.slice(corte + 2);
  const alPulsar = e => {
    const d = det.current, b = mas.current;
    if (prefiereMenosMovimiento() || !b.animate) return;
    e.preventDefault();
    if (d.open) { const h = b.offsetHeight; b.animate([{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0, transform: "perspective(800px) rotateX(-25deg)" }], { duration: 420, easing: "cubic-bezier(.4,0,.2,1)" }).onfinish = () => { d.open = false; }; }
    else {
      d.open = true; const h = b.offsetHeight;
      b.animate([{ height: "0px", opacity: 0, transform: "perspective(800px) rotateX(-25deg)" }, { height: h + "px", opacity: 1, transform: "none" }], { duration: 650, easing: "cubic-bezier(.2,.8,.2,1)" });
      Array.from(b.children).forEach((c, i) => c.animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 500, delay: 120 + i * 110, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" }));
    }
  };
  return ce(Aparece, { as: "li", className: "mp-motivo" },
    ce("span", { className: "mp-motivo-icono" }, ce(Icon, { size: 26, color: C.sand })),
    ce("div", null,
      ce("h3", { className: "mp-motivo-t" }, t.titulo),
      ce("p", { className: "mp-motivo-clave" }, clave),
      ce("details", { ref: det, className: "mp-motivo-mas" },
        ce("summary", { onClick: alPulsar }, gancho),
        ce("div", { ref: mas, className: "mp-motivo-cuerpo" }, ce("p", null, cuerpo), ce("p", { className: "mp-motivo-fuente" }, t.fuente)))));
}

/* ---------- Moneda 3D con grosor (llamada final) ---------- */
function Moneda3D() {
  return ce("div", { className: "mp-moneda-escena", "aria-hidden": "true" },
    ce("div", { className: "mp-moneda" },
      Array.from({ length: 17 }, (_, k) => ce("div", { key: k, className: "mp-moneda-canto", style: { transform: `translateZ(${k - 8}px)` } })),
      ce("div", { className: "mp-moneda-cara mp-num", style: { transform: "translateZ(9px)" } }, "€"),
      ce("div", { className: "mp-moneda-cara mp-num", style: { transform: "rotateY(180deg) translateZ(9px)" } }, "€")));
}

/* ---------- Quiénes somos ---------- */
// Los textos de siempre, con el diseño nuevo: presentación, autor, los tres objetivos (tarjetas que se inclinan)
// y un cierre oscuro con el correo de contacto.
const PILARES_QS = [
  ["1", "Tranquilidad", "Comprar tranquilidad", "Construyendo un escudo contra los imprevistos para blindar a tu familia y reducir tu ansiedad.", I.shieldCheck],
  ["2", "Deudas", "Salir de las deudas", "Trazando planes exactos (como la bola de nieve o la avalancha) para que recuperes tu margen mensual.", I.target],
  ["3", "Tiempo", "Poner el tiempo a tu favor", "Demostrando con datos reales cómo el interés compuesto y las decisiones tempranas pueden multiplicar tu patrimonio sin que sientas que sacrificas tu calidad de vida actual.", I.chartLine]
];
export function QuienesSomos() {
  const cierre = useInclinacion(6);
  return ce(React.Fragment, null,
    ce("section", { className: "mp-seccion mp-sans" },
      ce("div", { className: "max-w-6xl mx-auto px-4 sm:px-6" },
        ce(Aparece, { as: "p", className: "mp-qs-intro" }, "Detrás de MoneyPilot hay un proyecto nacido de una realidad muy común: la falta de educación financiera genera estrés crónico y decisiones equivocadas. Somos desarrolladores y entusiastas de las finanzas personales que creemos firmemente que la tecnología debe servir para democratizar el bienestar económico."),
        ce(Aparece, { className: "mp-qs-autor", retraso: 0.1 },
          ce("span", { className: "mp-qs-avatar", "aria-hidden": "true" }, "ÓB"),
          ce("p", null, "MoneyPilot está creado y mantenido por ", ce("strong", null, "Óscar Baca Martínez"), ", estudiante de Economía y apasionado de los mercados financieros, con más de 2 años gestionando su propia cartera en acciones y otros productos financieros.")),
        ce(Aparece, { className: "mp-cabecera mp-qs-objetivo" },
          ce("h2", { className: "mp-h2" }, "Cuál es nuestro objetivo."),
          ce("p", { className: "mp-sub" }, "Nuestro propósito no es darte una simple hoja de cálculo matemática, sino educar, dar contexto y crear un plan de acción. Queremos ayudarte a:")),
        ce("div", { className: "mp-herr-rejilla" }, PILARES_QS.map(([n, k, t, desc, Icon], i) => ce(TarjetaHerramienta, { key: n, n, k, t, desc, Icon, i }))))),
    ce("section", { className: "mp-seccion mp-sans mp-qs-cierre-hueco" },
      ce("div", { className: "mp-ancho mp-cta-hueco" },
        ce(Aparece, null,
          ce("div", { ref: cierre, className: "mp-cta mp-inclina" },
            ce("div", { className: "mp-cta-luz", "aria-hidden": "true" }),
            ce("div", { className: "mp-cta-texto" },
              ce("h2", { className: "mp-h2 mp-qs-frase" }, "En definitiva, nuestro objetivo es acompañarte para que dejes de sobrevivir a fin de mes y empieces a diseñar tu libertad financiera."),
              ce("p", { className: "mp-cta-copia" }, "Puedes escribirnos a soportemoneypilot@gmail.com para cualquier duda, sugerencia o colaboración."),
              ce("a", { href: "mailto:soportemoneypilot@gmail.com", className: "mp-boton mp-boton-claro" }, "Escribir a soportemoneypilot@gmail.com")),
            ce(Moneda3D, null))))));
}

export function HeroSection({
  onStart
}) {
  const tarjetasCientificas = [{
    icon: I.wallet,
    titulo: "Comprar tranquilidad frente a los imprevistos",
    texto: "No llegar a fin de mes no solo te priva de comprar cosas; actúa como un amplificador del dolor psicológico. Analizando medio millón de encuestas, se demostró que la escasez financiera multiplica el malestar ante cualquier desgracia cotidiana (una enfermedad, una avería, un mal día). Los datos confirman que cuando tus ahorros caen por debajo de tu umbral de seguridad, tu sufrimiento emocional se dispara drásticamente. Recupera tu margen mensual: no es solo sumar euros, es construir un escudo contra el malestar.",
    fuente: "FUENTE: Universidad de Princeton (Premio Nobel Daniel Kahneman y Angus Deaton) y Wharton School de la Univ. de Pensilvania (Matthew Killingsworth)."
  }, {
    icon: I.shieldCheck,
    titulo: "Blindar a tu familia y ganar tiempo de vida",
    texto: "El desorden financiero destruye hogares. Las investigaciones concluyeron que las discusiones por dinero son la señal de alarma número uno de divorcio, superando incluso a la infidelidad. Por el contrario, se demuestra que las familias que organizan sus finanzas conjuntas adquieren una resiliencia que les permite tomar decisiones vitales menos desesperadas, como reducir jornadas o cambiar a trabajos que permitan una conciliación real. Toma el control de tus ingresos y gastos: el orden financiero es la base de la estabilidad familiar.",
    fuente: "FUENTE: Universidad Estatal de Utah (Dr. Jeffrey Dew) y estudios de Bienestar Financiero de la OCDE."
  }, {
    icon: I.rocket,
    titulo: "Frenar en seco el estrés crónico",
    texto: "La deuda no es solo un problema del banco, es una amenaza que tu cuerpo procesa como un peligro físico. Año tras año, se sitúa a las deudas como la fuente número uno de estrés crónico en adultos. Los investigadores descubrieron que el sobreendeudamiento eleva la presión arterial diastólica, dispara los síntomas depresivos y provoca ataques de ansiedad. Traza un plan exacto para liquidar tus deudas, frena el deterioro de tu salud y acelera hacia tu libertad.",
    fuente: "FUENTE: Asociación Americana de Psicología (APA, informe Stress in America), Universidad de Northwestern y Universidad de Nottingham."
  }, {
    icon: I.chartLine,
    titulo: "El coste de esperar (Multiplicar tu patrimonio)",
    texto: "Esperar a \"cobrar más\" para empezar a organizarte e invertir es la trampa financiera más cara. La evidencia demuestra que quienes empiezan a apartar dinero en sus primeros 5 a 10 años de carrera laboral acumulan entre 3 y 4 veces más patrimonio neto al llegar a la madurez que quienes esperan a los 35 o 40 años, aunque estos últimos ganen más dinero. Retrasar el ahorro una década obliga a triplicar el esfuerzo mensual de por vida para comprar una casa o asegurar tu futuro. Pon el tiempo a tu favor: cada año que ganas ahora te ahorrará una década de esfuerzo después.",
    fuente: "FUENTE: Universidad de Stanford y Wharton School (Dra. Annamaria Lusardi y Dra. Olivia Mitchell, NBER)."
  }, {
    icon: I.target,
    titulo: "Vencer tu cerebro y ahorrar sin sufrir",
    texto: "Ahorrar para una casa o para tu nivel de vida futuro no tiene por qué hundir tu calidad de vida actual. Nuestro cerebro sufre de \"sesgo del presente\" y prefiere gastar hoy, pero la ciencia económica encontró la solución: automatizar que una parte de tus futuras subidas de sueldo o dinero extra vaya directamente al ahorro antes de que te acostumbres a gastarlo. Este método demostró multiplicar la tasa de ahorro de un 3,5% a un altísimo 13,6% en menos de 4 años, sin que los participantes sintieran ninguna pérdida en su día a día. Sistematiza tus finanzas: multiplica tu capital sin sentir que te sacrificas.",
    fuente: "FUENTE: Universidad de Chicago (Premio Nobel Richard Thaler y Shlomo Benartzi)."
  }];
  const ganchos = ["¿Por qué un imprevisto duele el doble sin ahorro?", "Lo que el dinero hace dentro de una pareja", "Cómo procesa tu cuerpo una deuda", "Por qué esperar a cobrar más sale tan caro", "El truco para ahorrar sin notarlo"];
  const portada = useEscena3D((c, s, fallar) => esPantallaPequena() ? Promise.resolve(() => {}) : montarPortada3D(c, s, { alFallar: fallar }));
  const lista = useRef(null), barra = useRef(null);
  useEffect(() => {
    // Barra que se llena mientras lees los motivos
    const alScroll = () => { const r = lista.current && lista.current.getBoundingClientRect(); if (!r || !barra.current) return; barra.current.style.width = Math.max(0, Math.min(1, (window.innerHeight * 0.6 - r.top) / r.height)) * 100 + "%"; };
    window.addEventListener("scroll", alScroll, { passive: true }); alScroll();
    return () => window.removeEventListener("scroll", alScroll);
  }, []);
  const cta = useInclinacion(6);
  return ce(React.Fragment, null,
    /* 1 · Portada con escena 3D */
    ce("section", { ref: portada.caja, className: "mp-portada mp-sans" },
      ce("div", { className: "mp-portada-respaldo" + (portada.fallo ? " mp-respaldo-activo" : ""), "aria-hidden": "true" }),
      ce("canvas", { ref: portada.lienzo, className: "mp-lienzo", "aria-hidden": "true" }),
      ce("div", { className: "mp-portada-velo", "aria-hidden": "true" }),
      ce("div", { className: "mp-ancho mp-portada-cuerpo" },
        ce("div", { className: "mp-portada-texto" },
          ce("p", { className: "mp-portada-ante mp-sube", style: { "--mp-retraso": ".05s" } }, "Pon tu dinero en orden"),
          ce("h1", { className: "mp-portada-h1" },
            ce("span", { className: "mp-linea" }, ce("span", { style: { "--mp-retraso": ".1s" } }, "Tu salud financiera puesta a prueba:")),
            ce("span", { className: "mp-linea mp-portada-pregunta" }, ce("span", { style: { "--mp-retraso": ".2s" } }, "¿sientes que el dinero se te escapa y no sabes por qué?"))),
          ce("p", { className: "mp-portada-lead mp-sube", style: { "--mp-retraso": ".35s" } }, "No llegar a fin de mes, no saber en qué se va el sueldo o sentir que la deuda nunca baja es más común de lo que parece. Aquí puedes ver tu situación con claridad y recibir un plan sencillo para empezar a ordenarla, sin tecnicismos y sin que nadie te juzgue."),
          ce("div", { className: "mp-portada-acciones mp-sube", style: { "--mp-retraso": ".45s" } },
            ce("button", { type: "button", onClick: onStart, className: "mp-boton mp-boton-primario" }, "Ver mi situación financiera ", ce(I.arrowRight, { size: 16 })),
            ce("button", { type: "button", onClick: () => document.getElementById("evidencia")?.scrollIntoView({ behavior: prefiereMenosMovimiento() ? "auto" : "smooth", block: "start" }), className: "mp-boton mp-boton-fantasma" }, "Por qué importa la salud financiera")),
          ce("div", { className: "mp-portada-sellos mp-sube", style: { "--mp-retraso": ".55s" } },
            ce("span", null, ce(I.checkCircle, { size: 15, color: "#86EFAC" }), " Sin registro, gratis y en minutos"),
            ce("span", null, ce(I.chartLine, { size: 15, color: "#A5B4FC" }), " Resultados al momento"))))),

    /* 2 · Por qué importa: los cinco motivos con su fuente */
    ce("section", { id: "evidencia", className: "mp-seccion mp-sans scroll-mt-24" },
      ce("div", { className: "mp-ancho mp-motivos" },
        ce("div", { className: "mp-motivos-cabeza" },
          ce(Aparece, { className: "mp-motivos-fija" },
            ce("p", { className: "mp-antetitulo" }, "Por qué importa la salud financiera"),
            ce("h2", { className: "mp-h2" }, "¿Por qué importa tanto ordenar el dinero? Esto dice la investigación"),
            ce("p", { className: "mp-sub" }, "Cinco motivos respaldados por estudios de universidades y organismos de referencia. Cada uno incluye su fuente para que puedas comprobarlo."),
            ce("div", { className: "mp-progreso", "aria-hidden": "true" }, ce("span", { ref: barra })))),
        ce("ol", { ref: lista, className: "mp-motivos-lista" }, tarjetasCientificas.map((t, i) => ce(Motivo, { key: t.titulo, t, gancho: ganchos[i] }))))),

    /* 3 · Capa de transición hacia la inflación */
    ce(CapaTransicion, { id: "mp-capa-1", retraso: 3000, lineas: ["Lo que no se mueve,", "se encoge."], frase: "Así actúa la inflación sobre el dinero que tienes parado.",
      iconos: [["billete", -0.82, 0.42, 1, 0.3], ["tarjeta", 0.8, 0.5, 0.9, -0.5], ["billete", 0.66, -0.48, 0.8, 1.2], ["billete", -0.62, -0.52, 0.75, 2.1], ["tarjeta", -0.92, -0.02, 0.7, 0.9], ["billete", 0.94, 0.02, 0.7, -1.1]] }),
    ce(PoderAdquisitivoSection, null),

    /* 4 · Qué vas a conseguir */
    ce(HowItWorksSection, null),
    ce(SeccionReloj, null),
    ce(SeccionCapas, null),

    /* 5 · Capa de transición hacia el experimento del gasto hormiga */
    ce(CapaTransicion, { id: "mp-capa-2", retraso: 4500, lineas: ["El tiempo trabaja", "para quien empieza antes."], frase: "Mira cómo crece un ahorro constante, mes a mes.",
      iconos: [["flecha", -0.8, 0.4, 1, 0.2], ["barras", 0.8, 0.46, 0.9, -0.4], ["flecha", 0.7, -0.5, 0.8, -0.9], ["barras", -0.66, -0.5, 0.8, 0.6], ["moneda", -0.94, 0, 0.7, 1.4], ["flecha", 0.94, 0, 0.7, 2.2]] }),
    ce(GastoHormigaSection, null),

    /* 6 · Llamada final */
    ce("section", { className: "mp-seccion mp-sans" },
      ce("div", { className: "mp-ancho mp-cta-hueco" },
        ce(Aparece, null,
          ce("div", { ref: cta, className: "mp-cta mp-inclina" },
            ce("div", { className: "mp-cta-luz", "aria-hidden": "true" }),
            ce("div", { className: "mp-cta-texto" },
              ce("p", { className: "mp-antetitulo mp-antetitulo-claro" }, "Ahora te toca a ti"),
              ce("h2", { className: "mp-h2" }, "Da el primer paso. No hace falta que lo tengas todo claro."),
              ce("p", { className: "cta-final-copy mp-cta-copia" }, "Es gratis, no necesitas registrarte y puedes dejarlo cuando quieras. Solo tienes que responder con sinceridad; nosotros ordenamos el resto."),
              ce("button", { type: "button", onClick: onStart, className: "mp-boton mp-boton-claro" }, "Comenzar mi diagnóstico ", ce(I.arrowRight, { size: 17 }))),
            ce(Moneda3D, null))))));
}

export function ConfianzaPrivacidad() {
  return ce("div", { className: "mp-ancho mp-confianza-hueco mp-sans" },
    ce(Aparece, { className: "mp-confianza" },
      ce("span", { className: "mp-confianza-icono" }, ce(I.shieldCheck, { size: 22, color: C.salu })),
      ce("div", null,
        ce("b", null, "Tus datos se guardan solo en tu dispositivo salvo que crees una cuenta."),
        ce("p", null, "Puedes completar el diagnóstico con tranquilidad: la información se mantiene local y solo se sincroniza con la nube si eliges crear una cuenta."))));
}

export function PrivacyNotice() {
  return /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl px-4 py-3 text-xs",
    style: {
      backgroundColor: "rgba(16,185,129,0.07)",
      border: "1px solid rgba(16,185,129,0.18)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2.5"
  }, /*#__PURE__*/React.createElement(I.shieldCheck, {
    size: 16,
    color: C.salu,
    className: "shrink-0"
  }), /*#__PURE__*/React.createElement("p", {
    className: "leading-relaxed",
    style: {
      color: C.ink
    }
  }, "Tus datos se guardan de forma segura. ", /*#__PURE__*/React.createElement("a", {
    href: "/privacidad.html",
    target: "_blank",
    rel: "noopener",
    className: "font-bold underline",
    style: {
      color: C.salu
    }
  }, "Ver política de privacidad"))));
}

export function GastosTabs({
  datos,
  setDatos
}) {
  const gastosFijos = totalMensual(datos.gastosFijos);
  const gastosDisc = totalMensual(datos.gastosDiscrecionales);
  return /*#__PURE__*/React.createElement("div", {
    className: "grid lg:grid-cols-2 gap-4",
    "data-seq-group": "gastos"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rounded-2xl p-4",
    style: {
      backgroundColor: C.paper,
      border: "1px solid " + C.border
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold uppercase mb-2.5 flex items-center justify-between gap-2",
    style: {
      color: C.sand,
      letterSpacing: "0.06em"
    }
  }, /*#__PURE__*/React.createElement("span", null, "Gastos fijos / necesidades"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.ink,
      textTransform: "none",
      letterSpacing: "normal"
    }
  }, euros(gastosFijos), "/mes")), /*#__PURE__*/React.createElement("div", {
    className: "grid gap-2.5"
  }, GASTOS_FIJOS_DEF.map(f => /*#__PURE__*/React.createElement(FreqField, {
    key: f.key,
    label: f.label,
    data: datos.gastosFijos[f.key],
    onChange: v => setDatos({
      ...datos,
      gastosFijos: {
        ...datos.gastosFijos,
        [f.key]: v
      }
    })
  })))), /*#__PURE__*/React.createElement("div", {
    className: "rounded-2xl p-4",
    style: {
      backgroundColor: C.paper,
      border: "1px solid " + C.border
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold uppercase mb-2.5 flex items-center justify-between gap-2",
    style: {
      color: C.sand,
      letterSpacing: "0.06em"
    }
  }, /*#__PURE__*/React.createElement("span", null, "Gastos discrecionales / deseos"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.ink,
      textTransform: "none",
      letterSpacing: "normal"
    }
  }, euros(gastosDisc), "/mes")), /*#__PURE__*/React.createElement("div", {
    className: "grid gap-2.5"
  }, GASTOS_DISC_DEF.map(f => /*#__PURE__*/React.createElement(FreqField, {
    key: f.key,
    label: f.label,
    data: datos.gastosDiscrecionales[f.key],
    onChange: v => setDatos({
      ...datos,
      gastosDiscrecionales: {
        ...datos.gastosDiscrecionales,
        [f.key]: v
      }
    })
  })))));
}

export function AcordeonFase({
  numero,
  titulo,
  posts,
  abiertoPorDefecto,
  onAbrir,
  esAdmin,
  onEditar,
  onBorrar,
  onMover
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "rounded-2xl border overflow-hidden mb-3",
    style: {
      borderColor: C.border,
      backgroundColor: C.surface
    }
  },

  /*#__PURE__*/React.createElement("button", {
    onClick: onAbrir,
    className: "w-full text-left px-5 py-4 flex items-center justify-between gap-3",
    style: {
      backgroundColor: abiertoPorDefecto ? C.sandLight : "transparent"
    }
  },
    /*#__PURE__*/React.createElement("span", {
      className: "font-serif font-bold text-base",
      style: {
        color: C.ink
      }
    }, titulo),

    /*#__PURE__*/React.createElement(I.chevronDown, {
      size: 18,
      color: C.sand,
      style: {
        transform: abiertoPorDefecto ? "rotate(180deg)" : "none",
        transition: "transform 200ms"
      }
    })
  ),

  abiertoPorDefecto && /*#__PURE__*/React.createElement("div", {
    className: "px-5 pb-4 space-y-1"
  },

    posts.length === 0

      ? /*#__PURE__*/React.createElement("p", {
          className: "text-xs py-2",
          style: {
            color: C.muted
          }
        }, "Todavía no hay artículos en esta fase.")

      : posts.map((p, index) => /*#__PURE__*/React.createElement("div", {
          key: p.id,
          className: "border-b last:border-b-0",
          style: {
            borderColor: C.border
          }
        },

        /*#__PURE__*/React.createElement("button", {
          onClick: () => window.__abrirPostBlog(p.slug),
          className: "w-full text-left py-2.5"
        },

          /*#__PURE__*/React.createElement("div", {
            className: "text-sm font-bold",
            style: {
              color: C.ink
            }
          }, p.title),

          p.excerpt && /*#__PURE__*/React.createElement("div", {
            className: "text-xs mt-0.5",
            style: {
              color: C.muted
            }
          }, p.excerpt)
        ),

        esAdmin && /*#__PURE__*/React.createElement("div", {
          className: "pb-2 flex gap-3 items-center flex-wrap"
        },

          /*#__PURE__*/React.createElement("button", {
            type: "button",
            disabled: index === 0,
            onClick: e => {
              e.stopPropagation();
              onMover(p, "arriba");
            },
            className: "text-xs font-bold",
            style: {
              color: index === 0 ? C.muted : C.sand,
              opacity: index === 0 ? 0.4 : 1,
              cursor: index === 0 ? "not-allowed" : "pointer"
            }
          }, "▲ Subir"),

          /*#__PURE__*/React.createElement("button", {
            type: "button",
            disabled: index === posts.length - 1,
            onClick: e => {
              e.stopPropagation();
              onMover(p, "abajo");
            },
            className: "text-xs font-bold",
            style: {
              color: index === posts.length - 1 ? C.muted : C.sand,
              opacity: index === posts.length - 1 ? 0.4 : 1,
              cursor: index === posts.length - 1 ? "not-allowed" : "pointer"
            }
          }, "▼ Bajar"),

          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: e => {
              e.stopPropagation();
              onEditar(p);
            },
            className: "text-xs font-bold",
            style: {
              color: C.sand
            }
          }, "Editar"),

          /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: e => {
              e.stopPropagation();
              onBorrar(p.id);
            },
            className: "text-xs font-bold",
            style: {
              color: C.crit
            }
          }, "Borrar")
        )
      )
  )));
}
