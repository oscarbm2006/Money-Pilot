// Carga src/calculos.js dentro de Node para poder probarlo, sin navegador.
// Usa Vite (que ya es una dependencia del proyecto): no hace falta instalar nada nuevo.
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// calculos.js importa constantes.js, que espera React y Supabase como variables globales (vienen del navegador).
// Aquí las sustituimos por piezas vacías: los cálculos no las usan.
globalThis.React = new Proxy({}, { get: () => () => null });
globalThis.window = globalThis.window || { supabase: { createClient: () => ({}) }, localStorage: { getItem: () => null, setItem() {}, removeItem() {} } };

let servidor;
export async function cargarCalculos() {
  servidor = await createServer({ configFile: false, root: raiz, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
  const calculos = await servidor.ssrLoadModule('/src/calculos.js');
  const constantes = await servidor.ssrLoadModule('/src/constantes.js');
  return { ...calculos, __constantes: constantes };
}
// Carga cualquier módulo de src/ (por ejemplo '/src/cuenta.js') con las mismas variables globales simuladas.
export async function cargarModulo(ruta) {
  if (!servidor) servidor = await createServer({ configFile: false, root: raiz, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
  return servidor.ssrLoadModule(ruta);
}
export async function cerrar() {
  if (servidor) await servidor.close();
}
