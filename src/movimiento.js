// Movimiento del rediseño 3D: aparición al hacer scroll, inclinación con el cursor y cifras que cuentan.
// No cambia ningún dato ni cálculo: solo añade o quita clases y estilos visuales.
// Todo respeta la opción del sistema "reducir movimiento".
const { useEffect, useRef } = React;

export function prefiereMenosMovimiento() {
  return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function esPantallaPequena() {
  return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(max-width: 720px)').matches;
}

// Un único observador para toda la web: pone "mp-visible" al entrar en pantalla y lo quita al salir.
let observador = null;
function obtenerObservador() {
  if (observador || typeof IntersectionObserver === 'undefined') return observador;
  observador = new IntersectionObserver(entradas => {
    entradas.forEach(e => e.target.classList.toggle('mp-visible', e.isIntersecting && e.intersectionRatio > 0.18));
  }, { threshold: [0, 0.18, 0.4] });
  return observador;
}

export function observarAparicion(el) {
  if (!el) return () => {};
  const obs = obtenerObservador();
  if (!obs || prefiereMenosMovimiento()) { el.classList.add('mp-visible'); return () => {}; }
  obs.observe(el);
  return () => obs.unobserve(el);
}

// Inclina el elemento siguiendo el cursor. "maximo" son los grados de giro en el borde.
export function inclinarConCursor(el, maximo = 14) {
  if (!el || prefiereMenosMovimiento()) return () => {};
  const mover = e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.transform = `rotateX(${(0.5 - y) * maximo}deg) rotateY(${(x - 0.5) * maximo}deg) translateZ(10px)`;
    el.style.setProperty('--mp-gx', x * 100 + '%');
    el.style.setProperty('--mp-gy', y * 100 + '%');
  };
  const salir = () => { el.style.transform = ''; };
  el.addEventListener('pointermove', mover);
  el.addEventListener('pointerleave', salir);
  return () => { el.removeEventListener('pointermove', mover); el.removeEventListener('pointerleave', salir); salir(); };
}

// Anima un número desde el valor que se ve ahora hasta "hasta". "formato" convierte el número en texto.
export function contarHasta(el, hasta, formato = v => String(Math.round(v)), duracion = 700) {
  if (!el) return;
  const desde = typeof el.__mpValor === 'number' ? el.__mpValor : 0;
  el.__mpValor = hasta;
  if (el.__mpRaf) cancelAnimationFrame(el.__mpRaf);
  if (prefiereMenosMovimiento()) { el.textContent = formato(hasta); return; }
  const t0 = performance.now();
  const paso = t => {
    const k = Math.min(1, (t - t0) / duracion), e = 1 - Math.pow(1 - k, 3);
    el.textContent = formato(desde + (hasta - desde) * e);
    if (k < 1) el.__mpRaf = requestAnimationFrame(paso);
  };
  el.__mpRaf = requestAnimationFrame(paso);
}

// Versiones para componentes React: devuelven una "ref" que se pone en el elemento.
export function useAparicion() {
  const ref = useRef(null);
  useEffect(() => observarAparicion(ref.current), []);
  return ref;
}

export function useInclinacion(maximo = 14) {
  const ref = useRef(null);
  useEffect(() => inclinarConCursor(ref.current, maximo), [maximo]);
  return ref;
}
