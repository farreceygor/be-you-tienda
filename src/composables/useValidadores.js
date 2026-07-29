// src/composables/useValidadores.js
import { AppError, ErrorCodes } from '../lib/AppError'

/**
 * Validadores reutilizables para la aplicación
 */
export function useValidadores() {
  
  /**
   * Valida datos de un producto
   * @param {Object} producto
   * @returns {Array<string>} Array de errores (vacío si es válido)
   */
  function validarProducto(producto) {
    const errores = []

    // NOMBRE
    if (!producto.nombre?.trim()) {
      errores.push('El nombre es obligatorio')
    } else if (producto.nombre.length < 3) {
      errores.push('El nombre debe tener al menos 3 caracteres')
    } else if (producto.nombre.length > 100) {
      errores.push('El nombre no puede superar 100 caracteres')
    }

    // PRECIO
    if (producto.precio === null || producto.precio === undefined || producto.precio === '') {
      errores.push('El precio es obligatorio')
    } else if (isNaN(producto.precio) || Number(producto.precio) <= 0) {
      errores.push('El precio debe ser un número mayor a 0')
    } else if (Number(producto.precio) > 999999) {
      errores.push('El precio es demasiado alto (máx. 999999)')
    }

    // STOCK
    if (producto.stock === null || producto.stock === undefined || producto.stock === '') {
      errores.push('El stock es obligatorio')
    } else if (!Number.isInteger(Number(producto.stock)) || Number(producto.stock) < 0) {
      errores.push('El stock debe ser un número entero positivo')
    }

    // CATEGORÍA
    if (!producto.categoria_id) {
      errores.push('Debes seleccionar una categoría')
    }

    return errores
  }

  /**
   * Valida datos de una categoría
   * @param {string} nombre
   * @returns {Array<string>} Array de errores
   */
  function validarCategoria(nombre) {
    const errores = []

    if (!nombre?.trim()) {
      errores.push('El nombre es obligatorio')
    } else if (nombre.length < 2) {
      errores.push('El nombre debe tener al menos 2 caracteres')
    } else if (nombre.length > 50) {
      errores.push('El nombre no puede superar 50 caracteres')
    }

    return errores
  }

  /**
   * Valida datos de un pedido
   * @param {Array} items
   * @param {number} total
   * @returns {Array<string>} Array de errores
   */
  function validarPedido(items, total) {
    const errores = []

    if (!Array.isArray(items) || items.length === 0) {
      errores.push('El pedido debe tener al menos un producto')
    }

    if (total === null || total === undefined || isNaN(total) || Number(total) <= 0) {
      errores.push('El total debe ser mayor a 0')
    }

    return errores
  }

  /**
   * Valida datos de un cliente
   * @param {Object} cliente
   * @returns {Array<string>} Array de errores
   */
  function validarCliente(cliente) {
    const errores = []

    if (cliente.email) {
      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!regexEmail.test(cliente.email)) {
        errores.push('El email no es válido')
      }
    }

    if (cliente.telefono) {
      // Solo números, +, -, espacio
      const regexTelefono = /^[+\d\s\-()]+$/
      if (!regexTelefono.test(cliente.telefono)) {
        errores.push('El teléfono contiene caracteres inválidos')
      }
    }

    return errores
  }

  /**
   * Convierte errores de validación a AppError
   * @param {Array<string>} errores
   * @param {string} contexto - Dónde ocurrió el error
   * @throws {AppError}
   */
  function lanzarErroresValidacion(errores, contexto = 'Validación') {
    if (errores.length === 0) return

    throw new AppError(
      errores[0], // Mostrar primer error
      ErrorCodes.PRODUCTO_INVALID_DATA,
      { 
        contexto,
        erroresCompletos: errores 
      },
      400
    )
  }

  return {
    validarProducto,
    validarCategoria,
    validarPedido,
    validarCliente,
    lanzarErroresValidacion
  }
}