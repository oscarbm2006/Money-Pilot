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

  // NUEVAS INSTRUCCIONES: MODO PERSUASIVO Y GANCHO (COPYWRITING)
  const prompt = esTesis
    ? `Escribe un "gancho" persuasivo y atrapante para una tesis de inversión sobre: "${tema}". 
El objetivo es captar la atención del lector destacando el mayor potencial, el catalizador más importante o el dato más rompedor. 
Escribe en español, tono profesional pero generando mucha curiosidad (copywriting financiero). 
Termina SIEMPRE el texto con una frase que invite a la acción, como por ejemplo: "Haz clic aquí para leer la tesis completa y descubrir los riesgos ocultos". 
Hazlo muy conciso y directo, máximo 150 a 200 palabras.`
    : `Escribe un avance periodístico (teaser) muy atractivo sobre esta noticia de bolsa: "${tema}". 
Destaca lo más urgente, cómo impacta al mercado y por qué el inversor debería prestar atención ahora mismo. Genera intriga.
Escribe en español, tono periodístico persuasivo y rápido. 
Termina SIEMPRE con un llamado a la acción claro, por ejemplo: "Lee el reporte completo para saber cómo posicionarte". 
Hazlo muy conciso, máximo 150 a 200 palabras.`;

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
