const { useState, useEffect, useMemo, useRef, useCallback } = React;

import { C, CATEGORIAS_GASTO, CATEGORIAS_INGRESO, I, supa } from './constantes.js';
import { euros } from './calculos.js';
import { esIdCuentaLocal } from './hooks-datos.js';
import { Card, Eyebrow, NumberField } from './ui-basicos.js';

// ---------------------------------------------------------------------------
// Funciones puras (sin React): fáciles de probar y sin efectos secundarios
// ---------------------------------------------------------------------------

// Fecha de hoy en hora local, formato AAAA-MM-DD
export function hoyISO(ahora = new Date()) {
  const m = String(ahora.getMonth() + 1).padStart(2, "0");
  const d = String(ahora.getDate()).padStart(2, "0");
  return ahora.getFullYear() + "-" + m + "-" + d;
}

// Primer día del mes y primer día del mes siguiente (para filtrar por mes)
export function rangoMes(anio, mes) {
  const pad = n => String(n).padStart(2, "0");
  const desde = anio + "-" + pad(mes) + "-01";
  const hasta = mes === 12 ? anio + 1 + "-01-01" : anio + "-" + pad(mes + 1) + "-01";
  return { desde, hasta };
}

// Los gastos se guardan en negativo y los ingresos en positivo, siempre en céntimos enteros
export function importeACentimos(importe, tipo) {
  const abs = Math.round(Math.abs(Number(importe) || 0) * 100);
  return tipo === "gasto" ? -abs : abs;
}

export function formatearFecha(iso) {
  if (!iso || typeof iso !== "string") return "";
  const [a, m, d] = iso.split("-");
  return d + "/" + m + "/" + a;
}

// Ingresos y gastos del mes. Las aperturas y los ajustes de saldo NO cuentan como ingreso ni gasto.
export function resumirMovimientos(lista) {
  let ingresos = 0;
  let gastos = 0;
  let hayAjustes = false;
  (lista || []).forEach(m => {
    const c = Number(m.importe_centimos) || 0;
    if (m.tipo === "ingreso") ingresos += c;else if (m.tipo === "gasto") gastos += -c;else hayAjustes = true;
  });
  return { ingresos: ingresos / 100, gastos: gastos / 100, balance: (ingresos - gastos) / 100, hayAjustes };
}

// Devuelve un objeto con los campos que faltan o son incorrectos (vacío = todo correcto)
export function validarMovimiento(b, hoy) {
  const errores = {};
  if (!(Number(b.importe) > 0)) errores.importe = "Escribe un importe mayor que 0.";
  if (!b.cuentaId) errores.cuenta = "Elige la cuenta del movimiento.";
  if (!b.categoria) errores.categoria = "Elige una categoría.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.fecha || "") || b.fecha < "2000-01-01") errores.fecha = "Escribe una fecha válida.";else if (b.fecha > hoy) errores.fecha = "La fecha no puede ser futura.";
  return errores;
}

function nombreMes(anio, mes) {
  const t = new Date(anio, mes - 1, 1).toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  return t.charAt(0).toUpperCase() + t.slice(1);
}

const ETIQUETA_TIPO_AUTO = { apertura: "Saldo inicial", ajuste: "Ajuste de saldo" };

// ---------------------------------------------------------------------------
// Pantalla
// ---------------------------------------------------------------------------
export function Movimientos({ user, cuentas, setCuentas, onToast, onIrACuentas, onLogin }) {
  const hoy = hoyISO();
  const [mes, setMes] = useState(() => ({ anio: Number(hoy.slice(0, 4)), mes: Number(hoy.slice(5, 7)) }));
  const [movs, setMovs] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [errorCarga, setErrorCarga] = useState(false);
  const [recarga, setRecarga] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [confirmarId, setConfirmarId] = useState(null);
  const formRef = useRef(null);

  const cuentasNube = useMemo(() => (cuentas || []).filter(c => !esIdCuentaLocal(c.id)), [cuentas]);
  const nombreCuenta = useMemo(() => {
    const m = {};
    cuentasNube.forEach(c => { m[c.id] = c.nombre; });
    return m;
  }, [cuentasNube]);

  const borradorVacio = useCallback((previo = {}) => ({
    id: null,
    tipo: previo.tipo || "gasto",
    importe: 0,
    cuentaId: previo.cuentaId || (cuentasNube.length === 1 ? cuentasNube[0].id : ""),
    fecha: previo.fecha || hoy,
    categoria: "",
    descripcion: "",
    errores: {}
  }), [cuentasNube, hoy]);

  const [borrador, setBorrador] = useState(() => borradorVacio());

  // Si solo hay una cuenta y aún no estaba elegida, se preselecciona
  useEffect(() => {
    if (!borrador.cuentaId && cuentasNube.length === 1) {
      setBorrador(b => ({ ...b, cuentaId: cuentasNube[0].id }));
    }
  }, [cuentasNube, borrador.cuentaId]);

  // Carga de los movimientos del mes elegido
  useEffect(() => {
    if (!user) return;
    let cancelado = false;
    const { desde, hasta } = rangoMes(mes.anio, mes.mes);
    setCargando(true);
    setErrorCarga(false);
    supa.from("movimientos").select("id,cuenta_id,fecha,importe_centimos,tipo,categoria,descripcion,created_at").eq("user_id", user.id).gte("fecha", desde).lt("fecha", hasta).order("fecha", { ascending: false }).order("created_at", { ascending: false }).limit(1000).then(({ data, error }) => {
      if (cancelado) return;
      setCargando(false);
      if (error) {
        setErrorCarga(true);
        setMovs([]);
      } else {
        setMovs(data || []);
      }
    });
    return () => { cancelado = true; };
  }, [user, mes.anio, mes.mes, recarga]);

  // Tras cada cambio, el saldo real lo calcula la base de datos: lo traemos para mostrarlo bien en toda la app
  const refrescarSaldos = useCallback(async () => {
    if (!user) return;
    const { data } = await supa.from("cuentas").select("id,saldo").eq("user_id", user.id);
    if (!data) return;
    const m = {};
    data.forEach(r => { m[r.id] = Number(r.saldo); });
    setCuentas(prev => prev.map(c => m[c.id] !== undefined ? { ...c, saldo: m[c.id] } : c));
  }, [user, setCuentas]);

  const resumen = useMemo(() => resumirMovimientos(movs), [movs]);
  const esMesActual = mes.anio === Number(hoy.slice(0, 4)) && mes.mes === Number(hoy.slice(5, 7));

  const cambiarMes = delta => {
    setConfirmarId(null);
    setMes(prev => {
      let a = prev.anio;
      let m = prev.mes + delta;
      if (m < 1) { m = 12; a -= 1; }
      if (m > 12) { m = 1; a += 1; }
      return { anio: a, mes: m };
    });
  };

  const guardar = async () => {
    if (guardando) return;
    const errores = validarMovimiento(borrador, hoy);
    if (Object.keys(errores).length > 0) {
      setBorrador(b => ({ ...b, errores }));
      return;
    }
    setGuardando(true);
    const fila = {
      cuenta_id: borrador.cuentaId,
      fecha: borrador.fecha,
      importe_centimos: importeACentimos(borrador.importe, borrador.tipo),
      tipo: borrador.tipo,
      categoria: borrador.categoria,
      descripcion: borrador.descripcion.trim() || null
    };
    const { error } = borrador.id ? await supa.from("movimientos").update(fila).eq("id", borrador.id) : await supa.from("movimientos").insert({ ...fila, user_id: user.id });
    setGuardando(false);
    if (error) {
      onToast && onToast("No se pudo guardar el movimiento. Inténtalo de nuevo.", "error");
      return;
    }
    onToast && onToast(borrador.id ? "Movimiento actualizado" : "Movimiento guardado", "ok");
    // Si el movimiento es de otro mes, mostramos ese mes para que el usuario lo vea
    const a = Number(borrador.fecha.slice(0, 4));
    const m = Number(borrador.fecha.slice(5, 7));
    if (a !== mes.anio || m !== mes.mes) setMes({ anio: a, mes: m });else setRecarga(n => n + 1);
    setBorrador(borradorVacio({ tipo: borrador.tipo, cuentaId: borrador.cuentaId, fecha: borrador.fecha }));
    refrescarSaldos();
  };

  const editar = mov => {
    setConfirmarId(null);
    setBorrador({
      id: mov.id,
      tipo: mov.tipo,
      importe: Math.abs(Number(mov.importe_centimos)) / 100,
      cuentaId: mov.cuenta_id,
      fecha: mov.fecha,
      categoria: mov.categoria || "",
      descripcion: mov.descripcion || "",
      errores: {}
    });
    if (formRef.current && formRef.current.scrollIntoView) formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const borrar = async id => {
    const { error } = await supa.from("movimientos").delete().eq("id", id);
    setConfirmarId(null);
    if (error) {
      onToast && onToast("No se pudo borrar el movimiento.", "error");
      return;
    }
    onToast && onToast("Movimiento eliminado", "ok");
    if (borrador.id === id) setBorrador(borradorVacio());
    setRecarga(n => n + 1);
    refrescarSaldos();
  };

  const cabecera = /*#__PURE__*/React.createElement("div", { className: "max-w-3xl section-intro" }, /*#__PURE__*/React.createElement(Eyebrow, null, "Tu día a día"), /*#__PURE__*/React.createElement("h2", { className: "font-serif text-3xl sm:text-4xl font-bold mt-2", style: { color: C.ink } }, "Ingresos y gastos"), /*#__PURE__*/React.createElement("p", { className: "text-sm sm:text-base mt-3", style: { color: C.muted } }, "Apunta lo que entra y lo que sale de cada cuenta. El saldo de tus cuentas se actualiza solo con cada movimiento."));

  const envoltorio = hijos => /*#__PURE__*/React.createElement("section", { className: "py-16 sm:py-24 section-tinted" }, /*#__PURE__*/React.createElement("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 space-y-6" }, cabecera, hijos));

  // Sin sesión: los movimientos solo se guardan en una cuenta
  if (!user) {
    return envoltorio(/*#__PURE__*/React.createElement(Card, { className: "p-6 text-center" }, /*#__PURE__*/React.createElement("p", { className: "text-sm font-bold", style: { color: C.ink } }, "Los movimientos se guardan en tu cuenta de MoneyPilot."), /*#__PURE__*/React.createElement("p", { className: "text-sm mt-2", style: { color: C.muted } }, "Inicia sesión o crea una cuenta gratis para registrar tus ingresos y gastos y verlos desde cualquier dispositivo."), /*#__PURE__*/React.createElement("button", { onClick: onLogin, className: "mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold", style: { backgroundColor: C.sand, color: C.navy } }, "Iniciar sesión o crear cuenta")));
  }

  // Con sesión pero sin cuentas: primero hay que crear una
  if (cuentasNube.length === 0) {
    return envoltorio(/*#__PURE__*/React.createElement(Card, { className: "p-6 text-center" }, /*#__PURE__*/React.createElement("p", { className: "text-sm font-bold", style: { color: C.ink } }, "Antes de apuntar movimientos necesitas al menos una cuenta."), /*#__PURE__*/React.createElement("p", { className: "text-sm mt-2", style: { color: C.muted } }, "Cada ingreso o gasto se asocia a una cuenta para que su saldo siempre cuadre."), /*#__PURE__*/React.createElement("button", { onClick: onIrACuentas, className: "mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold", style: { backgroundColor: C.sand, color: C.navy } }, "Ir a Cuentas")));
  }

  const err = borrador.errores || {};
  const categorias = borrador.tipo === "gasto" ? CATEGORIAS_GASTO : CATEGORIAS_INGRESO;
  const estiloCampo = hayError => ({ borderColor: hayError ? C.crit : C.border, color: C.ink, backgroundColor: C.paper });
  const claseCampo = "w-full rounded-lg px-3 py-2 text-sm font-bold border outline-none";
  const etiqueta = txt => /*#__PURE__*/React.createElement("label", { className: "block text-sm font-bold mb-1.5", style: { color: C.ink } }, txt);
  const msgError = txt => txt ? /*#__PURE__*/React.createElement("p", { className: "text-xs mt-1 font-bold", style: { color: C.crit } }, txt) : null;
  const hayErrores = Object.keys(err).length > 0;

  const botonTipo = (valor, texto) => /*#__PURE__*/React.createElement("button", {
    key: valor,
    type: "button",
    onClick: () => setBorrador(b => ({ ...b, tipo: valor, categoria: "", errores: {} })),
    className: "flex-1 px-4 py-2 rounded-lg text-sm font-bold border",
    style: borrador.tipo === valor ? { backgroundColor: C.sand, color: C.white, borderColor: C.sand } : { backgroundColor: C.paper, color: C.ink, borderColor: C.border }
  }, texto);

  const formulario = /*#__PURE__*/React.createElement("div", { ref: formRef }, /*#__PURE__*/React.createElement(Card, { className: "p-5", style: { borderColor: C.sand } }, /*#__PURE__*/React.createElement("div", { className: "text-sm font-bold mb-3", style: { color: C.ink } }, borrador.id ? "Editar movimiento" : "Nuevo movimiento"), /*#__PURE__*/React.createElement("div", { className: "flex gap-2 mb-4" }, botonTipo("gasto", "Gasto"), botonTipo("ingreso", "Ingreso")), /*#__PURE__*/React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" }, /*#__PURE__*/React.createElement(NumberField, { label: "Importe", value: borrador.importe, error: err.importe, onChange: v => setBorrador(b => ({ ...b, importe: v, errores: { ...b.errores, importe: undefined } })) }), /*#__PURE__*/React.createElement("div", null, etiqueta("Cuenta"), /*#__PURE__*/React.createElement("select", { value: borrador.cuentaId, onChange: e => setBorrador(b => ({ ...b, cuentaId: e.target.value, errores: { ...b.errores, cuenta: undefined } })), className: claseCampo, style: estiloCampo(err.cuenta) }, /*#__PURE__*/React.createElement("option", { value: "" }, "Elige una cuenta"), cuentasNube.map(c => /*#__PURE__*/React.createElement("option", { key: c.id, value: c.id }, c.nombre + (c.banco ? " · " + c.banco : "")))), msgError(err.cuenta)), /*#__PURE__*/React.createElement("div", null, etiqueta("Categoría"), /*#__PURE__*/React.createElement("select", { value: borrador.categoria, onChange: e => setBorrador(b => ({ ...b, categoria: e.target.value, errores: { ...b.errores, categoria: undefined } })), className: claseCampo, style: estiloCampo(err.categoria) }, /*#__PURE__*/React.createElement("option", { value: "" }, "Elige una categoría"), categorias.map(c => /*#__PURE__*/React.createElement("option", { key: c, value: c }, c))), msgError(err.categoria)), /*#__PURE__*/React.createElement("div", null, etiqueta("Fecha"), /*#__PURE__*/React.createElement("input", { type: "date", value: borrador.fecha, max: hoy, onChange: e => setBorrador(b => ({ ...b, fecha: e.target.value, errores: { ...b.errores, fecha: undefined } })), className: claseCampo, style: estiloCampo(err.fecha) }), msgError(err.fecha)), /*#__PURE__*/React.createElement("div", { className: "sm:col-span-2" }, etiqueta("Nota (opcional)"), /*#__PURE__*/React.createElement("input", { value: borrador.descripcion, maxLength: 200, placeholder: "Ej. Compra semanal", onChange: e => setBorrador(b => ({ ...b, descripcion: e.target.value })), className: claseCampo, style: estiloCampo(false) }))), hayErrores && Object.values(err).some(Boolean) ? /*#__PURE__*/React.createElement("p", { className: "text-xs font-bold mt-3", style: { color: C.crit } }, "Faltan datos obligatorios: revisa los campos marcados en rojo.") : null, /*#__PURE__*/React.createElement("div", { className: "flex gap-2 mt-4" }, /*#__PURE__*/React.createElement("button", { onClick: guardar, disabled: guardando, className: "px-4 py-2 rounded-lg text-xs font-bold", style: { backgroundColor: C.sand, color: C.navy, opacity: guardando ? 0.6 : 1 } }, guardando ? "Guardando…" : borrador.id ? "Guardar cambios" : "Guardar movimiento"), borrador.id ? /*#__PURE__*/React.createElement("button", { onClick: () => setBorrador(borradorVacio()), className: "px-4 py-2 rounded-lg text-xs font-bold border", style: { borderColor: C.border, color: C.muted } }, "Cancelar edición") : null)));

  const bloque = (titulo, valor, color) => /*#__PURE__*/React.createElement("div", { className: "p-4 text-center" }, /*#__PURE__*/React.createElement("div", { className: "text-xs font-bold uppercase", style: { color: C.muted, letterSpacing: "0.08em" } }, titulo), /*#__PURE__*/React.createElement("div", { className: "font-serif text-xl sm:text-2xl font-bold mt-1", style: { color } }, euros(valor, 2)));

  const selectorMes = /*#__PURE__*/React.createElement("div", { className: "flex items-center justify-between gap-3" }, /*#__PURE__*/React.createElement("button", { onClick: () => cambiarMes(-1), "aria-label": "Mes anterior", className: "p-2 rounded-lg border", style: { borderColor: C.border, color: C.ink } }, /*#__PURE__*/React.createElement(I.chevronLeft, { size: 16 })), /*#__PURE__*/React.createElement("div", { className: "font-serif text-xl font-bold", style: { color: C.ink } }, nombreMes(mes.anio, mes.mes)), /*#__PURE__*/React.createElement("button", { onClick: () => cambiarMes(1), disabled: esMesActual, "aria-label": "Mes siguiente", className: "p-2 rounded-lg border", style: { borderColor: C.border, color: C.ink, opacity: esMesActual ? 0.35 : 1 } }, /*#__PURE__*/React.createElement(I.chevronRight, { size: 16 })));

  const resumenCard = /*#__PURE__*/React.createElement(Card, { className: "overflow-hidden" }, /*#__PURE__*/React.createElement("div", { className: "grid grid-cols-3" }, bloque("Ingresos", resumen.ingresos, C.salu), bloque("Gastos", resumen.gastos, C.critText), bloque("Balance", resumen.balance, resumen.balance < 0 ? C.critText : C.ink)), resumen.hayAjustes ? /*#__PURE__*/React.createElement("p", { className: "text-xs px-4 pb-3 text-center", style: { color: C.muted } }, "Los saldos iniciales y los ajustes de saldo no cuentan como ingresos ni gastos.") : null);

  const fila = m => {
    const auto = m.tipo === "apertura" || m.tipo === "ajuste";
    const cent = Number(m.importe_centimos) || 0;
    const positivo = cent > 0;
    return /*#__PURE__*/React.createElement("div", { key: m.id, className: "py-3 flex items-start justify-between gap-3 border-t", style: { borderColor: C.border } }, /*#__PURE__*/React.createElement("div", { className: "min-w-0" }, /*#__PURE__*/React.createElement("div", { className: "text-sm font-bold", style: { color: C.ink } }, auto ? ETIQUETA_TIPO_AUTO[m.tipo] : m.categoria || "Sin categoría"), /*#__PURE__*/React.createElement("div", { className: "text-xs mt-0.5 break-words", style: { color: C.muted } }, formatearFecha(m.fecha) + " · " + (nombreCuenta[m.cuenta_id] || "Cuenta") + (m.descripcion && !auto ? " · " + m.descripcion : ""))), /*#__PURE__*/React.createElement("div", { className: "text-right shrink-0" }, /*#__PURE__*/React.createElement("div", { className: "text-sm font-bold", style: { color: auto ? C.muted : positivo ? C.salu : C.critText } }, (positivo ? "+" : "−") + euros(Math.abs(cent) / 100, 2)), auto ? null : confirmarId === m.id ? /*#__PURE__*/React.createElement("div", { className: "flex gap-2 justify-end mt-1" }, /*#__PURE__*/React.createElement("button", { onClick: () => borrar(m.id), className: "text-xs font-bold", style: { color: C.critText } }, "Borrar"), /*#__PURE__*/React.createElement("button", { onClick: () => setConfirmarId(null), className: "text-xs font-bold", style: { color: C.muted } }, "Cancelar")) : /*#__PURE__*/React.createElement("div", { className: "flex gap-3 justify-end mt-1" }, /*#__PURE__*/React.createElement("button", { onClick: () => editar(m), className: "text-xs font-bold", style: { color: C.sand } }, "Editar"), /*#__PURE__*/React.createElement("button", { onClick: () => setConfirmarId(m.id), className: "text-xs font-bold", style: { color: C.muted } }, "Borrar"))));
  };

  const lista = /*#__PURE__*/React.createElement(Card, { className: "p-5" }, cargando ? /*#__PURE__*/React.createElement("p", { className: "text-sm", style: { color: C.muted } }, "Cargando movimientos…") : errorCarga ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", { className: "text-sm font-bold", style: { color: C.critText } }, "No se pudieron cargar los movimientos."), /*#__PURE__*/React.createElement("button", { onClick: () => setRecarga(n => n + 1), className: "text-xs font-bold mt-2", style: { color: C.sand } }, "Reintentar")) : movs.length === 0 ? /*#__PURE__*/React.createElement("p", { className: "text-sm", style: { color: C.muted } }, "Aún no hay movimientos en este mes.") : /*#__PURE__*/React.createElement("div", { className: "-my-3" }, movs.map(fila)));

  return envoltorio(/*#__PURE__*/React.createElement(React.Fragment, null, formulario, selectorMes, resumenCard, lista));
}
