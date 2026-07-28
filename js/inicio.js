// ============================================================
// js/inicio.js
// Feed principal de Daat Devotional
// COMMIT 2: carga dinámica desde JSON/localStorage
// COMMIT 3: búsqueda en tiempo real, filtro por categoría y orden
// COMMIT 4: CRUD (publicar, dar like, eliminar publicación propia)
// COMMIT 6: clima (Open-Meteo)
// COMMIT 7: gráfico de publicaciones por categoría (Chart.js)
// ============================================================

let publicacionesFeed = [];
let categoriasFeed = [];
let usuariosFeed = [];
let filtroCategoriaActual = null;
let graficoCategorias = null;

const CIUDADES_CLIMA = {
  "santo-domingo": { nombre: "Santo Domingo de los Tsáchilas", lat: -0.25, lon: -79.15 },
  "quito": { nombre: "Quito", lat: -0.18, lon: -78.47 },
  "guayaquil": { nombre: "Guayaquil", lat: -2.17, lon: -79.90 }
};

document.addEventListener("DOMContentLoaded", async function () {
  await iniciarPaginaInterna("../../json/");

  cargarDatosFeed();
  generarFiltrosCategoria();
  renderizarPublicaciones();
  crearGraficoCategorias();
  configurarEventosFeed();
  cargarClima("santo-domingo");
});

function cargarDatosFeed() {
  publicacionesFeed = DaatStorage.obtener("publicaciones");
  categoriasFeed = DaatStorage.obtener("categorias");
  usuariosFeed = DaatStorage.obtener("usuarios");
}

function configurarEventosFeed() {
  document.getElementById("btnPublicar").addEventListener("click", publicarReflexion);
  document.getElementById("buscarPublicacion").addEventListener("input", renderizarPublicaciones);
  document.getElementById("ordenarPublicaciones").addEventListener("change", renderizarPublicaciones);

  document.getElementById("btnCiudadSD").addEventListener("click", function () { cargarClima("santo-domingo"); });
  document.getElementById("btnCiudadQuito").addEventListener("click", function () { cargarClima("quito"); });
  document.getElementById("btnCiudadGye").addEventListener("click", function () { cargarClima("guayaquil"); });

  // Delegación de eventos: los botones de "me gusta" y "eliminar"
  // se crean dinámicamente, así que se escuchan desde el contenedor padre.
  document.getElementById("listaPublicaciones").addEventListener("click", function (evento) {
    const botonLike = evento.target.closest(".btn-like");
    const botonEliminar = evento.target.closest(".btn-eliminar-post");

    if (botonLike) alternarLike(Number(botonLike.dataset.id));
    if (botonEliminar) confirmarEliminarPublicacion(Number(botonEliminar.dataset.id));
  });
}

// ---------- Filtros por categoría (commit 3) ----------

function generarFiltrosCategoria() {
  const contenedor = document.getElementById("filtrosCategoria");
  contenedor.innerHTML = "";

  const botonTodos = document.createElement("button");
  botonTodos.type = "button";
  botonTodos.textContent = "Todos";
  botonTodos.className = "btn-activo";
  botonTodos.addEventListener("click", function () {
    filtroCategoriaActual = null;
    marcarFiltroActivo(botonTodos);
    renderizarPublicaciones();
  });
  contenedor.appendChild(botonTodos);

  categoriasFeed.forEach(function (categoria) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = categoria.nombre;
    boton.className = "btn-inactivo";
    boton.dataset.id = categoria.id;
    boton.addEventListener("click", function () {
      filtroCategoriaActual = categoria.id;
      marcarFiltroActivo(boton);
      renderizarPublicaciones();
    });
    contenedor.appendChild(boton);
  });
}

function marcarFiltroActivo(botonSeleccionado) {
  document.querySelectorAll("#filtrosCategoria button").forEach(function (boton) {
    boton.className = "btn-inactivo";
  });
  botonSeleccionado.className = "btn-activo";
}

// ---------- Render principal (búsqueda + filtro + orden = commit 3) ----------

function renderizarPublicaciones() {
  const contenedor = document.getElementById("listaPublicaciones");
  const texto = document.getElementById("buscarPublicacion").value.trim().toLowerCase();
  const orden = document.getElementById("ordenarPublicaciones").value;

  let resultado = publicacionesFeed.filter(function (p) { return p.estado === "publicado"; });

  if (filtroCategoriaActual !== null) {
    resultado = resultado.filter(function (p) { return p.categoriaId === filtroCategoriaActual; });
  }

  if (texto !== "") {
    resultado = resultado.filter(function (p) {
      const autor = buscarPorId(usuariosFeed, p.usuarioId);
      const nombreAutor = autor ? (autor.nombre + " " + autor.apellido).toLowerCase() : "";
      return p.titulo.toLowerCase().includes(texto) ||
        p.contenido.toLowerCase().includes(texto) ||
        nombreAutor.includes(texto);
    });
  }

  if (orden === "recientes") {
    resultado = resultado.slice().sort(function (a, b) { return new Date(b.fecha) - new Date(a.fecha); });
  } else if (orden === "antiguas") {
    resultado = resultado.slice().sort(function (a, b) { return new Date(a.fecha) - new Date(b.fecha); });
  } else if (orden === "populares") {
    resultado = resultado.slice().sort(function (a, b) { return b.likes - a.likes; });
  }

  contenedor.innerHTML = "";

  if (resultado.length === 0) {
    contenedor.innerHTML = "<p class='sin-resultados'>No se encontraron publicaciones con esos criterios.</p>";
    return;
  }

  resultado.forEach(function (publicacion) {
    contenedor.appendChild(crearTarjetaPublicacion(publicacion));
  });
}

function crearTarjetaPublicacion(publicacion) {
  const autor = buscarPorId(usuariosFeed, publicacion.usuarioId);
  const categoria = buscarPorId(categoriasFeed, publicacion.categoriaId);
  const usuarioActual = DaatStorage.usuarioActual();
  const esPropia = usuarioActual && usuarioActual.id === publicacion.usuarioId;

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
    '<div class="btn-like" data-id="' + publicacion.id + '"><i class="fa-solid fa-heart"></i> ' + publicacion.likes + "</div>" +
    '<div><i class="fa-regular fa-comment-dots"></i> ' + publicacion.comentarios + "</div>" +
    '<div><i class="fa-solid fa-location-arrow"></i> Compartir</div>' +
    (esPropia ? '<div class="btn-eliminar-post" data-id="' + publicacion.id + '"><i class="fa-solid fa-trash"></i> Eliminar</div>' : "") +
    "</div>";

  return articulo;
}

// ---------- CRUD (commit 4) ----------

function publicarReflexion() {
  const textarea = document.getElementById("campoReflexion");
  const inputVersiculo = document.getElementById("campoVersiculo");
  const inputReferencia = document.getElementById("campoReferencia");

  const contenido = textarea.value.trim();

  if (contenido === "") {
    notificar("Escribe una reflexión antes de publicar.", "error");
    return;
  }

  const usuarioActual = DaatStorage.usuarioActual();

  const nuevaPublicacion = {
    id: DaatStorage.nuevoId(publicacionesFeed),
    usuarioId: usuarioActual ? usuarioActual.id : 1,
    categoriaId: categoriasFeed.length > 0 ? categoriasFeed[0].id : 1,
    titulo: contenido.substring(0, 40) + (contenido.length > 40 ? "..." : ""),
    contenido: contenido,
    versiculo: inputVersiculo.value.trim(),
    referencia: inputReferencia.value.trim(),
    imagen: "",
    fecha: new Date().toISOString().substring(0, 10),
    likes: 0,
    comentarios: 0,
    estado: "publicado"
  };

  publicacionesFeed.unshift(nuevaPublicacion);
  DaatStorage.guardar("publicaciones", publicacionesFeed);

  textarea.value = "";
  inputVersiculo.value = "";
  inputReferencia.value = "";

  renderizarPublicaciones();
  actualizarGraficoCategorias();
  notificar("Tu reflexión ha sido publicada.", "exito");
}

function alternarLike(id) {
  const publicacion = buscarPorId(publicacionesFeed, id);
  if (!publicacion) return;

  const likesDados = JSON.parse(localStorage.getItem("daat_likesDados")) || [];
  const indice = likesDados.indexOf(id);

  if (indice === -1) {
    publicacion.likes += 1;
    likesDados.push(id);
  } else {
    publicacion.likes -= 1;
    likesDados.splice(indice, 1);
  }

  localStorage.setItem("daat_likesDados", JSON.stringify(likesDados));
  DaatStorage.guardar("publicaciones", publicacionesFeed);
  renderizarPublicaciones();
}

function confirmarEliminarPublicacion(id) {
  Swal.fire({
    title: "¿Eliminar publicación?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  }).then(function (resultado) {
    if (resultado.isConfirmed) {
      publicacionesFeed = publicacionesFeed.filter(function (p) { return p.id !== id; });
      DaatStorage.guardar("publicaciones", publicacionesFeed);
      renderizarPublicaciones();
      actualizarGraficoCategorias();
      notificar("Publicación eliminada.", "exito");
    }
  });
}

// ---------- Gráfico (commit 7) ----------

function calcularConteoPorCategoria() {
  const labels = [];
  const valores = [];
  const colores = [];

  categoriasFeed.forEach(function (categoria) {
    const cantidad = publicacionesFeed.filter(function (p) { return p.categoriaId === categoria.id; }).length;
    if (cantidad > 0) {
      labels.push(categoria.nombre);
      valores.push(cantidad);
      colores.push(categoria.color);
    }
  });

  return { labels: labels, valores: valores, colores: colores };
}

function crearGraficoCategorias() {
  const ctx = document.getElementById("graficoCategorias");
  if (!ctx) return;

  const datos = calcularConteoPorCategoria();

  graficoCategorias = new Chart(ctx, {
    type: "bar",
    data: {
      labels: datos.labels,
      datasets: [{
        label: "Publicaciones por categoría",
        data: datos.valores,
        backgroundColor: datos.colores
      }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });
}

function actualizarGraficoCategorias() {
  if (!graficoCategorias) return;
  const datos = calcularConteoPorCategoria();
  graficoCategorias.data.labels = datos.labels;
  graficoCategorias.data.datasets[0].data = datos.valores;
  graficoCategorias.data.datasets[0].backgroundColor = datos.colores;
  graficoCategorias.update();
}

// ---------- Clima (commit 6) ----------

async function cargarClima(claveCiudad) {
  const panel = document.getElementById("panelClima");
  const ciudad = CIUDADES_CLIMA[claveCiudad];

  panel.innerHTML = "<p class='text-muted'>Consultando clima...</p>";

  try {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=" + ciudad.lat +
      "&longitude=" + ciudad.lon +
      "&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto";

    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error("Respuesta no válida del servicio de clima");

    const datos = await respuesta.json();
    const actual = datos.current;

    panel.innerHTML =
      "<h3>" + ciudad.nombre + "</h3>" +
      "<p>🌡️ " + actual.temperature_2m + " °C</p>" +
      "<p>💧 Humedad: " + actual.relative_humidity_2m + "%</p>" +
      "<p>💨 Viento: " + actual.wind_speed_10m + " km/h</p>" +
      '<p class="clima-versiculo">"Los cielos cuentan la gloria de Dios" — Salmos 19:1</p>';
  } catch (error) {
    panel.innerHTML = "<p class='text-danger'>No se pudo obtener el clima en este momento.</p>";
    console.error(error);
  }
}
