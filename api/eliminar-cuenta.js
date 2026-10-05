// api/eliminar-cuenta.js
// Permite que una persona elimine SU PROPIA cuenta y todos sus datos.
// Requiere la sesión real del usuario (token de Supabase) y una confirmación explícita.
// Al borrar el usuario, la base de datos borra en cascada todo lo que tenía guardado.
const { createClient } = require('@supabase/supabase-js');

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'soportemoneypilot@gmail.com').toLowerCase();

function crearHandler(crearCliente) {
  return async function handler(req, res) {
    const responder = (codigo, objeto) => {
      res.statusCode = codigo;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(objeto));
    };

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return responder(405, { error: 'Método no permitido' });
    }

    const cabecera = (req.headers && req.headers.authorization) || '';
    const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7).trim() : '';
    if (!token) return responder(401, { error: 'Inicia sesión para eliminar tu cuenta.' });

    const cuerpo = req.body && typeof req.body === 'object' ? req.body : {};
    if (cuerpo.confirmar !== 'ELIMINAR') {
      return responder(400, { error: 'Falta la confirmación para eliminar la cuenta.' });
    }

    try {
      const supa = crearCliente();
      const { data, error } = await supa.auth.getUser(token);
      const user = data && data.user;
      if (error || !user) {
        return responder(401, { error: 'Sesión no válida o caducada. Vuelve a iniciar sesión.' });
      }
      if ((user.email || '').toLowerCase() === ADMIN_EMAIL) {
        return responder(403, { error: 'La cuenta de administrador no se puede eliminar desde la aplicación.' });
      }
      // Solo se borra el usuario dueño del token: el identificador nunca viene del cuerpo de la petición
      const { error: errorBorrado } = await supa.auth.admin.deleteUser(user.id);
      if (errorBorrado) {
        console.error('ELIMINAR-CUENTA fallo', JSON.stringify({ codigo: errorBorrado.status || errorBorrado.code || null }));
        return responder(500, { error: 'No se pudo eliminar la cuenta. Inténtalo de nuevo o escríbenos.' });
      }
      return responder(200, { ok: true });
    } catch (e) {
      console.error('ELIMINAR-CUENTA excepcion');
      return responder(500, { error: 'No se pudo eliminar la cuenta. Inténtalo de nuevo o escríbenos.' });
    }
  };
}

const handler = crearHandler(() =>
  createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
);

module.exports = handler;
module.exports.crearHandler = crearHandler;
