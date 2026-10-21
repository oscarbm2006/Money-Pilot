import { contarHasta, prefiereMenosMovimiento } from './movimiento.js';
const { useState, useEffect, useRef } = React;
const ce = React.createElement;

// Reloj de aguja (prototipo A · Cabina): la aguja barre de 0 a la puntuación al entrar en pantalla.
export function Reloj({ score, color, etiqueta, pequeno }) {
  const ref = useRef(null);
  const [listo, setListo] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setListo(true); return; }
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { setListo(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const s = Math.max(0, Math.min(100, Number(score) || 0));
  const numRef = useRef(null);
  useEffect(() => {
    if (!listo) return;
    // El número cuenta a la vez que barre la aguja (misma duración y retardo).
    const t = setTimeout(() => contarHasta(numRef.current, s, v => String(Math.round(v)), 1600), 200);
    return () => clearTimeout(t);
  }, [listo, s]);
  return ce("div", { ref, className: "mp-panel" + (pequeno ? " mp-panel-p" : ""), role: "img", "aria-label": `Puntuación ${Math.round(s)} de 100${etiqueta ? ", " + etiqueta : ""}` },
    ce("div", { className: "mp-gauge", "aria-hidden": "true" },
      ce("div", { className: "mp-needle", style: { rotate: (listo ? s * 2.7 - 135 : -135) + "deg" } }),
      ce("div", { className: "mp-hub" }),
      ce("div", { className: "mp-read" }, ce("b", { ref: numRef }, prefiereMenosMovimiento() ? Math.round(s) : 0), ce("small", null, etiqueta || "de 100"))));
}

export const CAPAS = ["Colchón", "Deudas", "Ahorro", "Inversión"];

// Capas isométricas (prototipo B · Capas). `activa` (0–3) resalta la capa en la que estás.
export function CapasOrden({ activa, pequeno }) {
  const ref = useRef(null);
  const [visto, setVisto] = useState(!pequeno);
  useEffect(() => {
    if (!pequeno) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setVisto(true); return; }
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { setVisto(true); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [pequeno]);
  const cuerpo = ce("div", { className: "mp-iso" + (pequeno ? " mp-iso-p" : ""), "aria-hidden": "true" },
    ce("div", { className: "mp-iso-in" }, CAPAS.map((c, i) =>
      ce("div", { key: c, className: "mp-slab " + ["mp-s1", "mp-s2", "mp-s3", "mp-s4"][i] + (activa === i ? " mp-slab-on" : "") }, ce("span", null, c)))));
  return pequeno ? ce("div", { ref, className: "mp-escena mp-escena-p" + (visto ? "" : " mp-sin-ver") }, cuerpo) : cuerpo;
}

export function SeccionReloj() {
  const partes = [["Ahorro", 40], ["Colchón", 30], ["Deuda", 20], ["Perfil", 10]];
  return ce("section", { className: "mp-seccion mp-sans" },
    ce("div", { className: "mp-ancho mp-dos" },
      ce("div", null,
        ce("p", { className: "mp-antetitulo" }, "Cómo leer tu resultado"),
        ce("h2", { className: "mp-h2" }, "Un número de 0 a 100 que resume tu situación."),
        ce("p", { className: "mp-sub" }, "Es tu puntuación de salud financiera. Cuanto más a la derecha marca la aguja, más sólida es tu base. Se calcula con cuatro piezas:"),
        ce("ul", { className: "mp-partes" }, partes.map(([n, p]) => ce("li", { key: n }, ce("b", null, n), ce("span", null, p + " puntos"))))),
      ce("div", { className: "mp-centro" }, ce(Reloj, { score: 72, etiqueta: "de 100 · Base saludable" }), ce("p", { className: "mp-nota" }, "Ejemplo ilustrativo. Tu reloj real aparece al completar el diagnóstico."))));
}

const PASOS = [["Colchón", "Un mes de gastos esenciales a mano."], ["Deudas", "Liquida primero lo que cuesta más del 10 %."], ["Ahorro", "Fondo de emergencia hasta cubrir 6 meses."], ["Inversión", "Solo con la base firme debajo."]];
export function SeccionCapas() {
  const ref = useRef(null);
  const [visto, setVisto] = useState(false);
  const [activa, setActiva] = useState(-1);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setVisto(true); return; }
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { setVisto(true); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!visto) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia && window.matchMedia('(max-width: 720px)').matches) return; // en móvil, sin ciclo de color (más ligero)
    let i = 0;
    const t0 = setTimeout(() => setActiva(0), 1300);
    const iv = setInterval(() => { i = (i + 1) % 4; setActiva(i); }, 2400);
    return () => { clearTimeout(t0); clearInterval(iv); };
  }, [visto]);
  return ce("section", { ref, className: "mp-seccion mp-sans" },
    ce("div", { className: "mp-ancho mp-dos mp-dos-igual" },
      ce("div", { className: "mp-escena" + (visto ? "" : " mp-sin-ver") }, ce(CapasOrden, { activa })),
      ce("div", null,
        ce("p", { className: "mp-antetitulo" }, "Los pasos a seguir"),
        ce("h2", { className: "mp-h2" }, "El orden importa: se construye de abajo arriba."),
        ce("p", { className: "mp-sub" }, "Invertir sin colchón o con una deuda cara encima es construir sobre arena. MoneyPilot te dice en qué capa estás y cuál toca ahora."),
        ce("ol", { className: "mp-pasos" }, PASOS.map(([t, d], i) => ce("li", { key: t, className: activa === i ? "on" : "" }, ce("span", { className: "mp-paso-n" }, i + 1), ce("span", null, ce("b", null, t), ce("em", null, d))))))));
}
