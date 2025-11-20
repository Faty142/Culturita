// Configuración correcta para el navegador (usando CDN)
const supabase = window.supabase.createClient(
  'https://gpykotfudceamuzanawa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdweWtvdGZ1ZGNlYW11emFuYXdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwOTM4NTAsImV4cCI6MjA2OTY2OTg1MH0.dirS5jS-L3F_dbhEk1ZqfVGPdQDyn4aeoaR02fQK6sI'
);

// Opcional: Exporta para depuración
window.supabaseClient = supabase;