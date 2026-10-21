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
  test('el simulador de gastos innecesarios calcula al 8 % y mantiene su aviso legal', () => {
    assert.match(src, /const TASA_HORMIGA = 8;/);
    assert.match(src, /proyeccionInteres\(0, gasto, TASA_HORMIGA, anios\)/);
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
    assert.match(src, /proyeccionInteres\(0, gasto, TASA_HORMIGA, 30\)/);
    assert.ok(src.includes('ce(Barras3D, { datos: columnas, escalaMax: escala })'));
  });
  test('en móvil la portada no muestra las monedas (solo texto y botones)', () => {
    assert.match(css, /@media \(max-width:720px\)\{\s*\.mp-portada\{align-items:flex-start;min-height:0\}[\s\S]*?\.mp-portada>\.mp-lienzo\{display:none\}/);
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
    assert.ok(src.includes('const ESCALA_HORMIGA = proyeccionInteres(0, Math.max(...GASTOS_HORMIGA_EJEMPLOS.map(g => g.valor)), TASA_HORMIGA, 30).valorFuturo;'));
    assert.ok(src.includes('Math.max(ESCALA_HORMIGA, proyeccionInteres(0, gasto, TASA_HORMIGA, 30).valorFuturo)'));
  });
});

describe('Rediseño 3D: herramientas (Fase 2)', () => {
  const app = leer('src/App.js'), css = leer('public/styles.css'), pag = leer('src/paginas.js');
  test('el diagnóstico y los dos simuladores usan la cabecera nueva y conservan sus textos', () => {
    for (const id of ['mp-cab-diag', 'mp-cab-sim', 'mp-cab-deu']) assert.ok(app.includes('id: "' + id + '"'), 'falta la cabecera ' + id);
    for (const t of ['Construye tu foto financiera, paso a paso', 'Empezamos por lo esencial y añadimos detalle solo cuando lo necesitas. Tus cálculos se actualizan en cada paso.',
      '¿Qué puede hacer tu ahorro con el tiempo?', 'Ajusta los números y mira qué puede hacer tu ahorro con el tiempo. Si ya hiciste tu diagnóstico, partirá de tus propios datos.',
      '¿Cuánto tardarás en salir de tus deudas?', 'Escribe tus deudas y compara dos formas de pagarlas. Es una proyección educativa.']) assert.ok(app.includes(t), 'falta el texto: ' + t);
    assert.equal((app.match(/fade-switch-enter mp-piel/g) || []).length, 11);
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

describe('Rediseño 3D: fondo blanco en las páginas rediseñadas', () => {
  const app = leer('src/App.js'), sec = leer('src/secciones.js'), css = leer('public/styles.css');
  test('la lista de páginas rediseñadas incluye la portada, el diagnóstico, Mis finanzas, Estrategia, los simuladores, el blog y Quiénes somos', () => {
    assert.ok(sec.includes('export const VISTAS_REDISENADAS = ["inicio", "diagnostico", ...VISTAS_MIS_FINANZAS, "estrategia", "plan", "seguimiento", "simulador", "simulador-deudas", "blog", "quienes-somos", "aviso-legal", "contacto"];'));
  });
  test('en esas páginas no se pintan el tono gris azulado ni el dibujo de líneas', () => {
    assert.ok(app.includes('const fondoLimpio = VISTAS_REDISENADAS.includes(vistaActual);'));
    assert.ok(app.includes('backgroundColor: fondoLimpio ? "#FAFAFA" : C.bgDeep'));
    assert.equal((app.match(/!fondoLimpio && \/\*#__PURE__\*\/React\.createElement\("div", \{\n    className: "fixed inset-0 pointer-events-none"/g) || []).length, 2);
    assert.ok(app.includes('backgroundImage: `url(${PATTERN_URI_STATIC})`'), 'el dibujo de líneas sigue existiendo para las demás páginas');
  });
  test('las secciones de esas páginas no llevan el tinte de index.html', () => {
    assert.ok(css.includes('.mp-fondo-limpio section.section-tinted{background:transparent!important}'));
  });
  test('el fondo blanco no toca ninguna otra sección: las zonas oscuras siguen oscuras', () => {
    // Una regla general sobre "section" empataba en prioridad con las zonas oscuras y las volvía claras
    assert.ok(!/\.mp-fondo-limpio section:nth-of-type/.test(css));
    const reglasSeccion = css.match(/\.mp-fondo-limpio section[^{]*\{/g) || [];
    assert.deepEqual(reglasSeccion, ['.mp-fondo-limpio section.section-tinted{'], 'el fondo limpio solo debe quitar el tinte de las secciones de herramientas');
  });
});

describe('Rediseño 3D: Estrategia y fin del diagnóstico (Fase 3)', () => {
  const app = leer('src/App.js'), pag = leer('src/paginas.js'), css = leer('public/styles.css');
  test('al terminar el diagnóstico se va a añadir las cuentas', () => {
    assert.match(app, /onFinalizar: \(\) => \{\n[^\n]*\n      setVistaActual\('cuentas'\);/);
    assert.ok(pag.includes('"Añadir mis cuentas ", /*#__PURE__*/React.createElement(I.arrowRight'));
    assert.ok(!pag.includes('"Ver mi salud financiera "'));
  });
  test('desde la página de cuentas se sigue a los resultados', () => {
    const mf = app.slice(app.indexOf('key: "mis-finanzas"'), app.indexOf("vistaActual === 'estrategia' &&"));
    assert.ok(mf.includes('label: "Ver mis resultados"') && mf.includes("onClick: () => setVistaActual('estrategia')"));
  });
  test('Estrategia usa la cabecera nueva, la piel y conserva sus textos y paneles', () => {
    assert.ok(app.includes('id: "mp-cab-est"'));
    for (const t of ['Tu salud financiera, en una sola vista', 'Aquí se concentran las métricas clave, el perfil de riesgo y las decisiones que puedes tomar a continuación.']) assert.ok(app.includes(t));
    assert.ok(!app.includes('Eyebrow, null, "Resultados y estrategia"'), 'queda la introducción antigua');
    const est = app.slice(app.indexOf("vistaActual === 'estrategia' &&"), app.indexOf("vistaActual === 'plan' &&"));
    assert.ok(est.includes('className: "fade-switch-enter mp-piel"'));
    for (const c of ['PanelDiagnostico', 'PanelPrioridad', 'Dashboard', 'AmortizacionDeuda', 'PerfilRiesgo', 'Estrategia', 'ContinuarBar']) assert.ok(est.includes('React.createElement(' + c + ','), 'falta ' + c);
    assert.ok(est.includes('Afina tus resultados (opcional)'));
  });
  test('los subtítulos con la caja antigua se integran sin caja en las páginas rediseñadas', () => {
    assert.ok(css.includes('.mp-piel .section-intro{background:none;border:0;box-shadow:none;padding:0}'));
    assert.ok(css.includes('.mp-piel .readable-title{display:block;background:none!important'));
    assert.ok(css.includes('.mp-piel .readable-subtitle{display:block;background:none!important'));
    assert.ok(!/\.mp-piel \.readable-note/.test(css), 'las notas informativas no se tocan');
  });
});

describe('Menú: nombres sin repetir', () => {
  test('el grupo que contiene Estrategia, Plan y Seguimiento no se llama también "Plan"', () => {
    const pag = leer('src/paginas.js');
    assert.ok(pag.includes('titulo: "Hoja de ruta"'));
    assert.ok(!/titulo: "Plan"/.test(pag));
    assert.ok(pag.includes('items: [["estrategia", "Estrategia"], ["plan", "Plan"], ["seguimiento", "Seguimiento"]]'));
  });
});

describe('Rediseño 3D: Plan y Seguimiento (Fase 4)', () => {
  const app = leer('src/App.js');
  test('Plan y Seguimiento usan la cabecera nueva, la piel y conservan sus textos y componentes', () => {
    for (const id of ['mp-cab-plan', 'mp-cab-seg']) assert.ok(app.includes('id: "' + id + '"'));
    for (const t of ['Tu plan financiero, paso a paso', 'Prioridad actual, siguiente acción y las fases que vendrán después, calculado con todos tus datos.',
      '¿Estás avanzando?', 'Guarda una foto de tu situación cada vez que quieras, y compárala con las anteriores.']) assert.ok(app.includes(t), 'falta ' + t);
    assert.ok(!app.includes('Eyebrow, null, "Tu plan"') && !app.includes('Eyebrow, null, "Tu evolución"'), 'quedan introducciones antiguas');
    const plan = app.slice(app.indexOf("vistaActual === 'plan' &&"), app.indexOf("vistaActual === 'seguimiento' &&"));
    const seg = app.slice(app.indexOf("vistaActual === 'seguimiento' &&"), app.indexOf("vistaActual === 'simulador' &&"));
    assert.ok(plan.includes('React.createElement(PlanFinanciero, {') && plan.includes('label: "Continuar al seguimiento"'));
    for (const p of ['onRegistrar', 'onEliminar', 'onBorrarTodo', 'onOpenAuth', 'label: "Probar el simulador"']) assert.ok(seg.includes(p), 'falta ' + p);
  });
});

describe('Simulador de gastos innecesarios: recorrido sencillo', () => {
  const src = leer('src/secciones.js');
  const seccion = src.slice(src.indexOf('export function GastoHormigaSection()'), src.indexOf('/* ---------- ¿Qué pasa con'));
  test('primero invita a pensar en un gasto que no aporta nada', () => {
    assert.ok(seccion.includes('Piensa en un gasto totalmente evitable'));
    assert.ok(seccion.includes('Algo prescindible, que podrías dejar mañana sin echarlo de menos'));
  });
  test('el gasto se elige en un desplegable con los ejemplos y la opción de escribir uno propio', () => {
    assert.ok(seccion.includes('ce("select", { id: "mp-hormiga-tipo"'));
    assert.ok(seccion.includes('GASTOS_HORMIGA_EJEMPLOS.map(g => ce("option", { key: g.label, value: g.label }, g.label))'));
    assert.ok(seccion.includes('ce("option", { value: "otro" }, "Otro gasto (escríbelo tú)")'));
    assert.ok(seccion.includes('tipo === "otro" && ce("div"') && seccion.includes('id: "mp-hormiga-otro"'));
  });
  test('pregunta cuánto se gasta al mes y desde hace cuánto tiempo', () => {
    assert.ok(seccion.includes('¿Cuánto crees que gastas al mes en esto?'));
    assert.ok(seccion.includes('¿Cuánto tiempo llevas con este gasto?'));
  });
  test('muestra lo que ha costado, lo que habría generado y el total al 8 %', () => {
    for (const t of ['Lo que te ha costado', 'Lo que habría generado', 'proyeccion.totalAportado', 'proyeccion.interesGenerado', 'proyeccion.valorFuturo']) assert.ok(seccion.includes(t), 'falta ' + t);
    assert.ok(!seccion.includes('TASA_INDICE_GLOBAL'));
  });
});

describe('Rediseño 3D: Blog, Quiénes somos y menú integrado (Fase 6)', () => {
  const app = leer('src/App.js'), sec = leer('src/secciones.js'), blog = leer('src/blog.js'), css = leer('public/styles.css');
  test('el blog usa la cabecera nueva con sus textos y conserva pestañas, lista y lector', () => {
    assert.ok(app.includes('id: "mp-cab-blog"') && app.includes('titulo: "Blog de finanzas personales"'));
    assert.ok(!blog.includes('"Blog de finanzas personales"'), 'el título ya no se repite dentro del componente');
    for (const t of ['SECCIONES_BLOG.map', 'dangerouslySetInnerHTML: { __html: mdToHtml(post.content) }']) assert.ok(blog.includes(t), 'falta ' + t);
  });
  test('Quiénes somos conserva todos sus textos con el diseño nuevo', () => {
    assert.ok(app.includes('React.createElement(QuienesSomos, null)') && app.includes('id: "mp-cab-qs"'));
    for (const t of ['la falta de educación financiera genera estrés crónico y decisiones equivocadas', 'Óscar Baca Martínez', 'con más de 2 años gestionando su propia cartera',
      'Cuál es nuestro objetivo.', 'Comprar tranquilidad', 'Salir de las deudas', 'Poner el tiempo a tu favor',
      'para que dejes de sobrevivir a fin de mes y empieces a diseñar tu libertad financiera', 'mailto:soportemoneypilot@gmail.com']) assert.ok(sec.includes(t), 'falta ' + t);
  });
  test('el menú se integra con el fondo: oscuro sobre la banda de arriba y claro sobre la zona clara', () => {
    assert.ok(app.includes('raiz.setAttribute("data-menu-claro", "")') && app.includes('document.querySelector("main .mp-portada, main .mp-cab")'));
    assert.ok(css.includes('.mp-fondo-limpio header.glass-nav{background-color:var(--mp-noche)!important'));
    assert.ok(css.includes('html[data-menu-claro] .mp-fondo-limpio header.glass-nav{background-color:rgba(250,250,250,.9)!important'));
    assert.ok(css.includes('html[data-menu-claro] .mp-fondo-limpio header.glass-nav .nav-link-muted{color:var(--mp-tinta)!important}'));
  });
});

describe('Rediseño: páginas independientes (Recursos, Quiénes somos y blog)', () => {
  const css = leer('public/estatico.css'), js = leer('public/estatico.js');
  const rec = leer('public/recursos-y-libros.html'), qs = leer('public/quienes-somos.html'), gen = leer('generate-blog.js');
  test('los estilos y el script compartidos existen y el menú se integra con el fondo', () => {
    assert.ok(css.includes('.e-menu{position:sticky') && css.includes('html.e-menu-claro .e-menu{background:rgba(250,250,250,.9)'));
    assert.ok(js.includes("raiz.classList.toggle('e-menu-claro', !entradas[0].isIntersecting)"));
    assert.ok(!/@import|https?:\/\//.test(css.replace(/http:\/\/www\.w3\.org\/2000\/svg/g, '')), 'sin recursos externos (la CSP no los admite)');
  });
  test('las tres páginas cargan los estilos y el script compartidos, sin JavaScript en línea', () => {
    for (const [n, h] of [['recursos', rec], ['quiénes somos', qs]]) {
      assert.ok(h.includes('<link rel="stylesheet" href="/estatico.css" />') && h.includes('<script src="/estatico.js" defer></script>'), n);
      for (const m of h.matchAll(/<script\b([^>]*)>/g)) assert.ok(/src="\/[^"]+"|type="application\/(ld\+)?json"/.test(m[1]), 'script en línea en ' + n);
    }
    assert.ok(gen.includes('<link rel="stylesheet" href="/estatico.css" />') && gen.includes('<script src="/estatico.js" defer></script>'));
  });
  test('Recursos conserva sus enlaces de afiliado y su contenido, con el menú actualizado', () => {
    assert.equal((rec.match(/https:\/\/amzn\.to\//g) || []).length, 19);
    assert.ok(rec.includes('https://refnocode.trade.re/26037sv4') && rec.includes('Como afiliado de Amazon'));
    assert.ok(rec.includes('<header class="e-cab">') && rec.includes('Lecturas para acompañar<br><em>tu diagnóstico</em>'));
    for (const v of ['mis-finanzas', 'estrategia', 'simulador-deudas']) assert.ok(rec.includes('data-vista="' + v + '"'), 'falta ' + v);
    assert.ok(rec.includes('>Hoja de ruta ') && !rec.includes('data-vista="cuentas"'));
  });
  test('Quiénes somos (página independiente) conserva sus textos y sus etiquetas para Google', () => {
    for (const t of ['<title>Quiénes somos – MoneyPilot</title>', 'rel="canonical"', 'Óscar Baca Martínez', 'Comprar tranquilidad', 'Salir de las deudas',
      'Poner el tiempo a tu favor', 'mailto:soportemoneypilot@gmail.com', 'href="/privacidad.html"', 'href="/aviso-legal.html"']) assert.ok(qs.includes(t), 'falta ' + t);
  });
  test('el blog generado usa el menú nuevo y la banda oscura en los índices', () => {
    assert.ok(gen.includes('<header class="e-menu">') && gen.includes('function cabeceraIndiceHtml(seccion)'));
    assert.equal((gen.match(/cabeceraIndiceHtml\(seccion\)\);/g) || []).length, 2);
  });
});

describe('Portada más ligera', () => {
  const fuente = leer('src/efectos-3d.js'), css = leer('public/styles.css'), est = leer('public/estatico.css');
  const codigo = fuente.slice(fuente.indexOf('function bucle('), fuente.indexOf('/* ---------- Portada: monedas'));
  // Ejecuta el bucle de animación con un reloj simulado (fotogramas cada "intervalo" ms) y cuenta lo que dibuja
  function simular(intervalo, duracion) {
    let cola = null, dibujos = 0, avisos = 0;
    const raf = f => { cola = f; return 1; };
    class Observador { constructor(cb) { this.cb = cb; } observe() { this.cb([{ isIntersecting: true }]); } disconnect() {} }
    const bucle = new Function('requestAnimationFrame', 'cancelAnimationFrame', 'IntersectionObserver', codigo + '\nreturn bucle;')(raf, () => {}, Observador);
    bucle({}, { style: {} }, () => { dibujos++; }, () => { avisos++; });
    for (let t = intervalo; t <= duracion; t += intervalo) { const f = cola; cola = null; f(t); }
    return { dibujos, avisos };
  }
  test('en una pantalla de 120 Hz dibuja como mucho unas 60 veces por segundo', () => {
    const r = simular(1000 / 120, 1000);
    assert.ok(r.dibujos <= 61 && r.dibujos >= 55, 'dibujó ' + r.dibujos);
  });
  test('en una pantalla normal de 60 Hz no pierde fluidez ni baja la calidad', () => {
    const r = simular(1000 / 60, 5000);
    assert.ok(r.dibujos >= 295, 'dibujó ' + r.dibujos);
    assert.equal(r.avisos, 0);
  });
  test('en un equipo lento baja la calidad una sola vez', () => {
    assert.equal(simular(45, 8000).avisos, 1);
  });
  test('la portada y las capas bajan la resolución cuando el equipo va justo', () => {
    assert.ok(fuente.includes('parar = bucle(contenedor, canvas, dibujar, () => { renderer.setPixelRatio(1); ajustar(); });'));
    assert.ok(fuente.includes('const parar = bucle(banda, canvas, dibujar, () => { renderer.setPixelRatio(1); ajustar(); });'));
  });
  test('sin desenfoques caros: halos con degradado y menús fijos sin desenfocar lo de debajo', () => {
    for (const c of ['.mp-capa-luz{width:820px;height:820px;filter:none', '.mp-cta-luz{width:760px;height:760px;right:-240px;top:-280px;filter:none', '.mp-cab-luz{width:700px;height:700px;right:-210px;top:-330px;filter:none',
      '.mp-mf-indice{background:rgba(250,250,250,.97);-webkit-backdrop-filter:none;backdrop-filter:none}']) assert.ok(css.includes(c), 'falta ' + c);
    assert.ok(est.includes('.e-cab-luz{width:700px;height:700px;right:-210px;top:-330px;filter:none') && est.includes('html.e-menu-claro .e-menu{background:rgba(250,250,250,.97);-webkit-backdrop-filter:none;backdrop-filter:none}'));
  });
});

describe('Páginas legales y contacto con el diseño nuevo', () => {
  const app = leer('src/App.js'), pag = leer('src/paginas.js');
  test('en la app, Aviso legal y Contacto usan la cabecera nueva sin títulos duplicados', () => {
    assert.ok(app.includes('id: "mp-cab-aviso"') && app.includes('sinCabecera: true') && app.includes('id: "mp-cab-contacto"'));
    assert.ok(!pag.includes('Eyebrow, null, "Estamos para ayudarte"'), 'el título de Contacto ya no se repite dentro');
    assert.ok(pag.includes('const enviar = e => {') && pag.includes('mailto:soportemoneypilot@gmail.com?subject='), 'el formulario sigue igual');
  });
  test('las páginas independientes de Privacidad, Aviso legal y Contacto usan el menú, la banda y la piel nuevos', () => {
    for (const f of ['privacidad', 'aviso-legal', 'contacto']) {
      const h = leer('public/' + f + '.html');
      assert.ok(h.includes('<body class="e-pagina e-legal">') && h.includes('<header class="e-menu">') && h.includes('<header class="e-cab">') && h.includes('href="/estatico.css"'), f);
      for (const m of h.matchAll(/<script\b([^>]*)>/g)) assert.ok(/src="\/[^"]+"|type="application\/(ld\+)?json"/.test(m[1]), 'script en línea en ' + f);
    }
    assert.ok(leer('public/privacidad.html').includes('<h1>Política de Privacidad</h1>') && leer('public/aviso-legal.html').includes('<h1>Aviso Legal y Términos de Uso</h1>'));
  });
});

describe('Tablets e iPad: sin zoom automático', () => {
  const css = leer('public/styles.css');
  test('en pantallas táctiles los campos usan 16 px (Safari no amplía la página al tocarlos)', () => {
    assert.ok(css.includes('@media (pointer:coarse){input:not([type=checkbox]):not([type=radio]):not([type=range]),select,textarea{font-size:16px!important}}'));
  });
  test('cada sección recorta lo que sobresale por los lados, sin impedir el titular fijo', () => {
    assert.ok(css.includes('main section,main header.mp-cab{overflow-x:clip}'));
    assert.ok(css.includes('@supports not (overflow:clip){main section,main header.mp-cab{overflow-x:hidden}}'));
  });
});
