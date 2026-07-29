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

router.beforeEach(async (to, from, next) => {
  document.title = to.meta.titulo || 'Be You'

  // Si no requiere auth, permitir
  if (!to.meta.requiresAuth) {
    next()
    return
  }

  // 🔑 ESTRATEGIA: Verificar sesión SOLO la primera vez
  if (!sesionVerificada) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      usuario.value = session?.user || null
      sesionVerificada = true
    } catch (error) {
      console.error('Error verificando sesión inicial:', error)
      return next({ name: 'login' })
    }
  }

  // Ahora SOLO verificar el estado actual (sin consultar servidor)
  if (usuario.value) {
    next()
  } else {
    next({ name: 'login', query: { redirect: to.fullPath } })
  }
})

export default router