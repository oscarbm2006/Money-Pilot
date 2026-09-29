// lib/verificar-admin.js
// Comprueba que quien llama a la API es el administrador, usando su sesión real
// de MoneyPilot (token de Supabase) en lugar de una contraseña compartida.
const { createClient } = require('@supabase/supabase-js');

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'soportemoneypilot@gmail.com').toLowerCase();

// Solo se admiten enlaces internos ("/...") o https://. Bloquea "javascript:" y similares.
function urlSegura(u) {
  const limpia = (u || '').trim();
  return /^(\/(?!\/)|https:\/\/)/.test(limpia) ? limpia : '/';
}

async function verificarAdmin(req) {
  const cabecera = req.headers.authorization || '';
  const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7).trim() : '';
  if (!token) {
    return { ok: false, status: 401, error: 'Inicia sesión como administrador' };
  }

  const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supa.auth.getUser(token);
  const user = data && data.user;
  if (error || !user) {
    return { ok: false, status: 401, error: 'Sesión no válida o caducada. Vuelve a iniciar sesión.' };
  }

  const email = (user.email || '').toLowerCase();
  if (email !== ADMIN_EMAIL || !user.email_confirmed_at) {
    return { ok: false, status: 403, error: 'No tienes permiso para usar este panel' };
  }

  return { ok: true, supa, user };
}

module.exports = { verificarAdmin, urlSegura };
