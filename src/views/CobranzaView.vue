<template>
  <div class="cobr-pos min-h-screen w-full relative overflow-x-hidden text-white">

    <!-- ══════════════════════════════════════
         FONDO AMBIENTAL ANIMADO (mesh gradient)
    ══════════════════════════════════════ -->
    <div class="pos-bg" aria-hidden="true"></div>
    <div class="pos-bg-grain" aria-hidden="true"></div>

    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">

      <!-- ══════════════════════════════════════
           TOP BAR
      ══════════════════════════════════════ -->
      <div class="flex items-center justify-between gap-3 flex-wrap mb-6 animate-fade-up">
        <button
          class="back-btn"
          @click="$router.push({ name: 'admin' })"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Volver al panel
        </button>

        <!-- Segmented control -->
        <div class="segmented">
          <button
            class="segmented__btn"
            :class="{ 'segmented__btn--active': vistaActual === 'nueva' }"
            @click="vistaActual = 'nueva'"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 3.5a.5.5 0 0 1 .5.5v4h4a.5.5 0 0 1 0 1h-4v4a.5.5 0 0 1-1 0v-4h-4a.5.5 0 0 1 0-1h4v-4a.5.5 0 0 1 .5-.5"/></svg>
            Nueva venta
          </button>
          <button
            class="segmented__btn"
            :class="{ 'segmented__btn--active': vistaActual === 'historial' }"
            @click="vistaActual = 'historial'; cargarHistorial()"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 3.5a.5.5 0 0 1 .5.5v4.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7.5 8V4a.5.5 0 0 1 .5-.5"/><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1M2 8a6 6 0 1 1 12 0A6 6 0 0 1 2 8"/></svg>
            Historial
          </button>
        </div>
      </div>

      <div class="mb-7 animate-fade-up" style="animation-delay:.05s">
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Cobranza</h1>
        <p class="text-sm text-white/45 mt-1">Terminal punto de venta · registrá ventas y consultá el historial</p>
      </div>

      <!-- ══════════════════════════════════════
           KPIs
      ══════════════════════════════════════ -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8 animate-fade-up" style="animation-delay:.1s">
        <div v-for="(kpi, i) in kpis" :key="i" class="kpi-card" :style="{ '--accent': kpi.color }">
          <div class="kpi-card__icon" v-html="kpi.icon"></div>
          <span class="kpi-card__label">{{ kpi.label }}</span>
          <span class="kpi-card__value">{{ kpi.value }}</span>
        </div>
      </div>

      <!-- ══════════════════════════════════════
           NUEVA VENTA
      ══════════════════════════════════════ -->
      <div v-if="vistaActual === 'nueva'" class="grid lg:grid-cols-[1fr_380px] gap-5 items-start">

        <!-- ── COLUMNA IZQUIERDA ── -->
        <div class="flex flex-col gap-5 animate-fade-up" style="animation-delay:.15s">

          <!-- Datos del cliente -->
          <section class="glass-panel">
            <h2 class="panel-title">
              <span class="panel-title__num">1</span> Cliente y método de pago
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="field">
                <label>Nombre del cliente</label>
                <input v-model="datosPedido.cliente" type="text" placeholder="Opcional" class="pos-input" />
              </div>
              <div class="field">
                <label>Teléfono</label>
                <input v-model="datosPedido.telefono" type="text" placeholder="Opcional" class="pos-input" />
              </div>
              <div class="field">
                <label>Método de pago</label>
                <select v-model="datosPedido.metodo_pago" class="pos-input pos-select">
                  <option value="efectivo">💵 Efectivo</option>
                  <option value="transferencia">🏦 Transferencia</option>
                  <option value="mercado_pago">📱 Mercado Pago</option>
                  <option value="debito">💳 Débito</option>
                  <option value="credito">💳 Crédito</option>
                </select>
              </div>
              <div class="field">
                <label>Estado</label>
                <select v-model="datosPedido.estado" class="pos-input pos-select">
                  <option value="pagado">✅ Pagado</option>
                  <option value="pendiente">⏳ Pendiente</option>
                  <option value="señado">💰 Señado</option>
                </select>
              </div>
              <div class="field sm:col-span-2">
                <label>Notas</label>
                <input v-model="datosPedido.notas" type="text" placeholder="Observaciones adicionales..." class="pos-input" />
              </div>
            </div>

            <!-- Badge visual del método elegido -->
            <div class="mt-3 flex items-center gap-2">
              <span class="text-[11px] text-white/40 uppercase tracking-wide">Pago seleccionado:</span>
              <span class="metodo-badge" :class="`metodo-badge--${datosPedido.metodo_pago}`">
                {{ formatMetodo(datosPedido.metodo_pago) }}
              </span>
            </div>
          </section>

          <!-- Buscador de productos -->
          <section class="glass-panel">
            <h2 class="panel-title">
              <span class="panel-title__num">2</span> Agregá productos
            </h2>

            <div class="prod-search">
              <div class="prod-search__input-wrap">
                <svg class="prod-search__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <input
                  ref="searchInputRef"
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
                  class="prod-search__item group"
                  :class="{ 'prod-search__item--agotado': p.stock <= 0 }"
                  @mousedown.prevent="seleccionarProducto(p)"
                >
                  <!-- Thumbnail con preview hover -->
                  <div class="relative">
                    <img :src="p.imagen_url" :alt="p.nombre" class="prod-search__img" />
                    <div class="img-preview group-hover:opacity-100 group-hover:scale-100">
                      <img :src="p.imagen_url" :alt="p.nombre" />
                    </div>
                  </div>
                  <div class="prod-search__info">
                    <span class="prod-search__nombre">{{ p.nombre }}</span>
                    <span class="prod-search__precio">${{ p.precio.toLocaleString('es-AR') }}</span>
                  </div>
                  <span class="stock-chip" :class="{ 'stock-chip--bajo': p.stock <= 3 && p.stock > 0, 'stock-chip--off': p.stock <= 0 }">
                    {{ p.stock > 0 ? `Stock: ${p.stock}` : 'Sin stock' }}
                  </span>
                </div>
              </div>

              <p v-if="searchAbierto && busquedaProd && productosBuscados.length === 0" class="prod-search__empty">
                No se encontraron productos
              </p>
            </div>

            <!-- Items de la venta actual -->
            <div class="mt-4">
              <div v-if="itemsVenta.length === 0" class="venta-empty">
                <span>🛒</span>
                <p>Buscá y agregá productos para armar la venta</p>
              </div>

              <transition-group v-else name="item-list" tag="div" class="flex flex-col gap-2">
                <div v-for="(item, idx) in itemsVenta" :key="idx" class="venta-item">
                  <!-- Imagen con click-to-zoom -->
                  <button class="venta-item__img-btn" @click="abrirZoom(item.imagen_url, item.nombre)" title="Ver imagen">
                    <img :src="item.imagen_url" :alt="item.nombre" class="venta-item__img" />
                    <span class="venta-item__zoom-hint">🔍</span>
                  </button>

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
                      :disabled="item.cantidad <= 1"
                      @click="cambiarCantidadItem(idx, -1)"
                    >−</button>
                    <span class="qty-num">{{ item.cantidad }}</span>
                    <button
                      class="qty-btn"
                      :disabled="item.cantidad >= item.stock"
                      @click="cambiarCantidadItem(idx, 1)"
                    >+</button>
                  </div>

                  <span class="venta-item__subtotal">${{ item.subtotal.toLocaleString('es-AR') }}</span>
                  <button class="venta-item__remove" @click="quitarItem(idx)" title="Quitar">✕</button>
                </div>
              </transition-group>
            </div>
          </section>
        </div>

        <!-- ── COLUMNA DERECHA: RESUMEN / COBRO ── -->
        <div class="lg:sticky lg:top-6 animate-fade-up" style="animation-delay:.2s">
          <section class="glass-panel glass-panel--accent">
            <h2 class="panel-title">
              <span class="panel-title__num">💳</span> Resumen de cobro
            </h2>

            <!-- Descuento general -->
            <div class="descuento-general">
              <span class="descuento-general__label">Descuento general</span>
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
                  max="999999"
                  class="item-descuento__input"
                  :placeholder="descuentoGeneral.tipo === 'porcentaje' ? '10' : '1000'"
                  @input="validarDescuentoGeneral"
                />
              </div>
            </div>

            <div class="totales">
              <div class="totales__row">
                <span>📦 Unidades</span>
                <strong>{{ cantidadTotalProductos }}</strong>
              </div>
              <div class="totales__row">
                <span>Subtotal</span>
                <strong>${{ subtotalItems.toLocaleString('es-AR') }}</strong>
              </div>
              <div v-if="itemsVenta.some(i => i.descuento_monto > 0)" class="totales__row totales__row--desc">
                <span>🏷️ Desc. ítems</span>
                <strong>-${{ itemsVenta.reduce((a,i) => a + i.descuento_monto, 0).toLocaleString('es-AR') }}</strong>
              </div>
              <div v-if="descuentoGeneralMonto > 0" class="totales__row totales__row--desc">
                <span>💰 Desc. general</span>
                <strong>-${{ descuentoGeneralMonto.toLocaleString('es-AR') }}</strong>
              </div>
            </div>

            <div class="total-final">
              <span>TOTAL</span>
              <strong>${{ totalVenta.toLocaleString('es-AR') }}</strong>
            </div>

            <button
              v-if="itemsVenta.length > 0"
              class="btn-confirmar"
              :disabled="cargando"
              @click="confirmarVenta"
            >
              <span v-if="!cargando">✓ Confirmar venta</span>
              <span v-else class="flex items-center justify-center gap-2">
                <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"/>
                  <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                </svg>
                Guardando...
              </span>
            </button>
            <p v-else class="text-center text-xs text-white/35 mt-2">Agregá productos para habilitar el cobro</p>
          </section>
        </div>
      </div>

      <!-- ══════════════════════════════════════
           HISTORIAL
      ══════════════════════════════════════ -->
      <div v-if="vistaActual === 'historial'" class="glass-panel animate-fade-up" style="animation-delay:.15s">

        <div class="historial-filtros">
          <select v-model="filtroEstado" class="pos-input pos-select">
            <option value="">Todos los estados</option>
            <option value="pagado">Pagado</option>
            <option value="pendiente">Pendiente</option>
            <option value="señado">Señado</option>
          </select>
          <select v-model="filtroMetodo" class="pos-input pos-select">
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

        <div v-else class="flex flex-col gap-2 mt-3">
          <div
            v-for="pedido in pedidosFiltrados"
            :key="pedido.id"
            class="historial-item"
            :class="{ 'historial-item--expandido': pedidoExpandido === pedido.id }"
          >
            <div class="historial-item__head" @click="togglePedido(pedido.id)">
              <div class="historial-item__info">
                <span class="historial-item__id">#{{ pedido.id }}</span>
                <span class="historial-item__fecha">{{ formatFecha(pedido.created_at) }}</span>
                <span v-if="pedido.cliente" class="historial-item__cliente">{{ pedido.cliente }}</span>
              </div>
              <div class="historial-item__right">
                <span class="historial-item__total">${{ pedido.total.toLocaleString('es-AR') }}</span>
                <span class="estado-badge" :class="`estado-badge--${pedido.estado}`">{{ pedido.estado }}</span>
                <span class="historial-item__arrow">{{ pedidoExpandido === pedido.id ? '▲' : '▼' }}</span>
              </div>
            </div>

            <transition name="expand">
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
                    <select
                      :value="pedido.estado"
                      class="estado-select"
                      @change="cambiarEstado(pedido, $event.target.value)"
                    >
                      <option value="pagado">✅ Pagado</option>
                      <option value="pendiente">⏳ Pendiente</option>
                      <option value="señado">💰 Señado</option>
                    </select>
                    <button class="btn-anular" @click="anular(pedido)">🗑️ Anular</button>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

    </div>

    <!-- ══════════════════════════════════════
         TOAST
    ══════════════════════════════════════ -->
    <transition name="toast">
      <div v-if="toast.show" class="toast">{{ toast.msg }}</div>
    </transition>

    <!-- ══════════════════════════════════════
         LIGHTBOX / ZOOM DE IMAGEN
    ══════════════════════════════════════ -->
    <transition name="fade">
      <div v-if="imagenZoom" class="zoom-overlay" @click="cerrarZoom">
        <button class="zoom-close" @click="cerrarZoom">✕</button>
        <img :src="imagenZoom.src" :alt="imagenZoom.alt" class="zoom-img" @click.stop />
        <span class="zoom-caption">{{ imagenZoom.alt }}</span>
      </div>
    </transition>

    <ConfirmDialog
      :isVisible="confirmDialog.isVisible"
      :titulo="confirmDialog.titulo"
      :mensaje="confirmDialog.mensaje"
      :textoBoton="confirmDialog.textoBoton"
      :isDanger="confirmDialog.isDanger"
      :cargando="confirmDialog.cargando"
      @confirmar="confirmDialog.accion"
      @cancelar="confirmDialog.isVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, nextTick } from 'vue'
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
import ConfirmDialog from '../components/ConfirmDialog.vue'

// ─── ESTADO GENERAL ──────────────────────────────────────────────
const vistaActual = ref('nueva')
const cargando = ref(false)
const cargandoHistorial = ref(false)
const confirmDialog = reactive({
  isVisible: false,
  titulo: '',
  mensaje: '',
  textoBoton: 'Confirmar',
  isDanger: false,
  cargando: false,
  accion: null
})

function mostrarConfirm(opciones) {
  confirmDialog.titulo = opciones.titulo || 'Confirmar'
  confirmDialog.mensaje = opciones.mensaje || '¿Estás seguro?'
  confirmDialog.textoBoton = opciones.textoBoton || 'Confirmar'
  confirmDialog.isDanger = opciones.isDanger ?? false
  confirmDialog.accion = opciones.accion
  confirmDialog.isVisible = true
}
// ─── PRODUCTOS ───────────────────────────────────────────────────
const todosLosProductos = ref([])
const busquedaProd = ref('')
const searchAbierto = ref(false)
const searchInputRef = ref(null) // ← NUEVO: para auto-foco

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

// ✅ Si el producto tiene variantes, abrir selector
function seleccionarProducto(p) {
  if (p.stock <= 0) {
    mostrarToast('⚠️ Este producto no tiene stock')
    return
  }

  if (p.variantes && p.variantes.trim() !== '') {
    mostrarToast('🌸 Este producto tiene opciones. Elige una desde el catálogo')
    return
  }

  const existe = itemsVenta.value.find(i => i.producto_id === p.id && !i.variante)
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
      variante: null,
      descuento_tipo: null,
      descuento_valor: 0,
      descuento_monto: 0
    })
  }

  busquedaProd.value = ''
  searchAbierto.value = false
}

// ─── DESCUENTOS ──────────────────────────────────────────────────
function validarDescuentoGeneral() {
  if (!descuentoGeneral.tipo) {
    descuentoGeneral.valor = 0
    return
  }
  if (descuentoGeneral.valor < 0) {
    descuentoGeneral.valor = 0
    mostrarToast('⚠️ El descuento no puede ser negativo')
    return
  }
  if (descuentoGeneral.tipo === 'porcentaje' && descuentoGeneral.valor > 100) {
    descuentoGeneral.valor = 100
    mostrarToast('⚠️ El descuento no puede superar 100%')
    return
  }
  if (descuentoGeneral.tipo === 'monto' && descuentoGeneral.valor > subtotalItems.value) {
    descuentoGeneral.valor = subtotalItems.value
    mostrarToast(`⚠️ Descuento limitado a $${subtotalItems.value.toLocaleString('es-AR')}`)
    return
  }
  logger.debug('Descuento validado', {
    tipo: descuentoGeneral.tipo,
    valor: descuentoGeneral.valor
  })
}

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

const descuentoGeneral = reactive({
  tipo: null,
  valor: 0,
  monto: 0
})

const subtotalItems = computed(() =>
  itemsVenta.value.reduce((acc, i) => acc + i.subtotal, 0)
)

const descuentoGeneralMonto = computed(() => {
  if (!descuentoGeneral.tipo || descuentoGeneral.valor <= 0) {
    return 0
  }
  if (descuentoGeneral.tipo === 'porcentaje') {
    const porcentajeValido = Math.max(0, Math.min(100, descuentoGeneral.valor))
    const monto = Math.round(subtotalItems.value * (porcentajeValido / 100))
    return Math.max(0, monto)
  }
  if (descuentoGeneral.tipo === 'monto') {
    const montoValido = Math.max(0, descuentoGeneral.valor)
    return Math.min(montoValido, subtotalItems.value)
  }
  return 0
})

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
  if (itemsVenta.value.length === 0) {
    mostrarToast('⚠️ Agrega productos al carrito')
    return
  }

  let validacion = await validarStockVenta(itemsVenta.value)
  if (!validacion.valido) {
    mostrarToast(`⚠️ ${validacion.error}`)
    return
  }

  cargando.value = true
  try {
    if (descuentoGeneral.valor < 0) {
      throw new Error('El descuento no puede ser negativo')
    }
    if (descuentoGeneral.tipo === 'porcentaje' && descuentoGeneral.valor > 100) {
      throw new Error('El descuento no puede superar 100%')
    }
    if (descuentoGeneral.tipo === 'monto' && descuentoGeneralMonto.value > subtotalItems.value) {
      throw new Error('El descuento no puede superar el subtotal')
    }

    validacion = await validarStockVenta(itemsVenta.value)
    if (!validacion.valido) {
      mostrarToast(`⚠️ ${validacion.error}`)
      cargando.value = false
      todosLosProductos.value = await fetchProductosAdmin()
      return
    }

    const cabecera = {
      cliente: datosPedido.cliente || null,
      telefono: datosPedido.telefono || null,
      metodo_pago: datosPedido.metodo_pago,
      estado: datosPedido.estado,
      notas: datosPedido.notas || null,
      subtotal: subtotalItems.value,
      descuento_tipo: descuentoGeneral.tipo || null,
      descuento_valor: Math.max(0, descuentoGeneral.valor || 0),
      descuento_monto: Math.max(0, descuentoGeneralMonto.value),
      total: Math.max(0, totalVenta.value)
    }

    if (cabecera.total < 0) {
      throw new Error('Error crítico: El total no puede ser negativo')
    }

    await crearPedido(cabecera, itemsVenta.value)

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
    confirmDialog.isVisible = false
    mostrarToast('✅ Venta registrada correctamente')

    await new Promise(r => setTimeout(r, 800))
  } catch (e) {
    logger.error('Error en confirmarVenta', e)
    mostrarToast(`❌ Error: ${e.message}`)
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
  mostrarConfirm({
    titulo: 'Anular Venta',
    mensaje: `¿Anular la venta #${pedido.id}? Se devolverá el stock automáticamente.`,
    textoBoton: 'Sí, anular',
    isDanger: true,
    accion: async () => {
      confirmDialog.cargando = true
      try {
        await anularPedido(pedido)
        pedidos.value = pedidos.value.filter(p => p.id !== pedido.id)
        await cargarResumenHoy()
        todosLosProductos.value = await fetchProductos()
        confirmDialog.isVisible = false
        mostrarToast('✅ Venta anulada y stock recuperado')
      } catch (e) {
        mostrarToast('❌ Error al anular: ' + e.message)
      } finally {
        confirmDialog.cargando = false
      }
    }
  })
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

// ─── KPIs (NUEVO: solo presentación, deriva de resumenHoy) ───────
const kpis = computed(() => [
  {
    label: 'Cobrado hoy',
    value: `$${resumenHoy.cobrado.toLocaleString('es-AR')}`,
    color: '#34d399',
    icon: '<svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1M5.5 8l1.8 1.8L10.7 6"/></svg>'
  },
  {
    label: 'Pendiente hoy',
    value: `$${resumenHoy.pendiente.toLocaleString('es-AR')}`,
    color: '#fbbf24',
    icon: '<svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M8 3.5a.5.5 0 0 1 .5.5v4l2.5 1.5a.5.5 0 1 1-.5.87L7.7 8.43A.5.5 0 0 1 7.5 8V4a.5.5 0 0 1 .5-.5"/><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1"/></svg>'
  },
  {
    label: 'Ventas hoy',
    value: resumenHoy.cantidad,
    color: '#60a5fa',
    icon: '<svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a2 2 0 0 0-2 2v2H5V3a3 3 0 1 1 6 0v2h-1V3a2 2 0 0 0-2-2zM5 5H3.36a1.5 1.5 0 0 0-1.48 1.28L.85 13.13A2.5 2.5 0 0 0 3.32 16h9.36a2.5 2.5 0 0 0 2.47-2.87l-1.03-6.85A1.5 1.5 0 0 0 12.64 5H11v1.5a.5.5 0 0 1-1 0V5H6v1.5a.5.5 0 0 1-1 0V5z"/></svg>'
  },
  {
    label: 'Total del día',
    value: `$${resumenHoy.total.toLocaleString('es-AR')}`,
    color: '#f472b6',
    icon: '<svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M9.5 1.5H4A1.5 1.5 0 0 0 2.5 3v10A1.5 1.5 0 0 0 4 14.5h8a1.5 1.5 0 0 0 1.5-1.5V5.5L9.5 1.5z"/></svg>'
  }
])

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

// ─── LIGHTBOX (NUEVO: visor de imagen, no afecta lógica de venta) ─
const imagenZoom = ref(null) // { src, alt } | null
function abrirZoom(src, alt) {
  imagenZoom.value = { src, alt }
}
function cerrarZoom() {
  imagenZoom.value = null
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

async function cargarProductosParaBusqueda() {
  try {
    const prods = await fetchProductosAdmin()
    todosLosProductos.value = prods || []

    if (import.meta.env.DEV) {
      console.log('✅ Productos cargados para búsqueda:', todosLosProductos.value.length)
    }
  } catch (e) {
    mostrarToast('❌ Error al cargar productos')
    console.error('Error:', e)
  }
}

onMounted(async () => {
  await cargarProductosParaBusqueda()
  await cargarResumenHoy()
  // Auto-foco en el buscador (requisito POS: buscador destacado)
  nextTick(() => searchInputRef.value?.focus())
})
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════
   VARIABLES DE TEMA — POS oscuro con acento rose de marca
═══════════════════════════════════════════════════════════ */
.cobr-pos {
  --rose: #C9748A;
  --rose-dark: #8B4A5C;
  --rose-light: rgba(201, 116, 138, 0.18);
  --glass: rgba(255, 255, 255, 0.045);
  --glass-border: rgba(255, 255, 255, 0.09);
  --radius: 14px;
  --radius-sm: 9px;
  font-family: 'Poppins', system-ui, sans-serif;
  background: #0c0a0d;
}

/* ── FONDO ANIMADO (mesh gradient) ── */
.pos-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(ellipse 60% 50% at 15% 15%, rgba(201, 116, 138, 0.28), transparent 60%),
    radial-gradient(ellipse 55% 45% at 85% 20%, rgba(139, 74, 92, 0.24), transparent 60%),
    radial-gradient(ellipse 60% 55% at 50% 100%, rgba(90, 40, 60, 0.3), transparent 65%),
    linear-gradient(160deg, #100c10 0%, #150e13 45%, #0c0a0d 100%);
  background-size: 200% 200%, 200% 200%, 200% 200%, 100% 100%;
  animation: meshMove 18s ease-in-out infinite;
}
.pos-bg-grain {
  position: fixed;
  inset: 0;
  z-index: 1;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  pointer-events: none;
}
@keyframes meshMove {
  0%, 100% { background-position: 0% 0%, 100% 0%, 50% 100%, 0 0; }
  50%      { background-position: 30% 30%, 70% 40%, 40% 70%, 0 0; }
}

/* ── ANIMACIONES DE ENTRADA ── */
.animate-fade-up {
  animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── TOP BAR ── */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(255,255,255,0.55);
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 50px;
  padding: 7px 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
}
.back-btn:hover { color: white; border-color: rgba(255,255,255,0.2); transform: translateX(-2px); }

.segmented {
  display: flex;
  gap: 2px;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 50px;
  padding: 3px;
  backdrop-filter: blur(8px);
}
.segmented__btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 50px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.5);
  font-size: 12.5px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.25s ease;
}
.segmented__btn--active {
  background: linear-gradient(135deg, var(--rose), var(--rose-dark));
  color: white;
  box-shadow: 0 4px 14px rgba(201, 116, 138, 0.35);
}
.segmented__btn:not(.segmented__btn--active):hover { color: white; }

/* ── KPI CARDS ── */
.kpi-card {
  position: relative;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  padding: 16px;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}
.kpi-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top left, var(--accent), transparent 65%);
  opacity: 0.12;
  transition: opacity 0.25s ease;
}
.kpi-card:hover {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--accent) 50%, var(--glass-border));
  box-shadow: 0 10px 30px -8px color-mix(in srgb, var(--accent) 40%, transparent);
}
.kpi-card:hover::before { opacity: 0.22; }
.kpi-card__icon {
  color: var(--accent);
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  background: color-mix(in srgb, var(--accent) 18%, transparent);
  border-radius: 8px;
  z-index: 1;
}
.kpi-card__label { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.6px; color: rgba(255,255,255,0.45); z-index: 1; }
.kpi-card__value { font-size: 1.35rem; font-weight: 800; color: white; z-index: 1; }

/* ── GLASS PANELS ── */
.glass-panel {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  padding: 20px;
  backdrop-filter: blur(14px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
}
.glass-panel--accent {
  border-color: rgba(201, 116, 138, 0.35);
  box-shadow: 0 8px 32px rgba(201, 116, 138, 0.12);
}
.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  color: rgba(255,255,255,0.6);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 14px;
}
.panel-title__num {
  display: flex; align-items: center; justify-content: center;
  width: 20px; height: 20px;
  border-radius: 50%;
  background: var(--rose);
  color: white;
  font-size: 11px;
  font-weight: 800;
}

/* ── FORM FIELDS ── */
.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 10.5px; font-weight: 600; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px; }
.pos-input {
  padding: 9px 12px;
  border: 1.5px solid var(--glass-border);
  border-radius: var(--radius-sm);
  background: rgba(255,255,255,0.04);
  color: white;
  font-size: 13px;
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.pos-input::placeholder { color: rgba(255,255,255,0.25); }
.pos-input:focus {
  outline: none;
  border-color: var(--rose);
  background: rgba(255,255,255,0.07);
  box-shadow: 0 0 0 3px rgba(201, 116, 138, 0.18);
}
.pos-select { cursor: pointer; }
.pos-select option { background: #1a1418; color: white; }

/* ── BADGE MÉTODO DE PAGO ── */
.metodo-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 50px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
}
.metodo-badge--efectivo      { color: #34d399; border-color: rgba(52,211,153,0.35); background: rgba(52,211,153,0.1); }
.metodo-badge--transferencia { color: #60a5fa; border-color: rgba(96,165,250,0.35); background: rgba(96,165,250,0.1); }
.metodo-badge--mercado_pago  { color: #38bdf8; border-color: rgba(56,189,248,0.35); background: rgba(56,189,248,0.1); }
.metodo-badge--debito,
.metodo-badge--credito       { color: #f472b6; border-color: rgba(244,114,182,0.35); background: rgba(244,114,182,0.1); }

/* ── BUSCADOR ── */
.prod-search { position: relative; }
.prod-search__input-wrap { position: relative; }
.prod-search__icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.35); pointer-events: none; }
.prod-search__input {
  width: 100%;
  padding: 12px 14px 12px 38px;
  border: 1.5px solid var(--glass-border);
  border-radius: 50px;
  background: rgba(255,255,255,0.05);
  color: white;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
}
.prod-search__input::placeholder { color: rgba(255,255,255,0.3); }
.prod-search__input:focus {
  outline: none;
  border-color: var(--rose);
  background: rgba(255,255,255,0.08);
  box-shadow: 0 0 0 4px rgba(201,116,138,0.15);
}
.prod-search__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0; right: 0;
  background: #17111a;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  box-shadow: 0 16px 40px rgba(0,0,0,0.5);
  z-index: 50;
  overflow: hidden;
  max-height: 340px;
  overflow-y: auto;
  animation: fadeUp 0.2s ease both;
}
.prod-search__item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.15s ease; }
.prod-search__item:last-child { border-bottom: none; }
.prod-search__item:hover { background: rgba(201,116,138,0.12); }
.prod-search__item--agotado { opacity: 0.45; cursor: not-allowed; }
.prod-search__img { width: 38px; height: 38px; border-radius: var(--radius-sm); object-fit: cover; background: rgba(255,255,255,0.05); flex-shrink: 0; }
.prod-search__info { flex: 1; min-width: 0; }
.prod-search__nombre { display: block; font-size: 13px; font-weight: 500; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.prod-search__precio { font-size: 12px; color: var(--rose); font-weight: 600; }
.prod-search__empty { padding: 12px 16px; font-size: 13px; color: rgba(255,255,255,0.35); }

/* Preview flotante al hacer hover sobre la miniatura */
.img-preview {
  position: absolute;
  left: 50px;
  top: 50%;
  transform: translateY(-50%) scale(0.9);
  width: 130px; height: 130px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid var(--rose);
  box-shadow: 0 12px 30px rgba(0,0,0,0.5);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease, transform 0.15s ease;
  z-index: 60;
  background: #17111a;
}
.img-preview img { width: 100%; height: 100%; object-fit: cover; }

.stock-chip { font-size: 10.5px; font-weight: 600; color: rgba(255,255,255,0.4); white-space: nowrap; }
.stock-chip--bajo { color: #fbbf24; }
.stock-chip--off { color: #f87171; }

/* ── ITEMS DE LA VENTA ── */
.venta-empty { text-align: center; padding: 30px; color: rgba(255,255,255,0.35); font-size: 13px; }
.venta-empty span { font-size: 30px; display: block; margin-bottom: 8px; }

.venta-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  transition: border-color 0.2s ease;
}
.venta-item:hover { border-color: rgba(201,116,138,0.3); }

.venta-item__img-btn {
  position: relative;
  width: 46px; height: 46px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: none;
  padding: 0;
  cursor: zoom-in;
  flex-shrink: 0;
  background: rgba(255,255,255,0.05);
}
.venta-item__img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.25s ease; }
.venta-item__zoom-hint {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.4);
  opacity: 0;
  font-size: 14px;
  transition: opacity 0.2s ease;
}
.venta-item__img-btn:hover .venta-item__zoom-hint { opacity: 1; }
.venta-item__img-btn:hover .venta-item__img { transform: scale(1.08); }

.venta-item__info { flex: 1; min-width: 0; }
.venta-item__nombre { display: block; font-size: 13px; font-weight: 500; color: white; }
.venta-item__precio { font-size: 11px; color: rgba(255,255,255,0.4); }

.item-descuento { display: flex; align-items: center; gap: 5px; margin-top: 6px; flex-wrap: wrap; }
.item-descuento__select { padding: 3px 6px; border: 1.5px solid var(--glass-border); border-radius: 6px; font-size: 11px; font-family: inherit; color: white; background: #1a1418; cursor: pointer; }
.item-descuento__input { width: 60px; padding: 3px 6px; border: 1.5px solid var(--rose); border-radius: 6px; font-size: 12px; font-family: inherit; background: rgba(255,255,255,0.05); color: white; }
.item-descuento__input:focus { outline: none; }
.item-descuento__badge { font-size: 11px; font-weight: 700; color: #34d399; background: rgba(52,211,153,0.12); padding: 2px 7px; border-radius: 10px; }

.venta-item__qty { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.qty-btn {
  width: 24px; height: 24px;
  border-radius: 50%;
  background: rgba(255,255,255,0.07);
  color: white;
  border: 1px solid var(--glass-border);
  cursor: pointer;
  font-size: 14px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s ease;
}
.qty-btn:hover:not(:disabled) { background: var(--rose); border-color: var(--rose); }
.qty-btn:disabled { opacity: 0.25; cursor: not-allowed; }
.qty-num { font-size: 13px; font-weight: 700; min-width: 18px; text-align: center; color: white; }

.venta-item__subtotal { font-size: 13px; font-weight: 700; color: var(--rose); min-width: 68px; text-align: right; flex-shrink: 0; }
.venta-item__remove { background: none; border: none; color: rgba(255,255,255,0.25); cursor: pointer; font-size: 14px; padding: 2px; transition: color 0.2s ease; flex-shrink: 0; }
.venta-item__remove:hover { color: #f87171; }

.item-list-enter-active, .item-list-leave-active { transition: all 0.25s ease; }
.item-list-enter-from { opacity: 0; transform: translateX(-10px); }
.item-list-leave-to { opacity: 0; transform: translateX(10px); }

/* ── DESCUENTO GENERAL Y TOTALES ── */
.descuento-general {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding: 10px 12px;
  background: rgba(255,255,255,0.03);
  border: 1px dashed rgba(201,116,138,0.4);
  border-radius: var(--radius-sm);
  margin-bottom: 14px;
}
.descuento-general__label { font-size: 12.5px; font-weight: 600; color: white; }
.descuento-general__controles { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.totales { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
.totales__row { display: flex; justify-content: space-between; font-size: 13px; color: rgba(255,255,255,0.55); }
.totales__row strong { color: white; font-weight: 600; }
.totales__row--desc strong,
.totales__row--desc span { color: #34d399; }

.total-final {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(201,116,138,0.18), rgba(139,74,92,0.1));
  border: 1px solid rgba(201,116,138,0.35);
  border-radius: var(--radius-sm);
  padding: 14px 16px;
  margin: 6px 0 16px;
}
.total-final span { font-size: 12px; font-weight: 700; letter-spacing: 1px; color: rgba(255,255,255,0.55); }
.total-final strong { font-size: 1.7rem; font-weight: 800; color: white; }

.btn-confirmar {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--rose), var(--rose-dark));
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.3px;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 8px 24px rgba(201,116,138,0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.btn-confirmar:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(201,116,138,0.4); }
.btn-confirmar:active:not(:disabled) { transform: translateY(0); }
.btn-confirmar:disabled { background: rgba(255,255,255,0.1); box-shadow: none; cursor: not-allowed; }

/* ── HISTORIAL ── */
.historial-filtros { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
.historial-filtros .pos-select { flex: 1; min-width: 150px; }

.historial-item {
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: rgba(255,255,255,0.02);
  transition: border-color 0.2s ease;
}
.historial-item--expandido { border-color: var(--rose); }
.historial-item__head { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; cursor: pointer; gap: 8px; transition: background 0.15s ease; }
.historial-item__head:hover { background: rgba(201,116,138,0.08); }
.historial-item__info { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; flex: 1; min-width: 0; }
.historial-item__id { font-size: 12px; font-weight: 700; color: var(--rose); flex-shrink: 0; }
.historial-item__fecha { font-size: 11px; color: rgba(255,255,255,0.4); }
.historial-item__cliente { font-size: 12.5px; font-weight: 500; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.historial-item__right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.historial-item__total { font-size: 13.5px; font-weight: 700; color: white; }
.historial-item__arrow { font-size: 10px; color: rgba(255,255,255,0.35); }

.estado-badge { font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 50px; text-transform: capitalize; white-space: nowrap; border: 1px solid transparent; }
.estado-badge--pagado    { background: rgba(52,211,153,0.14); color: #34d399; border-color: rgba(52,211,153,0.3); }
.estado-badge--pendiente { background: rgba(251,191,36,0.14); color: #fbbf24; border-color: rgba(251,191,36,0.3); }
.estado-badge--señado    { background: rgba(96,165,250,0.14); color: #60a5fa; border-color: rgba(96,165,250,0.3); }

.historial-item__detalle { background: rgba(0,0,0,0.2); border-top: 1px solid var(--glass-border); }
.detalle-items { padding: 10px 14px; }
.detalle-item { display: grid; grid-template-columns: 1fr auto auto auto; gap: 8px; align-items: center; padding: 7px 0; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); color: rgba(255,255,255,0.7); }
.detalle-item:last-child { border-bottom: none; }
.detalle-item__nombre { font-weight: 500; color: white; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.detalle-item__sub { font-weight: 700; color: var(--rose); white-space: nowrap; }
.detalle-footer { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-top: 1px solid var(--glass-border); flex-wrap: wrap; gap: 8px; }
.detalle-meta { display: flex; gap: 14px; font-size: 12px; color: rgba(255,255,255,0.45); flex-wrap: wrap; }
.detalle-acciones { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.estado-select, .metodo-select {
  padding: 6px 8px; border: 1.5px solid var(--glass-border); border-radius: 6px;
  font-size: 12px; font-family: inherit; cursor: pointer; background: #1a1418; color: white;
}
.btn-anular { padding: 6px 12px; background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.3); border-radius: 6px; font-size: 12px; cursor: pointer; font-family: inherit; color: #f87171; transition: all 0.2s ease; }
.btn-anular:hover { background: rgba(248,113,113,0.2); }

.expand-enter-active, .expand-leave-active { transition: all 0.25s ease; overflow: hidden; }
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; }
.expand-enter-to, .expand-leave-from { opacity: 1; max-height: 600px; }

/* ── LOADING ── */
.estado-carga { display: flex; flex-direction: column; align-items: center; padding: 50px; gap: 12px; color: rgba(255,255,255,0.4); font-size: 14px; }
.spinner { width: 32px; height: 32px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--rose); border-radius: 50%; animation: spin 0.8s linear infinite; }

/* ── TOAST ── */
.toast {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  background: rgba(20,15,18,0.95);
  border: 1px solid var(--glass-border);
  color: white; padding: 11px 22px; border-radius: 50px; font-size: 13px;
  z-index: 999; white-space: nowrap;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
  backdrop-filter: blur(10px);
  pointer-events: none;
}
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(10px); }

/* ── LIGHTBOX ── */
.zoom-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.9);
  backdrop-filter: blur(8px);
  z-index: 400;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 24px;
  cursor: zoom-out;
}
.zoom-img { max-width: 90%; max-height: 78vh; border-radius: 14px; object-fit: contain; box-shadow: 0 30px 80px rgba(0,0,0,0.6); cursor: default; }
.zoom-caption { margin-top: 14px; color: rgba(255,255,255,0.7); font-size: 13px; }
.zoom-close {
  position: absolute; top: 20px; right: 20px;
  width: 38px; height: 38px;
  background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border);
  border-radius: 50%; color: white; font-size: 16px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s ease;
}
.zoom-close:hover { background: rgba(255,255,255,0.2); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 480px) {
  .kpi-card__value { font-size: 1.1rem; }
  .total-final strong { font-size: 1.4rem; }
}
</style>