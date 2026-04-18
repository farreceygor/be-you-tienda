import { supabase } from '../lib/supabaseClient'

/**
 * --- SECCIÓN: IMÁGENES ---
 */
export const subirImagenProducto = async (archivo) => {
  const nombreArchivo = `${Date.now()}_${archivo.name}`;
  const { data, error } = await supabase.storage
    .from('productos-img')
    .upload(nombreArchivo, archivo);

  if (error) throw error;

  const { data: publicUrl } = supabase.storage
    .from('productos-img')
    .getPublicUrl(nombreArchivo);

  return publicUrl.publicUrl;
};

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

export const fetchProductos = async () => {
  const { data, error } = await supabase
    .from('productos')
    .select(`*,categorias( nombre, slug )`)
    .order('id', { ascending: true });

  if (error) throw error;

  return data.map(p => ({
    ...p,
    img: p.imagen_url, // Mantenemos compatibilidad con tus componentes
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
export const registrarVenta = async (producto, cantidad) => {
  try {
    // Insertar el registro de la venta (usamos el precio que viene del modal)
    const { error: errorVenta } = await supabase
      .from('ventas')
      .insert([{
        producto_id: producto.id,
        nombre_producto: producto.nombre,
        cantidad: cantidad,
        precio_unitario: producto.precio,
        total: producto.precio * cantidad
      }]);

    if (errorVenta) throw errorVenta;

    // Actualizar el stock
    const nuevoStock = producto.stock - cantidad;
    const { error: errorStock } = await supabase
      .from('productos')
      .update({ stock: nuevoStock })
      .eq('id', producto.id);

    if (errorStock) throw errorStock;

    return { success: true };
  } catch (error) {
    console.error("Error en registrarVenta:", error);
    throw error;
  }
};

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