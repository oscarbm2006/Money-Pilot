const { useState, useEffect, useRef, useCallback, useMemo, useId } = React;

import { ACTIVOS_DEF, ASIGNACION, BLOG_ADMIN_EMAIL, C, CUENTA_TIPOS_DEF, I, NOMBRES_FASE_BLOG, OBJETIVOS_DEF, PERFILES_INFO, PRIORIDADES_OBJETIVO, PRIORIDAD_LABEL, QUIZ_DEF, SECCIONES_BLOG, TIPOS_ACTIVO_DEF, TIPOS_INVERSION_DEF, supa } from './constantes.js';
import { aportacionNecesariaParaObjetivo, calcularCapacidadFinanciera, calcularFondoEmergencia, calcularPerfilMultidimensional, calcularPlanObjetivos, calcularSaludFinanciera, crearIdObjetivo, estadoAhorro, euros, fmtFecha, formatMeses, getNextQuestionId, mdToHtml, normalizarObjetivo, normalizarObjetivos, pct, proyeccionInteres, quizNumero, recomendacionObjetivoPorHorizonte, reconstruirEstadoQuiz, rentabilidadNecesariaParaObjetivo, simularAmortizacion, sincronizarObjetivos, slugify, tiempoNecesarioParaObjetivo, totalMensual } from './calculos.js';
import { AnimatedNumber, Badge, Card, DesgloseBarra, Eyebrow, FadeSwitch, NumberField, ProgressBar, SimpleAreaChart, SimpleDonut, SimpleStackedBarChart, StatCard, Termometro } from './ui-basicos.js';
import { AcordeonFase, GastosTabs } from './secciones.js';

export function PrintSummary({
  datos,
  liquidezReal,
  perfil,
  gastoTotal,
  ahorroDisponible,
  ratioAhorro
}) {
  const cuotasDeuda = datos.deudas.reduce((s, d) => s + Number(d.cuota || 0), 0);
  const objetivos = normalizarObjetivos(datos);
  const planObjetivos = calcularPlanObjetivos(liquidezReal == null ? datos : {
    ...datos,
    ahorroActual: liquidezReal
  });
  const deudasActivas = datos.deudas.filter(d => Number(d.pendiente) > 0);
  const fondo = calcularFondoEmergencia(liquidezReal == null ? datos : {
    ...datos,
    ahorroActual: liquidezReal
  });
  const coberturaMeses = fondo.coberturaMeses == null ? 0 : fondo.coberturaMeses;
  const objetivoFondo = fondo.objetivo == null ? 0 : fondo.objetivo;
  const fecha = new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "print-only",
    style: {
      backgroundColor: "#fff",
      color: "#1E1E2E",
      padding: "32px",
      fontFamily: "ui-sans-serif, system-ui, sans-serif"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 24,
      fontWeight: 700,
      marginBottom: 4
    }
  }, "MoneyPilot — Resumen"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: "#6B7280",
      marginBottom: 24
    }
  }, "Generado el ", fecha, " · Documento educativo, no constituye asesoramiento financiero."), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      marginTop: 20,
      marginBottom: 8,
      borderBottom: "1px solid #E5E7EB",
      paddingBottom: 4
    }
  }, "Panorama mensual"), /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      fontSize: 13,
      borderCollapse: "collapse"
    }
  }, /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "3px 0"
    }
  }, "Ingresos mensuales"), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: "right",
      fontWeight: 700
    }
  }, euros((Number(datos.ingresos) || 0) + (Number(datos.otrosIngresos) || 0)))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "3px 0"
    }
  }, "Gastos totales (incl. cuotas de deuda)"), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: "right",
      fontWeight: 700
    }
  }, euros(gastoTotal))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "3px 0"
    }
  }, "Ahorro disponible"), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: "right",
      fontWeight: 700
    }
  }, euros(ahorroDisponible))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "3px 0"
    }
  }, "Cuánto ahorras (% de lo que ingresas)"), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: "right",
      fontWeight: 700
    }
  }, pct(ratioAhorro * 100))))), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      marginTop: 20,
      marginBottom: 8,
      borderBottom: "1px solid #E5E7EB",
      paddingBottom: 4
    }
  }, "Fondo de emergencia"), /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      fontSize: 13,
      borderCollapse: "collapse"
    }
  }, /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "3px 0"
    }
  }, "Ahorro actual"), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: "right",
      fontWeight: 700
    }
  }, euros(datos.ahorroActual))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "3px 0"
    }
  }, "Objetivo (6 meses de gasto)"), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: "right",
      fontWeight: 700
    }
  }, euros(objetivoFondo))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "3px 0"
    }
  }, "Cobertura actual"), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: "right",
      fontWeight: 700
    }
  }, coberturaMeses.toFixed(1), " meses")))), deudasActivas.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      marginTop: 20,
      marginBottom: 8,
      borderBottom: "1px solid #E5E7EB",
      paddingBottom: 4
    }
  }, "Deudas activas"), /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      fontSize: 13,
      borderCollapse: "collapse"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      textAlign: "left",
      color: "#6B7280"
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      padding: "3px 0"
    }
  }, "Deuda"), /*#__PURE__*/React.createElement("th", null, "Pendiente"), /*#__PURE__*/React.createElement("th", null, "Cuota/mes"), /*#__PURE__*/React.createElement("th", null, "Interés"))), /*#__PURE__*/React.createElement("tbody", null, deudasActivas.map((d, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "3px 0"
    }
  }, d.nombre || "Sin nombre"), /*#__PURE__*/React.createElement("td", null, euros(Number(d.pendiente))), /*#__PURE__*/React.createElement("td", null, euros(Number(d.cuota))), /*#__PURE__*/React.createElement("td", null, pct(Number(d.tasa))))))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: "#6B7280",
      marginTop: 6
    }
  }, "Total en cuotas mensuales: ", euros(cuotasDeuda))), perfil && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      marginTop: 20,
      marginBottom: 8,
      borderBottom: "1px solid #E5E7EB",
      paddingBottom: 4
    }
  }, "Perfil de riesgo"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("b", null, perfil), " — ", PERFILES_INFO[perfil]?.explicacion)), objetivos.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      marginTop: 20,
      marginBottom: 8,
      borderBottom: "1px solid #E5E7EB",
      paddingBottom: 4
    }
  }, "Objetivos"), planObjetivos.objetivos.map(o => /*#__PURE__*/React.createElement("p", {
    key: o.id,
    style: {
      fontSize: 13,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("b", null, o.nombre || OBJETIVOS_DEF.find(x => x.id === o.tipo)?.label || o.tipo), o.importeObjetivo > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, " — ", euros(o.importeObjetivo), " en ", o.horizonteAniosCalculado > 0 ? o.horizonteAniosCalculado.toFixed(1) + " años" : "sin plazo"), planObjetivos.principal?.id === o.id && /*#__PURE__*/React.createElement(React.Fragment, null, " · Principal")))));
}

export function Dashboard({
  ingresos,
  gastoTotal,
  ahorroDisponible,
  ratioAhorro,
  ahorroActual,
  cargaDeuda,
  perfil,
  historial,
  user,
  onOpenAuth,
  objetivos = [],
  planObjetivos
}) {
  const estado = estadoAhorro(ratioAhorro);
  const coberturaMeses = planObjetivos?.fondoEmergenciaNecesario == null || planObjetivos?.ahorroActual == null ? 0 : planObjetivos.fondoEmergenciaNecesario > 0 ? planObjetivos.ahorroActual / (planObjetivos.fondoEmergenciaNecesario / 6) : 6;
  const salud = calcularSaludFinanciera({
    ratioAhorro,
    coberturaMeses,
    cargaDeuda,
    perfil
  });
  const saludIco = salud.nombre === "Crítico" ? I.x : salud.nombre === "Mejorable" ? I.alert : I.check;
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "font-serif text-2xl font-bold",
    style: {
      color: C.ink
    }
  }, "Resumen financiero"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1 readable-subtitle"
  }, "Vista rápida de tu situación actual.")), /*#__PURE__*/React.createElement(Card, {
    className: "p-5",
    style: {
      borderColor: salud.color + "40"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col sm:flex-row items-center sm:items-start gap-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-5"
  }, /*#__PURE__*/React.createElement(Termometro, {
    score: salud.score,
    color: salud.color
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Salud financiera general"), /*#__PURE__*/React.createElement("div", {
    className: "flex items-baseline gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-serif text-4xl font-bold",
    style: {
      color: salud.color
    }
  }, salud.score), /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-bold",
    style: {
      color: C.muted
    }
  }, "/ 100")), /*#__PURE__*/React.createElement("div", {
    className: "mt-1.5"
  }, /*#__PURE__*/React.createElement(Badge, {
    estado: {
      nombre: salud.nombre,
      color: salud.color,
      light: salud.light,
      Ico: saludIco
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "text-xs mt-3 max-w-sm",
    style: {
      color: C.muted
    }
  }, salud.score < 35 ? "No necesitas arreglarlo todo hoy. Empecemos por crear margen y una red de seguridad." : salud.score < 60 ? "Ya tenemos una foto clara. Unos pocos ajustes pueden darte más margen y protección." : salud.score < 80 ? "Tu base está tomando forma. Ahora podemos convertir ese margen en objetivos." : "Tienes una base sólida para seguir construyendo objetivos con calma."))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 w-full grid grid-cols-2 gap-x-6 gap-y-3"
  }, /*#__PURE__*/React.createElement(DesgloseBarra, {
    label: "Ahorro",
    pts: salud.desglose.ptsAhorro,
    max: 40,
    color: C.exc
  }), /*#__PURE__*/React.createElement(DesgloseBarra, {
    label: "Fondo de emergencia",
    pts: salud.desglose.ptsFondo,
    max: 30,
    color: C.salu
  }), /*#__PURE__*/React.createElement(DesgloseBarra, {
    label: "Peso de tus deudas sobre tus ingresos",
    pts: salud.desglose.ptsDeuda,
    max: 20,
    color: C.mej
  }), /*#__PURE__*/React.createElement(DesgloseBarra, {
    label: "Perfil de riesgo",
    pts: salud.desglose.ptsPerfil,
    max: 10,
    color: C.sand
  })))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
  }, /*#__PURE__*/React.createElement(StatCard, {
    icon: I.landmark,
    label: "Ingresos mensuales",
    value: /*#__PURE__*/React.createElement(AnimatedNumber, {
      value: ingresos
    }),
    accent: C.navy,
    delay: 0
  }), /*#__PURE__*/React.createElement(StatCard, {
    icon: I.receipt,
    label: "Gastos mensuales",
    value: /*#__PURE__*/React.createElement(AnimatedNumber, {
      value: gastoTotal
    }),
    accent: C.mej,
    delay: 60
  }), /*#__PURE__*/React.createElement(StatCard, {
    icon: I.piggy,
    label: "Ahorro disponible",
    value: /*#__PURE__*/React.createElement(AnimatedNumber, {
      value: ahorroDisponible
    }),
    sub: pct(ratioAhorro * 100) + " de tus ingresos",
    accent: ahorroDisponible >= 0 ? C.salu : C.crit,
    delay: 120
  }), /*#__PURE__*/React.createElement(Card, {
    className: "p-5 flex flex-col gap-3 stagger-item",
    style: {
      animationDelay: "180ms"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Cómo vas hoy"), /*#__PURE__*/React.createElement("div", {
    className: "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
    style: {
      backgroundColor: estado.light
    }
  }, /*#__PURE__*/React.createElement(estado.Ico, {
    size: 17,
    color: estado.color,
    strokeWidth: 2.2
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Badge, {
    estado: estado
  })), /*#__PURE__*/React.createElement("div", {
    className: "text-xs",
    style: {
      color: C.muted
    }
  }, "Basado en tu margen de ahorro sobre ingresos"))), objetivos.length > 0 && (() => {
    const plan = planObjetivos;
    const relevantes = plan.objetivos.slice(0, 3);
    return /*#__PURE__*/React.createElement(Card, {
      className: "p-5"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between gap-3 mb-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "min-w-0"
    }, /*#__PURE__*/React.createElement(Eyebrow, null, "Tus objetivos"), /*#__PURE__*/React.createElement("div", {
      className: "font-serif text-lg font-bold mt-1",
      style: {
        color: C.ink
      }
    }, "Lo que estás construyendo")), plan.principal && /*#__PURE__*/React.createElement("span", {
      className: "text-xs font-bold truncate min-w-0 max-w-[45%] shrink-0",
      style: {
        color: C.navy
      }
    }, "Principal: ", plan.principal.nombre)), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, relevantes.map(o => /*#__PURE__*/React.createElement("div", {
      key: o.id
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between gap-3 text-xs min-w-0"
    }, /*#__PURE__*/React.createElement("b", {
      className: "truncate min-w-0",
      style: {
        color: C.ink
      }
    }, o.nombre), /*#__PURE__*/React.createElement("span", {
      className: "shrink-0",
      style: {
        color: C.muted
      }
    }, o.plazoAnios > 0 ? `${o.plazoAnios} años` : "Sin plazo")), /*#__PURE__*/React.createElement("div", {
      className: "h-1.5 rounded-full mt-1.5 overflow-hidden",
      style: {
        backgroundColor: C.bgDeepMid
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "h-full rounded-full",
      style: {
        width: o.progreso + "%",
        backgroundColor: C.salu
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "text-[11px] mt-1",
      style: {
        color: C.muted
      }
    }, pct(o.progreso, 0), " · ", euros(o.importeRestante), " restantes")))));
  })(), perfil && /*#__PURE__*/React.createElement(Card, {
    className: "p-5 flex items-center gap-4",
    style: {
      borderColor: PERFILES_INFO[perfil].color + "55"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-11 h-11 rounded-full flex items-center justify-center shrink-0",
    style: {
      backgroundColor: PERFILES_INFO[perfil].light
    }
  }, /*#__PURE__*/React.createElement(I.shieldCheck, {
    size: 20,
    color: PERFILES_INFO[perfil].color
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold uppercase",
    style: {
      color: C.muted,
      letterSpacing: "0.08em"
    }
  }, "Tu perfil de riesgo"), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-lg font-bold",
    style: {
      color: PERFILES_INFO[perfil].color
    }
  }, perfil))));
}

export function AmortizacionDeuda({
  deudas
}) {
  const [extra, setExtra] = useState(0);
  const [vista, setVista] = useState("nieve");
  const deudasActivas = useMemo(() => deudas.filter(d => Number(d.pendiente) > 0), [deudas]);
  const resultado = useMemo(() => {
    if (deudasActivas.length === 0) return null;
    return {
      nieve: simularAmortizacion(deudasActivas, extra, "nieve"),
      avalancha: simularAmortizacion(deudasActivas, extra, "avalancha"),
      soloMinimos: simularAmortizacion(deudasActivas, 0, "nieve")
    };
  }, [deudasActivas, extra]);
  if (!resultado) return null;
  const {
    nieve,
    avalancha,
    soloMinimos
  } = resultado;
  const ahorroNieve = soloMinimos.totalInteres - nieve.totalInteres;
  const ahorroAvalancha = soloMinimos.totalInteres - avalancha.totalInteres;
  const mejorInteres = avalancha.totalInteres <= nieve.totalInteres ? "avalancha" : "nieve";
  const datosVista = vista === "nieve" ? nieve : avalancha;
  const resumenTiempo = r => r.todasLiquidadas ? formatMeses(r.mesesTotal) : "+40 años";
  const cuotasMensuales = deudasActivas.reduce((s, d) => s + Number(d.cuota || 0), 0);
  const ahorroInteresMax = Math.max(0, ahorroNieve, ahorroAvalancha);
  return /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start gap-3 mb-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
    style: {
      backgroundColor: C.saluLight
    }
  }, /*#__PURE__*/React.createElement(I.rocket, {
    size: 18,
    color: C.salu
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Estrategia para eliminar tus deudas"), /*#__PURE__*/React.createElement("h3", {
    className: "font-serif text-xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, "Un plan claro para quedarte sin deudas"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1",
    style: {
      color: C.muted
    }
  }, "Cuando termines de pagar una deuda, la cuota que le dedicabas queda libre para tus objetivos."))), /*#__PURE__*/React.createElement("div", {
    className: "rounded-2xl p-4 mb-5",
    style: {
      backgroundColor: C.saluLight,
      border: "1px solid rgba(16,185,129,.16)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold uppercase",
    style: {
      color: C.salu,
      letterSpacing: "0.08em"
    }
  }, "Cuando elimines todas tus deudas"), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-2xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, "Recuperarás ", euros(cuotasMensuales), " al mes"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs mt-1",
    style: {
      color: C.muted
    }
  }, "Ahora mismo esas cuotas están comprometidas. En cuanto saldes las deudas, ese dinero queda libre y puedes destinarlo a tu fondo de emergencia o a tus objetivos.")), /*#__PURE__*/React.createElement("div", {
    className: "max-w-xs mb-5"
  }, /*#__PURE__*/React.createElement(NumberField, {
    label: "¿Cuánto más podrías pagar cada mes?",
    value: extra,
    onChange: setExtra,
    hint: "Añade aquí un extra opcional, por encima de las cuotas mínimas, para ver cuánto antes quedarías libre de deudas."
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5"
  }, [{
    key: "nieve",
    nombre: "Bola de nieve",
    desc: "Empieza por la deuda más pequeña para conseguir hitos visibles.",
    datos: nieve
  }, {
    key: "avalancha",
    nombre: "Avalancha",
    desc: "Empieza por la de mayor interés para priorizar el ahorro matemático.",
    datos: avalancha
  }].map(e => /*#__PURE__*/React.createElement("button", {
    key: e.key,
    onClick: () => setVista(e.key),
    className: "text-left rounded-xl p-4 border transition-all hover:-translate-y-0.5 hover:shadow-sm active:scale-[0.99]",
    style: {
      borderColor: vista === e.key ? C.sand : C.border,
      backgroundColor: vista === e.key ? C.sandLight : C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-bold",
    style: {
      color: C.ink
    }
  }, e.nombre), mejorInteres === e.key && extra > 0 && /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap",
    style: {
      backgroundColor: "rgba(16,185,129,0.08)",
      color: C.salu
    }
  }, "Menos interés")), /*#__PURE__*/React.createElement("div", {
    className: "text-xs mt-1",
    style: {
      color: C.muted
    }
  }, e.desc), /*#__PURE__*/React.createElement("div", {
    className: "mt-3 flex items-baseline gap-1.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-serif text-xl font-bold",
    style: {
      color: C.ink
    }
  }, resumenTiempo(e.datos)), /*#__PURE__*/React.createElement("span", {
    className: "text-xs",
    style: {
      color: C.muted
    }
  }, "para eliminar todas tus deudas")), /*#__PURE__*/React.createElement("div", {
    className: "text-xs mt-1",
    style: {
      color: C.muted
    }
  }, "Interés total: ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.ink
    }
  }, euros(e.datos.totalInteres)))))), extra > 0 && soloMinimos.todasLiquidadas && /*#__PURE__*/React.createElement("div", {
    className: "text-xs rounded-xl px-4 py-3 mb-5 flex items-start gap-2",
    style: {
      backgroundColor: "rgba(16,185,129,0.08)",
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement(I.sparkles, {
    size: 14,
    className: "mt-0.5 shrink-0",
    color: C.salu
  }), /*#__PURE__*/React.createElement("span", null, "Buen movimiento: pagando ", euros(extra), "/mes de más, te ahorrarías hasta ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.salu
    }
  }, euros(ahorroInteresMax)), " en intereses respecto a pagar solo las cuotas mínimas.")), extra > 0 && datosVista.todasLiquidadas && /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4 mb-5",
    style: {
      backgroundColor: C.sandLight,
      border: "1px solid rgba(79,70,229,.14)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-bold",
    style: {
      color: C.ink
    }
  }, "Cuando saldes la última deuda, recuperas ", euros(cuotasMensuales), "/mes."), /*#__PURE__*/React.createElement("div", {
    className: "text-xs mt-1",
    style: {
      color: C.muted
    }
  }, "Ese dinero puede ir directo a tu fondo de emergencia o a tus objetivos.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold uppercase mb-2",
    style: {
      color: C.sand,
      letterSpacing: "0.06em"
    }
  }, "Orden para pagar tus deudas — ", vista === "nieve" ? "Bola de nieve" : "Avalancha"), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, datosVista.orden.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: d.nombre + i,
    className: "flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5",
    style: {
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 min-w-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
    style: {
      backgroundColor: C.navy,
      color: C.white
    }
  }, i + 1), /*#__PURE__*/React.createElement("div", {
    className: "min-w-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-bold truncate",
    style: {
      color: C.ink
    }
  }, d.nombre), /*#__PURE__*/React.createElement("div", {
    className: "text-xs",
    style: {
      color: C.muted
    }
  }, d.liquidada ? /*#__PURE__*/React.createElement(React.Fragment, null, "La saldarías en el mes ", d.mesLiquidacion, " (", formatMeses(d.mesLiquidacion), ")") : "Con estos importes, no la saldarías dentro de 40 años"))), /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold text-right shrink-0",
    style: {
      color: C.mej
    }
  }, euros(d.interesPagado), " interés"))))));
}

export function Simulador({
  sim,
  setSim,
  objetivos = [],
  objetivoSeleccionadoId = null,
  onSeleccionarObjetivo,
  ahorroDisponible = 0,
  perfil = null
}) {
  const [vista, setVista] = useState("5anos");
  const [modo, setModo] = useState("capital");
  const seleccionado = objetivos.find(o => o.id === objetivoSeleccionadoId) || null;
  const tieneDatos = !!seleccionado || !!perfil;
  const objetivoNum = seleccionado?.importeObjetivo != null ? Number(seleccionado.importeObjetivo) : null;

  // UX: el simulador ya no pide números al usuario; calcula automáticamente
  // el escenario que le corresponde a partir de su objetivo guardado y/o su
  // perfil de riesgo. Si quiere tocar cifras libremente, se le dirige a
  // la vista de calculadoras, pensada para eso.
  const inicial = seleccionado ? seleccionado.importeReservadoAplicado ?? 0 : 0;
  const mensual = seleccionado ? seleccionado.aportacionMensual ?? ahorroDisponible ?? 0 : ahorroDisponible ?? 0;
  const tasa = perfil ? PERFILES_INFO[perfil].rentabilidad : 4;
  const horizonte = seleccionado ? seleccionado.horizonteAniosCalculado ?? seleccionado.plazoAnios ?? 10 : 10;
  const horizonteSim = Number(horizonte) > 0 ? Number(horizonte) : 10;
  const serie = useMemo(() => Array.from({
    length: 50
  }, (_, i) => proyeccionInteres(Number(inicial) || 0, Number(mensual) || 0, Number(tasa) || 0, i + 1)), [inicial, mensual, tasa]);
  const resultadoObjetivo = useMemo(() => {
    if (!seleccionado || !horizonteSim || seleccionado.importeObjetivo == null) return null;
    const p = proyeccionInteres(Number(inicial) || 0, Number(mensual) || 0, Number(tasa) || 0, horizonteSim);
    const objetivo = Number(seleccionado.importeObjetivo);
    return {
      objetivo,
      restante: seleccionado.importeRestante,
      valor: p.valorFuturo,
      alcanzado: p.valorFuturo >= objetivo,
      aportado: p.totalAportado
    };
  }, [seleccionado, inicial, mensual, tasa, horizonteSim]);
  const filasTabla = useMemo(() => {
    const anos = vista === "5anos" ? [5, 10, 15, 20, 25, 30, 35, 40, 45, 50] : Array.from({
      length: Math.min(50, Math.ceil(horizonteSim) + 5)
    }, (_, i) => i + 1);
    return anos.map(a => serie[a - 1]).filter(Boolean).map((d, i, arr) => ({
      ...d,
      diferenciaAnterior: d.valorFuturo - (i === 0 ? Number(inicial) || 0 : arr[i - 1].valorFuturo)
    }));
  }, [serie, vista, inicial, horizonteSim]);
  const anioObjetivoRedondeado = seleccionado && horizonteSim ? Math.max(1, Math.min(50, Math.round(horizonteSim))) : null;
  const resTiempo = useMemo(() => modo === "tiempo" && objetivoNum != null ? tiempoNecesarioParaObjetivo(Number(inicial) || 0, Number(mensual) || 0, Number(tasa) || 0, objetivoNum) : null, [modo, objetivoNum, inicial, mensual, tasa]);
  const resAportacion = useMemo(() => modo === "aportacion" && objetivoNum != null ? aportacionNecesariaParaObjetivo(Number(inicial) || 0, objetivoNum, horizonteSim, Number(tasa) || 0) : null, [modo, objetivoNum, inicial, horizonteSim, tasa]);
  const resRentabilidad = useMemo(() => modo === "rentabilidad" && objetivoNum != null ? rentabilidadNecesariaParaObjetivo(Number(inicial) || 0, Number(mensual) || 0, horizonteSim, objetivoNum) : null, [modo, objetivoNum, inicial, mensual, horizonteSim]);
  const serieParaGrafico = useMemo(() => {
    if (modo === "capital" || objetivoNum == null) return serie;
    let ini = Number(inicial) || 0,
      men = Number(mensual) || 0,
      tas = Number(tasa) || 0;
    if (modo === "aportacion" && resAportacion) men = resAportacion.mensualNecesaria;
    if (modo === "rentabilidad" && resRentabilidad) tas = resRentabilidad.tasaNecesaria;
    return Array.from({
      length: 50
    }, (_, i) => proyeccionInteres(ini, men, tas, i + 1));
  }, [modo, serie, inicial, mensual, tasa, resAportacion, resRentabilidad, objetivoNum]);
  const anioMarcaGrafico = modo === "tiempo" && resTiempo ? Math.max(1, Math.min(50, Math.round(resTiempo.anios + (resTiempo.meses > 0 ? 1 : 0)))) : anioObjetivoRedondeado;
  const chartData = serieParaGrafico.slice(0, 50).map(d => ({
    anio: d.anios,
    aportado: Math.round(d.totalAportado),
    interesGenerado: Math.round(d.interesGenerado),
    valorFuturo: Math.round(d.valorFuturo)
  }));
  const cargarObjetivo = o => {
    if (!o) return;
    onSeleccionarObjetivo && onSeleccionarObjetivo(o.id);
  };
  const limpiarObjetivo = () => {
    onSeleccionarObjetivo && onSeleccionarObjetivo(null);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "font-serif text-2xl font-bold",
    style: {
      color: C.ink
    }
  }, "Tu escenario de ahorro"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1 readable-subtitle"
  }, "Calculado con tus propios datos. Es una proyección educativa: las rentabilidades son hipotéticas y no garantizan resultados futuros.")), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 sm:grid-cols-4 gap-2"
  }, [["capital", "¿Cuánto tendré?"], ["tiempo", "¿Cuánto tardaré?"], ["aportacion", "¿Cuánto aportar?"], ["rentabilidad", "¿Qué rentabilidad?"]].map(([id, label]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    onClick: () => setModo(id),
    className: "text-xs font-bold px-3 py-2.5 rounded-xl text-center transition-colors",
    style: modo === id ? {
      backgroundColor: C.sand,
      color: C.white
    } : {
      backgroundColor: C.paper,
      color: C.muted,
      border: "1px solid " + C.border
    }
  }, label))), objetivos.length > 0 && /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-3"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Conecta un objetivo"), seleccionado && /*#__PURE__*/React.createElement("button", {
    onClick: limpiarObjetivo,
    className: "text-xs font-bold",
    style: {
      color: C.muted
    }
  }, "Quitar objetivo")), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2 mt-3"
  }, objetivos.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.id,
    onClick: () => cargarObjetivo(o),
    className: "px-3 py-2 rounded-lg border text-xs font-bold text-left",
    style: {
      borderColor: seleccionado?.id === o.id ? C.sand : C.border,
      backgroundColor: seleccionado?.id === o.id ? C.sandLight : C.paper,
      color: C.ink
    }
  }, o.nombre || OBJETIVOS_DEF.find(x => x.id === o.tipo)?.label || "Objetivo sin nombre"))), seleccionado && /*#__PURE__*/React.createElement("div", {
    className: "mt-3 rounded-xl p-3 text-xs",
    style: {
      backgroundColor: C.sandLight,
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("b", null, seleccionado.nombre || "Objetivo seleccionado"), " · La proyección usa el ahorro y el plazo de este objetivo automáticamente.")), !tieneDatos ? /*#__PURE__*/React.createElement(Card, {
    className: "p-6 text-center"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Aún no tenemos datos suficientes"), /*#__PURE__*/React.createElement("h3", {
    className: "font-serif text-xl font-bold mt-2",
    style: {
      color: C.ink
    }
  }, "Completa tu diagnóstico y tu perfil de riesgo primero"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-2 max-w-md mx-auto",
    style: {
      color: C.muted
    }
  }, "Así podremos calcular un escenario con tus propios números, en vez de mostrarte cifras genéricas que no te aplican.")) : /*#__PURE__*/React.createElement(React.Fragment, null, perfil && /*#__PURE__*/React.createElement("div", {
    className: "text-xs rounded-lg px-3 py-2.5",
    style: {
      backgroundColor: C.saluLight,
      color: C.ink
    }
  }, "Este escenario usa ", seleccionado ? "el ahorro y el plazo de tu objetivo" : /*#__PURE__*/React.createElement(React.Fragment, null, "tu ahorro disponible (", /*#__PURE__*/React.createElement("b", null, euros(mensual), "/mes"), ")"), " y asume una rentabilidad del ", /*#__PURE__*/React.createElement("b", null, tasa, "%"), " anual, la típica de un perfil ", /*#__PURE__*/React.createElement("b", null, perfil), ". ", PERFILES_INFO[perfil]?.explicacion), modo !== "capital" && objetivoNum == null && /*#__PURE__*/React.createElement("div", {
    className: "text-xs rounded-lg px-3 py-2.5",
    style: {
      backgroundColor: C.critLight,
      color: C.ink
    }
  }, "Este modo necesita un objetivo con un importe definido. Elige uno arriba en \"Conecta un objetivo\" (o crea uno nuevo en Objetivos financieros) para poder calcularlo."), modo === "tiempo" && resTiempo && /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Tiempo necesario"), /*#__PURE__*/React.createElement("div", {
    className: "mt-2 rounded-xl p-4",
    style: {
      backgroundColor: resTiempo.alcanzado ? C.saluLight : C.critLight,
      color: C.ink
    }
  }, resTiempo.alcanzado ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, "Necesitarías ", resTiempo.anios, " años", resTiempo.meses > 0 ? ` y ${resTiempo.meses} meses` : "", " para llegar a ", euros(objetivoNum), "."), /*#__PURE__*/React.createElement("div", {
    className: "mt-1 text-xs"
  }, "Aportado: ", euros(resTiempo.totalAportado), " · Intereses generados: ", euros(resTiempo.interesGenerado), ".")) : /*#__PURE__*/React.createElement("b", null, "Con estos datos no llegarías a ", euros(objetivoNum), " ni en 100 años. Prueba a subir la aportación o la rentabilidad."))), modo === "aportacion" && resAportacion && /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Aportación mensual necesaria"), /*#__PURE__*/React.createElement("div", {
    className: "mt-2 rounded-xl p-4",
    style: {
      backgroundColor: C.saluLight,
      color: C.ink
    }
  }, resAportacion.yaAlcanzado ? /*#__PURE__*/React.createElement("b", null, "Con tu capital inicial y la rentabilidad estimada, ya alcanzas ", euros(objetivoNum), " sin necesidad de aportar más.") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, "Necesitarías aportar ", euros(resAportacion.mensualNecesaria), "/mes para llegar a ", euros(objetivoNum), " en ", horizonteSim.toFixed(1), " años."), /*#__PURE__*/React.createElement("div", {
    className: "mt-1 text-xs"
  }, "Aportado: ", euros(resAportacion.totalAportado), " · Intereses generados: ", euros(resAportacion.interesGenerado), ".")))), modo === "rentabilidad" && resRentabilidad && /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Rentabilidad anual necesaria"), /*#__PURE__*/React.createElement("div", {
    className: "mt-2 rounded-xl p-4",
    style: {
      backgroundColor: resRentabilidad.imposible ? C.critLight : C.saluLight,
      color: C.ink
    }
  }, resRentabilidad.yaAlcanzado ? /*#__PURE__*/React.createElement("b", null, "Con tu capital y tu aportación actuales, ya alcanzas ", euros(objetivoNum), " sin necesidad de rentabilidad adicional.") : resRentabilidad.imposible ? /*#__PURE__*/React.createElement("b", null, "No existe una rentabilidad anual realista que alcance ", euros(objetivoNum), " en ese plazo. Prueba a aumentar el plazo o la aportación.") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, "Necesitarías una rentabilidad anual media del ", resRentabilidad.tasaNecesaria.toFixed(2), "% para llegar a ", euros(objetivoNum), " en ", horizonteSim.toFixed(1), " años."), /*#__PURE__*/React.createElement("div", {
    className: "mt-1 text-xs"
  }, "Aportado: ", euros(resRentabilidad.totalAportado), " · Intereses generados: ", euros(resRentabilidad.interesGenerado), ".")))), seleccionado && /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Objetivo seleccionado"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3 text-xs"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.muted
    }
  }, "Objetivo"), /*#__PURE__*/React.createElement("b", {
    className: "block",
    style: {
      color: C.ink
    }
  }, seleccionado.importeObjetivo == null ? "—" : euros(seleccionado.importeObjetivo))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.muted
    }
  }, "Restante"), /*#__PURE__*/React.createElement("b", {
    className: "block",
    style: {
      color: C.ink
    }
  }, seleccionado.importeRestante == null ? "—" : euros(seleccionado.importeRestante))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.muted
    }
  }, "Horizonte"), /*#__PURE__*/React.createElement("b", {
    className: "block",
    style: {
      color: C.ink
    }
  }, horizonteSim ? `${horizonteSim.toFixed(1)} años` : "—")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.muted
    }
  }, "Necesario"), /*#__PURE__*/React.createElement("b", {
    className: "block",
    style: {
      color: C.ink
    }
  }, seleccionado.aportacionNecesaria == null ? "—" : euros(seleccionado.aportacionNecesaria) + "/mes")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.muted
    }
  }, "Tu aportación"), /*#__PURE__*/React.createElement("b", {
    className: "block",
    style: {
      color: C.ink
    }
  }, euros(mensual), "/mes"))), resultadoObjetivo && /*#__PURE__*/React.createElement("div", {
    className: "mt-4 rounded-xl p-4",
    style: {
      backgroundColor: resultadoObjetivo.alcanzado ? C.saluLight : C.critLight,
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("b", null, resultadoObjetivo.alcanzado ? "En este escenario hipotético, el objetivo se alcanzaría dentro del horizonte indicado." : "En este escenario hipotético, el objetivo no se alcanzaría dentro del horizonte indicado."), /*#__PURE__*/React.createElement("div", {
    className: "mt-1 text-xs"
  }, "Valor proyectado: ", euros(resultadoObjetivo.valor), " · Objetivo: ", euros(resultadoObjetivo.objetivo), "."))), /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Crecimiento año a año (hasta 50 años)"), /*#__PURE__*/React.createElement("div", {
    className: "mt-4"
  }, /*#__PURE__*/React.createElement(SimpleStackedBarChart, {
    data: chartData,
    xKey: "anio",
    aportadoKey: "aportado",
    interesKey: "interesGenerado",
    height: 280,
    colorAportado: C.slate,
    colorInteres: C.salu,
    formatY: v => v.toLocaleString("es-ES") + " €",
    marcaAnio: anioMarcaGrafico
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-4 mt-2 text-xs font-bold",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "inline-flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-2.5 h-2.5 rounded-sm inline-block",
    style: {
      backgroundColor: C.slate
    }
  }), "Aportado"), /*#__PURE__*/React.createElement("span", {
    className: "inline-flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-2.5 h-2.5 rounded-sm inline-block",
    style: {
      backgroundColor: C.salu
    }
  }), "Intereses generados")), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] readable-note mt-3"
  }, "Este cálculo es una simulación matemática. La rentabilidad elegida es una hipótesis educativa y no constituye una previsión ni una garantía.")), /*#__PURE__*/React.createElement(Card, {
    className: "p-5 overflow-x-auto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between flex-wrap gap-3"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Tabla de proyección"), /*#__PURE__*/React.createElement("select", {
    value: vista,
    onChange: e => setVista(e.target.value),
    className: "text-xs font-bold rounded-lg px-3 py-1.5 border outline-none",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "5anos"
  }, "Ver cada 5 años"), /*#__PURE__*/React.createElement("option", {
    value: "anoAno"
  }, "Ver año a año"))), /*#__PURE__*/React.createElement("table", {
    className: "w-full mt-4 text-sm min-w-[680px]"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      borderBottom: "2px solid " + C.border
    }
  }, ["Año", "Total aportado", "Valor futuro hipotético", "Interés generado", "Crecimiento respecto al año anterior"].map(h => /*#__PURE__*/React.createElement("th", {
    key: h,
    className: "text-left py-2 font-bold",
    style: {
      color: C.muted
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, filasTabla.map(d => /*#__PURE__*/React.createElement("tr", {
    key: d.anios,
    style: {
      borderBottom: "1px solid " + C.border
    }
  }, /*#__PURE__*/React.createElement("td", {
    className: "py-2.5 font-bold",
    style: {
      color: C.ink
    }
  }, d.anios), /*#__PURE__*/React.createElement("td", {
    className: "py-2.5",
    style: {
      color: C.ink
    }
  }, euros(d.totalAportado)), /*#__PURE__*/React.createElement("td", {
    className: "py-2.5 font-bold",
    style: {
      color: C.ink
    }
  }, euros(d.valorFuturo)), /*#__PURE__*/React.createElement("td", {
    className: "py-2.5 font-bold",
    style: {
      color: C.salu
    }
  }, euros(d.interesGenerado)), /*#__PURE__*/React.createElement("td", {
    className: "py-2.5 font-bold",
    style: {
      color: C.mej
    }
  }, "+", euros(d.diferenciaAnterior)))))))));
}

export function PerfilRiesgo({
  onPerfilCalculado,
  quizState,
  setQuizState,
  datos
}) {
  const estadoNormalizado = useMemo(() => reconstruirEstadoQuiz(quizState, datos), [quizState, datos]);
  const respuestas = estadoNormalizado.respuestas;
  const resultado = useMemo(() => calcularPerfilMultidimensional(respuestas, datos), [respuestas, datos]);
  const questionPath = estadoNormalizado.questionPath;
  const currentQuestionId = estadoNormalizado.currentQuestionId;
  const currentIndex = Math.max(0, questionPath.indexOf(currentQuestionId));
  const q = QUIZ_DEF[currentQuestionId] || QUIZ_DEF.edad;
  const valorGuardado = respuestas[q.id];
  useEffect(() => {
    const resultadoActual = estadoNormalizado.terminado ? calcularPerfilMultidimensional(respuestas, datos) : null;
    if (JSON.stringify(quizState) !== JSON.stringify({
      ...estadoNormalizado,
      resultado: resultadoActual,
      datosSnapshot: quizState?.datosSnapshot
    })) {
      setQuizState({
        ...estadoNormalizado,
        resultado: resultadoActual,
        datosSnapshot: quizState?.datosSnapshot
      });
    }
    if (resultadoActual?.perfil) onPerfilCalculado(resultadoActual.perfil, resultadoActual);
  }, [estadoNormalizado.currentQuestionId, estadoNormalizado.terminado, estadoNormalizado.questionPath.join("|"), JSON.stringify(respuestas), datos.ingresos, JSON.stringify(datos.gastosFijos), JSON.stringify(datos.gastosDiscrecionales), datos.ahorroActual, JSON.stringify(datos.deudas), JSON.stringify(datos.objetivos), JSON.stringify(datos.objetivo)]);
  const rutaCompletaEstimable = useMemo(() => {
    /*
     * La longitud futura no puede conocerse hasta contestar las preguntas que
     * abren ramas. Para evitar cálculos costosos, proyectamos un recorrido
     * representativo usando las respuestas actuales y valores conservadores
     * en las decisiones todavía desconocidas.
     */
    const r = {
      ...respuestas
    };
    let id = currentQuestionId;
    let count = 0;
    const vistos = new Set();
    while (id && !vistos.has(id) && count < 30) {
      vistos.add(id);
      count++;
      if (quizNumero(r, id) == null) {
        /* En una pregunta aún no respondida no inventamos una respuesta única:
           tomamos la rama que produzca el recorrido más largo de forma local. */
        const siguientes = (QUIZ_DEF[id]?.opciones || []).map((_, i) => {
          const rr = {
            ...r,
            [id]: i + 1
          };
          return getNextQuestionId(id, rr, datos);
        }).filter(Boolean);
        id = siguientes[siguientes.length - 1] || null;
      } else {
        id = getNextQuestionId(id, r, datos);
      }
    }
    return Math.max(count, currentIndex + 1);
  }, [respuestas, currentQuestionId, currentIndex, datos]);
  const responder = valor => {
    const nuevas = {
      ...respuestas,
      [q.id]: valor
    };
    const prefijo = questionPath.slice(0, currentIndex + 1);
    const idsValidos = new Set(prefijo);
    Object.keys(nuevas).forEach(id => {
      if (!idsValidos.has(id)) delete nuevas[id];
    });
    const siguienteId = getNextQuestionId(q.id, nuevas, datos);
    const nuevoPath = [...prefijo];
    if (siguienteId) nuevoPath.push(siguienteId);
    if (!siguienteId) {
      const nuevoResultado = calcularPerfilMultidimensional(nuevas, datos);
      const capacidadAlFinalizar = calcularCapacidadFinanciera(datos);
      const nuevoEstado = {
        respuestas: nuevas,
        currentQuestionId: q.id,
        questionPath: nuevoPath,
        paso: nuevoPath.length - 1,
        terminado: true,
        resultado: nuevoResultado,
        datosSnapshot: {
          ingresos: Number(capacidadAlFinalizar.ingresos) || 0,
          deudaPendiente: (datos.deudas || []).reduce((s, d) => s + Number(d.pendiente || 0), 0),
          ahorroActual: Number(datos.ahorroActual) || 0,
          capacidadMensual: Number(capacidadAlFinalizar.capacidadMensual) || 0
        }
      };
      setQuizState(nuevoEstado);
      onPerfilCalculado(nuevoResultado.perfil, nuevoResultado);
      return;
    }
    setQuizState({
      respuestas: nuevas,
      currentQuestionId: siguienteId,
      questionPath: nuevoPath,
      paso: nuevoPath.length - 1,
      terminado: false,
      resultado: null
    });
  };
  const anterior = () => {
    if (currentIndex <= 0) return;
    const nuevoPath = questionPath.slice(0, currentIndex);
    const previousId = nuevoPath[nuevoPath.length - 1] || "edad";
    setQuizState({
      ...quizState,
      respuestas,
      currentQuestionId: previousId,
      questionPath: nuevoPath,
      paso: Math.max(0, nuevoPath.length - 1),
      terminado: false,
      resultado: null
    });
  };
  const repetir = () => {
    const inicial = {
      respuestas: {},
      currentQuestionId: "edad",
      questionPath: ["edad"],
      paso: 0,
      terminado: false,
      resultado: null
    };
    setQuizState(inicial);
    onPerfilCalculado(null, null);
  };
  if (estadoNormalizado.terminado) {
    const nombrePerfil = resultado.perfil;
    const info = PERFILES_INFO[nombrePerfil];
    const capacidadActual = calcularCapacidadFinanciera(datos);
    const snapshot = quizState?.datosSnapshot;
    const deudaPendienteActual = (datos.deudas || []).reduce((s, d) => s + Number(d.pendiente || 0), 0);
    const cambioSignificativo = !!snapshot && (() => {
      const diffRelativo = (a, b) => a === 0 && b === 0 ? 0 : Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b), 1);
      return diffRelativo(snapshot.ingresos, Number(capacidadActual.ingresos) || 0) > 0.20 || diffRelativo(snapshot.deudaPendiente, deudaPendienteActual) > 0.30 || diffRelativo(snapshot.ahorroActual, Number(datos.ahorroActual) || 0) > 0.30 || diffRelativo(snapshot.capacidadMensual, Number(capacidadActual.capacidadMensual) || 0) > 0.30;
    })();
    const dimensiones = [["Edad", resultado.edad], ["Tolerancia al riesgo", resultado.toleranciaRiesgo], ["Capacidad para soportar pérdidas", resultado.capacidadRiesgo], ["Horizonte temporal", resultado.horizonte], ["Necesidad de liquidez", resultado.liquidez], ["Conocimientos / experiencia", resultado.experiencia]];
    const confianzaColor = resultado.confianza === "Alta" ? C.salu : resultado.confianza === "Media" ? C.mej : C.crit;
    return /*#__PURE__*/React.createElement("div", {
      className: "space-y-6"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
      className: "font-serif text-2xl font-bold readable-title"
    }, "Test de perfil de riesgo")), /*#__PURE__*/React.createElement(Card, {
      className: "p-8",
      style: {
        borderColor: info.color + "55"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-center"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4",
      style: {
        backgroundColor: info.light
      }
    }, /*#__PURE__*/React.createElement(I.shieldCheck, {
      size: 28,
      color: info.color
    })), /*#__PURE__*/React.createElement("div", {
      className: "text-xs font-bold uppercase",
      style: {
        color: C.muted,
        letterSpacing: "0.1em"
      }
    }, "Perfil final"), /*#__PURE__*/React.createElement("div", {
      className: "font-serif text-3xl font-bold mt-1",
      style: {
        color: info.color
      }
    }, nombrePerfil), /*#__PURE__*/React.createElement("p", {
      className: "text-sm mt-4 max-w-xl mx-auto",
      style: {
        color: C.muted
      }
    }, info.explicacion)), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6"
    }, dimensiones.map(([label, value]) => /*#__PURE__*/React.createElement("div", {
      key: label,
      className: "rounded-xl border p-3",
      style: {
        borderColor: C.border,
        backgroundColor: C.paper
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between gap-3"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-xs font-bold",
      style: {
        color: C.ink
      }
    }, label), /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-bold",
      style: {
        color: value == null ? C.muted : C.navy
      }
    }, value == null ? "Sin datos" : value + "/100")), value != null && /*#__PURE__*/React.createElement("div", {
      className: "h-1.5 rounded-full mt-2 overflow-hidden",
      style: {
        backgroundColor: C.bgDeepMid
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "h-full rounded-full",
      style: {
        width: value + "%",
        backgroundColor: info.color
      }
    }))))), /*#__PURE__*/React.createElement("div", {
      className: "rounded-xl border p-4 mt-5",
      style: {
        borderColor: confianzaColor + "55",
        backgroundColor: confianzaColor + "10"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between gap-3"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-xs font-bold uppercase",
      style: {
        color: C.muted,
        letterSpacing: "0.08em"
      }
    }, "Nivel de confianza"), /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-bold",
      style: {
        color: confianzaColor
      }
    }, resultado.confianza)), resultado.faltantes.length > 0 && /*#__PURE__*/React.createElement("p", {
      className: "text-xs mt-2",
      style: {
        color: C.muted
      }
    }, "Faltan datos importantes (", resultado.faltantes.join(", "), "), por lo que el resultado tiene menor confianza.")), /*#__PURE__*/React.createElement("div", {
      className: "mt-5"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-serif text-lg font-bold readable-title"
    }, "¿Por qué tienes este perfil?"), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "rounded-xl p-4",
      style: {
        backgroundColor: C.saluLight
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xs font-bold uppercase mb-2",
      style: {
        color: C.salu
      }
    }, "Factores positivos"), /*#__PURE__*/React.createElement("ul", {
      className: "space-y-1.5 text-xs",
      style: {
        color: C.ink
      }
    }, resultado.factoresPositivos.map((f, i) => /*#__PURE__*/React.createElement("li", {
      key: i
    }, "• ", f)))), /*#__PURE__*/React.createElement("div", {
      className: "rounded-xl p-4",
      style: {
        backgroundColor: C.critLight
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xs font-bold uppercase mb-2",
      style: {
        color: C.crit
      }
    }, "Factores a vigilar"), /*#__PURE__*/React.createElement("ul", {
      className: "space-y-1.5 text-xs",
      style: {
        color: C.ink
      }
    }, resultado.factoresNegativos.map((f, i) => /*#__PURE__*/React.createElement("li", {
      key: i
    }, "• ", f)))))), /*#__PURE__*/React.createElement("div", {
      className: "mt-5 rounded-xl p-4",
      style: {
        backgroundColor: C.paper,
        border: "1px solid " + C.border
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-serif text-lg font-bold readable-title"
    }, "Factores que hemos tenido en cuenta"), /*#__PURE__*/React.createElement("ul", {
      className: "grid sm:grid-cols-2 gap-1.5 mt-3 text-xs",
      style: {
        color: C.ink
      }
    }, resultado.factoresTenidosEnCuenta.map((f, i) => /*#__PURE__*/React.createElement("li", {
      key: i
    }, "• ", f)))), /*#__PURE__*/React.createElement("div", {
      className: "text-xs mt-5 p-3 rounded-lg",
      style: {
        backgroundColor: C.bgDeepMid,
        color: C.muted
      }
    }, "El perfil no se determina por una única puntuación: la capacidad financiera incorpora ahorro disponible, fondo de emergencia, deuda, estabilidad de ingresos, patrimonio y necesidades de los objetivos, mientras que los conocimientos se evalúan en un bloque independiente."), /*#__PURE__*/React.createElement("div", {
      className: "text-center"
    }, cambioSignificativo && /*#__PURE__*/React.createElement("div", {
      className: "rounded-xl p-4 mb-4 text-left",
      style: {
        backgroundColor: C.mejLight,
        border: "1px solid " + C.mej
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-start gap-2.5"
    }, /*#__PURE__*/React.createElement(I.alert, {
      size: 16,
      color: C.mej,
      className: "mt-0.5 shrink-0"
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", {
      className: "text-sm",
      style: {
        color: C.ink
      }
    }, "Tu situación financiera ha cambiado desde que hiciste este test"), /*#__PURE__*/React.createElement("p", {
      className: "text-xs mt-1",
      style: {
        color: C.muted
      }
    }, "Repetirlo puede darte un perfil más ajustado a cómo estás ahora.")))), /*#__PURE__*/React.createElement("button", {
      onClick: repetir,
      className: "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-transform hover:scale-[1.03] active:scale-[0.98]",
      style: {
        backgroundColor: C.navy,
        color: C.white
      }
    }, "Repetir el test"))));
  }
  const completadas = Math.max(0, currentIndex);
  const remainingEstimate = Math.max(1, rutaCompletaEstimable - Math.max(0, currentIndex + 1));
  const progresoBase = completadas / (completadas + remainingEstimate) * 100;
  const progreso = Math.min(96, Math.max(0, progresoBase));
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "font-serif text-2xl font-bold readable-title"
  }, "Test de perfil de riesgo"), /*#__PURE__*/React.createElement("p", {
    className: "readable-subtitle"
  }, "Cuestionario adaptativo — las preguntas y el detalle del análisis cambian según tus respuestas y tu situación financiera.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between text-xs font-bold mb-1.5",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement("span", null, "Pregunta ", currentIndex + 1, rutaCompletaEstimable ? " · " + (rutaCompletaEstimable <= currentIndex + 1 ? "recorrido final" : "~" + rutaCompletaEstimable + " máx.") : ""), /*#__PURE__*/React.createElement("span", null, completadas, " respondidas")), /*#__PURE__*/React.createElement(ProgressBar, {
    pctValue: progreso,
    color: C.sand
  })), /*#__PURE__*/React.createElement(FadeSwitch, {
    id: q.id + "-" + currentIndex
  }, /*#__PURE__*/React.createElement(Card, {
    className: "p-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-xl font-bold mb-2 quiz-question"
  }, q.texto), q.nota && /*#__PURE__*/React.createElement("div", {
    className: "text-xs rounded-lg px-3 py-2 mb-4 inline-flex items-start gap-1.5 quiz-note"
  }, /*#__PURE__*/React.createElement(I.info, {
    size: 13,
    className: "mt-0.5 shrink-0"
  }), " ", q.nota), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2.5 mt-3"
  }, q.opciones.map((o, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => responder(i + 1),
    className: "quiz-option",
    "aria-pressed": valorGuardado === i + 1
  }, o, " ", /*#__PURE__*/React.createElement(I.arrowRight, {
    size: 15,
    color: C.muted
  })))))), currentIndex > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: anterior,
    className: "inline-flex items-center gap-1.5 text-sm font-bold",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement(I.arrowLeft, {
    size: 14
  }), " Pregunta anterior"));
}

export function Estrategia({
  perfil,
  onGoToPerfil = () => {},
  onGoToSimulador = () => {},
  setSim,
  ahorroDisponible,
  datos,
  onSeleccionarObjetivo
}) {
  const planObjetivos = useMemo(() => calcularPlanObjetivos(datos || {}), [datos]);
  const fondo = calcularFondoEmergencia(datos || {});
  if (!perfil) return /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "font-serif text-2xl font-bold readable-title"
  }, "Estrategia financiera")), /*#__PURE__*/React.createElement(Card, {
    className: "p-10 text-center"
  }, /*#__PURE__*/React.createElement(I.clipboard, {
    size: 32,
    className: "mx-auto mb-3",
    color: C.muted
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-bold",
    style: {
      color: C.ink
    }
  }, "Todavía no has completado tu test de perfil de riesgo"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1",
    style: {
      color: C.muted
    }
  }, "Complétalo para integrar tu horizonte, tolerancia y capacidad financiera en la estrategia."), /*#__PURE__*/React.createElement("button", {
    onClick: () => onGoToPerfil(),
    className: "inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-lg text-sm font-bold",
    style: {
      backgroundColor: C.navy,
      color: C.white
    }
  }, "Hacer el test ", /*#__PURE__*/React.createElement(I.arrowRight, {
    size: 14
  }))));
  const info = PERFILES_INFO[perfil] || PERFILES_INFO["Moderado"];
  const principal = planObjetivos.principal;
  const deudaActiva = (datos.deudas || []).filter(d => Number(d.pendiente) > 0);
  const fondoSuficiente = fondo.objetivo != null && fondo.coberturaMeses != null && fondo.coberturaMeses >= 6;
  const baseEstable = planObjetivos.capacidadMensual != null && planObjetivos.capacidadMensual > 0;
  const puedeValorarInversion = fondoSuficiente && deudaActiva.length === 0 && baseEstable && (!principal || principal.horizonteAniosCalculado == null || principal.horizonteAniosCalculado >= 5);
  const estadoPrincipal = principal?.estadoViabilidad;
  const estadoLabel = {
    viable: "Viable",
    ajustado: "Ajustado",
    no_viable: "No viable",
    pendiente: "Pendiente de datos",
    pendiente_capacidad: "Pendiente de capacidad",
    completado: "Completado"
  }[estadoPrincipal] || "Pendiente";
  const perfilObjetivo = principal ? principal.recomendacionHorizonte : null;
  const pasos = [];
  if (planObjetivos.capacidadMensual == null) pasos.push("Introduce ingresos, gastos y cuotas de deuda para calcular tu capacidad mensual real.");else if (planObjetivos.capacidadMensual <= 0) pasos.push(`Tu capacidad mensual actual es ${euros(planObjetivos.capacidadMensual)}. Prioriza estabilizar el presupuesto antes de aumentar compromisos.`);
  if (fondo.objetivo != null && fondo.falta > 0) pasos.push(`Refuerza el fondo de emergencia: la referencia de 6 meses es ${euros(fondo.objetivo)} y actualmente faltan ${euros(fondo.falta)}.`);
  if (deudaActiva.length > 0) pasos.push(`Revisa tus deudas: tienes ${euros(planObjetivos.cuotasDeuda)}/mes en cuotas y ${euros(deudaActiva.reduce((s, d) => s + Number(d.pendiente || 0), 0))} pendientes.`);
  if (principal) pasos.push(`Prioriza “${principal.nombre || OBJETIVOS_DEF.find(x => x.id === principal.tipo)?.label || "este objetivo"}”: requiere aproximadamente ${principal.aportacionNecesaria == null ? "un ritmo aún por calcular" : euros(principal.aportacionNecesaria) + "/mes"}.`);
  if (planObjetivos.conflictoObjetivos) pasos.push(`Tus objetivos requieren ${euros(planObjetivos.aportacionComprometida)}/mes y tu capacidad actual es ${euros(planObjetivos.capacidadParaObjetivos)}; existe un déficit conjunto de ${euros(planObjetivos.deficitMensual)}/mes.`);
  if (planObjetivos.ejecucion?.nivel === "pendiente" && datos.habito) pasos.push(planObjetivos.ejecucion.texto);
  if (puedeValorarInversion) pasos.push(`Con la base financiera cubierta, puedes valorar una estrategia de inversión de largo plazo coherente con tu perfil ${perfil}.`);
  if (!pasos.length) pasos.push("Mantén el seguimiento periódico y revisa la estrategia cuando cambien tus ingresos, gastos, deuda u objetivos.");
  const irASimulador = () => {
    if (!principal) return;
    onSeleccionarObjetivo && onSeleccionarObjetivo(principal.id);
    setSim({
      inicial: principal.importeReservadoAplicado ?? 0,
      mensual: principal.aportacionMensual ?? 0,
      tasa: info.rentabilidad,
      horizonte: principal.horizonteAniosCalculado ?? principal.plazoAnios ?? 0,
      objetivoId: principal.id
    });
    onGoToSimulador();
  };
  let contador = 1;
  const nSituacion = contador++;
  const nAyuda = contador++;
  const nObjetivoRiesgo = principal ? contador++ : null;
  const nBaseInvertir = contador++;
  const nSimulacion = principal ? contador++ : null;
  const nSiguientePaso = contador++;
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "font-serif text-2xl font-bold readable-title"
  }, "Estrategia financiera"), /*#__PURE__*/React.createElement("p", {
    className: "readable-subtitle"
  }, "Orientación educativa construida con tu situación financiera, tus objetivos, su horizonte y tu perfil global.")), /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, nSituacion, " · Situación actual"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-3 flex flex-col justify-between min-h-[92px] overflow-hidden",
    style: {
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] uppercase font-bold break-words",
    style: {
      color: C.muted
    }
  }, "Capacidad mensual"), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-sm sm:text-base font-bold mt-1 break-words",
    style: {
      color: C.ink
    }
  }, planObjetivos.capacidadMensual == null ? "—" : euros(planObjetivos.capacidadMensual))), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-3 flex flex-col justify-between min-h-[92px] overflow-hidden",
    style: {
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] uppercase font-bold break-words",
    style: {
      color: C.muted
    }
  }, "Fondo de emergencia"), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-sm sm:text-base font-bold mt-1 break-words",
    style: {
      color: C.ink
    }
  }, fondo.coberturaMeses == null ? "—" : fondo.coberturaMeses.toFixed(1) + " meses")), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-3 flex flex-col justify-between min-h-[92px] overflow-hidden",
    style: {
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] uppercase font-bold break-words",
    style: {
      color: C.muted
    }
  }, "Deuda activa"), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-sm sm:text-base font-bold mt-1 break-words",
    style: {
      color: C.ink
    }
  }, deudaActiva.length ? euros(planObjetivos.cuotasDeuda) + "/mes" : "Sin deuda")), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-3 flex flex-col justify-between min-h-[92px] overflow-hidden",
    style: {
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] uppercase font-bold break-words",
    style: {
      color: C.muted
    }
  }, "Ahorro actual"), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-sm sm:text-base font-bold mt-1 break-words",
    style: {
      color: C.ink
    }
  }, euros(planObjetivos.ahorroActual))), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-3 flex flex-col justify-between min-h-[92px] overflow-hidden",
    style: {
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] uppercase font-bold break-words",
    style: {
      color: C.muted
    }
  }, "Perfil global"), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-sm sm:text-base font-bold mt-1 break-words",
    style: {
      color: info.color
    }
  }, perfil)))), /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, nAyuda, " · Qué puede ayudarte ahora"), /*#__PURE__*/React.createElement("div", {
    className: "space-y-3 mt-3"
  }, planObjetivos.capacidadMensual == null && /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4",
    style: {
      backgroundColor: C.mejLight,
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("b", null, "Nos falta información."), " Añade tus ingresos, gastos y deudas para calcular cuánto te queda libre cada mes."), planObjetivos.capacidadMensual != null && planObjetivos.capacidadMensual <= 0 && /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4",
    style: {
      backgroundColor: C.critLight,
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("b", null, "Ahora mismo gastas más de lo que ingresas."), " Tu margen mensual es ", euros(planObjetivos.capacidadMensual), ". Antes de ahorrar o invertir, ajusta gastos o ingresos."), fondo.objetivo != null && fondo.falta > 0 && /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4",
    style: {
      backgroundColor: C.mejLight,
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("b", null, "Refuerza tu colchón de emergencia."), " Te faltan ", euros(fondo.falta), " para cubrir 6 meses de gastos esenciales. Es tu prioridad antes de invertir."), deudaActiva.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4",
    style: {
      backgroundColor: C.critLight,
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("b", null, "Reduce tus deudas."), " Pagas ", euros(planObjetivos.cuotasDeuda), "/mes en cuotas. Eliminarlas antes te dejará más dinero libre para tus objetivos."), principal && /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4",
    style: {
      backgroundColor: C.saluLight,
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("b", null, "Objetivo prioritario: ", principal.nombre || "Objetivo"), /*#__PURE__*/React.createElement("div", {
    className: "mt-1"
  }, "Te faltan ", principal.importeRestante == null ? "por definir" : euros(principal.importeRestante), ". Necesitas aportar ", principal.aportacionNecesaria == null ? "por definir" : euros(principal.aportacionNecesaria) + "/mes", ", y ahora mismo tienes ", planObjetivos.capacidadParaObjetivos == null ? "por definir" : euros(planObjetivos.capacidadParaObjetivos) + "/mes", " disponibles."), /*#__PURE__*/React.createElement("div", {
    className: "mt-2 font-bold"
  }, "Estado: ", estadoLabel, ".")), planObjetivos.conflictoObjetivos && /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4",
    style: {
      backgroundColor: C.critLight,
      color: C.crit
    }
  }, /*#__PURE__*/React.createElement("b", null, "Tus objetivos piden más de lo que puedes aportar."), " En conjunto necesitas ", euros(planObjetivos.aportacionComprometida), "/mes, pero solo tienes ", euros(planObjetivos.capacidadParaObjetivos), "/mes disponibles (te faltan ", euros(planObjetivos.deficitMensual), "/mes). Usa el orden de prioridad que has marcado para decidir cuál cubrir primero."), planObjetivos.ejecucion && /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4",
    style: {
      backgroundColor: "rgba(14,165,233,0.06)",
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("b", null, "Consejo:"), " automatiza tu aportación mensual y revisa el plan cada pocos meses; así es más fácil mantenerlo."))), principal && /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, nObjetivoRiesgo, " · Tu objetivo y el riesgo que encaja con él"), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, principal.nombre || "Objetivo principal"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-2",
    style: {
      color: C.muted
    }
  }, "Horizonte: ", principal.horizonteAniosCalculado > 0 ? principal.horizonteAniosCalculado.toFixed(1) + " años" : "por definir", ". Orientación: ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.ink
    }
  }, principal.recomendacionHorizonte.titulo), "."), /*#__PURE__*/React.createElement("p", {
    className: "text-xs mt-2",
    style: {
      color: C.muted
    }
  }, principal.recomendacionHorizonte.texto), perfilObjetivo && perfilObjetivo.modo !== "invertir" && /*#__PURE__*/React.createElement("div", {
    className: "mt-3 rounded-lg p-3 text-xs",
    style: {
      backgroundColor: C.mejLight,
      color: C.ink
    }
  }, "Tu perfil global es ", perfil.toLowerCase(), ", pero el horizonte de este objetivo exige un tratamiento más prudente para el dinero destinado a él.")), /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, nBaseInvertir, " · Tu base antes de invertir"), puedeValorarInversion ? /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-2",
    style: {
      color: C.muted
    }
  }, "La base financiera está cubierta: fondo de emergencia suficiente, sin deuda pendiente y con capacidad mensual positiva. Puedes valorar, de forma educativa, una estrategia de largo plazo coherente con tu perfil.") : /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-2",
    style: {
      color: C.muted
    }
  }, "La inversión a largo plazo no debe desplazar las prioridades anteriores. ", fondo.falta > 0 ? "Primero completa el colchón de emergencia. " : "", deudaActiva.length > 0 ? "Además existe deuda pendiente. " : "", principal && principal.horizonteAniosCalculado != null && principal.horizonteAniosCalculado < 5 ? "Tienes un objetivo cercano que requiere especial prudencia. " : ""), ASIGNACION[perfil] && /*#__PURE__*/React.createElement("div", {
    className: "mt-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold mb-3",
    style: {
      color: C.ink
    }
  }, "Asignación orientativa de activos · ", perfil), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col sm:flex-row items-center gap-5"
  }, /*#__PURE__*/React.createElement(SimpleDonut, {
    data: ACTIVOS_DEF.filter(a => (ASIGNACION[perfil][a.key] || 0) > 0).map(a => ({
      name: a.label,
      value: ASIGNACION[perfil][a.key],
      color: a.color
    })),
    size: 168,
    thickness: 24
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-1.5 w-full"
  }, ACTIVOS_DEF.filter(a => (ASIGNACION[perfil][a.key] || 0) > 0).map(a => /*#__PURE__*/React.createElement("div", {
    key: a.key,
    className: "flex items-center gap-1.5 text-[11px]",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-2 h-2 rounded-full shrink-0",
    style: {
      backgroundColor: a.color
    }
  }), a.label, ": ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.ink
    }
  }, ASIGNACION[perfil][a.key], "%"))))), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] mt-3 readable-note"
  }, "Distribución orientativa y educativa asociada a tu perfil ", perfil.toLowerCase(), ". No constituye una recomendación de inversión personalizada."))), principal && /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, nSimulacion, " · Simulación del objetivo"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-2",
    style: {
      color: C.muted
    }
  }, "Lleva el objetivo al simulador para comparar aportación necesaria y aportación simulada. Los cambios del simulador no modifican el objetivo guardado."), /*#__PURE__*/React.createElement("button", {
    onClick: irASimulador,
    className: "inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-lg text-sm font-bold",
    style: {
      backgroundColor: C.sand,
      color: C.navy
    }
  }, "Simular ", principal.nombre || "este objetivo", " ", /*#__PURE__*/React.createElement(I.arrowRight, {
    size: 15
  }))), /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, nSiguientePaso, " · Tu siguiente paso"), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2.5 mt-3"
  }, pasos.slice(0, 5).map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "flex items-start gap-3 rounded-xl p-3",
    style: {
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
    style: {
      backgroundColor: C.sand,
      color: C.navy
    }
  }, i + 1), /*#__PURE__*/React.createElement("div", {
    className: "text-sm",
    style: {
      color: C.ink
    }
  }, p))))), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl px-4 py-3 text-xs flex items-start gap-2",
    style: {
      backgroundColor: "rgba(79,70,229,0.07)",
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement(I.info, {
    size: 14,
    className: "mt-0.5 shrink-0"
  }), "Contenido educativo. El perfil global y la adecuación de cada objetivo son conceptos distintos. Las hipótesis del simulador no garantizan resultados ni constituyen recomendaciones de productos concretos."));
}

export function ObjetivosFinancieros({
  datos,
  setDatos,
  objetivoSeleccionadoId,
  onEliminarSeleccionado
}) {
  const objetivos = normalizarObjetivos(datos);
  const [editando, setEditando] = useState(null);
  const [borrador, setBorrador] = useState(null);
  const plan = useMemo(() => calcularPlanObjetivos(datos), [datos]);
  const guardar = () => {
    if (!borrador) return;
    const limpio = normalizarObjetivo(borrador, objetivos.length);
    const arr = editando ? objetivos.map(o => o.id === editando ? limpio : o) : [...objetivos, limpio];
    setDatos(sincronizarObjetivos(datos, arr));
    setEditando(null);
    setBorrador(null);
  };
  const abrirNuevo = () => {
    setEditando(null);
    setBorrador({
      id: crearIdObjetivo(),
      tipo: null,
      nombre: "",
      importeObjetivo: null,
      importeReservado: null,
      plazoAnios: null,
      fechaObjetivo: null,
      prioridad: null,
      aportacionMensual: null
    });
  };
  const abrirEditar = o => {
    setEditando(o.id);
    setBorrador({
      ...o
    });
  };
  const eliminar = id => {
    const arr = objetivos.filter(o => o.id !== id);
    setDatos(sincronizarObjetivos(datos, arr));
    if (editando === id) {
      setEditando(null);
      setBorrador(null);
    }
    if (objetivoSeleccionadoId === id) onEliminarSeleccionado && onEliminarSeleccionado(id);
  };
  const inputNombre = (value, placeholder, onChange) => /*#__PURE__*/React.createElement("input", {
    value: value || "",
    onChange: e => onChange(e.target.value),
    placeholder: placeholder,
    className: "w-full rounded-lg px-3 py-2 text-sm font-bold border outline-none",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  });
  const objetivoTitulo = o => o.nombre || OBJETIVOS_DEF.find(x => x.id === o.tipo)?.label || "Objetivo sin nombre";
  return /*#__PURE__*/React.createElement(Card, {
    className: "p-5 sm:p-7"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between gap-4 mb-5"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "05 · Objetivos"), /*#__PURE__*/React.createElement("h3", {
    className: "font-serif text-xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, "¿Qué quieres conseguir?"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1",
    style: {
      color: C.muted
    }
  }, "Tus objetivos conectan tu situación financiera actual con el plazo, la capacidad de ahorro y la estrategia posterior.")), /*#__PURE__*/React.createElement("button", {
    onClick: abrirNuevo,
    className: "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border",
    style: {
      borderColor: C.border,
      color: C.navy,
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement(I.plus, {
    size: 14
  }), " Añadir objetivo")), objetivos.length === 0 && !borrador && /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl border p-5",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-bold"
  }, "Todavía no has definido ningún objetivo."), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1",
    style: {
      color: C.muted
    }
  }, "Empieza introduciendo qué quieres conseguir. No se ha creado ningún objetivo ni se han supuesto importes o plazos."), /*#__PURE__*/React.createElement("button", {
    onClick: abrirNuevo,
    className: "mt-4 px-4 py-2 rounded-lg text-xs font-bold",
    style: {
      backgroundColor: C.sand,
      color: C.navy
    }
  }, "Crear mi primer objetivo")), borrador && /*#__PURE__*/React.createElement("div", {
    className: "mt-2 rounded-xl border p-4",
    style: {
      borderColor: C.sand,
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-bold mb-1",
    style: {
      color: C.ink
    }
  }, editando ? "Editar objetivo" : "Nuevo objetivo"), /*#__PURE__*/React.createElement("div", {
    className: "text-xs mb-4",
    style: {
      color: C.muted
    }
  }, "Las categorías solo sirven para clasificarlo. No rellenan automáticamente los datos del objetivo."), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4"
  }, OBJETIVOS_DEF.map(o => {
    const active = borrador.tipo === o.id;
    return /*#__PURE__*/React.createElement("button", {
      key: o.id,
      onClick: () => setBorrador({
        ...borrador,
        tipo: o.id
      }),
      className: "flex flex-col items-center gap-1 p-2 rounded-lg border text-center",
      style: {
        borderColor: active ? C.sand : C.border,
        backgroundColor: active ? C.sandLight : C.paper
      }
    }, /*#__PURE__*/React.createElement(o.icon, {
      size: 17,
      color: active ? C.navy : C.muted
    }), /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] font-bold",
      style: {
        color: C.ink
      }
    }, o.label));
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-bold mb-2",
    style: {
      color: C.ink
    }
  }, "Nombre del objetivo"), inputNombre(borrador.nombre, "Ej. Entrada de vivienda", v => setBorrador({
    ...borrador,
    nombre: v
  }))), /*#__PURE__*/React.createElement(NumberField, {
    label: "¿Cuánto dinero necesitas?",
    value: borrador.importeObjetivo,
    onChange: v => setBorrador({
      ...borrador,
      importeObjetivo: v || null
    })
  }), /*#__PURE__*/React.createElement(NumberField, {
    label: "¿Cuánto tienes ya reservado?",
    value: borrador.importeReservado,
    onChange: v => setBorrador({
      ...borrador,
      importeReservado: v || null
    })
  }), /*#__PURE__*/React.createElement(NumberField, {
    label: "¿En cuánto tiempo quieres conseguirlo?",
    suffix: "años",
    value: borrador.plazoAnios,
    onChange: v => setBorrador({
      ...borrador,
      plazoAnios: v || null
    })
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-bold mb-2",
    style: {
      color: C.ink
    }
  }, "O fecha objetivo"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: borrador.fechaObjetivo || "",
    onChange: e => setBorrador({
      ...borrador,
      fechaObjetivo: e.target.value || null
    }),
    className: "w-full rounded-lg px-3 py-2 text-sm font-bold border outline-none",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] mt-1",
    style: {
      color: C.muted
    }
  }, "Puedes indicar años o una fecha concreta.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-bold mb-2",
    style: {
      color: C.ink
    }
  }, "Prioridad"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-3 gap-2"
  }, PRIORIDADES_OBJETIVO.map(pr => /*#__PURE__*/React.createElement("button", {
    key: pr,
    onClick: () => setBorrador({
      ...borrador,
      prioridad: pr
    }),
    className: "px-2 py-2 rounded-lg border text-xs font-bold",
    style: {
      borderColor: borrador.prioridad === pr ? C.sand : C.border,
      backgroundColor: borrador.prioridad === pr ? C.sandLight : C.paper,
      color: C.ink
    }
  }, PRIORIDAD_LABEL[pr]))), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] mt-1",
    style: {
      color: C.muted
    }
  }, "Necesaria para decidir preferencias cuando varios objetivos compiten por la misma capacidad.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(NumberField, {
    label: "¿Cuánto quieres aportar cada mes?",
    value: borrador.aportacionMensual,
    onChange: v => setBorrador({
      ...borrador,
      aportacionMensual: v == null ? null : v
    }),
    hint: "Opcional: si lo dejas vacío, solo calcularemos cuánto necesitarías aportar."
  }), plan.capacidadParaObjetivos > 0 && /*#__PURE__*/React.createElement("div", {
    className: "mt-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] font-bold mb-1",
    style: {
      color: C.muted
    }
  }, "O destina un % de tu ahorro mensual (", euros(plan.capacidadParaObjetivos), "/mes)"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-4 gap-1.5"
  }, [25, 50, 75, 100].map(p => /*#__PURE__*/React.createElement("button", {
    key: p,
    type: "button",
    onClick: () => setBorrador({
      ...borrador,
      aportacionMensual: Math.round(plan.capacidadParaObjetivos * p / 100)
    }),
    className: "px-2 py-1.5 rounded-lg border text-xs font-bold",
    style: {
      borderColor: Number(borrador.aportacionMensual) === Math.round(plan.capacidadParaObjetivos * p / 100) ? C.sand : C.border,
      backgroundColor: Number(borrador.aportacionMensual) === Math.round(plan.capacidadParaObjetivos * p / 100) ? C.sandLight : C.paper,
      color: C.ink
    }
  }, p, "%")))))), borrador.plazoAnios > 0 && /*#__PURE__*/React.createElement("div", {
    className: "mt-4 rounded-lg p-3 text-xs",
    style: {
      backgroundColor: recomendacionObjetivoPorHorizonte(borrador.plazoAnios).modo === "invertir" ? C.saluLight : C.sandLight,
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("b", null, recomendacionObjetivoPorHorizonte(borrador.plazoAnios).titulo, "."), " ", recomendacionObjetivoPorHorizonte(borrador.plazoAnios).texto), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 mt-4"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: guardar,
    className: "px-4 py-2 rounded-lg text-xs font-bold",
    style: {
      backgroundColor: C.sand,
      color: C.navy
    }
  }, "Guardar objetivo"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setBorrador(null);
      setEditando(null);
    },
    className: "px-4 py-2 rounded-lg text-xs font-bold border",
    style: {
      borderColor: C.border,
      color: C.ink
    }
  }, "Cancelar"))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-3 mt-4"
  }, plan.objetivos.map(o => {
    const faltaDatos = [];
    if (!o.nombre && !o.tipo) faltaDatos.push("nombre o categoría");
    if (o.importeObjetivo == null) faltaDatos.push("importe");
    if (o.importeReservado == null) faltaDatos.push("ahorro reservado");
    if (o.plazoAnios == null || o.plazoAnios <= 0) faltaDatos.push("plazo");
    if (o.prioridad == null) faltaDatos.push("prioridad");
    const deficitObjetivo = o.aportacionMensual != null && plan.capacidadParaObjetivos != null ? Math.max(0, o.aportacionMensual - plan.capacidadParaObjetivos) : null;
    return /*#__PURE__*/React.createElement("div", {
      key: o.id,
      className: "rounded-xl border p-4",
      style: {
        borderColor: C.border,
        backgroundColor: C.paper
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-start justify-between gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "min-w-0"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap items-center gap-2"
    }, /*#__PURE__*/React.createElement("b", {
      className: "text-sm",
      style: {
        color: C.ink
      }
    }, objetivoTitulo(o)), o.prioridad ? /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] uppercase font-bold px-2 py-1 rounded-full",
      style: {
        backgroundColor: C.sandLight,
        color: C.navy
      }
    }, PRIORIDAD_LABEL[o.prioridad]) : /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] uppercase font-bold px-2 py-1 rounded-full",
      style: {
        backgroundColor: C.critLight,
        color: C.crit
      }
    }, "Prioridad por definir"), /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] uppercase font-bold",
      style: {
        color: C.muted
      }
    }, o.horizonteCategoria), o.estadoViabilidad && /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] uppercase font-bold px-2 py-1 rounded-full",
      style: {
        backgroundColor: o.estadoViabilidad === "viable" || o.estadoViabilidad === "completado" ? C.saluLight : o.estadoViabilidad === "ajustado" ? C.mejLight : C.critLight,
        color: o.estadoViabilidad === "viable" || o.estadoViabilidad === "completado" ? C.salu : o.estadoViabilidad === "ajustado" ? C.mej : C.crit
      }
    }, {
      viable: "Viable",
      ajustado: "Ajustado",
      no_viable: "No viable",
      pendiente: "Pendiente",
      pendiente_capacidad: "Pendiente",
      completado: "Completado"
    }[o.estadoViabilidad])), /*#__PURE__*/React.createElement("div", {
      className: "text-xs mt-1",
      style: {
        color: C.muted
      }
    }, o.importeObjetivo != null ? `${euros(o.importeReservadoAplicado)} / ${euros(o.importeObjetivo)}` : "Importe por definir", " · ", o.fechaObjetivo && !isNaN(new Date(o.fechaObjetivo + "T00:00:00").getTime()) ? `fecha ${new Date(o.fechaObjetivo + "T00:00:00").toLocaleDateString("es-ES")}` : o.horizonteAniosCalculado > 0 ? `${o.horizonteAniosCalculado.toFixed(1)} años` : "plazo por definir"), faltaDatos.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "mt-2 text-xs",
      style: {
        color: C.crit
      }
    }, "Completa ", faltaDatos.join(", "), " para poder evaluar completamente este objetivo."), /*#__PURE__*/React.createElement("div", {
      className: "mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold",
      style: {
        backgroundColor: o.recomendacionHorizonte.modo === "invertir" ? C.saluLight : o.recomendacionHorizonte.modo === "ahorrar" ? C.sandLight : "rgba(14,165,233,0.08)",
        color: C.ink
      }
    }, /*#__PURE__*/React.createElement(I.info, {
      size: 12
    }), o.recomendacionHorizonte.titulo)), /*#__PURE__*/React.createElement("div", {
      className: "flex gap-2 shrink-0"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => abrirEditar(o),
      style: {
        color: C.navy
      }
    }, /*#__PURE__*/React.createElement(I.edit, {
      size: 15
    })), /*#__PURE__*/React.createElement("button", {
      onClick: () => eliminar(o.id),
      style: {
        color: C.crit
      }
    }, /*#__PURE__*/React.createElement(I.trash, {
      size: 15
    })))), o.importeObjetivo != null && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "h-1.5 rounded-full mt-3 overflow-hidden",
      style: {
        backgroundColor: C.bgDeepMid
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "h-full rounded-full",
      style: {
        width: o.progreso + "%",
        backgroundColor: C.salu
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3 text-xs"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      style: {
        color: C.muted
      }
    }, "Progreso"), /*#__PURE__*/React.createElement("b", {
      className: "block",
      style: {
        color: C.ink
      }
    }, pct(o.progreso, 0))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      style: {
        color: C.muted
      }
    }, "Restante"), /*#__PURE__*/React.createElement("b", {
      className: "block",
      style: {
        color: C.ink
      }
    }, o.importeRestante == null ? "—" : euros(o.importeRestante))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      style: {
        color: C.muted
      }
    }, "Necesario"), /*#__PURE__*/React.createElement("b", {
      className: "block",
      style: {
        color: C.ink
      }
    }, o.aportacionNecesaria == null ? "—" : euros(o.aportacionNecesaria) + "/mes")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      style: {
        color: C.muted
      }
    }, "Previsto"), /*#__PURE__*/React.createElement("b", {
      className: "block",
      style: {
        color: C.ink
      }
    }, o.aportacionMensual == null ? "—" : euros(o.aportacionMensual) + "/mes")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      style: {
        color: C.muted
      }
    }, "Capacidad"), /*#__PURE__*/React.createElement("b", {
      className: "block",
      style: {
        color: C.ink
      }
    }, plan.capacidadParaObjetivos == null ? "—" : euros(plan.capacidadParaObjetivos) + "/mes"))), o.aportacionMensual != null && plan.capacidadParaObjetivos != null && deficitObjetivo > 0 && /*#__PURE__*/React.createElement("div", {
      className: "mt-3 rounded-lg p-3 text-xs",
      style: {
        backgroundColor: C.critLight,
        color: C.crit
      }
    }, /*#__PURE__*/React.createElement("b", null, "Déficit de capacidad: ", euros(deficitObjetivo), "/mes."), " La aportación prevista supera la capacidad mensual calculada con tus ingresos, gastos y deudas."), o.aportacionMensual != null && o.aportacionNecesaria != null && /*#__PURE__*/React.createElement("div", {
      className: "mt-2 text-xs",
      style: {
        color: o.aportacionMensual >= o.aportacionNecesaria ? C.salu : C.crit
      }
    }, o.aportacionMensual >= o.aportacionNecesaria ? "La aportación indicada cubre el ritmo necesario para el plazo elegido." : `Con la aportación indicada faltan ${euros(o.aportacionNecesaria - o.aportacionMensual)}/mes respecto al ritmo necesario.`), /*#__PURE__*/React.createElement("div", {
      className: "mt-3 rounded-lg p-3 text-xs",
      style: {
        backgroundColor: o.recomendacionHorizonte.modo === "invertir" ? C.saluLight : o.recomendacionHorizonte.modo === "ahorrar" ? C.sandLight : "rgba(14,165,233,0.06)",
        color: C.ink
      }
    }, /*#__PURE__*/React.createElement("b", null, o.recomendacionHorizonte.titulo, "."), " ", o.recomendacionHorizonte.texto)));
  })), objetivos.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "mt-5 grid sm:grid-cols-3 gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4",
    style: {
      backgroundColor: C.saluLight
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] uppercase font-bold",
    style: {
      color: C.salu
    }
  }, "Capacidad mensual"), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, plan.capacidadParaObjetivos == null ? "Pendiente" : euros(plan.capacidadParaObjetivos) + "/mes"), /*#__PURE__*/React.createElement("div", {
    className: "text-xs mt-1",
    style: {
      color: C.muted
    }
  }, "Ingresos − gastos fijos − discrecionales − deudas.")), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4",
    style: {
      backgroundColor: plan.deficitMensual > 0 ? C.critLight : C.saluLight
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] uppercase font-bold",
    style: {
      color: plan.deficitMensual > 0 ? C.crit : C.salu
    }
  }, "Aportaciones previstas"), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, euros(plan.aportacionComprometida), "/mes"), /*#__PURE__*/React.createElement("div", {
    className: "text-xs mt-1",
    style: {
      color: C.muted
    }
  }, plan.deficitMensual == null ? "Completa ingresos y gastos para compararlas." : plan.deficitMensual > 0 ? `Déficit: ${euros(plan.deficitMensual)}/mes.` : `Dentro de la capacidad actual.`)), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4",
    style: {
      backgroundColor: C.paper,
      border: "1px solid " + C.border
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] uppercase font-bold",
    style: {
      color: C.navy
    }
  }, "Ritmo necesario"), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, euros(plan.aportacionNecesariaTotal), "/mes"), /*#__PURE__*/React.createElement("div", {
    className: "text-xs mt-1",
    style: {
      color: C.muted
    }
  }, plan.deficitRitmoElegido > 0 ? `Tus aportaciones quedan ${euros(plan.deficitRitmoElegido)}/mes por debajo del ritmo necesario.` : "Ritmo cubierto con las aportaciones previstas."))), plan.principal && /*#__PURE__*/React.createElement("div", {
    className: "mt-4 text-xs",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.ink
    }
  }, "Objetivo principal:"), " ", objetivoTitulo(plan.principal), ". Se ha determinado por prioridad y, después, por plazo y capital pendiente."), plan.prioridadSinDefinir && objetivos.length > 1 && /*#__PURE__*/React.createElement("div", {
    className: "mt-3 rounded-lg p-3 text-xs",
    style: {
      backgroundColor: C.critLight,
      color: C.crit
    }
  }, /*#__PURE__*/React.createElement("b", null, "Define las prioridades."), " Hay objetivos sin prioridad; hasta que las indiques, la herramienta no asigna silenciosamente preferencia a ninguno."), plan.ejecucion && /*#__PURE__*/React.createElement("div", {
    className: "mt-3 rounded-lg p-3 text-xs",
    style: {
      backgroundColor: "rgba(14,165,233,0.06)",
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("b", null, "Capacidad de ejecución:"), " ", plan.ejecucion.texto), plan.conflictoObjetivos && /*#__PURE__*/React.createElement("div", {
    className: "mt-3 rounded-xl p-3 text-xs",
    style: {
      backgroundColor: C.critLight,
      color: C.crit
    }
  }, /*#__PURE__*/React.createElement("b", null, "Conflicto entre objetivos:"), " tus aportaciones previstas suman ", euros(plan.aportacionComprometida), "/mes y la capacidad conjunta es ", euros(plan.capacidadParaObjetivos), "/mes. Déficit conjunto: ", euros(plan.deficitMensual), "/mes."), /*#__PURE__*/React.createElement("div", {
    className: "mt-3 rounded-xl p-3 text-xs",
    style: {
      backgroundColor: "rgba(14,165,233,0.06)",
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("b", null, "Cómo lo calculamos:"), " usamos tus ingresos, gastos, deudas y ahorro actual. Es una orientación educativa, no una garantía de resultados."));
}

export function Diagnostico({
  datos,
  setDatos,
  onFinalizar,
  objetivoSeleccionadoId,
  onEliminarSeleccionado,
  liquidezReal
}) {
  /* UX: wizard de 3 pasos. Los datos siguen viviendo en `datos` y se persisten
     exactamente por los mecanismos existentes; solo cambia cuándo se muestran. */
  const [paso, setPaso] = useState(1);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  }, [paso]);
  const [subPasoRedSeguridad, setSubPasoRedSeguridad] = useState(() => datos.deudas.some(d => Number(d.pendiente) > 0 || d.nombre || Number(d.cuota) > 0 || Number(d.tasa) > 0) ? "listaDeudas" : "colchon");
  const cuotasDeuda = calcularCapacidadFinanciera(datos).cuotasDeuda;
  const totalIngresos = (Number(datos.ingresos) || 0) + (Number(datos.otrosIngresos) || 0);
  const gastosFijos = totalMensual(datos.gastosFijos);
  const gastosDisc = totalMensual(datos.gastosDiscrecionales);
  const necesidades = gastosFijos + cuotasDeuda;
  const deseos = gastosDisc;
  const ahorroReal = totalIngresos - necesidades - deseos;
  const ratioAhorro = totalIngresos > 0 ? ahorroReal / totalIngresos : 0;
  const fondo = calcularFondoEmergencia(liquidezReal == null ? datos : {
    ...datos,
    ahorroActual: liquidezReal
  });
  const objetivoFondo = fondo.objetivo == null ? 0 : fondo.objetivo;
  const estado = estadoAhorro(ratioAhorro);
  const puedePaso2 = Number(datos.ingresos) > 0;
  const avanzar = () => setPaso(p => Math.min(3, p + 1));
  const retroceder = () => setPaso(p => Math.max(1, p - 1));
  const addDeuda = () => setDatos({
    ...datos,
    deudas: [...datos.deudas, {
      nombre: "",
      pendiente: 0,
      cuota: 0,
      tasa: 0
    }]
  });
  const removeDeuda = i => setDatos({
    ...datos,
    deudas: datos.deudas.filter((_, idx) => idx !== i)
  });
  const updateDeuda = (i, field, val) => {
    const arr = [...datos.deudas];
    arr[i] = {
      ...arr[i],
      [field]: val
    };
    setDatos({
      ...datos,
      deudas: arr
    });
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "py-16 sm:py-24 relative"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-6xl mx-auto px-4 sm:px-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-3xl mb-8 section-intro"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Diagnóstico financiero"), /*#__PURE__*/React.createElement("h2", {
    className: "font-serif text-3xl sm:text-4xl font-bold mt-2",
    style: {
      color: C.ink
    }
  }, "Construye tu foto financiera, paso a paso"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm sm:text-base mt-3",
    style: {
      color: C.muted
    }
  }, "Empezamos por lo esencial y añadimos detalle solo cuando lo necesitas. Tus cálculos se actualizan en cada paso.")), /*#__PURE__*/React.createElement("div", {
    className: "mb-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between text-xs font-bold mb-2",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement("span", null, "Paso ", paso, " de 3"), /*#__PURE__*/React.createElement("span", null, paso === 1 ? "Tu punto de partida" : paso === 2 ? "Tu presupuesto" : "Tu red de seguridad")), /*#__PURE__*/React.createElement("div", {
    className: "h-2 rounded-full overflow-hidden",
    style: {
      backgroundColor: C.bgDeepMid
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-full rounded-full transition-all duration-300",
    style: {
      width: paso / 3 * 100 + "%",
      backgroundColor: C.sand
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-3 gap-2 mt-3 text-[11px]"
  }, ["Ingresos y control", "Gastos y ahorro", "Colchón y deuda"].map((label, i) => /*#__PURE__*/React.createElement("button", {
    key: label,
    onClick: () => {
      if (i === 0 || puedePaso2 || i < paso) setPaso(i + 1);
    },
    className: "text-left font-bold",
    style: {
      color: paso === i + 1 ? C.ink : C.muted
    }
  }, i + 1, ". ", label)))), paso === 1 && /*#__PURE__*/React.createElement(Card, {
    className: "p-5 sm:p-7"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between gap-4 mb-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "01 · Tu punto de partida"), /*#__PURE__*/React.createElement("h3", {
    className: "font-serif text-xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, "Empecemos por lo que entra"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1",
    style: {
      color: C.muted
    }
  }, "Solo necesitamos tus ingresos netos y cuánto control sientes que tienes.")), /*#__PURE__*/React.createElement("div", {
    className: "w-9 h-9 rounded-xl flex items-center justify-center",
    style: {
      backgroundColor: "rgba(16,185,129,0.08)"
    }
  }, /*#__PURE__*/React.createElement(I.wallet, {
    size: 17,
    color: C.salu
  }))), /*#__PURE__*/React.createElement("div", {
    className: "max-w-sm"
  }, /*#__PURE__*/React.createElement(NumberField, {
    label: "Ingresos mensuales netos",
    value: datos.ingresos,
    onChange: v => setDatos({
      ...datos,
      ingresos: v
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "max-w-sm mt-4"
  }, /*#__PURE__*/React.createElement(NumberField, {
    label: "Otros ingresos",
    value: datos.otrosIngresos,
    onChange: v => setDatos({
      ...datos,
      otrosIngresos: v
    }),
    hint: "Opcional: becas, ayudas, rentas, etc."
  })), /*#__PURE__*/React.createElement("div", {
    className: "mt-6"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-bold mb-2",
    style: {
      color: C.ink
    }
  }, "¿Cómo describirías tu relación con el dinero hoy?"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs mb-3",
    style: {
      color: C.muted
    }
  }, "No hay una respuesta correcta. Esto nos ayuda a adaptar el acompañamiento."), /*#__PURE__*/React.createElement("div", {
    className: "grid sm:grid-cols-3 gap-2"
  }, ["No tengo ni idea de a dónde va", "Más o menos controlado, pero sin apuntar nada", "Todo apuntado y bajo control"].map(h => /*#__PURE__*/React.createElement("button", {
    key: h,
    onClick: () => setDatos({
      ...datos,
      habito: h
    }),
    className: "text-left px-3.5 py-3 rounded-lg border text-sm font-medium transition-all hover:-translate-y-0.5",
    style: {
      borderColor: datos.habito === h ? C.sand : C.border,
      backgroundColor: datos.habito === h ? C.sandLight : C.paper,
      color: C.ink
    }
  }, h)))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-end mt-6"
  }, /*#__PURE__*/React.createElement("button", {
    disabled: !puedePaso2,
    onClick: avanzar,
    className: "inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed",
    style: {
      backgroundColor: C.sand,
      color: C.navy
    }
  }, "Ver mi primer avance ", /*#__PURE__*/React.createElement(I.arrowRight, {
    size: 16
  })))), paso === 2 && /*#__PURE__*/React.createElement("div", {
    className: "space-y-5"
  }, /*#__PURE__*/React.createElement(Card, {
    className: "p-5 sm:p-7"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mb-5"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "02 · Tu presupuesto"), /*#__PURE__*/React.createElement("h3", {
    className: "font-serif text-xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, "¿En qué se va tu dinero?"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1",
    style: {
      color: C.muted
    }
  }, "Introduce primero los gastos que conozcas. Puedes volver y afinarlos después.")), /*#__PURE__*/React.createElement(GastosTabs, {
    datos: datos,
    setDatos: setDatos
  }), /*#__PURE__*/React.createElement("div", {
    className: "mt-6 rounded-2xl p-4 sm:p-5",
    style: {
      backgroundColor: C.sandLight,
      border: "1px solid rgba(79,70,229,.16)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
    style: {
      backgroundColor: C.surface
    }
  }, /*#__PURE__*/React.createElement(I.sparkles, {
    size: 18,
    color: C.sand
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold uppercase",
    style: {
      color: C.sand,
      letterSpacing: "0.08em"
    }
  }, "Tu primer momento de valor"), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, euros(ahorroReal), " al mes de margen"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1",
    style: {
      color: C.muted
    }
  }, "Con lo que has introducido hasta ahora, este sería tu ahorro disponible antes de entrar en el detalle de colchón y deuda."), /*#__PURE__*/React.createElement("div", {
    className: "mt-3 flex flex-wrap gap-3 text-xs font-bold"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.ink
    }
  }, "Ahorro: ", pct(ratioAhorro * 100)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.muted
    }
  }, "Gastos: ", euros(necesidades + deseos), "/mes")))))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-3"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: retroceder,
    className: "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold border",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement(I.arrowLeft, {
    size: 15
  }), " Atrás"), /*#__PURE__*/React.createElement("button", {
    onClick: avanzar,
    className: "inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold",
    style: {
      backgroundColor: C.sand,
      color: C.navy
    }
  }, "Continuar ", /*#__PURE__*/React.createElement(I.arrowRight, {
    size: 16
  })))), paso === 3 && /*#__PURE__*/React.createElement("div", {
    className: "space-y-5"
  }, /*#__PURE__*/React.createElement(Card, {
    className: "p-5 sm:p-7"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between gap-4 mb-5"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "03 · Tu red de seguridad"), /*#__PURE__*/React.createElement("h3", {
    className: "font-serif text-xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, "Colchón y deuda, sin juicios"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1",
    style: {
      color: C.muted
    }
  }, "Vamos paso a paso: primero tu colchón, después tus deudas si las tienes.")), /*#__PURE__*/React.createElement("div", {
    className: "w-9 h-9 rounded-xl flex items-center justify-center",
    style: {
      backgroundColor: "rgba(14,165,233,0.08)"
    }
  }, /*#__PURE__*/React.createElement(I.shieldCheck, {
    size: 17,
    color: C.exc
  }))), subPasoRedSeguridad === "colchon" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4 mb-4",
    style: {
      backgroundColor: C.paper,
      border: "1px solid " + C.border
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-bold",
    style: {
      color: C.ink
    }
  }, "¿Qué es el colchón financiero?"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs mt-1",
    style: {
      color: C.muted
    }
  }, "Es el dinero que tienes ahorrado y disponible para imprevistos (una reparación, quedarte sin ingresos unos meses...), sin tocar inversiones ni pedir prestado. Cuantos más meses de gastos cubra, más tranquilidad tienes.")), /*#__PURE__*/React.createElement(NumberField, {
    label: "Ahorro actual disponible",
    value: datos.ahorroActual,
    onChange: v => setDatos({
      ...datos,
      ahorroActual: v
    })
  }), /*#__PURE__*/React.createElement("div", {
    className: "mt-5 rounded-xl p-4",
    style: {
      backgroundColor: C.saluLight
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-bold",
    style: {
      color: C.ink
    }
  }, "Tu red de seguridad"), /*#__PURE__*/React.createElement("div", {
    className: "mt-1 text-sm",
    style: {
      color: C.muted
    }
  }, fondo.coberturaMeses == null ? "Cuando tengamos tus gastos esenciales podremos estimarla." : `Con lo que tienes hoy, tu colchón cubre aproximadamente ${fondo.coberturaMeses.toFixed(1)} meses de gastos esenciales.`)), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-end mt-5"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setSubPasoRedSeguridad("preguntaDeuda"),
    className: "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold",
    style: {
      backgroundColor: C.sand,
      color: C.navy
    }
  }, "Continuar ", /*#__PURE__*/React.createElement(I.arrowRight, {
    size: 15
  })))), subPasoRedSeguridad === "preguntaDeuda" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    onClick: () => setSubPasoRedSeguridad("colchon"),
    className: "inline-flex items-center gap-1.5 text-xs font-bold mb-3",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement(I.arrowLeft, {
    size: 13
  }), " Volver al colchón"), /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-bold mb-2",
    style: {
      color: C.ink
    }
  }, "¿Tienes alguna deuda (que no sea tu hipoteca)?"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs mb-4",
    style: {
      color: C.muted
    }
  }, "Por ejemplo: préstamo de coche, de estudios, tarjeta de crédito u otro préstamo personal."), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setSubPasoRedSeguridad("listaDeudas"),
    className: "px-4 py-2.5 rounded-xl border text-sm font-bold",
    style: {
      borderColor: C.border,
      backgroundColor: C.paper,
      color: C.ink
    }
  }, "Sí, tengo alguna deuda"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setDatos({
        ...datos,
        deudas: []
      });
      setSubPasoRedSeguridad("sinDeuda");
    },
    className: "px-4 py-2.5 rounded-xl border text-sm font-bold",
    style: {
      borderColor: C.border,
      backgroundColor: C.paper,
      color: C.ink
    }
  }, "No tengo deudas"))), subPasoRedSeguridad === "sinDeuda" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    onClick: () => setSubPasoRedSeguridad("preguntaDeuda"),
    className: "inline-flex items-center gap-1.5 text-xs font-bold mb-3",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement(I.arrowLeft, {
    size: 13
  }), " Volver"), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4 text-sm",
    style: {
      backgroundColor: C.paper,
      border: "1px solid " + C.border,
      color: C.muted
    }
  }, "Perfecto, seguimos sin deudas que gestionar.")), subPasoRedSeguridad === "listaDeudas" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    onClick: () => setSubPasoRedSeguridad("preguntaDeuda"),
    className: "inline-flex items-center gap-1.5 text-xs font-bold mb-3",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement(I.arrowLeft, {
    size: 13
  }), " Volver"), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-3 mb-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-bold",
    style: {
      color: C.ink
    }
  }, "Deudas pendientes"), /*#__PURE__*/React.createElement("div", {
    className: "text-xs mt-1",
    style: {
      color: C.muted
    }
  }, "Añade o marca las que tengas.")), /*#__PURE__*/React.createElement("button", {
    onClick: addDeuda,
    className: "inline-flex items-center gap-1.5 text-xs font-bold",
    style: {
      color: C.sand
    }
  }, /*#__PURE__*/React.createElement(I.plus, {
    size: 14
  }), " Añadir deuda")), /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, datos.deudas.filter(d => Number(d.pendiente) > 0 || d.nombre || Number(d.cuota) > 0 || Number(d.tasa) > 0).map(d => {
    const originalIndex = datos.deudas.indexOf(d);
    return /*#__PURE__*/React.createElement("div", {
      key: originalIndex,
      className: "rounded-xl p-3.5 border",
      style: {
        backgroundColor: C.paper,
        border: "1px solid " + C.border
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between gap-2 mb-3"
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      placeholder: "Nombre (ej. préstamo coche)",
      value: d.nombre,
      onChange: e => updateDeuda(originalIndex, "nombre", e.target.value),
      className: "flex-1 min-w-0 text-sm font-bold border-none outline-none bg-transparent",
      style: {
        color: C.ink
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: () => removeDeuda(originalIndex),
      className: "shrink-0",
      style: {
        color: C.crit
      },
      "aria-label": "Eliminar deuda"
    }, /*#__PURE__*/React.createElement(I.trash, {
      size: 15
    }))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 sm:grid-cols-3 gap-2"
    }, [["pendiente", "Pendiente €"], ["cuota", "Cuota €/mes"], ["tasa", "Interés %"]].map(([field, lbl]) => /*#__PURE__*/React.createElement("div", {
      key: field
    }, /*#__PURE__*/React.createElement("label", {
      className: "text-[10px] font-bold uppercase",
      style: {
        color: C.muted
      }
    }, lbl), /*#__PURE__*/React.createElement("input", {
      type: "number",
      inputMode: "decimal",
      value: d[field] === 0 ? "" : d[field],
      onChange: e => updateDeuda(originalIndex, field, e.target.value === "" ? 0 : Math.max(0, Number(e.target.value))),
      placeholder: "0",
      className: "w-full rounded-lg px-2 py-2 text-sm font-bold border outline-none",
      style: {
        borderColor: C.border,
        color: C.ink,
        backgroundColor: C.paper
      }
    })))));
  })), datos.deudas.filter(d => Number(d.pendiente) > 0 || d.nombre || Number(d.cuota) > 0 || Number(d.tasa) > 0).length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4 text-xs mt-3",
    style: {
      backgroundColor: C.paper,
      border: "1px solid " + C.border,
      color: C.muted
    }
  }, "Añade tu primera deuda con el botón de arriba."))), /*#__PURE__*/React.createElement(ObjetivosFinancieros, {
    datos: datos,
    setDatos: setDatos,
    objetivoSeleccionadoId: objetivoSeleccionadoId,
    onEliminarSeleccionado: onEliminarSeleccionado
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-3"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: retroceder,
    className: "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold border",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement(I.arrowLeft, {
    size: 15
  }), " Atrás"), /*#__PURE__*/React.createElement("button", {
    onClick: onFinalizar,
    className: "inline-flex justify-center items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold",
    style: {
      backgroundColor: C.sand,
      color: C.navy
    }
  }, "Ver mi salud financiera ", /*#__PURE__*/React.createElement(I.arrowRight, {
    size: 16
  })))), /*#__PURE__*/React.createElement("div", {
    className: "mt-6"
  }, /*#__PURE__*/React.createElement(Card, {
    className: "p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] uppercase font-bold",
    style: {
      color: C.muted
    }
  }, "Ingresos"), /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.ink
    }
  }, euros(totalIngresos))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] uppercase font-bold",
    style: {
      color: C.muted
    }
  }, "Gastos"), /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.ink
    }
  }, euros(necesidades + deseos))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] uppercase font-bold",
    style: {
      color: C.muted
    }
  }, "Margen mensual"), /*#__PURE__*/React.createElement("b", {
    style: {
      color: ahorroReal >= 0 ? C.salu : C.mej
    }
  }, euros(ahorroReal))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] uppercase font-bold",
    style: {
      color: C.muted
    }
  }, "Estado"), /*#__PURE__*/React.createElement(Badge, {
    estado: estado
  })))))));
}

export function Blog({ user }) {
  const [posts, setPosts] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [tab, setTab] = useState('bolsa');
  const [faseAbierta, setFaseAbierta] = useState(1);
  const [slugAbierto, setSlugAbierto] = useState(null);
  const [editando, setEditando] = useState(null);
  const esAdmin = !!(user && user.email && user.email.toLowerCase() === BLOG_ADMIN_EMAIL.toLowerCase());
  window.__abrirPostBlog = setSlugAbierto;
  async function cargar() {
    setCargando(true);
let query = supa
  .from('posts')
  .select('*')
  .order('orden', { ascending: true, nullsFirst: false })
  .order('created_at', { ascending: true });    if (!esAdmin) query = query.eq('published', true);
    const { data } = await query;
    setPosts(data || []);
    setCargando(false);
  }
  useEffect(() => { cargar(); }, [esAdmin]);
  async function guardar(e) {
    e.preventDefault();
    const f = e.target;
    const esGuia = f.categoria_seccion.value === 'guia';
    const faseNueva = esGuia ? (Number(f.fase.value) || null) : null;
    let ordenNuevo = null;

    if (esGuia && faseNueva) {
      const postsDeLaFase = posts.filter(p =>
        p.categoria_seccion === 'guia' &&
        Number(p.fase) === Number(faseNueva) &&
        (!editando || p.id !== editando.id)
      );
      const maxOrden = postsDeLaFase.reduce(
        (max, p) => Math.max(max, Number(p.orden) || 0),
        0
      );

      if (
        editando &&
        Number(editando.fase) === Number(faseNueva) &&
        editando.orden != null
      ) {
        ordenNuevo = editando.orden;
      } else {
        ordenNuevo = maxOrden + 1;
      }
    }

    const payload = {
      title: f.title.value.trim(),
      slug: f.slug.value.trim() || slugify(f.title.value),
      excerpt: f.excerpt.value.trim(),
      content: f.content.value,
      category: f.category.value.trim() || 'General',
      author: f.author.value.trim() || 'Equipo MoneyPilot',
      cover_emoji: f.cover_emoji.value.trim() || '📊',
      published: f.published.checked,
      categoria_seccion: f.categoria_seccion.value,
      fase: faseNueva,
      orden: ordenNuevo,
      updated_at: new Date().toISOString()
    };
    let error;
    if (editando && editando.id) {
      ({ error } = await supa.from('posts').update(payload).eq('id', editando.id));
    } else {
      ({ error } = await supa.from('posts').insert(payload));
    }
    if (error) { alert('Error al guardar: ' + error.message); return; }
    setEditando(null);
    cargar();
  }
async function borrar(id) {
  if (!confirm('¿Borrar este artículo? No se puede deshacer.')) return;
  await supa.from('posts').delete().eq('id', id);
  cargar();
  }
  async function moverPost(post, direccion) {
  const postsFase = posts
    .filter(p =>
      p.categoria_seccion === 'guia' &&
      Number(p.fase) === Number(post.fase)
    )
    .sort((a, b) => {
      const oa = Number(a.orden) || 999999;
      const ob = Number(b.orden) || 999999;
      return oa - ob;
    });

  const indice = postsFase.findIndex(p => p.id === post.id);

  if (indice === -1) return;

  const nuevoIndice =
    direccion === 'arriba'
      ? indice - 1
      : indice + 1;

  if (nuevoIndice < 0 || nuevoIndice >= postsFase.length) return;

  const otroPost = postsFase[nuevoIndice];

  const ordenActual = Number(post.orden);
  const ordenOtro = Number(otroPost.orden);

  const { error: error1 } = await supa
    .from('posts')
    .update({ orden: ordenOtro })
    .eq('id', post.id);

  if (error1) {
    alert('Error al mover el artículo: ' + error1.message);
    return;
  }

  const { error: error2 } = await supa
    .from('posts')
    .update({ orden: ordenActual })
    .eq('id', otroPost.id);

  if (error2) {
    alert('Error al mover el artículo: ' + error2.message);
    return;
  }

  cargar();
}
  const post = slugAbierto ? posts.find(p => p.slug === slugAbierto) : null;
  if (post) {
    return /*#__PURE__*/React.createElement("div", {
      className: "max-w-3xl mx-auto px-4 sm:px-6 py-12"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setSlugAbierto(null),
      className: "text-sm font-bold mb-6",
      style: { color: C.sand }
    }, "← Volver al blog"), /*#__PURE__*/React.createElement("div", {
      className: "text-xs font-bold uppercase mb-1",
      style: { color: C.mej, letterSpacing: "0.1em" }
    }, post.category || 'General'), /*#__PURE__*/React.createElement("h1", {
      className: "font-serif text-3xl font-bold mb-2",
      style: { color: C.ink }
    }, post.title), (post.categoria_seccion === 'guia' ? /*#__PURE__*/React.createElement("div", {
  className: "text-xs mb-8",
  style: { color: C.muted }
}, "Por ", post.author || 'Equipo MoneyPilot') : /*#__PURE__*/React.createElement("div", {
  className: "text-xs mb-8",
  style: { color: C.muted }
}, "Por ", post.author || 'Equipo MoneyPilot', " · ", fmtFecha(post.created_at))), /*#__PURE__*/React.createElement("div", {
      className: "prose-blog",
      style: { color: C.ink, lineHeight: 1.75 },
      dangerouslySetInnerHTML: { __html: mdToHtml(post.content) }
    }), /*#__PURE__*/React.createElement("div", {
      className: "mt-10 p-5 rounded-2xl text-sm",
      style: { backgroundColor: C.sandLight, color: C.navy }
    }, "¿Quieres aplicar esto a tu propio caso? Usa el ", /*#__PURE__*/React.createElement("button", {
      onClick: () => setSlugAbierto(null),
      className: "font-bold underline"
    }, "diagnóstico gratuito de MoneyPilot"), " arriba en el menú."));
  }
  const postsTab = posts.filter(p => (p.categoria_seccion || 'actualidad') === tab);
  return /*#__PURE__*/React.createElement("div", {
    className: "max-w-4xl mx-auto px-4 sm:px-6 py-12"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Educación financiera"), /*#__PURE__*/React.createElement("h1", {
    className: "font-serif text-3xl sm:text-4xl font-bold mb-2",
    style: { color: C.ink }
  }, "Blog de finanzas personales"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm sm:text-base mb-6",
    style: { color: C.muted }
  }, "Guías claras sobre ahorro, inversión y presupuesto, además de noticias financieras y análisis de empresas cotizadas."),

  /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2 mb-8"
  }, SECCIONES_BLOG.map(s => /*#__PURE__*/React.createElement("button", {
    key: s.key,
    onClick: () => setTab(s.key),
    className: "px-4 py-2 rounded-full text-xs font-bold border",
    style: {
      borderColor: tab === s.key ? C.sand : C.border,
      backgroundColor: tab === s.key ? C.sand : C.paper,
      color: tab === s.key ? C.white : C.ink
    }
  }, s.label))),

  esAdmin && /*#__PURE__*/React.createElement("div", {
    className: "mb-8 p-4 rounded-2xl border",
    style: { borderColor: C.border, backgroundColor: C.paper }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-bold",
    style: { color: C.muted }
  }, "Sesión de administrador — puedes escribir artículos"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setEditando({
      title: '', slug: '', excerpt: '', content: '', category: '',
      author: '', cover_emoji: '📊', published: false,
      categoria_seccion: tab, fase: 1
    }),
    className: "text-xs font-bold px-3 py-1.5 rounded-lg",
    style: { backgroundColor: C.sand, color: C.white }
  }, "+ Nuevo artículo"))),

  editando && /*#__PURE__*/React.createElement("form", {
    onSubmit: guardar,
    className: "mb-10 p-5 rounded-2xl border space-y-3",
    style: { borderColor: C.border, backgroundColor: C.surface }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "font-serif font-bold",
    style: { color: C.ink }
  }, editando.id ? 'Editar artículo' : 'Nuevo artículo'),
  /*#__PURE__*/React.createElement("input", {
    name: "title", defaultValue: editando.title, placeholder: "Título", required: true,
    className: "w-full border rounded-lg px-3 py-2 text-sm", style: { borderColor: C.border }
  }),
  /*#__PURE__*/React.createElement("input", {
    name: "slug", defaultValue: editando.slug, placeholder: "url-del-articulo (opcional, se genera solo)",
    className: "w-full border rounded-lg px-3 py-2 text-sm", style: { borderColor: C.border }
  }),
  /*#__PURE__*/React.createElement("div", { className: "grid grid-cols-2 gap-3" },
    /*#__PURE__*/React.createElement("select", {
      name: "categoria_seccion", defaultValue: editando.categoria_seccion || tab,
      className: "border rounded-lg px-3 py-2 text-sm", style: { borderColor: C.border }
    }, SECCIONES_BLOG.map(s => /*#__PURE__*/React.createElement("option", { key: s.key, value: s.key }, s.label))),
    /*#__PURE__*/React.createElement("select", {
      name: "fase", defaultValue: editando.fase || 1,
      className: "border rounded-lg px-3 py-2 text-sm", style: { borderColor: C.border }
    }, [1, 2, 3, 4, 5].map(n => /*#__PURE__*/React.createElement("option", { key: n, value: n }, NOMBRES_FASE_BLOG[n])))
  ),
  /*#__PURE__*/React.createElement("p", {
    className: "text-[11px]", style: { color: C.mutedLight }
  }, "El selector de Fase solo se usa si arriba eliges \"Guía de educación financiera\"."),
  /*#__PURE__*/React.createElement("div", { className: "grid grid-cols-2 gap-3" },
    /*#__PURE__*/React.createElement("input", {
      name: "category", defaultValue: editando.category, placeholder: "Etiqueta (opcional)",
      className: "border rounded-lg px-3 py-2 text-sm", style: { borderColor: C.border }
    }),
    /*#__PURE__*/React.createElement("input", {
      name: "cover_emoji", defaultValue: editando.cover_emoji, placeholder: "Emoji",
      className: "border rounded-lg px-3 py-2 text-sm", style: { borderColor: C.border }
    })
  ),
  /*#__PURE__*/React.createElement("input", {
    name: "author", defaultValue: editando.author, placeholder: "Autor",
    className: "w-full border rounded-lg px-3 py-2 text-sm", style: { borderColor: C.border }
  }),
  /*#__PURE__*/React.createElement("textarea", {
    name: "excerpt", defaultValue: editando.excerpt, placeholder: "Resumen corto", rows: "2",
    className: "w-full border rounded-lg px-3 py-2 text-sm", style: { borderColor: C.border }
  }),
  /*#__PURE__*/React.createElement("textarea", {
    name: "content", defaultValue: editando.content,
    placeholder: "Contenido — usa ## para subtítulos y líneas normales para párrafos", rows: "12",
    className: "w-full border rounded-lg px-3 py-2 text-sm font-mono", style: { borderColor: C.border }
  }),
  /*#__PURE__*/React.createElement("label", {
    className: "flex items-center gap-2 text-sm", style: { color: C.ink }
  }, /*#__PURE__*/React.createElement("input", { type: "checkbox", name: "published", defaultChecked: editando.published }), " Publicado"),
  /*#__PURE__*/React.createElement("div", { className: "flex gap-2" },
    /*#__PURE__*/React.createElement("button", {
      className: "text-xs font-bold px-4 py-2 rounded-lg", style: { backgroundColor: C.sand, color: C.white }
    }, "Guardar"),
    /*#__PURE__*/React.createElement("button", {
      type: "button", onClick: () => setEditando(null),
      className: "text-xs font-bold px-4 py-2 rounded-lg", style: { backgroundColor: C.sandLight, color: C.navy }
    }, "Cancelar")
  )),

  cargando ? /*#__PURE__*/React.createElement("p", {
    className: "text-sm", style: { color: C.muted }
  }, "Cargando artículos…") :

  tab === 'guia' ?
    /*#__PURE__*/React.createElement("div", null, [1, 2, 3, 4, 5].map(n => /*#__PURE__*/React.createElement(AcordeonFase, {
      key: n,
      numero: n,
      titulo: NOMBRES_FASE_BLOG[n],
      posts: postsTab.filter(p => Number(p.fase) === n),
abiertoPorDefecto: faseAbierta === n,
onAbrir: () => setFaseAbierta(faseAbierta === n ? null : n),
esAdmin: esAdmin,
onEditar: p => setEditando(p),
onBorrar: id => borrar(id),
      onMover: (p, direccion) => moverPost(p, direccion)
})))
  :
    postsTab.length === 0 ?
      /*#__PURE__*/React.createElement("p", {
        className: "text-sm", style: { color: C.muted }
      }, esAdmin ? 'Aún no has publicado ningún artículo aquí. Crea el primero.' : 'Muy pronto publicaremos aquí nuevos artículos.')
    :
      /*#__PURE__*/React.createElement("div", { className: "space-y-4" }, postsTab.map(p => /*#__PURE__*/React.createElement("div", {
        key: p.id,
        className: "border rounded-2xl p-5",
        style: { borderColor: C.border, backgroundColor: C.surface }
      }, /*#__PURE__*/React.createElement("div", { className: "flex items-start gap-4" },
        /*#__PURE__*/React.createElement("div", { className: "text-3xl" }, p.cover_emoji || '📊'),
        /*#__PURE__*/React.createElement("div", { className: "flex-1" },
          /*#__PURE__*/React.createElement("div", {
            className: "text-xs font-bold uppercase mb-1", style: { color: C.mej }
          }, p.category || 'General', !p.published && ' · Borrador'),
          /*#__PURE__*/React.createElement("button", {
            onClick: () => setSlugAbierto(p.slug),
            className: "font-serif font-bold text-lg text-left", style: { color: C.ink }
          }, p.title),
          /*#__PURE__*/React.createElement("p", { className: "text-sm mt-1", style: { color: C.muted } }, p.excerpt),
          /*#__PURE__*/React.createElement("div", {
            className: "text-xs mt-2", style: { color: C.mutedLight }
          }, p.author || 'Equipo MoneyPilot', " · ", fmtFecha(p.created_at)),
          esAdmin && /*#__PURE__*/React.createElement("div", { className: "mt-2 flex gap-3" },
            /*#__PURE__*/React.createElement("button", {
              onClick: () => setEditando(p), className: "text-xs font-bold", style: { color: C.sand }
            }, "Editar"),
            /*#__PURE__*/React.createElement("button", {
              onClick: () => borrar(p.id), className: "text-xs font-bold", style: { color: C.crit }
            }, "Borrar")
          )
        )
      )))));
}

export function PaginaLegal({
  titulo,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "max-w-2xl mx-auto px-4 sm:px-6 py-12",
    style: {
      color: C.ink,
      lineHeight: 1.75
    }
  }, /*#__PURE__*/React.createElement("h1", {
    className: "font-serif text-2xl font-bold mb-1"
  }, titulo), /*#__PURE__*/React.createElement("p", {
    className: "text-xs mb-6",
    style: {
      color: C.mutedLight
    }
  }, "Última actualización: 1 de septiembre de 2026"), /*#__PURE__*/React.createElement("div", {
    className: "text-sm space-y-4"
  }, children));
}

export function Contacto() {
  const [nombre, setNombre] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const enviar = e => {
    e.preventDefault();
    const cuerpo = `Nombre: ${nombre}\n\n${mensaje}`;
    const url = `mailto:soportemoneypilot@gmail.com?subject=${encodeURIComponent(asunto || "Contacto desde MoneyPilot")}&body=${encodeURIComponent(cuerpo)}`;
    window.location.href = url;
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "max-w-2xl mx-auto px-4 sm:px-6 py-12"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Estamos para ayudarte"), /*#__PURE__*/React.createElement("h1", {
    className: "font-serif text-3xl sm:text-4xl font-bold mb-3",
    style: {
      color: C.ink
    }
  }, "Contacta con nosotros"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm sm:text-base mb-6",
    style: {
      color: C.muted
    }
  }, "¿Tienes dudas sobre algún concepto financiero, quieres comentarnos algo sobre tus objetivos o simplemente hablar con alguien sobre cómo usar mejor la herramienta? Escríbenos y te respondemos personalmente."), /*#__PURE__*/React.createElement("div", {
    className: "mb-6 p-4 rounded-2xl text-sm",
    style: {
      backgroundColor: C.sandLight,
      color: C.navy
    }
  }, /*#__PURE__*/React.createElement("b", null, "Antes de escribirnos, un aviso importante:"), " no somos asesores financieros y no ofrecemos asesoramiento de inversión personalizado. Podemos ayudarte a entender conceptos, resolver dudas sobre cómo usar MoneyPilot, o darte una orientación general — pero cualquier decisión financiera concreta (qué invertir, cuánto arriesgar, etc.) debe tomarla cada persona valorando su propia situación, y si es una decisión importante, lo recomendable es consultar con un profesional cualificado y colegiado."), /*#__PURE__*/React.createElement("form", {
    onSubmit: enviar,
    className: "space-y-3 p-5 rounded-2xl border",
    style: {
      borderColor: C.border,
      backgroundColor: C.surface
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold mb-1",
    style: {
      color: C.ink
    }
  }, "Tu nombre"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    value: nombre,
    onChange: e => setNombre(e.target.value),
    className: "w-full rounded-lg px-3 py-2 text-sm border outline-none",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold mb-1",
    style: {
      color: C.ink
    }
  }, "Asunto"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Ej: Duda sobre el fondo de emergencia",
    value: asunto,
    onChange: e => setAsunto(e.target.value),
    className: "w-full rounded-lg px-3 py-2 text-sm border outline-none",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold mb-1",
    style: {
      color: C.ink
    }
  }, "Tu mensaje"), /*#__PURE__*/React.createElement("textarea", {
    required: true,
    rows: "6",
    value: mensaje,
    onChange: e => setMensaje(e.target.value),
    placeholder: "Cuéntanos qué necesitas, tu duda o tu objetivo…",
    className: "w-full rounded-lg px-3 py-2 text-sm border outline-none",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "w-full py-2.5 rounded-lg text-sm font-bold",
    style: {
      backgroundColor: C.navy,
      color: C.white
    }
  }, "Enviar mensaje"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-center",
    style: {
      color: C.mutedLight
    }
  }, "Esto abrirá tu programa de correo con el mensaje ya redactado. También puedes escribirnos directamente a ", /*#__PURE__*/React.createElement("a", {
    href: "mailto:soportemoneypilot@gmail.com",
    style: {
      color: C.sand,
      textDecoration: "underline"
    }
  }, "soportemoneypilot@gmail.com"), ".")));
}

export function Cuentas({
  cuentas,
  onAgregar,
  onActualizar,
  onEliminar
}) {
  const [editando, setEditando] = useState(null);
  const [borrador, setBorrador] = useState(null);
  const totalLiquidez = cuentas.reduce((s, c) => s + (Number(c.saldo) || 0), 0);
  const abrirNueva = () => {
    setEditando(null);
    setBorrador({
      banco: "",
      tipo: "Corriente",
      nombre: "",
      saldo: 0,
      moneda: "EUR"
    });
  };
  const abrirEditar = c => {
    setEditando(c.id);
    setBorrador({
      ...c
    });
  };
  const guardar = () => {
    if (!borrador || !borrador.banco.trim() || !borrador.nombre.trim()) return;
    if (editando) {
      onActualizar(editando, borrador);
    } else {
      onAgregar(borrador);
    }
    setEditando(null);
    setBorrador(null);
  };
  const cancelar = () => {
    setEditando(null);
    setBorrador(null);
  };
  const porBanco = useMemo(() => {
    const grupos = {};
    cuentas.forEach(c => {
      const key = c.banco || "Sin banco";
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(c);
    });
    return grupos;
  }, [cuentas]);
  return /*#__PURE__*/React.createElement("section", {
    className: "py-16 sm:py-24 section-tinted"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-4xl mx-auto px-4 sm:px-6 space-y-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-3xl section-intro"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Tu liquidez"), /*#__PURE__*/React.createElement("h2", {
    className: "font-serif text-3xl sm:text-4xl font-bold mt-2",
    style: {
      color: C.ink
    }
  }, "Tus cuentas, en un solo sitio"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm sm:text-base mt-3",
    style: {
      color: C.muted
    }
  }, "Añade tus cuentas bancarias manualmente para ver tu liquidez total consolidada. No conectamos con tu banco: tú decides qué saldo introducir y cuándo actualizarlo.")), /*#__PURE__*/React.createElement(Card, {
    className: "p-5 flex items-center justify-between gap-4 flex-wrap"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Liquidez total"), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-3xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, euros(totalLiquidez))), /*#__PURE__*/React.createElement("button", {
    onClick: abrirNueva,
    className: "inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold",
    style: {
      backgroundColor: C.sand,
      color: C.navy
    }
  }, /*#__PURE__*/React.createElement(I.plus, {
    size: 15
  }), " Añadir cuenta")), borrador && /*#__PURE__*/React.createElement(Card, {
    className: "p-5",
    style: {
      borderColor: C.sand
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-bold mb-3",
    style: {
      color: C.ink
    }
  }, editando ? "Editar cuenta" : "Nueva cuenta"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold mb-1.5",
    style: {
      color: C.ink
    }
  }, "Banco"), /*#__PURE__*/React.createElement("input", {
    value: borrador.banco,
    onChange: e => setBorrador({
      ...borrador,
      banco: e.target.value
    }),
    placeholder: "Ej. CaixaBank",
    className: "w-full rounded-lg px-3 py-2 text-sm font-bold border outline-none",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold mb-1.5",
    style: {
      color: C.ink
    }
  }, "Tipo de cuenta"), /*#__PURE__*/React.createElement("select", {
    value: borrador.tipo,
    onChange: e => setBorrador({
      ...borrador,
      tipo: e.target.value
    }),
    className: "w-full rounded-lg px-3 py-2 text-sm font-bold border outline-none",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  }, CUENTA_TIPOS_DEF.map(t => /*#__PURE__*/React.createElement("option", {
    key: t,
    value: t
  }, t)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold mb-1.5",
    style: {
      color: C.ink
    }
  }, "Nombre de la cuenta"), /*#__PURE__*/React.createElement("input", {
    value: borrador.nombre,
    onChange: e => setBorrador({
      ...borrador,
      nombre: e.target.value
    }),
    placeholder: "Ej. Cuenta nómina",
    className: "w-full rounded-lg px-3 py-2 text-sm font-bold border outline-none",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  })), /*#__PURE__*/React.createElement(NumberField, {
    label: "Saldo actual",
    value: borrador.saldo,
    onChange: v => setBorrador({
      ...borrador,
      saldo: v
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 mt-4"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: guardar,
    className: "px-4 py-2 rounded-lg text-xs font-bold",
    style: {
      backgroundColor: C.sand,
      color: C.navy
    }
  }, "Guardar cuenta"), /*#__PURE__*/React.createElement("button", {
    onClick: cancelar,
    className: "px-4 py-2 rounded-lg text-xs font-bold border",
    style: {
      borderColor: C.border,
      color: C.ink
    }
  }, "Cancelar"))), cuentas.length === 0 && !borrador && /*#__PURE__*/React.createElement(Card, {
    className: "p-8 text-center"
  }, /*#__PURE__*/React.createElement(I.wallet, {
    size: 28,
    className: "mx-auto mb-3",
    color: C.muted
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-bold",
    style: {
      color: C.ink
    }
  }, "Todavía no has añadido ninguna cuenta"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1",
    style: {
      color: C.muted
    }
  }, "Añade tu primera cuenta para empezar a ver tu liquidez consolidada."), /*#__PURE__*/React.createElement("button", {
    onClick: abrirNueva,
    className: "mt-4 px-4 py-2 rounded-lg text-xs font-bold",
    style: {
      backgroundColor: C.sand,
      color: C.navy
    }
  }, "Añadir mi primera cuenta")), Object.keys(porBanco).map(banco => /*#__PURE__*/React.createElement(Card, {
    key: banco,
    className: "p-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-serif font-bold text-base",
    style: {
      color: C.ink
    }
  }, banco), /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-bold",
    style: {
      color: C.salu
    }
  }, euros(porBanco[banco].reduce((s, c) => s + (Number(c.saldo) || 0), 0)))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, porBanco[banco].map(c => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    className: "flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5",
    style: {
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "min-w-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-bold truncate",
    style: {
      color: C.ink
    }
  }, c.nombre || "Sin nombre"), /*#__PURE__*/React.createElement("div", {
    className: "text-xs",
    style: {
      color: C.muted
    }
  }, c.tipo)), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 shrink-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-bold",
    style: {
      color: C.ink
    }
  }, euros(c.saldo)), /*#__PURE__*/React.createElement("button", {
    onClick: () => abrirEditar(c),
    style: {
      color: C.navy
    },
    "aria-label": "Editar cuenta"
  }, /*#__PURE__*/React.createElement(I.edit, {
    size: 15
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => onEliminar(c.id),
    style: {
      color: C.crit
    },
    "aria-label": "Eliminar cuenta"
  }, /*#__PURE__*/React.createElement(I.trash, {
    size: 15
  }))))))))));
}

export function Inversiones({
  inversiones,
  onAgregar,
  onActualizar,
  onEliminar
}) {
  const [editando, setEditando] = useState(null);
  const [borrador, setBorrador] = useState(null);
  const totalInvertido = inversiones.reduce((s, inv) => s + (Number(inv.valorActual) || 0), 0);
  const totalAportadoGlobal = inversiones.reduce((s, inv) => s + (Number(inv.totalAportado) || 0), 0);
  const rentabilidadGlobal = totalAportadoGlobal > 0 ? totalInvertido - totalAportadoGlobal : null;
  const abrirNueva = () => {
    setEditando(null);
    setBorrador({
      tipo: "Acciones",
      nombre: "",
      entidad: "",
      ticker: "",
      valorActual: 0,
      totalAportado: null,
      moneda: "EUR"
    });
  };
  const abrirEditar = inv => {
    setEditando(inv.id);
    setBorrador({
      ...inv
    });
  };
  const guardar = () => {
    if (!borrador || !borrador.nombre.trim()) return;
    if (editando) {
      onActualizar(editando, borrador);
    } else {
      onAgregar(borrador);
    }
    setEditando(null);
    setBorrador(null);
  };
  const cancelar = () => {
    setEditando(null);
    setBorrador(null);
  };
  const porTipo = useMemo(() => {
    const grupos = {};
    inversiones.forEach(inv => {
      const key = inv.tipo || "Otro";
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(inv);
    });
    return grupos;
  }, [inversiones]);
  const el = React.createElement;
  const filasPorTipo = Object.keys(porTipo).map(tipo => {
    const items = porTipo[tipo];
    const subtotal = items.reduce((s, inv) => s + (Number(inv.valorActual) || 0), 0);
    const filas = items.map(inv => {
      const rentabilidad = inv.totalAportado > 0 ? (Number(inv.valorActual) || 0) - Number(inv.totalAportado) : null;
      const detalle = [inv.ticker, inv.entidad].filter(Boolean).join(" · ") || "Sin más detalles";
      const columnaValor = el("div", {
        className: "text-right"
      }, el("div", {
        className: "text-sm font-bold",
        style: { color: C.ink }
      }, euros(inv.valorActual)), rentabilidad != null ? el("div", {
        className: "text-xs font-bold",
        style: { color: rentabilidad >= 0 ? C.salu : C.crit }
      }, (rentabilidad >= 0 ? "+" : "") + euros(rentabilidad)) : null);
      const botonEditar = el("button", {
        onClick: () => abrirEditar(inv),
        style: { color: C.navy },
        "aria-label": "Editar inversión"
      }, el(I.edit, { size: 15 }));
      const botonBorrar = el("button", {
        onClick: () => onEliminar(inv.id),
        style: { color: C.crit },
        "aria-label": "Eliminar inversión"
      }, el(I.trash, { size: 15 }));
      return el("div", {
        key: inv.id,
        className: "flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5",
        style: { backgroundColor: C.paper }
      }, el("div", {
        className: "min-w-0"
      }, el("div", {
        className: "text-sm font-bold truncate",
        style: { color: C.ink }
      }, inv.nombre || "Sin nombre"), el("div", {
        className: "text-xs",
        style: { color: C.muted }
      }, detalle)), el("div", {
        className: "flex items-center gap-3 shrink-0"
      }, columnaValor, botonEditar, botonBorrar));
    });
    return el(Card, {
      key: tipo,
      className: "p-5"
    }, el("div", {
      className: "flex items-center justify-between mb-3"
    }, el("div", {
      className: "font-serif font-bold text-base",
      style: { color: C.ink }
    }, tipo), el("div", {
      className: "text-sm font-bold",
      style: { color: C.salu }
    }, euros(subtotal))), el("div", {
      className: "space-y-2"
    }, filas));
  });
  const introDiv = el("div", {
    className: "max-w-3xl section-intro"
  }, el(Eyebrow, null, "Tu cartera"), el("h2", {
    className: "font-serif text-3xl sm:text-4xl font-bold mt-2",
    style: { color: C.ink }
  }, "Tus inversiones, en un solo sitio"), el("p", {
    className: "text-sm sm:text-base mt-3",
    style: { color: C.muted }
  }, "Añade manualmente tus acciones, fondos, ETFs, pensiones o cripto para ver el valor total de tu cartera. Los precios no se actualizan solos: tú decides cuándo revisar y actualizar el valor."));
  const resumenCard = el(Card, {
    className: "p-5 flex items-center justify-between gap-4 flex-wrap"
  }, el("div", {
    className: "flex flex-wrap gap-8"
  }, el("div", null, el(Eyebrow, null, "Valor total de la cartera"), el("div", {
    className: "font-serif text-3xl font-bold mt-1",
    style: { color: C.ink }
  }, euros(totalInvertido))), rentabilidadGlobal != null ? el("div", null, el(Eyebrow, null, "Rentabilidad estimada"), el("div", {
    className: "font-serif text-3xl font-bold mt-1",
    style: { color: rentabilidadGlobal >= 0 ? C.salu : C.crit }
  }, (rentabilidadGlobal >= 0 ? "+" : "") + euros(rentabilidadGlobal))) : null), el("button", {
    onClick: abrirNueva,
    className: "inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold",
    style: { backgroundColor: C.sand, color: C.navy }
  }, el(I.plus, { size: 15 }), " Añadir inversión"));
  const formularioCard = !borrador ? null : el(Card, {
    className: "p-5",
    style: { borderColor: C.sand }
  }, el("div", {
    className: "text-sm font-bold mb-3",
    style: { color: C.ink }
  }, editando ? "Editar inversión" : "Nueva inversión"), el("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-3"
  }, el("div", null, el("label", {
    className: "block text-xs font-bold mb-1.5",
    style: { color: C.ink }
  }, "Tipo"), el("select", {
    value: borrador.tipo,
    onChange: e => setBorrador({ ...borrador, tipo: e.target.value }),
    className: "w-full rounded-lg px-3 py-2 text-sm font-bold border outline-none",
    style: { borderColor: C.border, color: C.ink, backgroundColor: C.paper }
  }, TIPOS_INVERSION_DEF.map(t => el("option", { key: t, value: t }, t)))), el("div", null, el("label", {
    className: "block text-xs font-bold mb-1.5",
    style: { color: C.ink }
  }, "Nombre"), el("input", {
    value: borrador.nombre,
    onChange: e => setBorrador({ ...borrador, nombre: e.target.value }),
    placeholder: "Ej. MSCI World, Apple, Bitcoin...",
    className: "w-full rounded-lg px-3 py-2 text-sm font-bold border outline-none",
    style: { borderColor: C.border, color: C.ink, backgroundColor: C.paper }
  })), el(NumberField, {
    label: "Valor actual",
    value: borrador.valorActual,
    onChange: v => setBorrador({ ...borrador, valorActual: v })
  }), el(NumberField, {
    label: "Total aportado (opcional)",
    value: borrador.totalAportado || 0,
    onChange: v => setBorrador({ ...borrador, totalAportado: v || null }),
    hint: "Para calcular la rentabilidad, cuánto has invertido en total."
  }), el("div", null, el("label", {
    className: "block text-xs font-bold mb-1.5",
    style: { color: C.ink }
  }, "Ticker (opcional)"), el("input", {
    value: borrador.ticker || "",
    onChange: e => setBorrador({ ...borrador, ticker: e.target.value }),
    placeholder: "Ej. AAPL, VWCE",
    className: "w-full rounded-lg px-3 py-2 text-sm font-bold border outline-none",
    style: { borderColor: C.border, color: C.ink, backgroundColor: C.paper }
  })), el("div", null, el("label", {
    className: "block text-xs font-bold mb-1.5",
    style: { color: C.ink }
  }, "Broker / entidad (opcional)"), el("input", {
    value: borrador.entidad || "",
    onChange: e => setBorrador({ ...borrador, entidad: e.target.value }),
    placeholder: "Ej. Trade Republic, MyInvestor",
    className: "w-full rounded-lg px-3 py-2 text-sm font-bold border outline-none",
    style: { borderColor: C.border, color: C.ink, backgroundColor: C.paper }
  }))), el("div", {
    className: "flex gap-2 mt-4"
  }, el("button", {
    onClick: guardar,
    className: "px-4 py-2 rounded-lg text-xs font-bold",
    style: { backgroundColor: C.sand, color: C.navy }
  }, "Guardar inversión"), el("button", {
    onClick: cancelar,
    className: "px-4 py-2 rounded-lg text-xs font-bold border",
    style: { borderColor: C.border, color: C.ink }
  }, "Cancelar")));
  const estadoVacioCard = inversiones.length > 0 || borrador ? null : el(Card, {
    className: "p-8 text-center"
  }, el(I.chartPie, {
    size: 28,
    className: "mx-auto mb-3",
    color: C.muted
  }), el("p", {
    className: "text-sm font-bold",
    style: { color: C.ink }
  }, "Todavía no has añadido ninguna inversión"), el("p", {
    className: "text-sm mt-1",
    style: { color: C.muted }
  }, "Añade tu primera inversión para ver el valor total de tu cartera."), el("button", {
    onClick: abrirNueva,
    className: "mt-4 px-4 py-2 rounded-lg text-xs font-bold",
    style: { backgroundColor: C.sand, color: C.navy }
  }, "Añadir mi primera inversión"));
  const notaFinal = el("p", {
    className: "text-[11px] readable-note"
  }, "Contenido informativo. Los valores que introduces son responsabilidad tuya; MoneyPilot no verifica precios de mercado ni ofrece asesoramiento de inversión.");
  return el("section", {
    className: "py-16 sm:py-24 section-tinted"
  }, el("div", {
    className: "max-w-4xl mx-auto px-4 sm:px-6 space-y-6"
  }, introDiv, resumenCard, formularioCard, estadoVacioCard, filasPorTipo, notaFinal));
}

export function Patrimonio({
  cuentas,
  inversiones,
  activos,
  deudas,
  onAgregarActivo,
  onActualizarActivo,
  onEliminarActivo,
  onIrACuentas,
  onIrAInversiones,
  onIrADiagnostico
}) {
  const el = React.createElement;
  const [editando, setEditando] = useState(null);
  const [borrador, setBorrador] = useState(null);

  const totalCuentas = cuentas.reduce((s, c) => s + (Number(c.saldo) || 0), 0);
  const totalInversiones = inversiones.reduce((s, inv) => s + (Number(inv.valorActual) || 0), 0);
  const totalActivos = activos.reduce((s, a) => s + (Number(a.valorActual) || 0), 0);
  const deudasActivas = (deudas || []).filter(d => Number(d.pendiente) > 0);
  const totalDeudas = deudasActivas.reduce((s, d) => s + Number(d.pendiente || 0), 0);
  const totalActivosGeneral = totalCuentas + totalInversiones + totalActivos;
  const patrimonioNeto = totalActivosGeneral - totalDeudas;

  const abrirNuevoActivo = () => {
    setEditando(null);
    setBorrador({ tipo: "Vivienda", nombre: "", valorActual: 0, notas: "" });
  };
  const abrirEditarActivo = a => {
    setEditando(a.id);
    setBorrador({ ...a });
  };
  const guardarActivo = () => {
    if (!borrador || !borrador.nombre.trim()) return;
    if (editando) onActualizarActivo(editando, borrador);
    else onAgregarActivo(borrador);
    setEditando(null);
    setBorrador(null);
  };
  const cancelarActivo = () => {
    setEditando(null);
    setBorrador(null);
  };

  const donutData = [
    { name: "Liquidez (cuentas)", value: totalCuentas, color: C.exc },
    { name: "Inversiones", value: totalInversiones, color: C.sand },
    { name: "Otros activos", value: totalActivos, color: C.mej }
  ].filter(d => d.value > 0);

  const cabecera = el("div", {
    className: "max-w-3xl section-intro"
  }, el(Eyebrow, null, "Tu foto completa"), el("h2", {
    className: "font-serif text-3xl sm:text-4xl font-bold mt-2",
    style: { color: C.ink }
  }, "Tu patrimonio neto"), el("p", {
    className: "text-sm sm:text-base mt-3",
    style: { color: C.muted }
  }, "Todo lo que tienes (cuentas, inversiones y otros bienes) menos todo lo que debes. Se actualiza automáticamente según lo que registres en Cuentas, Inversiones, Deudas y aquí abajo."));

  const filaResumen = (etiqueta, valor, color) => el("div", {
    key: etiqueta,
    className: "flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5",
    style: { backgroundColor: C.paper }
  }, el("span", {
    className: "text-sm font-bold",
    style: { color: C.ink }
  }, etiqueta), el("span", {
    className: "text-sm font-bold",
    style: { color: color || C.ink }
  }, euros(valor)));

  const tarjetaResumen = el(Card, {
    className: "p-6"
  }, el("div", {
    className: "flex flex-col sm:flex-row items-center gap-6"
  }, donutData.length > 0 ? el(SimpleDonut, {
    data: donutData,
    size: 160,
    thickness: 22,
    formatCentro: v => euros(v)
  }) : el("div", {
    className: "w-40 h-40 rounded-full flex items-center justify-center text-center text-xs px-4",
    style: { backgroundColor: C.bgDeepMid, color: C.muted }
  }, "Añade cuentas, inversiones u otros activos para ver el reparto"), el("div", {
    className: "flex-1 w-full"
  }, el(Eyebrow, null, "Patrimonio neto"), el("div", {
    className: "font-serif text-4xl font-bold mt-1",
    style: { color: patrimonioNeto >= 0 ? C.ink : C.crit }
  }, euros(patrimonioNeto)), el("div", {
    className: "space-y-2 mt-4"
  }, filaResumen("Total en cuentas (liquidez)", totalCuentas, C.exc), filaResumen("Total en inversiones", totalInversiones, C.sand), filaResumen("Total en otros activos", totalActivos, C.mej), filaResumen("Total en deudas pendientes", -totalDeudas, C.crit)))));

  const seccionCuentas = el(Card, {
    className: "p-5"
  }, el("div", {
    className: "flex items-center justify-between gap-3"
  }, el("div", null, el(Eyebrow, null, "Liquidez"), el("div", {
    className: "font-serif text-lg font-bold mt-1",
    style: { color: C.ink }
  }, euros(totalCuentas))), el("button", {
    onClick: onIrACuentas,
    className: "text-xs font-bold px-3 py-2 rounded-lg border",
    style: { borderColor: C.border, color: C.navy }
  }, "Gestionar cuentas")), el("p", {
    className: "text-xs mt-2",
    style: { color: C.muted }
  }, cuentas.length === 0 ? "Todavía no has añadido ninguna cuenta." : `${cuentas.length} cuenta(s) registrada(s).`));

  const seccionInversiones = el(Card, {
    className: "p-5"
  }, el("div", {
    className: "flex items-center justify-between gap-3"
  }, el("div", null, el(Eyebrow, null, "Inversiones"), el("div", {
    className: "font-serif text-lg font-bold mt-1",
    style: { color: C.ink }
  }, euros(totalInversiones))), el("button", {
    onClick: onIrAInversiones,
    className: "text-xs font-bold px-3 py-2 rounded-lg border",
    style: { borderColor: C.border, color: C.navy }
  }, "Gestionar inversiones")), el("p", {
    className: "text-xs mt-2",
    style: { color: C.muted }
  }, inversiones.length === 0 ? "Todavía no has añadido ninguna inversión." : `${inversiones.length} inversión(es) registrada(s).`));

  const seccionDeudas = el(Card, {
    className: "p-5"
  }, el("div", {
    className: "flex items-center justify-between gap-3"
  }, el("div", null, el(Eyebrow, null, "Deudas"), el("div", {
    className: "font-serif text-lg font-bold mt-1",
    style: { color: totalDeudas > 0 ? C.crit : C.ink }
  }, euros(totalDeudas))), el("button", {
    onClick: onIrADiagnostico,
    className: "text-xs font-bold px-3 py-2 rounded-lg border",
    style: { borderColor: C.border, color: C.navy }
  }, "Gestionar deudas")), el("p", {
    className: "text-xs mt-2",
    style: { color: C.muted }
  }, deudasActivas.length === 0 ? "No tienes deudas pendientes registradas." : `${deudasActivas.length} deuda(s) activa(s).`));

  const iconoPorTipoActivo = tipo => tipo === "Vivienda" ? I.house : tipo === "Vehículo" ? I.car : I.landmark;

  const formularioActivo = !borrador ? null : el(Card, {
    className: "p-5",
    style: { borderColor: C.sand }
  }, el("div", {
    className: "text-sm font-bold mb-3",
    style: { color: C.ink }
  }, editando ? "Editar activo" : "Nuevo activo"), el("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-3"
  }, el("div", null, el("label", {
    className: "block text-xs font-bold mb-1.5",
    style: { color: C.ink }
  }, "Tipo"), el("select", {
    value: borrador.tipo,
    onChange: e => setBorrador({ ...borrador, tipo: e.target.value }),
    className: "w-full rounded-lg px-3 py-2 text-sm font-bold border outline-none",
    style: { borderColor: C.border, color: C.ink, backgroundColor: C.paper }
  }, TIPOS_ACTIVO_DEF.map(t => el("option", { key: t, value: t }, t)))), el("div", null, el("label", {
    className: "block text-xs font-bold mb-1.5",
    style: { color: C.ink }
  }, "Nombre"), el("input", {
    value: borrador.nombre,
    onChange: e => setBorrador({ ...borrador, nombre: e.target.value }),
    placeholder: "Ej. Piso habitual, Coche familiar...",
    className: "w-full rounded-lg px-3 py-2 text-sm font-bold border outline-none",
    style: { borderColor: C.border, color: C.ink, backgroundColor: C.paper }
  })), el(NumberField, {
    label: "Valor estimado actual",
    value: borrador.valorActual,
    onChange: v => setBorrador({ ...borrador, valorActual: v })
  }), el("div", null, el("label", {
    className: "block text-xs font-bold mb-1.5",
    style: { color: C.ink }
  }, "Notas (opcional)"), el("input", {
    value: borrador.notas || "",
    onChange: e => setBorrador({ ...borrador, notas: e.target.value }),
    placeholder: "Ej. Tasación de 2024",
    className: "w-full rounded-lg px-3 py-2 text-sm font-bold border outline-none",
    style: { borderColor: C.border, color: C.ink, backgroundColor: C.paper }
  }))), el("div", {
    className: "flex gap-2 mt-4"
  }, el("button", {
    onClick: guardarActivo,
    className: "px-4 py-2 rounded-lg text-xs font-bold",
    style: { backgroundColor: C.sand, color: C.navy }
  }, "Guardar activo"), el("button", {
    onClick: cancelarActivo,
    className: "px-4 py-2 rounded-lg text-xs font-bold border",
    style: { borderColor: C.border, color: C.ink }
  }, "Cancelar")));

  const filasActivos = activos.map(a => {
    const Icono = iconoPorTipoActivo(a.tipo);
    return el("div", {
      key: a.id,
      className: "flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5",
      style: { backgroundColor: C.paper }
    }, el("div", {
      className: "flex items-center gap-3 min-w-0"
    }, el("div", {
      className: "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
      style: { backgroundColor: C.mejLight }
    }, el(Icono, { size: 15, color: C.mej })), el("div", {
      className: "min-w-0"
    }, el("div", {
      className: "text-sm font-bold truncate",
      style: { color: C.ink }
    }, a.nombre || "Sin nombre"), el("div", {
      className: "text-xs",
      style: { color: C.muted }
    }, a.tipo))), el("div", {
      className: "flex items-center gap-3 shrink-0"
    }, el("div", {
      className: "text-sm font-bold",
      style: { color: C.ink }
    }, euros(a.valorActual)), el("button", {
      onClick: () => abrirEditarActivo(a),
      style: { color: C.navy },
      "aria-label": "Editar activo"
    }, el(I.edit, { size: 15 })), el("button", {
      onClick: () => onEliminarActivo(a.id),
      style: { color: C.crit },
      "aria-label": "Eliminar activo"
    }, el(I.trash, { size: 15 }))));
  });

  const seccionActivos = el(Card, {
    className: "p-5"
  }, el("div", {
    className: "flex items-center justify-between gap-3 mb-3"
  }, el("div", null, el(Eyebrow, null, "Otros activos"), el("p", {
    className: "text-xs mt-1",
    style: { color: C.muted }
  }, "Vivienda, vehículo u otros bienes de valor, estimados por ti.")), el("button", {
    onClick: abrirNuevoActivo,
    className: "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold",
    style: { backgroundColor: C.sand, color: C.navy }
  }, el(I.plus, { size: 14 }), " Añadir activo")), activos.length === 0 && !borrador ? el("p", {
    className: "text-sm",
    style: { color: C.muted }
  }, "Todavía no has añadido ningún otro activo.") : el("div", {
    className: "space-y-2"
  }, filasActivos));

  const notaFinal = el("p", {
    className: "text-[11px] readable-note"
  }, "Contenido informativo. Los valores de tus cuentas, inversiones y otros activos son los que tú introduces; MoneyPilot no verifica precios de mercado, tasaciones ni saldos reales.");

  return el("section", {
    className: "py-16 sm:py-24 section-tinted"
  }, el("div", {
    className: "max-w-4xl mx-auto px-4 sm:px-6 space-y-6"
  }, cabecera, tarjetaResumen, el("div", {
    className: "grid grid-cols-1 sm:grid-cols-3 gap-4"
  }, seccionCuentas, seccionInversiones, seccionDeudas), seccionActivos, formularioActivo, notaFinal));
}

export function PanelDiagnostico({
  diagnostico
}) {
  const el = React.createElement;
  const {
    positivos,
    preocupantes
  } = diagnostico;
  if (positivos.length === 0 && preocupantes.length === 0) return null;

  const tarjetaItem = (item, tipo) => el("div", {
    key: item.titulo,
    className: "rounded-xl p-4",
    style: {
      backgroundColor: tipo === "positivo" ? C.saluLight : C.critLight
    }
  }, el("div", {
    className: "flex items-start gap-2.5"
  }, el(tipo === "positivo" ? I.checkCircle : I.alertTriangle, {
    size: 16,
    color: tipo === "positivo" ? C.salu : C.crit,
    className: "mt-0.5 shrink-0"
  }), el("div", null, el("div", {
    className: "text-sm font-bold",
    style: {
      color: C.ink
    }
  }, item.titulo), el("p", {
    className: "text-xs mt-1",
    style: {
      color: C.muted
    }
  }, item.texto))));

  const columnaPositivos = positivos.length === 0 ? null : el("div", {
    className: "space-y-3"
  }, el("div", {
    className: "text-xs font-bold uppercase",
    style: {
      color: C.salu,
      letterSpacing: "0.06em"
    }
  }, "Lo que va bien"), positivos.map(item => tarjetaItem(item, "positivo")));

  const columnaPreocupantes = preocupantes.length === 0 ? null : el("div", {
    className: "space-y-3"
  }, el("div", {
    className: "text-xs font-bold uppercase",
    style: {
      color: C.crit,
      letterSpacing: "0.06em"
    }
  }, "Lo que preocupa, y por qué"), preocupantes.map(item => tarjetaItem(item, "preocupante")));

  return el(Card, {
    className: "p-5 sm:p-6"
  }, el(Eyebrow, null, "Tu diagnóstico"), el("h3", {
    className: "font-serif text-xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, "Qué está bien, qué preocupa y por qué"), el("p", {
    className: "text-sm mt-1 mb-4",
    style: {
      color: C.muted
    }
  }, "Construido con tus datos de ingresos, gastos, deudas, cuentas, inversiones y objetivos."), el("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-4"
  }, columnaPositivos, columnaPreocupantes));
}

export function PanelPrioridad({
  prioridad
}) {
  const el = React.createElement;
  const {
    pasos,
    todoEnOrden
  } = prioridad;

  if (todoEnOrden) {
    return el(Card, {
      className: "p-5 sm:p-6",
      style: { borderColor: C.salu + "55" }
    }, el("div", {
      className: "flex items-start gap-3"
    }, el("div", {
      className: "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
      style: { backgroundColor: C.saluLight }
    }, el(I.checkCircle, { size: 18, color: C.salu })), el("div", null, el(Eyebrow, null, "Qué deberías hacer ahora"), el("h3", {
      className: "font-serif text-xl font-bold mt-1",
      style: { color: C.ink }
    }, "Tu situación está en orden"), el("p", {
      className: "text-sm mt-1",
      style: { color: C.muted }
    }, "Tu fondo de emergencia está cubierto, no tienes deuda cara pendiente y tu margen de ahorro es positivo. Sigue con tu plan y revisa esta pantalla si tu situación cambia."))));
  }

  const filaPaso = (paso, index) => {
    const esActual = paso.estado === "actual";
    const esHecho = paso.estado === "hecho";
    const numeroOIcono = esHecho ? el(I.check, { size: 14, color: C.white }) : (index + 1);
    return el("div", {
      key: paso.id,
      className: "flex items-start gap-3 rounded-xl p-3.5",
      style: {
        backgroundColor: esActual ? C.sandLight : "transparent",
        border: esActual ? "1px solid " + C.sand : "1px solid transparent"
      }
    }, el("div", {
      className: "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
      style: {
        backgroundColor: esHecho ? C.salu : esActual ? C.sand : C.border,
        color: esHecho || esActual ? C.white : C.muted
      }
    }, numeroOIcono), el("div", {
      className: "min-w-0"
    }, el("div", {
      className: "text-sm font-bold",
      style: { color: esHecho ? C.muted : C.ink, textDecoration: esHecho ? "line-through" : "none" }
    }, paso.titulo), !esHecho && el("p", {
      className: "text-xs mt-1",
      style: { color: C.muted }
    }, paso.texto)));
  };

  return el(Card, {
    className: "p-5 sm:p-6"
  }, el(Eyebrow, null, "Qué deberías hacer ahora"), el("h3", {
    className: "font-serif text-xl font-bold mt-1",
    style: { color: C.ink }
  }, "Tu orden de actuación"), el("p", {
    className: "text-sm mt-1 mb-4",
    style: { color: C.muted }
  }, "Basado en tu situación: seguridad básica, deuda cara, fondo de emergencia, inversión y objetivos, en ese orden — con excepciones si tu caso lo requiere."), el("div", {
    className: "space-y-2"
  }, pasos.map((p, i) => filaPaso(p, i))));
}

export function PlanFinanciero({
  plan
}) {
  const el = React.createElement;
  const { fases, resumenSituacion, recomendaciones } = plan;

  const iconoPorFase = id => id === "colchon_inicial" ? I.shieldCheck : id === "deuda" ? I.trash : id === "fondo_emergencia" ? I.piggy : id === "inversion" ? I.chartLine : I.target;

  const badgeEstado = estado => {
    const cfg = estado === "completado" ? { texto: "Completado", bg: C.saluLight, color: C.salu } : estado === "en_curso" ? { texto: "En curso ahora", bg: C.sandLight, color: C.navy } : { texto: "Pendiente", bg: C.bgDeepMid, color: C.muted };
    return el("span", {
      className: "text-[10px] font-bold uppercase px-2 py-1 rounded-full shrink-0",
      style: { backgroundColor: cfg.bg, color: cfg.color }
    }, cfg.texto);
  };

  const tarjetaFase = (fase, index) => {
    const Icono = iconoPorFase(fase.id);
    const barra = fase.progreso == null ? null : el("div", {
      className: "h-1.5 rounded-full mt-3 overflow-hidden",
      style: { backgroundColor: C.bgDeepMid }
    }, el("div", {
      className: "h-full rounded-full",
      style: { width: fase.progreso + "%", backgroundColor: fase.estado === "completado" ? C.salu : C.sand }
    }));
    return el(Card, {
      key: fase.id,
      className: "p-5",
      style: { borderColor: fase.estado === "en_curso" ? C.sand + "66" : C.border }
    }, el("div", {
      className: "flex items-start justify-between gap-3"
    }, el("div", {
      className: "flex items-center gap-3 min-w-0"
    }, el("div", {
      className: "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold",
      style: { backgroundColor: fase.estado === "completado" ? C.saluLight : C.sandLight, color: fase.estado === "completado" ? C.salu : C.navy }
    }, fase.estado === "completado" ? el(I.check, { size: 16 }) : (index + 1)), el("div", {
      className: "min-w-0"
    }, el("div", {
      className: "font-serif text-base font-bold",
      style: { color: C.ink }
    }, fase.titulo), el("p", {
      className: "text-xs mt-0.5",
      style: { color: C.muted }
    }, fase.objetivoTexto))), badgeEstado(fase.estado)), fase.meta != null && el("div", {
      className: "flex gap-4 mt-3 text-xs"
    }, el("span", {
      style: { color: C.muted }
    }, "Meta: ", el("b", { style: { color: C.ink } }, euros(fase.meta))), el("span", {
      style: { color: C.muted }
    }, "Ahora: ", el("b", { style: { color: C.ink } }, euros(fase.actual)))), barra, el("p", {
      className: "text-sm mt-3",
      style: { color: C.ink }
    }, fase.accion));
  };

  return el("div", {
    className: "space-y-6"
  }, el(Card, {
    className: "p-5 sm:p-6",
    style: { backgroundColor: C.sandLight, border: "1px solid rgba(79,70,229,.16)" }
  }, el(Eyebrow, null, "Tu plan"), el("h3", {
    className: "font-serif text-xl font-bold mt-1",
    style: { color: C.ink }
  }, resumenSituacion), el("div", {
    className: "mt-3 space-y-1.5"
  }, recomendaciones.map((texto, i) => el("div", {
    key: i,
    className: "flex items-start gap-2 text-sm",
    style: { color: C.ink }
  }, el("span", {
    className: "font-bold shrink-0",
    style: { color: C.navy }
  }, (i + 1) + "."), el("span", null, texto))))), el("div", {
    className: "space-y-4"
  }, fases.map((f, i) => tarjetaFase(f, i))), el("p", {
    className: "text-[11px] readable-note"
  }, "El plan se recalcula cada vez que entras, con tus datos actuales. Para ver tu evolución en el tiempo (si avanzas mes a mes) llegará próximamente un apartado de Seguimiento."));
}

export function Seguimiento({
  user,
  historial,
  cargando,
  onRegistrar,
  onOpenAuth
}) {
  const el = React.createElement;
  const [registrando, setRegistrando] = useState(false);

  if (!user) {
    return el(Card, {
      className: "p-8 text-center"
    }, el(I.chartLine, { size: 28, className: "mx-auto mb-3", color: C.muted }), el("p", {
      className: "text-sm font-bold",
      style: { color: C.ink }
    }, "Inicia sesión para guardar tu evolución"), el("p", {
      className: "text-sm mt-1 max-w-sm mx-auto",
      style: { color: C.muted }
    }, "El seguimiento compara tu situación entre visitas, así que necesita que tus datos se guarden en la nube."), el("button", {
      onClick: onOpenAuth,
      className: "mt-4 px-4 py-2 rounded-lg text-xs font-bold",
      style: { backgroundColor: C.sand, color: C.navy }
    }, "Guardar mis datos"));
  }

  if (cargando) {
    return el(Card, {
      className: "p-8 text-center"
    }, el("p", {
      className: "text-sm",
      style: { color: C.muted }
    }, "Cargando tu histórico…"));
  }

  const handleRegistrar = async () => {
    setRegistrando(true);
    await onRegistrar();
    setRegistrando(false);
  };

  const botonRegistrar = el("button", {
    onClick: handleRegistrar,
    disabled: registrando,
    className: "inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60",
    style: { backgroundColor: C.sand, color: C.navy }
  }, el(I.sparkles, { size: 15 }), registrando ? "Guardando…" : "Registrar mi avance ahora");

  if (historial.length === 0) {
    return el(Card, {
      className: "p-8 text-center"
    }, el(I.chartLine, { size: 28, className: "mx-auto mb-3", color: C.muted }), el("p", {
      className: "text-sm font-bold",
      style: { color: C.ink }
    }, "Todavía no tienes ningún registro"), el("p", {
      className: "text-sm mt-1 max-w-sm mx-auto",
      style: { color: C.muted }
    }, "Guarda tu primera foto de hoy. La próxima vez que vuelvas, podrás ver si has avanzado."), el("div", {
      className: "mt-4"
    }, botonRegistrar));
  }

  const primero = historial[0];
  const ultimo = historial[historial.length - 1];
  const diferencia = (campo) => Number(ultimo[campo] || 0) - Number(primero[campo] || 0);
  const diferenciaPatrimonio = diferencia("patrimonio_neto");
  const diferenciaDeuda = diferencia("deuda_pendiente");
  const fechaFmt = (iso) => new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short" });

  const datosGrafico = historial.map(h => ({
    fecha: fechaFmt(h.registrado_at),
    patrimonio: Math.round(Number(h.patrimonio_neto) || 0)
  }));

  const tarjetaResumen = (etiqueta, diff, invertirColor) => {
    const positivo = invertirColor ? diff <= 0 : diff >= 0;
    return el("div", {
      className: "rounded-xl p-4",
      style: { backgroundColor: C.paper, border: "1px solid " + C.border }
    }, el("div", {
      className: "text-[10px] uppercase font-bold",
      style: { color: C.muted }
    }, etiqueta), el("div", {
      className: "font-serif text-lg font-bold mt-1",
      style: { color: positivo ? C.salu : C.crit }
    }, (diff >= 0 ? "+" : "") + euros(diff)));
  };

  return el("div", {
    className: "space-y-6"
  }, historial.length >= 2 && el(Card, {
    className: "p-5"
  }, el("div", {
    className: "flex items-center justify-between gap-3 mb-3"
  }, el("div", null, el(Eyebrow, null, "Desde tu primer registro"), el("p", {
    className: "text-xs mt-1",
    style: { color: C.muted }
  }, `${fechaFmt(primero.registrado_at)} — ${fechaFmt(ultimo.registrado_at)}`)), botonRegistrar), el("div", {
    className: "grid grid-cols-2 sm:grid-cols-2 gap-3"
  }, tarjetaResumen("Patrimonio neto", diferenciaPatrimonio, false), tarjetaResumen("Deuda pendiente", diferenciaDeuda, true))), historial.length < 2 && el(Card, {
    className: "p-5 flex items-center justify-between gap-3 flex-wrap"
  }, el("p", {
    className: "text-sm",
    style: { color: C.muted }
  }, "Tienes un registro guardado. Vuelve otro día y registra de nuevo para empezar a ver tu evolución."), botonRegistrar), el(Card, {
    className: "p-5"
  }, el(Eyebrow, null, "Evolución de tu patrimonio neto"), el("div", {
    className: "h-64 mt-3"
  }, el(SimpleAreaChart, {
    data: datosGrafico,
    xKey: "fecha",
    series: [{ key: "patrimonio", label: "Patrimonio neto", color: C.sand, opacity: 0.3 }],
    formatY: v => v.toLocaleString("es-ES") + " €"
  }))), el(Card, {
    className: "p-5"
  }, el(Eyebrow, null, "Historial de registros"), el("div", {
    className: "space-y-2 mt-3"
  }, [...historial].reverse().map(h => el("div", {
    key: h.id,
    className: "flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5",
    style: { backgroundColor: C.paper }
  }, el("span", {
    className: "text-xs font-bold",
    style: { color: C.muted }
  }, fechaFmt(h.registrado_at), h.origen === "auto" ? " · automático" : ""), el("span", {
    className: "text-sm font-bold",
    style: { color: C.ink }
  }, euros(h.patrimonio_neto)))))), el("p", {
    className: "text-[11px] readable-note"
  }, "Cada registro guarda tu liquidez, inversiones, otros activos, deudas y fondo de emergencia de ese momento. Se genera automáticamente como mucho una vez al día, o cuando pulsas «Registrar mi avance»."));
}

export function NavDesktop({
  vistaActual,
  setVistaActual
}) {
  const el = React.createElement;
  const sueltoInicio = ["inicio", "Introducción"];
  const sueltoSimulador = ["simulador", "Simulador"];
  const sueltoBlog = ["blog", "Blog"];
  const dropdowns = [{
    id: "finanzas",
    titulo: "Mis Finanzas",
    items: [["diagnostico", "Diagnóstico"], ["cuentas", "Cuentas"], ["inversiones", "Inversiones"], ["patrimonio", "Patrimonio"]]
  }, {
    id: "plan",
    titulo: "Plan",
    items: [["estrategia", "Estrategia"], ["plan", "Plan"], ["seguimiento", "Seguimiento"]]
  }];
  const [menuAbierto, setMenuAbierto] = useState(null);
  const navRef = useRef(null);
  useEffect(() => {
    if (!menuAbierto) return;
    const cerrarSiFuera = e => {
      if (navRef.current && !navRef.current.contains(e.target)) setMenuAbierto(null);
    };
    document.addEventListener("mousedown", cerrarSiFuera);
    return () => document.removeEventListener("mousedown", cerrarSiFuera);
  }, [menuAbierto]);
  const boton = ([id, label]) => el("button", {
    key: id,
    onClick: () => setVistaActual(id),
    className: "px-2.5 py-2 rounded-lg transition-colors hover:bg-white/10 " + (vistaActual === id ? "nav-link-active" : "nav-link-muted"),
    style: vistaActual === id ? {
      color: C.sand,
      borderBottom: "2px solid " + C.sand
    } : {}
  }, label);
  const grupoActivo = grupo => grupo.items.some(([id]) => id === vistaActual);
  const dropdown = grupo => {
    const abierto = menuAbierto === grupo.id;
    const activo = grupoActivo(grupo);
    return el("div", {
      key: grupo.id,
      className: "relative"
    }, el("button", {
      onClick: () => setMenuAbierto(abierto ? null : grupo.id),
      "aria-expanded": abierto,
      className: "px-2.5 py-2 rounded-lg transition-colors hover:bg-white/10 inline-flex items-center gap-1 " + (activo ? "nav-link-active" : "nav-link-muted"),
      style: activo ? {
        color: C.sand,
        borderBottom: "2px solid " + C.sand
      } : {}
    }, grupo.titulo, el(I.chevronDown, {
      size: 13,
      style: {
        transform: abierto ? "rotate(180deg)" : "none",
        transition: "transform 150ms ease"
      }
    })), abierto && el("div", {
      className: "absolute left-0 top-full mt-1 min-w-[190px] rounded-xl overflow-hidden export-menu",
      style: {
        backgroundColor: C.navy,
        border: "1px solid rgba(255,255,255,.12)",
        boxShadow: "0 12px 28px rgba(0,0,0,.28)",
        zIndex: 40
      }
    }, grupo.items.map(([id, label]) => el("button", {
      key: id,
      onClick: () => {
        setVistaActual(id);
        setMenuAbierto(null);
      },
      className: "block w-full text-left px-3.5 py-2.5 text-xs font-bold transition-colors hover:bg-white/10",
      style: vistaActual === id ? {
        color: C.sand,
        backgroundColor: "rgba(255,255,255,.08)"
      } : {
        color: "#CBD5E1"
      }
    }, label))));
  };
  return el("nav", {
    ref: navRef,
    className: "flex items-center gap-1 text-xs font-bold flex-wrap"
  }, boton(sueltoInicio), dropdowns.map(dropdown), boton(sueltoSimulador), boton(sueltoBlog), el("a", {
    href: "/recursos-y-libros.html",
    className: "px-2.5 py-2 rounded-lg transition-colors hover:bg-white/10 nav-link-muted"
  }, "Recursos y libros"));
}
