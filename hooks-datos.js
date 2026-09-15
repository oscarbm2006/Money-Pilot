const { useState, useEffect, useRef, useCallback, useMemo, useId } = React;

import { ACTIVOS_STORAGE_KEY, CUENTAS_STORAGE_KEY, DEUDAS_DEF, GASTOS_DISC_DEF, GASTOS_FIJOS_DEF, INVERSIONES_STORAGE_KEY, STORAGE_KEY, supa } from './constantes.js';
import { calcularPerfilMultidimensional, deudaTieneContenido, emptyCampo, mapDeudaParaSupabase, normalizarObjetivos, normalizarRespuestasQuiz, numOrNull, objetivoLegadoDesdeColeccion, reconstruirEstadoQuiz } from './calculos.js';

export function useDatosPersistidos() {
  const [ready, setReady] = useState(false);
  const [savedState, setSavedState] = useState(null);
  useEffect(() => {
    let cancelled = false;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!cancelled && raw) {
        setSavedState(JSON.parse(raw));
      }
    } catch (e) {/* sin datos guardados aún o almacenamiento no disponible */} finally {
      if (!cancelled) setReady(true);
    }
    return () => {
      cancelled = true;
    };
  }, []);
  const save = useCallback(async state => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {/* fallo silencioso */}
  }, []);
  const clear = useCallback(async () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {/* ignorar */}
  }, []);
  return {
    ready,
    savedState,
    save,
    clear
  };
}

export function crearIdCuentaLocal() {
  return "local_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

export function esIdCuentaLocal(id) {
  return typeof id === "string" && id.startsWith("local_");
}

export function mapCuentaRemotaALocal(row) {
  return {
    id: row.id,
    banco: row.banco || "",
    tipo: row.tipo || "Corriente",
    nombre: row.nombre || "",
    saldo: Number(row.saldo) || 0,
    moneda: row.moneda || "EUR"
  };
}

export function mapCuentaLocalARemota(c, userId) {
  return {
    user_id: userId,
    banco: c.banco || "",
    tipo: c.tipo || "Corriente",
    nombre: c.nombre || "",
    saldo: Number(c.saldo) || 0,
    moneda: c.moneda || "EUR"
  };
}

export function useCuentasPersistidas() {
  const [ready, setReady] = useState(false);
  const [cuentasGuardadas, setCuentasGuardadas] = useState(null);
  useEffect(() => {
    let cancelled = false;
    try {
      const raw = window.localStorage.getItem(CUENTAS_STORAGE_KEY);
      if (!cancelled && raw) setCuentasGuardadas(JSON.parse(raw));
    } catch (e) {/* sin datos guardados aún */} finally {
      if (!cancelled) setReady(true);
    }
    return () => {
      cancelled = true;
    };
  }, []);
  const save = useCallback(async cuentas => {
    try {
      window.localStorage.setItem(CUENTAS_STORAGE_KEY, JSON.stringify(cuentas));
    } catch (e) {/* fallo silencioso */}
  }, []);
  return {
    ready,
    cuentasGuardadas,
    save
  };
}

export function useCuentasSync({
  user,
  cuentas,
  setCuentas,
  onSaved
}) {
  const [cloudReady, setCloudReady] = useState(false);
  const migradoRef = useRef(false);
  useEffect(() => {
    if (!user) {
      setCloudReady(false);
      migradoRef.current = false;
      return;
    }
    let cancelled = false;
    (async () => {
      const {
        data,
        error
      } = await supa.from("cuentas").select("*").eq("user_id", user.id).order("created_at", {
        ascending: true
      });
      if (cancelled) return;
      if (!error && data) {
        if (data.length > 0) {
          setCuentas(data.map(mapCuentaRemotaALocal));
        } else if (!migradoRef.current && cuentas.length > 0) {
          const migradas = [];
          for (const c of cuentas) {
            const {
              data: fila,
              error: errIns
            } = await supa.from("cuentas").insert(mapCuentaLocalARemota(c, user.id)).select().single();
            if (!errIns && fila) migradas.push(mapCuentaRemotaALocal(fila));
          }
          if (migradas.length) setCuentas(migradas);
        }
      }
      migradoRef.current = true;
      setCloudReady(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line
  }, [user]);
  const agregarCuenta = useCallback(async nueva => {
    if (user && cloudReady) {
      const {
        data,
        error
      } = await supa.from("cuentas").insert(mapCuentaLocalARemota(nueva, user.id)).select().single();
      if (!error && data) {
        setCuentas(prev => [...prev, mapCuentaRemotaALocal(data)]);
        onSaved && onSaved("Cuenta guardada en la nube");
        return;
      }
      onSaved && onSaved("No se pudo guardar en la nube. Se guardó en este dispositivo.", "error");
    }
    setCuentas(prev => [...prev, {
      ...nueva,
      id: crearIdCuentaLocal()
    }]);
  }, [user, cloudReady, setCuentas, onSaved]);
  const actualizarCuenta = useCallback(async (id, cambios) => {
    setCuentas(prev => prev.map(c => c.id === id ? {
      ...c,
      ...cambios
    } : c));
    if (user && cloudReady && !esIdCuentaLocal(id)) {
      const payload = {};
      ["banco", "tipo", "nombre", "moneda"].forEach(k => {
        if (cambios[k] !== undefined) payload[k] = cambios[k];
      });
      if (cambios.saldo !== undefined) payload.saldo = Number(cambios.saldo) || 0;
      if (Object.keys(payload).length === 0) return;
      const {
        error
      } = await supa.from("cuentas").update(payload).eq("id", id);
      if (error) onSaved && onSaved("No se pudo actualizar en la nube.", "error");
    }
  }, [user, cloudReady, setCuentas, onSaved]);
  const eliminarCuenta = useCallback(async id => {
    setCuentas(prev => prev.filter(c => c.id !== id));
    if (user && cloudReady && !esIdCuentaLocal(id)) {
      const {
        error
      } = await supa.from("cuentas").delete().eq("id", id);
      if (error) onSaved && onSaved("No se pudo borrar en la nube.", "error");
    }
  }, [user, cloudReady, setCuentas, onSaved]);
  return {
    cloudReady,
    agregarCuenta,
    actualizarCuenta,
    eliminarCuenta
  };
}

export function useDeudasMirrorSync({
  user,
  datos,
  setDatos,
  onSaved
}) {
  const [cloudReady, setCloudReady] = useState(false);
  const migradoRef = useRef(false);
  const remoteIdsConocidosRef = useRef(new Set());
  useEffect(() => {
    if (!user) {
      setCloudReady(false);
      migradoRef.current = false;
      remoteIdsConocidosRef.current = new Set();
      return;
    }
    let cancelled = false;
    (async () => {
      const {
        data,
        error
      } = await supa.from("deudas").select("*").eq("user_id", user.id).order("created_at", {
        ascending: true
      });
      if (cancelled) return;
      if (!error && data) {
        if (data.length === 0 && !migradoRef.current) {
          const activas = (datos.deudas || []).filter(deudaTieneContenido);
          if (activas.length > 0) {
            const nuevasDeudas = [...datos.deudas];
            for (const d of activas) {
              const idx = nuevasDeudas.indexOf(d);
              const {
                data: fila,
                error: errIns
              } = await supa.from("deudas").insert(mapDeudaParaSupabase(d, user.id)).select().single();
              if (!errIns && fila && idx > -1) {
                nuevasDeudas[idx] = {
                  ...nuevasDeudas[idx],
                  _deudaRemoteId: fila.id
                };
                remoteIdsConocidosRef.current.add(fila.id);
              }
            }
            if (!cancelled) setDatos(prevDatos => ({
              ...prevDatos,
              deudas: nuevasDeudas
            }));
          }
        } else if (data.length > 0) {
          remoteIdsConocidosRef.current = new Set(data.map(r => r.id));
        }
      }
      migradoRef.current = true;
      if (!cancelled) setCloudReady(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line
  }, [user]);
  useDebouncedEffect(() => {
    if (!user || !cloudReady) return;
    (async () => {
      const actuales = datos.deudas || [];
      const idsVistos = new Set();
      let cambios = false;
      const actualizadas = [...actuales];
      for (let i = 0; i < actualizadas.length; i++) {
        const d = actualizadas[i];
        if (!deudaTieneContenido(d)) continue;
        if (d._deudaRemoteId) {
          idsVistos.add(d._deudaRemoteId);
          const {
            error
          } = await supa.from("deudas").update(mapDeudaParaSupabase(d, user.id)).eq("id", d._deudaRemoteId);
          if (error) onSaved && onSaved("No se pudo sincronizar una deuda con la nube.", "error");
        } else {
          const {
            data: fila,
            error
          } = await supa.from("deudas").insert(mapDeudaParaSupabase(d, user.id)).select().single();
          if (!error && fila) {
            actualizadas[i] = {
              ...d,
              _deudaRemoteId: fila.id
            };
            idsVistos.add(fila.id);
            cambios = true;
          }
        }
      }
      for (const idRemoto of remoteIdsConocidosRef.current) {
        if (!idsVistos.has(idRemoto)) {
          await supa.from("deudas").delete().eq("id", idRemoto);
        }
      }
      remoteIdsConocidosRef.current = idsVistos;
      if (cambios) setDatos(prevDatos => ({
        ...prevDatos,
        deudas: actualizadas
      }));
    })();
    // eslint-disable-next-line
  }, [datos.deudas, user, cloudReady], 1200);
  return {
    cloudReady
  };
}

export function crearIdInversionLocal() {
  return "local_inv_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

export function esIdInversionLocal(id) {
  return typeof id === "string" && id.startsWith("local_inv_");
}

export function mapInversionRemotaALocal(row) {
  return {
    id: row.id,
    tipo: row.tipo || "Otro",
    nombre: row.nombre || "",
    entidad: row.entidad || "",
    ticker: row.ticker || "",
    valorActual: row.valor_actual == null ? null : Number(row.valor_actual),
    totalAportado: row.total_aportado == null ? null : Number(row.total_aportado),
    moneda: row.moneda || "EUR"
  };
}

export function mapInversionLocalARemota(inv, userId) {
  return {
    user_id: userId,
    tipo: inv.tipo || "Otro",
    nombre: inv.nombre || "Sin nombre",
    entidad: inv.entidad || null,
    ticker: inv.ticker || null,
    valor_actual: numOrNull(inv.valorActual),
    total_aportado: numOrNull(inv.totalAportado),
    moneda: inv.moneda || "EUR"
  };
}

export function useInversionesPersistidas() {
  const [ready, setReady] = useState(false);
  const [inversionesGuardadas, setInversionesGuardadas] = useState(null);
  useEffect(() => {
    let cancelled = false;
    try {
      const raw = window.localStorage.getItem(INVERSIONES_STORAGE_KEY);
      if (!cancelled && raw) setInversionesGuardadas(JSON.parse(raw));
    } catch (e) {/* sin datos guardados aún */} finally {
      if (!cancelled) setReady(true);
    }
    return () => {
      cancelled = true;
    };
  }, []);
  const save = useCallback(async inversiones => {
    try {
      window.localStorage.setItem(INVERSIONES_STORAGE_KEY, JSON.stringify(inversiones));
    } catch (e) {/* fallo silencioso */}
  }, []);
  return {
    ready,
    inversionesGuardadas,
    save
  };
}

export function useInversionesSync({
  user,
  inversiones,
  setInversiones,
  onSaved
}) {
  const [cloudReady, setCloudReady] = useState(false);
  const migradoRef = useRef(false);
  useEffect(() => {
    if (!user) {
      setCloudReady(false);
      migradoRef.current = false;
      return;
    }
    let cancelled = false;
    (async () => {
      const {
        data,
        error
      } = await supa.from("inversiones").select("*").eq("user_id", user.id).order("created_at", {
        ascending: true
      });
      if (cancelled) return;
      if (!error && data) {
        if (data.length > 0) {
          setInversiones(data.map(mapInversionRemotaALocal));
        } else if (!migradoRef.current && inversiones.length > 0) {
          const migradas = [];
          for (const inv of inversiones) {
            const {
              data: fila,
              error: errIns
            } = await supa.from("inversiones").insert(mapInversionLocalARemota(inv, user.id)).select().single();
            if (!errIns && fila) migradas.push(mapInversionRemotaALocal(fila));
          }
          if (migradas.length) setInversiones(migradas);
        }
      }
      migradoRef.current = true;
      setCloudReady(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line
  }, [user]);
  const agregarInversion = useCallback(async nueva => {
    if (user && cloudReady) {
      const {
        data,
        error
      } = await supa.from("inversiones").insert(mapInversionLocalARemota(nueva, user.id)).select().single();
      if (!error && data) {
        setInversiones(prev => [...prev, mapInversionRemotaALocal(data)]);
        onSaved && onSaved("Inversión guardada en la nube");
        return;
      }
      onSaved && onSaved("No se pudo guardar en la nube. Se guardó en este dispositivo.", "error");
    }
    setInversiones(prev => [...prev, {
      ...nueva,
      id: crearIdInversionLocal()
    }]);
  }, [user, cloudReady, setInversiones, onSaved]);
  const actualizarInversion = useCallback(async (id, cambios) => {
    setInversiones(prev => prev.map(inv => inv.id === id ? {
      ...inv,
      ...cambios
    } : inv));
    if (user && cloudReady && !esIdInversionLocal(id)) {
      const payload = {};
      const mapaColumnas = {
        tipo: "tipo",
        nombre: "nombre",
        entidad: "entidad",
        ticker: "ticker",
        moneda: "moneda"
      };
      Object.entries(mapaColumnas).forEach(([campo, columna]) => {
        if (cambios[campo] !== undefined) payload[columna] = cambios[campo] || null;
      });
      if (cambios.valorActual !== undefined) payload.valor_actual = numOrNull(cambios.valorActual);
      if (cambios.totalAportado !== undefined) payload.total_aportado = numOrNull(cambios.totalAportado);
      if (Object.keys(payload).length === 0) return;
      const {
        error
      } = await supa.from("inversiones").update(payload).eq("id", id);
      if (error) onSaved && onSaved("No se pudo actualizar en la nube.", "error");
    }
  }, [user, cloudReady, setInversiones, onSaved]);
  const eliminarInversion = useCallback(async id => {
    setInversiones(prev => prev.filter(inv => inv.id !== id));
    if (user && cloudReady && !esIdInversionLocal(id)) {
      const {
        error
      } = await supa.from("inversiones").delete().eq("id", id);
      if (error) onSaved && onSaved("No se pudo borrar en la nube.", "error");
    }
  }, [user, cloudReady, setInversiones, onSaved]);
  return {
    cloudReady,
    agregarInversion,
    actualizarInversion,
    eliminarInversion
  };
}

export function crearIdActivoLocal() {
  return "local_act_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

export function esIdActivoLocal(id) {
  return typeof id === "string" && id.startsWith("local_act_");
}

export function mapActivoRemotoALocal(row) {
  return {
    id: row.id,
    tipo: row.tipo || "Otro",
    nombre: row.nombre || "",
    valorActual: Number(row.valor_actual) || 0,
    notas: row.notas || "",
    moneda: row.moneda || "EUR"
  };
}

export function mapActivoLocalARemoto(a, userId) {
  return {
    user_id: userId,
    tipo: a.tipo || "Otro",
    nombre: a.nombre || "Sin nombre",
    valor_actual: Number(a.valorActual) || 0,
    notas: a.notas || null,
    moneda: a.moneda || "EUR"
  };
}

export function useActivosPersistidos() {
  const [ready, setReady] = useState(false);
  const [activosGuardados, setActivosGuardados] = useState(null);
  useEffect(() => {
    let cancelled = false;
    try {
      const raw = window.localStorage.getItem(ACTIVOS_STORAGE_KEY);
      if (!cancelled && raw) setActivosGuardados(JSON.parse(raw));
    } catch (e) {/* sin datos guardados aún */} finally {
      if (!cancelled) setReady(true);
    }
    return () => {
      cancelled = true;
    };
  }, []);
  const save = useCallback(async activos => {
    try {
      window.localStorage.setItem(ACTIVOS_STORAGE_KEY, JSON.stringify(activos));
    } catch (e) {/* fallo silencioso */}
  }, []);
  return {
    ready,
    activosGuardados,
    save
  };
}

export function useActivosSync({
  user,
  activos,
  setActivos,
  onSaved
}) {
  const [cloudReady, setCloudReady] = useState(false);
  const migradoRef = useRef(false);
  useEffect(() => {
    if (!user) {
      setCloudReady(false);
      migradoRef.current = false;
      return;
    }
    let cancelled = false;
    (async () => {
      const {
        data,
        error
      } = await supa.from("activos").select("*").eq("user_id", user.id).order("created_at", {
        ascending: true
      });
      if (cancelled) return;
      if (!error && data) {
        if (data.length > 0) {
          setActivos(data.map(mapActivoRemotoALocal));
        } else if (!migradoRef.current && activos.length > 0) {
          const migrados = [];
          for (const a of activos) {
            const {
              data: fila,
              error: errIns
            } = await supa.from("activos").insert(mapActivoLocalARemoto(a, user.id)).select().single();
            if (!errIns && fila) migrados.push(mapActivoRemotoALocal(fila));
          }
          if (migrados.length) setActivos(migrados);
        }
      }
      migradoRef.current = true;
      setCloudReady(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line
  }, [user]);
  const agregarActivo = useCallback(async nuevo => {
    if (user && cloudReady) {
      const {
        data,
        error
      } = await supa.from("activos").insert(mapActivoLocalARemoto(nuevo, user.id)).select().single();
      if (!error && data) {
        setActivos(prev => [...prev, mapActivoRemotoALocal(data)]);
        onSaved && onSaved("Activo guardado en la nube");
        return;
      }
      onSaved && onSaved("No se pudo guardar en la nube. Se guardó en este dispositivo.", "error");
    }
    setActivos(prev => [...prev, {
      ...nuevo,
      id: crearIdActivoLocal()
    }]);
  }, [user, cloudReady, setActivos, onSaved]);
  const actualizarActivo = useCallback(async (id, cambios) => {
    setActivos(prev => prev.map(a => a.id === id ? {
      ...a,
      ...cambios
    } : a));
    if (user && cloudReady && !esIdActivoLocal(id)) {
      const payload = {};
      ["tipo", "nombre", "notas", "moneda"].forEach(k => {
        if (cambios[k] !== undefined) payload[k] = cambios[k] || null;
      });
      if (cambios.valorActual !== undefined) payload.valor_actual = Number(cambios.valorActual) || 0;
      if (Object.keys(payload).length === 0) return;
      const {
        error
      } = await supa.from("activos").update(payload).eq("id", id);
      if (error) onSaved && onSaved("No se pudo actualizar en la nube.", "error");
    }
  }, [user, cloudReady, setActivos, onSaved]);
  const eliminarActivo = useCallback(async id => {
    setActivos(prev => prev.filter(a => a.id !== id));
    if (user && cloudReady && !esIdActivoLocal(id)) {
      const {
        error
      } = await supa.from("activos").delete().eq("id", id);
      if (error) onSaved && onSaved("No se pudo borrar en la nube.", "error");
    }
  }, [user, cloudReady, setActivos, onSaved]);
  return {
    cloudReady,
    agregarActivo,
    actualizarActivo,
    eliminarActivo
  };
}

export function construirSnapshotActual({
  liquidez,
  totalInversiones,
  totalActivos,
  totalDeudas,
  coberturaMeses,
  ratioAhorro
}) {
  return {
    liquidez: Number(liquidez) || 0,
    inversiones_valor: Number(totalInversiones) || 0,
    activos_valor: Number(totalActivos) || 0,
    deuda_pendiente: Number(totalDeudas) || 0,
    ahorro_acumulado: Number(liquidez) || 0,
    patrimonio_neto: (Number(liquidez) || 0) + (Number(totalInversiones) || 0) + (Number(totalActivos) || 0) - (Number(totalDeudas) || 0),
    fondo_cobertura_meses: coberturaMeses == null ? null : Number(coberturaMeses),
    ratio_ahorro: ratioAhorro == null ? null : Number(ratioAhorro)
  };
}

export function useSeguimiento({
  user
}) {
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [cargado, setCargado] = useState(false);
  const autoRegistradoRef = useRef(false);
  useEffect(() => {
    if (!user) {
      setHistorial([]);
      setCargado(false);
      autoRegistradoRef.current = false;
      return;
    }
    let cancelled = false;
    (async () => {
      setCargando(true);
      const {
        data,
        error
      } = await supa.from("seguimiento").select("*").eq("user_id", user.id).order("registrado_at", {
        ascending: true
      });
      if (!cancelled) {
        if (!error && data) setHistorial(data);
        setCargando(false);
        setCargado(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);
  const registrarSnapshot = useCallback(async (valores, origen = "manual") => {
    if (!user) return {
      ok: false
    };
    const payload = {
      user_id: user.id,
      origen,
      ...construirSnapshotActual(valores)
    };
    const {
      data,
      error
    } = await supa.from("seguimiento").insert(payload).select().single();
    if (!error && data) {
      setHistorial(prev => [...prev, data]);
      return {
        ok: true
      };
    }
    return {
      ok: false,
      error
    };
  }, [user]);

  // Registro automático: como mucho una vez al día, en silencio, para que
  // el histórico vaya creciendo aunque el usuario no pulse nada.
  const registrarSiHaceFalta = useCallback(async valores => {
    if (!user || !cargado || autoRegistradoRef.current) return;
    const hoy = new Date().toISOString().slice(0, 10);
    const yaHoy = historial.some(h => (h.registrado_at || "").slice(0, 10) === hoy);
    autoRegistradoRef.current = true;
    if (!yaHoy) await registrarSnapshot(valores, "auto");
  }, [user, cargado, historial, registrarSnapshot]);
  return {
    historial,
    cargando,
    cargado,
    registrarSnapshot,
    registrarSiHaceFalta
  };
}

export function useToast() {
  const [toast, setToast] = useState(null);
  const hideTimer = useRef(null);
  const show = useCallback((msg, tone = "ok") => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setToast({
      msg,
      tone,
      key: Date.now()
    });
    hideTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);
  return {
    toast,
    show
  };
}

export function useDebouncedEffect(fn, deps, delay = 700) {
  const timer = useRef(null);
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(fn, delay);
    return () => timer.current && clearTimeout(timer.current);
    // eslint-disable-next-line
  }, deps);
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  useEffect(() => {
    supa.auth.getSession().then(({
      data
    }) => {
      setUser(data?.session?.user ?? null);
      setAuthReady(true);
    });
    const {
      data: listener
    } = supa.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener?.subscription?.unsubscribe();
  }, []);
  const signUp = useCallback(async (email, password) => {
    const {
      data,
      error
    } = await supa.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    return {
      data,
      error
    };
  }, []);
  const signIn = useCallback(async (email, password) => {
    const {
      data,
      error
    } = await supa.auth.signInWithPassword({
      email,
      password
    });
    return {
      data,
      error
    };
  }, []);
  const signOut = useCallback(async () => {
    await supa.auth.signOut();
  }, []);
  return {
    user,
    authReady,
    signUp,
    signIn,
    signOut
  };
}

export function useCloudSync({
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
  onSaved
}) {
  const [cloudReady, setCloudReady] = useState(false);
  const migratedRef = useRef(false);
  const skipNextSaveRef = useRef(false);
  useEffect(() => {
    if (!user) {
      setCloudReady(false);
      migratedRef.current = false;
      return;
    }
    let cancelled = false;
    (async () => {
      const [{
        data: perfilRow
      }, {
        data: historialRows
      }, {
        data: quizRow
      }] = await Promise.all([supa.from("finanzas_perfil").select("*").eq("user_id", user.id).maybeSingle(), supa.from("finanzas_historial").select("*").eq("user_id", user.id).order("created_at", {
        ascending: true
      }), supa.from("finanzas_quiz").select("*").eq("user_id", user.id).maybeSingle()]);
      if (cancelled) return;
      const hayDatosEnNube = perfilRow && Number(perfilRow.ingresos) > 0;
      if (hayDatosEnNube) {
        skipNextSaveRef.current = true;
        const datosBaseNube = {
          ingresos: Number(perfilRow.ingresos) || 0,
          gastosFijos: perfilRow.gastos_fijos || emptyCampo(GASTOS_FIJOS_DEF),
          gastosDiscrecionales: perfilRow.gastos_disc || emptyCampo(GASTOS_DISC_DEF),
          deudas: perfilRow.deudas?.length ? perfilRow.deudas : DEUDAS_DEF.map(d => ({
            ...d
          })),
          ahorroActual: Number(perfilRow.ahorro_actual) || 0,
          habito: perfilRow.habito || null,
          objetivo: perfilRow.objetivo || {
            tipo: null,
            importe: 0,
            plazoAnios: 0
          },
          objetivos: Array.isArray(perfilRow.objetivos) ? perfilRow.objetivos : perfilRow.objetivo?.objetivos || []
        };
        /* Normalizamos aquí, una sola vez, para fijar ids estables antes de
           guardar en el estado. Si no lo hiciéramos, un usuario migrado desde
           solo `objetivo` (sin `objetivos`) recibiría un id aleatorio nuevo
           cada vez que cualquier pantalla llamara a normalizarObjetivos(datos),
           rompiendo la selección del objetivo en el Simulador y el guardado
           de ediciones (ver 7.4/7.9). */
        const objetivosNubeNormalizados = normalizarObjetivos(datosBaseNube);
        const datosNube = {
          ...datosBaseNube,
          objetivos: objetivosNubeNormalizados,
          objetivo: objetivoLegadoDesdeColeccion(objetivosNubeNormalizados)
        };
        setDatos(datosNube);
        const perfilNube = perfilRow.perfil_riesgo || null;
        setPerfil(perfilNube);
        const simNube = perfilRow.sim_config?.tasa ? perfilRow.sim_config : {
          inicial: 0,
          mensual: 0,
          tasa: 6
        };
        setSim(simNube);
        setObjetivoSeleccionadoId && setObjetivoSeleccionadoId(simNube.objetivoId || null);
        if (quizRow) {
          const respuestasNube = normalizarRespuestasQuiz(quizRow.respuestas || {});
          const estadoNube = reconstruirEstadoQuiz({
            respuestas: respuestasNube,
            paso: quizRow.paso || 0,
            currentQuestionId: quizRow.current_question_id,
            questionPath: quizRow.question_path,
            terminado: !!quizRow.terminado,
            resultado: quizRow.resultado || null
          }, datosNube);
          // Si existen respuestas terminadas, recalculamos con el modelo actual para no arrastrar el antiguo score.
          const resultadoNube = estadoNube.terminado ? calcularPerfilMultidimensional(estadoNube.respuestas, datosNube) : quizRow.resultado || null;
          setQuizState({
            ...estadoNube,
            resultado: resultadoNube
          });
          setPerfil(resultadoNube?.perfil || perfilNube);
          setPerfilDetalle(resultadoNube);
        }
        setHistorial((historialRows || []).map(r => ({
          ratio: Number(r.ratio_ahorro),
          ts: new Date(r.created_at).getTime()
        })));
        migratedRef.current = true;
      } else if (!migratedRef.current && datos.ingresos > 0) {
        await migrarANube(user.id, {
          datos,
          perfil,
          sim,
          quizState,
          historial
        });
        migratedRef.current = true;
      } else {
        migratedRef.current = true;
      }
      setCloudReady(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line
  }, [user]);
  useDebouncedEffect(() => {
    if (!user || !cloudReady) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    if (datos.ingresos <= 0) return;
    Promise.all([guardarPerfilEnNube(user.id, {
      datos,
      perfil,
      sim
    }), guardarQuizEnNube(user.id, quizState)]).then(([perfilResult, quizResult]) => {
      const huboError = perfilResult?.ok === false || quizResult?.ok === false;
      if (huboError) onSaved && onSaved("No se pudo sincronizar con la nube. Tus datos siguen a salvo en este dispositivo.", "error");else onSaved && onSaved("Guardado en la nube");
    });
    // eslint-disable-next-line
  }, [user, cloudReady, datos, perfil, sim, quizState]);
  const registrarSnapshotNube = useCallback(async ratio => {
    if (!user) return;
    await supa.from("finanzas_historial").insert({
      user_id: user.id,
      ratio_ahorro: ratio
    });
  }, [user]);
  return {
    cloudReady,
    registrarSnapshotNube
  };
}

export async function guardarPerfilEnNube(userId, {
  datos,
  perfil,
  sim
}) {
  try {
    const objetivos = normalizarObjetivos(datos);
    const payload = {
      user_id: userId,
      ingresos: datos.ingresos,
      gastos_fijos: datos.gastosFijos,
      gastos_disc: datos.gastosDiscrecionales,
      deudas: datos.deudas,
      ahorro_actual: datos.ahorroActual,
      habito: datos.habito,
      objetivo: objetivoLegadoDesdeColeccion(objetivos),
      objetivos,
      perfil_riesgo: perfil,
      sim_config: sim,
      updated_at: new Date().toISOString()
    };
    const {
      error
    } = await supa.from("finanzas_perfil").upsert(payload);
    if (error) {
      /* Compatibilidad: instalaciones antiguas sin columna `objetivos`. La colección
         queda embebida en `objetivo` si ese campo es JSON; si tampoco lo admite,
         se conserva el objetivo principal sin bloquear la aplicación. */
      const {
        error: fallbackError
      } = await supa.from("finanzas_perfil").upsert({
        ...payload,
        objetivos: undefined
      });
      if (fallbackError) return {
        ok: false,
        error: fallbackError
      };
    }
    return {
      ok: true
    };
  } catch (e) {
    return {
      ok: false,
      error: e
    }; /* localStorage sigue como respaldo local */
  }
}

export async function guardarQuizEnNube(userId, quizState) {
  const filaBase = {
    user_id: userId,
    respuestas: quizState.respuestas,
    paso: quizState.paso,
    terminado: quizState.terminado,
    updated_at: new Date().toISOString()
  };
  const filaAdaptativa = {
    ...filaBase,
    current_question_id: quizState.currentQuestionId || null,
    question_path: Array.isArray(quizState.questionPath) ? quizState.questionPath : []
  };
  try {
    const {
      error
    } = await supa.from("finanzas_quiz").upsert({
      ...filaAdaptativa,
      resultado: quizState.resultado || null
    });
    if (error) {
      /* Compatibilidad con esquemas antiguos: conserva las columnas históricas. */
      const {
        error: legacyError
      } = await supa.from("finanzas_quiz").upsert({
        ...filaBase,
        resultado: quizState.resultado || null
      });
      if (legacyError) {
        const {
          error: finalError
        } = await supa.from("finanzas_quiz").upsert(filaBase);
        if (finalError) return {
          ok: false,
          error: finalError
        };
      }
    }
    return {
      ok: true
    };
  } catch (e) {
    try {
      const {
        error: legacyError
      } = await supa.from("finanzas_quiz").upsert({
        ...filaBase,
        resultado: quizState.resultado || null
      });
      if (legacyError) {
        const {
          error: finalError
        } = await supa.from("finanzas_quiz").upsert(filaBase);
        if (finalError) return {
          ok: false,
          error: finalError
        };
      }
      return {
        ok: true
      };
    } catch (_e) {
      return {
        ok: false,
        error: _e
      }; /* localStorage sigue como respaldo */
    }
  }
}

export async function migrarANube(userId, {
  datos,
  perfil,
  sim,
  quizState,
  historial
}) {
  await guardarPerfilEnNube(userId, {
    datos,
    perfil,
    sim
  });
  await guardarQuizEnNube(userId, quizState);
  if (historial && historial.length) {
    const filas = historial.map(h => ({
      user_id: userId,
      ratio_ahorro: h.ratio,
      created_at: new Date(h.ts || Date.now()).toISOString()
    }));
    try {
      await supa.from("finanzas_historial").insert(filas);
    } catch (e) {/* fallo silencioso */}
  }
}
