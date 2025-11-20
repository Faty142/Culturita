class SistemaAccesibilidad {
    constructor() {
        this.guiaActiva = false;
        this.pasoActual = 0;
        this.guiaPasos = [];
        
        // NUEVAS PROPIEDADES PARA EL PANEL
        this.panelPosicion = { left: '50%', bottom: '16px', transform: 'translateX(-50%)' };
        this.panelFijado = false;
        
        this.configurarEventosTeclado();
    }

    //Configurar eventos de teclado
    configurarEventosTeclado() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.guiaActiva) {
                this.salirGuia();
            }
        });
    }

    // Mostrar modal de opciones de ayuda
    mostrarOpcionesAyuda() {
        const modalHTML = `
            <div id="modalAyuda" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]">
                <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                    <h3 class="text-2xl font-bold text-[#78350f] mb-4 text-center">🎯 Centro de Ayuda</h3>
                    
                    <div class="space-y-4">
                        <button id="btnGuiaInteractiva" 
                                class="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3">
                            <span class="text-xl">👣</span>
                            <div class="text-left">
                                <div class="font-bold">Guía Interactiva Paso a Paso</div>
                                <div class="text-sm opacity-90">Te guiamos por cada elemento importante</div>
                            </div>
                        </button>

                        <button id="btnExplicacionCompleta" 
                                class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3">
                            <span class="text-xl">📚</span>
                            <div class="text-left">
                                <div class="font-bold">Explicación Completa</div>
                                <div class="text-sm opacity-90">Información detallada con imágenes</div>
                            </div>
                        </button>

                        <button id="btnCerrarAyuda" 
                                class="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Agregar event listeners
        setTimeout(() => {
            document.getElementById('btnGuiaInteractiva').addEventListener('click', () => this.iniciarGuiaInteractiva());
            document.getElementById('btnExplicacionCompleta').addEventListener('click', () => this.mostrarExplicacionCompleta());
            document.getElementById('btnCerrarAyuda').addEventListener('click', () => this.cerrarModal());
        }, 100);
    }

    // Cerrar modal
    cerrarModal() {
        const modal = document.getElementById('modalAyuda');
        if (modal) modal.remove();
        this.detenerGuia();
    }

    // Iniciar guía interactiva
    iniciarGuiaInteractiva() {
        this.cerrarModal();
        this.guiaActiva = true;
        this.pasoActual = 0;
        this.ejecutarPaso();
    }

    // Ejecutar paso actual de la guía
    ejecutarPaso() {
        if (!this.guiaActiva || this.pasoActual >= this.guiaPasos.length) {
            this.detenerGuia();
            return;
        }

        const paso = this.guiaPasos[this.pasoActual];
        this.mostrarPasoGuia(paso);
    }

    // Mostrar paso individual de la guía
    mostrarPasoGuia(paso) {
        // Remover paso anterior si existe
        this.limpiarGuia();

        const elemento = document.querySelector(paso.selector);
        if (!elemento) {
            this.siguientePaso();
            return;
        }

        // Crear overlay de guía
        const guiaHTML = `
        <div id="guiaOverlay" class="fixed inset-0 z-[99]">
            <div class="absolute inset-0 bg-black/40"></div>
            
            <!-- Flecha indicadora -->
            <div id="flechaGuia" class="absolute z-[100] ${paso.posicionFlecha || 'top-0 left-0'}">
                <div class="text-4xl text-white animate-bounce">⬇️</div>
                <div class="bg-white text-[#78350f] p-3 rounded-lg shadow-lg max-w-xs mt-2">
                    <strong>${paso.titulo}</strong>
                    <p class="text-sm mt-1">${paso.descripcion}</p>
                </div>
            </div>

            <!-- Panel de control MOVIBLE -->
            <div id="panelControl" class="bg-white p-4 rounded-xl shadow-lg border-2 ${this.panelFijado ? 'border-solid border-amber-400' : 'border-dashed border-amber-400'}">
                <!-- Botón para fijar/desfijar -->
                <div class="text-right mb-1">
                    <button id="btnFijarPanel" class="text-xs text-amber-600 hover:text-amber-800" title="${this.panelFijado ? 'Desfijar panel' : 'Fijar panel'}">
                        ${this.panelFijado ? 'Desfijar 🔒' : 'Fijar 📍'}
                    </button>
                </div>
                
                <div class="text-center mb-3">
                    <span class="bg-amber-500 text-white px-3 py-1 rounded-full text-sm">
                        Paso ${this.pasoActual + 1} de ${this.guiaPasos.length}
                    </span>
                </div>
                
                <!-- CONTENEDOR CENTRADO PARA LOS BOTONES -->
                <div class="flex justify-center gap-2">
                    <button id="btnAnteriorGuia" 
                            class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition cursor-pointer flex-1 max-w-[120px]">
                        Anterior
                    </button>
                    <button id="btnSiguienteGuia" 
                            class="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition cursor-pointer flex-1 max-w-[120px]">
                        ${this.pasoActual === this.guiaPasos.length - 1 ? 'Finalizar' : 'Siguiente'}
                    </button>
                </div>
                
                <div class="text-center mt-3">
                    <button id="btnSalirGuia" 
                            class="text-red-500 hover:text-red-700 text-sm underline transition cursor-pointer">
                        🚪 Salir de la guía
                    </button>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', guiaHTML);

        // Posicionar flecha
        this.posicionarFlecha(elemento, paso);
        
        // Configurar panel con posición guardada
        this.configurarPanelConPosicion();
        
        // Resaltar elemento
        elemento.style.boxShadow = '0 0 0 4px #f59e0b, 0 0 20px rgba(245, 158, 11, 0.5)';
        elemento.style.transition = 'all 0.3s ease';
        elemento.style.zIndex = '101';
        elemento.style.pointerEvents = 'auto';

        // Agregar event listeners a los botones
        setTimeout(() => {
            this.configurarPanelMovible();

            const btnAnterior = document.getElementById('btnAnteriorGuia');
            const btnSiguiente = document.getElementById('btnSiguienteGuia');
            const btnSalir = document.getElementById('btnSalirGuia');
            
            if (btnAnterior) {
                btnAnterior.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.pasoAnterior();
                });
            }
            
            if (btnSiguiente) {
                btnSiguiente.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.siguientePaso();
                });
            }

            if (btnSalir) {
                btnSalir.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.salirGuia();
                });
            }

            const overlay = document.getElementById('guiaOverlay');
            if (overlay) {
                overlay.addEventListener('click', (e) => {
                    if (!e.target.closest('.fixed.bottom-4')) {
                        e.stopPropagation();
                    }
                });
            }
        }, 100);
    }

    // Posicionar flecha según el elemento - CON POSICIONES PERSONALIZADAS
    posicionarFlecha(elemento, paso) {
        const flecha = document.getElementById('flechaGuia');
        if (!flecha) return;

        // Si tiene posición personalizada, usar esa
        if (paso.posicionPersonalizada) {
            flecha.style.top = paso.posicionPersonalizada.top;
            flecha.style.left = paso.posicionPersonalizada.left;
            flecha.style.right = paso.posicionPersonalizada.right;
            flecha.style.bottom = paso.posicionPersonalizada.bottom;
            flecha.style.transform = 'translate(-50%, -50%)';
            return;
        }

        // Si no, usar el posicionamiento automático normal
        const rect = elemento.getBoundingClientRect();
        
        switch(paso.posicionFlecha) {
            case 'top':
                flecha.style.top = `${rect.top - 100}px`;
                flecha.style.left = `${rect.left + rect.width/2}px`;
                flecha.style.transform = 'translateX(-50%)';
                break;
            case 'bottom':
                flecha.style.top = `${rect.bottom + 20}px`;
                flecha.style.left = `${rect.left + rect.width/2}px`;
                flecha.style.transform = 'translateX(-50%)';
                break;
            case 'left':
                flecha.style.top = `${rect.top + rect.height/2}px`;
                flecha.style.left = `${rect.left - 120}px`;
                flecha.style.transform = 'translateY(-50%)';
                break;
            case 'right':
            default:
                flecha.style.top = `${rect.top + rect.height/2}px`;
                flecha.style.left = `${rect.right + 20}px`;
                flecha.style.transform = 'translateY(-50%)';
                break;
        }
    }

    // NUEVO MÉTODO: Configurar panel con posición guardada
    configurarPanelConPosicion() {
        const panel = document.getElementById('panelControl');
        if (!panel) return;

        panel.style.position = 'fixed';
        panel.style.width = '320px';
        panel.style.minWidth = '320px';
        panel.style.maxWidth = '320px';
        panel.style.zIndex = '100';
        panel.style.pointerEvents = 'auto';
        panel.style.cursor = this.panelFijado ? 'default' : 'move';

        // Aplicar posición guardada
        panel.style.left = this.panelPosicion.left;
        panel.style.bottom = this.panelPosicion.bottom;
        panel.style.transform = this.panelPosicion.transform;
        panel.style.top = this.panelPosicion.top || 'auto';
    }

    // Configurar panel movible
    configurarPanelMovible() {
        const panel = document.getElementById('panelControl');
        const btnFijar = document.getElementById('btnFijarPanel');
        let isDragging = false;
        let offsetX, offsetY;

        if (!panel || !btnFijar) return;

        // Función para verificar si el clic fue en un botón
        const esClicEnBoton = (elemento) => {
            return elemento.closest('button') !== null;
        };

        // Función para comenzar a arrastrar
        const startDrag = (e) => {
            if (esClicEnBoton(e.target) || this.panelFijado) {
                return;
            }
            
            isDragging = true;
            const rect = panel.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
            panel.style.cursor = 'grabbing';
            panel.style.transition = 'none';
        };

        // Función para arrastrar
        const doDrag = (e) => {
            if (!isDragging) return;
            
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            
            // Mantener dentro de los límites de la ventana
            const maxX = window.innerWidth - 320;
            const maxY = window.innerHeight - panel.offsetHeight;
            
            panel.style.left = `${Math.max(10, Math.min(x, maxX - 10))}px`;
            panel.style.top = `${Math.max(10, Math.min(y, maxY - 10))}px`;
            panel.style.bottom = 'auto';
            panel.style.transform = 'none';
        };

        // Función para terminar de arrastrar
        const stopDrag = () => {
            if (!isDragging) return;
            
            isDragging = false;
            panel.style.cursor = this.panelFijado ? 'default' : 'move';
            
            // GUARDAR LA NUEVA POSICIÓN
            this.panelPosicion = {
                left: panel.style.left,
                top: panel.style.top,
                bottom: panel.style.bottom,
                transform: panel.style.transform
            };
        };

        // Alternar fijado/desfijado - MEJORADO
        btnFijar.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            this.panelFijado = !this.panelFijado;
            
            if (this.panelFijado) {
                // FIJAR: Cambiar estilo
                panel.style.cursor = 'default';
                panel.style.borderStyle = 'solid';
                panel.style.borderColor = '#f59e0b';
                btnFijar.textContent = 'Desfijar 🔒';
                btnFijar.title = 'Desfijar panel';
            } else {
                // DESFIJAR: Cambiar estilo
                panel.style.cursor = 'move';
                panel.style.borderStyle = 'dashed';
                panel.style.borderColor = '#f59e0b';
                btnFijar.textContent = 'Fijar 📍';
                btnFijar.title = 'Fijar panel';
            }
            
            // Actualizar clase CSS
            panel.className = this.panelFijado 
                ? 'bg-white p-4 rounded-xl shadow-lg border-2 border-solid border-amber-400'
                : 'bg-white p-4 rounded-xl shadow-lg border-2 border-dashed border-amber-400';
        });

        // Event listeners para arrastre
        panel.addEventListener('mousedown', (e) => {
            if (!esClicEnBoton(e.target) && !this.panelFijado && e.button === 0) {
                startDrag(e);
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                doDrag(e);
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                stopDrag();
            }
        });
        
        // Para dispositivos táctiles
        panel.addEventListener('touchstart', (e) => {
            if (!esClicEnBoton(e.target) && !this.panelFijado) {
                startDrag(e.touches[0]);
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (isDragging) {
                doDrag(e.touches[0]);
                e.preventDefault();
            }
        });

        document.addEventListener('touchend', () => {
            if (isDragging) {
                stopDrag();
            }
        });

        // Prevenir que los clics en botones se propaguen para arrastre
        const botones = panel.querySelectorAll('button');
        botones.forEach(boton => {
            boton.addEventListener('mousedown', (e) => {
                e.stopPropagation();
            });
            boton.addEventListener('touchstart', (e) => {
                e.stopPropagation();
            });
        });
    }

    // Navegación entre pasos
    siguientePaso() {
        this.pasoActual++;
        this.ejecutarPaso();
    }

    pasoAnterior() {
        if (this.pasoActual > 0) {
            this.pasoActual--;
            this.ejecutarPaso();
        }
    }

    // Limpiar guía
    limpiarGuia() {
        const guia = document.getElementById('guiaOverlay');
        if (guia) guia.remove();
        
        // Remover estilos de elementos
        document.querySelectorAll('[style*="box-shadow"]').forEach(el => {
            el.style.boxShadow = '';
            el.style.zIndex = '';
            el.style.pointerEvents = ''; // Restaurar pointer-events
        });
    }

    // Detener guía
    detenerGuia() {
        this.guiaActiva = false;
        this.pasoActual = 0;
        
        // RESETEAR POSICIÓN DEL PANEL PARA LA PRÓXIMA VEZ
        this.panelPosicion = { left: '50%', bottom: '16px', transform: 'translateX(-50%)' };
        this.panelFijado = false;
        
        this.limpiarGuia();
    }

    // Salir de la guía interactiva
    salirGuia() {
        if (confirm('¿Estás seguro de que quieres salir de la guía interactiva?\nPodrás volver a activarla cuando quieras.')) {
            this.detenerGuia();
            
            // Opcional: Mostrar un mensaje de confirmación
            const mensajeHTML = `
                <div id="mensajeSalida" class="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-[100] pointer-events-auto">
                    <div class="flex items-center gap-2">
                        <span>✅</span>
                        <div>
                            <strong>Guía finalizada</strong>
                            <p class="text-sm">Puedes volver a activarla con el botón de ayuda</p>
                        </div>
                        <button onclick="document.getElementById('mensajeSalida').remove()" 
                                class="text-white hover:text-gray-200 ml-2">×</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', mensajeHTML);
            
            // Auto-eliminar el mensaje después de 5 segundos
            setTimeout(() => {
                const mensaje = document.getElementById('mensajeSalida');
                if (mensaje) mensaje.remove();
            }, 5000);
        }
    }

    // Mostrar explicación completa
    mostrarExplicacionCompleta() {
        this.cerrarModal();
        this.mostrarModalExplicacion();
    }

    // Modal de explicación completa (se sobreescribe en cada página)
    mostrarModalExplicacion() {
        // Este método se sobreescribe en cada página específica
        console.log("Mostrar explicación completa - implementar en cada página");
    }
}

// Instancia global
const sistemaAyuda = new SistemaAccesibilidad();