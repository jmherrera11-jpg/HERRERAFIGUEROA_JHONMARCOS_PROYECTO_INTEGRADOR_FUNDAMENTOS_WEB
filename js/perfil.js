let publicacionesPerfil = [];
let categoriasPerfil = [];

document.addEventListener("DOMContentLoaded", async function () {
  await iniciarPaginaInterna("../../json/");

  publicacionesPerfil = DaatStorage.obtener("publicaciones");
  categoriasPerfil = DaatStorage.obtener("categorias");

  pintarInfoUsuario();
  renderizarMisPublicaciones();
});

function pintarInfoUsuario() {
  const usuario = DaatStorage.usuarioActual();
  if (!usuario) return;

  document.getElementById("nombrePerfil").textContent = usuario.nombre + " " + usuario.apellido;
  document.getElementById("usuarioPerfil").textContent = "@" + usuario.email.split("@")[0];
  document.getElementById("bioPerfil").textContent = usuario.biografia;
  document.getElementById("nacionalidadPerfil").innerHTML =
    '<i class="fa-solid fa-globe"></i> ' + usuario.nacionalidad;

  const avatar = document.querySelector(".perfil-info > img");
  if (avatar && usuario.avatar) avatar.src = usuario.avatar;

  const misPosts = publicacionesPerfil.filter(function (p) { return p.usuarioId === usuario.id; });
  document.getElementById("statPublicaciones").textContent = misPosts.length;
}

function renderizarMisPublicaciones() {
  const usuario = DaatStorage.usuarioActual();
  const contenedor = document.getElementById("listaMisPublicaciones");
  contenedor.innerHTML = "";

  if (!usuario) return;

  const misPosts = publicacionesPerfil.filter(function (p) { return p.usuarioId === usuario.id; });

  if (misPosts.length === 0) {
    contenedor.innerHTML = "<p class='sin-resultados'>Aún no has publicado ninguna reflexión.</p>";
    return;
  }

  misPosts.forEach(function (post) {
    const categoria = buscarPorId(categoriasPerfil, post.categoriaId);

    const articulo = document.createElement("article");
    articulo.className = "post";
    articulo.innerHTML =
      "<p>" + post.contenido + "</p>" +
      (post.versiculo ?
        '<div class="post-versiculo"><p>"' + post.versiculo + '"</p>' +
        '<div class="referencia">' + post.referencia + "</div></div>" : "") +
      '<div class="acciones-post">' +
      '<div><i class="fa-solid fa-heart"></i> ' + post.likes + "</div>" +
      '<div><i class="fa-regular fa-comment-dots"></i> ' + post.comentarios + "</div>" +
      "</div>" +
      "<div class='post-categoria-tag'>" + (categoria ? categoria.nombre : "") + "</div>";

    contenedor.appendChild(articulo);
  });
}