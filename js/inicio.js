let publicacionesFeed = [];
let categoriasFeed = [];
let usuariosFeed = [];

document.addEventListener("DOMContentLoaded", async function () {
  await iniciarPaginaInterna("../../json/");
  cargarDatosFeed();
  renderizarPublicaciones();
});

function cargarDatosFeed() {
  publicacionesFeed = DaatStorage.obtener("publicaciones");
  categoriasFeed = DaatStorage.obtener("categorias");
  usuariosFeed = DaatStorage.obtener("usuarios");
}

function renderizarPublicaciones() {
  const contenedor = document.getElementById("listaPublicaciones");
  contenedor.innerHTML = "";

  const publicadas = publicacionesFeed.filter(function (p) { return p.estado === "publicado"; });

  if (publicadas.length === 0) {
    contenedor.innerHTML = "<p class='sin-resultados'>No hay publicaciones disponibles.</p>";
    return;
  }

  publicadas.forEach(function (publicacion) {
    contenedor.appendChild(crearTarjetaPublicacion(publicacion));
  });
}

function crearTarjetaPublicacion(publicacion) {
  const autor = buscarPorId(usuariosFeed, publicacion.usuarioId);
  const categoria = buscarPorId(categoriasFeed, publicacion.categoriaId);

  const articulo = document.createElement("article");
  articulo.className = "publicacion";

  articulo.innerHTML =
    '<div class="publicacion-header">' +
    '<img src="' + (autor ? autor.avatar : "../../imagenes/Perfil.png") + '" alt="Perfil">' +
    '<div class="publicacion-autor">' +
    "<strong>" + (autor ? autor.nombre + " " + autor.apellido : "Usuario") + "</strong>" +
    '<div class="publicacion-fecha">' + (categoria ? categoria.nombre : "") + " · " + formatearFecha(publicacion.fecha) + "</div>" +
    "</div></div>" +
    "<h3 class='titulo-publicacion'>" + publicacion.titulo + "</h3>" +
    "<p>" + publicacion.contenido + "</p>" +
    (publicacion.versiculo ?
      '<div class="versiculo"><i>"' + publicacion.versiculo + '"</i>' +
      '<div class="referencia"><b>' + publicacion.referencia + "</b></div></div>" : "") +
    '<div class="acciones">' +
    '<div><i class="fa-solid fa-heart"></i> ' + publicacion.likes + "</div>" +
    '<div><i class="fa-regular fa-comment-dots"></i> ' + publicacion.comentarios + "</div>" +
    '<div><i class="fa-solid fa-location-arrow"></i> Compartir</div>' +
    "</div>";

  return articulo;
}