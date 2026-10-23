// functions/api/posts-admin.js
// Cloudflare Pages Functions: reutiliza api/posts-admin.js sin cambiarlo.
import { adaptar } from '../../lib/adaptador-cloudflare.mjs';
import handler from '../../api/posts-admin.js';

export const onRequest = adaptar(handler);
