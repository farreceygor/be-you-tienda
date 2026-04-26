<template>
  <div class="grid-layout">
    <ProductoCard 
      v-for="p in productos" 
      :key="p.id" 
      :info="p" 
      @agregar="(prod, varElegida) => $emit('agregar', prod, varElegida)"
      @ver-imagen="$emit('ver-imagen', $event)" 
    />
  </div>
</template>

<script setup>
import ProductoCard from './ProductoCard.vue';
defineProps(['productos']);
defineEmits(['agregar', 'ver-imagen']);
</script>

<style scoped>
.grid-layout {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 12px;
}

@media (min-width: 768px) {
  .grid-layout {
    grid-template-columns: repeat(4, 1fr);
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
  }
}
</style>