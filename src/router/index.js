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

/**
 * Guard global para proteger rutas
 */
router.beforeEach(async (to, from, next) => {
  // Actualizar título de página
  document.title = to.meta.titulo || 'Be You'

  // Si NO requiere autenticación, permitir acceso
  if (!to.meta.requiresAuth) {
    next()
    return
  }

  // Si está yendo a una ruta protegida, verificar sesión
  try {
    // Obtener sesión actual
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      // ✅ Usuario autenticado, permitir acceso
      if (import.meta.env.DEV) {
        console.log(`✅ Acceso permitido a ${to.name} para ${session.user.email}`)
      }
      next()
    } else {
      // ❌ Sin autenticación, redirigir a login
      if (import.meta.env.DEV) {
        console.warn(`⛔ Acceso rechazado a ${to.name} - sin sesión, redirigiendo a login`)
      }
      next({ name: 'login', query: { redirect: to.fullPath } })
    }
  } catch (error) {
    console.error('❌ Error verificando autenticación:', error)
    next({ name: 'login' })
  }
})

export default router