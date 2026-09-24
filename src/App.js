const { useState, useEffect, useRef, useCallback, useMemo, useId } = React;

import { C, I, OBJETIVOS_DEF, PATTERN_URI_STATIC, PERFILES_INFO } from './constantes.js';
import { calcularCapacidadFinanciera, calcularDiagnosticoAmpliado, calcularPerfilMultidimensional, calcularPlanFinanciero, calcularPlanObjetivos, calcularPrioridades, datosVacios, normalizarObjetivos, objetivoLegadoDesdeColeccion, reconstruirEstadoQuiz, totalMensual } from './calculos.js';
import { useActivosPersistidos, useActivosSync, useAuth, useCloudSync, useCuentasPersistidas, useCuentasSync, useDatosPersistidos, useDebouncedEffect, useDeudasMirrorSync, useInversionesPersistidas, useInversionesSync, useSeguimiento, useToast } from './hooks-datos.js';
import { AuthModal, ContinuarBar, ErrorBoundary, Eyebrow, FeedbackModal, Toast } from './ui-basicos.js';
import { AmortizacionDeuda, Contacto, Cuentas, Dashboard, Diagnostico, Estrategia, Inversiones, NavDesktop, PaginaLegal, PanelDiagnostico, PanelPrioridad, Patrimonio, PerfilRiesgo, PlanFinanciero, PrintSummary, Seguimiento, Simulador } from './paginas.js';
const Blog = React.lazy(() => import('./blog.js'));
import { ConfianzaPrivacidad, HeroSection } from './secciones.js';

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
      return window.localStorage.getItem("salud-financiera:ultima-vista") || "inicio";
    } catch (e) {
      return "inicio";
    }
  });
  useEffect(() => {
    if (vistaActual !== 'diagnostico') setIrADeudas(false);
  }, [vistaActual]);
  const setVistaActual = v => {
    setVistaActualBase(v);
    try {
      window.localStorage.setItem("salud-financiera:ultima-vista", v);
    } catch (e) {}
  };
  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto"
    });
  }, []);
  useEffect(() => {
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
  const [showAuthModal, setShowAuthModal] = useState(false);
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
    const cuotasDeuda = calcularCapacidadFinanciera(datos).cuotasDeuda;
    const gasto = totalMensual(datos.gastosFijos) + totalMensual(datos.gastosDiscrecionales) + cuotasDeuda;
    const ratio = datos.ingresos > 0 ? (datos.ingresos - gasto) / datos.ingresos : 0;
    setHistorial(prev => {
      const last = prev[prev.length - 1];
      if (last && Math.abs(last.ratio - ratio) < 0.001) return prev;
      return [...prev, {
        ratio,
        ts: Date.now()
      }].slice(-20);
    });
    registrarSnapshotNube(ratio);
  }, [hydrated, datos.ingresos, datos.gastosFijos, datos.gastosDiscrecionales, datos.deudas]);
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
    snapshotDone.current = false;
    setVistaActual('inicio');
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
    registrarSiHaceFalta
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
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen w-full relative no-print",
    style: {
      backgroundColor: C.bgDeep
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 pointer-events-none",
    style: {
      background: "radial-gradient(120% 100% at 50% -10%, rgba(49,46,129,0.06) 0%, rgba(49,46,129,0.10) 60%)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 pointer-events-none",
    style: {
      backgroundImage: `url(${PATTERN_URI_STATIC})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
      backgroundPosition: "center",
      opacity: 0.35,
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
      padding: "3px 6px"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "/logo-mark.png",
    alt: "",
    width: 36,
    height: 21,
    style: {
      display: "block",
      height: "21px",
      width: "auto"
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "font-serif font-bold text-sm",
    style: {
      color: C.white
    }
  }, "MoneyPilot")), /*#__PURE__*/React.createElement(NavDesktop, {
    vistaActual: vistaActual,
    setVistaActual: setVistaActual
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 shrink-0"
  }, authReady && (user ? /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hidden xl:inline text-xs font-bold max-w-40 truncate nav-link-muted"
  }, user.email), /*#__PURE__*/React.createElement("button", {
    onClick: signOut,
    className: "text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-white/10 nav-link-muted whitespace-nowrap"
  }, "Cerrar sesión")) : /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowAuthModal(true),
    className: "text-xs font-bold px-3 py-1.5 rounded-lg",
    style: {
      backgroundColor: C.sand,
      color: C.navy
    }
  }, "Guardar")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowFeedbackModal(true),
    className: "inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-white/10 whitespace-nowrap",
    style: {
      color: C.sand
    },
    title: "Evaluar página"
  }, /*#__PURE__*/React.createElement(I.clipboard, {
    size: 14
  }), "Evaluar"), /*#__PURE__*/React.createElement("button", {
    onClick: reiniciar,
    "aria-label": "Borrar datos y empezar de nuevo",
    className: "inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-white/10 nav-link-muted",
    title: "Borra tus datos guardados y vuelve a empezar"
  }, /*#__PURE__*/React.createElement(I.trash, {
    size: 13
  })))), /*#__PURE__*/React.createElement("div", {
    className: "hidden"
  }, [["inicio", "Introducción"], ["diagnostico", "Diagnóstico"], ["cuentas", "Cuentas"], ["inversiones", "Inversiones"], ["patrimonio", "Patrimonio"], ["estrategia", "Estrategia"], ["plan", "Plan"], ["seguimiento", "Seguimiento"], ["simulador", "Simulador"], ["blog", "Blog"]].map(([id, label]) => /*#__PURE__*/React.createElement("button", {
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
    className: "fade-switch-enter"
  }, /*#__PURE__*/React.createElement(Diagnostico, {
    key: irADeudas ? 'diag-deudas' : 'diag',
    irADeudas: irADeudas,
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
      setVistaActual('cuentas');
    }
  })), vistaActual === 'cuentas' && /*#__PURE__*/React.createElement("div", {
    key: "cuentas",
    className: "fade-switch-enter"
  }, /*#__PURE__*/React.createElement(Cuentas, {
    cuentas: cuentas,
    onAgregar: agregarCuenta,
    onActualizar: actualizarCuenta,
    onEliminar: eliminarCuenta
  }), /*#__PURE__*/React.createElement(ContinuarBar, {
    label: "Continuar a Inversiones",
    onClick: () => setVistaActual('inversiones')
  })), vistaActual === 'inversiones' && /*#__PURE__*/React.createElement("div", {
    key: "inversiones",
    className: "fade-switch-enter"
  }, /*#__PURE__*/React.createElement(Inversiones, {
    inversiones: inversiones,
    onAgregar: agregarInversion,
    onActualizar: actualizarInversion,
    onEliminar: eliminarInversion
  }), /*#__PURE__*/React.createElement(ContinuarBar, {
    label: "Continuar a Patrimonio",
    onClick: () => setVistaActual('patrimonio')
  })), vistaActual === 'patrimonio' && /*#__PURE__*/React.createElement("div", {
    key: "patrimonio",
    className: "fade-switch-enter"
  }, /*#__PURE__*/React.createElement(Patrimonio, {
    cuentas: cuentas,
    inversiones: inversiones,
    activos: activos,
    deudas: datos.deudas,
    onAgregarActivo: agregarActivo,
    onActualizarActivo: actualizarActivo,
    onEliminarActivo: eliminarActivo,
    onIrACuentas: () => setVistaActual('cuentas'),
    onIrAInversiones: () => setVistaActual('inversiones'),
    onIrADiagnostico: () => {
      setIrADeudas(true);
      setVistaActual('diagnostico');
    }
  }), /*#__PURE__*/React.createElement(ContinuarBar, {
    label: "Continuar a Estrategia",
    onClick: () => setVistaActual('estrategia')
  })), vistaActual === 'estrategia' && /*#__PURE__*/React.createElement("div", {
    key: "estrategia",
    className: "fade-switch-enter"
  }, /*#__PURE__*/React.createElement("section", {
    className: "py-16 sm:py-24 section-tinted"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-6xl mx-auto px-4 sm:px-6 space-y-12"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-3xl section-intro"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Resultados y estrategia"), /*#__PURE__*/React.createElement("h2", {
    className: "font-serif text-3xl sm:text-4xl font-bold mt-2",
    style: {
      color: C.ink
    }
  }, "Tu salud financiera, en una sola vista"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm sm:text-base mt-3",
    style: {
      color: C.muted
    }
  }, "Aquí se concentran las métricas clave, el perfil de riesgo y las decisiones que puedes tomar a continuación.")), /*#__PURE__*/React.createElement(PanelDiagnostico, {
    diagnostico: diagnosticoAmpliado,
    onIrABlog: () => setVistaActual('blog')
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
  }, "Sal de la deuda con un orden claro")), /*#__PURE__*/React.createElement(AmortizacionDeuda, {
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
  }, planObjetivos.principal?.horizonteAniosCalculado > 0 ? `Tu horizonte es de ${planObjetivos.principal.horizonteAniosCalculado.toFixed(1)} años. El cuestionario combina ese plazo con tu tolerancia, liquidez y capacidad financiera para que la estrategia tenga sentido para tu situación.` : datos.deudas.some(d => Number(d.pendiente) > 0) ? "Con tu plan de deuda ya en marcha, veamos también qué nivel de riesgo encaja con tus objetivos y tu situación." : "El cuestionario no busca una etiqueta por sí sola: ayuda a entender qué nivel de riesgo encaja con tus objetivos y tu situación.")))), /*#__PURE__*/React.createElement("div", {
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
    onClick: () => setVistaActual('plan')
  }))))), vistaActual === 'plan' && /*#__PURE__*/React.createElement("div", {
    key: "plan",
    className: "fade-switch-enter"
  }, /*#__PURE__*/React.createElement("section", {
    className: "py-16 sm:py-24 section-tinted"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-4xl mx-auto px-4 sm:px-6 space-y-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-3xl section-intro"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Tu plan"), /*#__PURE__*/React.createElement("h2", {
    className: "font-serif text-3xl sm:text-4xl font-bold mt-2",
    style: {
      color: C.ink
    }
  }, "Tu plan financiero, paso a paso"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm sm:text-base mt-3",
    style: {
      color: C.muted
    }
  }, "Prioridad actual, siguiente acción y las fases que vendrán después, calculado con todos tus datos.")), /*#__PURE__*/React.createElement(PlanFinanciero, {
    plan: planFinanciero,
    datos: datos,
    setDatos: setDatos,
    liquidezReal: liquidezReal,
    cuentas: cuentas,
    onIrABlog: () => setVistaActual('blog')
  }), /*#__PURE__*/React.createElement(ContinuarBar, {
    label: "Continuar a Seguimiento",
    onClick: () => setVistaActual('seguimiento')
  })))), vistaActual === 'seguimiento' && /*#__PURE__*/React.createElement("div", {
    key: "seguimiento",
    className: "fade-switch-enter"
  }, /*#__PURE__*/React.createElement("section", {
    className: "py-16 sm:py-24 section-tinted"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-4xl mx-auto px-4 sm:px-6 space-y-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-3xl section-intro"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Tu evolución"), /*#__PURE__*/React.createElement("h2", {
    className: "font-serif text-3xl sm:text-4xl font-bold mt-2",
    style: {
      color: C.ink
    }
  }, "¿Estás avanzando?"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm sm:text-base mt-3",
    style: {
      color: C.muted
    }
  }, "Guarda una foto de tu situación cada vez que quieras, y compárala con las anteriores.")), /*#__PURE__*/React.createElement(Seguimiento, {
    user: user,
    historial: historialSeguimiento,
    cargando: cargandoSeguimiento,
    onRegistrar: () => registrarSnapshot(valoresSnapshotActual, "manual"),
    onOpenAuth: () => setShowAuthModal(true)
  })))), vistaActual === 'simulador' && /*#__PURE__*/React.createElement("div", {
    key: "simulador",
    className: "fade-switch-enter"
  }, /*#__PURE__*/React.createElement("section", {
    className: "py-16 sm:py-24 section-tinted"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-6xl mx-auto px-4 sm:px-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-3xl mb-10 section-intro"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Tu proyección personalizada"), /*#__PURE__*/React.createElement("h2", {
    className: "font-serif text-3xl sm:text-4xl font-bold mt-2",
    style: {
      color: C.ink
    }
  }, "¿Qué puede hacer tu ahorro con el tiempo?"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm sm:text-base mt-3",
    style: {
      color: C.muted
    }
  }, "Este es el escenario calculado con tus propios datos: tu objetivo, tu ahorro y tu perfil de riesgo.")), /*#__PURE__*/React.createElement(Simulador, {
    sim: sim,
    setSim: setSim,
    objetivos: planObjetivos.objetivos,
    objetivoSeleccionadoId: objetivoSeleccionadoId || sim.objetivoId,
    onSeleccionarObjetivo: setObjetivoSeleccionadoId,
    ahorroDisponible: ahorroDisponible,
    perfil: perfil,
    onIrABlog: () => setVistaActual('blog')
  })))), vistaActual === 'blog' && /*#__PURE__*/React.createElement("div", {
    key: "blog",
    className: "fade-switch-enter"
  }, /*#__PURE__*/React.createElement(React.Suspense, {
    fallback: /*#__PURE__*/React.createElement("div", {
      className: "py-20 text-center text-sm",
      style: { color: C.muted }
    }, "Cargando…")
  }, /*#__PURE__*/React.createElement(Blog, {
    user: user
  }))), vistaActual === 'privacidad' && /*#__PURE__*/React.createElement("div", {
    key: "privacidad",
    className: "fade-switch-enter"
  }, /*#__PURE__*/React.createElement(PaginaLegal, {
    titulo: "Política de Privacidad"
  }, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "1. Responsable del tratamiento."), " Óscar Baca Martínez, particular residente en España, con contacto en soportemoneypilot@gmail.com, es el responsable de los datos tratados a través de MoneyPilot."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "2. Datos que recogemos."), " Los datos financieros que introduces voluntariamente en la herramienta (ingresos, gastos, ahorros) se usan únicamente para generar tu diagnóstico, además de datos técnicos de navegación (dirección IP, tipo de dispositivo, páginas visitadas) recogidos de forma automática."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "3. Cookies y publicidad."), " Este sitio utiliza cookies propias y de terceros, incluyendo Google AdSense, para mostrar anuncios personalizados según tus intereses. Google, como proveedor externo, utiliza cookies para publicar anuncios basados en tus visitas anteriores a este sitio o a otros sitios web. Puedes inhabilitar el uso de cookies de personalización de anuncios visitando la ", /*#__PURE__*/React.createElement("a", {
    href: "https://adssettings.google.com",
    target: "_blank",
    rel: "noopener",
    style: {
      color: C.sand,
      textDecoration: "underline"
    }
  }, "Configuración de anuncios de Google"), "."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "4. Finalidad del tratamiento."), " Los datos se usan para prestar el servicio solicitado, mejorar la experiencia de usuario y, en su caso, mostrar publicidad relevante a través de terceros como Google AdSense."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "5. Conservación de los datos."), " Los datos financieros que introduces se guardan en tu dispositivo y, si creas una cuenta, en la nube, únicamente mientras mantengas tu cuenta activa o decidas borrarlos tú mismo desde la propia aplicación."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "6. Derechos del usuario."), " Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición y portabilidad escribiendo a soportemoneypilot@gmail.com."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "7. Cambios en esta política."), " Esta política puede actualizarse para adaptarse a cambios legales o del servicio. Recomendamos revisarla periódicamente."))), vistaActual === 'aviso-legal' && /*#__PURE__*/React.createElement("div", {
    key: "aviso-legal",
    className: "fade-switch-enter"
  }, /*#__PURE__*/React.createElement(PaginaLegal, {
    titulo: "Aviso Legal y Términos de Uso"
  }, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "1. Titular."), " MoneyPilot es un proyecto operado por Óscar Baca Martínez, particular residente en España, contacto: soportemoneypilot@gmail.com."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "2. Objeto."), " MoneyPilot es una herramienta informativa de educación financiera que permite analizar de forma orientativa la situación económica personal introducida por el usuario. No sustituye el asesoramiento de un profesional financiero, fiscal o legal."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "3. Ausencia de asesoramiento financiero."), " Los resultados, diagnósticos y recomendaciones generados por MoneyPilot son orientativos y educativos. No constituyen recomendación de inversión ni asesoramiento financiero personalizado bajo ninguna normativa. El usuario es el único responsable de las decisiones económicas que tome."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "4. Propiedad intelectual."), " Los contenidos, textos, diseño y código de esta web son propiedad de MoneyPilot salvo que se indique lo contrario, y no pueden reproducirse sin autorización."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "5. Publicidad."), " Esta web puede mostrar anuncios de terceros, incluido Google AdSense, para financiar el servicio gratuito."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "6. Legislación aplicable."), " Este aviso legal se rige por la legislación española."))), vistaActual === 'quienes-somos' && /*#__PURE__*/React.createElement("div", {
    key: "quienes-somos",
    className: "fade-switch-enter"
  }, /*#__PURE__*/React.createElement(PaginaLegal, {
    titulo: "Quiénes somos"
  }, /*#__PURE__*/React.createElement("p", null, "Detrás de MoneyPilot hay un proyecto nacido de una realidad muy común: la falta de educación financiera genera estrés crónico y decisiones equivocadas. Somos desarrolladores y entusiastas de las finanzas personales que creemos firmemente que la tecnología debe servir para democratizar el bienestar económico."), /*#__PURE__*/React.createElement("p", null, "MoneyPilot está creado y mantenido por Óscar Baca Martínez, estudiante de Economía y apasionado de los mercados financieros, con más de 2 años gestionando su propia cartera en acciones y otros productos financieros."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "Cuál es nuestro objetivo."), " Nuestro propósito no es darte una simple hoja de cálculo matemática, sino educar, dar contexto y crear un plan de acción. Queremos ayudarte a:"), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "disc",
      paddingLeft: "1.4rem"
    }
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("b", null, "Comprar tranquilidad:"), " construyendo un escudo contra los imprevistos para blindar a tu familia y reducir tu ansiedad."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("b", null, "Salir de las deudas:"), " trazando planes exactos (como la bola de nieve o la avalancha) para que recuperes tu margen mensual."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("b", null, "Poner el tiempo a tu favor:"), " demostrando con datos reales cómo el interés compuesto y las decisiones tempranas pueden multiplicar tu patrimonio sin que sientas que sacrificas tu calidad de vida actual.")), /*#__PURE__*/React.createElement("p", null, "En definitiva, nuestro objetivo es acompañarte para que dejes de sobrevivir a fin de mes y empieces a diseñar tu libertad financiera."), /*#__PURE__*/React.createElement("p", null, "Puedes escribirnos a ", /*#__PURE__*/React.createElement("a", {
    href: "mailto:soportemoneypilot@gmail.com",
    style: {
      color: C.sand,
      textDecoration: "underline"
    }
  }, "soportemoneypilot@gmail.com"), " para cualquier duda, sugerencia o colaboración."))), vistaActual === 'contacto' && /*#__PURE__*/React.createElement("div", {
    key: "contacto",
    className: "fade-switch-enter"
  }, /*#__PURE__*/React.createElement(Contacto, null))), showFooterNotice && /*#__PURE__*/React.createElement("footer", {
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
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setVistaActual('blog'),
    className: "hover:underline",
    style: {
      color: C.mutedLight
    }
  }, "Blog"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setVistaActual('privacidad'),
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
