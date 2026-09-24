function postPage(post, seccion) {
  const url = `${SITE_URL}${seccion.urlBase}/${post.slug}.html`;
  const title = `${post.title} – MoneyPilot`;
  const desc = (post.excerpt || post.title || '').slice(0, 160);
  const esInversion = seccion.key === 'tesis' || seccion.key === 'bolsa';

  const ctaDiagnostico = `<div class="cta">¿Quieres aplicar esto a tu propio caso? Usa el <a href="/">diagnóstico gratuito de MoneyPilot</a>.</div>`;
  const ctaLibro = `<div class="cta" style="background:var(--paper);border:1px solid var(--border);">¿Quieres aprender más? Puedes encontrar <a href="/recursos-y-libros.html">aquí algunos libros seleccionados</a> para empezar desde 0 y aprender a administrar tu propio dinero.</div>`;
  const disclaimer = `<div class="disclaimer">⚠️ Contenido meramente informativo y educativo, generado con apoyo de inteligencia artificial. No constituye asesoramiento ni recomendación de inversión personalizada. Antes de invertir, valora tu situación con un profesional cualificado.</div>`;

  let ctaBlock;
  if (esInversion) {
    ctaBlock = disclaimer + ctaLibro;
  } else {
    const ctaTipo = post.cta_tipo || 'diagnostico';
    if (ctaTipo === 'libro') ctaBlock = ctaLibro;
    else if (ctaTipo === 'ambos') ctaBlock = ctaDiagnostico + ctaLibro;
    else ctaBlock = ctaDiagnostico;
  }

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
</main>
${FOOTER}
</body>
</html>`;
}
