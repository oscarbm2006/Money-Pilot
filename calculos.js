const { useState, useEffect, useRef, useCallback, useMemo, useId } = React;

import { C, DEUDAS_DEF, FRECUENCIAS, GASTOS_DISC_DEF, GASTOS_FIJOS_DEF, I, PERFILES_NIVELES, PRIORIDADES_OBJETIVO, QUIZ_DEF } from './constantes.js';

export function quizNumero(respuestas, id) {
  const n = Number((respuestas || {})[id]);
  const max = (QUIZ_DEF[id]?.opciones || []).length || 4;
  return n >= 1 && n <= max ? n : null;
}

export function tipoObjetivoDesdeQuiz(valor) {
  return {
    1: "casa",
    2: "coche",
    3: "vacaciones",
    4: "estudios",
    5: "libertad",
    6: "poder_adquisitivo",
    7: "otro"
  }[Number(valor)] || null;
}

export function esObjetivoMaterial(datos = {}, tipoQuiz = null) {
  const tipo = tipoObjetivoDesdeQuiz(tipoQuiz) || datos?.objetivo?.tipo;
  return ["casa", "coche", "vacaciones", "estudios"].includes(tipo);
}

export function getNextQuestionId(currentQuestionId, respuestas = {}, datos = {}) {
  const r = respuestas || {};
  const h = quizNumero(r, "horizonte");
  const l = quizNumero(r, "liquidez");
  const p = quizNumero(r, "conocimientoProductos");
  const k = quizNumero(r, "conocimientoRiesgo");
  const objetivoRiesgo = quizNumero(r, "objetivo");
  const objetivoTipo = tipoObjetivoDesdeQuiz(r.objetivoTipo) || datos?.objetivo?.tipo;
  const necesitaLiquidez = h != null && h <= 2 || l != null && l <= 2;
  const material = esObjetivoMaterial(datos, r.objetivoTipo);
  switch (currentQuestionId) {
    case null:
    case undefined:
      return "edad";
    case "edad":
      return "disposicionInvertir";
    case "disposicionInvertir":
      return "conocimientoProductos";
    case "conocimientoProductos":
      return "objetivo";
    case "objetivo":
      return "objetivoTipo";
    case "objetivoTipo":
      return "horizonte";
    case "horizonte":
      return "estabilidad";
    case "estabilidad":
      return "concentracion";
    case "concentracion":
      return "liquidez";
    case "liquidez":
      return necesitaLiquidez ? "liquidezDetalle" : "caida";
    case "liquidezDetalle":
      return "colchonAlternativo";
    case "colchonAlternativo":
      return "caida";
    case "caida":
      if (["libertad", "poder_adquisitivo"].includes(objetivoTipo)) return "objetivoLargoPlazo";
      return material || objetivoRiesgo <= 2 || objetivoTipo === "otro" ? "objetivoContexto" : h != null && h >= 3 ? "perdida" : p != null && p <= 1 ? "patrimonio" : "conocimientoRiesgo";
    case "objetivoContexto":
      return h != null && h >= 3 ? "perdida" : p != null && p <= 1 ? "patrimonio" : "conocimientoRiesgo";
    case "objetivoLargoPlazo":
      return h != null && h >= 3 ? "perdida" : p != null && p <= 1 ? "patrimonio" : "conocimientoRiesgo";
    case "perdida":
      return p != null && p <= 1 ? "patrimonio" : "conocimientoRiesgo";
    case "conocimientoRiesgo":
      return k != null && k >= 3 ? "conocimientoCostes" : "patrimonio";
    case "conocimientoCostes":
      return p != null && p >= 3 ? "comportamiento" : "patrimonio";
    case "comportamiento":
      return "patrimonio";
    case "patrimonio":
    default:
      return null;
  }
}

export function construirRutaQuiz(respuestas = {}, datos = {}) {
  const r = normalizarRespuestasQuiz(respuestas);
  const ruta = [];
  let id = getNextQuestionId(null, r, datos);
  const vistos = new Set();
  while (id && !vistos.has(id) && ruta.length < 30) {
    vistos.add(id);
    ruta.push(id);
    if (quizNumero(r, id) == null) break;
    id = getNextQuestionId(id, r, datos);
  }
  return ruta;
}

export function preguntasDisponiblesQuiz(respuestas = {}, datos = {}) {
  return construirRutaQuiz(respuestas, datos).map(id => QUIZ_DEF[id]).filter(Boolean);
}

export function reconstruirEstadoQuiz(quizState, datos = {}) {
  const estado = quizState && typeof quizState === "object" ? quizState : {};
  const respuestas = normalizarRespuestasQuiz(estado.respuestas || {});
  const rutaGuardada = Array.isArray(estado.questionPath) ? estado.questionPath.filter(id => QUIZ_DEF[id]) : [];
  const rutaCalculada = construirRutaQuiz(respuestas, datos);
  const ruta = rutaGuardada.length ? rutaGuardada.filter((id, i) => rutaCalculada[i] === id) : rutaCalculada;
  const rutaFinal = ruta.length ? ruta : rutaCalculada;
  const ultimo = rutaFinal[rutaFinal.length - 1];
  const finalizado = !!estado.terminado || ultimo === "patrimonio" && quizNumero(respuestas, "patrimonio") != null;
  const candidato = estado.currentQuestionId && QUIZ_DEF[estado.currentQuestionId] ? estado.currentQuestionId : null;
  const actual = finalizado ? ultimo || "patrimonio" : candidato && rutaFinal.includes(candidato) ? candidato : rutaFinal.find(id => quizNumero(respuestas, id) == null) || ultimo || "edad";
  return {
    respuestas,
    currentQuestionId: actual,
    questionPath: rutaFinal,
    paso: Math.max(0, rutaFinal.indexOf(actual)),
    terminado: finalizado,
    resultado: estado.resultado || null
  };
}

export function normalizarRespuestasQuiz(respuestas) {
  if (!Array.isArray(respuestas)) return respuestas || {};
  const legacyIds = ["edad", "horizonte", "objetivo", "estabilidad", "concentracion", "liquidez", "caida", "conocimientoProductos"];
  const out = {};
  respuestas.forEach((valor, i) => {
    if (valor != null && legacyIds[i]) out[legacyIds[i]] = Number(valor);
  });
  return out;
}

export function calcularPerfilMultidimensional(respuestas, datos = {}) {
  const r = normalizarRespuestasQuiz(respuestas);
  const valor = id => quizNumero(r, id);
  const media = items => {
    const validos = items.filter(v => v != null && !isNaN(v));
    return validos.length ? validos.reduce((a, b) => a + b, 0) / validos.length : null;
  };
  const a100 = v => v == null ? null : Math.round(v * 25);
  const qEdad = valor("edad");
  const qHorizonte = valor("horizonte");
  const qObjetivo = valor("objetivo");
  const qObjetivoTipo = valor("objetivoTipo");
  const qEstabilidad = valor("estabilidad");
  const qConcentracion = valor("concentracion");
  const qLiquidez = valor("liquidez");
  const qLiquidezDetalle = valor("liquidezDetalle");
  const qColchonAlternativo = valor("colchonAlternativo");
  const qCaida = valor("caida");
  const qPerdida = valor("perdida");
  const qObjetivoContexto = valor("objetivoContexto");
  const qObjetivoLargoPlazo = valor("objetivoLargoPlazo");
  const qProductos = valor("conocimientoProductos");
  const qRiesgo = valor("conocimientoRiesgo");
  const qCostes = valor("conocimientoCostes");
  const qComportamiento = valor("comportamiento");
  const qPatrimonio = valor("patrimonio");
  const ahorroActual = Number(datos.ahorroActual || 0);
  const capacidadFinanciera = calcularCapacidadFinanciera(datos);
  const ahorroDisponible = capacidadFinanciera.capacidadMensual;
  const gastoTotal = capacidadFinanciera.gastosTotales;
  const coberturaEmergencia = capacidadFinanciera.gastosTotales > 0 ? ahorroActual / capacidadFinanciera.gastosTotales : null;
  const ratioDeuda = capacidadFinanciera.ingresos > 0 ? capacidadFinanciera.cuotasDeuda / capacidadFinanciera.ingresos : null;
  const deudaPendiente = (datos.deudas || []).reduce((s, d) => s + Number(d.pendiente || 0), 0);
  const planObjetivos = calcularPlanObjetivos(datos);
  const objetivosPlan = planObjetivos.objetivos;
  const objetivoPrincipalPlan = planObjetivos.principal;
  const objetivoContextualTipo = objetivoPrincipalPlan?.tipo || tipoObjetivoDesdeQuiz(qObjetivoTipo) || null;
  const importeObjetivo = Number(objetivoPrincipalPlan?.importeObjetivo || 0);
  const plazoObjetivo = Number(objetivoPrincipalPlan?.plazoAnios || 0);
  const reservadoObjetivo = Number(objetivoPrincipalPlan?.importeReservado || 0);
  const coberturaObjetivo = importeObjetivo > 0 ? Math.max(0, Math.min(1, reservadoObjetivo / importeObjetivo)) : null;

  /*
   * Edad es contexto independiente. Un usuario joven no obtiene por ello
   * un horizonte largo: el horizonte se deriva exclusivamente de su respuesta.
   */
  const edad = a100(qEdad);
  const horizonte = a100(qHorizonte);
  const toleranciaRiesgo = a100(media([qCaida, qPerdida, qObjetivo, qObjetivoContexto, qObjetivoLargoPlazo]));

  /*
   * Capacidad: incorpora situación financiera real y las nuevas preguntas
   * condicionales de liquidez. Si no hay datos financieros, se usan solo las
   * respuestas disponibles y la confianza lo refleja.
   */
  const factorFlujo = Number(datos.ingresos || 0) > 0 ? ahorroDisponible > 0 ? Math.min(4, 1 + ahorroDisponible / Math.max(Number(datos.ingresos || 1) * 0.25, 1)) : 1 : null;
  const factorEmergencia = coberturaEmergencia == null ? null : coberturaEmergencia < 1 ? 1 : coberturaEmergencia < 3 ? 2 : coberturaEmergencia < 6 ? 3 : 4;
  const factorDeuda = ratioDeuda == null ? null : ratioDeuda > 0.40 ? 1 : ratioDeuda > 0.25 ? 2 : ratioDeuda > 0.10 ? 3 : 4;
  const factoresFinancierosDuros = [factorFlujo, factorEmergencia, factorDeuda].filter(v => v != null);
  const capacidadFactores = [qEstabilidad, qConcentracion, qPatrimonio, coberturaObjetivo == null ? null : coberturaObjetivo < 0.25 ? 1 : coberturaObjetivo < 0.50 ? 2 : coberturaObjetivo < 0.75 ? 3 : 4, qLiquidezDetalle, qColchonAlternativo];
  const capacidadEncuesta = media(capacidadFactores);
  const capacidadDura = factoresFinancierosDuros.length ? Math.min(...factoresFinancierosDuros) : null;
  const capacidadRiesgo = a100(capacidadDura == null ? capacidadEncuesta : Math.min(capacidadEncuesta == null ? capacidadDura : capacidadEncuesta, capacidadDura));

  /* Liquidez ya NO incorpora matemáticamente el horizonte. Son dimensiones distintas. */
  const liquidez = a100(qLiquidez);
  const experiencia = a100(media([qProductos, qRiesgo, qCostes, qComportamiento]));
  const dimensiones = {
    edad,
    toleranciaRiesgo,
    capacidadRiesgo,
    horizonte,
    liquidez,
    experiencia
  };
  const pesos = {
    toleranciaRiesgo: 0.30,
    capacidadRiesgo: 0.30,
    horizonte: 0.15,
    liquidez: 0.15,
    experiencia: 0.10
  };
  const dimensionesPonderadas = Object.fromEntries(Object.entries(pesos).map(([key, peso]) => [key, {
    valor: dimensiones[key],
    peso
  }]));
  const paresConocidos = Object.entries(pesos).filter(([key]) => dimensiones[key] != null);
  const pesoConocido = paresConocidos.reduce((s, [, peso]) => s + peso, 0);
  const baseScore = pesoConocido > 0 ? Math.round(paresConocidos.reduce((s, [key, peso]) => s + dimensiones[key] * peso, 0) / pesoConocido) : 0;
  const nivelPorScore = score => score < 30 ? 0 : score < 45 ? 1 : score < 60 ? 2 : score < 80 ? 3 : 4;
  let nivelFinal = nivelPorScore(baseScore);

  /*
   * La puntuación agregada orienta, pero nunca puede compensar una debilidad
   * crítica. Cada dimensión limitante aplica un techo independiente.
   */
  const limites = [{
    key: "capacidadRiesgo",
    valor: capacidadRiesgo,
    reglas: [[25, 0], [40, 1], [60, 2]]
  }, {
    key: "horizonte",
    valor: horizonte,
    reglas: [[25, 0], [50, 1], [70, 2]]
  }, {
    key: "liquidez",
    valor: liquidez,
    reglas: [[25, 0], [50, 1], [70, 2]]
  }, {
    key: "experiencia",
    valor: experiencia,
    reglas: [[25, 1], [50, 2], [70, 3]]
  }];
  const limitesAplicados = [];
  limites.forEach(({
    key,
    valor,
    reglas
  }) => {
    if (valor == null) return;
    for (const [umbral, maxNivel] of reglas) {
      if (valor <= umbral) {
        nivelFinal = Math.min(nivelFinal, maxNivel);
        limitesAplicados.push({
          dimension: key,
          maxNivel,
          umbral,
          valor
        });
        break;
      }
    }
  });
  const faltantes = [];
  if (edad == null) faltantes.push("edad");
  if (toleranciaRiesgo == null) faltantes.push("tolerancia al riesgo");
  if (capacidadRiesgo == null) faltantes.push("capacidad para soportar pérdidas");
  if (horizonte == null) faltantes.push("horizonte temporal");
  if (liquidez == null) faltantes.push("necesidad de liquidez");
  if (experiencia == null) faltantes.push("conocimientos de inversión");
  let confianza = "Alta";
  if (faltantes.length >= 2 || [capacidadRiesgo, horizonte, liquidez].some(v => v == null)) confianza = "Baja";else if (faltantes.length === 1) confianza = "Media";
  const factoresPositivos = [];
  const factoresNegativos = [];
  const nombres = [["toleranciaRiesgo", "Cómo llevas los altibajos (tolerancia al riesgo)"], ["capacidadRiesgo", "Capacidad para soportar pérdidas"], ["horizonte", "Tiempo por delante (horizonte)"], ["liquidez", "Cuándo podrías necesitar el dinero (liquidez)"], ["experiencia", "Conocimientos de inversión"]];
  nombres.forEach(([key, label]) => {
    const v = dimensiones[key];
    if (v == null) return;
    if (v >= 70) factoresPositivos.push(label + " alta");else if (v < 50) factoresNegativos.push(label + " limitada");
  });
  if (coberturaEmergencia != null && coberturaEmergencia < 3) factoresNegativos.push("El fondo de emergencia todavía es reducido");
  if (ratioDeuda != null && ratioDeuda > 0.25) factoresNegativos.push("La carga de deuda reduce la capacidad de asumir pérdidas");
  if (ahorroDisponible <= 0) factoresNegativos.push("No existe ahorro mensual disponible para absorber pérdidas");
  if (qLiquidezDetalle != null && qLiquidezDetalle <= 1) factoresNegativos.push("Podrías necesitar gran parte de la inversión a corto plazo");
  if (qColchonAlternativo != null && qColchonAlternativo <= 1) factoresNegativos.push("No existe un colchón alternativo suficiente");
  if (deudaPendiente <= 0 && qPatrimonio >= 3) factoresPositivos.push("Patrimonio neto y deuda favorables");
  if (importeObjetivo > 0 && plazoObjetivo > 0 && coberturaObjetivo != null && coberturaObjetivo < 0.50 && plazoObjetivo <= 5) factoresNegativos.push("El objetivo necesita todavía una parte importante de financiación");
  limitesAplicados.forEach(l => {
    const etiqueta = {
      capacidadRiesgo: "tu capacidad financiera para soportar pérdidas",
      horizonte: "tu horizonte temporal",
      liquidez: "tu necesidad de liquidez",
      experiencia: "tus conocimientos de inversión"
    }[l.dimension] || l.dimension;
    factoresNegativos.push("Tu perfil se ha limitado por " + etiqueta + ", aunque tu tolerancia al riesgo sea más alta");
  });
  if (!factoresPositivos.length) factoresPositivos.push("No hay una dimensión claramente alta que impulse el perfil");
  if (!factoresNegativos.length) factoresNegativos.push("No se detectan limitaciones relevantes entre las dimensiones evaluadas");

  /* Las razones de un techo de seguridad aplicado (limitesAplicados) son la
     explicación más importante de por qué el perfil final es más bajo de lo
     que sugerirían tus respuestas de tolerancia — nunca deben quedar fuera
     por el recorte a 3 elementos. Las priorizamos primero en la lista. */
  const factoresNegativosUnicos = [...new Set(factoresNegativos)];
  const razonesTecho = factoresNegativosUnicos.filter(f => f.startsWith("Tu perfil se ha limitado por"));
  const otrasRazones = factoresNegativosUnicos.filter(f => !f.startsWith("Tu perfil se ha limitado por"));
  const factoresNegativosFinal = [...razonesTecho, ...otrasRazones].slice(0, 3);
  const factoresTenidosEnCuenta = ["Objetivo principal y su prioridad", "Objetivo y preferencia de crecimiento", "Horizonte temporal de la inversión", "Necesidad de liquidez", "Capacidad financiera para soportar pérdidas", "Tolerancia ante caídas de mercado", "Conocimientos y experiencia de inversión", "Edad como contexto, sin sustituir al horizonte"];
  return {
    ...dimensiones,
    puntuacionBase: baseScore,
    dimensionesPonderadas,
    limitesAplicados,
    perfil: PERFILES_NIVELES[nivelFinal],
    confianza,
    faltantes,
    factoresPositivos: [...new Set(factoresPositivos)].slice(0, 3),
    factoresNegativos: factoresNegativosFinal,
    factoresTenidosEnCuenta,
    factoresCapacidad: {
      ahorroDisponible,
      coberturaEmergencia,
      ratioDeuda,
      deudaPendiente,
      importeObjetivo,
      plazoObjetivo,
      coberturaObjetivo
    }
  };
}

export function euros(n, dec = 0) {
  if (n == null || isNaN(n)) return "—";
  return n.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: dec,
    maximumFractionDigits: dec
  });
}

export function pct(n, dec = 1) {
  if (n == null || isNaN(n)) return "—";
  return n.toLocaleString("es-ES", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec
  }) + "%";
}

export function totalMensual(obj) {
  return Object.values(obj).reduce((acc, item) => {
    const f = FRECUENCIAS.find(x => x.value === item.frecuencia) || FRECUENCIAS[0];
    return acc + Number(item.valor || 0) / f.divisor;
  }, 0);
}

export function emptyCampo(defs) {
  return Object.fromEntries(defs.map(d => [d.key, {
    valor: 0,
    frecuencia: "mensual"
  }]));
}

export function estadoAhorro(ratio) {
  if (ratio < 0) return {
    nombre: "Construyendo tu base",
    color: C.mej,
    light: C.mejLight,
    Ico: I.alert
  };
  if (ratio < 0.1) return {
    nombre: "Margen de mejora",
    color: C.mej,
    light: C.mejLight,
    Ico: I.alert
  };
  if (ratio < 0.2) return {
    nombre: "Base saludable",
    color: C.salu,
    light: C.saluLight,
    Ico: I.check
  };
  return {
    nombre: "Muy buena base",
    color: C.exc,
    light: C.excLight,
    Ico: I.check
  };
}

export function calcularSaludFinanciera({
  ratioAhorro,
  coberturaMeses,
  cargaDeuda,
  perfil
}) {
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const ptsAhorro = clamp(ratioAhorro, 0, 0.25) / 0.25 * 40;
  const ptsFondo = clamp(coberturaMeses, 0, 6) / 6 * 30;
  const ptsDeuda = (1 - clamp(cargaDeuda, 0, 0.3) / 0.3) * 20;
  const ptsPerfil = perfil ? 10 : 0;
  const score = Math.round(ptsAhorro + ptsFondo + ptsDeuda + ptsPerfil);
  /* UX: copy más humano; score, ponderaciones y umbrales permanecen intactos. */
  let nivel;
  if (score < 35) nivel = {
    nombre: "Construyendo tu base",
    color: C.mej,
    light: C.mejLight
  };else if (score < 60) nivel = {
    nombre: "Margen de mejora",
    color: C.mej,
    light: C.mejLight
  };else if (score < 80) nivel = {
    nombre: "Base saludable",
    color: C.salu,
    light: C.saluLight
  };else nivel = {
    nombre: "Muy buena salud",
    color: C.exc,
    light: C.excLight
  };
  return {
    score,
    ...nivel,
    desglose: {
      ptsAhorro,
      ptsFondo,
      ptsDeuda,
      ptsPerfil
    }
  };
}

export function proyeccionInteres(inicial, mensual, tasaAnual, anios) {
  const r = tasaAnual / 100 / 12;
  const meses = anios * 12;
  let valorFuturo;
  if (r === 0) valorFuturo = inicial + mensual * meses;else {
    const pow = Math.pow(1 + r, meses);
    valorFuturo = inicial * pow + mensual * ((pow - 1) / r);
  }
  const totalAportado = inicial + mensual * meses;
  return {
    anios,
    totalAportado,
    valorFuturo,
    interesGenerado: valorFuturo - totalAportado
  };
}

export function simularAmortizacion(deudas, extraMensual, estrategia) {
  const MAX_MESES = 480;
  const activos = deudas.filter(d => Number(d.pendiente) > 0).map(d => ({
    nombre: d.nombre || "Deuda sin nombre",
    saldo: Number(d.pendiente),
    tasaMensual: Number(d.tasa) / 100 / 12,
    cuotaMin: Number(d.cuota) || 0,
    liquidada: false,
    mesLiquidacion: null,
    interesPagado: 0
  }));
  const orden = estrategia === "avalancha" ? [...activos].sort((a, b) => b.tasaMensual - a.tasaMensual) : [...activos].sort((a, b) => a.saldo - b.saldo);
  let extraLiberado = 0;
  let totalInteres = 0;
  let mes = 0;
  while (orden.some(d => !d.liquidada) && mes < MAX_MESES) {
    mes++;
    for (const d of orden) {
      if (d.liquidada) continue;
      const interes = d.saldo * d.tasaMensual;
      d.interesPagado += interes;
      totalInteres += interes;
      d.saldo += interes;
      const pagoMin = Math.min(d.cuotaMin, d.saldo);
      d.saldo -= pagoMin;
      if (d.saldo <= 0.01) {
        d.saldo = 0;
        d.liquidada = true;
        d.mesLiquidacion = mes;
        extraLiberado += d.cuotaMin;
      }
    }
    let presupuestoExtra = (Number(extraMensual) || 0) + extraLiberado;
    for (const d of orden) {
      if (d.liquidada) continue;
      if (presupuestoExtra <= 0) break;
      const pago = Math.min(presupuestoExtra, d.saldo);
      d.saldo -= pago;
      presupuestoExtra -= pago;
      if (d.saldo <= 0.01) {
        d.saldo = 0;
        d.liquidada = true;
        d.mesLiquidacion = mes;
        extraLiberado += d.cuotaMin;
      }
      break;
    }
  }
  return {
    orden,
    totalInteres,
    mesesTotal: mes,
    todasLiquidadas: orden.every(d => d.liquidada)
  };
}

export function formatMeses(m) {
  const anios = Math.floor(m / 12),
    meses = m % 12;
  if (anios === 0) return meses + (meses === 1 ? " mes" : " meses");
  if (meses === 0) return anios + (anios === 1 ? " año" : " años");
  return anios + "a " + meses + "m";
}

export function exportarJSON({
  datos,
  perfil,
  perfilDetalle,
  sim,
  historial,
  gastoTotal,
  ahorroDisponible
}) {
  const payload = {
    generado: new Date().toISOString(),
    ingresosMensuales: datos.ingresos,
    gastosFijos: datos.gastosFijos,
    gastosDiscrecionales: datos.gastosDiscrecionales,
    deudas: datos.deudas,
    ahorroActual: datos.ahorroActual,
    objetivo: datos.objetivo,
    objetivos: normalizarObjetivos(datos),
    gastoTotalMensual: gastoTotal,
    ahorroDisponibleMensual: ahorroDisponible,
    perfilRiesgo: perfil,
    perfilRiesgoDetalle: perfilDetalle,
    simulador: sim,
    historialRatioAhorro: historial
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "moneypilot-resumen-" + new Date().toISOString().slice(0, 10) + ".json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportarPDF() {
  window.print();
}

export function deudaTieneContenido(d) {
  return Number(d.pendiente) > 0 || !!d.nombre || Number(d.cuota) > 0 || Number(d.tasa) > 0;
}

export function mapDeudaParaSupabase(d, userId) {
  return {
    user_id: userId,
    tipo: d.tipo || "otro",
    nombre: d.nombre || "Deuda sin nombre",
    saldo_pendiente: Number(d.pendiente) || 0,
    cuota_mensual: Number(d.cuota) || 0,
    tae: d.tasa === "" || d.tasa == null ? null : Number(d.tasa) || null
  };
}

export function numOrNull(v) {
  if (v === "" || v === undefined || v === null) return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

export function niceTicks(maxV, targetCount = 6) {
  if (!(maxV > 0)) return {
    ticks: [0],
    niceMax: 1
  };
  const rawStep = maxV / targetCount;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const norm = rawStep / mag;
  const niceNorm = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10;
  const step = niceNorm * mag;
  const niceMax = Math.ceil(maxV / step) * step;
  const ticks = [];
  for (let v = 0; v <= niceMax + step * 0.001; v += step) ticks.push(v);
  return {
    ticks,
    niceMax,
    step
  };
}

export function traducirErrorAuth(mensaje) {
  const m = String(mensaje || "");
  if (/invalid login credentials/i.test(m)) return "Email o contraseña incorrectos.";
  if (/user already registered/i.test(m)) return "Ya existe una cuenta con este email. Inicia sesión.";
  if (/email not confirmed/i.test(m)) return "Confirma tu email antes de iniciar sesión (revisa tu bandeja de entrada).";
  if (/password should be at least 6 characters/i.test(m)) return "La contraseña debe tener al menos 6 caracteres.";
  if (/unable to validate email address|invalid email/i.test(m)) return "Introduce un email válido.";
  if (/rate limit/i.test(m)) return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  return "No se pudo completar la operación. Inténtalo de nuevo.";
}

export function crearIdObjetivo() {
  return "obj_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

export function normalizarObjetivo(o = {}, index = 0) {
  const tipo = o.tipo || null;
  const nombre = typeof o.nombre === "string" ? o.nombre.trim() : "";
  const importeRaw = o.importe ?? o.importeObjetivo;
  const reservadoRaw = o.importeReservado ?? o.reservado ?? o.yaReservado;
  const plazoRaw = o.plazoAnios ?? o.plazo;
  const fechaRaw = o.fechaObjetivo ?? o.fecha;
  const importe = importeRaw == null || importeRaw === "" ? null : Math.max(0, Number(importeRaw) || 0);
  const reservado = reservadoRaw == null || reservadoRaw === "" ? null : Math.max(0, Number(reservadoRaw) || 0);
  const plazo = plazoRaw == null || plazoRaw === "" ? null : Math.max(0, Number(plazoRaw) || 0);
  const fecha = typeof fechaRaw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fechaRaw) ? fechaRaw : null;
  const prioridad = PRIORIDADES_OBJETIVO.includes(o.prioridad) ? o.prioridad : null;
  const aportacionMensual = o.aportacionMensual == null || o.aportacionMensual === "" ? null : Math.max(0, Number(o.aportacionMensual) || 0);
  return {
    ...o,
    id: o.id || crearIdObjetivo(),
    tipo,
    nombre,
    importeObjetivo: importe,
    importeReservado: reservado,
    plazoAnios: plazo,
    fechaObjetivo: fecha,
    prioridad,
    aportacionMensual
  };
}

export function normalizarObjetivos(datos = {}) {
  if (Array.isArray(datos.objetivos) && datos.objetivos.length) return datos.objetivos.map((o, i) => normalizarObjetivo(o, i));
  if (datos.objetivo) {
    const legacy = datos.objetivo;
    const tieneDatos = !!(legacy.tipo || legacy.nombre || Number(legacy.importe) > 0 || Number(legacy.importeObjetivo) > 0 || Number(legacy.importeReservado) > 0 || Number(legacy.aportacionMensual) > 0 || Number(legacy.plazoAnios) > 0 || legacy.fechaObjetivo);
    if (tieneDatos) return [normalizarObjetivo(legacy, 0)];
  }
  return [];
}

export function calcularCapacidadFinanciera(datos = {}) {
  const totalIngresos = (Number(datos.ingresos) || 0) + (Number(datos.otrosIngresos) || 0);
  const gastosFijos = totalMensual(datos.gastosFijos || {});
  const gastosDiscrecionales = totalMensual(datos.gastosDiscrecionales || {});
  const cuotasDeuda = (datos.deudas || []).reduce((s, d) => s + Math.max(0, Number(d.cuota) || 0), 0);
  const tieneIngresos = totalIngresos > 0;
  const capacidadBruta = tieneIngresos ? totalIngresos - gastosFijos - gastosDiscrecionales - cuotasDeuda : null;
  return {
    ingresos: totalIngresos,
    gastosFijos,
    gastosDiscrecionales,
    cuotasDeuda,
    gastosTotales: tieneIngresos ? gastosFijos + gastosDiscrecionales + cuotasDeuda : null,
    capacidadMensual: capacidadBruta,
    capacidadParaObjetivos: tieneIngresos ? Math.max(0, capacidadBruta) : null
  };
}

export function obtenerHorizonteAnios(o = {}) {
  if (o.fechaObjetivo) {
    const hoy = new Date();
    const fecha = new Date(o.fechaObjetivo + "T23:59:59");
    if (!isNaN(fecha.getTime())) return Math.max(0, (fecha - hoy) / (365.25 * 24 * 60 * 60 * 1000));
  }
  return o.plazoAnios == null ? null : Math.max(0, Number(o.plazoAnios) || 0);
}

export function objetivoHorizonte(plazo) {
  if (plazo == null || Number(plazo) <= 0) return "sin definir";
  return Number(plazo) < 3 ? "corto" : Number(plazo) < 5 ? "medio-corto" : Number(plazo) <= 10 ? "medio" : "largo";
}

export function recomendacionObjetivoPorHorizonte(plazo) {
  const anios = plazo == null ? null : Number(plazo);
  if (anios != null && anios > 0 && anios < 3) return {
    modo: "ahorrar",
    titulo: "Prioriza el ahorro",
    texto: "Por el plazo corto, este dinero necesita estabilidad y disponibilidad. No conviene depender de las fluctuaciones del mercado para una meta cercana."
  };
  if (anios != null && anios >= 3 && anios < 5) return {
    modo: "prudencia",
    titulo: "Ahorrar con prudencia",
    texto: "El plazo todavía deja poco margen ante una caída del mercado. Prioriza estabilidad y liquidez; cualquier inversión debería ser compatible con la fecha en la que necesitarás el dinero."
  };
  if (anios != null && anios >= 5) return {
    modo: "invertir",
    titulo: "Puedes valorar invertir",
    texto: "El horizonte ofrece más margen para asumir fluctuaciones. Puede tener sentido valorar una estrategia diversificada y coherente con tu perfil y con la necesidad de liquidez del objetivo."
  };
  return {
    modo: "pendiente",
    titulo: "Indica cuándo necesitarás el dinero",
    texto: "Cuando indiques cuándo necesitarás el dinero, la herramienta orientará automáticamente sobre si priorizar ahorro o valorar inversión."
  };
}

export function objetivoCalculado(o = {}) {
  const importe = o.importeObjetivo == null ? null : Math.max(0, Number(o.importeObjetivo) || 0);
  const reservado = o.importeReservado == null ? null : Math.max(0, Number(o.importeReservado) || 0);
  const reservadoAplicado = importe == null ? 0 : Math.min(importe, reservado == null ? 0 : reservado);
  const restante = importe == null ? null : Math.max(0, importe - reservadoAplicado);
  const plazoDirecto = o.plazoAnios == null ? null : Math.max(0, Number(o.plazoAnios) || 0);
  const plazo = obtenerHorizonteAnios(o);
  const meses = plazo != null && plazo > 0 ? plazo * 12 : null;
  const mensualNecesaria = restante == null ? null : restante <= 0 ? 0 : meses > 0 ? restante / meses : null;
  const aportacion = o.aportacionMensual == null ? null : Math.max(0, Number(o.aportacionMensual) || 0);
  const diferenciaAportacion = mensualNecesaria == null || aportacion == null ? null : aportacion - mensualNecesaria;
  return {
    ...o,
    importeObjetivo: importe,
    importeReservado: reservado,
    importeReservadoAplicado: reservadoAplicado,
    importeRestante: restante,
    horizonteAniosCalculado: plazo,
    horizonteCategoria: objetivoHorizonte(plazo),
    recomendacionHorizonte: recomendacionObjetivoPorHorizonte(plazo),
    mesesRestantes: meses,
    aportacionNecesaria: mensualNecesaria,
    aportacionMensual: aportacion,
    diferenciaAportacion,
    cubierto: importe != null && importe > 0 && restante <= 0,
    progreso: importe != null && importe > 0 ? Math.min(100, Math.max(0, reservadoAplicado / importe * 100)) : 0
  };
}

export function calcularFondoEmergencia(datos = {}) {
  const base = calcularCapacidadFinanciera(datos);
  if (base.capacidadMensual == null) return {
    mesesObjetivo: 6,
    objetivo: null,
    gastosEsenciales: null,
    coberturaMeses: null,
    falta: null
  };
  const gastosEsenciales = base.gastosFijos + base.cuotasDeuda;
  const objetivo = Math.max(0, gastosEsenciales * 6);
  const ahorro = datos.ahorroActual == null ? null : Math.max(0, Number(datos.ahorroActual) || 0);
  const cobertura = gastosEsenciales > 0 && ahorro != null ? ahorro / gastosEsenciales : gastosEsenciales === 0 && ahorro != null ? 6 : null;
  return {
    mesesObjetivo: 6,
    objetivo,
    gastosEsenciales,
    coberturaMeses: cobertura,
    falta: ahorro == null ? null : Math.max(0, objetivo - ahorro)
  };
}

export function calcularPlanObjetivos(datos = {}) {
  const base = calcularCapacidadFinanciera(datos);
  const objetivosBase = normalizarObjetivos(datos).map(objetivoCalculado);
  const capacidad = base.capacidadParaObjetivos;
  const aportacionComprometida = objetivosBase.reduce((s, o) => s + (o.aportacionMensual == null ? 0 : o.aportacionMensual), 0);
  const aportacionNecesariaTotal = objetivosBase.reduce((s, o) => s + (o.aportacionNecesaria == null ? 0 : o.aportacionNecesaria), 0);
  const deficitCapacidad = capacidad == null ? null : Math.max(0, aportacionComprometida - capacidad);
  const deficitNecesidad = capacidad == null ? null : Math.max(0, aportacionNecesariaTotal - capacidad);
  const deficitRitmoElegido = capacidad == null ? null : Math.max(0, aportacionNecesariaTotal - aportacionComprometida);
  const margenTrasAportaciones = capacidad == null ? null : capacidad - aportacionComprometida;
  const fondo = calcularFondoEmergencia(datos);
  const ahorroActual = datos.ahorroActual == null ? null : Math.max(0, Number(datos.ahorroActual) || 0);
  const reservadoCorto = objetivosBase.filter(o => o.horizonteCategoria === "corto" || o.horizonteCategoria === "medio-corto").reduce((s, o) => s + (o.importeReservadoAplicado || 0), 0);
  const capitalRealmenteInvertible = fondo.objetivo != null && ahorroActual != null ? Math.max(0, ahorroActual - fondo.objetivo - reservadoCorto) : null;
  const prioridadSinDefinir = objetivosBase.some(o => !o.prioridad);
  const ordenPrioridad = {
    alta: 0,
    media: 1,
    baja: 2
  };
  const orden = [...objetivosBase].sort((a, b) => {
    const pa = a.prioridad ? ordenPrioridad[a.prioridad] : 99,
      pb = b.prioridad ? ordenPrioridad[b.prioridad] : 99;
    return pa - pb || (a.horizonteAniosCalculado ?? Infinity) - (b.horizonteAniosCalculado ?? Infinity) || (b.importeRestante || 0) - (a.importeRestante || 0);
  });
  let capacidadRestante = capacidad;
  const objetivos = orden.map((o, index) => {
    const capacidadAntes = capacidadRestante;
    const elegido = o.aportacionMensual;
    const esfuerzoReferencia = elegido != null ? elegido : o.aportacionNecesaria != null ? o.aportacionNecesaria : 0;
    const capacidadAsignada = capacidad == null ? null : Math.min(capacidadAntes, Math.max(0, esfuerzoReferencia));
    if (capacidadRestante != null && elegido != null) capacidadRestante = Math.max(0, capacidadRestante - elegido);
    const datosCompletos = o.importeObjetivo != null && o.horizonteAniosCalculado != null && o.horizonteAniosCalculado > 0;
    let estado = "pendiente";
    if (o.cubierto) estado = "completado";else if (datosCompletos && capacidad != null) {
      const esfuerzoElegido = elegido != null ? elegido : o.aportacionNecesaria;
      const superaCapacidad = elegido != null && elegido > capacidadAntes;
      const ritmoInsuficiente = o.aportacionNecesaria != null && o.aportacionNecesaria > capacidadAntes;
      if (superaCapacidad || ritmoInsuficiente) estado = "no_viable";else if (elegido != null && o.aportacionNecesaria != null && elegido < o.aportacionNecesaria) estado = "ajustado";else if (capacidadAntes - esfuerzoElegido <= Math.max(25, capacidadAntes * 0.10)) estado = "ajustado";else estado = "viable";
    } else if (datosCompletos) estado = "pendiente_capacidad";
    const deficitAportacion = elegido != null && capacidad != null ? Math.max(0, elegido - capacidadAntes) : null;
    const deficitRitmo = o.aportacionNecesaria != null && capacidad != null ? Math.max(0, o.aportacionNecesaria - capacidadAntes) : null;
    return {
      ...o,
      orden: index + 1,
      capacidadAntes,
      capacidadAsignada,
      deficitAportacion,
      deficitRitmo,
      estadoViabilidad: estado
    };
  });
  const principal = orden.find(o => o.prioridad) || (objetivos.length === 1 ? objetivos[0] : null);
  const habit = datos.habito;
  const ejecucion = habit === "No tengo ni idea de a dónde va" ? {
    nivel: "pendiente",
    texto: "Mejora primero el control de tus gastos antes de comprometer una aportación elevada."
  } : habit === "Más o menos controlado, pero sin apuntar nada" ? {
    nivel: "intermedio",
    texto: "Una aportación automática y una revisión periódica pueden ayudarte a sostener el plan."
  } : habit === "Todo apuntado y bajo control" ? {
    nivel: "fuerte",
    texto: "Tu seguimiento facilita mantener las aportaciones y revisar el progreso."
  } : {
    nivel: "pendiente",
    texto: "Completa tus hábitos financieros para valorar mejor la capacidad de ejecución del plan."
  };
  const conflictoObjetivos = capacidad != null && aportacionComprometida > capacidad;
  return {
    ...base,
    ahorroActual,
    objetivos,
    ordenObjetivos: orden,
    aportacionComprometida,
    aportacionTotal: aportacionComprometida,
    aportacionNecesariaTotal,
    deficitMensual: deficitCapacidad,
    deficitNecesidad,
    deficitRitmoElegido,
    margenTrasAportaciones,
    principal,
    prioridadSinDefinir,
    fondoEmergenciaNecesario: fondo.objetivo,
    reservadoCorto,
    capitalRealmenteInvertible,
    capitalInvertibleCompleto: fondo.objetivo != null && ahorroActual != null,
    capacidadMensual: base.capacidadMensual,
    capacidadParaObjetivos: capacidad,
    ejecucion,
    conflictoObjetivos,
    objetivosOrdenados: orden.map(o => o.id)
  };
}

export function calcularDiagnosticoAmpliado({
  datos,
  cuentas = [],
  inversiones = [],
  planObjetivos
}) {
  const positivos = [];
  const preocupantes = [];
  const capacidad = planObjetivos.capacidadMensual;
  const ratioAhorro = planObjetivos.ingresos > 0 ? capacidad / planObjetivos.ingresos : null;

  // 1. Capacidad de ahorro
  if (capacidad != null) {
    if (capacidad <= 0) {
      preocupantes.push({
        titulo: "Gastas más de lo que ingresas",
        texto: `Tu margen mensual actual es ${euros(capacidad)}. Cualquier imprevisto (una avería, una factura inesperada) tendría que pagarse con deuda o con tus ahorros.`
      });
    } else if (ratioAhorro != null && ratioAhorro < 0.10) {
      preocupantes.push({
        titulo: "Tu margen de ahorro es reducido",
        texto: `Ahorras ${pct(ratioAhorro * 100)} de lo que ingresas. Por debajo del 10% cuesta avanzar hacia tus objetivos y hacia un colchón de seguridad.`
      });
    } else {
      positivos.push({
        titulo: "Ahorras una parte saludable de tus ingresos",
        texto: `Actualmente ahorras ${pct(ratioAhorro * 100)} de lo que ingresas cada mes.`
      });
    }
  }

  // 2. Liquidez / fondo de emergencia — usa el saldo real de tus Cuentas si las
  // tienes registradas; si no, usa el ahorro manual introducido en Diagnóstico.
  const liquidezReal = cuentas.length > 0 ? cuentas.reduce((s, c) => s + (Number(c.saldo) || 0), 0) : Number(datos.ahorroActual) || 0;
  const gastosEsenciales = planObjetivos.fondoEmergenciaNecesario != null ? planObjetivos.fondoEmergenciaNecesario / 6 : null;
  const coberturaMeses = gastosEsenciales != null && gastosEsenciales > 0 ? liquidezReal / gastosEsenciales : null;
  if (coberturaMeses != null) {
    if (coberturaMeses < 3) {
      preocupantes.push({
        titulo: "Tu colchón de emergencia es insuficiente",
        texto: `Con tu liquidez actual (${euros(liquidezReal)}) cubrirías ${coberturaMeses.toFixed(1)} meses de gastos esenciales. Por debajo de 3 meses, un imprevisto puede obligarte a endeudarte.`
      });
    } else if (coberturaMeses < 6) {
      preocupantes.push({
        titulo: "Tu fondo de emergencia es mejorable",
        texto: `Cubre ${coberturaMeses.toFixed(1)} meses de gastos esenciales. La referencia recomendada son 6 meses.`
      });
    } else {
      positivos.push({
        titulo: "Tu fondo de emergencia es sólido",
        texto: `Cubre ${coberturaMeses.toFixed(1)} meses de gastos esenciales, por encima del mínimo recomendado.`
      });
    }
  }

  // 3. Deuda cara
  const deudasActivas = (datos.deudas || []).filter(d => Number(d.pendiente) > 0);
  const deudaCara = deudasActivas.filter(d => Number(d.tasa) >= 10);
  if (deudaCara.length > 0) {
    const nombres = deudaCara.map(d => d.nombre || "deuda sin nombre").join(", ");
    preocupantes.push({
      titulo: "Tienes deuda con un interés elevado",
      texto: `${nombres} tiene(n) un interés del 10% o más. Ese coste suele superar la rentabilidad esperada de invertir, así que normalmente conviene amortizarla antes de invertir más.`
    });
  } else if (deudasActivas.length > 0) {
    positivos.push({
      titulo: "Tu deuda actual tiene un coste moderado",
      texto: "Ninguna de tus deudas activas supera el 10% de interés."
    });
  } else {
    positivos.push({
      titulo: "No tienes deudas activas registradas",
      texto: "Esto te da más margen para ahorrar e invertir sin compromisos previos."
    });
  }

  // 4. Exposición de la cartera de inversión
  if (inversiones.length > 0) {
    const totalInvertido = inversiones.reduce((s, inv) => s + (Number(inv.valorActual) || 0), 0);
    const tiposUnicos = new Set(inversiones.map(inv => inv.tipo)).size;
    if (tiposUnicos === 1 && inversiones.length >= 2) {
      preocupantes.push({
        titulo: "Tu cartera está concentrada en un único tipo de activo",
        texto: `Toda tu inversión (${euros(totalInvertido)}) está en "${inversiones[0].tipo}". Repartir entre varios tipos de activo reduce el impacto de que uno de ellos baje de valor.`
      });
    } else {
      positivos.push({
        titulo: "Tu cartera está repartida en varios tipos de activo",
        texto: `Tienes inversión en ${tiposUnicos} tipos de activo distintos.`
      });
    }
    if (gastosEsenciales != null && liquidezReal > gastosEsenciales * 12 && totalInvertido < liquidezReal) {
      preocupantes.push({
        titulo: "Tienes bastante liquidez sin invertir",
        texto: `Tu liquidez (${euros(liquidezReal)}) supera ampliamente tu fondo de emergencia recomendado. Salvo que la necesites pronto, ese exceso suele perder poder adquisitivo con la inflación si se queda parado.`
      });
    }
  }

  // 5. Objetivos financieros
  if (planObjetivos.objetivos.length > 0) {
    const noViables = planObjetivos.objetivos.filter(o => o.estadoViabilidad === "no_viable");
    if (planObjetivos.conflictoObjetivos) {
      preocupantes.push({
        titulo: "Tus objetivos piden más de lo que puedes aportar",
        texto: `En conjunto necesitas ${euros(planObjetivos.aportacionComprometida)}/mes, pero tu capacidad actual es ${euros(planObjetivos.capacidadParaObjetivos)}/mes.`
      });
    } else if (noViables.length > 0) {
      preocupantes.push({
        titulo: "Alguno de tus objetivos no es viable con el ritmo actual",
        texto: `${noViables.map(o => o.nombre || "un objetivo").join(", ")} necesita más aportación mensual de la que tu capacidad actual permite, dado el plazo indicado.`
      });
    } else {
      positivos.push({
        titulo: "Tus objetivos son viables con tu ritmo actual",
        texto: "Con tu capacidad de ahorro y los plazos indicados, tus objetivos registrados son alcanzables."
      });
    }
  }
  return {
    positivos,
    preocupantes,
    liquidezReal,
    coberturaMeses
  };
}

export function calcularPrioridades({
  datos,
  inversiones = [],
  planObjetivos,
  diagnostico
}) {
  const capacidad = planObjetivos.capacidadMensual;
  const coberturaMeses = diagnostico.coberturaMeses;
  const deudasActivas = (datos.deudas || []).filter(d => Number(d.pendiente) > 0);
  const deudaCara = deudasActivas.filter(d => Number(d.tasa) >= 10);
  const objetivosProblema = planObjetivos.conflictoObjetivos || planObjetivos.objetivos.some(o => o.estadoViabilidad === "no_viable");
  const nombresDeudaCara = deudaCara.map(d => d.nombre || "una deuda").join(", ");

  const pasos = [{
    id: "seguridad",
    titulo: "Ajusta tu presupuesto",
    texto: capacidad != null ? `Ahora mismo tu margen mensual es ${euros(capacidad)}. Antes de pensar en deudas, fondo de emergencia o inversión, necesitas que ese número deje de ser negativo.` : "Introduce tus ingresos y gastos para poder evaluar tu situación.",
    satisfecho: capacidad == null || capacidad > 0
  }, {
    id: "colchon",
    titulo: "Consigue un colchón mínimo de seguridad",
    texto: `Tu liquidez actual cubre ${coberturaMeses == null ? "una parte todavía por calcular de" : coberturaMeses.toFixed(1)} tus gastos esenciales de un mes. Antes de atacar deudas o invertir, conviene tener al menos 1 mes cubierto para no depender de más deuda ante cualquier imprevisto.`,
    satisfecho: coberturaMeses == null || coberturaMeses >= 1
  }, {
    id: "deuda_cara",
    titulo: "Prioriza tu deuda más cara",
    texto: deudaCara.length > 0 ? `${nombresDeudaCara} tiene(n) un interés del 10% o más. Ese coste suele superar lo que ganarías invirtiendo, así que amortizarla es más prioritario que invertir.` : "No tienes deuda con un interés elevado pendiente.",
    satisfecho: deudaCara.length === 0
  }, {
    id: "fondo_emergencia",
    titulo: "Completa tu fondo de emergencia",
    texto: `Tu colchón cubre ${coberturaMeses == null ? "una parte todavía por calcular" : coberturaMeses.toFixed(1) + " de los 6"} meses de gasto recomendados. Complétalo antes de invertir con fuerza, así no tendrás que deshacer inversiones ante un imprevisto.`,
    satisfecho: coberturaMeses == null || coberturaMeses >= 6
  }, {
    id: "inversion",
    titulo: "Valora empezar o aumentar tu inversión",
    texto: capacidad != null && capacidad > 0 ? "Con tu deuda cara resuelta y el fondo de emergencia cubierto, tienes margen para valorar destinar tu ahorro mensual a inversión, según tu perfil de riesgo." : "Todavía no tienes margen mensual para destinar a inversión.",
    satisfecho: inversiones.length > 0 || capacidad == null || capacidad <= 0
  }, {
    id: "objetivos",
    titulo: "Revisa tus objetivos",
    texto: objetivosProblema ? "Alguno de tus objetivos necesita más aportación de la que tu capacidad actual permite. Revísalo para ajustar plazo o importe." : "Con tu base financiera cubierta, revisa tus objetivos y ajusta su ritmo si tu situación cambia.",
    satisfecho: planObjetivos.objetivos.length === 0 || !objetivosProblema
  }];
  let actualAsignado = false;
  const pasosConEstado = pasos.map(p => {
    let estado;
    if (p.satisfecho) estado = "hecho";else if (!actualAsignado) {
      estado = "actual";
      actualAsignado = true;
    } else estado = "pendiente";
    return {
      ...p,
      estado
    };
  });
  const todoEnOrden = !actualAsignado;
  return {
    pasos: pasosConEstado,
    todoEnOrden
  };
}

export function calcularPlanFinanciero({
  datos,
  cuentas = [],
  inversiones = [],
  planObjetivos,
  diagnostico,
  prioridad,
  perfil
}) {
  const capacidad = planObjetivos.capacidadMensual;
  const liquidezReal = diagnostico.liquidezReal;
  const fondo = calcularFondoEmergencia(datos);
  const gastosEsenciales = fondo.gastosEsenciales;
  const metaColchonInicial = gastosEsenciales != null ? gastosEsenciales : null;
  const deudasActivas = (datos.deudas || []).filter(d => Number(d.pendiente) > 0);
  const deudaCara = deudasActivas.filter(d => Number(d.tasa) >= 10);
  const restanteDeudaCara = deudaCara.reduce((s, d) => s + Number(d.pendiente || 0), 0);
  const totalInvertido = inversiones.reduce((s, inv) => s + (Number(inv.valorActual) || 0), 0);
  const estadoPorId = id => {
    const paso = prioridad.pasos.find(p => p.id === id);
    if (!paso) return "completado";
    return paso.estado === "hecho" ? "completado" : paso.estado === "actual" ? "en_curso" : "pendiente";
  };
  const bloqueadoPorPresupuesto = prioridad.pasos.find(p => p.id === "seguridad")?.estado === "actual";
  const restanteColchon = metaColchonInicial != null ? Math.max(0, metaColchonInicial - liquidezReal) : null;
  const restanteFondo = fondo.objetivo != null ? Math.max(0, fondo.objetivo - liquidezReal) : null;
  const fases = [{
    id: "colchon_inicial",
    titulo: "Colchón inicial",
    objetivoTexto: "Conseguir una reserva mínima de seguridad (1 mes de gastos esenciales).",
    meta: metaColchonInicial,
    actual: liquidezReal,
    restante: restanteColchon,
    progreso: metaColchonInicial > 0 ? Math.min(100, liquidezReal / metaColchonInicial * 100) : null,
    accion: restanteColchon > 0 ? `Aparta ${euros(restanteColchon)} más para llegar a 1 mes de colchón.` : "Colchón mínimo conseguido.",
    estado: bloqueadoPorPresupuesto ? "pendiente" : estadoPorId("colchon")
  }, {
    id: "deuda",
    titulo: "Deuda cara",
    objetivoTexto: "Priorizar y amortizar la deuda de mayor coste (interés del 10% o más).",
    meta: null,
    actual: null,
    restante: restanteDeudaCara,
    progreso: null,
    accion: restanteDeudaCara > 0 ? `Destina tu excedente mensual a amortizar ${deudaCara.map(d => d.nombre || "esta deuda").join(", ")} mediante bola de nieve o avalancha.` : "No tienes deuda cara pendiente.",
    estado: bloqueadoPorPresupuesto ? "pendiente" : estadoPorId("deuda_cara")
  }, {
    id: "fondo_emergencia",
    titulo: "Fondo de emergencia",
    objetivoTexto: "Alcanzar el objetivo de 6 meses de gastos esenciales.",
    meta: fondo.objetivo,
    actual: liquidezReal,
    restante: restanteFondo,
    progreso: fondo.objetivo > 0 ? Math.min(100, liquidezReal / fondo.objetivo * 100) : null,
    accion: restanteFondo > 0 ? `Te faltan ${euros(restanteFondo)} para completar 6 meses de fondo de emergencia.` : "Fondo de emergencia completo.",
    estado: bloqueadoPorPresupuesto ? "pendiente" : estadoPorId("fondo_emergencia")
  }, {
    id: "inversion",
    titulo: "Inversión",
    objetivoTexto: "Definir cuánto puedes destinar a invertir de forma sostenible.",
    meta: null,
    actual: totalInvertido,
    restante: null,
    progreso: null,
    accion: capacidad > 0 ? `Con tu margen mensual (${euros(capacidad)}) puedes valorar destinar una parte a inversión, según tu perfil de riesgo${perfil ? " (" + perfil + ")" : ""}.` : "Todavía no tienes margen mensual libre para invertir.",
    estado: bloqueadoPorPresupuesto ? "pendiente" : estadoPorId("inversion")
  }, {
    id: "objetivos",
    titulo: "Objetivos",
    objetivoTexto: "Canalizar tu ahorro hacia tus metas: casa, coche, vacaciones, jubilación u otros.",
    meta: null,
    actual: planObjetivos.objetivos.length,
    restante: null,
    progreso: null,
    accion: planObjetivos.principal ? `Tu objetivo prioritario es "${planObjetivos.principal.nombre || "tu objetivo"}"; te faltan ${planObjetivos.principal.importeRestante == null ? "datos por completar" : euros(planObjetivos.principal.importeRestante)}.` : "Define tus objetivos financieros para poder guiar tu ahorro hacia ellos.",
    estado: bloqueadoPorPresupuesto ? "pendiente" : estadoPorId("objetivos")
  }];
  const partesSituacion = [];
  if (deudaCara.length > 0) partesSituacion.push(`tienes deuda con un interés del 10% o más (${deudaCara.map(d => d.nombre || "una deuda").join(", ")})`);
  if (fases[2].estado !== "completado") partesSituacion.push("un fondo de emergencia insuficiente");
  if (inversiones.length > 0) partesSituacion.push("ya tienes inversiones en marcha");
  const resumenSituacion = bloqueadoPorPresupuesto ? "Tu situación: ahora mismo gastas más de lo que ingresas." : partesSituacion.length > 0 ? `Tu situación: ${partesSituacion.join(", ")}.` : "Tu situación: tu base financiera está en orden.";
  const recomendaciones = bloqueadoPorPresupuesto ? ["Ajustar tu presupuesto antes de nada, revisando ingresos y gastos."] : fases.filter(f => f.estado !== "completado").map(f => f.accion);
  if (recomendaciones.length === 0) recomendaciones.push("Sigue así: revisa tu plan periódicamente y ajusta tus objetivos si tu situación cambia.");
  return {
    fases,
    resumenSituacion,
    recomendaciones,
    bloqueadoPorPresupuesto
  };
}

export function objetivoLegadoDesdeColeccion(objetivos = []) {
  const o = objetivos[0];
  return o ? {
    tipo: o.tipo || null,
    nombre: o.nombre || "",
    importe: o.importeObjetivo,
    plazoAnios: o.plazoAnios,
    fechaObjetivo: o.fechaObjetivo || null,
    importeReservado: o.importeReservado,
    prioridad: o.prioridad || null,
    aportacionMensual: o.aportacionMensual,
    objetivos: objetivos
  } : {
    tipo: null,
    nombre: "",
    importe: null,
    plazoAnios: null,
    fechaObjetivo: null,
    importeReservado: null,
    prioridad: null,
    aportacionMensual: null,
    objetivos: []
  };
}

export function sincronizarObjetivos(datos, objetivos) {
  return {
    ...datos,
    objetivos,
    objetivo: objetivoLegadoDesdeColeccion(objetivos)
  };
}

export const datosVacios = () => ({
  ingresos: 0,
  otrosIngresos: 0,
  gastosFijos: emptyCampo(GASTOS_FIJOS_DEF),
  gastosDiscrecionales: emptyCampo(GASTOS_DISC_DEF),
  deudas: DEUDAS_DEF.map(d => ({
    ...d
  })),
  ahorroActual: 0,
  habito: null,
  objetivo: {
    tipo: null,
    nombre: "",
    importe: null,
    plazoAnios: null,
    fechaObjetivo: null,
    importeReservado: null,
    aportacionMensual: null,
    prioridad: null,
    objetivos: []
  },
  objetivos: []
});

export function slugify(s) {
  return (s || "").toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function fmtFecha(d) {
  try {
    return new Date(d).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return '';
  }
}

export function escHtml(s) {
  return (s || '').replace(/[&<>]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
  })[c]);
}

export function mdToHtml(md) {
  const lineas = (md || '').split('\n');
  let html = '';
  let enLista = false;
  for (let raw of lineas) {
    const linea = raw.trim();
    const encabezado = linea.match(/^#{1,6}\s*(.+)$/);
    if (encabezado) {
      if (enLista) {
        html += '</ul>';
        enLista = false;
      }
      html += `<h2 style="font-size:1.35rem;font-weight:800;margin:28px 0 12px;color:inherit;">${escHtml(encabezado[1])}</h2>`;
    } else if (linea.startsWith('- ')) {
      if (!enLista) {
        html += '<ul>';
        enLista = true;
      }
      html += `<li>${escHtml(linea.slice(2)).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')}</li>`;
    } else if (linea === '') {
      if (enLista) {
        html += '</ul>';
        enLista = false;
      }
    } else {
      if (enLista) {
        html += '</ul>';
        enLista = false;
      }
      html += `<p>${escHtml(linea).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')}</p>`;
    }
  }
  if (enLista) html += '</ul>';
  return html;
}
