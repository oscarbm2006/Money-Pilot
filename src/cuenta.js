const { useState } = React;

import { C, I, supa, GASTOS_FIJOS_DEF, GASTOS_DISC_DEF } from './constantes.js';
import { euros, pct, totalMensual } from './calculos.js';

// Tablas con datos del usuario (todas tienen la columna user_id)
export const TABLAS_USUARIO = ["cuentas", "deudas", "inversiones", "activos", "seguimiento", "finanzas_perfil", "finanzas_historial", "finanzas_quiz", "plan_financiero"];
export const PALABRA_CONFIRMACION = "ELIMINAR";
const PAGINA = 1000;
// finanzas_perfil y finanzas_quiz tienen una sola fila por usuario y no tienen columna id
const SIN_ID = new Set(["finanzas_perfil", "finanzas_quiz"]);

async function leerTabla(cliente, tabla, userId) {
  const filas = [];
  for (let desde = 0;; desde += PAGINA) {
    let q = cliente.from(tabla).select("*").eq("user_id", userId);
    if (!SIN_ID.has(tabla)) q = q.order("id", { ascending: true });
    const { data, error } = await q.range(desde, desde + PAGINA - 1);
    if (error) throw new Error("No se pudo leer " + tabla);
    filas.push(...(data || []));
    if (!data || data.length < PAGINA) break;
  }
  return filas;
}

// Reúne TODOS los datos del usuario (el servidor solo devuelve los suyos)
export async function reunirDatosUsuario(user, cliente = supa, ahora = new Date()) {
  const resultado = {
    exportado_el: ahora.toISOString(),
    usuario: { id: user.id, email: user.email }
  };
  for (const tabla of TABLAS_USUARIO) {
    resultado[tabla] = await leerTabla(cliente, tabla, user.id);
  }
  return resultado;
}

export function nombreArchivoDatos(ahora = new Date()) {
  return "moneypilot-mis-datos-" + ahora.toISOString().slice(0, 10) + ".json";
}

export function descargarArchivo(nombre, contenido, tipo, doc = document, urlApi = URL) {
  const blob = new Blob([contenido], { type: tipo });
  const url = urlApi.createObjectURL(blob);
  const a = doc.createElement("a");
  a.href = url;
  a.download = nombre;
  doc.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => urlApi.revokeObjectURL(url), 1000);
}

export function descargarJSON(nombre, objeto, doc = document, urlApi = URL) {
  descargarArchivo(nombre, JSON.stringify(objeto, null, 2), "application/json", doc, urlApi);
}

export function nombreArchivoInforme(ahora = new Date()) {
  return "moneypilot-mi-informe-" + ahora.toISOString().slice(0, 10) + ".html";
}

// ---------------------------------------------------------------------------
// Informe legible ("Mis datos"): un único archivo HTML que se abre en el navegador,
// se puede imprimir o guardar como PDF y no carga nada de internet.
// ---------------------------------------------------------------------------
export const SECCIONES_INFORME = ["cuentas", "deudas", "inversiones", "activos", "seguimiento", "finanzas_perfil", "finanzas_historial", "finanzas_quiz", "plan_financiero"];

const esc = v => String(v === undefined || v === null ? "" : v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const num = v => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const dinero = (v, moneda) => {
  const n = num(v);
  if (n === null) return "—";
  return moneda && moneda !== "EUR" ? n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " " + moneda : euros(n, 2);
};
const numero = v => {
  const n = num(v);
  return n === null ? "—" : n.toLocaleString("es-ES", { maximumFractionDigits: 6, useGrouping: "always" });
};
const porcentaje = v => {
  const n = num(v);
  return n === null ? "—" : pct(n, 2);
};
const texto = v => v === null || v === undefined || v === "" ? "—" : String(v);
const fecha = v => {
  if (!v) return "—";
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s.slice(8, 10) + "/" + s.slice(5, 7) + "/" + s.slice(0, 4);
  const d = new Date(s);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
};
const TIPOS_DEUDA = { tarjeta: "Tarjeta de crédito", prestamo_personal: "Préstamo personal", coche: "Préstamo de coche", hipoteca: "Hipoteca", estudios: "Préstamo de estudios", otro: "Otra deuda" };
const TIPOS_INVERSION = { accion: "Acciones", etf: "ETF", fondo: "Fondo indexado", plan_pensiones: "Plan de pensiones", otro: "Otro" };
const FRECUENCIAS_TEXTO = { mensual: "Mensual", trimestral: "Trimestral", anual: "Anual" };
const FRECUENCIAS_GASTO = { mensual: "al mes", trimestral: "al trimestre", anual: "al año" };
const ORIGENES = { manual: "Manual", calculo: "Cálculo", migracion: "Migración", auto: "Automático" };
const ESTRATEGIAS = { nieve: "Bola de nieve", avalancha: "Avalancha" };
const PRIORIDADES = { alta: "Alta", media: "Media", baja: "Baja" };
// Los totales suman solo importes en euros: sumar euros con dólares daría una cifra sin sentido.
const esEuro = f => !f.moneda || f.moneda === "EUR";
const suma = (filas, campo) => (filas || []).filter(esEuro).reduce((a, f) => a + (num(f[campo]) || 0), 0);
const hayOtraMoneda = filas => (filas || []).some(f => !esEuro(f));

function tabla(columnas, filas, vacio) {
  if (!filas || filas.length === 0) return '<p class="vacio">' + esc(vacio || "No hay datos guardados en esta sección.") + "</p>";
  const cab = columnas.map(c => "<th" + (c.num ? ' class="n"' : "") + ">" + esc(c.t) + "</th>").join("");
  const cuerpo = filas.map(f => "<tr>" + columnas.map(c => "<td" + (c.num ? ' class="n"' : "") + ">" + esc(c.v(f)) + "</td>").join("") + "</tr>").join("");
  return '<div class="scroll"><table><thead><tr>' + cab + "</tr></thead><tbody>" + cuerpo + "</tbody></table></div>";
}
const seccion = (titulo, cuerpo, nota) => "<section><h2>" + esc(titulo) + "</h2>" + (nota ? '<p class="nota">' + esc(nota) + "</p>" : "") + cuerpo + "</section>";
const dato = (etiqueta, valor) => '<div class="dato"><span>' + esc(etiqueta) + "</span><b>" + esc(valor) + "</b></div>";

// Se muestran TODOS los conceptos guardados (aunque no figuren en la lista de su grupo), para no perder ningún dato.
const DEFS_GASTOS = [...GASTOS_FIJOS_DEF, ...GASTOS_DISC_DEF];
const humanizar = k => String(k).replace(/([A-Z])/g, " $1").replace(/[_-]+/g, " ").trim().replace(/^./, c => c.toUpperCase());
// Deja solo los conceptos bien formados (un dato corrupto no debe impedir descargar el informe)
const gastosLimpios = grupo => {
  const g = grupo && typeof grupo === "object" && !Array.isArray(grupo) ? grupo : {};
  const limpio = {};
  Object.keys(g).forEach(k => {
    if (g[k] && typeof g[k] === "object") limpio[k] = g[k];
  });
  return limpio;
};
function filasGastos(grupo) {
  const g = grupo && typeof grupo === "object" && !Array.isArray(grupo) ? grupo : {};
  const orden = k => {
    const i = DEFS_GASTOS.findIndex(d => d.key === k);
    return i < 0 ? 9999 : i;
  };
  return Object.keys(g).sort((a, b) => orden(a) - orden(b)).map(k => {
    const def = DEFS_GASTOS.find(d => d.key === k);
    const item = g[k] && typeof g[k] === "object" ? g[k] : {};
    return { etiqueta: def ? def.label : humanizar(k), valor: num(item.valor), frecuencia: item.frecuencia };
  }).filter(f => f.valor && f.valor > 0);
}
const columnasGastos = [{ t: "Concepto", v: f => f.etiqueta }, { t: "Importe", num: true, v: f => dinero(f.valor) }, { t: "Frecuencia", v: f => FRECUENCIAS_GASTO[f.frecuencia] || "al mes" }];


// ----- Gráficos: SVG escrito a mano (sin librerías ni recursos externos) -----
const COLORES = { cuentas: "#4f46e5", inversiones: "#7c83e8", activos: "#a9aef2", deudas: "#e0556a", fijos: "#4f46e5", variables: "#f59e0b" };
const f1 = n => (Math.round(n * 10) / 10).toString();
// Los estilos de los gráficos van en cada elemento (no en el CSS): así se ven igual en el navegador, al imprimir y en cualquier visor de PDF.
const TXT = 'fill="#454a73" font-size="12.5" font-family="-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif"';
const TXT_V = 'fill="#2b2f6b" font-size="12.5" font-weight="700" font-family="-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif"';
const fondoSvg = (w, h) => '<rect x="0" y="0" width="' + w + '" height="' + h + '" rx="12" fill="#fbfbff"/>';
const recortar = (t, max) => { const x = String(t === null || t === undefined ? "" : t); return x.length > max ? x.slice(0, max - 1) + "…" : x; };
const compacto = v => {
  const a = Math.abs(v);
  if (a >= 1e6) return (v / 1e6).toLocaleString("es-ES", { maximumFractionDigits: 1 }) + " M€";
  if (a >= 1e3) return (v / 1e3).toLocaleString("es-ES", { maximumFractionDigits: 1 }) + " mil €";
  return v.toLocaleString("es-ES", { maximumFractionDigits: 0 }) + " €";
};
// Marcas "redondas" para un eje (0, 50.000, 100.000…)
export function marcasEje(min, max, n = 4) {
  let lo = Number.isFinite(min) ? min : 0, hi = Number.isFinite(max) ? max : 0;
  if (lo === hi) { const d = Math.abs(hi) || 1; lo -= d / 2; hi += d / 2; }
  const bruto = (hi - lo) / n, pot = Math.pow(10, Math.floor(Math.log10(bruto))), r = bruto / pot;
  const paso = (r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10) * pot;
  const ini = Math.floor(lo / paso) * paso, fin = Math.ceil(hi / paso) * paso, marcas = [];
  for (let v = ini, i = 0; v <= fin + paso / 1000 && i < 12; v += paso, i++) marcas.push(Math.round(v / paso * 1e6) / 1e6 * paso);
  return marcas;
}
function graficoBarras(titulo, filas, nivel = "h3") {
  const lista = (filas || []).filter(f => Number.isFinite(f.valor));
  if (lista.length === 0 || lista.every(f => !f.valor)) return ""; // un gráfico con todo a cero no aporta nada
  const W = 640, etiqueta = 190, reserva = 120, util = W - etiqueta - reserva, alto = 34, H = lista.length * alto + 10;
  const max = Math.max(...lista.map(f => Math.abs(f.valor)), 0);
  const barras = lista.map((f, i) => {
    const largo = max > 0 ? Math.max(Math.abs(f.valor) / max * util, f.valor ? 2 : 0) : 0;
    const y = 6 + i * alto;
    return '<text x="' + (etiqueta - 10) + '" y="' + f1(y + 17) + '" text-anchor="end" ' + TXT + ">" + esc(recortar(f.etiqueta, 30)) + '</text><rect x="' + etiqueta + '" y="' + f1(y + 3) + '" width="' + f1(largo) + '" height="20" rx="4" fill="' + f.color + '"/><text x="' + f1(etiqueta + largo + 8) + '" y="' + f1(y + 18) + '" ' + TXT_V + ">" + esc(euros(f.valor, 0)) + "</text>";
  }).join("");
  return '<div class="grafico"><' + nivel + ">" + esc(titulo) + "</" + nivel + '><svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(titulo) + '"><title>' + esc(titulo) + "</title>" + fondoSvg(W, H) + barras + "</svg></div>";
}
function graficoEvolucion(registros) {
  const pts = (registros || []).map(r => ({ t: new Date(r.registrado_at).getTime(), v: num(r.patrimonio_neto) })).filter(p => Number.isFinite(p.t) && p.v !== null).sort((a, b) => a.t - b.t);
  const distintos = new Set(pts.map(p => p.t)).size;
  if (distintos < 2) return '<p class="vacio">Con un único registro todavía no hay una evolución que dibujar. Cada nuevo registro de seguimiento añadirá un punto al gráfico.</p>';
  const W = 640, H = 270, L = 84, R = 20, T = 16, B = 34, pw = W - L - R, ph = H - T - B;
  const marcas = marcasEje(Math.min(...pts.map(p => p.v)), Math.max(...pts.map(p => p.v)));
  const y0 = marcas[0], y1 = marcas[marcas.length - 1], t0 = pts[0].t, t1 = pts[pts.length - 1].t;
  const X = t => L + (t - t0) / (t1 - t0) * pw;
  const Y = v => T + (1 - (v - y0) / (y1 - y0)) * ph;
  const rejilla = marcas.map(m => '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + f1(Y(m)) + '" y2="' + f1(Y(m)) + '" stroke="' + (m === 0 ? "#9aa0c0" : "#e6e8f5") + '" stroke-width="' + (m === 0 ? "1.4" : "1") + '"/><text x="' + (L - 8) + '" y="' + f1(Y(m) + 4) + '" text-anchor="end" ' + TXT + ">" + esc(compacto(m)) + "</text>").join("");
  const lista = pts.map(p => f1(X(p.t)) + "," + f1(Y(p.v))).join(" ");
  const base = y0 > 0 ? y0 : y1 < 0 ? y1 : 0;
  const area = f1(X(t0)) + "," + f1(Y(base)) + " " + lista + " " + f1(X(t1)) + "," + f1(Y(base));
  const dia = t => new Date(t).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  const puntos = pts.length <= 40 ? pts.map(p => '<circle cx="' + f1(X(p.t)) + '" cy="' + f1(Y(p.v)) + '" r="3.5" fill="#fff" stroke="#4f46e5" stroke-width="2"/>').join("") : "";
  const ultimo = pts[pts.length - 1];
  const titulo = "Evolución de tu patrimonio neto";
  const eje = (x, anchor, t) => '<text x="' + x + '" y="' + (H - 10) + '" text-anchor="' + anchor + '" ' + TXT + ">" + esc(dia(t)) + "</text>";
  return '<div class="grafico"><svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + titulo + '"><title>' + titulo + "</title>" + fondoSvg(W, H) + rejilla + '<polygon points="' + area + '" fill="#4f46e5" fill-opacity="0.09"/><polyline points="' + lista + '" fill="none" stroke="#4f46e5" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>' + puntos + '<circle cx="' + f1(X(ultimo.t)) + '" cy="' + f1(Y(ultimo.v)) + '" r="5" fill="#4f46e5" stroke="#fff" stroke-width="2"/>' + eje(L, "start", t0) + eje(f1(L + pw / 2), "middle", t0 + (t1 - t0) / 2) + eje(W - R, "end", t1) + '<text x="' + f1(X(ultimo.t)) + '" y="' + f1(Y(ultimo.v) - 12) + '" text-anchor="end" ' + TXT_V + ">" + esc(euros(ultimo.v, 0)) + "</text></svg></div>";
}
const DIVISOR = { mensual: 1, trimestral: 3, anual: 12 };
function graficoGastos(fijos, variables) {
  const todos = [...fijos.map(f => ({ ...f, color: COLORES.fijos })), ...variables.map(f => ({ ...f, color: COLORES.variables }))].map(f => ({ etiqueta: f.etiqueta, valor: f.valor / (DIVISOR[f.frecuencia] || 1), color: f.color })).sort((a, b) => b.valor - a.valor);
  if (todos.length === 0) return "";
  let filas = todos;
  if (todos.length > 10) {
    const resto = todos.slice(9);
    filas = [...todos.slice(0, 9), { etiqueta: "Otros conceptos (" + resto.length + ")", valor: resto.reduce((a, f) => a + f.valor, 0), color: "#a9aef2" }];
  }
  const leyenda = '<p class="leyenda"><i style="background:' + COLORES.fijos + '"></i> Gastos fijos <i style="background:' + COLORES.variables + '"></i> Gastos variables y ocio · importes equivalentes al mes</p>';
  return graficoBarras("Adónde va tu dinero cada mes", filas).replace("</svg></div>", "</svg>" + leyenda + "</div>");
}

export function construirInformeHtml(datos, ahora = new Date()) {
  const d = datos || {};
  const cuentas = d.cuentas || [];
  const deudas = d.deudas || [];
  const inversiones = d.inversiones || [];
  const activos = d.activos || [];
  const seguimiento = [...(d.seguimiento || [])].sort((a, b) => String(b.registrado_at).localeCompare(String(a.registrado_at)));
  const perfil = (d.finanzas_perfil || [])[0] || null;
  const quiz = (d.finanzas_quiz || [])[0] || null;
  const historial = [...(d.finanzas_historial || [])].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  const planes = d.plan_financiero || [];
  const usuario = d.usuario || {};

  // Mismas cuentas que hace la app: patrimonio = liquidez + inversiones + activos − (deudas + lo que queda por pagar de los activos)
  const liquidez = cuentas.length > 0 ? suma(cuentas, "saldo") : num(perfil && perfil.ahorro_actual) || 0;
  const totalInversiones = suma(inversiones, "valor_actual");
  const totalActivos = suma(activos, "valor_actual");
  const pendienteActivos = activos.filter(esEuro).reduce((a, f) => a + (f.pagada === false ? num(f.pendiente_pago) || 0 : 0), 0);
  const totalDeudas = deudas.filter(esEuro).reduce((a, f) => a + Math.max(num(f.saldo_pendiente) || 0, 0), 0) + pendienteActivos;
  const patrimonio = liquidez + totalInversiones + totalActivos - totalDeudas;
  const otraMoneda = hayOtraMoneda(cuentas) || hayOtraMoneda(inversiones) || hayOtraMoneda(activos) || hayOtraMoneda(deudas);
  const resumen = '<div class="resumen">' + [["Patrimonio neto", dinero(patrimonio), "lo que tienes menos lo que debes" + (otraMoneda ? " · sin contar importes en otras monedas" : ""), false], ["Total en cuentas", dinero(liquidez), cuentas.length + " cuenta(s)", hayOtraMoneda(cuentas)], ["Inversiones", dinero(totalInversiones), inversiones.length + " inversión(es)", hayOtraMoneda(inversiones)], ["Otros activos", dinero(totalActivos), activos.length + " activo(s)", hayOtraMoneda(activos)], ["Deudas pendientes", dinero(totalDeudas), deudas.length + " deuda(s)" + (pendienteActivos > 0 ? " + lo que queda por pagar de tus activos" : ""), hayOtraMoneda(deudas)]].map(([t, v, n, otra]) => '<div class="tarjeta"><span>' + esc(t) + "</span><b>" + esc(v) + "</b><small>" + esc(n + (otra ? " · sin contar los importes en otras monedas" : "")) + "</small></div>").join("") + "</div>";

  const grafPatrimonio = graficoBarras("Lo que tienes y lo que debes", [{ etiqueta: "Cuentas", valor: liquidez, color: COLORES.cuentas }, { etiqueta: "Inversiones", valor: totalInversiones, color: COLORES.inversiones }, { etiqueta: "Otros activos", valor: totalActivos, color: COLORES.activos }, { etiqueta: "Deudas", valor: totalDeudas, color: COLORES.deudas }], "h2");
  const sCuentas = seccion("Cuentas", tabla([{ t: "Banco", v: f => f.banco }, { t: "Nombre", v: f => f.nombre }, { t: "Tipo", v: f => f.tipo }, { t: "Saldo", num: true, v: f => dinero(f.saldo, f.moneda) }], cuentas));
  const sDeudas = seccion("Deudas", tabla([{ t: "Nombre", v: f => f.nombre }, { t: "Tipo", v: f => TIPOS_DEUDA[f.tipo] || texto(f.tipo) }, { t: "Entidad", v: f => texto(f.entidad) }, { t: "Pendiente", num: true, v: f => dinero(f.saldo_pendiente, f.moneda) }, { t: "TAE", num: true, v: f => f.tae === null || f.tae === undefined ? "—" : porcentaje(f.tae) }, { t: "Cuota mensual", num: true, v: f => dinero(f.cuota_mensual, f.moneda) }, { t: "Meses restantes", num: true, v: f => numero(f.plazo_restante_meses) }, { t: "Estrategia", v: f => ESTRATEGIAS[f.estrategia] || "—" }], deudas));
  const sInversiones = seccion("Inversiones", tabla([{ t: "Nombre", v: f => f.nombre }, { t: "Tipo", v: f => f.tipo === "otro" && f.metadatos && f.metadatos.tipo_ui ? f.metadatos.tipo_ui : TIPOS_INVERSION[f.tipo] || texto(f.tipo) }, { t: "Entidad", v: f => texto(f.entidad) }, { t: "ISIN / Ticker", v: f => [f.isin, f.ticker].filter(Boolean).join(" · ") || "—" }, { t: "Participaciones", num: true, v: f => numero(f.participaciones) }, { t: "Valor actual", num: true, v: f => dinero(f.valor_actual, f.moneda) }, { t: "Total aportado", num: true, v: f => dinero(f.total_aportado, f.moneda) }, { t: "Aportación periódica", num: true, v: f => num(f.aportacion_periodica) === null ? "—" : dinero(f.aportacion_periodica, f.moneda) + " (" + (FRECUENCIAS_TEXTO[f.frecuencia_aportacion] || "—").toLowerCase() + ")" }, { t: "Fecha de compra", v: f => fecha(f.fecha_compra) }], inversiones));
  const sActivos = seccion("Otros activos", tabla([{ t: "Nombre", v: f => f.nombre }, { t: "Tipo", v: f => texto(f.tipo) }, { t: "Valor actual", num: true, v: f => dinero(f.valor_actual, f.moneda) }, { t: "Pagado", v: f => f.pagada === false ? "No" : "Sí" }, { t: "Pendiente de pago", num: true, v: f => f.pagada === false ? dinero(f.pendiente_pago, f.moneda) : "—" }, { t: "Notas", v: f => texto(f.notas) }], activos));
  const sSeguimiento = seccion("Evolución de tu patrimonio", graficoEvolucion(seguimiento) + "<h3>Registros, del más reciente al más antiguo</h3>" + tabla([{ t: "Fecha", v: f => fecha(f.registrado_at) }, { t: "Liquidez", num: true, v: f => dinero(f.liquidez) }, { t: "Inversiones", num: true, v: f => dinero(f.inversiones_valor) }, { t: "Activos", num: true, v: f => dinero(f.activos_valor) }, { t: "Deuda", num: true, v: f => dinero(f.deuda_pendiente) }, { t: "Patrimonio neto", num: true, v: f => dinero(f.patrimonio_neto) }, { t: "Origen", v: f => ORIGENES[f.origen] || texto(f.origen) }], seguimiento));

  let sDiagnostico;
  if (!perfil) {
    sDiagnostico = seccion("Tu diagnóstico", '<p class="vacio">Aún no has completado el diagnóstico.</p>');
  } else {
    const fijos = filasGastos(perfil.gastos_fijos);
    const disc = filasGastos(perfil.gastos_disc);
    const objetivos = Array.isArray(perfil.objetivos) ? perfil.objetivos : [];
    const deudasDiag = (Array.isArray(perfil.deudas) ? perfil.deudas : []).filter(x => x && (num(x.pendiente) > 0 || x.nombre));
    sDiagnostico = seccion("Tu diagnóstico", '<div class="datos">' + [dato("Ingresos mensuales", dinero(perfil.ingresos)), dato("Ahorro actual", dinero(perfil.ahorro_actual)), dato("Hábito de ahorro", texto(perfil.habito)), dato("Perfil de inversor", texto(perfil.perfil_riesgo)), dato("Gastos fijos (al mes)", dinero(totalMensual(gastosLimpios(perfil.gastos_fijos)))), dato("Gastos variables y ocio (al mes)", dinero(totalMensual(gastosLimpios(perfil.gastos_disc)))), dato("Actualizado", fecha(perfil.updated_at))].join("") + "</div>" + graficoGastos(fijos, disc) + "<h3>Gastos fijos</h3>" + tabla(columnasGastos, fijos, "No indicaste gastos fijos.") + "<h3>Gastos variables y ocio</h3>" + tabla(columnasGastos, disc, "No indicaste gastos variables.") + (deudas.length > 0 ? "" : "<h3>Deudas indicadas en el diagnóstico</h3>" + tabla([{ t: "Nombre", v: f => texto(f.nombre) }, { t: "Pendiente", num: true, v: f => dinero(f.pendiente) }, { t: "Interés", num: true, v: f => f.tasa === "" || f.tasa === null || f.tasa === undefined ? "—" : porcentaje(f.tasa) }, { t: "Cuota mensual", num: true, v: f => dinero(f.cuota) }], deudasDiag, "No indicaste deudas.")) + "<h3>Objetivos</h3>" + tabla([{ t: "Objetivo", v: f => texto(f.nombre) }, { t: "Importe", num: true, v: f => dinero(f.importeObjetivo) }, { t: "Ya reservado", num: true, v: f => dinero(f.importeReservado) }, { t: "Plazo", num: true, v: f => num(f.plazoAnios) === null ? "—" : numero(f.plazoAnios) + " años" }, { t: "Fecha objetivo", v: f => fecha(f.fechaObjetivo) }, { t: "Prioridad", v: f => PRIORIDADES[f.prioridad] || "—" }, { t: "Aportación mensual", num: true, v: f => num(f.aportacionMensual) === null ? "—" : dinero(f.aportacionMensual) }], objetivos, "No definiste objetivos."));
  }

  const resultadoQuiz = quiz && quiz.resultado && typeof quiz.resultado === "object" ? quiz.resultado : null;
  const sQuiz = seccion("Cuestionario de perfil de inversor", !quiz ? '<p class="vacio">Aún no has hecho el cuestionario.</p>' : '<div class="datos">' + [dato("Completado", quiz.terminado ? "Sí" : "No"), dato("Perfil resultante", resultadoQuiz && resultadoQuiz.perfil ? resultadoQuiz.perfil : "—"), dato("Actualizado", fecha(quiz.updated_at))].join("") + "</div>");
  const sHistorial = seccion("Historial de tu ahorro", tabla([{ t: "Fecha", v: f => fecha(f.created_at) }, { t: "Ahorro sobre ingresos", num: true, v: f => num(f.ratio_ahorro) === null ? "—" : porcentaje(num(f.ratio_ahorro) * 100) }], historial));
  const sPlan = seccion("Plan financiero", tabla([{ t: "Versión", num: true, v: f => numero(f.version) }, { t: "Estado", v: f => texto(f.estado) }, { t: "Generado", v: f => fecha(f.generado_at) }, { t: "Fases del plan", v: f => (Array.isArray(f.fases) ? f.fases.map(x => x && x.titulo).filter(Boolean).join(" → ") : "") || "—" }], planes, "No hay un plan financiero guardado."));

  const generado = ahora.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }) + " a las " + ahora.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  const estilos = "*{box-sizing:border-box}body{margin:0;background:#f4f5fb;color:#1f2433;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.5}.pagina{max-width:980px;margin:0 auto;padding:28px 18px 60px}header{background:#4f46e5;color:#fff;border-radius:16px;padding:26px 26px 22px;margin-bottom:22px}header .marca{font-weight:800;letter-spacing:.02em;opacity:.9;font-size:.95rem}header h1{margin:6px 0 4px;font-size:1.9rem;line-height:1.15}header p{margin:2px 0;opacity:.92;font-size:.95rem;word-break:break-word}.resumen{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px;margin-bottom:8px}.tarjeta{background:#fff;border-radius:14px;padding:16px;box-shadow:0 1px 3px rgba(20,24,50,.08)}.tarjeta span{display:block;font-size:.8rem;color:#6a7086;text-transform:uppercase;letter-spacing:.05em}.tarjeta b{display:block;font-size:1.4rem;margin:4px 0 2px;color:#2b2f6b}.tarjeta small{color:#8a90a6}section{background:#fff;border-radius:16px;padding:20px 20px 12px;margin-top:18px;box-shadow:0 1px 3px rgba(20,24,50,.08)}h2{margin:0 0 12px;font-size:1.25rem;color:#2b2f6b;border-bottom:2px solid #eceefb;padding-bottom:8px}h3{margin:20px 0 8px;font-size:1rem;color:#454a73}.nota{margin:-4px 0 12px;color:#6a7086;font-size:.9rem}.scroll{overflow-x:auto;margin-bottom:10px}table{border-collapse:collapse;width:100%;font-size:.92rem}th{text-align:left;background:#f1f2fb;color:#454a73;font-weight:700;padding:9px 10px;white-space:nowrap}td{padding:9px 10px;border-top:1px solid #eef0f7;vertical-align:top}tbody tr:nth-child(even) td{background:#fafbff}.n{text-align:right;white-space:nowrap}.vacio{color:#8a90a6;font-style:italic;margin:6px 0 14px}.datos{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px;margin-bottom:6px}.dato{background:#f7f8fe;border-radius:10px;padding:10px 12px}.dato span{display:block;font-size:.78rem;color:#6a7086}.dato b{font-size:1rem}.grafico{margin:0 0 12px}.grafico h2{margin:0 0 10px}.grafico h3{margin:14px 0 6px}.grafico svg{width:100%;height:auto;display:block;background:#fbfbff;border-radius:12px}.leyenda{font-size:.82rem;color:#6a7086;margin:6px 2px 0}.leyenda i{display:inline-block;width:11px;height:11px;border-radius:3px;margin:0 4px 0 10px;vertical-align:-1px}.leyenda i:first-child{margin-left:0}footer{margin-top:26px;font-size:.85rem;color:#6a7086;text-align:center}@media print{body{background:#fff;font-size:11px}table{font-size:.8rem}th{white-space:normal}.n{white-space:normal}header{background:#fff;color:#000;border:1px solid #bbb}section,.tarjeta{box-shadow:none;border:1px solid #ddd;break-inside:avoid}.scroll{overflow:visible}}";
  return '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src data:"><title>Mis datos · MoneyPilot</title><style>' + estilos + '</style></head><body><div class="pagina"><header><div class="marca">MoneyPilot</div><h1>Mis datos</h1><p>' + esc(usuario.email || "") + "</p><p>Informe generado el " + esc(generado) + "</p></header>" + resumen + "<section>" + grafPatrimonio + "</section>" + sCuentas + sDeudas + sInversiones + sActivos + sSeguimiento + sDiagnostico + sQuiz + sHistorial + sPlan + "<footer>Este informe contiene tus datos personales y financieros: guárdalo en un lugar seguro.<br>Puedes imprimirlo o guardarlo como PDF desde tu navegador.</footer></div></body></html>";
}

// Borra del dispositivo lo que la app guardó (no toca nada ajeno a MoneyPilot)
export function limpiarDatosLocales(almacen = window.localStorage) {
  try {
    const claves = [];
    for (let i = 0; i < almacen.length; i++) {
      const k = almacen.key(i);
      if (k && k.startsWith("salud-financiera:")) claves.push(k);
    }
    claves.forEach(k => almacen.removeItem(k));
  } catch (e) {}
}

export async function solicitarEliminarCuenta(cliente = supa, llamar = fetch) {
  const { data } = await cliente.auth.getSession();
  const token = data && data.session ? data.session.access_token : null;
  if (!token) return { ok: false, error: "Tu sesión ha caducado. Vuelve a iniciar sesión e inténtalo de nuevo." };
  let resp;
  try {
    resp = await llamar("/api/eliminar-cuenta", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ confirmar: PALABRA_CONFIRMACION })
    });
  } catch (e) {
    return { ok: false, error: "No se pudo conectar. Revisa tu conexión e inténtalo de nuevo." };
  }
  let cuerpo = {};
  try {
    cuerpo = await resp.json();
  } catch (e) {}
  if (resp.ok && cuerpo.ok) return { ok: true };
  return { ok: false, error: cuerpo.error || "No se pudo eliminar la cuenta. Inténtalo de nuevo." };
}

const el = React.createElement;

export function MiCuentaModal({ user, onClose, onToast }) {
  const [descargando, setDescargando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [texto, setTexto] = useState("");
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState(null);

  const descargar = async (formato = "informe") => {
    setError(null);
    setDescargando(true);
    try {
      const datos = await reunirDatosUsuario(user);
      if (formato === "json") descargarJSON(nombreArchivoDatos(), datos);else descargarArchivo(nombreArchivoInforme(), construirInformeHtml(datos), "text/html;charset=utf-8");
      onToast && onToast("Descarga lista", "ok");
    } catch (e) {
      setError("No se pudieron reunir tus datos. Inténtalo de nuevo en unos minutos.");
    } finally {
      setDescargando(false);
    }
  };

  const eliminar = async () => {
    if (texto.trim().toUpperCase() !== PALABRA_CONFIRMACION || eliminando) return;
    setError(null);
    setEliminando(true);
    const r = await solicitarEliminarCuenta();
    if (!r.ok) {
      setEliminando(false);
      setError(r.error);
      return;
    }
    limpiarDatosLocales();
    try {
      await supa.auth.signOut({ scope: "local" });
    } catch (e) {}
    window.location.assign("/");
  };

  const puedeEliminar = texto.trim().toUpperCase() === PALABRA_CONFIRMACION && !eliminando;
  const estiloBoton = { backgroundColor: C.sand, color: C.navy };

  return el("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center px-4",
    style: { backgroundColor: "rgba(5,8,16,0.7)" },
    onClick: onClose
  }, el("div", {
    onClick: e => e.stopPropagation(),
    className: "w-full max-w-md rounded-2xl p-6 overflow-y-auto",
    style: { backgroundColor: C.surface, maxHeight: "90vh" },
    role: "dialog",
    "aria-label": "Mi cuenta"
  }, el("div", { className: "flex items-center justify-between mb-1" }, el("h2", { className: "font-serif text-xl font-bold", style: { color: C.ink } }, "Mi cuenta"), el("button", { onClick: onClose, "aria-label": "Cerrar", style: { color: C.muted } }, el(I.x, { size: 18 }))), el("p", { className: "text-sm mb-5 break-words", style: { color: C.muted } }, user && user.email), el("div", { className: "rounded-xl p-4 mb-4", style: { backgroundColor: C.paper } }, el("div", { className: "text-sm font-bold", style: { color: C.ink } }, "Descargar mis datos"), el("p", { className: "text-xs mt-1", style: { color: C.muted } }, "Obtén una copia de todo lo que MoneyPilot guarda de ti. El informe se abre en tu navegador con tablas fáciles de leer, y puedes imprimirlo o guardarlo como PDF."), el("button", { onClick: () => descargar("informe"), disabled: descargando, className: "mt-3 px-4 py-2 rounded-lg text-xs font-bold", style: { ...estiloBoton, opacity: descargando ? 0.6 : 1 } }, descargando ? "Preparando…" : "Descargar mi informe"), el("button", { onClick: () => descargar("json"), disabled: descargando, className: "block mt-3 text-xs font-bold underline", style: { color: C.muted } }, "Descargar en formato técnico (JSON)")), el("div", { className: "rounded-xl p-4", style: { backgroundColor: C.paper, border: "1px solid " + C.crit } }, el("div", { className: "text-sm font-bold", style: { color: C.critText } }, "Eliminar mi cuenta"), el("p", { className: "text-xs mt-1", style: { color: C.muted } }, "Se borrarán tu cuenta y todos tus datos guardados. Esta acción no se puede deshacer. Te recomendamos descargar antes tus datos."), !confirmando ? el("button", { onClick: () => setConfirmando(true), className: "mt-3 px-4 py-2 rounded-lg text-xs font-bold border", style: { borderColor: C.crit, color: C.critText } }, "Eliminar mi cuenta") : el("div", { className: "mt-3" }, el("label", { className: "block text-xs font-bold mb-1.5", style: { color: C.ink } }, "Escribe ", PALABRA_CONFIRMACION, " para confirmar"), el("input", { value: texto, onChange: e => setTexto(e.target.value), autoComplete: "off", placeholder: PALABRA_CONFIRMACION, className: "w-full rounded-lg px-3 py-2 text-sm font-bold border outline-none", style: { borderColor: C.border, color: C.ink, backgroundColor: C.white } }), el("div", { className: "flex gap-2 mt-3" }, el("button", { onClick: eliminar, disabled: !puedeEliminar, className: "px-4 py-2 rounded-lg text-xs font-bold", style: { backgroundColor: C.crit, color: C.white, opacity: puedeEliminar ? 1 : 0.4 } }, eliminando ? "Eliminando…" : "Sí, eliminar definitivamente"), el("button", { onClick: () => { setConfirmando(false); setTexto(""); setError(null); }, disabled: eliminando, className: "px-4 py-2 rounded-lg text-xs font-bold border", style: { borderColor: C.border, color: C.muted } }, "Cancelar")))), error ? el("p", { className: "text-xs font-bold mt-4", style: { color: C.crit }, role: "alert" }, error) : null));
}
