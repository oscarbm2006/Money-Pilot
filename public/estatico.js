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
