// Objetos protagonistas de las cabeceras de cada herramienta. Cada herramienta tiene el suyo
// (lupa, brújula, escalera, gráfica), hecho con CSS 3D: carga al instante, funciona también en
// móvil y no necesita Three.js. Son decorativos: el texto de la cabecera ya dice lo importante.
import { I } from './constantes.js';

const el = React.createElement;

// Diagnóstico: un billete inclinado que una línea recorre de arriba abajo y una lupa encima.
export function ObjetoLupa() {
  return el("div", { className: "cb-lupa-escena" },
    el("div", { className: "cb-billete" },
      el("span", { className: "cb-billete-marco" }),
      el("span", { className: "cb-billete-cifra" }, "50"),
      el("span", { className: "cb-billete-euro" }, "€"),
      el("span", { className: "cb-escaner" })),
    el("div", { className: "cb-lupa" },
      el("span", { className: "cb-lupa-cristal" }),
      el("span", { className: "cb-lupa-mango" })));
}

// Estrategia: una brújula cuya aguja oscila hasta orientarse.
export function ObjetoBrujula() {
  return el("div", { className: "cb-brujula" },
    el("span", { className: "cb-brujula-anillo" }),
    el("span", { className: "cb-brujula-esfera" }),
    [["N", "cb-brujula-punto cb-p-N"], ["E", "cb-brujula-punto cb-p-E"], ["S", "cb-brujula-punto cb-p-S"], ["O", "cb-brujula-punto cb-p-O"]].map(([p, clase]) => el("span", { key: p, className: clase }, p)),
    el("span", { className: "cb-brujula-aguja" }, el("span", null), el("span", null)),
    el("span", { className: "cb-brujula-eje" }));
}

// Plan: la escalera de fases con la fase actual iluminada.
const COLOR_FASE = { completado: "#10B981", en_curso: "#F59E0B", pendiente: "#6366F1", no_aplica: "#64748B" };
export function ObjetoEscalera({ fases }) {
  const actual = fases.findIndex(f => f.estado === "en_curso");
  return el("div", { className: "hr-escalera cb-escalera" }, fases.map((f, i) => el("div", {
    key: f.id,
    className: "hr-bloque" + (i === actual ? " hr-bloque-activo" : ""),
    style: { "--hr-i": i, "--hr-alto": 26 + i * 22 + "px", "--hr-color": COLOR_FASE[f.estado] || COLOR_FASE.pendiente, cursor: "default" }
  }, el("span", { className: "hr-cara hr-cara-top" }, f.estado === "completado" ? el(I.check, { size: 20 }) : i + 1),
    el("span", { className: "hr-cara hr-cara-frente" }),
    el("span", { className: "hr-cara hr-cara-lado" }),
    i === actual && el("span", { className: "hr-marcador" }, el("span", null, "Estás aquí")))));
}

// Seguimiento: una línea que se dibuja de izquierda a derecha. Con dos o más registros usa
// la evolución real del patrimonio; si no, una curva de ejemplo.
export function ObjetoGrafica({ valores }) {
  const datos = valores && valores.length >= 2 ? valores : [10, 18, 24, 30, 44, 52, 70, 82];
  const min = Math.min(...datos), max = Math.max(...datos), rango = max - min || 1;
  const pts = datos.map((v, i) => [i / (datos.length - 1) * 1200, 150 - (v - min) / rango * 120]);
  const linea = pts.map(([x, y], i) => (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1)).join(" ");
  const [ux, uy] = pts[pts.length - 1];
  return el("div", { className: "cb-grafica" },
    el("svg", { viewBox: "0 0 1200 170", preserveAspectRatio: "none", width: "100%", height: "100%" },
      el("defs", null, el("linearGradient", { id: "cbArea", x1: 0, y1: 0, x2: 0, y2: 1 },
        el("stop", { offset: 0, stopColor: "#34D399", stopOpacity: 0.45 }),
        el("stop", { offset: 1, stopColor: "#34D399", stopOpacity: 0 }))),
      el("path", { d: linea + " L1200 170 L0 170 Z", fill: "url(#cbArea)" }),
      el("path", { className: "cb-grafica-linea", d: linea, fill: "none", stroke: "#34D399", strokeWidth: 4, strokeLinecap: "round", vectorEffect: "non-scaling-stroke" })),
    el("span", { className: "cb-grafica-punto", style: { left: ux / 12 + "%", top: uy / 170 * 100 + "%" } }));
}
