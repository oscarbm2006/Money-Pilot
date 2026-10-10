import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, readFileSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let tmp;
const leer = r => readFileSync(join(tmp, r), 'utf8');

const post = (id, extra) => ({ id, title: 'Artículo ' + id, slug: 'articulo-' + id, excerpt: 'Resumen ' + id, content: '## Hola\nTexto **' + id + '**', published: true, categoria_seccion: 'guia', fase: 1, orden: id, created_at: '2026-09-0' + id + 'T10:00:00Z', updated_at: '2026-09-0' + id + 'T10:00:00Z', author: 'Equipo MoneyPilot', cover_emoji: '📊', ...extra });
const POSTS = [
  post(1), post(2), post(3), post(4),
  post(5, { categoria_seccion: 'actualidad', fase: null, orden: null, title: 'Ataque "></title><script>alert(1)</script>', slug: 'hostil-titulo', excerpt: 'x" onmouseover="alert(2)" y="', author: 'A"B' }),
  post(6, { categoria_seccion: 'actualidad', fase: null, orden: null, title: 'Título </script><img src=x onerror=alert(3)>', slug: 'hostil-jsonld' }),
  post(7, { categoria_seccion: 'actualidad', fase: null, orden: null, slug: '../../escapado' }),
  post(8, { categoria_seccion: 'actualidad', fase: null, orden: null, slug: 'a"b' }),
];

// Ejecuta el generador del blog con unos artículos de prueba y devuelve la carpeta temporal con el resultado
function generar(posts) {
  const dir = mkdtempSync(join(tmpdir(), 'blog-test-'));
  copyFileSync(resolve(raiz, 'generate-blog.js'), join(dir, 'generate-blog.js'));
  mkdirSync(join(dir, 'public'), { recursive: true });
  // Supabase simulado: devuelve los artículos de prueba sin conectarse a nada
  const modulo = join(dir, 'node_modules/@supabase/supabase-js');
  mkdirSync(modulo, { recursive: true });
  writeFileSync(join(modulo, 'index.js'), `const posts = ${JSON.stringify(posts)};\nconst q = { select(){return q}, eq(){return q}, order(){return q}, then(res){ res({ data: posts, error: null }) } };\nmodule.exports = { createClient: () => ({ from: () => q }) };`);
  execFileSync(process.execPath, ['generate-blog.js'], { cwd: dir, stdio: 'pipe' });
  return dir;
}
before(() => { tmp = generar(POSTS); });
after(() => { if (tmp) rmSync(tmp, { recursive: true, force: true }); });

describe('Blog estático: navegación entre artículos', () => {
  test('ninguna página del blog muestra el bloque "Sigue leyendo" (solo Anterior y Siguiente)', () => {
    const paginas = ['guia/index.html', 'guia/articulo-1.html', 'guia/articulo-2.html', 'guia/articulo-3.html', 'guia/articulo-4.html', 'actualidad/hostil-titulo.html'];
    for (const p of paginas) {
      const h = leer('public/blog/' + p);
      assert.ok(!h.includes('Sigue leyendo') && !h.includes('class="related"'), `${p} no debe tener "Sigue leyendo"`);
    }
  });
  test('el primer artículo solo tiene "Siguiente"; los de en medio, los dos; el último, solo "Anterior"', () => {
    const tiene = (f, t) => leer('public/blog/guia/' + f).includes(t);
    assert.ok(!tiene('articulo-1.html', '← Anterior') && tiene('articulo-1.html', 'Siguiente →'));
    for (const f of ['articulo-2.html', 'articulo-3.html']) assert.ok(tiene(f, '← Anterior') && tiene(f, 'Siguiente →'), f);
    assert.ok(tiene('articulo-4.html', '← Anterior') && !tiene('articulo-4.html', 'Siguiente →'));
  });
  test('los enlaces Anterior/Siguiente siguen el orden de la guía y apuntan a páginas que existen', () => {
    const h = leer('public/blog/guia/articulo-2.html');
    assert.ok(h.includes('class="prev" href="/blog/guia/articulo-1.html"'));
    assert.ok(h.includes('class="next" href="/blog/guia/articulo-3.html"'));
    for (const m of h.matchAll(/class="(?:prev|next)" href="([^"]+)"/g)) assert.ok(existsSync(join(tmp, 'public', m[1])), m[1]);
  });
  test('el menú de las páginas del blog enlaza al blog nuevo', () => {
    assert.ok(leer('public/blog/guia/articulo-2.html').includes('href="/blog/guia/index.html"'));
  });
});

describe('Blog estático: seguridad del contenido (artículos hostiles)', () => {
  test('las comillas en títulos y extractos no pueden inyectar atributos HTML', () => {
    const h = leer('public/blog/actualidad/hostil-titulo.html');
    assert.ok(!/<[^>]+\sonmouseover="alert/.test(h), 'se coló un atributo onmouseover real');
    assert.ok(!h.includes('<script>alert(1)</script>'));
  });
  test('un "</script>" en el título no rompe los datos estructurados (JSON-LD válido)', () => {
    const h = leer('public/blog/actualidad/hostil-jsonld.html');
    const cabecera = h.split('<style>')[0];
    const bloques = [...cabecera.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m => m[1]);
    assert.ok(bloques.length >= 1);
    for (const b of bloques) assert.doesNotThrow(() => JSON.parse(b));
    assert.ok(!cabecera.includes('<img src=x onerror'));
  });
  test('los slugs con rutas o comillas se omiten y no se escribe nada fuera de public/blog', () => {
    assert.ok(!existsSync(join(tmp, 'public', 'escapado.html')) && !existsSync(join(tmp, 'escapado.html')));
    const archivos = readdirSync(join(tmp, 'public/blog/actualidad'));
    assert.ok(!archivos.some(f => f.includes('"') || f.includes('..')));
    const sitemap = leer('public/sitemap.xml');
    assert.ok(!sitemap.includes('escapado') && !sitemap.includes('a"b'));
  });
  test('un artículo normal se renderiza bien (negrita y título)', () => {
    const h = leer('public/blog/guia/articulo-2.html');
    assert.ok(h.includes('<b>2</b>') && h.includes('<h1>Artículo 2</h1>'));
  });
});


// ---------------------------------------------------------------------------
describe('Blog estático: extractos limpios y título sin repetir', () => {
  const FIN = /[.!?…»”")]$/;
  const T = (n, titulo, excerpt, content, extra = {}) => ({ id: n, title: titulo, slug: 'g-' + n, excerpt, content, published: true, categoria_seccion: 'guia', fase: 1, orden: n, created_at: '2026-09-01T10:00:00Z', updated_at: '2026-09-01T10:00:00Z', author: 'Equipo MoneyPilot', cover_emoji: '📊', ...extra });
  const relleno = ' Ese es el problema de fondo, y tiene solución si lo planteas con orden. Veamos paso a paso cómo hacerlo sin complicarte la vida. ' + 'Texto de desarrollo con varias ideas importantes del artículo. '.repeat(6);
  // Casos reales de la base de datos de MoneyPilot (título y arranque del extracto tal como estaban guardados)
  const CASOS = [
    T(11, '1. "Págate a ti mismo primero": la regla de oro para ahorrar sin hacer presupuestos aburridos', '"Págate a ti mismo primero": la regla de oro para ahorrar sin hacer presupuestos aburridos Llega el día 1, cobras la nómina y te prometes que "este mes sí que v', 'Llega el día 1, cobras la nómina y te prometes que "este mes sí que vas a ahorrar".' + relleno),
    T(10, '2. El sistema de las 3 cuentas: cómo organizar tu dinero y automatizar tus ahorros al cobrar la nómina', 'El sistema de las 3 cuentas: cómo organizar tu dinero y automatizar tus ahorros al cobrar la nómina Cobras la nómina, sientes cierta tranquilidad, pero llega el', 'Cobras la nómina, sientes cierta tranquilidad, pero llega el día 15 y ya no sabes dónde ha ido el dinero.' + relleno),
    T(21, '3. Gastos fijos, variables y de ocio: cómo hacer un reparto inteligente de tu nómina', 'Llegas al día 20 del mes, miras la app del banco y piensas: «¿Pero en qué me he gastado el dinero si apenas he salido?». Nos ha pasado a todos. **El problema ca', 'Llegas al día 20 del mes, miras la app del banco y piensas: «¿Pero en qué me he gastado el dinero si apenas he salido?». Nos ha pasado a todos. **El problema casi nunca es lo que ganas.**' + relleno),
    T(18, '15. Fondos indexados explicados para novatos: cómo invertir tu dinero en piloto automático', '', 'Seguro que más de una vez has pensado: «Tengo algo de dinero ahorrado en la cuenta corriente, pero no sé cómo invertirlo».' + relleno),
    T(29, '19. El riesgo de invertir en acciones sueltas (y cómo analizar los números básicos si decides probar suerte)', 'Seguro que te ha pasado: estás tomando algo con tus amigos y alguien suelta eso de *“Tío, tienes que comprar acciones de esta empresa, que lo va a petar”*. Dar', 'Es una tentación casi inevitable. En cuanto empiezas a interesarte por la bolsa, todo el mundo tiene una acción que te va a hacer rico.' + relleno),
    T(14, '6. Bola de nieve vs. Avalancha: qué método elegir para liquidar tus deudas más rápido', 'Tener varios frentes abiertos —la tarjeta del centro comercial, el préstamo del coche y ese pago a plazos que parecía una buena idea— agobia a cualquiera. Si si', 'Tener varios frentes abiertos —la tarjeta del centro comercial, el préstamo del coche y ese pago a plazos que parecía una buena idea— agobia a cualquiera. Si sientes que no avanzas, no estás solo.' + relleno),
    T(41, 'Un extracto bien escrito que no se toca', 'Este extracto está completo y bien redactado, así que debe respetarse tal cual.', 'Cuerpo con bastante texto.' + relleno),
    T(42, 'Frase larga sin ningún punto', '', 'una frase larguísima que no termina nunca y sigue sumando palabras sin ningún signo de puntuación para comprobar que el recorte nunca parte una palabra por la mitad ni deja una coma colgando antes de los puntos suspensivos finales del texto'),
    T(43, 'Sin extracto ni contenido', '', ''),
    T(51, 'Título repetido con almohadilla', '', '# Título repetido con almohadilla\n\nPrimer párrafo real del artículo, bien explicado y útil. Y una segunda frase para completar la idea principal.' + relleno),
    T(52, '7. Título repetido en texto plano', '', 'Título repetido en texto plano\n\nEste es el verdadero primer párrafo del artículo. Y una segunda frase.' + relleno),
    T(53, 'Empieza parecido al título pero no es el título', '', 'Empieza parecido al título pero sigue con una frase distinta que forma parte del artículo y no debe borrarse.' + relleno),
    T(44, 'Extracto completo pero con negritas', 'Un extracto **completo** que termina bien, pero con símbolos de formato.', 'Primer párrafo limpio del artículo, sin símbolos. Segunda frase para completar.' + relleno),
    T(45, 'Extracto completo que repite el título del artículo', 'Extracto completo que repite el título del artículo y continúa con una frase entera y correcta.', 'Primer párrafo real distinto al título. Otra frase más para completar.' + relleno),
    T(61, 'Noticia con extracto cortado', 'Meta Platforms (NASDAQ: META) registra este jueves un avance del 3,8% en la Bolsa de Nueva York tras conocerse que', 'Meta Platforms (NASDAQ: META) registra este jueves un avance del 3,8% en la Bolsa de Nueva York tras conocerse sus previsiones de ingresos publicitarios para el próximo trimestre.' + relleno, { categoria_seccion: 'bolsa', fase: null, orden: null, slug: 'n-61' }),
  ];
  let dir;
  before(() => { dir = generar(CASOS); });
  after(() => { if (dir) rmSync(dir, { recursive: true, force: true }); });
  const pagina = (slug, sec = 'guia') => readFileSync(join(dir, 'public/blog', sec, slug + '.html'), 'utf8');
  const descripcion = h => /<meta name="description" content="([^"]*)"/.exec(h)[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
  const sinMarcas = h => h.replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ');
  const spansLista = () => [...readFileSync(join(dir, 'public/blog/guia/index.html'), 'utf8').matchAll(/<a class="fase-item"[^>]*>\s*<strong>[\s\S]*?<\/strong>\s*<span>([\s\S]*?)<\/span>/g)].map(m => m[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&'));

  test('ningún extracto de la lista de la guía queda cortado, vacío o con símbolos de formato', () => {
    const spans = spansLista();
    assert.ok(spans.length >= 10);
    for (const t of spans) {
      if (t === 'Sin extracto ni contenido') continue; // sin ningún texto de donde sacarlo, solo queda el título
      assert.ok(t.length > 20, 'extracto vacío o minúsculo: "' + t + '"');
      assert.ok(FIN.test(t), 'cortado: "' + t.slice(-40) + '"');
      assert.ok(!/[*_`#]/.test(t), 'símbolos de formato: "' + t.slice(0, 60) + '"');
    }
  });
  test('un extracto que empieza repitiendo el título se reconstruye desde el texto del artículo', () => {
    for (const n of [11, 10]) {
      const d = descripcion(pagina('g-' + n));
      assert.ok(!d.toLowerCase().startsWith(CASOS.find(c => c.id === n).title.replace(/^\d+\.\s*/, '').slice(0, 25).toLowerCase()), 'sigue empezando por el título: ' + d);
    }
    assert.ok(descripcion(pagina('g-11')).startsWith('Llega el día 1, cobras la nómina'));
  });
  test('los símbolos "**" y "*" del extracto desaparecen', () => {
    assert.ok(!/[*]/.test(descripcion(pagina('g-21'))) && !/[*]/.test(descripcion(pagina('g-29'))));
    assert.ok(descripcion(pagina('g-21')).includes('Nos ha pasado a todos.'));
  });
  test('un artículo sin extracto recibe uno sacado de su primer párrafo (y no solo el título)', () => {
    const d = descripcion(pagina('g-18'));
    assert.ok(d.startsWith('Seguro que más de una vez has pensado') && d !== CASOS.find(c => c.id === 18).title);
  });
  test('un extracto COMPLETO pero con símbolos de formato también se sustituye', () => {
    const d = descripcion(pagina('g-44'));
    assert.ok(!/[*_`#]/.test(d) && d.startsWith('Primer párrafo limpio del artículo'), d);
  });
  test('un extracto COMPLETO que empieza repitiendo el título también se sustituye', () => {
    const d = descripcion(pagina('g-45'));
    assert.ok(d.startsWith('Primer párrafo real distinto al título.'), d);
  });
  test('un extracto bien escrito se respeta tal cual', () => {
    assert.equal(descripcion(pagina('g-41')), 'Este extracto está completo y bien redactado, así que debe respetarse tal cual.');
  });
  test('la descripción para Google mide como máximo 160 caracteres y acaba en frase o en "…"', () => {
    for (const c of CASOS) {
      const sec = c.categoria_seccion === 'bolsa' ? 'bolsa' : 'guia';
      const d = descripcion(pagina(c.slug, sec));
      assert.ok(d.length <= 160, `${c.slug}: ${d.length} caracteres`);
      if (c.content) assert.ok(FIN.test(d), `${c.slug} acaba cortado: "${d.slice(-30)}"`);
    }
  });
  test('si no hay punto, el recorte nunca parte una palabra ni deja coma antes de los puntos suspensivos', () => {
    const d = descripcion(pagina('g-42'));
    assert.ok(d.endsWith('…') && d.length <= 161, d);
    assert.ok(!/[,;:—–-]…$/.test(d), 'coma colgando: ' + d);
    const base = CASOS.find(c => c.id === 42).content;
    const cuerpo = d.slice(0, -1);
    assert.ok(base.startsWith(cuerpo) && /\s/.test(base[cuerpo.length]), 'se cortó dentro de una palabra');
  });
  test('sin extracto ni contenido, la página se genera con el título y sin "undefined"', () => {
    const h = pagina('g-43');
    assert.ok(!/undefined|null|NaN/.test(sinMarcas(h)) && descripcion(h).length > 5);
  });
  test('el título no se repite al principio del cuerpo (con "#", con número o en texto plano)', () => {
    for (const n of [51, 52]) {
      const c = CASOS.find(x => x.id === n);
      const cuerpo = /<div class="prose">([\s\S]*?)<\/div>/.exec(pagina('g-' + n))[1];
      assert.ok(!sinMarcas(cuerpo).includes(c.title.replace(/^\d+\.\s*/, '')), 'el título sigue en el cuerpo del artículo ' + n);
    }
    assert.ok(sinMarcas(pagina('g-51')).includes('Primer párrafo real del artículo'));
  });
  test('un primer párrafo que solo se PARECE al título no se borra', () => {
    const cuerpo = /<div class="prose">([\s\S]*?)<\/div>/.exec(pagina('g-53'))[1];
    assert.ok(sinMarcas(cuerpo).includes('Empieza parecido al título pero sigue con una frase distinta'));
  });
  test('las tarjetas de otras secciones (noticias) también usan el extracto limpio', () => {
    const idx = readFileSync(join(dir, 'public/blog/bolsa/index.html'), 'utf8');
    const p = /<a class="card"[\s\S]*?<p>([\s\S]*?)<\/p>/.exec(idx)[1];
    assert.ok(FIN.test(p) && !p.includes('conocerse que<'), 'tarjeta cortada: ' + p);
  });
});
