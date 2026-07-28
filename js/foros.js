// ============================================================
// js/foros.js
// COMMIT 2: carga dinámica de temas (se reutiliza publicaciones.json)
// COMMIT 3: búsqueda en tiempo real y filtro por categoría
// COMMIT 4: creación de nuevos temas (CRUD)
// ============================================================

let temasForo = [];
let categoriasForo = [];
let usuariosForo = [];
let filtroForoActual = "Todos";

document.addEventListener("DOMContentLoaded", async function () {
  await iniciarPaginaInterna("../../json/");

  temasForo = DaatStorage.obtener("publicaciones");
  categoriasForo = DaatStorage.obtener("categorias");
  usuariosForo = DaatStorage.obtener("usuarios");

  renderizarTemas();

  document.getElementById("buscarTema").addEventListener("input", renderizarTemas);
  document.getElementById("btnNuevoTema").addEventListener("click", crearNuevoTema);

  document.querySelectorAll("#filtrosForo button").forEach(function (boton) {
    boton.addEventListener("click", function () {
      filtroForoActual = boton.textContent.trim();
      document.querySelectorAll("#filtrosForo button").forEach(function (b) { b.className = "btn-inactivo"; });
      boton.className = "btn-activo";
      renderizarTemas();
    });
  });
});

function renderizarTemas() {
  const contenedor = document.getElementById("listaTemas");
  const texto = document.getElementById("buscarTema").value.trim().toLowerCase();

  let resultado = temasForo.slice();

  if (filtroForoActual !== "Todos") {
    const categoria = categoriasForo.find(function (c) { return c.nombre === filtroForoActual; });
    if (categoria) {
      resultado = resultado.filter(function (t) { return t.categoriaId === categoria.id; });
    }
  }

  if (texto !== "") {
    resultado = resultado.filter(function (t) {
      return t.titulo.toLowerCase().includes(texto) || t.contenido.toLowerCase().includes(texto);
    });
  }

  contenedor.innerHTML = "";

  if (resultado.length === 0) {
    contenedor.innerHTML = "<p class='sin-resultados'>No hay temas que coincidan con tu búsqueda.</p>";
    return;
  }

  resultado.forEach(function (tema) {
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
    (tema.likes > 25 ? "<button class='btn-etiqueta'>Destacado</button>" : "") +
    "<button class='btn-etiqueta'>" + (categoria ? categoria.nombre : "General") + "</button>" +
    "</div>" +
    "<h2 class='card-title'>" + tema.titulo + "</h2>" +
    "<p class='card-text'>" + tema.contenido + "</p>" +
    "<div class='tema-meta'>" + (autor ? autor.nombre + " " + autor.apellido : "Usuario") +
    " | " + tema.comentarios + " respuestas | " + tema.likes + " vistas | " + formatearFecha(tema.fecha) + "</div>" +
    "</div>";

  return articulo;
}

function crearNuevoTema() {
  Swal.fire({
    title: "Nuevo tema de discusión",
    html:
      '<input id="swalTitulo" class="swal2-input" placeholder="Título del tema">' +
      '<textarea id="swalContenido" class="swal2-textarea" placeholder="Describe el tema..."></textarea>',
    confirmButtonText: "Publicar tema",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    preConfirm: function () {
      const titulo = document.getElementById("swalTitulo").value.trim();
      const contenido = document.getElementById("swalContenido").value.trim();
      if (titulo === "" || contenido === "") {
        Swal.showValidationMessage("Debes completar el título y la descripción.");
        return false;
      }
      return { titulo: titulo, contenido: contenido };
    }
  }).then(function (resultado) {
    if (resultado.isConfirmed) {
      const usuarioActual = DaatStorage.usuarioActual();

      const nuevoTema = {
        id: DaatStorage.nuevoId(temasForo),
        usuarioId: usuarioActual ? usuarioActual.id : 1,
        categoriaId: categoriasForo.length > 0 ? categoriasForo[0].id : 1,
        titulo: resultado.value.titulo,
        contenido: resultado.value.contenido,
        versiculo: "",
        referencia: "",
        imagen: "",
        fecha: new Date().toISOString().substring(0, 10),
        likes: 0,
        comentarios: 0,
        estado: "publicado"
      };

      temasForo.unshift(nuevoTema);
      DaatStorage.guardar("publicaciones", temasForo);
      renderizarTemas();
      notificar("Tema publicado correctamente.", "exito");
    }
  });
}
