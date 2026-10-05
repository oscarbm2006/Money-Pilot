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

before(() => {
  tmp = mkdtempSync(join(tmpdir(), 'blog-test-'));
  copyFileSync(resolve(raiz, 'generate-blog.js'), join(tmp, 'generate-blog.js'));
  mkdirSync(join(tmp, 'public'), { recursive: true });
  // Supabase simulado: devuelve los artículos de prueba sin conectarse a nada
  const modulo = join(tmp, 'node_modules/@supabase/supabase-js');
  mkdirSync(modulo, { recursive: true });
  writeFileSync(join(modulo, 'index.js'), `const posts = ${JSON.stringify(POSTS)};\nconst q = { select(){return q}, eq(){return q}, order(){return q}, then(res){ res({ data: posts, error: null }) } };\nmodule.exports = { createClient: () => ({ from: () => q }) };`);
  execFileSync(process.execPath, ['generate-blog.js'], { cwd: tmp, stdio: 'pipe' });
});
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
