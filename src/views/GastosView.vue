<template>
  <div class="gastos">

    <!-- HEADER -->
    <button class="gastos__back" @click="$router.push({ name: 'admin' })">
      ← Volver al panel
    </button>
    <div class="gastos__header">
      <div>
        <h1 class="gastos__title">Gastos</h1>
        <p class="gastos__sub">Registrá compras y reposición de stock</p>
      </div>
      <div class="gastos__tabs">
        <button
          class="gastos__tab"
          :class="{ 'gastos__tab--active': vistaActual === 'nuevo' }"
          @click="vistaActual = 'nuevo'"
        >+ Nuevo gasto</button>
        <button
          class="gastos__tab"
          :class="{ 'gastos__tab--active': vistaActual === 'historial' }"
          @click="vistaActual = 'historial'; cargarHistorial()"
        >Historial</button>
      </div>
    </div>

    <!-- RESUMEN -->
    <div class="resumen">
      <div class="resumen__card">
        <span class="resumen__label">Gastado este mes</span>
        <span class="resumen__value resumen__value--red">${{ resumenMes.total.toLocaleString('es-AR') }}</span>
      </div>
      <div class="resumen__card">
        <span class="resumen__label">En envíos este mes</span>
        <span class="resumen__value resumen__value--orange">${{ resumenMes.envios.toLocaleString('es-AR') }}</span>
      </div>
      <div class="resumen__card">
        <span class="resumen__label">Compras este mes</span>
        <span class="resumen__value">{{ resumenMes.cantidad }}</span>
      </div>
      <div class="resumen__card">
        <span class="resumen__label">Gasto total histórico</span>
        <span class="resumen__value resumen__value--rose">${{ resumenMes.historico.toLocaleString('es-AR') }}</span>
      </div>
    </div>

    <!-- ═══ NUEVO GASTO ═══ -->
    <div v-if="vistaActual === 'nuevo'" class="panel">

      <!-- Datos generales -->
      <div class="panel__section">
        <h2 class="panel__title">1. Datos de la compra</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>Fecha</label>
            <input v-model="datosGasto.fecha" type="date" />
          </div>
          <div class="form-group">
            <label>Proveedor</label>
            <input v-model="datosGasto.proveedor" type="text" placeholder="Ej: Mayorista Belleza SA" />
          </div>
          <div class="form-group">
            <label>Costo de envío (opcional)</label>
            <input v-model.number="datosGasto.costo_envio" type="number" min="0" placeholder="0" />
          </div>
          <div class="form-group">
  <label>Método de pago</label>
  <select v-model="datosGasto.metodo_pago" class="form-group input">
    <option value="efectivo">💵 Efectivo</option>
    <option value="transferencia">🏦 Transferencia</option>
    <option value="tarjeta">💳 Tarjeta</option>
    <option value="otro">❓ Otro</option>
  </select>
</div>
          <div class="form-group">
            <label>Notas</label>
            <input v-model="datosGasto.notas" type="text" placeholder="Observaciones..." />
          </div>
        </div>
      </div>

      <!-- Items del gasto -->
      <div class="panel__section">
        <h2 class="panel__title">2. ¿En qué gastaste?</h2>

        <!-- Agregar item manual -->
        <div class="item-nuevo">
          <input
            v-model="itemNuevo.nombre"
            type="text"
            class="item-nuevo__nombre"
            placeholder="Ej: Bolsas, Labiales x12, Flete, etc."
            @keydown.enter="agregarItemManual"
          />
          <input
            v-model.number="itemNuevo.cantidad"
            type="number"
            min="1"
            class="item-nuevo__qty"
            placeholder="Cant."
          />
          <input
            v-model.number="itemNuevo.precio_costo"
            type="number"
            min="0"
            class="item-nuevo__precio"
            placeholder="$ Precio unit."
            @keydown.enter="agregarItemManual"
          />
          <button class="btn-agregar" @click="agregarItemManual">+ Agregar</button>
        </div>

        <div v-if="itemsGasto.length === 0" class="gasto-empty">
          <span>📦</span>
          <p>Completá el formulario de arriba y hacé click en Agregar</p>
        </div>

        <div v-else>
          <div v-for="(item, idx) in itemsGasto" :key="idx" class="gasto-item">
            <div class="gasto-item__info">
              <span class="gasto-item__nombre">{{ item.nombre }}</span>
            </div>
            <div class="gasto-item__controls">
              <div class="gasto-item__field">
                <label>Cantidad</label>
                <div class="qty-wrap">
                  <button class="qty-btn" @click="cambiarCantidadGasto(idx, -1)">−</button>
                  <span class="qty-num">{{ item.cantidad }}</span>
                  <button class="qty-btn" @click="cambiarCantidadGasto(idx, 1)">+</button>
                </div>
              </div>
              <div class="gasto-item__field">
                <label>Costo unitario ($)</label>
                <input
                  v-model.number="item.precio_costo"
                  type="number"
                  min="0"
                  class="gasto-item__input"
                  placeholder="0"
                  @input="recalcularGastoItem(item)"
                />
              </div>
              <div class="gasto-item__subtotal">
                <label>Subtotal</label>
                <strong>${{ item.subtotal.toLocaleString('es-AR') }}</strong>
              </div>
            </div>
            <button class="gasto-item__remove" @click="quitarItemGasto(idx)">✕</button>
          </div>

          <!-- Total -->
          <div class="gasto-total">
            <div class="gasto-total__fila" v-if="datosGasto.costo_envio > 0">
              <span>Subtotal ítems</span>
              <span>${{ subtotalProductos.toLocaleString('es-AR') }}</span>
            </div>
            <div class="gasto-total__fila" v-if="datosGasto.costo_envio > 0">
              <span>Costo de envío</span>
              <span>${{ Number(datosGasto.costo_envio).toLocaleString('es-AR') }}</span>
            </div>
            <div class="gasto-total__fila gasto-total__fila--total">
              <span>Total gastado</span>
              <strong>${{ totalGasto.toLocaleString('es-AR') }}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Botón de confirmar -->
      <div class="panel__section" v-if="itemsGasto.length > 0">
        <button class="btn-confirmar" :disabled="cargando" @click="confirmarGasto">
          {{ cargando ? 'Guardando...' : 'Registrar Gasto' }}
        </button>
      </div>

    </div>

    <!-- ═══ HISTORIAL ═══ -->
    <div v-if="vistaActual === 'historial'" class="panel">

      <div v-if="cargandoHistorial" class="estado-carga">
        <div class="spinner"></div>
        <p>Cargando historial...</p>
      </div>

      <div v-else-if="gastos.length === 0" class="gasto-empty" style="padding: 40px;">
        <span>📋</span>
        <p>No hay gastos registrados todavía</p>
      </div>

      <div v-else class="historial">
        <div
          v-for="gasto in gastos"
          :key="gasto.id"
          class="historial-item"
          :class="{ 'historial-item--expandido': gastoExpandido === gasto.id }"
        >
          <!-- Cabecera -->
          <div class="historial-item__head" @click="toggleGasto(gasto.id)">
            <div class="historial-item__info">
              <span class="historial-item__id">#{{ gasto.id }}</span>
              <span class="historial-item__fecha">{{ formatFecha(gasto.fecha) }}</span>
              <span v-if="gasto.proveedor" class="historial-item__proveedor">{{ gasto.proveedor }}</span>
            </div>
            <div class="historial-item__right">
              <span class="historial-item__total">${{ Number(gasto.total).toLocaleString('es-AR') }}</span>
              <span v-if="gasto.costo_envio > 0" class="historial-item__envio">
                + ${{ Number(gasto.costo_envio).toLocaleString('es-AR') }} envío
              </span>
              <span class="historial-item__arrow">{{ gastoExpandido === gasto.id ? '▲' : '▼' }}</span>
            </div>
          </div>

          <!-- Detalle expandible -->
          <div v-if="gastoExpandido === gasto.id" class="historial-item__detalle">
            <div class="detalle-items">
              <div v-for="item in gasto.gasto_items" :key="item.id" class="detalle-item">
                <span class="detalle-item__nombre">{{ item.nombre }}</span>
                <span class="detalle-item__qty">x{{ item.cantidad }}</span>
                <span class="detalle-item__precio">${{ Number(item.precio_costo).toLocaleString('es-AR') }} c/u</span>
                <span class="detalle-item__sub">${{ Number(item.subtotal).toLocaleString('es-AR') }}</span>
              </div>
            </div>
            <div class="detalle-footer">
              <div class="detalle-meta">
                <span v-if="gasto.notas">📝 {{ gasto.notas }}</span>
                <span v-if="gasto.costo_envio > 0">🚚 Envío: ${{ Number(gasto.costo_envio).toLocaleString('es-AR') }}</span>
                <span v-if="gasto.metodo_pago">💳 {{ formatMetodo(gasto.metodo_pago) }}</span>
              </div>
              <button class="btn-anular" @click="anularGasto(gasto)">🗑️ Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast.show" class="toast">{{ toast.msg }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { crearGasto, fetchGastos, eliminarGasto } from '../services/productoService'

// ─── ESTADO ──────────────────────────────────────────────────────
const vistaActual       = ref('nuevo')
const cargando          = ref(false)
const cargandoHistorial = ref(false)

// ─── ITEM MANUAL ─────────────────────────────────────────────────
const itemNuevo = reactive({ nombre: '', cantidad: 1, precio_costo: 0 })

function agregarItemManual() {
  if (!itemNuevo.nombre.trim()) {
    mostrarToast('⚠️ Escribí el nombre del ítem')
    return
  }
  itemsGasto.value.push({
    producto_id:  null,
    nombre:       itemNuevo.nombre.trim(),
    cantidad:     itemNuevo.cantidad || 1,
    precio_costo: itemNuevo.precio_costo || 0,
    subtotal:     (itemNuevo.cantidad || 1) * (itemNuevo.precio_costo || 0)
  })
  // Limpiar para el próximo item
  itemNuevo.nombre       = ''
  itemNuevo.cantidad     = 1
  itemNuevo.precio_costo = 0
}

// ─── ITEMS DEL GASTO ─────────────────────────────────────────────
const itemsGasto = ref([])

function recalcularGastoItem(item) {
  item.subtotal = item.cantidad * (item.precio_costo || 0)
}

function cambiarCantidadGasto(idx, delta) {
  const item = itemsGasto.value[idx]
  const nueva = item.cantidad + delta
  if (nueva <= 0) { itemsGasto.value.splice(idx, 1); return }
  item.cantidad = nueva
  recalcularGastoItem(item)
}

function quitarItemGasto(idx) {
  itemsGasto.value.splice(idx, 1)
}

const subtotalProductos = computed(() =>
  itemsGasto.value.reduce((acc, i) => acc + i.subtotal, 0)
)

const totalGasto = computed(() =>
  subtotalProductos.value + Number(datosGasto.costo_envio || 0)
)

// ─── DATOS DEL GASTO ─────────────────────────────────────────────
const datosGasto = reactive({
  fecha:       new Date().toISOString().split('T')[0],
  proveedor:   '',
  costo_envio: 0,
  metodo_pago: 'efectivo',
  notas:       ''
})

async function confirmarGasto() {
  if (itemsGasto.value.length === 0) return
  cargando.value = true
  try {
    const cabecera = {
      fecha:       datosGasto.fecha,
      proveedor:   datosGasto.proveedor   || null,
      costo_envio: Number(datosGasto.costo_envio) || 0,
      metodo_pago: datosGasto.metodo_pago,
      notas:       datosGasto.notas       || null,
      total:       totalGasto.value
    }

    await crearGasto(cabecera, itemsGasto.value)

    // Limpiar formulario
    itemsGasto.value      = []
    datosGasto.proveedor   = ''
    datosGasto.costo_envio = 0
    datosGasto.notas       = ''
    datosGasto.fecha       = new Date().toISOString().split('T')[0]

    await cargarResumen()
    mostrarToast('✅ Gasto registrado correctamente')
  } catch (e) {
    mostrarToast('❌ Error al guardar: ' + e.message)
  } finally {
    cargando.value = false
  }
}

// ─── HISTORIAL ───────────────────────────────────────────────────
const gastos        = ref([])
const gastoExpandido = ref(null)

async function cargarHistorial() {
  cargandoHistorial.value = true
  try {
    gastos.value = await fetchGastos()
  } catch (e) {
    mostrarToast('❌ Error al cargar historial')
  } finally {
    cargandoHistorial.value = false
  }
}

function toggleGasto(id) {
  gastoExpandido.value = gastoExpandido.value === id ? null : id
}

async function anularGasto(gasto) {
  if (!confirm(`¿Eliminar el gasto #${gasto.id}?`)) return
  try {
    await eliminarGasto(gasto.id)
    gastos.value = gastos.value.filter(g => g.id !== gasto.id)
    await cargarResumen()
    mostrarToast('✅ Gasto eliminado')
  } catch (e) {
    mostrarToast('❌ Error al eliminar: ' + e.message)
  }
}

// ─── RESUMEN ─────────────────────────────────────────────────────
const resumenMes = reactive({ total: 0, envios: 0, cantidad: 0, historico: 0 })

async function cargarResumen() {
  try {
    const data = await fetchGastos()
    const ahora     = new Date()
    const mes       = ahora.getMonth()
    const año       = ahora.getFullYear()

    const deMes = data.filter(g => {
      const f = new Date(g.fecha)
      return f.getMonth() === mes && f.getFullYear() === año
    })

    resumenMes.cantidad  = deMes.length
    resumenMes.total     = deMes.reduce((acc, g) => acc + Number(g.total), 0)
    resumenMes.envios    = deMes.reduce((acc, g) => acc + Number(g.costo_envio), 0)
    resumenMes.historico = data.reduce((acc, g) => acc + Number(g.total), 0)
  } catch (e) {
    console.error('Error cargando resumen gastos:', e)
  }
}

// ─── UTILIDADES ──────────────────────────────────────────────────
function formatFecha(fecha) {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}
function formatMetodo(metodo) {
  const map = {
    efectivo: 'Efectivo',
    transferencia: 'Transferencia',
    tarjeta: 'Tarjeta',
    otro: 'Otro'
  }
  return map[metodo] || metodo
}

const toast = reactive({ show: false, msg: '' })
let toastTimer = null
function mostrarToast(msg) {
  clearTimeout(toastTimer)
  toast.msg = msg; toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 2500)
}

// ─── CICLO DE VIDA ───────────────────────────────────────────────
onMounted(async () => {
  try {
    await cargarResumen()
  } catch (e) {
    mostrarToast('❌ Error al inicializar')
  }
})
</script>

<style scoped>
.gastos {
  --rose:       #C9748A;
  --rose-light: #F7E8ED;
  --rose-dark:  #8B4A5C;
  --cream:      #FFFAF9;
  --charcoal:   #2D2D2D;
  --mid:        #6B6B6B;
  --border:     #EDE4E1;
  --white:      #FFFFFF;
  --radius:     10px;
  --radius-sm:  6px;
  --trans:      0.2s ease;

  padding: 16px;
  max-width: 860px;
  margin: 0 auto;
  font-family: 'Poppins', system-ui, sans-serif;
  color: var(--charcoal);
}
@media (min-width: 640px) { .gastos { padding: 20px; } }

.gastos__back {
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
.gastos__back:hover { color: var(--rose); }

.gastos__header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
.gastos__title  { font-size: 1.3rem; font-weight: 700; }
.gastos__sub    { font-size: 13px; color: var(--mid); }
.gastos__tabs   { display: flex; gap: 6px; }
.gastos__tab    { padding: 7px 14px; border-radius: 20px; border: 1.5px solid var(--border); background: var(--white); color: var(--mid); font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit; transition: all var(--trans); }
.gastos__tab--active { background: var(--rose); color: white; border-color: var(--rose); }

.resumen { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 16px; }
@media (min-width: 640px) { .resumen { grid-template-columns: repeat(4, 1fr); gap: 10px; } }
.resumen__card  { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px; display: flex; flex-direction: column; gap: 4px; }
.resumen__label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.8px; color: var(--mid); }
.resumen__value { font-size: 1.1rem; font-weight: 700; color: var(--charcoal); }
@media (min-width: 640px) { .resumen__value { font-size: 1.3rem; } }
.resumen__value--red    { color: #C62828; }
.resumen__value--orange { color: #E65100; }
.resumen__value--rose   { color: var(--rose-dark); }

.panel { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.panel__section { padding: 16px; border-bottom: 1px solid var(--border); }
@media (min-width: 640px) { .panel__section { padding: 20px; } }
.panel__section:last-child { border-bottom: none; }
.panel__title { font-size: 12px; font-weight: 600; color: var(--mid); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }

.form-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
@media (min-width: 540px) { .form-grid { grid-template-columns: 1fr 1fr; } }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-group label { font-size: 10px; font-weight: 600; color: var(--mid); text-transform: uppercase; letter-spacing: 0.5px; }
.form-group input { padding: 8px 10px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; font-family: inherit; color: var(--charcoal); transition: border var(--trans); }
.form-group input:focus { outline: none; border-color: var(--rose); }

.item-nuevo { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
.item-nuevo__nombre { flex: 1; min-width: 160px; padding: 9px 12px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; font-family: inherit; color: var(--charcoal); transition: border var(--trans); }
.item-nuevo__nombre:focus { outline: none; border-color: var(--rose); }
.item-nuevo__qty { width: 60px; padding: 9px 8px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; font-family: inherit; text-align: center; }
.item-nuevo__qty:focus { outline: none; border-color: var(--rose); }
.item-nuevo__precio { width: 110px; padding: 9px 10px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; font-family: inherit; }
.item-nuevo__precio:focus { outline: none; border-color: var(--rose); }
.btn-agregar { padding: 9px 14px; background: var(--rose); color: white; border: none; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; white-space: nowrap; transition: background var(--trans); }
.btn-agregar:hover { background: var(--rose-dark); }

.gasto-empty { text-align: center; padding: 24px; color: var(--mid); font-size: 14px; }
.gasto-empty span { font-size: 28px; display: block; margin-bottom: 8px; }

.gasto-item { border: 1px solid var(--border); border-radius: var(--radius); padding: 12px; margin-bottom: 8px; position: relative; }
.gasto-item__info { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
.gasto-item__nombre { font-size: 13px; font-weight: 500; }
.gasto-item__tag { font-size: 10px; padding: 2px 7px; border-radius: 10px; background: #E8F5E8; color: #2E7D32; font-weight: 500; }
.gasto-item__tag--nuevo { background: #F3E8FF; color: #6B21A8; }
.gasto-item__controls { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.gasto-item__field { display: flex; flex-direction: column; gap: 4px; }
.gasto-item__field label { font-size: 10px; font-weight: 600; color: var(--mid); text-transform: uppercase; letter-spacing: 0.5px; }
.gasto-item__input { width: 100px; padding: 6px 8px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; font-family: inherit; }
.gasto-item__input:focus { outline: none; border-color: var(--rose); }
.gasto-item__subtotal { display: flex; flex-direction: column; gap: 4px; }
.gasto-item__subtotal label { font-size: 10px; font-weight: 600; color: var(--mid); text-transform: uppercase; letter-spacing: 0.5px; }
.gasto-item__subtotal strong { font-size: 15px; font-weight: 700; color: #C62828; }
.gasto-item__remove { position: absolute; top: 10px; right: 10px; background: none; border: none; color: #ddd; cursor: pointer; font-size: 14px; transition: color var(--trans); }
.gasto-item__remove:hover { color: var(--rose); }

.qty-wrap { display: flex; align-items: center; gap: 6px; }
.qty-btn { width: 22px; height: 22px; border-radius: 50%; background: var(--rose-light); color: var(--rose-dark); border: none; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; transition: background var(--trans); }
.qty-btn:hover { background: var(--rose); color: white; }
.qty-num { font-size: 13px; font-weight: 600; min-width: 18px; text-align: center; }

.gasto-total { border-top: 2px solid var(--border); margin-top: 10px; padding-top: 10px; display: flex; flex-direction: column; gap: 6px; }
.gasto-total__fila { display: flex; justify-content: space-between; font-size: 13px; color: var(--mid); }
.gasto-total__fila--total { display: flex; justify-content: space-between; font-size: 14px; padding-top: 8px; border-top: 1px solid var(--border); margin-top: 4px; }
.gasto-total__fila--total strong { font-size: 20px; font-weight: 700; color: #C62828; }

.btn-confirmar { width: 100%; padding: 12px; background: var(--rose); color: white; border: none; border-radius: var(--radius); font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; transition: background var(--trans); }
.btn-confirmar:hover:not(:disabled) { background: var(--rose-dark); }
.btn-confirmar:disabled { background: #ccc; cursor: not-allowed; }

.historial { padding: 10px 14px; }
@media (min-width: 640px) { .historial { padding: 12px 20px; } }
.historial-item { border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 8px; overflow: hidden; transition: border-color var(--trans); }
.historial-item--expandido { border-color: var(--rose); }
.historial-item__head { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; cursor: pointer; background: var(--white); transition: background var(--trans); gap: 8px; }
.historial-item__head:hover { background: var(--rose-light); }
.historial-item__info { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; flex: 1; min-width: 0; }
.historial-item__id        { font-size: 12px; font-weight: 700; color: var(--rose-dark); flex-shrink: 0; }
.historial-item__fecha     { font-size: 11px; color: var(--mid); }
.historial-item__proveedor { font-size: 12px; font-weight: 500; }
.historial-item__right     { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.historial-item__total     { font-size: 13px; font-weight: 700; color: #C62828; }
.historial-item__envio     { font-size: 11px; color: var(--mid); }
.historial-item__arrow     { font-size: 10px; color: var(--mid); }

.historial-item__detalle { background: #FAFAFA; border-top: 1px solid var(--border); }
.detalle-items { padding: 10px 14px; }
.detalle-item { display: grid; grid-template-columns: 1fr auto auto auto; gap: 8px; align-items: center; padding: 6px 0; font-size: 12px; border-bottom: 1px solid #F0E8E5; }
.detalle-item:last-child { border-bottom: none; }
.detalle-item__nombre { font-weight: 500; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.detalle-item__qty    { color: var(--mid); white-space: nowrap; }
.detalle-item__precio { color: var(--mid); white-space: nowrap; }
.detalle-item__sub    { font-weight: 700; color: #C62828; white-space: nowrap; }
.detalle-footer { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 8px; }
.detalle-meta { display: flex; gap: 12px; font-size: 12px; color: var(--mid); flex-wrap: wrap; }
.btn-anular { padding: 5px 10px; background: none; border: 1.5px solid #EEE; border-radius: var(--radius-sm); font-size: 12px; cursor: pointer; font-family: inherit; color: var(--mid); transition: all var(--trans); }
.btn-anular:hover { border-color: var(--rose); color: var(--rose); }

.estado-carga { display: flex; flex-direction: column; align-items: center; padding: 40px; gap: 12px; color: var(--mid); font-size: 14px; }
.spinner { width: 30px; height: 30px; border: 3px solid var(--rose-light); border-top-color: var(--rose); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: var(--charcoal); color: white; padding: 10px 18px; border-radius: 50px; font-size: 13px; z-index: 999; white-space: nowrap; box-shadow: 0 4px 16px rgba(0,0,0,0.2); pointer-events: none; }
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(10px); }
</style>
