// ============================================================
// js/grupos.js
// COMMIT 2: carga dinámica de grupos (se reutiliza categorias.json)
// COMMIT 3: búsqueda en tiempo real y filtro por categoría
// COMMIT 4: unirse / abandonar / crear grupo (CRUD + localStorage)
// ============================================================

let categoriasGrupos = [];
let miembrosBase = {};
let filtroGrupoActual = "Todos";

document.addEventListener("DOMContentLoaded", async function () {
  await iniciarPaginaInterna("../../json/");

  categoriasGrupos = DaatStorage.obtener("categorias").slice(0, 12);
  generarMiembrosBase();
  renderizarGrupos();

  document.getElementById("buscarGrupo").addEventListener("input", renderizarGrupos);
  document.getElementById("btnCrearGrupo").addEventListener("click", crearGrupoPersonalizado);

  document.querySelectorAll("#filtrosGrupos button").forEach(function (boton) {
    boton.addEventListener("click", function () {
      filtroGrupoActual = boton.textContent.trim();
      document.querySelectorAll("#filtrosGrupos button").forEach(function (b) {
        b.classList.remove("btn-secondary");
        b.classList.add("btn-primary");
      });
      boton.classList.remove("btn-primary");
      boton.classList.add("btn-secondary");
      renderizarGrupos();
    });
  });

  document.getElementById("listaGrupos").addEventListener("click", function (evento) {
    const boton = evento.target.closest(".btn-abandonar, .btn-unirse");
    if (!boton) return;
    alternarMembresia(Number(boton.dataset.id), boton.classList.contains("btn-unirse"));
  });
});

// Genera una cantidad base de miembros determinística por categoría,
// para que el número no cambie en cada recarga.
function generarMiembrosBase() {
  categoriasGrupos.forEach(function (categoria) {
    miembrosBase[categoria.id] = 50 + (categoria.id * 17) % 300;
  });
}

function obtenerGruposUnidos() {
  return JSON.parse(localStorage.getItem("daat_gruposUnidos")) || [];
}

function renderizarGrupos() {
  const contenedor = document.getElementById("listaGrupos");
  const texto = document.getElementById("buscarGrupo").value.trim().toLowerCase();
  const gruposUnidos = obtenerGruposUnidos();

  let resultado = categoriasGrupos.slice();

  if (filtroGrupoActual !== "Todos") {
    resultado = resultado.filter(function (c) { return c.nombre === filtroGrupoActual; });
  }

  if (texto !== "") {
    resultado = resultado.filter(function (c) {
      return c.nombre.toLowerCase().includes(texto) || c.descripcion.toLowerCase().includes(texto);
    });
  }

  contenedor.innerHTML = "";

  if (resultado.length === 0) {
    contenedor.innerHTML = "<p class='sin-resultados'>No se encontraron grupos.</p>";
    return;
  }

  resultado.forEach(function (categoria) {
    const unido = gruposUnidos.includes(categoria.id);

    const articulo = document.createElement("article");
    articulo.className = "card-grupo";
    articulo.innerHTML =
      '<div class="col">' +
      '<div class="card-banner" style="background:' + categoria.color + '"></div>' +
      "<h2>" + categoria.nombre + "</h2>" +
      "<p>" + categoria.descripcion + "</p>" +
      '<div class="card-miembros">' + (miembrosBase[categoria.id] + (unido ? 1 : 0)) + " miembros</div>" +
      "<button class='btn-etiqueta'><i class='fa-solid " + categoria.icono + "'></i> " + categoria.nombre + "</button>" +
      (unido
        ? "<button class='btn-abandonar' data-id='" + categoria.id + "'>Abandonar</button>"
        : "<button class='btn-unirse' data-id='" + categoria.id + "'>Solicitar unirse</button>") +
      "</div>";

    contenedor.appendChild(articulo);
  });
}

function alternarMembresia(id, unirse) {
  let gruposUnidos = obtenerGruposUnidos();

  if (unirse) {
    gruposUnidos.push(id);
    localStorage.setItem("daat_gruposUnidos", JSON.stringify(gruposUnidos));
    renderizarGrupos();
    notificar("Te has unido al grupo.", "exito");
    return;
  }

  Swal.fire({
    title: "¿Abandonar grupo?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, abandonar",
    cancelButtonText: "Cancelar"
  }).then(function (resultado) {
    if (resultado.isConfirmed) {
      gruposUnidos = gruposUnidos.filter(function (g) { return g !== id; });
      localStorage.setItem("daat_gruposUnidos", JSON.stringify(gruposUnidos));
      renderizarGrupos();
      notificar("Has abandonado el grupo.", "exito");
    }
  });
}

function crearGrupoPersonalizado() {
  Swal.fire({
    title: "Crear nuevo grupo",
    html:
      '<input id="swalNombreGrupo" class="swal2-input" placeholder="Nombre del grupo">' +
      '<textarea id="swalDescGrupo" class="swal2-textarea" placeholder="Descripción del grupo"></textarea>',
    confirmButtonText: "Crear",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    preConfirm: function () {
      const nombre = document.getElementById("swalNombreGrupo").value.trim();
      const descripcion = document.getElementById("swalDescGrupo").value.trim();
      if (nombre === "") {
        Swal.showValidationMessage("El grupo necesita un nombre.");
        return false;
      }
      return { nombre: nombre, descripcion: descripcion };
    }
  }).then(function (resultado) {
    if (resultado.isConfirmed) {
      const idNuevo = DaatStorage.nuevoId(categoriasGrupos);
      const nuevaCategoria = {
        id: idNuevo,
        nombre: resultado.value.nombre,
        descripcion: resultado.value.descripcion || "Grupo creado por un miembro de la comunidad.",
        icono: "fa-users",
        color: "#2E86AB"
      };

      categoriasGrupos.push(nuevaCategoria);
      miembrosBase[idNuevo] = 1;
      renderizarGrupos();
      notificar("Grupo creado correctamente.", "exito");
    }
  });
}
