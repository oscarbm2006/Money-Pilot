const { useState, useEffect, useRef } = React;
const ce = React.createElement;

const aRad = g => (g - 90) * Math.PI / 180;
const punto = (g, r) => [100 + r * Math.cos(aRad(g)), 100 + r * Math.sin(aRad(g))];
function arco(d0, d1, r) {
  const [x0, y0] = punto(d0, r), [x1, y1] = punto(d1, r);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${d1 - d0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}
const grado = p => p * 2.7 - 135;

// Reloj de aguja: 0–100. La aguja barre desde 0 hasta la puntuación al entrar en pantalla.
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
  const rot = grado(listo ? s : 0);
  return ce("div", { ref, className: "mp-reloj" + (pequeno ? " mp-reloj-p" : ""), role: "img", "aria-label": `Puntuación ${Math.round(s)} de 100${etiqueta ? ", " + etiqueta : ""}` },
    ce("svg", { viewBox: "0 0 200 170", "aria-hidden": "true" },
      ce("path", { d: arco(-135, 135, 80), className: "mp-reloj-pista" }),
      ce("path", { d: arco(grado(0), grado(40), 80), stroke: "#F87171", className: "mp-reloj-tramo" }),
      ce("path", { d: arco(grado(40), grado(70), 80), stroke: "#F59E0B", className: "mp-reloj-tramo" }),
      ce("path", { d: arco(grado(70), grado(100), 80), stroke: "#10B981", className: "mp-reloj-tramo" }),
      ce("g", { className: "mp-reloj-aguja", style: { transform: `rotate(${rot}deg)` } },
        ce("line", { x1: 100, y1: 100, x2: 100, y2: 36, stroke: color || "#312E81", strokeWidth: 4, strokeLinecap: "round" })),
      ce("circle", { cx: 100, cy: 100, r: 9, fill: color || "#312E81" }),
      ce("circle", { cx: 100, cy: 100, r: 3.5, fill: "#fff" }),
      ce("text", { x: 100, y: 150, textAnchor: "middle", className: "mp-reloj-num", fill: color || "#312E81" }, Math.round(s)),
      ce("text", { x: 100, y: 166, textAnchor: "middle", className: "mp-reloj-de" }, "de 100")));
}

export const CAPAS = [
  ["Colchón", "Un mes de gastos esenciales a mano."],
  ["Deuda cara", "Liquida lo que cuesta más del 10 %."],
  ["Fondo de emergencia", "Hasta cubrir 6 meses de gasto."],
  ["Inversión", "Solo con la base firme debajo."]
];

// Capas isométricas: la de abajo es la primera. `activa` (0–3) resalta el paso actual.
export function CapasOrden({ activa, pequeno }) {
  return ce("div", { className: "mp-capas" + (pequeno ? " mp-capas-p" : "") },
    ce("div", { className: "mp-iso", "aria-hidden": "true" },
      ce("div", { className: "mp-iso-pila" }, CAPAS.map((c, i) =>
        ce("div", { key: c[0], className: "mp-losa" + (activa === i ? " mp-losa-on" : ""), style: { "--i": i } })))),
    ce("ol", { className: "mp-capas-lista" }, CAPAS.map((c, i) =>
      ce("li", { key: c[0], className: activa === i ? "mp-capa-on" : "" },
        ce("span", { className: "mp-capa-n" }, i + 1),
        ce("span", null, ce("b", null, c[0]), ce("em", null, c[1]))))));
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
      ce("div", { className: "mp-centro" }, ce(Reloj, { score: 62, color: "#4F46E5", etiqueta: "ejemplo" }), ce("p", { className: "mp-nota" }, "Ejemplo ilustrativo. Tu reloj real aparece al completar el diagnóstico."))));
}

export function SeccionCapas() {
  return ce("section", { className: "mp-seccion mp-sans" },
    ce("div", { className: "mp-ancho mp-dos" },
      ce("div", { className: "mp-centro" }, ce(CapasOrden, { activa: 0 })),
      ce("div", null,
        ce("p", { className: "mp-antetitulo" }, "Los pasos a seguir"),
        ce("h2", { className: "mp-h2" }, "El orden importa: se construye de abajo arriba."),
        ce("p", { className: "mp-sub" }, "Invertir sin colchón o con una deuda cara encima es construir sobre arena. MoneyPilot te dice en qué capa estás y cuál toca ahora."))));
}
