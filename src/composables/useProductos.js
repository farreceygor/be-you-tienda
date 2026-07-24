// src/composables/useProductos.js
import { ref, computed } from 'vue'
import { fetchProductos, fetchCategorias } from '../services/productoService'

export function useProductos() {

  // ─── ESTADO ──────────────────────────────────────────────────────
  const productos       = ref([])
  const categorias      = ref([])
  const cargando        = ref(true)
  const error           = ref(null)

  // ─── FILTROS ─────────────────────────────────────────────────────
  const busqueda        = ref('')
  const categoriaActiva = ref('todos')

  // ─── COMPUTADAS ──────────────────────────────────────────────────
  const categoriasConTodos = computed(() => [
  { id: 'todos', nombre: 'todos', emoji: '🌟' },
  ...categorias.value.map(c => ({
    ...c,
    // Usa el emoji de Supabase, con fallback por si alguna no tiene
    emoji: c.emoji || '✨'
  }))
])

  const productosFiltrados = computed(() => {
    let lista = productos.value

    // Filtro por categoría
    if (categoriaActiva.value !== 'todos') {
      lista = lista.filter(p =>
        (p.categorias?.nombre || '').toLowerCase() === categoriaActiva.value.toLowerCase()
      )
    }

    // Filtro por búsqueda
    if (busqueda.value.trim()) {
      const q = busqueda.value.toLowerCase()
      lista = lista.filter(p => p.nombre.toLowerCase().includes(q))
    }

    return lista.sort((a, b) => a.nombre.localeCompare(b.nombre))
  })

  const sugerencias = computed(() => {
    if (!busqueda.value.trim()) return []
    const q = busqueda.value.toLowerCase()
    return productos.value
      .filter(p => p.nombre.toLowerCase().includes(q) && p.stock > 0)
      .slice(0, 5)
  })

  // ─── MÉTODOS ─────────────────────────────────────────────────────
  function filterCat(nombre) {
    categoriaActiva.value = nombre
    busqueda.value = ''
  }

  function limpiarBusqueda() {
    busqueda.value = ''
  }

  function onSearchInput() {
    if (busqueda.value.trim()) categoriaActiva.value = 'todos'
  }

  async function cargarDatos() {
    cargando.value = true
    error.value = null
    try {
      const [prods, cats] = await Promise.all([
        fetchProductos(),
        fetchCategorias()
      ])
      productos.value  = prods
      categorias.value = cats
    } catch (e) {
      console.error('Error cargando productos:', e)
      error.value = 'Error al cargar los productos'
    } finally {
      cargando.value = false
    }
  }

  return {
    // Estado
    productos,
    categorias,
    cargando,
    error,
    // Filtros
    busqueda,
    categoriaActiva,
    // Computadas
    categoriasConTodos,
    productosFiltrados,
    sugerencias,
    // Métodos
    filterCat,
    limpiarBusqueda,
    onSearchInput,
    cargarDatos
  }
}