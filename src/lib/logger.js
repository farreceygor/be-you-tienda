/**
 * Sistema de logging estructurado para Be You
 * Proporciona niveles de severidad: debug, info, warn, error
 */

const NIVELES = {
    DEBUG: '[DEBUG]',
    INFO: '[INFO]',
    WARN: '[WARN]',
    ERROR: '[ERROR]'
  }
  
  export const logger = {
    /**
     * Logs de desarrollo - solo en modo dev
     */
    debug: (mensaje, datos = null) => {
      if (import.meta.env.DEV) {
        if (datos) {
          console.log(`%c${NIVELES.DEBUG} ${mensaje}`, 'color: #6B6B6B; font-weight: bold;', datos)
        } else {
          console.log(`%c${NIVELES.DEBUG} ${mensaje}`, 'color: #6B6B6B; font-weight: bold;')
        }
      }
    },
  
    /**
     * Logs de información general
     */
    info: (mensaje, datos = null) => {
      if (datos) {
        console.log(`%c${NIVELES.INFO} ${mensaje}`, 'color: #4A8FA8; font-weight: bold;', datos)
      } else {
        console.log(`%c${NIVELES.INFO} ${mensaje}`, 'color: #4A8FA8; font-weight: bold;')
      }
    },
  
    /**
     * Logs de advertencia
     */
    warn: (mensaje, datos = null) => {
      if (datos) {
        console.warn(`%c${NIVELES.WARN} ${mensaje}`, 'color: #E65100; font-weight: bold;', datos)
      } else {
        console.warn(`%c${NIVELES.WARN} ${mensaje}`, 'color: #E65100; font-weight: bold;')
      }
    },
  
    /**
     * Logs de error
     */
    error: (mensaje, error = null) => {
      if (error) {
        console.error(`%c${NIVELES.ERROR} ${mensaje}`, 'color: #C62828; font-weight: bold;', error)
      } else {
        console.error(`%c${NIVELES.ERROR} ${mensaje}`, 'color: #C62828; font-weight: bold;')
      }
    },
  
    /**
     * Log de performance (solo dev)
     */
    perf: (nombre, tiempo) => {
      if (import.meta.env.DEV) {
        console.log(`%c⏱️ ${nombre}`, 'color: #C9748A; font-weight: bold;', `${tiempo}ms`)
      }
    }
  }