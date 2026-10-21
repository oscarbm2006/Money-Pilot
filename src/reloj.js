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
  return ce("div", { ref, className: "mp-panel" + (pequeno ? " mp-panel-p" : ""), role: "img", "aria-label": `Puntuación ${Math.round(s)} de 100${etiqueta ? ", " + etiqueta : ""}` },
    ce("div", { className: "mp-gauge", "aria-hidden": "true" },
      ce("div", { className: "mp-needle", style: { rotate: (listo ? s * 2.7 - 135 : -135) + "deg" } }),
      ce("div", { className: "mp-hub" }),
      ce("div", { className: "mp-read" }, ce("b", null, Math.round(s)), ce("small", null, etiqueta || "de 100"))));
}

export const CAPAS = ["Colchón", "Deudas", "Ahorro", "Inversión"];

// Capas isométricas (prototipo B · Capas). `activa` (0–3) resalta la capa en la que estás.
export function CapasOrden({ activa, pequeno }) {
  return ce("div", { className: "mp-iso" + (pequeno ? " mp-iso-p" : ""), "aria-hidden": "true" },
    ce("div", { className: "mp-iso-in" }, CAPAS.map((c, i) =>
      ce("div", { key: c, className: "mp-slab " + ["mp-s1", "mp-s2", "mp-s3", "mp-s4"][i] + (activa === i ? " mp-slab-on" : "") }, ce("span", null, c)))));
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

export function SeccionCapas() {
  return ce("section", { className: "mp-seccion mp-sans" },
    ce("div", { className: "mp-ancho mp-dos" },
      ce("div", { className: "mp-centro" }, ce(CapasOrden, null)),
      ce("div", null,
        ce("p", { className: "mp-antetitulo" }, "Los pasos a seguir"),
        ce("h2", { className: "mp-h2" }, "El orden importa: se construye de abajo arriba."),
        ce("p", { className: "mp-sub" }, "Invertir sin colchón o con una deuda cara encima es construir sobre arena. MoneyPilot te dice en qué capa estás y cuál toca ahora."))));
}
