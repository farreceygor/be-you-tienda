// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

/**
 * Definición de rutas
 */
const routes = [
  // RUTAS PÚBLICAS
  {
    path: '/',
    name: 'tienda',
    component: () => import('../views/TiendaView.vue'),
    meta: {
      requiresAuth: false,
      titulo: 'Be You - Tienda'
    }
  },

  // LOGIN (pública pero importante)
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: {
      requiresAuth: false,
      titulo: 'Iniciar Sesión - Be You'
    }
  },

  // RUTAS PROTEGIDAS (requieren login)
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminPanel.vue'),
    meta: {
      requiresAuth: true,
      titulo: 'Panel de Administración'
    }
  },

  {
    path: '/admin/cobranza',
    name: 'cobranza',
    component: () => import('../views/CobranzaView.vue'),
    meta: {
      requiresAuth: true,
      titulo: 'Cobranza'
    }
  },

  {
    path: '/admin/estadisticas',
    name: 'estadisticas',
    component: () => import('../views/EstadisticasView.vue'),
    meta: {
      requiresAuth: true,
      titulo: 'Estadísticas'
    }
  },

  {
    path: '/admin/gastos',
    name: 'gastos',
    component: () => import('../views/GastosView.vue'),
    meta: {
      requiresAuth: true,
      titulo: 'Gastos'
    }
  },

  // RUTA 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/TiendaView.vue'),
    meta: {
      requiresAuth: false
    }
  }
]

/**
 * Crear router
 */
const router = createRouter({
  history: createWebHistory(),
  routes
})

let sesionVerificada = false
let usuarioActual = null

/**
 * Verificar sesión una sola vez al iniciar la app
 */
async function verificarSesionInicial() {
  if (sesionVerificada) return

  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('❌ Error verificando sesión:', error)
      usuarioActual = null
    } else {
      usuarioActual = session?.user || null
      if (import.meta.env.DEV) {
        console.log('✅ Sesión verificada:', usuarioActual?.email || 'sin sesión')
      }
    }

    sesionVerificada = true
  } catch (err) {
    console.error('❌ Error inesperado en verificarSesionInicial:', err)
    usuarioActual = null
    sesionVerificada = true
  }
}

/**
 * Escuchar cambios de autenticación en tiempo real
 */
supabase.auth.onAuthStateChange((event, session) => {
  usuarioActual = session?.user || null
  if (import.meta.env.DEV) {
    console.log(`🔔 Auth cambió (${event}):`, usuarioActual?.email || 'sin sesión')
  }
})

/**
 * Guard global del router
 */
router.beforeEach(async (to, from, next) => {
  document.title = to.meta.titulo || 'Be You'

  // Verificar sesión la primera vez
  if (!sesionVerificada) {
    await verificarSesionInicial()
  }

  // Si no requiere auth, permitir
  if (!to.meta.requiresAuth) {
    next()
    return
  }

  // Si requiere auth, verificar que haya usuario
  if (usuarioActual?.email) {
    // ✅ Usuario autenticado
    if (import.meta.env.DEV) {
      console.log(`✅ Acceso permitido a ${to.name} para ${usuarioActual.email}`)
    }
    next()
  } else {
    // ❌ Sin autenticación
    if (import.meta.env.DEV) {
      console.warn(`⛔ Acceso rechazado a ${to.name} - redirigiendo a login`)
    }
    next({ name: 'login', query: { redirect: to.fullPath } })
  }
})

export default router
