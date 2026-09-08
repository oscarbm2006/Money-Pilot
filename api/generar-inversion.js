// api/generar-inversion.js
const { createClient } = require('@supabase/supabase-js');

function slugify(texto) {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { password, tema, tipo } = req.body || {};
  if (!password || password !== process.env.ADMIN_PANEL_PASSWORD) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }
  if (!tema || typeof tema !== 'string') {
    return res.status(400).json({ error: 'Falta el ticker o tema' });
  }

  const esTesis = tipo === 'tesis';

  // Le pedimos a la IA que siempre empiece con un Título Principal (# )
  const prompt = esTesis
    ? `Escribe un Resumen Ejecutivo profesional y detallado para una tesis de inversión sobre: "${tema}".
Comienza SIEMPRE el texto con un título principal usando un solo "#" (ejemplo: "# Análisis de inversión: ${tema}").
Luego, estructura el resto del texto con subtítulos usando "## ". Debes incluir obligatoriamente las siguientes secciones:
- ## Contexto macroeconómico y catalizadores
- ## Oportunidades y posicionamiento estratégico
- ## Riesgos a considerar

El tono debe ser de análisis financiero institucional: serio, objetivo y riguroso. PROHIBIDO usar lenguaje publicitario, sensacionalista, clickbait o frases de urgencia.
Extensión: alrededor de 400 palabras. 
Al final, añade de forma discreta una línea que diga: "El análisis completo, los modelos de valoración y la investigación detallada se desarrollan en el documento extendido de la tesis."`
    : `Escribe un artículo de noticias de bolsa sobre: "${tema}".
Comienza SIEMPRE el texto con un título principal usando un solo "#".
Basado en información reciente. Estructura con subtítulos "## " y listas "- ".
Escribe en español. El tono debe ser periodístico financiero, serio y objetivo (estilo Bloomberg o Reuters). PROHIBIDO usar clickbait o sensacionalismo.
Extensión: alrededor de 300 a 400 palabras. Incluye un primer párrafo resumen con lo más importante.`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
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

    // LÓGICA DE TÍTULO CORREGIDA
    // Buscamos la primera línea. Si es un título principal (# ), lo usamos. Si no, generamos uno limpio por defecto.
    const lineas = contenido.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const primeraLinea = lineas[0] || '';
    
    // Título por defecto en caso de que la IA se olvide del H1
    let title = `${esTesis ? 'Tesis de inversión' : 'Noticia'}: ${tema}`;
    
    // Si la IA hizo caso y puso un "# ", lo extraemos limpio
    if (primeraLinea.startsWith('# ')) {
      title = primeraLinea.replace(/^#\s*/, '').slice(0, 120);
    }

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
}
