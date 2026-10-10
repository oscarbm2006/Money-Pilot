// generate-blog.js
// Genera páginas HTML estáticas para cada artículo publicado, separando
// 4 secciones según la columna categoria_seccion de Supabase:
//   'bolsa'      -> /blog/bolsa
//   'actualidad' -> /blog/actualidad
//   'tesis'      -> /blog/tesis
//   'guia'       -> /blog/guia  (agrupada por "fase" en vez de por fecha)
// Se ejecuta en cada despliegue: `npm run build` lo lanza antes de `vite build`.
// Escribe en public/blog y regenera public/sitemap.xml con todos los artículos.
// El orden de los artículos es el mismo que en la web: primero la columna `orden`
// (los que no la tienen, al final) y después la fecha de creación.

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = "https://yhxebtkxagxowrvrqssf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloeGVidGt4YWd4b3dydnJxc3NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MTc0MTMsImV4cCI6MjEwMzA5MzQxM30.Mt9vWxpTP-YnZp38qtBAuZVmMMKmIxIKyXA4ni4WZzM";
// Si más adelante tienes dominio propio, define SITE_URL en Vercel (Settings > Environment Variables)
// o cambia el valor por defecto de aquí.
const SITE_URL = (process.env.SITE_URL || "https://money-pilot-seven-orpin.vercel.app").replace(/\/+$/, '');
// Se escribe dentro de public/ para que Vite lo copie tal cual a dist/ al compilar.
const PUBLIC_DIR = path.join(__dirname, 'public');
const BASE_DIR = path.join(PUBLIC_DIR, 'blog');

const supa = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Secciones que tienen al menos un artículo publicado. Las vacías no salen en las
// pestañas, no entran en el sitemap y su página lleva "noindex" hasta que tengan contenido.
let SECCIONES_ACTIVAS = new Set();

function escHtml(s) {
  return (s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// JSON-LD dentro de <script>: un "</script>" en un título cortaría el bloque.
// Se neutraliza "<" como \u003c (sigue siendo JSON válido y Google lo interpreta igual).
function jsonLd(obj) {
  return JSON.stringify(obj, null, 2).replace(/</g, '\\u003c');
}

// Un slug acaba en nombres de archivo y en enlaces: solo letras, números, guion y guion bajo.
const SLUG_VALIDO = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

// Formato en línea: **negrita**, *cursiva* y [texto](enlace).
function inline(texto) {
  let t = escHtml(texto);
  t = t.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  t = t.replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, '$1<i>$2</i>');
  t = t.replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)\s"'<>]*)\)/g, (m, txt, url) => {
    const externo = /^https?:\/\//.test(url);
    return `<a href="${url}"${externo ? ' rel="noopener" target="_blank"' : ''}>${txt}</a>`;
  });
  return t;
}

function mdToHtml(md) {
  const lineas = (md || '').split('\n');
  let html = '';
  let lista = null; // 'ul' | 'ol' | null
  const cerrar = () => { if (lista) { html += `</${lista}>`; lista = null; } };
  for (const raw of lineas) {
    const linea = raw.trim();
    const encabezado = linea.match(/^(#{1,6})\s*(.+)$/);
    const viñeta = linea.match(/^[-*]\s+(.+)$/);
    const numerada = linea.match(/^\d+[.)]\s+(.+)$/);
    if (encabezado) {
      cerrar();
      const tag = encabezado[1].length >= 3 ? 'h3' : 'h2';
      html += `<${tag}>${inline(encabezado[2])}</${tag}>`;
    } else if (viñeta) {
      if (lista !== 'ul') { cerrar(); html += '<ul>'; lista = 'ul'; }
      html += `<li>${inline(viñeta[1])}</li>`;
    } else if (numerada) {
      if (lista !== 'ol') { cerrar(); html += '<ol>'; lista = 'ol'; }
      html += `<li>${inline(numerada[1])}</li>`;
    } else if (linea === '') {
      cerrar();
    } else {
      cerrar();
      html += `<p>${inline(linea)}</p>`;
    }
  }
  cerrar();
  return html;
}

function fmtFecha(d) {
  try { return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch (e) { return ''; }
}

function minutosLectura(texto) {
  const palabras = (texto || '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palabras / 200));
}

// Mismo criterio que la web: primero `orden` (los que no lo tienen, al final) y luego fecha.
function ordenar(posts) {
  const num = p => (p.orden === null || p.orden === undefined || p.orden === '' ? Infinity : Number(p.orden));
  return [...posts].sort((a, b) => {
    const oa = num(a), ob = num(b);
    if (oa !== ob) return oa < ob ? -1 : 1;
    return new Date(a.created_at) - new Date(b.created_at);
  });
}

const STYLE = `
  :root{--bg:#f5f6fa;--surface:#fff;--primary:#4f46e5;--primary-soft:rgba(79,70,229,.10);--navy:#312e81;--ink:#1e1e2e;--strong:#1e1b4b;--text:#374151;--muted:#6b7280;--border:#e5e7eb;--amber:#d97706;--serif:ui-serif,Georgia,Cambria,"Times New Roman",Times,serif;--sans:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;--shadow:0 1px 3px rgba(30,30,46,.05),0 8px 24px rgba(30,30,46,.05);--shadow-hover:0 10px 28px -8px rgba(30,30,46,.22);}
  *{box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  body{margin:0;min-height:100vh;display:flex;flex-direction:column;font-family:var(--sans);background:linear-gradient(180deg,#f1f3f9 0%,#f5f6fa 22%,#f8f9fc 52%,#f3f5fa 100%);color:var(--text);line-height:1.6;}
  a{color:var(--primary);}
  a:focus-visible,summary:focus-visible{outline:2px solid var(--primary);outline-offset:2px;border-radius:6px;}

  /* Cabecera igual que la de la app */
  .site-header{position:sticky;top:0;z-index:50;background:rgba(6,10,19,.92);border-bottom:1px solid var(--border);box-shadow:0 8px 24px -12px rgba(0,0,0,.6);backdrop-filter:blur(18px) saturate(140%);-webkit-backdrop-filter:blur(18px) saturate(140%);}
  .nav-inner{max-width:72rem;margin:0 auto;padding:.5rem 1rem;display:flex;align-items:center;flex-wrap:wrap;gap:.5rem 1rem;}
  @media(min-width:640px){.nav-inner{padding-left:1.5rem;padding-right:1.5rem;}}
  .logo-pill{display:flex;align-items:center;background:#fff;border-radius:8px;padding:3px 9px;text-decoration:none;}
  .logo-pill img{display:block;height:20px;width:auto;}
  .main-nav{margin-left:auto;display:flex;align-items:center;flex-wrap:wrap;gap:4px;font-size:.75rem;font-weight:700;}
  .main-nav a{padding:.5rem .625rem;border-radius:8px;color:#94a3b8;text-decoration:none;transition:background-color .15s,color .25s;}
  .main-nav a:hover{color:#e2e8f0;background:rgba(255,255,255,.10);}
  .main-nav a.active{color:#fff;background:rgba(79,70,229,.45);}
  .main-nav a.cta-nav{background:var(--primary);color:#fff;}
  .main-nav a.cta-nav:hover{background:#4338ca;}

  main{flex:1;width:100%;max-width:48rem;margin:0 auto;padding:44px 20px 72px;}
  main.wide{max-width:56rem;}
  .eyebrow{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.16em;color:var(--primary);margin:0 0 10px;}
  h1{font-family:var(--serif);font-size:clamp(1.9rem,5vw,2.6rem);font-weight:700;color:var(--strong);letter-spacing:-.01em;line-height:1.2;margin:0 0 12px;}
  .lead{font-size:1.02rem;color:var(--muted);margin:0 0 24px;}

  /* Pestañas de sección */
  .tabs{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 28px;}
  .tabs a{padding:8px 16px;border-radius:999px;border:1px solid var(--border);background:var(--bg);text-decoration:none;color:var(--ink);font-size:.78rem;font-weight:700;transition:border-color .2s,transform .2s;}
  .tabs a:hover{border-color:var(--primary);transform:translateY(-1px);}
  .tabs a.active{background:var(--primary);color:#fff;border-color:var(--primary);}

  /* Tarjetas de artículo */
  .cards{display:grid;gap:16px;}
  .card{display:flex;gap:16px;align-items:flex-start;background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:20px;text-decoration:none;color:inherit;box-shadow:var(--shadow);transition:box-shadow .25s,border-color .25s,transform .25s;}
  .card:hover{border-color:rgba(79,70,229,.45);box-shadow:var(--shadow-hover);transform:translateY(-2px);}
  .card .emoji{font-size:1.9rem;line-height:1;}
  .card .cat{font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--amber);margin-bottom:4px;}
  .card h2{font-family:var(--serif);font-size:1.15rem;line-height:1.3;color:var(--strong);margin:0 0 6px;}
  .card p{margin:0;font-size:.9rem;color:var(--muted);}
  .card .by{margin-top:10px;font-size:.75rem;color:#9ca3af;}
  .empty{background:var(--surface);border:1px dashed var(--border);border-radius:16px;padding:28px;text-align:center;color:var(--muted);}

  /* Guía: fases desplegables */
  details.fase{background:var(--surface);border:1px solid var(--border);border-radius:16px;margin-bottom:12px;overflow:hidden;box-shadow:var(--shadow);}
  details.fase summary{cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px;font-family:var(--serif);font-weight:700;font-size:1.02rem;color:var(--strong);}
  details.fase summary::-webkit-details-marker{display:none;}
  details.fase summary .count{margin-left:auto;font-family:var(--sans);font-size:.7rem;font-weight:700;color:var(--muted);background:var(--bg);border:1px solid var(--border);border-radius:999px;padding:2px 10px;}
  details.fase summary:after{content:"";width:8px;height:8px;border-right:2px solid var(--primary);border-bottom:2px solid var(--primary);transform:rotate(45deg);transition:transform .2s;margin:-4px 2px 0 4px;}
  details.fase[open] summary{background:var(--primary-soft);}
  details.fase[open] summary:after{transform:rotate(-135deg);margin-top:4px;}
  .fase-items{padding:4px 20px 10px;}
  .fase-item{display:block;padding:12px 0;border-bottom:1px solid var(--border);text-decoration:none;color:inherit;}
  .fase-item:last-child{border-bottom:0;}
  .fase-item strong{display:block;font-size:.95rem;color:var(--ink);}
  .fase-item span{display:block;font-size:.8rem;color:var(--muted);margin-top:2px;}
  .fase-item:hover strong{color:var(--primary);}
  .fase-vacia{font-size:.82rem;color:var(--muted);padding:10px 0;margin:0;}

  /* Artículo */
  .breadcrumb{font-size:.78rem;color:var(--muted);margin:0 0 18px;}
  .breadcrumb a{color:var(--primary);text-decoration:none;font-weight:700;}
  .breadcrumb a:hover{text-decoration:underline;}
  .article-cat{font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--amber);margin-bottom:8px;}
  .meta{font-size:.82rem;color:var(--muted);margin:0 0 30px;padding-bottom:22px;border-bottom:1px solid var(--border);}
  .prose{font-size:1.05rem;line-height:1.8;color:var(--text);}
  .prose h2{font-family:var(--serif);font-size:1.5rem;color:var(--strong);margin:2.2rem 0 .8rem;line-height:1.3;}
  .prose h3{font-family:var(--serif);font-size:1.2rem;color:var(--strong);margin:1.8rem 0 .6rem;}
  .prose p{margin:0 0 1.15rem;}
  .prose ul,.prose ol{margin:0 0 1.3rem;padding-left:1.4rem;}
  .prose li{margin-bottom:.45rem;}
  .prose b{color:var(--ink);}
  .cta{margin-top:40px;padding:20px 22px;border-radius:16px;background:var(--primary-soft);color:var(--navy);font-size:.92rem;}
  .cta a{color:var(--navy);font-weight:800;}
  .cta.soft{background:var(--surface);border:1px solid var(--border);}
  .disclaimer{margin-top:28px;padding:16px 20px;border-radius:12px;background:#fffbeb;border:1px solid #fde68a;color:#92400e;font-size:.82rem;}
  .pager{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:36px;}
  .pager a{display:block;padding:14px 16px;border:1px solid var(--border);border-radius:14px;background:var(--surface);text-decoration:none;color:var(--ink);box-shadow:var(--shadow);transition:border-color .2s,transform .2s;}
  .pager a:hover{border-color:var(--primary);transform:translateY(-1px);}
  .pager small{display:block;font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--primary);margin-bottom:3px;}
  .pager .next{text-align:right;grid-column:2;}
  .pager .prev{grid-column:1;}
  @media(max-width:520px){.pager{grid-template-columns:1fr;}.pager .next,.pager .prev{grid-column:1;text-align:left;}}

  footer{border-top:1px solid var(--border);padding:24px;text-align:center;color:var(--muted);font-size:.8rem;background:rgba(255,255,255,.6);}
  footer a{color:var(--muted);margin:0 8px;text-decoration:none;}
  footer a:hover{color:var(--primary);text-decoration:underline;}
  @media(prefers-reduced-motion:reduce){*{transition:none!important;scroll-behavior:auto!important;}}
`;

const FOOTER = `<footer>
  <a href="/privacidad.html">Privacidad</a> ·
  <a href="/aviso-legal.html">Aviso Legal</a> ·
  <a href="/quienes-somos.html">Quiénes somos</a> ·
  <a href="/contacto.html">Contacto</a>
</footer>`;

// Definición de las 4 secciones/pestañas del blog (mismo orden que en la web).
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

// Textos de llamada a la acción: los mismos que usa la web.
const CTA_PRESETS = {
  diagnostico: { texto: '¿Quieres aplicar esto a tu propio caso? Usa el', enlaceTexto: 'diagnóstico gratuito de MoneyPilot', url: '/', sufijo: '.' },
  libro: { texto: '¿Quieres aprender más? Puedes encontrar', enlaceTexto: 'aquí algunos libros seleccionados', url: '/recursos-y-libros.html', sufijo: ' para empezar desde 0.' },
  contacto: { texto: '¿Tienes dudas sobre esto?', enlaceTexto: 'Escríbenos', url: '/contacto.html', sufijo: ' y te ayudamos.' },
  quienes: { texto: '¿Quieres saber quién hay detrás de MoneyPilot?', enlaceTexto: 'Conócenos aquí', url: '/quienes-somos.html', sufijo: '.' },
};

function headerHtml(activo) {
  const item = (href, texto, clave, extra) => {
    const clases = [activo === clave ? 'active' : '', extra || ''].filter(Boolean).join(' ');
    return `<a href="${href}"${clases ? ` class="${clases}"` : ''}>${texto}</a>`;
  };
  return `<header class="site-header">
  <div class="nav-inner">
    <a href="/" class="logo-pill" aria-label="MoneyPilot, ir al inicio"><img src="/logo-moneypilot.png" alt="MoneyPilot" width="113" height="20"></a>
    <nav class="main-nav" aria-label="Navegación principal">
      ${item('/', 'Introducción', 'inicio')}
      ${item('/blog/guia/index.html', 'Blog', 'blog')}
      ${item('/recursos-y-libros.html', 'Recursos y libros', 'recursos')}
      ${item('/', 'Hacer mi diagnóstico', 'diag', 'cta-nav')}
    </nav>
  </div>
</header>`;
}

function tabsHtml(seccionActivaKey) {
  const visibles = SECCIONES.filter(s => SECCIONES_ACTIVAS.has(s.key) || s.key === seccionActivaKey);
  if (visibles.length < 2) return '';
  return `<nav class="tabs" aria-label="Secciones del blog">${visibles.map(s =>
    `<a href="${s.urlBase}/index.html" class="${s.key === seccionActivaKey ? 'active' : ''}">${escHtml(s.nombreTab)}</a>`
  ).join('')}</nav>`;
}

function ctaHtml(post) {
  let preset = post.cta_preset || 'diagnostico';
  if (preset === 'ninguno') return '';
  if (preset === 'personalizado') {
    const texto = (post.cta_texto || '').trim();
    const enlaceTexto = (post.cta_enlace_texto || '').trim();
    const enlaceUrl = (post.cta_enlace_url || '/').trim() || '/';
    if (texto || enlaceTexto) {
      const enlaceHtml = enlaceTexto ? ` <a href="${escHtml(enlaceUrl)}">${escHtml(enlaceTexto)}</a>.` : '';
      return `<div class="cta">${escHtml(texto)}${enlaceHtml}</div>`;
    }
    preset = 'diagnostico'; // personalizado pero vacío: se usa el mensaje por defecto
  }
  const info = CTA_PRESETS[preset] || CTA_PRESETS.diagnostico;
  return `<div class="cta">${escHtml(info.texto)} <a href="${info.url}">${escHtml(info.enlaceTexto)}</a>${escHtml(info.sufijo)}</div>`;
}

// ---------------------------------------------------------------------------
// Extractos limpios: los que vienen de la base de datos a veces están cortados a mitad de
// palabra, llevan símbolos de formato (**), repiten el título o faltan. En esos casos se
// construye uno nuevo a partir del propio texto del artículo (sin modificar los datos).
// ---------------------------------------------------------------------------
function sinNumero(titulo) {
  return String(titulo || '').replace(/^\s*\d+\s*[.)]\s*/, '').trim();
}
function normalizar(t) {
  return String(t || '').toLowerCase().replace(/[“”"«»'’‘]/g, '').replace(/\s+/g, ' ').trim();
}
function textoPlano(md) {
  return String(md || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/[*_`~]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
// Si el artículo empieza repitiendo su propio título (como "# Título", "2. Título" o en texto plano), se quita:
// la página ya muestra el título como encabezado.
function sinTituloRepetido(md, titulo) {
  const lineas = String(md || '').split('\n');
  let i = 0;
  while (i < lineas.length && !lineas[i].trim()) i++;
  if (i >= lineas.length) return md;
  const limpia = t => normalizar(textoPlano(t)).replace(/[.:!?¿¡\s]+$/, '');
  const primera = limpia(lineas[i]);
  const objetivo = limpia(sinNumero(titulo));
  if (primera && primera === objetivo) return lineas.slice(i + 1).join('\n').replace(/^\s+/, '');
  return md;
}
function extractoBueno(ex, titulo) {
  const t = String(ex || '').trim();
  if (!t) return false;
  if (!/[.!?…»”")]$/.test(t)) return false;                 // cortado
  if (/[*_`#]/.test(t)) return false;                        // símbolos de formato
  const nuevoTitulo = normalizar(sinNumero(titulo));
  if (nuevoTitulo.length >= 20 && normalizar(t).startsWith(nuevoTitulo.slice(0, 25))) return false; // repite el título
  return true;
}
// Corta en el final de la última frase completa que quepa; si no hay, en la última palabra, con "…"
function cortarFrase(texto, max) {
  const t = String(texto || '').trim();
  if (t.length <= max) return t;
  const trozo = t.slice(0, max);
  const frase = /^([\s\S]{60,}?[.!?…]["”»)]?)(?=\s|$)(?![\s\S]*?[.!?…]["”»)]?(?=\s|$))/.exec(trozo);
  if (frase) return frase[1].trim();
  const corte = trozo.replace(/\s+\S*$/, '').replace(/[\s,;:—–-]+$/, '');
  return (corte || trozo.trim()) + '…';
}
function extractoDe(post, max = 160) {
  if (extractoBueno(post.excerpt, post.title)) return cortarFrase(String(post.excerpt).trim(), Math.max(max, 220));
  const base = textoPlano(sinTituloRepetido(post.content, post.title));
  return cortarFrase(base || textoPlano(post.excerpt) || post.title || '', max);
}

function postPage(post, seccion, anterior, siguiente) {
  const url = `${SITE_URL}${seccion.urlBase}/${post.slug}.html`;
  const title = `${post.title} – MoneyPilot`;
  const desc = cortarFrase(extractoDe(post), 160);
  const esInversion = seccion.key === 'tesis' || seccion.key === 'bolsa';
  const esGuia = seccion.key === 'guia';
  const categoria = post.category || (esGuia ? (NOMBRES_FASE[post.fase] || 'Guía') : 'General');
  const autor = post.author || 'Equipo MoneyPilot';

  const ctaLibro = `<div class="cta soft">¿Quieres aprender más? Puedes encontrar <a href="/recursos-y-libros.html">aquí algunos libros seleccionados</a> para empezar desde 0 y aprender a administrar tu propio dinero.</div>`;
  const disclaimer = `<div class="disclaimer">⚠️ Contenido meramente informativo y educativo, generado con apoyo de inteligencia artificial. No constituye asesoramiento ni recomendación de inversión personalizada. Antes de invertir, valora tu situación con un profesional cualificado.</div>`;

  // En tesis/bolsa el disclaimer legal + el CTA de libro se mantienen fijos siempre.
  // En el resto de secciones se usa la llamada a la acción que se eligió en el panel.
  const ctaBlock = esInversion ? (disclaimer + ctaLibro) : ctaHtml(post);

  const pager = (anterior || siguiente) ? `<nav class="pager" aria-label="Más artículos">
    ${anterior ? `<a class="prev" href="${seccion.urlBase}/${anterior.slug}.html"><small>← Anterior</small>${escHtml(anterior.title)}</a>` : ''}
    ${siguiente ? `<a class="next" href="${seccion.urlBase}/${siguiente.slug}.html"><small>Siguiente →</small>${escHtml(siguiente.title)}</a>` : ''}
  </nav>` : '';

  const meta = esGuia
    ? `Por ${escHtml(autor)} · ${minutosLectura(post.content)} min de lectura`
    : `Por ${escHtml(autor)} · ${fmtFecha(post.created_at)} · ${minutosLectura(post.content)} min de lectura`;

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
${jsonLd({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "datePublished": post.created_at,
    "dateModified": post.updated_at || post.created_at,
    "author": { "@type": "Person", "name": autor },
    "publisher": { "@type": "Organization", "name": "MoneyPilot", "logo": { "@type": "ImageObject", "url": `${SITE_URL}/apple-touch-icon.png` } },
    "mainEntityOfPage": url,
    "image": `${SITE_URL}/og-image.png`,
    "inLanguage": "es",
    "description": desc
  })}
</script>
<script type="application/ld+json">
${jsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": `${SITE_URL}/` },
      { "@type": "ListItem", "position": 2, "name": seccion.nombreTab, "item": `${SITE_URL}${seccion.urlBase}/index.html` },
      { "@type": "ListItem", "position": 3, "name": post.title, "item": url }
    ]
  })}
</script>
<style>${STYLE}</style>
</head>
<body>
${headerHtml('blog')}
<main>
  <p class="breadcrumb"><a href="/">Inicio</a> › <a href="${seccion.urlBase}/index.html">${escHtml(seccion.nombreTab)}</a></p>
  <article>
    <div class="article-cat">${escHtml(categoria)}</div>
    <h1>${escHtml(post.title)}</h1>
    <p class="meta">${meta}</p>
    <div class="prose">${mdToHtml(sinTituloRepetido(post.content, post.title))}</div>
    ${ctaBlock}
  </article>
  ${pager}
</main>
${FOOTER}
</body>
</html>`;
}

function tarjetaHtml(p, seccion) {
  return `
  <a class="card" href="${seccion.urlBase}/${p.slug}.html">
    <div class="emoji" aria-hidden="true">${escHtml(p.cover_emoji || '📊')}</div>
    <div>
      <div class="cat">${escHtml(p.category || 'General')}</div>
      <h2>${escHtml(p.title)}</h2>
      <p>${escHtml(extractoDe(p))}</p>
      <div class="by">${escHtml(p.author || 'Equipo MoneyPilot')} · ${fmtFecha(p.created_at)}</div>
    </div>
  </a>`;
}

// Índice normal: usado por bolsa, actualidad y tesis.
function indexPageCronologico(posts, seccion) {
  const items = posts.filter(p => p.slug).map(p => tarjetaHtml(p, seccion)).join('\n');
  return paginaBase(seccion, `
  <div class="eyebrow">Educación financiera</div>
  <h1>${escHtml(seccion.tituloIndex)}</h1>
  <p class="lead">${escHtml(seccion.descIndex)}</p>
  ${tabsHtml(seccion.key)}
  ${items ? `<div class="cards">${items}</div>` : '<div class="empty">Muy pronto publicaremos aquí nuevos artículos.</div>'}
  `, !items);
}

// Índice de la Guía: fases desplegables (1 a 5), igual que en la web.
function indexPageGuia(posts, seccion) {
  const porFase = {};
  for (const p of posts) {
    if (!p.slug) continue;
    const f = Number(p.fase) || 0;
    if (!porFase[f]) porFase[f] = [];
    porFase[f].push(p);
  }
  const fila = p => `
      <a class="fase-item" href="${seccion.urlBase}/${p.slug}.html">
        <strong>${escHtml(p.title)}</strong>
        <span>${escHtml(extractoDe(p))}</span>
      </a>`;

  const bloques = [1, 2, 3, 4, 5].map(n => {
    const lista = porFase[n] || [];
    return `
    <details class="fase" ${n === 1 ? 'open' : ''}>
      <summary>${escHtml(NOMBRES_FASE[n])}<span class="count">${lista.length} ${lista.length === 1 ? 'artículo' : 'artículos'}</span></summary>
      <div class="fase-items">${lista.length ? lista.map(fila).join('\n') : '<p class="fase-vacia">Todavía no hay artículos en esta fase.</p>'}</div>
    </details>`;
  }).join('\n');

  const sinFase = porFase[0] || [];
  return paginaBase(seccion, `
  <div class="eyebrow">Educación financiera</div>
  <h1>${escHtml(seccion.tituloIndex)}</h1>
  <p class="lead">${escHtml(seccion.descIndex)}</p>
  ${tabsHtml(seccion.key)}
  ${bloques}
  ${sinFase.length ? `<h2 style="font-family:var(--serif);color:var(--strong);margin:28px 0 12px;">Otros artículos de la guía</h2><div class="cards">${sinFase.map(p => tarjetaHtml(p, seccion)).join('\n')}</div>` : ''}
  `, !posts.some(p => p.slug));
}

function paginaBase(seccion, cuerpoHtml, sinContenido) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escHtml(seccion.tituloIndex)} – MoneyPilot</title>
<meta name="description" content="${escHtml(seccion.descIndex)}" />
<meta name="robots" content="${sinContenido ? 'noindex, follow' : 'index, follow'}" />
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
${headerHtml('blog')}
<main class="wide">
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

  // Orden de lectura para los botones anterior/siguiente. En la guía se lee fase a fase.
  const conSlug = posts.filter(p => p.slug);
  const lectura = seccion.key === 'guia'
    ? [...conSlug].sort((a, b) => (Number(a.fase) || 99) - (Number(b.fase) || 99))
    : conSlug;
  lectura.forEach((post, i) => {
    fs.writeFileSync(
      path.join(outDir, `${post.slug}.html`),
      postPage(post, seccion, lectura[i - 1] || null, lectura[i + 1] || null)
    );
  });
}

// Páginas fijas del sitio que siempre van en el sitemap.
const PAGINAS_FIJAS = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/recursos-y-libros.html', changefreq: 'monthly', priority: '0.7' },
  { loc: '/quienes-somos.html', changefreq: 'monthly', priority: '0.6' },
  { loc: '/contacto.html', changefreq: 'monthly', priority: '0.5' },
  { loc: '/privacidad.html', changefreq: 'yearly', priority: '0.3' },
  { loc: '/aviso-legal.html', changefreq: 'yearly', priority: '0.3' },
];

function fechaIso(d) {
  try { return new Date(d).toISOString().slice(0, 10); } catch (e) { return null; }
}

function generarSitemap(postsPorSeccion) {
  const urls = PAGINAS_FIJAS.map(p => ({ ...p }));
  for (const seccion of SECCIONES) {
    if (!SECCIONES_ACTIVAS.has(seccion.key)) continue; // sección vacía: fuera del sitemap
    urls.push({ loc: `${seccion.urlBase}/index.html`, changefreq: 'weekly', priority: '0.8' });
    for (const post of postsPorSeccion[seccion.key] || []) {
      if (!post.slug) continue;
      urls.push({
        loc: `${seccion.urlBase}/${post.slug}.html`,
        lastmod: fechaIso(post.updated_at || post.created_at),
        changefreq: 'monthly',
        priority: seccion.key === 'guia' ? '0.8' : '0.6',
      });
    }
  }
  const cuerpo = urls.map(u => [
    '  <url>',
    `    <loc>${SITE_URL}${u.loc}</loc>`,
    u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>` : null,
    `    <changefreq>${u.changefreq}</changefreq>`,
    `    <priority>${u.priority}</priority>`,
    '  </url>',
  ].filter(Boolean).join('\n')).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${cuerpo}\n</urlset>\n`;
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml);
  return urls.length;
}

async function main() {
  console.log('Generando páginas estáticas del blog…');
  const { data: posts, error } = await supa
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: true });

  if (error) {
    // Falla el build a propósito: así Vercel mantiene el despliegue anterior
    // (con su blog) en vez de publicar una web sin artículos sin avisarte.
    console.error('Error al leer posts de Supabase:', error.message);
    process.exit(1);
  }

  const postsSeguros = (posts || []).filter(p => {
    if (!p.slug || SLUG_VALIDO.test(p.slug)) return true;
    console.warn('⚠ Artículo omitido: slug no válido "' + p.slug + '" (solo letras, números, guion y guion bajo).');
    return false;
  });
  const todos = ordenar(postsSeguros);

  // Limpia lo generado en el build anterior (por si algún artículo se ha despublicado).
  fs.rmSync(BASE_DIR, { recursive: true, force: true });

  SECCIONES_ACTIVAS = new Set(SECCIONES
    .filter(sec => todos.some(p => p.slug && (p.categoria_seccion || 'actualidad') === sec.key))
    .map(sec => sec.key));

  const postsPorSeccion = {};
  for (const seccion of SECCIONES) {
    // Igual que la web: un artículo sin sección cuenta como "actualidad".
    const posts_de_seccion = todos.filter(p => (p.categoria_seccion || 'actualidad') === seccion.key);
    postsPorSeccion[seccion.key] = posts_de_seccion;
    generarSeccion(posts_de_seccion, seccion);
    console.log(`  ${seccion.key}: ${posts_de_seccion.length} artículo(s)`);
  }

  const total = generarSitemap(postsPorSeccion);
  console.log(`  sitemap.xml: ${total} URL(s)`);
  console.log('Listo.');
}

main().catch(err => {
  console.error('Error inesperado generando el blog:', err);
  process.exit(1);
});
