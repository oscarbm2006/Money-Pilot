// Pruebas del adaptador que conecta las funciones de api/ con Cloudflare Pages Functions.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { adaptar } from '../lib/adaptador-cloudflare.mjs';

const require = createRequire(import.meta.url);

function contexto(metodo, ruta, { headers = {}, body, env = {} } = {}) {
  const init = { method: metodo, headers };
  if (body !== undefined) init.body = body;
  return { request: new Request('https://moneypilot.es' + ruta, init), env };
}

test('Adaptador Cloudflare: traduce petición y respuesta', async t => {
  await t.test('pasa método, cabeceras en minúsculas, cuerpo JSON y variables de entorno', async () => {
    const onRequest = adaptar((req, res) =>
      res.status(200).json({
        metodo: req.method,
        auth: req.headers.authorization,
        cuerpo: req.body,
        variable: process.env.PRUEBA_ADAPTADOR,
      })
    );
    const r = await onRequest(
      contexto('POST', '/api/x', {
        headers: { Authorization: 'Bearer abc', 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: 1 }),
        env: { PRUEBA_ADAPTADOR: 'ok' },
      })
    );
    assert.equal(r.status, 200);
    assert.match(r.headers.get('content-type'), /application\/json/);
    assert.deepEqual(await r.json(), { metodo: 'POST', auth: 'Bearer abc', cuerpo: { a: 1 }, variable: 'ok' });
  });

  await t.test('un JSON mal formado responde 400 sin llegar a la función', async () => {
    let llamada = false;
    const onRequest = adaptar(() => {
      llamada = true;
    });
    const r = await onRequest(
      contexto('POST', '/api/x', { headers: { 'Content-Type': 'application/json' }, body: '{roto' })
    );
    assert.equal(r.status, 400);
    assert.equal(llamada, false);
  });

  await t.test('si la función falla, responde 500 y no se cae', async () => {
    const original = console.error;
    console.error = () => {};
    try {
      const onRequest = adaptar(() => {
        throw new Error('boom');
      });
      const r = await onRequest(contexto('GET', '/api/x'));
      assert.equal(r.status, 500);
    } finally {
      console.error = original;
    }
  });
});

test('Adaptador Cloudflare con las funciones reales de api/', async t => {
  await t.test('csp-report: un aviso real responde 204 y se registra', async () => {
    const original = console.warn;
    const avisos = [];
    console.warn = m => avisos.push(String(m));
    try {
      const onRequest = adaptar(require('../api/csp-report.js'));
      const r = await onRequest(
        contexto('POST', '/api/csp-report', {
          headers: { 'Content-Type': 'application/csp-report' },
          body: JSON.stringify({ 'csp-report': { 'effective-directive': 'script-src', 'blocked-uri': 'https://x.test' } }),
        })
      );
      assert.equal(r.status, 204);
      assert.equal(avisos.length, 1);
      assert.match(avisos[0], /CSP-REPORTE/);
    } finally {
      console.warn = original;
    }
  });

  await t.test('csp-report: GET responde 405 con Allow: POST; cuerpo vacío o basura responde 204', async () => {
    const onRequest = adaptar(require('../api/csp-report.js'));
    const g = await onRequest(contexto('GET', '/api/csp-report'));
    assert.equal(g.status, 405);
    assert.equal(g.headers.get('allow'), 'POST');
    for (const cuerpo of ['', 'no es json']) {
      const r = await onRequest(contexto('POST', '/api/csp-report', { body: cuerpo }));
      assert.equal(r.status, 204);
    }
  });

  await t.test('eliminar-cuenta: sin sesión 401; sin confirmación 400; GET 405', async () => {
    const onRequest = adaptar(require('../api/eliminar-cuenta.js'));
    const sin = await onRequest(
      contexto('POST', '/api/eliminar-cuenta', { headers: { 'Content-Type': 'application/json' }, body: '{}' })
    );
    assert.equal(sin.status, 401);
    assert.match((await sin.json()).error, /Inicia sesión/);

    const sinConfirmar = await onRequest(
      contexto('POST', '/api/eliminar-cuenta', {
        headers: { Authorization: 'Bearer abc', 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmar: 'no' }),
      })
    );
    assert.equal(sinConfirmar.status, 400);

    const get = await onRequest(contexto('GET', '/api/eliminar-cuenta'));
    assert.equal(get.status, 405);
    assert.equal(get.headers.get('allow'), 'POST');
  });

  await t.test('posts-admin y generar-inversion: sin sesión de administrador responden 401; GET 405', async () => {
    for (const nombre of ['posts-admin', 'generar-inversion']) {
      const onRequest = adaptar(require(`../api/${nombre}.js`));
      const sin = await onRequest(
        contexto('POST', `/api/${nombre}`, { headers: { 'Content-Type': 'application/json' }, body: '{}' })
      );
      assert.equal(sin.status, 401, nombre);
      const get = await onRequest(contexto('GET', `/api/${nombre}`));
      assert.equal(get.status, 405, nombre);
    }
  });
});

test('Cloudflare Pages: archivos de configuración presentes', async () => {
  const { readFileSync, existsSync } = await import('node:fs');
  for (const f of ['lib/adaptador-cloudflare.mjs', 'public/_headers', 'wrangler.toml']) {
    assert.ok(existsSync(new URL('../' + f, import.meta.url)), f + ' debe existir');
  }
  const cabeceras = readFileSync(new URL('../public/_headers', import.meta.url), 'utf8');
  const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  for (const bloque of vercel.headers) {
    for (const h of bloque.headers) {
      assert.ok(cabeceras.includes(`${h.key}: ${h.value}`), `_headers debe incluir ${h.key} igual que vercel.json`);
    }
  }
});
