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
  const esGuia = tipo === 'guia';

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
    prompt = `Actúa como un redactor experto en educación financiera y SEO, escribiendo para el blog de MoneyPilot, una herramienta española.
TEMA: "${tema}"

REQUISITOS DE TONO Y AUDIENCIA:
- Lector: persona española de 25-45 años, sin formación financiera. 
- Tono: cercano, claro, conversacional, como si se lo explicaras a un amigo tomando un café. Cero jerga, cero robot, cero frases de "gurú".
- Nivel: divulgativo pero riguroso (datos reales aplicables a España).
- Aporta valor accionable. El lector debe saber qué paso dar al terminar.
- Incluye OBLIGATORIAMENTE un ejemplo numérico (con cifras en euros) que ilustre la idea central de forma práctica.

ESTRUCTURA FLEXIBLE Y ORGÁNICA (¡NO parezcas un bot!):
- Comienza con un título atractivo usando un solo "#" (ej: "# ${tema}").
- Sigue con un primer párrafo introductorio que empatice directamente con una duda o problema real del lector.
- ADAPTA LA ESTRUCTURA AL TEMA: No uses siempre la misma plantilla. Algunos temas piden un "paso a paso", otros "mitos vs realidades", y otros "errores comunes". Usa subtítulos "## " con naturalidad para guiar la lectura.
- Destaca en **negrita** 3 a 5 frases clave para facilitar el escaneo visual.
- CIERRE NATURAL: Tienes TOTALMENTE PROHIBIDO usar subtítulos como "## En resumen", "## Conclusión" o "## Para terminar". Cierra el artículo de forma orgánica y conversacional integrando el consejo final en el flujo del texto o invitando a la acción.

EXTENSIÓN: Máximo 400-500 palabras (Hazlo directo para no exceder el límite de tiempo del servidor).`;
  } else {
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

    let contenido = geminiData?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('\n') || '';
    if (!contenido.trim()) {
      return res.status(502).json({ error: 'Gemini no devolvió contenido' });
    }

    const lineas = contenido.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const primeraLinea = lineas[0] || '';
    
    let defaultPrefix = 'Noticia';
    if (esTesis) defaultPrefix = 'Tesis de inversión';
    if (esGuia) defaultPrefix = 'Guía Financiera';
    let title = `${defaultPrefix}: ${tema}`;
    
    if (primeraLinea.startsWith('# ')) {
      title = primeraLinea.replace(/^#\s*/, '').slice(0, 120);
      
      // NUEVA LÍNEA: Borramos el H1 del contenido para que no se duplique en la web
      contenido = contenido.replace(primeraLinea, '').trim();
    }

    const slugBase = slugify(title) || slugify(tema) || `inversion-${Date.now()}`;
    const slug = `${slugBase}-${Date.now().toString().slice(-5)}`;
    
    const excerpt = contenido.replace(/^#+\s*/gm, '').replace(/\n+/g, ' ').slice(0, 160);

    let category = 'Noticias de bolsa';
    let cover_emoji = '📰';
    let categoria_seccion = 'bolsa';
    let fase = null;
    if (esTesis) {
      category = 'Tesis de inversión';
      cover_emoji = '📊';
      categoria_seccion = 'tesis';
    } else if (esGuia) {
      category = 'Educación financiera'; 
      cover_emoji = '📚';
      categoria_seccion = 'guia';
      fase = 1;
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
        categoria_seccion,
        fase,
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
