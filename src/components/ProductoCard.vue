<template>
  <div class="product-card" :class="{ 'opacity-60': info.stock <= 0 }">
    <div class="image-container relative">
      <div v-if="info.stock > 1 && info.stock <= 3" class="stock-badge">
        Últimas {{ info.stock }} unidades
      </div>
      <div v-else-if="info.stock === 1" class="stock-badge bg-red-700">
        ¡Última unidad!
      </div>
      <div v-else-if="info.stock <= 0" class="stock-badge bg-gray-500">
        Sin Stock
      </div>

      <img 
        :src="info.img" 
        class="product-image" 
        @click="$emit('ver-imagen', info)"
        :alt="info.nombre" 
      />
    </div>
    
    <h3 class="product-title">{{ info.nombre }}</h3>
    <p class="product-price">$ {{ info.precio.toLocaleString('es-AR') }}</p>

    <div v-if="info.variantes && info.stock > 0" class="mb-3 px-1">
      <label class="text-[10px] uppercase font-bold text-gray-400 block mb-1 text-left">Elegir variedades:</label>
      <!-- ✅ DESPUÉS - Sanitizar en el loop -->
<select 
  v-model="varianteLocal" 
  class="w-full p-2 text-xs border border-gray-200 rounded-lg"
>
  <option value="" disabled selected>Seleccionar...</option>
  <!-- ✅ Sanitizar: split → trim → filter vacías -->
  <option 
    v-for="v in (info.variantes || '')
      .split(',')
      .map(x => x.trim())
      .filter(Boolean)" 
    :key="v" 
    :value="v"
  >
    {{ v }}
  </option>
</select>
    </div>
    
    <button 
      :class="info.stock > 0 ? 'btn-add' : 'btn-disabled'"
      :disabled="info.stock <= 0"
      @click="$emit('agregar', info, varianteLocal)"
    >
      {{ info.stock > 0 ? 'Agregar' : 'Sin Stock' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const props = defineProps(['info']);
const emit = defineEmits(['agregar', 'ver-imagen']);

// Esta variable es ÚNICA para cada tarjeta
const varianteLocal = ref("");
</script>

<style scoped>
.product-card { 
  background: white; 
  padding: 14px; 
  border-radius: 20px; 
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03); 
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
  text-align: center; 
  display: flex;
  flex-direction: column;
  justify-content: space-between; 
}
.product-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(219, 39, 119, 0.1); }
.image-container { width: 100%; height: 180px; background: #f9fafb; border-radius: 12px; overflow: hidden; position: relative; display: flex; align-items: center; }
.product-image { width: 100%; height: 100%; object-fit: contain; cursor: zoom-in; transition: transform 0.3s ease; }
.product-card:hover .product-image { transform: scale(1.05); }

.product-title { 
  font-family: 'Poppins', sans-serif;
  font-weight: 800; 
  font-size: 0.9rem; 
  margin-top: 14px; 
  color: #374151; 
  line-height: 1.3;
  overflow: hidden; 
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2; 
  line-clamp: 2; 
  max-height: 2.6rem; 
}
.product-price { 
  color: #db2777; 
  font-weight: 700; 
  margin: 10px 0 14px 0; 
  font-size: 1.2rem;
  letter-spacing: -0.02em;
}

.btn-add { 
  background: #db2777; 
  color: white; 
  width: 100%; 
  padding: 12px; 
  border-radius: 14px; 
  font-weight: 800; 
  font-size: 0.85rem;
  text-transform: uppercase; 
  letter-spacing: 0.5px;
  border: none; 
  cursor: pointer; 
  transition: all 0.2s;
}
.btn-add:hover { background: #be185d; transform: scale(1.02); }
.btn-disabled { background: #f3f4f6; color: #9ca3af; cursor: not-allowed; width: 100%; padding: 10px; border: none; border-radius: 10px; }

.stock-badge { position: absolute; 
  top: 8px; 
  left: 8px; 
  background: #ef4444;
  color: white;
  font-size: 0.65rem; 
  font-weight: 700; 
  padding: 5px 12px; 
  border-radius: 50px; 
  z-index: 10; 
  text-transform: uppercase; 
  animation: pulse 2s infinite; 
}
.bg-gray-500 { background: #6b7280 !important; animation: none !important; }
.bg-red-700 { background: #b91c1c !important; }

@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
</style>