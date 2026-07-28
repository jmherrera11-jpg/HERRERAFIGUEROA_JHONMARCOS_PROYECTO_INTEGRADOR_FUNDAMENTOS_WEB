// ============================================================
// js/perfil.js
// COMMIT 2: carga dinámica de los datos del usuario actual
// COMMIT 4: editar y eliminar publicaciones propias (CRUD)
// COMMIT 5: se muestra la nacionalidad guardada en el registro
// COMMIT 7: gráfico de publicaciones propias por categoría
// ============================================================

let publicacionesPerfil = [];
let categoriasPerfil = [];
let graficoPerfil = null;

document.addEventListener("DOMContentLoaded", async function () {
  await iniciarPaginaInterna("../../json/");

  publicacionesPerfil = DaatStorage.obtener("publicaciones");
  categoriasPerfil = DaatStorage.obtener("categorias");

  pintarInfoUsuario();
  renderizarMisPublicaciones();
  crearGraficoPerfil();

  document.getElementById("listaMisPublicaciones").addEventListener("click", function (evento) {
    const botonEliminar = evento.target.closest(".btn-eliminar-post");
    const botonEditar = evento.target.closest(".btn-editar-post");

    if (botonEliminar) confirmarEliminarPost(Number(botonEliminar.dataset.id));
    if (botonEditar) editarPost(Number(botonEditar.dataset.id));
  });
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
      "<div class='btn-editar-post' data-id='" + post.id + "'><i class='fa-solid fa-pen'></i> Editar</div>" +
      "<div class='btn-eliminar-post' data-id='" + post.id + "'><i class='fa-solid fa-trash'></i> Eliminar</div>" +
      "</div>" +
      "<div class='post-categoria-tag'>" + (categoria ? categoria.nombre : "") + "</div>";

    contenedor.appendChild(articulo);
  });
}

function confirmarEliminarPost(id) {
  Swal.fire({
    title: "¿Eliminar esta publicación?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  }).then(function (resultado) {
    if (resultado.isConfirmed) {
      publicacionesPerfil = publicacionesPerfil.filter(function (p) { return p.id !== id; });
      DaatStorage.guardar("publicaciones", publicacionesPerfil);
      pintarInfoUsuario();
      renderizarMisPublicaciones();
      actualizarGraficoPerfil();
      notificar("Publicación eliminada.", "exito");
    }
  });
}

function editarPost(id) {
  const post = buscarPorId(publicacionesPerfil, id);
  if (!post) return;

  Swal.fire({
    title: "Editar publicación",
    html: '<textarea id="swalEditContenido" class="swal2-textarea">' + post.contenido + "</textarea>",
    confirmButtonText: "Guardar cambios",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    preConfirm: function () {
      const nuevoContenido = document.getElementById("swalEditContenido").value.trim();
      if (nuevoContenido === "") {
        Swal.showValidationMessage("El contenido no puede quedar vacío.");
        return false;
      }
      return nuevoContenido;
    }
  }).then(function (resultado) {
    if (resultado.isConfirmed) {
      post.contenido = resultado.value;
      DaatStorage.guardar("publicaciones", publicacionesPerfil);
      renderizarMisPublicaciones();
      notificar("Publicación actualizada.", "exito");
    }
  });
}

function calcularConteoPerfil() {
  const usuario = DaatStorage.usuarioActual();
  const labels = [];
  const valores = [];
  const colores = [];

  if (!usuario) return { labels: labels, valores: valores, colores: colores };

  const misPosts = publicacionesPerfil.filter(function (p) { return p.usuarioId === usuario.id; });

  categoriasPerfil.forEach(function (categoria) {
    const cantidad = misPosts.filter(function (p) { return p.categoriaId === categoria.id; }).length;
    if (cantidad > 0) {
      labels.push(categoria.nombre);
      valores.push(cantidad);
      colores.push(categoria.color);
    }
  });

  return { labels: labels, valores: valores, colores: colores };
}

function crearGraficoPerfil() {
  const ctx = document.getElementById("graficoPerfil");
  if (!ctx) return;

  const datos = calcularConteoPerfil();

  graficoPerfil = new Chart(ctx, {
    type: "doughnut",
    data: { labels: datos.labels, datasets: [{ data: datos.valores, backgroundColor: datos.colores }] },
    options: { responsive: true }
  });
}

function actualizarGraficoPerfil() {
  if (!graficoPerfil) return;
  const datos = calcularConteoPerfil();
  graficoPerfil.data.labels = datos.labels;
  graficoPerfil.data.datasets[0].data = datos.valores;
  graficoPerfil.data.datasets[0].backgroundColor = datos.colores;
  graficoPerfil.update();
}
