import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { cargarModulo, cerrar } from './cargar.mjs';

// Rediseño 3D (Fase 0): comprueba que la base común está completa antes de usarla en las pantallas.
const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const leer = r => readFileSync(resolve(raiz, r), 'utf8');

describe('Rediseño 3D: base común', () => {
  test('las fuentes están alojadas en la propia web (no dependen de Google Fonts)', () => {
    const css = leer('public/styles.css');
    for (const f of ['plus-jakarta-sans-latin.woff2', 'instrument-serif-latin.woff2']) {
      assert.ok(existsSync(resolve(raiz, 'public/fonts', f)), 'falta public/fonts/' + f);
      assert.ok(css.includes('/fonts/' + f), 'styles.css no declara ' + f);
    }
    assert.ok(!css.includes('fonts.googleapis.com'), 'no debe cargar fuentes de Google');
  });
  test('Three.js tiene una versión fijada (sin ^ ni ~) para que no cambie sola', () => {
    const v = JSON.parse(leer('package.json')).dependencies.three;
    assert.match(v, /^\d+\.\d+\.\d+$/);
  });
  test('los módulos de movimiento y 3D se cargan y exponen sus funciones', async () => {
    const mov = await cargarModulo('/src/movimiento.js');
    for (const f of ['observarAparicion', 'inclinarConCursor', 'contarHasta', 'useAparicion', 'useInclinacion', 'prefiereMenosMovimiento']) assert.equal(typeof mov[f], 'function', f);
    const e3d = await cargarModulo('/src/efectos-3d.js');
    for (const f of ['montarPortada3D', 'montarCapa3D']) assert.equal(typeof e3d[f], 'function', f);
    await cerrar();
  });
  test('las animaciones respetan la opción «reducir movimiento»', () => {
    assert.match(leer('public/styles.css'), /prefers-reduced-motion: reduce\)\{\s*\.mp-aparece/);
  });
});

describe('Rediseño 3D: la portada conserva su contenido', () => {
  const src = leer('src/secciones.js');
  test('mantiene los textos principales de la portada', () => {
    for (const t of ['Tu salud financiera puesta a prueba:', '¿sientes que el dinero se te escapa y no sabes por qué?', 'Ver mi situación financiera', 'Por qué importa la salud financiera', 'Comenzar mi diagnóstico', 'Tus datos se guardan solo en tu dispositivo salvo que crees una cuenta.']) assert.ok(src.includes(t), 'falta: ' + t);
  });
  test('mantiene los cinco motivos con sus fuentes', () => {
    for (const f of ['Universidad de Princeton', 'Universidad Estatal de Utah', 'Asociación Americana de Psicología', 'Universidad de Stanford y Wharton School', 'Universidad de Chicago']) assert.ok(src.includes(f), 'falta la fuente: ' + f);
  });
  test('la comparación de inflación usa el 2,5 % y el 8 % de siempre', () => {
    assert.match(src, /const inflacion = 2\.5;/);
    assert.match(src, /const rentabilidad = 8;/);
  });
  test('el gasto hormiga sigue calculando con la rentabilidad del índice global y su aviso legal', () => {
    assert.match(src, /proyeccionInteres\(0, gasto, TASA_INDICE_GLOBAL, anios\)/);
    assert.ok(src.includes('Rentabilidades pasadas no garantizan resultados futuros.'));
  });
});
