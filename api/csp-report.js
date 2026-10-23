// functions/api/csp-report.js
// Cloudflare Pages Functions: reutiliza api/csp-report.js sin cambiarlo.
import { adaptar } from '../../lib/adaptador-cloudflare.mjs';
import handler from '../../api/csp-report.js';

export const onRequest = adaptar(handler);
