const explorador = new HistorialManager(sessionStorage.getItem("usuarioId"));
const modalEstado = new ModalEstado("modalEstado");

// Cargamos los estados al iniciar la página
document.addEventListener("DOMContentLoaded", async () => {
    // Verificar sesión al inicio
    const usuarioId = sessionStorage.getItem("usuarioId");
    if (!usuarioId) {
        console.error('No hay usuario logueado. Inicia sesión para continuar.');
        // Opcional: redirigir al login o mostrar mensaje
        return;
    }
    
    // Inicializar el gestor de historial y obtener datos de estados
    const explorador = new HistorialManager(usuarioId);
    const estadosMap = ExploradoresManager.datosEstados;
    const modalEstado = new ModalEstado("modalEstado");
    
    // Función para mostrar/ocultar estados
    const intentarMostrar = (nombreEstado) => {
        // Obtener el objeto estado del mapa
        const estadoObj = estadosMap[nombreEstado];
        if (!estadoObj) return;

        // Verificar si el estado está desbloqueado
        if (estadoObj.desbloqueado) {
            // Mostrar el modal con la información del estado
            modalEstado.mostrar(estadoObj);
        } else {
            // Mostrar mensaje si el estado esta bloqueado
            alert(`🔒 ${nombreEstado} aún está bloqueado. Próximamente disponible.`);
        }
    };
    
    // Función para mostrar la lista de estados desbloqueados
    function mostrarDesbloqueados() {
        // Obtener el elemento de la lista y limpiarlo
      const lista = document.getElementById("listaDesbloqueados");
      lista.innerHTML = "";
    
        // Filtrar y ordenar los estados desbloqueados
      const estados = Object.values(estadosMap)
        .filter(estado => estado.desbloqueado)
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
        
        // Crear elementos de lista para cada estado desbloqueado
      estados.forEach((estadoObj) => {
        const li = document.createElement("li");
        // Formatear la información del estado
        li.innerHTML = `🌺 <strong>${estadoObj.nombre}</strong>: ${estadoObj.valor} — <em>${estadoObj.palabra}</em> (${estadoObj.significado})`;
        li.style.cursor = "pointer";
        // Asignar función al hacer clic
        li.onclick = () => intentarMostrar(estadoObj.nombre);
        lista.appendChild(li);
      });

      // Mostrar el modal de estados desploqueados
      document.getElementById("modalDesbloqueados").classList.remove("hidden");
    }

    // Funciones para cerrar modales y descargar PDF
    function cerrarModal() {
        // Ocultar el modal de estado
        document.getElementById("modalEstado").classList.add("hidden");
    }
    
    function cerrarDesbloqueados() {
        // Ocultar el modal de estados desbloqueados
        document.getElementById("modalDesbloqueados").classList.add("hidden");
    }
    
    // Función para descargar la información del estado como PDF
    async function descargarPDF() {
        // Obtener el nombre del estado desde el título del modal
        const nombreEstado = document.getElementById("estadoTitulo").textContent;
        const estadoObj = estadosMap[nombreEstado];
        if (!estadoObj) {
            console.error('Estado no encontrado:', nombreEstado);
            return;
        }

        // Verificar nuevamente el usuario (seguridad)
        if (!usuarioId) {
            alert('Debes iniciar sesión para descargar');
            return;
        }

        try {
            // 1. Registrar la descarga en Supabase
            const { error } = await supabase
                .from('state_downloads')
                .insert({
                    user_id: usuarioId,
                    state_name: nombreEstado
                });

            if (error) throw error;

            // 2. Generar el PDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Configuración del documento
            doc.setFontSize(18);
            doc.text(`Estado: ${estadoObj.nombre}`, 10, 15);
            
            doc.setFontSize(12);
            let yPosition = 25;
            const maxWidth = 180; // Ancho máximo para el texto
            const lineHeight = 7; // Altura de línea

            // Función auxiliar para agregar texto con formato
            const addText = (text, isBold = false) => {
                if (isBold) doc.setFont(undefined, 'bold');
                
                // Dividir el texto en líneas que quepan en el ancho
                const lines = doc.splitTextToSize(text, maxWidth);
                lines.forEach(line => {
                    // Manejar salto de página si es necesario
                    if (yPosition > 280) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    doc.text(line, 10, yPosition);
                    yPosition += lineHeight;
                });
                
                if (isBold) doc.setFont(undefined, 'normal');
            };
                
            // Agregar contenido del estado al PDF
            addText(`- Mini Historia: ${estadoObj.miniHistoria}`);
            addText(`- Tradición: ${estadoObj.tradicion}`);
            addText(`- Manualidad: ${estadoObj.manualidad}`);
            addText(`- Palabra Típica: ${estadoObj.palabra} (${estadoObj.significado})`);
            addText(`- Valor Cultural: ${estadoObj.valor}`);
            addText('');
            addText('- Pasos para la manualidad:');
            estadoObj.pasosManualidad.forEach(paso => addText(paso));
            addText('');
            addText(`- Propósito: ${estadoObj.propositoManualidad}`);
            
            // Agregar la imagen de la manualidad si existe
            if (estadoObj.imagenManualidad) {
                yPosition += 5; // Espacio antes de la imagen
                
                try {
                    // Cargar la imagen
                    const img = new Image();
                    img.src = `imagenes/${estadoObj.imagenManualidad}`;
                    
                    // Esperar a que cargue la imagen
                    await new Promise((resolve) => {
                        img.onload = resolve;
                        img.onerror = () => {
                            console.warn('No se pudo cargar la imagen:', estadoObj.imagenManualidad);
                            resolve();
                        };
                    });
                    
                    // Verificar si la imagen se cargó correctamente
                    if (img.complete && img.naturalHeight !== 0) {
                        // Ajustar tamaño de la imagen para que quepa en la página
                        const imgWidth = 80; // Ancho fijo
                        const imgHeight = (img.naturalHeight / img.naturalWidth) * imgWidth;
                        
                        // Manejar saltos de página para la imagen
                        if (yPosition + imgHeight > 280) {
                            doc.addPage();
                            yPosition = 20;
                        }
                        
                        // Agregar la imagen al PDF (centrada)
                        doc.addImage(img, 'PNG', (210 - imgWidth) / 2, yPosition, imgWidth, imgHeight);
                        yPosition += imgHeight + 5;
                    }
                } catch (imgError) {
                    console.error('Error al cargar la imagen:', imgError);
                }
            }
            
            // Agregar créditos y guardar el PDF
            addText('');
            addText(`- Créditos: ${estadoObj.creditosManualidad}`);
            
            // Guardar el PDF con el nombre del estado
            doc.save(`${estadoObj.nombre}_tradicion.pdf`);
            alert('PDF descargado correctamente');
        } catch (error) {
            console.error('Error en descarga:', error);
            alert('Error al descargar el PDF. Intenta nuevamente.');
        }
    }
    
    // Asignamos las funciones a los botones correspondientes
    window.cerrarModal = cerrarModal;
    window.descargarPDF = descargarPDF;
    window.mostrarDesbloqueados = mostrarDesbloqueados;
    window.cerrarDesbloqueados = cerrarDesbloqueados;

    // Asignar event listeners a los divs del mapa
    document.querySelectorAll('.estado-mapa').forEach(divEstado => {
        divEstado.addEventListener('click', (event) => {
            // Obtenemos el nombre del estado del atributo data-estado
            const nombreEstado = event.currentTarget.getAttribute('data-estado');
            intentarMostrar(nombreEstado);
        });
    });
});
