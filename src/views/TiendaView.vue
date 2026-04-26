<template>
  <div>
    <AdminPanel v-if="esAdmin" />

    <div v-else class="flex flex-col min-h-screen bg-[#fcfcfc] font-['Poppins']">
      
      <NavBar :cantidad="totalItems" @open-cart="showCart = true" />

      <main class="flex-grow">
        <section class="hero-banner">
          <div class="hero-content">
            <h1>Resaltá tu brillo propio</h1>
            <p>Maquillaje y accesorios seleccionados para vos ✨</p>
            <div class="hero-badge">Envíos en San Rafael</div>
          </div>
        </section>

        <h2 class="section-title">Nuestro Catálogo</h2>

        <section class="container mx-auto px-4 mt-4">
          <div class="search-wrapper mb-6">
            <input 
              v-model="búsqueda" 
              type="text" 
              placeholder="¿Qué estás buscando hoy? ✨"
              class="search-input w-full p-3 rounded-lg border shadow-sm"
            />
          </div>

          <div class="categories-nav flex gap-3 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory px-4">
            <button 
  v-for="cat in categorias" 
  :key="cat.id"
  @click="seleccionarCategoria($event, cat)"
  :class="[
    'btn-category whitespace-nowrap px-6 py-2 rounded-full border transition-all duration-300 flex-shrink-0 snap-start',
    categoriaSeleccionada === cat.nombre  // <--- CAMBIAR 'cat.id' POR 'cat.nombre'
      ? 'bg-red-500 text-white border-red-500 shadow-md scale-105' 
      : 'bg-white text-gray-600 border-gray-200 hover:border-red-200'
  ]"
>
  {{ cat.nombre.charAt(0).toUpperCase() + cat.nombre.slice(1) }}
</button>
          </div>
        </section>

        <div class="container mx-auto mt-6">
          <div v-if="cargando" class="flex flex-col items-center justify-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4"></div>
            <p class="text-pink-600 font-medium italic">Buscando lo mejor para vos...</p>
          </div>

          <div v-else>
            <ListaProductos 
              v-if="productosFiltrados.length > 0"
              :productos="productosFiltrados"
              @agregar="agregarAlCarrito" 
              @ver-imagen="abrirVisor"
            />
            
            <p v-else class="text-center py-20 text-gray-400 italic">
              No encontramos productos en esta sección. ✨
            </p>
          </div>
        </div>
      </main>

      <footer class="main-footer">
        <div class="footer-grid">
          <div>
            <h4 class="footer-heading">Be You Tienda</h4>
            <p class="footer-text">Nuestra misión es resaltar tu esencia única con productos seleccionados con amor.</p>
          </div>
          <div>
            <h4 class="footer-heading">Guía de Compra</h4>
            <ul class="footer-list">
              <li>✨ Elegí lo que ames</li>
              <li>📱 Confirmalo por WhatsApp</li>
              <li>📦 Retirá en San Rafael</li>
            </ul>
          </div>
          <div class="footer-col">
            <h4 class="footer-heading">Hablemos</h4>
            <p class="footer-text">📍 San Rafael, Mendoza</p>
            <a href="https://www.instagram.com/beyou_sanra" target="_blank" class="footer-link-social">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.003 1.444c2.134 0 2.387.008 3.23.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.844.047 1.097.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.282.11-.705.24-1.485.276-.844.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/>
              </svg>   
              <span>@beyou_sanra</span>
            </a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 Be You Tienda. Todos los derechos reservados.</p>
        </div>
      </footer>

      <div v-if="showCart" class="modal show" @click.self="showCart = false">
        <div class="modal-content">
          <span class="close-btn" @click="showCart = false">&times;</span>
          <h2 class="text-xl font-bold mb-4 text-pink-600">Tu Pedido</h2>
          
          <div class="lista-carrito space-y-4 max-h-96 overflow-y-auto">
            <p v-if="totalItems === 0" class="text-center py-10 text-gray-400">Tu pedido está vacío</p>
            <div v-for="(item, id) in carrito" :key="id" class="flex justify-between items-center border-b border-gray-100 pb-3 mb-3">
              <div class="flex-1 pr-4">
                <p class="font-bold text-gray-800 text-sm leading-tight">{{ item.nombre }}</p>
                <p class="text-pink-500 font-semibold text-xs">$ {{ item.precio.toLocaleString('es-AR') }}</p>
              </div>
              <div class="flex items-center gap-2">
                <button class="btn-qty" @click="cambiarCantidad(id, -1)">-</button>
                <span class="font-bold w-6 text-center text-sm">{{ item.cantidad }}</span>
                <button 
                  class="btn-qty" 
                  :disabled="item.cantidad >= buscarStock(id)"
                  :class="{ 'opacity-20': item.cantidad >= buscarStock(id) }"
                  @click="cambiarCantidad(id, 1)"
                >+</button>
              </div>
            </div>
          </div>

          <div class="border-t mt-6 pt-4">
            <div class="flex justify-between items-center text-xl font-extrabold mb-6 pt-2">
              <span class="text-gray-800">Total pedido:</span>
              <span class="text-pink-600 text-2xl">$ {{ totalDinero.toLocaleString('es-AR') }}</span>
            </div>
            <button @click="enviarPedido" class="btn-whatsapp">
              Confirmar pedido por WhatsApp
            </button>
            <button @click="vaciarCarrito" class="text-gray-400 text-xs w-full text-center hover:text-red-400 mt-2">Vaciar carrito</button>
          </div>
        </div>
      </div>

      <div v-if="imgViewer.show" class="image-viewer-modal show" @click="imgViewer.show = false">
        <span class="close-viewer">&times;</span>
        <img :src="imgViewer.src" :alt="imgViewer.alt">
      </div>

      <div id="toast" :class="{ 'show': toast.show }">{{ toast.msg }}</div>

      <a href="https://wa.me/5492604019865?text=%E2%9C%A8%20%C2%A1Hola%21%20Vi%20tu%20cat%C3%A1logo%20y%20me%20encantaron%20tus%20productos.%20%C2%BFMe%20podr%C3%ADas%20dar%20m%C3%A1s%20info%3F%20%F0%9F%92%96" class="whatsapp-float" target="_blank">
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.06 3.973L0 16l4.104-1.076a7.864 7.864 0 0 0 3.89 1.028h.005c4.368 0 7.926-3.559 7.93-7.93a7.852 7.852 0 0 0-2.328-5.596zM7.994 14.52a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
      </a>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { fetchProductos, fetchCategorias } from '../services/productoService';
import NavBar from '../components/NavBar.vue';
import ListaProductos from '../components/ListaProductos.vue';
import AdminPanel from '../views/AdminPanel.vue';

// --- CONFIGURACIÓN Y ESTADO ---
const esAdmin = ref(false);
const cargando = ref(true);
const productos = ref([]);
const categorias = ref([]);
const carrito = ref({});

// --- ESTADO DE UI ---
const showCart = ref(false);
const búsqueda = ref('');
const categoriaSeleccionada = ref('todos'); 
const toast = ref({ show: false, msg: '' });
const imgViewer = ref({ show: false, src: '', alt: '' });

// --- CICLO DE VIDA ---
onMounted(async () => {
  try {
    cargando.value = true;
    const [productosData, categoriasData] = await Promise.all([
      fetchProductos(),
      fetchCategorias()
    ]);
    
    productos.value = productosData;
    categorias.value = [{ id: 'todos', nombre: 'todos' }, ...categoriasData];
    
  } catch (error) {
    console.error("Error al inicializar la tienda:", error);
    mostrarToast("❌ Error al cargar los datos");
  } finally {
    cargando.value = false;
  }
});

// --- PROPIEDADES COMPUTADAS ---
const totalItems = computed(() => 
  Object.values(carrito.value).reduce((acc, item) => acc + item.cantidad, 0)
);

const totalDinero = computed(() => 
  Object.values(carrito.value).reduce((acc, item) => acc + (item.precio * item.cantidad), 0)
);

const productosFiltrados = computed(() => {
  if (!productos.value) return [];

  return productos.value
    .filter(p => {
      // 1. Filtro por nombre
      const coincideNombre = p.nombre.toLowerCase().includes(búsqueda.value.toLowerCase());
      
      // 2. Filtro por categoría revisando el objeto relacionado de Supabase
      // Accedemos a p.categorias.nombre que es lo que trae el JOIN de Supabase
      const nombreCatProducto = p.categorias?.nombre || '';
      
      const coincideCategoria = categoriaSeleccionada.value === 'todos' || 
                                 nombreCatProducto.toLowerCase() === categoriaSeleccionada.value.toLowerCase();
      
      return coincideNombre && coincideCategoria;
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
});

// --- MÉTODOS DE PRODUCTOS Y CARRITO ---
const buscarStock = (idCarrito) => {
  // Si la clave tiene un guion, extraemos solo el ID numérico
  const idReal = idCarrito.toString().includes('-') 
    ? idCarrito.split('-')[0] 
    : idCarrito;
    
  return productos.value.find(p => p.id == idReal)?.stock || 0;
};

const agregarAlCarrito = (p, varianteElegida = null) => {
  // 1. Validamos si el producto tiene variantes cargadas y si el usuario eligió una
  if (p.variantes && !varianteElegida) {
    mostrarToast("🌸 Por favor, elige una fragancia");
    return;
  }

  // 2. Creamos una clave única: "ID" si es común, "ID-Fragancia" si tiene variantes
  const idUnico = varianteElegida ? `${p.id}-${varianteElegida}` : p.id;

  // 3. Verificamos el stock (usando el ID original del producto para buscar el stock real)
  const cantActual = carrito.value[idUnico]?.cantidad || 0;
  const stockDisponible = p.stock; 

  if (cantActual < stockDisponible) {
    if (!carrito.value[idUnico]) {
      // Si no existe, lo creamos incluyendo la variante en el nombre
      carrito.value[idUnico] = { 
        nombre: varianteElegida ? `${p.nombre} (${varianteElegida})` : p.nombre, 
        precio: p.precio, 
        cantidad: 1,
        idOriginal: p.id // Guardamos el ID real para las funciones de stock
      };
    } else {
      carrito.value[idUnico].cantidad++;
    }
    mostrarToast(`✅ ${varianteElegida || p.nombre} añadido`);
  } else {
    mostrarToast(`⚠️ Stock máximo alcanzado`);
  }
};

const cambiarCantidad = (id, delta) => {
  const item = carrito.value[id];
  const stockMax = buscarStock(id);
  if (delta > 0 && item.cantidad >= stockMax) {
    mostrarToast(`⚠️ No hay más stock disponible`);
    return;
  }
  item.cantidad += delta;
  if (item.cantidad <= 0) delete carrito.value[id];
};

const vaciarCarrito = () => {
  if(confirm("¿Quieres vaciar todo el pedido?")) {
    carrito.value = {};
    showCart.value = false;
  }
};

// --- MÉTODOS DE INTERFAZ (UI) ---
const seleccionarCategoria = (event, cat) => {
  categoriaSeleccionada.value = cat.nombre;
  if (event) {
    event.currentTarget.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    });
  }
};

const mostrarToast = (m) => {
  toast.value = { show: true, msg: m };
  setTimeout(() => toast.value.show = false, 2500);
};

const abrirVisor = (p) => {
  imgViewer.value = { show: true, src: p.img, alt: p.nombre };
};

const enviarPedido = () => {
  if (totalItems.value === 0) return;
  let msj = "%F0%9F%92%96%20%2A%20NUEVO%20PEDIDO%20-%20BE%20YOU%20TIENDA%20%2A%0A";
  msj += "------------------------------------------%0A%0A";
  Object.values(carrito.value).forEach(item => {
    msj += "%F0%9F%9B%8D%20%2A" + item.cantidad + "x%2A%20" + item.nombre + "%0A";
    msj += "Subtotal%3A%20%24" + (item.precio * item.cantidad).toLocaleString('es-AR') + "%0A%0A";
  });
  msj += "------------------------------------------%0A";
  msj += "%F0%9F%92%B0%20%2A%20TOTAL%20A%20PAGAR%3A%20%24" + totalDinero.value.toLocaleString('es-AR') + "%20%2A%0A%0A";
  msj += "%E2%9C%A8%20%5F%20%C2%A1Hola%21%20Me%20gustar%C3%ADa%20confirmar%20este%20pedido%20para%20retirar%20en%20San%20Rafael.%20%5F";
  window.open("https://wa.me/5492604019865?text=" + msj, '_blank');
};
</script>

<style>
/* ==========================================================================
   VARIABLES GLOBALES (Diseño Atómico)
   ========================================================================== */
:root { 
  /* Escala Tipográfica: Permite mantener consistencia en los tamaños de texto */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;

  /* Paleta de Colores: Centraliza la identidad visual de la marca */
  --pink-primary: #db2777; 
  --pink-dark: #9d174d; 
  --pink-light: #fdf2f8; 
}

/* ==========================================================================
   HERO BANNER (Sección de Bienvenida)
   ========================================================================== */
.hero-banner {
  /* Fondo con degradado diagonal de 135 grados */
  background: linear-gradient(135deg, var(--pink-dark) 0%, var(--pink-primary) 100%);
  padding: 3rem 1.5rem;
  text-align: center;
  color: white;
  /* Curvatura solo en la parte inferior para estilo "wave" o moderno */
  border-radius: 0 0 40px 40px;
  /* Sombra suave con el color primario usando transparencia (alfa 0.2) */
  box-shadow: 0 10px 20px rgba(219, 39, 119, 0.2);
  margin-bottom: 2rem;
}

.hero-content h1 { 
  font-family: 'Playfair Display', serif; 
  /* Tipografía fluida: mínimo 1.8rem, ideal 5% del ancho de pantalla, máximo 2.5rem */
  font-size: clamp(1.8rem, 5vw, 2.5rem); 
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.hero-content p {
  font-weight: 300;
  font-size: 1rem;
  opacity: 0.95; /* Suaviza el color blanco del texto */
  margin-bottom: 1rem;
}

.hero-badge { 
  display: inline-block; 
  /* Efecto Glassmorphism: fondo semi-transparente con desenfoque posterior */
  background: rgba(255, 255, 255, 0.2); 
  backdrop-filter: blur(8px); 
  padding: 8px 18px; 
  border-radius: 50px; 
  font-size: 0.75rem; 
  text-transform: uppercase; 
  letter-spacing: 1px; 
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* ==========================================================================
   SISTEMA DE BÚSQUEDA
   ========================================================================== */
.search-wrapper { 
  position: relative; 
  max-width: 600px; 
  margin: 0 auto 2rem auto; 
  padding: 0 1rem;
}

.search-input { 
  width: 100%; 
  padding: 16px 24px; 
  border-radius: 50px; 
  border: 2px solid #fdf2f8; 
  background: white; 
  font-family: 'Poppins', sans-serif; 
  font-size: 1rem; 
  box-shadow: 0 4px 12px rgba(0,0,0,0.03); 
  /* Animación suave para todas las propiedades (borde, sombras) */
  transition: all 0.3s ease;
}

.search-input:focus { 
  outline: none; 
  border-color: var(--pink-primary); 
  box-shadow: 0 4px 15px rgba(219, 39, 119, 0.12); 
}

/* ==========================================================================
   NAVEGACIÓN DE CATEGORÍAS (UX Scroll Horizontal)
   ========================================================================== */
.categories-nav {
  display: flex;
  gap: 12px;
  overflow-x: auto; /* Habilita scroll horizontal si los botones desbordan */
  padding: 0.1rem 1rem 1rem; 
  margin-top: 1rem;
  scroll-behavior: smooth;
  /* Optimiza el desplazamiento táctil en iOS */
  -webkit-overflow-scrolling: touch;
}

/* Ocultar barra de scroll para una interfaz más limpia */
.categories-nav::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.btn-category { 
  padding: 8px 24px;
  border-radius: 50px;
  border: 1px solid #f3f4f6;
  background: white;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap; /* Evita que el texto del botón se rompa en dos líneas */
  cursor: pointer;
  flex-shrink: 0; /* Evita que el botón se comprima en el contenedor flex */
  transition: all 0.25s ease; 
}

.btn-category:hover { 
  background: var(--pink-light); 
  color: var(--pink-primary); 
}

.btn-category.active { 
  background: var(--pink-primary); 
  color: white; 
  border-color: var(--pink-primary); 
  box-shadow: 0 6px 12px rgba(219, 39, 119, 0.2); 
}

/* ==========================================================================
   COMPONENTES DE UI (Modales, Botones, Títulos)
   ========================================================================== */
.section-title { 
  text-align: center; 
  font-family: 'Playfair Display', serif; 
  font-size: 1.8rem; 
  color: var(--pink-primary); 
  margin: 3.5rem 0 2rem 0; 
}

/* Estructura base para modales */
.modal, .image-viewer-modal { 
  position: fixed; 
  inset: 0; /* Cubre toda la pantalla (top, left, right, bottom: 0) */
  background: rgba(0,0,0,0.85); 
  display: none; 
  align-items: center; 
  justify-content: center; 
  z-index: 2000; 
  backdrop-filter: blur(8px); 
}

/* Clase de utilidad para mostrar el modal con Vue (usando v-bind:class) */
.modal.show, .image-viewer-modal.show { display: flex; }

.modal-content { 
  background: white; 
  padding: 30px; 
  border-radius: 28px; 
  width: 92%; 
  max-width: 440px; 
  position: relative; 
}

.image-viewer-modal img { 
  max-width: 95%; 
  max-height: 85vh; 
  border-radius: 16px; 
  object-fit: contain; /* Mantiene la proporción de la imagen sin recortarla */
}

/* Botones de control de cantidad */
.btn-qty { 
  background: var(--pink-light); 
  color: var(--pink-primary); 
  border: 1px solid #fbcfe8; 
  width: 32px; 
  height: 32px; 
  border-radius: 10px; 
  font-weight: bold; 
}

.btn-whatsapp { 
  background: #25d366; 
  color: white; 
  width: 100%; 
  padding: 16px; 
  border-radius: 14px; 
  font-weight: 700; 
  border: none; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  gap: 10px; 
  transition: transform 0.2s ease; 
}

/* ==========================================================================
   FOOTER (Pie de Página)
   ========================================================================== */
.main-footer { 
  background-color: rgb(244, 201, 235); 
  padding: 4rem 1.5rem 2rem 1.5rem; 
  margin-top: 5rem; 
}

/* Sistema de Rejilla (Grid) para el footer */
.footer-grid { 
  max-width: 1100px; 
  margin: 0 auto; 
  display: grid; 
  grid-template-columns: 1fr; /* Una sola columna en móvil */
  gap: 3rem; 
}

/* Media Query: De tablet en adelante (>= 768px) */
@media (min-width: 768px) { 
  .footer-grid { 
    grid-template-columns: repeat(3, 1fr); /* Divide en 3 columnas iguales */
    text-align: left; 
  } 
}

.footer-heading { 
  font-weight: 800; 
  color: #1f2937; 
  text-transform: uppercase; 
  font-size: 0.75rem; 
  letter-spacing: 0.12em; 
  margin-bottom: 1.2rem; 
}

.footer-text, .footer-list li { 
  font-size: 0.9rem; 
  color: #4b5563; 
  line-height: 1.7; 
}

.footer-link-social {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--pink-primary);
  font-weight: 600;
  text-decoration: none;
  margin-top: 1rem;
}

.footer-bottom { 
  border-top: 1px solid rgba(219, 39, 119, 0.1); 
  margin-top: 3rem; 
  padding-top: 1.5rem; 
  text-align: center; 
  color: #4b5563; 
  font-size: 0.75rem; 
}

/* ==========================================================================
   ELEMENTOS FLOTANTES Y NOTIFICACIONES
   ========================================================================== */
#toast { 
  position: fixed; 
  bottom: 30px; 
  left: 50%; 
  transform: translateX(-50%); 
  background: #1f2937; 
  color: white; 
  padding: 14px 28px; 
  border-radius: 50px; 
  opacity: 0; 
  /* Animación con cubic-bezier para un efecto más natural y elástico */
  transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
  z-index: 3000; 
}

#toast.show { 
  opacity: 1; 
  bottom: 50px; /* Sube ligeramente cuando aparece */
}

.whatsapp-float { 
  position: fixed; 
  width: 60px; 
  height: 60px; 
  bottom: 25px; 
  right: 25px; 
  background: #25d366; 
  color: white; 
  border-radius: 50px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  box-shadow: 0 8px 20px rgba(37, 211, 102, 0.3); 
  z-index: 1000; 
  transition: transform 0.3s ease;
}

.whatsapp-float:hover { 
  transform: scale(1.1); /* Efecto de aumento al pasar el mouse */
}
</style>