import { createRouter, createWebHistory } from 'vue-router'
// Importamos la tienda (que moviste a views) y el Admin
import TiendaView from '../views/TiendaView.vue'
import AdminPanel from '../views/AdminPanel.vue'

const routes = [
  {
    path: '/',
    name: 'tienda',
    component: TiendaView
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminPanel
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router