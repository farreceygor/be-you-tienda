<template>
    <!-- ✅ Modal backdrop -->
    <transition name="modal-fade">
      <div v-if="isVisible" class="confirm-overlay" @click.self="cancel">
        <div class="confirm-dialog">
          <!-- Header -->
          <div class="confirm-header">
            <h3 class="confirm-title">{{ titulo }}</h3>
            <button class="confirm-close" @click="cancel">✕</button>
          </div>
  
          <!-- Body -->
          <div class="confirm-body">
            <p class="confirm-mensaje">{{ mensaje }}</p>
          </div>
  
          <!-- Footer con botones -->
          <div class="confirm-footer">
            <button 
              class="btn-cancel" 
              @click="cancel"
              :disabled="cargando"
            >
              Cancelar
            </button>
            <button 
              class="btn-confirm" 
              :class="{ 'btn-confirm--danger': isDanger }"
              @click="confirmar"
              :disabled="cargando"
            >
              {{ cargando ? '...' : textoBoton }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </template>
  
  <script setup>
  defineProps({
    isVisible: {
      type: Boolean,
      required: true
    },
    titulo: {
      type: String,
      default: 'Confirmar acción'
    },
    mensaje: {
      type: String,
      required: true
    },
    textoBoton: {
      type: String,
      default: 'Confirmar'
    },
    isDanger: {
      type: Boolean,
      default: false  // true = rojo (peligro), false = normal
    },
    cargando: {
      type: Boolean,
      default: false
    }
  })
  
  const emit = defineEmits(['confirmar', 'cancelar'])
  
  function confirmar() {
    emit('confirmar')
  }
  
  function cancel() {
    emit('cancelar')
  }
  </script>
  
  <style scoped>
  /* Variables */
  :root {
    --rose: #C9748A;
    --rose-dark: #8B4A5C;
    --charcoal: #2D2D2D;
    --mid: #6B6B6B;
    --border: #EDE4E1;
    --white: #FFFFFF;
    --danger: #C62828;
    --radius: 10px;
    --trans: 0.2s ease;
  }
  
  /* Overlay */
  .confirm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    backdrop-filter: blur(4px);
    padding: 20px;
  }
  
  /* Dialog Card */
  .confirm-dialog {
    background: var(--white);
    border-radius: var(--radius);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 420px;
    width: 100%;
    overflow: hidden;
    animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Header */
  .confirm-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
  }
  
  .confirm-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--charcoal);
    margin: 0;
  }
  
  .confirm-close {
    background: none;
    border: none;
    color: var(--mid);
    font-size: 20px;
    cursor: pointer;
    padding: 4px;
    transition: color var(--trans);
  }
  
  .confirm-close:hover {
    color: var(--rose);
  }
  
  /* Body */
  .confirm-body {
    padding: 20px;
    min-height: 60px;
    display: flex;
    align-items: center;
  }
  
  .confirm-mensaje {
    font-size: 14px;
    color: var(--mid);
    line-height: 1.6;
    margin: 0;
  }
  
  /* Footer */
  .confirm-footer {
    display: flex;
    gap: 10px;
    padding: 14px 20px;
    border-top: 1px solid var(--border);
    justify-content: flex-end;
  }
  
  /* Botones */
  .btn-cancel,
  .btn-confirm {
    padding: 9px 18px;
    border: 1.5px solid var(--border);
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--trans);
    font-family: inherit;
    white-space: nowrap;
  }
  
  .btn-cancel {
    background: var(--white);
    color: var(--mid);
  }
  
  .btn-cancel:hover:not(:disabled) {
    border-color: var(--mid);
    color: var(--charcoal);
  }
  
  .btn-cancel:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* Botón normal (azul) */
  .btn-confirm {
    background: var(--rose);
    color: white;
    border-color: var(--rose);
  }
  
  .btn-confirm:hover:not(:disabled) {
    background: var(--rose-dark);
    border-color: var(--rose-dark);
    transform: translateY(-1px);
  }
  
  /* Botón peligro (rojo) */
  .btn-confirm--danger {
    background: var(--danger);
    border-color: var(--danger);
  }
  
  .btn-confirm--danger:hover:not(:disabled) {
    background: #B71C1C;
    border-color: #B71C1C;
  }
  
  .btn-confirm:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  /* Animación de fade */
  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: all 0.3s ease;
  }
  
  .modal-fade-enter-from,
  .modal-fade-leave-to {
    opacity: 0;
  }
  
  .modal-fade-enter-from .confirm-dialog,
  .modal-fade-leave-to .confirm-dialog {
    transform: translateY(20px);
  }
  
  /* Responsive */
  @media (max-width: 480px) {
    .confirm-dialog {
      max-width: 90%;
    }
  
    .confirm-footer {
      flex-direction: column-reverse;
      gap: 8px;
    }
  
    .btn-cancel,
    .btn-confirm {
      width: 100%;
    }
  }
  </style>