// generate-blog.js
// Genera páginas HTML estáticas para cada artículo publicado del blog de MoneyPilot,
// leyendo directamente de Supabase, más un índice /blog/index.html.
// Se ejecuta automáticamente en cada despliegue de Vercel (ver "Build Command").
//
// No requiere configuración manual: usa la misma URL y clave pública (anon key)
// que ya usa la app en el navegador — es segura para este uso porque solo lee
// artículos publicados.

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = "https://yxpdduodkncjupwifcpg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4cGRkdW9ka25janVwd2lmY3BnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMDk0OTcsImV4cCI6MjEwMzc4NTQ5N30.bwCWQtiTTWhh7ZoDUgRGTkoPB15He-Sv3OCHhPM6Z98";
const SITE_URL = "https://money-pilot-seven-orpin.vercel.app";
const OUT_DIR = path.join(__dirname, 'blog');

const supa = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function escHtml(s) {
  return (s || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

// Mismo conversor markdown minimalista que usa la app (## subtítulos, **negrita**, listas "- ")
function mdToHtml(md) {
  const lineas = (md || '').split('\n');
  let html = ''; let enLista = false;
  for (let raw of lineas) {
    const linea = raw.trim();
    if (linea.startsWith('## ')) {
      if (enLista) { html += '</ul>'; enLista = false; }
      html += `<h2>${escHtml(linea.slice(3))}</h2>`;
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
  a.back{display:inline-block;margin-top:8px;margin-bottom:24px;color:var(--primary);font-weight:700;text-decoration:none;}
  a.back:hover{text-decoration:underline;}
  footer{border-top:1px solid var(--border);padding:24px;text-align:center;color:var(--muted);font-size:.8rem;}
  .list-item{display:block;padding:20px 0;border-bottom:1px solid var(--border);text-decoration:none;color:inherit;}
  .list-item:hover h2{color:var(--primary);}
  .list-item h2{margin:4px 0 6px;font-size:1.25rem;}
  .list-item p{color:var(--muted);margin:0;font-size:.92rem;}
`;

const FOOTER = `<footer>
  <a href="/privacidad.html" style="color:var(--muted);margin:0 8px;">Privacidad</a> ·
  <a href="/aviso-legal.html" style="color:var(--muted);margin:0 8px;">Aviso Legal</a> ·
  <a href="/quienes-somos.html" style="color:var(--muted);margin:0 8px;">Quiénes somos</a> ·
  <a href="/contacto.html" style="color:var(--muted);margin:0 8px;">Contacto</a>
</footer>`;

function postPage(post) {
  const url = `${SITE_URL}/blog/${post.slug}.html`;
  const title = `${post.title} – MoneyPilot`;
  const desc = (post.excerpt || post.title || '').slice(0, 160);
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
  <a class="back" href="/blog/index.html">← Volver al blog</a>
  <div class="category">${escHtml(post.category || 'General')}</div>
  <h1>${escHtml(post.title)}</h1>
  <div class="meta">Por ${escHtml(post.author || 'Equipo MoneyPilot')} · ${fmtFecha(post.created_at)}</div>
  <div class="content">${mdToHtml(post.content)}</div>
  <div class="cta">¿Quieres aplicar esto a tu propio caso? Usa el <a href="/">diagnóstico gratuito de MoneyPilot</a>.</div>
</main>
${FOOTER}
</body>
</html>`;
}

function indexPage(posts) {
  const items = posts.map(p => `
  <a class="list-item" href="/blog/${p.slug}.html">
    <div class="category">${escHtml(p.category || 'General')}</div>
    <h2>${escHtml(p.title)}</h2>
    <p>${escHtml(p.excerpt || '')}</p>
  </a>`).join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Blog de finanzas personales – MoneyPilot</title>
<meta name="description" content="Guías claras sobre ahorro, inversión y presupuesto, además de noticias financieras, escritas por el equipo de MoneyPilot." />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="${SITE_URL}/blog/index.html" />
<meta property="og:title" content="Blog de finanzas personales – MoneyPilot" />
<meta property="og:description" content="Guías claras sobre ahorro, inversión y presupuesto, además de noticias financieras, escritas por el equipo de MoneyPilot." />
<meta property="og:type" content="website" />
<meta property="og:url" content="${SITE_URL}/blog/index.html" />
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
  <h1>Blog de finanzas personales</h1>
  <p class="meta">Guías claras sobre ahorro, inversión y presupuesto, escritas por el equipo de MoneyPilot.</p>
  ${items || '<p>Todavía no hay artículos publicados.</p>'}
</main>
${FOOTER}
</body>
</html>`;
}

async function main() {
  console.log('Generando páginas estáticas del blog…');
  const { data: posts, error } = await supa
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al leer posts de Supabase:', error.message);
    // No rompemos el build por esto: la app sigue funcionando igual aunque falle el blog estático.
    process.exit(0);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), indexPage(posts || []));
  for (const post of posts || []) {
    if (!post.slug) continue;
    fs.writeFileSync(path.join(OUT_DIR, `${post.slug}.html`), postPage(post));
  }

  console.log(`Listo: ${(posts || []).length} artículo(s) generado(s) en /blog`);
}

main();
