document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('formLogin');
  const params = new URLSearchParams(window.location.search);
  const rolParam = params.get("rol"); // Cambiado a rolParam para evitar confusión

  // Inicialización
  const titulo = document.getElementById("titulo");
  if (titulo) titulo.textContent = rolParam === "maestro" ? "Ingreso Maestro" : "Ingreso Padres";

  // Mostrar selector de maestros solo para padres
  if (rolParam === "padres") {
    const selectorMaestro = document.getElementById("selectorMaestro");
    selectorMaestro.classList.remove("hidden");

    // Cargar lista de maestros
    try {
      const { data: maestros, error } = await supabase
        .from('users')
        .select('id, full_name') // Asegúrate que estos campos existan
        .eq('role', 'maestro')
        .order('full_name', { ascending: true });
      
      if (error) throw error;
      
      if (!maestros || maestros.length === 0) {
        throw new Error("No hay maestros registrados en el sistema. No puedes continuar.");
      }

      const select = document.getElementById("maestro");
      select.innerHTML = '<option value="">Selecciona un maestro</option>';
      maestros.forEach(m => {
        select.innerHTML += `<option value="${m.id}" data-email="${m.email}">${m.full_name}</option>`;
      });
    } catch (error) {
      console.error("Error cargando maestros:", error);
      const selectorMaestro = document.getElementById("selectorMaestro");
      selectorMaestro.innerHTML = `
        <p class="text-red-500">Error cargando maestros: ${error.message}</p>
        <button onclick="location.reload()" class="mt-2 bg-amber-500 text-white px-4 py-2 rounded">
          Recargar página
        </button>
      `;
    }
  }

  // Login
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('contrasena').value;
    const maestroSelect = rolParam === "padres" ? document.getElementById("maestro") : null;

    // Validación para padres
    if (rolParam === "padres" && !maestroSelect.value) {
      alert("Por favor selecciona un maestro");
      return;
    }

    try {
    // 1. Autenticación
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (authError) throw authError;
    if (!authData.user) throw new Error("No se pudo obtener datos del usuario. Carga de nuevo.");

    // 2. Obtener datos del usuario con mejor manejo de errores
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email, role')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (userError) throw userError;
    if (!userData) {
      // Intentar crear el registro si no existe
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: authData.user.id,
          email: authData.user.email,
          full_name: authData.user.email.split('@')[0], // Nombre por defecto
          role: rolParam || 'maestro' // Rol por defecto
        }, { onConflict: 'id' });
      
      if (upsertError) throw new Error("No se pudo crear registro de usuario. Intenta más tarde.");
      
      // Reintentar obtener los datos
      const { data: newUserData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      if (!newUserData) throw new Error("Registro de usuario no creado");
      userData = newUserData;
    }

    // 3. Validar rol
    if (rolParam && rolParam !== userData.role) {
      throw new Error(`Rol incorrecto. Esperado: ${rolParam}, Actual: ${userData.role}`);
    }

    // 4. Guardar en sessionStorage
    sessionStorage.setItem("usuarioNombre", userData.full_name || userData.email);
    sessionStorage.setItem("usuarioId", authData.user.id);
    sessionStorage.setItem("rol", userData.role);

    // NUEVO CÓDIGO A AGREGAR (COMIENZO)
    if (userData.role === "padres" && maestroSelect) {
      sessionStorage.setItem("maestroId", maestroSelect.value);
      sessionStorage.setItem("maestroNombre", maestroSelect.options[maestroSelect.selectedIndex].text);
      
      console.log("Maestro guardado en sessionStorage:", {
        id: maestroSelect.value,
        name: maestroSelect.options[maestroSelect.selectedIndex].text
      });
    }

    // 5. Redirección
    const redirectPath = userData.role === "maestro" 
    ? 'secciones.html' 
    : `cuentacuentos.html?maestroId=${maestroSelect.value}`;
    window.location.href = redirectPath;

      // En el bloque catch del event listener submit en login.js
    } catch (error) {
      console.error("Error en login:", error);
      
      // Mensaje de error más amigable para credenciales inválidas
      let mensajeError = "Error al iniciar sesión";
      
      if (error.message && error.message.includes("Invalid login credentials")) {
        mensajeError = "Credenciales inválidas. Verifica tu correo electrónico y contraseña.";
      } else if (error.message && error.message.includes("Email not confirmed")) {
        mensajeError = "Correo electrónico no confirmado. Por favor, revisa tu bandeja de entrada.";
      } else if (error.message && error.message.includes("User already registered")) {
        mensajeError = "El usuario ya está registrado con otro método de autenticación.";
      } else {
        mensajeError = error.message || "Error al iniciar sesión";
      }
      
      alert(`Error: ${mensajeError}`);
      document.getElementById('contrasena').value = '';
    }
  });
});
