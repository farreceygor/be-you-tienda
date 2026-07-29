// src/lib/fileValidator.js
import { AppError, ErrorCodes } from './AppError'

/**
 * Configuración de validación de archivos
 */
export const CONFIG_ARCHIVO = {
  IMAGEN: {
    tiposPermitidos: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeMB: 5,
    extensionesPermitidas: ['jpg', 'jpeg', 'png', 'webp']
  }
}

/**
 * Valida un archivo de imagen
 * @param {File} archivo - Archivo a validar
 * @throws {AppError} Si la validación falla
 * @returns {Object} Datos validados del archivo
 */
export function validarImagenProducto(archivo) {
  if (!archivo) {
    throw new AppError(
      'No se seleccionó ningún archivo',
      ErrorCodes.FILE_INVALID_TYPE,
      { tipo: 'Archivo' },
      400
    )
  }

  // 1. VALIDAR TIPO DE ARCHIVO
  const tiposPermitidos = CONFIG_ARCHIVO.IMAGEN.tiposPermitidos
  if (!tiposPermitidos.includes(archivo.type)) {
    throw new AppError(
      `Tipo de archivo no permitido. Solo se aceptan: ${tiposPermitidos.join(', ')}`,
      ErrorCodes.FILE_INVALID_TYPE,
      {
        tipoEnviado: archivo.type,
        tiposPermitidos
      },
      400
    )
  }

  // 2. VALIDAR TAMAÑO
  const maxSizeBytes = CONFIG_ARCHIVO.IMAGEN.maxSizeMB * 1024 * 1024
  if (archivo.size > maxSizeBytes) {
    throw new AppError(
      `El archivo es muy grande. Máximo: ${CONFIG_ARCHIVO.IMAGEN.maxSizeMB}MB, enviado: ${(archivo.size / 1024 / 1024).toFixed(2)}MB`,
      ErrorCodes.FILE_TOO_LARGE,
      {
        tamanioArchivo: archivo.size,
        tamanioMaximo: maxSizeBytes,
        archivos: archivo.name
      },
      400
    )
  }

  // 3. VALIDAR NOMBRE DE ARCHIVO (evitar path traversal)
  const nombreOriginal = archivo.name
  if (nombreOriginal.includes('/') || nombreOriginal.includes('\\')) {
    throw new AppError(
      'El nombre del archivo no es válido',
      ErrorCodes.FILE_INVALID_TYPE,
      { nombre: nombreOriginal },
      400
    )
  }

  // 4. EXTRAER EXTENSIÓN SEGURA
  const extension = nombreOriginal
    .split('.')
    .pop()
    .toLowerCase()

  if (!CONFIG_ARCHIVO.IMAGEN.extensionesPermitidas.includes(extension)) {
    throw new AppError(
      `Extensión no permitida: .${extension}`,
      ErrorCodes.FILE_INVALID_TYPE,
      { extension },
      400
    )
  }

  // 5. GENERAR NOMBRE SEGURO
  // Formato: timestamp_randomId.extension
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)
  const nombreSeguro = `${timestamp}_${randomId}.${extension}`

  return {
    nombreOriginal,
    nombreSeguro,
    extension,
    tipo: archivo.type,
    tamanio: archivo.size,
    esValido: true
  }
}

/**
 * Genera un nombre seguro para un archivo
 * @param {string} extension - Extensión del archivo (ej: 'jpg')
 * @returns {string} Nombre seguro
 */
export function generarNombreArchivoSeguro(extension) {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)
  return `${timestamp}_${randomId}.${extension.toLowerCase()}`
}