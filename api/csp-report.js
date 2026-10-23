// api/csp-report.js
// Recibe los avisos de la política de seguridad (CSP) que envía el navegador y los deja
// en el registro de Vercel (Logs). No bloquea nada ni guarda datos de usuarios.
const MAX_BYTES = 10000;

async function leerCuerpo(req) {
  let cuerpo;
  try {
    cuerpo = req.body; // Vercel puede entregar el cuerpo ya leído
  } catch (e) {
    return null;
  }
  if (cuerpo === undefined || cuerpo === null) {
    const trozos = [];
    let total = 0;
    for await (const t of req) {
      total += t.length;
      if (total > MAX_BYTES) return null;
      trozos.push(t);
    }
    cuerpo = Buffer.concat(trozos);
  }
  if (Buffer.isBuffer(cuerpo)) cuerpo = cuerpo.toString('utf8');
  if (typeof cuerpo === 'string') {
    if (cuerpo.length > MAX_BYTES) return null;
    try {
      return JSON.parse(cuerpo);
    } catch (e) {
      return null;
    }
  }
  return cuerpo;
}

const corto = v => String(v === undefined || v === null ? '' : v).slice(0, 200);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.end();
    return;
  }
  try {
    const datos = await leerCuerpo(req);
    const lista = Array.isArray(datos) ? datos : datos ? [datos] : [];
    lista.slice(0, 5).forEach(item => {
      const r = (item && (item['csp-report'] || item.body)) || item || {};
      // JSON.stringify evita que un texto con saltos de línea falsee el registro
      console.warn('CSP-REPORTE ' + JSON.stringify({
        directiva: corto(r['effective-directive'] || r['violated-directive'] || r.effectiveDirective),
        bloqueado: corto(r['blocked-uri'] || r.blockedURL),
        pagina: corto(r['document-uri'] || r.documentURL),
        archivo: corto(r['source-file'] || r.sourceFile),
        linea: corto(r['line-number'] || r.lineNumber)
      }));
    });
  } catch (e) {
    // Un aviso mal formado se ignora: este endpoint nunca debe fallar
  }
  res.statusCode = 204;
  res.end();
};
