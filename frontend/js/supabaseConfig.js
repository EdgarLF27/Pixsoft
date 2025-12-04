// Configuración de Supabase
// IMPORTANTE: Reemplaza estos valores con tus credenciales reales de Supabase

const SUPABASE_URL = "https://twzakkmqyjchdihxkinp.supabase.co"; // Ejemplo: 'https://xxxxx.supabase.co'
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3emFra21xeWpjaGRpaHhraW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NjEyMDksImV4cCI6MjA4MDQzNzIwOX0.W4QbqH6lZL8a33stnMpT0UBYsHJ8NYBeZMeeDB8PCe4"; // Tu clave pública de Supabase

// URL del backend Django
const BACKEND_URL = "http://localhost:8000"; // Ajusta según tu configuración

// Exportar configuración
if (typeof module !== "undefined" && module.exports) {
  module.exports = { SUPABASE_URL, SUPABASE_ANON_KEY, BACKEND_URL };
}
