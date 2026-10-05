const { useState } = React;

import { C, I, supa } from './constantes.js';

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

export function descargarJSON(nombre, objeto, doc = document, urlApi = URL) {
  const blob = new Blob([JSON.stringify(objeto, null, 2)], { type: "application/json" });
  const url = urlApi.createObjectURL(blob);
  const a = doc.createElement("a");
  a.href = url;
  a.download = nombre;
  doc.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => urlApi.revokeObjectURL(url), 1000);
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

  const descargar = async () => {
    setError(null);
    setDescargando(true);
    try {
      const datos = await reunirDatosUsuario(user);
      descargarJSON(nombreArchivoDatos(), datos);
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
    className: "w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto",
    style: { backgroundColor: C.surface },
    role: "dialog",
    "aria-label": "Mi cuenta"
  }, el("div", { className: "flex items-center justify-between mb-1" }, el("h2", { className: "font-serif text-xl font-bold", style: { color: C.ink } }, "Mi cuenta"), el("button", { onClick: onClose, "aria-label": "Cerrar", style: { color: C.muted } }, el(I.x, { size: 18 }))), el("p", { className: "text-sm mb-5 break-words", style: { color: C.muted } }, user && user.email), el("div", { className: "rounded-xl p-4 mb-4", style: { backgroundColor: C.paper } }, el("div", { className: "text-sm font-bold", style: { color: C.ink } }, "Descargar mis datos"), el("p", { className: "text-xs mt-1", style: { color: C.muted } }, "Obtén una copia de todo lo que MoneyPilot guarda de ti (cuentas, deudas, inversiones, activos, seguimiento, diagnóstico y plan) en un archivo que puedes guardar."), el("button", { onClick: descargar, disabled: descargando, className: "mt-3 px-4 py-2 rounded-lg text-xs font-bold", style: { ...estiloBoton, opacity: descargando ? 0.6 : 1 } }, descargando ? "Preparando…" : "Descargar mis datos")), el("div", { className: "rounded-xl p-4", style: { backgroundColor: C.paper, border: "1px solid " + C.crit } }, el("div", { className: "text-sm font-bold", style: { color: C.critText } }, "Eliminar mi cuenta"), el("p", { className: "text-xs mt-1", style: { color: C.muted } }, "Se borrarán tu cuenta y todos tus datos guardados. Esta acción no se puede deshacer. Te recomendamos descargar antes tus datos."), !confirmando ? el("button", { onClick: () => setConfirmando(true), className: "mt-3 px-4 py-2 rounded-lg text-xs font-bold border", style: { borderColor: C.crit, color: C.critText } }, "Eliminar mi cuenta") : el("div", { className: "mt-3" }, el("label", { className: "block text-xs font-bold mb-1.5", style: { color: C.ink } }, "Escribe ", PALABRA_CONFIRMACION, " para confirmar"), el("input", { value: texto, onChange: e => setTexto(e.target.value), autoComplete: "off", placeholder: PALABRA_CONFIRMACION, className: "w-full rounded-lg px-3 py-2 text-sm font-bold border outline-none", style: { borderColor: C.border, color: C.ink, backgroundColor: C.white } }), el("div", { className: "flex gap-2 mt-3" }, el("button", { onClick: eliminar, disabled: !puedeEliminar, className: "px-4 py-2 rounded-lg text-xs font-bold", style: { backgroundColor: C.crit, color: C.white, opacity: puedeEliminar ? 1 : 0.4 } }, eliminando ? "Eliminando…" : "Sí, eliminar definitivamente"), el("button", { onClick: () => { setConfirmando(false); setTexto(""); setError(null); }, disabled: eliminando, className: "px-4 py-2 rounded-lg text-xs font-bold border", style: { borderColor: C.border, color: C.muted } }, "Cancelar")))), error ? el("p", { className: "text-xs font-bold mt-4", style: { color: C.crit }, role: "alert" }, error) : null));
}
