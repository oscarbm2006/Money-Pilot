import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Tu web NO genera los estilos automáticamente: usa un archivo fijo (public/styles.css).
// Si el código usa una clase que ese archivo no define, el navegador la ignora EN SILENCIO
// (por ejemplo, un botón que se queda oculto). Esta prueba lo detecta antes de publicar.
const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const leer = r => readFileSync(resolve(raiz, r), 'utf8');

function clasesDefinidas() {
  const html = leer('index.html');
  const bloque = /<style id="estilos">([\s\S]*?)<\/style>/.exec(html);
  const css = leer('public/styles.css') + '\n' + (bloque ? bloque[1] : '');
  const set = new Set();
  for (const m of css.matchAll(/\.((?:\\.|[A-Za-z0-9_-])+)/g)) set.add(m[1].replace(/\\(.)/g, '$1'));
  return set;
}

// Recorre cada expresión "className: ..." y devuelve los textos que contiene (admite condiciones y sumas de texto)
function textosDeClassName(src) {
  const salida = [];
  let i = 0;
  for (;;) {
    const j = src.indexOf('className:', i);
    if (j < 0) break;
    let k = j + 'className:'.length, profundidad = 0;
    while (k < src.length) {
      const ch = src[k];
      if (ch === '"' || ch === "'" || ch === '`') {
        const q = ch; let lit = ''; k++;
        while (k < src.length && src[k] !== q) { if (src[k] === '\\') k++; lit += src[k]; k++; }
        salida.push(lit);
      } else if ('([{'.includes(ch)) profundidad++;
      else if (')]}'.includes(ch)) { if (profundidad === 0) break; profundidad--; }
      else if (ch === ',' && profundidad === 0) break;
      k++;
    }
    i = k;
  }
  return salida;
}

// Clases que YA estaban sin definir cuando se creó esta prueba (la web funciona con ellas).
// Si añades una clase nueva que no está en styles.css, la prueba falla: o la defines en styles.css o usas otra.
const CONOCIDAS = new Set(JSON.parse(leer('tests/estilos-conocidas.json')));

describe('Estilos: las clases del código existen en styles.css', () => {
  test('ninguna clase NUEVA está sin definir', () => {
    const definidas = clasesDefinidas();
    const nuevas = {};
    for (const f of readdirSync(resolve(raiz, 'src')).filter(x => x.endsWith('.js'))) {
      for (const lit of textosDeClassName(leer('src/' + f))) {
        for (const c of lit.split(/\s+/).filter(Boolean)) {
          if (!/^[a-z!-][A-Za-z0-9:\-\[\]./%#_()]*$/.test(c)) continue;
          if (!definidas.has(c) && !CONOCIDAS.has(c)) (nuevas[c] = nuevas[c] || new Set()).add(f);
        }
      }
    }
    const detalle = Object.entries(nuevas).map(([c, fs]) => `"${c}" (en ${[...fs].join(', ')})`).join('; ');
    assert.equal(Object.keys(nuevas).length, 0, 'Clases que no existen en public/styles.css y el navegador ignorará: ' + detalle);
  });
  test('la hoja de estilos incluye lo básico para mostrar u ocultar según el ancho de pantalla', () => {
    const d = clasesDefinidas();
    for (const c of ['hidden', 'sm:flex', 'xl:inline', 'md:hidden']) assert.ok(d.has(c), c);
  });
});
