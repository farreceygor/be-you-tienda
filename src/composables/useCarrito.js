// src/composables/useCarrito.js
import { ref, computed } from 'vue'

/**
 * El carrito vive FUERA de la función para que sea compartido entre componentes.
 * Esto se llama "state singleton" — una sola instancia para toda la app.
 */
const carrito = ref(cargarCarritoLocal())

/**
 * Carga el carrito del localStorage
 */
function cargarCarritoLocal() {
  try {
    const guardado = localStorage.getItem('beyou_carrito')
    if (!guardado) return {}

    const datos = JSON.parse(guardado)

    // Si tiene versión y timestamp, validar que no sea muy viejo (7 días)
    if (datos.version && datos.timestamp) {
      const diasTranscurridos = (Date.now() - datos.timestamp) / (1000 * 60 * 60 * 24)
      if (diasTranscurridos > 7) {
        localStorage.removeItem('beyou_carrito')
        return {}
      }
      return datos.items || {}
    }

    // Si es formato viejo, retornar como está
    return datos
  } catch (error) {
    console.warn('Error cargando carrito del localStorage:', error)
    return {}
  }
}

/**
 * Guarda el carrito en localStorage
 */
function guardarCarritoLocal() {
  try {
    const datos = {
      version: '1.0',
      timestamp: Date.now(),
      items: carrito.value
    }
    localStorage.setItem('beyou_carrito', JSON.stringify(datos))
  } catch (error) {
    console.warn('No se pudo guardar el carrito:', error)
  }
}

/**
 * Composable para manejar el carrito
 */
export function useCarrito(productos) {
  /**
   * Total de items en el carrito
   */
  const totalItems = computed(() =>
    Object.values(carrito.value).reduce((acc, item) => acc + item.cantidad, 0)
  )

  /**
   * Total en dinero del carrito
   */
  const totalDinero = computed(() =>
    Object.values(carrito.value).reduce((acc, item) => acc + item.precio * item.cantidad, 0)
  )

  /**
   * Busca el stock disponible para un item del carrito
   */
  function buscarStock(idCarrito) {
    const item = carrito.value[idCarrito]
    if (!item) return 0
    const producto = productos.value.find(p => p.id === item.idOriginal)
    return producto?.stock ?? 0
  }

  /**
   * Busca la imagen de un producto
   */
  function buscarImagen(idOriginal) {
    const producto = productos.value.find(p => p.id === idOriginal)
    return producto?.imagen_url || ''
  }

  /**
   * Agrega un producto al carrito
   * @param {Object} producto - Producto a agregar
   * @param {string} varianteElegida - Variante seleccionada (opcional)
   * @returns {Object} {error: null | mensaje}
   */
  // ✅ DESPUÉS - Sanitizar variante antes de usar
function agregarAlCarrito(producto, varianteElegida = null) {
  if (!producto || !producto.id) {
    return { error: '❌ Producto inválido' }
  }

  const tieneVariantes = producto.variantes && producto.variantes.trim() !== ''
  if (tieneVariantes && !varianteElegida) {
    return { error: '🌸 Por favor, elegí una variante primero' }
  }

  // ✅ CRÍTICO: Sanitizar variante ANTES de usar como key
  const varianteLimpia = varianteElegida ? varianteElegida.trim() : null

  // Generar ID único con variante limpia
  const idUnico = varianteLimpia 
    ? `${producto.id}||${varianteLimpia}` 
    : String(producto.id)

  // Validar stock
  const cantActual = carrito.value[idUnico]?.cantidad || 0
  if (cantActual >= producto.stock) {
    return { error: '⚠️ Stock máximo alcanzado' }
  }

  // Si ya existe, incrementar cantidad
  if (carrito.value[idUnico]) {
    carrito.value[idUnico].cantidad++
  } else {
    // Si no existe, crear nuevo item
    carrito.value[idUnico] = {
      nombre: varianteLimpia 
        ? `${producto.nombre} (${varianteLimpia})` 
        : producto.nombre,
      precio: producto.precio,
      cantidad: 1,
      idOriginal: producto.id
    }
  }

  guardarCarritoLocal()
  return { error: null }
}

  /**
   * Cambia la cantidad de un item en el carrito
   * @param {string} id - ID único del item
   * @param {number} delta - Cambio de cantidad (+1 o -1)
   * @returns {Object} {error: null | mensaje}
   */
  function cambiarCantidad(id, delta) {
    const item = carrito.value[id]
    if (!item) {
      return { error: '❌ Item no encontrado' }
    }

    // Validar que no exceda el stock
    if (delta > 0 && item.cantidad >= buscarStock(id)) {
      return { error: '⚠️ No hay más stock disponible' }
    }

    // Actualizar cantidad
    item.cantidad += delta

    // Si llega a 0, eliminar
    if (item.cantidad <= 0) {
      delete carrito.value[id]
    }

    guardarCarritoLocal()
    return { error: null }
  }

  /**
   * Elimina un item del carrito
   */
  function quitarDelCarrito(id) {
    delete carrito.value[id]
    guardarCarritoLocal()
  }

  /**
   * Vacía completamente el carrito
   */
  function vaciarCarrito() {
    carrito.value = {}
    guardarCarritoLocal()
  }

  /**
   * Arma el mensaje para enviar por WhatsApp
   */
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
