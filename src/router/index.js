import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'tienda',
    component: () => import('../views/TiendaView.vue')
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminPanel.vue')
  },
  {
    path: '/admin/cobranza',
    name: 'cobranza',
    component: () => import('../views/CobranzaView.vue')
  },
  {
    path: '/admin/estadisticas',
    name: 'estadisticas',
    component: () => import('../views/EstadisticasView.vue')
  },

  {
  path: '/admin/gastos',
  name: 'gastos',
  component: () => import('../views/GastosView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router