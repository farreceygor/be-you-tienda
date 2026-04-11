<template>
  <div v-if="usuarioLogueado" class="admin-container min-h-screen bg-[#f9fafb] pb-20">
    
    <header class="admin-header relative flex flex-col items-center pt-6">
      <div class="mb-2">
        <img 
          src="https://abhcuuyqxyjmunfaosah.supabase.co/storage/v1/object/public/public-assets/logo.jpeg" 
          alt="Logo Be You" 
          class="w-14 h-14 rounded-full object-cover border-2 border-red-50 shadow-sm mx-auto"
        />
      </div>
      <div class="logo-wrapper">
        <h1 class="text-xl font-bold text-gray-800">
          Panel de Gestión <span class="text-red-500">Be You</span>
        </h1>
      </div>
      <button 
        @click="cerrarSesion" 
        class="absolute top-4 right-4 text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest transition"
      >
        Salir 🚪
      </button>
    </header>

    <main class="max-w-2xl mx-auto px-4 mt-6">
      
      <div class="flex gap-3 mb-8 bg-gray-100 p-2 rounded-2xl overflow-x-auto no-scrollbar snap-x snap-mandatory">
        <button @click="cambiarVista($event, 'productos')" :class="['min-w-[110px] flex-shrink-0 py-3 px-4 rounded-xl font-bold transition text-sm snap-start', vistaActual === 'productos' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500']">
          🛍️ Cargar
        </button>
        <button @click="cambiarVista($event, 'inventario')" :class="['min-w-[110px] flex-shrink-0 py-3 px-4 rounded-xl font-bold transition text-sm snap-start', vistaActual === 'inventario' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500']">
          📋 Lista
        </button>
        <button @click="cambiarVista($event, 'ventas')" :class="['min-w-[110px] flex-shrink-0 py-3 px-4 rounded-xl font-bold transition text-sm snap-start', vistaActual === 'ventas' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500']">
          📈 Ventas
        </button>
        <button @click="cambiarVista($event, 'categorias')" :class="['min-w-[110px] flex-shrink-0 py-3 px-4 rounded-xl font-bold transition text-sm snap-start', vistaActual === 'categorias' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500']">
          ✨ Secciones
        </button>
        <button @click="cambiarVista($event, 'preview')" :class="['min-w-[110px] flex-shrink-0 py-3 px-4 rounded-xl font-bold transition text-sm snap-start', vistaActual === 'preview' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500']">
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
              <div class="flex gap-2">
                <button @click="prepararEdicionCategoria(cat)" class="text-blue-400 p-1 hover:scale-110 transition"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                <button @click="eliminarCategoria(cat)" class="text-red-400 p-1 hover:scale-110 transition"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="vistaActual === 'ventas'" class="fade-in space-y-6">
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Hoy</p>
            <p class="text-xl font-black text-gray-800">$ {{ stats.hoy.toLocaleString('es-AR') }}</p>
            <div class="w-full bg-green-100 h-1 mt-2 rounded-full overflow-hidden"><div class="bg-green-500 h-full w-full"></div></div>
          </div>
          <div class="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Mes Actual</p>
            <p class="text-xl font-black text-gray-800">$ {{ stats.mes.toLocaleString('es-AR') }}</p>
            <div class="w-full bg-blue-100 h-1 mt-2 rounded-full overflow-hidden"><div class="bg-blue-500 h-full w-full"></div></div>
          </div>
          <div class="col-span-2 bg-gray-900 p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden text-white">
            <div class="relative z-10">
              <p class="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Recaudación Total</p>
              <h2 class="text-3xl font-black">$ {{ stats.total.toLocaleString('es-AR') }}</h2>
            </div>
            <div class="absolute -right-5 -bottom-5 w-24 h-24 bg-red-500/20 rounded-full blur-2xl"></div>
          </div>
        </div>

        <div class="space-y-3">
          <h3 class="text-sm font-bold text-gray-500 uppercase px-2">Historial Reciente</h3>
          <div v-if="ventasCargadas.length === 0" class="text-center py-10 text-gray-400 text-sm italic">☕ No hay ventas registradas.</div>
          <div v-for="venta in ventasCargadas" :key="venta.id" class="bg-white border border-gray-50 p-4 rounded-2xl flex justify-between items-center shadow-sm">
            <div>
              <h4 class="font-bold text-gray-800 text-sm">{{ venta.productos?.nombre || venta.nombre_producto }}</h4>
              <p class="text-[9px] text-gray-400 uppercase font-bold">{{ new Date(venta.created_at).toLocaleString() }}</p>
              <p class="text-xs font-medium text-gray-500 mt-1">{{ venta.cantidad }} unidad(es) x ${{ venta.precio_unitario.toLocaleString() }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-black text-gray-800">$ {{ venta.total.toLocaleString() }}</p>
              <button @click="anularVenta(venta)" class="text-[9px] font-bold text-red-400 uppercase mt-1 hover:text-red-600 transition">Anular 🗑️</button>
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
            <label class="label-admin font-bold">Nombre del producto</label>
            <input type="text" v-model="nuevoProducto.nombre" class="input-admin" required />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label-admin font-bold">Precio ($)</label>
              <input type="number" v-model="nuevoProducto.precio" class="input-admin" required />
            </div>
            <div>
              <label class="label-admin font-bold">Stock</label>
              <input type="number" v-model="nuevoProducto.stock" class="input-admin" required />
            </div>
          </div>
          <div>
            <label class="label-admin font-bold">Categoría</label>
            <select v-model="nuevoProducto.categoria_id" class="input-admin bg-white">
              <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
            </select>
          </div>
          <div class="image-upload-zone">
            <label class="label-admin font-bold">Imagen</label>
            <div class="upload-box relative" :class="{'opacity-60': cargando}">
              <input type="file" id="file-input" @change="previsualizarImagen" accept="image/*" class="hidden" />
              <label for="file-input" class="cursor-pointer block">
                <div v-if="!imgPreview" class="py-10 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">📸 Toca para elegir foto</div>
                <img v-else :src="imgPreview" class="preview-img rounded-2xl max-h-48 w-full object-cover" />
              </label>
            </div>
          </div>
          <button type="submit" class="btn-save-admin bg-red-500 text-white w-full py-4 rounded-2xl font-black shadow-lg shadow-red-200" :disabled="cargando">
            {{ cargando ? 'Procesando...' : (editandoId ? 'Actualizar Cambios' : 'Guardar Producto') }}
          </button>
          <button v-if="editandoId" @click="limpiarFormulario" type="button" class="w-full mt-2 text-gray-400 text-sm">Cancelar</button>
        </form>
      </div>

      <div v-if="vistaActual === 'inventario'" class="space-y-4 px-1 fade-in">
        <div class="flex items-center gap-3 mb-2">
          <input v-model="textoBusqueda" type="text" placeholder="Buscar producto... 🔍" class="input-admin !py-2 text-sm shadow-sm" />
        </div>
        <div v-if="inventarioFiltrado.length === 0" class="text-center py-10 text-gray-400">Sin productos aún.</div>
        <div v-else v-for="prod in inventarioFiltrado" :key="prod.id" class="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm flex items-center gap-4">
          <img :src="prod.imagen_url" class="w-16 h-16 rounded-xl object-cover bg-gray-50" />
          <div class="flex-grow">
            <h3 class="font-bold text-gray-800 text-sm leading-tight">{{ prod.nombre }}</h3>
            <p class="text-red-500 font-bold text-sm">$ {{ prod.precio.toLocaleString() }}</p>
            <p class="text-[10px] text-gray-400">Stock: {{ prod.stock }}</p>
          </div>
          <div class="flex gap-1">
            <button @click="prepararVenta(prod)" class="p-2 bg-green-50 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
            <button @click="prepararEdicion(prod)" class="p-2 bg-blue-50 text-blue-500 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
            <button @click="eliminarProducto(prod)" class="p-2 bg-red-50 text-red-400 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
          </div>
        </div>
      </div>

      <div v-if="vistaActual === 'preview'" class="fade-in">
        <ProductGrid :key="productosCargados.length" :productos="productosCargados" @ver-imagen="() => {}" @agregar="() => {}" />
      </div>

      <div v-if="mostrarModalVenta" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl scale-in">
          <h3 class="text-xl font-black text-gray-800 text-center mb-1">Registrar Venta</h3>
          <p class="text-gray-400 text-[10px] text-center mb-6 uppercase tracking-widest">{{ productoSeleccionadoParaVenta?.nombre }}</p>
          <div class="space-y-4">
            <div>
              <label class="label-admin font-bold">Cantidad</label>
              <input type="number" v-model="cantidadAVender" min="1" :max="productoSeleccionadoParaVenta?.stock" class="input-admin text-center text-xl font-bold" />
              <p class="text-[10px] text-center text-gray-400 mt-1">Disponible: {{ productoSeleccionadoParaVenta?.stock }}</p>
            </div>
            <div>
              <label class="label-admin font-bold">Precio de Venta ($)</label>
              <input type="number" v-model="precioVentaManual" class="input-admin text-center text-xl font-bold text-blue-600 bg-blue-50" />
            </div>
            <div class="bg-gray-800 p-4 rounded-2xl flex justify-between items-center shadow-lg">
              <span class="text-gray-400 font-bold uppercase text-[9px]">Total cobrar</span>
              <span class="text-green-400 font-black text-2xl">$ {{ (cantidadAVender * precioVentaManual).toLocaleString() }}</span>
            </div>
            <button @click="ejecutarVentaConPrecio" class="btn-save-admin bg-red-500 text-white py-4 rounded-2xl w-full font-bold" :disabled="cargando">Confirmar</button>
            <button @click="cerrarModalVenta" class="w-full text-gray-400 text-sm font-bold pt-2 uppercase tracking-tighter">Cancelar</button>
          </div>
        </div>
      </div>
    </main>
  </div>

  <div v-else class="min-h-screen flex items-center justify-center bg-[#f9fafb] px-4">
    <div class="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 fade-in text-center">
      <img src="https://abhcuuyqxyjmunfaosah.supabase.co/storage/v1/object/public/public-assets/logo.jpeg" class="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-red-50" />
      <h2 class="text-2xl font-black text-gray-800 mb-1">Be You Admin</h2>
      <p class="text-gray-400 text-sm mb-8 font-medium">Panel de Control Exclusivo</p>
      <form @submit.prevent="iniciarSesion" class="space-y-4">
        <input v-model="email" type="email" placeholder="Correo" class="input-admin" required />
        <input v-model="password" type="password" placeholder="Contraseña" class="input-admin" required />
        <p v-if="errorLogin" class="text-red-500 text-xs font-bold">{{ errorLogin }}</p>
        <button type="submit" class="btn-save-admin bg-red-500 text-white w-full py-4 rounded-2xl font-bold" :disabled="cargando">Entrar</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { supabase } from '../lib/supabaseClient';
import { 
  subirImagenProducto, 
  crearProducto, 
  fetchCategorias, 
  registrarVenta, 
  fetchVentas, 
  eliminarVenta 
} from '../services/productoService';

// COMPONENTES
import ProductGrid from '../components/ListaProductos.vue'; 

// --- 1. ESTADOS (REFS) ---
const usuarioLogueado = ref(null);
const email = ref('');
const password = ref('');
const errorLogin = ref('');

const vistaActual = ref('inventario'); 
const cargando = ref(false);
const textoBusqueda = ref('');

const categorias = ref([]);
const productosCargados = ref([]);
const ventasCargadas = ref([]);

// Formulario de Producto
const editandoId = ref(null); 
const imagenArchivo = ref(null);
const imgPreview = ref(null);
const nuevoProducto = ref({
  nombre: '',
  precio: null,
  stock: 0,
  categoria_id: null,
  imagen_url: ''
});

// Formulario de Categoría
const nuevaCatNombre = ref('');
const editandoCatId = ref(null);

// Formulario de Ventas (Modal)
const mostrarModalVenta = ref(false);
const productoSeleccionadoParaVenta = ref(null);
const cantidadAVender = ref(1);
const precioVentaManual = ref(0);

// --- 2. LÓGICA COMPUTADA (ESTADÍSTICAS Y FILTROS) ---

const inventarioFiltrado = computed(() => {
  if (!textoBusqueda.value) return productosCargados.value;
  const busqueda = textoBusqueda.value.toLowerCase();
  return productosCargados.value.filter(p => 
    p.nombre.toLowerCase().includes(busqueda) || 
    p.categorias?.nombre?.toLowerCase().includes(busqueda)
  );
});

const stats = computed(() => {
  const hoy = new Date().toLocaleDateString();
  const mesActual = new Date().getMonth();
  const añoActual = new Date().getFullYear();

  return ventasCargadas.value.reduce((acc, venta) => {
    const fechaVenta = new Date(venta.created_at);
    acc.total += venta.total;
    if (fechaVenta.toLocaleDateString() === hoy) acc.hoy += venta.total;
    if (fechaVenta.getMonth() === mesActual && fechaVenta.getFullYear() === añoActual) acc.mes += venta.total;
    return acc;
  }, { hoy: 0, mes: 0, total: 0 });
});

// --- 3. FUNCIONES DE CARGA Y SESIÓN ---

const inicializarDatos = async () => {
  try {
    const datos = await fetchCategorias();
    if (datos && datos.length > 0) {
      categorias.value = datos;
      nuevoProducto.value.categoria_id = datos[0].id;
    }
    await cargarInventario();
    if (vistaActual.value === 'ventas') await cargarVentas();
  } catch (e) {
    console.error("Error inicializando:", e);
  }
};

const cargarInventario = async () => {
  const { data, error } = await supabase
    .from('productos')
    .select('id, nombre, precio, stock, imagen_url, categoria_id, categorias(nombre)')
    .order('created_at', { ascending: false });
  if (!error) {
    productosCargados.value = data.map(p => ({ ...p, img: p.imagen_url }));
  }
};

const cargarVentas = async () => {
  try {
    ventasCargadas.value = await fetchVentas();
  } catch (e) {
    console.error("Error cargando ventas:", e);
  }
};

const iniciarSesion = async () => {
  cargando.value = true;
  errorLogin.value = '';
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value });
    if (error) throw error;
    usuarioLogueado.value = data.user;
    await inicializarDatos();
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

// --- 4. GESTIÓN DE PRODUCTOS ---

const guardarProducto = async () => {
  if (!imagenArchivo.value && !editandoId.value) return alert("¡Falta la foto! 📸");
  cargando.value = true;
  try {
    let url = nuevoProducto.value.imagen_url;
    if (imagenArchivo.value) url = await subirImagenProducto(imagenArchivo.value);
    
    const datosFinales = {
      nombre: nuevoProducto.value.nombre,
      precio: Number(nuevoProducto.value.precio),
      stock: Number(nuevoProducto.value.stock),
      categoria_id: nuevoProducto.value.categoria_id,
      imagen_url: url
    };

    if (editandoId.value) {
      await supabase.from('productos').update(datosFinales).eq('id', editandoId.value);
      alert("✅ ¡Actualizado!");
    } else {
      await crearProducto(datosFinales);
      alert("✅ ¡Guardado!");
    }
    limpiarFormulario();
    await cargarInventario();
    vistaActual.value = 'inventario';
  } catch (error) {
    alert("Error: " + error.message);
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
  if (!confirm(`¿Eliminar "${producto.nombre}"?`)) return;
  cargando.value = true;
  try {
    const partes = producto.imagen_url.split('/');
    const nombreArchivo = partes[partes.length - 1];
    await supabase.storage.from('productos-img').remove([nombreArchivo]);
    await supabase.from('productos').delete().eq('id', producto.id);
    await cargarInventario();
    alert("✅ Eliminado");
  } catch (error) {
    alert("Error al eliminar ❌");
  } finally {
    cargando.value = false;
  }
};

// --- 5. GESTIÓN DE VENTAS ---

const prepararVenta = (prod) => {
  if (prod.stock <= 0) return alert("❌ Sin stock");
  productoSeleccionadoParaVenta.value = prod;
  cantidadAVender.value = 1;
  precioVentaManual.value = prod.precio;
  mostrarModalVenta.value = true;
};

const cerrarModalVenta = () => {
  mostrarModalVenta.value = false;
  productoSeleccionadoParaVenta.value = null;
};

const ejecutarVentaConPrecio = async () => {
  if (cantidadAVender.value > productoSeleccionadoParaVenta.value.stock) return alert("⚠️ Stock insuficiente");
  cargando.value = true;
  try {
    const prodVenta = { ...productoSeleccionadoParaVenta.value, precio: precioVentaManual.value };
    await registrarVenta(prodVenta, cantidadAVender.value);
    cerrarModalVenta();
    await cargarInventario();
    alert("✅ Venta registrada");
  } catch (e) {
    alert("Error en venta ❌");
  } finally {
    cargando.value = false;
  }
};

const anularVenta = async (venta) => {
  if (!confirm(`¿Anular venta de ${venta.productos?.nombre}?`)) return;
  cargando.value = true;
  try {
    await eliminarVenta(venta);
    ventasCargadas.value = ventasCargadas.value.filter(v => v.id !== venta.id);
    
    // Refrescamos el inventario para que se vea el stock recuperado
    await cargarInventario();
    
    alert("✅ Venta anulada: Stock recuperado y registro eliminado.");
  } catch (e) {
    alert("Error: " + e.message);
    // Si hubo un error (como que ya se borró), refrescamos la lista por las dudas
    await cargarVentas(); 
  } finally {
    cargando.value = false;
  }
};

// --- 6. GESTIÓN DE CATEGORÍAS ---

const guardarCategoria = async () => {
  if (!nuevaCatNombre.value) return;
  cargando.value = true;
  const slug = nuevaCatNombre.value.toLowerCase().trim().replace(/\s+/g, '-');
  try {
    if (editandoCatId.value) {
      await supabase.from('categorias').update({ nombre: nuevaCatNombre.value, slug }).eq('id', editandoCatId.value);
    } else {
      await supabase.from('categorias').insert([{ nombre: nuevaCatNombre.value, slug }]);
    }
    nuevaCatNombre.value = '';
    editandoCatId.value = null;
    categorias.value = await fetchCategorias();
  } catch (e) { alert("Error en categoría"); }
  finally { cargando.value = false; }
};

const prepararEdicionCategoria = (cat) => {
  editandoCatId.value = cat.id;
  nuevaCatNombre.value = cat.nombre;
};

const eliminarCategoria = async (cat) => {
  if (!confirm(`¿Borrar "${cat.nombre}"?`)) return;
  try {
    await supabase.from('categorias').delete().eq('id', cat.id);
    categorias.value = await fetchCategorias();
  } catch (e) { alert("Tiene productos asociados 🛍️"); }
};

// --- 7. UTILIDADES Y CICLO DE VIDA ---

const limpiarFormulario = () => {
  editandoId.value = null;
  nuevoProducto.value = { nombre: '', precio: null, stock: 0, categoria_id: categorias.value[0]?.id };
  imagenArchivo.value = null;
  imgPreview.value = null;
};

const previsualizarImagen = (e) => {
  const file = e.target.files[0];
  if (file) {
    imagenArchivo.value = file;
    imgPreview.value = URL.createObjectURL(file);
  }
};

const cambiarVista = (event, vista) => {
  vistaActual.value = vista;
  if (event) event.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
};

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  usuarioLogueado.value = session?.user || null;
  if (usuarioLogueado.value) await inicializarDatos();
});

watch(vistaActual, async (nueva) => {
  if (usuarioLogueado.value) {
    if (nueva === 'inventario' || nueva === 'preview') await cargarInventario();
    if (nueva === 'ventas') await cargarVentas();
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