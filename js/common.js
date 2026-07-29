// ============================================================
// js/common.js
// Funciones compartidas entre las páginas internas (inicio, foros,
// grupos, chat, perfil). Requiere que storage.js se cargue antes.
// ============================================================

// Inicializa los datos y prepara la sesión de la página.
// rutaJson = ruta relativa hacia la carpeta /json/ desde la página actual.
async function iniciarPaginaInterna(rutaJson) {
  await DaatStorage.init(rutaJson);

  // Si no hay una sesión activa (por ejemplo, se abrió la página
  // directamente sin pasar por login), se usa el primer usuario
  // registrado como usuario de demostración para poder mostrar
  // el feed y el perfil sin bloquear la revisión del proyecto.
  let usuario = DaatStorage.usuarioActual();
  if (!usuario) {
    const usuarios = DaatStorage.obtener("usuarios");
    if (usuarios.length > 0) {
      DaatStorage.guardarUsuarioActual(usuarios[0]);
      usuario = usuarios[0];
    }
  }

  // ACTUALIZAR EL NOMBRE DEL USUARIO EN LA NAVEGACIÓN
  actualizarNombreUsuario(usuario);

  // Conecta el botón de "cerrar sesión" del nav en todas las páginas.
  document.querySelectorAll(".nav-salir").forEach(function (enlace) {
    enlace.addEventListener("click", function (e) {
      e.preventDefault();
      DaatStorage.cerrarSesion();
      window.location.href = "../../index.html";
    });
  });
}

// ============================================================
// FUNCIÓN PARA ACTUALIZAR EL NOMBRE DEL USUARIO EN EL NAV
// ============================================================
function actualizarNombreUsuario(usuario) {
  const navUsuario = document.getElementById("navUsuario");
  if (!navUsuario) return;

  if (usuario) {
    // Generar nombre de usuario: nombre + inicial del apellido
    const nombreUsuario = usuario.nombre.toLowerCase() + usuario.apellido.charAt(0).toLowerCase();
    navUsuario.textContent = nombreUsuario;
  } else {
    navUsuario.textContent = "invitado";
  }
}

// Convierte "2026-07-20" en "20 de julio de 2026"
function formatearFecha(fechaTexto) {
  const fecha = new Date(fechaTexto + "T00:00:00");
  return fecha.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

// Busca un elemento por id dentro de un arreglo (equivalente a un JOIN simple)
function buscarPorId(arreglo, id) {
  return arreglo.find(function (item) { return item.id === id; });
}

// Notificación breve estándar del proyecto (usa Toastify)
function notificar(mensaje, tipo) {
  const colores = {
    exito: "#198754",
    error: "#dc3545",
    info: "#0d6efd"
  };

  Toastify({
    text: mensaje,
    duration: 2800,
    gravity: "top",
    position: "right",
    style: { background: colores[tipo] || colores.info }
  }).showToast();
}