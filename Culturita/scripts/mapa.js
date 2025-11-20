// Espera a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    // Elementos del DOM
    const form = document.getElementById("registroAlumno");
    const contenedorMapa = document.getElementById("contenedorMapa");
    const modal = document.getElementById("modalFormulario");
    const abrirBtn = document.getElementById("abrirFormulario");
    const cancelarBtn = document.getElementById("cancelar");
    const indiceEdicion = document.getElementById("indiceEdicion");
    const imagenInput = document.getElementById("imagenCostumbre");
    const vistaPrevia = document.getElementById("vistaPrevia");

    // Obtiene el ID del maestro desde sessionStorage
    const maestroId = sessionStorage.getItem("usuarioId");

    // Validación básica de sesión
    if (!maestroId) {
        console.error("No se encontró maestroId en sessionStorage");
        return;
    }

    // Inicializa el manager del mapa
    const manager = new MapaMagicoManager();

    // Función asíncrona para mostrar alumnos en el mapa
    async function mostrarAlumnos() {
        // Carga la imagen base del mapa
        contenedorMapa.innerHTML = `<img src="./imagenes/mapa-mexico3.jpg" alt="Mapa de México" class="w-full h-full object-contain"/>`;
        const centroMexico = { x: 50, y: 55 }; // Coordenadas en el centro del mapa

        // Obtiene los alumnos del maestro desde Supabase
        const alumnosFiltrados = await manager.obtenerAlumnosDelMaestro(maestroId);

        if (!alumnosFiltrados) {
            console.error("No se pudieron cargar los alumnos.");
            return;
        }

        // Procesa cada alumno para mostrarlo en el mapa
        alumnosFiltrados.forEach((alumno, index) => {
            const { x, y } = alumno; // Coordenadas del alumno

            // Crear el elemento visual del alumno (punto en el mapa)
            const punto = document.createElement("div");
            punto.className = "absolute text-center bg-white p-2 rounded-full shadow-lg border border-amber-300 cursor-pointer transition hover:shadow-xl hover:bg-amber-100";
            punto.style.width = "80px";
            punto.style.transform = "translate(-50%, -50%)";
            punto.style.left = `${x}%`;
            punto.style.top = `${y}%`;
            punto.style.zIndex = "10";

            // HTML interno del punto (avatar, nombre, origen)
            punto.innerHTML = `
                <img src="./imagenes/${alumno.avatar}.jpg" alt="Avatar" style="width:48px;height:48px;border-radius:50%;margin-bottom:6px;" />
                <div class="text-xs font-bold text-amber-800">${alumno.nombre}</div>
                <div class="text-[11px] text-amber-700">${alumno.origen}</div>
            `;

            // Si tiene imagen de costumbre, la añade
            if (alumno.imagenCostumbre) {
                const imgCustom = document.createElement("img");
                imgCustom.src = alumno.imagenCostumbre;
                imgCustom.alt = "Imagen representativa";
                imgCustom.className = "mx-auto mt-1 rounded-full border w-10 h-10 object-cover";
                punto.appendChild(imgCustom);
            }

            // Crea linea SVG que conecta al alumno con el centro de México
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("class", "absolute pointer-events-none");
            svg.setAttribute("width", "100%");
            svg.setAttribute("height", "100%");
            svg.setAttribute("style", "top: 0; left: 0; position: absolute; z-index: 0;");

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", `${x}%`);
            line.setAttribute("y1", `${y}%`);
            line.setAttribute("x2", `${centroMexico.x}%`);
            line.setAttribute("y2", `${centroMexico.y}%`);
            line.setAttribute("stroke", "#f59e0b"); // Color ámbar
            line.setAttribute("stroke-width", "2");
            line.setAttribute("stroke-dasharray", "4"); // Linea punteada

            svg.appendChild(line);
            contenedorMapa.appendChild(svg);

            // Muestra info del alumno al hacer clic
            punto.onclick = () => {
                alert(
                    `👤 ${alumno.nombre}\n📍 Origen: ${alumno.origen}\n🎎 Costumbre: ${alumno.costumbre || "No registrada"}\n🗣️ Palabra: ${alumno.palabra || "No registrada"}`
                );
            };

            // Botón para editar alumno
            const editarBtn = document.createElement("button");
            editarBtn.textContent = "✏️";
            editarBtn.className = "absolute top-0 right-0 bg-amber-500 text-white text-xs px-1 rounded-full";
            editarBtn.onclick = (e) => {
                e.stopPropagation(); // Evita que se propague el evento click del punto
                // Llena el formulario con los datos del alumno
                document.getElementById("nombre").value = alumno.nombre;
                document.getElementById("origen").value = alumno.origen;
                document.getElementById("costumbre").value = alumno.costumbre || '';
                document.getElementById("palabra").value = alumno.palabra || '';
                document.getElementById("avatar").value = alumno.avatar;
                indiceEdicion.value = alumno.id;
                imagenInput.value = ""; // Resetea el input del archivo
                
                // Manejo de la vista previa de imagen
                vistaPrevia.innerHTML = "";
                
                if (alumno.imagenCostumbre) {
                    const previewContainer = document.createElement("div");
                    previewContainer.className = "flex items-center gap-3 mt-2";
                    
                    const imgPreview = document.createElement("img");
                    imgPreview.src = alumno.imagenCostumbre;
                    imgPreview.alt = "Imagen de costumbre";
                    imgPreview.className = "w-20 h-20 rounded-md border border-amber-300 object-cover";
                    
                    // Botón para elimiar imagen existente
                    const deleteBtn = document.createElement("button");
                    deleteBtn.innerHTML = "✖ Eliminar imagen";
                    deleteBtn.className = "text-red-500 hover:text-red-700 text-sm ml-2";
                    deleteBtn.onclick = (e) => {
                        e.preventDefault();
                        vistaPrevia.innerHTML = "";
                        // Crea un campo hidden para marcar que se quiere eliminar la imagen
                        if (!document.getElementById("eliminar-imagen-flag")) {
                            const hiddenInput = document.createElement("input");
                            hiddenInput.type = "hidden";
                            hiddenInput.id = "eliminar-imagen-flag";
                            hiddenInput.name = "eliminar-imagen-flag";
                            hiddenInput.value = "true";
                            form.appendChild(hiddenInput);
                        } else {
                            document.getElementById("eliminar-imagen-flag").value = "true";
                        }
                    };
                    
                    previewContainer.appendChild(imgPreview);
                    previewContainer.appendChild(deleteBtn);
                    vistaPrevia.appendChild(previewContainer);
                    
                    // Asegurar que el flag de eliminación está en false inicialmente
                    if (!document.getElementById("eliminar-imagen-flag")) {
                        const hiddenInput = document.createElement("input");
                        hiddenInput.type = "hidden";
                        hiddenInput.id = "eliminar-imagen-flag";
                        hiddenInput.name = "eliminar-imagen-flag";
                        hiddenInput.value = "false";
                        form.appendChild(hiddenInput);
                    } else {
                        document.getElementById("eliminar-imagen-flag").value = "false";
                    }
                }
                
                modal.classList.remove("hidden");
            };

            // Botón para eliminar alumno
            const eliminarBtn = document.createElement("button");
            eliminarBtn.textContent = "🗑️";
            eliminarBtn.className = "absolute top-0 left-0 bg-red-500 text-white text-xs px-1 rounded-full";
            // 🗑️ Botón eliminar - Modifica esta parte
            eliminarBtn.onclick = async (e) => {
                e.stopPropagation();
                if (confirm(`¿Eliminar a ${alumno.nombre} del Mapa Mágico? (Se mantendrá en tu historial)`)) {
                    try {
                    const success = await manager.eliminarAlumno(alumno.id);
                    
                    if (success) {
                        // Elimina visualmente el punto del mapa
                        punto.remove();
                        svg.remove();
                        
                        // Si no quedan alumnos, muestra solo el mapa base
                        const alumnosRestantes = document.querySelectorAll('#contenedorMapa > div');
                        if (alumnosRestantes.length === 0) {
                        contenedorMapa.innerHTML = `<img src="./imagenes/mapa-mexico3.jpg" alt="Mapa de México" class="w-full h-full object-contain"/>`;
                        }
                    } else {
                        alert("Error al eliminar el alumno. Por favor intenta nuevamente.");
                    }
                    } catch (error) {
                    console.error('Error al eliminar alumno:', error);
                    alert("Ocurrió un error inesperado al eliminar el alumno.");
                    }
                }
                };

            // Botón para mover alumno a nueva ubicación
            const moverBtn = document.createElement("button");
            moverBtn.textContent = "🧭";
            moverBtn.title = "Mover alumno";
            moverBtn.className = "absolute bottom-0 right-0 bg-amber-300 text-white text-xs px-1 rounded-full";
            moverBtn.onclick = async (e) => {
                e.stopPropagation();
                
                // Genera nuevas coordenadas que no colisionen con otros alumnos
                const alumnosExistentes = await manager.obtenerAlumnosDelMaestro(maestroId);
                const nuevasCoordenadas = manager.generarCoordenadasUnicas(alumnosExistentes);
                
                // Actualiza la posición en la base de datos
                const resultado = await manager.moverAlumno(alumno.id, nuevasCoordenadas);
                
                if (resultado) {
                    await mostrarAlumnos(); // Recarga los alumnos
                } else {
                    alert("Error al mover el alumno. Intenta nuevamente.");
                }
            };

            // Añade los botones al punto del alumno
            punto.appendChild(editarBtn);
            punto.appendChild(eliminarBtn);
            punto.appendChild(moverBtn);
            contenedorMapa.appendChild(punto);
        });
    }

    // Configuración de botones para descarga el mapa
    const descargarMapaBtn = document.getElementById("descargarMapa");
    const descargarPDFBtn = document.getElementById("descargarPDF");
    const descargarMapaLimpioPDFBtn = document.getElementById("descargarMapaLimpioPDF");

    // Descargar mapa como imagen PNG
    descargarMapaBtn.addEventListener("click", () => {
        html2canvas(document.getElementById("mapa"), {
            backgroundColor: "#ffffff",
            useCORS: true // Permite cargar imágenes externas
        }).then(canvas => {
            const enlace = document.createElement("a");
            enlace.download = "mapa-cultural.png";
            enlace.href = canvas.toDataURL("image/png");
            enlace.click();
        });
    });

    // Descargar mapa como PDF con encabezado
    descargarPDFBtn.addEventListener("click", () => {
        html2canvas(document.getElementById("mapa"), {
            backgroundColor: "#ffffff",
            useCORS: true
        }).then(canvas => {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            const imgData = canvas.toDataURL("image/png");

            const pageWidth = pdf.internal.pageSize.getWidth();
            const margin = 10;
            const headerHeight = 10;

            // Calcula dimensiones para que la imagen quepa en el PDF
            const imgWidth = pageWidth - margin * 2;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Formatea la fecha actual
            const fecha = new Date().toLocaleDateString("es-MX", {
                year: "numeric", month: "long", day: "numeric"
            });

            // Añade título y fecha al PDF
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(18);
            pdf.text("Mapa Cultural", pageWidth / 2, margin + headerHeight, { align: "center" });

            pdf.addImage(imgData, "PNG", margin, margin + headerHeight + 4, imgWidth, imgHeight);

            pdf.setFontSize(11);
            pdf.setFont("times", "italic");
            pdf.text(`Generado el ${fecha}`, margin, imgHeight + margin + headerHeight + 12);

            pdf.save("mapa-cultural.pdf");
        });
    });

    // Descargar solo el mapa base sin alumnos como PDF
    descargarMapaLimpioPDFBtn.addEventListener("click", () => {
        const divMapaLimpio = document.getElementById("mapaLimpio");
        divMapaLimpio.classList.remove("hidden");

        html2canvas(divMapaLimpio, {
            backgroundColor: "#ffffff",
            useCORS: true
        }).then(canvas => {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            const imgData = canvas.toDataURL("image/png");

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const marginY = Math.max((pageHeight - imgHeight) / 2, 10);

            pdf.addImage(imgData, "PNG", 0, marginY, imgWidth, imgHeight);
            pdf.save("solo-mapa-cultural.pdf");

            divMapaLimpio.classList.add("hidden");
        });
    });

    // Abrir modal para nuevo alumno
    abrirBtn.onclick = () => {
        // Resetea completamente el formulario
        form.reset();
        vistaPrevia.innerHTML = "";
        indiceEdicion.value = "-1";
        
        // Reset de valores específicos
        document.getElementById("nombre").value = "";
        document.getElementById("origen").value = "";
        document.getElementById("costumbre").value = "";
        document.getElementById("palabra").value = "";
        document.getElementById("avatar").value = "niño";
        imagenInput.value = "";
        
        // Limpiar flag de eliminación de imagen si existe
        if (document.getElementById("eliminar-imagen-flag")) {
            document.getElementById("eliminar-imagen-flag").value = "false";
        }
        
        modal.classList.remove("hidden");
    };

    // Cerrar modal
    cancelarBtn.onclick = () => modal.classList.add("hidden");

    // Manejo del envíio del formulario (crear/editar alumno)
    form.onsubmit = async (e) => {
        e.preventDefault();

        // Obtiene valores del formulario
        const nombre = document.getElementById("nombre").value;
        const origen = document.getElementById("origen").value;
        const costumbre = document.getElementById("costumbre").value;
        const palabra = document.getElementById("palabra").value;
        const avatar = document.getElementById("avatar").value;
        const idEdicion = indiceEdicion.value;
        
        let imagenCostumbreUrl = null;
        let alumnoExistente = null;

        // Si es edición, obtiene el alumno existente
        if (idEdicion && idEdicion !== "-1") {
            alumnoExistente = await manager.obtenerAlumno(idEdicion);
            if (alumnoExistente) {
                imagenCostumbreUrl = alumnoExistente.imagenCostumbre;
            }
        }

        // Manejo de imagenes (eliminación o nueva subida)
        const eliminarImagen = document.getElementById("eliminar-imagen-flag")?.value === "true";
        
        if (eliminarImagen) {
            imagenCostumbreUrl = null;
        } else if (imagenInput.files.length > 0) {
            // Sube nueva imagen
            imagenCostumbreUrl = await manager.subirImagen(imagenInput.files[0]);
            if (!imagenCostumbreUrl) {
                alert("Error al subir la imagen. Por favor, inténtalo de nuevo.");
                return;
            }
        } else if (alumnoExistente?.imagenCostumbre) {
            // Mantiene la imagen existente
            imagenCostumbreUrl = alumnoExistente.imagenCostumbre;
        }

        // Prepara datos del alumno
        const alumnoData = {
            nombre: nombre,
            origen: origen,
            costumbre: costumbre,
            palabra: palabra,
            avatar: avatar,
            maestroId: maestroId,
            imagenCostumbre: imagenCostumbreUrl
        };

        // Si es edición, agregar el ID
        if (idEdicion && idEdicion !== "-1") {
            alumnoData.id = idEdicion;
        } else {
            // Si es nuevo, generar coordenadas únicas
            const alumnosExistentes = await manager.obtenerAlumnosDelMaestro(maestroId);
            const coordenadas = manager.generarCoordenadasUnicas(alumnosExistentes);
            alumnoData.x = coordenadas.x;
            alumnoData.y = coordenadas.y;
        }

        // Guarda al alumno en Supabase
        const resultado = await manager.guardarAlumno(alumnoData);
    
        if (resultado) {
            // Registra en el historial (nuevo o edición)
            const historialManager = new HistorialManager(maestroId);
            const esEdicion = idEdicion && idEdicion !== "-1";
            await historialManager.registrarAlumnoEnHistorial(resultado.id, esEdicion);
            
            // Actualiza la vista y cierra el modal
            await mostrarAlumnos();
            modal.classList.add("hidden");
            form.reset();
            vistaPrevia.innerHTML = "";
            indiceEdicion.value = "";
            
            // Limpiar el flag de eliminar imagen
            if (document.getElementById("eliminar-imagen-flag")) {
                document.getElementById("eliminar-imagen-flag").value = "false";
            }
        } else {
            alert("Error al guardar el alumno. Por favor, inténtalo de nuevo.");
        }
    };

    // Carga inicial de alumnos
    mostrarAlumnos();

});
