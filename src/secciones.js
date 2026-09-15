const { useState, useEffect, useRef, useCallback, useMemo, useId } = React;

import { C, GASTOS_DISC_DEF, GASTOS_FIJOS_DEF, GASTOS_HORMIGA_EJEMPLOS, I, STATS_REALES, TASA_INDICE_GLOBAL } from './constantes.js';
import { Card, EvidenciaModal, Eyebrow, FadeSwitch, FreqField, NumberField, SimpleAreaChart } from './ui-basicos.js';
import { euros, proyeccionInteres, totalMensual } from './calculos.js';

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

export function GastoHormigaSection() {
  const [gasto, setGasto] = useState(0);
  const [anios, setAnios] = useState(10);
  const [seleccion, setSeleccion] = useState(null);
  const proyeccion = useMemo(() => proyeccionInteres(0, gasto, TASA_INDICE_GLOBAL, anios), [gasto, anios]);
  const ahorroSinInvertir = gasto * 12 * anios;
  const serie = useMemo(() => {
    const years = Math.max(1, Math.round(anios));
    return Array.from({
      length: years
    }, (_, i) => {
      const a = i + 1;
      const p = proyeccionInteres(0, gasto, TASA_INDICE_GLOBAL, a);
      return {
        anio: "Año " + a,
        aportado: Math.round(p.totalAportado),
        valorFuturo: Math.round(p.valorFuturo)
      };
    });
  }, [gasto, anios]);
  return /*#__PURE__*/React.createElement(Card, {
    className: "p-6 sm:p-8"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Un pequeño experimento"), /*#__PURE__*/React.createElement("h2", {
    className: "font-serif text-xl sm:text-2xl font-bold",
    style: {
      color: C.ink
    }
  }, "Piensa en un gasto mensual totalmente prescindible"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-2 max-w-2xl",
    style: {
      color: C.muted
    }
  }, "Por ejemplo, desayunar fuera todos los días, pedir comida a domicilio por falta de organización, o una suscripción que casi no usas. Elige un ejemplo o escribe el tuyo."), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2 mt-4"
  }, GASTOS_HORMIGA_EJEMPLOS.map(g => /*#__PURE__*/React.createElement("button", {
    key: g.label,
    onClick: () => {
      setSeleccion(g.label);
      setGasto(g.valor);
    },
    className: "px-3 py-2 rounded-lg text-xs font-bold border text-left transition-all hover:-translate-y-0.5",
    style: {
      borderColor: seleccion === g.label ? C.sand : C.border,
      backgroundColor: seleccion === g.label ? C.sandLight : C.paper,
      color: C.ink
    }
  }, g.label))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5"
  }, /*#__PURE__*/React.createElement(NumberField, {
    label: "¿Cuánto gastas al mes en esto?",
    value: gasto,
    onChange: v => {
      setGasto(v);
      setSeleccion(null);
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-bold mb-1.5",
    style: {
      color: C.ink
    }
  }, "Durante cuántos años"), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "1",
    max: "30",
    value: anios,
    onChange: e => setAnios(Number(e.target.value)),
    className: "w-full",
    style: {
      accentColor: C.sand
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold mt-1",
    style: {
      color: C.muted
    }
  }, anios, " años"))), gasto > 0 && /*#__PURE__*/React.createElement("div", {
    className: "mt-6 space-y-4 fade-switch-enter"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4 border",
    style: {
      backgroundColor: C.paper,
      border: "1px solid " + C.border
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm leading-relaxed",
    style: {
      color: C.ink
    }
  }, "¿Sabías que si hubieses ahorrado esos ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.sand
    }
  }, euros(gasto), "/mes"), " durante ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.sand
    }
  }, anios, " años"), ", tendrías ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.sand
    }
  }, euros(ahorroSinInvertir)), "?"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-2.5 leading-relaxed",
    style: {
      color: C.ink
    }
  }, "Y si los hubieses invertido en un índice con las empresas más grandes del mundo (rentabilidad histórica media aproximada del ", TASA_INDICE_GLOBAL, "%/año), el interés compuesto te habría dado ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.salu
    }
  }, euros(proyeccion.interesGenerado)), " extra — un total de ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.sand
    }
  }, euros(proyeccion.valorFuturo)), ".")), /*#__PURE__*/React.createElement("div", {
    className: "h-56"
  }, /*#__PURE__*/React.createElement(SimpleAreaChart, {
    data: serie,
    xKey: "anio",
    series: [{
      key: "valorFuturo",
      label: "Con interés compuesto",
      color: C.sand,
      opacity: 0.35
    }, {
      key: "aportado",
      label: "Aportado",
      color: C.slate,
      opacity: 0.85
    }],
    formatY: v => v.toLocaleString("es-ES") + " €"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-4 text-xs font-bold",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "inline-flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-2.5 h-2.5 rounded-full inline-block",
    style: {
      backgroundColor: C.slate
    }
  }), "Aportado"), /*#__PURE__*/React.createElement("span", {
    className: "inline-flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-2.5 h-2.5 rounded-full inline-block",
    style: {
      backgroundColor: C.sand
    }
  }), "Con interés compuesto")), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] readable-note"
  }, "Proyección educativa con la rentabilidad histórica media de un índice global. Rentabilidades pasadas no garantizan resultados futuros.")));
}

export function PoderAdquisitivoSection() {
  const [anios, setAnios] = useState(10);
  const [aporte, setAporte] = useState(1000);
  const inflacion = 2.5;
  const rentabilidad = 8;
  const valorInflacion = aporte / Math.pow(1 + inflacion / 100, anios);
  const valorCompuesto = aporte * Math.pow(1 + rentabilidad / 100, anios);
  const max = valorCompuesto;
  const serie = Array.from({
    length: anios + 1
  }, (_, i) => ({
    y: i,
    infl: aporte / Math.pow(1 + inflacion / 100, i),
    comp: aporte * Math.pow(1 + rentabilidad / 100, i)
  }));
  return /*#__PURE__*/React.createElement(Card, {
    className: "p-5 sm:p-7 overflow-hidden",
    style: {
      borderColor: C.sand + "66",
      boxShadow: "0 20px 60px -35px rgba(79,70,229,.45)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Un minuto que puede cambiar tu perspectiva"), /*#__PURE__*/React.createElement("h2", {
    className: "font-serif text-xl sm:text-2xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, "¿Qué pasa con 1.000 € si no haces nada?")), /*#__PURE__*/React.createElement("div", {
    className: "hidden sm:flex w-10 h-10 rounded-xl items-center justify-center",
    style: {
      backgroundColor: "rgba(79,70,229,.14)"
    }
  }, /*#__PURE__*/React.createElement(I.chartLine, {
    size: 19,
    color: C.sand
  }))), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-2 leading-relaxed",
    style: {
      color: C.muted
    }
  }, "La inflación reduce el poder de compra. La capitalización, en cambio, puede hacer crecer un capital con el tiempo. No es una promesa de rentabilidad: es una demostración sencilla del efecto matemático."), /*#__PURE__*/React.createElement("div", {
    className: "grid sm:grid-cols-2 gap-4 mt-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4 border",
    style: {
      borderColor: C.border,
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-xs font-bold"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.muted
    }
  }, "Si la inflación fuese ", inflacion, "%"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.mej
    }
  }, "Poder de compra")), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-2xl font-bold mt-2",
    style: {
      color: C.ink
    }
  }, euros(valorInflacion)), /*#__PURE__*/React.createElement("div", {
    className: "h-2 rounded-full mt-3 overflow-hidden",
    style: {
      backgroundColor: C.border
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-full rounded-full",
    style: {
      width: `${Math.max(8, valorInflacion / aporte * 100)}%`,
      backgroundColor: C.mej
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] mt-2",
    style: {
      color: C.muted
    }
  }, "Lo que hoy compras con ", euros(aporte), " requeriría más dinero en el futuro.")), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4 border",
    style: {
      borderColor: "rgba(79,70,229,.18)",
      backgroundColor: "rgba(79,70,229,.035)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-xs font-bold"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.muted
    }
  }, "Si creciera al ", rentabilidad, "%"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.exc
    }
  }, "Capital")), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-2xl font-bold mt-2",
    style: {
      color: C.ink
    }
  }, euros(valorCompuesto)), /*#__PURE__*/React.createElement("div", {
    className: "h-2 rounded-full mt-3 overflow-hidden",
    style: {
      backgroundColor: C.border
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-full rounded-full",
    style: {
      width: `${Math.min(100, valorCompuesto / max * 100)}%`,
      backgroundColor: C.exc
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] mt-2",
    style: {
      color: C.muted
    }
  }, "Aquí solo mostramos el efecto del interés compuesto; los mercados reales fluctúan."))), /*#__PURE__*/React.createElement("div", {
    className: "mt-5 rounded-xl p-4",
    style: {
      backgroundColor: "rgba(6,10,19,.035)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-4"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-xs font-bold",
    style: {
      color: C.ink
    }
  }, "Horizonte: ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.sand
    }
  }, anios, " años")), /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-bold",
    style: {
      color: C.muted
    }
  }, "Capital inicial: ", euros(aporte))), /*#__PURE__*/React.createElement("input", {
    "aria-label": "Horizonte temporal",
    type: "range",
    min: "1",
    max: "30",
    value: anios,
    onChange: e => setAnios(+e.target.value),
    className: "w-full mt-3 accent-current",
    style: {
      color: C.sand
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "mt-4 h-28 relative border-l border-b",
    style: {
      borderColor: C.border
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 600 120",
    preserveAspectRatio: "none",
    className: "absolute inset-0 w-full h-full"
  }, /*#__PURE__*/React.createElement("polyline", {
    fill: "none",
    stroke: C.mej,
    strokeWidth: "3",
    points: serie.map((p, i) => `${i * (600 / Math.max(1, anios))},${120 - p.infl / aporte * 100}`).join(" ")
  }), /*#__PURE__*/React.createElement("polyline", {
    fill: "none",
    stroke: C.exc,
    strokeWidth: "3",
    points: serie.map((p, i) => `${i * (600 / Math.max(1, anios))},${120 - Math.min(100, p.comp / max * 100)}`).join(" ")
  }))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-4 mt-3 text-[11px] font-bold"
  }, /*#__PURE__*/React.createElement("span", {
    className: "inline-flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("i", {
    className: "w-2 h-2 rounded-full",
    style: {
      backgroundColor: C.mej
    }
  }), " Poder de compra"), /*#__PURE__*/React.createElement("span", {
    className: "inline-flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("i", {
    className: "w-2 h-2 rounded-full",
    style: {
      backgroundColor: C.exc
    }
  }), " Interés compuesto"))));
}

export function HowItWorksSection() {
  const steps = [["01", "Tu radiografía", "Diagnóstico interactivo", "Entenderás ingresos, gastos, ahorro, colchón y deuda sin enfrentarte a un formulario interminable.", I.chartLine], ["02", "Tu perfil", "Test adaptativo", "Tus respuestas se adaptan a ti y conectan el riesgo con tus objetivos y horizonte.", I.target], ["03", "Tu mapa", "Estrategia y simuladores", "Convertirás los datos en decisiones: objetivos, escenarios y acciones que puedas ejecutar.", I.compass]];
  return /*#__PURE__*/React.createElement("section", {
    className: "mt-16 sm:mt-20"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-3xl mb-7"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Qué vas a conseguir"), /*#__PURE__*/React.createElement("h2", {
    className: "font-serif text-3xl sm:text-4xl font-bold mt-2",
    style: {
      color: C.ink
    }
  }, "De entender tu dinero a saber qué hacer con él."), /*#__PURE__*/React.createElement("p", {
    className: "text-sm sm:text-base mt-3",
    style: {
      color: C.muted
    }
  }, "El objetivo no es darte una puntuación y dejarte solo. Es ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.ink
    }
  }, "educarte, darte contexto y convertirlo en un plan accionable."))), /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-3 gap-4"
  }, steps.map(([n, k, t, desc, Icon], i) => /*#__PURE__*/React.createElement(Card, {
    key: n,
    className: "p-6 relative overflow-hidden",
    style: {
      borderColor: C.border
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute top-0 right-0 font-serif text-7xl font-bold opacity-[.045]",
    style: {
      color: C.navy
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    className: "w-11 h-11 rounded-xl flex items-center justify-center",
    style: {
      backgroundColor: "rgba(79,70,229,.12)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    size: 20,
    color: C.sand
  })), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] font-bold uppercase mt-5",
    style: {
      color: C.sand,
      letterSpacing: ".12em"
    }
  }, k), /*#__PURE__*/React.createElement("h3", {
    className: "font-serif text-xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, t), /*#__PURE__*/React.createElement("p", {
    className: "text-sm leading-relaxed mt-2",
    style: {
      color: C.muted
    }
  }, desc)))));
}

export function HeroSection({
  onStart
}) {
  const [expandedIndex, setExpandedIndex] = useState(null);
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
  return /*#__PURE__*/React.createElement("section", {
    className: "relative pt-16 sm:pt-20 pb-14 sm:pb-20"
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 pointer-events-none",
    style: {
      background: "radial-gradient(70% 55% at 50% 0%, rgba(79,70,229,.09), transparent 72%)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid lg:grid-cols-[1fr_.9fr] gap-10 lg:gap-14 items-start lg:items-center"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-bold uppercase mb-4",
    style: {
      color: C.sand,
      letterSpacing: ".14em"
    }
  }, "Pon tu dinero en orden"), /*#__PURE__*/React.createElement("h1", {
    className: "font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.02]",
    style: {
      color: C.ink
    }
  }, "Tu salud financiera puesta a prueba: ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.sand
    }
  }, "¿sientes que el dinero se te escapa y no sabes por qué?")), /*#__PURE__*/React.createElement("p", {
    className: "text-base sm:text-lg mt-6 max-w-xl leading-relaxed",
    style: {
      color: C.muted
    }
  }, "No llegar a fin de mes, no saber en qué se va el sueldo o sentir que la deuda nunca baja es más común de lo que parece. Aquí puedes ver tu situación con claridad y recibir un plan sencillo para empezar a ordenarla, sin tecnicismos y sin que nadie te juzgue."), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center gap-4 mt-8"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onStart,
    className: "inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-transform hover:scale-[1.03]",
    style: {
      backgroundColor: C.sand,
      color: C.white
    }
  }, "Ver mi situación financiera ", /*#__PURE__*/React.createElement(I.arrowRight, {
    size: 16
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => document.getElementById("evidencia")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    }),
    className: "inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold transition-colors hover:bg-black/5",
    style: {
      color: C.ink,
      border: "1.5px solid rgba(79,70,229,.35)"
    }
  }, "Por qué importa la salud financiera")), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-4 mt-5 text-xs",
    style: {
      color: C.mutedLight
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "inline-flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement(I.checkCircle, {
    size: 14,
    color: C.salu
  }), " Sin registro, gratis y en minutos"), /*#__PURE__*/React.createElement("span", {
    className: "inline-flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement(I.chartLine, {
    size: 14,
    color: C.exc
  }), " Resultados al momento"))), /*#__PURE__*/React.createElement(PoderAdquisitivoSection, null)), /*#__PURE__*/React.createElement(HowItWorksSection, null), /*#__PURE__*/React.createElement("div", {
    className: "mt-14 sm:mt-18"
  }, /*#__PURE__*/React.createElement(GastoHormigaSection, null)), /*#__PURE__*/React.createElement("section", {
    id: "evidencia",
    className: "mt-16 sm:mt-20 scroll-mt-24"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-3xl mx-auto text-center mb-8 sm:mb-10"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold uppercase",
    style: {
      color: C.sand,
      letterSpacing: ".16em"
    }
  }, "¿Por qué cuesta tanto ordenar el dinero? Esto dice la investigación"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-2",
    style: {
      color: C.muted
    }
  }, "No hace falta que leas esto para usar la herramienta — está aquí por si te ayuda entender por qué cuesta tanto y por qué merece la pena intentarlo.")), /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-2 gap-5"
  }, tarjetasCientificas.map((t, i) => {
    const Icon = t.icon;
    return /*#__PURE__*/React.createElement(Card, {
      key: t.titulo,
      className: "p-5 sm:p-6 cursor-pointer transition-shadow" + (t.titulo === "Vencer tu cerebro y ahorrar sin sufrir" ? " md:col-span-2 md:max-w-2xl md:mx-auto w-full" : ""),
      style: {
        borderColor: C.border
      },
      onClick: () => setExpandedIndex(i)
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-start justify-between gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3.5 min-w-0"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
      style: {
        backgroundColor: "rgba(79,70,229,.12)"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      size: 20,
      color: C.sand
    })), /*#__PURE__*/React.createElement("h3", {
      className: "font-serif text-lg sm:text-xl font-bold",
      style: {
        color: C.ink
      }
    }, t.titulo)), /*#__PURE__*/React.createElement("div", {
      className: "shrink-0 mt-1",
      style: {
        color: C.sand
      }
    }, /*#__PURE__*/React.createElement(I.chevronDown, {
      size: 18,
      style: {
        transform: "rotate(-90deg)"
      }
    }))));
  }))), expandedIndex !== null && /*#__PURE__*/React.createElement(EvidenciaModal, {
    tarjeta: tarjetasCientificas[expandedIndex],
    onClose: () => setExpandedIndex(null)
  }), /*#__PURE__*/React.createElement("div", {
    className: "mt-16 sm:mt-20 rounded-3xl p-7 sm:p-10 text-center relative overflow-hidden",
    style: {
      background: "linear-gradient(135deg, #111827 0%, #1f2937 55%, #312e81 100%)",
      boxShadow: "0 24px 70px -35px rgba(49,46,129,.55)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute -top-24 -right-20 w-64 h-64 rounded-full pointer-events-none",
    style: {
      background: "radial-gradient(circle, rgba(79,70,229,.22), transparent 65%)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "relative z-10 max-w-2xl mx-auto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] uppercase font-bold",
    style: {
      color: C.sand,
      letterSpacing: ".16em"
    }
  }, "Ahora te toca a ti"), /*#__PURE__*/React.createElement("h2", {
    className: "font-serif text-3xl sm:text-4xl font-bold mt-2",
    style: {
      color: C.white
    }
  }, "Da el primer paso. No hace falta que lo tengas todo claro."), /*#__PURE__*/React.createElement("div", {
    className: "mt-4 rounded-2xl px-5 py-4 text-left",
    style: {
      backgroundColor: "#ffffff",
      border: "1px solid rgba(255,255,255,.25)",
      boxShadow: "0 10px 30px -22px rgba(0,0,0,.45)"
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "cta-final-copy text-sm leading-relaxed",
    style: {
      color: "#111827",
      fontWeight: 600
    }
  }, "Es gratis, no necesitas registrarte y puedes dejarlo cuando quieras. Solo tienes que responder con sinceridad; nosotros ordenamos el resto.")), /*#__PURE__*/React.createElement("button", {
    onClick: onStart,
    className: "mt-7 inline-flex items-center gap-2 px-7 py-4 rounded-xl text-sm font-bold transition-transform hover:scale-[1.03]",
    style: {
      backgroundColor: C.sand,
      color: C.navy
    }
  }, "Comenzar mi diagnóstico ", /*#__PURE__*/React.createElement(I.arrowRight, {
    size: 17
  }))))));
}

export function ConfianzaPrivacidad() {
  return /*#__PURE__*/React.createElement("div", {
    className: "max-w-6xl mx-auto px-4 sm:px-6 mt-8 mb-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl px-4 py-3 flex items-start gap-3",
    style: {
      backgroundColor: "rgba(16,185,129,0.07)",
      border: "1px solid rgba(16,185,129,0.18)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
    style: {
      backgroundColor: "rgba(16,185,129,0.10)"
    }
  }, /*#__PURE__*/React.createElement(I.shieldCheck, {
    size: 17,
    color: C.salu
  })), /*#__PURE__*/React.createElement("div", {
    className: "text-xs leading-relaxed",
    style: {
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("b", null, "Tus datos se guardan solo en tu dispositivo salvo que crees una cuenta."), /*#__PURE__*/React.createElement("div", {
    style: {
      color: C.muted
    }
  }, "Puedes completar el diagnóstico con tranquilidad: la información se mantiene local y solo se sincroniza con la nube si eliges crear una cuenta."))));
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
