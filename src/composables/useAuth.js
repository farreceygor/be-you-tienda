// src/composables/useAuth.js
import { ref, computed, onUnmounted } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { AppError, ErrorCodes } from '../lib/AppError'
import { logger } from '../lib/logger'

// ═══════════════════════════════════════════════════════════
// ESTADO SINGLETON — compartido por toda la app (router incluido)
// ═══════════════════════════════════════════════════════════
const usuario = ref(null)
let listenerRegistrado = false

export function useAuth() {
  const cargando = ref(false)
  const error = ref(null)

  async function verificarSesion() {
    cargando.value = true
    error.value = null

    try {
      logger.debug('Verificando sesión de usuario')
      
      const { data: { session }, error: err } = await supabase.auth.getSession()

      if (err) {
        throw new AppError(
          'Error al verificar sesión',
          ErrorCodes.AUTH_NO_SESSION,
          { supabaseError: err.message },
          401
        )
      }

      usuario.value = session?.user || null

      logger.info('Sesión verificada', { 
        email: usuario.value?.email || 'sin sesión'
      })

      // Registramos el listener UNA sola vez para toda la app
      if (!listenerRegistrado) {
        supabase.auth.onAuthStateChange((event, session) => {
          usuario.value = session?.user || null
          logger.debug('Evento auth state changed', { 
            event,
            email: usuario.value?.email || 'sin sesión'
          })
        })
        listenerRegistrado = true
      }

      return true
    } catch (err) {
      if (err instanceof AppError) {
        error.value = err.message
        err.loguear()
      } else {
        const appError = new AppError(
          'Error desconocido verificando sesión',
          ErrorCodes.UNKNOWN_ERROR,
          { mensaje: err.message },
          500
        )
        error.value = appError.message
        appError.loguear()
      }
      return false
    } finally {
      cargando.value = false
    }
  }

  async function login(email, password) {
    cargando.value = true
    error.value = null

    try {
      if (!email || !email.includes('@')) {
        throw new AppError('Email inválido', ErrorCodes.AUTH_INVALID_CREDENTIALS, { email }, 400)
      }
      if (!password || password.length < 1) {
        throw new AppError('Contraseña requerida', ErrorCodes.AUTH_INVALID_CREDENTIALS, {}, 400)
      }

      logger.debug('Intentando login', { email })

      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })

      if (err) {
        logger.warn('Login fallido - Credenciales inválidas', { email })
        throw new AppError(
          'Credenciales incorrectas o usuario no existe',
          ErrorCodes.AUTH_INVALID_CREDENTIALS,
          { supabaseCode: err.code, supabaseMessage: err.message },
          401
        )
      }

      if (!data.user) {
        throw new AppError('Error al crear sesión', ErrorCodes.AUTH_INVALID_CREDENTIALS, { estado: 'user es null' }, 401)
      }

      usuario.value = data.user

      logger.info('Login exitoso', { email: data.user.email })

      return data
    } catch (err) {
      if (err instanceof AppError) {
        error.value = err.message
        err.loguear()
        throw err
      }
      const appError = new AppError('Error al iniciar sesión', ErrorCodes.UNKNOWN_ERROR, { mensaje: err.message }, 500)
      error.value = appError.message
      appError.loguear()
      throw appError
    } finally {
      cargando.value = false
    }
  }

  async function logout() {
    cargando.value = true
    error.value = null

    try {
      logger.debug('Cerrando sesión', { email: usuario.value?.email })

      const { error: err } = await supabase.auth.signOut()

      if (err) {
        throw new AppError('Error al cerrar sesión', ErrorCodes.UNKNOWN_ERROR, { supabaseError: err.message }, 500)
      }

      usuario.value = null

      logger.info('Logout exitoso')
    } catch (err) {
      if (err instanceof AppError) {
        error.value = err.message
        err.loguear()
        throw err
      }
      const appError = new AppError('Error desconocido al cerrar sesión', ErrorCodes.UNKNOWN_ERROR, { mensaje: err.message }, 500)
      error.value = appError.message
      appError.loguear()
      throw appError
    } finally {
      cargando.value = false
    }
  }

  return {
    usuario,       // 👈 ahora es el mismo ref para toda la app
    cargando,
    error,
    verificarSesion,
    login,
    logout,
    estaLogueado: computed(() => !!usuario.value),
    esAdmin: computed(() => !!usuario.value)
  }
}