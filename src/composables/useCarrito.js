// src/composables/useCarrito.js
import { ref, computed } from 'vue'

// El carrito vive FUERA de la función para que sea compartido entre componentes.
// Esto se llama "state singleton" — una sola instancia para toda la app.
const carrito = ref(cargarCarritoLocal())

function cargarCarritoLocal() {
  try {
    const guardado = localStorage.getItem('beyou_carrito')
    return guardado ? JSON.parse(guardado) : {}
  } catch {
    return {}
  }
}

function guardarCarritoLocal() {
  try {
    localStorage.setItem('beyou_carrito', JSON.stringify(carrito.value))
  } catch (e) {
    console.warn('No se pudo guardar el carrito:', e)
  }
}

export function useCarrito(productos) {
  const totalItems = computed(() =>
    Object.values(carrito.value).reduce((acc, item) => acc + item.cantidad, 0)
  )

  const totalDinero = computed(() =>
    Object.values(carrito.value).reduce((acc, item) => acc + item.precio * item.cantidad, 0)
  )

  function buscarStock(idCarrito) {
    const item = carrito.value[idCarrito]
    if (!item) return 0
    return productos.value.find(p => p.id === item.idOriginal)?.stock ?? 0
  }

  function buscarImagen(idOriginal) {
    return productos.value.find(p => p.id === idOriginal)?.imagen_url || ''
  }

  function agregarAlCarrito(p, varianteElegida = null) {
    const tieneVariantes = p.variantes && p.variantes.trim() !== ''

    if (tieneVariantes && !varianteElegida) {
      return { error: '🌸 Por favor, elegí una variante primero' }
    }

    const idUnico = varianteElegida ? `${p.id}||${varianteElegida}` : String(p.id)
    const cantActual = carrito.value[idUnico]?.cantidad || 0

    if (cantActual >= p.stock) {
      return { error: '⚠️ Stock máximo alcanzado' }
    }

    if (!carrito.value[idUnico]) {
      carrito.value[idUnico] = {
        nombre: varianteElegida ? `${p.nombre} (${varianteElegida})` : p.nombre,
        precio: p.precio,
        cantidad: 1,
        idOriginal: p.id
      }
    } else {
      carrito.value[idUnico].cantidad++
    }

    guardarCarritoLocal()
    return { error: null }
  }

  function cambiarCantidad(id, delta) {
    const item = carrito.value[id]
    if (!item) return

    if (delta > 0 && item.cantidad >= buscarStock(id)) {
      return { error: '⚠️ No hay más stock disponible' }
    }

    item.cantidad += delta
    if (item.cantidad <= 0) delete carrito.value[id]
    guardarCarritoLocal()
    return { error: null }
  }

  function quitarDelCarrito(id) {
    delete carrito.value[id]
    guardarCarritoLocal()
  }

  function vaciarCarrito() {
    carrito.value = {}
    guardarCarritoLocal()
  }

  function armarMensajeWhatsApp() {
    const lineas = Object.values(carrito.value)
      .map(i => `• ${i.cantidad}x ${i.nombre} — $${(i.precio * i.cantidad).toLocaleString('es-AR')}`)
      .join('\n')
    const total = totalDinero.value.toLocaleString('es-AR')
    return `💖 *NUEVO PEDIDO — BE YOU*\n\n${lineas}\n\n*Total: $${total}*\n\n✨ _¡Hola! Me gustaría confirmar este pedido para retirar en San Rafael._`
  }

  return {
    carrito,
    totalItems,
    totalDinero,
    buscarStock,
    buscarImagen,
    agregarAlCarrito,
    cambiarCantidad,
    quitarDelCarrito,
    vaciarCarrito,
    armarMensajeWhatsApp
  }
}