// api/posts-admin.js
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { password, action, id, cta_tipo } = req.body || {};
  if (!password || password !== process.env.ADMIN_PANEL_PASSWORD) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }

  const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  if (action === 'list') {
    const { data, error } = await supa
      .from('posts')
      .select('id, title, slug, categoria_seccion, cta_tipo, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) return res.status(500).json({ error: 'Error al listar', detalle: error.message });
    return res.status(200).json({ ok: true, posts: data });
  }

  if (action === 'update') {
    if (!id || !['diagnostico', 'libro', 'ambos'].includes(cta_tipo)) {
      return res.status(400).json({ error: 'Falta id o cta_tipo inválido' });
    }

    const { error } = await supa
      .from('posts')
      .update({ cta_tipo })
      .eq('id', id);

    if (error) return res.status(500).json({ error: 'Error al actualizar', detalle: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: 'Acción no reconocida' });
};
