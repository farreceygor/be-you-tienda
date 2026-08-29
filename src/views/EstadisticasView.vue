<template>
  <div class="stats-bi min-h-screen w-full relative overflow-x-hidden text-white">

    <!-- FONDO AMBIENTAL -->
    <div class="bi-bg" aria-hidden="true"></div>
    <div class="bi-bg-grain" aria-hidden="true"></div>

    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">

      <!-- ═══ HEADER ═══ -->
      <button class="back-btn animate-fade-up" @click="$router.push({ name: 'admin' })">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Volver al panel
      </button>

      <div class="flex items-start justify-between flex-wrap gap-3 mb-5 animate-fade-up" style="animation-delay:.05s">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">Estadísticas</h1>
          <p class="text-sm text-white/45 mt-1">Business Intelligence · Cobranzas y Gastos de Be You</p>
        </div>
        <div class="flex items-center gap-2">
          <span v-if="totalPendienteHistorico > 0" class="pendiente-badge">
            ⏳ Pendiente de cobro: {{ formatARS(totalPendienteHistorico) }}
          </span>
          <button class="btn-refresh-bi" @click="recargarTodo" :disabled="cargando">
            {{ cargando ? '...' : '↻ Actualizar' }}
          </button>
        </div>
      </div>

      <!-- ═══ FILTROS TEMPORALES (PILLS) ═══ -->
      <div class="filtros-row animate-fade-up" style="animation-delay:.08s">
        <div class="filtros-pills">
          <button
            v-for="opt in opcionesPeriodo"
            :key="opt.valor"
            class="filtro-pill"
            :class="{ 'filtro-pill--active': filtroPeriodo === opt.valor }"
            @click="filtroPeriodo = opt.valor"
          >
            {{ opt.label }}
          </button>
        </div>

        <transition name="fade">
          <div v-if="filtroPeriodo === 'personalizado'" class="filtro-fechas">
            <input v-model="fechaDesdePersonalizada" type="date" class="pos-input" />
            <span class="text-white/30 text-xs">hasta</span>
            <input v-model="fechaHastaPersonalizada" type="date" class="pos-input" />
          </div>
        </transition>
      </div>

      <!-- ═══ LOADING SKELETON ═══ -->
      <div v-if="cargando" class="skeleton-grid">
        <div v-for="n in 5" :key="n" class="skeleton-card"></div>
      </div>

      <template v-else>

        <!-- ═══════════════════════════════════════════
             HERO KPIs
        ═══════════════════════════════════════════ -->
        <div class="hero-grid animate-fade-up" style="animation-delay:.12s">

          <!-- Balance Neto (destacado, ocupa más espacio) -->
          <div class="hero-card hero-card--balance" :class="balanceNetoPeriodo >= 0 ? 'hero-card--positivo' : 'hero-card--negativo'">
            <div class="hero-card__top">
              <span class="hero-card__label">Balance Neto</span>
              <span class="hero-card__estado" :class="balanceNetoPeriodo >= 0 ? 'estado--positivo' : 'estado--negativo'">
                {{ balanceNetoPeriodo >= 0 ? '✓ Positivo' : '⚠ Déficit' }}
              </span>
            </div>
            <span class="hero-card__valor hero-card__valor--gigante">{{ formatARS(balanceNetoPeriodo) }}</span>
            <span class="hero-card__delta" :class="claseDelta(deltaBalance)">
              {{ simboloDelta(deltaBalance) }} {{ Math.abs(deltaBalance) }}% vs período anterior
            </span>
          </div>

          <div class="hero-card">
            <span class="hero-card__label">💰 Total Cobrado</span>
            <span class="hero-card__valor" style="color:#34d399">{{ formatARS(totalCobradoPeriodo) }}</span>
            <span class="hero-card__delta" :class="claseDelta(deltaCobrado)">
              {{ simboloDelta(deltaCobrado) }} {{ Math.abs(deltaCobrado) }}%
            </span>
          </div>

          <div class="hero-card">
            <span class="hero-card__label">💸 Total Gastos</span>
            <span class="hero-card__valor" style="color:#f87171">{{ formatARS(totalGastadoPeriodo) }}</span>
            <span class="hero-card__delta" :class="claseDelta(deltaGastado, true)">
              {{ simboloDelta(deltaGastado) }} {{ Math.abs(deltaGastado) }}%
            </span>
          </div>

          <div class="hero-card">
            <span class="hero-card__label">📊 Margen de Ganancia</span>
            <span class="hero-card__valor" :style="{ color: margenPeriodo >= 0 ? '#34d399' : '#f87171' }">{{ margenPeriodo }}%</span>
            <span class="hero-card__delta delta-neutral">Sobre lo cobrado en el período</span>
          </div>

          <div class="hero-card">
            <span class="hero-card__label">🎟️ Ticket Promedio</span>
            <span class="hero-card__valor" style="color:#f472b6">{{ formatARS(ticketPromedioPeriodo) }}</span>
            <span class="hero-card__delta delta-neutral">{{ pedidosPagadosPeriodo.length }} venta(s) pagadas</span>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════
             EVOLUCIÓN (línea/área) + DONUT DE GASTOS
        ═══════════════════════════════════════════ -->
        <div class="grid lg:grid-cols-[1fr_360px] gap-5 mb-5 animate-fade-up" style="animation-delay:.16s">

          <!-- Evolución -->
          <section class="glass-panel">
            <div class="flex items-center justify-between flex-wrap gap-2 mb-1">
              <h2 class="panel-title" style="margin-bottom:0">
                <span class="panel-title__num">📈</span> Evolución: Ingresos vs. Gastos
              </h2>
              <div class="chart-legend">
                <span class="legend-dot" style="background:#34d399"></span> Cobros
                <span class="legend-dot" style="background:#f87171; margin-left:10px"></span> Gastos
              </div>
            </div>
            <p class="text-[11px] text-white/35 mb-3">Agrupado por {{ granularidadPeriodo === 'dia' ? 'día' : granularidadPeriodo === 'semana' ? 'semana' : 'mes' }}</p>

            <div v-if="evolucionData.length === 0" class="chart-empty">Sin movimientos en este período</div>
            <div v-else class="chart-wrap">
              <svg viewBox="0 0 600 200" preserveAspectRatio="none" class="chart-svg">
                <defs>
                  <linearGradient id="gradCobros" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#34d399" stop-opacity="0.35"/>
                    <stop offset="100%" stop-color="#34d399" stop-opacity="0"/>
                  </linearGradient>
                  <linearGradient id="gradGastos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#f87171" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="#f87171" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <!-- líneas guía -->
                <line v-for="n in 3" :key="n" x1="0" :y1="n*50" x2="600" :y2="n*50" stroke="rgba(255,255,255,0.06)" stroke-width="1" />

                <path :d="areaCobros" fill="url(#gradCobros)" stroke="none" />
                <path :d="areaGastos" fill="url(#gradGastos)" stroke="none" />
                <path :d="pathCobros" fill="none" stroke="#34d399" stroke-width="2.5" stroke-linejoin="round" />
                <path :d="pathGastos" fill="none" stroke="#f87171" stroke-width="2.5" stroke-linejoin="round" />
              </svg>
              <div class="chart-labels">
                <span v-for="(d, i) in evolucionData" :key="i" class="chart-labels__item">{{ d.label }}</span>
              </div>
            </div>
          </section>

          <!-- Donut de desglose de gastos -->
          <section class="glass-panel flex flex-col">
            <h2 class="panel-title">
              <span class="panel-title__num">🍩</span> Desglose de Gastos
            </h2>

            <div v-if="desgloseGastos.length === 0" class="chart-empty">Sin gastos en este período</div>
            <template v-else>
              <div class="donut-wrap">
                <div class="donut" :style="{ background: conicGradientGastos }">
                  <div class="donut__hole">
                    <span class="donut__total">{{ formatARS(totalGastadoPeriodo) }}</span>
                    <span class="donut__label">total</span>
                  </div>
                </div>
              </div>
              <div class="donut-legend">
                <div v-for="cat in desgloseGastos" :key="cat.label" class="donut-legend__item">
                  <span class="legend-dot" :style="{ background: cat.color }"></span>
                  <span class="donut-legend__nombre">{{ cat.label }}</span>
                  <span class="donut-legend__valor">{{ cat.porcentaje }}%</span>
                </div>
              </div>
            </template>
          </section>
        </div>

        <!-- ═══════════════════════════════════════════
             MÉTODOS DE PAGO + TOP PRODUCTOS
        ═══════════════════════════════════════════ -->
        <div class="grid lg:grid-cols-2 gap-5 mb-5 animate-fade-up" style="animation-delay:.2s">

          <!-- Métodos de pago -->
          <section class="glass-panel">
            <h2 class="panel-title">
              <span class="panel-title__num">💳</span> Rendimiento por Método de Pago
            </h2>
            <div v-if="metodosPagoPeriodo.length === 0" class="chart-empty">Sin cobros en este período</div>
            <div v-else class="metodos-lista">
              <div v-for="m in metodosPagoPeriodo" :key="m.metodo" class="metodo-row">
                <div class="metodo-row__head">
                  <span class="metodo-row__nombre">{{ m.nombre }}</span>
                  <span class="metodo-row__valor">{{ formatARS(m.total) }} <small>({{ m.qty }})</small></span>
                </div>
                <div class="metodo-row__bar-wrap">
                  <div class="metodo-row__bar" :style="{ width: m.porcentaje + '%', background: m.color }"></div>
                </div>
                <span class="metodo-row__pct">{{ m.porcentaje }}%</span>
              </div>
            </div>
          </section>

          <!-- Top productos -->
          <section class="glass-panel">
            <h2 class="panel-title">
              <span class="panel-title__num">🏆</span> Top 5 Productos
            </h2>
            <div v-if="topProductos.length === 0" class="chart-empty">Sin ventas en este período</div>
            <div v-else class="top-lista">
              <div v-for="(p, idx) in topProductos" :key="p.producto_id || p.nombre" class="top-item">
                <span class="top-item__rank">#{{ idx + 1 }}</span>
                <div class="top-item__img-wrap">
                  <img v-if="p.imagen" :src="p.imagen" :alt="p.nombre" class="top-item__img" />
                  <span v-else class="top-item__img-placeholder">✨</span>
                </div>
                <div class="top-item__info">
                  <span class="top-item__nombre">{{ p.nombre }}</span>
                  <div class="top-item__bar-wrap">
                    <div class="top-item__bar" :style="{ width: p.porcentajeBarra + '%' }"></div>
                  </div>
                </div>
                <div class="top-item__stats">
                  <span class="top-item__ingresos">{{ formatARS(p.ingresos) }}</span>
                  <span class="top-item__unidades">{{ p.cantidad }} u.</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- ═══════════════════════════════════════════
             ÚLTIMAS VENTAS (se mantiene igual, restyled)
        ═══════════════════════════════════════════ -->
        <section class="glass-panel animate-fade-up" style="animation-delay:.24s">
          <h2 class="panel-title">
            <span class="panel-title__num">🧾</span> Últimas ventas registradas
          </h2>
          <div v-if="ultimasVentas.length === 0" class="chart-empty">No hay ventas registradas aún</div>
          <div v-else class="tabla-bi-wrap">
            <table class="tabla-bi">
              <thead>
                <tr><th>#</th><th>Fecha</th><th>Cliente</th><th class="text-right">Total</th><th>Estado</th></tr>
              </thead>
              <tbody>
                <tr v-for="venta in ultimasVentas" :key="venta.id">
                  <td class="td-id">{{ venta.id }}</td>
                  <td class="td-fecha">{{ formatFecha(venta.created_at) }}</td>
                  <td>{{ venta.cliente || '—' }}</td>
                  <td class="td-total text-right">{{ formatARS(Number(venta.total)) }}</td>
                  <td><span class="estado-badge" :class="`estado-badge--${venta.estado}`">{{ venta.estado }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { fetchPedidos, fetchGastos, fetchProductosAdmin } from '../services/productoService'
import { logger } from '../lib/logger'

// ═══════════════════════════════════════════════════════════
// ESTADO ORIGINAL — INTACTO, NO SE TOCA
// ═══════════════════════════════════════════════════════════
const cargando = ref(true)
const pedidos = ref([])
const gastos = ref([])

async function cargarDatos() {
  cargando.value = true
  try {
    logger.debug('Cargando datos de estadísticas')
    const [p, g] = await Promise.all([fetchPedidos(), fetchGastos()])
    pedidos.value = p
    gastos.value  = g
    logger.info('Estadísticas cargadas', {
      pedidos: p.length,
      gastos: g.length
    })
  } catch (e) {
    logger.error('Error cargando estadísticas', e)
  } finally {
    cargando.value = false
  }
}

// ═══════════════════════════════════════════════════════════
// COMPUTADAS ORIGINALES — INTACTAS, NO SE TOCAN
// (se mantienen por si se necesitan en el futuro / compatibilidad)
// ═══════════════════════════════════════════════════════════
const metricas = computed(() => {
  const ahora       = new Date()
  const mesActual   = ahora.getMonth()
  const añoActual   = ahora.getFullYear()
  const mesAnterior = mesActual === 0 ? 11 : mesActual - 1
  const añoAnterior = mesActual === 0 ? añoActual - 1 : añoActual

  const deMesActualPagados = pedidos.value.filter(p => {
    const f = new Date(p.created_at)
    return f.getMonth() === mesActual &&
           f.getFullYear() === añoActual &&
           p.estado === 'pagado'
  })

  const deMesAnteriorPagados = pedidos.value.filter(p => {
    const f = new Date(p.created_at)
    return f.getMonth() === mesAnterior &&
           f.getFullYear() === añoAnterior &&
           p.estado === 'pagado'
  })

  const totalMesActual   = deMesActualPagados.reduce((acc, p) => acc + Number(p.total), 0)
  const totalMesAnterior = deMesAnteriorPagados.reduce((acc, p) => acc + Number(p.total), 0)

  const deltaMes     = totalMesAnterior === 0 ? 100 : Math.round(((totalMesActual - totalMesAnterior) / totalMesAnterior) * 100)
  const deltaPedidos = deMesActualPagados.length - deMesAnteriorPagados.length
  const ticketPromedio = deMesActualPagados.length > 0 ? Math.round(totalMesActual / deMesActualPagados.length) : 0

  const gastosMes = gastos.value
    .filter(g => {
      const f = new Date(g.fecha)
      return f.getMonth() === mesActual && f.getFullYear() === añoActual
    })
    .reduce((acc, g) => acc + Number(g.total), 0)

  const gananciaNeta = totalMesActual - gastosMes

  return {
    mesActual: Math.round(totalMesActual),
    pedidosMes: deMesActualPagados.length,
    gastosMes: Math.round(gastosMes),
    gananciaNeta: Math.round(gananciaNeta),
    deltaMes,
    deltaPedidos,
    ticketPromedio
  }
})

const metricasMetodos = computed(() => {
  const ahora       = new Date()
  const mesActual   = ahora.getMonth()
  const añoActual   = ahora.getFullYear()

  const deMesActual = pedidos.value.filter(p => {
    const f = new Date(p.created_at)
    return f.getMonth() === mesActual &&
           f.getFullYear() === añoActual &&
           p.estado === 'pagado'
  })

  const porMetodo = {
    efectivo: { total: 0, qty: 0 },
    transferencia: { total: 0, qty: 0 }
  }

  deMesActual.forEach(pedido => {
    const metodo = pedido.metodo_pago || 'efectivo'
    if (porMetodo[metodo]) {
      porMetodo[metodo].total += Number(pedido.total)
      porMetodo[metodo].qty++
    }
  })

  return {
    efectivo: Math.round(porMetodo.efectivo.total),
    efectivoQty: porMetodo.efectivo.qty,
    transferencia: Math.round(porMetodo.transferencia.total),
    transferenciaQty: porMetodo.transferencia.qty
  }
})

const gastosMetodosMes = computed(() => {
  const ahora       = new Date()
  const mesActual   = ahora.getMonth()
  const añoActual   = ahora.getFullYear()

  const deMes = gastos.value.filter(g => {
    const f = new Date(g.fecha)
    return f.getMonth() === mesActual && f.getFullYear() === añoActual
  })

  const porMetodo = {
    efectivo: { total: 0, qty: 0 },
    transferencia: { total: 0, qty: 0 }
  }

  deMes.forEach(gasto => {
    const metodo = gasto.metodo_pago || 'efectivo'
    if (porMetodo[metodo]) {
      porMetodo[metodo].total += Number(gasto.total)
      porMetodo[metodo].qty++
    }
  })

  return {
    efectivo: Math.round(porMetodo.efectivo.total),
    efectivoQty: porMetodo.efectivo.qty,
    transferencia: Math.round(porMetodo.transferencia.total),
    transferenciaQty: porMetodo.transferencia.qty
  }
})

const totalPendienteHistorico = computed(() => {
  return pedidos.value
    .filter(p => p.estado === 'pendiente')
    .reduce((acc, p) => acc + Number(p.total), 0)
})

const totalGastosHistorico = computed(() => {
  return gastos.value.reduce((acc, g) => acc + Number(g.total), 0)
})

const gananciaNetaRealHistorico = computed(() => {
  const totalCobradoHistorico = pedidos.value
    .filter(p => p.estado === 'pagado')
    .reduce((acc, p) => acc + Number(p.total), 0)

  return totalCobradoHistorico - totalGastosHistorico.value
})

const metricasMetodosHistorico = computed(() => {
  const porMetodo = {
    efectivo: { total: 0, qty: 0 },
    transferencia: { total: 0, qty: 0 }
  }

  pedidos.value
    .filter(p => p.estado === 'pagado')
    .forEach(pedido => {
      const metodo = pedido.metodo_pago || 'efectivo'
      if (porMetodo[metodo]) {
        porMetodo[metodo].total += Number(pedido.total)
        porMetodo[metodo].qty++
      }
    })

  return {
    efectivo: Math.round(porMetodo.efectivo.total),
    efectivoQty: porMetodo.efectivo.qty,
    transferencia: Math.round(porMetodo.transferencia.total),
    transferenciaQty: porMetodo.transferencia.qty
  }
})

const gastosMetodosHistorico = computed(() => {
  const porMetodo = {
    efectivo: { total: 0, qty: 0 },
    transferencia: { total: 0, qty: 0 }
  }

  gastos.value.forEach(gasto => {
    const metodo = gasto.metodo_pago || 'efectivo'
    if (porMetodo[metodo]) {
      porMetodo[metodo].total += Number(gasto.total)
      porMetodo[metodo].qty++
    }
  })

  return {
    efectivo: Math.round(porMetodo.efectivo.total),
    efectivoQty: porMetodo.efectivo.qty,
    transferencia: Math.round(porMetodo.transferencia.total),
    transferenciaQty: porMetodo.transferencia.qty
  }
})

const metricasHistorico = computed(() => {
  const totalCobradoHistorico = pedidos.value
    .filter(p => p.estado === 'pagado')
    .reduce((acc, p) => acc + Number(p.total), 0)

  return {
    totalCobradoHistorico: Math.round(totalCobradoHistorico)
  }
})

const ultimos7dias = computed(() => {
  const nombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const dias = []
  for (let i = 6; i >= 0; i--) {
    const fecha = new Date()
    fecha.setDate(fecha.getDate() - i)
    fecha.setHours(0,0,0,0)
    const siguiente = new Date(fecha)
    siguiente.setDate(siguiente.getDate() + 1)

    const total = pedidos.value.filter(p => {
      const f = new Date(p.created_at)
      return f >= fecha && f < siguiente && p.estado === 'pagado'
    }).reduce((acc, p) => acc + Number(p.total), 0)

    dias.push({
      fecha: fecha.toLocaleDateString(),
      diaNombre: nombres[fecha.getDay()],
      total: Math.round(total)
    })
  }
  const maxTotal = Math.max(...dias.map(d => d.total), 1)
  return dias.map(d => ({ ...d, porcentaje: Math.round((d.total / maxTotal) * 100) }))
})

const ultimasVentas = computed(() => pedidos.value.slice(0, 10))

function formatFecha(iso) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// TODO LO DE ABAJO ES NUEVO — 100% ADITIVO PARA EL DASHBOARD BI
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════

function formatARS(n) {
  return `$${Math.round(n || 0).toLocaleString('es-AR')}`
}

// ─── FILTROS DE PERÍODO ────────────────────────────────────
const opcionesPeriodo = [
  { valor: 'hoy', label: 'Hoy' },
  { valor: '7d', label: 'Últimos 7 días' },
  { valor: 'mes', label: 'Mes actual' },
  { valor: 'año', label: 'Año' },
  { valor: 'personalizado', label: 'Personalizado' }
]

const filtroPeriodo = ref('mes')
const fechaDesdePersonalizada = ref(new Date(Date.now() - 29 * 86400000).toISOString().split('T')[0])
const fechaHastaPersonalizada = ref(new Date().toISOString().split('T')[0])

function obtenerRangoPeriodo(periodo) {
  const ahora = new Date()
  let inicio, fin = new Date(ahora)
  fin.setHours(23, 59, 59, 999)

  if (periodo === 'hoy') {
    inicio = new Date(ahora); inicio.setHours(0, 0, 0, 0)
  } else if (periodo === '7d') {
    inicio = new Date(ahora); inicio.setDate(inicio.getDate() - 6); inicio.setHours(0, 0, 0, 0)
  } else if (periodo === 'año') {
    inicio = new Date(ahora.getFullYear(), 0, 1)
  } else if (periodo === 'personalizado') {
    inicio = new Date(fechaDesdePersonalizada.value + 'T00:00:00')
    fin = new Date(fechaHastaPersonalizada.value + 'T23:59:59')
  } else {
    // 'mes' por defecto
    inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
  }

  const duracionMs = fin.getTime() - inicio.getTime()
  const finAnterior = new Date(inicio.getTime() - 1)
  const inicioAnterior = new Date(finAnterior.getTime() - duracionMs)

  return { inicio, fin, inicioAnterior, finAnterior }
}

const rangoPeriodo = computed(() => obtenerRangoPeriodo(filtroPeriodo.value))

// ─── DATASETS FILTRADOS POR PERÍODO ───────────────────────
const pedidosPagadosPeriodo = computed(() => {
  const { inicio, fin } = rangoPeriodo.value
  return pedidos.value.filter(p => {
    const f = new Date(p.created_at)
    return f >= inicio && f <= fin && p.estado === 'pagado'
  })
})

const pedidosPagadosPeriodoAnterior = computed(() => {
  const { inicioAnterior, finAnterior } = rangoPeriodo.value
  return pedidos.value.filter(p => {
    const f = new Date(p.created_at)
    return f >= inicioAnterior && f <= finAnterior && p.estado === 'pagado'
  })
})

const gastosPeriodo = computed(() => {
  const { inicio, fin } = rangoPeriodo.value
  return gastos.value.filter(g => {
    const f = new Date(g.fecha + 'T12:00:00')
    return f >= inicio && f <= fin
  })
})

const gastosPeriodoAnterior = computed(() => {
  const { inicioAnterior, finAnterior } = rangoPeriodo.value
  return gastos.value.filter(g => {
    const f = new Date(g.fecha + 'T12:00:00')
    return f >= inicioAnterior && f <= finAnterior
  })
})

// ─── KPIs DEL PERÍODO ──────────────────────────────────────
const totalCobradoPeriodo = computed(() =>
  Math.round(pedidosPagadosPeriodo.value.reduce((a, p) => a + Number(p.total), 0))
)
const totalGastadoPeriodo = computed(() =>
  Math.round(gastosPeriodo.value.reduce((a, g) => a + Number(g.total), 0))
)
const balanceNetoPeriodo = computed(() => totalCobradoPeriodo.value - totalGastadoPeriodo.value)
const margenPeriodo = computed(() =>
  totalCobradoPeriodo.value > 0 ? Math.round((balanceNetoPeriodo.value / totalCobradoPeriodo.value) * 100) : 0
)
const ticketPromedioPeriodo = computed(() =>
  pedidosPagadosPeriodo.value.length > 0 ? Math.round(totalCobradoPeriodo.value / pedidosPagadosPeriodo.value.length) : 0
)

const totalCobradoAnterior = computed(() =>
  pedidosPagadosPeriodoAnterior.value.reduce((a, p) => a + Number(p.total), 0)
)
const totalGastadoAnterior = computed(() =>
  gastosPeriodoAnterior.value.reduce((a, g) => a + Number(g.total), 0)
)
const balanceAnterior = computed(() => totalCobradoAnterior.value - totalGastadoAnterior.value)

function calcularDelta(actual, anterior) {
  if (anterior === 0) return actual > 0 ? 100 : 0
  return Math.round(((actual - anterior) / Math.abs(anterior)) * 100)
}
const deltaCobrado = computed(() => calcularDelta(totalCobradoPeriodo.value, totalCobradoAnterior.value))
const deltaGastado = computed(() => calcularDelta(totalGastadoPeriodo.value, totalGastadoAnterior.value))
const deltaBalance = computed(() => calcularDelta(balanceNetoPeriodo.value, balanceAnterior.value))

function claseDelta(valor, invertido = false) {
  const esBueno = invertido ? valor <= 0 : valor >= 0
  return esBueno ? 'delta-up' : 'delta-down'
}
function simboloDelta(valor) {
  return valor >= 0 ? '↑' : '↓'
}

// ─── GRÁFICO DE EVOLUCIÓN (SVG reactivo) ──────────────────
function diasEntre(a, b) { return Math.ceil((b - a) / (1000 * 60 * 60 * 24)) }

const granularidadPeriodo = computed(() => {
  const dias = diasEntre(rangoPeriodo.value.inicio, rangoPeriodo.value.fin)
  if (dias <= 31) return 'dia'
  if (dias <= 120) return 'semana'
  return 'mes'
})

const evolucionData = computed(() => {
  const { inicio, fin } = rangoPeriodo.value
  const granularidad = granularidadPeriodo.value
  const buckets = []

  if (granularidad === 'dia') {
    let cursor = new Date(inicio)
    while (cursor <= fin) {
      const inicioB = new Date(cursor); inicioB.setHours(0, 0, 0, 0)
      const finB = new Date(cursor); finB.setHours(23, 59, 59, 999)
      buckets.push({ label: inicioB.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }), inicioB, finB })
      cursor.setDate(cursor.getDate() + 1)
    }
  } else if (granularidad === 'semana') {
    let cursor = new Date(inicio)
    while (cursor <= fin) {
      const inicioB = new Date(cursor); inicioB.setHours(0, 0, 0, 0)
      let finB = new Date(cursor); finB.setDate(finB.getDate() + 6); finB.setHours(23, 59, 59, 999)
      if (finB > fin) finB = new Date(fin)
      buckets.push({ label: `${inicioB.getDate()}/${inicioB.getMonth() + 1}`, inicioB, finB })
      cursor.setDate(cursor.getDate() + 7)
    }
  } else {
    let cursor = new Date(inicio.getFullYear(), inicio.getMonth(), 1)
    while (cursor <= fin) {
      const inicioB = new Date(cursor)
      const finB = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59, 999)
      buckets.push({ label: inicioB.toLocaleDateString('es-AR', { month: 'short' }), inicioB, finB })
      cursor.setMonth(cursor.getMonth() + 1)
    }
  }

  return buckets.map(b => {
    const cobros = pedidos.value
      .filter(p => p.estado === 'pagado' && new Date(p.created_at) >= b.inicioB && new Date(p.created_at) <= b.finB)
      .reduce((a, p) => a + Number(p.total), 0)
    const gastosB = gastos.value
      .filter(g => { const f = new Date(g.fecha + 'T12:00:00'); return f >= b.inicioB && f <= b.finB })
      .reduce((a, g) => a + Number(g.total), 0)
    return { label: b.label, cobros: Math.round(cobros), gastos: Math.round(gastosB) }
  })
})

const chartMax = computed(() => {
  const valores = evolucionData.value.flatMap(d => [d.cobros, d.gastos])
  return Math.max(...valores, 1)
})

function construirPath(valores, max, ancho = 600, alto = 180) {
  if (valores.length === 0) return ''
  if (valores.length === 1) {
    const y = alto - (valores[0] / max) * alto
    return `M0,${y.toFixed(1)} L${ancho},${y.toFixed(1)}`
  }
  const paso = ancho / (valores.length - 1)
  return valores.map((v, i) => {
    const x = i * paso
    const y = alto - (v / max) * alto
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}

function construirAreaPath(valores, max, ancho = 600, alto = 180) {
  const linea = construirPath(valores, max, ancho, alto)
  if (!linea) return ''
  const paso = ancho / Math.max(valores.length - 1, 1)
  const ultimoX = (valores.length - 1) * paso
  return `${linea} L${ultimoX.toFixed(1)},${alto} L0,${alto} Z`
}

const pathCobros = computed(() => construirPath(evolucionData.value.map(d => d.cobros), chartMax.value))
const pathGastos = computed(() => construirPath(evolucionData.value.map(d => d.gastos), chartMax.value))
const areaCobros = computed(() => construirAreaPath(evolucionData.value.map(d => d.cobros), chartMax.value))
const areaGastos = computed(() => construirAreaPath(evolucionData.value.map(d => d.gastos), chartMax.value))

// ─── DESGLOSE DE GASTOS (donut conic-gradient) ────────────
const desgloseGastos = computed(() => {
  const items = gastosPeriodo.value.reduce(
    (acc, g) => acc + (g.gasto_items || []).reduce((a, i) => a + Number(i.subtotal), 0), 0
  )
  const envios = gastosPeriodo.value.reduce((acc, g) => acc + Number(g.costo_envio || 0), 0)
  const total = items + envios

  const categorias = [
    { label: 'Productos / Insumos', valor: Math.round(items), color: '#C9748A' },
    { label: 'Envíos', valor: Math.round(envios), color: '#8B4A5C' }
  ].filter(c => c.valor > 0)

  return categorias.map(c => ({ ...c, porcentaje: total > 0 ? Math.round((c.valor / total) * 100) : 0 }))
})

const conicGradientGastos = computed(() => {
  let acumulado = 0
  const stops = desgloseGastos.value.map(c => {
    const inicio = acumulado
    acumulado += c.porcentaje
    return `${c.color} ${inicio}% ${acumulado}%`
  })
  if (stops.length === 0) return 'conic-gradient(rgba(255,255,255,0.08) 0% 100%)'
  return `conic-gradient(${stops.join(', ')})`
})

// ─── MÉTODOS DE PAGO (dinámico) ────────────────────────────
const NOMBRES_METODOS = { efectivo: 'Efectivo', transferencia: 'Transferencia', mercado_pago: 'Mercado Pago', debito: 'Débito', credito: 'Crédito' }
const COLORES_METODOS = { efectivo: '#34d399', transferencia: '#60a5fa', mercado_pago: '#38bdf8', debito: '#f472b6', credito: '#fbbf24' }

const metodosPagoPeriodo = computed(() => {
  const mapa = {}
  pedidosPagadosPeriodo.value.forEach(p => {
    const m = p.metodo_pago || 'efectivo'
    if (!mapa[m]) mapa[m] = { total: 0, qty: 0 }
    mapa[m].total += Number(p.total)
    mapa[m].qty++
  })
  const total = totalCobradoPeriodo.value
  return Object.entries(mapa)
    .map(([metodo, datos]) => ({
      metodo,
      nombre: NOMBRES_METODOS[metodo] || metodo,
      color: COLORES_METODOS[metodo] || '#C9748A',
      total: Math.round(datos.total),
      qty: datos.qty,
      porcentaje: total > 0 ? Math.round((datos.total / total) * 100) : 0
    }))
    .sort((a, b) => b.total - a.total)
})

// ─── TOP 5 PRODUCTOS ────────────────────────────────────────
const productosCatalogo = ref([])

const topProductos = computed(() => {
  const mapa = {}
  pedidosPagadosPeriodo.value.forEach(p => {
    ;(p.pedido_items || []).forEach(item => {
      const key = item.producto_id || item.nombre
      if (!mapa[key]) mapa[key] = { nombre: item.nombre, producto_id: item.producto_id, cantidad: 0, ingresos: 0 }
      mapa[key].cantidad += item.cantidad
      mapa[key].ingresos += Number(item.subtotal)
    })
  })

  const lista = Object.values(mapa).sort((a, b) => b.ingresos - a.ingresos).slice(0, 5)
  const maxIngresos = lista.length > 0 ? lista[0].ingresos : 1

  return lista.map(p => {
    const prodCatalogo = productosCatalogo.value.find(pc => pc.id === p.producto_id)
    return {
      ...p,
      ingresos: Math.round(p.ingresos),
      imagen: prodCatalogo?.imagen_url || null,
      porcentajeBarra: Math.round((p.ingresos / maxIngresos) * 100)
    }
  })
})

// ─── RECARGAR TODO (usa la función original, no la modifica) ──
async function recargarTodo() {
  await cargarDatos()
}

// ═══════════════════════════════════════════════════════════
// REALTIME — INTACTO
// ═══════════════════════════════════════════════════════════
let subscription = null

onMounted(async () => {
  await cargarDatos()

  // Aditivo: traemos el catálogo para poder mostrar imágenes en el Top 5
  try {
    productosCatalogo.value = await fetchProductosAdmin()
  } catch (e) {
    logger.error('Error cargando catálogo para Top Productos', e)
  }

  subscription = supabase
    .channel('cambios_pedidos')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'pedidos' },
      () => {
        logger.debug('📢 Pedidos actualizados')
        cargarDatos()
      }
    )
    .subscribe()
})

onUnmounted(() => {
  if (subscription) subscription.unsubscribe()
})
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════
   VARIABLES DE TEMA — mismo lenguaje visual que CobranzaView
═══════════════════════════════════════════════════════════ */
.stats-bi {
  --rose: #C9748A;
  --rose-dark: #8B4A5C;
  --glass: rgba(255, 255, 255, 0.045);
  --glass-border: rgba(255, 255, 255, 0.09);
  --radius: 14px;
  --radius-sm: 9px;
  font-family: 'Poppins', system-ui, sans-serif;
  background: #0c0a0d;
}

/* ── FONDO AMBIENTAL ── */
.bi-bg {
  position: fixed; inset: 0; z-index: 0;
  background:
    radial-gradient(ellipse 60% 50% at 15% 10%, rgba(201, 116, 138, 0.26), transparent 60%),
    radial-gradient(ellipse 55% 45% at 85% 15%, rgba(139, 74, 92, 0.22), transparent 60%),
    radial-gradient(ellipse 60% 55% at 50% 100%, rgba(90, 40, 60, 0.28), transparent 65%),
    linear-gradient(160deg, #100c10 0%, #150e13 45%, #0c0a0d 100%);
  background-size: 200% 200%, 200% 200%, 200% 200%, 100% 100%;
  animation: meshMove 20s ease-in-out infinite;
}
.bi-bg-grain {
  position: fixed; inset: 0; z-index: 1; opacity: 0.02; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
@keyframes meshMove {
  0%, 100% { background-position: 0% 0%, 100% 0%, 50% 100%, 0 0; }
  50%      { background-position: 30% 30%, 70% 40%, 40% 70%, 0 0; }
}

.animate-fade-up { animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

/* ── HEADER ── */
.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px; color: rgba(255,255,255,0.55);
  background: var(--glass); border: 1px solid var(--glass-border);
  border-radius: 50px; padding: 7px 14px; cursor: pointer;
  transition: all 0.2s ease; backdrop-filter: blur(8px); margin-bottom: 14px;
}
.back-btn:hover { color: white; border-color: rgba(255,255,255,0.2); transform: translateX(-2px); }

.pendiente-badge {
  font-size: 12px; font-weight: 600; color: #fbbf24;
  background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.3);
  padding: 6px 12px; border-radius: 50px;
}
.btn-refresh-bi {
  padding: 7px 14px; border: 1.5px solid var(--glass-border); border-radius: 50px;
  background: var(--glass); color: rgba(255,255,255,0.6); font-size: 12.5px;
  cursor: pointer; font-family: inherit; transition: all 0.2s ease;
}
.btn-refresh-bi:hover:not(:disabled) { border-color: var(--rose); color: white; }

/* ── FILTROS PILLS ── */
.filtros-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 22px; }
.filtros-pills { display: flex; gap: 6px; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 50px; padding: 4px; backdrop-filter: blur(8px); flex-wrap: wrap; }
.filtro-pill {
  padding: 7px 14px; border-radius: 50px; border: none; background: transparent;
  color: rgba(255,255,255,0.5); font-size: 12.5px; font-weight: 600; font-family: inherit;
  cursor: pointer; transition: all 0.25s ease; white-space: nowrap;
}
.filtro-pill--active { background: linear-gradient(135deg, var(--rose), var(--rose-dark)); color: white; box-shadow: 0 4px 14px rgba(201,116,138,0.35); }
.filtro-pill:not(.filtro-pill--active):hover { color: white; }
.filtro-fechas { display: flex; align-items: center; gap: 8px; }

/* ── SKELETON ── */
.skeleton-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
.skeleton-card { height: 110px; border-radius: var(--radius); background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 75%); background-size: 200% 100%; animation: shimmer 1.4s ease infinite; border: 1px solid var(--glass-border); }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ── HERO KPIs ── */
.hero-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px; }
@media (min-width: 768px) { .hero-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1100px) { .hero-grid { grid-template-columns: 1.6fr 1fr 1fr 1fr 1fr; } }

.hero-card {
  background: var(--glass); border: 1px solid var(--glass-border); border-radius: var(--radius);
  padding: 18px; display: flex; flex-direction: column; gap: 6px;
  backdrop-filter: blur(10px); transition: transform 0.25s ease, border-color 0.25s ease;
}
.hero-card:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.18); }
.hero-card--balance { grid-column: span 2; }
@media (min-width: 1100px) { .hero-card--balance { grid-column: span 1; } }
.hero-card--positivo { border-color: rgba(52,211,153,0.3); box-shadow: 0 8px 28px rgba(52,211,153,0.08); }
.hero-card--negativo { border-color: rgba(248,113,113,0.3); box-shadow: 0 8px 28px rgba(248,113,113,0.08); }

.hero-card__top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.hero-card__label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px; color: rgba(255,255,255,0.45); font-weight: 600; }
.hero-card__estado { font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 50px; }
.estado--positivo { background: rgba(52,211,153,0.14); color: #34d399; }
.estado--negativo { background: rgba(248,113,113,0.14); color: #f87171; }
.hero-card__valor { font-size: 1.5rem; font-weight: 800; color: white; }
.hero-card__valor--gigante { font-size: 1.9rem; }
.hero-card__delta { font-size: 11px; font-weight: 600; }
.delta-up { color: #34d399; }
.delta-down { color: #f87171; }
.delta-neutral { color: rgba(255,255,255,0.4); font-weight: 400; }

/* ── GLASS PANELS ── */
.glass-panel { background: var(--glass); border: 1px solid var(--glass-border); border-radius: var(--radius); padding: 20px; backdrop-filter: blur(14px); box-shadow: 0 8px 32px rgba(0,0,0,0.25); }
.panel-title { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 14px; }
.panel-title__num { display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; font-size: 13px; }

.chart-empty { text-align: center; padding: 40px 10px; color: rgba(255,255,255,0.3); font-size: 13px; }

/* ── EVOLUCIÓN SVG ── */
.chart-legend { font-size: 11px; color: rgba(255,255,255,0.5); display: flex; align-items: center; }
.legend-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 5px; vertical-align: middle; }
.chart-wrap { width: 100%; }
.chart-svg { width: 100%; height: 190px; display: block; }
.chart-labels { display: flex; justify-content: space-between; margin-top: 6px; }
.chart-labels__item { font-size: 10px; color: rgba(255,255,255,0.3); }

/* ── DONUT ── */
.donut-wrap { display: flex; justify-content: center; margin: 10px 0 18px; }
.donut { width: 150px; height: 150px; border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; }
.donut__hole { width: 96px; height: 96px; background: #150e13; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.donut__total { font-size: 13px; font-weight: 800; color: white; }
.donut__label { font-size: 9px; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.5px; }
.donut-legend { display: flex; flex-direction: column; gap: 8px; }
.donut-legend__item { display: flex; align-items: center; gap: 8px; font-size: 12.5px; }
.donut-legend__nombre { flex: 1; color: rgba(255,255,255,0.7); }
.donut-legend__valor { font-weight: 700; color: white; }

/* ── MÉTODOS DE PAGO ── */
.metodos-lista { display: flex; flex-direction: column; gap: 14px; }
.metodo-row__head { display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 5px; }
.metodo-row__nombre { color: white; font-weight: 600; }
.metodo-row__valor { color: rgba(255,255,255,0.55); }
.metodo-row__valor small { opacity: 0.7; }
.metodo-row__bar-wrap { width: 100%; height: 7px; background: rgba(255,255,255,0.06); border-radius: 10px; overflow: hidden; }
.metodo-row__bar { height: 100%; border-radius: 10px; transition: width 0.6s ease; }
.metodo-row__pct { font-size: 10.5px; color: rgba(255,255,255,0.35); }

/* ── TOP PRODUCTOS ── */
.top-lista { display: flex; flex-direction: column; gap: 10px; }
.top-item { display: flex; align-items: center; gap: 10px; }
.top-item__rank { font-size: 12px; font-weight: 800; color: var(--rose); width: 22px; flex-shrink: 0; }
.top-item__img-wrap { width: 40px; height: 40px; border-radius: 8px; overflow: hidden; background: rgba(255,255,255,0.05); flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.top-item__img { width: 100%; height: 100%; object-fit: cover; }
.top-item__img-placeholder { font-size: 16px; opacity: 0.4; }
.top-item__info { flex: 1; min-width: 0; }
.top-item__nombre { display: block; font-size: 12.5px; font-weight: 500; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; }
.top-item__bar-wrap { width: 100%; height: 5px; background: rgba(255,255,255,0.06); border-radius: 10px; overflow: hidden; }
.top-item__bar { height: 100%; border-radius: 10px; background: linear-gradient(90deg, var(--rose), var(--rose-dark)); transition: width 0.6s ease; }
.top-item__stats { text-align: right; flex-shrink: 0; }
.top-item__ingresos { display: block; font-size: 12.5px; font-weight: 700; color: #34d399; }
.top-item__unidades { font-size: 10.5px; color: rgba(255,255,255,0.35); }

/* ── TABLA ── */
.tabla-bi-wrap { overflow-x: auto; }
.tabla-bi { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.tabla-bi th { text-align: left; padding: 8px 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(255,255,255,0.4); border-bottom: 1px solid var(--glass-border); font-weight: 600; }
.tabla-bi td { padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); color: rgba(255,255,255,0.75); }
.tabla-bi tr:last-child td { border-bottom: none; }
.tabla-bi tr:hover td { background: rgba(255,255,255,0.02); }
.td-id { color: rgba(255,255,255,0.4); font-weight: 600; }
.td-fecha { white-space: nowrap; color: rgba(255,255,255,0.4); }
.td-total { font-weight: 700; color: var(--rose); white-space: nowrap; }

.estado-badge { font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 50px; text-transform: capitalize; white-space: nowrap; border: 1px solid transparent; }
.estado-badge--pagado    { background: rgba(52,211,153,0.14); color: #34d399; border-color: rgba(52,211,153,0.3); }
.estado-badge--pendiente { background: rgba(251,191,36,0.14); color: #fbbf24; border-color: rgba(251,191,36,0.3); }
.estado-badge--señado    { background: rgba(96,165,250,0.14); color: #60a5fa; border-color: rgba(96,165,250,0.3); }

/* ── INPUTS ── */
.pos-input {
  padding: 7px 10px; border: 1.5px solid var(--glass-border); border-radius: 8px;
  background: rgba(255,255,255,0.04); color: white; font-size: 12.5px; font-family: inherit;
}
.pos-input:focus { outline: none; border-color: var(--rose); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 480px) {
  .hero-card__valor--gigante { font-size: 1.5rem; }
  .hero-card__valor { font-size: 1.2rem; }
}
</style>