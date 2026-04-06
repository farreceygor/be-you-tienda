<template>
  <div class="admin-container min-h-screen bg-[#f9fafb] pb-20">
    <header class="admin-header">
      <div class="logo-wrapper">
        <div class="logo-placeholder">BY</div> 
        <h1>Panel de Gestión <span>Be You</span></h1>
      </div>
    </header>

    <main class="max-w-2xl mx-auto px-4 mt-6">
        <div class="flex gap-2 mb-8 bg-gray-100 p-2 rounded-2xl overflow-x-auto no-scrollbar">
            <button 
                @click="vistaActual = 'productos'" 
                :class="['flex-1 py-3 px-4 rounded-xl font-bold transition text-sm', 
                         vistaActual === 'productos' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500']"
            >
                🛍️ Cargar
            </button>
  
            <button 
                @click="vistaActual = 'inventario'" 
                :class="['flex-1 py-3 px-4 rounded-xl font-bold transition text-sm', 
                         vistaActual === 'inventario' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500']"
            >
                📋 Lista
            </button>

            <button 
                @click="vistaActual = 'categorias'" 
                :class="['flex-1 py-3 px-4 rounded-xl font-bold transition text-sm', 
                         vistaActual === 'categorias' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500']"
            >
                ✨ Secciones
            </button>
        </div>



        <!--Carga Categorias-->
        <div v-if="vistaActual === 'categorias'" class="fade-in card-form bg-white rounded-3xl p-6 shadow-sm mb-6 border-l-4 border-red-500">
            <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Nueva Sección</h3>
        <div class="flex gap-2">
        <input 
          v-model="nuevaCatNombre" 
          type="text" 
          placeholder="Ej: Accesorios" 
          class="input-admin py-2" 
        />
        <button @click="guardarCategoria" class="bg-red-500 text-white px-6 rounded-xl font-bold">
          +
        </button>
        
        </div>
        <div class="mt-8">
            <h4 class="text-xs font-bold text-gray-400 uppercase mb-4 text-center">Categorías Actuales</h4>
            <div class="grid grid-cols-1 gap-2">
                <div v-for="cat in categorias" :key="cat.id" 
                    class="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
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

        <!--Carga Productos-->
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
                    <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                        {{ cat.nombre }}
                    </option>
                </select>
            </div>

            <div class="image-upload-zone">
                <label class="label-admin">Imagen del producto</label>
                <div class="upload-box">
                    <input type="file" id="file-input" @change="previsualizarImagen" accept="image/*" class="hidden-input" />
                    <label for="file-input" class="upload-label">
                    <span v-if="!imgPreview">📸 Toca para elegir foto</span>
                    <img v-else :src="imgPreview" class="preview-img" />
                    </label>
                </div>
            </div>

            <button type="submit" class="btn-save-admin" :disabled="cargando">
                {{ cargando ? 'Procesando...' : (editandoId ? 'Actualizar Cambios' : 'Guardar Producto') }}
            </button>
            <button v-if="editandoId" @click="limpiarFormulario" type="button" class="w-full mt-2 text-gray-400 text-sm">
              Cancelar edición
            </button>
            </form>
        </div>

        <!--Lista Productos-->  
        <div v-if="vistaActual === 'inventario'" class="space-y-4 px-1">
          <h2 class="text-lg font-bold text-gray-700 mb-4">Productos en la tienda</h2>

          <div class="mb-4">
            <input 
              v-model="textoBusqueda"
              type="text" 
              placeholder="Buscar producto o categoría... 🔍" 
              class="input-admin !py-2 text-sm shadow-sm"
            />
          </div>

          <div v-if="inventarioFiltrado.length === 0" class="text-center py-10 text-gray-400">
            {{ productosCargados.length === 0 ? 'No hay productos cargados todavía. 📦' : 'No se encontraron coincidencias. 🔍' }}
          </div>

          <div v-else v-for="prod in inventarioFiltrado" :key="prod.id" 
               class="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm flex items-center gap-4">
    
            <img :src="prod.imagen_url" class="w-16 h-16 rounded-xl object-cover bg-gray-50" />

            <div class="flex-grow">
              <h3 class="font-bold text-gray-800 text-sm leading-tight">{{ prod.nombre }}</h3>
              <p class="text-xs text-gray-400 mb-1">{{ prod.categorias?.nombre || 'Sin categoría' }}</p>
              <p class="text-[10px] uppercase font-bold text-gray-400">Stock: {{ prod.stock }}</p>
              <p class="text-red-500 font-bold">$ {{ prod.precio.toLocaleString('es-AR') }}</p>
            </div>

            <div class="flex flex-col gap-2">
              <button @click="prepararEdicion(prod)" class="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>

              <button @click="eliminarProducto(prod)" class="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { subirImagenProducto, crearProducto, fetchCategorias } from '../services/productoService';
import { supabase } from '../lib/supabaseClient'
// ESTADOS
const categorias = ref([]);
const cargando = ref(false);
const imagenArchivo = ref(null);
const imgPreview = ref(null);
const nuevaCatNombre = ref('');
const vistaActual = ref('inventario'); // Por defecto abre el cargador
const productosCargados = ref([]);
const editandoId = ref(null); // Si es null, estamos creando. Si tiene ID, estamos editando.
const textoBusqueda = ref('');

const nuevoProducto = ref({
  nombre: '',
  precio: null,
  stock: 0,
  categoria_id: null, // Guardamos el ID de la tabla categorias
  imagen_url: ''
});

//Lista de busqueda
const inventarioFiltrado = computed(() => {
  if (!textoBusqueda.value) return productosCargados.value;
  
  const busqueda = textoBusqueda.value.toLowerCase();
  return productosCargados.value.filter(p => 
    p.nombre.toLowerCase().includes(busqueda) || 
    p.categorias?.nombre?.toLowerCase().includes(busqueda)
  );
});

// 1. Función para preparar el formulario con los datos del producto
const prepararEdicion = (producto) => {
  editandoId.value = producto.id;
  
  // Llenamos el formulario con los datos existentes
  nuevoProducto.value = {
    nombre: producto.nombre,
    precio: producto.precio,
    stock: producto.stock,
    categoria_id: producto.categoria_id,
    imagen_url: producto.imagen_url
  };
  
  // Mostramos la imagen actual en la previsualización
  imgPreview.value = producto.imagen_url;
  // Cambiamos automáticamente a la pestaña de "Cargar" (que ahora es Editar)
  vistaActual.value = 'productos';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 2. Modificamos la función guardarProducto para que sepa si debe Crear o Actualizar
const guardarProducto = async () => {
  if (!imagenArchivo.value && !editandoId.value) return alert("¡Falta la foto! 📸");
  
  cargando.value = true;
  try {
    let url = nuevoProducto.value.imagen_url;

    // Si ella eligió una foto NUEVA, la subimos. Si no, mantenemos la que estaba.
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
      // MODO EDICIÓN: Actualizamos en Supabase
      const { error } = await supabase
        .from('productos')
        .update(datosFinales)
        .eq('id', editandoId.value);
      
      if (error) throw error;
      alert("✅ ¡Producto actualizado!");
    } else {
      // MODO CREACIÓN: Insertamos nuevo
      await crearProducto(datosFinales);
      alert("✅ ¡Producto guardado!");
    }
    
    limpiarFormulario();
    await cargarInventario(); // Refrescamos la lista
  } catch (error) {
    alert("Error al procesar ❌");
  } finally {
    cargando.value = false;
  }
};

// 3. Resetear el estado al limpiar
const limpiarFormulario = () => {
  editandoId.value = null; // Volvemos a modo "Crear"
  nuevoProducto.value = { nombre: '', precio: null, stock: 0, categoria_id: categorias.value[0]?.id };
  imagenArchivo.value = null;
  imgPreview.value = null;
};

const guardarCategoria = async () => {
  if (!nuevaCatNombre.value) return;

  try {
    // Generamos un slug simple (ej: "Labiales Premium" -> "labiales-premium")
    const slug = nuevaCatNombre.value.toLowerCase().replace(/ /g, '-');

    const { data, error } = await supabase
      .from('categorias')
      .insert([{ nombre: nuevaCatNombre.value, slug: slug }])
      .select();

    if (error) throw error;

    alert("✨ Categoría añadida!");
    // Recargamos la lista para que aparezca en el selector de productos
    categorias.value = await fetchCategorias(); 
    nuevaCatNombre.value = ''; // Limpiamos el input
  } catch (error) {
    alert("Error al crear categoría");
  }
};

const eliminarCategoria = async (cat) => {
  // Verificación de seguridad
  const confirmar = confirm(`¿Borrar la categoría "${cat.nombre}"? ✨\nOjo: Si hay productos en esta categoría, no podrás borrarla.`);
  
  if (confirmar) {
    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', cat.id);

      if (error) {
        // Supabase avisará si hay productos usando esta categoría (error de FK)
        alert("No puedes borrarla porque tiene productos asociados 🛍️");
      } else {
        alert("Categoría eliminada");
        categorias.value = await fetchCategorias(); // Recargamos la lista
      }
    } catch (e) {
      alert("Error al eliminar");
    }
  }
};

// Al cargar el componente, traemos las categorías reales de la DB
onMounted(async () => {
  try {
    const datos = await fetchCategorias();
    if (datos && datos.length > 0) {
      categorias.value = datos;
      // Solo asignamos el ID si realmente recibimos algo
      nuevoProducto.value.categoria_id = datos[0].id;
    }
    // Traemos también los productos para que la lista ya esté lista
    await cargarInventario();

  } catch (e) {
    console.error("Error al cargar categorías:", e);
  }
});

const previsualizarImagen = (event) => {
  const file = event.target.files[0];
  if (file) {
    imagenArchivo.value = file;
    imgPreview.value = URL.createObjectURL(file);
  }
};

// 1. Función para traer los productos (puedes reutilizar la de la tienda o hacer una simple aquí)
const cargarInventario = async () => {
  const { data, error } = await supabase
    .from('productos')
    .select(`
      id,
      nombre,
      precio,
      stock,
      imagen_url,
      categoria_id,
      categorias (nombre)
    `)
    .order('created_at', { ascending: false }); // Los últimos cargados aparecen primero

  if (error) console.error(error);
  else productosCargados.value = data;
};

// 2. Función para borrar con confirmación
const eliminarProducto = async (producto) => {
  const confirmar = confirm(`¿Estás seguro de eliminar "${producto.nombre}"? ✨\nEsta acción no se puede deshacer.`);
  
  if (confirmar) {
    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', producto.id);

      if (error) throw error;

      alert("Producto eliminado correctamente");
      await cargarInventario(); // Recargamos la lista para que desaparezca el borrado
    } catch (error) {
      alert("No se pudo eliminar el producto ❌");
    }
  }
};

// Ejecutar la carga cuando la pestaña cambia a 'inventario'
watch(vistaActual, (nuevaVista) => {
  if (nuevaVista === 'inventario') {
    cargarInventario();
  }
});
</script>

<style scoped>
.admin-header {
  background: white;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  text-align: center;
}

.logo-placeholder {
  width: 50px;
  height: 50px;
  background: #dc2626; /* Rojo */
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
  color: #dc2626; /* Rojo en el nombre */
}

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
}

.input-admin:focus {
  outline: none;
  border-color: #dc2626;
  background: white;
}

/* Zona de Imagen */
.upload-box {
  border: 2px dashed #d1d5db;
  border-radius: 20px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  background: #fef2f2; /* Fondo rojizo muy suave */
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-save-admin {
  width: 100%;
  background: #dc2626; /* El Rojo que le gusta */
  color: white;
  padding: 16px;
  border-radius: 18px;
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.25);
  margin-top: 1rem;
}

.hidden-input {
  display: none;
}
</style>