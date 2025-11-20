document.addEventListener('DOMContentLoaded', async () => {
    const formRegistro = document.getElementById('formRegistro');
    const params = new URLSearchParams(window.location.search);
    const rol = params.get("rol");
    
    // Configuración inicial
    document.getElementById('titulo').textContent = rol === 'maestro' 
        ? 'Registro Maestro' 
        : 'Registro Padres';
    
    document.getElementById('enlaceLogin').href = `login.html?rol=${rol}`;

    formRegistro.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = formRegistro.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="animate-spin inline-block">⏳</span> Registrando...`;

        try {
            // Validación de campos
            const campos = {
                nombre: document.getElementById('nombre').value.trim(),
                apellido: document.getElementById('apellido').value.trim(),
                correo: document.getElementById('correo').value.trim(),
                confirmarCorreo: document.getElementById('confirmarCorreo').value.trim(),
                contrasena: document.getElementById('contrasena').value,
                confirmarContrasena: document.getElementById('conf_contrasena').value,
                usuario: document.getElementById('usuario').value.trim()
            };

            // Validaciones básicas
            if (!campos.nombre || !campos.apellido || !campos.usuario) {
                throw new Error("Todos los campos son obligatorios");
            }
            
            if (campos.correo !== campos.confirmarCorreo) {
                throw new Error("Los correos no coinciden");
            }
            
            if (campos.contrasena !== campos.confirmarContrasena) {
                throw new Error("Las contraseñas no coinciden");
            }
            
            if (campos.contrasena.length < 6) {
                throw new Error("La contraseña debe tener al menos 6 caracteres");
            }

            // Paso 1: Registro en Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: campos.correo,
                password: campos.contrasena,
                options: {
                    data: {
                        full_name: `${campos.nombre} ${campos.apellido}`,
                        username: campos.usuario,
                        role: rol // Guardamos el rol en metadata
                    },
                    emailRedirectTo: window.location.origin + '/login.html'
                }
            });

            if (authError) {
                if (authError.message.includes("User already registered")) {
                    throw new Error("Este correo ya está registrado");
                }
                throw new Error(authError.message || "Error al registrar usuario");
            }

            // Si requiere verificación de email
            if (!authData.user) {
                alert('✅ Por favor revisa tu correo para confirmar el registro. Luego inicia sesión.');
                window.location.href = `login.html?rol=${rol}`;
                return;
            }

            // Éxito - redirigir
            alert('✅ Registro exitoso. Por favor inicia sesión.');
            window.location.href = `login.html?rol=${rol}`;

        } catch (error) {
            console.error("Error completo:", error);
            mostrarError(error.message || "Error en el registro");
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });

    function mostrarError(mensaje) {
        const erroresPrevios = document.querySelectorAll('.error-mensaje');
        erroresPrevios.forEach(el => el.remove());
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-mensaje mb-4 p-3 bg-red-100 text-red-700 rounded-lg';
        errorDiv.textContent = mensaje;
        
        const titulo = document.getElementById('titulo');
        titulo.after(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 5000);
    }
});