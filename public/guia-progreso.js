/* Progreso de lectura de la guía (blog de MoneyPilot).
   Es un archivo externo porque la política de seguridad (CSP) no admite scripts en línea.
   Sin JavaScript las páginas se ven y funcionan igual: todo esto es una mejora progresiva.
   Qué guías has leído se guarda SOLO en este dispositivo (localStorage); no se envía a ningún sitio. */
(function () {
  'use strict';

  var CLAVE = 'salud-financiera:guia-leidos-v1';
  var ESPERA_MIN_MS = 10000; // una guía cuenta como leída al llegar al final, tras al menos 10 s en la página

  var elDatos = document.getElementById('guia-datos');
  if (!elDatos) return;
  var guias;
  try { guias = (JSON.parse(elDatos.textContent) || {}).guias; } catch (e) { return; }
  if (!guias || !guias.length) return;

  // Si no se puede guardar (p. ej. navegación privada estricta) no se muestra nada: mejor no aparentar un progreso que se pierde
  try { localStorage.setItem('__mp_prueba', '1'); localStorage.removeItem('__mp_prueba'); } catch (e) { return; }

  var porSlug = {};
  guias.forEach(function (g, i) { porSlug[g.s] = { i: i, t: g.t, m: Number(g.m) || 1, u: g.u }; });

  function q(raiz, sel) { return raiz.querySelector(sel); }
  function plural(n, uno, varios) { return n + ' ' + (n === 1 ? uno : varios); }
  function txtMin(m) {
    if (m < 60) return m + ' min';
    var h = Math.floor(m / 60), r = m % 60;
    return h + ' h' + (r ? ' ' + r + ' min' : '');
  }

  /* ---------- Estado (guías leídas) ---------- */
  function leidas() {
    var v;
    try { v = JSON.parse(localStorage.getItem(CLAVE) || '[]'); } catch (e) { v = []; }
    var set = {};
    (Array.isArray(v) ? v : []).forEach(function (s) { if (porSlug[s]) set[s] = true; }); // se ignoran guías que ya no existen
    return set;
  }
  function guardar(set) {
    try { localStorage.setItem(CLAVE, JSON.stringify(Object.keys(set))); } catch (e) { /* sin espacio o bloqueado */ }
  }
  function resumen(set) {
    var n = 0, min = 0, sig = null;
    guias.forEach(function (g) {
      if (set[g.s]) { n++; } else { min += Number(g.m) || 1; if (!sig) sig = g; }
    });
    return { n: n, total: guias.length, pct: Math.round(n / guias.length * 100), min: min, sig: sig };
  }

  /* ---------- Aviso breve (toast) ---------- */
  var avisoEl = null, avisoT = 0;
  function aviso(texto) {
    if (!avisoEl) {
      avisoEl = document.createElement('div');
      avisoEl.className = 'gp-aviso';
      avisoEl.setAttribute('role', 'status');
      document.body.appendChild(avisoEl);
    }
    avisoEl.textContent = texto;
    avisoEl.hidden = false;
    // Reinicia la animación de entrada si ya estaba visible
    avisoEl.style.animation = 'none'; void avisoEl.offsetWidth; avisoEl.style.animation = '';
    clearTimeout(avisoT);
    avisoT = setTimeout(function () { avisoEl.hidden = true; }, 3800);
  }

  /* ---------- Pintar: página índice de la guía ---------- */
  function pintarIndice(panel, set, r) {
    var falt = r.total - r.n;
    q(panel, '.gp-titulo').textContent = falt === 0
      ? 'Has completado toda la guía'
      : 'Has leído ' + r.n + ' de ' + plural(r.total, 'guía', 'guías');
    q(panel, '.gp-pct').textContent = r.pct + ' %';
    q(panel, '.gp-barra').setAttribute('aria-valuenow', String(r.pct));
    q(panel, '.gp-relleno').style.transform = 'scaleX(' + (r.n / r.total) + ')';
    q(panel, '.gp-resto').textContent = falt === 0
      ? 'Puedes repasar cualquiera cuando quieras.'
      : (r.n === 0 ? plural(r.total, 'guía', 'guías') + ' en total' : 'Te quedan ' + plural(falt, 'guía', 'guías')) +
        ' · ' + txtMin(r.min) + ' de lectura';

    var c = q(panel, '.gp-continuar');
    if (r.sig) {
      c.hidden = false;
      c.href = r.sig.u;
      c.textContent = (r.n === 0 ? 'Empezar por «' : 'Continuar con «') + r.sig.t + '»';
    } else {
      c.hidden = true;
    }

    // Marca cada guía leída (con texto solo para lectores de pantalla)
    [].forEach.call(document.querySelectorAll('a[data-slug]'), function (a) {
      var leida = !!set[a.getAttribute('data-slug')];
      a.classList.toggle('leida', leida);
      var titulo = a.querySelector('strong, h2');
      if (!titulo) return;
      var sr = titulo.querySelector('.sr-solo');
      if (leida && !sr) {
        sr = document.createElement('span');
        sr.className = 'sr-solo';
        sr.textContent = 'Leída. ';
        titulo.insertBefore(sr, titulo.firstChild);
      } else if (!leida && sr) {
        titulo.removeChild(sr);
      }
    });

    // Contador de cada fase: «2 de 6 leídas»
    [].forEach.call(document.querySelectorAll('details.fase'), function (d) {
      var items = d.querySelectorAll('a[data-slug]'), n = 0;
      [].forEach.call(items, function (a) { if (set[a.getAttribute('data-slug')]) n++; });
      var cuenta = d.querySelector('.count');
      if (!cuenta) return;
      if (cuenta.getAttribute('data-orig') === null) cuenta.setAttribute('data-orig', cuenta.textContent);
      cuenta.textContent = n > 0 ? n + ' de ' + items.length + ' leídas' : cuenta.getAttribute('data-orig');
      d.classList.toggle('fase-completa', items.length > 0 && n === items.length);
    });

    panel.hidden = false;
  }

  /* ---------- Pintar: página de un artículo ---------- */
  function pintarArticulo(art, set, r) {
    var slug = art.getAttribute('data-guia-slug'), info = porSlug[slug];
    var est = document.getElementById('guia-estado');
    if (!info || !est) return;
    var leida = !!set[slug];
    q(est, '.gp-mini-txt').textContent = 'Guía ' + (info.i + 1) + ' de ' + r.total + ' · Llevas ' + r.n + ' leídas (' + r.pct + ' %)';
    q(est, '.gp-barra').setAttribute('aria-valuenow', String(r.pct));
    q(est, '.gp-relleno').style.transform = 'scaleX(' + (r.n / r.total) + ')';
    var b = q(est, '.gp-toggle');
    b.textContent = leida ? '✓ Leída · quitar' : 'Marcar como leída';
    b.setAttribute('aria-pressed', leida ? 'true' : 'false');
    est.hidden = false;
  }

  function pintar() {
    var set = leidas(), r = resumen(set);
    var panel = document.getElementById('guia-progreso');
    if (panel) pintarIndice(panel, set, r);
    var art = document.querySelector('[data-guia-slug]');
    if (art) pintarArticulo(art, set, r);
  }

  /* ---------- Acciones (solo en la página de un artículo) ---------- */
  var art = document.querySelector('[data-guia-slug]');
  if (art) {
    var slug = art.getAttribute('data-guia-slug');

    var marcar = function (valor) {
      var set = leidas(), ya = !!set[slug];
      if (valor === ya) return;
      if (valor) set[slug] = true; else delete set[slug];
      guardar(set);
      pintar();
      var r = resumen(set);
      aviso(!valor ? 'Guía quitada de las leídas'
        : (r.n === r.total ? '¡Has completado toda la guía!' : 'Guía leída ✓ · llevas ' + r.n + ' de ' + r.total));
    };

    var btn = document.querySelector('#guia-estado .gp-toggle');
    if (btn) btn.addEventListener('click', function () { marcar(!leidas()[slug]); });

    // Lectura automática: al llegar al final del texto (y llevando al menos ESPERA_MIN_MS en la página)
    var fin = document.getElementById('guia-fin');
    if (fin && 'IntersectionObserver' in window) {
      var t0 = Date.now(), visible = false, timer = 0;
      var io = new IntersectionObserver(function (es) {
        visible = es[es.length - 1].isIntersecting;
        clearTimeout(timer);
        if (visible && !leidas()[slug]) {
          timer = setTimeout(function () { if (visible) marcar(true); }, Math.max(0, ESPERA_MIN_MS - (Date.now() - t0)));
        }
      });
      io.observe(fin);
    }
  }

  pintar();
  // Si cambia en otra pestaña, o se vuelve a esta página con el botón «Atrás» (caché del navegador), se actualiza
  window.addEventListener('storage', function (e) { if (e.key === CLAVE) pintar(); });
  window.addEventListener('pageshow', function (e) { if (e.persisted) pintar(); });
})();
