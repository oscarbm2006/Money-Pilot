// api/generar-inversion.js
// Función serverless de Vercel. Recibe un ticker/tema, pide a Gemini que redacte
// un artículo de noticias de bolsa o una tesis de inversión (usando Google Search
// para basarse en datos actuales), y guarda el resultado en la tabla "posts" de
// Supabase con categoria_seccion = "inversion".
//
// Variables de entorno necesarias en Vercel (Project Settings → Environment Variables):
//   GEMINI_API_KEY        -> tu clave de Google AI Studio
//   SUPABASE_URL             -> https://yhxebtkxagxowrvrqssf.supabase.co
//   SUPABASE_SERVICE_KEY   -> la "service_role" key de Supabase (NO la anon key)
//                              (Project Settings -> API -> service_role, en Supabase)
//   ADMIN_PANEL_PASSWORD   -> una contraseña que tú eliges, para proteger el panel

const { createClient } = require('@supabase/supabase-js');

function slugify(texto) {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Protección simple con contraseña para que no cualquiera pueda disparar generaciones
  const { password, tema, tipo } = req.body || {};
  if (!password || password !== process.env.ADMIN_PANEL_PASSWORD) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }
  if (!tema || typeof tema !== 'string') {
    return res.status(400).json({ error: 'Falta el ticker o tema' });
  }

  const esTesis = tipo === 'tesis';

  const prompt = esTesis
    ? `Escribe una tesis de inversión detallada y bien fundamentada sobre: "${tema}".
Usa datos actuales y recientes (precio, métricas financieras clave, catalizadores, riesgos).
Estructura el texto con subtítulos usando "## " al inicio de cada línea de subtítulo (por ejemplo "## Contexto y catalizadores").
Usa listas con "- " cuando enumeres puntos. No uses markdown de negrita excepto "**palabra**" si de verdad hace falta.
Incluye al final un apartado "## Riesgos a considerar".
No des consejos personalizados de compra/venta, preséntalo como análisis informativo.
Escribe en español, tono profesional pero claro, unas 500-700 palabras.`
    : `Escribe un artículo de noticias de bolsa sobre: "${tema}".
Basado en la información más reciente disponible. Estructura con subtítulos "## " y listas "- " donde aporte claridad.
Escribe en español, tono periodístico claro, unas 400-600 palabras.
Incluye un primer párrafo resumen de lo más importante.`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ google_search: {} }],
        }),
      }
    );

    const geminiData = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error('Error de Gemini:', geminiData);
      return res.status(502).json({ error: 'Error al generar el contenido con Gemini', detalle: geminiData });
    }

    const contenido = geminiData?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('\n') || '';
    if (!contenido.trim()) {
      return res.status(502).json({ error: 'Gemini no devolvió contenido' });
    }

    // El título: primera línea del contenido si parece un título corto, si no, generamos uno simple
    const primeraLinea = contenido.split('\n').find(l => l.trim().length > 0) || tema;
    const title = primeraLinea.replace(/^#+\s*/, '').slice(0, 120) || `${esTesis ? 'Tesis de inversión' : 'Noticia'}: ${tema}`;
    const slugBase = slugify(title) || slugify(tema) || `inversion-${Date.now()}`;
    const slug = `${slugBase}-${Date.now().toString().slice(-5)}`;
    const excerpt = contenido.replace(/^#+\s*/gm, '').replace(/\n+/g, ' ').slice(0, 160);

    const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

    const { data, error } = await supa
      .from('posts')
      .insert({
        title,
        slug,
        content: contenido,
        excerpt,
        author: 'Equipo MoneyPilot',
        category: esTesis ? 'Tesis de inversión' : 'Noticias de bolsa',
        categoria_seccion: 'inversion',
        published: true,
        cover_emoji: esTesis ? '📊' : '📰',
      })
      .select()
      .single();

    if (error) {
      console.error('Error al guardar en Supabase:', error);
      return res.status(500).json({ error: 'Error al guardar el artículo', detalle: error.message });
    }

    return res.status(200).json({ ok: true, post: data });
  } catch (err) {
    console.error('Error inesperado:', err);
    return res.status(500).json({ error: 'Error inesperado', detalle: String(err) });
  }
};
