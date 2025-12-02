const usuarioId = sessionStorage.getItem("usuarioId");
const historialManager = new HistorialManager(usuarioId);

// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Obtener ID del maestro desde sessionStorage
    const maestroId = sessionStorage.getItem("usuarioId");
    if (!maestroId) {
      console.error("No se encontró maestroId en sessionStorage. Carga de nuevo la página, o inicia sesión.");
      return;
    }

    // Crear instancia del gestor de historial
    const historialManager = new HistorialManager(maestroId);

    // Función para generar elemento de audio
    const generarElementoAudio = (audio, id) => {
      // Crear contenerdo div para el audio
      const div = document.createElement('div');
      div.className = "p-4 border-b border-amber-200 flex justify-between items-center bg-white shadow-sm";
      
      // Plantilla HTML para mostrar la información del audio
      div.innerHTML = `
        <div>
          <strong>${audio.titulo}</strong>
          <p class="text-sm text-gray-500">${audio.descripcion}</p>
          <small class="text-xs text-amber-700">Subido por: ${audio.subidoPor}</small>
          ${audio.fechaDescarga ? `<small class="block text-xs text-gray-500">Descargado: ${audio.fechaDescarga}</small>` : ''}
        </div>
        <div>
          <audio controls src="${audio.url}" class="h-8 mr-2"></audio>
          <button onclick="eliminarDelHistorial('${id}')" class="text-red-500 hover:text-red-700 transition">
            🗑️ Eliminar
          </button>
        </div>
      `;
      return div;
    };

    // Función para generar elemento de alumno con indicador de edición
    const generarElementoAlumno = async (alumno, id) => {
      const div = document.createElement('div');
      div.className = "p-4 border-b border-amber-200 flex justify-between items-center bg-white shadow-sm";
      
      // Manejar imagen de costumbre si existe
      let imagenHTML = '';
      if (alumno.imagenCostumbre) {
        imagenHTML = `<img src="${alumno.imagenCostumbre}" alt="Imagen de costumbre" class="w-10 h-10 rounded-full object-cover mr-2">`;
      }

      // Verificar si el alumno ha sido editado recientemente
      let editadoTag = '';
      try {
        // Consultar la base de datos para obtener información de edición
        const { data: historialItem, error } = await supabase
          .from('history')
          .select('id, is_edited, updated_at')
          .eq('user_id', maestroId)
          .eq('entity_type', 'alumno')
          .eq('entity_id', id)
          .maybeSingle(); // Usar maybeSingle para evitar errores si no hat resultados

        if (!error && historialItem) {
          // Calcular diferencia de horas desde la última edición
          const ahora = new Date();
          const editado = new Date(historialItem.updated_at || new Date());
          const diffHoras = Math.abs(ahora - editado) / 36e5;
          
          // Mostrar etiqueta si fue editado en las ultimas 24 horas
          if ((historialItem.is_edited || false) && diffHoras < 24) {
            editadoTag = '<span class="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded ml-2">Editado recientemente</span>';
          }
        }
      } catch (e) {
        console.warn("Error al verificar estado de edición:", e);
      }
      
      // Plantilla HTML para mostrar la información del alumno
      div.innerHTML = `
        <div class="flex items-center">
          ${imagenHTML}
          <div>
            <strong>👤 ${alumno.nombre}</strong>${editadoTag}
            <p class="text-sm text-gray-500">Origen: ${alumno.origen}</p>
            <small class="text-xs text-amber-700">Costumbre: ${alumno.costumbre || 'No registrada'}</small>
          </div>
        </div>
        <div class="flex gap-2 items-center">
          <button onclick="confirmarEliminarAlumno('${id}')" class="text-red-500 hover:text-red-700 transition">
            🗑️ Eliminar
          </button>
        </div>
      `;
      return div;
    };

    // Función para generar elemento de estado
    const generarElementoEstado = (estado, id) => {
      const div = document.createElement('div');
      div.className = "p-4 border-b border-amber-200 flex justify-between items-center bg-white shadow-sm";
      
      // Plantilla HTML para mostrar la información del estado
      div.innerHTML = `
        <div class="flex-1">
          <div class="flex justify-between items-start">
            <div>
              <strong>🗺️ ${estado.nombre}</strong>
              <p class="text-sm text-gray-500">${estado.miniHistoria}</p>
              <small class="text-xs text-amber-700">Tradición: ${estado.tradicion}</small>
            </div>
            <span class="text-xs text-gray-500 ml-2">${estado.fechaDescarga}</span>
          </div>
          <div class="mt-2 flex items-center text-sm">
            <span class="bg-amber-100 text-amber-800 px-2 py-1 rounded mr-2">
              ${estado.palabra} (${estado.significado})
            </span>
            <span class="bg-green-100 text-green-800 px-2 py-1 rounded">
              ${estado.valor}
            </span>
          </div>
        </div>
        <div class="flex gap-2 items-center">
          <button onclick="confirmarEliminarEstado('${id}')" class="text-red-500 hover:text-red-700 transition">
            🗑️ Eliminar
          </button>
        </div>
      `;
      
      return div;
    };

    // 1. Cargar audios descargados
    const contenedorAudios = document.getElementById("historialAudios");
    if (contenedorAudios) {
      const audios = await historialManager.obtenerAudiosDescargados();
      if (audios.length > 0) {
        // Agregar cada audio al contenedor
        audios.forEach(audio => {
          contenedorAudios.appendChild(generarElementoAudio(audio.data, audio.id));
        });
      } else {
        // Mostrar mensaje si no hay audios
        contenedorAudios.innerHTML = '<p class="italic">No has descargado audios aún.</p>';
      }
    }

    // 2. Cargar alumnos registrados
    const contenedorAlumnos = document.getElementById("historialAlumnos");
    if (contenedorAlumnos) {
        const alumnos = await historialManager.obtenerAlumnos();
        if (alumnos.length > 0) {
            // Limpiar contenedor primero
            contenedorAlumnos.innerHTML = '';
            
            // Usar Promise.all para esperar todas las generaciones de elemento
            const elementos = await Promise.all(
                alumnos.map(async alumno => {
                    return await generarElementoAlumno(alumno.data, alumno.id);
                })
            );
            
            // Agregar todos los elementos al DOM
            elementos.forEach(elemento => {
                if (elemento instanceof Node) {
                    contenedorAlumnos.appendChild(elemento);
                }
            });
        } else {
            contenedorAlumnos.innerHTML = "<p class='italic'>No has registrado alumnos aún.</p>";
        }
    }

    // 3. Cargar exploraciones de estados
    const contenedorEstados = document.getElementById("historialEstados");
    if (contenedorEstados) {
      const estados = await historialManager.obtenerExploraciones();
      if (estados.length > 0) {
        estados.forEach(estado => {
          contenedorEstados.appendChild(generarElementoEstado(estado.data, estado.id));
        });
      } else {
        contenedorEstados.innerHTML = "<p class='italic'>No has explorado (descargado) estados aún.</p>";
      }
    }

    // Funciones para eliminar elementos
    window.eliminarDelHistorial = async (id) => {
      // Confirmar antes de eliminar audio del historial
      if (confirm("¿Deseas eliminar este audio del historial? (Seguirá disponible en CuentaCuentos, si no lo has eliminado allí)")) {
        await historialManager.eliminarAudioDelHistorial(id);
        location.reload();
      }
    };

    // Eliminar alumno del historial
    window.confirmarEliminarAlumno = async (id) => {
      if (confirm("¿Eliminar este alumno del historial permanentemente?")) {
        try {
          const success = await historialManager.eliminarAlumnoDelHistorial(id);
          if (success) {
            // Eliminar el elemento del DOM sin recargar
            const elementos = document.querySelectorAll('#historialAlumnos > div');
            elementos.forEach(elemento => {
              if (elemento.querySelector('button')?.onclick?.toString().includes(id)) {
                elemento.remove();
              }
            });
            
            // Mostrar mensaje si no quedan alumnos
            if (document.querySelectorAll('#historialAlumnos > div').length === 0) {
              document.getElementById('historialAlumnos').innerHTML = 
                  "<p class='italic'>No has registrado alumnos aún.</p>";
            }
          } else {
            alert("Error al eliminar del historial. Intenta más tarde.");
          }
        } catch (error) {
          console.error('Error al eliminar del historial:', error);
          alert("Ocurrió un error al eliminar del historial. Intenta más tarde.");
        }
      }
    };

    // Eliminar estado del historial
    window.confirmarEliminarEstado = async (id) => {
      if (confirm("¿Deseas eliminar este estado (descargado) del historial?")) {
          try {
              const success = await historialManager.eliminarExploracion(id);
              if (success) {
                  // Eliminar el elemento del DOM sin recargar
                  const elementos = document.querySelectorAll('#historialEstados > div');
                  elementos.forEach(elemento => {
                      if (elemento.querySelector('button')?.onclick?.toString().includes(id)) {
                          elemento.remove();
                      }
                  });
                  
                  // Mostrar mensaje si no quedan estados
                  if (document.querySelectorAll('#historialEstados > div').length === 0) {
                      document.getElementById('historialEstados').innerHTML = 
                          "<p class='italic'>No has explorado estados aún.</p>";
                  }
              } else {
                  alert("Error al eliminar del historial. Intenta más tarde.");
              }
          } catch (error) {
              console.error('Error al eliminar estado:', error);
              alert("Ocurrió un error al eliminar del historial. Intenta más tarde.");
          }
      }
  };

    // Limpiar todo el historial
    document.getElementById("btnLimpiarHistorial").addEventListener("click", async function() {
      if (!confirm("¿Estás segur@ de que deseas limpiar todo tu historial? Esta acción no se puede deshacer.")) {
        return;
      }

      // Mostrar estado de carga en el botón
      const btn = this;
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.innerHTML = '<span class="loading">Limpiando...</span>';

      try {
        // 1. Eliminar audios del historial
        const audios = await historialManager.obtenerAudiosDescargados();
        for (const audio of audios) {
          await historialManager.eliminarAudioDelHistorial(audio.id);
        }

        // 2. Eliminar alumnos del historial
        const alumnos = await historialManager.obtenerAlumnos();
        for (const alumno of alumnos) {
          await historialManager.eliminarAlumnoDelHistorial(alumno.id);
        }

        // 3. Eliminar exploraciones del historial
        const exploraciones = await historialManager.obtenerExploraciones();
        for (const exploracion of exploraciones) {
          await historialManager.eliminarExploracion(exploracion.id);
        }

        // Restaurar botón y mostrar mensaje
        btn.disabled = false;
        btn.textContent = originalText;
        alert("🧼 Historial limpiado con éxito");
        location.reload();
      } catch (error) {
        console.error("Error al limpiar historial:", error);
        btn.disabled = false;
        btn.textContent = originalText;
        alert("❌ Error al limpiar el historial. Intenta de nuevo más tarde.");
      }
    });

  } catch (error) {
    console.error("Error al cargar el historial:", error);
  }
});
