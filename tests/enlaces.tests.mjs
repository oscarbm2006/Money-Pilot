import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const leer = r => readFileSync(resolve(raiz, r), 'utf8');
const BLOG = '/blog/guia/index.html';

describe('El blog nuevo está enlazado en todos los sitios', () => {
  const app = leer('src/App.js');

  test('en la app, el enlace al blog es el mismo para todos (también para el administrador)', () => {
    assert.ok(app.includes(`const blogHref = "${BLOG}";`), 'blogHref debe apuntar siempre al blog nuevo');
    assert.ok(!/blogHref\s*=\s*esAdminBlog/.test(app), 'el administrador no debe ir a otro blog distinto');
    assert.ok(app.includes('window.location.assign(blogHref)'));
  });
  test('la única entrada al blog interno de edición es el enlace "Gestionar blog", visible solo para el administrador', () => {
    const usos = [...app.matchAll(/setVistaActual\('blog'\)/g)];
    assert.equal(usos.length, 1);
    const antes = app.slice(Math.max(0, usos[0].index - 160), usos[0].index);
    assert.ok(antes.includes('esAdminBlog ?'), 'debe estar dentro de una condición de administrador');
    assert.ok(app.includes('"Gestionar blog"'));
  });
  test('el menú superior de la app usa el enlace al blog nuevo', () => {
    assert.ok(/blogHref:\s*blogHref/.test(app));
  });
  test('todas las páginas estáticas públicas enlazan al blog nuevo', () => {
    const paginas = readdirSync(resolve(raiz, 'public')).filter(f => f.endsWith('.html') && f !== 'admin-inversion.html');
    assert.ok(paginas.length >= 5);
    for (const f of paginas) assert.ok(leer('public/' + f).includes(`href="${BLOG}"`), `${f} no enlaza al blog`);
  });
  test('la portada con texto para buscadores enlaza al blog nuevo', () => {
    assert.ok(leer('index.html').includes(`href="${BLOG}"`));
  });
  test('el menú de las páginas del blog enlaza al propio blog', () => {
    assert.ok(leer('generate-blog.js').includes(`item('${BLOG}', 'Blog', 'blog')`));
  });
});
