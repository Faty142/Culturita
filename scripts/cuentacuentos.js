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
          <p class="text-red-500">Error al cargar los audios. Intenta recargar la página de nuevo.</p>
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
        Graba y comparte audios de tus tradiciones familiares. Tus historias podrán escucharse en la escuela y ayudarán a que los niños conozcan nuestras costumbres.`;
        
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
          if (!url) throw new Error("Error al subir el archivo de audio, intenta de nuevo");

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
              
          if (!audioGuardado) throw new Error("No se recibió confirmación del servidor. Intenta más tarde.");

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
      Escucha los audios que los padres prepararon para ti. Puedes descargar cuentos, canciones y refranes tradicionales. Compártelos con tus alumnos para que conozcan nuestras tradiciones.`;

      // Construye interfaz para maestros (lista de audios) SIN el botón de ayuda aquí
      let contenidoHTML = `
        <div class="relative mb-6">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-semibold">Bienvenido Maestr@ ${nombreMaestro}</h2>
          </div>
        </div>
        <h3 class="text-lg font-medium mb-6">Audios recibidos</h3>
        <div id="listaAudios" class="space-y-4"></div>
      `;
      document.getElementById("contenido").innerHTML = contenidoHTML;
      
      // === NUEVO: CREAR BOTÓN DE AYUDA FIJO EN ESQUINA (similar al de padres) ===
      // Crear botón de ayuda para maestros (estilo IDÉNTICO al de padres)
      const ayudaButtonHTML = `
        <div class="fixed top-4 right-28 z-50 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg" id="ayudaMaestroContainer">
          <a href="#" id="btnAyudaMaestroFloating">
            <img src="imagenes/ayuda.png" alt="Ayuda" class="h-10 w-10 object-contain rounded-full"/>
          </a>
        </div>
      `;
      
      // Insertar directamente en el body
      document.body.insertAdjacentHTML('beforeend', ayudaButtonHTML);
      
      // Configurar el evento del botón de ayuda flotante
      const btnAyudaMaestroFloating = document.getElementById("btnAyudaMaestroFloating");
      if (btnAyudaMaestroFloating) {
        // Remover cualquier evento previo para evitar duplicados
        btnAyudaMaestroFloating.replaceWith(btnAyudaMaestroFloating.cloneNode(true));
        const newBtn = document.getElementById("btnAyudaMaestroFloating");
        
        newBtn.addEventListener('click', function(e) {
          e.preventDefault();
          console.log("Botón de ayuda maestro clickeado");
          mostrarAyudaMaestro();
        });
      }
      
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
              `Error: ${error.message || 'No se pudo completar la descarga, intenta más tarde'}`;
            showNotification(`❌ ${errorMessage}`, 'error');
          }
        }
      });

      // Listener para botones de eliminar
      document.addEventListener("click", async function(e) {
        if (e.target.closest(".btn-eliminar")) {
          const button = e.target.closest(".btn-eliminar");
          const audioId = button.dataset.id;
          
          if (confirm("¿Eliminar este audio de CuentaCuentos? (El audio permanecerá en el historial solo si fue descargado)")) {
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
      document.getElementById("contenido").innerHTML = `<p class="text-center text-red-600 font-semibold">No tienes acceso autorizado. Inicia Sesión.</p>`;
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

// Función para mostrar ayuda específica para maestros
function mostrarAyudaMaestro() {
  // Configuración específica para maestros
  sistemaAyuda.guiaPasos = [
    {
      selector: '#introText',
      titulo: 'Bienvenida para Maestros',
      descripcion: 'Aquí puedes explorar los audios culturales que los padres han compartido contigo.',
      posicionFlecha: 'bottom',
      posicionPersonalizada: { top: '35%', left: '50%' }
    },
    {
      selector: 'h2.text-2xl',
      titulo: 'Tu Panel de Control',
      descripcion: 'Esta es tu área personal donde gestionas los audios recibidos.',
      posicionFlecha: 'bottom',
      posicionPersonalizada: { top: '45%', left: '50%' }
    },
    {
      selector: '#listaAudios',
      titulo: 'Lista de Audios Recibidos',
      descripcion: 'Aquí verás todos los audios organizados por categoría: cuentos, canciones y refranes.',
      posicionFlecha: 'top',
      posicionPersonalizada: { top: '50%', left: '50%' }
    },
    {
      selector: '.btn-descargar',
      titulo: 'Botón Descargar',
      descripcion: 'Haz clic aquí para descargar el audio a tu dispositivo y guardarlo en tu historial.',
      posicionFlecha: 'top',
      posicionPersonalizada: { top: '65%', left: '30%' }
    },
    {
      selector: '.btn-eliminar',
      titulo: 'Botón Eliminar',
      descripcion: 'Elimina audios de tu vista. Los audios descargados permanecen en tu historial.',
      posicionFlecha: 'top',
      posicionPersonalizada: { top: '65%', left: '55%' }
    }
  ];
  
  // Modal de explicación completa para maestros
  sistemaAyuda.mostrarModalExplicacion = function() {
    const modalHTML = `
      <div id="modalExplicacion" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]">
        <div class="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-2xl font-bold text-[#78350f]">📚 Guía Completa - CuentaCuentos para Maestros</h3>
            <button onclick="document.getElementById('modalExplicacion').remove()" 
                    class="text-2xl text-gray-500 hover:text-red-500">×</button>
          </div>

          <div class="space-y-6">
            <div class="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
              <h4 class="font-bold text-lg mb-2">🎯 Propósito de esta sección</h4>
              <p>Como maestro, esta sección te permite acceder a los audios culturales que los padres han compartido para enriquecer tus clases y fomentar las tradiciones mexicanas.</p>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div class="bg-white p-4 rounded-lg border border-amber-200">
                <h4 class="font-bold text-lg mb-2">🎧 Gestión de Audios</h4>
                <ul class="list-disc ml-5 space-y-2 text-sm text-left">
                  <li><strong>Organización automática:</strong> Los audios se agrupan por categorías</li>
                  <li><strong>Información completa:</strong> Ver título, descripción y quién lo envió</li>
                  <li><strong>Reproducción inmediata:</strong> Escucha los audios directamente</li>
                  <li><strong>Descarga segura:</strong> Guarda los audios en tu dispositivo</li>
                </ul>
              </div>

              <div class="bg-white p-4 rounded-lg border border-amber-200">
                <h4 class="font-bold text-lg mb-2">📥 Proceso de Descarga</h4>
                <ol class="list-decimal ml-5 space-y-2 text-sm text-left">
                  <li>Haz clic en "Descargar" en el audio que te interese</li>
                  <li>El audio se guardará automáticamente en tu historial</li>
                  <li>Podrás acceder a él desde la página de Historial</li>
                  <li>El audio se descargará a tu dispositivo</li>
                </ol>
              </div>
            </div>

            <div class="bg-blue-50 p-4 rounded-lg">
              <h4 class="font-bold text-lg mb-2">💡 Consejos para Maestros</h4>
              <ul class="list-disc ml-5 space-y-2 text-left">
                <li><strong>Organiza por temas:</strong> Descarga audios relacionados con tus unidades didácticas</li>
                <li><strong>Involucra a los niños:</strong> Pídeles que identifiquen elementos culturales</li>
                <li><strong>Complementa con actividades:</strong> Crea manualidades o dibujos relacionados</li>
                <li><strong>Comparte con padres:</strong> Muestra cómo usas sus contribuciones en clase</li>
              </ul>
            </div>

            <div class="bg-green-50 p-4 rounded-lg">
              <h4 class="font-bold text-lg mb-2">🗑️ Sobre la Eliminación</h4>
              <div class="space-y-2 text-sm">
                <p><strong>Eliminar de la vista:</strong> Los audios desaparecen de esta lista pero permanecen en tu historial si fueron descargados.</p>
                <p><strong>Historial preservado:</strong> Los audios descargados siempre estarán disponibles en tu página de Historial.</p>
                <p><strong>Limpieza organizada:</strong> Usa esta función para mantener tu lista de audios actualizada y ordenada.</p>
              </div>
            </div>
          </div>

          <div class="mt-6 text-center">
            <button onclick="document.getElementById('modalExplicacion').remove()" 
                    class="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-6 rounded-lg transition">
              Entendido, ¡gracias!
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  };
  
  // Mostrar opciones de ayuda
  sistemaAyuda.mostrarOpcionesAyuda();
}

// Llamada inicial a la función principal
initCuentaCuentos();
