// Páginas de herramientas (herramientas, nota, simuladores): estructura, enlaces y cifras.
// Las cifras de los ejemplos se recalculan con el código real de la aplicación, para que
// las páginas nunca se queden desfasadas si cambia una fórmula.
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { cargarCalculos, cerrar } from './cargar.mjs';

const leer = ruta => readFileSync(new URL('../' + ruta, import.meta.url), 'utf8');
const PAGINAS = [
  'herramientas.html',
  'como-calculamos-tu-nota-financiera.html',
  'simulador-de-ahorro-interes-compuesto.html',
  'simulador-de-deudas-bola-de-nieve-avalancha.html',
];
const palabras = html =>
  (html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .match(/[\p{L}\p{N}]+/gu) || []).length;
// Un importe aparece en la página con decimales (1.179,71) o, si es entero, sin ellos (29.000)
const aparece = (h, n) => h.includes(eur(n)) || (Number.isInteger(Math.round(n * 100) / 100) && Math.round(n * 100) % 100 === 0 && h.includes(eur(n, 0)));
// Formato español con separador de miles también en 4 cifras: 1.179,71
const eur = (n, d = 2) => {
  const [e, f] = Math.abs(n).toFixed(d).split('.');
  return e.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (f ? ',' + f : '');
};

describe('Páginas de herramientas: estructura', () => {
  for (const p of PAGINAS) {
    test(p + ': estilos y script compartidos, canonical propio, un solo h1 y sin JavaScript en línea', () => {
      const h = leer('public/' + p);
      assert.ok(h.includes('<link rel="stylesheet" href="/estatico.css" />') && h.includes('<script src="/estatico.js" defer></script>'));
      assert.ok(h.includes('<link rel="canonical" href="https://moneypilot.es/' + p + '" />'));
      assert.ok(h.includes('<meta property="og:url" content="https://moneypilot.es/' + p + '" />'));
      assert.equal((h.match(/<h1>/g) || []).length, 1);
      for (const m of h.matchAll(/<script\b([^>]*)>/g)) assert.ok(/src="\/[^"]+"/.test(m[1]), 'script en línea en ' + p);
      assert.ok(!/https?:\/\/(?!moneypilot\.es|www\.w3\.org)/.test(h.replace(/<a [^>]*href="https?:\/\/[^"]*"/g, '')), 'sin recursos externos');
    });
    test(p + ': tiene contenido sustancial y enlaza al resto', () => {
      const h = leer('public/' + p);
      assert.ok(palabras(h) >= 700, p + ' debe tener al menos 700 palabras, tiene ' + palabras(h));
      assert.ok(h.includes('href="/herramientas.html"'), 'enlaza al índice de herramientas');
      assert.ok(h.includes('aviso-legal.html'), 'recuerda que no es asesoramiento');
    });
    test(p + ': los enlaces internos a páginas apuntan a archivos que existen', () => {
      const h = leer('public/' + p);
      for (const m of h.matchAll(/href="(\/[^"#?]*)"/g)) {
        const r = m[1];
        if (r === '/' || r.startsWith('/blog/') || r === '/favicon.ico' || /\.(png|css|js)$/.test(r)) continue;
        assert.ok(existsSync(new URL('../public' + r, import.meta.url)), 'enlace roto en ' + p + ': ' + r);
      }
    });
  }
  test('el sitemap las incluye y la portada enlaza a las cuatro', () => {
    const gen = leer('generate-blog.js'), idx = leer('index.html');
    for (const p of PAGINAS) {
      assert.ok(gen.includes("loc: '/" + p + "'"), 'falta en el sitemap: ' + p);
      if (p !== 'herramientas.html') assert.ok(idx.includes('href="/' + p + '"'), 'la portada no enlaza a ' + p);
    }
    assert.ok(idx.includes('href="/herramientas.html"'));
    assert.ok(gen.includes('<a href="/herramientas.html">Herramientas</a>'), 'el pie del blog enlaza a Herramientas');
  });
  test('la portada mantiene su texto de respaldo para buscadores, con un solo h1', () => {
    const idx = leer('index.html');
    assert.equal((idx.match(/<h1\b/g) || []).length, 1);
    assert.ok(palabras(idx.slice(idx.indexOf('<div id="root">'), idx.indexOf('</body>'))) >= 200);
    assert.ok(idx.includes('MoneyPilot: diagnóstico y plan de tu salud financiera'));
  });
});

describe('Páginas de herramientas: las cifras coinciden con el código real', () => {
  let K;
  before(async () => { K = await cargarCalculos(); });
  after(async () => { await cerrar(); });

  test('simulador de ahorro: los cuatro modos y el factor tiempo', () => {
    const h = leer('public/simulador-de-ahorro-interes-compuesto.html');
    const a = K.proyeccionInteres(5000, 200, 5, 10);
    for (const n of [a.valorFuturo, a.totalAportado, a.interesGenerado]) assert.ok(aparece(h, n), 'falta ' + eur(n));
    const t = K.tiempoNecesarioParaObjetivo(2000, 150, 4, 20000);
    assert.equal(`${t.anios} años y ${t.meses} meses`, '8 años y 2 meses');
    assert.ok(h.includes('8 años y 2 meses') && aparece(h, t.totalAportado));
    const m = K.aportacionNecesariaParaObjetivo(1000, 12000, 5, 3);
    assert.ok(aparece(h, m.mensualNecesaria) && aparece(h, m.totalAportado));
    const r = K.rentabilidadNecesariaParaObjetivo(1000, 250, 8, 30000);
    assert.ok(h.includes(eur(r.tasaNecesaria) + ' % anual'));
    for (const y of [10, 20, 30]) {
      const p = K.proyeccionInteres(0, 100, 7, y);
      assert.ok(aparece(h, p.valorFuturo) && aparece(h, p.interesGenerado), 'factor tiempo ' + y + ' años');
    }
    assert.ok(h.includes('5,12 %') && Math.abs(((1 + 0.05 / 12) ** 12 - 1) * 100 - 5.12) < 0.01);
  });

  test('metodología de la nota: ponderaciones, niveles y ejemplos', () => {
    const h = leer('public/como-calculamos-tu-nota-financiera.html');
    const casos = [[0.05, 1, 0.3, 23, 'Construyendo tu base'], [0.12, 2, 0.15, 49, 'Margen de mejora'], [0.22, 6, 0.05, 92, 'Muy buena salud']];
    for (const [ahorro, cobertura, deuda, nota, nivel] of casos) {
      const s = K.calcularSaludFinanciera({ ratioAhorro: ahorro, coberturaMeses: cobertura, cargaDeuda: deuda, perfil: {} });
      assert.equal(s.score, nota);
      assert.equal(s.nombre, nivel);
      assert.ok(h.includes('<strong>' + nota + '</strong> · ' + nivel), 'ejemplo ' + nota);
    }
    const tope = K.calcularSaludFinanciera({ ratioAhorro: 0.25, coberturaMeses: 6, cargaDeuda: 0, perfil: {} });
    assert.equal(tope.score, 100);
    assert.deepEqual([tope.desglose.ptsAhorro, tope.desglose.ptsFondo, tope.desglose.ptsDeuda, tope.desglose.ptsPerfil], [40, 30, 20, 10]);
    assert.equal(K.calcularSaludFinanciera({ ratioAhorro: 0.3, coberturaMeses: 0, cargaDeuda: 0.3, perfil: null }).score, 20 * 0 + 40);
    const nivel = s => K.calcularSaludFinanciera({ ratioAhorro: s / 100, coberturaMeses: 0, cargaDeuda: 0.3, perfil: null }).nombre;
    assert.equal(nivel(0), 'Construyendo tu base');
    assert.equal(K.estadoAhorro(-0.01).nombre, 'Ahorro por construir');
    assert.equal(K.estadoAhorro(0.09).nombre, 'Ahorro mejorable');
    assert.equal(K.estadoAhorro(0.15).nombre, 'Ahorro saludable');
    assert.equal(K.estadoAhorro(0.2).nombre, 'Ahorro muy bueno');
    const fe = K.calcularFondoEmergencia({ ingresos: 2000, ahorroActual: 2500, gastosFijos: { alquiler: { v: 800, p: 'mes' } }, deudas: [{ cuota: 200, pendiente: 5000, tasa: 5 }] });
    if (fe.objetivo != null) assert.equal(fe.mesesObjetivo, 6);
    assert.ok(h.includes('6.000 €') && h.includes('2,5 meses') && h.includes('3.500 €'));
  });

  test('simulador de deudas: tabla del ejemplo y conclusiones', () => {
    const h = leer('public/simulador-de-deudas-bola-de-nieve-avalancha.html');
    const deudas = [
      { nombre: 'Tarjeta', pendiente: 3000, tasa: 20, cuota: 90 },
      { nombre: 'Préstamo del coche', pendiente: 6000, tasa: 7, cuota: 150 },
      { nombre: 'Móvil a plazos', pendiente: 600, tasa: 0, cuota: 50 },
    ];
    const min = K.simularAmortizacion(deudas, 0, 'nieve');
    const nieve = K.simularAmortizacion(deudas, 100, 'nieve');
    const ava = K.simularAmortizacion(deudas, 100, 'avalancha');
    assert.equal(min.mesesTotal, 39);
    assert.equal(nieve.mesesTotal, 28);
    assert.equal(ava.mesesTotal, 28);
    // Las diferencias se calculan entre importes ya redondeados, tal como las resta el lector
    const r2 = n => Math.round(n * 100) / 100;
    for (const n of [min.totalInteres, nieve.totalInteres, ava.totalInteres, r2(min.totalInteres) - r2(nieve.totalInteres), r2(min.totalInteres) - r2(ava.totalInteres), r2(nieve.totalInteres) - r2(ava.totalInteres)]) {
      assert.ok(h.includes(eur(r2(n))), 'falta ' + eur(r2(n)));
    }
    const mes = (r, nombre) => r.orden.find(d => d.nombre === nombre).mesLiquidacion;
    assert.ok(h.includes(`Móvil: mes ${mes(nieve, 'Móvil a plazos')} · Tarjeta: mes ${mes(nieve, 'Tarjeta')} · Coche: mes ${mes(nieve, 'Préstamo del coche')}`));
    assert.ok(h.includes(`Móvil: mes ${mes(ava, 'Móvil a plazos')} · Tarjeta: mes ${mes(ava, 'Tarjeta')} · Coche: mes ${mes(ava, 'Préstamo del coche')}`));
    assert.ok(h.includes(`Móvil: mes ${mes(min, 'Móvil a plazos')} · Tarjeta: mes ${mes(min, 'Tarjeta')} · Coche: mes ${mes(min, 'Préstamo del coche')}`));
  });
});
