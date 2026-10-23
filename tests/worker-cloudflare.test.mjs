// Pruebas del punto de entrada de Cloudflare (worker/index.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.mjs';

function peticion(metodo, ruta, init = {}) {
  return new Request('https://moneypilot.es' + ruta, { method: metodo, ...init });
}

test('Worker de Cloudflare: reparte las rutas /api/ y deja pasar lo demás', async t => {
  await t.test('/api/csp-report recibe un aviso y responde 204', async () => {
    const original = console.warn;
    console.warn = () => {};
    try {
      const r = await worker.fetch(
        peticion('POST', '/api/csp-report', {
          headers: { 'Content-Type': 'application/csp-report' },
          body: JSON.stringify({ 'csp-report': { 'effective-directive': 'script-src' } }),
        }),
        { ASSETS: { fetch: () => new Response('no debe llamarse') } },
        {}
      );
      assert.equal(r.status, 204);
    } finally {
      console.warn = original;
    }
  });

  await t.test('las 3 funciones con sesión responden 401 sin sesión y 405 con GET', async () => {
    const env = { ASSETS: { fetch: () => new Response('no debe llamarse') } };
    for (const nombre of ['eliminar-cuenta', 'posts-admin', 'generar-inversion']) {
      const sin = await worker.fetch(
        peticion('POST', `/api/${nombre}`, { headers: { 'Content-Type': 'application/json' }, body: '{}' }),
        env,
        {}
      );
      assert.equal(sin.status, 401, nombre);
      const get = await worker.fetch(peticion('GET', `/api/${nombre}`), env, {});
      assert.equal(get.status, 405, nombre);
    }
  });

  await t.test('cualquier otra ruta se entrega a los archivos estáticos', async () => {
    const vistas = [];
    const env = {
      ASSETS: {
        fetch: req => {
          vistas.push(new URL(req.url).pathname);
          return new Response('estático', { status: 200 });
        },
      },
    };
    for (const ruta of ['/privacidad.html', '/ads.txt', '/api/no-existe']) {
      const r = await worker.fetch(peticion('GET', ruta), env, {});
      assert.equal(r.status, 200);
      assert.equal(await r.text(), 'estático');
    }
    assert.deepEqual(vistas, ['/privacidad.html', '/ads.txt', '/api/no-existe']);
  });

  await t.test('las carpetas se sirven con su index.html, sin cambiar la dirección', async () => {
    const vistas = [];
    const env = {
      ASSETS: {
        fetch: req => {
          vistas.push(new URL(req.url).pathname);
          return new Response('página', { status: 200 });
        },
      },
    };
    for (const ruta of ['/', '/blog/guia/', '/blog/tesis/']) {
      const r = await worker.fetch(peticion('GET', ruta), env, {});
      assert.equal(r.status, 200);
    }
    assert.deepEqual(vistas, ['/index.html', '/blog/guia/index.html', '/blog/tesis/index.html']);
  });
});

test('Cloudflare Workers: configuración presente y coherente', async () => {
  const { readFileSync, existsSync } = await import('node:fs');
  assert.ok(existsSync(new URL('../worker/index.mjs', import.meta.url)), 'worker/index.mjs debe existir');
  const toml = readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8');
  assert.match(toml, /main = "worker\/index\.mjs"/);
  assert.match(toml, /directory = "\.\/dist"/);
  assert.match(toml, /html_handling = "none"/);
  assert.match(toml, /run_worker_first = \[[^\]]*"\/api\/\*"[^\]]*"\/"/);
  assert.match(toml, /nodejs_compat/);
});
