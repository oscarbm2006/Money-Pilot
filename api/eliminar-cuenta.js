// functions/api/eliminar-cuenta.js
// Cloudflare Pages Functions: reutiliza api/eliminar-cuenta.js sin cambiarlo.
import { adaptar } from '../../lib/adaptador-cloudflare.mjs';
import handler from '../../api/eliminar-cuenta.js';

export const onRequest = adaptar(handler);
