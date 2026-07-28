let temasForo = [];
let categoriasForo = [];
let usuariosForo = [];

document.addEventListener("DOMContentLoaded", async function () {
  await iniciarPaginaInterna("../../json/");

  temasForo = DaatStorage.obtener("publicaciones");
  categoriasForo = DaatStorage.obtener("categorias");
  usuariosForo = DaatStorage.obtener("usuarios");

  renderizarTemas();
});

function renderizarTemas() {
  const contenedor = document.getElementById("listaTemas");
  contenedor.innerHTML = "";

  if (temasForo.length === 0) {
    contenedor.innerHTML = "<p class='sin-resultados'>No hay temas disponibles.</p>";
    return;
  }

  temasForo.forEach(function (tema) {
    contenedor.appendChild(crearTarjetaTema(tema));
  });
}

function crearTarjetaTema(tema) {
  const autor = buscarPorId(usuariosForo, tema.usuarioId);
  const categoria = buscarPorId(categoriasForo, tema.categoriaId);

  const articulo = document.createElement("article");
  articulo.className = "card w-80 mb-3";

  articulo.innerHTML =
    '<img src="' + (autor ? autor.avatar : "../../imagenes/Perfil.png") + '" alt="Perfil">' +
    '<div class="card-body">' +
    '<div class="etiquetas">' +
    "<button class='btn-etiqueta'>" + (categoria ? categoria.nombre : "General") + "</button>" +
    "</div>" +
    "<h2 class='card-title'>" + tema.titulo + "</h2>" +
    "<p class='card-text'>" + tema.contenido + "</p>" +
    "<div class='tema-meta'>" + (autor ? autor.nombre + " " + autor.apellido : "Usuario") +
    " | " + tema.comentarios + " respuestas | " + tema.likes + " vistas | " + formatearFecha(tema.fecha) + "</div>" +
    "</div>";

  return articulo;
}