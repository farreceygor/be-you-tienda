import { supabase } from '../lib/supabaseClient'
// Subir imagen al Bucket y obtener URL
export const subirImagenProducto = async (archivo) => {
  const nombreArchivo = `${Date.now()}_${archivo.name}`;
  const { data, error } = await supabase.storage
    .from('productos-img')
    .upload(nombreArchivo, archivo);

  if (error) throw error;

  // Obtener la URL pública
  const { data: publicUrl } = supabase.storage
    .from('productos-img')
    .getPublicUrl(nombreArchivo);

  return publicUrl.publicUrl;
};

// Guardar el producto en la tabla
export const crearProducto = async (producto) => {
  const { data, error } = await supabase
    .from('productos')
    .insert([producto]);

  if (error) throw error;
  return data;
};

// Traer categorías dinámicas para el selector
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
    .select(`
      *,
      categorias (
        nombre,
        slug
      )
    `)
    .order('id', { ascending: true })

  if (error) {
    console.error('Error cargando productos:', error)
    return []
  }

  // Mapeamos los datos para que coincidan con tus componentes actuales
  return data.map(p => ({
    id: p.id,
    nombre: p.nombre,
    precio: p.precio,
    stock: p.stock,
    img: p.imagen_url,
    categoria: p.categorias?.slug || 'sin-categoria'
  }))
}