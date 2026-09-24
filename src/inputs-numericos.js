// Los campos numéricos solo se modifican escribiendo: sin flechas del teclado,
// sin rueda del ratón y sin gesto de scroll del touchpad.
const esNumerico = el => el && el.tagName === "INPUT" && el.type === "number";

document.addEventListener("wheel", e => {
  const el = document.activeElement;
  if (esNumerico(el) && (e.target === el || el.contains(e.target))) {
    // Quitar el foco evita que el navegador cambie el valor con la rueda/touchpad
    el.blur();
  }
}, { passive: true });

document.addEventListener("keydown", e => {
  if ((e.key === "ArrowUp" || e.key === "ArrowDown") && esNumerico(e.target)) {
    e.preventDefault();
  }
});
