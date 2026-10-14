// Progreso de lectura de la guía del blog: lógica pura (sin red ni navegador), para poder probarla.
//
// Formato guardado (en este dispositivo y, si la persona lo decide, en su cuenta):
//   { "slug-de-la-guia": marca }
// donde marca > 0  = leída (en ese instante, en ms)
//       marca < 0  = quitada de leídas (en ese instante, en ms; se guarda para que, al fusionar dos
//                    versiones, una guía quitada no "resucite" desde la otra copia).
// Al fusionar dos versiones gana, para cada guía, la marca más reciente.

export const GUIA_CLAVE = 'salud-financiera:guia-leidos-v2';
export const GUIA_CLAVE_V1 = 'salud-financiera:guia-leidos-v1'; // formato antiguo: lista de slugs leídos
export const GUIA_CLAVE_SYNC = 'salud-financiera:guia-sync-v1'; // { uid, t }: este dispositivo ya se reconcilió con esa cuenta

// Limpia cualquier cosa que venga de fuera (almacenamiento, nube): solo se aceptan slugs razonables y marcas numéricas
export function normalizarMapa(obj) {
  const salida = {};
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return salida;
  for (const k of Object.keys(obj)) {
    const v = Number(obj[k]);
    if (typeof k === 'string' && k.length > 0 && k.length <= 160 && Number.isFinite(v) && v !== 0) salida[k] = Math.trunc(v);
  }
  return salida;
}

// Formato antiguo (lista de slugs leídos) -> mapa
export function mapaDesdeLista(lista, t = 1) {
  const m = {};
  if (Array.isArray(lista)) lista.forEach(s => { if (typeof s === 'string' && s) m[s] = t; });
  return m;
}

// Slugs leídos, ordenados (para comparar y contar)
export function leidosDe(mapa) {
  return Object.keys(normalizarMapa(mapa)).filter(s => mapa[s] > 0).sort();
}

export function mismosLeidos(a, b) {
  const x = leidosDe(a), y = leidosDe(b);
  return x.length === y.length && x.every((s, i) => s === y[i]);
}

// Para cada guía gana la marca más reciente (valor absoluto mayor); en empate, "leída"
export function fusionarMapas(a, b) {
  const A = normalizarMapa(a), B = normalizarMapa(b), salida = {};
  for (const k of new Set([...Object.keys(A), ...Object.keys(B)])) {
    const va = A[k] || 0, vb = B[k] || 0;
    const ta = Math.abs(va), tb = Math.abs(vb);
    salida[k] = ta > tb ? va : tb > ta ? vb : Math.max(va, vb);
  }
  return salida;
}

export function mapasIguales(a, b) {
  const A = normalizarMapa(a), B = normalizarMapa(b);
  const ka = Object.keys(A), kb = Object.keys(B);
  return ka.length === kb.length && ka.every(k => A[k] === B[k]);
}
