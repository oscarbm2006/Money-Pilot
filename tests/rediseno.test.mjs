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

describe('Rediseño 3D: herramientas (Fase 2)', () => {
  const app = leer('src/App.js'), css = leer('public/styles.css'), pag = leer('src/paginas.js');
  test('el diagnóstico y los dos simuladores usan la cabecera nueva y conservan sus textos', () => {
    for (const id of ['mp-cab-diag', 'mp-cab-sim', 'mp-cab-deu']) assert.ok(app.includes('id: "' + id + '"'), 'falta la cabecera ' + id);
    for (const t of ['Construye tu foto financiera, paso a paso', 'Empezamos por lo esencial y añadimos detalle solo cuando lo necesitas. Tus cálculos se actualizan en cada paso.',
      '¿Qué puede hacer tu ahorro con el tiempo?', 'Ajusta los números y mira qué puede hacer tu ahorro con el tiempo. Si ya hiciste tu diagnóstico, partirá de tus propios datos.',
      '¿Cuánto tardarás en salir de tus deudas?', 'Escribe tus deudas y compara dos formas de pagarlas. Es una proyección educativa.']) assert.ok(app.includes(t), 'falta el texto: ' + t);
    assert.equal((app.match(/fade-switch-enter mp-piel/g) || []).length, 4);
  });
  test('Cuentas, Inversiones y Patrimonio forman una sola página que conserva sus textos', () => {
    const sec = leer('src/secciones.js');
    assert.ok(app.includes('id: "mp-cab-mf"'));
    for (const t of ['Tus cuentas', 'No conectamos con tu banco: tú decides qué saldo introducir y cuándo actualizarlo.',
      'Tus inversiones', 'Los datos no se actualizan solos: revísalos cuando quieras.',
      'Tu patrimonio neto', 'Se actualiza automáticamente según lo que registres en Cuentas, Inversiones, Deudas y aquí abajo.']) assert.ok(sec.includes(t), 'falta el texto: ' + t);
    assert.ok(!pag.includes('section-intro'), 'quedan introducciones antiguas en paginas.js');
  });
  test('las cifras de las herramientas usan una tipografía legible (no la serif fina de la portada)', () => {
    assert.match(css, /\.mp-piel :is\(div,span,p,strong,b\)\.font-serif\{font-family:var\(--mp-fuente\);font-weight:700;font-variant-numeric:tabular-nums/);
  });
  test('las tres pantallas ya no llevan la tarjeta de introducción antigua', () => {
    assert.ok(!pag.includes('Eyebrow, null, "Diagnóstico financiero"'));
    assert.ok(!app.includes('Eyebrow, null, "Simulador de ahorro"') && !app.includes('Eyebrow, null, "Simulador de deudas"'));
  });
  test('la piel nueva (.mp-piel) no choca con clases de la portada (.mp-herr)', () => {
    const fase2 = css.slice(css.indexOf('HERRAMIENTAS (Fase 2)'));
    assert.ok(fase2.includes('.mp-piel') && !fase2.includes('.mp-herr'));
  });
  test('los pasos del diagnóstico entran con animación 3D y la cabecera no monta 3D en móvil', () => {
    assert.equal((pag.match(/mp-paso-entra/g) || []).length, 3);
    assert.match(leer('src/secciones.js'), /esPantallaPequena\(\) \? Promise\.resolve\(\(\) => \{\}\) : montarCapa3D/);
  });
  test('al salir de una escena 3D se libera la tarjeta gráfica', () => {
    assert.ok((leer('src/efectos-3d.js').match(/forceContextLoss/g) || []).length >= 2);
  });
});

describe('Rediseño 3D: Mis finanzas en una sola página (Fase 2c)', () => {
  const app = leer('src/App.js'), sec = leer('src/secciones.js'), pag = leer('src/paginas.js');
  test('la página única se muestra para las cuatro direcciones (los enlaces antiguos siguen funcionando)', () => {
    assert.match(sec, /export const VISTAS_MIS_FINANZAS = \["mis-finanzas", "cuentas", "inversiones", "patrimonio"\];/);
    assert.ok(app.includes('VISTAS_MIS_FINANZAS.includes(vistaActual) && /*#__PURE__*/React.createElement("div", {\n    key: "mis-finanzas"'));
    for (const v of ["'cuentas'", "'inversiones'", "'patrimonio'"]) assert.ok(!app.includes('vistaActual === ' + v + ' &&'), 'queda la vista antigua ' + v);
    for (const enlace of ["irAParteMisFinanzas('cuentas')", "irAParteMisFinanzas('inversiones')", '["cuentas", "Añadir mis cuentas"]', '["inversiones", "Añadir mis inversiones"]', '["patrimonio", "Añadir otros bienes"]']) assert.ok(app.includes(enlace), 'se perdió el enlace ' + enlace);
  });
  test('reúne los tres componentes de siempre, con todas sus propiedades', () => {
    for (const c of ['Cuentas', 'Inversiones', 'Patrimonio']) assert.equal((app.match(new RegExp('React\\.createElement\\(' + c + ', \\{', 'g')) || []).length, 1, c);
    for (const p of ['onAgregarActivo', 'onIrACuentas', 'onIrAInversiones', 'onIrASimuladorDeudas', 'onIrADiagnostico', 'deudas: datos.deudas']) assert.ok(app.includes(p), 'falta ' + p);
  });
  test('sigue en "Mis finanzas", justo después de Diagnóstico, y el menú la marca activa desde cualquier enlace', () => {
    assert.ok(pag.includes('items: [["diagnostico", "Diagnóstico"], ["mis-finanzas", "Cuentas, inversiones y patrimonio"]]'));
    assert.ok(pag.includes('const vistaMenu = VISTAS_MIS_FINANZAS.includes(vistaActual) ? "mis-finanzas" : vistaActual;'));
  });
  test('al moverse entre partes de la misma página no se sube al principio', () => {
    assert.ok(app.includes('const mismaPagina = VISTAS_MIS_FINANZAS.includes(vistaPreviaScroll.current) && VISTAS_MIS_FINANZAS.includes(vistaActual);'));
  });
});
