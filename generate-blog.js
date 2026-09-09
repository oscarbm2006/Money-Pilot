// generate-blog.js
// Genera páginas HTML estáticas para cada artículo publicado, separando
// 4 secciones según la columna categoria_seccion de Supabase:
//   'bolsa'      -> /blog/bolsa
//   'actualidad' -> /blog/actualidad
//   'tesis'      -> /blog/tesis
//   'guia'       -> /blog/guia  (agrupada por "fase" en vez de por fecha)
// Se ejecuta automáticamente en cada despliegue de Vercel (Build Command).

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = "https://yhxebtkxagxowrvrqssf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloeGVidGt4YWd4b3dydnJxc3NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MTc0MTMsImV4cCI6MjEwMzA5MzQxM30.Mt9vWxpTP-YnZp38qtBAuZVmMMKmIxIKyXA4ni4WZzM";
const SITE_URL = "https://money-pilot-seven-orpin.vercel.app";
const BASE_DIR = path.join(__dirname, 'blog');

const supa = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function escHtml(s) {
  return (s || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

function mdToHtml(md) {
  const lineas = (md || '').split('\n');
  let html = ''; let enLista = false;
  for (let raw of lineas) {
    const linea = raw.trim();
    const encabezado = linea.match(/^#{1,6}\s*(.+)$/);
    if (encabezado) {
      if (enLista) { html += '</ul>'; enLista = false; }
      html += `<h2>${escHtml(encabezado[1])}</h2>`;
    } else if (linea.startsWith('- ')) {
      if (!enLista) { html += '<ul>'; enLista = true; }
      html += `<li>${escHtml(linea.slice(2)).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')}</li>`;
    } else if (linea === '') {
      if (enLista) { html += '</ul>'; enLista = false; }
    } else {
      if (enLista) { html += '</ul>'; enLista = false; }
      html += `<p>${escHtml(linea).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')}</p>`;
    }
  }
  if (enLista) html += '</ul>';
  return html;
}

function fmtFecha(d) {
  try { return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch (e) { return ''; }
}

const STYLE = `
  :root{--navy:#312E81;--primary:#4F46E5;--primary-light:rgba(79,70,229,.10);--paper:#FAFAFA;--ink:#1E1E2E;--muted:#6B7280;--border:#E5E7EB;}
  *{box-sizing:border-box;}
  body{margin:0;font-family:ui-sans-serif,system-ui,sans-serif;background:var(--paper);color:var(--ink);line-height:1.6;}
  header{background:var(--navy);padding:18px 24px;}
  header a{color:#fff;text-decoration:none;font-weight:800;font-size:1.1rem;}
  main{max-width:760px;margin:0 auto;padding:48px 24px 80px;}
  h1{font-size:1.9rem;font-weight:800;color:var(--ink);margin-bottom:8px;}
  h2{font-size:1.3rem;font-weight:800;color:var(--ink);margin:28px 0 12px;}
  p{margin:0 0 18px;}
  .meta{color:var(--muted);font-size:.85rem;margin-bottom:28px;}
  .category{color:var(--primary);font-weight:800;font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;}
  .cta{margin-top:40px;padding:20px;border-radius:16px;background:var(--primary-light);color:var(--navy);font-size:.9rem;}
  .cta a{color:var(--navy);font-weight:800;}
  .disclaimer{margin-top:16px;padding:16px 20px;border-radius:12px;background:#FFFBEB;border:1px solid #FDE68A;color:#92400E;font-size:.82rem;}
  a.back{display:inline-block;margin-top:8px;margin-bottom:24px;color:var(--primary);font-weight:700;text-decoration:none;}
  a.back:hover{text-decoration:underline;}
  footer{border-top:1px solid var(--border);padding:24px;text-align:center;color:var(--muted);font-size:.8rem;}
  .list-item{display:block;padding:20px 0;border-bottom:1px solid var(--border);text-decoration:none;color:inherit;}
  .list-item:hover h2{color:var(--primary);}
  .list-item h2{margin:4px 0 6px;font-size:1.25rem;}
  .list-item p{color:var(--muted);margin:0;font-size:.92rem;}
  .tabs{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0 8px;}
  .tabs a{padding:8px 14px;border-radius:999px;border:1px solid var(--border);text-decoration:none;color:var(--ink);font-size:.82rem;font-weight:700;}
  .tabs a.active{background:var(--primary);color:#fff;border-color:var(--primary);}
  details.fase{border:1px solid var(--border);border-radius:14px;margin-bottom:14px;background:#fff;overflow:hidden;}
  details.fase summary{cursor:pointer;padding:16px 18px;font-weight:800;font-size:1.02rem;list-style:none;}
  details.fase summary::-webkit-details-marker{display:none;}
  details.fase summary:before{content:"▸ ";color:var(--primary);}
  details.fase[open] summary:before{content:"▾ ";}
  details.fase .fase-items{padding:0 18px 12px;}
`;

const FOOTER = `<footer>
  <a href="/privacidad.html" style="color:var(--muted);margin:0 8px;">Privacidad</a> ·
  <a href="/aviso-legal.html" style="color:var(--muted);margin:0 8px;">Aviso Legal</a> ·
  <a href="/quienes-somos.html" style="color:var(--muted);margin:0 8px;">Quiénes somos</a> ·
  <a href="/contacto.html" style="color:var(--muted);margin:0 8px;">Contacto</a>
</footer>`;

// Definición de las 4 secciones/pestañas del blog.
const SECCIONES = [
  { key: 'bolsa', urlBase: '/blog/bolsa', nombreTab: 'Noticias de bolsa', tituloIndex: 'Noticias de bolsa', descIndex: 'Actualidad de mercados y empresas cotizadas.' },
  { key: 'actualidad', urlBase: '/blog/actualidad', nombreTab: 'Noticias de actualidad', tituloIndex: 'Noticias de actualidad', descIndex: 'Novedades económicas y financieras de actualidad.' },
  { key: 'tesis', urlBase: '/blog/tesis', nombreTab: 'Tesis de inversión', tituloIndex: 'Tesis de inversión', descIndex: 'Análisis y tesis sobre empresas y sectores concretos. Contenido informativo, no es asesoramiento de inversión.' },
  { key: 'guia', urlBase: '/blog/guia', nombreTab: 'Guía de educación financiera', tituloIndex: 'Guía de educación financiera', descIndex: 'Recorrido paso a paso en 5 fases para organizar tus finanzas, aprender a invertir y planificar tu futuro.' },
];

const NOMBRES_FASE = {
  1: 'Fase 1: Organización y Cimientos',
  2: 'Fase 2: Psicología y Filosofía del Dinero',
  3: 'Fase 3: Iniciación a la Inversión',
  4: 'Fase 4: Optimización y Estrategia Avanzada',
  5: 'Fase 5: Objetivos Vitales y Legado',
};

function tabsHtml(seccionActivaKey) {
  return `<div class="tabs">${SECCIONES.map(s =>
    `<a href="${s.urlBase}/index.html" class="${s.key === seccionActivaKey ? 'active' : ''}">${escHtml(s.nombreTab)}</a>`
  ).join('')}</div>`;
}

function postPage(post, seccion) {
  const url = `${SITE_URL}${seccion.urlBase}/${post.slug}.html`;
  const title = `${post.title} – MoneyPilot`;
  const desc = (post.excerpt || post.title || '').slice(0, 160);
  const esInversion = seccion.key === 'tesis' || seccion.key === 'bolsa';

  const ctaBlock = esInversion
    ? `<div class="disclaimer">⚠️ Contenido meramente informativo y educativo, generado con apoyo de inteligencia artificial. No constituye asesoramiento ni recomendación de inversión personalizada. Antes de invertir, valora tu situación con un profesional cualificado.</div>`
    : `<div class="cta">¿Quieres aplicar esto a tu propio caso? Usa el <a href="/">diagnóstico gratuito de MoneyPilot</a>.</div>`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escHtml(title)}</title>
<meta name="description" content="${escHtml(desc)}" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="${url}" />
<meta property="og:title" content="${escHtml(title)}" />
<meta property="og:description" content="${escHtml(desc)}" />
<meta property="og:type" content="article" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${SITE_URL}/og-image.png" />
<meta property="og:locale" content="es_ES" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<script type="application/ld+json">
${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "datePublished": post.created_at,
    "dateModified": post.updated_at || post.created_at,
    "author": { "@type": "Person", "name": post.author || "Equipo MoneyPilot" },
    "description": desc
  }, null, 2)}
</script>
<style>${STYLE}</style>
</head>
<body>
<header><a href="/">MoneyPilot</a></header>
<main>
  ${tabsHtml(seccion.key)}
  <a class="back" href="${seccion.urlBase}/index.html">← Volver a ${escHtml(seccion.nombreTab)}</a>
  <div class="category">${escHtml(post.category || (seccion.key === 'guia' ? (NOMBRES_FASE[post.fase] || 'Guía') : 'General'))}</div>
  <h1>${escHtml(post.title)}</h1>
  <div class="meta">Por ${escHtml(post.author || 'Equipo MoneyPilot')} · ${fmtFecha(post.created_at)}</div>
  <div class="content">${mdToHtml(post.content)}</div>
  ${ctaBlock}
  <div class="cta" style="background:var(--paper);border:1px solid var(--border);">¿Quieres aprender más? Puedes encontrar <a href="/recursos-y-libros.html">aquí algunos libros seleccionados</a> para empezar desde 0 y aprender a administrar tu propio dinero.</div>
</main>
${FOOTER}
</body>
</html>`;
}

// Índice normal (cronológico): usado por bolsa, actualidad y tesis.
function indexPageCronologico(posts, seccion) {
  const items = posts.map(p => `
  <a class="list-item" href="${seccion.urlBase}/${p.slug}.html">
    <div class="category">${escHtml(p.category || 'General')}</div>
    <h2>${escHtml(p.title)}</h2>
    <p>${escHtml(p.excerpt || '')}</p>
  </a>`).join('\n');

  return paginaBase(seccion, `
  <h1>${escHtml(seccion.tituloIndex)}</h1>
  <p class="meta">${escHtml(seccion.descIndex)}</p>
  ${items || '<p>Todavía no hay artículos publicados.</p>'}
  `);
}

// Índice especial de la Guía: acordeones agrupados por fase (1 a 5), NO por fecha.
function indexPageGuia(posts, seccion) {
  const porFase = {};
  for (const p of posts) {
    const f = Number(p.fase) || 0;
    if (!porFase[f]) porFase[f] = [];
    porFase[f].push(p);
  }

  const bloques = [1, 2, 3, 4, 5].map(n => {
    const items = (porFase[n] || []).map(p => `
      <a class="list-item" href="${seccion.urlBase}/${p.slug}.html">
        <h2>${escHtml(p.title)}</h2>
        <p>${escHtml(p.excerpt || '')}</p>
      </a>`).join('\n');
    return `
    <details class="fase" ${n === 1 ? 'open' : ''}>
      <summary>${escHtml(NOMBRES_FASE[n])}</summary>
      <div class="fase-items">${items || '<p>Todavía no hay artículos en esta fase.</p>'}</div>
    </details>`;
  }).join('\n');

  const sinFase = (porFase[0] || []).map(p => `
    <a class="list-item" href="${seccion.urlBase}/${p.slug}.html">
      <h2>${escHtml(p.title)}</h2>
      <p>${escHtml(p.excerpt || '')}</p>
    </a>`).join('\n');

  return paginaBase(seccion, `
  <h1>${escHtml(seccion.tituloIndex)}</h1>
  <p class="meta">${escHtml(seccion.descIndex)}</p>
  ${bloques}
  ${sinFase ? `<h2>Otros artículos de la guía</h2>${sinFase}` : ''}
  `);
}

function paginaBase(seccion, cuerpoHtml) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escHtml(seccion.tituloIndex)} – MoneyPilot</title>
<meta name="description" content="${escHtml(seccion.descIndex)}" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="${SITE_URL}${seccion.urlBase}/index.html" />
<meta property="og:title" content="${escHtml(seccion.tituloIndex)} – MoneyPilot" />
<meta property="og:description" content="${escHtml(seccion.descIndex)}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${SITE_URL}${seccion.urlBase}/index.html" />
<meta property="og:image" content="${SITE_URL}/og-image.png" />
<meta property="og:locale" content="es_ES" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<style>${STYLE}</style>
</head>
<body>
<header><a href="/">MoneyPilot</a></header>
<main>
  ${tabsHtml(seccion.key)}
  ${cuerpoHtml}
</main>
${FOOTER}
</body>
</html>`;
}

function generarSeccion(posts, seccion) {
  const outDir = path.join(BASE_DIR, seccion.key);
  fs.mkdirSync(outDir, { recursive: true });
  const index = seccion.key === 'guia' ? indexPageGuia(posts, seccion) : indexPageCronologico(posts, seccion);
  fs.writeFileSync(path.join(outDir, 'index.html'), index);
  for (const post of posts) {
    if (!post.slug) continue;
    fs.writeFileSync(path.join(outDir, `${post.slug}.html`), postPage({ ...post, __seccionKey: seccion.key }, seccion));
  }
}

async function main() {
  console.log('Generando páginas estáticas del blog…');
  const { data: posts, error } = await supa
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error al leer posts de Supabase:', error.message);
    process.exit(0);
  }

  const todos = posts || [];

  for (const seccion of SECCIONES) {
    const posts_de_seccion = todos.filter(p => p.categoria_seccion === seccion.key);
    generarSeccion(posts_de_seccion, seccion);
    console.log(`  ${seccion.key}: ${posts_de_seccion.length} artículo(s)`);
  }

  console.log('Listo.');
}

main();
