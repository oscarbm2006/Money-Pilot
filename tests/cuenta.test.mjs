import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { cargarModulo, cerrar } from './cargar.mjs';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

let M;
before(async () => { M = await cargarModulo('/src/cuenta.js'); });
after(async () => { await cerrar(); });

// ---------------------------------------------------------------- API: eliminar cuenta
describe('API /api/eliminar-cuenta', () => {
  const { crearHandler } = require('../api/eliminar-cuenta.js');
  const USUARIO = { id: 'u-real-1', email: 'ana@ejemplo.com' };
  const respuesta = () => { const r = { codigo: 0, cuerpo: null, headers: {}, statusCode: 0, setHeader(k, v) { r.headers[k] = v; }, end(txt) { r.codigo = r.statusCode; r.cuerpo = txt ? JSON.parse(txt) : null; } }; return r; };
  const clienteFalso = ({ usuario = USUARIO, errorUsuario = null, errorBorrado = null, lanza = false } = {}) => {
    const llamadas = { borrados: [] };
    return { llamadas, cliente: { auth: {
      getUser: async token => { if (lanza) throw new Error('caída'); return token === 'token-bueno' ? { data: { user: usuario }, error: errorUsuario } : { data: { user: null }, error: { message: 'jwt invalid' } }; },
      admin: { deleteUser: async id => { llamadas.borrados.push(id); return { error: errorBorrado }; } }
    } } };
  };
  const llamar = async (opciones, f = clienteFalso()) => {
    const res = respuesta();
    const handler = crearHandler(() => f.cliente);
    const errores = []; const orig = console.error; console.error = (...a) => errores.push(a.join(' '));
    try { await handler({ method: 'POST', headers: { authorization: 'Bearer token-bueno' }, body: { confirmar: 'ELIMINAR' }, ...opciones }, res); } finally { console.error = orig; }
    return { res, f, errores };
  };

  test('un usuario con sesión y confirmación elimina SU cuenta', async () => {
    const { res, f } = await llamar({});
    assert.equal(res.codigo, 200); assert.deepEqual(res.cuerpo, { ok: true });
    assert.deepEqual(f.llamadas.borrados, ['u-real-1']);
  });
  test('el identificador a borrar sale del token, nunca de lo que envíe el navegador', async () => {
    const { f } = await llamar({ body: { confirmar: 'ELIMINAR', id: 'u-de-otra-persona', user_id: 'u-de-otra-persona' } });
    assert.deepEqual(f.llamadas.borrados, ['u-real-1']);
  });
  test('sin sesión (sin token) responde 401 y no borra nada', async () => {
    const { res, f } = await llamar({ headers: {} });
    assert.equal(res.codigo, 401); assert.equal(f.llamadas.borrados.length, 0);
  });
  test('con un token falso o caducado responde 401 y no borra nada', async () => {
    const { res, f } = await llamar({ headers: { authorization: 'Bearer token-falso' } });
    assert.equal(res.codigo, 401); assert.equal(f.llamadas.borrados.length, 0);
  });
  test('sin la confirmación explícita responde 400 y no borra nada', async () => {
    for (const body of [{}, { confirmar: 'eliminar' }, { confirmar: true }, undefined, 'ELIMINAR']) {
      const { res, f } = await llamar({ body });
      assert.equal(res.codigo, 400, JSON.stringify(body)); assert.equal(f.llamadas.borrados.length, 0);
    }
  });
  test('la cuenta de administrador no se puede eliminar desde la app', async () => {
    const { res, f } = await llamar({}, clienteFalso({ usuario: { id: 'admin-1', email: 'SoporteMoneyPilot@gmail.com' } }));
    assert.equal(res.codigo, 403); assert.equal(f.llamadas.borrados.length, 0);
  });
  test('solo acepta POST (GET, PUT y DELETE dan 405)', async () => {
    for (const m of ['GET', 'PUT', 'DELETE']) { const { res, f } = await llamar({ method: m }); assert.equal(res.codigo, 405); assert.equal(res.headers.Allow, 'POST'); assert.equal(f.llamadas.borrados.length, 0); }
  });
  test('si Supabase falla al borrar: 500 con mensaje genérico (sin filtrar detalles internos)', async () => {
    const { res, errores } = await llamar({}, clienteFalso({ errorBorrado: { status: 500, message: 'detalle interno secreto' } }));
    assert.equal(res.codigo, 500); assert.ok(!JSON.stringify(res.cuerpo).includes('secreto'));
    assert.ok(errores.every(e => !e.includes('secreto')));
  });
  test('si algo lanza una excepción: 500 genérico y la función no se cae', async () => {
    const { res } = await llamar({}, clienteFalso({ lanza: true }));
    assert.equal(res.codigo, 500);
  });
});

// ---------------------------------------------------------------- Descargar mis datos
describe('Descargar mis datos', () => {
  // Base de datos falsa que RESPETA el filtro por usuario y la paginación, como hace Supabase
  const tablas = (extra = {}) => {
    const base = Object.fromEntries(M.TABLAS_USUARIO.map(t => [t, []]));
    return { ...base, ...extra };
  };
  const clienteDatos = (db, { falla = null } = {}) => ({
    peticiones: [],
    from(tabla) {
      const q = { tabla, filtros: [], orden: null, rango: null };
      const self = this;
      const api = {
        select() { return api; }, eq(c, v) { q.filtros.push([c, v]); return api; },
        order(c) { q.orden = c; return api; }, range(a, b) { q.rango = [a, b]; return api; },
        then(res) {
          self.peticiones.push(q);
          if (falla === tabla) return res({ data: null, error: { message: 'x' } });
          let filas = (db[tabla] || []).filter(r => q.filtros.every(([c, v]) => r[c] === v));
          if (q.rango) filas = filas.slice(q.rango[0], q.rango[1] + 1);
          res({ data: filas, error: null });
        }
      };
      return api;
    }
  });
  const ANA = { id: 'ana', email: 'ana@ejemplo.com' };

  test('reúne las 9 tablas con SOLO los datos del usuario (nada de otras personas)', async () => {
    const db = tablas({
      cuentas: [{ id: 1, user_id: 'ana', nombre: 'Nómina', saldo: 100 }, { id: 2, user_id: 'beto', nombre: 'Secreta de Beto', saldo: 999 }],
      deudas: [{ id: 1, user_id: 'beto', nombre: 'Deuda de Beto' }],
      finanzas_perfil: [{ user_id: 'ana', ingresos: 2000 }, { user_id: 'beto', ingresos: 5000 }]
    });
    const r = await M.reunirDatosUsuario(ANA, clienteDatos(db), new Date('2026-10-04T10:00:00Z'));
    assert.equal(r.usuario.email, 'ana@ejemplo.com'); assert.equal(r.exportado_el, '2026-10-04T10:00:00.000Z');
    for (const t of M.TABLAS_USUARIO) assert.ok(Array.isArray(r[t]), t + ' debe estar en la exportación');
    assert.equal(r.cuentas.length, 1); assert.equal(r.cuentas[0].nombre, 'Nómina');
    assert.equal(r.deudas.length, 0); assert.equal(r.finanzas_perfil[0].ingresos, 2000);
    assert.ok(!JSON.stringify(r).includes('Beto') && !JSON.stringify(r).includes('5000'));
  });
  test('cada consulta filtra por el usuario', async () => {
    const c = clienteDatos(tablas());
    await M.reunirDatosUsuario(ANA, c);
    assert.ok(c.peticiones.length >= 9);
    assert.ok(c.peticiones.every(q => q.filtros.some(([col, v]) => col === 'user_id' && v === 'ana')));
  });
  test('si una tabla tiene más de 1.000 filas, las lee todas por páginas', async () => {
    const muchas = Array.from({ length: 2503 }, (_, i) => ({ id: i + 1, user_id: 'ana', patrimonio_neto: i }));
    const r = await M.reunirDatosUsuario(ANA, clienteDatos(tablas({ seguimiento: muchas })));
    assert.equal(r.seguimiento.length, 2503);
    assert.equal(new Set(r.seguimiento.map(f => f.id)).size, 2503);
  });
  test('si una tabla falla, la descarga falla entera (no se entrega una copia incompleta como si estuviera completa)', async () => {
    await assert.rejects(() => M.reunirDatosUsuario(ANA, clienteDatos(tablas(), { falla: 'inversiones' })), /inversiones/);
  });
  test('nombre del archivo con la fecha', () => {
    assert.equal(M.nombreArchivoDatos(new Date('2026-10-04T23:30:00Z')), 'moneypilot-mis-datos-2026-10-04.json');
  });
  test('GUARDA: cualquier tabla de usuario que use la app debe estar en la descarga (menos el blog público)', () => {
    const usadas = new Set();
    for (const f of readdirSync(resolve(raiz, 'src')).filter(x => x.endsWith('.js'))) {
      for (const m of readFileSync(resolve(raiz, 'src', f), 'utf8').matchAll(/\.from\(["']([a-z_]+)["']\)/g)) usadas.add(m[1]);
    }
    usadas.delete('posts');
    for (const t of usadas) assert.ok(M.TABLAS_USUARIO.includes(t), `La tabla "${t}" guarda datos de usuario pero no está en la descarga de "Mis datos" (derecho de acceso/portabilidad)`);
  });
});

// ---------------------------------------------------------------- Limpieza local y llamada al servidor
describe('Eliminar mi cuenta (lado navegador)', () => {
  const almacenFalso = obj => ({ get length() { return Object.keys(obj).length; }, key: i => Object.keys(obj)[i], removeItem: k => { delete obj[k]; } });

  test('limpiarDatosLocales borra solo lo de MoneyPilot', () => {
    const datos = { 'salud-financiera:datos-v1': '1', 'salud-financiera:cuentas-v1': '2', 'salud-financiera:ultima-vista': 'x', 'otra-web:token': 'no-tocar', cookieBanner: 'no-tocar' };
    M.limpiarDatosLocales(almacenFalso(datos));
    assert.deepEqual(Object.keys(datos).sort(), ['cookieBanner', 'otra-web:token']);
  });
  test('limpiarDatosLocales nunca lanza error, aunque el almacenamiento falle', () => {
    assert.doesNotThrow(() => M.limpiarDatosLocales({ get length() { throw new Error('bloqueado'); } }));
  });
  const sesion = token => ({ auth: { getSession: async () => ({ data: { session: token ? { access_token: token } : null } }) } });

  test('sin sesión: avisa y NO llama al servidor', async () => {
    let llamado = false;
    const r = await M.solicitarEliminarCuenta(sesion(null), async () => { llamado = true; });
    assert.equal(r.ok, false); assert.ok(r.error.includes('sesión')); assert.equal(llamado, false);
  });
  test('con sesión: envía el token y la palabra de confirmación', async () => {
    let enviado;
    const r = await M.solicitarEliminarCuenta(sesion('tok123'), async (url, op) => { enviado = { url, op }; return { ok: true, json: async () => ({ ok: true }) }; });
    assert.equal(r.ok, true); assert.equal(enviado.url, '/api/eliminar-cuenta'); assert.equal(enviado.op.method, 'POST');
    assert.equal(enviado.op.headers.Authorization, 'Bearer tok123'); assert.deepEqual(JSON.parse(enviado.op.body), { confirmar: 'ELIMINAR' });
  });
  test('si el servidor responde con error, se muestra su mensaje', async () => {
    const r = await M.solicitarEliminarCuenta(sesion('t'), async () => ({ ok: false, json: async () => ({ error: 'La cuenta de administrador no se puede eliminar desde la aplicación.' }) }));
    assert.equal(r.ok, false); assert.ok(r.error.includes('administrador'));
  });
  test('si no hay conexión o la respuesta no es válida, mensaje claro y sin romper', async () => {
    const sinRed = await M.solicitarEliminarCuenta(sesion('t'), async () => { throw new Error('red'); });
    assert.equal(sinRed.ok, false); assert.ok(sinRed.error.includes('conectar'));
    const rara = await M.solicitarEliminarCuenta(sesion('t'), async () => ({ ok: false, json: async () => { throw new Error('no json'); } }));
    assert.equal(rara.ok, false); assert.ok(rara.error.length > 10);
  });
  test('una respuesta ok pero sin {ok:true} no se da por buena', async () => {
    const r = await M.solicitarEliminarCuenta(sesion('t'), async () => ({ ok: true, json: async () => ({}) }));
    assert.equal(r.ok, false);
  });
});

// ---------------------------------------------------------------- Conexión con la app
describe('"Mi cuenta" en la app', () => {
  const app = readFileSync(resolve(raiz, 'src/App.js'), 'utf8');
  test('la app importa y muestra el modal solo con sesión iniciada', () => {
    assert.ok(app.includes("import { MiCuentaModal } from './cuenta.js'"));
    assert.ok(/showCuentaModal && user && .*MiCuentaModal/s.test(app), 'el modal debe depender de que haya usuario');
  });
  test('hay accesos a "Mi cuenta" en la cabecera y en el pie, ambos solo para usuarios con sesión', () => {
    const accesos = [...app.matchAll(/"Mi cuenta"/g)];
    assert.ok(accesos.length >= 2, 'faltan accesos');
    assert.ok(/user \? \/\*#__PURE__\*\/React\.createElement\("button", \{\s*onClick: \(\) => setShowCuentaModal\(true\)/.test(app), 'el acceso del pie debe estar condicionado a user');
  });
  test('la política de privacidad explica dónde están los datos y cómo ejercer los derechos', () => {
    const p = readFileSync(resolve(raiz, 'public/privacidad.html'), 'utf8');
    assert.ok(p.includes('Irlanda') && p.includes('Mi cuenta') && p.includes('soportemoneypilot@gmail.com'));
  });
});
