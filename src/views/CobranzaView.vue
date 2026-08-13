<template>
  <div class="cobr">

    <!-- HEADER -->
     <button class="cobr__back" @click="$router.push({ name: 'admin' })">
      ← Volver al panel
    </button>
    <div class="cobr__header">
      <div>
        <h1 class="cobr__title">Cobranza</h1>
        <p class="cobr__sub">Registrá ventas y consultá el historial</p>
      </div>
      <div class="cobr__tabs">
        <button
          class="cobr__tab"
          :class="{ 'cobr__tab--active': vistaActual === 'nueva' }"
          @click="vistaActual = 'nueva'"
        >+ Nueva venta</button>
        <button
          class="cobr__tab"
          :class="{ 'cobr__tab--active': vistaActual === 'historial' }"
          @click="vistaActual = 'historial'; cargarHistorial()"
        >Historial</button>
      </div>
    </div>

    <!-- RESUMEN DEL DÍA -->
    <div class="resumen">
      <div class="resumen__card">
        <span class="resumen__label">Cobrado hoy</span>
        <span class="resumen__value resumen__value--green">${{ resumenHoy.cobrado.toLocaleString('es-AR') }}</span>
      </div>
      <div class="resumen__card">
        <span class="resumen__label">Pendiente hoy</span>
        <span class="resumen__value resumen__value--orange">${{ resumenHoy.pendiente.toLocaleString('es-AR') }}</span>
      </div>
      <div class="resumen__card">
        <span class="resumen__label">Ventas hoy</span>
        <span class="resumen__value">{{ resumenHoy.cantidad }}</span>
      </div>
      <div class="resumen__card">
        <span class="resumen__label">Total del día</span>
        <span class="resumen__value resumen__value--rose">${{ resumenHoy.total.toLocaleString('es-AR') }}</span>
      </div>
    </div>

    <!-- ═══ NUEVA VENTA ═══ -->
    <div v-if="vistaActual === 'nueva'" class="panel">
      <div class="panel__section">
    <h2 class="panel__title">1. Datos del cliente y pago</h2>
    <div class="form-grid">
      <div class="form-group">
        <label>Nombre del cliente</label>
        <input v-model="datosPedido.cliente" type="text" placeholder="Opcional" />
      </div>
      <div class="form-group">
        <label>Teléfono</label>
        <input v-model="datosPedido.telefono" type="text" placeholder="Opcional" />
      </div>
      <div class="form-group">
        <label>Método de pago</label>
        <select v-model="datosPedido.metodo_pago">
          <option value="efectivo">💵 Efectivo</option>
          <option value="transferencia">🏦 Transferencia</option>
          <option value="mercado_pago">📱 Mercado Pago</option>
          <option value="debito">💳 Débito</option>
          <option value="credito">💳 Crédito</option>
        </select>
      </div>
      <div class="form-group">
        <label>Estado</label>
        <select v-model="datosPedido.estado">
          <option value="pagado">✅ Pagado</option>
          <option value="pendiente">⏳ Pendiente</option>
          <option value="señado">💰 Señado</option>
        </select>
      </div>
      <div class="form-group form-group--full">
        <label>Notas</label>
        <input v-model="datosPedido.notas" type="text" placeholder="Observaciones adicionales..." />
      </div>
    </div>
  </div>

      <!-- Buscador de productos -->
      <div class="panel__section">
        <h2 class="panel__title">2. Agregá productos</h2>
        <div class="prod-search">
          <div class="prod-search__input-wrap">
            <span class="prod-search__icon">🔍</span>
            <input
  v-model="busquedaProd"
  type="text"
  class="prod-search__input"
  placeholder="Buscá por nombre del producto..."
  @input="filtrarProductos"
  @focus="searchAbierto = true"
  @blur="cerrarSearchConRetraso"
/>
          </div>

          <!-- Dropdown de resultados -->
          <div v-if="searchAbierto && productosBuscados.length > 0" class="prod-search__dropdown">
            <div
              v-for="p in productosBuscados"
              :key="p.id"
              class="prod-search__item"
              :class="{ 'prod-search__item--agotado': p.stock <= 0 }"
              @mousedown.prevent="seleccionarProducto(p)"
            >
              <img :src="p.imagen_url" :alt="p.nombre" class="prod-search__img" />
              <div class="prod-search__info">
                <span class="prod-search__nombre">{{ p.nombre }}</span>
                <span class="prod-search__precio">${{ p.precio.toLocaleString('es-AR') }}</span>
              </div>
              <span class="prod-search__stock" :class="{ 'prod-search__stock--bajo': p.stock <= 3 }">
                {{ p.stock > 0 ? `Stock: ${p.stock}` : 'Sin stock' }}
              </span>
            </div>
          </div>

          <p v-if="searchAbierto && busquedaProd && productosBuscados.length === 0" class="prod-search__empty">
            No se encontraron productos
          </p>
        </div>
      </div>

      <!-- Items de la venta actual -->
      <div class="panel__section">
        <div v-if="itemsVenta.length === 0" class="venta-empty">
          <span>🛒</span>
          <p>Buscá y agregá productos para armar la venta</p>
        </div>

        <div v-else>
  <div v-for="(item, idx) in itemsVenta" :key="idx" class="venta-item">
    <img :src="item.imagen_url" :alt="item.nombre" class="venta-item__img" />
    <div class="venta-item__info">
      <span class="venta-item__nombre">{{ item.nombre }}</span>
      <span class="venta-item__precio">${{ item.precio_unit.toLocaleString('es-AR') }} c/u</span>

      <!-- Descuento por item -->
      <div class="item-descuento">
        <select
          v-model="item.descuento_tipo"
          class="item-descuento__select"
          @change="onDescuentoItemChange(item)"
        >
          <option :value="null">Sin descuento</option>
          <option value="porcentaje">% Porcentaje</option>
          <option value="monto">$ Monto fijo</option>
        </select>
        <input
          v-if="item.descuento_tipo"
          v-model.number="item.descuento_valor"
          type="number"
          min="0"
          class="item-descuento__input"
          :placeholder="item.descuento_tipo === 'porcentaje' ? '10' : '500'"
          @input="onDescuentoItemChange(item)"
        />
        <span v-if="item.descuento_monto > 0" class="item-descuento__badge">
          -${{ item.descuento_monto.toLocaleString('es-AR') }}
        </span>
      </div>
    </div>

    <div class="venta-item__qty">
      <button
  class="qty-btn"
  :disabled="item.cantidad >= item.stock" 
  @click="cambiarCantidadItem(idx, 1)"
>+</button>
      <span class="qty-num">{{ item.cantidad }}</span>
      <button class="qty-btn" :disabled="item.cantidad >= item.stock" @click="cambiarCantidadItem(idx, 1)">+</button>
    </div>
    <span class="venta-item__subtotal">${{ item.subtotal.toLocaleString('es-AR') }}</span>
    <button class="venta-item__remove" @click="quitarItem(idx)">✕</button>
  </div>

<div class="descuento-general">
            <span class="descuento-general__label">💰 Descuento general</span>
            <div class="descuento-general__controles">
              <select
                v-model="descuentoGeneral.tipo"
                class="item-descuento__select"
                @change="onDescuentoGeneralChange"
              >
                <option :value="null">Sin descuento</option>
                <option value="porcentaje">% Porcentaje</option>
                <option value="monto">$ Monto fijo</option>
              </select>
              <input
                v-if="descuentoGeneral.tipo"
                v-model.number="descuentoGeneral.valor"
                type="number"
                min="0"
                class="item-descuento__input"
                :placeholder="descuentoGeneral.tipo === 'porcentaje' ? '10' : '1000'"
              />
            </div>
          </div>

          <!-- ✅ CARRITO FLOTANTE - Único resumen de totales -->
          <div class="carrito-flotante">
            <div class="carrito-flotante__row">
  <span class="carrito-flotante__label">📦 Unidades:</span>
  <span class="carrito-flotante__value">{{ cantidadTotalProductos }}</span>
</div>

            <div class="carrito-flotante__row">
              <span class="carrito-flotante__label">Subtotal:</span>
              <span class="carrito-flotante__value">${{ subtotalItems.toLocaleString('es-AR') }}</span>
            </div>
            
            <div v-if="itemsVenta.some(i => i.descuento_monto > 0)" class="carrito-flotante__row carrito-flotante__row--descuento">
              <span class="carrito-flotante__label">🏷️ Desc. items:</span>
              <span class="carrito-flotante__value">-${{ itemsVenta.reduce((a,i) => a + i.descuento_monto, 0).toLocaleString('es-AR') }}</span>
            </div>

            <div v-if="descuentoGeneralMonto > 0" class="carrito-flotante__row carrito-flotante__row--descuento">
              <span class="carrito-flotante__label">💰 Desc. gral:</span>
              <span class="carrito-flotante__value">-${{ descuentoGeneralMonto.toLocaleString('es-AR') }}</span>
            </div>
            
            <div class="carrito-flotante__row carrito-flotante__row--total">
              <span class="carrito-flotante__label">💳 TOTAL:</span>
              <span class="carrito-flotante__value--total">${{ totalVenta.toLocaleString('es-AR') }}</span>
            </div>
          </div>
</div>
      </div>

      <div v-if="itemsVenta.length > 0" class="panel__section">
    <button class="btn-confirmar" :disabled="cargando" @click="confirmarVenta">
      {{ cargando ? 'Guardando...' : '✓ Confirmar venta' }}
    </button>
      </div>
    </div>

    <!-- ═══ HISTORIAL ═══ -->
    <div v-if="vistaActual === 'historial'" class="panel">

      <!-- Filtros -->
      <div class="historial-filtros">
        <select v-model="filtroEstado" class="filtro-select">
          <option value="">Todos los estados</option>
          <option value="pagado">Pagado</option>
          <option value="pendiente">Pendiente</option>
          <option value="señado">Señado</option>
        </select>
        <select v-model="filtroMetodo" class="filtro-select">
          <option value="">Todos los métodos</option>
          <option value="efectivo">Efectivo</option>
          <option value="transferencia">Transferencia</option>
          <option value="mercado_pago">Mercado Pago</option>
          <option value="debito">Débito</option>
          <option value="credito">Crédito</option>
        </select>
      </div>

      <div v-if="cargandoHistorial" class="estado-carga">
        <div class="spinner"></div>
        <p>Cargando historial...</p>
      </div>

      <div v-else-if="pedidosFiltrados.length === 0" class="venta-empty">
        <span>📋</span>
        <p>No hay ventas registradas</p>
      </div>

      <div v-else class="historial">
        <div
          v-for="pedido in pedidosFiltrados"
          :key="pedido.id"
          class="historial-item"
          :class="{ 'historial-item--expandido': pedidoExpandido === pedido.id }"
        >
          <!-- Cabecera del pedido -->
          <div class="historial-item__head" @click="togglePedido(pedido.id)">
            <div class="historial-item__info">
              <span class="historial-item__id">#{{ pedido.id }}</span>
              <span class="historial-item__fecha">{{ formatFecha(pedido.created_at) }}</span>
              <span v-if="pedido.cliente" class="historial-item__cliente">{{ pedido.cliente }}</span>
            </div>
            <div class="historial-item__right">
              <span class="historial-item__total">${{ pedido.total.toLocaleString('es-AR') }}</span>
              <span class="estado-badge" :class="`estado-badge--${pedido.estado}`">
                {{ pedido.estado }}
              </span>
              <span class="historial-item__arrow">{{ pedidoExpandido === pedido.id ? '▲' : '▼' }}</span>
            </div>
          </div>

          <!-- Detalle expandible -->
          <div v-if="pedidoExpandido === pedido.id" class="historial-item__detalle">
            <div class="detalle-items">
              <div v-for="item in pedido.pedido_items" :key="item.id" class="detalle-item">
                <span class="detalle-item__nombre">{{ item.nombre }}</span>
                <span class="detalle-item__qty">x{{ item.cantidad }}</span>
                <span class="detalle-item__precio">${{ item.precio_unit.toLocaleString('es-AR') }}</span>
                <span class="detalle-item__sub">${{ item.subtotal.toLocaleString('es-AR') }}</span>
              </div>
            </div>
            <div class="detalle-footer">
              <div class="detalle-meta">
                <span>💳 {{ formatMetodo(pedido.metodo_pago) }}</span>
                <span v-if="pedido.notas">📝 {{ pedido.notas }}</span>
              </div>
              <div class="detalle-acciones">
                <!-- Cambiar método de pago -->
                <select
                  :value="pedido.metodo_pago"
                  class="metodo-select"
                  @change="cambiarMetodoPago(pedido, $event.target.value)"
                >
                  <option value="efectivo">💵 Efectivo</option>
                  <option value="transferencia">🏦 Transferencia</option>
                  <option value="mercado_pago">📱 Mercado Pago</option>
                  <option value="debito">💳 Débito</option>
                  <option value="credito">💳 Crédito</option>
                </select>
                <!-- Cambiar estado -->
                <select
                  :value="pedido.estado"
                  class="estado-select"
                  @change="cambiarEstado(pedido, $event.target.value)"
                >
                  <option value="pagado">✅ Pagado</option>
                  <option value="pendiente">⏳ Pendiente</option>
                  <option value="señado">💰 Señado</option>
                </select>

                <button class="btn-anular" @click="anular(pedido)">
                  🗑️ Anular
                </button>
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
import { supabase } from '../lib/supabaseClient'
import {
  fetchProductos,
  fetchProductosAdmin,
  subirImagenProducto,
  crearPedido,
  fetchPedidos,
  fetchPedidosHoy,
  anularPedido,
  validarStockVenta,
  actualizarEstadoPedido,
  actualizarMetodoPagoPedido
} from '../services/productoService.js'
import { useCarrito } from '../composables/useCarrito'
import { AppError } from '../lib/AppError'
import { logger } from '../lib/logger'

// ─── ESTADO GENERAL ──────────────────────────────────────────────
const vistaActual = ref('nueva')
const cargando = ref(false)
const cargandoHistorial = ref(false)

// ─── PRODUCTOS ───────────────────────────────────────────────────
const todosLosProductos = ref([])
const busquedaProd = ref('')
const searchAbierto = ref(false)

// ─── CARRITO ───────────────────────────────────────────────────
const {
  carrito: carritoInterno,
  buscarStock,
  buscarImagen
} = useCarrito(todosLosProductos)

const productosBuscados = computed(() => {
  if (!busquedaProd.value.trim()) return []
  const q = busquedaProd.value.toLowerCase()
  return todosLosProductos.value
    .filter(p => p.nombre && p.nombre.toLowerCase().includes(q))
    .slice(0, 8)
})

function filtrarProductos() {
  searchAbierto.value = true
}

function cerrarSearchConRetraso() {
  setTimeout(() => { searchAbierto.value = false }, 200)
}

function seleccionarProducto(p) {
  if (p.stock <= 0) return

  const existe = itemsVenta.value.find(i => i.producto_id === p.id)
  if (existe) {
    if (existe.cantidad < existe.stock) {
      existe.cantidad++
      recalcularItem(existe)
    }
  } else {
    itemsVenta.value.push({
      producto_id: p.id,
      nombre: p.nombre,
      imagen_url: p.imagen_url,
      precio_unit: p.precio,
      cantidad: 1,
      subtotal: p.precio,
      stock: p.stock,
      descuento_tipo: null,
      descuento_valor: 0,
      descuento_monto: 0
    })
  }

  busquedaProd.value = ''
  searchAbierto.value = false
}

// ─── DESCUENTOS ──────────────────────────────────────────────────

// Recalcula el subtotal de un item aplicando su descuento
function recalcularItem(item) {
  const bruto = item.precio_unit * item.cantidad

  if (item.descuento_tipo === 'porcentaje' && item.descuento_valor > 0) {
    item.descuento_monto = Math.round(bruto * (item.descuento_valor / 100))
  } else if (item.descuento_tipo === 'monto' && item.descuento_valor > 0) {
    item.descuento_monto = Math.min(item.descuento_valor, bruto)
  } else {
    item.descuento_monto = 0
  }

  item.subtotal = bruto - item.descuento_monto
}

function onDescuentoItemChange(item) {
  if (!item.descuento_tipo) item.descuento_valor = 0
  recalcularItem(item)
}

// Descuento general sobre el total
const descuentoGeneral = reactive({
  tipo: null, // 'porcentaje' | 'monto' | null
  valor: 0,
  monto: 0
})

// Subtotal antes de descuento general (suma de subtotales de items)
const subtotalItems = computed(() =>
  itemsVenta.value.reduce((acc, i) => acc + i.subtotal, 0)
)

// Monto del descuento general calculado
const descuentoGeneralMonto = computed(() => {
  if (!descuentoGeneral.tipo || descuentoGeneral.valor <= 0) {
    return 0  // ← Descuento negativo o cero → no aplica
  }

  if (descuentoGeneral.tipo === 'porcentaje') {
    // ✅ Asegurar que valor esté entre 0-100
    const porcentajeValido = Math.max(0, Math.min(100, descuentoGeneral.valor))
    return Math.round(subtotalItems.value * (porcentajeValido / 100))
  }

  if (descuentoGeneral.tipo === 'monto') {
    // ✅ El descuento no puede superar el subtotal
    return Math.min(Math.max(0, descuentoGeneral.valor), subtotalItems.value)
  }

  return 0
})

// Total final de la venta (Con descuento general aplicado)
const totalVenta = computed(() =>
  Math.max(0, subtotalItems.value - descuentoGeneralMonto.value)
)

const cantidadTotalProductos = computed(() =>
  itemsVenta.value.reduce((total, item) => total + item.cantidad, 0)
)

function onDescuentoGeneralChange() {
  if (!descuentoGeneral.tipo) descuentoGeneral.valor = 0
}

// ─── ITEMS DE LA VENTA ───────────────────────────────────────────
const itemsVenta = ref([])

function cambiarCantidadItem(idx, delta) {
  const item = itemsVenta.value[idx]
  const nueva = item.cantidad + delta
  if (nueva <= 0) { itemsVenta.value.splice(idx, 1); return }
  if (nueva > item.stock) return
  item.cantidad = nueva
  recalcularItem(item)
}

function quitarItem(idx) {
  itemsVenta.value.splice(idx, 1)
}

// ─── DATOS DEL PEDIDO ────────────────────────────────────────────
const datosPedido = reactive({
  cliente: '',
  telefono: '',
  metodo_pago: 'efectivo',
  estado: 'pagado',
  notas: ''
})

async function confirmarVenta() {
  if (itemsVenta.value.length === 0) return
  
  // ✅ VALIDAR STOCK ANTES DE PROCESAR
  const validacion = await validarStockVenta(itemsVenta.value)
  if (!validacion.valido) {
    mostrarToast(`⚠️ ${validacion.error}`)
    return // Detener si hay problemas de stock
  }

  cargando.value = true
  try {
    const cabecera = {
      cliente: datosPedido.cliente || null,
      telefono: datosPedido.telefono || null,
      metodo_pago: datosPedido.metodo_pago,
      estado: datosPedido.estado,
      notas: datosPedido.notas || null,
      subtotal: subtotalItems.value,
      descuento_tipo: descuentoGeneral.tipo || null,
      descuento_valor: Math.max(0, Number(descuentoGeneral.valor)),
      descuento_monto: Math.max(0, descuentoGeneralMonto.value),
      total: Math.max(0, totalVenta.value)
    }

    if (cabecera.total < 0) {
      mostrarToast('❌ Error: El total de la venta no puede ser negativo')
      return // Detener si el total es negativo
    }

    await crearPedido(cabecera, itemsVenta.value)
    // Limpiar todo
    itemsVenta.value = []
    descuentoGeneral.tipo = null
    descuentoGeneral.valor = 0
    datosPedido.cliente = ''
    datosPedido.telefono = ''
    datosPedido.metodo_pago = 'efectivo'
    datosPedido.estado = 'pagado'
    datosPedido.notas = ''

    await cargarResumenHoy()
    todosLosProductos.value = await fetchProductosAdmin()
    mostrarToast('✅ Venta registrada correctamente')
    
    // Pausa visual
    await new Promise(r => setTimeout(r, 800))
  } catch (e) {
    // ✅ USAR LOGGER ESTRUCTURADO
    if (e instanceof AppError) {
      logger.error('Error en confirmarVenta (AppError)', e)
      mostrarToast(`❌ ${e.message}`)
    } else {
      logger.error('Error inesperado en confirmarVenta', e)
      mostrarToast('❌ Error inesperado, contacta al admin')
    }
  } finally {
      cargando.value = false
    }
}

// ─── HISTORIAL ───────────────────────────────────────────────────
const pedidos = ref([])
const filtroEstado = ref('')
const filtroMetodo = ref('')
const pedidoExpandido = ref(null)

const pedidosFiltrados = computed(() => {
  return pedidos.value.filter(p => {
    const okEstado = !filtroEstado.value || p.estado === filtroEstado.value
    const okMetodo = !filtroMetodo.value || p.metodo_pago === filtroMetodo.value
    return okEstado && okMetodo
  })
})

function togglePedido(id) {
  pedidoExpandido.value = pedidoExpandido.value === id ? null : id
}

async function cambiarMetodoPago(pedido, nuevoMetodo) {
  try {
    await actualizarMetodoPagoPedido(pedido.id, nuevoMetodo)
    pedido.metodo_pago = nuevoMetodo
    await cargarResumenHoy()
    mostrarToast('✅ Método de pago actualizado')
  } catch (e) {
    mostrarToast('❌ Error al actualizar método: ' + e.message)
  }
}

async function cambiarEstado(pedido, nuevoEstado) {
  try {
    await actualizarEstadoPedido(pedido.id, nuevoEstado)
    pedido.estado = nuevoEstado
    await cargarResumenHoy()
    mostrarToast('✅ Estado actualizado')
  } catch (e) {
    mostrarToast('❌ Error al actualizar estado')
  }
}

async function anular(pedido) {
  if (!confirm(`¿Anular la venta #${pedido.id}? Se devolverá el stock.`)) return
  try {
    await anularPedido(pedido)
    pedidos.value = pedidos.value.filter(p => p.id !== pedido.id)
    await cargarResumenHoy()
    todosLosProductos.value = await fetchProductos()
    mostrarToast('✅ Venta anulada y stock recuperado')
  } catch (e) {
    mostrarToast('❌ Error al anular: ' + e.message)
  }
}

// ─── RESUMEN DEL DÍA ─────────────────────────────────────────────
const resumenHoy = reactive({ cobrado: 0, pendiente: 0, cantidad: 0, total: 0 })

async function cargarResumenHoy() {
  try {
    const data = await fetchPedidosHoy()
    resumenHoy.cantidad = data.length
    resumenHoy.total = data.reduce((acc, p) => acc + Number(p.total), 0)
    resumenHoy.cobrado = data.filter(p => p.estado === 'pagado').reduce((acc, p) => acc + Number(p.total), 0)
    resumenHoy.pendiente = data.filter(p => p.estado !== 'pagado').reduce((acc, p) => acc + Number(p.total), 0)
  } catch (e) {
    console.error('Error cargando resumen:', e)
  }
}

// ─── UTILIDADES ──────────────────────────────────────────────────
function formatFecha(iso) {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function formatMetodo(m) {
  const map = {
    efectivo: 'Efectivo',
    transferencia: 'Transferencia',
    mercado_pago: 'Mercado Pago',
    debito: 'Débito',
    credito: 'Crédito'
  }
  return map[m] || m
}

const toast = reactive({ show: false, msg: '' })
let toastTimer = null
function mostrarToast(msg) {
  clearTimeout(toastTimer)
  toast.msg = msg
  toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 2500)
}

// ─── CICLO DE VIDA ───────────────────────────────────────────────
async function cargarHistorial() {
  cargandoHistorial.value = true
  try {
    logger.debug('Cargando historial de cobranza')
    pedidos.value = await fetchPedidos()
    await cargarResumenHoy()
    logger.info('Historial cargado', { cantidad: pedidos.value.length })
  } catch (e) {
    logger.error('Error cargando historial', e)
    mostrarToast('❌ Error al cargar historial')
  } finally {
    cargandoHistorial.value = false
  }
}

// ─── CARGAR PRODUCTOS AL MONTAR ─────────────────────────────────
async function cargarProductosParaBusqueda() {
  try {
    const prods = await fetchProductosAdmin()
    // fetchProductosAdmin devuelve un array directamente
    todosLosProductos.value = prods || []
    
    if (import.meta.env.DEV) {
      console.log('✅ Productos cargados para búsqueda:', todosLosProductos.value.length)
    }
  } catch (e) {
    mostrarToast('❌ Error al cargar productos')
    console.error('Error:', e)
  }
}

// Y registra que se cargue al montar el componente
onMounted(async () => {
  await cargarProductosParaBusqueda()
  await cargarResumenHoy()
})
</script>

<style scoped>
.cobr {
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
@media (min-width: 640px) { .cobr { padding: 20px; } }

/* HEADER */
.cobr__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}
.cobr__title { font-size: 1.3rem; font-weight: 700; }
.cobr__sub   { font-size: 13px; color: var(--mid); }
.cobr__tabs  { display: flex; gap: 6px; }
.cobr__tab   { padding: 7px 14px; border-radius: 20px; border: 1.5px solid var(--border); background: var(--white); color: var(--mid); font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit; transition: all var(--trans); }
.cobr__tab--active { background: var(--rose); color: white; border-color: var(--rose); }

/* VOLVER AL ADMIN */
.cobr__back {
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
.cobr__back:hover { color: var(--rose); }

/* RESUMEN */
.resumen {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}
@media (min-width: 640px) { .resumen { grid-template-columns: repeat(4, 1fr); gap: 10px; } }
.resumen__card  { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px; display: flex; flex-direction: column; gap: 4px; }
.resumen__label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.8px; color: var(--mid); }
.resumen__value { font-size: 1.1rem; font-weight: 700; color: var(--charcoal); }
@media (min-width: 640px) { .resumen__value { font-size: 1.3rem; } }
.resumen__value--green  { color: #2E7D32; }
.resumen__value--orange { color: #E65100; }
.resumen__value--rose   { color: var(--rose-dark); }

/* PANEL */
.panel { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.panel__section { padding: 16px; border-bottom: 1px solid var(--border); }
@media (min-width: 640px) { .panel__section { padding: 20px; } }
.panel__section:last-child { border-bottom: none; }
.panel__title { font-size: 12px; font-weight: 600; color: var(--mid); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }

/* BUSCADOR */
.prod-search { position: relative; }
.prod-search__input-wrap { position: relative; }
.prod-search__icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 14px; pointer-events: none; }
.prod-search__input { width: 100%; padding: 10px 14px 10px 36px; border: 1.5px solid var(--border); border-radius: var(--radius); font-size: 14px; font-family: inherit; color: var(--charcoal); transition: border var(--trans); }
.prod-search__input:focus { outline: none; border-color: var(--rose); box-shadow: 0 0 0 3px rgba(201,116,138,0.1); }
.prod-search__dropdown { position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: 0 8px 24px rgba(0,0,0,0.1); z-index: 50; overflow: hidden; max-height: 320px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--rose-light) transparent; }
.prod-search__dropdown::-webkit-scrollbar { width: 6px;}
.prod-search__dropdown::-webkit-scrollbar-track { background: transparent;}
.prod-search__dropdown::-webkit-scrollbar-thumb { background: var(--rose-light); border-radius: 3px;}
.prod-search__dropdown::-webkit-scrollbar-thumb:hover { background: var(--rose);}
.prod-search__item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; cursor: pointer; border-bottom: 1px solid #F5EDE9; transition: background var(--trans); }
.prod-search__item:last-child { border-bottom: none; }
.prod-search__item:hover { background: var(--rose-light); }
.prod-search__item--agotado { opacity: 0.5; cursor: not-allowed; }
.prod-search__img { width: 36px; height: 36px; border-radius: var(--radius-sm); object-fit: cover; background: var(--rose-light); flex-shrink: 0; }
.prod-search__info { flex: 1; min-width: 0; }
.prod-search__nombre { display: block; font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.prod-search__precio { font-size: 12px; color: var(--rose-dark); font-weight: 600; }
.prod-search__stock { font-size: 11px; color: var(--mid); white-space: nowrap; }
.prod-search__stock--bajo { color: #E65100; font-weight: 600; }
.prod-search__empty { padding: 10px 14px; font-size: 13px; color: var(--mid); }

/* ITEMS DE VENTA */
.venta-empty { text-align: center; padding: 24px; color: var(--mid); font-size: 14px; }
.venta-empty span { font-size: 28px; display: block; margin-bottom: 8px; }

.venta-item { display: flex; align-items: flex-start; gap: 8px; padding: 10px 0; border-bottom: 1px solid #F5EDE9; }
.venta-item:last-of-type { border-bottom: none; }
.venta-item__img { width: 40px; height: 40px; border-radius: var(--radius-sm); object-fit: cover; background: var(--rose-light); flex-shrink: 0; }
.venta-item__info { flex: 1; min-width: 0; }
.venta-item__nombre { display: block; font-size: 13px; font-weight: 500; }
.venta-item__precio { font-size: 11px; color: var(--mid); }
.venta-item__qty { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.venta-item__subtotal { font-size: 13px; font-weight: 700; color: var(--rose-dark); min-width: 70px; text-align: right; flex-shrink: 0; }
@media (max-width: 480px) { .venta-item__subtotal { min-width: 60px; font-size: 12px; } }
.venta-item__remove { background: none; border: none; color: #ddd; cursor: pointer; font-size: 14px; padding: 4px; transition: color var(--trans); flex-shrink: 0; }
.venta-item__remove:hover { color: var(--rose); }

/* DESCUENTOS */
.item-descuento { display: flex; align-items: center; gap: 5px; margin-top: 4px; flex-wrap: wrap; }
.item-descuento__select { padding: 3px 6px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 11px; font-family: inherit; color: var(--charcoal); background: var(--white); cursor: pointer; }
.item-descuento__input { width: 60px; padding: 3px 6px; border: 1.5px solid var(--rose); border-radius: var(--radius-sm); font-size: 12px; font-family: inherit; color: var(--charcoal); }
.item-descuento__input:focus { outline: none; }
.item-descuento__badge { font-size: 11px; font-weight: 600; color: #2E7D32; background: #E8F5E8; padding: 2px 6px; border-radius: 10px; }

/* FORMULARIO */
.form-grid { display: grid; grid-template-columns: 1fr; gap: 10px; margin-bottom: 14px; }
@media (min-width: 540px) { .form-grid { grid-template-columns: 1fr 1fr; } }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-group--full { grid-column: 1 / -1; }
.form-group label { font-size: 10px; font-weight: 600; color: var(--mid); text-transform: uppercase; letter-spacing: 0.5px; }
.form-group input, .form-group select { padding: 8px 10px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; font-family: inherit; color: var(--charcoal); background: var(--white); transition: border var(--trans); }
.form-group input:focus, .form-group select:focus { outline: none; border-color: var(--rose); }

.btn-confirmar { width: 100%; padding: 12px; background: var(--rose); color: white; border: none; border-radius: var(--radius); font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; transition: background var(--trans); }
.btn-confirmar:hover:not(:disabled) { background: var(--rose-dark); }
.btn-confirmar:disabled { background: #ccc; cursor: not-allowed; }

/* HISTORIAL */
.historial-filtros { display: flex; gap: 8px; padding: 14px 16px; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
.filtro-select { flex: 1; min-width: 130px; padding: 7px 10px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 12px; font-family: inherit; color: var(--charcoal); background: var(--white); cursor: pointer; }
.historial { padding: 10px 14px; }
@media (min-width: 640px) { .historial { padding: 12px 20px; } }

.historial-item { border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 8px; overflow: hidden; transition: border-color var(--trans); }
.historial-item--expandido { border-color: var(--rose); }
.historial-item__head { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; cursor: pointer; background: var(--white); transition: background var(--trans); gap: 8px; }
.historial-item__head:hover { background: var(--rose-light); }
.historial-item__info { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; flex: 1; min-width: 0; }
.historial-item__id       { font-size: 12px; font-weight: 700; color: var(--rose-dark); flex-shrink: 0; }
.historial-item__fecha    { font-size: 11px; color: var(--mid); }
.historial-item__cliente  { font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.historial-item__right    { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.historial-item__total    { font-size: 13px; font-weight: 700; }
.historial-item__arrow    { font-size: 10px; color: var(--mid); }

.estado-badge { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 10px; text-transform: capitalize; white-space: nowrap; }
.estado-badge--pagado    { background: #E8F5E8; color: #2E7D32; }
.estado-badge--pendiente { background: #FFF8E1; color: #E65100; }
.estado-badge--señado    { background: #E3F2FD; color: #1565C0; }

.historial-item__detalle { background: #FAFAFA; border-top: 1px solid var(--border); }
.detalle-items { padding: 10px 14px; }
.detalle-item { display: grid; grid-template-columns: 1fr auto auto auto; gap: 8px; align-items: center; padding: 6px 0; font-size: 12px; border-bottom: 1px solid #F0E8E5; }
.detalle-item:last-child { border-bottom: none; }
.detalle-item__nombre { font-weight: 500; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.detalle-item__qty    { color: var(--mid); white-space: nowrap; }
.detalle-item__precio { color: var(--mid); white-space: nowrap; }
.detalle-item__sub    { font-weight: 700; color: var(--rose-dark); white-space: nowrap; }
.detalle-footer { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 8px; }
.detalle-meta { display: flex; gap: 12px; font-size: 12px; color: var(--mid); flex-wrap: wrap; }
.detalle-acciones { display: flex; gap: 8px; align-items: center; }
.estado-select { padding: 5px 8px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 12px; font-family: inherit; cursor: pointer; }
.metodo-select { padding: 5px 8px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 12px; font-family: inherit; cursor: pointer; }
.btn-anular { padding: 5px 10px; background: none; border: 1.5px solid #EEE; border-radius: var(--radius-sm); font-size: 12px; cursor: pointer; font-family: inherit; color: var(--mid); transition: all var(--trans); }
.btn-anular:hover { border-color: var(--rose); color: var(--rose); }

/* QTY */
.qty-btn { width: 22px; height: 22px; border-radius: 50%; background: var(--rose-light); color: var(--rose-dark); border: none; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; transition: background var(--trans); }
.qty-btn:hover:not(:disabled) { background: var(--rose); color: white; }
.qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.qty-num { font-size: 13px; font-weight: 600; min-width: 16px; text-align: center; }

/* LOADING */
.estado-carga { display: flex; flex-direction: column; align-items: center; padding: 40px; gap: 12px; color: var(--mid); font-size: 14px; }
.spinner { width: 30px; height: 30px; border: 3px solid var(--rose-light); border-top-color: var(--rose); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* TOAST */
.toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: var(--charcoal); color: white; padding: 10px 18px; border-radius: 50px; font-size: 13px; z-index: 999; white-space: nowrap; box-shadow: 0 4px 16px rgba(0,0,0,0.2); pointer-events: none; }
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(10px); }
/* ═══════════════════════════════════════════════════════════
   CARRITO FLOTANTE - Resumen único de totales
═══════════════════════════════════════════════════════════ */
.carrito-flotante {
  background: linear-gradient(135deg, var(--rose-light) 0%, rgba(201, 116, 138, 0.08) 100%);
  border: 2px solid var(--rose);
  border-radius: var(--radius);
  padding: 16px;
  margin: 16px 0;
  border-left: 6px solid var(--rose-dark);
  backdrop-filter: blur(4px);
}

.carrito-flotante__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
  color: var(--charcoal);
  font-weight: 500;
  border-bottom: 1px solid rgba(201, 116, 138, 0.2);
}

.carrito-flotante__row:last-child {
  border-bottom: none;
}

.carrito-flotante__label {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.carrito-flotante__value {
  font-weight: 700;
  text-align: right;
  color: var(--charcoal);
}

.carrito-flotante__row--descuento {
  color: #2E7D32;
}

.carrito-flotante__row--descuento .carrito-flotante__value {
  color: #2E7D32;
  font-weight: 700;
}

.carrito-flotante__row--total {
  background: rgba(201, 116, 138, 0.15);
  border-radius: var(--radius-sm);
  padding: 12px;
  margin: 8px 0;
  border: none;
  font-size: 16px;
  font-weight: 800;
  color: var(--rose-dark);
}

.carrito-flotante__value--total {
  font-size: 24px;
  font-weight: 800;
  color: var(--rose-dark);
  text-align: right;
}

/* Responsive */
@media (max-width: 480px) {
  .carrito-flotante {
    padding: 14px;
    margin: 14px 0;
  }
  
  .carrito-flotante__row {
    font-size: 13px;
    padding: 7px 0;
  }
  
  .carrito-flotante__value--total {
    font-size: 20px;
  }
}
</style>
