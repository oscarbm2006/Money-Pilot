const { useState, useEffect, useRef, useCallback, useMemo, useId } = React;

import { C, FRECUENCIAS, I, supa } from './constantes.js';
import { euros, niceTicks, traducirErrorAuth } from './calculos.js';
import { PrivacyNotice } from './secciones.js';

export function Toast({
  toast
}) {
  if (!toast) return null;
  const tone = toast.tone === "error" ? {
    bg: C.crit,
    ico: I.x
  } : {
    bg: C.navy,
    ico: I.check
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed bottom-5 left-1/2 -translate-x-1/2 z-50 toast-enter",
    key: toast.key
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-xs font-bold",
    style: {
      backgroundColor: tone.bg,
      color: C.white
    }
  }, /*#__PURE__*/React.createElement(tone.ico, {
    size: 14,
    color: C.white
  }), " ", toast.msg));
}

export function Eyebrow({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold uppercase mb-1",
    style: {
      color: C.mej,
      letterSpacing: "0.12em"
    }
  }, children);
}

export function Card({
  children,
  className = "",
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "rounded-2xl border " + className,
    style: {
      backgroundColor: C.surface,
      backgroundImage: "radial-gradient(120% 140% at 0% 0%, rgba(79,70,229,0.20) 0%, rgba(79,70,229,0.05) 32%, rgba(0,0,0,0) 60%), radial-gradient(100% 120% at 100% 100%, rgba(62,111,168,0.16) 0%, rgba(0,0,0,0) 55%), linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.12) 100%)",
      borderColor: C.border,
      boxShadow: "0 0 0 1px rgba(79,70,229,0.22), 0 0 46px -4px rgba(79,70,229,0.5), 0 0 90px -20px rgba(62,111,168,0.35), 0 16px 34px -14px rgba(0,0,0,0.65)",
      ...style
    },
    ...rest
  }, children);
}

export function Badge({
  estado
}) {
  const {
    nombre,
    color,
    light,
    Ico: IcoComp
  } = estado;
  return /*#__PURE__*/React.createElement("span", {
    className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
    style: {
      backgroundColor: light,
      color
    }
  }, /*#__PURE__*/React.createElement(IcoComp, {
    size: 13,
    strokeWidth: 2.5
  }), nombre);
}

export function StatCard({
  icon: IconComp,
  label,
  value,
  sub,
  accent,
  delay = 0
}) {
  return /*#__PURE__*/React.createElement(Card, {
    className: "p-5 flex flex-col gap-3 stagger-item",
    style: {
      animationDelay: delay + "ms"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, label), /*#__PURE__*/React.createElement("div", {
    className: "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
    style: {
      backgroundColor: accent ? accent + "1A" : C.sandLight
    }
  }, /*#__PURE__*/React.createElement(IconComp, {
    size: 17,
    color: accent || C.sand,
    strokeWidth: 2.2
  }))), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-3xl font-bold",
    style: {
      color: C.ink
    }
  }, value), sub && /*#__PURE__*/React.createElement("div", {
    className: "text-xs",
    style: {
      color: C.muted
    }
  }, sub));
}

export function NumberField({
  label,
  value,
  onChange,
  hint,
  suffix = "€"
}) {
  const id = useId();
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    htmlFor: id,
    className: "block text-sm font-bold mb-1.5",
    style: {
      color: C.ink
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "relative"
  }, /*#__PURE__*/React.createElement("input", {
    id: id,
    type: "number",
    inputMode: "decimal",
    value: value === 0 ? "" : value,
    onChange: e => {
      const v = e.target.value;
      onChange(v === "" ? 0 : Math.max(0, Number(v)));
    },
    placeholder: "0",
    className: "w-full rounded-lg px-3 py-2 text-sm font-bold border outline-none",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  }), suffix && /*#__PURE__*/React.createElement("span", {
    className: "absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold",
    style: {
      color: C.muted
    }
  }, suffix)), hint && /*#__PURE__*/React.createElement("p", {
    className: "text-xs mt-1",
    style: {
      color: C.muted
    }
  }, hint));
}

export function focusNextInSequence(e) {
  const container = e.currentTarget.closest("[data-seq-group]");
  if (!container) return;
  const fields = Array.from(container.querySelectorAll("[data-seq-field]"));
  const idx = fields.indexOf(e.currentTarget);
  if (idx > -1 && idx < fields.length - 1) {
    const next = fields[idx + 1];
    next.focus();
    if (next.select) next.select();
  } else if (idx > -1) {
    e.currentTarget.blur();
  }
}

export function FreqField({
  label,
  data,
  onChange,
  hint
}) {
  const id = useId();
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    htmlFor: id,
    className: "block text-sm font-bold mb-1.5",
    style: {
      color: C.ink
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative flex-1 min-w-0"
  }, /*#__PURE__*/React.createElement("input", {
    id: id,
    type: "number",
    inputMode: "decimal",
    enterKeyHint: "next",
    "data-seq-field": true,
    value: data.valor === 0 ? "" : data.valor,
    onChange: e => {
      const v = e.target.value;
      onChange({
        ...data,
        valor: v === "" ? 0 : Math.max(0, Number(v))
      });
    },
    onKeyDown: e => {
      if (e.key === "Enter") {
        e.preventDefault();
        focusNextInSequence(e);
      }
    },
    placeholder: "0",
    className: "w-full rounded-lg pl-3 pr-7 py-2 text-sm font-bold border outline-none",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold",
    style: {
      color: C.muted
    }
  }, "€")), /*#__PURE__*/React.createElement("select", {
    value: data.frecuencia,
    onChange: e => onChange({
      ...data,
      frecuencia: e.target.value
    }),
    className: "rounded-lg px-1.5 text-xs font-bold border outline-none shrink-0",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  }, FRECUENCIAS.map(f => /*#__PURE__*/React.createElement("option", {
    key: f.value,
    value: f.value
  }, f.label)))), hint && /*#__PURE__*/React.createElement("p", {
    className: "text-xs mt-1",
    style: {
      color: C.muted
    }
  }, hint));
}

export function FadeSwitch({
  id,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    key: id,
    className: "fade-switch-enter"
  }, children);
}

export function AnimatedNumber({
  value,
  format = v => euros(v)
}) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef(null);
  useEffect(() => {
    const from = fromRef.current,
      to = value;
    if (from === to) return;
    const start = performance.now();
    const duration = 450;
    const tick = now => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);else fromRef.current = to;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [value]);
  return format(display);
}

export function ProgressBar({
  pctValue,
  color,
  bg = C.border,
  height = 8
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "w-full rounded-full overflow-hidden",
    style: {
      backgroundColor: bg,
      height
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-full rounded-full",
    style: {
      width: Math.min(Math.max(pctValue, 0), 100) + "%",
      backgroundColor: color,
      transition: "width 600ms cubic-bezier(0.16,1,0.3,1)"
    }
  }));
}

export function EmergencyGauge({
  meses,
  objetivoMeses = 6,
  color
}) {
  const clamped = Math.min(meses, objetivoMeses * 1.5);
  const fraction = Math.min(clamped / (objetivoMeses * 1.5), 1);
  const [animFrac, setAnimFrac] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimFrac(fraction), 80);
    return () => clearTimeout(t);
  }, [fraction]);
  const size = 180,
    stroke = 16,
    r = (size - stroke) / 2,
    circumference = Math.PI * r;
  const offset = circumference * (1 - animFrac);
  return /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col items-center"
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size / 2 + stroke / 2,
    viewBox: "0 0 " + size + " " + (size / 2 + stroke / 2)
  }, /*#__PURE__*/React.createElement("path", {
    d: "M " + stroke / 2 + " " + size / 2 + " A " + r + " " + r + " 0 0 1 " + (size - stroke / 2) + " " + size / 2,
    fill: "none",
    stroke: C.border,
    strokeWidth: stroke,
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M " + stroke / 2 + " " + size / 2 + " A " + r + " " + r + " 0 0 1 " + (size - stroke / 2) + " " + size / 2,
    fill: "none",
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeDasharray: circumference,
    strokeDashoffset: offset,
    style: {
      transition: "stroke-dashoffset 700ms cubic-bezier(0.16,1,0.3,1), stroke 400ms"
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "text-center -mt-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-3xl font-bold",
    style: {
      color
    }
  }, meses.toFixed(1)), /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold",
    style: {
      color: C.muted
    }
  }, "de ", objetivoMeses, " meses objetivo")));
}

export function Termometro({
  score,
  color
}) {
  const [animScore, setAnimScore] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimScore(score), 100);
    return () => clearTimeout(t);
  }, [score]);
  const w = 56,
    tubeTop = 6,
    tubeBottom = 132,
    tubeW = 18,
    bulbR = 22,
    bulbCy = tubeBottom + bulbR - 6,
    h = bulbCy + bulbR + 4;
  const fillHeight = (tubeBottom - tubeTop) * (Math.max(animScore, 4) / 100);
  const fillY = tubeBottom - fillHeight;
  return /*#__PURE__*/React.createElement("svg", {
    width: w,
    height: h,
    viewBox: "0 0 " + w + " " + h,
    className: "shrink-0"
  }, /*#__PURE__*/React.createElement("rect", {
    x: w / 2 - tubeW / 2,
    y: tubeTop,
    width: tubeW,
    height: tubeBottom - tubeTop,
    rx: tubeW / 2,
    fill: C.border,
    opacity: "0.5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: w / 2,
    cy: bulbCy,
    r: bulbR,
    fill: C.border,
    opacity: "0.5"
  }), /*#__PURE__*/React.createElement("rect", {
    x: w / 2 - tubeW / 2,
    y: fillY,
    width: tubeW,
    height: tubeBottom - fillY,
    rx: tubeW / 2,
    fill: color,
    style: {
      transition: "y 800ms cubic-bezier(0.16,1,0.3,1), height 800ms cubic-bezier(0.16,1,0.3,1)"
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: w / 2,
    cy: bulbCy,
    r: bulbR - 4,
    fill: color
  }), [25, 50, 75].map(p => {
    const y = tubeBottom - (tubeBottom - tubeTop) * (p / 100);
    return /*#__PURE__*/React.createElement("line", {
      key: p,
      x1: w / 2 + tubeW / 2 + 2,
      x2: w / 2 + tubeW / 2 + 7,
      y1: y,
      y2: y,
      stroke: C.border,
      strokeWidth: "2"
    });
  }));
}

export function DesgloseBarra({
  label,
  pts,
  max,
  color
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-bold",
    style: {
      color: C.ink
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-bold",
    style: {
      color: C.muted
    }
  }, Math.round(pts), "/", max)), /*#__PURE__*/React.createElement(ProgressBar, {
    pctValue: pts / max * 100,
    color: color,
    height: 5
  }));
}

export function SimpleStackedBarChart({
  data,
  xKey,
  aportadoKey,
  interesKey,
  height = 280,
  formatY = v => v,
  colorAportado,
  colorInteres,
  marcaAnio = null
}) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const n = data.length;
  const width = Math.max(680, n * 16);
  const padL = 54,
    padR = 24,
    padT = 10,
    padB = 40;
  const innerW = width - padL - padR,
    innerH = height - padT - padB;
  const totals = data.map(d => (d[aportadoKey] || 0) + (d[interesKey] || 0));
  const maxRaw = Math.max(1, ...totals);
  const {
    ticks,
    niceMax
  } = niceTicks(maxRaw, 5);
  const barGap = innerW / n * 0.2;
  const barW = innerW / n - barGap;
  const xFor = i => padL + innerW / n * i + barGap / 2;
  const yFor = v => padT + innerH - innerH * (v / niceMax);
  const hovered = hoverIndex == null ? null : data[hoverIndex];
  const marcaIndex = marcaAnio == null ? -1 : data.findIndex(d => d[xKey] === marcaAnio);
  return /*#__PURE__*/React.createElement("div", {
    className: "relative w-full overflow-x-auto chart-interactive"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 " + width + " " + height,
    style: {
      width: width,
      minWidth: "100%",
      height
    },
    role: "img",
    "aria-label": "Gráfico de aportaciones e intereses generados"
  }, ticks.map((t, i) => /*#__PURE__*/React.createElement("g", {
    key: i
  }, /*#__PURE__*/React.createElement("line", {
    x1: padL,
    x2: width - padR,
    y1: yFor(t),
    y2: yFor(t),
    stroke: C.border,
    strokeDasharray: t === 0 ? "0" : "3 3"
  }), /*#__PURE__*/React.createElement("text", {
    x: padL - 6,
    y: yFor(t) + 3,
    fontSize: "10",
    fill: C.muted,
    textAnchor: "end"
  }, formatY(t)))), data.map((d, i) => {
    const aportado = d[aportadoKey] || 0,
      interes = Math.max(0, d[interesKey] || 0);
    const x = xFor(i);
    const yAportadoTop = yFor(aportado);
    const yTotalTop = yFor(aportado + interes);
    const isHover = hoverIndex === i;
    return /*#__PURE__*/React.createElement("g", {
      key: i,
      onMouseEnter: () => setHoverIndex(i),
      style: {
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement("rect", {
      x: x,
      y: yAportadoTop,
      width: barW,
      height: Math.max(0, padT + innerH - yAportadoTop),
      rx: "3",
      fill: colorAportado,
      opacity: isHover ? 1 : 0.9
    }), /*#__PURE__*/React.createElement("rect", {
      x: x,
      y: yTotalTop,
      width: barW,
      height: Math.max(0, yAportadoTop - yTotalTop),
      rx: "3",
      fill: colorInteres,
      opacity: isHover ? 1 : 0.9
    }), /*#__PURE__*/React.createElement("rect", {
      x: x,
      y: padT,
      width: barW,
      height: innerH,
      fill: "transparent"
    }));
  }), data.map((d, i) => {
    if (n > 20 && i % Math.ceil(n / 16) !== 0) return null;
    return /*#__PURE__*/React.createElement("text", {
      key: i,
      x: xFor(i) + barW / 2,
      y: height - padB + 16,
      fontSize: "9",
      fill: C.muted,
      textAnchor: "middle"
    }, d[xKey]);
  }), marcaIndex >= 0 && /*#__PURE__*/React.createElement("g", {
    pointerEvents: "none"
  }, /*#__PURE__*/React.createElement("line", {
    x1: xFor(marcaIndex) + barW / 2,
    x2: xFor(marcaIndex) + barW / 2,
    y1: padT,
    y2: padT + innerH,
    stroke: C.sand,
    strokeWidth: "2",
    strokeDasharray: "4 3"
  }), /*#__PURE__*/React.createElement("rect", {
    x: Math.min(Math.max(xFor(marcaIndex) + barW / 2 - 42, padL), width - padR - 84),
    y: padT - 2,
    width: "84",
    height: "16",
    rx: "5",
    fill: C.sand
  }), /*#__PURE__*/React.createElement("text", {
    x: Math.min(Math.max(xFor(marcaIndex) + barW / 2, padL + 42), width - padR - 42),
    y: padT + 10,
    fontSize: "9",
    fontWeight: "700",
    fill: "#fff",
    textAnchor: "middle"
  }, "Año objetivo")), hovered && /*#__PURE__*/React.createElement("g", {
    transform: `translate(${Math.max(padL, Math.min(width - 190, xFor(hoverIndex) - 80))},8)`
  }, /*#__PURE__*/React.createElement("rect", {
    width: "180",
    height: "66",
    rx: "10",
    fill: "#ffffff",
    stroke: C.border,
    filter: "drop-shadow(0 5px 12px rgba(49,46,129,.12))"
  }), /*#__PURE__*/React.createElement("text", {
    x: "12",
    y: "19",
    fontSize: "10",
    fontWeight: "700",
    fill: C.navy
  }, "Año ", hovered[xKey]), /*#__PURE__*/React.createElement("circle", {
    cx: "16",
    cy: "34",
    r: "4",
    fill: colorAportado
  }), /*#__PURE__*/React.createElement("text", {
    x: "26",
    y: "38",
    fontSize: "10",
    fill: C.ink
  }, "Aportado: ", formatY(hovered[aportadoKey] || 0)), /*#__PURE__*/React.createElement("circle", {
    cx: "16",
    cy: "50",
    r: "4",
    fill: colorInteres
  }), /*#__PURE__*/React.createElement("text", {
    x: "26",
    y: "54",
    fontSize: "10",
    fill: C.ink
  }, "Intereses: ", formatY(hovered[interesKey] || 0)))));
}

export function SimpleAreaChart({
  data,
  xKey,
  series,
  height = 240,
  formatY = v => v
}) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const width = 680,
    padL = 46,
    padR = 10,
    padT = 10,
    padB = 36;
  const innerW = width - padL - padR,
    innerH = height - padT - padB;
  const allValues = data.flatMap(d => series.map(s => d[s.key] || 0));
  const maxRaw = Math.max(1, ...allValues);
  const {
    ticks,
    niceMax
  } = niceTicks(maxRaw, 6);
  const xFor = i => padL + innerW * (data.length <= 1 ? 0 : i / (data.length - 1));
  const yFor = v => padT + innerH - innerH * (v / niceMax);
  const handleMove = e => {
    if (!data.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    // 1. Píxeles físicos del ratón dentro del contenedor
    const screenX = e.clientX - rect.left;
    // 2. Escalar esos píxeles físicos al sistema de coordenadas interno del SVG (width: 680)
    const svgX = screenX / rect.width * width;
    // 3. Ahora ya podemos restar el padding interno del SVG
    const innerX = svgX - padL;
    const fraction = innerX / innerW;
    const raw = fraction * (data.length - 1);
    setHoverIndex(Math.max(0, Math.min(data.length - 1, Math.round(raw))));
  };
  const hovered = hoverIndex == null ? null : data[hoverIndex];
  const tooltipX = hoverIndex == null ? 0 : xFor(hoverIndex);
  const tooltipW = 172;
  const tooltipLeft = Math.max(6, Math.min(width - tooltipW - 6, tooltipX - tooltipW / 2));
  return /*#__PURE__*/React.createElement("div", {
    className: "relative w-full h-full chart-interactive",
    onMouseMove: handleMove,
    onMouseLeave: () => setHoverIndex(null)
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 " + width + " " + height,
    className: "w-full h-full",
    role: "img",
    "aria-label": "Gráfico interactivo de interés compuesto"
  }, ticks.map((t, i) => /*#__PURE__*/React.createElement("g", {
    key: i
  }, /*#__PURE__*/React.createElement("line", {
    x1: padL,
    x2: width - padR,
    y1: yFor(t),
    y2: yFor(t),
    stroke: C.border,
    strokeDasharray: t === 0 ? "0" : "3 3"
  }), /*#__PURE__*/React.createElement("text", {
    x: padL - 6,
    y: yFor(t) + 3,
    fontSize: "10",
    fill: C.muted,
    textAnchor: "end"
  }, formatY(t)))), series.map((s, si) => {
    const pts = data.map((d, i) => [xFor(i), yFor(d[s.key] || 0)]);
    const areaPath = "M" + pts.map(p => p.join(",")).join(" L") + " L" + xFor(data.length - 1) + "," + (padT + innerH) + " L" + padL + "," + (padT + innerH) + " Z";
    const linePath = "M" + pts.map(p => p.join(",")).join(" L");
    return /*#__PURE__*/React.createElement("g", {
      key: si
    }, /*#__PURE__*/React.createElement("path", {
      d: areaPath,
      fill: s.color,
      opacity: s.opacity ?? 0.3
    }), /*#__PURE__*/React.createElement("path", {
      d: linePath,
      fill: "none",
      stroke: s.color,
      strokeWidth: 2.2
    }));
  }), data.map((d, i) => /*#__PURE__*/React.createElement("text", {
    key: i,
    x: xFor(i),
    y: height - padB + 14,
    fontSize: "8",
    fill: C.muted,
    textAnchor: "end",
    transform: `rotate(-60, ${xFor(i)}, ${height - padB + 14})`
  }, d[xKey])), /*#__PURE__*/React.createElement("rect", {
    x: padL,
    y: padT,
    width: innerW,
    height: innerH,
    fill: "transparent",
    pointerEvents: "all"
  }), hoverIndex != null && hovered && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
    x1: tooltipX,
    x2: tooltipX,
    y1: padT,
    y2: padT + innerH,
    stroke: C.sand,
    strokeWidth: "1.5",
    strokeDasharray: "4 3",
    opacity: ".7"
  }), series.map((s, si) => /*#__PURE__*/React.createElement("circle", {
    key: si,
    cx: tooltipX,
    cy: yFor(hovered[s.key] || 0),
    r: "4",
    fill: C.surface,
    stroke: s.color,
    strokeWidth: "2.5"
  })), /*#__PURE__*/React.createElement("g", {
    transform: `translate(${tooltipLeft},8)`
  }, /*#__PURE__*/React.createElement("rect", {
    width: tooltipW,
    height: 66 + series.length * 16,
    rx: "10",
    fill: "#ffffff",
    stroke: C.border,
    filter: "drop-shadow(0 5px 12px rgba(49,46,129,.12))"
  }), /*#__PURE__*/React.createElement("text", {
    x: "12",
    y: "19",
    fontSize: "10",
    fontWeight: "700",
    fill: C.navy
  }, hovered[xKey]), series.map((s, si) => /*#__PURE__*/React.createElement("g", {
    key: si,
    transform: `translate(0,${30 + si * 16})`
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "13",
    cy: "-3",
    r: "3",
    fill: s.color
  }), /*#__PURE__*/React.createElement("text", {
    x: "21",
    y: "0",
    fontSize: "10",
    fill: C.muted
  }, s.label || s.key, ": ", /*#__PURE__*/React.createElement("tspan", {
    fontWeight: "700",
    fill: C.ink
  }, formatY(hovered[s.key] || 0)))))))));
}

export function SimpleDonut({
  data,
  size = 200,
  thickness = 28,
  formatCentro = v => v + "%"
}) {
  const [hover, setHover] = useState(null);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  let acc = 0;
  const segments = data.map((d, i) => {
    const frac = d.value / total;
    const dash = circumference * frac;
    const gap = circumference - dash;
    const rotation = acc / total * 360;
    acc += d.value;
    return {
      ...d,
      dash,
      gap,
      rotation,
      i
    };
  });
  const active = hover != null ? segments[hover] : null;
  return /*#__PURE__*/React.createElement("div", {
    className: "relative inline-block",
    style: {
      width: size,
      height: size
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 " + size + " " + size
  }, /*#__PURE__*/React.createElement("g", {
    transform: "rotate(-90 " + size / 2 + " " + size / 2 + ")"
  }, segments.map(seg => /*#__PURE__*/React.createElement("circle", {
    key: seg.i,
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: seg.color,
    strokeWidth: hover === seg.i ? thickness + 6 : thickness,
    strokeDasharray: seg.dash + " " + seg.gap,
    transform: "rotate(" + seg.rotation + " " + size / 2 + " " + size / 2 + ")",
    style: {
      transition: "stroke-width 200ms ease, opacity 200ms ease",
      opacity: hover == null || hover === seg.i ? 1 : 0.35,
      cursor: "pointer"
    },
    onMouseEnter: () => setHover(seg.i),
    onMouseLeave: () => setHover(null)
  })))), /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-3"
  }, active ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "text-xl font-bold font-serif",
    style: {
      color: active.color
    }
  }, formatCentro(active.value)), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] font-bold mt-0.5 leading-tight",
    style: {
      color: C.muted
    }
  }, active.name)) : /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] font-bold",
    style: {
      color: C.mutedLight
    }
  }, "Pasa el cursor", /*#__PURE__*/React.createElement("br", null), "por el gráfico")));
}

export function EvidenciaModal({
  tarjeta,
  onClose
}) {
  const Icon = tarjeta.icon;
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center px-4",
    style: {
      backgroundColor: "rgba(5,8,16,0.7)"
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    className: "w-full max-w-xl rounded-2xl overflow-hidden flex flex-col toast-enter",
    style: {
      backgroundColor: C.surface,
      maxHeight: "85vh"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between gap-3 px-5 sm:px-6 pt-5 sm:pt-6 pb-4 shrink-0",
    style: {
      borderBottom: "1px solid " + C.border
    }
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
  }, tarjeta.titulo)), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Cerrar",
    className: "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement(I.x, {
    size: 18
  }))), /*#__PURE__*/React.createElement("div", {
    className: "px-5 sm:px-6 py-5 overflow-y-auto"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm leading-relaxed",
    style: {
      color: C.muted
    }
  }, tarjeta.texto), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] leading-relaxed mt-4",
    style: {
      color: C.mutedLight
    }
  }, tarjeta.fuente))));
}

export function FeedbackModal({
  onClose
}) {
  const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdZ4VFZ4YlVkvARja94yGosvInko1zfN7RAH916SXlssPZh-g/viewform?usp=header&embedded=true";
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center px-4",
    style: {
      backgroundColor: "rgba(5,8,16,0.7)"
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    className: "w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col",
    style: {
      backgroundColor: C.surface,
      maxHeight: "90vh"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between px-5 py-4 shrink-0",
    style: {
      borderBottom: "1px solid " + C.border
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "font-serif text-lg font-bold",
    style: {
      color: C.ink
    }
  }, "Danos tu opinión"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Cerrar",
    className: "w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement(I.x, {
    size: 18
  }))), /*#__PURE__*/React.createElement("div", {
    className: "px-5 pt-3 shrink-0"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs",
    style: {
      color: C.muted
    }
  }, "Tu respuesta es ", /*#__PURE__*/React.createElement("b", null, "anónima"), ": no recogemos ningún dato identificativo. ¡Gracias por ayudarnos a mejorar!")), /*#__PURE__*/React.createElement("div", {
    className: "p-4"
  }, /*#__PURE__*/React.createElement("iframe", {
    src: FORM_URL,
    title: "Formulario de opinión",
    className: "w-full h-[80svh] rounded-xl",
    style: {
      border: "1px solid " + C.border,
      backgroundColor: C.paper
    }
  }, "Cargando…"))));
}

export function AuthModal({
  onClose,
  onAuthSuccess,
  signUp,
  signIn
}) {
  const [modo, setModo] = useState("registro");
  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [avisoConfirmacion, setAvisoConfirmacion] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const loginConGoogle = async () => {
    setError(null);
    setLoadingGoogle(true);
    const {
      error
    } = await supa.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      setError(traducirErrorAuth(error.message));
      setLoadingGoogle(false);
    }
    // Si no hay error, el navegador redirige a Google automáticamente
  };
  const emailsNoCoinciden = modo === "registro" && emailConfirm.length > 0 && email.trim().toLowerCase() !== emailConfirm.trim().toLowerCase();
  const submit = async e => {
    e.preventDefault();
    setError(null);
    if (modo === "registro" && email.trim().toLowerCase() !== emailConfirm.trim().toLowerCase()) {
      setError("Los dos emails no coinciden. Revísalos antes de continuar.");
      return;
    }
    setLoading(true);
    try {
      if (modo === "registro") {
        const {
          data,
          error
        } = await signUp(email, password);
        if (error) {
          setError(traducirErrorAuth(error.message));
        } else if (data?.session) {
          onAuthSuccess();
        } else {
          setAvisoConfirmacion(true);
        }
      } else {
        const {
          data,
          error
        } = await signIn(email, password);
        if (error) {
          setError(traducirErrorAuth(error.message));
        } else {
          onAuthSuccess();
        }
      }
    } finally {
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center px-4",
    style: {
      backgroundColor: "rgba(5,8,16,0.7)"
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    className: "w-full max-w-sm rounded-2xl p-6",
    style: {
      backgroundColor: C.surface
    }
  }, avisoConfirmacion ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-4"
  }, /*#__PURE__*/React.createElement(I.check, {
    size: 28,
    color: C.salu,
    className: "mx-auto mb-3"
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-bold",
    style: {
      color: C.ink
    }
  }, "¡Cuenta creada!"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1",
    style: {
      color: C.muted
    }
  }, "Ya puedes iniciar sesión con tu email y contraseña. Guarda bien tus datos: si el email tiene un error, no podrás recuperar tu cuenta más adelante."), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "mt-5 px-4 py-2 rounded-lg text-sm font-bold",
    style: {
      backgroundColor: C.navy,
      color: C.white
    }
  }, "Entendido")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-4"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "font-serif text-xl font-bold",
    style: {
      color: C.ink
    }
  }, modo === "registro" ? "Crear cuenta" : "Iniciar sesión"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Cerrar",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement(I.x, {
    size: 18
  }))), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mb-4",
    style: {
      color: C.muted
    }
  }, modo === "registro" ? "Guarda tu progreso en la nube y accede desde cualquier dispositivo." : "Bienvenido de nuevo."), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: loginConGoogle,
    disabled: loadingGoogle,
    className: "w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold border transition-colors hover:bg-black/5 mb-3",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.white
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 48 48"
  }, /*#__PURE__*/React.createElement("path", {
    fill: "#FFC107",
    d: "M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#FF3D00",
    d: "M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.1 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#4CAF50",
    d: "M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 35.4 27 36.3 24 36.3c-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.5 39.6 16.2 44 24 44z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#1976D2",
    d: "M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.7l6.6 5.6C40.9 36.6 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z"
  })), loadingGoogle ? "Redirigiendo…" : "Continuar con Google"), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 mb-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-1 h-px",
    style: {
      backgroundColor: C.border
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-xs",
    style: {
      color: C.muted
    }
  }, "o con tu email"), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 h-px",
    style: {
      backgroundColor: C.border
    }
  })), /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    className: "space-y-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold mb-1",
    style: {
      color: C.ink
    }
  }, "Email"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    required: true,
    value: email,
    onChange: e => setEmail(e.target.value),
    className: "w-full rounded-lg px-3 py-2 text-sm border outline-none",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  })), modo === "registro" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold mb-1",
    style: {
      color: C.ink
    }
  }, "Repite tu email"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    required: true,
    value: emailConfirm,
    onChange: e => setEmailConfirm(e.target.value),
    onPaste: e => e.preventDefault(),
    className: "w-full rounded-lg px-3 py-2 text-sm border outline-none",
    style: {
      borderColor: emailsNoCoinciden ? C.crit : C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  }), emailsNoCoinciden && /*#__PURE__*/React.createElement("p", {
    className: "text-xs mt-1",
    style: {
      color: C.critText
    }
  }, "Los emails no coinciden."), /*#__PURE__*/React.createElement("p", {
    className: "text-xs mt-1",
    style: {
      color: C.mutedLight
    }
  }, "No dejamos pegar aquí para asegurarnos de que lo escribes bien: como no enviamos email de confirmación, es la única forma de comprobar que no hay un error.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold mb-1",
    style: {
      color: C.ink
    }
  }, "Contraseña"), /*#__PURE__*/React.createElement("div", {
    className: "relative"
  }, /*#__PURE__*/React.createElement("input", {
    type: verPassword ? "text" : "password",
    required: true,
    minLength: 6,
    value: password,
    onChange: e => setPassword(e.target.value),
    className: "w-full rounded-lg pl-3 pr-10 py-2 text-sm border outline-none",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setVerPassword(v => !v),
    "aria-label": verPassword ? "Ocultar contraseña" : "Mostrar contraseña",
    className: "absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded",
    style: {
      color: C.muted
    }
  }, verPassword ? /*#__PURE__*/React.createElement(I.eyeOff, {
    size: 16
  }) : /*#__PURE__*/React.createElement(I.eye, {
    size: 16
  })))), modo === "registro" && /*#__PURE__*/React.createElement(PrivacyNotice, null), error && /*#__PURE__*/React.createElement("div", {
    className: "text-xs rounded-lg px-3 py-2",
    style: {
      backgroundColor: "rgba(239,68,68,0.08)",
      color: C.critText
    }
  }, error), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading || emailsNoCoinciden,
    className: "w-full py-2.5 rounded-lg text-sm font-bold disabled:opacity-60",
    style: {
      backgroundColor: C.navy,
      color: C.white
    }
  }, loading ? "Un momento…" : modo === "registro" ? "Crear cuenta" : "Entrar")), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setModo(modo === "registro" ? "login" : "registro");
      setError(null);
      setEmailConfirm("");
    },
    className: "w-full text-center text-xs font-bold mt-4",
    style: {
      color: C.muted
    }
  }, modo === "registro" ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"))));
}

export function ContinuarBar({ label, onClick }) {
  if (!onClick) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "max-w-3xl mx-auto mt-6 flex justify-end"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    className: "inline-flex items-center gap-2 text-sm font-bold px-5 py-3 rounded-xl transition-transform hover:scale-[1.02]",
    style: { backgroundColor: C.sand, color: C.white }
  }, label, /*#__PURE__*/React.createElement(I.chevronRight, { size: 16 })));
}
