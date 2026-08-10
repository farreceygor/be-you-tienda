<template>
  <div class="stats">

    <!-- HEADER -->
    <button class="stats__back" @click="$router.push({ name: 'admin' })">
      ← Volver al panel
    </button>
    <div class="stats__header">
      <div>
        <h1 class="stats__title">Estadísticas</h1>
        <p class="stats__sub">Resumen de ventas y rendimiento del negocio</p>
      </div>
      <button class="btn-refresh" @click="cargarDatos" :disabled="cargando">
        {{ cargando ? '...' : '↻ Actualizar' }}
      </button>
    </div>

    <!-- LOADING -->
    <div v-if="cargando" class="estado-carga">
      <div class="spinner"></div>
      <p>Cargando estadísticas...</p>
    </div>

    <template v-else>

      <!-- ═══════════════════════════════════════════════════════════
           SECCIÓN: ESTE MES
           ═══════════════════════════════════════════════════════════ -->
      <div class="metricas-seccion">
        <h2 class="metricas-seccion__title">📅 Este Mes</h2>
        
        <!-- Cards superiores: Pedidos y Ticket -->
        <div class="metricas">
          <div class="metrica-card">
            <span class="metrica-card__label">Pedidos pagos este mes</span>
            <span class="metrica-card__value">{{ metricas.pedidosMes }}</span>
            <span class="metrica-card__delta" :class="metricas.deltaPedidos >= 0 ? 'delta--up' : 'delta--down'">
              {{ metricas.deltaPedidos >= 0 ? '↑' : '↓' }} {{ Math.abs(metricas.deltaPedidos) }} vs mes anterior
            </span>
          </div>
          <div class="metrica-card">
            <span class="metrica-card__label">Ticket promedio</span>
            <span class="metrica-card__value">${{ metricas.ticketPromedio.toLocaleString('es-AR') }}</span>
            <span class="metrica-card__delta delta--neutral">Basado en {{ metricas.pedidosMes }} pedidos</span>
          </div>
        </div>

        <!-- Ventas Este Mes - Desglosado -->
        <div class="subseccion">
          <h3 class="subseccion__title">💰 Ventas Cobradas Este Mes</h3>
          <div class="metricas">
            <div class="metrica-card metrica-card--highlight">
              <span class="metrica-card__label">Ventas totales</span>
              <span class="metrica-card__value" style="color: #2E7D32;">${{ metricas.mesActual.toLocaleString('es-AR') }}</span>
              <span class="metrica-card__delta" :class="metricas.deltaMes >= 0 ? 'delta--up' : 'delta--down'">
                {{ metricas.deltaMes >= 0 ? '↑' : '↓' }} {{ Math.abs(metricas.deltaMes) }}% vs mes anterior
              </span>
            </div>
            <div class="metrica-card">
              <span class="metrica-card__label">💵 Efectivo</span>
              <span class="metrica-card__value" style="color: #2E7D32;">${{ metricasMetodos.efectivo.toLocaleString('es-AR') }}</span>
              <span class="metrica-card__delta delta--neutral">{{ metricasMetodos.efectivoQty }} operaciones</span>
            </div>
            <div class="metrica-card">
              <span class="metrica-card__label">🏦 Transferencias</span>
              <span class="metrica-card__value" style="color: #4A8FA8;">${{ metricasMetodos.transferencia.toLocaleString('es-AR') }}</span>
              <span class="metrica-card__delta delta--neutral">{{ metricasMetodos.transferenciaQty }} operaciones</span>
            </div>
          </div>
        </div>

        <!-- Gastos Este Mes - Desglosado -->
        <div class="subseccion">
          <h3 class="subseccion__title">💸 Gastos Este Mes</h3>
          <div class="metricas">
            <div class="metrica-card">
              <span class="metrica-card__label">Gastos totales</span>
              <span class="metrica-card__value" style="color: #C62828;">${{ metricas.gastosMes.toLocaleString('es-AR') }}</span>
              <span class="metrica-card__delta delta--neutral">Compras y reposición</span>
            </div>
            <div class="metrica-card">
              <span class="metrica-card__label">💵 Efectivo</span>
              <span class="metrica-card__value" style="color: #C62828;">${{ gastosMetodosMes.efectivo.toLocaleString('es-AR') }}</span>
              <span class="metrica-card__delta delta--neutral">{{ gastosMetodosMes.efectivoQty }} operaciones</span>
            </div>
            <div class="metrica-card">
              <span class="metrica-card__label">🏦 Transferencias</span>
              <span class="metrica-card__value" style="color: #C62828;">${{ gastosMetodosMes.transferencia.toLocaleString('es-AR') }}</span>
              <span class="metrica-card__delta delta--neutral">{{ gastosMetodosMes.transferenciaQty }} operaciones</span>
            </div>
          </div>
        </div>

        <!-- Ganancia Neta Este Mes -->
        <div class="subseccion">
          <div class="metrica-card metrica-card--ganancia" :class="metricas.gananciaNeta >= 0 ? '' : 'metrica-card--danger'">
            <span class="metrica-card__label">✅ Ganancia Neta Este Mes (Real)</span>
            <span
              class="metrica-card__value"
              :style="{ color: metricas.gananciaNeta >= 0 ? '#2E7D32' : '#C62828', fontSize: '2rem' }"
            >
              ${{ metricas.gananciaNeta.toLocaleString('es-AR') }}
            </span>
            <span class="metrica-card__delta delta--neutral">Ventas cobradas − Gastos realizados</span>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════
           SECCIÓN: TOTALES GENERAL
           ═══════════════════════════════════════════════════════════ -->
      <div class="metricas-seccion">
        <h2 class="metricas-seccion__title">📈 Totales General (Desde el Inicio)</h2>

        <!-- Total Vendido - Desglosado -->
        <div class="subseccion">
          <h3 class="subseccion__title">💰 Total Vendido (Histórico)</h3>
          <div class="metricas">
            <div class="metrica-card metrica-card--highlight">
              <span class="metrica-card__label">Ventas totales histórico</span>
              <span class="metrica-card__value" style="color: #2E7D32;">${{ metricasHistorico.totalCobradoHistorico.toLocaleString('es-AR') }}</span>
              <span class="metrica-card__delta delta--neutral">Pedidos pagados</span>
            </div>
            <div class="metrica-card">
              <span class="metrica-card__label">💵 Efectivo histórico</span>
              <span class="metrica-card__value" style="color: #2E7D32;">${{ metricasMetodosHistorico.efectivo.toLocaleString('es-AR') }}</span>
              <span class="metrica-card__delta delta--neutral">{{ metricasMetodosHistorico.efectivoQty }} transacciones</span>
            </div>
            <div class="metrica-card">
              <span class="metrica-card__label">🏦 Transferencias histórico</span>
              <span class="metrica-card__value" style="color: #4A8FA8;">${{ metricasMetodosHistorico.transferencia.toLocaleString('es-AR') }}</span>
              <span class="metrica-card__delta delta--neutral">{{ metricasMetodosHistorico.transferenciaQty }} transacciones</span>
            </div>
          </div>
        </div>

        <!-- Gastos Históricos - Desglosado -->
        <div class="subseccion">
          <h3 class="subseccion__title">💸 Gastos Históricos</h3>
          <div class="metricas">
            <div class="metrica-card">
              <span class="metrica-card__label">Gastos totales histórico</span>
              <span class="metrica-card__value" style="color: #C62828;">${{ totalGastosHistorico.toLocaleString('es-AR') }}</span>
              <span class="metrica-card__delta delta--neutral">Desde el inicio</span>
            </div>
            <div class="metrica-card">
              <span class="metrica-card__label">💵 Efectivo histórico</span>
              <span class="metrica-card__value" style="color: #C62828;">${{ gastosMetodosHistorico.efectivo.toLocaleString('es-AR') }}</span>
              <span class="metrica-card__delta delta--neutral">{{ gastosMetodosHistorico.efectivoQty }} transacciones</span>
            </div>
            <div class="metrica-card">
              <span class="metrica-card__label">🏦 Transferencias histórico</span>
              <span class="metrica-card__value" style="color: #C62828;">${{ gastosMetodosHistorico.transferencia.toLocaleString('es-AR') }}</span>
              <span class="metrica-card__delta delta--neutral">{{ gastosMetodosHistorico.transferenciaQty }} transacciones</span>
            </div>
          </div>
        </div>

        <!-- Pendientes y Ganancia General -->
        <div class="subseccion">
          <h3 class="subseccion__title">⏳ Situación de Pagos</h3>
          <div class="metricas">
            <div class="metrica-card" style="border-left: 4px solid #E65100;">
              <span class="metrica-card__label">Pendiente de Cobrar</span>
              <span class="metrica-card__value" style="color: #E65100;">${{ totalPendienteHistorico.toLocaleString('es-AR') }}</span>
              <span class="metrica-card__delta delta--neutral">No cobrado aún</span>
            </div>
          </div>
        </div>

        <!-- Ganancia Neta Histórica -->
        <div class="subseccion">
          <div class="metrica-card metrica-card--ganancia-historic">
            <span class="metrica-card__label">✅ Ganancia Neta Histórica (Real)</span>
            <span
              class="metrica-card__value"
              :style="{ color: gananciaNetaRealHistorico >= 0 ? '#2E7D32' : '#C62828', fontSize: '2rem' }"
            >
              ${{ gananciaNetaRealHistorico.toLocaleString('es-AR') }}
            </span>
            <span class="metrica-card__delta delta--neutral">Lo que cobré − Lo que gasté (histórico)</span>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════
           GRÁFICOS (Opcional)
           ═══════════════════════════════════════════════════════════ -->
      <div class="graficos" v-if="ultimos7dias.length > 0">
        <div class="grafico-card grafico-card--wide">
          <h3 class="grafico-card__title">Ventas últimos 7 días</h3>
          <div class="bar-chart">
            <div v-for="dia in ultimos7dias" :key="dia.fecha" class="bar-col">
              <span class="bar-col__value" v-if="dia.total > 0">${{ (dia.total / 1000).toFixed(0) }}k</span>
              <div class="bar-col__bar-wrap">
                <div class="bar-col__bar" :style="{ height: dia.porcentaje + '%' }" :title="`$${dia.total.toLocaleString('es-AR')}`"></div>
              </div>
              <span class="bar-col__label">{{ dia.diaNombre }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ÚLTIMAS VENTAS -->
      <div class="seccion-card">
        <h3 class="seccion-card__title">Últimas ventas registradas</h3>
        <div v-if="ultimasVentas.length === 0" class="estado-vacio">No hay ventas registradas aún</div>
        <table v-else class="ventas-table">
          <thead>
            <tr>
              <th>#</th><th>Fecha</th><th>Cliente</th><th>Total</th><th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="venta in ultimasVentas" :key="venta.id">
              <td class="td-id">{{ venta.id }}</td>
              <td class="td-fecha">{{ formatFecha(venta.created_at) }}</td>
              <td>{{ venta.cliente || '—' }}</td>
              <td class="td-total">${{ Number(venta.total).toLocaleString('es-AR') }}</td>
              <td><span class="estado-badge" :class="`estado-badge--${venta.estado}`">{{ venta.estado }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted} from 'vue'
import { supabase } from '../lib/supabaseClient'
import { fetchPedidos, fetchGastos } from '../services/productoService'
import { logger } from '../lib/logger'

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
// SECCIÓN: ESTE MES (SOLO PAGADO)
// ═══════════════════════════════════════════════════════════

const metricas = computed(() => {
  const ahora       = new Date()
  const mesActual   = ahora.getMonth()
  const añoActual   = ahora.getFullYear()
  const mesAnterior = mesActual === 0 ? 11 : mesActual - 1
  const añoAnterior = mesActual === 0 ? añoActual - 1 : añoActual

  // ESTE MES - Solo pagados
  const deMesActualPagados = pedidos.value.filter(p => {
    const f = new Date(p.created_at)
    return f.getMonth() === mesActual && 
           f.getFullYear() === añoActual && 
           p.estado === 'pagado'
  })

  // MES ANTERIOR - Solo pagados
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

  // Gastos este mes
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

// ═══════════════════════════════════════════════════════════
// MÉTODOS DE PAGO - ESTE MES (SOLO PAGADO)
// ═══════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════
// GASTOS - ESTE MES (POR MÉTODO)
// ═══════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════
// TOTALES HISTÓRICOS
// ═══════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════
// MÉTODOS DE PAGO - HISTÓRICO (SOLO PAGADO)
// ═══════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════
// GASTOS - HISTÓRICO (POR MÉTODO)
// ═══════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════
// HISTÓRICO TOTAL (Para la vista)
// ═══════════════════════════════════════════════════════════

const metricasHistorico = computed(() => {
  const totalCobradoHistorico = pedidos.value
    .filter(p => p.estado === 'pagado')
    .reduce((acc, p) => acc + Number(p.total), 0)

  return {
    totalCobradoHistorico: Math.round(totalCobradoHistorico)
  }
})

// ═══════════════════════════════════════════════════════════
// GRÁFICOS
// ═══════════════════════════════════════════════════════════

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
// REALTIME
// ═══════════════════════════════════════════════════════════

let subscription = null

onMounted(async () => {
  await cargarDatos()

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
.stats {
  --rose: #C9748A;
  --rose-light: #F7E8ED;
  --rose-dark: #8B4A5C;
  --gold: #C9A96E;
  --cream: #FFFAF9;
  --charcoal: #2D2D2D;
  --mid: #6B6B6B;
  --border: #EDE4E1;
  --white: #FFFFFF;
  --radius: 10px;
  --trans: 0.2s ease;
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  font-family: 'Poppins', system-ui, sans-serif;
  color: var(--charcoal);
}

.stats__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.stats__title {
  font-size: 1.4rem;
  font-weight: 700;
}

.stats__sub {
  font-size: 13px;
  color: var(--mid);
}

.btn-refresh {
  padding: 8px 16px;
  border: 1.5px solid var(--border);
  border-radius: 20px;
  background: var(--white);
  color: var(--mid);
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--trans);
}

.btn-refresh:hover:not(:disabled) {
  border-color: var(--rose);
  color: var(--rose);
}

/* ─── SECCIONES PRINCIPALES ─── */
.metricas-seccion {
  margin-bottom: 28px;
}

.metricas-seccion__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--charcoal);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 3px solid var(--rose);
  display: inline-block;
}

/* ─── SUBSECCIONES ─── */
.subseccion {
  margin-bottom: 18px;
}

.subseccion__title {
  font-size: 12px;
  font-weight: 600;
  color: var(--mid);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  padding-left: 6px;
  border-left: 3px solid var(--rose-light);
}

/* ─── METRICAS GRID ─── */
.metricas {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

@media (min-width: 640px) {
  .metricas {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .metricas {
    grid-template-columns: repeat(3, 1fr);
  }
}

.metrica-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all var(--trans);
}

.metrica-card:hover {
  box-shadow: 0 4px 12px rgba(201, 116, 138, 0.1);
  transform: translateY(-2px);
}

.metrica-card--highlight {
  background: linear-gradient(135deg, #E8F5E8 0%, var(--white) 100%);
  border-color: #2E7D32;
  border-width: 2px;
}

.metrica-card--ganancia,
.metrica-card--ganancia-historic {
  background: linear-gradient(135deg, #E8F5E8 0%, var(--white) 100%);
  border: 2px solid #2E7D32;
  padding: 20px;
  grid-column: 1 / -1;
}

.metrica-card--danger {
  background: linear-gradient(135deg, #FEEBEE 0%, var(--white) 100%);
  border-color: #C62828;
}

.metrica-card__label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--mid);
}

.metrica-card__value {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--charcoal);
  line-height: 1.2;
}

.metrica-card__delta {
  font-size: 11px;
}

.delta--up {
  color: #2E7D32;
  font-weight: 600;
}

.delta--down {
  color: #C62828;
  font-weight: 600;
}

.delta--neutral {
  color: var(--mid);
}

/* ─── GRÁFICOS ─── */
.graficos {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin: 24px 0;
}

.grafico-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px;
}

.grafico-card--wide {
  grid-column: 1 / -1;
}

.grafico-card__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--charcoal);
  margin-bottom: 16px;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 130px;
}

.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
  justify-content: flex-end;
}

.bar-col__value {
  font-size: 9px;
  color: var(--mid);
  white-space: nowrap;
}

.bar-col__bar-wrap {
  width: 100%;
  background: var(--rose-light);
  border-radius: 4px 4px 0 0;
  height: 90px;
  display: flex;
  align-items: flex-end;
}

.bar-col__bar {
  width: 100%;
  background: var(--rose);
  border-radius: 4px 4px 0 0;
  transition: height 0.5s ease;
  min-height: 2px;
}

.bar-col__label {
  font-size: 10px;
  color: var(--mid);
  text-align: center;
}

/* ─── OTRAS SECCIONES ─── */
.seccion-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px;
  margin-bottom: 12px;
}

.seccion-card__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--charcoal);
  margin-bottom: 16px;
}

.ventas-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.ventas-table th {
  text-align: left;
  padding: 8px 10px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--mid);
  border-bottom: 1px solid var(--border);
  font-weight: 500;
}

.ventas-table td {
  padding: 10px;
  border-bottom: 1px solid #F5EDE9;
  color: var(--charcoal);
  vertical-align: middle;
}

.ventas-table tr:last-child td {
  border-bottom: none;
}

.ventas-table tr:hover td {
  background: var(--cream);
}

.td-id {
  color: var(--mid);
  font-weight: 600;
}

.td-fecha {
  white-space: nowrap;
  color: var(--mid);
}

.td-total {
  font-weight: 700;
  color: var(--rose-dark);
  white-space: nowrap;
}

.estado-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 10px;
  text-transform: capitalize;
  white-space: nowrap;
}

.estado-badge--pagado {
  background: #E8F5E8;
  color: #2E7D32;
}

.estado-badge--pendiente {
  background: #FFF8E1;
  color: #E65100;
}

.estado-badge--señado {
  background: #E3F2FD;
  color: #1565C0;
}

.estado-carga {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px;
  gap: 12px;
  color: var(--mid);
  font-size: 14px;
}

.estado-vacio {
  padding: 30px;
  text-align: center;
  color: var(--mid);
  font-size: 13px;
  font-style: italic;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--rose-light);
  border-top-color: var(--rose);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.stats__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--mid);
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  margin-bottom: 12px;
  padding: 0;
  transition: color var(--trans);
}

.stats__back:hover {
  color: var(--rose);
}

@media (max-width: 480px) {
  .stats {
    padding: 14px;
  }

  .metricas {
    grid-template-columns: 1fr;
  }

  .metrica-card__value {
    font-size: 1.3rem;
  }
}
</style>