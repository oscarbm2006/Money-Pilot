  (function () {
    var d = document;
    // 1) Menú: al volver a la app abre directamente el apartado elegido
    d.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[data-vista]') : null;
      if (a) { try { localStorage.setItem('salud-financiera:ultima-vista', a.getAttribute('data-vista')); } catch (err) {} }
      var b = e.target.closest ? e.target.closest('.why-toggle') : null;
      if (b) { var open = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', open); b.nextElementSibling.classList.toggle('open', open); }
    });
    var cards = [].slice.call(d.querySelectorAll('.card'));
    // 2) Aparición al hacer scroll
    if ('IntersectionObserver' in window) {
      var ro = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); ro.unobserve(x.target); } }); }, { threshold: 0.12 });
      cards.forEach(function (c) { ro.observe(c); });
    } else { cards.forEach(function (c) { c.classList.add('in'); }); }
    // 3) Brillo que sigue al cursor
    cards.forEach(function (c) {
      c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
    });
    // 4) Ruta de lectura: resalta el bloque que estás viendo
    var stops = [].slice.call(d.querySelectorAll('.path-stop')), blocks = [].slice.call(d.querySelectorAll('section.block[id^="bloque-"]'));
    if ('IntersectionObserver' in window) {
      var so = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { stops.forEach(function (s) { s.classList.toggle('active', s.getAttribute('href') === '#' + x.target.id); }); } }); }, { rootMargin: '-30% 0px -60% 0px' });
      blocks.forEach(function (b) { so.observe(b); });
    }
    // 5) Buscador en vivo
    var q = d.getElementById('q'), empty = d.getElementById('empty');
    function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
    q.addEventListener('input', function () {
      var t = norm(q.value.trim()), total = 0;
      blocks.forEach(function (b) {
        var n = 0;
        [].forEach.call(b.querySelectorAll('.card'), function (c) { var ok = !t || norm(c.textContent).indexOf(t) !== -1; c.classList.toggle('is-hidden', !ok); if (ok) { n++; c.classList.add('in'); } });
        b.classList.toggle('is-hidden', n === 0); total += n;
      });
      empty.classList.toggle('show', total === 0);
    });
  })();
