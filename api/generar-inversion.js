// functions/api/generar-inversion.js
// Cloudflare Pages Functions: reutiliza api/generar-inversion.js sin cambiarlo.
import { adaptar } from '../../lib/adaptador-cloudflare.mjs';
import handler from '../../api/generar-inversion.js';

export const onRequest = adaptar(handler);
