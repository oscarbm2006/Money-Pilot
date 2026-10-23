// lib/adaptador-cloudflare.mjs
// Puente entre las funciones de api/ (formato Vercel: req, res) y Cloudflare Pages Functions.
// Las funciones originales NO se modifican: este archivo solo traduce la petición y la respuesta.

const LIMITE_CUERPO = 1000000; // 1 MB: de sobra para las peticiones de este sitio

export function adaptar(handler) {
  return async function onRequest(context) {
    const { request, env } = context;

    // Pasa las variables secretas de Cloudflare a process.env, como hacía Vercel
    if (typeof process !== 'undefined' && process.env && env) {
      for (const [clave, valor] of Object.entries(env)) {
        if (typeof valor === 'string') process.env[clave] = valor;
      }
    }

    const url = new URL(request.url);
    const headers = {};
    request.headers.forEach((valor, clave) => {
      headers[clave.toLowerCase()] = valor;
    });

    // Cuerpo: JSON ya interpretado si el tipo es application/json; si no, texto (como en Vercel)
    let body;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      let texto = '';
      try {
        texto = await request.text();
      } catch (e) {
        texto = '';
      }
      if (texto.length > LIMITE_CUERPO) {
        return new Response(JSON.stringify({ error: 'Cuerpo demasiado grande' }), {
          status: 413,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        });
      }
      const tipo = (headers['content-type'] || '').toLowerCase();
      if (tipo.includes('application/json')) {
        try {
          body = texto ? JSON.parse(texto) : undefined;
        } catch (e) {
          return new Response(JSON.stringify({ error: 'JSON no válido' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
          });
        }
      } else {
        body = texto;
      }
    }

    const req = {
      method: request.method,
      headers,
      body,
      url: url.pathname + url.search,
      query: Object.fromEntries(url.searchParams),
      // El cuerpo ya está leído: el flujo queda vacío (lo usa csp-report como alternativa)
      async *[Symbol.asyncIterator]() {},
    };

    return new Promise(resolve => {
      let estado = 200;
      let terminado = false;
      const cabeceras = new Headers();

      const terminar = cuerpo => {
        if (terminado) return res;
        terminado = true;
        const sinCuerpo = estado === 204 || estado === 304 || cuerpo === undefined || cuerpo === null;
        resolve(new Response(sinCuerpo ? null : cuerpo, { status: estado, headers: cabeceras }));
        return res;
      };

      const res = {
        get statusCode() {
          return estado;
        },
        set statusCode(valor) {
          estado = valor;
        },
        status(codigo) {
          estado = codigo;
          return res;
        },
        setHeader(clave, valor) {
          cabeceras.set(clave, String(valor));
          return res;
        },
        json(objeto) {
          cabeceras.set('Content-Type', 'application/json; charset=utf-8');
          return terminar(JSON.stringify(objeto));
        },
        send(texto) {
          return terminar(typeof texto === 'string' ? texto : JSON.stringify(texto));
        },
        end(texto) {
          return terminar(texto);
        },
      };

      Promise.resolve()
        .then(() => handler(req, res))
        .then(() => {
          if (!terminado) terminar();
        })
        .catch(e => {
          console.error('ADAPTADOR error', e && e.message ? e.message : 'desconocido');
          if (!terminado) {
            estado = 500;
            cabeceras.set('Content-Type', 'application/json; charset=utf-8');
            terminar(JSON.stringify({ error: 'Error interno' }));
          }
        });
    });
  };
}
