const { useState, useEffect, useRef, useCallback, useMemo, useId } = React;

import { BLOG_ADMIN_EMAIL, C, I, OBJETIVOS_DEF, PATTERN_URI_STATIC, PERFILES_INFO } from './constantes.js';
import { dec, calcularCapacidadFinanciera, calcularDiagnosticoAmpliado, calcularPerfilMultidimensional, calcularPlanFinanciero, calcularPlanObjetivos, calcularPrioridades, datosVacios, normalizarObjetivos, objetivoLegadoDesdeColeccion, reconstruirEstadoQuiz, totalMensual } from './calculos.js';
import { useActivosPersistidos, useActivosSync, useAuth, useCloudSync, useCuentasPersistidas, useCuentasSync, useDatosPersistidos, useDebouncedEffect, useDeudasMirrorSync, useGuiaProgresoSync, useInversionesPersistidas, useInversionesSync, useSeguimiento, useToast } from './hooks-datos.js';
import { AuthModal, ConflictoDatosModal, ContinuarBar, ErrorBoundary, Eyebrow, FeedbackModal, Toast } from './ui-basicos.js';
import { AmortizacionDeuda, SimuladorDeudas, Contacto, Cuentas, Dashboard, Diagnostico, Estrategia, Inversiones, NavDesktop, PaginaLegal, PanelDiagnostico, PanelPrioridad, Patrimonio, PerfilRiesgo, PlanFinanciero, PrintSummary, Seguimiento, Simulador } from './paginas.js';
const Blog = React.lazy(() => import('./blog.js'));
import { CabeceraHerramienta, ConfianzaPrivacidad, HeroSection, MisFinanzas, QuienesSomos, VISTAS_MIS_FINANZAS, VISTAS_REDISENADAS } from './secciones.js';
import { MiCuentaModal } from './cuenta.js';
import { ReiniciarTodoModal } from './cuenta.js';

export function App() {
  const {
    ready,
    savedState,
    save,
    clear
  } = useDatosPersistidos();
  const {
    user,
    authReady,
    signUp,
    signIn,
    signOut
  } = useAuth();
  const [irADeudas, setIrADeudas] = useState(false);
  const [vistaActual, setVistaActualBase] = useState(() => {
    if (typeof window === "undefined") return "inicio";
    try {
      const guardada = window.localStorage.getItem("salud-financiera:ultima-vista") || "inicio";
      return guardada === "blog" || guardada === "privacidad" ? "inicio" : guardada;
    } catch (e) {
      return "inicio";
    }
  });
  useEffect(() => {
    if (vistaActual !== 'diagnostico') setIrADeudas(false);
  }, [vistaActual]);
  const vistaRef = useRef(vistaActual);
  vistaRef.current = vistaActual;
  const setVistaActual = v => {
    if (v === vistaRef.current) return;
    setVistaActualBase(v);
    try {
      window.localStorage.setItem("salud-financiera:ultima-vista", v);
    } catch (e) {}
    // Cada cambio de pantalla crea una entrada en el historial del navegador,
    // para que el botón "atrás" del navegador vuelva a la pantalla anterior.
    try {
      window.history.pushState({ mpVista: v }, "");
    } catch (e) {}
  };
  useEffect(() => {
    try {
      window.history.replaceState({ mpVista: vistaRef.current }, "");
    } catch (e) {}
    const onPop = e => {
      const v = e.state && e.state.mpVista;
      if (!v) return;
      const destino = v === "privacidad" ? "inicio" : v; // la política ya no es una vista de la app: es /privacidad.html
      setVistaActualBase(destino);
      try {
        window.localStorage.setItem("salud-financiera:ultima-vista", destino);
      } catch (err) {}
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  // El blog público son páginas HTML reales (mejor para Google y para AdSense) y es el mismo para todos.
  // El administrador, además, tiene en el pie un enlace "Gestionar blog" para crear y editar artículos.
  const esAdminBlog = !!(user && user.email && user.email === BLOG_ADMIN_EMAIL);
  const blogHref = "/blog/guia/index.html";
  const irAlBlog = () => window.location.assign(blogHref);
  // Cabecera: al bajar un poco se oscurece y gana sombra (solo cambia un atributo en <html>; el CSS hace el resto)
  useEffect(() => {
    const raiz = document.documentElement;
    let raf = 0,
      activo = false,
      t = 0;
    const medir = () => {
      raf = 0;
      const v = window.scrollY > 8;
      if (v !== activo) {
        activo = v;
        if (v) raiz.setAttribute("data-scrolled", "");else raiz.removeAttribute("data-scrolled");
      }
    };
    const alScroll = () => {
      if (!raf) raf = requestAnimationFrame(medir);
      // Mientras se hace scroll, las animaciones decorativas (fondo de la portada) se pausan
      if (!t) raiz.setAttribute("data-scrolling", "");
      clearTimeout(t);
      t = setTimeout(() => {
        t = 0;
        raiz.removeAttribute("data-scrolling");
      }, 160);
    };
    window.addEventListener("scroll", alScroll, { passive: true });
    medir();
    return () => {
      window.removeEventListener("scroll", alScroll);
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(t);
      raiz.removeAttribute("data-scrolled");
      raiz.removeAttribute("data-scrolling");
    };
  }, []);
  // Fondo animado de la portada: si el equipo no va sobrado (menos de ≈ 36 fps medidos a los 3 s), se queda quieto y se recuerda
  useEffect(() => {
    const raiz = document.documentElement,
      CLAVE_QUIETO = "salud-financiera:ambiente-quieto";
    try {
      if (window.localStorage.getItem(CLAVE_QUIETO) === "1") {
        raiz.setAttribute("data-ambiente", "quieto");
        return;
      }
    } catch (e) {}
    if (!window.matchMedia || !window.matchMedia("(min-width: 1024px) and (hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;
    let cancelado = false,
      raf = 0;
    const inicio = setTimeout(() => {
      let n = 0,
        suma = 0,
        ultimo = performance.now();
      const medir = ahora => {
        if (cancelado) return;
        const d = ahora - ultimo;
        ultimo = ahora;
        if (document.visibilityState !== "visible" || d > 200) {
          n = 0;
          suma = 0; // pestaña en segundo plano o pausa larga: se vuelve a empezar
        } else {
          n++;
          suma += d;
        }
        if (n < 60) {
          raf = requestAnimationFrame(medir);
          return;
        }
        if (suma / n > 28) {
          raiz.setAttribute("data-ambiente", "quieto");
          try {
            window.localStorage.setItem(CLAVE_QUIETO, "1");
          } catch (e) {}
        }
      };
      raf = requestAnimationFrame(medir);
    }, 3000);
    return () => {
      cancelado = true;
      clearTimeout(inicio);
      cancelAnimationFrame(raf);
    };
  }, []);
  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto"
    });
  }, []);
  // Dentro de la página "Mis finanzas", los enlaces a Cuentas o Inversiones bajan siempre hasta esa parte
  // (aunque ya estés en ella y la dirección no cambie).
  const irAParteMisFinanzas = parte => {
    setVistaActual(parte);
    const el = document.getElementById("mf-" + parte);
    const suave = !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (el) el.scrollIntoView({ behavior: suave ? "smooth" : "auto", block: "start" });
  };
  // Menú integrado en las páginas rediseñadas: mientras está sobre la banda oscura de arriba (portada o cabecera)
  // toma su mismo color; al pasar a la zona clara, toma el fondo claro de la página y el texto oscuro.
  useEffect(() => {
    const raiz = document.documentElement;
    raiz.removeAttribute("data-menu-claro");
    if (!VISTAS_REDISENADAS.includes(vistaActual)) return;
    let io = null;
    const t = setTimeout(() => {
      const banda = document.querySelector("main .mp-portada, main .mp-cab");
      if (!banda) { raiz.setAttribute("data-menu-claro", ""); return; }
      io = new IntersectionObserver(es => { if (es[0].isIntersecting) raiz.removeAttribute("data-menu-claro"); else raiz.setAttribute("data-menu-claro", ""); }, { rootMargin: "-64px 0px 0px 0px" });
      io.observe(banda);
    }, 60);
    return () => { clearTimeout(t); if (io) io.disconnect(); };
  }, [vistaActual]);
  const vistaPreviaScroll = useRef(vistaActual);
  useEffect(() => {
    // Dentro de "Mis finanzas" (cuentas, inversiones y patrimonio en una sola página) no se sube al principio:
    // la propia página baja hasta la parte pedida.
    const mismaPagina = VISTAS_MIS_FINANZAS.includes(vistaPreviaScroll.current) && VISTAS_MIS_FINANZAS.includes(vistaActual);
    vistaPreviaScroll.current = vistaActual;
    if (mismaPagina) return;
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto"
    });
  }, [vistaActual]);

  const [datos, setDatos] = useState(datosVacios());
  const [perfil, setPerfil] = useState(null);
  const [perfilDetalle, setPerfilDetalle] = useState(null);
  const [quizState, setQuizState] = useState({
    respuestas: {},
    currentQuestionId: "edad",
    questionPath: ["edad"],
    paso: 0,
    terminado: false,
    resultado: null
  });
  const [sim, setSim] = useState({
    inicial: 0,
    mensual: 0,
    tasa: 6,
    horizonte: 0,
    objetivoId: null
  });
  const [objetivoSeleccionadoId, setObjetivoSeleccionadoId] = useState(null);
  const [historial, setHistorial] = useState([]);
  // --- Cuentas (Fase 2 de la hoja de ruta) ---
  const [cuentas, setCuentas] = useState([]);
  const {
    ready: cuentasReady,
    cuentasGuardadas,
    save: guardarCuentasLocal
  } = useCuentasPersistidas();
  const [cuentasHidratadas, setCuentasHidratadas] = useState(false);
  useEffect(() => {
    if (!cuentasReady) return;
    if (Array.isArray(cuentasGuardadas)) setCuentas(cuentasGuardadas);
    setCuentasHidratadas(true);
  }, [cuentasReady, cuentasGuardadas]);
  const {
    conflicto: conflictoCuentas,
    resolverConflicto: resolverConflictoCuentas,
    agregarCuenta,
    actualizarCuenta,
    eliminarCuenta
  } = useCuentasSync({
    user,
    cuentas,
    setCuentas,
    onSaved: (msg, tone) => showToast(msg, tone)
  });
  useDebouncedEffect(() => {
    if (!cuentasHidratadas) return;
    guardarCuentasLocal(cuentas);
  }, [cuentas, cuentasHidratadas]);
  // --- Inversiones (Fase 4 de la hoja de ruta) ---
  const [inversiones, setInversiones] = useState([]);
  const {
    ready: inversionesReady,
    inversionesGuardadas,
    save: guardarInversionesLocal
  } = useInversionesPersistidas();
  const [inversionesHidratadas, setInversionesHidratadas] = useState(false);
  useEffect(() => {
    if (!inversionesReady) return;
    if (Array.isArray(inversionesGuardadas)) setInversiones(inversionesGuardadas);
    setInversionesHidratadas(true);
  }, [inversionesReady, inversionesGuardadas]);
  const {
    conflicto: conflictoInversiones,
    resolverConflicto: resolverConflictoInversiones,
    agregarInversion,
    actualizarInversion,
    eliminarInversion
  } = useInversionesSync({
    user,
    inversiones,
    setInversiones,
    onSaved: (msg, tone) => showToast(msg, tone)
  });
  useDebouncedEffect(() => {
    if (!inversionesHidratadas) return;
    guardarInversionesLocal(inversiones);
  }, [inversiones, inversionesHidratadas]);
  // --- Activos: otros bienes, para el Patrimonio (Fase 5) ---
  const [activos, setActivos] = useState([]);
  const {
    ready: activosReady,
    activosGuardados,
    save: guardarActivosLocal
  } = useActivosPersistidos();
  const [activosHidratados, setActivosHidratados] = useState(false);
  useEffect(() => {
    if (!activosReady) return;
    if (Array.isArray(activosGuardados)) setActivos(activosGuardados);
    setActivosHidratados(true);
  }, [activosReady, activosGuardados]);
  const {
    conflicto: conflictoActivos,
    resolverConflicto: resolverConflictoActivos,
    agregarActivo,
    actualizarActivo,
    eliminarActivo
  } = useActivosSync({
    user,
    activos,
    setActivos,
    onSaved: (msg, tone) => showToast(msg, tone)
  });
  useDebouncedEffect(() => {
    if (!activosHidratados) return;
    guardarActivosLocal(activos);
  }, [activos, activosHidratados]);
  // Progreso de lectura de la guía del blog: se guarda en el dispositivo y, con sesión, se sincroniza como los datos
  const {
    conflicto: conflictoGuia,
    resolverConflicto: resolverConflictoGuia
  } = useGuiaProgresoSync({
    user,
    onSaved: (msg, tone) => showToast(msg, tone)
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCuentaModal, setShowCuentaModal] = useState(false);
  const [showReinicioModal, setShowReinicioModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showFooterNotice, setShowFooterNotice] = useState(true);
  const {
    toast,
    show: showToast
  } = useToast();
  const [hydrated, setHydrated] = useState(false);
  const {
    cloudReady,
    registrarSnapshotNube
  } = useCloudSync({
    user,
    datos,
    setDatos,
    perfil,
    setPerfil,
    perfilDetalle,
    setPerfilDetalle,
    sim,
    setSim,
    setObjetivoSeleccionadoId,
    quizState,
    setQuizState,
    historial,
    setHistorial,
    onSaved: showToast
  });
  // Espejo en segundo plano de las deudas hacia la tabla `deudas` (Fase 3).
  // No cambia nada visible: Diagnóstico, Estrategia y el simulador de deudas
  // siguen leyendo y calculando exactamente igual desde `datos.deudas`.
  useDeudasMirrorSync({
    user,
    datos,
    setDatos,
    onSaved: showToast
  });
  useEffect(() => {
    if (!ready) return;
    if (savedState && savedState.datos) {
      const datosRestaurados = {
        ...savedState.datos
      };
      const objetivosRestaurados = normalizarObjetivos(datosRestaurados);
      datosRestaurados.objetivos = objetivosRestaurados;
      datosRestaurados.objetivo = objetivoLegadoDesdeColeccion(objetivosRestaurados);
      setDatos(datosRestaurados);
      const quizGuardado = savedState.quizState || {
        respuestas: {},
        paso: 0,
        terminado: false,
        resultado: null
      };
      const quizRestaurado = reconstruirEstadoQuiz(quizGuardado, datosRestaurados);
      const resultadoGuardado = quizRestaurado.terminado ? calcularPerfilMultidimensional(quizRestaurado.respuestas, datosRestaurados) : savedState.perfilDetalle || quizRestaurado.resultado || null;
      setPerfil(resultadoGuardado?.perfil || savedState.perfil || null);
      setPerfilDetalle(resultadoGuardado);
      setSim(savedState.sim || {
        inicial: 0,
        mensual: 0,
        tasa: 6,
        horizonte: 0,
        objetivoId: null
      });
      setObjetivoSeleccionadoId(savedState.sim?.objetivoId || null);
      setQuizState({
        ...quizRestaurado,
        resultado: resultadoGuardado
      });
      setHistorial(savedState.historial || []);
    }
    setHydrated(true);
  }, [ready, savedState]);
  useDebouncedEffect(() => {
    if (!hydrated) return;
    if (datos.ingresos <= 0 && historial.length === 0) return;
    save({
      datos,
      perfil,
      perfilDetalle,
      sim,
      quizState,
      historial
    }).then(() => {
      if (!user) showToast("Guardado en este dispositivo");
    });
  }, [datos, perfil, perfilDetalle, sim, quizState, historial, hydrated]);
  const snapshotDone = useRef(false);
  useEffect(() => {
    if (!hydrated || snapshotDone.current || datos.ingresos <= 0) return;
    snapshotDone.current = true;
    const cap = calcularCapacidadFinanciera(datos);
    const ratio = cap.ingresos > 0 ? (cap.capacidadMensual || 0) / cap.ingresos : 0;
    setHistorial(prev => {
      const last = prev[prev.length - 1];
      if (last && Math.abs(last.ratio - ratio) < 0.001) return prev;
      return [...prev, {
        ratio,
        ts: Date.now()
      }].slice(-20);
    });
    registrarSnapshotNube(ratio);
  }, [hydrated, datos.ingresos, datos.otrosIngresos, datos.gastosFijos, datos.gastosDiscrecionales, datos.deudas]);
  const reiniciar = async () => {
    await clear();
    setDatos(datosVacios());
    setPerfil(null);
    setPerfilDetalle(null);
    setSim({
      inicial: 0,
      mensual: 0,
      tasa: 6,
      horizonte: 0,
      objetivoId: null
    });
    setObjetivoSeleccionadoId(null);
    setQuizState({
      respuestas: {},
      currentQuestionId: "edad",
      questionPath: ["edad"],
      paso: 0,
      terminado: false,
      resultado: null
    });
    setHistorial([]);
    setCuentas([]);
    setInversiones([]);
    setActivos([]);
    snapshotDone.current = false;
    setVistaActual('inicio');
  };
  const confirmarReinicio = () => {
    if (user) {
      setShowReinicioModal(true);
      return;
    }
    const ok = window.confirm("¿Borrar todos tus datos de este dispositivo y empezar de nuevo?\n\nEsta acción no se puede deshacer.");
    if (ok) reiniciar();
  };
  const capacidadFinanciera = calcularCapacidadFinanciera(datos);
  const cuotasDeuda = capacidadFinanciera.cuotasDeuda;
  const gastoTotal = totalMensual(datos.gastosFijos) + totalMensual(datos.gastosDiscrecionales) + cuotasDeuda;
  const ahorroDisponible = capacidadFinanciera.capacidadMensual == null ? 0 : capacidadFinanciera.capacidadMensual;
  const ratioAhorro = capacidadFinanciera.ingresos > 0 ? ahorroDisponible / capacidadFinanciera.ingresos : 0;
  // Fase 1.1: un único "ahorro real" para toda la app. Si el usuario tiene Cuentas
  // registradas, se usa la suma real de sus saldos; si no, se recurre al valor que
  // escribió a mano en Diagnóstico. Antes esto solo pasaba en Plan/Estrategia; ahora
  // también alimenta el Diagnóstico principal, el Dashboard y el simulador, para que
  // no haya números que no cuadren entre pantallas.
  // Si el usuario ha marcado alguna cuenta como "fondo de emergencia", solo esas
  // cuentan para el colchón; si no ha marcado ninguna (usuarios que aún no
  // conocen esta opción), se sigue sumando todo el saldo como antes.
  const cuentasFondoEmergencia = cuentas.filter(c => c.esFondoEmergencia);
  const cuentasParaColchon = cuentasFondoEmergencia.length > 0 ? cuentasFondoEmergencia : cuentas;
  const liquidezReal = cuentas.length > 0 ? cuentasParaColchon.reduce((s, c) => s + (Number(c.saldo) || 0), 0) : Number(datos.ahorroActual) || 0;
  const datosParaCalculo = useMemo(() => ({
    ...datos,
    ahorroActual: liquidezReal
  }), [datos, liquidezReal]);
  const planObjetivos = useMemo(() => calcularPlanObjetivos(datosParaCalculo), [datosParaCalculo]);
  const diagnosticoAmpliado = useMemo(() => calcularDiagnosticoAmpliado({
    datos: datosParaCalculo,
    cuentas,
    inversiones,
    planObjetivos
  }), [datosParaCalculo, cuentas, inversiones, planObjetivos]);
  const prioridadActual = useMemo(() => calcularPrioridades({
    datos: datosParaCalculo,
    inversiones,
    planObjetivos,
    diagnostico: diagnosticoAmpliado
  }), [datosParaCalculo, inversiones, planObjetivos, diagnosticoAmpliado]);
  const planFinanciero = useMemo(() => calcularPlanFinanciero({
    datos: datosParaCalculo,
    cuentas,
    inversiones,
    planObjetivos,
    diagnostico: diagnosticoAmpliado,
    prioridad: prioridadActual,
    perfil
  }), [datosParaCalculo, cuentas, inversiones, planObjetivos, diagnosticoAmpliado, prioridadActual, perfil]);
  // --- Seguimiento: evolución en el tiempo (Fase 9) ---
  const {
    historial: historialSeguimiento,
    cargando: cargandoSeguimiento,
    registrarSnapshot,
    registrarSiHaceFalta,
    eliminarRegistro,
    borrarHistorial
  } = useSeguimiento({
    user
  });
  const valoresSnapshotActual = useMemo(() => ({
    liquidez: diagnosticoAmpliado.liquidezReal,
    totalInversiones: inversiones.reduce((s, inv) => s + (Number(inv.valorActual) || 0), 0),
    totalActivos: activos.reduce((s, a) => s + (Number(a.valorActual) || 0), 0),
    totalDeudas: (datos.deudas || []).filter(d => Number(d.pendiente) > 0).reduce((s, d) => s + Number(d.pendiente || 0), 0) + activos.reduce((s, a) => s + (a.pagada === false ? Number(a.pendientePago) || 0 : 0), 0),
    coberturaMeses: diagnosticoAmpliado.coberturaMeses,
    ratioAhorro: capacidadFinanciera.ingresos > 0 ? capacidadFinanciera.capacidadMensual / capacidadFinanciera.ingresos : null
  }), [diagnosticoAmpliado, inversiones, activos, datos.deudas, capacidadFinanciera]);
  useEffect(() => {
    if (!user || !hydrated) return;
    registrarSiHaceFalta(valoresSnapshotActual);
    // eslint-disable-next-line
  }, [user, hydrated, historialSeguimiento.length]);
  useEffect(() => {
    if (!hydrated) return;
    if (sim.objetivoId || sim.inicial !== 0 || sim.mensual !== 0) return;
    setSim({
      inicial: liquidezReal > 0 ? liquidezReal : 0,
      mensual: ahorroDisponible > 0 ? ahorroDisponible : 0,
      tasa: perfil ? PERFILES_INFO[perfil].rentabilidad : 6,
      horizonte: 0,
      objetivoId: null
    });
  }, [hydrated, liquidezReal, ahorroDisponible, perfil]);
  if (!ready || !hydrated) {
    /* FASE 2: antes era backgroundColor:C.navy a pantalla completa — el único
       punto de toda la app donde el usuario veía un fondo oscuro sólido antes
       de que cargara nada claro. Ahora usa --surface-0, coherente con el resto. */
    return /*#__PURE__*/React.createElement("div", {
      className: "min-h-screen w-full flex items-center justify-center",
      style: {
        backgroundColor: C.bgDeep
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm font-bold animate-pulse",
      style: {
        color: C.sand
      }
    }, "Cargando…"));
  }
  // Las páginas rediseñadas llevan el fondo blanco del prototipo (sin el tono gris azulado ni el dibujo de líneas)
  const fondoLimpio = VISTAS_REDISENADAS.includes(vistaActual);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen w-full relative no-print" + (fondoLimpio ? " mp-fondo-limpio" : ""),
    style: {
      backgroundColor: fondoLimpio ? "#FAFAFA" : C.bgDeep
    }
  }, !fondoLimpio && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 pointer-events-none",
    style: {
      background: "radial-gradient(120% 100% at 50% -10%, rgba(49,46,129,0.06) 0%, rgba(49,46,129,0.10) 60%)"
    }
  }), !fondoLimpio && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 pointer-events-none",
    style: {
      backgroundImage: `url(${PATTERN_URI_STATIC})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
      backgroundPosition: "center",
      opacity: 0.7,
      mixBlendMode: "multiply"
    }
  }), /*#__PURE__*/React.createElement("header", {
    className: "glass-nav sticky top-0 z-50",
    style: {
      backgroundColor: "rgba(6,10,19,0.88)",
      borderBottom: "1px solid " + C.glassBorder,
      boxShadow: "0 8px 24px -12px rgba(0,0,0,0.6)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-6xl mx-auto px-4 sm:px-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between flex-wrap gap-y-2 py-2 gap-x-4"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setVistaActual('inicio'),
    className: "flex items-center gap-2 shrink-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-center",
    style: {
      backgroundColor: "#FFFFFF",
      borderRadius: "8px",
      padding: "3px 9px"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "/logo-moneypilot.png",
    alt: "MoneyPilot",
    width: 113,
    height: 20,
    style: {
      display: "block",
      height: "20px",
      width: "auto"
    }
  }))), /*#__PURE__*/React.createElement(NavDesktop, {
    vistaActual: vistaActual,
    setVistaActual: setVistaActual,
    blogHref: blogHref
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 shrink-0"
  }, authReady && (user ? /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hidden xl:inline text-xs font-bold max-w-40 truncate nav-link-muted"
  }, user.email), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowCuentaModal(true),
    className: "hidden sm:flex text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-white/10 nav-link-muted whitespace-nowrap"
  }, "Mi cuenta"), /*#__PURE__*/React.createElement("button", {
    onClick: signOut,
    className: "text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-white/10 nav-link-muted whitespace-nowrap"
  }, "Cerrar sesión")) : /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowAuthModal(true),
    className: "text-xs font-bold px-3 py-1.5 rounded-lg",
    style: {
      backgroundColor: C.sand,
      color: C.white
    }
  }, "Guardar")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowFeedbackModal(true),
    className: "inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-white/10 whitespace-nowrap",
    style: {
      color: "#C7D2FE"
    },
    title: "Evaluar página"
  }, /*#__PURE__*/React.createElement(I.clipboard, {
    size: 14
  }), "Evaluar"), /*#__PURE__*/React.createElement("button", {
    onClick: confirmarReinicio,
    "aria-label": "Borrar datos y empezar de nuevo",
    className: "inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-white/10 nav-link-muted",
    title: "Borra tus datos guardados y vuelve a empezar"
  }, /*#__PURE__*/React.createElement(I.trash, {
    size: 13
  })))), /*#__PURE__*/React.createElement("div", {
    className: "hidden"
  }, [["inicio", "Introducción"], ["diagnostico", "Diagnóstico"], ["mis-finanzas", "Cuentas, inversiones y patrimonio"], ["estrategia", "Estrategia"], ["plan", "Plan"], ["seguimiento", "Seguimiento"], ["simulador", "Simulador"], ["blog", "Blog"]].map(([id, label]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    onClick: () => setVistaActual(id),
    className: "whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold " + (vistaActual === id ? "nav-link-active" : "nav-link-muted"),
    style: vistaActual === id ? {
      backgroundColor: "rgba(79,70,229,.16)",
      color: C.sand
    } : {
      backgroundColor: "rgba(255,255,255,.04)"
    }
  }, label)), /*#__PURE__*/React.createElement("a", {
    href: "/recursos-y-libros.html",
    className: "whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold nav-link-muted"
}, "Recursos y libros")))), /*#__PURE__*/React.createElement("main", {
    className: "relative z-10"
  }, vistaActual === 'inicio' && /*#__PURE__*/React.createElement("div", {
    key: "inicio",
    className: "fade-switch-enter"
  }, /*#__PURE__*/React.createElement(HeroSection, {
    onStart: () => {
      setIrADeudas(false);
      setVistaActual('diagnostico');
    }
  }), /*#__PURE__*/React.createElement(ConfianzaPrivacidad, null)), vistaActual === 'diagnostico' && /*#__PURE__*/React.createElement("div", {
    key: "diagnostico",
    className: "fade-switch-enter mp-piel"
  }, /*#__PURE__*/React.createElement(CabeceraHerramienta, {
    id: "mp-cab-diag",
    antetitulo: "Diagnóstico financiero",
    titulo: "Construye tu foto financiera, paso a paso",
    frase: "Empezamos por lo esencial y añadimos detalle solo cuando lo necesitas. Tus cálculos se actualizan en cada paso.",
    iconos: [["moneda", 0.32, 0.3, 0.8, 0.3], ["barras", 0.55, -0.25, 0.85, -0.3], ["billete", 0.76, 0.35, 0.75, 0.6], ["moneda", 0.96, -0.2, 0.6, 1.1]]
  }), /*#__PURE__*/React.createElement(Diagnostico, {
    key: irADeudas ? 'diag-deudas' : 'diag',
    irADeudas: irADeudas,
    onIrASimuladorDeudas: () => setVistaActual('simulador-deudas'),
    datos: datos,
    setDatos: setDatos,
    liquidezReal: liquidezReal,
    objetivoSeleccionadoId: objetivoSeleccionadoId,
    onEliminarSeleccionado: () => {
      setObjetivoSeleccionadoId(null);
      setSim({
        ...sim,
        objetivoId: null
      });
    },
    onFinalizar: () => {
      // Al terminar el diagnóstico se pasa a añadir las cuentas (página Mis finanzas); desde ahí, "Ver mis resultados"
      setVistaActual('cuentas');
    }
  })), VISTAS_MIS_FINANZAS.includes(vistaActual) && /*#__PURE__*/React.createElement("div", {
    key: "mis-finanzas",
    className: "fade-switch-enter mp-piel"
  }, /*#__PURE__*/React.createElement(CabeceraHerramienta, {
    id: "mp-cab-mf",
    antetitulo: "Mis finanzas",
    titulo: "Tu patrimonio, en un solo sitio",
    frase: "Tus cuentas, tus inversiones y tus otros bienes, juntos. Con ellos calculamos tu patrimonio neto: todo lo que tienes menos todo lo que debes.",
    iconos: [["tarjeta", 0.34, 0.2, 0.9, -0.4], ["barras", 0.58, -0.22, 0.8, -0.3], ["moneda", 0.8, 0.3, 0.75, 0.8], ["flecha", 0.97, -0.25, 0.6, 0.6]]
  }), /*#__PURE__*/React.createElement(MisFinanzas, {
    seccion: vistaActual,
    cuentas: /*#__PURE__*/React.createElement(Cuentas, {
      cuentas: cuentas,
      onAgregar: agregarCuenta,
      onActualizar: actualizarCuenta,
      onEliminar: eliminarCuenta
    }),
    inversiones: /*#__PURE__*/React.createElement(Inversiones, {
      inversiones: inversiones,
      onAgregar: agregarInversion,
      onActualizar: actualizarInversion,
      onEliminar: eliminarInversion
    }),
    patrimonio: /*#__PURE__*/React.createElement(Patrimonio, {
      cuentas: cuentas,
      inversiones: inversiones,
      activos: activos,
      deudas: datos.deudas,
      onAgregarActivo: agregarActivo,
      onActualizarActivo: actualizarActivo,
      onEliminarActivo: eliminarActivo,
      onIrACuentas: () => irAParteMisFinanzas('cuentas'),
      onIrAInversiones: () => irAParteMisFinanzas('inversiones'),
      onIrASimuladorDeudas: () => setVistaActual('simulador-deudas'),
      onIrADiagnostico: () => {
        setIrADeudas(true);
        setVistaActual('diagnostico');
      }
    })
  }), /*#__PURE__*/React.createElement(ContinuarBar, {
    label: "Ver mis resultados",
    onClick: () => setVistaActual('estrategia'),
    backLabel: "Volver a Diagnóstico",
    onBack: () => setVistaActual('diagnostico')
  })), vistaActual === 'estrategia' && /*#__PURE__*/React.createElement("div", {
    key: "estrategia",
    className: "fade-switch-enter mp-piel"
  }, /*#__PURE__*/React.createElement(CabeceraHerramienta, {
    id: "mp-cab-est",
    antetitulo: "Resultados y estrategia",
    titulo: "Tu salud financiera, en una sola vista",
    frase: "Aquí se concentran las métricas clave, el perfil de riesgo y las decisiones que puedes tomar a continuación.",
    iconos: [["barras", 0.34, 0.2, 0.9, -0.3], ["moneda", 0.58, -0.25, 0.75, 0.8], ["flecha", 0.8, 0.3, 0.8, 0.3], ["moneda", 0.97, -0.2, 0.55, 1.6]]
  }), /*#__PURE__*/React.createElement("section", {
    className: "py-16 sm:py-24 section-tinted"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-6xl mx-auto px-4 sm:px-6 space-y-12"
  }, (() => {
    const faltan = [];
    if (cuentas.length === 0) faltan.push(["cuentas", "Añadir mis cuentas"]);
    if (inversiones.length === 0) faltan.push(["inversiones", "Añadir mis inversiones"]);
    if (activos.length === 0) faltan.push(["patrimonio", "Añadir otros bienes"]);
    if (faltan.length === 0) return null;
    return /*#__PURE__*/React.createElement("div", {
      className: "max-w-3xl rounded-2xl p-5",
      style: { backgroundColor: C.white, border: "1px solid " + C.border }
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-sm font-bold",
      style: { color: C.ink }
    }, "Afina tus resultados (opcional)"), /*#__PURE__*/React.createElement("p", {
      className: "text-sm mt-1 mb-3",
      style: { color: C.muted }
    }, "Estos resultados se basan en lo que indicaste en el diagnóstico. Si añades tus cuentas, inversiones y otros bienes, serán más precisos."), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap gap-2"
    }, faltan.map(([id, texto]) => /*#__PURE__*/React.createElement("button", {
      key: id,
      type: "button",
      onClick: () => setVistaActual(id),
      className: "text-xs font-bold px-3 py-2 rounded-lg border",
      style: { borderColor: C.border, color: C.ink, backgroundColor: C.white }
    }, texto))));
  })(), /*#__PURE__*/React.createElement(PanelDiagnostico, {
    diagnostico: diagnosticoAmpliado,
    onIrABlog: irAlBlog
  }), /*#__PURE__*/React.createElement(PanelPrioridad, {
    prioridad: prioridadActual
  }), /*#__PURE__*/React.createElement(Dashboard, {
    planObjetivos: planObjetivos,
    objetivos: normalizarObjetivos(datos),
    ingresos: capacidadFinanciera.ingresos,
    gastoTotal: gastoTotal,
    ahorroDisponible: ahorroDisponible,
    ratioAhorro: ratioAhorro,
    ahorroActual: liquidezReal,
    cargaDeuda: capacidadFinanciera.ingresos > 0 ? cuotasDeuda / capacidadFinanciera.ingresos : 0,
    perfil: perfil,
    historial: historial,
    user: user,
    onOpenAuth: () => setShowAuthModal(true)
  }), datos.deudas.some(d => Number(d.pendiente) > 0) && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "max-w-3xl mb-5 section-intro"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Plan de amortización"), /*#__PURE__*/React.createElement("h3", {
    className: "font-serif text-2xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, "Sal de la deuda con un orden claro"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setVistaActual('simulador-deudas'),
    className: "text-xs font-bold mt-3 underline",
    style: {
      color: C.navy
    }
  }, "Probar otras combinaciones en el simulador de deudas")), /*#__PURE__*/React.createElement(AmortizacionDeuda, {
    deudas: datos.deudas
  })), /*#__PURE__*/React.createElement("div", {
    className: "rounded-2xl p-5 sm:p-6",
    style: {
      backgroundColor: "rgba(79,70,229,.06)",
      border: "1px solid rgba(79,70,229,.14)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
    style: {
      backgroundColor: C.surface
    }
  }, /*#__PURE__*/React.createElement(I.target, {
    size: 18,
    color: C.sand
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Del objetivo a la estrategia"), /*#__PURE__*/React.createElement("h3", {
    className: "font-serif text-xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, planObjetivos.principal ? `Para “${planObjetivos.principal.nombre || OBJETIVOS_DEF.find(x => x.id === planObjetivos.principal.tipo)?.label || "tu objetivo"}”, evaluemos tu tolerancia al riesgo` : "Conectemos tus objetivos con tu perfil de riesgo"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-2",
    style: {
      color: C.muted
    }
  }, planObjetivos.principal?.horizonteAniosCalculado > 0 ? `Tu horizonte es de ${dec(planObjetivos.principal.horizonteAniosCalculado, 1)} años. El cuestionario combina ese plazo con tu tolerancia, liquidez y capacidad financiera para que la estrategia tenga sentido para tu situación.` : datos.deudas.some(d => Number(d.pendiente) > 0) ? "Con tu plan de deuda ya en marcha, veamos también qué nivel de riesgo encaja con tus objetivos y tu situación." : "El cuestionario no busca una etiqueta por sí sola: ayuda a entender qué nivel de riesgo encaja con tus objetivos y tu situación.")))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-6"
  }, /*#__PURE__*/React.createElement(PerfilRiesgo, {
    onPerfilCalculado: (nuevoPerfil, nuevoDetalle) => {
      setPerfil(nuevoPerfil);
      setPerfilDetalle(nuevoDetalle);
    },
    quizState: quizState,
    setQuizState: setQuizState,
    datos: datos
  }), /*#__PURE__*/React.createElement(Estrategia, {
    perfil: perfil,
    onGoToPerfil: () => setVistaActual('estrategia'),
    onGoToSimulador: () => setVistaActual('simulador'),
    setSim: setSim,
    ahorroDisponible: ahorroDisponible,
    datos: datos,
    onSeleccionarObjetivo: setObjetivoSeleccionadoId
  }), /*#__PURE__*/React.createElement(ContinuarBar, {
    label: "Continuar a Plan",
    onClick: () => setVistaActual('plan'),
    backLabel: "Volver a Diagnóstico",
    onBack: () => setVistaActual('diagnostico')
  }))))), vistaActual === 'plan' && /*#__PURE__*/React.createElement("div", {
    key: "plan",
    className: "fade-switch-enter mp-piel"
  }, /*#__PURE__*/React.createElement(CabeceraHerramienta, {
    id: "mp-cab-plan",
    antetitulo: "Tu plan",
    titulo: "Tu plan financiero, paso a paso",
    frase: "Prioridad actual, siguiente acción y las fases que vendrán después, calculado con todos tus datos.",
    iconos: [["flecha", 0.34, 0.25, 0.85, 0.2], ["barras", 0.58, -0.22, 0.8, -0.3], ["moneda", 0.8, 0.3, 0.75, 0.9], ["moneda", 0.97, -0.25, 0.55, 1.8]]
  }), /*#__PURE__*/React.createElement("section", {
    className: "py-16 sm:py-24 section-tinted"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-4xl mx-auto px-4 sm:px-6 space-y-6"
  }, /*#__PURE__*/React.createElement(PlanFinanciero, {
    plan: planFinanciero,
    datos: datos,
    setDatos: setDatos,
    liquidezReal: liquidezReal,
    cuentas: cuentas,
    perfil: perfil,
    ratioAhorro: ratioAhorro,
    onIrABlog: irAlBlog
  }), /*#__PURE__*/React.createElement(ContinuarBar, {
    label: "Continuar a Seguimiento",
    onClick: () => setVistaActual('seguimiento'),
    backLabel: "Volver a Estrategia",
    onBack: () => setVistaActual('estrategia')
  })))), vistaActual === 'seguimiento' && /*#__PURE__*/React.createElement("div", {
    key: "seguimiento",
    className: "fade-switch-enter mp-piel"
  }, /*#__PURE__*/React.createElement(CabeceraHerramienta, {
    id: "mp-cab-seg",
    antetitulo: "Tu evolución",
    titulo: "¿Estás avanzando?",
    frase: "Guarda una foto de tu situación cada vez que quieras, y compárala con las anteriores.",
    iconos: [["barras", 0.34, 0.2, 0.9, -0.3], ["flecha", 0.58, -0.22, 0.8, 0.3], ["moneda", 0.8, 0.3, 0.75, 1.1], ["tarjeta", 0.97, -0.2, 0.6, -0.5]]
  }), /*#__PURE__*/React.createElement("section", {
    className: "py-16 sm:py-24 section-tinted"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-4xl mx-auto px-4 sm:px-6 space-y-6"
  }, /*#__PURE__*/React.createElement(Seguimiento, {
    user: user,
    historial: historialSeguimiento,
    cargando: cargandoSeguimiento,
    onRegistrar: () => registrarSnapshot(valoresSnapshotActual, "manual"),
    onEliminar: async id => {
      const r = await eliminarRegistro(id);
      showToast(r.ok ? "Registro eliminado" : "No se pudo eliminar el registro", r.ok ? "ok" : "error");
    },
    onBorrarTodo: async () => {
      const r = await borrarHistorial();
      showToast(r.ok ? "Histórico borrado. Puedes empezar desde cero." : "No se pudo borrar el histórico", r.ok ? "ok" : "error");
    },
    onOpenAuth: () => setShowAuthModal(true)
  }), /*#__PURE__*/React.createElement(ContinuarBar, {
    label: "Probar el simulador",
    onClick: () => setVistaActual('simulador'),
    backLabel: "Volver a Plan",
    onBack: () => setVistaActual('plan')
  })))), vistaActual === 'simulador' && /*#__PURE__*/React.createElement("div", {
    key: "simulador",
    className: "fade-switch-enter mp-piel"
  }, /*#__PURE__*/React.createElement(CabeceraHerramienta, {
    id: "mp-cab-sim",
    antetitulo: "Simulador de ahorro",
    titulo: "¿Qué puede hacer tu ahorro con el tiempo?",
    frase: "Ajusta los números y mira qué puede hacer tu ahorro con el tiempo. Si ya hiciste tu diagnóstico, partirá de tus propios datos.",
    iconos: [["flecha", 0.32, 0.25, 0.85, 0.2], ["barras", 0.56, -0.25, 0.85, -0.4], ["moneda", 0.8, 0.3, 0.7, 1], ["moneda", 0.97, -0.3, 0.55, 2]]
  }), /*#__PURE__*/React.createElement("section", {
    className: "py-16 sm:py-24 section-tinted"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-6xl mx-auto px-4 sm:px-6"
  }, /*#__PURE__*/React.createElement(Simulador, {
    sim: sim,
    setSim: setSim,
    objetivos: planObjetivos.objetivos,
    objetivoSeleccionadoId: objetivoSeleccionadoId || sim.objetivoId,
    onSeleccionarObjetivo: setObjetivoSeleccionadoId,
    ahorroDisponible: ahorroDisponible,
    perfil: perfil,
    onIrABlog: irAlBlog,
    diagnosticoHecho: Number(capacidadFinanciera.ingresos) > 0,
    onIrADiagnostico: () => {
      setIrADeudas(false);
      setVistaActual('diagnostico');
    },
    onIrAResultados: () => setVistaActual('estrategia')
  })))), vistaActual === 'simulador-deudas' && /*#__PURE__*/React.createElement("div", {
    key: "simulador-deudas",
    className: "fade-switch-enter mp-piel"
  }, /*#__PURE__*/React.createElement(CabeceraHerramienta, {
    id: "mp-cab-deu",
    antetitulo: "Simulador de deudas",
    titulo: "¿Cuánto tardarás en salir de tus deudas?",
    frase: "Escribe tus deudas y compara dos formas de pagarlas. Es una proyección educativa.",
    iconos: [["tarjeta", 0.34, 0.2, 0.9, -0.4], ["billete", 0.62, -0.2, 0.85, 0.5], ["moneda", 0.88, 0.3, 0.7, 0.9]]
  }), /*#__PURE__*/React.createElement("section", {
    className: "py-16 sm:py-24 section-tinted"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-6xl mx-auto px-4 sm:px-6"
  }, /*#__PURE__*/React.createElement(SimuladorDeudas, {
    deudasDiagnostico: datos.deudas,
    diagnosticoHecho: Number(capacidadFinanciera.ingresos) > 0,
    onIrADiagnostico: () => {
      setIrADeudas(false);
      setVistaActual('diagnostico');
    }
  })))), vistaActual === 'blog' && /*#__PURE__*/React.createElement("div", {
    key: "blog",
    className: "fade-switch-enter mp-piel"
  }, /*#__PURE__*/React.createElement(CabeceraHerramienta, {
    id: "mp-cab-blog",
    antetitulo: "Educación financiera",
    titulo: "Blog de finanzas personales",
    frase: "Guías claras sobre ahorro, inversión y presupuesto, además de noticias financieras y análisis de empresas cotizadas.",
    iconos: [["billete", 0.34, 0.2, 0.85, 0.4], ["barras", 0.58, -0.22, 0.8, -0.3], ["flecha", 0.8, 0.3, 0.8, 0.3], ["moneda", 0.97, -0.25, 0.55, 1.4]]
  }), /*#__PURE__*/React.createElement(React.Suspense, {
    fallback: /*#__PURE__*/React.createElement("div", {
      className: "py-20 text-center text-sm",
      style: { color: C.muted }
    }, "Cargando…")
  }, /*#__PURE__*/React.createElement(Blog, {
    user: user
  }))), vistaActual === 'aviso-legal' && /*#__PURE__*/React.createElement("div", {
    key: "aviso-legal",
    className: "fade-switch-enter mp-piel"
  }, /*#__PURE__*/React.createElement(CabeceraHerramienta, {
    id: "mp-cab-aviso",
    antetitulo: "Información legal",
    titulo: "Aviso Legal y Términos de Uso",
    frase: "Última actualización: 1 de septiembre de 2026",
    iconos: [["moneda", 0.4, 0.2, 0.75, 0.3], ["tarjeta", 0.7, -0.2, 0.8, -0.4], ["moneda", 0.95, 0.25, 0.55, 1.4]]
  }), /*#__PURE__*/React.createElement(PaginaLegal, {
    titulo: "Aviso Legal y Términos de Uso",
    sinCabecera: true
  }, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "1. Titular."), " MoneyPilot es un proyecto operado por Óscar Baca Martínez, particular residente en España, contacto: soportemoneypilot@gmail.com."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "2. Objeto."), " MoneyPilot es una herramienta informativa de educación financiera que permite analizar de forma orientativa la situación económica personal introducida por el usuario. No sustituye el asesoramiento de un profesional financiero, fiscal o legal."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "3. Ausencia de asesoramiento financiero."), " Los resultados, diagnósticos y recomendaciones generados por MoneyPilot son orientativos y educativos. No constituyen recomendación de inversión ni asesoramiento financiero personalizado bajo ninguna normativa. El usuario es el único responsable de las decisiones económicas que tome."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "4. Propiedad intelectual."), " Los contenidos, textos, diseño y código de esta web son propiedad de MoneyPilot salvo que se indique lo contrario, y no pueden reproducirse sin autorización."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "5. Publicidad."), " Esta web puede mostrar anuncios de terceros, incluido Google AdSense, para financiar el servicio gratuito."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "6. Legislación aplicable."), " Este aviso legal se rige por la legislación española."))), vistaActual === 'quienes-somos' && /*#__PURE__*/React.createElement("div", {
    key: "quienes-somos",
    className: "fade-switch-enter mp-piel"
  }, /*#__PURE__*/React.createElement(CabeceraHerramienta, {
    id: "mp-cab-qs",
    antetitulo: "Quiénes somos",
    titulo: "Educación financiera con un plan detrás",
    frase: "Un proyecto nacido de una realidad muy común: la falta de educación financiera genera estrés crónico y decisiones equivocadas.",
    iconos: [["moneda", 0.34, 0.25, 0.85, 0.3], ["flecha", 0.58, -0.22, 0.8, 0.3], ["tarjeta", 0.8, 0.3, 0.8, -0.4], ["moneda", 0.97, -0.25, 0.55, 1.6]]
  }), /*#__PURE__*/React.createElement(QuienesSomos, null)), vistaActual === 'contacto' && /*#__PURE__*/React.createElement("div", {
    key: "contacto",
    className: "fade-switch-enter mp-piel"
  }, /*#__PURE__*/React.createElement(CabeceraHerramienta, {
    id: "mp-cab-contacto",
    antetitulo: "Estamos para ayudarte",
    titulo: "Contacta con nosotros",
    frase: "¿Tienes dudas sobre algún concepto financiero, quieres comentarnos algo sobre tus objetivos o simplemente hablar con alguien sobre cómo usar mejor la herramienta? Escríbenos y te respondemos personalmente.",
    iconos: [["billete", 0.4, 0.22, 0.8, 0.4], ["moneda", 0.68, -0.22, 0.75, 0.9], ["tarjeta", 0.94, 0.25, 0.7, -0.4]]
  }), /*#__PURE__*/React.createElement(Contacto, null))), showFooterNotice && /*#__PURE__*/React.createElement("footer", {
    className: "relative z-10 border-t no-print",
    style: {
      borderColor: C.border,
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs",
    style: {
      color: C.muted
    }
  }, "Recuerda: puedes evaluar esta página de forma ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.ink
    }
  }, "anónima"), ". Tu opinión nos ayuda a mejorar y la agradecemos de verdad."), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 shrink-0"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowFeedbackModal(true),
    className: "inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg shrink-0",
    style: {
      backgroundColor: C.sand,
      color: C.white
    }
  }, "Evaluar página"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowFooterNotice(false),
    "aria-label": "Cerrar aviso",
    className: "w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/5 shrink-0",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement(I.x, {
    size: 14
  }))))), /*#__PURE__*/React.createElement("footer", {
    className: "relative z-10 border-t no-print",
    style: {
      borderColor: C.border,
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs",
    style: {
      color: C.mutedLight
    }
  }, /*#__PURE__*/React.createElement("span", null, "© ", new Date().getFullYear(), " MoneyPilot"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center justify-center gap-4"
  }, /*#__PURE__*/React.createElement("a", {
    href: blogHref,
    className: "hover:underline",
    style: {
      color: C.mutedLight
    }
  }, "Blog"), esAdminBlog ? /*#__PURE__*/React.createElement("button", {
    onClick: () => setVistaActual('blog'),
    className: "hover:underline",
    style: {
      color: C.mutedLight
    }
  }, "Gestionar blog") : null, user ? /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowCuentaModal(true),
    className: "hover:underline",
    style: {
      color: C.mutedLight
    }
  }, "Mi cuenta") : null, /*#__PURE__*/React.createElement("a", {
    href: "/privacidad.html",
    className: "hover:underline",
    style: {
      color: C.mutedLight
    }
  }, "Política de Privacidad"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setVistaActual('aviso-legal'),
    className: "hover:underline",
    style: {
      color: C.mutedLight
    }
  }, "Aviso Legal"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setVistaActual('quienes-somos'),
    className: "hover:underline",
    style: {
      color: C.mutedLight
    }
  }, "Quiénes somos"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setVistaActual('contacto'),
    className: "hover:underline",
    style: {
      color: C.mutedLight
    }
  }, "Contacto")))), showAuthModal && /*#__PURE__*/React.createElement(AuthModal, {
    onClose: () => setShowAuthModal(false),
    onAuthSuccess: () => {
      setShowAuthModal(false);
      showToast("Sesión iniciada");
    },
    signUp: signUp,
    signIn: signIn
  }), user && (() => {
    const cf = conflictoCuentas ? { etiqueta: "cuentas", c: conflictoCuentas, r: resolverConflictoCuentas } : conflictoInversiones ? { etiqueta: "inversiones", c: conflictoInversiones, r: resolverConflictoInversiones } : conflictoActivos ? { etiqueta: "otros bienes", c: conflictoActivos, r: resolverConflictoActivos } : conflictoGuia ? { etiqueta: "guías leídas", c: conflictoGuia, r: resolverConflictoGuia } : null;
    return cf ? /*#__PURE__*/React.createElement(ConflictoDatosModal, {
      key: cf.etiqueta,
      etiqueta: cf.etiqueta,
      nLocales: cf.c.locales.length,
      nNube: cf.c.nube.length,
      onNube: () => cf.r("nube"),
      onFusionar: () => cf.r("fusionar")
    }) : null;
  })(), showReinicioModal && user && /*#__PURE__*/React.createElement(ReiniciarTodoModal, {
    user: user,
    onClose: () => setShowReinicioModal(false),
    onDone: () => {
      setShowReinicioModal(false);
      reiniciar();
      showToast("Todo borrado. Puedes empezar de nuevo.");
    },
    onToast: (msg, tone) => showToast(msg, tone)
  }), showCuentaModal && user && /*#__PURE__*/React.createElement(MiCuentaModal, {
    user: user,
    onClose: () => setShowCuentaModal(false),
    onToast: (msg, tone) => showToast(msg, tone)
  }), showFeedbackModal && /*#__PURE__*/React.createElement(FeedbackModal, {
    onClose: () => setShowFeedbackModal(false)
  }), /*#__PURE__*/React.createElement(Toast, {
    toast: toast
  })), /*#__PURE__*/React.createElement(PrintSummary, {
    datos: datos,
    liquidezReal: liquidezReal,
    perfil: perfil,
    gastoTotal: gastoTotal,
    ahorroDisponible: ahorroDisponible,
    ratioAhorro: ratioAhorro
  }));
}

export const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(/*#__PURE__*/React.createElement(ErrorBoundary, null, /*#__PURE__*/React.createElement(App, null)));
