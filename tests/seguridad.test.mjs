import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Readable } from 'node:stream';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const leer = r => readFileSync(resolve(raiz, r), 'utf8');

const vercel = JSON.parse(leer('vercel.json'));
const cabeceras = Object.fromEntries(vercel.headers[0].headers.map(h => [h.key, h.value]));
const csp = Object.fromEntries((cabeceras['Content-Security-Policy-Report-Only'] || '').split(';').map(x => x.trim()).filter(Boolean).map(x => { const [k, ...v] = x.split(/\s+/); return [k, v]; }));

describe('Cabeceras de seguridad (vercel.json)', () => {
  test('están las protecciones básicas', () => {
    assert.equal(cabeceras['X-Content-Type-Options'], 'nosniff');
    assert.equal(cabeceras['X-Frame-Options'], 'SAMEORIGIN');
    assert.ok(cabeceras['Referrer-Policy']); assert.ok(cabeceras['Permissions-Policy']);
  });
  test('la política CSP está en modo "solo avisar" (no bloquea la web)', () => {
    assert.ok(cabeceras['Content-Security-Policy-Report-Only']);
    assert.ok(!('Content-Security-Policy' in cabeceras), 'si se activa el bloqueo, hay que hacerlo a propósito y revisando antes los avisos');
  });
  test('los scripts solo se permiten de la propia web y de los dos CDN que usa', () => {
    assert.deepEqual(csp['script-src'].sort(), ["'self'", 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'].sort());
    assert.ok(!csp['script-src'].includes("'unsafe-inline'") && !csp['script-src'].includes("'unsafe-eval'"));
  });
  test('la conexión permitida incluye TU Supabase (si cambias de proyecto, esta prueba avisa)', () => {
    const url = /SUPABASE_URL = "(https:\/\/[^"]+)"/.exec(leer('src/constantes.js'))[1];
    const host = new URL(url).host;
    assert.ok(csp['connect-src'].includes(url), 'falta ' + url);
    assert.ok(csp['connect-src'].includes('wss://' + host));
  });
  test('prohíbe objetos incrustados y limita base-uri, formularios y marcos', () => {
    assert.deepEqual(csp['object-src'], ["'none'"]);
    assert.deepEqual(csp['base-uri'], ["'self'"]); assert.deepEqual(csp['frame-ancestors'], ["'self'"]);
  });
  test('los avisos se envían al endpoint propio', () => {
    assert.deepEqual(csp['report-uri'], ['/api/csp-report']);
  });
  test('ninguna página pública tiene scripts escritos dentro del HTML (así se puede activar la política en modo bloqueo)', () => {
    const paginas = ['index.html', ...readdirSync(resolve(raiz, 'public')).filter(f => f.endsWith('.html')).map(f => 'public/' + f)];
    for (const p of paginas) {
      const enLinea = [...leer(p).matchAll(/<script(?![^>]*\ssrc=)([^>]*)>/g)].filter(m => !/ld\+json/.test(m[1]));
      assert.equal(enLinea.length, 0, `${p} tiene ${enLinea.length} script(s) en línea: muévelo(s) a un archivo .js`);
    }
  });
  test('la política deja pasar todo lo que la web principal necesita (scripts y conexiones reales)', () => {
    const html = leer('index.html');
    const scripts = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map(m => m[1]);
    assert.ok(scripts.length >= 3);
    for (const s of scripts) {
      if (s.startsWith('http')) assert.ok(csp['script-src'].includes(new URL(s).origin), 'script no permitido: ' + s);
    }
    const enLinea = [...html.matchAll(/<script(?![^>]*\ssrc=)([^>]*)>/g)].filter(m => !/ld\+json/.test(m[1]));
    assert.equal(enLinea.length, 0, 'la web principal no debe tener scripts en línea');
  });
});

describe('Enlaces seguros del panel de administración (urlSegura)', () => {
  const { urlSegura } = require('../lib/verificar-admin.js');
  test('admite rutas internas y https', () => {
    assert.equal(urlSegura('/'), '/'); assert.equal(urlSegura('/guia/x'), '/guia/x'); assert.equal(urlSegura(' https://ejemplo.com/a '), 'https://ejemplo.com/a');
  });
  test('rechaza javascript:, http, data:, rutas // y vacíos', () => {
    for (const x of ['javascript:alert(1)', 'JAVASCRIPT:alert(1)', 'http://x.com', 'data:text/html,<b>', '//evil.com', '', null, undefined, 'ftp://x']) assert.equal(urlSegura(x), '/', String(x));
  });
});

describe('Endpoint de avisos CSP (/api/csp-report)', () => {
  const handler = require('../api/csp-report.js');
  const respuesta = () => { const r = { code: null, headers: {}, statusCode: 0, setHeader(k, v) { r.headers[k] = v; }, end() { r.code = r.statusCode; } }; return r; };
  const peticion = (metodo, cuerpo, usarFlujo = false) => {
    const base = usarFlujo ? Readable.from([Buffer.from(cuerpo || '')]) : {};
    base.method = metodo; base.headers = {};
    if (!usarFlujo) base.body = cuerpo;
    return base;
  };
  const capturar = async f => { const logs = []; const orig = console.warn; console.warn = (...a) => logs.push(a.join(' ')); try { await f(); } finally { console.warn = orig; } return logs; };

  test('un aviso real se registra con los datos clave y responde 204', async () => {
    const res = respuesta();
    const aviso = { 'csp-report': { 'document-uri': 'https://miweb.com/', 'violated-directive': "script-src-elem", 'blocked-uri': 'https://raro.com/x.js', 'source-file': 'https://miweb.com/', 'line-number': 12 } };
    const logs = await capturar(() => handler(peticion('POST', Buffer.from(JSON.stringify(aviso))), res));
    assert.equal(res.code, 204);
    assert.equal(logs.length, 1);
    assert.ok(logs[0].startsWith('CSP-REPORTE ') && logs[0].includes('raro.com') && logs[0].includes('script-src-elem'));
  });
  test('también acepta el formato nuevo (lista de informes) y el cuerpo ya interpretado', async () => {
    const res = respuesta();
    const logs = await capturar(() => handler(peticion('POST', [{ type: 'csp-violation', body: { effectiveDirective: 'img-src', blockedURL: 'https://img.com/a.png', documentURL: 'https://miweb.com/p' } }]), res));
    assert.equal(res.code, 204); assert.ok(logs[0].includes('img-src') && logs[0].includes('img.com'));
  });
  test('si el cuerpo llega como flujo (sin interpretar), también lo lee', async () => {
    const res = respuesta();
    const logs = await capturar(() => handler(peticion('POST', JSON.stringify({ 'csp-report': { 'blocked-uri': 'https://flujo.com' } }), true), res));
    assert.equal(res.code, 204); assert.ok(logs[0].includes('flujo.com'));
  });
  test('un texto con saltos de línea no puede falsear el registro', async () => {
    const res = respuesta();
    const logs = await capturar(() => handler(peticion('POST', { 'csp-report': { 'blocked-uri': 'a\nCSP-REPORTE {"falso":true}' } }), res));
    assert.equal(logs.length, 1); assert.ok(!logs[0].includes('\n'));
  });
  test('los campos muy largos se recortan', async () => {
    const res = respuesta();
    const logs = await capturar(() => handler(peticion('POST', { 'csp-report': { 'blocked-uri': 'x'.repeat(5000) } }), res));
    assert.ok(logs[0].length < 800);
  });
  test('basura, vacío, cuerpo enorme o GET: nunca falla ni registra de más', async () => {
    for (const [m, c, flujo] of [['POST', 'esto no es json', true], ['POST', '', true], ['POST', null, false], ['POST', 'x'.repeat(20000), true]]) {
      const res = respuesta(); const logs = await capturar(() => handler(peticion(m, c, flujo), res));
      assert.equal(res.code, 204); assert.equal(logs.length, 0);
    }
    const res = respuesta(); await handler(peticion('GET'), res);
    assert.equal(res.code, 405); assert.equal(res.headers.Allow, 'POST');
  });
  test('un envío con cientos de informes solo registra los 5 primeros', async () => {
    const res = respuesta(); const muchos = Array.from({ length: 300 }, (_, i) => ({ body: { blockedURL: 'u' + i } }));
    const logs = await capturar(() => handler(peticion('POST', muchos), res));
    assert.equal(logs.length, 5);
  });
});
