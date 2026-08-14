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

    <!-- ═══ NUEVO / EDITAR GASTO ═══ -->
    <div v-if="vistaActual === 'nuevo'" class="panel">

      <!-- Banner de edición -->
      <div v-if="gastoEditandoId" class="edit-banner">
        <span>✏️ Editando gasto #{{ gastoEditandoId }}</span>
        <button class="btn-cancelar-edicion" @click="cancelarEdicionGasto">Cancelar edición</button>
      </div>

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
            <select v-model="datosGasto.metodo_pago">
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

          <!-- Descuento del proveedor -->
          <div class="descuento-proveedor">
            <span class="descuento-proveedor__label">🏷️ Descuento del proveedor</span>
            <div class="descuento-proveedor__controles">
              <select
                v-model="datosGasto.descuento_tipo"
                class="item-descuento__select"
                @change="onDescuentoGastoChange"
              >
                <option :value="null">Sin descuento</option>
                <option value="porcentaje">% Porcentaje</option>
                <option value="monto">$ Monto fijo</option>
              </select>
              <input
  v-if="datosGasto.descuento_tipo"
  v-model.number="datosGasto.descuento_valor"
  type="number"
  min="0"
  max="999999"
  class="item-descuento__input"
  :placeholder="datosGasto.descuento_tipo === 'porcentaje' ? '10' : '500'"
  @input="validarDescuentoGasto"
  />
              <span v-if="descuentoGastoMonto > 0" class="item-descuento__badge">
                -${{ descuentoGastoMonto.toLocaleString('es-AR') }}
              </span>
            </div>
          </div>

          <!-- Total -->
          <div class="gasto-total">
            <div class="gasto-total__fila" v-if="datosGasto.costo_envio > 0 || descuentoGastoMonto > 0">
              <span>Subtotal ítems</span>
              <span>${{ subtotalProductos.toLocaleString('es-AR') }}</span>
            </div>
            <div class="gasto-total__fila gasto-total__fila--descuento" v-if="descuentoGastoMonto > 0">
              <span>🏷️ Descuento proveedor</span>
              <span>-${{ descuentoGastoMonto.toLocaleString('es-AR') }}</span>
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
          {{ cargando ? 'Guardando...' : (gastoEditandoId ? 'Guardar cambios' : 'Registrar Gasto') }}
        </button>
      </div>

    </div>

    <!-- ═══ HISTORIAL ═══ -->
    <div v-if="vistaActual === 'historial'" class="panel">

      <!-- Filtros -->
      <div class="historial-filtros">
        <input
          v-model="busquedaHistorial"
          type="text"
          class="filtro-input"
          placeholder="Buscar por proveedor..."
        />
        <select v-model="filtroMetodoGasto" class="filtro-select">
          <option value="">Todos los métodos</option>
          <option value="efectivo">Efectivo</option>
          <option value="transferencia">Transferencia</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <div v-if="cargandoHistorial" class="estado-carga">
        <div class="spinner"></div>
        <p>Cargando historial...</p>
      </div>

      <div v-else-if="gastos.length === 0" class="gasto-empty" style="padding: 40px;">
        <span>📋</span>
        <p>No hay gastos registrados todavía</p>
      </div>

      <div v-else-if="gastosFiltrados.length === 0" class="gasto-empty" style="padding: 40px;">
        <span>🔍</span>
        <p>Ningún gasto coincide con el filtro</p>
      </div>

      <div v-else class="historial">
        <div
          v-for="gasto in gastosFiltrados"
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
            <div v-if="gasto.descuento_monto > 0" class="detalle-descuento">
              🏷️ Descuento aplicado: -${{ Number(gasto.descuento_monto).toLocaleString('es-AR') }}
            </div>
            <div class="detalle-footer">
              <div class="detalle-meta">
                <span v-if="gasto.notas">📝 {{ gasto.notas }}</span>
                <span v-if="gasto.costo_envio > 0">🚚 Envío: ${{ Number(gasto.costo_envio).toLocaleString('es-AR') }}</span>
                <span v-if="gasto.metodo_pago">💳 {{ formatMetodo(gasto.metodo_pago) }}</span>
              </div>
              <div class="detalle-acciones">
                <button class="btn-editar" @click="prepararEdicionGasto(gasto)">✏️ Editar</button>
                <button class="btn-anular" @click="anularGasto(gasto)">🗑️ Eliminar</button>
              </div>
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
import { crearGasto, fetchGastos, eliminarGasto, actualizarGasto } from '../services/productoService'
import { logger } from '../lib/logger'

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

// ─── DESCUENTO DEL PROVEEDOR ─────────────────────────────────────

function validarDescuentoGasto() {
  if (!datosGasto.descuento_tipo) {
    datosGasto.descuento_valor = 0
    return
  }

  if (datosGasto.descuento_valor < 0) {
    datosGasto.descuento_valor = 0
    mostrarToast('⚠️ El descuento no puede ser negativo')
    return
  }

  if (datosGasto.descuento_tipo === 'porcentaje' && datosGasto.descuento_valor > 100) {
    datosGasto.descuento_valor = 100
    mostrarToast('⚠️ El descuento no puede superar 100%')
    return
  }

  if (datosGasto.descuento_tipo === 'monto' && datosGasto.descuento_valor > subtotalProductos.value) {
    datosGasto.descuento_valor = subtotalProductos.value
    mostrarToast(`⚠️ Descuento limitado a $${subtotalProductos.value.toLocaleString('es-AR')}`)
    return
  }
}

const descuentoGastoMonto = computed(() => {
  if (!datosGasto.descuento_tipo || datosGasto.descuento_valor <= 0) {
    return 0
  }
  if (datosGasto.descuento_tipo === 'porcentaje') {
    const porcentajeValido = Math.max(0, Math.min(100, datosGasto.descuento_valor))
    return Math.round(subtotalProductos.value * (porcentajeValido / 100))
  }
  const montoValido = Math.max(0, datosGasto.descuento_valor)
  return Math.min(montoValido, subtotalProductos.value)
})

function onDescuentoGastoChange() {
  if (!datosGasto.descuento_tipo) {
    datosGasto.descuento_valor = 0
  }
  // ✅ Validar que no sea negativo
  if (datosGasto.descuento_valor < 0) {
    datosGasto.descuento_valor = 0
  }
}

const totalGasto = computed(() =>
  Math.max(0, subtotalProductos.value - descuentoGastoMonto.value) + Number(datosGasto.costo_envio || 0)
)

// ─── DATOS DEL GASTO ─────────────────────────────────────────────
const datosGasto = reactive({
  fecha: new Date().toISOString().split('T')[0],
  proveedor: '',
  costo_envio: 0,
  metodo_pago: 'efectivo',
  notas: '',
  descuento_tipo: null,
  descuento_valor: 0
})

// ─── EDICIÓN ─────────────────────────────────────────────────────
const gastoEditandoId = ref(null)

function prepararEdicionGasto(gasto) {
  gastoEditandoId.value = gasto.id

  datosGasto.fecha = gasto.fecha
  datosGasto.proveedor = gasto.proveedor || ''
  datosGasto.costo_envio = gasto.costo_envio || 0
  datosGasto.metodo_pago = gasto.metodo_pago || 'efectivo'
  datosGasto.notas = gasto.notas || ''
  datosGasto.descuento_tipo = gasto.descuento_tipo || null
  datosGasto.descuento_valor = gasto.descuento_valor || 0

  itemsGasto.value = (gasto.gasto_items || []).map(item => ({
    producto_id: item.producto_id || null,
    nombre: item.nombre,
    cantidad: item.cantidad,
    precio_costo: item.precio_costo,
    subtotal: item.subtotal
  }))

  vistaActual.value = 'nuevo'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelarEdicionGasto() {
  gastoEditandoId.value = null
  itemsGasto.value = []
  datosGasto.fecha = new Date().toISOString().split('T')[0]
  datosGasto.proveedor = ''
  datosGasto.costo_envio = 0
  datosGasto.metodo_pago = 'efectivo'
  datosGasto.notas = ''
  datosGasto.descuento_tipo = null
  datosGasto.descuento_valor = 0
}

async function confirmarGasto() {
  if (itemsGasto.value.length === 0) return
  cargando.value = true
  try {
    const cabecera = {
      fecha: datosGasto.fecha,
      proveedor: datosGasto.proveedor || null,
      costo_envio: Number(datosGasto.costo_envio) || 0,
      metodo_pago: datosGasto.metodo_pago,
      notas: datosGasto.notas || null,
      descuento_tipo: datosGasto.descuento_tipo || null,
      descuento_valor: datosGasto.descuento_valor || 0,
      descuento_monto: descuentoGastoMonto.value,
      total: totalGasto.value
    }

    if (gastoEditandoId.value) {
      await actualizarGasto(gastoEditandoId.value, cabecera, itemsGasto.value)
      mostrarToast('✅ Gasto actualizado correctamente')
      cancelarEdicionGasto()
      await cargarHistorial()
      vistaActual.value = 'historial'
    } else {
      await crearGasto(cabecera, itemsGasto.value)
      mostrarToast('✅ Gasto registrado correctamente')
      cancelarEdicionGasto()
    }

    await cargarResumen()
  } catch (e) {
    mostrarToast('❌ Error al guardar: ' + e.message)
  } finally {
    cargando.value = false
  }
}

// ─── HISTORIAL ───────────────────────────────────────────────────
const gastos = ref([])
const gastoExpandido = ref(null)
const busquedaHistorial = ref('')
const filtroMetodoGasto = ref('')

const gastosFiltrados = computed(() => {
  return gastos.value.filter(g => {
    const okProveedor = !busquedaHistorial.value.trim() ||
      (g.proveedor || '').toLowerCase().includes(busquedaHistorial.value.toLowerCase())
    const okMetodo = !filtroMetodoGasto.value || g.metodo_pago === filtroMetodoGasto.value
    return okProveedor && okMetodo
  })
})

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
    const ahora = new Date()
    const mes = ahora.getMonth()
    const año = ahora.getFullYear()

    const deMes = data.filter(g => {
      const f = new Date(g.fecha)
      return f.getMonth() === mes && f.getFullYear() === año
    })

    resumenMes.cantidad = deMes.length
    resumenMes.total = deMes.reduce((acc, g) => acc + Number(g.total), 0)
    resumenMes.envios = deMes.reduce((acc, g) => acc + Number(g.costo_envio), 0)
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

/* ─── BANNER DE EDICIÓN ─── */
.edit-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 16px;
  background: #FFF8E1;
  border-bottom: 1px solid #FFE0A3;
  font-size: 13px;
  font-weight: 600;
  color: #8A6100;
  flex-wrap: wrap;
}
.btn-cancelar-edicion {
  padding: 5px 10px;
  background: none;
  border: 1.5px solid #E0B040;
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: #8A6100;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--trans);
}
.btn-cancelar-edicion:hover { background: #FFE0A3; }

.form-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
@media (min-width: 540px) { .form-grid { grid-template-columns: 1fr 1fr; } }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-group label { font-size: 10px; font-weight: 600; color: var(--mid); text-transform: uppercase; letter-spacing: 0.5px; }
.form-group input,
.form-group select {
  padding: 8px 10px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-family: inherit;
  color: var(--charcoal);
  background: var(--white);
  transition: border var(--trans);
  cursor: pointer;
}
.form-group input { cursor: text; }
.form-group input:focus,
.form-group select:focus { outline: none; border-color: var(--rose); }

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

/* ─── DESCUENTO PROVEEDOR ─── */
.descuento-proveedor {
  margin-top: 8px;
  padding: 12px;
  background: #FFFAF9;
  border: 1px dashed var(--rose);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}
.descuento-proveedor__label { font-size: 13px; font-weight: 600; color: var(--charcoal); }
.descuento-proveedor__controles { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.item-descuento__select { padding: 6px 8px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 12px; font-family: inherit; color: var(--charcoal); background: var(--white); cursor: pointer; }
.item-descuento__input { width: 80px; padding: 6px 8px; border: 1.5px solid var(--rose); border-radius: var(--radius-sm); font-size: 12px; font-family: inherit; color: var(--charcoal); }
.item-descuento__input:focus { outline: none; }
.item-descuento__badge { font-size: 12px; font-weight: 700; color: #2E7D32; background: #E8F5E8; padding: 3px 8px; border-radius: 10px; }

.gasto-total { border-top: 2px solid var(--border); margin-top: 10px; padding-top: 10px; display: flex; flex-direction: column; gap: 6px; }
.gasto-total__fila { display: flex; justify-content: space-between; font-size: 13px; color: var(--mid); }
.gasto-total__fila--descuento { color: #2E7D32; font-weight: 600; }
.gasto-total__fila--total { display: flex; justify-content: space-between; font-size: 14px; padding-top: 8px; border-top: 1px solid var(--border); margin-top: 4px; }
.gasto-total__fila--total strong { font-size: 20px; font-weight: 700; color: #C62828; }

.btn-confirmar { width: 100%; padding: 12px; background: var(--rose); color: white; border: none; border-radius: var(--radius); font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; transition: background var(--trans); }
.btn-confirmar:hover:not(:disabled) { background: var(--rose-dark); }
.btn-confirmar:disabled { background: #ccc; cursor: not-allowed; }

/* ─── FILTROS HISTORIAL ─── */
.historial-filtros { display: flex; gap: 8px; padding: 14px 16px; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
.filtro-input { flex: 2; min-width: 160px; padding: 7px 10px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 12px; font-family: inherit; color: var(--charcoal); background: var(--white); }
.filtro-input:focus { outline: none; border-color: var(--rose); }
.filtro-select { flex: 1; min-width: 130px; padding: 7px 10px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 12px; font-family: inherit; color: var(--charcoal); background: var(--white); cursor: pointer; }

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
.detalle-descuento { padding: 0 14px 10px; font-size: 12px; font-weight: 600; color: #2E7D32; }
.detalle-footer { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 8px; }
.detalle-meta { display: flex; gap: 12px; font-size: 12px; color: var(--mid); flex-wrap: wrap; }
.detalle-acciones { display: flex; gap: 8px; }
.btn-editar { padding: 5px 10px; background: none; border: 1.5px solid #BBDEFB; border-radius: var(--radius-sm); font-size: 12px; cursor: pointer; font-family: inherit; color: #1565C0; transition: all var(--trans); }
.btn-editar:hover { background: #E3F2FD; border-color: #1565C0; }
.btn-anular { padding: 5px 10px; background: none; border: 1.5px solid #EEE; border-radius: var(--radius-sm); font-size: 12px; cursor: pointer; font-family: inherit; color: var(--mid); transition: all var(--trans); }
.btn-anular:hover { border-color: var(--rose); color: var(--rose); }

.estado-carga { display: flex; flex-direction: column; align-items: center; padding: 40px; gap: 12px; color: var(--mid); font-size: 14px; }
.spinner { width: 30px; height: 30px; border: 3px solid var(--rose-light); border-top-color: var(--rose); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: var(--charcoal); color: white; padding: 10px 18px; border-radius: 50px; font-size: 13px; z-index: 999; white-space: nowrap; box-shadow: 0 4px 16px rgba(0,0,0,0.2); pointer-events: none; }
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(10px); }
</style>