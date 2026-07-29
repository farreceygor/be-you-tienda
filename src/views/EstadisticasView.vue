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

      <!-- MÉTRICAS CLAVE -->
      <div class="metricas">
        <div class="metrica-card">
          <span class="metrica-card__label">Ventas este mes</span>
          <span class="metrica-card__value">${{ metricas.mesActual.toLocaleString('es-AR') }}</span>
          <span class="metrica-card__delta" :class="metricas.deltaMes >= 0 ? 'delta--up' : 'delta--down'">
            {{ metricas.deltaMes >= 0 ? '↑' : '↓' }} {{ Math.abs(metricas.deltaMes) }}% vs mes anterior
          </span>
        </div>
        <div class="metrica-card">
          <span class="metrica-card__label">Pedidos este mes</span>
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
        <div class="metrica-card metrica-card--dark">
          <span class="metrica-card__label">Total acumulado</span>
          <span class="metrica-card__value">${{ metricas.totalGeneral.toLocaleString('es-AR') }}</span>
          <span class="metrica-card__delta delta--neutral">Desde el inicio</span>
        </div>
        <div class="metrica-card">
  <span class="metrica-card__label">Gastos este mes</span>
  <span class="metrica-card__value" style="color: #C62828;">
    ${{ metricas.gastosMes.toLocaleString('es-AR') }}
  </span>
  <span class="metrica-card__delta delta--neutral">Compras y reposición</span>
</div>

<div class="metrica-card" :class="metricas.gananciaNeta >= 0 ? '' : 'metrica-card--danger'">
  <span class="metrica-card__label">Ganancia neta este mes</span>
  <span
    class="metrica-card__value"
    :style="{ color: metricas.gananciaNeta >= 0 ? '#2E7D32' : '#C62828' }"
  >
    ${{ metricas.gananciaNeta.toLocaleString('es-AR') }}
  </span>
  <span class="metrica-card__delta delta--neutral">Ventas − Gastos</span>
</div>
      </div>

      <!-- GRÁFICOS -->
      <div class="graficos">
        <!-- Barras: últimos 7 días -->
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

        <!-- Donut: por método de pago -->
        <div class="grafico-card">
          <h3 class="grafico-card__title">Por método de pago</h3>
          <div class="donut-wrap">
            <svg viewBox="0 0 120 120" class="donut-svg">
              <circle v-for="(seg, i) in donutSegmentos" :key="i"
                cx="60" cy="60" r="48" fill="none"
                :stroke="seg.color" stroke-width="20"
                :stroke-dasharray="`${seg.arco} ${301.6 - seg.arco}`"
                :stroke-dashoffset="-seg.offset"
                transform="rotate(-90 60 60)"
              />
              <text x="60" y="56" text-anchor="middle" class="donut-center-label">Total</text>
              <text x="60" y="70" text-anchor="middle" class="donut-center-value">${{ (metricas.mesActual / 1000).toFixed(0) }}k</text>
            </svg>
            <div class="donut-leyenda">
              <div v-for="seg in donutSegmentos" :key="seg.label" class="donut-leyenda__item">
                <span class="donut-leyenda__dot" :style="{ background: seg.color }"></span>
                <span class="donut-leyenda__label">{{ seg.label }}</span>
                <span class="donut-leyenda__pct">{{ seg.pct }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TOP PRODUCTOS -->
      <div class="seccion-card">
        <h3 class="seccion-card__title">Productos más vendidos</h3>
        <div v-if="topProductos.length === 0" class="estado-vacio">Sin datos suficientes todavía</div>
        <div v-else class="top-productos">
          <div v-for="(prod, idx) in topProductos" :key="prod.nombre" class="top-prod">
            <span class="top-prod__rank">#{{ idx + 1 }}</span>
            <div class="top-prod__info">
              <span class="top-prod__nombre">{{ prod.nombre }}</span>
              <div class="top-prod__barra-wrap">
                <div class="top-prod__barra" :style="{ width: prod.porcentaje + '%' }"></div>
              </div>
            </div>
            <div class="top-prod__nums">
              <span class="top-prod__unidades">{{ prod.unidades }} uds</span>
              <span class="top-prod__total">${{ prod.total.toLocaleString('es-AR') }}</span>
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
              <th>#</th><th>Fecha</th><th>Cliente</th><th>Productos</th><th>Método</th><th>Total</th><th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="venta in ultimasVentas" :key="venta.id">
              <td class="td-id">{{ venta.id }}</td>
              <td class="td-fecha">{{ formatFecha(venta.created_at) }}</td>
              <td>{{ venta.cliente || '—' }}</td>
              <td class="td-productos">{{ venta.pedido_items.map(i => i.nombre).join(', ') }}</td>
              <td>{{ formatMetodo(venta.metodo_pago) }}</td>
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
import { ref, computed, onMounted } from 'vue'
import { fetchPedidos, fetchGastos } from '../services/productoService'

const cargando = ref(true)
const pedidos = ref([])
const gastos = ref([])

async function cargarDatos() {
  cargando.value = true
  try {
    const [p, g] = await Promise.all([fetchPedidos(), fetchGastos()])
    pedidos.value = p
    gastos.value  = g
  } catch (e) {
    console.error('Error cargando estadísticas:', e)
  } finally {
    cargando.value = false
  }
}

const metricas = computed(() => {
  const ahora       = new Date()
  const mesActual   = ahora.getMonth()
  const añoActual   = ahora.getFullYear()
  const mesAnterior = mesActual === 0 ? 11 : mesActual - 1
  const añoAnterior = mesActual === 0 ? añoActual - 1 : añoActual

  const deMesActual   = pedidos.value.filter(p => { const f = new Date(p.created_at); return f.getMonth() === mesActual && f.getFullYear() === añoActual })
  const deMesAnterior = pedidos.value.filter(p => { const f = new Date(p.created_at); return f.getMonth() === mesAnterior && f.getFullYear() === añoAnterior })

  const totalMesActual   = deMesActual.reduce((acc, p) => acc + Number(p.total), 0)
  const totalMesAnterior = deMesAnterior.reduce((acc, p) => acc + Number(p.total), 0)
  const totalGeneral     = pedidos.value.reduce((acc, p) => acc + Number(p.total), 0)

  const deltaMes     = totalMesAnterior === 0 ? 100 : Math.round(((totalMesActual - totalMesAnterior) / totalMesAnterior) * 100)
  const deltaPedidos = deMesActual.length - deMesAnterior.length
  const ticketPromedio = deMesActual.length > 0 ? Math.round(totalMesActual / deMesActual.length) : 0

  const gastosMes = gastos.value
  .filter(g => {
    const f = new Date(g.fecha)
    return f.getMonth() === mesActual && f.getFullYear() === añoActual
  })
  .reduce((acc, g) => acc + Number(g.total), 0)

  const gananciaNeta = totalMesActual - gastosMes
  
  return { mesActual: Math.round(totalMesActual), pedidosMes: deMesActual.length, gastosMes: Math.round(gastosMes), gananciaNeta: Math.round(gananciaNeta), totalGeneral: Math.round(totalGeneral), deltaMes, deltaPedidos, ticketPromedio }
})

const ultimos7dias = computed(() => {
  const nombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const dias = []
  for (let i = 6; i >= 0; i--) {
    const fecha = new Date(); fecha.setDate(fecha.getDate() - i); fecha.setHours(0,0,0,0)
    const siguiente = new Date(fecha); siguiente.setDate(siguiente.getDate() + 1)
    const total = pedidos.value.filter(p => { const f = new Date(p.created_at); return f >= fecha && f < siguiente }).reduce((acc, p) => acc + Number(p.total), 0)
    dias.push({ fecha: fecha.toLocaleDateString(), diaNombre: nombres[fecha.getDay()], total: Math.round(total) })
  }
  const maxTotal = Math.max(...dias.map(d => d.total), 1)
  return dias.map(d => ({ ...d, porcentaje: Math.round((d.total / maxTotal) * 100) }))
})

const COLORES  = { efectivo: '#C9748A', transferencia: '#C9A96E', mercado_pago: '#7A3350', debito: '#4A8FA8', credito: '#6B6B6B' }
const LABELS   = { efectivo: 'Efectivo', transferencia: 'Transferencia', mercado_pago: 'Mercado Pago', debito: 'Débito', credito: 'Crédito' }

const donutSegmentos = computed(() => {
  const totalGeneral = pedidos.value.reduce((acc, p) => acc + Number(p.total), 0)
  if (totalGeneral === 0) return []
  const porMetodo = {}
  pedidos.value.forEach(p => { const m = p.metodo_pago || 'efectivo'; porMetodo[m] = (porMetodo[m] || 0) + Number(p.total) })
  const circunferencia = 301.6
  let offsetAcumulado = 0
  return Object.entries(porMetodo).map(([metodo, total]) => {
    const pct  = Math.round((total / totalGeneral) * 100)
    const arco = (total / totalGeneral) * circunferencia
    const seg  = { label: LABELS[metodo] || metodo, color: COLORES[metodo] || '#ccc', arco, offset: offsetAcumulado, pct }
    offsetAcumulado += arco
    return seg
  })
})

const topProductos = computed(() => {
  const conteo = {}
  pedidos.value.forEach(pedido => {
    pedido.pedido_items?.forEach(item => {
      if (!conteo[item.nombre]) conteo[item.nombre] = { unidades: 0, total: 0 }
      conteo[item.nombre].unidades += item.cantidad
      conteo[item.nombre].total    += Number(item.subtotal)
    })
  })
  const lista = Object.entries(conteo).map(([nombre, data]) => ({ nombre, ...data })).sort((a, b) => b.unidades - a.unidades).slice(0, 5)
  const maxUnidades = lista[0]?.unidades || 1
  return lista.map(p => ({ ...p, total: Math.round(p.total), porcentaje: Math.round((p.unidades / maxUnidades) * 100) }))
})

const ultimasVentas = computed(() => pedidos.value.slice(0, 10))

function formatFecha(iso) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function formatMetodo(m) { return LABELS[m] || m }

onMounted(async () => {
  // Cargar datos una vez al montar
  await cargarDatos()
  
  // ✨ NUEVO: Escuchar cambios en la DB en tiempo real
  const subscription = supabase
    .channel('cambios_pedidos')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'pedidos' },
      () => {
        console.log('📢 Pedidos actualizados, recargando...')
        cargarDatos()
      }
    )
    .subscribe()

  // Limpiar subscription cuando se desmonta
  onUnmounted(() => subscription.unsubscribe())
})
</script>

<style scoped>
.stats {
  --rose: #C9748A; --rose-light: #F7E8ED; --rose-dark: #8B4A5C;
  --gold: #C9A96E; --cream: #FFFAF9; --charcoal: #2D2D2D;
  --mid: #6B6B6B; --border: #EDE4E1; --white: #FFFFFF;
  --radius: 10px; --trans: 0.2s ease;
  padding: 20px; max-width: 1000px; margin: 0 auto;
  font-family: 'Poppins', system-ui, sans-serif; color: var(--charcoal);
}
.stats__header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
.stats__title  { font-size: 1.4rem; font-weight: 700; }
.stats__sub    { font-size: 13px; color: var(--mid); }
.btn-refresh   { padding: 8px 16px; border: 1.5px solid var(--border); border-radius: 20px; background: var(--white); color: var(--mid); font-size: 13px; cursor: pointer; font-family: inherit; transition: all var(--trans); }
.btn-refresh:hover:not(:disabled) { border-color: var(--rose); color: var(--rose); }
.btn-refresh:disabled { opacity: 0.5; cursor: not-allowed; }

.metricas { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 16px; }
@media (min-width: 640px) { .metricas { grid-template-columns: repeat(4, 1fr); } }
.metrica-card { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; display: flex; flex-direction: column; gap: 4px; }
.metrica-card--dark { background: var(--charcoal); border-color: var(--charcoal); }
.metrica-card--dark .metrica-card__label { color: rgba(255,255,255,0.5); }
.metrica-card--dark .metrica-card__value { color: white; }
.metrica-card--dark .metrica-card__delta { color: rgba(255,255,255,0.4); }
.metrica-card__label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: var(--mid); }
.metrica-card__value { font-size: 1.4rem; font-weight: 700; color: var(--charcoal); line-height: 1.2; }
.metrica-card__delta { font-size: 11px; }
.delta--up      { color: #2E7D32; }
.delta--down    { color: #C62828; }
.delta--neutral { color: var(--mid); }
.metrica-card--danger {
  border-color: #FEEBEE;
  background: #FFFAFA;
}

.graficos { display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 16px; }
@media (min-width: 640px) { .graficos { grid-template-columns: 1.8fr 1fr; } }
.grafico-card { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; }
.grafico-card__title { font-size: 13px; font-weight: 600; color: var(--charcoal); margin-bottom: 16px; }

.bar-chart { display: flex; align-items: flex-end; gap: 6px; height: 130px; }
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
.bar-col__value { font-size: 9px; color: var(--mid); white-space: nowrap; }
.bar-col__bar-wrap { width: 100%; background: var(--rose-light); border-radius: 4px 4px 0 0; height: 90px; display: flex; align-items: flex-end; }
.bar-col__bar { width: 100%; background: var(--rose); border-radius: 4px 4px 0 0; transition: height 0.5s ease; min-height: 2px; }
.bar-col__label { font-size: 10px; color: var(--mid); text-align: center; }

.donut-wrap { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.donut-svg  { width: 120px; height: 120px; flex-shrink: 0; }
.donut-center-label { font-size: 10px; fill: var(--mid); font-family: 'Poppins', system-ui, sans-serif; }
.donut-center-value { font-size: 11px; font-weight: 700; fill: var(--charcoal); font-family: 'Poppins', system-ui, sans-serif; }
.donut-leyenda { flex: 1; min-width: 120px; }
.donut-leyenda__item { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; font-size: 11px; }
.donut-leyenda__dot  { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
.donut-leyenda__label { flex: 1; color: var(--charcoal); }
.donut-leyenda__pct   { font-weight: 600; color: var(--mid); }

.seccion-card { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; margin-bottom: 12px; }
.seccion-card__title { font-size: 13px; font-weight: 600; color: var(--charcoal); margin-bottom: 16px; }
.top-productos { display: flex; flex-direction: column; gap: 12px; }
.top-prod { display: flex; align-items: center; gap: 12px; }
.top-prod__rank  { font-size: 11px; font-weight: 700; color: var(--rose); min-width: 24px; }
.top-prod__info  { flex: 1; }
.top-prod__nombre { font-size: 13px; font-weight: 500; display: block; margin-bottom: 4px; }
.top-prod__barra-wrap { height: 6px; background: var(--rose-light); border-radius: 3px; overflow: hidden; }
.top-prod__barra { height: 100%; background: var(--rose); border-radius: 3px; transition: width 0.6s ease; }
.top-prod__nums  { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.top-prod__unidades { font-size: 11px; color: var(--mid); }
.top-prod__total    { font-size: 13px; font-weight: 700; color: var(--rose-dark); }

.ventas-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.ventas-table th { text-align: left; padding: 8px 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--mid); border-bottom: 1px solid var(--border); font-weight: 500; }
.ventas-table td { padding: 10px; border-bottom: 1px solid #F5EDE9; color: var(--charcoal); vertical-align: middle; }
.ventas-table tr:last-child td { border-bottom: none; }
.ventas-table tr:hover td { background: var(--cream); }
.td-id    { color: var(--mid); font-weight: 600; }
.td-fecha { white-space: nowrap; color: var(--mid); }
.td-total { font-weight: 700; color: var(--rose-dark); white-space: nowrap; }
.td-productos { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--mid); }

.estado-badge { font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 10px; text-transform: capitalize; white-space: nowrap; }
.estado-badge--pagado    { background: #E8F5E8; color: #2E7D32; }
.estado-badge--pendiente { background: #FFF8E1; color: #E65100; }
.estado-badge--señado    { background: #E3F2FD; color: #1565C0; }

.estado-carga { display: flex; flex-direction: column; align-items: center; padding: 60px; gap: 12px; color: var(--mid); font-size: 14px; }
.estado-vacio { padding: 30px; text-align: center; color: var(--mid); font-size: 13px; font-style: italic; }
.spinner { width: 32px; height: 32px; border: 3px solid var(--rose-light); border-top-color: var(--rose); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
/* ─── RESPONSIVO ADICIONAL ─── */
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
.stats__back:hover { color: var(--rose); }

@media (max-width: 480px) {
  .stats { padding: 14px; }
  .metricas { grid-template-columns: 1fr 1fr; }
  .metrica-card__value { font-size: 1.1rem; }
  .graficos { grid-template-columns: 1fr; }
  .ventas-table th:nth-child(3),
  .ventas-table td:nth-child(3),
  .ventas-table th:nth-child(5),
  .ventas-table td:nth-child(5) { display: none; }
}
</style>
