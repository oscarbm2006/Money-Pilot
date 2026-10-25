// Barra lateral de progreso: muestra cuánto llevas leído de la página y un punto por cada apartado
// (los títulos h2 de la página). El apartado en el que estás se resalta; al pasar el ratón por un
// punto se ve su nombre y al pulsarlo se baja hasta él. En móvil se queda en una barra fina arriba.
const { useState, useEffect } = React;
import { prefiereMenosMovimiento } from './movimiento.js';

const el = React.createElement;

function leerApartados() {
  const alto = document.documentElement.scrollHeight - window.innerHeight;
  if (alto <= 0) return [];
  return [...document.querySelectorAll("main h2")]
    .filter(h => h.offsetParent !== null && h.innerText.trim())
    .map(h => {
      const y = h.getBoundingClientRect().top + window.scrollY - 120;
      // innerText respeta los saltos entre líneas de los titulares partidos en varias líneas
      return { nodo: h, texto: h.innerText.trim().replace(/\s+/g, " "), pos: Math.max(0, Math.min(1, y / alto)) };
    })
    // Dos títulos muy juntos se pisarían en la barra: se queda el primero
    .filter((a, i, lista) => i === 0 || a.pos - lista[i - 1].pos > 0.03);
}

export function ProgresoLateral({ vista }) {
  const [progreso, setProgreso] = useState(0);
  const [apartados, setApartados] = useState([]);
  const [actual, setActual] = useState(-1);

  // Los apartados cambian con la página y con el contenido que se abre o se carga después
  useEffect(() => {
    let t = 0;
    const recalcular = () => { clearTimeout(t); t = setTimeout(() => setApartados(leerApartados()), 150); };
    recalcular();
    const tarde = setTimeout(recalcular, 1200);
    const main = document.querySelector("main");
    const mo = main ? new MutationObserver(recalcular) : null;
    if (mo) mo.observe(main, { childList: true, subtree: true });
    window.addEventListener("resize", recalcular);
    return () => { clearTimeout(t); clearTimeout(tarde); if (mo) mo.disconnect(); window.removeEventListener("resize", recalcular); };
  }, [vista]);

  // Se mide en cada evento de scroll: es un cálculo muy ligero y así no depende de requestAnimationFrame,
  // que el navegador pausa en las pestañas en segundo plano.
  useEffect(() => {
    const medir = () => {
      const alto = document.documentElement.scrollHeight - window.innerHeight;
      const p = alto > 0 ? Math.min(1, Math.max(0, window.scrollY / alto)) : 0;
      setProgreso(p);
      let i = -1;
      apartados.forEach((a, k) => { if (p + 0.002 >= a.pos) i = k; });
      setActual(i);
    };
    medir();
    window.addEventListener("scroll", medir, { passive: true });
    return () => window.removeEventListener("scroll", medir);
  }, [apartados]);

  const ir = a => a.nodo.scrollIntoView({ behavior: prefiereMenosMovimiento() ? "auto" : "smooth", block: "start" });
  const pct = Math.round(progreso * 100);
  if (document.documentElement.scrollHeight - window.innerHeight < 200) return null;

  return el(React.Fragment, null,
    el("div", { className: "pl-movil", "aria-hidden": "true" }, el("span", { style: { transform: "scaleX(" + progreso + ")" } })),
    el("nav", { className: "pl-lateral", "aria-label": "Progreso de la página" },
      el("span", { className: "pl-pct", "aria-hidden": "true" }, pct + "%"),
      el("div", { className: "pl-pista" },
        el("span", { className: "pl-relleno", style: { transform: "scaleY(" + progreso + ")" } }),
        apartados.map((a, i) => el("button", {
          key: i,
          type: "button",
          className: "pl-punto" + (i === actual ? " pl-punto-actual" : i < actual ? " pl-punto-pasado" : ""),
          style: { top: a.pos * 100 + "%" },
          onClick: () => ir(a),
          "aria-label": "Ir a: " + a.texto,
          "aria-current": i === actual ? "location" : undefined
        }, el("span", { className: "pl-etiqueta" }, a.texto)))),
      el("span", { className: "pl-resto", "aria-hidden": "true" }, pct >= 99 ? "Final" : "Queda " + (100 - pct) + "%")));
}
