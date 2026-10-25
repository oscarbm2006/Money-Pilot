// MoneyPilot · Páginas independientes (Recursos y libros, Quiénes somos y blog)
// 1) Menú integrado con el fondo: mientras está sobre la banda oscura de arriba (.e-cab) tiene su mismo color;
//    al pasar a la zona clara se pone <html class="e-menu-claro"> y el menú toma el fondo claro de la página.
//    Si la página no tiene banda oscura (por ejemplo, un artículo del blog), el menú es claro desde el principio.
// 2) Los enlaces del menú con data-vista abren la app directamente en ese apartado.
(function () {
  var d = document, raiz = d.documentElement;
  var banda = d.querySelector('.e-cab');
  if (!banda || !('IntersectionObserver' in window)) {
    raiz.classList.add('e-menu-claro');
  } else {
    new IntersectionObserver(function (entradas) {
      raiz.classList.toggle('e-menu-claro', !entradas[0].isIntersecting);
    }, { rootMargin: '-64px 0px 0px 0px' }).observe(banda);
  }
  d.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[data-vista]') : null;
    if (a) { try { localStorage.setItem('salud-financiera:ultima-vista', a.getAttribute('data-vista')); } catch (err) {} }
  });
})();

// 3) Barra lateral de progreso, igual que en la app (src/progreso-lateral.js): cuánto llevas leído,
//    un punto por apartado (títulos h2 de <main>) y una barra fina arriba en pantallas estrechas.
(function () {
  // Si la página no tiene <main> (Recursos y libros), se usa todo el <body>
  var d = document, main = d.querySelector('main') || d.body;
  var menos = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var movil = d.createElement('div'); movil.className = 'pl-movil'; movil.setAttribute('aria-hidden', 'true');
  var movilRelleno = d.createElement('span'); movil.appendChild(movilRelleno);
  var nav = d.createElement('nav'); nav.className = 'pl-lateral'; nav.setAttribute('aria-label', 'Progreso de la página');
  var pct = d.createElement('span'); pct.className = 'pl-pct'; pct.setAttribute('aria-hidden', 'true');
  var pista = d.createElement('div'); pista.className = 'pl-pista';
  var relleno = d.createElement('span'); relleno.className = 'pl-relleno'; pista.appendChild(relleno);
  var resto = d.createElement('span'); resto.className = 'pl-resto'; resto.setAttribute('aria-hidden', 'true');
  nav.appendChild(pct); nav.appendChild(pista); nav.appendChild(resto);
  d.body.appendChild(movil); d.body.appendChild(nav);
  var apartados = [];

  function alto() { return d.documentElement.scrollHeight - window.innerHeight; }
  function construir() {
    apartados.forEach(function (a) { a.boton.remove(); });
    apartados = [];
    var total = alto();
    var visible = total >= 200;
    nav.style.display = visible ? '' : 'none'; movil.style.display = visible ? '' : 'none';
    if (!visible) return;
    var ultimo = -1;
    // Apartados: los h2; en páginas sin h2 (textos legales), los h3
    var titulos = main.querySelectorAll('h2');
    if (!titulos.length) titulos = main.querySelectorAll('h3');
    Array.prototype.forEach.call(titulos, function (h) {
      if (nav.contains(h)) return;
      var texto = h.innerText.trim().replace(/\s+/g, ' ');
      if (!texto || h.offsetParent === null) return;
      var pos = Math.max(0, Math.min(1, (h.getBoundingClientRect().top + window.scrollY - 120) / total));
      if (ultimo >= 0 && pos - ultimo <= 0.03) return;
      ultimo = pos;
      var b = d.createElement('button');
      b.type = 'button'; b.className = 'pl-punto'; b.style.top = pos * 100 + '%';
      b.setAttribute('aria-label', 'Ir a: ' + texto);
      var etiqueta = d.createElement('span'); etiqueta.className = 'pl-etiqueta'; etiqueta.textContent = texto;
      b.appendChild(etiqueta);
      b.addEventListener('click', function () { h.scrollIntoView({ behavior: menos ? 'auto' : 'smooth', block: 'start' }); });
      pista.appendChild(b);
      apartados.push({ boton: b, pos: pos });
    });
    medir();
  }
  function medir() {
    var total = alto(), p = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0, n = Math.round(p * 100), actual = -1;
    relleno.style.transform = 'scaleY(' + p + ')'; movilRelleno.style.transform = 'scaleX(' + p + ')';
    pct.textContent = n + '%'; resto.textContent = n >= 99 ? 'Final' : 'Queda ' + (100 - n) + '%';
    apartados.forEach(function (a, i) { if (p + 0.002 >= a.pos) actual = i; });
    apartados.forEach(function (a, i) {
      a.boton.className = 'pl-punto' + (i === actual ? ' pl-punto-actual' : i < actual ? ' pl-punto-pasado' : '');
      if (i === actual) a.boton.setAttribute('aria-current', 'location'); else a.boton.removeAttribute('aria-current');
    });
  }
  var t = 0;
  function recalcular() { clearTimeout(t); t = setTimeout(construir, 150); }
  window.addEventListener('scroll', medir, { passive: true });
  window.addEventListener('resize', recalcular);
  window.addEventListener('load', recalcular);
  if ('MutationObserver' in window) new MutationObserver(function (cambios) {
    // Los cambios dentro de la propia barra no cuentan (si no, se recalcularía sin parar)
    var propios = cambios.every(function (c) { return nav.contains(c.target) || movil.contains(c.target); });
    if (!propios) recalcular();
  }).observe(main, { childList: true, subtree: true });
  construir();
})();
