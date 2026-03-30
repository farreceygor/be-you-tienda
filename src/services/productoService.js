import { supabase } from '../lib/supabaseClient'

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