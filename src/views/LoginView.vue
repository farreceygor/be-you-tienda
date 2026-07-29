<template>
  <div class="login-container">
    <!-- FONDO DECORATIVO -->
    <div class="login-bg"></div>

    <!-- TARJETA DE LOGIN -->
    <div class="login-card">
      <!-- ENCABEZADO -->
      <div class="login-header">
        <img
          src="https://abhcuuyqxyjmunfaosah.supabase.co/storage/v1/object/public/public-assets/logo.jpeg"
          alt="Be You"
          class="login-logo"
        />
        <h1 class="login-titulo">Be You</h1>
        <p class="login-subtitulo">Panel Administrativo</p>
      </div>

      <!-- FORMULARIO -->
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Campo Email -->
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="tu@correo.com"
            required
            :disabled="cargando"
            autocomplete="email"
          />
        </div>

        <!-- Campo Password -->
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            :disabled="cargando"
            autocomplete="current-password"
          />
        </div>

        <!-- Error Message -->
        <div v-if="errorLogin" class="error-message">
          ⚠️ {{ errorLogin }}
        </div>

        <!-- Botón Login -->
        <button type="submit" class="btn-login" :disabled="cargando">
          {{ cargando ? '⏳ Entrando...' : '✅ Entrar al Panel' }}
        </button>
      </form>

      <!-- Volver a Tienda -->
      <div class="login-footer">
        <p>¿No tienes acceso?</p>
        <router-link to="/" class="btn-volver">
          ← Volver a la tienda
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { login, cargando } = useAuth()

const email = ref('')
const password = ref('')
const errorLogin = ref('')

/**
 * Maneja el login del administrador
 */
async function handleLogin() {
  errorLogin.value = ''

  try {
    // Validación básica
    if (!email.value || !password.value) {
      errorLogin.value = 'Por favor completa todos los campos'
      return
    }

    if (!email.value.includes('@')) {
      errorLogin.value = 'Email inválido'
      return
    }

    if (import.meta.env.DEV) {
      console.log('🔐 Intentando login con:', email.value)
    }

    // Intentar login
    await login(email.value, password.value)

    if (import.meta.env.DEV) {
      console.log('✅ Login exitoso, redirigiendo a admin...')
    }

    // Esperar un poco para que la sesión se establezca completamente
    await new Promise(resolve => setTimeout(resolve, 500))

    // Navegar a admin
    router.push({ name: 'admin' })
  } catch (error) {
    errorLogin.value = error.message || 'Error al iniciar sesión'
    if (import.meta.env.DEV) {
      console.error('❌ Error de login:', error)
    }
  }
}
</script>

<style scoped>
/* Variables de colores */
:root {
  --rose: #C9748A;
  --rose-dark: #8B4A5C;
  --charcoal: #2D2D2D;
  --mid: #6B6B6B;
  --border: #EDE4E1;
  --white: #FFFFFF;
  --cream: #FFFAF9;
}

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--cream);
  position: relative;
  overflow: hidden;
}

/* FONDO DECORATIVO */
.login-bg {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #3D1A25 0%, #7A3350 50%, #C9748A 100%);
  opacity: 0.08;
  pointer-events: none;
  z-index: 1;
}

/* TARJETA PRINCIPAL */
.login-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 40px 32px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 2;
}

@media (max-width: 480px) {
  .login-card {
    padding: 32px 20px;
    border-radius: 16px;
  }
}

/* ENCABEZADO */
.login-header {
  margin-bottom: 32px;
  text-align: center;
}

.login-logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--rose);
  margin-bottom: 16px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.login-titulo {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--rose-dark);
  margin: 0 0 4px 0;
  font-family: 'Playfair Display', Georgia, serif;
}

.login-subtitulo {
  font-size: 13px;
  color: var(--mid);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* FORMULARIO */
.login-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 11px;
  font-weight: 700;
  color: var(--mid);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 6px;
}

.form-group input {
  padding: 12px 14px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  color: var(--charcoal);
  background: var(--cream);
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--rose);
  background: var(--white);
  box-shadow: 0 0 0 3px rgba(201, 116, 138, 0.15);
}

.form-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

/* MENSAJE DE ERROR */
.error-message {
  background: #FEEBEE;
  border: 1px solid #FFCDD2;
  color: #C62828;
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 18px;
  text-align: center;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* BOTÓN LOGIN */
.btn-login {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--rose) 0%, var(--rose-dark) 100%);
  color: var(--white);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  box-shadow: 0 4px 16px rgba(201, 116, 138, 0.3);
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(201, 116, 138, 0.4);
}

.btn-login:active:not(:disabled) {
  transform: translateY(0);
}

.btn-login:disabled {
  background: #CCCCCC;
  cursor: not-allowed;
  box-shadow: none;
}

/* FOOTER */
.login-footer {
  border-top: 1px solid var(--border);
  padding-top: 20px;
  text-align: center;
}

.login-footer p {
  font-size: 13px;
  color: var(--mid);
  margin: 0 0 10px 0;
}

.btn-volver {
  display: inline-block;
  font-size: 13px;
  color: var(--rose);
  text-decoration: none;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.2s ease;
}

.btn-volver:hover {
  background: var(--rose);
  color: var(--white);
}
</style>