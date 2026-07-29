// src/lib/AppError.js
/**
 * Clase personalizada para errores de la aplicación
 * Permite mejor logging, debugging y manejo consistente de errores
 */
export class AppError extends Error {
  constructor(
    mensaje,
    codigo = 'APP_ERROR',
    detalles = {},
    statusHttp = 500
  ) {
    super(mensaje)
    this.nombre = 'AppError'
    this.codigo = codigo                    // Código único del error
    this.detalles = detalles                // Información adicional
    this.statusHttp = statusHttp            // Para API REST
    this.timestamp = new Date().toISOString()
  }

  /**
   * Registra el error en consola (solo desarrollo)
   */
  loguear() {
    const esDesarrollo = import.meta.env.DEV
    const nivel = this.statusHttp >= 500 ? '🔴 ERROR' : '🟡 WARN'

    if (esDesarrollo) {
      console.group(`${nivel} [${this.codigo}]`)
      console.error(`Mensaje: ${this.message}`)
      console.error(`HTTP: ${this.statusHttp}`)
      console.error(`Timestamp: ${this.timestamp}`)
      if (Object.keys(this.detalles).length > 0) {
        console.error('Detalles:', this.detalles)
      }
      console.groupEnd()
    }
  }

  /**
   * Convierte el error a objeto JSON (útil para enviar a servidor)
   */
  toJSON() {
    return {
      nombre: this.nombre,
      mensaje: this.message,
      codigo: this.codigo,
      timestamp: this.timestamp,
      detalles: import.meta.env.DEV ? this.detalles : {} // Ocultar detalles en prod
    }
  }
}

/**
 * Códigos de error predefinidos (para mantener consistencia)
 */
export const ErrorCodes = {
  // Autenticación
  AUTH_NO_SESSION: 'AUTH_NO_SESSION',
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',

  // Productos
  PRODUCTO_NOT_FOUND: 'PRODUCTO_NOT_FOUND',
  PRODUCTO_INVALID_DATA: 'PRODUCTO_INVALID_DATA',
  PRODUCTO_IMAGE_UPLOAD_ERROR: 'PRODUCTO_IMAGE_UPLOAD_ERROR',

  // Pedidos
  PEDIDO_INVALID_ITEMS: 'PEDIDO_INVALID_ITEMS',
  PEDIDO_STOCK_INSUFFICIENT: 'PEDIDO_STOCK_INSUFFICIENT',
  PEDIDO_CREATION_ERROR: 'PEDIDO_CREATION_ERROR',

  // Archivo
  FILE_INVALID_TYPE: 'FILE_INVALID_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',

  // Base de datos
  DATABASE_ERROR: 'DATABASE_ERROR',
  DATABASE_CONSTRAINT_ERROR: 'DATABASE_CONSTRAINT_ERROR',

  // Genéricos
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
}