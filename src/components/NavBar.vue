<template>
  <header class="main-header">
    <div class="header-container">
      <div class="logo-wrapper">
        <img src="https://abhcuuyqxyjmunfaosah.supabase.co/storage/v1/object/public/public-assets/logo.jpeg" alt="Be You Logo" class="brand-logo">
        <div class="brand-text">
          <span class="brand-title">Be You Tienda</span>
          <span class="brand-subtitle">Maquillaje & Accesorios</span>
        </div>
      </div>

      <button @click="$emit('open-cart')" class="cart-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 1a2 2 0 0 0-2 2v2H5V3a3 3 0 1 1 6 0v2h-1V3a2 2 0 0 0-2-2zM5 5H3.36a1.5 1.5 0 0 0-1.483 1.277L.85 13.13A2.5 2.5 0 0 0 3.322 16h9.355a2.5 2.5 0 0 0 2.473-2.87l-1.028-6.853A1.5 1.5 0 0 0 12.64 5H11v1.5a.5.5 0 0 1-1 0V5H6v1.5a.5.5 0 0 1-1 0V5z"/>
        </svg>
        <span>Pedido</span>
        <span class="cart-badge">{{ cantidad }}</span>
      </button>
    </div>
  </header>
</template>

<script setup>
defineProps(['cantidad']);
defineEmits(['open-cart']);
</script>

<style scoped>
.main-header {
  position: sticky;
  top: 0;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 1000;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-wrapper { display: flex; align-items: center; gap: 10px; }
.brand-logo { height: 45px; width: auto; object-fit: contain; }
.brand-text { display: flex; flex-direction: column; }

.brand-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.3rem;
  font-weight: 800;
  color: #be185d;
  line-height: 1;
}

.brand-subtitle {
  font-size: 0.6rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-top: 2px;
}

.cart-button {
  background-color: #fdf2f8;
  color: #db2777;
  border: none;
  padding: 8px 16px;
  border-radius: 50px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.cart-button:active { transform: scale(0.95); }

.cart-badge {
  background: #db2777;
  color: white;
  padding: 2px 8px;
  border-radius: 50px;
  font-size: 0.75rem;
}
</style>