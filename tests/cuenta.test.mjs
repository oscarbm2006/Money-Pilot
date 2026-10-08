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

// ---------------------------------------------------------------- Informe legible
describe('Informe legible de "Mis datos"', () => {
  const ahora = new Date('2026-10-05T09:30:00Z');
  const base = () => Object.fromEntries(M.SECCIONES_INFORME.map(t => [t, []]));
  const datos = (extra = {}) => ({ usuario: { email: 'ana@ejemplo.com' }, ...base(), ...extra });
  const informe = (extra = {}) => M.construirInformeHtml(datos(extra), ahora);
  const quitarEtiquetas = h => h.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&');

  const completo = () => informe({
    cuentas: [{ banco: 'ING', nombre: 'Nómina', tipo: 'Corriente', saldo: 2430.55, moneda: 'EUR' }, { banco: 'Openbank', nombre: 'Ahorro', tipo: 'Remunerada', saldo: 12500, moneda: 'EUR' }, { banco: 'Revolut', nombre: 'Viajes', tipo: 'Corriente', saldo: 310, moneda: 'USD' }],
    deudas: [{ nombre: 'Visa', tipo: 'tarjeta', entidad: 'BBVA', saldo_pendiente: 1850, tae: 21.5, cuota_mensual: 120, plazo_restante_meses: 18, estrategia: 'avalancha', moneda: 'EUR' }],
    inversiones: [{ nombre: 'MSCI', tipo: 'etf', isin: 'IE00B6R52259', participaciones: 24.5, valor_actual: 3120.4, total_aportado: 2800, aportacion_periodica: 150, frecuencia_aportacion: 'mensual', fecha_compra: '2025-03-14', moneda: 'EUR', metadatos: {} }, { nombre: 'Bitcoin', tipo: 'otro', valor_actual: 2900, moneda: 'EUR', metadatos: { tipo_ui: 'Criptomoneda' } }],
    activos: [{ nombre: 'Piso', tipo: 'Vivienda', valor_actual: 185000, pagada: false, pendiente_pago: 92000, moneda: 'EUR' }],
    seguimiento: [{ registrado_at: '2026-09-01T08:00:00Z', patrimonio_neto: 111800, origen: 'auto' }, { registrado_at: '2026-10-03T10:00:00Z', patrimonio_neto: 115210.95, origen: 'manual' }],
    finanzas_perfil: [{ ingresos: 2650, ahorro_actual: 15240.55, perfil_riesgo: 'Moderado', gastos_fijos: { alimentacion: { valor: 320, frecuencia: 'mensual' }, seguros: { valor: 90, frecuencia: 'trimestral' }, suministros: { valor: 95, frecuencia: 'mensual' } }, gastos_disc: { suscripciones: { valor: 120, frecuencia: 'anual' } }, deudas: [{ nombre: 'Visa', pendiente: 1850, tasa: 21.5, cuota: 120 }], objetivos: [{ nombre: 'Entrada piso', importeObjetivo: 40000, importeReservado: 12500, plazoAnios: 5, prioridad: 'alta', aportacionMensual: 450 }] }],
    finanzas_historial: [{ ratio_ahorro: 0.21, created_at: '2026-09-20T10:00:00Z' }],
    finanzas_quiz: [{ terminado: true, updated_at: '2026-09-25T10:00:00Z', resultado: { perfil: 'Moderado' } }]
  });

  test('cada tabla de datos del usuario tiene su sección en el informe (nada se queda fuera)', () => {
    assert.deepEqual([...M.SECCIONES_INFORME].sort(), [...M.TABLAS_USUARIO].sort());
  });
  test('muestra todas las secciones, también las vacías, con un mensaje claro', () => {
    const h = informe();
    for (const t of ['Cuentas', 'Deudas', 'Inversiones', 'Otros activos', 'Evolución de tu patrimonio', 'Tu diagnóstico', 'Cuestionario de perfil de inversor', 'Historial de tu ahorro', 'Plan financiero']) assert.ok(h.includes('<h2>' + t + '</h2>'), t);
    assert.ok(h.includes('No hay datos guardados en esta sección.') && h.includes('Aún no has completado el diagnóstico.'));
  });
  test('las cifras se ven con formato español (miles con punto, coma decimal, euros)', () => {
    const t = quitarEtiquetas(completo()).replace(/\u00a0/g, ' ');
    for (const x of ['2.430,55 €', '12.500,00 €', '3.120,40 €', '185.000,00 €', '115.210,95 €', '21,50%']) assert.ok(t.includes(x), 'falta ' + x);
  });
  test('las fechas salen como dd/mm/aaaa y los códigos internos se traducen a palabras', () => {
    const t = quitarEtiquetas(completo());
    for (const x of ['14/03/2025', '03/10/2026', 'Tarjeta de crédito', 'Avalancha', 'Criptomoneda', 'ETF', 'Automático', 'Manual', 'Alta']) assert.ok(t.includes(x), 'falta ' + x);
    for (const mal of ['prestamo_personal', 'plan_pensiones']) assert.ok(!t.includes(mal), 'quedó un código interno: ' + mal);
  });
  test('los totales solo suman euros y avisan si hay importes en otra moneda', () => {
    const t = quitarEtiquetas(completo()).replace(/\u00a0/g, ' ');
    assert.ok(t.includes('14.930,55 €'), 'el total debe ser 2.430,55 + 12.500 (sin los 310 USD)');
    assert.ok(t.includes('sin contar los importes en otras monedas'));
    assert.ok(t.includes('310,00 USD'), 'la cuenta en dólares sí aparece en su tabla, con su moneda');
  });
  test('los gastos se explican por concepto y frecuencia, y el total mensual convierte trimestres y años', () => {
    const t = quitarEtiquetas(completo()).replace(/\u00a0/g, ' ');
    assert.ok(t.includes('Alimentación') && t.includes('al trimestre') && t.includes('al año'));
    assert.ok(t.includes('445,00 €'), 'fijos: 320 + 95 + 90/3 = 445 al mes');
    assert.ok(t.includes('10,00 €'), 'variables: 120 al año = 10 al mes');
  });
  test('no se pierde ningún gasto: también salen los conceptos que no figuran en la lista de su grupo', () => {
    const t = quitarEtiquetas(informe({ finanzas_perfil: [{ ingresos: 2000, gastos_fijos: { conceptoNuevoRaro: { valor: 77, frecuencia: 'mensual' }, alquiler: { valor: 600, frecuencia: 'mensual' } }, gastos_disc: { suscripciones: { valor: 120, frecuencia: 'anual' } }, deudas: [], objetivos: [] }] })).replace(/\u00a0/g, ' ');
    assert.ok(t.includes('Concepto Nuevo Raro') && t.includes('77,00 €'), 'un concepto desconocido se muestra con su nombre legible');
    assert.ok(t.includes('Suscripciones') && t.includes('120,00 €') && t.includes('al año'), 'una categoría guardada en el grupo "variables" aunque la app la liste en otro, también sale');
    assert.ok(t.indexOf('Alquiler') < t.indexOf('Concepto Nuevo Raro'), 'los conceptos conocidos van primero, en el orden de la app');
  });
  test('los textos escritos por el usuario no pueden ejecutar código en el informe', () => {
    const h = informe({ cuentas: [{ banco: '<img src=x onerror=alert(1)>', nombre: '"><script>alert(2)</script>', tipo: "O'Reilly & Co", saldo: 5, moneda: 'EUR' }], activos: [{ nombre: '<script>alert(3)</script>', tipo: 'x', valor_actual: 1, notas: '<b onclick="x()">', moneda: 'EUR' }] });
    assert.ok(!/<script/i.test(h) && !/<img/i.test(h), 'se coló una etiqueta peligrosa');
    assert.ok(h.includes('&lt;script&gt;alert(2)&lt;/script&gt;') && h.includes('O&#39;Reilly &amp; Co'));
    assert.ok(!informe({ usuario: { email: '<script>x</script>' } }).includes('<script>x'));
  });
  test('el archivo es autónomo: no carga nada de internet y bloquea scripts por sí mismo', () => {
    const h = completo();
    assert.ok(!/https?:\/\//i.test(h) && !/<script/i.test(h) && !/\ssrc=|\shref=/i.test(h));
    assert.ok(h.includes('Content-Security-Policy') && h.includes("default-src 'none'"));
    assert.ok(h.startsWith('<!DOCTYPE html>') && h.includes('<meta charset="UTF-8">'));
  });
  test('datos incompletos (nulos, vacíos o raros) nunca producen "undefined", "null" ni "NaN"', () => {
    const h = informe({ cuentas: [{ banco: null, nombre: undefined, tipo: '', saldo: null }], deudas: [{ saldo_pendiente: 'abc', tae: null, estrategia: 'rara', tipo: 'inventado' }], inversiones: [{ nombre: null, participaciones: '', valor_actual: undefined }], activos: [{}], seguimiento: [{ registrado_at: 'fecha rara', patrimonio_neto: NaN }], finanzas_perfil: [{ ingresos: null, gastos_fijos: null, gastos_disc: 'raro', deudas: 'nada', objetivos: null }], finanzas_historial: [{ ratio_ahorro: null }], finanzas_quiz: [{ resultado: 'texto' }], plan_financiero: [{ fases: 'x' }] });
    const t = quitarEtiquetas(h);
    for (const mal of ['undefined', 'null', 'NaN', '[object']) assert.ok(!t.includes(mal), 'aparece "' + mal + '"');
  });
  test('un informe con miles de registros se genera rápido y los incluye todos', () => {
    const muchos = Array.from({ length: 3000 }, (_, i) => ({ registrado_at: new Date(Date.UTC(2020, 0, 1 + i)).toISOString(), patrimonio_neto: 1000 + i, origen: 'auto' }));
    const t0 = Date.now(); const h = informe({ seguimiento: muchos });
    assert.ok(Date.now() - t0 < 1500); assert.equal((h.match(/<tr><td>/g) || []).length, 3000);
  });
  test('el seguimiento va del más reciente al más antiguo', () => {
    const h = informe({ seguimiento: [{ registrado_at: '2026-01-01T00:00:00Z', patrimonio_neto: 1 }, { registrado_at: '2026-06-01T00:00:00Z', patrimonio_neto: 2 }] });
    const tabla = h.slice(h.indexOf('<tbody>'), h.indexOf('</tbody>'));
    assert.ok(tabla.indexOf('01/06/2026') < tabla.indexOf('01/01/2026'));
  });
  test('nombre del archivo del informe', () => {
    assert.equal(M.nombreArchivoInforme(new Date('2026-10-05T09:00:00Z')), 'moneypilot-mi-informe-2026-10-05.html');
  });
});

// ---------------------------------------------------------------- Gráficos del informe
describe('Gráficos del informe', () => {
  const ahora = new Date('2026-10-05T09:30:00Z');
  const base = () => Object.fromEntries(M.SECCIONES_INFORME.map(t => [t, []]));
  const informe = (extra = {}) => M.construirInformeHtml({ usuario: { email: 'ana@ejemplo.com' }, ...base(), ...extra }, ahora);
  const svgs = h => [...h.matchAll(/<svg[\s\S]*?<\/svg>/g)].map(m => m[0]);
  const texto = h => h.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\u00a0/g, ' ').replace(/&amp;/g, '&');
  const hoy = (d) => new Date(Date.UTC(2026, 8, d)).toISOString();
  const completo = (extra = {}) => informe({
    cuentas: [{ banco: 'ING', nombre: 'N', tipo: 'Corriente', saldo: 2430.55, moneda: 'EUR' }, { banco: 'Open', nombre: 'A', tipo: 'Remunerada', saldo: 12500, moneda: 'EUR' }, { banco: 'Rev', nombre: 'V', tipo: 'Corriente', saldo: 310, moneda: 'USD' }],
    deudas: [{ nombre: 'Visa', tipo: 'tarjeta', saldo_pendiente: 1850, moneda: 'EUR' }],
    inversiones: [{ nombre: 'MSCI', tipo: 'etf', valor_actual: 3120.4, moneda: 'EUR', metadatos: {} }, { nombre: 'BTC', tipo: 'otro', valor_actual: 2900, moneda: 'EUR', metadatos: {} }],
    activos: [{ nombre: 'Piso', tipo: 'Vivienda', valor_actual: 185000, pagada: false, pendiente_pago: 92000, moneda: 'EUR' }],
    seguimiento: [{ registrado_at: hoy(1), patrimonio_neto: 100000 }, { registrado_at: hoy(2), patrimonio_neto: 105000 }, { registrado_at: hoy(11), patrimonio_neto: 120000 }],
    finanzas_perfil: [{ ingresos: 2650, gastos_fijos: { alimentacion: { valor: 320, frecuencia: 'mensual' }, seguros: { valor: 90, frecuencia: 'trimestral' } }, gastos_disc: { ocio: { valor: 150, frecuencia: 'mensual' } }, deudas: [], objetivos: [] }],
    ...extra
  });

  test('con datos completos hay 3 gráficos (patrimonio, evolución y gastos), cada uno con descripción para lectores de pantalla', () => {
    const g = svgs(completo());
    assert.equal(g.length, 3);
    for (const s of g) assert.ok(/role="img"/.test(s) && /aria-label="[^"]+"/.test(s) && /<title>/.test(s));
  });
  test('sin datos no hay gráficos vacíos ni errores', () => {
    const h = informe();
    assert.equal(svgs(h).length, 0);
    assert.ok(!/NaN|undefined|Infinity/.test(texto(h)));
  });
  test('todos los gráficos son XML bien formado y sin valores numéricos rotos', () => {
    const balanceado = s => { const pila = []; for (const m of s.matchAll(/<(\/?)([a-z]+)([^>]*?)(\/?)>/g)) { const [, cierre, nombre, , auto] = m; if (auto) continue; if (cierre) { if (pila.pop() !== nombre) return false; } else pila.push(nombre); } return pila.length === 0; };
    for (const s of svgs(completo())) {
      assert.ok(balanceado(s), 'etiquetas sin cerrar');
      assert.ok(!/NaN|Infinity|undefined|null/.test(s), 'valor roto dentro del gráfico');
    }
  });
  test('los gráficos no dependen de CSS externo (se ven igual al imprimir o en un visor de PDF)', () => {
    for (const s of svgs(completo())) assert.ok(!/\sclass=|\sstyle=/.test(s), 'el estilo debe ir en atributos del propio elemento');
  });
  test('el patrimonio neto sigue la misma fórmula que la app: cuentas + inversiones + activos − (deudas + lo que queda por pagar de activos), solo en euros', () => {
    const t = texto(completo());
    assert.ok(t.includes('112.100,95 €'), '14.930,55 + 6.020,40 + 185.000 − (1.850 + 92.000)');
    assert.ok(t.includes('93.850,00 €'), 'la tarjeta de deudas incluye lo pendiente de pago del piso');
    assert.ok(t.includes('lo que queda por pagar de tus activos'));
  });
  test('sin cuentas, la liquidez es el ahorro actual del diagnóstico (como en la app)', () => {
    const t = texto(informe({ finanzas_perfil: [{ ingresos: 2000, ahorro_actual: 5000, gastos_fijos: {}, gastos_disc: {}, deudas: [], objetivos: [] }] }));
    assert.ok(t.includes('5.000,00 €'));
  });
  test('las deudas del diagnóstico no se repiten si ya salen en la sección de deudas', () => {
    const perfil = [{ ingresos: 1, gastos_fijos: {}, gastos_disc: {}, deudas: [{ nombre: 'Visa', pendiente: 1850, tasa: 20, cuota: 100 }], objetivos: [] }];
    assert.ok(!informe({ deudas: [{ nombre: 'Visa', tipo: 'tarjeta', saldo_pendiente: 1850, moneda: 'EUR' }], finanzas_perfil: perfil }).includes('Deudas indicadas en el diagnóstico'));
    assert.ok(informe({ finanzas_perfil: perfil }).includes('Deudas indicadas en el diagnóstico'));
  });

  describe('evolución del patrimonio', () => {
    const polilinea = h => { const m = /<polyline points="([^"]+)"/.exec(h); return m ? m[1].split(' ').map(p => p.split(',').map(Number)) : null; };
    test('dibuja un punto por registro, en orden cronológico y con el tiempo a escala', () => {
      const pts = polilinea(completo());
      assert.equal(pts.length, 3);
      assert.ok(pts[0][0] < pts[1][0] && pts[1][0] < pts[2][0]);
      // día 1, día 2 y día 11: el segundo punto está al 10 % del recorrido (84 + 0,1 × 536)
      assert.ok(Math.abs(pts[1][0] - (84 + 0.1 * 536)) < 0.6, 'x del 2º punto: ' + pts[1][0]);
      // más patrimonio = más arriba (y menor)
      assert.ok(pts[0][1] > pts[1][1] && pts[1][1] > pts[2][1]);
      for (const [x, y] of pts) assert.ok(x >= 84 && x <= 620 && y >= 16 && y <= 236);
    });
    test('con un solo registro, o varios del mismo instante, explica por qué no hay gráfico', () => {
      for (const seg of [[{ registrado_at: hoy(1), patrimonio_neto: 100 }], [{ registrado_at: hoy(1), patrimonio_neto: 100 }, { registrado_at: hoy(1), patrimonio_neto: 200 }]]) {
        const h = informe({ seguimiento: seg });
        assert.equal(polilinea(h), null); assert.ok(h.includes('todavía no hay una evolución que dibujar'));
      }
    });
    test('si el patrimonio pasa de negativo a positivo, se marca la línea del cero', () => {
      const h = informe({ seguimiento: [{ registrado_at: hoy(1), patrimonio_neto: -20000 }, { registrado_at: hoy(5), patrimonio_neto: 15000 }] });
      assert.ok(h.includes('stroke="#9aa0c0"'), 'falta la línea del cero');
      assert.ok(!/NaN|Infinity/.test(svgs(h).join('')));
    });
    test('si todos los valores son iguales no se rompe (eje con un solo valor)', () => {
      const h = informe({ seguimiento: [{ registrado_at: hoy(1), patrimonio_neto: 5000 }, { registrado_at: hoy(9), patrimonio_neto: 5000 }] });
      assert.equal(polilinea(h).length, 2); assert.ok(!/NaN|Infinity/.test(svgs(h).join('')));
    });
    test('registros con fecha o importe inválidos se ignoran sin romper el gráfico', () => {
      const h = informe({ seguimiento: [{ registrado_at: 'rara', patrimonio_neto: 5 }, { registrado_at: hoy(1), patrimonio_neto: null }, { registrado_at: hoy(2), patrimonio_neto: 10 }, { registrado_at: hoy(6), patrimonio_neto: 20 }] });
      assert.equal(polilinea(h).length, 2);
    });
    test('con miles de registros sigue siendo rápido y no pinta miles de círculos', () => {
      const muchos = Array.from({ length: 3000 }, (_, i) => ({ registrado_at: new Date(Date.UTC(2018, 0, 1 + i)).toISOString(), patrimonio_neto: 1000 + i * 3 }));
      const t0 = Date.now(); const h = informe({ seguimiento: muchos });
      assert.ok(Date.now() - t0 < 2000); assert.equal(polilinea(h).length, 3000);
      assert.ok((h.match(/<circle/g) || []).length <= 2, 'demasiados círculos');
    });
  });

  describe('gastos por categoría', () => {
    const gastos = (fijos, disc) => informe({ finanzas_perfil: [{ ingresos: 2000, gastos_fijos: fijos, gastos_disc: disc, deudas: [], objetivos: [] }] });
    test('convierte trimestres y años a importe mensual y ordena de mayor a menor', () => {
      const t = texto(gastos({ alimentacion: { valor: 320, frecuencia: 'mensual' }, seguros: { valor: 90, frecuencia: 'trimestral' } }, { suscripciones: { valor: 120, frecuencia: 'anual' }, ocio: { valor: 150, frecuencia: 'mensual' } }));
      const orden = ['320 €', '150 €', '30 €', '10 €'].map(x => t.indexOf(x));
      assert.ok(orden.every(i => i >= 0), 'faltan importes mensuales');
      assert.ok(orden.every((v, i) => i === 0 || v > orden[i - 1]), 'no está ordenado');
    });
    test('si hay más de 10 conceptos, agrupa el resto sin perder el total', () => {
      const f = {}; for (let i = 1; i <= 14; i++) f['concepto' + i] = { valor: 100 + i, frecuencia: 'mensual' };
      const g = svgs(gastos(f, {}))[0];
      assert.ok(g.includes('Otros conceptos (5)'));
      const filas = [...g.matchAll(/width="([\d.]+)" height="20"/g)];
      assert.equal(filas.length, 10);
      // el total mensual del gráfico coincide con la suma de todos los conceptos
      const suma = Array.from({ length: 14 }, (_, i) => 101 + i).reduce((a, b) => a + b, 0);
      const mostrado = [...g.matchAll(/font-weight="700"[^>]*>([\d.]+)[\s\u00a0]€</g)].map(m => Number(m[1].replace(/\./g, ''))).reduce((a, b) => a + b, 0);
      assert.equal(mostrado, suma);
    });
    test('los nombres de conceptos no pueden inyectar código en el gráfico', () => {
      const g = gastos({ '<img src=x onerror=alert(1)>': { valor: 50, frecuencia: 'mensual' } }, {});
      assert.ok(!/<img/i.test(g)); assert.ok(g.includes('&lt;img'));
    });
    test('conceptos a cero o inválidos no salen; si no queda ninguno, no hay gráfico', () => {
      const h = gastos({ a: { valor: 0, frecuencia: 'mensual' }, b: { valor: 'x', frecuencia: 'mensual' }, c: null }, {});
      assert.equal(svgs(h).length, 0);
    });
    test('un concepto corrupto (null, texto, lista) no impide generar el informe y no altera los totales', () => {
      const t = texto(gastos({ bueno: { valor: 100, frecuencia: 'mensual' }, roto: null, texto: 'x', lista: [1, 2] }, { otro: undefined }));
      assert.ok(t.includes('100,00 €'));
      assert.ok(!/NaN|undefined|null/.test(t));
    });
    test('incluye una leyenda de colores: fijos y variables', () => {
      const h = gastos({ a: { valor: 10, frecuencia: 'mensual' } }, { b: { valor: 20, frecuencia: 'mensual' } });
      assert.ok(h.includes('Gastos fijos') && h.includes('Gastos variables y ocio'));
    });
  });

  describe('marcasEje', () => {
    test('marcas redondas, ascendentes, que cubren el rango', () => {
      for (const [a, b] of [[0, 100000], [111800, 115211], [-20000, 15000], [0, 7], [3, 3], [-5, -1]]) {
        const m = M.marcasEje(a, b);
        assert.ok(m.length >= 2 && m.length <= 12, `${a}..${b}: ${m.length} marcas`);
        assert.ok(m.every((v, i) => i === 0 || v > m[i - 1]));
        assert.ok(m[0] <= Math.min(a, b) && m[m.length - 1] >= Math.max(a, b));
      }
      assert.deepEqual(M.marcasEje(0, 100000), [0, 25000, 50000, 75000, 100000]);
    });
    test('entradas inválidas no rompen', () => {
      assert.doesNotThrow(() => M.marcasEje(NaN, undefined)); assert.ok(M.marcasEje(NaN, NaN).every(Number.isFinite));
    });
  });
});
