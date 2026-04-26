import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Cambiado: de ../ a ./

const app = createApp(App)

app.use(router) // Registramos el router
app.mount('#app') // Luego montamos