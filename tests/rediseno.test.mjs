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

describe('Rediseño 3D: ajustes de la portada (Fase 1c)', () => {
  const src = leer('src/secciones.js'), css = leer('public/styles.css');
  test('el titular de los motivos puede quedarse fijo: html y body usan overflow-x:clip y no hidden', () => {
    assert.match(css, /html:root,html body\{overflow-x:clip\}/);
  });
  test('el simulador de inflación permite cambiar la cantidad además de los años', () => {
    assert.ok(src.includes('id: "mp-infl-cap"') && src.includes('id: "mp-infl-anios"'));
    assert.match(src, /const \[aporte, setAporte\] = useState\(1000\)/);
  });
  test('el gasto hormiga mantiene su cálculo y su aviso, con las barras 3D a escala fija', () => {
    assert.match(src, /proyeccionInteres\(0, gasto, TASA_INDICE_GLOBAL, 30\)/);
    assert.ok(src.includes('ce(Barras3D, { datos: columnas, escalaMax: escala })'));
  });
  test('en móvil el texto va antes que las monedas (el lienzo se coloca abajo)', () => {
    assert.match(css, /@media \(max-width:720px\)\{\s*\.mp-portada\{align-items:flex-start\}[\s\S]*?\.mp-portada>\.mp-lienzo\{[^}]*bottom:0/);
  });
  test('el 3D no fuerza la tarjeta gráfica de bajo consumo', () => {
    assert.ok(!leer('src/efectos-3d.js').includes('low-power'));
  });
});

describe('Rediseño 3D: carga de la portada y gráfico del gasto hormiga (Fase 1d)', () => {
  const e3d = leer('src/efectos-3d.js'), src = leer('src/secciones.js');
  test('el 3D importa solo las piezas de Three.js que necesita (archivo más pequeño)', () => {
    assert.ok(existsSync(resolve(raiz, 'src/three-minimo.js')));
    assert.ok(e3d.includes("import('./three-minimo.js')") && !e3d.includes("import('three')"));
    const usadas = [...new Set([...e3d.matchAll(/THREE\.([A-Za-z0-9_]+)/g)].map(m => m[1]))];
    const exportadas = leer('src/three-minimo.js');
    for (const u of usadas) assert.match(exportadas, new RegExp('\\b' + u + '\\b'), 'falta exportar ' + u + ' en three-minimo.js');
  });
  test('la escena se prepara sin bloquear la página y las monedas aparecen con un fundido', () => {
    assert.ok(e3d.includes('compileAsync'));
    assert.ok(e3d.includes("mp-lienzo-listo"));
    assert.match(leer('public/styles.css'), /\.mp-portada>\.mp-lienzo\.mp-lienzo-listo\{opacity:1\}/);
  });
  test('la fuente del titular se precarga en index.html', () => {
    assert.match(leer('index.html'), /<link rel="preload" href="\/fonts\/plus-jakarta-sans-latin\.woff2" as="font" type="font\/woff2" crossorigin/);
  });
  test('las barras 3D leen siempre los datos más recientes (no se quedan con los del primer momento)', () => {
    assert.ok(src.includes('ultimo.current = { datos, escalaMax }'));
    assert.ok(src.includes('const { datos: d, escalaMax: e } = ultimo.current'));
  });
  test('las barras usan una escala común a todos los gastos de ejemplo', () => {
    assert.ok(src.includes('const ESCALA_HORMIGA = proyeccionInteres(0, Math.max(...GASTOS_HORMIGA_EJEMPLOS.map(g => g.valor)), TASA_INDICE_GLOBAL, 30).valorFuturo;'));
    assert.ok(src.includes('Math.max(ESCALA_HORMIGA, proyeccionInteres(0, gasto, TASA_INDICE_GLOBAL, 30).valorFuturo)'));
  });
});
