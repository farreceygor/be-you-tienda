<template>
  <div class="tienda">

    <!-- ═══════════════════════════════════════════
         NAVBAR
    ═══════════════════════════════════════════ -->
    <header class="navbar" :class="{ 'navbar--scrolled': scrolled }">
      <div class="navbar__inner">

        <!-- Logo -->
        <router-link to="/" class="navbar__logo">
          <img
            src="https://abhcuuyqxyjmunfaosah.supabase.co/storage/v1/object/public/public-assets/logo.jpeg"
            alt="Be You"
            class="navbar__logo-img"
          />
          <div class="navbar__logo-text">
            <span class="navbar__logo-name">Be You Tienda</span>
            <span class="navbar__logo-sub">Maquillaje & Accesorios</span>
          </div>
        </router-link>

        <!-- Barra de búsqueda -->
        <div class="search" ref="searchRef">
          <span class="search__icon">🔍</span>
          <input
            v-model="busqueda"
            type="text"
            class="search__input"
            placeholder="Buscar productos..."
            autocomplete="off"
            @focus="searchFocused = true"
            @blur="onSearchBlur"
            @input="onSearchInput"
          />
          <button v-if="busqueda" class="search__clear" @click="limpiarBusqueda">✕</button>

          <!-- Dropdown de sugerencias -->
          <div v-if="searchFocused && sugerencias.length > 0" class="search__dropdown">
            <div
              v-for="p in sugerencias"
              :key="p.id"
              class="search__item"
              @mousedown.prevent="seleccionarSugerencia(p)"
            >
              <img :src="p.imagen_url" :alt="p.nombre" class="search__item-img" />
              <div class="search__item-info">
                <span class="search__item-name">{{ p.nombre }}</span>
                <span class="search__item-price">${{ p.precio.toLocaleString('es-AR') }}</span>
              </div>
              <span class="search__item-add">+ agregar</span>
            </div>
          </div>
        </div>

        <!-- Botón carrito -->
        <button class="cart-btn" @click="carritoAbierto = true">
          <span class="cart-btn__icon">🛒</span>
          <span class="cart-btn__label">Pedido</span>
          <span class="cart-btn__badge" :class="{ 'cart-btn__badge--visible': totalItems > 0 }">
            {{ totalItems }}
          </span>
        </button>

      </div>
    </header>

<!-- BANNER CARRUSEL -->
<section class="banner" @mouseenter="pausarBanner" @mouseleave="reanudarBanner">
  <div
    class="banner__track"
    :style="{ transform: `translateX(-${bannerActual * 100}%)` }"
  >
    <div
      v-for="(slide, i) in bannerSlides"
      :key="i"
      class="banner__slide"
      :style="{ background: slide.gradiente }"
    >
      <div class="banner__content">
        <span class="banner__eyebrow">{{ slide.eyebrow }}</span>
        <h2 class="banner__title" v-html="slide.titulo"></h2>
        <p class="banner__sub">{{ slide.subtitulo }}</p>
        <button class="banner__btn" @click="filterCat(slide.cta_cat)">
          {{ slide.cta_texto }}
        </button>
      </div>
      <div class="banner__deco">
        <span style="font-size:80px; opacity:.15; position:absolute; right:24px; bottom:10px;">
          {{ slide.emoji_deco }}
        </span>
      </div>
    </div>
  </div>

  <!-- Flechas -->
  <button class="banner__arr banner__arr--l" @click="moverBanner(-1)">‹</button>
  <button class="banner__arr banner__arr--r" @click="moverBanner(1)">›</button>

  <!-- Dots -->
  <div class="banner__dots">
    <button
      v-for="(_, i) in bannerSlides"
      :key="i"
      class="banner__dot"
      :class="{ 'banner__dot--active': bannerActual === i }"
      @click="irBanner(i)"
    />
  </div>
</section>

    <!-- ═══════════════════════════════════════════
         FILTROS DE CATEGORÍA
    ═══════════════════════════════════════════ -->
    <section class="cats">
      <div class="cats__row">
        <button
          v-for="cat in categoriasConTodos"
          :key="cat.id"
          class="cats__chip"
          :class="{ 'cats__chip--active': categoriaActiva === cat.nombre }"
          @click="filterCat(cat.nombre)"
        >
          {{ cat.emoji }} {{ cat.nombre.charAt(0).toUpperCase() + cat.nombre.slice(1) }}
        </button>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         GRILLA DE PRODUCTOS
    ═══════════════════════════════════════════ -->
    <main class="catalogo">

      <!-- Título dinámico -->
      <div class="catalogo__header">
        <h2 class="catalogo__titulo">
          <template v-if="busqueda">
            Resultados para "<strong>{{ busqueda }}</strong>"
          </template>
          <template v-else-if="categoriaActiva === 'todos'">
            Nuestro Catálogo 💫 
          </template>
          <template v-else>
            {{ categoriaActiva.charAt(0).toUpperCase() + categoriaActiva.slice(1) }} ✦
          </template>
        </h2>
        <span class="catalogo__count">{{ productosFiltrados.length }} productos</span>
      </div>

      <!-- Loading -->
      <div v-if="cargando" class="estado-carga">
        <div class="spinner"></div>
        <p>Cargando productos...</p>
      </div>
      <!-- Error de carga -->
      <div v-else-if="error" class="estado-vacio">
        <span class="estado-vacio__icon">❌</span>
        <p>{{ error }}</p>
        <button class="btn-link" @click="cargarDatos">Reintentar</button>
      </div>

      <!-- Sin resultados -->
      <div v-else-if="productosFiltrados.length === 0" class="estado-vacio">
        <span class="estado-vacio__icon">😕</span>
        <p>No encontramos productos para "<strong>{{ busqueda }}</strong>"</p>
        <button class="btn-link" @click="limpiarBusqueda">Ver todos los productos</button>
      </div>

      <!-- Grilla -->
      <div v-else class="prod-grid">
        <div
          v-for="p in productosFiltrados"
          :key="p.id"
          class="prod-card"
          :class="{ 'prod-card--agotado': p.stock <= 0 }"
        >
          <!-- Badge de stock -->
          <div v-if="p.stock > 0 && p.stock <= 3" class="prod-card__badge prod-card__badge--poco">
            {{ p.stock === 1 ? '¡Última unidad!' : `Últimas ${p.stock}` }}
          </div>
          <div v-else-if="p.stock <= 0" class="prod-card__badge prod-card__badge--agotado">
            Sin stock
          </div>

          <!-- Imagen -->
          <div class="prod-card__img-wrap" @click="abrirVisor(p)">
            <img :src="p.imagen_url" :alt="p.nombre" class="prod-card__img" loading="lazy" />
            <div class="prod-card__zoom">🔍</div>
          </div>

          <!-- Info -->
          <div class="prod-card__body">
            <h3 class="prod-card__nombre">{{ p.nombre }}</h3>
            <p class="prod-card__precio">${{ p.precio.toLocaleString('es-AR') }}</p>

            <!-- Selector de variantes -->
            <div v-if="p.variantes && p.variantes.trim() !== ''" class="prod-card__variantes">
              <label class="prod-card__variantes-label">Elegir variante:</label>
              <select
                v-model="variantesSeleccionadas[p.id]"
                class="prod-card__select"
              >
                <option value="" disabled>Seleccionar...</option>
                <option
                  v-for="v in p.variantes.split(',').map(x => x.trim()).filter(Boolean)"
                  :key="v"
                  :value="v"
                >{{ v }}</option>
              </select>
            </div>

            <!-- Botón agregar -->
            <button
              class="prod-card__btn"
              :class="{ 'prod-card__btn--disabled': p.stock <= 0 }"
              :disabled="p.stock <= 0"
              @click="agregarAlCarrito(p, variantesSeleccionadas[p.id] || null)"
            >
              {{ p.stock > 0 ? 'Agregar al pedido' : 'Sin stock' }}
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- ═══════════════════════════════════════════
         FOOTER
    ═══════════════════════════════════════════ -->
    <footer class="footer">
      <div class="footer__grid">

        <div class="footer__brand">
          <img
            src="https://abhcuuyqxyjmunfaosah.supabase.co/storage/v1/object/public/public-assets/logo.jpeg"
            alt="Be You"
            class="footer__logo"
          />
          <p class="footer__desc">
            Tu tienda de belleza en San Rafael. Maquillaje, perfumes y accesorios seleccionados con amor.
          </p>
          <div class="footer__social">
            <a
              href="https://www.instagram.com/beyou_sanra"
              target="_blank"
              class="footer__social-btn"
              aria-label="Instagram"
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.003 1.444c2.134 0 2.387.008 3.23.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.844.047 1.097.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.282.11-.705.24-1.485.276-.844.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/>
              </svg>
              @beyou_sanra
            </a>
          </div>
        </div>

        <div>
          <h4 class="footer__heading">Categorías</h4>
          <button
            v-for="cat in categorias"
            :key="cat.id"
            class="footer__link"
            @click="filterCat(cat.nombre)"
          >
            {{ cat.nombre.charAt(0).toUpperCase() + cat.nombre.slice(1) }}
          </button>
        </div>

        <div>
          <h4 class="footer__heading">Cómo comprar</h4>
          <span class="footer__step">✨ Elegí lo que ames</span>
          <span class="footer__step">🛒 Armá tu pedido</span>
          <span class="footer__step">📱 Confirmalo por WhatsApp</span>
          <span class="footer__step">📦 Retirá en San Rafael</span>

          <h4 class="footer__heading" style="margin-top: 20px;">Medios de pago</h4>
          <div class="footer__pay">
            <span class="footer__pay-badge">Efectivo</span>
            <span class="footer__pay-badge">Transferencia</span>
            <span class="footer__pay-badge">Mercado Pago</span>
          </div>
        </div>

      </div>

      <div class="footer__bottom">
        <span>© 2025 Be You · San Rafael, Mendoza</span>
        <span>Todos los derechos reservados</span>
      </div>
    </footer>

    <!-- ═══════════════════════════════════════════
         CARRITO DRAWER
    ═══════════════════════════════════════════ -->
    <transition name="fade">
      <div
        v-if="carritoAbierto"
        class="cart-overlay"
        @click="carritoAbierto = false"
      />
    </transition>

    <transition name="slide-right">
      <div v-if="carritoAbierto" class="cart-drawer">

        <div class="cart-drawer__head">
          <h2 class="cart-drawer__title">Tu pedido 🛒</h2>
          <button class="cart-drawer__close" @click="carritoAbierto = false">✕</button>
        </div>

        <div class="cart-drawer__items">
          <div v-if="Object.keys(carrito).length === 0" class="cart-empty">
            <span class="cart-empty__icon">🛍️</span>
            <p>Tu carrito está vacío</p>
            <small>Agregá productos para hacer tu pedido</small>
          </div>

          <div
            v-for="(item, id) in carrito"
            :key="id"
            class="cart-item"
          >
            <div class="cart-item__emoji">
              <img :src="buscarImagen(item.idOriginal)" :alt="item.nombre" class="cart-item__img" />
            </div>
            <div class="cart-item__info">
              <p class="cart-item__nombre">{{ item.nombre }}</p>
              <p class="cart-item__precio">${{ (item.precio * item.cantidad).toLocaleString('es-AR') }}</p>
              <div class="cart-item__qty">
                <button class="qty-btn" @click="cambiarCantidad(id, -1)">−</button>
                <span class="qty-num">{{ item.cantidad }}</span>
                <button
                  class="qty-btn"
                  :disabled="item.cantidad >= buscarStock(id)"
                  @click="cambiarCantidad(id, 1)"
                >+</button>
              </div>
            </div>
            <button class="cart-item__remove" @click="quitarDelCarrito(id)">✕</button>
          </div>
        </div>

        <div v-if="Object.keys(carrito).length > 0" class="cart-drawer__foot">
          <div class="cart-total">
            <span>Total del pedido</span>
            <strong>${{ totalDinero.toLocaleString('es-AR') }}</strong>
          </div>
          <button class="btn-whatsapp" @click="enviarPedido">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.06 3.973L0 16l4.104-1.076a7.864 7.864 0 0 0 3.89 1.028h.005c4.368 0 7.926-3.559 7.93-7.93a7.852 7.852 0 0 0-2.328-5.596z"/>
            </svg>
            Confirmar pedido por WhatsApp
          </button>
          <button class="btn-vaciar" @click="vaciarCarrito">Vaciar carrito</button>
        </div>

      </div>
    </transition>

    <!-- ═══════════════════════════════════════════
         VISOR DE IMAGEN
    ═══════════════════════════════════════════ -->
    <transition name="fade">
      <div v-if="visor.show" class="visor" @click="visor.show = false">
        <button class="visor__close">✕</button>
        <img :src="visor.src" :alt="visor.alt" class="visor__img" @click.stop />
      </div>
    </transition>

    <!-- ═══════════════════════════════════════════
         WHATSAPP FLOTANTE
    ═══════════════════════════════════════════ -->
    <a
      href="https://wa.me/5492604019865?text=✨%20¡Hola!%20Vi%20tu%20catálogo%20y%20me%20encantaron%20tus%20productos.%20¿Me%20podés%20dar%20más%20info?"
      target="_blank"
      class="wa-float"
      aria-label="Contactar por WhatsApp"
    >
      <svg width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
        <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.06 3.973L0 16l4.104-1.076a7.864 7.864 0 0 0 3.89 1.028h.005c4.368 0 7.926-3.559 7.93-7.93a7.852 7.852 0 0 0-2.328-5.596zM7.994 14.52a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
      </svg>
    </a>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast.show" class="toast">{{ toast.msg }}</div>
    </transition>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useCarrito } from '../composables/useCarrito'
import { useProductos } from '../composables/useProductos'
import { fetchProductos, fetchCategorias, fetchBanners } from '../services/productoService'

// ─── ESTADO UI ───────────────────────────────────────────────────
const scrolled       = ref(false)
const carritoAbierto = ref(false)
const searchFocused  = ref(false)
const variantesSeleccionadas = reactive({})

// ─── PRODUCTOS Y FILTROS (va primero porque carrito lo necesita) ──
const {
  productos,
  categorias,
  cargando,
  error,
  busqueda,
  categoriaActiva,
  categoriasConTodos,
  productosFiltrados,
  sugerencias,
  filterCat: _filterCat,
  limpiarBusqueda,
  onSearchInput,
  cargarDatos
} = useProductos()

// Wrapper — cierra dropdown y hace scroll además de filtrar
function filterCat(nombre) {
  _filterCat(nombre)
  searchFocused.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onSearchBlur() {
  setTimeout(() => { searchFocused.value = false }, 200)
}

function seleccionarSugerencia(p) {
  agregarAlCarrito(p, null)
  busqueda.value = ''
  searchFocused.value = false
}

// ─── CARRITO (va después porque recibe productos) ─────────────────
const {
  carrito,
  totalItems,
  totalDinero,
  buscarStock,
  buscarImagen,
  agregarAlCarrito: _agregarAlCarrito,
  cambiarCantidad: _cambiarCantidad,
  quitarDelCarrito,
  vaciarCarrito: _vaciarCarrito,
  armarMensajeWhatsApp
} = useCarrito(productos)

// Wrappers que manejan el toast desde la vista
function agregarAlCarrito(p, varianteElegida = null) {
  const { error } = _agregarAlCarrito(p, varianteElegida)
  if (error) mostrarToast(error)
  else mostrarToast(`✅ ${varianteElegida || p.nombre} añadido`)
}

function cambiarCantidad(id, delta) {
  const { error } = _cambiarCantidad(id, delta)
  if (error) mostrarToast(error)
}

function vaciarCarrito() {
  if (!confirm('¿Vaciar todo el pedido?')) return
  _vaciarCarrito()
  carritoAbierto.value = false
}

function enviarPedido() {
  if (totalItems.value === 0) return
  const msg = armarMensajeWhatsApp()
  window.open(`https://wa.me/5492604019865?text=${encodeURIComponent(msg)}`, '_blank')
}

// ─── BANNER ──────────────────────────────────────────────────────
const bannerActual = ref(0)
const bannerSlides = ref([])  // ← ahora viene de Supabase, no hardcodeado
let bannerTimer = null

function moverBanner(dir) {
  if (bannerSlides.value.length === 0) return
  bannerActual.value = (bannerActual.value + dir + bannerSlides.value.length) % bannerSlides.value.length
}
function irBanner(n)    { bannerActual.value = n }
function pausarBanner() { clearInterval(bannerTimer) }
function reanudarBanner() {
  if (bannerSlides.value.length === 0) return
  bannerTimer = setInterval(() => moverBanner(1), 4500)
}

// ─── VISOR DE IMAGEN ─────────────────────────────────────────────
const visor = reactive({ show: false, src: '', alt: '' })
function abrirVisor(p) {
  visor.src = p.imagen_url
  visor.alt = p.nombre
  visor.show = true
}

// ─── TOAST ───────────────────────────────────────────────────────
const toast = reactive({ show: false, msg: '' })
let toastTimer = null
function mostrarToast(msg) {
  clearTimeout(toastTimer)
  toast.msg  = msg
  toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 2400)
}

// ─── SCROLL ──────────────────────────────────────────────────────
function onScroll() { scrolled.value = window.scrollY > 10 }

// ─── CICLO DE VIDA ───────────────────────────────────────────────
onMounted(async () => {
  window.addEventListener('scroll', onScroll)

  try {
    // Cargamos banners y productos en paralelo
    const [slides] = await Promise.all([
      fetchBanners(),
      cargarDatos()
    ])
    bannerSlides.value = slides
  } catch (e) {
    console.error('Error al inicializar:', e)
  }

  // Arrancamos el banner después de tener los datos
  reanudarBanner()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  clearInterval(bannerTimer)
  clearTimeout(toastTimer)
})
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════
   VARIABLES
═══════════════════════════════════════════════════════════ */
.tienda {
  --rose:       #C9748A;
  --rose-light: #F7E8ED;
  --rose-dark:  #8B4A5C;
  --gold:       #C9A96E;
  --gold-light: #F5EDD8;
  --cream:      #FFFAF9;
  --charcoal:   #2D2D2D;
  --mid:        #6B6B6B;
  --border:     #EDE4E1;
  --white:      #FFFFFF;
  --radius:     12px;
  --radius-sm:  8px;
  --trans:      0.22s ease;

  background: var(--cream);
  color: var(--charcoal);
  font-family: 'Poppins', system-ui, sans-serif;
  min-height: 100vh;
}

/* ═══ NAVBAR ═══ */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 250, 249, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid transparent;
  transition: border-color var(--trans), box-shadow var(--trans);
}
.navbar--scrolled {
  border-bottom-color: var(--border);
  box-shadow: 0 2px 16px rgba(201, 116, 138, 0.08);
}
.navbar__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.navbar__logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  flex-shrink: 0;
}
.navbar__logo-img {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--rose-light);
}
.navbar__logo-name {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.1rem;
  color: var(--rose-dark);
  font-weight: 800;
  display: block;
  line-height: 1;
}
.navbar__logo-sub {
  font-size: 0.5rem;
  color: var(--mid);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  display: block;
}
/* Ocultamos el subtítulo en móvil para ganar espacio */
@media (max-width: 480px) {
  .navbar__logo-sub { display: none; }
  .navbar__logo-name { font-size: 1rem; }
  .navbar__logo-img { width: 32px; height: 32px; }
}

/* ─── BARRA DE BÚSQUEDA ─── */
.search {
  flex: 1;
  position: relative;
  /* En desktop limitamos el ancho, en móvil ocupa todo */
  max-width: 400px;
  margin: 0 auto;
}
@media (max-width: 480px) {
  .search { max-width: 100%; margin: 0; }
}
.search__icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
  pointer-events: none;
}
.search__input {
  width: 100%;
  padding: 8px 32px 8px 32px;
  border: 1.5px solid var(--border);
  border-radius: 50px;
  font-size: 13px;
  background: var(--cream);
  color: var(--charcoal);
  font-family: inherit;
  transition: all var(--trans);
}
.search__input:focus {
  outline: none;
  border-color: var(--rose);
  background: var(--white);
  box-shadow: 0 0 0 3px rgba(201, 116, 138, 0.12);
}
.search__clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--mid);
  cursor: pointer;
  font-size: 12px;
  padding: 2px;
}
.search__dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  z-index: 200;
  overflow: hidden;
}
.search__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 1px solid #F5EDE9;
  transition: background var(--trans);
}
.search__item:last-child { border-bottom: none; }
.search__item:hover { background: var(--rose-light); }
.search__item-img {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  background: var(--rose-light);
  flex-shrink: 0;
}
.search__item-info { flex: 1; min-width: 0; }
.search__item-name {
  font-size: 12px;
  font-weight: 500;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.search__item-price { font-size: 11px; color: var(--rose-dark); font-weight: 600; }
.search__item-add { font-size: 11px; color: var(--rose); font-weight: 500; white-space: nowrap; }

/* ─── BOTÓN CARRITO ─── */
.cart-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: var(--rose-light);
  color: var(--rose-dark);
  border: none;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  transition: all var(--trans);
  flex-shrink: 0;
  font-family: inherit;
}
.cart-btn:hover { background: var(--rose); color: var(--white); }
/* En móvil ocultamos el texto "Pedido" */
@media (max-width: 480px) {
  .cart-btn__label { display: none; }
  .cart-btn { padding: 7px 10px; }
}
.cart-btn__badge {
  background: var(--rose-dark);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 50px;
  opacity: 0;
  transform: scale(0);
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.cart-btn__badge--visible { opacity: 1; transform: scale(1); }

/* ═══ BANNER ═══ */
.banner {
  position: relative;
  height: 200px;
  overflow: hidden;
}
@media (min-width: 640px)  { .banner { height: 240px; } }
@media (min-width: 1024px) { .banner { height: 300px; } }

.banner__track {
  display: flex;
  height: 100%;
  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}
.banner__slide {
  flex: 0 0 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 24px;
  position: relative;
  overflow: hidden;
}
@media (min-width: 640px) { .banner__slide { padding: 0 40px; } }

.banner__content { color: white; z-index: 1; max-width: 60%; }
@media (max-width: 480px) { .banner__content { max-width: 80%; } }

.banner__eyebrow {
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  opacity: 0.75;
  display: block;
  margin-bottom: 6px;
}
.banner__title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(18px, 4vw, 36px);
  line-height: 1.15;
  margin-bottom: 6px;
}
.banner__sub {
  font-size: clamp(11px, 2vw, 14px);
  opacity: 0.85;
  margin-bottom: 14px;
  /* En móvil ocultamos el subtítulo para no saturar */
  display: none;
}
@media (min-width: 480px) { .banner__sub { display: block; } }

.banner__btn {
  display: inline-block;
  padding: 7px 16px;
  border: 1.5px solid rgba(255,255,255,0.85);
  border-radius: 50px;
  font-size: 11px;
  color: white;
  background: none;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--trans);
}
.banner__btn:hover { background: rgba(255,255,255,0.2); }
.banner__deco { position: absolute; right: 0; bottom: 0; pointer-events: none; }
/* Emoji decorativo más chico en móvil */
@media (max-width: 480px) {
  .banner__deco span { font-size: 60px !important; }
}
.banner__arr {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.15);
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--trans);
  z-index: 2;
}
.banner__arr:hover { background: rgba(255,255,255,0.3); }
.banner__arr--l { left: 8px; }
.banner__arr--r { right: 8px; }
.banner__dots {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 2;
}
.banner__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.4);
  border: none;
  cursor: pointer;
  transition: all var(--trans);
  padding: 0;
}
.banner__dot--active {
  background: white;
  width: 18px;
  border-radius: 3px;
}

/* ═══════════════════════════════════════════════════════════
   CATEGORÍAS
═══════════════════════════════════════════════════════════ */
.cats {
  padding: 16px;
  background: var(--white);
  border-bottom: 1px solid var(--border);
}
.cats__row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.cats__row::-webkit-scrollbar { display: none; }
.cats__chip {
  flex-shrink: 0;
  padding: 7px 16px;
  border-radius: 50px;
  border: 1.5px solid var(--border);
  background: var(--white);
  color: var(--mid);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;
  transition: all var(--trans);
}
.cats__chip:hover {
  background: var(--rose-light);
  color: var(--rose-dark);
  border-color: var(--rose);
}
.cats__chip--active {
  background: var(--rose);
  color: white;
  border-color: var(--rose);
  box-shadow: 0 4px 12px rgba(201, 116, 138, 0.3);
}

/* ═══════════════════════════════════════════════════════════
   CATÁLOGO
═══════════════════════════════════════════════════════════ */
.catalogo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 16px 40px;
}
.catalogo__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 16px;
}
.catalogo__titulo {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.4rem;
  color: var(--rose);
}
.catalogo__count {
  font-size: 12px;
  color: var(--mid);
}

/* ─── ESTADOS ─── */
.estado-carga {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
  gap: 14px;
  color: var(--mid);
  font-size: 14px;
}
.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--rose-light);
  border-top-color: var(--rose);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.estado-vacio {
  text-align: center;
  padding: 60px 20px;
  color: var(--mid);
}
.estado-vacio__icon { font-size: 40px; display: block; margin-bottom: 12px; }
.btn-link {
  background: none;
  border: none;
  color: var(--rose);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  margin-top: 8px;
  text-decoration: underline;
}

/* ─── GRILLA ─── */
.prod-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
@media (min-width: 540px)  { .prod-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 768px)  { .prod-grid { grid-template-columns: repeat(4, 1fr); } }
@media (min-width: 1024px) { .prod-grid { grid-template-columns: repeat(5, 1fr); } }

/* ─── TARJETA ─── */
.prod-card {
  background: var(--white);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all var(--trans);
}
.prod-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(201, 116, 138, 0.15);
  border-color: var(--rose);
}
.prod-card--agotado { opacity: 0.6; }

.prod-card__badge {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 50px;
  z-index: 1;
  text-transform: uppercase;
  animation: pulse 2s ease infinite;
}
.prod-card__badge--poco { background: var(--rose); color: white; }
.prod-card__badge--agotado { background: #6b6b6b; color: white; animation: none; }
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }

.prod-card__img-wrap {
  position: relative;
  height: 160px;
  background: var(--rose-light);
  overflow: hidden;
  cursor: zoom-in;
}
.prod-card__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.4s ease;
}
.prod-card:hover .prod-card__img { transform: scale(1.06); }
.prod-card__zoom {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  opacity: 0;
  transition: all var(--trans);
}
.prod-card:hover .prod-card__zoom {
  background: rgba(0,0,0,0.08);
  opacity: 1;
}

.prod-card__body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.prod-card__nombre {
  font-size: 13px;
  font-weight: 600;
  color: var(--charcoal);
  line-height: 1.3;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.prod-card__precio {
  font-size: 16px;
  font-weight: 700;
  color: var(--rose-dark);
  margin-bottom: 10px;
}

.prod-card__variantes { margin-bottom: 10px; }
.prod-card__variantes-label {
  display: block;
  font-size: 10px;
  font-weight: 600;
  color: var(--mid);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}
.prod-card__select {
  width: 100%;
  padding: 6px 8px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--charcoal);
  background: var(--white);
  font-family: inherit;
  cursor: pointer;
}
.prod-card__select:focus { outline: none; border-color: var(--rose); }

.prod-card__btn {
  margin-top: auto;
  width: 100%;
  padding: 10px;
  background: var(--rose);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--trans);
}
.prod-card__btn:hover { background: var(--rose-dark); transform: scale(1.01); }
.prod-card__btn--disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}
.prod-card__btn--disabled:hover { transform: none; }

/* ═══ FOOTER ═══ */
.footer {
  background: var(--charcoal);
  color: rgba(255,255,255,0.65);
  margin-top: 40px;
}
.footer__grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  padding: 28px 20px 20px;
}
@media (min-width: 640px)  { .footer__grid { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1024px) { .footer__grid { grid-template-columns: 1.5fr 1fr 1fr; } }

.footer__logo {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255,255,255,0.1);
  margin-bottom: 12px;
}
.footer__desc { font-size: 12px; line-height: 1.7; margin-bottom: 16px; }
.footer__social { display: flex; gap: 10px; }
.footer__social-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(255,255,255,0.65);
  font-size: 12px;
  text-decoration: none;
  transition: color var(--trans);
}
.footer__social-btn:hover { color: var(--rose); }
.footer__heading {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: white;
  font-weight: 500;
  margin-bottom: 12px;
}
.footer__link {
  display: block;
  background: none;
  border: none;
  color: rgba(255,255,255,0.55);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  padding: 0;
  margin-bottom: 8px;
  text-align: left;
  transition: color var(--trans);
}
.footer__link:hover { color: var(--gold); }
.footer__step { display: block; font-size: 12px; margin-bottom: 7px; line-height: 1.5; }
.footer__pay { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px; }
.footer__pay-badge {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 11px;
}
.footer__bottom {
  border-top: 1px solid rgba(255,255,255,0.08);
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 11px;
  color: rgba(255,255,255,0.3);
}

/* ═══ CARRITO DRAWER ═══ */
.cart-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 300;
  backdrop-filter: blur(3px);
}
.cart-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  /* En desktop 320px, en móvil ocupa toda la pantalla */
  width: 320px;
  background: var(--white);
  z-index: 301;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 32px rgba(0,0,0,0.12);
}
@media (max-width: 400px) {
  .cart-drawer { width: 100%; }
}
.cart-drawer__head {
  padding: 18px 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.cart-drawer__title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.1rem;
  color: var(--charcoal);
}
.cart-drawer__close {
  background: none;
  border: none;
  font-size: 18px;
  color: var(--mid);
  cursor: pointer;
  padding: 4px;
  transition: color var(--trans);
}
.cart-drawer__close:hover { color: var(--rose); }
.cart-drawer__items {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
}
.cart-empty {
  text-align: center;
  padding: 50px 20px;
  color: var(--mid);
}
.cart-empty__icon { font-size: 40px; display: block; margin-bottom: 10px; }
.cart-empty p { font-size: 14px; font-weight: 500; }
.cart-empty small { font-size: 12px; }
.cart-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #F5EDE9;
}
.cart-item:last-child { border-bottom: none; }
.cart-item__img {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  background: var(--rose-light);
  flex-shrink: 0;
}
.cart-item__info { flex: 1; }
.cart-item__nombre { font-size: 12px; font-weight: 500; line-height: 1.3; margin-bottom: 2px; }
.cart-item__precio { font-size: 13px; color: var(--rose-dark); font-weight: 700; }
.cart-item__qty {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
}
.qty-btn {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--rose-light);
  color: var(--rose-dark);
  border: none;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--trans);
}
.qty-btn:hover:not(:disabled) { background: var(--rose); color: white; }
.qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.qty-num { font-size: 13px; font-weight: 600; min-width: 18px; text-align: center; }
.cart-item__remove {
  background: none;
  border: none;
  color: #ddd;
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  transition: color var(--trans);
}
.cart-item__remove:hover { color: var(--rose); }
.cart-drawer__foot {
  padding: 14px 16px;
  border-top: 1px solid var(--border);
}
.cart-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: var(--mid);
}
.cart-total strong {
  font-size: 20px;
  font-weight: 700;
  color: var(--charcoal);
}
.btn-whatsapp {
  width: 100%;
  padding: 13px;
  background: #25D366;
  color: white;
  border: none;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  transition: background var(--trans);
}
.btn-whatsapp:hover { background: #1DAF56; }
.btn-vaciar {
  display: block;
  width: 100%;
  background: none;
  border: none;
  color: var(--mid);
  font-size: 12px;
  text-align: center;
  margin-top: 8px;
  cursor: pointer;
  font-family: inherit;
  transition: color var(--trans);
}
.btn-vaciar:hover { color: var(--rose); }

/* ═══════════════════════════════════════════════════════════
   VISOR DE IMAGEN
═══════════════════════════════════════════════════════════ */
.visor {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.88);
  z-index: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(6px);
  cursor: zoom-out;
}
.visor__close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255,255,255,0.15);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.visor__img {
  max-width: 90%;
  max-height: 85vh;
  border-radius: var(--radius);
  object-fit: contain;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

/* ═══════════════════════════════════════════════════════════
   WHATSAPP FLOTANTE
═══════════════════════════════════════════════════════════ */
.wa-float {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  background: #25D366;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
  z-index: 200;
  transition: transform var(--trans), box-shadow var(--trans);
  text-decoration: none;
}
.wa-float:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 28px rgba(37, 211, 102, 0.5);
}

/* ═══════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════ */
.toast {
  position: fixed;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--charcoal);
  color: white;
  padding: 10px 20px;
  border-radius: 50px;
  font-size: 13px;
  z-index: 500;
  white-space: nowrap;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  pointer-events: none;
}

/* ═══════════════════════════════════════════════════════════
   TRANSICIONES DE VUE
═══════════════════════════════════════════════════════════ */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-right-enter-active, .slide-right-leave-active {
  transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-right-enter-from, .slide-right-leave-to { transform: translateX(100%); }

.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(10px); }
</style>