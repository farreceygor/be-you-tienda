<template>
  <!-- PANEL -->
  <div class="admin">

    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar__brand">
        <img src="https://abhcuuyqxyjmunfaosah.supabase.co/storage/v1/object/public/public-assets/logo.jpeg" alt="Be You" class="sidebar__logo" />
        <div>
          <span class="sidebar__name">Be You</span>
          <span class="sidebar__role">Administración</span>
        </div>
      </div>

      <nav class="sidebar__nav">
        <button
          v-for="item in navItems"
          :key="item.vista"
          class="sidebar__item"
          :class="{ 'sidebar__item--active': vistaActual === item.vista }"
          @click="cambiarVista(item.vista)"
        >
          <span class="sidebar__item-icon">{{ item.icon }}</span>
          <span class="sidebar__item-label">{{ item.label }}</span>
        </button>

        <div class="sidebar__divider"></div>

        <button class="sidebar__item" @click="irACobranza">
          <span class="sidebar__item-icon">💳</span>
          <span class="sidebar__item-label">Cobranza</span>
          <span class="sidebar__item-ext">↗</span>
        </button>
        <button class="sidebar__item" @click="irAEstadisticas">
          <span class="sidebar__item-icon">📊</span>
          <span class="sidebar__item-label">Estadísticas</span>
          <span class="sidebar__item-ext">↗</span>
        </button>
        <button class="sidebar__item" @click="irAGastos">
          <span class="sidebar__item-icon">💰</span>
          <span class="sidebar__item-label">Gastos</span>
          <span class="sidebar__item-ext">↗</span>
        </button>
        <button class="sidebar__item" @click="irATienda">
          <span class="sidebar__item-icon">🛍️</span>
          <span class="sidebar__item-label">Ver tienda</span>
          <span class="sidebar__item-ext">↗</span>
        </button>
      </nav>

      <button class="sidebar__salir" @click="cerrarSesion">
        🚪 Cerrar sesión
      </button>
    </aside>

    <!-- CONTENIDO PRINCIPAL -->
    <main class="admin__main">

      <!-- ═══ INVENTARIO ═══ -->
      <div v-if="vistaActual === 'inventario'" class="fade-in">
        <div class="page-header">
          <div>
            <h1 class="page-title">Inventario</h1>
            <p class="page-sub">{{ productosCargados.length }} productos en total</p>
          </div>
          <button class="btn-primary" @click="cambiarVista('nuevo')">+ Nuevo producto</button>
        </div>

        <div class="search-bar">
          <span class="search-bar__icon">🔍</span>
          <input v-model="textoBusqueda" type="text" placeholder="Buscar producto..." class="search-bar__input" />
        </div>

        <div class="tabla-wrap">
          <table class="tabla">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Web</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="inventarioFiltrado.length === 0">
                <td colspan="7" class="tabla__empty">Sin productos</td>
              </tr>
              <tr v-for="prod in inventarioFiltrado" :key="prod.id">
                <td>
                  <div class="tabla-prod">
                    <img :src="prod.imagen_url" :alt="prod.nombre" class="tabla-prod__img" />
                    <span class="tabla-prod__nombre">{{ prod.nombre }}</span>
                  </div>
                </td>
                <td class="td-mid">{{ prod.categorias?.nombre || '—' }}</td>
                <td class="td-mid">${{ prod.precio.toLocaleString('es-AR') }}</td>
                <td>
                  <span class="stock-badge" :class="stockClass(prod.stock)">
                    {{ prod.stock }}
                  </span>
                </td>
                <td>
                  <span class="estado-pill" :class="prod.stock > 0 ? 'estado-pill--on' : 'estado-pill--off'">
                    {{ prod.stock > 0 ? 'Activo' : 'Sin stock' }}
                  </span>
                </td>
                
                <!-- Columna WEB (Botón habilitar/deshabilitar) -->
                <td>
                  <button 
                    class="accion-btn" 
                    :title="prod.visible_web !== false ? 'Ocultar de la web' : 'Mostrar en la web'" 
                    @click="toggleVisibilidadWeb(prod)"
                  >
                    {{ prod.visible_web !== false ? '🌐' : '🙈' }}
                  </button>
                </td>

                <!-- Columna ACCIONES (Editar y Eliminar) -->
                <td>
                  <div class="acciones">                 
                    <button class="accion-btn accion-btn--edit" title="Editar" @click="prepararEdicion(prod)">✏️</button>
                    <button class="accion-btn accion-btn--del" title="Eliminar" @click="eliminarProducto(prod)">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ═══ NUEVO / EDITAR PRODUCTO ═══ -->
      <div v-if="vistaActual === 'nuevo'" class="fade-in">
        <div class="page-header">
          <div>
            <h1 class="page-title">{{ editandoId ? 'Editar producto' : 'Nuevo producto' }}</h1>
            <p class="page-sub">{{ editandoId ? 'Modificá los datos del producto' : 'Completá los datos para publicar' }}</p>
          </div>
          <button class="btn-ghost" @click="limpiarFormulario(); cambiarVista('inventario')">← Volver</button>
        </div>

        <div class="form-card">
          <form @submit.prevent="guardarProducto" class="form-grid">
            <div class="form-group form-group--full">
              <label>Nombre del producto</label>
              <input v-model="nuevoProducto.nombre" type="text" placeholder="Ej: Labial Matte Ultra Red" required />
            </div>
            <div class="form-group">
              <label>Precio ($)</label>
              <input v-model="nuevoProducto.precio" type="number" placeholder="0" required />
            </div>
            <div class="form-group">
              <label>Stock</label>
              <input v-model="nuevoProducto.stock" type="number" placeholder="0" required />
            </div>
            <div class="form-group">
              <label>Categoría</label>
              <select v-model="nuevoProducto.categoria_id">
                <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Variantes / Fragancias</label>
              <input v-model="nuevoProducto.variantes" type="text" placeholder="Ej: Vainilla, Coco, Lavanda" />
              <span class="form-hint">Separadas por comas. Vacío si no tiene variantes.</span>
            </div>
            <div class="form-group form-group--full">
              <label>Imagen del producto</label>
              <div class="upload-zone" @click="$refs.fileInput.click()">
                <input ref="fileInput" type="file" accept="image/*" class="upload-zone__input" @change="previsualizarImagen" />
                <div v-if="!imgPreview" class="upload-zone__placeholder">
                  <span>📷</span>
                  <p>Hacé click para elegir una imagen</p>
                  <small>JPG, PNG, WEBP · Máx. 5MB</small>
                </div>
                <img v-else :src="imgPreview" class="upload-zone__preview" alt="Vista previa" />
              </div>
            </div>
            <div class="form-group form-group--full form-actions">
              <button type="button" class="btn-ghost" @click="limpiarFormulario()" v-if="editandoId">
                Cancelar edición
              </button>
              <button type="submit" class="btn-primary" :disabled="cargando">
                {{ cargando ? 'Guardando...' : (editandoId ? 'Actualizar producto' : 'Publicar producto') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ═══ CATEGORÍAS ═══ -->
      <div v-if="vistaActual === 'categorias'" class="fade-in">
        <div class="page-header">
          <div>
            <h1 class="page-title">Categorías</h1>
            <p class="page-sub">Organizá los productos de tu tienda</p>
          </div>
        </div>

        <div class="form-card" style="margin-bottom: 16px;">
          <h3 class="form-card__title">{{ editandoCatId ? 'Editar categoría' : 'Nueva categoría' }}</h3>
          <div class="cat-nueva">
            <input
              v-model="nuevaCatNombre"
              type="text"
              placeholder="Ej: Accesorios"
              :disabled="cargando"
            />
            <select v-model="nuevaCatEmoji" class="cat-emoji-select">
              <option v-for="e in emojisDisponibles" :key="e.valor" :value="e.valor">
                {{ e.valor }} {{ e.label }}
              </option>
            </select>
            <button @click="guardarCategoria" class="btn-primary" :disabled="cargando">
              {{ cargando ? '...' : (editandoCatId ? 'Actualizar' : 'Agregar') }}
            </button>
            <button
              v-if="editandoCatId"
              @click="editandoCatId = null; nuevaCatNombre = ''; nuevaCatEmoji = '✨'"
              class="btn-ghost"
            >
              Cancelar
            </button>
          </div>
          <p class="cat-preview">
            Vista previa: <strong>{{ nuevaCatEmoji }} {{ nuevaCatNombre || 'Nombre' }}</strong>
          </p>
        </div>

        <div class="tabla-wrap">
          <table class="tabla">
            <thead>
              <tr><th>Nombre</th><th>Slug</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              <tr v-if="categorias.length === 0">
                <td colspan="3" class="tabla__empty">Sin categorías</td>
              </tr>
              <tr v-for="cat in categorias" :key="cat.id">
                <td>
                  <strong>{{ cat.emoji }} {{ cat.nombre }}</strong>
                </td>
                <td class="td-mid hide-sm">{{ cat.slug }}</td>
                <td>
                  <div class="acciones">
                    <button class="accion-btn accion-btn--edit" @click="prepararEdicionCategoria(cat)">✏️</button>
                    <button class="accion-btn accion-btn--del" @click="eliminarCategoria(cat)">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ═══ BANNERS ═══ -->
      <div v-if="vistaActual === 'banners'" class="fade-in">
        <div class="page-header">
          <div>
            <h1 class="page-title">Banners</h1>
            <p class="page-sub">Gestioná el carrusel de la tienda</p>
          </div>
          <button class="btn-primary" @click="prepararNuevoBanner(); editandoBanner = -1">
            + Nuevo banner
          </button>
        </div>

        <div v-if="editandoBanner !== null" class="form-card" style="margin-bottom: 16px;">
          <h3 class="form-card__title">{{ editandoBanner === -1 ? 'Nuevo banner' : 'Editar banner' }}</h3>
          <div class="form-grid">
            <div class="form-group form-group--full">
              <label>Título</label>
              <input v-model="nuevoBanner.titulo" type="text" placeholder="Ej: Nueva colección de verano" />
            </div>
            <div class="form-group form-group--full">
              <label>Subtítulo</label>
              <input v-model="nuevoBanner.subtitulo" type="text" placeholder="Ej: Descubrí las últimas tendencias" />
            </div>
            <div class="form-group">
              <label>Eyebrow (texto pequeño arriba)</label>
              <input v-model="nuevoBanner.eyebrow" type="text" placeholder="Ej: Nueva colección" />
            </div>
            <div class="form-group">
              <label>Emoji decorativo</label>
              <input v-model="nuevoBanner.emoji_deco" type="text" placeholder="Ej: 💄" maxlength="4" />
            </div>
            <div class="form-group">
              <label>Texto del botón</label>
              <input v-model="nuevoBanner.cta_texto" type="text" placeholder="Ej: Ver productos" />
            </div>
            <div class="form-group">
              <label>Categoría del botón</label>
              <select v-model="nuevoBanner.cta_cat">
                <option value="todos">Todos los productos</option>
                <option v-for="cat in categorias" :key="cat.id" :value="cat.nombre">
                  {{ cat.nombre }}
                </option>
              </select>
            </div>
            <div class="form-group form-group--full">
              <label>Color de fondo</label>
              <div class="gradientes-grid">
                <div
                  v-for="g in gradientesPreset"
                  :key="g.value"
                  class="gradiente-chip"
                  :class="{ 'gradiente-chip--active': nuevoBanner.gradiente === g.value }"
                  :style="{ background: g.value }"
                  @click="nuevoBanner.gradiente = g.value"
                >
                  <span class="gradiente-chip__label">{{ g.label }}</span>
                </div>
              </div>
            </div>
            <div class="form-group form-group--full">
              <label>Vista previa</label>
              <div class="banner-preview" :style="{ background: nuevoBanner.gradiente }">
                <div class="banner-preview__content">
                  <span class="banner-preview__eyebrow">{{ nuevoBanner.eyebrow || 'Eyebrow' }}</span>
                  <p class="banner-preview__titulo">{{ nuevoBanner.titulo || 'Título del banner' }}</p>
                  <p class="banner-preview__sub">{{ nuevoBanner.subtitulo || 'Subtítulo descriptivo' }}</p>
                  <span class="banner-preview__btn">{{ nuevoBanner.cta_texto || 'Ver productos' }}</span>
                </div>
                <span class="banner-preview__deco">{{ nuevoBanner.emoji_deco }}</span>
              </div>
            </div>
            <div class="form-group form-group--full form-actions">
              <button class="btn-ghost" @click="editandoBanner = null">Cancelar</button>
              <button class="btn-primary" @click="guardarBanner" :disabled="cargando">
                {{ cargando ? 'Guardando...' : (editandoBanner === -1 ? 'Crear banner' : 'Guardar cambios') }}
              </button>
            </div>
          </div>
        </div>

        <div class="banners-lista">
          <div v-if="banners.length === 0" class="tabla-wrap">
            <p style="padding: 30px; text-align: center; color: var(--mid);">Sin banners creados</p>
          </div>
          <div v-for="(banner, idx) in banners" :key="banner.id" class="banner-item">
            <div class="banner-item__preview" :style="{ background: banner.gradiente }">
              <span class="banner-item__emoji">{{ banner.emoji_deco }}</span>
            </div>
            <div class="banner-item__info">
              <span class="banner-item__titulo">{{ banner.titulo }}</span>
              <span class="banner-item__sub">{{ banner.subtitulo }}</span>
              <span class="banner-item__cat">→ {{ banner.cta_cat }}</span>
            </div>
            <div class="banner-item__acciones">
              <button
                class="accion-btn"
                :title="banner.activo ? 'Desactivar' : 'Activar'"
                @click="toggleActivoBanner(banner)"
              >
                {{ banner.activo ? '✅' : '⭕' }}
              </button>
              <button class="accion-btn" title="Subir" :disabled="idx === 0" @click="moverBannerOrden(idx, -1)">↑</button>
              <button class="accion-btn" title="Bajar" :disabled="idx === banners.length - 1" @click="moverBannerOrden(idx, 1)">↓</button>
              <button class="accion-btn accion-btn--edit" title="Editar" @click="prepararEdicionBanner(banner)">✏️</button>
              <button class="accion-btn accion-btn--del" title="Eliminar" @click="eliminarBannerAdmin(banner)">🗑️</button>
            </div>
          </div>
        </div>
      </div>

    </main>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast.show" class="toast">{{ toast.msg }}</div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../composables/useAuth'
import { AppError } from '../lib/AppError'
import {
  subirImagenProducto,
  crearProducto,
  fetchCategorias,
  fetchProductosAdmin,
  fetchBannersAdmin,
  crearBanner,
  actualizarBanner,
  eliminarBanner,
  actualizarOrdenBanners
} from '../services/productoService'

const router = useRouter()
const menuAbierto = ref(false)
function toggleMenu() { menuAbierto.value = !menuAbierto.value }
function cerrarMenu() { menuAbierto.value = false }

function cambiarVista(vista) {
  vistaActual.value = vista
  cerrarMenu()
}

// ─── NAV ─────────────────────────────────────────────────────────
const navItems = [
  { vista: 'inventario', icon: '📦', label: 'Inventario' },
  { vista: 'nuevo',     icon: '➕', label: 'Nuevo producto' },
  { vista: 'categorias', icon: '🏷️', label: 'Categorías' },
  { vista: 'banners',    icon: '🖼️', label: 'Banners' },
]

function irACobranza()    { router.push({ name: 'cobranza' }) }
function irAEstadisticas() { router.push({ name: 'estadisticas' }) }
function irATienda()       { router.push({ name: 'tienda' }) }
function irAGastos() { router.push({ name: 'gastos' }) }

// ─── AUTH ─────────────────────────────────────────────────────────
const { usuario, cargando: cargandoAuth, error: errorAuth, login, logout } = useAuth()
const usuarioLogueado = computed(() => !!usuario.value)

async function cerrarSesion() {
  if (confirm('¿Cerrar sesión?')) {
    await logout()
    router.push({ name: 'tienda' })
  }
}

/*async function cerrarSesion() {
  try {
    await logout()
    productosCargados.value = []
  } catch (err) {
    mostrarToast('Error al cerrar sesión')
  }
}*/

// ─── ESTADO ───────────────────────────────────────────────────────
const vistaActual       = ref('inventario')
const cargando          = ref(false)
const textoBusqueda     = ref('')
const categorias        = ref([])
const productosCargados = ref([])

watch(usuarioLogueado, (nuevo) => {
  if (!nuevo) { email.value = ''; password.value = ''; errorLogin.value = '' }
})

watch(vistaActual, async (nueva) => {
  if (nueva === 'banners') await cargarBanners()
})

const toast = reactive({ show: false, msg: '' })
let toastTimer = null
function mostrarToast(msg) {
  clearTimeout(toastTimer)
  toast.msg = msg; toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 2500)
}

// ─── BANNERS (Declarados antes de inicializarDatos) ───────────────
const banners = ref([])
const editandoBanner = ref(null) 
const nuevoBanner = ref({
  titulo: '',
  subtitulo: '',
  eyebrow: '',
  cta_texto: 'Ver productos',
  cta_cat: 'todos',
  gradiente: 'linear-gradient(135deg, #3D1A25 0%, #7A3350 60%, #C9748A 100%)',
  emoji_deco: '✨',
  orden: 0,
  activo: true
})

const gradientesPreset = [
  { label: 'Rosa',    value: 'linear-gradient(135deg, #3D1A25 0%, #7A3350 60%, #C9748A 100%)' },
  { label: 'Azul',    value: 'linear-gradient(135deg, #1A2D3D 0%, #2B5070 60%, #4A8FA8 100%)' },
  { label: 'Dorado', value: 'linear-gradient(135deg, #2D2A1A 0%, #5C4E2B 60%, #C9A96E 100%)' },
  { label: 'Verde',  value: 'linear-gradient(135deg, #1A3D2A 0%, #2B7050 60%, #4AA870 100%)' },
  { label: 'Violeta',value: 'linear-gradient(135deg, #2A1A3D 0%, #50307A 60%, #8A60C9 100%)' },
]

async function cargarBanners() {
  try {
    banners.value = await fetchBannersAdmin()
  } catch (e) {
    mostrarToast('❌ Error al cargar banners')
  }
}

// ─── INVENTARIO ───────────────────────────────────────────────────
const inventarioFiltrado = computed(() => {
  if (!textoBusqueda.value) return productosCargados.value
  const q = textoBusqueda.value.toLowerCase()
  return productosCargados.value.filter(p =>
    p.nombre.toLowerCase().includes(q) ||
    p.categorias?.nombre?.toLowerCase().includes(q)
  )
})

function stockClass(stock) {
  if (stock <= 0)  return 'stock-badge--rojo'
  if (stock <= 3)  return 'stock-badge--naranja'
  return 'stock-badge--verde'
}

async function cargarInventario() {
  try {
    const response = await fetchProductosAdmin()
    const data = response?.data !== undefined ? response.data : response
    const error = response?.error

    if (error) {
      console.error('Error al obtener productos:', error)
      return
    }

    productosCargados.value = (data || []).map(p => ({
      ...p,
      img: p.imagen_url
    }))
  } catch (err) {
    console.error('Error inesperado en cargarInventario:', err)
  }
}
// ─── FORMULARIO PRODUCTO ─────────────────────────────────────────
const editandoId    = ref(null)
const imagenArchivo = ref(null)
const imgPreview    = ref(null)
const fileInput     = ref(null)
const nuevoProducto = ref({ nombre: '', precio: null, stock: 0, categoria_id: null, imagen_url: '', variantes: '' })

async function guardarProducto() {
  if (!imagenArchivo.value && !editandoId.value) {
    mostrarToast('📸 Falta la imagen del producto')
    return
  }
  
  cargando.value = true
  try {
    let url = nuevoProducto.value.imagen_url
    if (imagenArchivo.value) url = await subirImagenProducto(imagenArchivo.value)

    const variantes = (nuevoProducto.value.variantes || '')
      .split(',')
      .map(v => v.trim())           // ← Quita espacios
      .filter(v => v.length > 0)     // ← Elimina vacías
      .join(', ')                   // ← Reconstruye con formato consistente

      const datosFinales = {
      nombre: nuevoProducto.value.nombre.trim(),
      precio: Number(nuevoProducto.value.precio),
      stock: Number(nuevoProducto.value.stock),
      categoria_id: nuevoProducto.value.categoria_id,
      imagen_url: url,
      variantes: variantes  // ✅ Limpio
    }

    if (editandoId.value) {
      // 🔧 CORREGIDO: Ahora con error handling
      const { error } = await supabase
        .from('productos')
        .update(datosFinales)
        .eq('id', editandoId.value)

      if (error) {
        throw new Error(`Error al actualizar: ${error.message}`)
      }
      mostrarToast('✅ Producto actualizado')
    } else {
      await crearProducto(datosFinales)
      mostrarToast('✅ Producto publicado')
    }

    limpiarFormulario()
    await cargarInventario()
    cambiarVista('inventario')
  } catch (error) {
    mostrarToast('❌ Error: ' + error.message)
    console.error('Error completo:', error)
  } finally {
    cargando.value = false
  }
}

function prepararEdicion(producto) {
  editandoId.value = producto.id
  nuevoProducto.value = { ...producto, variantes: producto.variantes || '' }
  imgPreview.value = producto.imagen_url
  cambiarVista('nuevo')
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function eliminarProducto(producto) {
  if (!confirm(`¿Eliminar "${producto.nombre}"?`)) return
  cargando.value = true
  try {
    if (producto.imagen_url) {
      const partes = producto.imagen_url.split('/')
      const nombreArchivo = partes[partes.length - 1]
      await supabase.storage.from('productos-img').remove([nombreArchivo])
    }
    await supabase.from('productos').delete().eq('id', producto.id)
    await cargarInventario()
    mostrarToast('✅ Producto eliminado')
  } catch (error) {
    mostrarToast('❌ Error al eliminar: ' + error.message)
  } finally {
    cargando.value = false
  }
}

function limpiarFormulario() {
  editandoId.value = null
  nuevoProducto.value = { nombre: '', precio: null, stock: 0, categoria_id: categorias.value[0]?.id, variantes: '' }
  imagenArchivo.value = null
  imgPreview.value = null
}

function previsualizarImagen(e) {
  const file = e.target.files[0]
  if (file) { imagenArchivo.value = file; imgPreview.value = URL.createObjectURL(file) }
}

async function toggleVisibilidadWeb(producto) {
  cargando.value = true
  try {
    const nuevoEstado = !producto.visible_web
    await supabase
      .from('productos')
      .update({ visible_web: nuevoEstado })
      .eq('id', producto.id)
    
    producto.visible_web = nuevoEstado
    mostrarToast(
      nuevoEstado 
        ? '✅ Producto visible en web' 
        : '🙈 Producto oculto en web'
    )
  } catch (error) {
    mostrarToast('❌ Error al cambiar visibilidad: ' + error.message)
  } finally {
    cargando.value = false
  }
}

// ─── CATEGORÍAS ───────────────────────────────────────────────────
const nuevaCatNombre = ref('')
const editandoCatId  = ref(null)
const nuevaCatEmoji  = ref('✨')
const emojisDisponibles = [
  { valor: '✨', label: 'Destellos' }, { valor: '💄', label: 'Labial' },
  { valor: '👁️', label: 'Ojos' }, { valor: '🌸', label: 'Flor' },
  { valor: '🎁', label: 'Regalo' }, { valor: '💅', label: 'Uñas' },
  { valor: '💍', label: 'Anillo' }, { valor: '🧴', label: 'Cuidado' },
  { valor: '👜', label: 'Cartera' }, { valor: '🪞', label: 'Espejo' },
  { valor: '🧖', label: 'Spa' }, { valor: '🛍️', label: 'Accesorio' },
  { valor: '💋', label: 'Beso' }, { valor: '🌺', label: 'Flor 2' },
  { valor: '🎀', label: 'Moño' }, { valor: '🌟', label: 'Estrella' },
  { valor: '🕶️', label: 'Lentes' }, { valor: '❄️', label: 'Invierno' },
  { valor: '☀️', label: 'Verano' }, { valor: '👝', label: 'Billetera' },
  { valor: '💎', label: 'Diamante' },{ valor: '🥤', label: 'Botella' },
]

async function guardarCategoria() {
  const nombre = nuevaCatNombre.value.trim()
  if (!nombre || nombre.length < 2) {
    mostrarToast('⚠️ Verificá el nombre de la categoría')
    return
  }
  cargando.value = true
  const slug = nombre.toLowerCase().replace(/\s+/g, '-')
  try {
    if (editandoCatId.value) {
      await supabase.from('categorias').update({ nombre, slug, emoji: nuevaCatEmoji.value }).eq('id', editandoCatId.value)
    } else {
      await supabase.from('categorias').insert([{ nombre, slug, emoji: nuevaCatEmoji.value }])
    }
    nuevaCatNombre.value = ''
    nuevaCatEmoji.value  = '✨'
    editandoCatId.value  = null
    categorias.value     = await fetchCategorias()
    mostrarToast('✅ Categoría guardada')
  } catch { mostrarToast('❌ Error al guardar categoría') }
  finally { cargando.value = false }
}

function prepararEdicionCategoria(cat) {
  editandoCatId.value  = cat.id
  nuevaCatNombre.value = cat.nombre
  nuevaCatEmoji.value  = cat.emoji || '✨'
}

async function eliminarCategoria(cat) {
  if (!confirm(`¿Borrar "${cat.nombre}"?`)) return
  try {
    await supabase.from('categorias').delete().eq('id', cat.id)
    categorias.value = await fetchCategorias()
    mostrarToast('✅ Categoría eliminada')
  } catch { mostrarToast('⚠️ Tiene productos asociados') }
}

// Acciones de Banners
function prepararNuevoBanner() {
  editandoBanner.value = -1
  nuevoBanner.value = {
    titulo: '', subtitulo: '', eyebrow: '',
    cta_texto: 'Ver productos', cta_cat: 'todos',
    gradiente: gradientesPreset[0].value,
    emoji_deco: '✨', orden: banners.value.length, activo: true
  }
}

function prepararEdicionBanner(banner) {
  editandoBanner.value = banner.id
  // ✅ Copia profunda con todos los campos
  nuevoBanner.value = {
    titulo:       banner.titulo || '',
    subtitulo:    banner.subtitulo || '',
    eyebrow:      banner.eyebrow || '',
    cta_texto:    banner.cta_texto || 'Ver productos',
    cta_cat:      banner.cta_cat || 'todos',
    gradiente:    banner.gradiente || gradientesPreset[0].value,
    emoji_deco:   banner.emoji_deco || '✨',
    orden:        banner.orden || 0,
    activo:       banner.activo !== false
  }
}

async function guardarBanner() {
  if (!nuevoBanner.value.titulo.trim()) {
    mostrarToast('⚠️ El título es obligatorio')
    return
  }
  cargando.value = true
  try {
    if (editandoBanner.value && editandoBanner.value !== -1) {
      console.log('📝 Actualizando banner:', editandoBanner.value, nuevoBanner.value)
      await actualizarBanner(editandoBanner.value, nuevoBanner.value)
      mostrarToast('✅ Banner actualizado')
    } else {
      console.log('✨ Creando banner:', nuevoBanner.value)
      await crearBanner(nuevoBanner.value)
      mostrarToast('✅ Banner creado')
    }
    editandoBanner.value = null
    await cargarBanners()
  } catch (e) {
    mostrarToast('❌ Error al guardar: ' + e.message)
    console.error('Error completo:', e)
  } finally {
    cargando.value = false
  }
}

async function toggleActivoBanner(banner) {
  try {
    await actualizarBanner(banner.id, { activo: !banner.activo })
    banner.activo = !banner.activo
    mostrarToast(banner.activo ? '✅ Banner activado' : '⚠️ Banner desactivado')
  } catch {
    mostrarToast('❌ Error al cambiar estado')
  }
}

async function moverBannerOrden(idx, dir) {
  const lista = [...banners.value]
  const nuevoIdx = idx + dir
  if (nuevoIdx < 0 || nuevoIdx >= lista.length) return
  ;[lista[idx], lista[nuevoIdx]] = [lista[nuevoIdx], lista[idx]]
  const items = lista.map((b, i) => ({ id: b.id, orden: i }))
  try {
    await actualizarOrdenBanners(items)
    banners.value = lista
    mostrarToast('✅ Orden actualizado')
  } catch {
    mostrarToast('❌ Error al reordenar')
  }
}

async function eliminarBannerAdmin(banner) {
  if (!confirm(`¿Eliminar el banner "${banner.titulo}"?`)) return
  try {
    await eliminarBanner(banner.id)
    banners.value = banners.value.filter(b => b.id !== banner.id)
    mostrarToast('✅ Banner eliminado')
  } catch {
    mostrarToast('❌ Error al eliminar')
  }
}

// ─── INICIALIZACIÓN ───────────────────────────────────────────────
async function inicializarDatos() {
  try {
    const datos = await fetchCategorias()
    if (datos?.length > 0) {
      categorias.value = datos
      nuevoProducto.value.categoria_id = datos[0].id
    }
    await cargarInventario()
    await cargarBanners()
  } catch (e) {
    console.error('Error inicializando:', e)
  }
}

onMounted(async () => {
  if (usuario.value) await inicializarDatos()
})
</script>

<style scoped>
/* ─── VARIABLES ─── */
.admin, .login-wrap {
  --rose:#C9748A;
  --rose-light:#F7E8ED;
  --rose-dark:#8B4A5C;
  --cream:#F5F0EE;
  --charcoal:#2D2D2D;
  --mid:#6B6B6B;
  --border:#EDE4E1;
  --white:#FFFFFF;
  --radius:10px;
  --radius-sm:6px;
  --trans:0.2s ease;
  font-family:'Poppins', system-ui, sans-serif;
  color: var(--charcoal);
}

/* ─── LOGIN ─── */
.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cream);
  padding: 20px;
}
.login-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 36px 28px;
  width: 100%;
  max-width: 380px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0,0,0,0.06);
}
.login-logo  { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 3px solid var(--rose-light); margin-bottom: 14px; }
.login-title { font-size: 1.3rem; font-weight: 700; margin-bottom: 4px; }
.login-sub   { font-size: 13px; color: var(--mid); margin-bottom: 24px; }
.login-form  { text-align: left; }
.login-field { margin-bottom: 14px; }
.login-field label { display: block; font-size: 12px; font-weight: 600; color: var(--mid); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
.login-field input { width: 100%; padding: 10px 14px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 14px; font-family: inherit; transition: border var(--trans); }
.login-field input:focus { outline: none; border-color: var(--rose); }
.login-error { font-size: 12px; color: #C62828; margin-bottom: 12px; }
.btn-login { width: 100%; padding: 12px; background: var(--rose); color: white; border: none; border-radius: var(--radius); font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; transition: background var(--trans); }
.btn-login:hover:not(:disabled) { background: var(--rose-dark); }
.btn-login:disabled { background: #ccc; cursor: not-allowed; }

/* ─── LAYOUT ADMIN ─── */
.admin {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
  background: var(--cream);
}
/* En móvil el sidebar se superpone, no ocupa espacio en el grid */
@media (max-width: 768px) {
  .admin { grid-template-columns: 1fr; }
}

/* ─── SIDEBAR ─── */
.sidebar {
  background: var(--charcoal);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 200;
  transition: transform var(--trans);
}
/* En móvil el sidebar está oculto fuera de pantalla */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 260px;
    transform: translateX(-100%);
    box-shadow: 4px 0 20px rgba(0,0,0,0.2);
  }
  .sidebar--abierto { transform: translateX(0); }
}

/* Overlay para cerrar sidebar en móvil */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 199;
  backdrop-filter: blur(2px);
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.sidebar__logo  { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.15); flex-shrink: 0; }
.sidebar__name  { display: block; font-size: 13px; font-weight: 700; color: white; line-height: 1; }
.sidebar__role  { display: block; font-size: 9px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
/* Botón cerrar solo visible en móvil */
.sidebar__close {
  margin-left: auto;
  background: none;
  border: none;
  color: rgba(255,255,255,0.4);
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  display: none;
}
@media (max-width: 768px) { .sidebar__close { display: block; } }

.sidebar__nav  { flex: 1; padding: 10px 8px; }
.sidebar__item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: none;
  background: none;
  color: rgba(255,255,255,0.55);
  font-size: 13px;
  font-family: inherit;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: left;
  transition: all var(--trans);
  margin-bottom: 2px;
}
.sidebar__item:hover{ background: rgba(255,255,255,0.08); color: white; }
.sidebar__item--active{ background: var(--rose) !important; color: white !important; }
.sidebar__item-icon{ font-size: 16px; flex-shrink: 0; }
.sidebar__item-label{ flex: 1; }
.sidebar__item-ext{ font-size: 11px; opacity: 0.5; }
.sidebar__divider{ border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 8px 0; }
.sidebar__salir{
  margin: 8px;
  padding: 10px 12px;
  background: none;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: var(--radius-sm);
  color: rgba(255,255,255,0.4);
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all var(--trans);
}
.sidebar__salir:hover { border-color: rgba(255,255,255,0.25); color: white; }

/* ─── TOPBAR MÓVIL ─── */
.admin__wrap { display: flex; flex-direction: column; min-height: 100vh; overflow: hidden; }
.admin__topbar {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--white);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 10;
}
@media (max-width: 768px) { .admin__topbar { display: flex; } }
.topbar__hamburger {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: var(--charcoal);
  padding: 4px;
  width: 36px;
}
.topbar__titulo { font-size: 15px; font-weight: 600; }

/* ─── MAIN ─── */
.admin__main { padding: 16px; overflow-y: auto; flex: 1; }
@media (min-width: 768px) { .admin__main { padding: 24px; } }

/* ─── PAGE HEADER ─── */
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
.page-title { font-size: 1.2rem; font-weight: 700; }
.page-sub { font-size: 13px; color: var(--mid); }

/* ─── SEARCH BAR ─── */
.search-bar { position: relative; margin-bottom: 12px; }
.search-bar__icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 14px; }
.search-bar__input { width: 100%; max-width: 100%; padding: 9px 14px 9px 34px; border: 1.5px solid var(--border); border-radius: 20px; font-size: 13px; font-family: inherit; background: var(--white); transition: border var(--trans); }
@media (min-width: 640px) { .search-bar__input { max-width: 360px; } }
.search-bar__input:focus { outline: none; border-color: var(--rose); }

/* ─── TABLA ─── */
.tabla-wrap { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; overflow-x: auto; }
.tabla { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 300px; }
.tabla th { padding: 10px 12px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--mid); background: #FAF5F3; text-align: left; border-bottom: 1px solid var(--border); font-weight: 500; }
.tabla td { padding: 10px 12px; border-bottom: 1px solid #F5EDE9; vertical-align: middle; }
.tabla tr:last-child td { border-bottom: none; }
.tabla tr:hover td { background: #FDFAF9; }
.tabla__empty { text-align: center; color: var(--mid); font-style: italic; padding: 30px; }
.td-mid { color: var(--mid); }

/* Columnas que se ocultan en pantallas chicas */
@media (max-width: 640px) { .hide-sm { display: none; } }
@media (max-width: 480px) { .hide-xs { display: none; } }
@media (min-width: 641px) { .hide-md { display: none; } }

.tabla-prod { display: flex; align-items: center; gap: 8px; }
.tabla-prod__img    { width: 36px; height: 36px; border-radius: var(--radius-sm); object-fit: cover; background: var(--rose-light); flex-shrink: 0; }
.tabla-prod__nombre { font-weight: 500; font-size: 12px; }
.tabla-prod__meta   { display: block; font-size: 11px; color: var(--mid); margin-top: 2px; }

.stock-badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
.stock-badge--verde   { background: #E8F5E8; color: #2E7D32; }
.stock-badge--naranja { background: #FFF3E0; color: #E65100; }
.stock-badge--rojo    { background: #FEEBEE; color: #C62828; }

.estado-pill { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 500; }
.estado-pill--on  { background: #E8F5E8; color: #2E7D32; }
.estado-pill--off { background: #FEEBEE; color: #C62828; }

.acciones { display: flex; gap: 4px; }
.accion-btn { width: 28px; height: 28px; border: 1px solid var(--border); background: var(--white); border-radius: var(--radius-sm); cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; transition: all var(--trans); }
.accion-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.accion-btn:hover:not(:disabled) { transform: scale(1.1); }
.accion-btn--edit:hover { background: #E3F2FD; border-color: #1565C0; }
.accion-btn--del:hover { background: #FEEBEE; border-color: #C62828; }

/* ─── FORMULARIO ─── */
.form-card { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; }
.form-card__title { font-size: 13px; font-weight: 600; color: var(--mid); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px; }
.form-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
@media (min-width: 540px) { .form-grid { grid-template-columns: 1fr 1fr; } }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group--full { grid-column: 1 / -1; }
.form-group label { font-size: 11px; font-weight: 600; color: var(--mid); text-transform: uppercase; letter-spacing: 0.5px; }
.form-group input, .form-group select { padding: 9px 12px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; font-family: inherit; color: var(--charcoal); transition: border var(--trans); }
.form-group input:focus, .form-group select:focus { outline: none; border-color: var(--rose); }
.form-hint { font-size: 11px; color: var(--mid); font-style: italic; }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }

.upload-zone { border: 2px dashed var(--border); border-radius: var(--radius); min-height: 140px; display: flex; align-items: center; justify-content: center; cursor: pointer; background: #FEF9F7; transition: all var(--trans); overflow: hidden; }
.upload-zone:hover { border-color: var(--rose); background: var(--rose-light); }
.upload-zone__input { display: none; }
.upload-zone__placeholder { text-align: center; color: var(--mid); }
.upload-zone__placeholder span { font-size: 28px; display: block; margin-bottom: 6px; }
.upload-zone__placeholder p { font-size: 13px; margin-bottom: 4px; }
.upload-zone__placeholder small { font-size: 11px; }
.upload-zone__preview { width: 100%; max-height: 180px; object-fit: contain; }

/* ─── CATEGORÍAS ─── */
.cat-nueva {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}
.cat-nueva input {
  flex: 1;
  min-width: 140px;
  padding: 9px 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-family: inherit;
}
.cat-nueva input:focus { outline: none; border-color: var(--rose); }
.cat-emoji-select {
  padding: 9px 10px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-family: inherit;
  background: var(--white);
  cursor: pointer;
  min-width: 130px;
}
.cat-emoji-select:focus { outline: none; border-color: var(--rose); }
.cat-preview {
  font-size: 12px;
  color: var(--mid);
  margin-top: 10px;
}
.cat-preview strong {
  color: var(--charcoal);
  font-size: 14px;
}

/* ─── INFO CARD ─── */
.info-card { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; font-size: 14px; line-height: 1.6; color: var(--mid); }

/* ─── BOTONES ─── */
.btn-primary { padding: 9px 16px; background: var(--rose); color: white; border: none; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: background var(--trans); white-space: nowrap; }
.btn-primary:hover:not(:disabled) { background: var(--rose-dark); }
.btn-primary:disabled { background: #ccc; cursor: not-allowed; }
.btn-ghost { padding: 9px 16px; background: var(--white); color: var(--mid); border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; cursor: pointer; font-family: inherit; transition: all var(--trans); white-space: nowrap; }
.btn-ghost:hover { border-color: var(--rose); color: var(--rose); }
.toggle-btn {
  width: 32px;
  height: 32px;
  border: 1.5px solid var(--border);
  background: var(--white);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--trans);
}
.toggle-btn:hover {
  transform: scale(1.1);
  border-color: var(--rose);
}
.toggle-btn--active {
  background: #E8F5E8;
  border-color: #2E7D32;
  color: #2E7D32;
}
/* ─── BANNERS ─── */
.banners-lista { display: flex; flex-direction: column; gap: 8px; }
.banner-item { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); display: flex; align-items: center; gap: 12px; padding: 10px 12px; transition: border-color var(--trans); }
.banner-item:hover { border-color: var(--rose); }
.banner-item__preview { width: 60px; height: 40px; border-radius: var(--radius-sm); flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.banner-item__emoji { font-size: 20px; opacity: 0.8; }
.banner-item__info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.banner-item__titulo { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.banner-item__sub { font-size: 11px; color: var(--mid); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.banner-item__cat { font-size: 10px; color: var(--rose); font-weight: 500; }
.banner-item__acciones { display: flex; gap: 4px; flex-shrink: 0; }

.gradientes-grid { display: flex; gap: 8px; flex-wrap: wrap; }
.gradiente-chip { width: 70px; height: 36px; border-radius: var(--radius-sm); cursor: pointer; display: flex; align-items: flex-end; padding: 4px 6px; border: 2px solid transparent; transition: all var(--trans); }
.gradiente-chip--active { border-color: white; box-shadow: 0 0 0 2px var(--rose); }
.gradiente-chip__label { font-size: 10px; color: white; font-weight: 500; }

.banner-preview { height: 90px; border-radius: var(--radius); display: flex; align-items: center; padding: 0 16px; position: relative; overflow: hidden; }
.banner-preview__content { color: white; }
.banner-preview__eyebrow { font-size: 8px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.7; display: block; margin-bottom: 3px; }
.banner-preview__titulo { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
.banner-preview__sub{ font-size: 10px; opacity: 0.8; margin-bottom: 6px; }
.banner-preview__btn { font-size: 9px; border: 1px solid rgba(255,255,255,0.7); padding: 2px 8px; border-radius: 10px; }
.banner-preview__deco{ position: absolute; right: 12px; bottom: 6px; font-size: 40px; opacity: 0.2; }

/* ─── TOAST ─── */
.toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: var(--charcoal); color: white; padding: 10px 20px; border-radius: 50px; font-size: 13px; z-index: 999; white-space: nowrap; box-shadow: 0 4px 16px rgba(0,0,0,0.2); pointer-events: none; }
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(10px); }

/* ─── ANIMACIONES ─── */
.fade-in { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

</style>