const { useState, useEffect, useRef } = React;

import { C, I } from './constantes.js';
import { euros } from './calculos.js';
import { AnimatedNumber } from './ui-basicos.js';
import { CapaTransicion } from './secciones.js';
import { prefiereMenosMovimiento, useAparicion, useInclinacion } from './movimiento.js';

// Piezas visuales de la hoja de ruta (Estrategia → Plan → Seguimiento).
// Los cálculos siguen viviendo en calculos.js; aquí solo se presenta lo que ya existe.

const el = React.createElement;
const TINTA = "#1E1B4B";

const PASOS = [["estrategia", "Estrategia"], ["plan", "Plan"], ["seguimiento", "Seguimiento"]];

// Selector de pasos fijo arriba de las tres pantallas de la hoja de ruta.
export function PasosHojaRuta({ actual, onIr }) {
  const indiceActual = PASOS.findIndex(([id]) => id === actual);
  return el("nav", {
    "aria-label": "Pasos de tu hoja de ruta",
    className: "hr-pasos"
  }, PASOS.map(([id, etiqueta], i) => {
    const activo = i === indiceActual;
    const hecho = i < indiceActual;
    return el("button", {
      key: id,
      type: "button",
      onClick: () => onIr(id),
      "aria-current": activo ? "step" : undefined,
      className: "hr-paso" + (activo ? " hr-paso-activo" : "")
    }, el("span", {
      className: "hr-paso-num",
      style: {
        backgroundColor: activo ? C.primary : hecho ? C.salu : C.bgDeepMid,
        color: activo || hecho ? C.white : C.muted
      }
    }, hecho ? el(I.check, { size: 13 }) : i + 1), etiqueta);
  }));
}

// Aviso común cuando aún no hay diagnóstico: evita mostrar fases "completadas" sin datos.
export function AvisoSinDiagnostico({ onIrADiagnostico, texto }) {
  return el("div", {
    className: "hr-card hr-entra hr-sin-datos"
  }, el("div", {
    className: "hr-icono",
    style: { backgroundColor: C.primaryLight, color: C.primary }
  }, el(I.compass, { size: 20 })), el("div", { style: { flex: "999 1 320px", minWidth: 0 } }, el("p", {
    className: "hr-etiqueta",
    style: { color: C.primary }
  }, "Primero, tu diagnóstico"), el("h3", {
    className: "hr-titulo"
  }, "Completa tu diagnóstico para ver tu hoja de ruta"), el("p", {
    className: "hr-texto"
  }, texto || "Con tus ingresos, gastos, ahorro y deudas calculamos en qué fase estás y cuál es tu siguiente paso. Tarda unos minutos.")), el("button", {
    type: "button",
    onClick: onIrADiagnostico,
    className: "hr-boton hr-boton-primario",
    style: { flex: "1 1 200px" }
  }, "Hacer mi diagnóstico"));
}

// Estrategia: tres tarjetas — lo que va bien, lo que preocupa y qué hacer ahora.
export function ResumenAccion({ diagnostico, prioridad }) {
  const bien = diagnostico.positivos[0];
  const preocupa = diagnostico.preocupantes[0];
  const actual = prioridad.pasos.find(p => p.estado === "actual");
  const tarjetas = [bien && {
    tono: "bien", etiqueta: "Va bien", Icono: I.checkCircle, fondo: C.saluLight, color: "#047857",
    titulo: bien.titulo, texto: bien.texto
  }, preocupa && {
    tono: "preocupa", etiqueta: "Preocupa", Icono: I.alertTriangle, fondo: C.mejLight, color: "#92400E",
    titulo: preocupa.titulo, texto: preocupa.texto
  }, actual && {
    tono: "ahora", etiqueta: "Haz ahora", Icono: I.arrowRight, fondo: C.primaryLight, color: "#3730A3",
    titulo: actual.titulo, texto: actual.texto
  }].filter(Boolean);
  if (tarjetas.length === 0) return null;
  return el("section", {
    className: "hr-resumen", "aria-labelledby": "hr-resumen-t"
  }, el(Aparece, null, el("p", { className: "hr-etiqueta", style: { color: C.primary } }, "En resumen"), el("h2", {
    id: "hr-resumen-t", className: "hr-titular"
  }, "Lo que va bien, lo que preocupa", el("br"), el("span", { className: "hr-titular-suave" }, "y lo que toca ahora."))), el("div", {
    className: "hr-rejilla-3"
  }, tarjetas.map((t, i) => el(TarjetaAccion, { key: t.tono, t, retraso: i * 0.12 }))));
}

// Bloque que entra con el scroll (misma animación que el resto del rediseño)
function Aparece({ retraso = 0, className = "", children }) {
  const ref = useAparicion();
  return el("div", { ref, className: "mp-aparece " + className, style: { "--mp-retraso": retraso + "s" } }, children);
}

// Tarjeta que entra con el scroll y se inclina siguiendo el cursor
function TarjetaAccion({ t, retraso }) {
  const inclina = useInclinacion(8);
  return el(Aparece, { retraso }, el("article", {
    ref: inclina,
    className: "hr-card hr-accion mp-inclina",
    style: { "--hr-tono": t.color, "--hr-tono-fondo": t.fondo }
  }, el("span", { className: "mp-brillo", "aria-hidden": "true" }), el("div", {
    className: "hr-accion-cabeza"
  }, el("div", {
    className: "hr-icono hr-icono-3d",
    style: { backgroundColor: t.fondo, color: t.color }
  }, el(t.Icono, { size: 22 })), el("span", {
    className: "hr-chip",
    style: { backgroundColor: t.fondo, color: t.color }
  }, t.etiqueta)), el("h3", { className: "hr-titulo", style: { fontSize: 20 } }, t.titulo), el("p", { className: "hr-texto" }, t.texto)));
}

const ESTADO_FASE = {
  completado: { texto: "Superada", fondo: C.saluLight, color: "#047857", punto: C.salu },
  en_curso: { texto: "Estás aquí", fondo: C.mejLight, color: "#92400E", punto: C.mej },
  pendiente: { texto: "Más adelante", fondo: C.bgDeepMid, color: C.muted, punto: "#C7D2FE" },
  no_aplica: { texto: "No aplica", fondo: C.bgDeepMid, color: C.muted, punto: C.border }
};

const iconoFase = id => id === "colchon_inicial" ? I.shieldCheck : id === "deuda" ? I.wallet : id === "fondo_emergencia" ? I.piggy : id === "inversion" ? I.chartLine : I.target;

// Plan: la acción que toca ahora, destacada, con su progreso en un anillo.
export function SiguientePaso({ plan }) {
  const { fases, bloqueadoPorPresupuesto } = plan;
  const indice = fases.findIndex(f => f.estado === "en_curso");
  const fase = fases[indice];

  if (!fase && !bloqueadoPorPresupuesto) {
    return el("section", {
      className: "hr-card hr-entra hr-siguiente",
      style: { borderColor: C.salu + "66" }
    }, el("div", {
      className: "hr-icono hr-icono-grande",
      style: { backgroundColor: C.saluLight, color: C.salu }
    }, el(I.checkCircle, { size: 30 })), el("div", { style: { flex: "999 1 320px", minWidth: 0 } }, el("p", {
      className: "hr-etiqueta", style: { color: "#047857" }
    }, "Base completa"), el("h2", { className: "hr-titulo-grande" }, "Tu base financiera está en orden"), el("p", {
      className: "hr-texto"
    }, "Revisa tu plan cada mes y ajusta tus objetivos si tu situación cambia.")));
  }

  const progreso = fase?.progreso == null ? null : Math.round(fase.progreso);
  const circunferencia = 2 * Math.PI * 50;
  const titulo = bloqueadoPorPresupuesto ? "Ajusta tu presupuesto" : fase.titulo;
  const accion = bloqueadoPorPresupuesto ? "Ahora mismo gastas más de lo que ingresas. Antes de nada, revisa ingresos y gastos para recuperar margen." : fase.accion;
  const cifra = !bloqueadoPorPresupuesto && fase.restante > 0 ? fase.restante : null;

  return el("section", {
    className: "hr-card hr-entra hr-siguiente",
    style: { borderColor: C.mej + "88" }
  }, el("div", {
    className: "hr-anillo",
    role: progreso == null ? undefined : "img",
    "aria-label": progreso == null ? undefined : progreso + " % completado"
  }, progreso == null ? el("div", {
    className: "hr-icono hr-icono-grande",
    style: { backgroundColor: C.mejLight, color: "#B45309" }
  }, el(iconoFase(fase?.id), { size: 30 })) : el(React.Fragment, null, el("svg", {
    viewBox: "0 0 120 120", width: 132, height: 132, "aria-hidden": "true"
  }, el("circle", { cx: 60, cy: 60, r: 50, fill: "none", stroke: C.mejLight, strokeWidth: 12 }), el("circle", {
    cx: 60, cy: 60, r: 50, fill: "none", stroke: C.mej, strokeWidth: 12, strokeLinecap: "round",
    strokeDasharray: circunferencia, transform: "rotate(-90 60 60)",
    className: "hr-anillo-trazo",
    style: { "--hr-len": circunferencia, strokeDashoffset: circunferencia * (1 - progreso / 100) }
  })), el("div", { className: "hr-anillo-centro" }, el("span", { className: "hr-cifra", style: { fontSize: 36 } }, el(AnimatedNumber, {
    value: progreso, format: v => Math.round(v) + "%"
  })), el("span", { style: { fontSize: 12, color: C.muted } }, "completado")))), el("div", {
    style: { flex: "999 1 340px", minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }
  }, el("span", {
    className: "hr-chip",
    style: { backgroundColor: C.mejLight, color: "#92400E" }
  }, el("span", { className: "hr-pulso" }), bloqueadoPorPresupuesto ? "Tu siguiente paso" : "Tu siguiente paso · Fase " + (indice + 1)), el("h2", {
    className: "hr-titulo-grande"
  }, titulo), el("p", { className: "hr-texto", style: { fontSize: 15 } }, accion)), cifra != null && el("div", {
    style: { flex: "1 1 180px", display: "flex", flexDirection: "column", gap: 6 }
  }, el("span", { style: { fontSize: 13, color: C.muted } }, "Te falta"), el("span", {
    className: "hr-cifra", style: { fontSize: 40 }
  }, el(AnimatedNumber, { value: cifra, format: v => euros(v) }))));
}

// Plan: recorrido de fases guiado por el scroll. A la izquierda (arriba en móvil) una escalera 3D
// que sigue fija; a la derecha, una lámina por fase. La fase que llega al centro de la pantalla
// se ilumina en la escalera. Superar la ruta es "subir" la escalera, como en la portada.
export function RecorridoFases({ fases }) {
  const indiceActual = fases.findIndex(f => f.estado === "en_curso");
  const [activa, setActiva] = useState(indiceActual >= 0 ? indiceActual : 0);
  const laminas = useRef([]);
  const superadas = fases.filter(f => f.estado === "completado" || f.estado === "no_aplica").length;

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(entradas => {
      entradas.forEach(e => { if (e.isIntersecting) setActiva(Number(e.target.dataset.indice)); });
    }, { rootMargin: "-45% 0px -45% 0px" });
    laminas.current.forEach(n => n && io.observe(n));
    return () => io.disconnect();
  }, [fases.length]);

  const irA = i => {
    const n = laminas.current[i];
    if (n) n.scrollIntoView({ behavior: prefiereMenosMovimiento() ? "auto" : "smooth", block: "center" });
  };

  return el("div", null, el("div", {
    className: "hr-capa"
  }, el(CapaTransicion, {
    id: "hr-capa-ruta",
    retraso: 600,
    lineas: ["Tu ruta,", "fase a fase."],
    frase: "Baja para recorrer cada etapa: dónde estás, cuánto te falta y qué viene después.",
    iconos: [["moneda", 0.12, 0.25, 0.8, 0.4], ["flecha", 0.3, -0.3, 0.75, 0.2], ["barras", 0.72, 0.3, 0.8, -0.3], ["moneda", 0.9, -0.2, 0.6, 1.5]]
  })), el("section", {
    className: "hr-recorrido", "aria-label": "Fases de tu plan"
  }, el("div", {
    className: "hr-recorrido-fijo"
  }, el("div", {
    className: "hr-recorrido-cabeza"
  }, el("span", { className: "hr-etiqueta", style: { color: C.primary, margin: 0 } }, superadas + " de " + fases.length + " fases superadas"), el("span", {
    className: "hr-recorrido-actual"
  }, "Fase " + (activa + 1) + " · " + fases[activa].titulo)), el(EscaleraFases, { fases, activa, onElegir: irA })), el("ol", {
    className: "hr-laminas"
  }, fases.map((f, i) => el(LaminaFase, {
    key: f.id, fase: f, indice: i, activa: i === activa,
    refNodo: n => { laminas.current[i] = n; }
  })))));
}

// Escalera isométrica en CSS 3D: cada fase es un bloque más alto que el anterior.
function EscaleraFases({ fases, activa, onElegir }) {
  return el("div", {
    className: "hr-escalera-marco"
  }, el("div", {
    className: "hr-escalera", role: "list"
  }, fases.map((f, i) => {
    const cfg = ESTADO_FASE[f.estado] || ESTADO_FASE.pendiente;
    const color = f.estado === "completado" ? "#10B981" : f.estado === "en_curso" ? "#F59E0B" : f.estado === "no_aplica" ? "#CBD5E1" : "#A5B4FC";
    return el("button", {
      key: f.id,
      type: "button",
      role: "listitem",
      onClick: () => onElegir(i),
      "aria-label": "Fase " + (i + 1) + ": " + f.titulo + " (" + cfg.texto + ")",
      "aria-current": i === activa ? "step" : undefined,
      className: "hr-bloque" + (i === activa ? " hr-bloque-activo" : ""),
      style: { "--hr-i": i, "--hr-alto": 26 + i * 22 + "px", "--hr-color": color }
    }, el("span", { className: "hr-cara hr-cara-top" }, f.estado === "completado" ? "✓" : i + 1), el("span", {
      className: "hr-cara hr-cara-frente"
    }), el("span", { className: "hr-cara hr-cara-lado" }), i === activa && el("span", {
      className: "hr-marcador", "aria-hidden": "true"
    }, el("span", null, f.estado === "en_curso" ? "Estás aquí" : f.titulo)));
  })));
}

// Una lámina por fase: número grande, titular, acción y progreso.
function LaminaFase({ fase, indice, activa, refNodo }) {
  const cfg = ESTADO_FASE[fase.estado] || ESTADO_FASE.pendiente;
  const actual = fase.estado === "en_curso";
  const Icono = iconoFase(fase.id);
  return el("li", {
    ref: refNodo,
    "data-indice": indice,
    className: "hr-lamina" + (activa ? " hr-lamina-activa" : "") + (actual ? " hr-lamina-actual" : "")
  }, el("span", { className: "hr-lamina-num", "aria-hidden": "true" }, String(indice + 1).padStart(2, "0")), el("div", {
    className: "hr-lamina-cuerpo"
  }, el("div", { style: { display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" } }, el("span", {
    className: "hr-icono", style: { backgroundColor: cfg.fondo, color: cfg.color }
  }, el(Icono, { size: 20 })), el("span", {
    className: "hr-chip", style: { backgroundColor: cfg.fondo, color: cfg.color }
  }, actual && el("span", { className: "hr-pulso" }), cfg.texto)), el("h3", {
    className: "hr-lamina-titulo"
  }, fase.titulo), el("p", { className: "hr-lamina-meta" }, fase.objetivoTexto), el("div", {
    className: "hr-lamina-accion"
  }, el(I.arrowRight, { size: 18, color: C.primary, className: "shrink-0" }), el("p", { className: "hr-texto", style: { color: "#1E1B4B", fontSize: 15 } }, fase.accion)), fase.meta != null && el("div", {
    className: "hr-lamina-cifras"
  }, el("div", null, el("div", { className: "hr-mini" }, "Ahora"), el("div", { className: "hr-cifra", style: { fontSize: 34 } }, euros(fase.actual))), el("div", null, el("div", { className: "hr-mini" }, "Meta"), el("div", {
    className: "hr-cifra", style: { fontSize: 34, color: C.muted }
  }, euros(fase.meta))), fase.progreso != null && el("div", {
    className: "hr-barra", style: { flex: "1 1 100%", height: 10 }
  }, el("div", {
    className: "hr-barra-relleno",
    style: { width: Math.round(fase.progreso) + "%", background: fase.estado === "completado" ? C.salu : "linear-gradient(90deg,#4F46E5,#F59E0B)" }
  })))));
}

// Seguimiento sin sesión: vista previa difuminada de lo que verá, en lugar de un aviso a secas.
export function SeguimientoVistaPrevia({ onOpenAuth }) {
  const kpi = (etiqueta, valor, delta) => el("div", {
    className: "hr-kpi"
  }, el("div", { style: { fontSize: 13, color: C.muted } }, etiqueta), el("div", {
    className: "hr-cifra", style: { fontSize: 32 }
  }, valor, delta && el("span", { style: { fontSize: 15, color: C.salu, marginLeft: 8 } }, delta)));
  return el("section", {
    className: "hr-card hr-entra hr-previa"
  }, el("div", {
    "aria-hidden": "true", className: "hr-previa-fondo"
  }, el("div", { className: "hr-rejilla-3" }, kpi("Puntuación", "58", "+8"), kpi("Patrimonio neto", "4.150 €", "+620 €"), kpi("Meses seguidos", "4")), el("svg", {
    viewBox: "0 0 800 220", width: "100%", height: 220, preserveAspectRatio: "none"
  }, el("polyline", { points: "0,190 130,170 260,160 390,130 520,120 650,80 800,60", fill: "none", stroke: C.primary, strokeWidth: 4 }), el("polyline", {
    points: "0,200 130,195 260,180 390,175 520,150 650,140 800,110", fill: "none", stroke: C.salu, strokeWidth: 4
  }))), el("div", {
    className: "hr-previa-capa"
  }, el("div", {
    className: "hr-card hr-previa-tarjeta"
  }, el("div", {
    className: "hr-icono", style: { backgroundColor: C.primaryLight, color: C.primary, margin: "0 auto" }
  }, el(I.chartLine, { size: 20 })), el("h2", { className: "hr-titulo", style: { fontSize: 22 } }, "Así se verá tu evolución"), el("p", {
    className: "hr-texto"
  }, "Guarda una foto de tu situación cada mes y compara tu puntuación, tu patrimonio y tus deudas con los meses anteriores."), el("button", {
    type: "button", onClick: onOpenAuth, className: "hr-boton hr-boton-primario"
  }, "Guardar mi primera foto"), el("span", {
    style: { fontSize: 13, color: C.muted }
  }, "Necesitas una cuenta gratuita para guardar el historial. Ejemplo ilustrativo."))));
}
