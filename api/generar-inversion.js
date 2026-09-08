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

  // Ahora reconocemos 3 tipos: tesis, guia, o noticia
  const esTesis = tipo === 'tesis';
  const esGuia = tipo === 'guia';

  // Lógica de instrucciones (Prompts) según el tipo
  let prompt = '';
  
  if (esTesis) {
    prompt = `Escribe un Resumen Ejecutivo profesional y detallado para una tesis de inversión sobre: "${tema}".
Comienza SIEMPRE el texto con un título principal usando un solo "#" (ejemplo: "# Análisis de inversión: ${tema}").
Luego, estructura el texto con subtítulos usando "## ". Debes incluir:
- ## Contexto macroeconómico y catalizadores
- ## Oportunidades y posicionamiento estratégico
- ## Riesgos a considerar
El tono debe ser de análisis financiero institucional: serio, objetivo y riguroso. PROHIBIDO usar lenguaje publicitario o sensacionalista.
Extensión: alrededor de 400 palabras. 
Al final, añade: "El análisis completo, los modelos de valoración y la investigación detallada se desarrollan en el documento extendido de la tesis."`;
  } else if (esGuia) {
    prompt = `Escribe una Guía de Educación Financiera completa, clara y didáctica sobre: "${tema}".
Comienza SIEMPRE el texto con un título principal usando un solo "#" (ejemplo: "# Guía Financiera: ${tema}").
Luego, estructura el texto paso a paso usando subtítulos "## ". 
El tono debe ser educativo, accesible y motivador. Explica los conceptos como si fueras un profesor experto pero cercano. Utiliza alguna analogía o ejemplo práctico sencillo para que cualquier persona pueda entenderlo.
Extensión: alrededor de 400 a 500 palabras.`;
  } else {
    // Si no es tesis ni guía, asumimos que es noticia
    prompt = `Escribe un artículo de noticias de bolsa sobre: "${tema}".
Comienza SIEMPRE el texto con un título principal usando un solo "#".
Basado en información reciente. Estructura con subtítulos "## " y listas "- ".
Escribe en español. El tono debe ser periodístico financiero, serio y objetivo (estilo Bloomberg o Reuters). PROHIBIDO usar clickbait.
Extensión: alrededor de 300 a 400 palabras. Incluye un primer párrafo resumen con lo más importante.`;
  }

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

    // Buscamos la primera línea para el título
    const lineas = contenido.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const primeraLinea = lineas[0] || '';
    
    // Título por defecto según la categoría
    let defaultPrefix = 'Noticia';
    if (esTesis) defaultPrefix = 'Tesis de inversión';
    if (esGuia) defaultPrefix = 'Guía Financiera';
    let title = `${defaultPrefix}: ${tema}`;
    
    // Si la IA puso un "# ", lo extraemos limpio
    if (primeraLinea.startsWith('# ')) {
      title = primeraLinea.replace(/^#\s*/, '').slice(0, 120);
    }

    const slugBase = slugify(title) || slugify(tema) || `inversion-${Date.now()}`;
    const slug = `${slugBase}-${Date.now().toString().slice(-5)}`;
    const excerpt = contenido.replace(/^#+\s*/gm, '').replace(/\n+/g, ' ').slice(0, 160);

    // Asignar categoría y emoji según el tipo
    let category = 'Noticias de bolsa';
    let cover_emoji = '📰';
    if (esTesis) {
      category = 'Tesis de inversión';
      cover_emoji = '📊';
    } else if (esGuia) {
      category = 'Educación Financiera';
      cover_emoji = '📚';
    }

    const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

    const { data, error } = await supa
      .from('posts')
      .insert({
        title,
        slug,
        content: contenido,
        excerpt,
        author: 'Equipo MoneyPilot',
        category: category,
        categoria_seccion: 'inversion', 
        published: true,
        cover_emoji: cover_emoji,
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
