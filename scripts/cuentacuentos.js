// Verificación inicial de datso de sesión
console.log("Datos de sesión:", {
  rol: sessionStorage.getItem("rol"),
  usuarioId: sessionStorage.getItem("usuarioId"),
  nombreUsuario: sessionStorage.getItem("usuarioNombre"),
  maestroId: sessionStorage.getItem("maestroId")
});

// Inicialización de varialbles con datos de sesión
const rol = sessionStorage.getItem("rol");
const usuarioId = sessionStorage.getItem("usuarioId");
const nombreUsuario = sessionStorage.getItem("usuarioNombre");
let maestroId = sessionStorage.getItem("maestroId");

// Para maestros, asegura que maestroId = usuarioId
if (rol === "maestro" && !maestroId) {
    maestroId = usuarioId;
    sessionStorage.setItem("maestroId", maestroId);
}

console.log("IDs para depuración:", {rol, usuarioId, nombreUsuario, maestroId});
console.log("Maestro ID a usar:", maestroId); // Verificación crítica

// Inicialización de managers
const manager = new CuentaCuentosManager(); // Gestiona audios
const historialManager = new HistorialManager(maestroId); // Gestiona historial

// Función para mostrar notificaciones temporales
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg text-white ${
    type === 'error' ? 'bg-red-500' : 
    type === 'success' ? 'bg-green-500' : 'bg-blue-500'
  }`;
  notification.textContent = message;
  document.body.appendChild(notification);
    
  setTimeout(() => notification.remove(), 5000); // Autoelimina después de 5 seg
}

// Función para renderizar los audios (antes de initCuentaCuentos para hosting)
async function renderizarAudios() {
  const listaAudiosContainer = document.getElementById("listaAudios");
  console.log("Renderizando audios para maestro:", maestroId);
  listaAudiosContainer.innerHTML = '<p class="italic">Cargando audios...</p>';
  
  try {
      const audiosDelMaestro = await manager.obtenerAudiosDelMaestro(maestroId);
      
      // Manejo cuando no hay audios
      if (audiosDelMaestro.length === 0) {
          listaAudiosContainer.innerHTML = '<p class="italic">No hay audios disponibles.</p>';
          return;
      }

      listaAudiosContainer.innerHTML = ''; // Limpia el mensaje de carga

      // Agrupa audios por categoría (cuento, canción, refrán)
      const audiosPorCategoria = {
          cuento: { nombre: "Cuentos", audios: [] },
          cancion: { nombre: "Canciones", audios: [] },
          refran: { nombre: "Refranes", audios: [] }
      };

      // Obtiene información de usuarios para mostrar quien subió cada audio
      const { data: usuarios, error: usuariosError } = await supabase
        .from('users')
        .select('id, full_name, email');
      
      if (usuariosError) throw usuariosError;

      // Procesa cada audio y lo agrupa  por categoria
      audiosDelMaestro.forEach(audio => {
        const usuarioSubidor = usuarios.find(u => u.email === audio.subidoPor);
        const nombreSubidor = usuarioSubidor ? usuarioSubidor.full_name : audio.subidoPor;
        
        audio.subidoPorNombre = nombreSubidor; // Añade nombre legible al objeto audio
        
        if (audiosPorCategoria[audio.categoria]) {
          audiosPorCategoria[audio.categoria].audios.push(audio);
        }
      });

      // Renderiza por categoría
      Object.entries(audiosPorCategoria).forEach(([key, categoria]) => {
          if (categoria.audios.length > 0) {
              const categoriaDiv = document.createElement('div');
              categoriaDiv.className = 'mb-8';
              categoriaDiv.innerHTML = `<h4 class="text-lg font-bold mb-4">${categoria.nombre}</h4>`;
              
              //  Crea una tarjeta por cada audio
              categoria.audios.forEach(audio => {
                  const audioCard = document.createElement('div');
                  audioCard.className = 'audio-card mb-4 p-4 border border-amber-300 rounded-lg bg-white shadow-sm';
                  
                  audioCard.innerHTML = `
                      <div class="mb-2">
                          <strong class="text-lg">${audio.titulo}</strong>
                          <p class="text-gray-600">${audio.descripcion}</p>
                          <small class="text-amber-700">Subido por: ${audio.subidoPor}</small>
                      </div>
                      <audio controls src="${audio.url}" class="w-full mt-2 mb-3"></audio>
                      <div class="flex gap-3">
                          <button class="btn-descargar bg-amber-500 text-white px-3 py-1 rounded hover:bg-amber-600 transition" data-id="${audio.id}">
                              ⬇️ Descargar
                          </button>
                          <button class="btn-eliminar bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition" data-id="${audio.id}">
                            ${audio.descargado ? '🗑️ Eliminar' : '🗑️ Eliminar'}
                          </button>
                      </div>
                  `;
                  categoriaDiv.appendChild(audioCard);
              });
              
              listaAudiosContainer.appendChild(categoriaDiv);
          }
      });

  } catch (error) {
      console.error("Error al renderizar audios:", error);
      listaAudiosContainer.innerHTML = `
          <p class="text-red-500">Error al cargar los audios. Intenta recargar la página.</p>
          <p class="text-sm text-gray-500">${error.message}</p>
      `;
  }
}

// Función principal async que inicaliza toda la funcionalidad
async function initCuentaCuentos() {
  // Verificación crítica de datos de sesión
  if ((rol === "padres" && !maestroId) || !nombreUsuario || !rol) {
    let errorMessage = `
      <div class="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
        <h3 class="text-xl font-bold text-red-600 mb-4">Configuración incompleta</h3>
        <p class="mb-4">No podemos continuar porque:</p>
        <ul class="list-disc pl-5 mb-6 text-left">
    `;
    
    // Mensajes específicos según lo que falta
    if (rol === "padres" && !maestroId) {
      errorMessage += `
        <li>No se ha asignado un maestro. Esto puede pasar si:</li>
        <ul class="list-disc pl-5">
          <li>No seleccionaste un maestro al iniciar sesión</li>
          <li>La sesión se perdió (recarga la página)</li>
        </ul>
      `;
    }
    if (!nombreUsuario) errorMessage += `<li>No se identificó tu nombre de usuario</li>`;
    if (!rol) errorMessage += `<li>No se definió tu rol (padres/maestro)</li>`;
    
    errorMessage += `
        </ul>
        <div class="flex justify-center">
          <a href="login.html?rol=padres" 
            class="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-6 rounded transition">
            Volver a iniciar sesión
          </a>
        </div>
      </div>
    `;
    
    document.getElementById("contenido").innerHTML = errorMessage;
    return;
  }

  try {
    // Lógica específica para los padres
    if (rol === "padres") {
      // Muestra logo de Culturita flotante
      document.getElementById("logoCulturitaPadres").innerHTML = `
        <div class="fixed top-4 right-4 z-50 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg">
          <a href="index.html">
            <img src="imagenes/logo.jpg" alt="Logo Culturita" class="h-14 w-14 object-contain rounded-full" />
          </a>
        </div>

        <div class="fixed top-4 right-28 z-50 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg">
          <a href="#" id="btnAyuda">
            <img src="imagenes/ayuda.png" alt="Ayuda" class="h-10 w-10 object-contain rounded-full"/>
          </a>
        </div>
      `;

      // Obtiene nombre del maestro desde Supabase
      const { data: maestro } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', maestroId)
        .single();

      const nombreMaestro = maestro?.full_name || 'Maestro no asignado';

      // Construye interfaz para padres (formulario de subida)
      document.getElementById("introText").innerHTML = `
        Contribuye a la educación cultural de tus hijos grabando y compartiendo audios de tradiciones familiares. ¡Tus historias llegarán al aula y ayudarán a preservar nuestra herencia!`;
        
      document.getElementById("contenido").innerHTML = `
        <h2 class="text-2xl font-semibold mb-4 text-center">Bienvenid@ ${nombreUsuario}, sube tu grabación</h2>
        <h3 class="text-lg font-medium mb-6 text-center">Maestro asignado: ${nombreMaestro}</h3>
        <form id="formularioAudio" class="space-y-4">
          <div>
            <label class="font-bold">Categoría:</label><br/>
            <select id="categoria" required class="w-full pl-12 pr-4 py-3 bg-white border border-[#78350f] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fbbf24] placeholder-[#92400e] text-[#78350f]">
              <option value="cuento">Cuento</option>
              <option value="cancion">Canción</option>
              <option value="refran">Refrán</option>
            </select>
          </div>
          <div>
            <label class="font-bold">Título:</label><br/>
            <input type="text" id="titulo" required class="w-full pl-12 pr-4 py-3 bg-white border border-[#78350f] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fbbf24] placeholder-[#92400e] text-[#78350f]"/>
          </div>
          <div>
            <label class="font-bold">Descripción:</label><br/>
            <textarea id="descripcion" required class="w-full pl-12 pr-4 py-3 bg-white border border-[#78350f] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fbbf24] placeholder-[#92400e] text-[#78350f]"></textarea>
          </div>
          <div>
            <label class="font-bold">Archivo de audio:</label><br/>
            <input type="file" id="archivo" accept="audio/*" required class="mt-1"/>
          </div>
          <button type="submit" class="bg-amber-500 text-white font-bold py-2 px-6 rounded hover:bg-amber-600 transition">Subir</button>
        </form>
      `;

      // Maneja el envío del formulario de audio
      document.getElementById("formularioAudio").addEventListener("submit", async function(e) {
        e.preventDefault();
            
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading">Enviando...</span>';

        try {
          // Validaciones del formulario
          const categoria = document.getElementById("categoria").value;
          const titulo = document.getElementById("titulo").value.trim();
          const descripcion = document.getElementById("descripcion").value.trim();
          const archivo = document.getElementById("archivo").files[0];

          if (!titulo || !descripcion || !archivo) {
            throw new Error("Por favor completa todos los campos");
          }

          // 1. Subir archivo a Supabase Storage
          const url = await manager.subirAudioYObtenerUrl(archivo);
          if (!url) throw new Error("Error al subir el archivo de audio");

          // 2. Crear objeto audio y guardar en base de datos
          const nuevoAudio = new AudioCuentacuentos({
            titulo,
            descripcion,
            categoria,
            url,
            subidoPor: null, // Se completará con el email del usuario
            maestroId,
            descargado: false
          });

          const audioGuardado = await manager.guardarAudio(nuevoAudio);
              
          if (!audioGuardado) throw new Error("No se recibió confirmación del servidor");

          alert(`✅ Audio "${titulo}" enviado exitosamente a ${nombreMaestro}`);
          e.target.reset(); // Limpia el formulario

        } catch (error) {
          console.error('Error en el formulario:', error);
          let mensajeError = `❌ Error: ${error.message}`;
              
          if (error.message.includes('autenticado')) {
            mensajeError += '\n\nPor favor recarga la página e inicia sesión nuevamente.';
            setTimeout(() => window.location.href = "login.html", 3000);
          }
              
          alert(mensajeError);
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      });

    } else if (rol === "maestro") { // Lógica específica para maestros
      // Obtiene nombre del maestro para mostrar en la interfaz
      const { data: maestro } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', usuarioId)
        .single();

      const nombreMaestro = maestro?.full_name || 'Maestro';

      document.getElementById("introText").innerHTML = `
      Explora la colección de audios que los padres han preparado para ti. Descarga cuentos, canciones y refranes tradicionales para compartir con tus alumnos y fomentar el amor por nuestras raíces.`;

      // Construye interfaz para maestros (lista de audios)
      let contenidoHTML = `
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold">Bienvenido Maestr@ ${nombreMaestro}</h2>
        </div>
        <h3 class="text-lg font-medium mb-6">Audios recibidos</h3>
        <div id="listaAudios" class="space-y-4"></div>
      `;
      document.getElementById("contenido").innerHTML = contenidoHTML;
      
      // Renderiza  los audios disponibles
      await renderizarAudios();

      // Listener para botones de descarga
      document.addEventListener("click", async function(e) {
        if (e.target.closest(".btn-descargar")) {
          const button = e.target.closest(".btn-descargar");
          const audioId = button.dataset.id;
          
          try {
            button.disabled = true;
            button.innerHTML = '<span class="loading">Descargando...</span>';

            // Obtiene la URL de descarga con nombre de archivo amigable
            const { url, filename } = await manager.marcarComoDescargado(audioId);
            
            // Crear enlace de descarga invisible
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            
            // Limpieza post-descarga
            setTimeout(() => {
              document.body.removeChild(link);
              button.disabled = false;
              button.innerHTML = '⬇️ Descargar';
              showNotification('✅ Audio descargado correctamente', 'success');
            }, 100);
            
          } catch (error) {
            console.error('Error en el proceso de descarga:', error);
            button.disabled = false;
            button.innerHTML = '⬇️ Descargar';
            const errorMessage = error.message.includes('no existe') ? 
              'El archivo de audio fue eliminado' :
              `Error: ${error.message || 'No se pudo completar la descarga'}`;
            showNotification(`❌ ${errorMessage}`, 'error');
          }
        }
      });

      // Listener para botones de eliminar
      document.addEventListener("click", async function(e) {
        if (e.target.closest(".btn-eliminar")) {
          const button = e.target.closest(".btn-eliminar");
          const audioId = button.dataset.id;
          
          if (confirm("¿Eliminar este audio de tu vista? (Permanecerá en el historial si fue descargado)")) {
            button.disabled = true;
            button.innerHTML = '<span class="loading">Eliminando...</span>';

            try {
              const result = await manager.eliminarAudioDeCuentaCuentos(audioId);
              
              if (result.action === 'deleted') {
                showNotification('🗑️ Audio eliminado completamente', 'success');
              } else {
                showNotification('ℹ️ Audio mantenido en historial', 'info');
              }
              
              renderizarAudios();
            } catch (error) {
              showNotification(`❌ Error: ${error.message}`, 'error');
            } finally {
              button.disabled = false;
              button.innerHTML = '🗑️ Eliminar';
            }
          }
        }
      });

    } else {
      // Bloquea acceso si no tiene rol válido
      document.getElementById("contenido").innerHTML = `<p class="text-center text-red-600 font-semibold">No tienes acceso autorizado.</p>`;
    }
  } catch (error) {
    console.error("Error al inicializar CuentaCuentos:", error);
    document.getElementById("contenido").innerHTML = `
      <p class="text-center text-red-600 font-semibold">Error al cargar la página.</p>
      <p class="text-center text-sm text-gray-600">${error.message}</p>
      <p class="text-center mt-4">
        <button onclick="location.reload()" class="bg-amber-500 text-white px-4 py-2 rounded">
          Recargar página
        </button>
      </p>
    `;
  }
}

// Llamada inicial a la función principal
initCuentaCuentos();