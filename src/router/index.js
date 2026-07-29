// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../composables/useAuth'

// Sacamos el "usuario" singleton — es el mismo ref que usan todos los componentes
const { usuario } = useAuth()

/**
 * Definición de rutas
 */
const routes = [
  {
    path: '/',
    name: 'tienda',
    component: () => import('../views/TiendaView.vue'),
    meta: { requiresAuth: false, titulo: 'Be You - Tienda' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresAuth: false, titulo: 'Iniciar Sesión - Be You' }
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminPanel.vue'),
    meta: { requiresAuth: true, titulo: 'Panel de Administración' }
  },
  {
    path: '/admin/cobranza',
    name: 'cobranza',
    component: () => import('../views/CobranzaView.vue'),
    meta: { requiresAuth: true, titulo: 'Cobranza' }
  },
  {
    path: '/admin/estadisticas',
    name: 'estadisticas',
    component: () => import('../views/EstadisticasView.vue'),
    meta: { requiresAuth: true, titulo: 'Estadísticas' }
  },
  {
    path: '/admin/gastos',
    name: 'gastos',
    component: () => import('../views/GastosView.vue'),
    meta: { requiresAuth: true, titulo: 'Gastos' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/TiendaView.vue'),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

let sesionVerificada = false

/**
 * Verifica la sesión UNA sola vez al iniciar la app.
 * Escribe directamente en el "usuario" singleton de useAuth.
 */
async function verificarSesionInicial() {
  if (sesionVerificada) return

  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('❌ Error verificando sesión:', error)
      usuario.value = null
    } else {
      usuario.value = session?.user || null
      if (import.meta.env.DEV) {
        console.log('✅ Sesión verificada:', usuario.value?.email || 'sin sesión')
      }
    }
  } catch (err) {
    console.error('❌ Error inesperado en verificarSesionInicial:', err)
    usuario.value = null
  } finally {
    sesionVerificada = true
  }
}

/**
 * Guard global del router
 */
router.beforeEach(async (to, from, next) => {
  document.title = to.meta.titulo || 'Be You'

  if (!sesionVerificada) {
    await verificarSesionInicial()
  }

  if (!to.meta.requiresAuth) {
    next()
    return
  }

  if (usuario.value?.email) {
    if (import.meta.env.DEV) {
      console.log(`✅ Acceso permitido a ${to.name} para ${usuario.value.email}`)
    }
    next()
  } else {
    if (import.meta.env.DEV) {
      console.warn(`⛔ Acceso rechazado a ${to.name} - redirigiendo a login`)
    }
    next({ name: 'login', query: { redirect: to.fullPath } })
  }
})

export default router