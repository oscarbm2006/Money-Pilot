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

// Mis finanzas: tres tarjetas que se abren en abanico, una por pieza de tu patrimonio.
export function ObjetoAbanico() {
  return el("div", { className: "cb-abanico" },
    [["Cuentas", "cb-carta cb-carta-1"], ["Inversiones", "cb-carta cb-carta-2"], ["Patrimonio", "cb-carta cb-carta-3"]].map(([texto, clase]) => el("div", { key: texto, className: clase },
      el("span", { className: "cb-carta-chip" }),
      el("span", { className: "cb-carta-texto" }, texto),
      el("span", { className: "cb-carta-linea" }))));
}

// Simulador de ahorro: columnas de monedas que crecen de izquierda a derecha, como el ahorro en el tiempo.
export function ObjetoColumnas() {
  const alturas = [2, 4, 6, 9, 12];
  return el("div", { className: "cb-columnas" }, alturas.map((n, c) => el("div", { key: c, className: "cb-columna" },
    Array.from({ length: n }, (_, k) => el("span", { key: k, className: "cb-moneda", style: { "--cb-k": c * 3 + k } })))));
}

// Simulador de deudas: una tarjeta de crédito que se encoge mientras la barra de deuda baja.
export function ObjetoDeuda() {
  return el("div", { className: "cb-deuda" },
    el("div", { className: "cb-tarjeta" },
      el("span", { className: "cb-carta-chip" }),
      el("span", { className: "cb-tarjeta-num" }, "•••• •••• •••• 2024"),
      el("span", { className: "cb-tarjeta-nombre" }, "Deuda")),
    el("div", { className: "cb-deuda-barra" }, el("span", null)));
}

/* ---------- Escenas de las bandas de titular grandes ---------- */
// Cada banda ilustra su propia frase en lugar de repetir monedas, flechas y barras.

// "Lo que no se mueve, se encoge": un billete que pierde tamaño frente a su silueta de hoy.
export function EscenaInflacion() {
  return el("div", { className: "cbt-inflacion" },
    el("div", { className: "cbt-inflacion-silueta" }, el("span", null, "Hoy · 1.000 €")),
    el("div", { className: "cbt-inflacion-billete" },
      el("span", { className: "cb-billete-marco" }),
      el("span", { className: "cbt-inflacion-cifra" }, "50"),
      el("span", { className: "cb-billete-euro" }, "€")),
    el("span", { className: "cbt-inflacion-etiqueta" }, "En 10 años · ≈ 780 € de poder de compra"));
}

// "El tiempo trabaja para quien empieza antes": una línea de años en la que la bola de ahorro crece.
export function EscenaTiempo() {
  const hitos = [["Año 1", 18], ["Año 5", 30], ["Año 10", 48], ["Año 20", 78], ["Año 30", 120]];
  return el("div", { className: "cbt-tiempo" },
    el("span", { className: "cbt-tiempo-linea" }),
    hitos.map(([anio, d], i) => el("div", { key: anio, className: "cbt-tiempo-hito", style: { "--cbt-i": i } },
      el("span", { className: "cbt-tiempo-bola", style: { width: d, height: d } }),
      el("span", { className: "cbt-tiempo-anio" }, anio))));
}

// "Del dinero que guardas al dinero que trabaja": una pila quieta y un engranaje que gira con monedas.
export function EscenaTrabaja() {
  return el("div", { className: "cbt-trabaja" },
    el("div", { className: "cbt-trabaja-lado" },
      el("div", { className: "cbt-pila" }, Array.from({ length: 6 }, (_, k) => el("span", { key: k, className: "cbt-pila-moneda" }))),
      el("span", { className: "cbt-trabaja-etiqueta" }, "Guardado")),
    el("span", { className: "cbt-trabaja-flecha" }, el(I.arrowRight, { size: 34 })),
    el("div", { className: "cbt-trabaja-lado" },
      el("div", { className: "cbt-engranaje" },
        el("span", { className: "cbt-engranaje-rueda" }),
        el("span", { className: "cbt-orbita" }, el("span", null), el("span", null), el("span", null))),
      el("span", { className: "cbt-trabaja-etiqueta" }, "Trabajando")));
}

// "Tu ruta, fase a fase": un camino que se dibuja y va encendiendo sus cinco hitos.
export function EscenaRuta() {
  const hitos = [[40, 250], [140, 190], [250, 210], [340, 120], [440, 60]];
  const d = "M40 250 C 90 240, 100 190, 140 190 S 220 220, 250 210 S 310 130, 340 120 S 410 70, 440 60";
  return el("div", { className: "cbt-ruta" },
    el("svg", { viewBox: "0 0 480 300", width: "100%", height: "100%" },
      el("path", { d, fill: "none", stroke: "rgba(255,255,255,.12)", strokeWidth: 14, strokeLinecap: "round" }),
      el("path", { className: "cbt-ruta-camino", d, fill: "none", stroke: "#FBBF24", strokeWidth: 4, strokeLinecap: "round", strokeDasharray: "10 12" }),
      hitos.map(([x, y], i) => el("g", { key: i, className: "cbt-ruta-hito", style: { "--cbt-i": i } },
        el("circle", { cx: x, cy: y, r: 16, fill: "#1E1B4B", stroke: "#FBBF24", strokeWidth: 3 }),
        el("text", { x, y: y + 5, textAnchor: "middle", fill: "#fff", fontSize: 14, fontWeight: 800 }, i + 1))),
      el("g", { className: "cbt-ruta-meta" }, el("path", { d: "M440 60 V 14", stroke: "#fff", strokeWidth: 3 }), el("path", { d: "M440 14 L 470 24 L 440 34 Z", fill: "#F59E0B" }))));
}
