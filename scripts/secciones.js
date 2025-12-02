// Función para cargar secciones dinámicamente usando iframes
function cargarSeccion(ruta) {
  document.getElementById("seccion-contenido").src = ruta;
}

// Cargar nombre del maestro desde Supabase al iniciar
async function cargarNombreMaestro() {
  try {
    // Obtenemos el ID del usuario correctamente desde sessionStorage
    const usuarioId = sessionStorage.getItem("usuarioId");
    
    if (!usuarioId) {
      document.getElementById("nombre-maestro").textContent = "Invitado";
      return;
    }

    // Consultamos el nombre del maestro en Supabase
    const { data, error } = await supabase
      .from('users')
      .select('username, role')
      .eq('id', usuarioId)
      .single();

    if (error) {
      console.error('Error al obtener datos del usuario:', error);
      document.getElementById("nombre-maestro").textContent = "Maestro";
      return;
    }

    // Mostrar titulo según rol
    const titulo = data?.role === 'maestro' ? 'Maestr@' : 'Usuario';
    const username = data?.username || 'Usuario';
    document.getElementById("nombre-maestro").textContent = `${titulo} ${username}`;
    
  } catch (error) {
    console.error('Error en cargarNombreMaestro:', error);
    document.getElementById("nombre-maestro").textContent = "Maestro";
  }
}

// Configurar listeners para los enlaces de navegación
function configurarEventListeners() {
  document.getElementById("linkHistorial").addEventListener("click", (e) => {
    e.preventDefault();
    cargarSeccion("historial.html");
  });

  document.getElementById("linkCuentacuentos").addEventListener("click", (e) => {
    e.preventDefault();
    cargarSeccion("cuentacuentos.html");
  });

  document.getElementById("linkMapaMagico").addEventListener("click", (e) => {
    e.preventDefault();
    cargarSeccion("mapamagico.html");
  });

  document.getElementById("linkExploradores").addEventListener("click", (e) => {
    e.preventDefault();
    cargarSeccion("exploradores.html");
  });
}

// Inicialización al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  cargarNombreMaestro();
  configurarEventListeners();

  cargarSeccion("inicio.html"); // 👈 Nueva línea clave
});
