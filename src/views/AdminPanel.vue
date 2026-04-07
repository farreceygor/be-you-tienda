<template>
  <div v-if="usuarioLogueado" class="admin-container min-h-screen bg-[#f9fafb] pb-20">
    
    <header class="admin-header">
      <div class="logo-wrapper">
        <div class="logo-placeholder">BY</div> 
        <h1>Panel de Gestión <span>Be You</span></h1>
      </div>
      <button @click="cerrarSesion" class="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition text-xs font-bold uppercase tracking-widest">
        Salir 🚪
      </button>
    </header>

    <main class="max-w-2xl mx-auto px-4 mt-6">
      
      <div class="flex gap-2 mb-8 bg-gray-100 p-2 rounded-2xl overflow-x-auto no-scrollbar">
        <button @click="vistaActual = 'productos'" 
          :class="['flex-1 py-3 px-4 rounded-xl font-bold transition text-sm whitespace-nowrap', vistaActual === 'productos' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500']">
          🛍️ Cargar
        </button>

        <button @click="vistaActual = 'inventario'" 
          :class="['flex-1 py-3 px-4 rounded-xl font-bold transition text-sm whitespace-nowrap', vistaActual === 'inventario' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500']">
          📋 Lista
        </button>

        <button @click="vistaActual = 'categorias'" 
          :class="['flex-1 py-3 px-4 rounded-xl font-bold transition text-sm whitespace-nowrap', vistaActual === 'categorias' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500']">
          ✨ Secciones
        </button>

        <button @click="vistaActual = 'preview'" 
          :class="['flex-1 py-3 px-4 rounded-xl font-bold transition text-sm whitespace-nowrap', vistaActual === 'preview' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500']">
          👁️ Ver Tienda
        </button>
      </div>

      <div v-if="vistaActual === 'categorias'" class="fade-in card-form bg-white rounded-3xl p-6 shadow-sm mb-6 border-l-4 border-red-500">
        <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Nueva Sección</h3>
        <div class="flex gap-2">
          <input v-model="nuevaCatNombre" type="text" placeholder="Ej: Accesorios" class="input-admin py-2" :disabled="cargando" />
          <button @click="guardarCategoria" class="bg-red-500 text-white px-6 rounded-xl font-bold hover:bg-red-600 transition" :disabled="cargando">
            {{ cargando ? '...' : '+' }}
          </button>
        </div>
        <div class="mt-8">
          <h4 class="text-xs font-bold text-gray-400 uppercase mb-4 text-center">Categorías Actuales</h4>
          <div class="grid grid-cols-1 gap-2">
            <div v-for="cat in categorias" :key="cat.id" class="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span class="font-medium text-gray-700">{{ cat.nombre }}</span>
              <button @click="eliminarCategoria(cat)" class="text-red-400 hover:text-red-600 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="vistaActual === 'productos'" class="fade-in card-form shadow-xl bg-white rounded-3xl p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          {{ editandoId ? '✏️ Editando Producto' : '✨ Cargar Nuevo Producto' }}
        </h2>
        <form @submit.prevent="guardarProducto" class="space-y-5">
          <div>
            <label class="label-admin">Nombre del producto</label>
            <input type="text" v-model="nuevoProducto.nombre" placeholder="Ej: Labial Matte Red" class="input-admin" required />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label-admin">Precio ($)</label>
              <input type="number" v-model="nuevoProducto.precio" placeholder="0.00" class="input-admin" required />
            </div>
            <div>
              <label class="label-admin">Stock disponible</label>
              <input type="number" v-model="nuevoProducto.stock" placeholder="10" class="input-admin" required />
            </div>
          </div>
          <div>
            <label class="label-admin">Categoría</label>
            <select v-model="nuevoProducto.categoria_id" class="input-admin bg-white">
              <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
            </select>
          </div>
          <div class="image-upload-zone">
            <label class="label-admin">Imagen del producto</label>
            <div class="upload-box relative" :class="{'opacity-60 pointer-events-none': cargando}">
              <input type="file" id="file-input" @change="previsualizarImagen" accept="image/*" class="hidden-input" />
              <label for="file-input" class="upload-label">
                <div v-if="cargando" class="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-2xl z-10">
                   <div class="animate-spin h-6 w-6 border-2 border-red-500 border-t-transparent rounded-full mb-2"></div>
                </div>
                <span v-if="!imgPreview && !cargando">📸 Toca para elegir foto</span>
                <img v-if="imgPreview" :src="imgPreview" class="preview-img" />
              </label>
            </div>
          </div>
          <button type="submit" class="btn-save-admin flex items-center justify-center gap-3" :disabled="cargando">
            <span v-if="cargando" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            {{ cargando ? 'Procesando...' : (editandoId ? 'Actualizar Cambios' : 'Guardar Producto') }}
          </button>
          <button v-if="editandoId && !cargando" @click="limpiarFormulario" type="button" class="w-full mt-2 text-gray-400 text-sm">Cancelar edición</button>
        </form>
      </div>

      <div v-if="vistaActual === 'inventario'" class="space-y-4 px-1 fade-in">
        <h2 class="text-lg font-bold text-gray-700 mb-4">Productos en la tienda</h2>
        <div class="mb-4">
          <input v-model="textoBusqueda" type="text" placeholder="Buscar producto o categoría... 🔍" class="input-admin !py-2 text-sm shadow-sm" />
        </div>
        <div v-if="inventarioFiltrado.length === 0" class="text-center py-10 text-gray-400">
          {{ productosCargados.length === 0 ? 'No hay productos todavía. 📦' : 'Sin coincidencias. 🔍' }}
        </div>
        <div v-else v-for="prod in inventarioFiltrado" :key="prod.id" class="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm flex items-center gap-4">
          <img :src="prod.imagen_url" class="w-16 h-16 rounded-xl object-cover bg-gray-50" />
          <div class="flex-grow">
            <h3 class="font-bold text-gray-800 text-sm leading-tight">{{ prod.nombre }}</h3>
            <p class="text-xs text-gray-400 mb-1">{{ prod.categorias?.nombre || 'Sin categoría' }}</p>
            <p class="text-red-500 font-bold">$ {{ prod.precio.toLocaleString('es-AR') }}</p>
          </div>
          <div class="flex flex-col gap-2">
            <button @click="prepararEdicion(prod)" class="p-2 bg-blue-50 text-blue-500 rounded-lg shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
            <button @click="eliminarProducto(prod)" class="p-2 bg-red-50 text-red-500 rounded-lg shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div v-if="vistaActual === 'preview'" class="fade-in">
        <div class="bg-blue-50 border border-blue-100 p-3 rounded-2xl mb-6 flex items-center gap-3">
          <span class="text-xl">✨</span>
          <p class="text-xs text-blue-700"><b>Modo Vista Previa:</b> Así ven los clientes la tienda.</p>
        </div>
        <ProductGrid :key="productosCargados.length" :productos="productosCargados" @ver-imagen="() => {}" @agregar="() => {}" />
      </div>
    </main>
  </div>

  <div v-else class="min-h-screen flex items-center justify-center bg-[#f9fafb] px-4">
    <div class="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 fade-in">
      <div class="logo-placeholder">BY</div>
      <h2 class="text-2xl font-bold text-center text-gray-800 mb-2">Acceso Privado</h2>
      <p class="text-center text-gray-400 text-sm mb-8">Gestión de Inventario Be You</p>
      
      <form @submit.prevent="iniciarSesion" class="space-y-4">
        <div>
          <label class="label-admin">Correo Electrónico</label>
          <input v-model="email" type="email" class="input-admin" placeholder="admin@beyou.com" required />
        </div>
        <div>
          <label class="label-admin">Contraseña</label>
          <input v-model="password" type="password" class="input-admin" placeholder="••••••••" required />
        </div>
        <p v-if="errorLogin" class="text-red-500 text-xs text-center font-bold animate-pulse">{{ errorLogin }}</p>
        <button type="submit" class="btn-save-admin" :disabled="cargando">
          {{ cargando ? 'Verificando...' : 'Ingresar al Panel' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { subirImagenProducto, crearProducto, fetchCategorias } from '../services/productoService';
import { supabase } from '../lib/supabaseClient';

// IMPORTACIÓN DE COMPONENTES
import ProductGrid from '../components/ListaProductos.vue'; 

// --- ESTADOS DE AUTENTICACIÓN ---
const usuarioLogueado = ref(null);
const email = ref('');
const password = ref('');
const errorLogin = ref('');

// --- ESTADOS DEL PANEL ---
const categorias = ref([]);
const cargando = ref(false);
const imagenArchivo = ref(null);
const imgPreview = ref(null);
const nuevaCatNombre = ref('');
const vistaActual = ref('inventario'); 
const productosCargados = ref([]);
const editandoId = ref(null); 
const textoBusqueda = ref('');

const nuevoProducto = ref({
  nombre: '',
  precio: null,
  stock: 0,
  categoria_id: null,
  imagen_url: ''
});

// --- LÓGICA DE BÚSQUEDA ---
const inventarioFiltrado = computed(() => {
  if (!textoBusqueda.value) return productosCargados.value;
  
  const busqueda = textoBusqueda.value.toLowerCase();
  return productosCargados.value.filter(p => 
    p.nombre.toLowerCase().includes(busqueda) || 
    p.categorias?.nombre?.toLowerCase().includes(busqueda)
  );
});

// --- 1. GESTIÓN DE SESIÓN (SEGURIDAD) ---
const iniciarSesion = async () => {
  cargando.value = true;
  errorLogin.value = '';
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    
    if (error) throw error;
    
    usuarioLogueado.value = data.user;
    await inicializarDatos(); // Cargamos todo al entrar
  } catch (error) {
    errorLogin.value = "Credenciales incorrectas ❌";
  } finally {
    cargando.value = false;
  }
};

const cerrarSesion = async () => {
  await supabase.auth.signOut();
  usuarioLogueado.value = null;
};

// --- 2. CARGA DE DATOS ---
const cargarInventario = async () => {
  const { data, error } = await supabase
    .from('productos')
    .select(`
      id, nombre, precio, stock, imagen_url, categoria_id,
      categorias (nombre)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
  } else {
    // MAPEADO: Agregamos la propiedad 'img' para que ListaProductos la reconozca
    productosCargados.value = data.map(p => ({
      ...p,
      img: p.imagen_url 
    }));
  }
};

const inicializarDatos = async () => {
  try {
    const datos = await fetchCategorias();
    if (datos && datos.length > 0) {
      categorias.value = datos;
      nuevoProducto.value.categoria_id = datos[0].id;
    }
    await cargarInventario();
  } catch (e) {
    console.error("Error al cargar datos:", e);
  }
};

// --- 3. ACCIONES DE PRODUCTO ---
const guardarProducto = async () => {
  if (!imagenArchivo.value && !editandoId.value) return alert("¡Falta la foto! 📸");
  
  cargando.value = true;
  try {
    let url = nuevoProducto.value.imagen_url;

    if (imagenArchivo.value) {
      url = await subirImagenProducto(imagenArchivo.value);
    }
    
    const datosFinales = {
      nombre: nuevoProducto.value.nombre,
      precio: nuevoProducto.value.precio,
      stock: nuevoProducto.value.stock,
      categoria_id: nuevoProducto.value.categoria_id,
      imagen_url: url
    };

    if (editandoId.value) {
      const { error } = await supabase
        .from('productos')
        .update(datosFinales)
        .eq('id', editandoId.value);
      if (error) throw error;
      alert("✅ ¡Producto actualizado!");
    } else {
      await crearProducto(datosFinales);
      alert("✅ ¡Producto guardado!");
    }
    
    limpiarFormulario();
    await cargarInventario(); 
  } catch (error) {
    alert("Error al procesar ❌");
  } finally {
    cargando.value = false;
  }
};

const prepararEdicion = (producto) => {
  editandoId.value = producto.id;
  nuevoProducto.value = { ...producto };
  imgPreview.value = producto.imagen_url;
  vistaActual.value = 'productos';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const eliminarProducto = async (producto) => {
  if (confirm(`¿Eliminar "${producto.nombre}"?`)) {
    try {
      const { error } = await supabase.from('productos').delete().eq('id', producto.id);
      if (error) throw error;
      await cargarInventario();
    } catch (error) {
      alert("Error al eliminar ❌");
    }
  }
};

// --- 4. GESTIÓN DE CATEGORÍAS ---
const guardarCategoria = async () => {
  if (!nuevaCatNombre.value) return;
  cargando.value = true;
  try {
    const slug = nuevaCatNombre.value.toLowerCase().trim().replace(/\s+/g, '-');
    const { error } = await supabase.from('categorias').insert([{ nombre: nuevaCatNombre.value, slug }]);
    if (error) throw error;
    nuevaCatNombre.value = '';
    categorias.value = await fetchCategorias(); 
  } catch (error) {
    alert("Error al crear categoría");
  } finally {
    cargando.value = false;
  }
};

const eliminarCategoria = async (cat) => {
  if (confirm(`¿Borrar "${cat.nombre}"?`)) {
    try {
      const { error } = await supabase.from('categorias').delete().eq('id', cat.id);
      if (error) throw error;
      categorias.value = await fetchCategorias();
    } catch (e) {
      alert("No puedes borrarla porque tiene productos asociados 🛍️");
    }
  }
};

// --- 5. UTILIDADES ---
const limpiarFormulario = () => {
  editandoId.value = null;
  nuevoProducto.value = { nombre: '', precio: null, stock: 0, categoria_id: categorias.value[0]?.id };
  imagenArchivo.value = null;
  imgPreview.value = null;
};

const previsualizarImagen = (event) => {
  const file = event.target.files[0];
  if (file) {
    imagenArchivo.value = file;
    imgPreview.value = URL.createObjectURL(file);
  }
};

// --- CICLO DE VIDA Y WATCHERS ---
onMounted(async () => {
  // Verificamos si ya hay una sesión activa al abrir la página
  const { data: { session } } = await supabase.auth.getSession();
  usuarioLogueado.value = session?.user || null;
  
  if (usuarioLogueado.value) {
    await inicializarDatos();
  }
});

watch(vistaActual, (nuevaVista) => {
  if (usuarioLogueado.value && (nuevaVista === 'inventario' || nuevaVista === 'preview')) {
    cargarInventario();
  }
});
</script>

<style scoped>
/* --- HEADER Y LOGO --- */
.admin-header {
  background: white;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  text-align: center;
}

.logo-placeholder {
  width: 50px;
  height: 50px;
  background: #dc2626; /* Rojo Be You */
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-weight: 900;
  margin: 0 auto 0.5rem auto;
}

.admin-header h1 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #374151;
}

.admin-header span {
  color: #dc2626;
}

/* --- FORMULARIOS --- */
.label-admin {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 0.5rem;
  padding-left: 0.5rem;
}

.input-admin {
  width: 100%;
  padding: 12px 16px;
  border-radius: 15px;
  border: 2px solid #f3f4f6;
  background: #f9fafb;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.input-admin:focus {
  outline: none;
  border-color: #dc2626;
  background: white;
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1);
}

/* --- ZONA DE CARGA DE IMAGEN --- */
.upload-box {
  border: 2px dashed #d1d5db;
  border-radius: 20px;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  background: #fef2f2; 
  transition: border-color 0.3s ease;
}

.upload-box:hover {
  border-color: #dc2626;
}

.preview-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

/* --- BOTONES --- */
.btn-save-admin {
  width: 100%;
  background: #dc2626;
  color: white;
  padding: 16px;
  border-radius: 18px;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.25);
  margin-top: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
}

.btn-save-admin:active {
  transform: scale(0.98);
}

.btn-save-admin:disabled {
  background: #9ca3af;
  box-shadow: none;
  cursor: not-allowed;
}

/* --- UTILIDADES Y ANIMACIONES --- */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.hidden-input {
  display: none;
}

/* Estilo para las tarjetas del inventario (Lista) */
.bg-white.border-gray-100:hover {
  border-color: #fee2e2;
  background-color: #fffafa;
}
</style>