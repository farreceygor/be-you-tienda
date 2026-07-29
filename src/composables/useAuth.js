// src/composables/useAuth.js
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { AppError, ErrorCodes } from '../lib/AppError'

/**
 * Composable para manejar autenticación
 * Proporciona login, logout y estado del usuario
 */
export function useAuth() {
  const usuario = ref(null)
  const cargando = ref(false)
  const error = ref(null)
  let unsubscribe = null

  /**
   * Verifica si hay sesión activa al iniciar la app
   */
  async function verificarSesion() {
    cargando.value = true
    error.value = null

    try {
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

      if (import.meta.env.DEV) {
        console.log('✅ Sesión verificada:', usuario.value?.email || 'sin sesión')
      }

      // Escuchar cambios de autenticación en TIEMPO REAL
      if (unsubscribe) {
        unsubscribe()
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          usuario.value = session?.user || null

          if (import.meta.env.DEV) {
            console.log('🔔 Evento auth:', event, usuario.value?.email || 'sin sesión')
          }
        }
      )

      unsubscribe = subscription?.unsubscribe

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

  /**
   * Inicia sesión con email y contraseña
   */
  async function login(email, password) {
    cargando.value = true
    error.value = null

    try {
      // Validaciones básicas
      if (!email || !email.includes('@')) {
        throw new AppError(
          'Email inválido',
          ErrorCodes.AUTH_INVALID_CREDENTIALS,
          { email },
          400
        )
      }

      if (!password || password.length < 1) {
        throw new AppError(
          'Contraseña requerida',
          ErrorCodes.AUTH_INVALID_CREDENTIALS,
          {},
          400
        )
      }

      // Realizar login
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (err) {
        throw new AppError(
          'Credenciales incorrectas o usuario no existe',
          ErrorCodes.AUTH_INVALID_CREDENTIALS,
          { supabaseCode: err.code, supabaseMessage: err.message },
          401
        )
      }

      if (!data.user) {
        throw new AppError(
          'Error al crear sesión',
          ErrorCodes.AUTH_INVALID_CREDENTIALS,
          { estado: 'user es null' },
          401
        )
      }

      usuario.value = data.user

      if (import.meta.env.DEV) {
        console.log('✅ Login exitoso:', data.user.email)
      }

      return data
    } catch (err) {
      if (err instanceof AppError) {
        error.value = err.message
        err.loguear()
        throw err
      }

      const appError = new AppError(
        'Error al iniciar sesión',
        ErrorCodes.UNKNOWN_ERROR,
        { mensaje: err.message },
        500
      )
      error.value = appError.message
      appError.loguear()
      throw appError
    } finally {
      cargando.value = false
    }
  }

  /**
   * Cierra sesión
   */
  async function logout() {
    cargando.value = true
    error.value = null

    try {
      const { error: err } = await supabase.auth.signOut()

      if (err) {
        throw new AppError(
          'Error al cerrar sesión',
          ErrorCodes.UNKNOWN_ERROR,
          { supabaseError: err.message },
          500
        )
      }

      usuario.value = null

      if (import.meta.env.DEV) {
        console.log('✅ Logout exitoso')
      }
    } catch (err) {
      if (err instanceof AppError) {
        error.value = err.message
        err.loguear()
        throw err
      }

      const appError = new AppError(
        'Error desconocido al cerrar sesión',
        ErrorCodes.UNKNOWN_ERROR,
        { mensaje: err.message },
        500
      )
      error.value = appError.message
      appError.loguear()
      throw appError
    } finally {
      cargando.value = false
    }
  }

  // Limpiar subscripción cuando el composable se desmonta
  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  return {
    usuario,
    cargando,
    error,
    verificarSesion,
    login,
    logout,
    estaLogueado: computed(() => !!usuario.value),
    esAdmin: computed(() => !!usuario.value)
  }
}