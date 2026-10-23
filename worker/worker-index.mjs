// worker/index.mjs
// Punto de entrada de Cloudflare (Workers + archivos estáticos).
// Solo recibe las peticiones a /api/...; el resto lo sirven directamente los archivos estáticos.
// Reutiliza las funciones de api/ sin cambiarlas, a través del adaptador.
import { adaptar } from '../lib/adaptador-cloudflare.mjs';
import cspReport from '../api/csp-report.js';
import eliminarCuenta from '../api/eliminar-cuenta.js';
import generarInversion from '../api/generar-inversion.js';
import postsAdmin from '../api/posts-admin.js';

const rutas = {
  '/api/csp-report': adaptar(cspReport),
  '/api/eliminar-cuenta': adaptar(eliminarCuenta),
  '/api/generar-inversion': adaptar(generarInversion),
  '/api/posts-admin': adaptar(postsAdmin),
};

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    const onRequest = rutas[pathname];
    if (onRequest) return onRequest({ request, env, ctx });
    // Carpetas (/ y /blog/guia/...): se sirven con su index.html, sin cambiar la dirección
    if (pathname.endsWith('/') && (request.method === 'GET' || request.method === 'HEAD')) {
      const url = new URL(request.url);
      url.pathname = pathname + 'index.html';
      return env.ASSETS.fetch(new Request(url, request));
    }
    // Cualquier otra ruta: archivos estáticos de la web
    return env.ASSETS.fetch(request);
  },
};
