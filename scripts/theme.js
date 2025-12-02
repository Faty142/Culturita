// Crea este archivo: scripts/theme.js
class ThemeManager {
    constructor() {
        console.log('✅ ThemeManager inicializado');
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        console.log('🎨 Tema actual:', this.theme);
        
        // Aplicar tema guardado
        this.applyTheme(this.theme);
        
        // Configurar botón
        const toggleBtn = document.getElementById('toggleDarkMode');
        console.log('🔘 Botón encontrado:', toggleBtn);
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                console.log('🖱️ Botón clickeado');
                this.toggleTheme();
            });
        } else {
            console.error('❌ Botón toggleDarkMode no encontrado');
        }
    }

    applyTheme(theme) {
        console.log('🎨 Aplicando tema:', theme);
        const html = document.documentElement;
        
        if (theme === 'dark') {
            html.classList.add('dark');
            console.log('🌙 Clase "dark" agregada');
            this.updateIcon('☀️');
        } else {
            html.classList.remove('dark');
            console.log('☀️ Clase "dark" removida');
            this.updateIcon('🌙');
        }
        
        localStorage.setItem('theme', theme);
        console.log('💾 Tema guardado en localStorage:', theme);
    }

    toggleTheme() {
        console.log('🔄 Cambiando tema...');
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        console.log('Nuevo tema:', this.theme);
        this.applyTheme(this.theme);
    }

    updateIcon(icon) {
        const iconElement = document.getElementById('themeIcon');
        if (iconElement) {
            console.log('🔄 Cambiando ícono a:', icon);
            iconElement.textContent = icon;
        }
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM cargado - iniciando ThemeManager');
    window.themeManager = new ThemeManager();
});