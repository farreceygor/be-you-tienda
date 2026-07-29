// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// ═══════════════════════════════════════════════════════════
// VALIDACIÓN DE VARIABLES DE ENTORNO
// ═══════════════════════════════════════════════════════════
// Esto se ejecuta ANTES de que la app funcione
function validarVariablesDeEntorno() {
  const variables = {
    'VITE_SUPABASE_URL': supabaseUrl,
    'VITE_SUPABASE_ANON_KEY': supabaseKey
  }

  const faltantes = Object.entries(variables)
    .filter(([_, valor]) => !valor)
    .map(([nombre]) => nombre)

  if (faltantes.length > 0) {
    const mensaje = `
      ❌ ERROR DE CONFIGURACIÓN
      
      Faltan las siguientes variables de entorno:
      ${faltantes.map(v => `  - ${v}`).join('\n')}
      
      Instrucciones:
      1. Copia .env.example a .env
      2. Obtén tus valores en: https://app.supabase.com/project/[tu-proyecto]/settings/api
      3. Reemplaza xxxxx con tus valores reales
      4. Reinicia el servidor (npm run dev)
      
      ⚠️ NUNCA subas .env a Git
    `
    console.error(mensaje)
    throw new Error(`Faltan variables de entorno: ${faltantes.join(', ')}`)
  }

  // Validar formato de URL
  if (!supabaseUrl.startsWith('https://')) {
    throw new Error(
      `VITE_SUPABASE_URL debe ser una URL válida (ej: https://xxxxx.supabase.co)`
    )
  }

  if (!supabaseKey.startsWith('eyJ')) {
    console.warn(
      '⚠️ VITE_SUPABASE_ANON_KEY no parece válida. Verifica que sea una JWT válida'
    )
  }
}

// Ejecutar validación
validarVariablesDeEntorno()

// ═══════════════════════════════════════════════════════════
// CREAR CLIENTE SUPABASE
// ═══════════════════════════════════════════════════════════
export const supabase = createClient(supabaseUrl, supabaseKey)

// Log en desarrollo (ayuda a debugging)
if (import.meta.env.DEV) {
  console.log('✅ Supabase inicializado correctamente')
  console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`)
}