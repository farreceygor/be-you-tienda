import { supabase } from '../lib/supabaseClient'
import { AppError, ErrorCodes } from '../lib/AppError'
import { validarImagenProducto } from '../lib/fileValidator'

/**
 * --- SECCIÓN: IMÁGENES ---
 */
/**
 * Sube una imagen de producto a Supabase Storage
 * @param {File} archivo - Archivo de imagen
 * @returns {Promise<string>} URL pública de la imagen
 * @throws {AppError} Si hay error en validación o upload
 */
export const subirImagenProducto = async (archivo) => {
  try {
    // 1. VALIDAR ARCHIVO
    const datosArchivo = validarImagenProducto(archivo)

    if (import.meta.env.DEV) {
      console.log('✅ Archivo validado:', datosArchivo)
    }

    // 2. UPLOAD A SUPABASE
    const { data, error } = await supabase.storage
      .from('productos-img')
      .upload(datosArchivo.nombreSeguro, archivo, {
        cacheControl: '3600',  // Cache 1 hora
        upsert: false          // No sobrescribir archivos existentes
      })

    if (error) {
      throw new AppError(
        'Error al subir imagen a almacenamiento',
        ErrorCodes.PRODUCTO_IMAGE_UPLOAD_ERROR,
        {
          supabaseCode: error.code,
          supabaseMessage: error.message,
          archivo: datosArchivo.nombreSeguro
        },
        500
      )
    }

    if (!data) {
      throw new AppError(
        'Respuesta inválida del servidor de almacenamiento',
        ErrorCodes.PRODUCTO_IMAGE_UPLOAD_ERROR,
        { estado: 'data es null/undefined' },
        500
      )
    }

    // 3. OBTENER URL PÚBLICA
    const { data: publicUrl } = supabase.storage
      .from('productos-img')
      .getPublicUrl(datosArchivo.nombreSeguro)

    if (!publicUrl || !publicUrl.publicUrl) {
      throw new AppError(
        'No se pudo obtener la URL pública',
        ErrorCodes.PRODUCTO_IMAGE_UPLOAD_ERROR,
        { estado: 'publicUrl vacía' },
        500
      )
    }

    if (import.meta.env.DEV) {
      console.log('✅ Imagen subida exitosamente:', publicUrl.publicUrl.substring(0, 50) + '...')
    }

    return publicUrl.publicUrl
  } catch (error) {
    // Si ya es AppError, relanzar
    if (error instanceof AppError) {
      error.loguear()
      throw error
    }

    // Envolver otros errores
    const appError = new AppError(
      'Error inesperado subiendo imagen',
      ErrorCodes.PRODUCTO_IMAGE_UPLOAD_ERROR,
      { mensaje: error.message },
      500
    )
    appError.loguear()
    throw appError
  }
}

/**
 * --- SECCIÓN: PRODUCTOS & CATEGORÍAS ---
 */
export const fetchCategorias = async () => {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * Trae los productos visibles en la tienda
 * @returns {Promise<Array>} Array de productos
 * @throws {AppError} Si hay error en la BD
 */
export const fetchProductos = async () => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select(`*,categorias( nombre, slug )`)
      .eq('visible_web', true)
      .order('id', { ascending: true })

    if (error) {
      throw new AppError(
        'No se pudieron cargar los productos',
        ErrorCodes.DATABASE_ERROR,
        { 
          supabaseCode: error.code,
          supabaseMessage: error.message,
          tabla: 'productos'
        },
        500
      )
    }

    if (!data) {
      throw new AppError(
        'Respuesta inválida de la base de datos',
        ErrorCodes.DATABASE_ERROR,
        { estado: 'data es null/undefined' },
        500
      )
    }

    return data.map(p => ({
      ...p,
      img: p.imagen_url,
      categoria: p.categorias?.slug || 'sin-categoria'
    }))
  } catch (error) {
    // Si ya es AppError, simplemente relanzar
    if (error instanceof AppError) {
      error.loguear()
      throw error
    }

    // Si es otro error, envolverlo
    const appError = new AppError(
      'Error inesperado al cargar productos',
      ErrorCodes.UNKNOWN_ERROR,
      { 
        mensajeOriginal: error.message,
        stack: import.meta.env.DEV ? error.stack : undefined
      },
      500
    )
    appError.loguear()
    throw appError
  }
}

/** Trae TODOS los productos (visibles + ocultos)
 * Lo usa AdminPanel.vue y CobranzaView.vue*/
export const fetchProductosAdmin = async () => {
  const { data, error } = await supabase
    .from('productos')
    .select(`*,categorias( nombre, slug )`)
    .order('id', { ascending: true });  // ← SIN filtrar

  if (error) throw error;

  return data.map(p => ({
    ...p,
    img: p.imagen_url,
    categoria: p.categorias?.slug || 'sin-categoria'
  }));
};

export const crearProducto = async (producto) => {
  const { data, error } = await supabase
    .from('productos')
    .insert([producto]);

  if (error) throw error;
  return data;
};

/**
 * --- SECCIÓN: VENTAS & ESTADÍSTICAS ---
 */

// 1. Registrar una venta nueva


// 2. Traer historial de ventas (para el Panel de Estadísticas)
export const fetchVentas = async () => {
  const { data, error } = await supabase
    .from('ventas')
    .select(`
      *,
      productos ( nombre )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// 3. Anular una venta (Borra registro y devuelve stock)
export const eliminarVenta = async (venta) => {
  try {
    // 1. Consultamos si la venta todavía existe en la DB antes de hacer nada
    const { data: ventaExiste, error: errorCheck } = await supabase
      .from('ventas')
      .select('id')
      .eq('id', venta.id)
      .maybeSingle();

    if (!ventaExiste) {
      throw new Error("La venta ya ha sido anulada o no existe.");
    }

    // 2. Traer stock actual del producto
    const { data: prod, error: errorProd } = await supabase
      .from('productos')
      .select('stock')
      .eq('id', venta.producto_id)
      .single();

    if (errorProd) throw errorProd;

    // 3. Devolver stock
    const { error: errorStock } = await supabase
      .from('productos')
      .update({ stock: prod.stock + venta.cantidad })
      .eq('id', venta.producto_id);

    if (errorStock) throw errorStock;

    // 4. Borrar el registro de la venta definitivamente
    const { error: errorDelete } = await supabase
      .from('ventas')
      .delete()
      .eq('id', venta.id);

    if (errorDelete) throw errorDelete;

    return { success: true };
  } catch (error) {
    console.error("Error en eliminarVenta:", error);
    throw error;
  }
};
// ═══════════════════════════════════════════════════════════════
// SECCIÓN: PEDIDOS (nuevo módulo de cobranza)
// ═══════════════════════════════════════════════════════════════

/**
 * Crea un pedido completo con sus items en una sola operación.
 * 
 * Recibe:
 *   - datosPedido: { cliente, telefono, metodo_pago, estado, notas, total }
 *   - items: [{ producto_id, nombre, cantidad, precio_unit, subtotal }]
 * 
 * El proceso es:
 *   1. Inserta la cabecera en `pedidos` y obtiene el id generado
 *   2. Inserta todas las líneas en `pedido_items` con ese id
 *   3. Descuenta el stock de cada producto vendido
 * 
 * Si cualquier paso falla, lanzamos el error para que el caller lo maneje.
 */
export const crearPedido = async (datosPedido, items) => {
  // Paso 1: crear la cabecera del pedido
  const { data: pedido, error: errorPedido } = await supabase
    .from('pedidos')
    .insert([datosPedido])
    .select()
    .single()

  if (errorPedido) throw errorPedido

  // Paso 2: insertar líneas de detalle con descuentos por item
  const lineas = items.map(item => ({
    pedido_id:        pedido.id,
    producto_id:      item.producto_id,
    nombre:           item.nombre,
    cantidad:         item.cantidad,
    precio_unit:      item.precio_unit,
    subtotal:         item.subtotal,
    descuento_tipo:   item.descuento_tipo   || null,
    descuento_valor:  item.descuento_valor  || 0,
    descuento_monto:  item.descuento_monto  || 0
  }))

  const { error: errorItems } = await supabase
    .from('pedido_items')
    .insert(lineas)

  if (errorItems) throw errorItems

  // Paso 3: descontar stock
  await Promise.all(
    items.map(async (item) => {
      if (!item.producto_id) return
      const { data: prod, error: errorStock } = await supabase
        .from('productos')
        .select('stock')
        .eq('id', item.producto_id)
        .single()

      if (errorStock) throw errorStock

      const nuevoStock = Math.max(0, prod.stock - item.cantidad)
      const { error: errorUpdate } = await supabase
        .from('productos')
        .update({ stock: nuevoStock })
        .eq('id', item.producto_id)

      if (errorUpdate) throw errorUpdate
    })
  )

  return pedido
}

/**
 * Trae todos los pedidos con sus items incluidos.
 * Ordenados por fecha descendente (el más reciente primero).
 */
export const fetchPedidos = async () => {
  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      *,
      pedido_items (
        id,
        nombre,
        cantidad,
        precio_unit,
        subtotal,
        producto_id
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Trae solo los pedidos de hoy.
 * Útil para el resumen diario del módulo de cobranza.
 */
export const fetchPedidosHoy = async () => {
  // Calculamos el inicio del día en hora local
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      *,
      pedido_items (
        id,
        nombre,
        cantidad,
        precio_unit,
        subtotal
      )
    `)
    .gte('created_at', hoy.toISOString())
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Cambia el estado de un pedido.
 * Estados válidos: 'pagado', 'pendiente', 'señado'
 */
export const actualizarEstadoPedido = async (pedidoId, nuevoEstado) => {
  const { error } = await supabase
    .from('pedidos')
    .update({ estado: nuevoEstado })
    .eq('id', pedidoId)

  if (error) throw error
  return { success: true }
}

/**
 * Anula un pedido: devuelve el stock y elimina el registro.
 * El cascade en la DB elimina los pedido_items automáticamente.
 */
export const anularPedido = async (pedido) => {
  // Devolver stock de cada item
  await Promise.all(
    pedido.pedido_items.map(async (item) => {
      if (!item.producto_id) return

      const { data: prod, error: errorProd } = await supabase
        .from('productos')
        .select('stock')
        .eq('id', item.producto_id)
        .single()

      if (errorProd) throw errorProd

      const { error: errorStock } = await supabase
        .from('productos')
        .update({ stock: prod.stock + item.cantidad })
        .eq('id', item.producto_id)

      if (errorStock) throw errorStock
    })
  )

  // Eliminar el pedido (los items se borran solos por el cascade)
  const { error } = await supabase
    .from('pedidos')
    .delete()
    .eq('id', pedido.id)

  if (error) throw error
  return { success: true }
}

/**
 * Trae estadísticas para el dashboard.
 * Devuelve ventas agrupadas por día de los últimos 30 días.
 */
export const fetchEstadisticas = async () => {
  const hace30dias = new Date()
  hace30dias.setDate(hace30dias.getDate() - 30)

  const { data, error } = await supabase
    .from('pedidos')
    .select('created_at, total, estado, pedido_items(nombre, cantidad, subtotal)')
    .gte('created_at', hace30dias.toISOString())
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}
// ═══════════════════════════════════════════════════════════════
// SECCIÓN: BANNERS
// ═══════════════════════════════════════════════════════════════

// Trae todos los banners activos ordenados por el campo 'orden'
// Lo usa la tienda pública para mostrar el carrusel
export const fetchBanners = async () => {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true })

  if (error) throw error
  return data
}

// Trae TODOS los banners (activos e inactivos) para el panel admin
export const fetchBannersAdmin = async () => {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .order('orden', { ascending: true })

  if (error) throw error
  return data
}

// Crea un banner nuevo
export const crearBanner = async (banner) => {
  const { data, error } = await supabase
    .from('banners')
    .insert([banner])
    .select()
    .single()

  if (error) throw error
  return data
}

// Actualiza un banner existente
export const actualizarBanner = async (id, datos) => {
  // Excluir el id de los datos a actualizar (PostgreSQL no permite actualizar PK)
  const { id: _, ...datosLimpios } = datos
  
  const { error } = await supabase
    .from('banners')
    .update(datosLimpios)
    .eq('id', id)

  if (error) throw error
  return { success: true }
}

// Elimina un banner
export const eliminarBanner = async (id) => {
  const { error } = await supabase
    .from('banners')
    .delete()
    .eq('id', id)

  if (error) throw error
  return { success: true }
}

// Actualiza el orden de varios banners a la vez
// Recibe un array de { id, orden }
export const actualizarOrdenBanners = async (items) => {
  await Promise.all(
    items.map(item =>
      supabase
        .from('banners')
        .update({ orden: item.orden })
        .eq('id', item.id)
    )
  )
  return { success: true }
}

// ═══════════════════════════════════════════════════════════════
// SECCIÓN: GASTOS
// ═══════════════════════════════════════════════════════════════

// Trae todos los gastos con sus items incluidos
export const fetchGastos = async () => {
  const { data, error } = await supabase
    .from('gastos')
    .select(`
      *,
      gasto_items (
        id,
        nombre,
        cantidad,
        precio_costo,
        subtotal,
        producto_id
      )
    `)
    .order('fecha', { ascending: false })

  if (error) throw error
  return data
}

// Trae gastos de los últimos 30 días para estadísticas
export const fetchGastosRecientes = async () => {
  const hace30dias = new Date()
  hace30dias.setDate(hace30dias.getDate() - 30)

  const { data, error } = await supabase
    .from('gastos')
    .select(`
      *,
      gasto_items (
        id,
        nombre,
        cantidad,
        precio_costo,
        subtotal,
        producto_id
      )
    `)
    .gte('fecha', hace30dias.toISOString().split('T')[0])
    .order('fecha', { ascending: false })

  if (error) throw error
  return data
}

// Crea un gasto completo con sus items
export const crearGasto = async (datosGasto, items) => {
  // Paso 1: crear la cabecera
  const { data: gasto, error: errorGasto } = await supabase
    .from('gastos')
    .insert([datosGasto])
    .select()
    .single()

  if (errorGasto) throw errorGasto

  // Paso 2: insertar los items
  const lineas = items.map(item => ({
    gasto_id:     gasto.id,
    producto_id:  item.producto_id || null,
    nombre:       item.nombre,
    cantidad:     item.cantidad,
    precio_costo: item.precio_costo,
    subtotal:     item.subtotal
  }))

  const { error: errorItems } = await supabase
    .from('gasto_items')
    .insert(lineas)

  if (errorItems) throw errorItems

  return gasto
}

// Elimina un gasto (los items se borran solos por cascade)
export const eliminarGasto = async (id) => {
  const { error } = await supabase
    .from('gastos')
    .delete()
    .eq('id', id)

  if (error) throw error
  return { success: true }
}

/**
 * Valida que todos los productos en la venta tengan stock disponible
 * @param {Array} items - Items de la venta actual
 * @returns {Object} { valido: bool, error: string }
 */
export const validarStockVenta = async (items) => {
  try {
    // Obtener stock actual de BD para cada producto
    const idsProductos = items
      .filter(i => i.producto_id) // Solo los que tienen ID real
      .map(i => i.producto_id)

    if (idsProductos.length === 0) {
      return { valido: true, error: null }
    }

    // Traer datos actuales de la BD
    const { data: productosActuales, error: errorFetch } = await supabase
      .from('productos')
      .select('id, nombre, stock')
      .in('id', idsProductos)

    if (errorFetch) {
      return { 
        valido: false, 
        error: 'No se pudo verificar stock en la BD' 
      }
    }

    // Validar que cada item tenga stock suficiente
    for (const item of items) {
      if (!item.producto_id) continue

      const prodActual = productosActuales.find(p => p.id === item.producto_id)
      if (!prodActual) {
        return {
          valido: false,
          error: `Producto "${item.nombre}" no encontrado`
        }
      }

      if (prodActual.stock < item.cantidad) {
        return {
          valido: false,
          error: `"${prodActual.nombre}" solo tiene ${prodActual.stock} en stock, querés ${item.cantidad}`
        }
      }
    }

    return { valido: true, error: null }
  } catch (error) {
    console.error('Error validando stock:', error)
    return {
      valido: false,
      error: 'Error inesperado validando stock'
    }
  }
}
/**
 * Actualiza el método de pago de un pedido existente
 * @param {number} pedidoId - ID del pedido
 * @param {string} nuevoMetodo - Nuevo método (efectivo, transferencia, etc)
 */
export const actualizarMetodoPagoPedido = async (pedidoId, nuevoMetodo) => {
  const { error } = await supabase
    .from('pedidos')
    .update({ metodo_pago: nuevoMetodo })
    .eq('id', pedidoId)

  if (error) throw error
  return { success: true }
}