// Clase base para usuarios del sistema
class Usuario {
  constructor(id, nombre, correo, contrasena, rol) {
    this.id = id;
    this.nombre = nombre;
    this.correo = correo;
    this.contrasena = contrasena;
    this.rol = rol;
  }
}

// Clase para representar audios subidos por los padres para los maestros
class AudioCuentacuentos {
  constructor({id, titulo, descripcion, categoria, url, subidoPor, maestroId, descargado = false}) {
    this.id = id;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.categoria = categoria;
    this.url = url;
    this.subidoPor = subidoPor;
    this.maestroId = maestroId;
    this.descargado = descargado;
  }
}

// Clase para representar alumnos en el Mapa Mágico
class Alumno {
  constructor(id, nombre, origen, costumbre, palabra, avatar, maestroId, x, y, imagenCostumbre) {
    this.id = id;
    this.nombre = nombre;
    this.origen = origen;
    this.costumbre = costumbre;
    this.palabra = palabra;
    this.avatar = avatar;
    this.maestroId = maestroId;
    this.x = x; // Coordenada X en el mapa
    this.y = y; // Coordenada Y en el mapa
    this.imagenCostumbre = imagenCostumbre; // URL de la imagen de la costumbre del alumno
  }
}

// Clase para representar estados culturales con sus tradiciones
class EstadoCultural {
  constructor(nombre, desbloqueado, miniHistoria, tradicion, manualidad, palabra, significado, valor, pasosManualidad, propositoManualidad, imagenManualidad, creditosManualidad) {
    this.nombre = nombre;
    this.desbloqueado = desbloqueado; //Si esta disponible para el usuario
    this.miniHistoria = miniHistoria;
    this.tradicion = tradicion;
    this.manualidad = manualidad;
    this.palabra = palabra;
    this.significado = significado;
    this.valor = valor;
    this.pasosManualidad = pasosManualidad; //Array de pasos
    this.propositoManualidad = propositoManualidad;
    this.imagenManualidad = imagenManualidad; // Nombre del archivo de imagen
    this.creditosManualidad = creditosManualidad;
  }
}

// Manager para gestionar los estados culturales (datos estaticos)
class ExploradoresManager {
  // Datos precargados de todos los estadod de México
    static datosEstados = {
        "Chiapas": new EstadoCultural(
            "Chiapas",
            true,
            "Raíces mayas y tradiciones vivas con mestizaje.",
            "Danza del Parachico en Chiapa de Corzo.",
            "Máscaras hechas con cartón y papel crepé.",
            "Chun",
            "Niño pequeño",
            "Respeto a la ancestralidad",
            [
                "1. Recorta una máscara del Parachico en cartón reciclado.",
                "2. Decora con papel crepé de colores para simular el tocado.",
                "3. Usa botones, semillas o recortes para los detalles.",
                "4. Escribe una frase alegre sobre la fiesta en una tira de papel."
            ],
            "Representar la alegría comunitaria del Parachico usando materiales reciclables y accesibles.",
            "manchiapas.png",
            "Adaptado por Culturita para actividades escolares con materiales disponibles en comunidades rurales."
        ),
        "Tabasco": new EstadoCultural("Tabasco", false),
        "Baja California": new EstadoCultural("Baja California", false),
        "Baja California Sur": new EstadoCultural(
            "Baja California Sur",
            true,
            "Paisajes de desierto y mar donde convergen leyendas y biodiversidad.",
            "Festival de la ballena gris — conexión con la fauna marina.",
            "Ballena modelada con masa de harina y sal.",
            "Kasa",
            "Pez (lengua cochimí, extinta)",
            "Conservación ecológica",
            [
                "1. Prepara masa casera con harina, sal y agua.",
                "2. Modela la figura de una ballena con ayuda del adulto.",
                "3. Usa semillas para ojos y aletas.",
                "4. Déjala secar al sol y píntala con azul o gris."
            ],
            "Explorar el vínculo ecológico con la fauna marina.",
            "manbajacalisur.png",
            "Inspirado en actividades marinas, adaptado por Culturita para educación rural."
        ),
        "Sonora": new EstadoCultural(
            "Sonora",
            true,
            "Territorio de los yaquis, seris y pimas, con huellas del mestizaje y tradiciones vaqueras.",
            "Danza del Venado — ritual indígena que honra la naturaleza y la cacería.",
            "Venado elaborado con hojas secas y cartón.",
            "Buki",
            "Niño (lengua mayo)",
            "Respeto a los ciclos de la naturaleza",
            [
                "1. Dibuja un venado en cartón y recórtalo con ayuda.",
                "2. Pega hojas secas en el cuerpo para simular pelaje.",
                "3. Agrega ojos con semillas o botones.",
                "4. Escribe una leyenda sobre el venado y la naturaleza."
            ],
            "Honrar el vínculo entre naturaleza y cultura yaqui.",
            "mansonora.png",
            "Desarrollado por Culturita para celebrar la tradición yaqui con materiales naturales."
        ),
        "Chihuahua": new EstadoCultural("Chihuahua", false),
        "Coahuila": new EstadoCultural("Coahuila", false),
        "Nuevo León": new EstadoCultural("Nuevo León", false),
        "Tamaulipas": new EstadoCultural("Tamaulipas", false),
        "Durango": new EstadoCultural(
            "Durango",
            true,
            "Estado minero con raíces tepehuanas y una rica tradición cinematográfica.",
            "Fiestas de la candelaria con danzas y procesiones.",
            "Sombrero vaquero hecho con papel periódico y cinta.",
            "Ñatá",
            "Agua (lengua tepehuana)",
            "Identidad y resiliencia cultural",
            [
                "1. Forma la base del sombrero con bolas de papel arrugado.",
                "2. Cúbrelo con más papel y pégalos formando la copa.",
                "3. Píntalo de marrón o gris y decora con estrellas de papel.",
                "4. Agrega una cinta o cordón reciclado como adorno."
            ],
            "Celebrar la tradición vaquera y la identidad local.",
            "mandurango.png",
            "Inspirado en la tradición vaquera duranguense. Versión accesible desarrollada por Culturita."
        ),
        "Sinaloa": new EstadoCultural("Sinaloa", false),
        "Zacatecas": new EstadoCultural("Zacatecas", false),
        "San Luis Potosí": new EstadoCultural(
            "San Luis Potosí",
            true,
            "Zona huasteca y desértica con una mezcla de culturas vivas.",
            "Xantolo — celebración huasteca del Día de Muertos.",
            "Máscara de cartón pintada con motivos huastecos.",
            "Tamän",
            "Casa (lengua tének)",
            "Hospitalidad y arraigo",
            [
                "1. Recorta una máscara ovalada en cartón de caja.",
                "2. Dibuja una cara alegre y píntala con colores vivos.",
                "3. Agrega tiras de papel en los bordes simulando decoración.",
                "4. Coloca hilo o rafia para colgarla en el aula."
            ],
            "Celebrar el Xantolo con identidad visual propia.",
            "mansanluispoto.png",
            "Diseñado por Culturita como forma accesible de explorar el Xantolo en actividades de kínder."
        ),
        "Aguascalientes": new EstadoCultural("Aguascalientes", false),
        "Nayarit": new EstadoCultural("Nayarit", false),
        "Jalisco": new EstadoCultural("Jalisco", false),
        "Guanajuato": new EstadoCultural("Guanajuato", false),
        "Querétaro": new EstadoCultural(
            "Querétaro",
            true,
            "Lugar de encuentros: otomíes, chichimecas y herencia colonial.",
            "Fiesta de la Santa Cruz en el Cerro del Sangremal.",
            "Cruz decorativa con ramitas, papel y flores de colores.",
            "Dähñö",
            "Gente (lengua otomí)",
            "Colaboración y comunidad",
            [
                "1. Recolecta dos palitos y únelos formando una cruz.",
                "2. Pega flores hechas con papel crepé en los extremos.",
                "3. Decora el centro con semillas o dibujos de la comunidad.",
                "4. Agrega una frase que celebre la unión y la identidad local."
            ],
            "Representar la fiesta de la Santa Cruz y la unión comunitaria.",
            "manqueretaro.png",
            "Actividad propuesta por Culturita para celebrar el valor comunitario en el entorno escolar."
        ),
        "Hidalgo": new EstadoCultural(
            "Hidalgo",
            true,
            "Territorio otomí-tepehua, con historia minera y arquitectura inglesa.",
            "Festival del paste — mezcla gastronómica cultural.",
            "Rebozos de Tenango bordados con narrativa visual.",
            "Gatä",
            "Luna (lengua otomí)",
            "Herencia trabajadora",
            [
                "1. Dibuja calaveras en cartulina negra y recórtalas.",
                "2. Decóralas con patrones huastecos usando colores fluorescentes.",
                "3. Forma una guirnalda uniendo las calaveras con listones coloridos.",
                "4. Incluye una pequeña nota explicando el origen del Xantolo."
            ],
            "Mezcla la narrativa textil de Tenango con un toque de Xantolo.",
            "manhidalgo.png",
            "Creación basada en las tradiciones de la Huasteca Hidalguense por Culturita."
        ),
        "CDMX": new EstadoCultural("CDMX", false),
        "Estado de México": new EstadoCultural("Estado de México", false),
        "Morelos": new EstadoCultural("Morelos", false),
        "Puebla": new EstadoCultural("Puebla", false),
        "Tlaxcala": new EstadoCultural("Tlaxcala", false),
        "Michoacán": new EstadoCultural(
            "Michoacán",
            true,
            "Corazón purépecha, tierra de mariposas, volcanes y maque tradicional.",
            "Noche de Muertos en Pátzcuaro con ofrendas flotantes.",
            "Ofrenda simbólica hecha con papel, semillas y dibujos.",
            "Kuinchekua",
            "Fiesta (lengua purépecha)",
            "Vínculo ancestral con los difuntos",
            [
                "1. En cartulina, dibuja una mesa y elementos como flores, fotos y comida.",
                "2. Usa semillas, papel picado y recortes para decorar la ofrenda.",
                "3. Agrega dibujos de mariposas como símbolo del alma.",
                "4. Escribe una frase sobre la memoria y los seres queridos."
            ],
            "Conectar con la tradición purépecha y el Día de Muertos.",
            "manmichoacan.png",
            "Creación educativa inspirada por tradiciones purépechas, adaptada por Culturita para espacios escolares."
        ),
        "Colima": new EstadoCultural("Colima", false),
        "Guerrero": new EstadoCultural("Guerrero", false),
        "Oaxaca": new EstadoCultural("Oaxaca", false),
        "Veracruz": new EstadoCultural("Veracruz", false),
        "Campeche": new EstadoCultural("Campeche", false),
        "Yucatán": new EstadoCultural("Yucatán", false),
        "Quintana Roo": new EstadoCultural("Quintana Roo", false)
    };
}

// Clase para controlar el modal que muestra información de estados
class ModalEstado {
  constructor(idModal) {
    this.modal = document.getElementById(idModal);
  }

  // Muestra el modal con  datos de un estado específico
  mostrar(estadoObj) {
    this.modal.classList.remove("hidden");
    // Llena los campos del modal con los datos del estado
    this.modal.querySelector("#estadoTitulo").textContent = estadoObj.nombre;
    this.modal.querySelector("#miniHistoria").textContent = estadoObj.miniHistoria;
    this.modal.querySelector("#tradicion").textContent = estadoObj.tradicion;
    this.modal.querySelector("#manualidad").textContent = estadoObj.manualidad;
    this.modal.querySelector("#palabra").textContent = estadoObj.palabra;
    this.modal.querySelector("#significado").textContent = estadoObj.significado;
    this.modal.querySelector("#valor").textContent = estadoObj.valor;
  }

  // Oculta el modal
  cerrar() {
    this.modal.classList.add("hidden");
  }
}

// Manager para la funcionalidad de CuentaCuentos (audios)
class CuentaCuentosManager {
  constructor() {}

  // Sube un archivo de audio a Supabase y devuelve la URL pública
  async subirAudioYObtenerUrl(archivo) {
    const nombreArchivo = `${Date.now()}_${archivo.name}`;
    const { data, error } = await supabase.storage
      .from('audios')
      .upload(nombreArchivo, archivo);
    
    if (error) throw error;
    return supabase.storage.from('audios').getPublicUrl(nombreArchivo).data.publicUrl;
  }

  // Guarda la metadata del audio en la base de datos
  async guardarAudio(audio) {
    try {
      // 1. Verificar autenticación
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Usuario no autenticado");

      // 2. Usa una stored procedure de Supabase para insertar de forma segura
      const { data, error } = await supabase.rpc('insertar_audio_seguro', {
        titulo: audio.titulo,
        descripcion: audio.descripcion,
        categoria: audio.categoria,
        url_audio: audio.url,
        id_maestro: audio.maestroId,
        subido_por: user.email
      });

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error en guardarAudio:', {
        message: error.message,
        code: error.code,
        details: error
      });
      throw error;
    }
  }

  // Obtiene los audios visibles para un maestro específico
  async obtenerAudiosDelMaestro(maestroId) {
    console.log("Obteniendo audios para maestro ID:", maestroId);
    
    // Consulta a Supabase con joins para obtener información del usuario que subio el audio
    const { data, error } = await supabase
      .from('audio_stories')
      .select(`
        id,
        title,
        description,
        category,
        file_url,
        subido_por,
        maestro_id,
        is_downloaded,
        is_hidden,
        users:subido_por(full_name)
      `)
      .eq('maestro_id', maestroId)
      .eq('is_hidden', false) // Solo audios no ocultos
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener audios:', error);
      return [];
    }
    
    console.log("Audios encontrados:", data);
    
    // Mapea los resultados a objetos AudioCuentacuentos
    return data.map(item => new AudioCuentacuentos({
      id: item.id,
      titulo: item.title,
      descripcion: item.description,
      categoria: item.category,
      url: item.file_url,
      subidoPor: item.users?.full_name || item.subido_por,
      maestroId: item.maestro_id,
      descargado: item.is_downloaded,
      oculto: item.is_hidden
    }));
  }

  // Elimina un audio (soft delete si fue descargado, hard delete si no)
  async eliminarAudioDeCuentaCuentos(audioId) {
    try {
      // 1. Obtener información del audio
      const { data: audio, error: fetchError } = await supabase
        .from('audio_stories')
        .select('is_downloaded, file_url')
        .eq('id', audioId)
        .single();

      if (fetchError) throw fetchError;

      // 2. Si fue descargado, marcamos como oculto en lugar de eliminar
      if (audio.is_downloaded) {
        const { error: updateError } = await supabase
          .from('audio_stories')
          .update({ 
            is_hidden: true,
            hidden_at: new Date().toISOString()
          })
          .eq('id', audioId);

        if (updateError) throw updateError;
        return { action: 'hidden' };
      }

      // 3. Si nunca fue descargado, eliminamos completamente
      const fileName = audio.file_url.split('/').pop();
      await supabase.storage.from('audios').remove([fileName]);
      
      const { error: deleteError } = await supabase
        .from('audio_stories')
        .delete()
        .eq('id', audioId);

      if (deleteError) throw deleteError;
      return { action: 'deleted' };

    } catch (error) {
      console.error('Error en eliminarAudioDeCuentaCuentos:', error);
      throw error;
    }
  }

  // Obtiene un audio por su URL
  async obtenerAudioPorUrl(url) {
    const { data, error } = await supabase
      .from('audio_stories')
      .select('*')
      .eq('file_url', url)
      .single();
      
    if (error) {
      console.error('Error al obtener audio por URL:', error);
      return null;
    }
    return data;
  }

  // Marca un audio como descargado y genera una URL fiemada para descarga
  async marcarComoDescargado(audioId) {
    try {
      // 1. Obtener información del audio
      const { data: audio, error: fetchError } = await supabase
        .from('audio_stories')
        .select('file_url, maestro_id, title')
        .eq('id', audioId)
        .single();

      if (fetchError || !audio) throw new Error('Audio no encontrado en la base de datos');

      // 2. Obtener URL de descarga directa con firma temporal
      const fileName = audio.file_url.split('/').pop();
      const { data: { signedUrl } } = await supabase
        .storage
        .from('audios')
        .createSignedUrl(fileName, 3600, {
          download: true // Fuerza la descarga en lugar de la vista previa
        });

      if (!signedUrl) throw new Error('El archivo no existe en el bucket de audios');

      // 3. Actualizar estado de descarga en la base de datos
      const { error: updateError } = await supabase
        .from('audio_stories')
        .update({
          is_downloaded: true,
          downloaded_at: new Date().toISOString()
        })
        .eq('id', audioId);

      if (updateError) throw updateError;

      // Devolver la URL firmada y un nombre de archivo amigable
      return {
        url: signedUrl,
        filename: `${audio.title.replace(/[^a-z0-9]/gi, '_')}.${fileName.split('.').pop() || 'mp3'}`
      };
    } catch (error) {
      console.error('Error en marcarComoDescargado:', {
        message: error.message,
        audioId: audioId,
        stack: error.stack
      });
      throw error;
    }
  }

  // Soft delete para audios (solo los oculta)
  async eliminarAudioParaMaestro(audioId) {
    const { error } = await supabase
      .from('audio_stories')
      .update({ 
        is_hidden: true,
        hidden_at: new Date().toISOString()
      })
      .eq('id', audioId);

    if (error) throw error;
    return true;
  }
}

// Manager para la funcionalidad del Mapa Mágico
class MapaMagicoManager {
  constructor() {}

  // Sube una imagen a Supabase Storage y devuelve la URL pública
  async subirImagen(archivo) {
    try {
        if (!archivo) return null;
        
        // Usar carpeta alumnos/ para todas las imágenes
        const nombreArchivo = `alumnos/${Date.now()}_${archivo.name.replace(/\s+/g, '_')}`;
        
        // Subir el archivo
        const { error: uploadError } = await supabase.storage
            .from('student-images')
            .upload(nombreArchivo, archivo, {
                cacheControl: '3600',
                upsert: false
            });
        
        if (uploadError) throw uploadError;
        
        // Obtener URL pública
        const { data: { publicUrl } } = await supabase.storage
            .from('student-images')
            .getPublicUrl(nombreArchivo);
        
        return publicUrl;
    } catch (error) {
        console.error('Error al subir imagen:', {
            message: error.message,
            fileName: archivo?.name,
            errorObj: error
        });
        return null;
    }
  }

  // Obtiene un alumno por su ID
  async obtenerAlumno(id) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error al obtener alumno:', error);
      return null;
    }
    return data;
  }

  // Genera coordenadas únicas para un nuevo alumno en el mapa
  generarCoordenadasUnicas(alumnosExistentes, distanciaMinima = 5) {
    let nuevaX, nuevaY, repetido = true;
    while (repetido) {
      nuevaX = Math.floor(Math.random() * 80) + 10; // Entre 10% y 90%
      nuevaY = Math.floor(Math.random() * 60) + 20; // Entre 20% y 80%
      // Verifica que no este demaciado cerca de otros alumnos
      repetido = alumnosExistentes.some(al => al.x && al.y && Math.abs(al.x - nuevaX) < distanciaMinima && Math.abs(al.y - nuevaY) < distanciaMinima);
    }
    return { x: nuevaX, y: nuevaY };
  }

  // Guarda o actualiza un alumno en la base de datos
  async guardarAlumno(alumno) {
    try {
      const datosAlumno = {
        name: alumno.nombre,
        origin: alumno.origen,
        custom: alumno.costumbre,
        word: alumno.palabra,
        avatar: alumno.avatar,
        maestro_id: alumno.maestroId,
        x: alumno.x,
        y: alumno.y,
        custom_image: alumno.imagenCostumbre
      };

      // Si tiene ID, es una actualización
      if (alumno.id) {
        const { data, error } = await supabase
          .from('students')
          .update(datosAlumno)
          .eq('id', alumno.id)
          .select();
        
        if (error) throw error;
        return data[0];
      } 
      // Si no tiene ID, es una inserción
      else {
        const { data, error } = await supabase
          .from('students')
          .insert(datosAlumno)
          .select();
        
        if (error) throw error;
        return data[0];
      }
    } catch (error) {
      console.error('Error al guardar alumno:', error);
      return null;
    }
  }

  // Elimina un alumno del mapa (soft delete)
  async eliminarAlumno(alumnoId) {
    try {
      // 1. Primero verifica si el alumno existe
      const { data: alumno, error: fetchError } = await supabase
        .from('students')
        .select('id')
        .eq('id', alumnoId)
        .single();

      if (fetchError || !alumno) {
        throw new Error('Alumno no encontrado');
      }

      // 2. Marca como oculto en students (soft delete)
      const { error } = await supabase
        .from('students')
        .update({ 
          is_hidden: true,
          hidden_at: new Date().toISOString()
        })
        .eq('id', alumnoId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error en eliminarAlumno:', error);
      return false;
    }
  }

  // Mueve un alumno a nuevas coordenadas en el mapa
  async moverAlumno(alumnoId, nuevasCoordenadas) {
    try {
        const { error } = await supabase
            .from('students')
            .update({
                x: nuevasCoordenadas.x,
                y: nuevasCoordenadas.y
            })
            .eq('id', alumnoId);
            
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error al mover alumno:', error);
        return false;
    }
  }

  // Obtiene todos los alumnos visibles para un maestro específico
  async obtenerAlumnosDelMaestro(maestroId) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('maestro_id', maestroId)
      .eq('is_hidden', false) // Solo muestra alumnos no ocultos
      .order('id', { ascending: false });

    if (error) {
      console.error('Error al obtener alumnos:', error);
      return [];
    }
    return data.map(item => new Alumno(
      item.id,
      item.name,
      item.origin,
      item.custom,
      item.word,
      item.avatar,
      item.maestro_id,
      item.x,
      item.y,
      item.custom_image
    ));
  }
}

// Manager para el historial de actividades del maestro
class HistorialManager {
  constructor(maestroId) {
    this.maestroId = maestroId;
  }

  // Obtiene los datos que el maestro ha descargado
  async obtenerAudiosDescargados() {
    const { data, error } = await supabase
      .from('audio_stories')
      .select(`
        id,
        title,
        description,
        category,
        file_url,
        is_downloaded,
        downloaded_at,
        subido_por,
        users_subidor:subido_por(full_name)  // <-- Relación explícita
      `)
      .eq('maestro_id', this.maestroId)
      .eq('is_downloaded', true)
      // Mostrar todos los audios descargados, incluso los ocultos
      .order('downloaded_at', { ascending: false });

    if (error) {
      console.error('Error al obtener audios descargados:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      data: new AudioCuentacuentos({
        id: item.id,
        titulo: item.title,
        descripcion: item.description,
        categoria: item.category,
        url: item.file_url,
        subidoPor: item.users_subidor?.full_name || item.subido_por,
        maestroId: item.maestro_id,
        descargado: item.is_downloaded,
        fechaDescarga: item.downloaded_at,
        oculto: item.is_hidden
      })
    }));
  }

  // Elimina un audio del historial (soft delete, solo marca como no descargado)
  async eliminarAudioDelHistorial(audioId) {
    // Solo marca como no descargado en lugar de eliminar
    const { error } = await supabase
      .from('audio_stories')
      .update({ is_downloaded: false })
      .eq('id', audioId);

    if (error) {
      console.error('Error al eliminar audio del historial:', error);
      return false;
    }
    return true;
  }

  // Registra una acción en el historial
  async guardarHistorial(tipo, idEntidad, esEdicion = false) {
    const { error } = await supabase
      .from('history')
      .upsert({
        user_id: this.maestroId,
        entity_type: tipo,
        entity_id: idEntidad,
        is_edited: esEdicion,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,entity_type,entity_id'
      });
      
    if (error) {
      console.error('Error al guardar el historial:', error);
      return false;
    }
    return true;
  }

  // Obtiene el historial por tipo de entidad
  async obtenerHistorial(tipo) {
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', this.maestroId)
      .eq('entity_type', tipo);
    if (error) {
      console.error('Error al obtener el historial:', error);
      return [];
    }
    return data;
  }

  // Elimina el item del historial
  async eliminarDelHistorial(tipo, idEntidad) {
    const { error } = await supabase
      .from('history')
      .delete()
      .eq('user_id', this.maestroId)
      .eq('entity_type', tipo)
      .eq('entity_id', idEntidad);
    if (error) {
      console.error('Error al eliminar del historial:', error);
      return false;
    }
    return true;
  }

  // Limpia completamente el historial del maestro
  async limpiarHistorialCompleto() {
    try {
      // 1. Marcar todos los audios como no descargados
      await supabase
        .from('audio_stories')
        .update({ is_downloaded: false })
        .eq('maestro_id', this.maestroId);
      
      // 2. Eliminar todos los registros de alumnos del historial
      await supabase
        .from('history')
        .delete()
        .eq('user_id', this.maestroId)
        .eq('entity_type', 'alumno');
      
      // 3. Marcar todas las exploraciones como eliminadas
      await supabase
        .from('state_downloads')
        .update({ 
          deleted: true,
          deleted_at: new Date().toISOString()
        })
        .eq('user_id', this.maestroId);
      
      return true;
    } catch (error) {
      console.error('Error en limpiarHistorialCompleto:', error);
      return false;
    }
  }


  // Obtiene los alumnos registrados por el maestro
  async obtenerAlumnos() {
    try {
      // 1. Primero obtenemos los IDs de alumnos que SÍ están en el historial
      const { data: historial, error: errorHistorial } = await supabase
        .from('history')
        .select('entity_id')
        .eq('user_id', this.maestroId)
        .eq('entity_type', 'alumno');

      if (errorHistorial) throw errorHistorial;

      // Si no hay registros en el historial, retornar array vacío
      if (!historial || historial.length === 0) return [];

      // 2. Obtenemos solo los alumnos que están en el historial
      const idsAlumnos = historial.map(item => item.entity_id);
      const { data: alumnos, error: errorAlumnos } = await supabase
        .from('students')
        .select('*')
        .in('id', idsAlumnos)
        .order('created_at', { ascending: false });

      if (errorAlumnos) throw errorAlumnos;

      return alumnos.map(item => ({
        id: item.id,
        data: new Alumno(
          item.id,
          item.name,
          item.origin,
          item.custom,
          item.word,
          item.avatar,
          item.maestro_id,
          item.x,
          item.y,
          item.custom_image
        )
      }));
    } catch (error) {
      console.error('Error al obtener alumnos para historial:', error);
      return [];
    }
  }

  // Obtener las exploraciones (descargas de estados) del maestro
  async obtenerExploraciones() {
    try {
      // 1. Obtenemos las descargas registradas en Supabase
      const { data: descargas, error } = await supabase
        .from('state_downloads')
        .select('*')
        .eq('user_id', this.maestroId)
        .eq('deleted', false)
        .order('downloaded_at', { ascending: false });

      if (error) throw error;

      // 2. Combinamos con los datos estáticos de los estados
      const exploracionesCompletas = descargas.map(item => {
        const estadoData = ExploradoresManager.datosEstados[item.state_name] || {
          nombre: item.state_name,
          miniHistoria: 'Información no disponible',
          tradicion: 'Datos no cargados',
          manualidad: 'Manualidad no especificada',
          palabra: '--',
          significado: '--',
          valor: '--'
        };

        return {
          id: item.id,
          data: {
            // Datos del registro de descarga
            fechaDescarga: new Date(item.downloaded_at).toLocaleDateString('es-MX', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }),
            fechaCompleta: item.downloaded_at,
            
            // Datos del estado (combinación de Supabase y datos locales)
            nombre: item.state_name,
            miniHistoria: estadoData.miniHistoria,
            tradicion: estadoData.tradicion,
            manualidad: estadoData.manualidad,
            palabra: estadoData.palabra,
            significado: estadoData.significado,
            valor: estadoData.valor,
            
            // Datos adicionales para el PDF
            pasosManualidad: estadoData.pasosManualidad || [],
            propositoManualidad: estadoData.propositoManualidad || '',
            imagenManualidad: estadoData.imagenManualidad || '',
            creditosManualidad: estadoData.creditosManualidad || ''
          }
        };
      });

      return exploracionesCompletas;
    } catch (error) {
      console.error('Error en obtenerExploraciones:', {
        message: error.message,
        maestroId: this.maestroId,
        errorObj: error
      });
      return [];
    }
  }

  // Elimina una exploración del historial (soft delete)
  async eliminarExploracion(idDescarga) {
    try {
        // 1. Verificar que el registro existe y pertenece al usuario
        const { data: descarga, error: fetchError } = await supabase
            .from('state_downloads')
            .select('id, user_id')
            .eq('id', idDescarga)
            .single();

        if (fetchError || !descarga) {
            throw new Error('Registro no encontrado');
        }

        if (descarga.user_id !== this.maestroId) {
            throw new Error('No tienes permisos para eliminar este registro');
        }

        // 2. Marcar como eliminado (soft delete)
        const { error } = await supabase
            .from('state_downloads')
            .update({ 
                deleted: true,
                deleted_at: new Date().toISOString()
            })
            .eq('id', idDescarga);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error al eliminar exploración:', {
            message: error.message,
            idDescarga: idDescarga,
            maestroId: this.maestroId,
            errorObj: error
        });
        return false;
    }
  }

  // Elimina un alumno del historial (soft delete) (no de la tabla de students)
  async eliminarAlumnoDelHistorial(alumnoId) {
    try {
      const { error } = await supabase
        .from('history')
        .delete()
        .eq('user_id', this.maestroId)
        .eq('entity_type', 'alumno')
        .eq('entity_id', alumnoId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error al eliminar alumno del historial:', error);
      return false;
    }
  }

  // Elimina completamente un alumno (soft delete en students)
  async eliminarAlumno(alumnoId) {
    try {
      // En lugar de eliminar, marcamos como oculto
      const { error } = await supabase
        .from('students')
        .update({ 
          is_hidden: true,
          hidden_at: new Date().toISOString()
        })
        .eq('id', alumnoId);

      if (error) {
        console.error('Error al marcar alumno como oculto:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error en eliminarAlumno:', error);
      return false;
    }
  }

  // Registrar un alumno en el historial del maestro (sin afectar la tabla de students)
  async registrarAlumnoEnHistorial(alumnoId, esEdicion = false) {
    try {
        const { data: existing, error: fetchError } = await supabase
            .from('history')
            .select('*')
            .eq('user_id', this.maestroId)
            .eq('entity_type', 'alumno')
            .eq('entity_id', alumnoId)
            .maybeSingle();

        if (fetchError) throw fetchError;

        const datosActualizacion = {
            updated_at: new Date().toISOString(),
            is_edited: esEdicion
        };

        if (existing) {
            // Actualizar registro existente
            const { error: updateError } = await supabase
                .from('history')
                .update(datosActualizacion)
                .eq('id', existing.id);

            if (updateError) throw updateError;
        } else {
            // Crear nuevo registro
            const { error: insertError } = await supabase
                .from('history')
                .insert({
                    user_id: this.maestroId,
                    entity_type: 'alumno',
                    entity_id: alumnoId,
                    ...datosActualizacion
                });

            if (insertError) throw insertError;
        }
        return true;
    } catch (error) {
        console.error('Error al registrar alumno en historial:', error);
        return false;
    }
  }
}