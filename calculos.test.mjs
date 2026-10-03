import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { cargarCalculos, cerrar } from './cargar.mjs';

let K;
before(async () => { K = await cargarCalculos(); });
after(async () => { await cerrar(); });

const casi = (a, b, tol = 0.01, msg = '') => assert.ok(Math.abs(a - b) <= tol, `${msg} esperado ≈ ${b}, obtenido ${a}`);
const sinNbsp = s => s.replace(/\u00a0/g, ' ');

// Simulador de referencia INDEPENDIENTE (mes a mes), para no comprobar una fórmula con ella misma
function capitalMesAMes(inicial, mensual, tasaAnual, meses) {
  let c = inicial;
  for (let i = 0; i < meses; i++) c = c * (1 + tasaAnual / 100 / 12) + mensual;
  return c;
}

describe('Formato de números', () => {
  test('euros: miles con punto, decimales con coma', () => {
    assert.equal(sinNbsp(K.euros(999)), '999 €');
    assert.equal(sinNbsp(K.euros(1500)), '1.500 €');
    assert.equal(sinNbsp(K.euros(1500, 2)), '1.500,00 €');
    assert.equal(sinNbsp(K.euros(1234567.891, 2)), '1.234.567,89 €');
    assert.equal(sinNbsp(K.euros(-2500.5, 2)), '-2.500,50 €');
    assert.equal(sinNbsp(K.euros(0)), '0 €');
  });
  test('euros: valores vacíos o inválidos muestran "—" y no rompen', () => {
    assert.equal(K.euros(null), '—');
    assert.equal(K.euros(undefined), '—');
    assert.equal(K.euros(NaN), '—');
  });
  test('pct', () => {
    assert.equal(K.pct(5.25), '5,3%');
    assert.equal(K.pct(1234.5), '1.234,5%');
    assert.equal(K.pct(null), '—');
  });
  test('formatMeses', () => {
    assert.equal(K.formatMeses(0), '0 meses');
    assert.equal(K.formatMeses(1), '1 mes');
    assert.equal(K.formatMeses(5), '5 meses');
    assert.equal(K.formatMeses(12), '1 año');
    assert.equal(K.formatMeses(24), '2 años');
    assert.equal(K.formatMeses(14), '1a 2m');
  });
});

describe('Gastos: conversión de frecuencias a euros al mes', () => {
  test('mensual, trimestral y anual', () => {
    const r = K.totalMensual({
      alquiler: { valor: 800, frecuencia: 'mensual' },
      seguro: { valor: 90, frecuencia: 'trimestral' },   // 30 €/mes
      tasa: { valor: 120, frecuencia: 'anual' }          // 10 €/mes
    });
    assert.equal(r, 840);
  });
  test('valores vacíos, texto o frecuencia desconocida no rompen (se tratan como mensual / 0)', () => {
    assert.equal(K.totalMensual({}), 0);
    assert.equal(K.totalMensual({ a: { valor: '', frecuencia: 'mensual' } }), 0);
    assert.equal(K.totalMensual({ a: { valor: '50', frecuencia: 'rara' } }), 50);
  });
  test('emptyCampo crea todas las categorías a 0 mensual', () => {
    const e = K.emptyCampo([{ key: 'a' }, { key: 'b' }]);
    assert.deepEqual(e, { a: { valor: 0, frecuencia: 'mensual' }, b: { valor: 0, frecuencia: 'mensual' } });
  });
});

describe('Estado de ahorro y puntuación de salud financiera', () => {
  test('estadoAhorro: umbrales 0 %, 10 % y 20 %', () => {
    assert.equal(K.estadoAhorro(-0.01).nombre, 'Construyendo tu base');
    assert.equal(K.estadoAhorro(0).nombre, 'Margen de mejora');
    assert.equal(K.estadoAhorro(0.099).nombre, 'Margen de mejora');
    assert.equal(K.estadoAhorro(0.10).nombre, 'Base saludable');
    assert.equal(K.estadoAhorro(0.199).nombre, 'Base saludable');
    assert.equal(K.estadoAhorro(0.20).nombre, 'Muy buena base');
  });
  test('puntuación máxima = 100 (ahorro ≥25 %, 6 meses de fondo, sin deuda, con perfil)', () => {
    const r = K.calcularSaludFinanciera({ ratioAhorro: 0.3, coberturaMeses: 8, cargaDeuda: 0, perfil: {} });
    assert.equal(r.score, 100);
    assert.equal(r.nombre, 'Muy buena salud');
  });
  test('puntuación mínima = 0 (sin ahorro, sin fondo, deuda ≥30 %, sin perfil)', () => {
    const r = K.calcularSaludFinanciera({ ratioAhorro: -0.5, coberturaMeses: 0, cargaDeuda: 0.5, perfil: null });
    assert.equal(r.score, 0);
    assert.equal(r.nombre, 'Construyendo tu base');
  });
  test('los valores fuera de rango se recortan (nunca da más de 100 ni menos de 0)', () => {
    const alto = K.calcularSaludFinanciera({ ratioAhorro: 5, coberturaMeses: 99, cargaDeuda: -1, perfil: {} });
    const bajo = K.calcularSaludFinanciera({ ratioAhorro: -5, coberturaMeses: -9, cargaDeuda: 9, perfil: null });
    assert.ok(alto.score <= 100 && bajo.score >= 0);
  });
  test('ponderaciones: ahorro 40, fondo 30, deuda 20, perfil 10', () => {
    const d = K.calcularSaludFinanciera({ ratioAhorro: 0.25, coberturaMeses: 0, cargaDeuda: 0.3, perfil: null }).desglose;
    assert.equal(d.ptsAhorro, 40); assert.equal(d.ptsFondo, 0); assert.equal(d.ptsDeuda, 0); assert.equal(d.ptsPerfil, 0);
    const e = K.calcularSaludFinanciera({ ratioAhorro: 0, coberturaMeses: 6, cargaDeuda: 0, perfil: {} }).desglose;
    assert.equal(e.ptsAhorro, 0); assert.equal(e.ptsFondo, 30); assert.equal(e.ptsDeuda, 20); assert.equal(e.ptsPerfil, 10);
  });
  test('umbrales de nivel: <35, <60, <80, ≥80', () => {
    // Cada caso está construido para dar exactamente esa puntuación (ahorro hasta 40, fondo hasta 30, deuda 20 sin deudas)
    const caso = (ratioAhorro, coberturaMeses) => K.calcularSaludFinanciera({ ratioAhorro, coberturaMeses, cargaDeuda: 0, perfil: null });
    assert.equal(caso(0.0875, 0).score, 34);   assert.equal(caso(0.0875, 0).nombre, 'Construyendo tu base');
    assert.equal(caso(0.09375, 0).score, 35);  assert.equal(caso(0.09375, 0).nombre, 'Margen de mejora');
    assert.equal(caso(0.24375, 0).score, 59);  assert.equal(caso(0.24375, 0).nombre, 'Margen de mejora');
    assert.equal(caso(0.25, 0).score, 60);     assert.equal(caso(0.25, 0).nombre, 'Base saludable');
    assert.equal(caso(0.25, 3.8).score, 79);   assert.equal(caso(0.25, 3.8).nombre, 'Base saludable');
    assert.equal(caso(0.25, 4).score, 80);     assert.equal(caso(0.25, 4).nombre, 'Muy buena salud');
  });
});

describe('Interés compuesto: proyección', () => {
  test('coincide con una simulación mes a mes independiente', () => {
    for (const [ini, men, tasa, anios] of [[10000, 200, 5, 10], [0, 300, 7, 30], [5000, 0, 3, 5], [1000, 50, 12, 1]]) {
      const p = K.proyeccionInteres(ini, men, tasa, anios);
      casi(p.valorFuturo, capitalMesAMes(ini, men, tasa, anios * 12), 0.01, `(${ini}, ${men}, ${tasa} %, ${anios} años)`);
    }
  });
  test('sin interés: valor futuro = inicial + aportaciones', () => {
    const p = K.proyeccionInteres(1000, 100, 0, 2);
    assert.equal(p.valorFuturo, 3400);
    assert.equal(p.totalAportado, 3400);
    assert.equal(p.interesGenerado, 0);
  });
  test('0 años: el valor futuro es el capital inicial', () => {
    const p = K.proyeccionInteres(5000, 100, 5, 0);
    assert.equal(p.valorFuturo, 5000);
    assert.equal(p.interesGenerado, 0);
  });
  test('interés generado = valor futuro − total aportado', () => {
    const p = K.proyeccionInteres(2000, 150, 6, 15);
    casi(p.interesGenerado, p.valorFuturo - p.totalAportado, 1e-9);
    assert.ok(p.interesGenerado > 0);
  });
  test('más tasa o más años nunca reducen el resultado', () => {
    assert.ok(K.proyeccionInteres(1000, 100, 6, 10).valorFuturo > K.proyeccionInteres(1000, 100, 4, 10).valorFuturo);
    assert.ok(K.proyeccionInteres(1000, 100, 5, 20).valorFuturo > K.proyeccionInteres(1000, 100, 5, 10).valorFuturo);
  });
});

describe('Objetivos: tiempo, aportación y rentabilidad necesarios', () => {
  test('tiempo: objetivo ya alcanzado', () => {
    const r = K.tiempoNecesarioParaObjetivo(5000, 100, 5, 4000);
    assert.equal(r.alcanzado, true); assert.equal(r.anios, 0); assert.equal(r.meses, 0);
  });
  test('tiempo: 100 €/mes sin interés para 1.200 € = 12 meses justos', () => {
    const r = K.tiempoNecesarioParaObjetivo(0, 100, 0, 1200);
    assert.equal(r.alcanzado, true); assert.equal(r.anios, 1); assert.equal(r.meses, 0);
    assert.equal(r.interesGenerado, 0);
  });
  test('tiempo: con interés, al plazo devuelto se alcanza el objetivo y un mes antes no', () => {
    const objetivo = 50000;
    const r = K.tiempoNecesarioParaObjetivo(2000, 300, 5, objetivo);
    const meses = r.anios * 12 + r.meses;
    assert.ok(capitalMesAMes(2000, 300, 5, meses) >= objetivo);
    assert.ok(capitalMesAMes(2000, 300, 5, meses - 1) < objetivo);
  });
  test('tiempo: sin aportar ni rentabilidad, el objetivo es inalcanzable (tope 100 años)', () => {
    const r = K.tiempoNecesarioParaObjetivo(100, 0, 0, 1000);
    assert.equal(r.alcanzado, false); assert.equal(r.anios, 100);
  });
  test('aportación necesaria: al aplicarla se alcanza justo el objetivo (con y sin interés)', () => {
    for (const [ini, obj, anios, tasa] of [[1000, 20000, 10, 5], [0, 10000, 5, 0], [5000, 50000, 20, 7]]) {
      const r = K.aportacionNecesariaParaObjetivo(ini, obj, anios, tasa);
      assert.equal(r.yaAlcanzado, false);
      casi(capitalMesAMes(ini, r.mensualNecesaria, tasa, anios * 12), obj, 0.5, `(${ini} → ${obj} en ${anios} años al ${tasa} %)`);
    }
  });
  test('aportación necesaria: si el capital inicial ya basta, es 0 y está alcanzado', () => {
    const r = K.aportacionNecesariaParaObjetivo(20000, 10000, 5, 3);
    assert.equal(r.yaAlcanzado, true); assert.equal(r.mensualNecesaria, 0);
  });
  test('aportación necesaria: nunca es negativa', () => {
    assert.ok(K.aportacionNecesariaParaObjetivo(99999, 100, 10, 5).mensualNecesaria >= 0);
  });
  test('rentabilidad necesaria: al aplicarla se alcanza el objetivo', () => {
    const r = K.rentabilidadNecesariaParaObjetivo(5000, 200, 10, 40000);
    assert.equal(r.yaAlcanzado, false); assert.equal(r.imposible, false);
    casi(K.proyeccionInteres(5000, 200, r.tasaNecesaria, 10).valorFuturo, 40000, 1);
  });
  test('rentabilidad necesaria: sin necesidad de interés → 0 % y alcanzado', () => {
    const r = K.rentabilidadNecesariaParaObjetivo(5000, 500, 10, 10000);
    assert.equal(r.yaAlcanzado, true); assert.equal(r.tasaNecesaria, 0);
  });
  test('rentabilidad necesaria: sin capital ni aportación es imposible', () => {
    const r = K.rentabilidadNecesariaParaObjetivo(0, 0, 10, 10000);
    assert.equal(r.imposible, true);
  });
  // Hallazgos de las pruebas: se registran como "pendientes" (TODO). No hacen fallar el conjunto.
  test('HALLAZGO: horizonte de 0 años con objetivo por alcanzar no debería dar "ya alcanzado"', { todo: 'aportacionNecesariaParaObjetivo con anios=0 devuelve yaAlcanzado=true aunque falte dinero' }, () => {
    const r = K.aportacionNecesariaParaObjetivo(0, 10000, 0, 5);
    assert.equal(r.yaAlcanzado, false);
  });
});

describe('Amortización de deudas', () => {
  const d = (nombre, pendiente, tasa, cuota) => ({ nombre, pendiente, tasa, cuota });

  test('sin intereses: 1.000 € con cuota de 100 € se liquida en 10 meses', () => {
    const r = K.simularAmortizacion([d('A', 1000, 0, 100)], 0, 'nieve');
    assert.equal(r.mesesTotal, 10); assert.equal(r.todasLiquidadas, true); casi(r.totalInteres, 0, 1e-9);
  });
  test('con intereses: coincide con una simulación independiente (meses e intereses)', () => {
    let saldo = 1000, interes = 0, meses = 0;
    while (saldo > 0.01 && meses < 600) { meses++; const i = saldo * 0.01; interes += i; saldo = Math.max(0, saldo + i - 100); }
    const r = K.simularAmortizacion([d('A', 1000, 12, 100)], 0, 'nieve');
    assert.equal(r.mesesTotal, meses);
    casi(r.totalInteres, interes, 0.05);
  });
  test('una cuota que no cubre los intereses nunca liquida la deuda (se corta en 480 meses)', () => {
    const r = K.simularAmortizacion([d('A', 10000, 24, 100)], 0, 'nieve');
    assert.equal(r.todasLiquidadas, false); assert.equal(r.mesesTotal, 480);
  });
  test('pagar extra reduce meses e intereses', () => {
    const base = K.simularAmortizacion([d('A', 5000, 15, 150)], 0, 'nieve');
    const extra = K.simularAmortizacion([d('A', 5000, 15, 150)], 200, 'nieve');
    assert.ok(extra.mesesTotal < base.mesesTotal && extra.totalInteres < base.totalInteres);
  });
  test('avalancha (mayor interés primero) paga menos intereses que bola de nieve en un caso clásico', () => {
    const deudas = [d('Tarjeta', 5000, 20, 100), d('Préstamo', 1000, 5, 50)];
    const av = K.simularAmortizacion(deudas, 200, 'avalancha');
    const bn = K.simularAmortizacion(deudas, 200, 'nieve');
    assert.ok(av.totalInteres <= bn.totalInteres, `avalancha ${av.totalInteres} vs nieve ${bn.totalInteres}`);
  });
  test('el orden: nieve empieza por la de menor saldo; avalancha por la de mayor interés', () => {
    const deudas = [d('Grande', 9000, 18, 200), d('Pequeña', 800, 6, 40)];
    assert.equal(K.simularAmortizacion(deudas, 100, 'nieve').orden[0].nombre, 'Pequeña');
    assert.equal(K.simularAmortizacion(deudas, 100, 'avalancha').orden[0].nombre, 'Grande');
  });
  test('los intereses totales son la suma de los de cada deuda y los saldos nunca son negativos', () => {
    const r = K.simularAmortizacion([d('A', 3000, 10, 120), d('B', 2000, 14, 90), d('C', 500, 3, 30)], 150, 'avalancha');
    casi(r.totalInteres, r.orden.reduce((s, x) => s + x.interesPagado, 0), 1e-6);
    assert.ok(r.orden.every(x => x.saldo >= 0));
  });
  test('las deudas con saldo 0 se ignoran y sin deudas devuelve 0 meses', () => {
    const r = K.simularAmortizacion([d('Vacía', 0, 5, 10)], 100, 'nieve');
    assert.equal(r.mesesTotal, 0); assert.equal(r.todasLiquidadas, true);
    assert.equal(K.simularAmortizacion([], 0, 'nieve').mesesTotal, 0);
  });
  test('datos en texto o vacíos (como llegan de un formulario) no producen NaN', () => {
    const r = K.simularAmortizacion([{ nombre: '', pendiente: '2000', tasa: '', cuota: '100' }], '', 'nieve');
    assert.ok(Number.isFinite(r.totalInteres) && Number.isFinite(r.mesesTotal));
  });
  test('HALLAZGO: el dinero sobrante al liquidar una deuda debería pasar a la siguiente en el mismo mes', { todo: 'simularAmortizacion corta el reparto extra tras la primera deuda ("break"), retrasando a veces 1 mes' }, () => {
    // A (100 €) y B (1.000 €) sin cuotas, 600 €/mes extra: lo ideal es acabar en 2 meses (100 + 500 el mes 1, 500 el mes 2)
    const r = K.simularAmortizacion([d('A', 100, 0, 0), d('B', 1000, 0, 0)], 600, 'nieve');
    assert.equal(r.mesesTotal, 2);
  });
});

describe('Capacidad de ahorro y fondo de emergencia', () => {
  const datos = (extra = {}) => ({
    ingresos: 2000, otrosIngresos: 0,
    gastosFijos: { alquiler: { valor: 700, frecuencia: 'mensual' }, seguro: { valor: 90, frecuencia: 'trimestral' } },
    gastosDiscrecionales: { ocio: { valor: 120, frecuencia: 'anual' } },
    deudas: [{ cuota: 100 }], ahorroActual: 4000, ...extra
  });
  test('capacidad mensual = ingresos − fijos − discrecionales − cuotas de deuda', () => {
    const c = K.calcularCapacidadFinanciera(datos());
    assert.equal(c.gastosFijos, 730);          // 700 + 90/3
    assert.equal(c.gastosDiscrecionales, 10);  // 120/12
    assert.equal(c.cuotasDeuda, 100);
    assert.equal(c.capacidadMensual, 1160);
  });
  test('otros ingresos se suman', () => {
    assert.equal(K.calcularCapacidadFinanciera(datos({ otrosIngresos: 300 })).capacidadMensual, 1460);
  });
  test('sin ingresos no se inventa una capacidad: devuelve null', () => {
    const c = K.calcularCapacidadFinanciera(datos({ ingresos: 0 }));
    assert.equal(c.capacidadMensual, null); assert.equal(c.capacidadParaObjetivos, null);
  });
  test('si gastas más de lo que ingresas, la capacidad es negativa pero la disponible para objetivos es 0', () => {
    const c = K.calcularCapacidadFinanciera(datos({ ingresos: 500 }));
    assert.ok(c.capacidadMensual < 0); assert.equal(c.capacidadParaObjetivos, 0);
  });
  test('las cuotas negativas o inválidas no suman', () => {
    assert.equal(K.calcularCapacidadFinanciera(datos({ deudas: [{ cuota: -50 }, { cuota: 'abc' }] })).cuotasDeuda, 0);
  });
  test('fondo de emergencia = 6 meses de gastos fijos + cuotas de deuda', () => {
    const f = K.calcularFondoEmergencia(datos());
    assert.equal(f.gastosEsenciales, 830); assert.equal(f.objetivo, 4980);
    casi(f.coberturaMeses, 4000 / 830, 1e-9); assert.equal(f.falta, 980);
  });
  test('fondo de emergencia: sin ingresos no calcula nada (null)', () => {
    const f = K.calcularFondoEmergencia(datos({ ingresos: 0 }));
    assert.equal(f.objetivo, null); assert.equal(f.coberturaMeses, null);
  });
  test('fondo de emergencia: con ahorro superior al objetivo, "falta" es 0 y no negativo', () => {
    assert.equal(K.calcularFondoEmergencia(datos({ ahorroActual: 99999 })).falta, 0);
  });
});

describe('Objetivos financieros', () => {
  test('categorías por plazo: <3 corto, <5 medio-corto, ≤10 medio, >10 largo', () => {
    assert.equal(K.objetivoHorizonte(null), 'sin definir');
    assert.equal(K.objetivoHorizonte(0), 'sin definir');
    assert.equal(K.objetivoHorizonte(2.99), 'corto');
    assert.equal(K.objetivoHorizonte(3), 'medio-corto');
    assert.equal(K.objetivoHorizonte(4.99), 'medio-corto');
    assert.equal(K.objetivoHorizonte(5), 'medio');
    assert.equal(K.objetivoHorizonte(10), 'medio');
    assert.equal(K.objetivoHorizonte(10.01), 'largo');
  });
  test('recomendación por plazo: ahorrar <3, prudencia 3-5, invertir ≥5, pendiente sin plazo', () => {
    assert.equal(K.recomendacionObjetivoPorHorizonte(2).modo, 'ahorrar');
    assert.equal(K.recomendacionObjetivoPorHorizonte(3).modo, 'prudencia');
    assert.equal(K.recomendacionObjetivoPorHorizonte(5).modo, 'invertir');
    assert.equal(K.recomendacionObjetivoPorHorizonte(null).modo, 'pendiente');
    assert.equal(K.recomendacionObjetivoPorHorizonte(0).modo, 'pendiente');
  });
  test('objetivoCalculado: aportación mensual necesaria = restante / meses', () => {
    const o = K.objetivoCalculado({ importeObjetivo: 12000, importeReservado: 2000, plazoAnios: 2 });
    assert.equal(o.importeRestante, 10000); assert.equal(o.mesesRestantes, 24);
    casi(o.aportacionNecesaria, 10000 / 24, 1e-9); assert.equal(o.progreso, 2000 / 12000 * 100);
  });
  test('objetivoCalculado: si lo reservado supera el objetivo, queda cubierto y el progreso se limita a 100', () => {
    const o = K.objetivoCalculado({ importeObjetivo: 5000, importeReservado: 9000, plazoAnios: 3 });
    assert.equal(o.cubierto, true); assert.equal(o.importeRestante, 0); assert.equal(o.progreso, 100); assert.equal(o.aportacionNecesaria, 0);
  });
  test('objetivoCalculado: sin plazo no se divide entre cero (aportación necesaria null)', () => {
    const o = K.objetivoCalculado({ importeObjetivo: 5000, importeReservado: 0, plazoAnios: 0 });
    assert.equal(o.aportacionNecesaria, null); assert.ok(!Number.isNaN(o.progreso));
  });
  test('objetivoCalculado: importes negativos se tratan como 0', () => {
    const o = K.objetivoCalculado({ importeObjetivo: -100, importeReservado: -5, plazoAnios: 2 });
    assert.equal(o.importeObjetivo, 0); assert.equal(o.importeReservado, 0);
  });
  test('la fecha objetivo se convierte en años desde hoy (aprox.)', () => {
    const f = new Date(Date.now() + 2 * 365.25 * 24 * 3600 * 1000);
    const iso = f.toISOString().slice(0, 10);
    const a = K.obtenerHorizonteAnios({ fechaObjetivo: iso });
    assert.ok(a > 1.95 && a < 2.05, `obtenido ${a}`);
  });
  test('una fecha objetivo pasada da 0 años (no negativo)', () => {
    assert.equal(K.obtenerHorizonteAnios({ fechaObjetivo: '2000-01-01' }), 0);
  });
  test('normalizarObjetivo: limpia textos, importes inválidos y prioridades desconocidas', () => {
    const o = K.normalizarObjetivo({ nombre: '  Casa  ', importe: 'abc', plazo: '5', prioridad: 'urgentísima', fecha: '31/12/2030' });
    assert.equal(o.nombre, 'Casa'); assert.equal(o.importeObjetivo, 0); assert.equal(o.plazoAnios, 5);
    assert.equal(o.prioridad, null); assert.equal(o.fechaObjetivo, null); assert.ok(o.id);
  });
});

describe('Plan de objetivos y viabilidad', () => {
  const base = (objetivos, extra = {}) => ({
    ingresos: 2500, otrosIngresos: 0,
    gastosFijos: { alquiler: { valor: 1000, frecuencia: 'mensual' } },
    gastosDiscrecionales: { ocio: { valor: 500, frecuencia: 'mensual' } },
    deudas: [], ahorroActual: 0, objetivos, ...extra
  }); // capacidad = 2500 − 1000 − 500 = 1000 €/mes

  test('un objetivo que cabe en la capacidad es viable', () => {
    const p = K.calcularPlanObjetivos(base([{ id: 'a', nombre: 'Viaje', importe: 6000, plazoAnios: 1, prioridad: 'alta' }]));
    assert.equal(p.capacidadParaObjetivos, 1000);
    assert.equal(p.objetivos[0].estadoViabilidad !== 'no_viable', true);
    assert.equal(p.conflictoObjetivos, false);
  });
  test('un objetivo que exige más que la capacidad es "no viable"', () => {
    const p = K.calcularPlanObjetivos(base([{ id: 'a', nombre: 'Casa', importe: 36000, plazoAnios: 2, prioridad: 'alta' }])); // 1.500 €/mes > 1.000
    assert.equal(p.objetivos[0].estadoViabilidad, 'no_viable');
  });
  test('si las aportaciones elegidas suman más que la capacidad hay conflicto', () => {
    const p = K.calcularPlanObjetivos(base([
      { id: 'a', importe: 10000, plazoAnios: 2, aportacionMensual: 700, prioridad: 'alta' },
      { id: 'b', importe: 10000, plazoAnios: 2, aportacionMensual: 700, prioridad: 'media' }]));
    assert.equal(p.aportacionComprometida, 1400); assert.equal(p.conflictoObjetivos, true);
  });
  test('los objetivos se ordenan por prioridad (alta, media, baja)', () => {
    const p = K.calcularPlanObjetivos(base([
      { id: 'baja', importe: 1000, plazoAnios: 1, prioridad: 'baja' },
      { id: 'alta', importe: 1000, plazoAnios: 1, prioridad: 'alta' },
      { id: 'media', importe: 1000, plazoAnios: 1, prioridad: 'media' }]));
    assert.deepEqual(p.objetivosOrdenados, ['alta', 'media', 'baja']);
  });
  test('sin ingresos no se declara nada viable ni inviable (pendiente de capacidad)', () => {
    const p = K.calcularPlanObjetivos(base([{ id: 'a', importe: 6000, plazoAnios: 1 }], { ingresos: 0 }));
    assert.equal(p.capacidadParaObjetivos, null);
    assert.equal(p.objetivos[0].estadoViabilidad, 'pendiente_capacidad');
  });
  test('un objetivo ya cubierto con lo reservado figura como completado', () => {
    const p = K.calcularPlanObjetivos(base([{ id: 'a', importe: 1000, importeReservado: 1500, plazoAnios: 1 }]));
    assert.equal(p.objetivos[0].estadoViabilidad, 'completado');
  });
  test('datos vacíos (usuario nuevo) no rompen nada', () => {
    const p = K.calcularPlanObjetivos(K.datosVacios());
    assert.deepEqual(p.objetivos, []); assert.equal(p.conflictoObjetivos, false);
  });
});

describe('Diagnóstico ampliado, prioridades y plan', () => {
  const datos = (extra = {}) => ({
    ingresos: 2000, otrosIngresos: 0,
    gastosFijos: { alquiler: { valor: 900, frecuencia: 'mensual' } },
    gastosDiscrecionales: { ocio: { valor: 200, frecuencia: 'mensual' } },
    deudas: [], ahorroActual: 6000, objetivos: [], ...extra
  });
  const diag = (d, extra = {}) => K.calcularDiagnosticoAmpliado({ datos: d, planObjetivos: K.calcularPlanObjetivos(d), ...extra });
  const titulos = a => a.map(x => x.titulo);

  test('gastar más de lo que se ingresa se marca como preocupante', () => {
    const r = diag(datos({ ingresos: 1000 }));
    assert.ok(titulos(r.preocupantes).includes('Gastas más de lo que ingresas'));
  });
  test('margen de ahorro: <10 % reducido; ≥10 % saludable', () => {
    assert.ok(titulos(diag(datos({ ingresos: 1200 })).preocupantes).includes('Tu margen de ahorro es reducido'));   // 100/1200 = 8 %
    assert.ok(titulos(diag(datos()).positivos).includes('Ahorras una parte saludable de tus ingresos'));            // 900/2000 = 45 %
  });
  test('fondo de emergencia: <3 meses insuficiente, 3-6 mejorable, ≥6 sólido', () => {
    // gastos esenciales = 900 €/mes
    assert.ok(titulos(diag(datos({ ahorroActual: 1000 })).preocupantes).includes('Tu colchón de emergencia es insuficiente'));
    assert.ok(titulos(diag(datos({ ahorroActual: 3600 })).preocupantes).includes('Tu fondo de emergencia es mejorable'));
    assert.ok(titulos(diag(datos({ ahorroActual: 6000 })).positivos).includes('Tu fondo de emergencia es sólido'));
  });
  test('la liquidez usa el saldo real de las cuentas si existen', () => {
    const r = diag(datos({ ahorroActual: 100 }), { cuentas: [{ saldo: 4000 }, { saldo: 2000 }] });
    assert.equal(r.liquidezReal, 6000);
  });
  test('deuda con interés ≥10 % se marca; con menos, coste moderado; sin deudas, positivo', () => {
    assert.ok(titulos(diag(datos({ deudas: [{ nombre: 'Tarjeta', pendiente: 2000, tasa: 22, cuota: 80 }] })).preocupantes).includes('Tienes deuda con un interés elevado'));
    assert.ok(titulos(diag(datos({ deudas: [{ nombre: 'Coche', pendiente: 9000, tasa: 6, cuota: 200 }] })).positivos).includes('Tu deuda actual tiene un coste moderado'));
    assert.ok(titulos(diag(datos()).positivos).includes('No tienes deudas activas registradas'));
  });
  test('deuda cara: justo en el límite (10 %) se marca; 9,99 % no; 15 % sí', () => {
    const tit = tasa => titulos(diag(datos({ deudas: [{ nombre: 'X', pendiente: 1000, tasa, cuota: 50 }] })).preocupantes);
    assert.ok(tit(10).includes('Tienes deuda con un interés elevado'));
    assert.ok(tit(15).includes('Tienes deuda con un interés elevado'));
    assert.ok(!tit(9.99).includes('Tienes deuda con un interés elevado'));
  });
  test('límites exactos: 3 meses de fondo ya es "mejorable", 6 meses ya es "sólido", 10 % de ahorro ya es saludable', () => {
    // gastos esenciales = 900 €/mes
    assert.ok(titulos(diag(datos({ ahorroActual: 2600 })).preocupantes).includes('Tu colchón de emergencia es insuficiente'));   // 2,9 meses
    assert.ok(titulos(diag(datos({ ahorroActual: 2700 })).preocupantes).includes('Tu fondo de emergencia es mejorable'));
    assert.ok(titulos(diag(datos({ ahorroActual: 5400 })).positivos).includes('Tu fondo de emergencia es sólido'));
    // ingresos 1.000 con 900 de gasto = 10 % exacto
    const d = datos({ ingresos: 1000, gastosFijos: { a: { valor: 700, frecuencia: 'mensual' } }, gastosDiscrecionales: { b: { valor: 200, frecuencia: 'mensual' } } });
    assert.ok(titulos(diag(d).positivos).includes('Ahorras una parte saludable de tus ingresos'));
  });
  test('una deuda con saldo 0 no cuenta como activa', () => {
    assert.ok(titulos(diag(datos({ deudas: [{ nombre: 'Vieja', pendiente: 0, tasa: 30, cuota: 0 }] })).positivos).includes('No tienes deudas activas registradas'));
  });
  test('cartera concentrada en un único tipo (con 2 o más inversiones) se avisa', () => {
    const inv = [{ tipo: 'Acciones', valorActual: 1000 }, { tipo: 'Acciones', valorActual: 2000 }];
    assert.ok(titulos(diag(datos(), { inversiones: inv }).preocupantes).includes('Tu cartera está concentrada en un único tipo de activo'));
    const mix = [{ tipo: 'Acciones', valorActual: 1000 }, { tipo: 'ETF', valorActual: 2000 }];
    assert.ok(titulos(diag(datos(), { inversiones: mix }).positivos).includes('Tu cartera está repartida en varios tipos de activo'));
  });
  test('sin ingresos (usuario nuevo) no hay mensajes sobre ahorro y no se rompe', () => {
    const r = diag(K.datosVacios());
    assert.ok(!titulos(r.preocupantes).includes('Gastas más de lo que ingresas'));
  });
  test('cadena completa con datos vacíos: diagnóstico → prioridades → plan, sin errores', () => {
    const d = K.datosVacios();
    const plan = K.calcularPlanObjetivos(d);
    const diagnostico = K.calcularDiagnosticoAmpliado({ datos: d, planObjetivos: plan });
    const prioridad = K.calcularPrioridades({ datos: d, planObjetivos: plan, diagnostico });
    const pf = K.calcularPlanFinanciero({ datos: d, planObjetivos: plan, diagnostico, prioridad, perfil: null });
    assert.ok(prioridad && pf);
  });
  test('cadena completa con un caso realista, sin errores ni NaN', () => {
    const d = datos({ deudas: [{ nombre: 'Tarjeta', pendiente: 3000, tasa: 20, cuota: 120 }], objetivos: [{ id: 'a', nombre: 'Viaje', importe: 3000, plazoAnios: 2, prioridad: 'alta' }] });
    const plan = K.calcularPlanObjetivos(d);
    const diagnostico = K.calcularDiagnosticoAmpliado({ datos: d, planObjetivos: plan, inversiones: [{ tipo: 'ETF', valorActual: 500 }] });
    const prioridad = K.calcularPrioridades({ datos: d, planObjetivos: plan, diagnostico });
    const pf = K.calcularPlanFinanciero({ datos: d, planObjetivos: plan, diagnostico, prioridad, perfil: null, inversiones: [{ tipo: 'ETF', valorActual: 500 }] });
    assert.ok(!JSON.stringify(pf).includes('NaN') && !JSON.stringify(prioridad).includes('NaN'));
  });
});

describe('Utilidades', () => {
  test('numOrNull', () => {
    assert.equal(K.numOrNull(''), null); assert.equal(K.numOrNull(undefined), null); assert.equal(K.numOrNull(null), null);
    assert.equal(K.numOrNull('abc'), null); assert.equal(K.numOrNull('12.5'), 12.5); assert.equal(K.numOrNull(0), 0);
  });
  test('deudaTieneContenido', () => {
    assert.equal(K.deudaTieneContenido({ pendiente: 0, nombre: '', cuota: 0, tasa: 0 }), false);
    assert.equal(K.deudaTieneContenido({ pendiente: 100 }), true);
    assert.equal(K.deudaTieneContenido({ nombre: 'Algo' }), true);
  });
  test('mapDeudaParaSupabase: valores por defecto y tae vacía = null', () => {
    const r = K.mapDeudaParaSupabase({ pendiente: '1500', cuota: '60', tasa: '' }, 'u1');
    assert.deepEqual(r, { user_id: 'u1', tipo: 'otro', nombre: 'Deuda sin nombre', saldo_pendiente: 1500, cuota_mensual: 60, tae: null });
    assert.equal(K.mapDeudaParaSupabase({ tasa: '7.5' }, 'u').tae, 7.5);
  });
  test('niceTicks: eje ascendente que empieza en 0 y cubre el máximo', () => {
    for (const max of [1, 7, 99, 1234, 56789, 1e6, 3.3e7]) {
      const { ticks, niceMax } = K.niceTicks(max);
      assert.equal(ticks[0], 0); assert.ok(niceMax >= max, `niceMax ${niceMax} < ${max}`);
      assert.ok(ticks.every((t, i) => i === 0 || t > ticks[i - 1]));
      assert.ok(ticks.length >= 2 && ticks.length <= 12, `${ticks.length} marcas para ${max}`);
    }
  });
  test('niceTicks: máximo 0, negativo o inválido no rompe', () => {
    for (const v of [0, -5, NaN, undefined]) assert.deepEqual(K.niceTicks(v), { ticks: [0], niceMax: 1 });
  });
  test('traducirErrorAuth: mensajes en español y mensaje genérico para lo desconocido', () => {
    assert.equal(K.traducirErrorAuth('Invalid login credentials'), 'Email o contraseña incorrectos.');
    assert.equal(K.traducirErrorAuth('User already registered'), 'Ya existe una cuenta con este email. Inicia sesión.');
    assert.equal(K.traducirErrorAuth('Email not confirmed').startsWith('Confirma tu email'), true);
    assert.equal(K.traducirErrorAuth('algo raro del servidor'), 'No se pudo completar la operación. Inténtalo de nuevo.');
    assert.equal(K.traducirErrorAuth(undefined), 'No se pudo completar la operación. Inténtalo de nuevo.');
  });
  test('slugify: sin tildes ni símbolos', () => {
    assert.equal(K.slugify('¿Qué es el Fondo de Emergencia?'), 'que-es-el-fondo-de-emergencia');
    assert.equal(K.slugify('  Ñandú & café  '), 'nandu-cafe');
    assert.equal(K.slugify(null), '');
  });
  test('mdToHtml: escapa HTML peligroso, admite negrita, listas y títulos', () => {
    const h = K.mdToHtml('## Título\nTexto con **negrita** y <script>alert(1)</script>\n\n- uno\n- dos');
    assert.ok(h.includes('<h2') && h.includes('<b>negrita</b>') && h.includes('<ul><li>uno</li><li>dos</li></ul>'));
    assert.ok(!h.includes('<script>') && h.includes('&lt;script&gt;'));
  });
  test('mdToHtml: no genera enlaces ni atributos a partir del texto (nada de javascript:)', () => {
    const h = K.mdToHtml('[pincha](javascript:alert(1)) <img src=x onerror=alert(1)>');
    assert.ok(!/<a\s|<img/i.test(h));
  });
  test('mdToHtml: vacío o nulo devuelve cadena vacía', () => {
    assert.equal(K.mdToHtml(''), ''); assert.equal(K.mdToHtml(null), '');
  });
});

describe('Cuestionario de perfil', () => {
  test('la ruta del cuestionario siempre termina y no repite preguntas', () => {
    const ruta = K.construirRutaQuiz({}, K.datosVacios());
    assert.ok(Array.isArray(ruta) && ruta.length > 0);
    assert.equal(new Set(ruta).size, ruta.length);
  });
  test('normalizarRespuestasQuiz acepta vacío sin romper', () => {
    assert.ok(K.normalizarRespuestasQuiz(undefined) !== undefined);
  });
});
