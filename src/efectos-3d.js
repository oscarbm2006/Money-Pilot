// Escenas 3D del rediseño (Three.js). Three.js se descarga SOLO cuando una pantalla monta una escena,
// así que el resto de la web no carga ni un byte de más.
// Cada función devuelve otra para desmontar la escena (liberar memoria) cuando el componente desaparece.
// Si el dispositivo no admite WebGL, se llama a alFallar() y no se muestra nada roto.
import { prefiereMenosMovimiento, esPantallaPequena } from './movimiento.js';

const limitar = (v, a, b) => Math.max(a, Math.min(b, v));
let promesaThree = null;
const cargarThree = () => (promesaThree = promesaThree || import('./three-minimo.js'));

/* ---------- Piezas comunes ---------- */

function crearRenderizador(THREE, canvas) {
  const r = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !esPantallaPequena() });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  r.outputColorSpace = THREE.SRGBColorSpace;
  return r;
}

function textura(THREE, ancho, alto, dibujar) {
  const c = document.createElement('canvas');
  c.width = ancho; c.height = alto;
  dibujar(c.getContext('2d'), ancho, alto);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function caraMoneda(THREE) {
  return textura(THREE, 512, 512, (g) => {
    const gr = g.createRadialGradient(190, 170, 40, 256, 256, 256);
    gr.addColorStop(0, '#E0E7FF'); gr.addColorStop(0.5, '#818CF8'); gr.addColorStop(1, '#4338CA');
    g.fillStyle = gr; g.beginPath(); g.arc(256, 256, 256, 0, Math.PI * 2); g.fill();
    g.lineWidth = 18; g.strokeStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(256, 256, 214, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#1E1B4B'; g.font = '700 300px Georgia, "Times New Roman", serif';
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('€', 248, 270);
  });
}

// Fábrica de objetos (monedas, billetes, tarjetas, flechas, mini gráficos). Medidas en "unidades" de escena.
function fabrica(THREE) {
  const recursos = [];
  const guardar = (x) => { recursos.push(x); return x; };
  const metal = (color) => guardar(new THREE.MeshStandardMaterial({ color, metalness: 0.85, roughness: 0.22 }));

  const caraMat = guardar(new THREE.MeshStandardMaterial({ map: guardar(caraMoneda(THREE)), metalness: 0.3, roughness: 0.4 }));
  const cantoGeo = guardar(new THREE.CylinderGeometry(0.62, 0.62, 0.12, 64, 1, true));
  const caraGeo = guardar(new THREE.CircleGeometry(0.62, 64));
  const cantoMat = guardar(new THREE.MeshStandardMaterial({ color: '#8B93F5', metalness: 0.8, roughness: 0.28 }));

  const billeteTex = guardar(textura(THREE, 512, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#C7D2FE'); gr.addColorStop(1, '#818CF8');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(30,27,75,.35)'; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28);
    g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(w * 0.68, h * 0.5, 70, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#1E1B4B'; g.font = '700 120px Georgia, serif'; g.textBaseline = 'middle'; g.fillText('50', 40, h * 0.52);
    g.font = '400 92px Georgia, serif'; g.fillText('€', w * 0.68 - 26, h * 0.53);
  }));
  const billeteGeo = (() => {
    const geo = guardar(new THREE.PlaneGeometry(1.9, 0.95, 24, 1)), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, 0.14 * Math.sin((p.getX(i) / 1.9) * Math.PI));
    geo.computeVertexNormals();
    return geo;
  })();
  const billeteMat = guardar(new THREE.MeshStandardMaterial({ map: billeteTex, side: THREE.DoubleSide, roughness: 0.6 }));

  const tarjetaTex = guardar(textura(THREE, 512, 322, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#312E81'); gr.addColorStop(1, '#4F46E5');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,.08)'; g.beginPath(); g.arc(w * 0.9, h * 0.1, 200, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#C7D2FE'; g.fillRect(50, 110, 80, 60);
    g.fillStyle = '#E0E7FF'; g.font = '600 30px sans-serif'; g.fillText('•••• •••• •••• 2026', 50, 240);
    g.font = '700 26px sans-serif'; g.fillText('MoneyPilot', 50, 70);
  }));
  const tarjetaLado = metal('#312E81');
  const tarjetaDorso = guardar(new THREE.MeshStandardMaterial({ color: '#6366F1', metalness: 0.6, roughness: 0.3 }));
  const tarjetaMats = [tarjetaLado, tarjetaLado, tarjetaLado, tarjetaLado, guardar(new THREE.MeshStandardMaterial({ map: tarjetaTex, metalness: 0.35, roughness: 0.35 })), tarjetaDorso];
  const tarjetaGeo = guardar(new THREE.BoxGeometry(1.7, 1.07, 0.05));

  const flechaGeo = (() => {
    const s = new THREE.Shape();
    s.moveTo(-0.14, -0.6); s.lineTo(0.14, -0.6); s.lineTo(0.14, 0.1); s.lineTo(0.38, 0.1); s.lineTo(0, 0.6); s.lineTo(-0.38, 0.1); s.lineTo(-0.14, 0.1); s.closePath();
    const g = guardar(new THREE.ExtrudeGeometry(s, { depth: 0.22, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 3 }));
    g.center();
    return g;
  })();
  const flechaMat = metal('#A5B4FC');
  const barraGeo = guardar(new THREE.BoxGeometry(0.26, 1, 0.26)); barraGeo.translate(0, 0.5, 0);
  const barraMats = ['#A5B4FC', '#818CF8', '#4F46E5'].map((c) => guardar(new THREE.MeshStandardMaterial({ color: c, metalness: 0.5, roughness: 0.3 })));

  function crear(tipo) {
    if (tipo === 'moneda') {
      const g = new THREE.Group();
      const canto = new THREE.Mesh(cantoGeo, cantoMat); canto.rotation.x = Math.PI / 2; g.add(canto);
      const c1 = new THREE.Mesh(caraGeo, caraMat); c1.position.z = 0.061; g.add(c1);
      const c2 = new THREE.Mesh(caraGeo, caraMat); c2.position.z = -0.061; c2.rotation.y = Math.PI; g.add(c2);
      return g;
    }
    if (tipo === 'billete') return new THREE.Mesh(billeteGeo, billeteMat);
    if (tipo === 'tarjeta') return new THREE.Mesh(tarjetaGeo, tarjetaMats);
    if (tipo === 'flecha') return new THREE.Mesh(flechaGeo, flechaMat);
    const g = new THREE.Group(); // mini gráfico de barras
    [0.4, 0.7, 1.1].forEach((alto, i) => { const b = new THREE.Mesh(barraGeo, barraMats[i]); b.scale.y = alto; b.position.set((i - 1) * 0.34, -0.55, 0); g.add(b); });
    return g;
  }
  return { crear, liberar: () => recursos.forEach((r) => r.dispose && r.dispose()) };
}

// Reflejos generados con paneles de color (sin descargar imágenes): dan brillo a metales y cristal.
function crearEntorno(THREE, renderer) {
  const sala = new THREE.Scene();
  sala.background = new THREE.Color('#1E1B4B');
  // Cuatro paneles de color a los lados (los mismos del prototipo): son lo que reflejan los metales
  const panel = new THREE.PlaneGeometry(6, 6), mats = [];
  [['#C7D2FE', [0, 6, 0], [Math.PI / 2, 0, 0]], ['#818CF8', [6, 0, 0], [0, -Math.PI / 2, 0]], ['#4F46E5', [-6, 0, 0], [0, Math.PI / 2, 0]], ['#FFFFFF', [0, 0, 6], [0, Math.PI, 0]]].forEach(([c, p, r]) => {
    const mat = new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }); mats.push(mat);
    const m = new THREE.Mesh(panel, mat); m.position.set(...p); m.rotation.set(...r); sala.add(m);
  });
  const pmrem = new THREE.PMREMGenerator(renderer);
  const textura = pmrem.fromScene(sala, 0.04, 0.1, 100, { size: 128 }).texture; // 128 basta para unos pocos paneles de color y se genera mucho más rápido
  return { textura, liberar: () => { textura.dispose(); pmrem.dispose(); panel.dispose(); mats.forEach((m) => m.dispose()); } };
}

// Bucle de animación que se detiene (y oculta el lienzo) cuando no está a la vista.
function bucle(contenedor, canvas, dibujar) {
  let visible = true, raf = 0, vivo = true;
  const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; canvas.style.visibility = visible ? '' : 'hidden'; });
  io.observe(contenedor);
  const paso = () => { if (!vivo) return; raf = requestAnimationFrame(paso); if (visible) dibujar(); };
  raf = requestAnimationFrame(paso);
  return () => { vivo = false; cancelAnimationFrame(raf); io.disconnect(); };
}

/* ---------- Portada: monedas flotando sueltas ---------- */
// Cada moneda flota alrededor de su propio punto, con su ritmo y su giro. Los puntos están separados lo
// suficiente para que dos monedas nunca se toquen. Al bajar con el scroll se separan y la cámara se aleja.
export async function montarPortada3D(canvas, contenedor, { alFallar } = {}) {
  let THREE, renderer;
  try { THREE = await cargarThree(); renderer = crearRenderizador(THREE, canvas); }
  catch (e) { alFallar && alFallar(e); return () => {}; }
  const pequena = esPantallaPequena(), quieto = prefiereMenosMovimiento();
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const escena = new THREE.Scene();
  const camara = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camara.position.set(0, 0, 11);
  const entorno = crearEntorno(THREE, renderer);
  escena.environment = entorno.textura;
  // Luces equivalentes a las del prototipo: Three.js moderno mide la luz en unidades físicas, así que
  // las mismas cifras de antes (0,45 / 1,2 / 3) se multiplican para obtener el mismo brillo.
  escena.add(new THREE.AmbientLight('#A5B4FC', 1.3));
  escena.add(new THREE.HemisphereLight('#E0E7FF', '#6366F1', 1.1));
  const luz = new THREE.DirectionalLight('#FFFFFF', 2.4); luz.position.set(4, 6, 6); escena.add(luz);
  const relleno = new THREE.PointLight('#818CF8', 40, 20); relleno.position.set(-4, -2, 3); escena.add(relleno);

  const raiz = new THREE.Group(); escena.add(raiz);
  const piezas = fabrica(THREE);
  // [x, y, z, tamaño]: una moneda grande en el centro y el resto alrededor, sin solaparse
  const puntos = pequena
    ? [[0, 0.1, 0.8, 1.6], [-2.1, 1.5, 0, 0.9], [2.1, 1.3, -0.4, 0.95], [-2, -1.6, 0.3, 0.85], [2.1, -1.5, -0.2, 1]]
    : [[0.2, 0.2, 1, 1.7], [-2.2, 1.6, 0, 1.05], [0.6, 2.7, -1, 0.9], [2.4, 1.2, 0.5, 1.1], [2.4, -1.3, -0.6, 0.95], [-2.4, -1.9, -0.4, 1.1], [0.6, -2.3, 0.8, 0.95]];
  const monedas = puntos.map(([x, y, z, t], i) => {
    const m = piezas.crear('moneda');
    m.scale.setScalar(t);
    m.userData = { x, y, z, f1: 0.35 + i * 0.07, f2: 0.28 + (i % 3) * 0.09, fase: i * 1.7, giro: (0.35 + (i % 4) * 0.12) * (i % 2 ? -1 : 1), base: i * 0.9 };
    raiz.add(m);
    return m;
  });

  const N = pequena ? 160 : 380, pos = new Float32Array(N * 3);
  for (let k = 0; k < N; k++) { pos[k * 3] = (Math.random() - 0.5) * 22; pos[k * 3 + 1] = (Math.random() - 0.5) * 14; pos[k * 3 + 2] = (Math.random() - 0.5) * 10 - 3; }
  const estrellasGeo = new THREE.BufferGeometry(); estrellasGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const estrellas = new THREE.Points(estrellasGeo, new THREE.PointsMaterial({ color: '#C7D2FE', size: 0.04, transparent: true, opacity: 0.7 }));
  escena.add(estrellas);

  let mx = 0, my = 0, tx = 0, ty = 0;
  const alMover = (e) => { tx = e.clientX / window.innerWidth - 0.5; ty = e.clientY / window.innerHeight - 0.5; };
  window.addEventListener('pointermove', alMover, { passive: true });

  const ajustar = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false); camara.aspect = w / h; camara.updateProjectionMatrix();
    raiz.scale.setScalar(Math.min(1, camara.aspect / 1.1));
    raiz.position.x = pequena ? 0 : 0.6; // en escritorio, algo desplazadas a la derecha para dejar aire al titular
  };
  const ro = new ResizeObserver(ajustar); ro.observe(canvas); ajustar();
  const reloj = new THREE.Clock();
  const dibujar = () => {
    const t = quieto ? 0 : reloj.getElapsedTime();
    const prog = limitar(-contenedor.getBoundingClientRect().top / (contenedor.offsetHeight || 1), 0, 1);
    mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
    const abre = 1 + prog * 0.9;
    monedas.forEach((m) => {
      const u = m.userData;
      m.position.set(u.x * abre + Math.sin(t * u.f1 + u.fase) * 0.22, u.y * abre + Math.cos(t * u.f2 + u.fase) * 0.25, u.z + Math.sin(t * 0.3 + u.fase) * 0.4);
      m.rotation.set(0.35 * Math.sin(t * 0.5 + u.fase), u.base + t * u.giro, 0.2 * Math.cos(t * 0.4 + u.fase));
    });
    estrellas.rotation.y = t * 0.01 + mx * 0.15;
    raiz.rotation.y = mx * 0.35; raiz.rotation.x = my * 0.2;
    camara.position.z = 11 + prog * 4;
    renderer.render(escena, camara);
  };

  // Los gráficos se preparan sin bloquear la página y solo entonces se muestra la escena, con un fundido
  try { await renderer.compileAsync(escena, camara); } catch (e) { /* si el navegador no lo admite, se prepara en el primer fotograma */ }
  dibujar();
  requestAnimationFrame(() => canvas.classList.add('mp-lienzo-listo'));

  let parar;
  if (quieto) { dibujar(); const alScroll = () => dibujar(); window.addEventListener('scroll', alScroll, { passive: true }); parar = () => window.removeEventListener('scroll', alScroll); }
  else parar = bucle(contenedor, canvas, dibujar);

  return () => {
    parar(); ro.disconnect(); window.removeEventListener('pointermove', alMover);
    piezas.liberar(); entorno.liberar(); estrellasGeo.dispose(); estrellas.material.dispose();
    renderer.dispose();
  };
}

/* ---------- Capa de transición: iconos 3D alrededor de un titular ---------- */
// iconos: lista de [tipo, x, y, escala, giroInicial] con x e y entre -1 y 1 (posición dentro de la banda).
// Tipos: 'moneda', 'billete', 'tarjeta', 'flecha', 'barras'.
// Los iconos entran girando desde el fondo cuando la banda está a la vista y se alejan cuando sale.
export async function montarCapa3D(canvas, banda, iconos, { alFallar } = {}) {
  if (prefiereMenosMovimiento()) return () => {};
  let THREE, renderer;
  try { THREE = await cargarThree(); renderer = crearRenderizador(THREE, canvas); }
  catch (e) { alFallar && alFallar(e); return () => {}; }
  const pequena = esPantallaPequena();
  const escena = new THREE.Scene();
  const camara = new THREE.PerspectiveCamera(35, 1, 1, 5000);
  const entorno = crearEntorno(THREE, renderer);
  escena.environment = entorno.textura;
  escena.add(new THREE.HemisphereLight('#E0E7FF', '#1E1B4B', 1.6));
  const luz = new THREE.DirectionalLight('#FFFFFF', 2); luz.position.set(300, 500, 800); escena.add(luz);

  const piezas = fabrica(THREE);
  const objetos = iconos.filter((_, k) => !pequena || k % 2 === 0).map(([tipo, x, y, s, r], k) => {
    const m = piezas.crear(tipo); escena.add(m);
    return { m, x, y, s, r, fase: k * 1.9, e: 0, k };
  });

  let W = 1, H = 1, mx = 0, my = 0, tx = 0, ty = 0, dentro = false, t0 = 0;
  const ajustar = () => {
    W = canvas.clientWidth; H = canvas.clientHeight;
    if (!W || !H) return;
    renderer.setSize(W, H, false); camara.aspect = W / H;
    camara.position.set(0, 0, H / 2 / Math.tan((camara.fov * Math.PI) / 360)); camara.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(ajustar); ro.observe(canvas); ajustar();
  const alMover = (e) => { const r = banda.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5; };
  banda.addEventListener('pointermove', alMover);
  const io = new IntersectionObserver((es) => {
    const ahora = es[0].isIntersecting && es[0].intersectionRatio > 0.35;
    if (ahora && !dentro) t0 = performance.now();
    dentro = ahora;
  }, { threshold: [0, 0.35, 0.6] });
  io.observe(banda);

  try { await renderer.compileAsync(escena, camara); } catch (e) { /* se prepara en el primer fotograma */ } // sin tirón al llegar con el scroll
  const reloj = new THREE.Clock();
  const dibujar = () => {
    const t = reloj.getElapsedTime(), ahora = performance.now();
    mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
    const base = pequena ? 0.6 : W < 1100 ? 0.8 : 1;
    objetos.forEach((o) => {
      const meta = dentro ? limitar((ahora - t0 - o.k * 120) / 1100, 0, 1) : 0;
      o.e += (meta - o.e) * (dentro ? 1 : 0.08);
      const e = 1 - Math.pow(1 - o.e, 3);
      o.m.visible = e > 0.01;
      // Las medidas de la escena están en "unidades": 110 px por unidad
      o.m.position.set(o.x * (W / 2 - (pequena ? 50 : 110)) + mx * 40 * (o.k % 2 ? 1 : -1), o.y * (H / 2 - 70) + Math.sin(t * 0.9 + o.fase) * 12 - my * 30, -600 * (1 - e) + Math.sin(t * 0.5 + o.fase) * 30);
      o.m.scale.setScalar(o.s * base * e * 110);
      o.m.rotation.set(0.35 * Math.sin(t * 0.6 + o.fase), o.r + t * 0.45 + (1 - e) * 4, 0.25 * Math.cos(t * 0.5 + o.fase));
    });
    renderer.render(escena, camara);
  };
  const parar = bucle(banda, canvas, dibujar, (nivel) => { renderer.setPixelRatio(nivel === 1 ? 1 : 0.75); ajustar(); });
  return () => { parar(); ro.disconnect(); io.disconnect(); banda.removeEventListener('pointermove', alMover); piezas.liberar(); entorno.liberar(); renderer.dispose(); };
}
