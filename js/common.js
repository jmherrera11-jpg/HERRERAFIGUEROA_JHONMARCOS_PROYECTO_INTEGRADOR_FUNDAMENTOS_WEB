async function iniciarPaginaInterna(rutaJson) {
  await DaatStorage.init(rutaJson);

  let usuario = DaatStorage.usuarioActual();
  if (!usuario) {
    const usuarios = DaatStorage.obtener("usuarios");
    if (usuarios.length > 0) {
      DaatStorage.guardarUsuarioActual(usuarios[0]);
    }
  }

  document.querySelectorAll(".nav-salir").forEach(function (enlace) {
    enlace.addEventListener("click", function () {
      DaatStorage.cerrarSesion();
    });
  });
}

function formatearFecha(fechaTexto) {
  const fecha = new Date(fechaTexto + "T00:00:00");
  return fecha.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

function buscarPorId(arreglo, id) {
  return arreglo.find(function (item) { return item.id === id; });
}